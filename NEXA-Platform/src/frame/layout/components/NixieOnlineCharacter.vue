<!--
  NIXIE (온라인) — AI 협력 시스템 ↔ 사용자 소통 중간 역할 캐릭터 슬롯.
  뷰포트 고정 오버레이 + 드래그로 화면 내 임의 위치. 위치는 localStorage 에 유지.
  참고: docs/NIXIE ARCH 닉시 설계도.md
-->
<template>
  <div class="nixie-online" role="img" :aria-label="ariaLabel" data-nixie-mode="online-placeholder" :class="{ 'nixie-online--dragging': dragging }" :style="positionStyle" @mousedown="onPointerDown" @touchstart="onTouchStart">
    <span class="nixie-online__label">NIXIE</span>
    <span class="nixie-online__hint">online · 드래그 이동</span>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const SIZE = 100
const STORAGE_KEY = 'nexa.nixie.online.position'

defineProps({
  ariaLabel: {
    type: String,
    default: 'NIXIE 온라인 캐릭터 (드래그하여 이동)',
  },
})

const x = ref(0)
const y = ref(0)
const dragging = ref(false)

let dragStartX = 0
let dragStartY = 0
let originX = 0
let originY = 0

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max)
}

function maxX() {
  return Math.max(0, window.innerWidth - SIZE)
}

function maxY() {
  return Math.max(0, window.innerHeight - SIZE)
}

function defaultPosition() {
  const margin = 16
  return {
    x: Math.max(margin, window.innerWidth - SIZE - margin),
    y: Math.max(margin, window.innerHeight - SIZE - margin),
  }
}

function loadPosition() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    if (typeof p.x !== 'number' || typeof p.y !== 'number') return null
    return { x: p.x, y: p.y }
  } catch {
    return null
  }
}

function savePosition() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: x.value, y: y.value }))
  } catch {
    /* ignore */
  }
}

function applyBounds() {
  x.value = clamp(x.value, 0, maxX())
  y.value = clamp(y.value, 0, maxY())
}

function onPointerDown(e) {
  if (e.button !== 0) return
  dragging.value = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  originX = x.value
  originY = y.value
  window.addEventListener('mousemove', onPointerMove)
  window.addEventListener('mouseup', onPointerUp)
  e.preventDefault()
}

function onPointerMove(e) {
  if (!dragging.value) return
  const dx = e.clientX - dragStartX
  const dy = e.clientY - dragStartY
  x.value = clamp(originX + dx, 0, maxX())
  y.value = clamp(originY + dy, 0, maxY())
}

function onPointerUp() {
  if (!dragging.value) return
  dragging.value = false
  window.removeEventListener('mousemove', onPointerMove)
  window.removeEventListener('mouseup', onPointerUp)
  savePosition()
}

let touchId = null

function onTouchStart(e) {
  if (e.touches.length !== 1) return
  const t = e.touches[0]
  touchId = t.identifier
  dragging.value = true
  dragStartX = t.clientX
  dragStartY = t.clientY
  originX = x.value
  originY = y.value
  window.addEventListener('touchmove', onTouchMove, { passive: false })
  window.addEventListener('touchend', onTouchEnd)
  window.addEventListener('touchcancel', onTouchEnd)
}

function onTouchMove(e) {
  if (!dragging.value || touchId === null) return
  const t = Array.from(e.touches).find((i) => i.identifier === touchId)
  if (!t) return
  e.preventDefault()
  const dx = t.clientX - dragStartX
  const dy = t.clientY - dragStartY
  x.value = clamp(originX + dx, 0, maxX())
  y.value = clamp(originY + dy, 0, maxY())
}

function onTouchEnd(e) {
  const oursEnded = Array.from(e.changedTouches || []).some((t) => t.identifier === touchId)
  if (!oursEnded) return
  touchId = null
  dragging.value = false
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('touchend', onTouchEnd)
  window.removeEventListener('touchcancel', onTouchEnd)
  savePosition()
}

function onResize() {
  applyBounds()
  savePosition()
}

const positionStyle = computed(() => ({
  left: `${x.value}px`,
  top: `${y.value}px`,
}))

onMounted(() => {
  const saved = loadPosition()
  const def = defaultPosition()
  x.value = saved ? saved.x : def.x
  y.value = saved ? saved.y : def.y
  applyBounds()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('mousemove', onPointerMove)
  window.removeEventListener('mouseup', onPointerUp)
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('touchend', onTouchEnd)
  window.removeEventListener('touchcancel', onTouchEnd)
})
</script>

<style scoped lang="scss">
.nixie-online {
  position: fixed;
  z-index: 5000;
  width: 180px;
  height: 60px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px;
  border: 2px dashed var(--nexa-border-color);
  border-radius: 8px;
  background: var(--nexa-surface);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.12),
    inset 0 0 0 1px var(--nexa-border-color);
  color: var(--nexa-text-secondary);
  user-select: none;
  touch-action: none;
  cursor: grab;

  &:hover {
    border-color: var(--nexa-primary);
  }
}

.nixie-online--dragging {
  cursor: grabbing;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.18),
    inset 0 0 0 1px var(--nexa-primary);
}

.nixie-online__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--nexa-primary);
}

.nixie-online__hint {
  font-size: 8px;
  line-height: 1.2;
  opacity: 0.75;
  text-transform: lowercase;
  text-align: center;
}
</style>
