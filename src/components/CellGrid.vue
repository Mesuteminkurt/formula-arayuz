<script setup>
import { computed } from 'vue';
import { LayoutGrid, AlertTriangle } from 'lucide-vue-next';

const props = defineProps({
  faultyCell: {
    type: Number,
    default: null
  }
});

// Create 6 modules with 18 cells each (Total 108 cells)
const modules = computed(() => {
  const modArray = [];
  let cellIdCounter = 1;
  
  for (let m = 1; m <= 6; m++) {
    const cells = [];
    for (let c = 1; c <= 18; c++) {
      cells.push({
        id: cellIdCounter,
        status: props.faultyCell === cellIdCounter ? 'faulty' : 'normal'
      });
      cellIdCounter++;
    }
    modArray.push({
      id: m,
      cells: cells
    });
  }
  return modArray;
});

const isSystemFaulty = computed(() => props.faultyCell !== null && props.faultyCell !== 0);
</script>

<template>
  <div class="glass-panel cell-panel" :class="{ 'panel-danger': isSystemFaulty }">
    <div class="panel-header">
      <h2 class="panel-title" :class="{ 'text-danger': isSystemFaulty }">
        <LayoutGrid class="icon" v-if="!isSystemFaulty" />
        <AlertTriangle class="icon danger-icon animate-pulse" v-else />
        Cell Diagnostic Map
      </h2>
    </div>

    <div v-if="isSystemFaulty" class="fault-alert critical-glow">
      <AlertTriangle size="20" />
      <span>CRITICAL: CELL #{{ faultyCell }} CUT-OFF</span>
    </div>

    <div class="modules-container">
      <div class="module-block" v-for="mod in modules" :key="mod.id">
        <div class="module-label">Module {{ mod.id }}</div>
        <div class="cell-grid">
          <div 
            v-for="cell in mod.cells" 
            :key="cell.id"
            class="cell-box"
            :class="{
              'cell-normal': cell.status === 'normal',
              'cell-faulty critical-glow': cell.status === 'faulty'
            }"
            :title="`Cell #${cell.id}`"
          >
            <span class="cell-number" v-if="cell.status === 'faulty'">{{ cell.id }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cell-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: border-color 0.3s;
}

.cell-panel.panel-danger {
  border-color: var(--color-danger);
  box-shadow: inset 0 0 20px rgba(239, 68, 68, 0.1);
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

.text-danger {
  color: var(--color-danger);
  font-weight: 700;
}

.icon {
  color: var(--text-muted);
}

.danger-icon {
  color: var(--color-danger);
}

.fault-alert {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  padding: 0.75rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.modules-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.module-block {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.module-label {
  font-size: 0.7rem;
  color: var(--accent-cyan);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
}

.cell-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr); /* 6x3 grid for 18 cells */
  gap: 3px;
}

.cell-box {
  aspect-ratio: 1;
  border-radius: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.6rem;
  font-weight: bold;
}

.cell-normal {
  background: var(--color-safe);
  opacity: 0.3;
}

.cell-faulty {
  background: var(--color-danger);
  color: white;
  opacity: 1;
  z-index: 10;
}
</style>
