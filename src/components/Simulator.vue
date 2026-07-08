<script setup>
import { ref } from 'vue';
import { Sliders, AlertCircle, Play, Pause, X } from 'lucide-vue-next';

const emit = defineEmits(['command', 'close']);
const props = defineProps({
  telemetry: Object
});

const isAuto = ref(true);

const toggleAuto = () => {
  isAuto.value = !isAuto.value;
  emit('command', { action: 'TOGGLE_AUTO' });
};

const setSpeed = (e) => {
  if (isAuto.value) return;
  emit('command', { action: 'SET_SPEED', value: parseInt(e.target.value) });
};

const setSoc = (e) => {
  emit('command', { action: 'SET_SOC', value: parseInt(e.target.value) });
};

const triggerCutoff = () => {
  const randomCell = Math.floor(Math.random() * 108) + 1;
  emit('command', { action: 'CUTOFF_CELL', value: randomCell });
};

const clearCutoff = () => {
  emit('command', { action: 'CUTOFF_CELL', value: null });
};

const toggleShutdown = (key) => {
  emit('command', { action: 'TOGGLE_SHUTDOWN', value: key });
};
</script>

<template>
  <div class="simulator-sidebar glass-panel">
    <div class="sim-header">
      <div class="title-group">
        <Sliders size="18" />
        <span>Developer Controls</span>
      </div>
      <button class="close-btn" @click="$emit('close')">
        <X size="18" />
      </button>
    </div>

    <div class="sim-section">
      <button class="btn btn-outline" @click="toggleAuto">
        <Pause size="14" v-if="isAuto" />
        <Play size="14" v-else />
        {{ isAuto ? 'Pause Auto Sim' : 'Start Auto Sim' }}
      </button>
    </div>

    <div class="sim-section" :class="{ disabled: isAuto }">
      <label>Speed ({{ telemetry.speed.toFixed(0) }} km/h)</label>
      <input type="range" min="0" max="150" :value="telemetry.speed" @input="setSpeed" :disabled="isAuto">
    </div>

    <div class="sim-section">
      <label>Battery SoC ({{ telemetry.soc.toFixed(0) }}%)</label>
      <input type="range" min="0" max="100" :value="telemetry.soc" @input="setSoc">
    </div>

    <div class="sim-section">
      <label>Fault Injection (108 Cells)</label>
      <div class="btn-group">
        <button class="btn btn-danger" @click="triggerCutoff">
          <AlertCircle size="14" /> Cut-off Cell
        </button>
        <button class="btn btn-secondary" @click="clearCutoff">Clear</button>
      </div>
    </div>

    <div class="sim-section">
      <label>Shutdown Circuit</label>
      <div class="shutdown-toggles">
        <button class="shutdown-btn" :class="{ off: !telemetry.shutdownCircuit.ts }" @click="toggleShutdown('ts')">TS</button>
        <button class="shutdown-btn" :class="{ off: !telemetry.shutdownCircuit.hvd }" @click="toggleShutdown('hvd')">HVD</button>
        <button class="shutdown-btn" :class="{ off: !telemetry.shutdownCircuit.testpoint }" @click="toggleShutdown('testpoint')">TESTPOINT</button>
        <button class="shutdown-btn" :class="{ off: !telemetry.shutdownCircuit.battTerm }" @click="toggleShutdown('battTerm')">BATT UCU</button>
        <button class="shutdown-btn" :class="{ off: !telemetry.shutdownCircuit.bspd }" @click="toggleShutdown('bspd')">BSPD</button>
        <button class="shutdown-btn" :class="{ off: !telemetry.shutdownCircuit.estopL }" @click="toggleShutdown('estopL')">SOL E-STOP</button>
        <button class="shutdown-btn" :class="{ off: !telemetry.shutdownCircuit.estopR }" @click="toggleShutdown('estopR')">SAĞ E-STOP</button>
        <button class="shutdown-btn" :class="{ off: !telemetry.shutdownCircuit.crash }" @click="toggleShutdown('crash')">ÇARPIŞMA</button>
        <button class="shutdown-btn" :class="{ off: !telemetry.shutdownCircuit.estopC }" @click="toggleShutdown('estopC')">KOKPİT E-STOP</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.simulator-sidebar {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 280px;
  background: rgba(11, 15, 25, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  padding: 1rem;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
}

.sim-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.title-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--accent-cyan);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--color-danger);
}

.sim-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sim-section.disabled {
  opacity: 0.5;
}

label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

input[type=range] {
  width: 100%;
  accent-color: var(--accent-cyan);
}

.btn-group {
  display: flex;
  gap: 0.5rem;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  flex: 1;
  transition: all 0.2s;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--accent-cyan);
  color: var(--accent-cyan);
}

.btn-outline:hover {
  background: rgba(0, 240, 255, 0.1);
}

.btn-danger {
  background: rgba(239, 68, 68, 0.2);
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
}

.btn-danger:hover {
  background: var(--color-danger);
  color: white;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--border-color);
}

.shutdown-toggles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

.shutdown-btn {
  background: var(--color-safe);
  color: var(--bg-primary);
  border: none;
  padding: 0.25rem 0;
  font-size: 0.65rem;
  font-weight: bold;
  border-radius: 3px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.shutdown-btn.off {
  background: var(--bg-tertiary);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}
</style>
