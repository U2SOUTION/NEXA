<template>
  <!-- useVueFlow 컨텍스트 유지용( display:none 금지 — 일부 환경에서 이벤트 구독이 약해질 수 있음 ) -->
  <div class="nexion-flow-hooks" aria-hidden="true" />
</template>

<script setup>
import { watch, onMounted, onUnmounted, nextTick, toRaw, triggerRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useVueFlow } from '@vue-flow/core'
import { useNexionFlowStore } from '@domains/nexion/modules/core/stores/nexionFlowStore'
import { useUserSettingsStore } from '@system/store/userSettingsStore'
import { isNexionFlowDebug, nxnDiag } from '@domains/nexion/modules/core/utils/nexionFlowDebug'

const {
  viewport,
  screenToFlowCoordinate,
  fitView,
  setCenter,
  findNode,
  updateNodeInternals,
  setEdges,
} = useVueFlow()
const store = useNexionFlowStore()
const { pendingFitNodeId, edges, nodes, selectedNodeId } = storeToRefs(store)
const userSettings = useUserSettingsStore()
const { settings: userSettingsRef } = storeToRefs(userSettings)

const PANE_SELECTOR = '.nexion-vue-flow .vue-flow__pane'

let paneEl = null
let paneRetryTimer = null

function bindPane() {
  paneEl = document.querySelector(PANE_SELECTOR)
  if (!paneEl) return false

  const onPaneDblClick = (e) => {
    if (e.target && typeof e.target.closest === 'function' && e.target.closest('.vue-flow__node')) {
      return
    }
    e.stopPropagation()
    const p = screenToFlowCoordinate({
      x: e.clientX,
      y: e.clientY,
    })
    store.addDocNode(p)
  }

  /* bubble만 사용: capture는 노드 클릭보다 먼저 와서 선택이 꼬일 수 있음 */
  paneEl.addEventListener('dblclick', onPaneDblClick)

  paneEl.__nexionOnPaneDblClick = onPaneDblClick
  return true
}

function unbindPane() {
  if (!paneEl) return
  if (paneEl.__nexionOnPaneDblClick) {
    paneEl.removeEventListener('dblclick', paneEl.__nexionOnPaneDblClick)
  }
  delete paneEl.__nexionOnPaneDblClick
  paneEl = null
}

function scheduleBindPane() {
  unbindPane()
  nextTick(() => {
    if (bindPane()) return
    let n = 0
    paneRetryTimer = window.setInterval(() => {
      n += 1
      if (bindPane() || n > 40) {
        clearInterval(paneRetryTimer)
        paneRetryTimer = null
      }
    }, 50)
  })
}

function updateSpawnFromViewport() {
  nextTick(() => {
    const el = document.querySelector('.nexion-vue-flow')
    if (!el) return
    const r = el.getBoundingClientRect()
    if (r.width < 32 || r.height < 32) return
    const p = screenToFlowCoordinate({
      x: r.left + r.width / 2,
      y: r.top + r.height / 2,
    })
    store.setSpawnFlowPosition(p)
  })
}

watch(
  () => viewport.value.zoom,
  (z) => {
    store.setViewportZoom(z)
    store.rebakeNestedCardFlowSizes(z)
    store.applyLodHiddenFlags(z)
    updateSpawnFromViewport()
    nextTick(() => updateNodeInternals())
  },
  { immediate: true },
)

watch(
  () => [viewport.value.x, viewport.value.y],
  () => updateSpawnFromViewport(),
)

function parseFlowPx(v, fallback) {
  if (typeof v !== 'string') return fallback
  const m = v.trim().match(/^([\d.]+)px$/i)
  if (!m) return fallback
  const n = Number(m[1])
  return Number.isFinite(n) ? n : fallback
}

/**
 * 카드 선택 시: 줌은 유지하고 해당 노드 중심만 뷰 중앙으로 팬.
 * (fitView 는 노드에 맞춰 줌이 튀어 과확대되는 경우가 많아 제외)
 */
watch(selectedNodeId, async (id) => {
  const pin = id ? nodes.value.find((n) => n.id === id) : undefined
  if (id && pin?.type === 'nexionCard') {
    await nextTick()
    await nextTick()
    const gn = typeof findNode === 'function' ? findNode(id) : null
    const z = viewport.value.zoom
    if (gn && gn.computedPosition) {
      const dw = gn.dimensions?.width
      const dh = gn.dimensions?.height
      const st = pin.style && typeof pin.style === 'object' && !Array.isArray(pin.style) ? pin.style : {}
      const fw = typeof dw === 'number' && dw > 0 ? dw : parseFlowPx(st.width, 280)
      const fh = typeof dh === 'number' && dh > 0 ? dh : parseFlowPx(st.height, 268)
      const cx = gn.computedPosition.x + fw / 2
      const cy = gn.computedPosition.y + fh / 2
      await setCenter(cx, cy, { zoom: z, duration: 260 })
    }
  }
  await nextTick()
  store.rebakeNestedCardFlowSizes(viewport.value.zoom)
  store.applyLodHiddenFlags(viewport.value.zoom)
  updateNodeInternals()
})

watch(pendingFitNodeId, (id) => {
  if (!id) return
  nextTick(() => {
    fitView({ nodes: [id], duration: 380, padding: 0.32 })
    store.consumePendingFitView()
  })
})

/**
 * 엣지 추가 시 핸들 bounds 갱신. `deep: true`로 edges를 보면 Vue Flow 내부가 엣지 객체를 자주 바꿔
 * updateNodeInternals ↔ 반응형이 무한에 가깝게 도는 경우가 있어 **id 시그니처만** 감시.
 */
function getEdgeLayoutSignature() {
  const nf = userSettingsRef.value.nexionFlow
  /** 엣지 스타일만 바뀌면 시그니처가 그대로라 setEdges가 안 불려 Vue Flow 내부가 갱신되지 않음 */
  const uiEdge = `${nf.edgeStrokeColor}|${nf.edgeStrokeWidth}`
  const edgesPart = edges.value
    .map((e) => [e.id, e.source, e.target, e.sourceHandle ?? '', e.targetHandle ?? ''].join(':'))
    .sort()
    .join('|')
  return `${uiEdge}@@${edgesPart}`
}

/** store 메서드 대신 동일 로직(프록시에 액션이 안 붙는 환경 대비) */
function syncEdgeStylesFromNexionUiNow() {
  const { edgeStrokeWidth } = userSettingsRef.value.nexionFlow
  const list = edges.value
  if (!list.length) return
  edges.value = list.map((e) => {
    const prev =
      e.style && typeof e.style === 'object' && !Array.isArray(e.style) ? { ...e.style } : {}
    delete prev.stroke
    return {
      ...e,
      style: {
        ...prev,
        strokeWidth: edgeStrokeWidth,
      },
    }
  })
  triggerRef(edges)
}

/**
 * 같은 화면에 머물 때 v-model만으로는 내부 store 엣지가 한 박자 늦거나 빠지는 경우가 있어
 * (다른 도메인 갔다 오면 리마운트로 복구되는 현상과 동일).
 * Pinia SSOT를 `setEdges`로 한 번 더 밀어 넣어 내부와 DOM을 맞춤.
 */
watch(
  () => getEdgeLayoutSignature(),
  async () => {
    /* 시그니처 watch가 store watch보다 먼저 돌 수 있어, setEdges 전에 스타일을 확실히 맞춤 */
    syncEdgeStylesFromNexionUiNow()
    await nextTick()
    const plain = edges.value.map((e) => ({ ...toRaw(e) }))
    setEdges(plain)
    await nextTick()
    updateNodeInternals()
    if (isNexionFlowDebug()) {
      const domEdges = document.querySelectorAll('.nexion-vue-flow .vue-flow__edge').length
      const domPaths = document.querySelectorAll('.nexion-vue-flow .vue-flow__edge-path').length
      nxnDiag('edges 시그니처 → setEdges + updateNodeInternals 후', {
        piniaEdgeCount: edges.value.length,
        domEdgeLayers: domEdges,
        domEdgePaths: domPaths,
      })
    }
  },
)

watch(
  () => nodes.value.length,
  () => {
    nextTick(() => updateNodeInternals())
  },
)

onMounted(() => {
  updateSpawnFromViewport()
  scheduleBindPane()
  /* 라우트 복귀 시 Pinia에만 엣지가 있는 초기 상태 동기화 */
  nextTick(async () => {
    if (!edges.value.length) return
    const plain = edges.value.map((e) => ({ ...toRaw(e) }))
    setEdges(plain)
    await nextTick()
    updateNodeInternals()
  })
})

onUnmounted(() => {
  if (paneRetryTimer != null) {
    clearInterval(paneRetryTimer)
    paneRetryTimer = null
  }
  unbindPane()
})
</script>

<style scoped>
.nexion-flow-hooks {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: -1;
}
</style>
