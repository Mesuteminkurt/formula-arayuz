<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Database, Download, Play, Square, RefreshCw, FileText } from 'lucide-vue-next';

const props = defineProps({
  isLogging: Boolean
});

const emit = defineEmits(['command']);
const logs = ref([]);
const isLoading = ref(false);

const fetchLogs = async () => {
  isLoading.value = true;
  try {
    // Dynamically choose API endpoint based on dev vs prod environment
    const apiBase = window.location.port === '5173' ? 'http://localhost:3001' : '';
    const res = await fetch(`${apiBase}/api/logs`);
    const data = await res.json();
    logs.value = data;
  } catch (error) {
    console.error("Failed to fetch logs", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchLogs();
});

const toggleLogging = () => {
  if (props.isLogging) {
    emit('command', { action: 'STOP_LOGGING' });
    // Fetch logs after a short delay to ensure file is saved
    setTimeout(fetchLogs, 500);
  } else {
    emit('command', { action: 'START_LOGGING' });
  }
};

const getDownloadLink = (filename) => {
  const apiBase = window.location.port === '5173' ? 'http://localhost:3001' : '';
  return `${apiBase}/logs/${filename}`;
};
</script>

<template>
  <div class="data-logger glass-panel">
    <div class="logger-header">
      <div class="title-group">
        <Database size="20" class="icon" />
        <h2>Data Logger (CSV)</h2>
      </div>
      
      <div class="actions">
        <button class="btn" :class="isLogging ? 'btn-danger' : 'btn-safe'" @click="toggleLogging">
          <Square size="16" v-if="isLogging" />
          <Play size="16" v-else />
          {{ isLogging ? 'Stop Recording' : 'Start Recording' }}
        </button>
        <button class="btn btn-outline" @click="fetchLogs" :disabled="isLoading">
          <RefreshCw size="16" :class="{ 'spin': isLoading }" />
          Refresh List
        </button>
      </div>
    </div>

    <div class="logs-container">
      <div v-if="isLogging" class="recording-alert">
        <div class="blinking-dot"></div>
        <span>Recording active... Data is being written to disk at 1Hz.</span>
      </div>

      <div v-if="logs.length === 0 && !isLogging" class="empty-state">
        No CSV records found. Start recording to generate data.
      </div>

      <div class="logs-list" v-else>
        <div class="log-item" v-for="log in logs" :key="log">
          <div class="log-info">
            <FileText size="18" class="file-icon" />
            <span class="filename">{{ log }}</span>
          </div>
          <a :href="getDownloadLink(log)" download class="download-link">
            <Download size="16" />
            Download
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-logger {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  flex: 1;
}

.logger-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-group h2 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  flex: 1;
  justify-content: center;
}

.btn-safe {
  background: rgba(16, 185, 129, 0.2);
  color: var(--color-safe);
  border: 1px solid var(--color-safe);
}

.btn-safe:hover {
  background: var(--color-safe);
  color: var(--bg-primary);
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

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
}

.btn-outline:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.logs-container {
  min-height: 100px;
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recording-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--color-danger);
  border-radius: 6px;
  margin-bottom: 1rem;
}

.blinking-dot {
  width: 10px;
  height: 10px;
  background-color: var(--color-danger);
  border-radius: 50%;
  animation: pulse 1s infinite;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  font-style: italic;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  transition: border-color 0.2s;
}

.log-item:hover {
  border-color: var(--accent-cyan);
}

.log-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.file-icon {
  color: var(--text-muted);
}

.filename {
  font-family: monospace;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.download-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: rgba(0, 240, 255, 0.1);
  color: var(--accent-cyan);
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s;
}

.download-link:hover {
  background: var(--accent-cyan);
  color: var(--bg-primary);
}
</style>
