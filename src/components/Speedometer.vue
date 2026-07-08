<script setup>
import { computed } from 'vue';
import { Gauge, Zap, Activity } from 'lucide-vue-next';

const props = defineProps({
  speed: {
    type: Number,
    required: true
  },
  power: {
    type: Number,
    default: 0
  },
  consumption: {
    type: Number,
    default: 0
  }
});

const speedPercentage = computed(() => {
  return Math.min((props.speed / 150) * 100, 100);
});

// SVG Arc Calculation
const radius = 60;
const circumference = 2 * Math.PI * radius;
const dashoffset = computed(() => {
  return circumference - (speedPercentage.value / 100) * (circumference * 0.75); // 75% circle for gauge
});
</script>

<template>
  <div class="glass-panel speedometer-panel">
    <div class="panel-header">
      <h2 class="panel-title"><Gauge class="icon" /> Drive Telemetry</h2>
    </div>

    <div class="gauge-container">
      <svg class="gauge-svg" viewBox="0 0 160 160">
        <!-- Background Arc -->
        <circle 
          cx="80" cy="80" r="60" 
          fill="none" 
          stroke="var(--bg-tertiary)" 
          stroke-width="12"
          stroke-dasharray="282.7"
          stroke-dashoffset="70.6"
          stroke-linecap="round"
          transform="rotate(135 80 80)"
        />
        <!-- Active Arc -->
        <circle 
          class="gauge-active"
          cx="80" cy="80" r="60" 
          fill="none" 
          stroke="var(--accent-cyan)" 
          stroke-width="12"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashoffset"
          stroke-linecap="round"
          transform="rotate(135 80 80)"
        />
      </svg>
      <div class="speed-readout">
        <span class="speed-value glow-text">{{ Math.round(speed) }}</span>
        <span class="speed-unit">km/h</span>
      </div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label"><Zap class="metric-icon" size="14"/> Current Draw</div>
        <div class="metric-value">{{ power.toFixed(1) }} <span class="unit">A</span></div>
      </div>
      <div class="metric-card">
        <div class="metric-label"><Activity class="metric-icon" size="14"/> Consumption</div>
        <div class="metric-value">{{ consumption.toFixed(1) }} <span class="unit">kW</span></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.speedometer-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.panel-header {
  width: 100%;
  margin-bottom: 1rem;
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

.gauge-container {
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
}

.gauge-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.gauge-active {
  transition: stroke-dashoffset 0.1s linear;
  filter: drop-shadow(0 0 4px var(--accent-cyan));
}

.speed-readout {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.speed-value {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--text-primary);
}

.speed-unit {
  font-size: 1rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
}

.metric-card {
  background: var(--bg-tertiary);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.unit {
  font-size: 0.875rem;
  color: var(--text-muted);
}
</style>
