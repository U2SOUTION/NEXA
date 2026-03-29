<template>
  <div class="nexion-canvas-view">
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :apply-default="false"
      :node-types="nodeTypes"
      :default-edge-options="nexionFlowStore.defaultEdgeOptions"
      :connection-line-style="nexionConnectionLineStyle"
      :min-zoom="nflowMinZoom"
      :max-zoom="nflowMaxZoom"
      :connection-radius="nexionUi.connectionRadius"
      :delete-key-code="nexionDeleteKeyCodes"
      :multi-selection-key-code="nexionMultiSelectionKeys"
      :zoom-on-double-click="false"
      :nodes-connectable="true"
      :is-valid-connection="isNexionValidConnection"
      :elevate-edges-on-select="true"
      fit-view-on-init
      class="nexion-vue-flow"
      :style="nexionFlowCssVars"
      @connect="onNexionConnectWrapped"
      @connect-start="onNexionConnectStart"
      @connect-end="onNexionConnectEnd"
      @nodes-change="nexionFlowStore.onNodesChange"
      @edges-change="onNexionEdgesChangeWrapped"
      @error="onNexionVueFlowError"
      @node-click="onNodeClick"
      @edge-click="onNexionEdgeClick"
      @pane-click="onNexionPaneClick"
    >
      <Teleport :to="nexionControlsHostEl" :disabled="controlsTeleportDisabled">
        <Controls />
      </Teleport>
      <Teleport :to="nexionMinimapHostEl" :disabled="minimapTeleportDisabled">
        <MiniMap class="nexion-minimap-teleported" pannable zoomable :width="minimapWidth" :height="minimapHeight" :mask-color="minimapMaskColor" :mask-stroke-color="minimapMaskStrokeColor" :node-color="minimapNodeColor" :node-stroke-color="minimapNodeStrokeColor" />
      </Teleport>
      <NexionFlowHooks />
    </VueFlow>

    <div class="nexion-canvas-view__hint text-caption">
      <strong>빈 바탕</strong> 더블클릭: 카드 추가 · <strong>카드 선택</strong>: 중앙 정렬 + 필요 시 줌 인 · 박스·폰트 비율 유지(전체 텍스트) · 연결은 <strong>오른쪽 핸들(out)</strong>에서 끌어 <strong>왼쪽 핸들(in)</strong>에 놓기 · <strong>연결선</strong> 클릭 시 강조 · 여러 개는 <strong>Ctrl</strong>/<strong>⌘</strong>+클릭 ·
      <strong>Delete</strong>/<strong>Backspace</strong>로 끊기 · 휠: 줌 · 드래그: 팬 · <strong>빈 바탕 클릭</strong> 시 선택 해제
    </div>
  </div>
</template>

<script setup>
import { computed, markRaw, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { VueFlow } from '@vue-flow/core'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { storeToRefs } from 'pinia'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

import { useNexionFlowStore } from '@domains/nexion/modules/core/stores/nexionFlowStore'
import { useUserSettingsStore } from '@system/store/userSettingsStore'
import { isNexionFlowDebug, nxnDiag, printNexionFlowDebugHintOnce } from '@domains/nexion/modules/core/utils/nexionFlowDebug'
import NexionCardNode from './nodes/NexionCardNode.vue'
import NexionGroupNode from './nodes/NexionGroupNode.vue'
import NexionFlowHooks from './NexionFlowHooks.vue'
import { nexionControlsHostEl, nexionMinimapHostEl } from '@domains/nexion/modules/core/utils/nexionMinimapHost'

const nexionFlowStore = useNexionFlowStore()
const { nodes, edges } = storeToRefs(nexionFlowStore)

/** Vue Flow 뷰포트 한계 — 이전 0.15~2 는 프랙탈 줌에 너무 좁음(브라우저·부동소수 실질 한계 내 최대한 넓게) */
const nflowMinZoom = 0.002
const nflowMaxZoom = 256
const userSettings = useUserSettingsStore()
const { settings: userSettingsRef } = storeToRefs(userSettings)
const $q = useQuasar()

const nexionUi = computed(() => userSettingsRef.value.nexionFlow)

/** 코어 기본은 Backspace만 — Delete도 허용 */
const nexionDeleteKeyCodes = ['Backspace', 'Delete']

/** Vue Flow 기본과 동일 — Windows/Linux는 Ctrl, macOS는 ⌘ 로 멀티 선택 */
const nexionMultiSelectionKeys = ['Control', 'Meta']

const canvasBgResolved = computed(() => {
  const c = nexionUi.value.canvasBgColor?.trim()
  return c || 'var(--nexa-background, #ececec)'
})

const nexionFlowCssVars = computed(() => {
  const n = nexionUi.value
  const baseW = Number(n.edgeStrokeWidth)
  const selectedW = Number.isFinite(baseW) ? Math.min(5, Math.round(baseW * 1.45 * 10) / 10) : 3
  const edgeStroke = n.edgeStrokeColor?.trim() || '#1976d2'
  const connStroke = n.connectionStrokeColor?.trim() || '#1976d2'
  const selectedStroke = n.edgeSelectedStrokeColor?.trim() || connStroke
  return {
    '--nxn-edge-stroke': edgeStroke,
    '--nxn-edge-width': String(n.edgeStrokeWidth),
    '--nxn-edge-selected-stroke': selectedStroke,
    '--nxn-edge-selected-width': String(selectedW),
    '--nxn-conn-stroke': connStroke,
    '--nxn-conn-width': String(n.connectionStrokeWidth),
    '--nxn-canvas-bg': canvasBgResolved.value,
    '--nxn-card-title-fs': `${n.cardTitleFontPx}px`,
    '--nxn-card-body-fs': `${n.cardBodyFontPx}px`,
    '--nxn-card-footer-fs': `${n.cardFooterFontPx}px`,
  }
})

/** 드래그로 연결하는 동안만 보이는 임시 선 — 코어에 스타일을 직접 넘겨 CSS 변수만으로 덮이지 않는 경우 대비 */
const nexionConnectionLineStyle = computed(() => {
  const n = nexionUi.value
  return {
    stroke: n.connectionStrokeColor?.trim() || '#1976d2',
    strokeWidth: n.connectionStrokeWidth,
  }
})

function minimapColorOrAuto(saved, darkFallback, lightFallback) {
  const t = saved?.trim()
  if (t) return t
  return $q.dark.isActive ? darkFallback : lightFallback
}

const minimapMaskColor = computed(() => minimapColorOrAuto(nexionUi.value.minimapMaskColor, 'rgba(255, 255, 255, 0.08)', 'rgba(0, 0, 0, 0.08)'))
const minimapMaskStrokeColor = computed(() => minimapColorOrAuto(nexionUi.value.minimapMaskStrokeColor, 'rgba(255, 255, 255, 0.2)', 'rgba(0, 0, 0, 0.18)'))
const minimapNodeColor = computed(() => minimapColorOrAuto(nexionUi.value.minimapNodeColor, 'rgba(100, 181, 246, 0.4)', 'rgba(25, 118, 210, 0.35)'))
const minimapNodeStrokeColor = computed(() => minimapColorOrAuto(nexionUi.value.minimapNodeStrokeColor, 'rgba(144, 202, 249, 0.65)', 'rgba(25, 118, 210, 0.85)'))

/** 우측 호스트 없을 때(캔버스 코너) 기본 크기 */
const MINIMAP_FLOAT_W = 200
const MINIMAP_FLOAT_H = 120

const minimapWidth = ref(MINIMAP_FLOAT_W)
const minimapHeight = ref(MINIMAP_FLOAT_H)

/** 대상이 없거나 언마운트 직전에 비워졌을 때는 캔버스 안에 렌더( Teleport 비활성 ) */
const minimapTeleportDisabled = computed(() => nexionMinimapHostEl.value == null)
const controlsTeleportDisabled = computed(() => nexionControlsHostEl.value == null)

let minimapResizeObserver = null

function setMinimapDimensions(w, h) {
  const iw = Math.max(64, Math.round(w))
  const ih = Math.max(48, Math.round(h))
  minimapWidth.value = iw
  minimapHeight.value = ih
}

watch(
  nexionMinimapHostEl,
  (el) => {
    minimapResizeObserver?.disconnect()
    minimapResizeObserver = null

    if (!el) {
      setMinimapDimensions(MINIMAP_FLOAT_W, MINIMAP_FLOAT_H)
      return
    }

    minimapResizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? {}
      if (width == null || width < 4) return
      const h = height != null && height >= 4 ? height : width * (MINIMAP_FLOAT_H / MINIMAP_FLOAT_W)
      setMinimapDimensions(width, h)
    })
    minimapResizeObserver.observe(el)
    const r = el.getBoundingClientRect()
    if (r.width >= 4) {
      const h = r.height >= 4 ? r.height : r.width * (MINIMAP_FLOAT_H / MINIMAP_FLOAT_W)
      setMinimapDimensions(r.width, h)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  minimapResizeObserver?.disconnect()
  minimapResizeObserver = null
})

const NXN_LOG = import.meta.env.DEV

const nodeTypes = {
  nexionCard: markRaw(NexionCardNode),
  nexionGroup: markRaw(NexionGroupNode),
}

/**
 * Why Chain: 드래그 연결은 out → in 만 허용.
 *
 * Vue Flow는 `v-model:edges` → `setEdges` → `createGraphEdges`에서 **같은** `isValidConnection`으로 엣지를 다시 검사함.
 * 이 경로의 Edge는 `parseEdge`/내부 상태 때문에 핸들·타입이 드래그 시 Connection과 달라져 거짓으로 걸러지는 경우가 있어,
 * **`id`가 있는 엣지**(이미 @connect·Pinia에 반영된 것)는 source≠target이면 재검증 통과시킴.
 * 드래그 중 Connection은 보통 `id`가 없음.
 *
 * `localStorage nexion-flow-debug=1` 이면 거부 시 사유 로그.
 */
function isNexionValidConnection(conn, ctx) {
  if (!conn?.source || !conn?.target) return false

  if (conn.source === conn.target) {
    if (isNexionFlowDebug()) {
      nxnDiag('isValidConnection → 거부', {
        reason: 'same-node',
        source: conn.source,
        handles: { sourceHandle: conn.sourceHandle, targetHandle: conn.targetHandle },
      })
    }
    return false
  }

  /* v-model 동기화 시 들어오는 Edge — 내부 재검증만 실패하는 케이스 방지 */
  if (conn.id != null && String(conn.id) !== '') {
    return true
  }

  const sh = conn.sourceHandle
  const th = conn.targetHandle
  if (sh === 'out' && th === 'in') return true

  const missingHandles = sh == null || sh === '' || th == null || th === ''
  if (!missingHandles) {
    if (isNexionFlowDebug()) {
      nxnDiag('isValidConnection → 거부', {
        reason: 'wrong-handle-pair',
        sourceHandle: sh,
        targetHandle: th,
        source: conn.source,
        target: conn.target,
      })
    }
    return false
  }

  const okType = (t) => t === 'nexionCard' || t === 'nexionGroup'
  const sn = ctx?.sourceNode
  const tn = ctx?.targetNode
  if (sn && tn && okType(sn.type) && okType(tn.type)) return true

  if (isNexionFlowDebug()) {
    nxnDiag('isValidConnection → 거부', {
      reason: 'missing-handles-and-type-fallback-failed',
      sourceHandle: sh,
      targetHandle: th,
      sourceType: sn?.type,
      targetType: tn?.type,
      source: conn.source,
      target: conn.target,
    })
  }
  return false
}

async function onNexionConnectWrapped(conn) {
  nexionFlowStore.onConnect(conn)
  if (!NXN_LOG) return
  /* v-model·페인트 이후 DOM 반영 */
  await nextTick()
  await nextTick()
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))

  const piniaCount = edges.value.length
  const domLayers = document.querySelectorAll('.nexion-vue-flow .vue-flow__edge').length
  const domPaths = document.querySelectorAll('.nexion-vue-flow .vue-flow__edge-path').length
  const edgeSummaries = edges.value.map((e) => ({
    id: e.id,
    s: e.source,
    t: e.target,
    sh: e.sourceHandle,
    th: e.targetHandle,
  }))

  console.log('[NexionFlow] 동기화 점검(@connect 직후)', {
    piniaEdgeCount: piniaCount,
    domVueFlowEdgeDiv: domLayers,
    domEdgePath: domPaths,
    edges: edgeSummaries,
  })

  if (piniaCount > 0 && domLayers === 0) {
    console.warn('[NexionFlow] ⚠️ Pinia에 엣지는 있는데 DOM에 .vue-flow__edge가 없음 → createGraphEdges·isValidConnection 재검증 실패, 또는 렌더 지연/레이어')
  }

  if (isNexionFlowDebug()) {
    nxnDiag('연결 직후(상세)', { count: piniaCount, summaries: edges.value, domLayers, domPaths })
  }
}

function onNodeClick({ node }) {
  nexionFlowStore.selectNode(node.id)
}

function onNexionEdgeClick({ edge }) {
  if (edge?.id) nexionFlowStore.selectEdge(edge.id)
}

function onNexionPaneClick() {
  nexionFlowStore.clearUiSelection()
}

/** 연결 디버그: 콘솔 필터 `[NexionFlow]` */
function onNexionConnectStart(payload) {
  if (!NXN_LOG) return
  console.log('[NexionFlow] connectStart', payload)
}

function onNexionConnectEnd(event) {
  if (!NXN_LOG) return
  console.log('[NexionFlow] connectEnd', event)
}

function onNexionEdgesChangeWrapped(changes) {
  nexionFlowStore.onEdgesChange(changes)
  if (!NXN_LOG || !changes?.length) return
  const notable = changes.filter((c) => c.type === 'add' || c.type === 'remove')
  if (notable.length) {
    console.log('[NexionFlow] edgesChange (add/remove)', notable, 'full:', changes)
  }
  if (isNexionFlowDebug() && changes?.length) {
    nxnDiag('edges-change (전체)', changes)
  }
}

/**
 * Vue Flow 내부 검증 실패 시 `EDGE_*`, `NODE_*` 등 코드와 함께 올라옴.
 * DEV에서만 콘솔 — 프로덕션에서는 호출만 되고 로그 없음.
 */
function onNexionVueFlowError(err) {
  if (!NXN_LOG) return
  const code = err?.code ?? err?.name
  const isEdge = typeof code === 'string' && String(code).includes('EDGE')
  const bucket = isEdge || (typeof code === 'string' && String(code).includes('NODE')) ? '노드/엣지 검증·조회' : '기타'
  console.warn('[NexionFlow] vue-flow error', {
    code,
    message: err?.message,
    bucket,
    detail: err,
  })
  if (isNexionFlowDebug()) {
    nxnDiag('vue-flow error (상세)', {
      code,
      message: err?.message,
      stack: err?.stack,
      err,
    })
  }
}

onMounted(() => {
  printNexionFlowDebugHintOnce()
})
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

/* 이 블록은 scoped가 아님 — `:deep()`는 scoped 전용이라 여기서 쓰면 선택자가 무효가 되어 스타일이 전부 빠질 수 있음 */
.nexion-vue-flow .vue-flow__pane {
  cursor: grab;
  background: var(--nxn-canvas-bg, var(--nexa-background, #ececec));
}

.nexion-vue-flow .vue-flow__pane.selection-active {
  cursor: grabbing;
}

/*
 * 엣지 색은 인라인 stroke를 쓰지 않고 CSS만 사용 — 선택(`.selected`) 강조가 보이도록 함.
 * Vue Flow 코어 기본은 비선택 #b1b1b7·선택 #555 라서, 아래로 설정색을 덮어씀.
 */
.nexion-vue-flow .vue-flow__edge-path {
  stroke: var(--nxn-edge-stroke, #1976d2);
  stroke-width: var(--nxn-edge-width, 2);
  stroke-opacity: 1;
}

.nexion-vue-flow .vue-flow__edge.selected .vue-flow__edge-path,
.nexion-vue-flow .vue-flow__edge:focus-visible .vue-flow__edge-path {
  stroke: var(--nxn-edge-selected-stroke, var(--nxn-conn-stroke, #1976d2));
  stroke-width: var(--nxn-edge-selected-width, 3);
  stroke-opacity: 1;
}

.nexion-vue-flow .vue-flow__connection-path {
  stroke: var(--nxn-conn-stroke, #1976d2);
  stroke-width: var(--nxn-conn-width, 2);
  stroke-opacity: 1;
}

/*
 * 연결 드래그 중 `.vue-flow__connectionline`(z-index:1001)이 노드보다 위에 깔리고,
 * 기본 pointer-events가 auto라 마우스 업 시 elementFromPoint가 핸들이 아닌 이 레이어를 맞춤 → @connect 미발화.
 * 코어는 내부 .vue-flow__connection에만 pointer-events:none을 두므로 래퍼에 명시 필요.
 */
.nexion-vue-flow .vue-flow__connectionline {
  pointer-events: none;
}

/* 커스텀 노드 내부 본문이 핸들 위에 올라가는 경우 대비(카드/그룹에서도 개별 z-index 지정함) */
.nexion-vue-flow .vue-flow__node .vue-flow__handle {
  z-index: 10;
  pointer-events: auto;
}

/*
 * MiniMap Teleport 시 VueFlow 밖으로 나가므로 `.vue-flow__panel` 코너 고정을 풀고
 * 호스트 가로 100%에 맞춤. 배경은 투명·테마 톤(props + 투명 패널).
 */
#nexion-minimap-host .vue-flow__panel {
  position: relative;
  top: auto;
  right: auto;
  bottom: auto;
  left: auto;
  margin: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background: transparent;
}

#nexion-minimap-host .vue-flow__panel svg,
#nexion-minimap-host .vue-flow__minimap {
  display: block;
  width: 100%;
  height: 100%;
  max-width: 100%;
  background: transparent;
}

/* Controls: Map 라벨 오른쪽 가로 한 줄 */
#nexion-controls-host .vue-flow__panel {
  position: relative;
  top: auto;
  right: auto;
  bottom: auto;
  left: auto;
  margin: 0;
  width: auto;
  height: auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: nowrap;
  box-sizing: border-box;
  background: transparent;
}

#nexion-controls-host .vue-flow__controls {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
}

#nexion-controls-host .vue-flow__controls-button {
  width: 22px;
  height: 22px;
  min-width: 22px;
  padding: 0;
  background: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
  box-shadow: none;
}

#nexion-controls-host .vue-flow__controls-button:hover {
  background: var(--nexa-surface-hover);
}

#nexion-controls-host .vue-flow__controls-button svg {
  max-width: 12px;
  max-height: 12px;
  width: 12px;
  height: 12px;
  fill: currentColor;
  color: var(--nexa-text-secondary);
}

/* 텔레포트 안 될 때(캔버스 코너)에도 컨트롤이 다크 모드에서 어색하지 않도록 */
.nexion-vue-flow .vue-flow__controls-button {
  background: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
  box-shadow: none;
}

.nexion-vue-flow .vue-flow__controls-button:hover {
  background: var(--nexa-surface-hover);
}

.nexion-vue-flow .vue-flow__controls-button svg {
  fill: currentColor;
  color: var(--nexa-text-secondary);
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
