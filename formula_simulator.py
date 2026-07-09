import requests
import time
import random

API_URL = "https://formula-arayuz.onrender.com/api/telemetry"

# Başlangıç değerleri
speed = 0.0
soc = 100.0
battery_voltage = 420.0
motor_temp = 25.0
inverter_temp = 25.0
avg_temp = 25.0

print("Gerçekçi Python Simülatörü Başlatıldı. Çıkmak için CTRL+C yapın.")

while True:
    # 1. Hız ve İvmelenme Simülasyonu
    if random.random() > 0.8:
        speed += random.uniform(-10, 15)
    speed = max(0.0, min(140.0, speed)) # 0-140 km/h arası sınırla
    
    # 2. Akım ve Güç Çekimi
    current_draw = speed * 1.5 + random.uniform(-5, 10)
    instant_consumption = (current_draw * battery_voltage) / 1000 if speed > 0 else 0
    
    # 3. Batarya Tüketimi (SoC ve Voltaj)
    if speed > 5:
        soc -= (speed / 1500)
    soc = max(0.0, soc)
    
    max_cell_v = 3.0 + (soc / 100) * 1.2
    min_cell_v = max_cell_v - random.uniform(0.01, 0.05)
    battery_voltage = ((max_cell_v + min_cell_v) / 2) * 108

    # 4. Isınma Modeli
    if current_draw > 40:
        motor_temp += 0.2
        inverter_temp += 0.1
        avg_temp += 0.05
    else:
        motor_temp -= 0.1
        inverter_temp -= 0.05
        avg_temp -= 0.02

    motor_temp = max(25.0, min(90.0, motor_temp))
    inverter_temp = max(25.0, min(75.0, inverter_temp))
    avg_temp = max(25.0, min(60.0, avg_temp))

    # 5. Modül Sıcaklıkları (6 Modül)
    modules = []
    for i in range(1, 7):
        heat_factor = 1.05 if (i == 3 or i == 4) else 0.98 # Ortadaki modüller daha çok ısınır
        base_t = avg_temp * heat_factor + random.uniform(-0.5, 0.5)
        modules.append({
            "id": i,
            "maxT": round(base_t + random.uniform(0, 1.0), 1),
            "minT": round(base_t - random.uniform(0, 1.0), 1)
        })

    # Arada bir rastgele hücre hatası oluştur (Olasılık %2)
    faulty_cell = random.randint(1, 108) if random.random() < 0.02 else None

    # Kısa (Sıkıştırılmış) JSON Payload - STM32'de bu şekilde basılacak
    payload = {
        "s": round(speed, 1),           # speed
        "c": round(soc, 1),             # soc
        "a": round(current_draw, 1),    # currentDraw
        "ic": round(instant_consumption, 1), # instantConsumption
        "v": round(battery_voltage, 1), # batteryVoltage
        "mxv": round(max_cell_v, 2),    # maxCellVoltage
        "mnv": round(min_cell_v, 2),    # minCellVoltage
        "at": round(avg_temp, 1),       # averageTemp
        "mt": round(motor_temp, 1),     # motorTemp
        "it": round(inverter_temp, 1),  # inverterTemp
        "fc": faulty_cell,              # faultyCell
        
        # modüller sadece sıcaklık dizileri halinde [maxT, minT]
        "m": [
            [m["maxT"], m["minT"]] for m in modules
        ],
        
        # Shutdown Circuit ('t' veya 'f' olarak string gönderebilirsiniz)
        "sc": {
            "ts": "t", 
            "hvd": "t", 
            "testpoint": "t", 
            "battTerm": "t", 
            "bspd": "t", 
            "estopL": "t", 
            "estopR": "t", 
            "crash": "t", 
            "estopC": "t"
        } 
    }

    try:
        response = requests.post(API_URL, json=payload, timeout=2)
        print(f"Hız: {payload['speed']}km/h | SoC: %{payload['soc']} | Voltaj: {payload['batteryVoltage']}V | Motor: {payload['motorTemp']}C | Hatalı Hücre: {faulty_cell if faulty_cell else 'Yok'}")
    except requests.exceptions.RequestException as e:
        print(f"Bağlantı Hatası: Lütfen Node.js sunucusunun açık olduğundan emin olun.")
    
    time.sleep(0.5)  # Saniyede 2 kez veri gönder (500ms)
