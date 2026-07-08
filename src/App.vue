<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Speedometer from './components/Speedometer.vue';
import BatteryPack from './components/BatteryPack.vue';
import ThermalGrid from './components/ThermalGrid.vue';
import BatteryModules from './components/BatteryModules.vue';
import CellGrid from './components/CellGrid.vue';
import Simulator from './components/Simulator.vue';
import ShutdownCircuit from './components/ShutdownCircuit.vue';
import DataLogger from './components/DataLogger.vue';
import { Sliders, Clock } from 'lucide-vue-next';

const isSimulatorOpen = ref(true);

const telemetry = ref({
  speed: 0,
  soc: 100,
  currentDraw: 0,
  instantConsumption: 0,
  batteryVoltage: 400.0,
  maxCellVoltage: 4.20,
  minCellVoltage: 4.19,
  averageTemp: 25.0,
  motorTemp: 30.0,
  inverterTemp: 35.0,
  modules: [],
  faultyCell: null,
  isLogging: false,
  shutdownCircuit: {
    ts: true, hvd: true, testpoint: true, battTerm: true, bspd: true, estopL: true, estopR: true, crash: true, estopC: true
  }
});

const isConnected = ref(false);
const currentTime = ref('');
const currentDate = ref('');
let ws = null;
let clockInterval = null;

const updateClock = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  currentDate.value = now.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const connectWebSocket = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // If running locally on Vite port (5173), connect to Node port (3001)
  // If running in production (Render), connect to the same host/port
  const host = window.location.port === '5173' ? 'localhost:3001' : window.location.host;
  
  ws = new WebSocket(`${protocol}//${host}`);

  ws.onopen = () => {
    isConnected.value = true;
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'TELEMETRY_UPDATE') {
        telemetry.value = msg.data;
      }
    } catch (e) {
      console.error("Error parsing telemetry", e);
    }
  };

  ws.onclose = () => {
    isConnected.value = false;
    setTimeout(connectWebSocket, 2000); // Reconnect attempt
  };
};

const sendCommand = (cmd) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'SIMULATION_COMMAND', data: cmd }));
  }
};

onMounted(() => {
  connectWebSocket();
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  if (ws) ws.close();
  if (clockInterval) clearInterval(clockInterval);
});
</script>

<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="dashboard-header glass-panel">
      <div class="header-left">
        <h1 class="title glow-text">
          <img src="/logo.png" alt="SUAS Racing" class="team-logo" />
          SUAS Racing Telemetry
        </h1>
      </div>
      
      <div class="header-center">
        <div class="clock-display">
          <Clock size="18" class="icon" />
          <div class="time-info">
            <span class="time">{{ currentTime }}</span>
            <span class="date">{{ currentDate }}</span>
          </div>
        </div>
      </div>

      <div class="header-right">
        <div class="status-badge" :class="isConnected ? 'connected' : 'disconnected'">
          <span class="pulse-dot"></span>
          {{ isConnected ? 'SYSTEM ONLINE' : 'CONNECTION LOST' }}
        </div>
      </div>
    </header>

    <!-- Main Grid -->
    <main class="dashboard-grid">
      <!-- Left Column: Primary Drive Data -->
      <div class="column left-column">
        <Speedometer :speed="telemetry.speed" :power="telemetry.currentDraw" :consumption="telemetry.instantConsumption" />
        <ThermalGrid 
          :motorTemp="telemetry.motorTemp" 
          :inverterTemp="telemetry.inverterTemp" 
          :batteryTemp="telemetry.averageTemp" 
        />
      </div>

      <!-- Center Column: Battery & Core Metrics -->
      <div class="column center-column">
        <BatteryPack 
          :soc="telemetry.soc" 
          :voltage="telemetry.batteryVoltage" 
          :maxV="telemetry.maxCellVoltage"
          :minV="telemetry.minCellVoltage"
        />
        <BatteryModules :modules="telemetry.modules" :averageTemp="telemetry.averageTemp" />
      </div>

      <!-- Right Column: Cell Level Diagnostics -->
      <div class="column right-column">
        <CellGrid :faultyCell="telemetry.faultyCell" />
        
        <!-- CSV Data Logger Panel (Moved to fill the empty space) -->
        <DataLogger :isLogging="telemetry.isLogging" @command="sendCommand" />
      </div>
    </main>

    <!-- Shutdown Safety Bar (At the very bottom) -->
    <ShutdownCircuit :circuit="telemetry.shutdownCircuit" />

    <!-- Simulator Sidebar -->
    <Simulator 
      v-if="isSimulatorOpen"
      @command="sendCommand" 
      @close="isSimulatorOpen = false"
      :telemetry="telemetry" 
    />

    <!-- Re-open Simulator Button -->
    <button v-if="!isSimulatorOpen" class="reopen-sim-btn glass-panel" @click="isSimulatorOpen = true" title="Open Simulator">
      <Sliders size="24" class="icon" />
    </button>
  </div>
</template>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text-primary);
}

.team-logo {
  height: 44px;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

.icon {
  color: var(--accent-cyan);
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  border: 1px solid transparent;
}

.header-center {
  display: flex;
  justify-content: center;
  flex: 1;
}

.clock-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--bg-tertiary);
  padding: 0.5rem 1.5rem;
  border-radius: 9999px;
  border: 1px solid var(--border-color);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

.time-info {
  display: flex;
  flex-direction: column;
}

.time {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 2px;
  font-variant-numeric: tabular-nums;
}

.date {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.status-badge.connected {
  color: var(--color-safe);
  border-color: rgba(16, 185, 129, 0.3);
  background-color: rgba(16, 185, 129, 0.1);
}

.status-badge.disconnected {
  color: var(--color-danger);
  border-color: rgba(239, 68, 68, 0.3);
  background-color: rgba(239, 68, 68, 0.1);
  animation: pulse 2s infinite;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  gap: 1.5rem;
  flex: 1;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.reopen-sim-btn {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  cursor: pointer;
  z-index: 90;
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

.reopen-sim-btn:hover {
  background: var(--border-color);
  transform: scale(1.05);
}
</style>
