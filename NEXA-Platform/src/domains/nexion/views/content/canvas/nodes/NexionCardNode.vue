<template>
  <div class="nexion-card-node" :class="{ 'nexion-card-node--selected': selected }">
    <Handle id="in" class="nexion-card-node__handle" type="target" :position="Position.Left" />
    <div class="nexion-card-node__title">{{ data.label }}</div>
    <div v-if="showDetail" class="nexion-card-node__meta text-caption">{{ data.linkId }}</div>
    <div v-if="showDetail" class="nexion-card-node__hint text-caption">Why Chain · WILL 실선 연결</div>
    <Handle class="nexion-card-node__handle" type="source" :position="Position.Right" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { storeToRefs } from 'pinia'
import { useNexionFlowStore } from '@domains/nexion/modules/core/stores/nexionFlowStore'

defineProps({
  id: { type: String, required: true },
  data: {
    type: Object,
    default: () => ({ label: '카드', linkId: '' }),
  },
  selected: { type: Boolean, default: false },
})

const store = useNexionFlowStore()
const { viewportZoom } = storeToRefs(store)

const showDetail = computed(() => store.showNodeDetail(viewportZoom.value))
</script>

<style lang="scss" scoped>
.nexion-card-node {
  min-width: 140px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--nexa-border-color, rgba(0, 0, 0, 0.18));
  background: var(--nexa-background-elevated, #fff);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  font-size: 13px;
  color: var(--nexa-text-primary, #1a1a1a);

  &--selected {
    border-color: var(--nexa-primary, #1976d2);
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.25);
  }
}

.body--dark .nexion-card-node {
  background: var(--nexa-background-elevated, #2a2a2a);
  color: var(--nexa-text-primary, #eee);
}

.nexion-card-node__title {
  font-weight: 600;
}

.nexion-card-node__meta {
  margin-top: 4px;
  opacity: 0.85;
  font-family: monospace;
}

.nexion-card-node__hint {
  margin-top: 2px;
  opacity: 0.6;
}

.nexion-card-node__handle {
  width: 14px;
  height: 14px;
  min-width: 14px;
  min-height: 14px;
  background: var(--nexa-primary, #1976d2);
  border: 2px solid var(--nexa-background, #fff);
}
</style>
