import requests
import time
import random
import json

# Render'a yüklediğinizde bu URL'yi değiştirebilirsiniz (örn: https://uygulamaniz.onrender.com/api/telemetry)
API_URL = "http://localhost:3001/api/telemetry"

def generate_telemetry():
    # Sahte hız üretelim
    speed = random.uniform(40, 80)
    
    # Tüm verileri oluşturuyoruz
    data = {
        "speed": round(speed, 1),
        "soc": 85.0,
        "currentDraw": round(speed * 1.5, 1),
        "instantConsumption": round(speed * 0.8, 1),
        "batteryVoltage": 405.0,
        "maxCellVoltage": 4.18,
        "minCellVoltage": 4.15,
        "averageTemp": 35.0,
        "motorTemp": 50.0,
        "inverterTemp": 45.0,
        
        # Eğer hatalı bir hücre yoksa null yapın, varsa hücre numarasını (örn: 14) girin.
        "faultyCell": random.choice([None, None, None, 14, 45, 102]), 
        
        "modules": [
            {"id": 1, "maxT": 36.0, "minT": 34.0},
            {"id": 2, "maxT": 36.5, "minT": 34.5},
            {"id": 3, "maxT": 35.0, "minT": 33.0},
            {"id": 4, "maxT": 37.0, "minT": 35.0},
            {"id": 5, "maxT": 35.5, "minT": 33.5},
            {"id": 6, "maxT": 34.5, "minT": 32.5}
        ],
        "shutdownCircuit": {
            "ts": True, 
            "hvd": True, 
            "testpoint": True, 
            "battTerm": True, 
            "bspd": True, 
            "estopL": True, 
            "estopR": True, 
            "crash": True, 
            "estopC": True
        }
    }
    return data

print("Python Telemetri Gönderici Başlatıldı. Çıkmak için CTRL+C yapın.")

while True:
    payload = generate_telemetry()
    try:
        response = requests.post(API_URL, json=payload, timeout=2)
        print(f"Gönderildi: Hız={payload['speed']}km/h | Hatalı Hücre={payload['faultyCell']} | Durum={response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Bağlantı Hatası: {e}")
    
    # Saniyede 1 kez yolla (Eğer çok anlık veri isteniyorsa 0.1 yapılabilir)
    time.sleep(1)
