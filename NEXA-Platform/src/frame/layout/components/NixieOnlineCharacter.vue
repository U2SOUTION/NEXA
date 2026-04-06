<!--
  NIXIE 온라인 — 18×6 도트 HUD · N-MAP Pinia 구독 · GSAP 연출.
  시뮬 UI는 NixieDevControls.vue (우측 패널).
  명세: docs/Nexion/[NXN] [SPEC] 심플 닉시 GSAP 적용 UI 구현 v0.1.md
-->
<template>
  <div
    class="nixie-online"
    role="img"
    :aria-label="ariaLabel"
    data-nixie-mode="online-gsap"
    :class="{ 'nixie-online--dragging': dragging }"
    :style="positionStyle"
    @mousedown="onPointerDown"
    @touchstart="onTouchStart"
  >
    <div ref="tiltRef" class="nixie-online__tilt">
      <div
        ref="hudRef"
        class="nixie-online__hud"
        :class="{
          'nixie-online__hud--virtual': snapshot.is_virtual,
          'nixie-online__hud--reddish': isReddish,
          'nixie-online__hud--void': snapshot.how_state === 'VOID',
        }"
      >
        <div ref="gridRef" class="nixie-online__grid" aria-hidden="true">
          <span v-for="n in DOT_COUNT" :key="n" class="nixie-online__dot" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useNmapSnapshotStore } from '@system/store/nmapSnapshotStore'
import { storeToRefs } from 'pinia'
import gsap from 'gsap'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const COLS = 18
const ROWS = 6
const DOT_COUNT = COLS * ROWS

const W = 180
const H = 60
const STORAGE_KEY = 'nexa.nixie.online.position'

defineProps({
  ariaLabel: {
    type: String,
    default: 'NIXIE 온라인 캐릭터 (드래그하여 이동)',
  },
})

const nmapStore = useNmapSnapshotStore()
const { snapshot, nebulaPulse } = storeToRefs(nmapStore)

const tiltRef = ref(null)
const hudRef = ref(null)
const gridRef = ref(null)

const x = ref(0)
const y = ref(0)
const dragging = ref(false)

let dragStartX = 0
let dragStartY = 0
let originX = 0
let originY = 0

/** @type {gsap.core.Timeline | null} */
let luminaTl = null
/** @type {gsap.core.Timeline | null} */
let jitterAnim = null
let confusedTween = null

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max)
}

function maxX() {
  return Math.max(0, window.innerWidth - W)
}

function maxY() {
  return Math.max(0, window.innerHeight - H)
}

function defaultPosition() {
  const margin = 16
  return {
    x: Math.max(margin, window.innerWidth - W - margin),
    y: Math.max(margin, window.innerHeight - H - margin),
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

function getDots() {
  const root = gridRef.value
  if (!root) return []
  return Array.from(root.querySelectorAll('.nixie-online__dot'))
}

const isLowConfidence = computed(() => snapshot.value.confidence_score < snapshot.value.user_defined_threshold)

const isReddish = computed(() => {
  const s = snapshot.value
  return s.warn_token != null || (s.how_state === 'STUCK' && isLowConfidence.value)
})

function killLumina() {
  if (luminaTl) {
    luminaTl.kill()
    luminaTl = null
  }
}

function killJitter() {
  if (jitterAnim) {
    jitterAnim.kill()
    jitterAnim = null
  }
  const dots = getDots()
  gsap.set(dots, { x: 0, y: 0, clearProps: 'transform' })
}

function syncLumina() {
  killLumina()
  const dots = getDots()
  if (!dots.length) return

  const ent = snapshot.value.ui_entropy_mode
  if (ent === 'static') {
    gsap.set(dots, { opacity: 0.38 })
    return
  }
  if (ent === 'minimal') {
    gsap.set(dots, { opacity: 0.55 })
    luminaTl = gsap.timeline({ repeat: -1 })
    luminaTl.to(dots, { opacity: 0.4, duration: 1.2, ease: 'sine.inOut' })
    luminaTl.to(dots, { opacity: 0.62, duration: 1.2, ease: 'sine.inOut' })
    return
  }

  const pulse = snapshot.value.who_pulse
  const dur = pulse === 'WILL' ? 1.1 : pulse === 'ECHO' ? 1.7 : 2.3

  gsap.set(dots, { opacity: 0.35 })
  luminaTl = gsap.timeline({ repeat: -1 })
  luminaTl.to(dots, {
    opacity: 0.92,
    duration: dur * 0.45,
    stagger: { each: 0.015, from: 'random' },
    ease: 'sine.inOut',
  })
  luminaTl.to(dots, {
    opacity: 0.28,
    duration: dur * 0.55,
    stagger: { each: 0.012, from: 'random' },
    ease: 'sine.inOut',
  })
}

function syncJitter() {
  killJitter()
  const dots = getDots()
  if (!dots.length) return

  const ent = snapshot.value.ui_entropy_mode
  if (ent !== 'full') return

  const s = snapshot.value
  const need =
    s.confidence_score < s.user_defined_threshold || s.how_state === 'STUCK' || s.who_pulse === 'ASK'

  if (!need) return

  const tl = gsap.timeline({ repeat: -1, repeatRefresh: true })
  tl.to(dots, {
    x: () => gsap.utils.random(-2.2, 2.2),
    y: () => gsap.utils.random(-2.2, 2.2),
    duration: 0.12,
    stagger: { each: 0.006 },
    ease: 'sine.inOut',
  })
  tl.to(dots, {
    x: 0,
    y: 0,
    duration: 0.14,
    stagger: { each: 0.006 },
    ease: 'sine.inOut',
  })
  jitterAnim = tl
}

function syncConfused() {
  if (confusedTween) {
    confusedTween.kill()
    confusedTween = null
  }
  const el = tiltRef.value
  if (!el) return

  const s = snapshot.value
  const on =
    s.warn_token === 'ADAPTER_TIMEOUT' || (s.how_state === 'STUCK' && isLowConfidence.value)

  if (!on) {
    confusedTween = gsap.to(el, { rotation: 0, duration: 0.35, ease: 'power2.out' })
    return
  }

  confusedTween = gsap.to(el, {
    rotation: 12,
    duration: 0.45,
    ease: 'back.out(1.7)',
  })
}

function runNebulaPulse() {
  const dots = getDots()
  if (!dots.length) return
  const edge = dots.filter((_, i) => {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    return col === 0 || col === COLS - 1 || row === 0 || row === ROWS - 1
  })
  const tl = gsap.timeline()
  tl.fromTo(
    edge,
    { opacity: 0.15, scale: 0.6 },
    {
      opacity: 0.95,
      scale: 1,
      duration: 0.35,
      stagger: 0.02,
      ease: 'power2.out',
    },
  )
  tl.to(edge, { opacity: 0.45, duration: 0.5, ease: 'sine.inOut' })
}

function syncAllVisuals() {
  syncLumina()
  syncJitter()
  syncConfused()
}

watch(
  () => ({ ...snapshot.value }),
  () => {
    nextTick(syncAllVisuals)
  },
  { deep: true },
)

watch(nebulaPulse, () => {
  nextTick(runNebulaPulse)
})

const positionStyle = computed(() => ({
  left: `${x.value}px`,
  top: `${y.value}px`,
}))

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

onMounted(() => {
  const saved = loadPosition()
  const def = defaultPosition()
  x.value = saved ? saved.x : def.x
  y.value = saved ? saved.y : def.y
  applyBounds()
  window.addEventListener('resize', onResize)

  nextTick(() => {
    syncAllVisuals()
  })
})

onBeforeUnmount(() => {
  killLumina()
  killJitter()
  if (confusedTween) confusedTween.kill()
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
  padding: 4px;
  user-select: none;
  touch-action: none;
  cursor: grab;
}

.nixie-online--dragging {
  cursor: grabbing;
}

.nixie-online__tilt {
  width: 100%;
  height: 100%;
  transform-origin: 50% 60%;
}

.nixie-online__hud {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border-radius: 8px;
  border: 2px solid var(--nexa-border-color);
  background: var(--nexa-surface);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.12),
    inset 0 0 0 1px rgba(255, 180, 80, 0.25);
  overflow: hidden;
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}

.nixie-online__hud--virtual {
  border-style: dashed;
  opacity: 0.92;
}

.nixie-online__hud--reddish {
  border-color: rgba(220, 80, 60, 0.65);
  box-shadow:
    0 4px 18px rgba(200, 60, 40, 0.35),
    inset 0 0 0 1px rgba(255, 120, 80, 0.45);
}

.nixie-online__hud--void {
  filter: saturate(0.65);
}

.nixie-online__grid {
  display: grid;
  grid-template-columns: repeat(18, 1fr);
  grid-template-rows: repeat(6, 1fr);
  gap: 1px;
  width: 100%;
  height: 100%;
  padding: 3px;
  box-sizing: border-box;
}

.nixie-online__dot {
  display: block;
  border-radius: 1px;
  background: linear-gradient(180deg, #ffb347 0%, #ff8c00 55%, #c65d00 100%);
  box-shadow: 0 0 3px rgba(255, 160, 60, 0.55);
  opacity: 0.45;
  will-change: transform, opacity;
}

.nixie-online__hud--virtual .nixie-online__dot {
  opacity: 0.38;
  box-shadow: none;
  background: linear-gradient(180deg, rgba(255, 179, 71, 0.45) 0%, rgba(200, 120, 40, 0.35) 100%);
}
</style>
