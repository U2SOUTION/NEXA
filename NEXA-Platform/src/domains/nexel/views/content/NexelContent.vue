<template>
  <div class="nexel-content q-pa-lg">
    <div class="page-header q-mb-lg">
      <div class="header-title">NEXA NEXEL v2</div>
      <div class="header-description">자동화 워크플로우 설계 및 시뮬레이션</div>

      <div class="toolbar-rows q-mt-md">
        <!-- 툴바 내용 (레거시 Nexa 페이지에서 유지) -->
        <div class="toolbar-group">
          <span class="toolbar-label">Engine:</span>
          <q-btn flat dense label="Mock" />
          <q-btn flat dense label="Live" />
        </div>
      </div>
    </div>

    <div v-if="canvasReady" class="canvas-stage">
      <NodeCanvas class="canvas-full" :nodes="canvasNodes" :links="canvasLinks" />
    </div>
    <div v-else class="doc-stage">
      <q-tabs v-model="activeTab" align="left" dense class="text-primary">
        <q-tab name="basic" label="기본 개념" icon="lightbulb" />
        <q-tab name="nodes" label="노드 타입" icon="category" />
      </q-tabs>
      <q-tab-panels v-model="activeTab" animated class="bg-transparent">
        <q-tab-panel name="basic">
          <div class="text-h6">노드 자동화 개념</div>
          <p>시각적 그래프를 통한 로직 구성</p>
        </q-tab-panel>
        <q-tab-panel name="nodes">
          <div class="text-h6">노드 종류</div>
          <p>트리거, 처리, 액션 노드</p>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script setup>
// NEXA NEXEL 컨텐츠 뷰
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import NodeCanvas from '@engines/diagram/NodeCanvas.vue'
import { useNexaNodeStore } from '@system/store/nexaNodeStore'
import { nodeAdapter } from '@system/services/device/VirtualNodeAdapter'

const activeTab = ref('basic')
const nexaNodeStore = useNexaNodeStore()
const { canvasNodes, canvasLinks, canvasReady } = storeToRefs(nexaNodeStore)

onMounted(() => {
  if (nodeAdapter && typeof nodeAdapter.init === 'function') {
    nodeAdapter.init()
  }
})
</script>

<style lang="scss" scoped>
.nexel-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.header-title {
  font-size: 2rem;
  font-weight: 900;
  color: var(--nexa-primary);
}
.canvas-stage {
  flex: 1;
  min-height: 500px;
}
.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
  padding: 4px;
  background-color: var(--nexa-background-lower);
}
</style>
