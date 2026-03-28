<template>
  <!-- useVueFlow 컨텍스트 유지용( display:none 금지 — 일부 환경에서 이벤트 구독이 약해질 수 있음 ) -->
  <div class="nexion-flow-hooks" aria-hidden="true" />
</template>

<script setup>
import { watch, onMounted, onUnmounted, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useVueFlow } from '@vue-flow/core'
import { useNexionFlowStore } from '@domains/nexion/modules/core/stores/nexionFlowStore'

const { viewport, screenToFlowCoordinate, fitView } = useVueFlow()
const store = useNexionFlowStore()
const { pendingFitNodeId } = storeToRefs(store)

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
    updateSpawnFromViewport()
  },
  { immediate: true },
)

watch(
  () => [viewport.value.x, viewport.value.y],
  () => updateSpawnFromViewport(),
)

watch(pendingFitNodeId, (id) => {
  if (!id) return
  nextTick(() => {
    fitView({ nodes: [id], duration: 380, padding: 0.32 })
    store.consumePendingFitView()
  })
})

onMounted(() => {
  updateSpawnFromViewport()
  scheduleBindPane()
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
