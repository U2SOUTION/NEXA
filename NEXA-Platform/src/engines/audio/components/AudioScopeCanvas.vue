<template>
  <div ref="hostEl" class="audio-scope-canvas">
    <canvas ref="canvasEl" class="audio-scope-canvas__el" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  pullBytes: { type: Function, required: true },
  lineColor: { type: String, default: '#66bb6a' },
  gridColor: { type: String, default: 'rgba(255,255,255,0.24)' },
  backgroundColor: { type: String, default: 'rgba(0,0,0,0)' },
})

const hostEl = ref(null)
const canvasEl = ref(null)
const scopeBytes = new Uint8Array(512)
let rafId = 0
let ro = null

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

  const mid = Math.floor(h * 0.5)
  ctx.strokeStyle = props.gridColor
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, mid + 0.5)
  ctx.lineTo(w, mid + 0.5)
  ctx.stroke()

  const hasData = props.pullBytes(scopeBytes)
  if (!hasData || !props.active) {
    rafId = window.requestAnimationFrame(drawFrame)
    return
  }

  ctx.strokeStyle = props.lineColor
  ctx.lineWidth = 1.5
  ctx.beginPath()
  const len = scopeBytes.length
  for (let i = 0; i < len; i += 1) {
    const x = (i / (len - 1)) * w
    const y = (scopeBytes[i] / 255) * h
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

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
}

.audio-scope-canvas__el {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 6px;
}
</style>
