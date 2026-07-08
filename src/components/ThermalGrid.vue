<script setup>
import { computed } from 'vue';
import { Thermometer, Activity, Settings, Cpu } from 'lucide-vue-next';

const props = defineProps({
  motorTemp: Number,
  inverterTemp: Number,
  batteryTemp: Number
});

const getTempColorClass = (temp, thresholdWarning, thresholdDanger) => {
  if (temp >= thresholdDanger) return 'state-danger critical-glow';
  if (temp >= thresholdWarning) return 'state-warning';
  return 'state-safe';
};
</script>

<template>
  <div class="glass-panel thermal-panel">
    <div class="panel-header">
      <h2 class="panel-title"><Thermometer class="icon" /> Thermal System</h2>
    </div>

    <div class="thermal-grid">
      <!-- Battery Temp -->
      <div class="thermal-card">
        <div class="card-header">
          <Activity class="card-icon" size="16"/>
          <span>Battery Avg</span>
        </div>
        <div class="temp-readout" :class="getTempColorClass(batteryTemp, 45, 60)">
          {{ batteryTemp.toFixed(1) }}°C
        </div>
        <div class="temp-bar-bg">
          <div class="temp-bar" :class="getTempColorClass(batteryTemp, 45, 60)" :style="{ width: `${Math.min((batteryTemp/80)*100, 100)}%` }"></div>
        </div>
      </div>

      <!-- Motor Temp -->
      <div class="thermal-card">
        <div class="card-header">
          <Settings class="card-icon" size="16"/>
          <span>Motor Temp</span>
        </div>
        <div class="temp-readout" :class="getTempColorClass(motorTemp, 85, 110)">
          {{ motorTemp.toFixed(1) }}°C
        </div>
        <div class="temp-bar-bg">
          <div class="temp-bar" :class="getTempColorClass(motorTemp, 85, 110)" :style="{ width: `${Math.min((motorTemp/150)*100, 100)}%` }"></div>
        </div>
      </div>

      <!-- Inverter Temp -->
      <div class="thermal-card">
        <div class="card-header">
          <Cpu class="card-icon" size="16"/>
          <span>Inverter Temp</span>
        </div>
        <div class="temp-readout" :class="getTempColorClass(inverterTemp, 70, 90)">
          {{ inverterTemp.toFixed(1) }}°C
        </div>
        <div class="temp-bar-bg">
          <div class="temp-bar" :class="getTempColorClass(inverterTemp, 70, 90)" :style="{ width: `${Math.min((inverterTemp/120)*100, 100)}%` }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.thermal-panel {
  display: flex;
  flex-direction: column;
}

.panel-header {
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

.thermal-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.thermal-card {
  background: var(--bg-tertiary);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.temp-readout {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.state-safe { color: var(--color-safe); }
.state-warning { color: var(--color-warning); }
.state-danger { color: var(--color-danger); }

.temp-bar-bg {
  width: 100%;
  height: 6px;
  background: var(--bg-primary);
  border-radius: 3px;
  overflow: hidden;
}

.temp-bar {
  height: 100%;
  transition: width 0.3s, background-color 0.3s;
}

.temp-bar.state-safe { background-color: var(--color-safe); }
.temp-bar.state-warning { background-color: var(--color-warning); }
.temp-bar.state-danger { background-color: var(--color-danger); box-shadow: 0 0 10px var(--color-danger); }
</style>
