<script setup>
import { Grid, Activity } from 'lucide-vue-next';

const props = defineProps({
  modules: {
    type: Array,
    required: true
  },
  averageTemp: {
    type: Number,
    required: true
  }
});
</script>

<template>
  <div class="glass-panel modules-panel">
    <div class="panel-header">
      <h2 class="panel-title"><Grid class="icon" /> Module Temperatures</h2>
      <div class="overall-avg">
        <Activity size="14" class="icon" />
        <span>Overall Avg: <strong class="glow-text">{{ averageTemp.toFixed(1) }}°C</strong></span>
      </div>
    </div>

    <div class="modules-grid">
      <div v-for="mod in modules" :key="mod.id" class="module-card">
        <div class="module-id">Mod {{ mod.id }}</div>
        
        <div class="metrics">
          <div class="metric-row">
            <span class="label">Max T</span>
            <span class="value warning">{{ mod.maxT.toFixed(1) }}°C</span>
          </div>
          <div class="metric-row">
            <span class="label">Min T</span>
            <span class="value safe">{{ mod.minT.toFixed(1) }}°C</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modules-panel {
  display: flex;
  flex-direction: column;
}

.panel-header {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.overall-avg {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid var(--border-color);
}

.overall-avg strong {
  color: var(--text-primary);
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

.modules-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.module-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.module-id {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--accent-cyan);
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.metrics {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.label {
  color: var(--text-muted);
}

.value {
  color: var(--text-primary);
  font-weight: 600;
}

.value.safe { color: var(--color-safe); }
.value.warning { color: var(--color-warning); }

.divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.25rem 0;
}
</style>
