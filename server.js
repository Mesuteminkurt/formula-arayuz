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

let autoSimulate = true;
let isLogging = false;
let logFileStream = null;

const getLocalTimeStr = () => {
  const d = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const getLocalFileTimeStr = () => {
  const d = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
};

const startLogging = () => {
  if (isLogging) return;
  const dateStr = getLocalFileTimeStr();
  const filename = `telemetry_${dateStr}.csv`;
  const filepath = path.join(logsDir, filename);
  
  logFileStream = fs.createWriteStream(filepath, { flags: 'a' });
  // Write CSV Header
  logFileStream.write('Timestamp,Speed(km/h),SoC(%),CurrentDraw(A),BatteryVoltage(V),MaxCellV(V),MinCellV(V),AvgTemp(C),MotorTemp(C),InverterTemp(C),FaultyCell,ShutdownActive\n');
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

// 100ms Simulation Loop
setInterval(() => {
  if (autoSimulate) {
    if (simulatedTelemetry.speed > 0 || Math.random() > 0.8) {
      simulatedTelemetry.speed += (Math.random() - 0.4) * 5;
      if (simulatedTelemetry.speed < 0) simulatedTelemetry.speed = 0;
      if (simulatedTelemetry.speed > 150) simulatedTelemetry.speed = 150;
    }
    
    if (simulatedTelemetry.speed > 10) {
      simulatedTelemetry.soc -= (simulatedTelemetry.speed / 1000);
      if (simulatedTelemetry.soc < 0) simulatedTelemetry.soc = 0;
    }

    simulatedTelemetry.currentDraw = simulatedTelemetry.speed * 1.5 + (Math.random() * 10 - 5);
    simulatedTelemetry.instantConsumption = simulatedTelemetry.speed > 0 ? (simulatedTelemetry.currentDraw * simulatedTelemetry.batteryVoltage) / 1000 : 0; 

    if (simulatedTelemetry.currentDraw > 50) {
      simulatedTelemetry.motorTemp += 0.1;
      simulatedTelemetry.inverterTemp += 0.05;
      simulatedTelemetry.averageTemp += 0.02;
    } else {
      simulatedTelemetry.motorTemp -= 0.05;
      simulatedTelemetry.inverterTemp -= 0.02;
      simulatedTelemetry.averageTemp -= 0.01;
    }
    if (simulatedTelemetry.motorTemp < 25) simulatedTelemetry.motorTemp = 25;
    if (simulatedTelemetry.inverterTemp < 25) simulatedTelemetry.inverterTemp = 25;
    if (simulatedTelemetry.averageTemp < 25) simulatedTelemetry.averageTemp = 25;

    simulatedTelemetry.maxCellVoltage = 3.0 + (simulatedTelemetry.soc / 100) * 1.2;
    simulatedTelemetry.minCellVoltage = simulatedTelemetry.maxCellVoltage - Math.random() * 0.05;

    simulatedTelemetry.modules.forEach((mod, index) => {
      const heatFactor = (index === 2 || index === 3) ? 1.05 : 0.98;
      const baseTemp = simulatedTelemetry.averageTemp * heatFactor + (Math.random() * 0.5);
      mod.maxT = baseTemp + (Math.random() * 0.8);
      mod.minT = baseTemp - (Math.random() * 0.8);
    });
    
    simulatedTelemetry.batteryVoltage = ((simulatedTelemetry.maxCellVoltage + simulatedTelemetry.minCellVoltage) / 2) * 108; 
  }

  // Include logging state in telemetry to sync UI
  const fullState = { ...simulatedTelemetry, isLogging };
  const payload = JSON.stringify({ type: 'TELEMETRY_UPDATE', data: fullState });
  
  wss.clients.forEach(client => {
    if (client.readyState === 1) { 
      client.send(payload);
    }
  });
}, 100);

// 1-second Logging Loop
setInterval(() => {
  if (isLogging && logFileStream) {
    const ts = getLocalTimeStr();
    const isShutdown = Object.values(simulatedTelemetry.shutdownCircuit).some(v => v === false); // If any circuit is false, it's a shutdown state
    const line = `${ts},${simulatedTelemetry.speed.toFixed(1)},${simulatedTelemetry.soc.toFixed(1)},${simulatedTelemetry.currentDraw.toFixed(1)},${simulatedTelemetry.batteryVoltage.toFixed(1)},${simulatedTelemetry.maxCellVoltage.toFixed(2)},${simulatedTelemetry.minCellVoltage.toFixed(2)},${simulatedTelemetry.averageTemp.toFixed(1)},${simulatedTelemetry.motorTemp.toFixed(1)},${simulatedTelemetry.inverterTemp.toFixed(1)},${simulatedTelemetry.faultyCell || 'None'},${isShutdown}\n`;
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
        if (cmd.action === 'TOGGLE_AUTO') autoSimulate = !autoSimulate;
        else if (cmd.action === 'SET_SPEED') simulatedTelemetry.speed = cmd.value;
        else if (cmd.action === 'SET_SOC') simulatedTelemetry.soc = cmd.value;
        else if (cmd.action === 'CUTOFF_CELL') {
          simulatedTelemetry.faultyCell = cmd.value;
        } else if (cmd.action === 'SET_MOTOR_TEMP') {
          simulatedTelemetry.motorTemp = cmd.value;
        } else if (cmd.action === 'TOGGLE_SHUTDOWN') {
          const key = cmd.value;
          simulatedTelemetry.shutdownCircuit[key] = !simulatedTelemetry.shutdownCircuit[key];
        } else if (cmd.action === 'START_LOGGING') {
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
