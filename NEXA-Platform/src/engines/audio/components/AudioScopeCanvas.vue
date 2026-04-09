<template>
  <div ref="hostEl" class="audio-scope-canvas">
    <canvas ref="canvasEl" class="audio-scope-canvas__el" />
    <!-- 보더 바로 아래: 꼭짓점이 캔버스 하단과 맞닿고 밑으로만 돌출(파형 영역 불변) -->
    <div v-show="playheadLeftPct != null" class="audio-scope-canvas__playhead-marker" :style="{ left: playheadLeftPct + '%' }" aria-hidden="true">
      <svg class="audio-scope-canvas__playhead-tri" :width="playheadTriangleBasePx" :height="triH" :viewBox="triViewBox" xmlns="http://www.w3.org/2000/svg">
        <polygon :points="triPoints" :fill="playheadFillColor" />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

/** AudioScopeCanvas 컴포넌트 속성 정의*/
const props = defineProps({
  active: { type: Boolean, default: false },
  pullBytes: { type: Function, required: true },
  /** 재생 진행 0~1 — 있으면 세로선 + 보더 아래 삼각형 */
  pullPlayheadProgress: { type: Function, default: null },
  lineColor: { type: String, default: '#66bb6a' },
  gridColor: { type: String, default: 'rgba(255,255,255,0.24)' },
  backgroundColor: { type: String, default: 'rgba(0,0,0,0)' },
  playheadLineColor: { type: String, default: 'rgba(189, 189, 189, 0.28)' },
  playheadFillColor: { type: String, default: '#ff0000' },
  /** 정삼각형 밑변 길이(px, CSS) — 높이는 자동(√3/2) */
  playheadTriangleBasePx: { type: Number, default: 4 },
})

const hostEl = ref(null)
const canvasEl = ref(null)
const scopeBytes = new Uint8Array(512)
/** 0~100, null 이면 플레이헤드 숨김 */
const playheadLeftPct = ref(null)
let rafId = 0
let ro = null

const triH = computed(() => (props.playheadTriangleBasePx * Math.sqrt(3)) / 2)
const triViewBox = computed(() => `0 0 ${props.playheadTriangleBasePx} ${triH.value}`)
const triPoints = computed(() => {
  const w = props.playheadTriangleBasePx
  const h = triH.value
  return `0,${h} ${w / 2},0 ${w},${h}`
})

function ensureCanvasSize() {
  const host = hostEl.value
  const canvas = canvasEl.value
  if (!host || !canvas) return
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
  const w = Math.max(1, Math.floor(host.clientWidth))
  const h = Math.max(1, Math.floor(host.clientHeight))
  canvas.width = Math.floor(w * dpr)
  canvas.height = Math.floor(h * dpr)
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
}

function drawFrame() {
  const canvas = canvasEl.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = props.backgroundColor
  ctx.fillRect(0, 0, w, h)

  const plotH = h
  const mid = plotH * 0.5

  ctx.strokeStyle = props.gridColor
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, mid + 0.5)
  ctx.lineTo(w, mid + 0.5)
  ctx.stroke()

  const hasData = props.pullBytes(scopeBytes)
  if (hasData && props.active) {
    const len = scopeBytes.length
    let sum = 0
    for (let i = 0; i < len; i += 1) sum += scopeBytes[i]
    const mean = sum / len
    let maxDev = 0
    for (let i = 0; i < len; i += 1) {
      maxDev = Math.max(maxDev, Math.abs(scopeBytes[i] - mean))
    }
    /** DC 제거 + 프레임 최대 편차로 정규화(무음 시 폭주 방지) */
    const norm = Math.max(maxDev, 8)
    const amp = plotH * 0.48

    ctx.strokeStyle = props.lineColor
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let i = 0; i < len; i += 1) {
      const x = (i / (len - 1)) * w
      const v = (scopeBytes[i] - mean) / norm
      let y = mid - v * amp
      if (y < 0) y = 0
      else if (y > plotH) y = plotH
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  const pullPh = props.pullPlayheadProgress
  if (typeof pullPh === 'function') {
    const p = pullPh()
    if (p != null && Number.isFinite(p)) {
      const t = Math.max(0, Math.min(1, p))
      const px = t * w
      ctx.strokeStyle = props.playheadLineColor
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(px + 0.5, 0)
      ctx.lineTo(px + 0.5, h)
      ctx.stroke()
      playheadLeftPct.value = t * 100
    } else {
      playheadLeftPct.value = null
    }
  } else {
    playheadLeftPct.value = null
  }

  rafId = window.requestAnimationFrame(drawFrame)
}

watch(
  () => props.active,
  () => {
    if (!rafId) rafId = window.requestAnimationFrame(drawFrame)
  },
)

onMounted(() => {
  ensureCanvasSize()
  ro = new ResizeObserver(() => ensureCanvasSize())
  if (hostEl.value) ro.observe(hostEl.value)
  rafId = window.requestAnimationFrame(drawFrame)
})

onBeforeUnmount(() => {
  if (rafId) {
    window.cancelAnimationFrame(rafId)
    rafId = 0
  }
  if (ro) {
    ro.disconnect()
    ro = null
  }
})
</script>

<style scoped lang="scss">
.audio-scope-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 48px;
  overflow: visible;
}

.audio-scope-canvas__el {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 6px;
}

.audio-scope-canvas__playhead-marker {
  position: absolute;
  top: 100%;
  transform: translateX(-50%);
  pointer-events: none;
  line-height: 0;
}

.audio-scope-canvas__playhead-tri {
  display: block;
}
</style>
