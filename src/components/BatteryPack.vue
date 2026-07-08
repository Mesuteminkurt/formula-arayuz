<script setup>
import { computed } from 'vue';
import { Battery, Zap, Activity } from 'lucide-vue-next';

const props = defineProps({
  soc: {
    type: Number,
    required: true
  },
  voltage: {
    type: Number,
    required: true
  },
  maxV: {
    type: Number,
    default: 0
  },
  minV: {
    type: Number,
    default: 0
  }
});

// 60-30-10 Rule mapping for State of Charge
const stateColorClass = computed(() => {
  if (props.soc > 30) return 'state-safe';
  if (props.soc > 10) return 'state-warning';
  return 'state-danger critical-glow';
});

const statusText = computed(() => {
  if (props.soc > 30) return 'OPTIMAL';
  if (props.soc > 10) return 'LOW BATTERY';
  return 'CRITICAL LEVEL';
});
</script>

<template>
  <div class="glass-panel battery-panel">
    <div class="panel-header">
      <h2 class="panel-title"><Battery class="icon" /> Main HV Battery</h2>
    </div>

    <div class="soc-container">
      <div class="battery-outline">
        <div class="battery-terminal"></div>
        <div class="battery-fill-bg">
          <div 
            class="battery-fill" 
            :class="stateColorClass"
            :style="{ width: `${Math.max(0, Math.min(100, soc))}%` }"
          ></div>
        </div>
      </div>
      
      <div class="soc-readout">
        <div class="soc-value glow-text" :class="stateColorClass">{{ soc.toFixed(1) }}%</div>
        <div class="soc-status" :class="stateColorClass">{{ statusText }}</div>
      </div>
    </div>

    <div class="voltage-metrics">
      <div class="voltage-card main-voltage">
        <div class="metric-label"><Zap class="metric-icon" size="14"/> Pack Voltage</div>
        <div class="metric-value">{{ voltage.toFixed(1) }} <span class="unit">V</span></div>
      </div>
      
      <div class="cell-voltages">
        <div class="voltage-card small-card">
          <div class="metric-label"><Activity class="metric-icon" size="14"/> Max Cell V</div>
          <div class="metric-value safe">{{ maxV.toFixed(2) }} <span class="unit">V</span></div>
        </div>
        <div class="voltage-card small-card">
          <div class="metric-label"><Activity class="metric-icon" size="14"/> Min Cell V</div>
          <div class="metric-value warning">{{ minV.toFixed(2) }} <span class="unit">V</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.battery-panel {
  display: flex;
  flex-direction: column;
}

.panel-header {
  margin-bottom: 1.5rem;
}

.panel-title {
  font-size: 1.1rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  color: var(--text-muted);
}

.soc-container {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.battery-outline {
  width: 160px;
  height: 60px;
  border: 3px solid var(--border-color);
  border-radius: 8px;
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding: 3px;
}

.battery-terminal {
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 24px;
  background: var(--border-color);
  border-radius: 0 4px 4px 0;
}

.battery-fill-bg {
  width: 100%;
  height: 100%;
  background: var(--bg-tertiary);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

.battery-fill {
  height: 100%;
  transition: width 0.5s ease, background-color 0.3s;
  border-radius: 4px 0 0 4px;
}

.state-safe {
  color: var(--color-safe);
}
.battery-fill.state-safe {
  background: var(--color-safe);
  box-shadow: -4px 0 15px var(--color-safe-glow);
}

.state-warning {
  color: var(--color-warning);
}
.battery-fill.state-warning {
  background: var(--color-warning);
  box-shadow: -4px 0 15px var(--color-warning-glow);
}

.state-danger {
  color: var(--color-danger);
}
.battery-fill.state-danger {
  background: var(--color-danger);
  box-shadow: -4px 0 15px var(--color-danger-glow);
}

.soc-readout {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.soc-value {
  font-size: 2.75rem;
  font-weight: 800;
  line-height: 1;
}

.soc-status {
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 2px;
  margin-top: 0.5rem;
}

.voltage-metrics {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.voltage-card {
  background: var(--bg-tertiary);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cell-voltages {
  display: flex;
  gap: 1rem;
}

.small-card {
  flex: 1;
  padding: 1rem;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
}

.small-card .metric-value {
  font-size: 1.25rem;
}

.metric-value.safe { color: var(--color-safe); }
.metric-value.warning { color: var(--color-warning); }

.unit {
  font-size: 0.875rem;
  color: var(--text-muted);
}
</style>
