<template>
  <div class="nexion-canvas-view">
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :node-types="nodeTypes"
      :default-edge-options="nexionFlowStore.defaultEdgeOptions"
      :min-zoom="0.15"
      :max-zoom="2"
      :snap-to-grid="true"
      :snap-grid="[16, 16]"
      :connection-radius="28"
      :zoom-on-double-click="false"
      fit-view-on-init
      class="nexion-vue-flow"
      @connect="nexionFlowStore.onConnect"
      @node-click="onNodeClick"
    >
      <Background
        variant="dots"
        :gap="18"
        :size="1.25"
        pattern-color="rgba(25, 118, 210, 0.35)"
        bg-color="var(--nexa-background, #ececec)"
      />
      <Controls />
      <MiniMap pannable zoomable />
      <NexionFlowHooks />
    </VueFlow>

    <div class="nexion-canvas-view__hint text-caption">
      점무늬 <strong>빈 바탕</strong> 더블클릭: 카드 추가 · 카드 <strong>파란 핸들</strong>에서 드래그해 상대 핸들에 놓기: 연결 · 휠: 줌 · 드래그: 팬
    </div>
  </div>
</template>

<script setup>
import { markRaw } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { storeToRefs } from 'pinia'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

import { useNexionFlowStore } from '@domains/nexion/modules/core/stores/nexionFlowStore'
import NexionCardNode from './nodes/NexionCardNode.vue'
import NexionGroupNode from './nodes/NexionGroupNode.vue'
import NexionFlowHooks from './NexionFlowHooks.vue'

const nexionFlowStore = useNexionFlowStore()
const { nodes, edges } = storeToRefs(nexionFlowStore)

const nodeTypes = {
  nexionCard: markRaw(NexionCardNode),
  nexionGroup: markRaw(NexionGroupNode),
}

function onNodeClick({ node }) {
  nexionFlowStore.selectNode(node.id)
}
</script>

<style lang="scss">
/* Vue Flow pane must fill flex parent (높이 0이면 클릭·연결·배경이 전부 죽음) */
.nexion-vue-flow {
  flex: 1;
  min-height: 360px;
  min-width: 0;
  width: 100%;
  height: 100%;
}

.nexion-vue-flow .vue-flow__viewport {
  font-family: inherit;
  width: 100%;
  height: 100%;
}

.nexion-vue-flow :deep(.vue-flow__pane) {
  cursor: grab;
}

.nexion-vue-flow :deep(.vue-flow__pane.selection-active) {
  cursor: grabbing;
}
</style>

<style lang="scss" scoped>
.nexion-canvas-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  height: 100%;
}

.nexion-canvas-view__hint {
  flex-shrink: 0;
  padding: 6px 10px;
  border-top: 1px solid var(--nexa-border-color, rgba(0, 0, 0, 0.12));
  opacity: 0.85;
}
</style>
