<template>
  <div class="nexion-right-panel q-pa-md">
    <div class="nexion-map-toolbar row items-center no-wrap q-mb-xs">
      <span class="text-subtitle2 text-weight-bold nexion-map-toolbar__label">miniMap</span>
      <div ref="controlsHostRef" id="nexion-controls-host" class="nexion-controls-host" />
    </div>
    <div ref="minimapHostRef" id="nexion-minimap-host" class="nexion-minimap-host q-mb-md" />

    <div class="text-subtitle2 text-weight-bold q-mb-sm">노드 속성</div>

    <template v-if="selectedNode">
      <q-input v-model="labelEdit" class="q-mb-sm" outlined dense label="표시 제목" @blur="commitLabel" @keyup.enter="commitLabel" />
      <q-list bordered separator class="rounded-borders q-mb-md">
        <q-item>
          <q-item-section>
            <q-item-label caption>노드 ID</q-item-label>
            <q-item-label class="text-mono text-caption">{{ selectedNode.id }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label caption>Link ID (Phase 1 스텁)</q-item-label>
            <q-item-label class="text-mono text-caption">{{ selectedNode.data?.linkId || '—' }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label caption>유형</q-item-label>
            <q-item-label>{{ selectedNode.type === 'nexionGroup' ? '그룹 (부모)' : '카드' }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="selectedNode.parentNode">
          <q-item-section>
            <q-item-label caption>부모</q-item-label>
            <q-item-label class="text-mono text-caption">{{ selectedNode.parentNode }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <q-btn outline color="negative" size="sm" class="full-width" label="이 노드 삭제" @click="removeCurrent" />

      <p class="text-caption text-grey-7 q-mt-md">Late Anchoring·`doc_anchor`·영문 IR은 Phase 2~4에서 `[NXN] [UIUX]` §7에 맞춰 연결합니다.</p>
    </template>

    <div v-else class="text-caption text-grey-6 q-mt-md">노드를 선택하면 Link ID와 제목을 여기서 다룹니다.</div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { useNexionFlowStore } from '@domains/nexion/modules/core/stores/nexionFlowStore'
import { setNexionControlsHost, setNexionMinimapHost } from '@domains/nexion/modules/core/utils/nexionMinimapHost'

const $q = useQuasar()
const store = useNexionFlowStore()
const { nodes, selectedNodeId } = storeToRefs(store)

const labelEdit = ref('')
const minimapHostRef = ref(null)
const controlsHostRef = ref(null)

const selectedNode = computed(() => {
  const id = selectedNodeId.value
  if (!id) return null
  return nodes.value.find((n) => n.id === id) ?? null
})

watch(
  selectedNode,
  (n) => {
    labelEdit.value = n?.data?.label != null ? String(n.data.label) : ''
  },
  { immediate: true },
)

function commitLabel() {
  const id = selectedNodeId.value
  if (!id) return
  store.setNodeLabel(id, labelEdit.value || '카드')
}

onMounted(async () => {
  await nextTick()
  if (controlsHostRef.value) setNexionControlsHost(controlsHostRef.value)
  if (minimapHostRef.value) setNexionMinimapHost(minimapHostRef.value)
})

onBeforeUnmount(() => {
  setNexionControlsHost(null)
  setNexionMinimapHost(null)
})

function removeCurrent() {
  const id = selectedNodeId.value
  if (!id) return
  $q.dialog({
    title: '노드 삭제',
    message: '이 노드와 연결된 엣지도 함께 제거됩니다.',
    cancel: true,
  }).onOk(() => {
    store.removeNode(id)
  })
}
</script>

<style lang="scss" scoped>
.nexion-right-panel {
  height: 100%;
  overflow: auto;
}

.text-mono {
  font-family: monospace;
}

.nexion-map-toolbar {
  width: 100%;
}

.nexion-map-toolbar__label {
  flex-shrink: 0;
  letter-spacing: 0.02em;
}

.nexion-controls-host {
  margin-left: auto;
  flex-shrink: 0;
  min-height: 22px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* 가로는 패널 콘텐츠 폭 전체, 높이는 비율로만 결정(ResizeObserver가 MiniMap 픽셀과 맞춤) */
.nexion-minimap-host {
  position: relative;
  width: 100%;
  aspect-ratio: 200 / 120;
  min-height: 100px;
  overflow: hidden;
  box-sizing: border-box;
  background: transparent;
}
</style>
