<template>
  <div class="nexion-right-panel column">
    <StandardRightHeader :title="rightHeaderTitle" :subtitle="rightHeaderSubtitle" push-icon="menu_open" />

    <q-tabs v-model="rightMainTab" dense class="right-main-tabs" active-color="primary" indicator-color="primary" align="left">
      <q-tab name="canvas" label="캔버스" icon="account_tree" />
      <q-tab name="settings" label="설정" icon="settings" />
    </q-tabs>

    <q-tab-panels v-model="rightMainTab" animated keep-alive class="col right-main-panels">
      <q-tab-panel name="canvas" class="q-pa-none right-panel-inner">
        <div class="panel-scroll-area">
          <div class="nexion-panel-padding">
            <q-expansion-item icon="map" label="미니맵" caption="줌 컨트롤 · 전체 보기" default-opened>
              <div class="nexion-accordion-content">
                <div class="nexion-map-toolbar row items-center no-wrap q-mb-xs">
                  <span class="text-subtitle2 text-weight-bold nexion-map-toolbar__label">miniMap</span>
                  <div ref="controlsHostRef" id="nexion-controls-host" class="nexion-controls-host" />
                </div>
                <div ref="minimapHostRef" id="nexion-minimap-host" class="nexion-minimap-host" />
              </div>
            </q-expansion-item>

            <q-expansion-item icon="flare" label="NIXIE 시뮬" caption="N-MAP 스냅샷 · 전역 닉시 반응 (체험)">
              <div class="nexion-accordion-content nexion-accordion-content--flush">
                <NixieDevControls embedded />
              </div>
            </q-expansion-item>

            <q-expansion-item icon="link" label="연결선" caption="선택 후 키 또는 버튼으로 끊기">
              <div class="nexion-accordion-content">
                <p class="text-caption text-grey-7 q-mb-sm">캔버스에서 <strong>연결선을 클릭</strong>해 선택한 뒤 <strong>Delete</strong> 또는 <strong>Backspace</strong>로 제거하거나, 아래 버튼을 사용합니다.</p>
                <template v-if="selectedEdgeId">
                  <div class="nexion-meta-plain q-mb-sm">
                    <div class="nexion-meta-plain__row">
                      <span class="nexion-meta-plain__label">연결 ID</span>
                      <span class="nexion-meta-plain__value text-mono">{{ selectedEdgeId }}</span>
                    </div>
                    <div v-if="selectedEdgePair" class="nexion-meta-plain__row">
                      <span class="nexion-meta-plain__label">출발 → 도착 (노드)</span>
                      <span class="nexion-meta-plain__value text-mono">{{ selectedEdgePair }}</span>
                    </div>
                  </div>
                  <q-btn outline color="negative" size="sm" class="full-width" label="이 연결 끊기" @click="removeSelectedEdge" />
                </template>
                <div v-else class="text-caption text-grey-6">선택된 연결선이 없습니다.</div>
              </div>
            </q-expansion-item>

            <q-expansion-item icon="label" label="노드 속성" caption="선택한 카드·그룹">
              <div class="nexion-accordion-content">
                <template v-if="selectedNode">
                  <q-input v-model="labelEdit" class="q-mb-sm" outlined dense label="표시 제목" @blur="commitLabel" @keyup.enter="commitLabel" />
                  <div class="nexion-meta-plain q-mb-md">
                    <div class="nexion-meta-plain__row">
                      <span class="nexion-meta-plain__label">노드 ID</span>
                      <span class="nexion-meta-plain__value text-mono">{{ selectedNode.id }}</span>
                    </div>
                    <div class="nexion-meta-plain__row">
                      <span class="nexion-meta-plain__label">유형</span>
                      <span class="nexion-meta-plain__value">{{ selectedNodeTypeLabel }}</span>
                    </div>
                    <div class="nexion-meta-plain__row nexion-meta-plain__row--stack">
                      <div class="nexion-meta-plain__label">Link ID (Phase 1 스텁)</div>
                      <div class="nexion-meta-plain__value text-mono">{{ selectedNode.data?.linkId || '—' }}</div>
                    </div>
                    <div v-if="selectedNode.parentNode" class="nexion-meta-plain__row">
                      <span class="nexion-meta-plain__label">부모</span>
                      <span class="nexion-meta-plain__value text-mono">{{ selectedNode.parentNode }}</span>
                    </div>
                  </div>

                  <q-btn outline color="negative" size="sm" class="full-width" label="이 노드 삭제" @click="removeCurrent" />

                  <p class="text-caption text-grey-7 q-mt-md">Late Anchoring·`doc_anchor`·영문 IR은 Phase 2~4에서 `[NXN] [UIUX]` §7에 맞춰 연결합니다.</p>
                </template>

                <div v-else class="text-caption text-grey-6">노드를 선택하면 Link ID와 제목을 여기서 다룹니다.</div>
              </div>
            </q-expansion-item>

            <q-expansion-item icon="settings" label="설정" caption="연결선·배경·미니맵 (저장됨)">
              <div class="nexion-accordion-content nexion-accordion-content--flush">
                <NexionFlowSettings embedded />
              </div>
            </q-expansion-item>
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel name="settings" class="q-pa-none right-panel-inner">
        <div class="panel-scroll-area">
          <div class="nexion-panel-padding">
            <q-expansion-item icon="settings" label="설정" caption="연결선·배경·미니맵 (저장됨)" default-opened>
              <div class="nexion-accordion-content nexion-accordion-content--flush">
                <NexionFlowSettings embedded />
              </div>
            </q-expansion-item>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import StandardRightHeader from '@frame/layout/components/StandardRightHeader.vue'
import NixieDevControls from '@system/nixie/components/NixieDevControls.vue'
import { useNexionFlowStore } from '@domains/nexion/modules/core/stores/nexionFlowStore'
import { setNexionControlsHost, setNexionMinimapHost } from '@domains/nexion/modules/core/utils/nexionMinimapHost'
import NexionFlowSettings from '@domains/settings/components/NexionFlowSettings.vue'

const $q = useQuasar()
const store = useNexionFlowStore()
const { nodes, edges, selectedNodeId, selectedEdgeId } = storeToRefs(store)

const rightMainTab = ref('canvas')

const rightHeaderTitle = computed(() => (rightMainTab.value === 'settings' ? '설정' : '캔버스'))
const rightHeaderSubtitle = computed(() => (rightMainTab.value === 'settings' ? '캔버스 표시 옵션' : '미니맵 · 노드 · 설정'))

const labelEdit = ref('')
const minimapHostRef = ref(null)
const controlsHostRef = ref(null)

const selectedNode = computed(() => {
  const id = selectedNodeId.value
  if (!id) return null
  return nodes.value.find((n) => n.id === id) ?? null
})

const selectedEdgePair = computed(() => {
  const id = selectedEdgeId.value
  if (!id) return ''
  const e = edges.value.find((x) => x.id === id)
  return e ? `${e.source} → ${e.target}` : ''
})

const selectedNodeTypeLabel = computed(() => {
  const n = selectedNode.value
  if (!n) return ''
  if (n.type === 'nexionGroup') return '그룹 (부모)'
  const hasChildren = nodes.value.some((x) => x.parentNode === n.id)
  return hasChildren ? '카드 (부모)' : '카드'
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

function removeSelectedEdge() {
  const id = selectedEdgeId.value
  if (!id) return
  store.removeEdge(id)
}
</script>

<style lang="scss" scoped>
.nexion-right-panel {
  height: 100%;
  min-height: 0;
  overflow: hidden;

  .right-main-tabs {
    flex-shrink: 0;
  }

  .right-main-panels {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .right-panel-inner {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .panel-scroll-area {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .nexion-panel-padding {
    padding: 3px;
  }

  .nexion-accordion-content {
    padding: 2px 0 8px;
  }

  .nexion-accordion-content--flush {
    padding-left: 0;
    padding-right: 0;
  }
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

.nexion-minimap-host {
  position: relative;
  width: 100%;
  aspect-ratio: 200 / 120;
  min-height: 100px;
  overflow: hidden;
  box-sizing: border-box;
  background: transparent;
}

/* 아코디언 카드(q-list bordered)와 겹쳐 보이지 않게 — 배경·테두리 없는 텍스트 리스트 */
.nexion-meta-plain {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 2px 0 0;
}

/* 한 행에 라벨(왼쪽) + 값(오른쪽) */
.nexion-meta-plain__row {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--nexa-border-color, rgba(0, 0, 0, 0.08));

  &:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }
}

.nexion-meta-plain__label {
  flex-shrink: 0;
  max-width: 46%;
  font-size: 11px;
  line-height: 1.35;
  color: var(--nexa-text-secondary, rgba(0, 0, 0, 0.55));
  font-weight: 500;
  letter-spacing: 0.02em;
}

.nexion-meta-plain__value {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  line-height: 1.35;
  color: var(--nexa-text-primary, inherit);
  text-align: right;
  word-break: break-all;
}

/* Link ID 등 앞으로 길어질 값 — 라벨 위·본문 아래(전체 너비) */
.nexion-meta-plain__row--stack {
  flex-direction: column;
  align-items: stretch;
  gap: 4px;

  .nexion-meta-plain__label {
    max-width: none;
  }

  .nexion-meta-plain__value {
    flex: none;
    text-align: left;
  }
}
</style>
