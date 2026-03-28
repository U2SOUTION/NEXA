<template>
  <div class="nexion-content">
    <div class="nexion-content__header row items-center q-px-md q-pt-md q-pb-sm">
      <div class="col">
        <div class="text-h6 text-weight-bold text-primary">NEXA Nexion</div>
        <div class="text-caption text-grey-7">Phase 1 — Vue Flow 프로토타입 (카드 · DnD · 연결 · 그룹 · 줌 LOD)</div>
      </div>
    </div>
    <div class="nexion-content__canvas">
      <NexionCanvasView />
    </div>
  </div>
</template>

<script setup>
import NexionCanvasView from './canvas/NexionCanvasView.vue'
</script>

<style lang="scss" scoped>
.nexion-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 480px;
  background: var(--nexa-background);
}

.nexion-content__canvas {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 12px 12px;
}
</style>
