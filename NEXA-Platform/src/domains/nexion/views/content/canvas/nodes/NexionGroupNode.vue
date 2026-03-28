<template>
  <div class="nexion-group-node" :class="{ 'nexion-group-node--selected': selected }">
    <div class="nexion-group-node__bar">
      <span class="nexion-group-node__title">{{ data.label }}</span>
      <span v-if="showDetail" class="nexion-group-node__id text-caption">{{ data.linkId }}</span>
    </div>
    <div class="nexion-group-node__slot">
      <span v-if="showDetail" class="text-caption text-grey">자식 카드는 그룹 안에 배치 (부모–자식)</span>
    </div>
    <Handle id="in" class="nexion-group-node__handle" type="target" :position="Position.Left" />
    <Handle id="out" class="nexion-group-node__handle" type="source" :position="Position.Right" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { storeToRefs } from 'pinia'
import { useNexionFlowStore } from '@domains/nexion/modules/core/stores/nexionFlowStore'

defineProps({
  data: {
    type: Object,
    default: () => ({ label: '그룹', linkId: '' }),
  },
  selected: { type: Boolean, default: false },
})

const store = useNexionFlowStore()
const { viewportZoom } = storeToRefs(store)
const showDetail = computed(() => store.showNodeDetail(viewportZoom.value))
</script>

<style lang="scss" scoped>
.nexion-group-node {
  width: 100%;
  height: 100%;
  min-width: 200px;
  min-height: 160px;
  border-radius: 10px;
  border: 2px dashed var(--nexa-border-color, rgba(0, 0, 0, 0.22));
  background: rgba(25, 118, 210, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &--selected {
    border-color: var(--nexa-primary, #1976d2);
    background: rgba(25, 118, 210, 0.08);
  }
}

.nexion-group-node__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  background: rgba(25, 118, 210, 0.12);
  font-size: 12px;
  font-weight: 700;
}

.nexion-group-node__id {
  font-family: monospace;
  opacity: 0.85;
}

.nexion-group-node__slot {
  flex: 1;
  padding: 8px;
  pointer-events: none;
}

.nexion-group-node__handle {
  width: 14px;
  height: 14px;
  min-width: 14px;
  min-height: 14px;
  background: var(--nexa-primary, #1976d2);
  border: 2px solid var(--nexa-background, #fff);
  z-index: 10;
  pointer-events: auto;
}
</style>
