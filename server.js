import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json()); // Allow JSON payload parsing

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Serve logs directory as static files
app.use('/logs', express.static(logsDir));

const PORT = process.env.PORT || 3001;

// API to list CSV files
app.get('/api/logs', (req, res) => {
  fs.readdir(logsDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to read logs directory' });
    const csvFiles = files.filter(f => f.endsWith('.csv')).sort().reverse();
    res.json(csvFiles);
  });
});

// NEW: API to receive compressed telemetry from Python / STM32
app.post('/api/telemetry', (req, res) => {
  const shortData = req.body;
  if (!shortData) return res.status(400).json({ error: 'No payload provided' });

  // Expand shortData to fullData for the UI
  const fullData = {};
  if (shortData.s !== undefined) fullData.speed = shortData.s;
  if (shortData.c !== undefined) fullData.soc = shortData.c;
  if (shortData.a !== undefined) fullData.currentDraw = shortData.a;
  if (shortData.ic !== undefined) fullData.instantConsumption = shortData.ic;
  if (shortData.v !== undefined) fullData.batteryVoltage = shortData.v;
  if (shortData.mxv !== undefined) fullData.maxCellVoltage = shortData.mxv;
  if (shortData.mnv !== undefined) fullData.minCellVoltage = shortData.mnv;
  if (shortData.at !== undefined) fullData.averageTemp = shortData.at;
  if (shortData.mt !== undefined) fullData.motorTemp = shortData.mt;
  if (shortData.it !== undefined) fullData.inverterTemp = shortData.it;
  if (shortData.fc !== undefined) fullData.faultyCell = shortData.fc === 0 ? null : shortData.fc;
  
  if (shortData.m !== undefined && Array.isArray(shortData.m)) {
    fullData.modules = shortData.m.map((mod, idx) => ({
      id: idx + 1,
      maxT: mod[0],
      minT: mod[1]
    }));
  }

  // Object expansion for Shutdown Circuit ('t' or 'f')
  if (shortData.sc !== undefined && typeof shortData.sc === 'object') {
    const sc = shortData.sc;
    const isTrue = (val) => val === 't' || val === true || val === 1 || val === '1';
    
    fullData.shutdownCircuit = {
      ts: isTrue(sc.ts),
      hvd: isTrue(sc.hvd),
      testpoint: isTrue(sc.testpoint),
      battTerm: isTrue(sc.battTerm),
      bspd: isTrue(sc.bspd),
      estopL: isTrue(sc.estopL),
      estopR: isTrue(sc.estopR),
      crash: isTrue(sc.crash),
      estopC: isTrue(sc.estopC)
    };
  }

  // Update the global telemetry state
  simulatedTelemetry = { ...simulatedTelemetry, ...fullData };

  // Broadcast to all connected WebSockets
  const fullState = { ...simulatedTelemetry, isLogging };
  const payload = JSON.stringify({ type: 'TELEMETRY_UPDATE', data: fullState });
  
  wss.clients.forEach(client => {
    if (client.readyState === 1) { 
      client.send(payload);
    }
  });

  res.status(200).end();
});

// Serve Vue static files from 'dist' folder (Production Build)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Catch-all route to serve Vue's index.html for SPA routing
app.get(/(.*)/, (req, res) => {
  if (fs.existsSync(path.join(distPath, 'index.html'))) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    res.status(404).send('Please run "npm run build" first to generate the frontend files.');
  }
});

const server = app.listen(PORT, () => {
  console.log(`Backend Express server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

let simulatedTelemetry = {
  speed: 0,
  soc: 100, // 100%
  currentDraw: 0,
  instantConsumption: 0,
  batteryVoltage: 400.0,
  maxCellVoltage: 4.20,
  minCellVoltage: 4.19,
  averageTemp: 25.0,
  motorTemp: 30.0,
  inverterTemp: 35.0, // Renamed from controllerTemp for consistency
  modules: Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    maxT: 25.5,
    minT: 24.5
  })),
  faultyCell: null,
  shutdownCircuit: {
    ts: true, hvd: true, testpoint: true, battTerm: true, bspd: true, estopL: true, estopR: true, crash: true, estopC: true
  }
};

let isLogging = false;
let logFileStream = null;

// Türkiye saati (UTC+3) ile zaman damgası
const getTurkeyTimeStr = () => {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  }).formatToParts(new Date());
  const g = (type) => parts.find(p => p.type === type)?.value || '';
  return `${g('year')}-${g('month')}-${g('day')} ${g('hour')}:${g('minute')}:${g('second')}`;
};

// Dosya adı için Türkiye saati
const getTurkeyFileTimeStr = () => {
  return getTurkeyTimeStr().replace(/ /g, '_').replace(/:/g, '-');
};

// Ondalık noktayı virgüle çevir (Türkçe Excel formatı)
const toTR = (val, decimals) => val.toFixed(decimals).replace('.', ',');

const startLogging = () => {
  if (isLogging) return;
  const dateStr = getTurkeyFileTimeStr();
  const filename = `telemetry_${dateStr}.csv`;
  const filepath = path.join(logsDir, filename);
  
  logFileStream = fs.createWriteStream(filepath, { flags: 'a' });
  logFileStream.write('Timestamp;Speed(km/h);SoC(%);CurrentDraw(A);BatteryVoltage(V);MaxCellV(V);MinCellV(V);AvgTemp(C);MotorTemp(C);InverterTemp(C);FaultyCell;ShutdownActive\n');
  isLogging = true;
};

const stopLogging = () => {
  if (!isLogging) return;
  if (logFileStream) {
    logFileStream.end();
    logFileStream = null;
  }
  isLogging = false;
};

// 1-second Logging Loop
setInterval(() => {
  if (isLogging && logFileStream) {
    const ts = getTurkeyTimeStr();
    const isShutdown = Object.values(simulatedTelemetry.shutdownCircuit).some(v => v === false);
    const line = `${ts};${toTR(simulatedTelemetry.speed, 1)};${toTR(simulatedTelemetry.soc, 1)};${toTR(simulatedTelemetry.currentDraw, 1)};${toTR(simulatedTelemetry.batteryVoltage, 1)};${toTR(simulatedTelemetry.maxCellVoltage, 2)};${toTR(simulatedTelemetry.minCellVoltage, 2)};${toTR(simulatedTelemetry.averageTemp, 1)};${toTR(simulatedTelemetry.motorTemp, 1)};${toTR(simulatedTelemetry.inverterTemp, 1)};${simulatedTelemetry.faultyCell || 'None'};${isShutdown}\n`;
    logFileStream.write(line);
  }
}, 1000);

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket telemetry');
  ws.send(JSON.stringify({ type: 'TELEMETRY_UPDATE', data: { ...simulatedTelemetry, isLogging } }));

  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message);
      if (msg.type === 'SIMULATION_COMMAND') {
        const cmd = msg.data;
        if (cmd.action === 'START_LOGGING') {
          startLogging();
        } else if (cmd.action === 'STOP_LOGGING') {
          stopLogging();
        }
      }
    } catch (e) {
      console.error('Error parsing WS message', e);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
