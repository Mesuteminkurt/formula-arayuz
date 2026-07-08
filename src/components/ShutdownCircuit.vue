<script setup>
import { computed } from 'vue';
import { ToggleRight, PlugZap, LocateFixed, Link2, Cpu, ShieldAlert, AlertOctagon } from 'lucide-vue-next';

const props = defineProps({
  circuit: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="shutdown-bar glass-panel">
    
    <!-- 1. TS Switch -->
    <div class="indicator" :class="{ active: circuit.ts }">
      <div class="icon-box">
        <ToggleRight size="24" />
      </div>
      <span class="label">TS SWITCH</span>
    </div>

    <!-- 2. HVD Konnektör -->
    <div class="indicator warning" :class="{ active: circuit.hvd }">
      <div class="icon-box">
        <PlugZap size="24" />
      </div>
      <span class="label">HVD CONN</span>
    </div>

    <!-- 3. Testpoint -->
    <div class="indicator warning" :class="{ active: circuit.testpoint }">
      <div class="icon-box">
        <LocateFixed size="24" />
      </div>
      <span class="label">TESTPOINT</span>
    </div>

    <!-- 4. Batarya Uç Konnektör -->
    <div class="indicator warning" :class="{ active: circuit.battTerm }">
      <div class="icon-box">
        <Link2 size="24" />
      </div>
      <span class="label">BATT TERM</span>
    </div>

    <!-- 5. BSPD -->
    <div class="indicator" :class="{ active: circuit.bspd }">
      <div class="icon-box">
        <Cpu size="24" />
      </div>
      <span class="label">BSPD</span>
    </div>

    <!-- 6. Sol Emergency -->
    <div class="indicator e-stop" :class="{ active: circuit.estopL }">
      <div class="mushroom-btn">
        <span>L</span>
      </div>
      <span class="label">E-STOP L</span>
    </div>

    <!-- 7. Sağ Emergency -->
    <div class="indicator e-stop" :class="{ active: circuit.estopR }">
      <div class="mushroom-btn">
        <span>R</span>
      </div>
      <span class="label">E-STOP R</span>
    </div>

    <!-- 8. Çarpışma Sensörü -->
    <div class="indicator" :class="{ active: circuit.crash }">
      <div class="icon-box">
        <ShieldAlert size="24" />
      </div>
      <span class="label">CRASH SENS</span>
    </div>

    <!-- 9. Kokpit Emergency -->
    <div class="indicator e-stop" :class="{ active: circuit.estopC }">
      <div class="mushroom-btn">
        <span>C</span>
      </div>
      <span class="label">E-STOP C</span>
    </div>

  </div>
</template>

<style scoped>
.shutdown-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
}

.indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0.25;
  transition: all 0.3s;
  filter: grayscale(100%);
}

.indicator.active {
  opacity: 1;
  filter: grayscale(0%);
}

.indicator.active .icon-box,
.indicator.active .mushroom-btn {
  filter: drop-shadow(0 0 10px var(--color-safe));
  color: var(--color-safe);
  border-color: var(--color-safe);
}

.indicator.warning.active .icon-box {
  filter: drop-shadow(0 0 10px var(--color-warning));
  color: var(--color-warning);
  border-color: var(--color-warning);
}

.icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 40px;
  border: 2px solid currentColor;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s;
}

.label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text-muted);
  text-transform: uppercase;
}

.indicator.active .label {
  color: var(--text-primary);
}

/* Custom 3D Mushroom Button for E-Stops */
.mushroom-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #555, #222);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #666;
  position: relative;
  box-shadow: inset 0 -4px 6px rgba(0,0,0,0.5), 0 4px 6px rgba(0,0,0,0.3);
  color: #fff;
  font-weight: 900;
  font-size: 1.2rem;
}

.indicator.active .mushroom-btn {
  background: radial-gradient(circle at 30% 30%, #ff4b4b, #b90000);
  border-color: #ff7878;
  color: #fff;
  box-shadow: inset 0 -4px 6px rgba(0,0,0,0.3), 0 0 15px var(--color-danger);
  /* Override the generic green safe color for E-Stops so they glow red/active! */
  filter: none; 
}
</style>
