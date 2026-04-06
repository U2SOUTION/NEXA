<!--
  NIXIE 온라인 — 24×7 도트 HUD · N-MAP Pinia 구독 · GSAP 연출.
  시뮬 UI는 NixieDevControls.vue (우측 패널).
  명세: docs/Nexion/[NXN] [SPEC] 심플 닉시 GSAP 적용 UI 구현 v0.1.md
-->
<template>
  <div ref="rootEl" class="nixie-online" role="img" :aria-label="ariaLabel" data-nixie-mode="online-gsap" :class="{ 'nixie-online--dragging': dragging }" :style="positionStyle" @mousedown="onPointerDown" @touchstart="onTouchStart">
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
        <div class="nixie-online__grid-mask">
          <!-- 18:7 비율로 트랙 영역을 고정 → gap 제외 시 각 셀 정사각형 -->
          <div class="nixie-online__grid-aspect" :style="{ aspectRatio: `${COLS} / ${ROWS}` }">
            <div ref="gridRef" class="nixie-online__grid" :style="gridTemplateStyle" aria-hidden="true">
              <span v-for="i in dotIndices" :key="i" class="nixie-online__dot" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { mapUppercaseTextToHudDots, NIXIE_GRID_COLS as COLS, NIXIE_GRID_ROWS as ROWS } from '@system/nixie/nixieUppercaseDotMap'
import { useNmapSnapshotStore } from '@system/store/nmapSnapshotStore'
import { storeToRefs } from 'pinia'
import gsap from 'gsap'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const DOT_COUNT = COLS * ROWS
/** Vue `v-for="n in NUMBER"`는 변수일 때 범위 반복이 안 될 수 있어 인덱스 배열로 고정 */
const dotIndices = Array.from({ length: DOT_COUNT }, (_, i) => i)

const gridTemplateStyle = {
  gridTemplateColumns: `repeat(${COLS}, 1fr)`,
  gridTemplateRows: `repeat(${ROWS}, 1fr)`,
}

/**
 * HUD 바깥 가로(px). 240×(7/24) 그리드 비율로 세로는 자동 — 180 대비 가로만 넓히고
 * 그리드 높이(비율 영역)는 약 70px로 이전 18×7·180폭 때와 유사.
 */
const W = 240
const STORAGE_KEY = 'nexa.nixie.online.position'

defineProps({
  ariaLabel: {
    type: String,
    default: 'NIXIE 온라인 캐릭터 (드래그하여 이동)',
  },
})

const nmapStore = useNmapSnapshotStore()
const { snapshot, nebulaPulse } = storeToRefs(nmapStore)

const rootEl = ref(null)
const tiltRef = ref(null)
const hudRef = ref(null)
const gridRef = ref(null)
/** 실제 렌더 높이(비율·패딩 반영) — 드래그 경계용 */
const frameHeight = ref(88)
let frameResizeObserver = null

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
  return Math.max(0, window.innerHeight - frameHeight.value)
}

function defaultPosition() {
  const margin = 16
  const fh = frameHeight.value > 0 ? frameHeight.value : Math.round((W * ROWS) / COLS) + 24
  return {
    x: Math.max(margin, window.innerWidth - W - margin),
    y: Math.max(margin, window.innerHeight - fh - margin),
  }
}

function measureFrame() {
  const el = rootEl.value
  if (!el) return
  const h = el.offsetHeight
  if (h > 0) frameHeight.value = h
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

/** 시뮴 텍스트가 있으면 길이 DOT_COUNT(24×7) 의 on/off 마스크, 없으면 null */
function getDemoTextMask() {
  const raw = snapshot.value.demo_hud_text ?? ''
  if (!String(raw).trim()) return null
  const scroll = Number(snapshot.value.demo_hud_scroll_offset ?? 0)
  return mapUppercaseTextToHudDots(raw, Number.isFinite(scroll) ? scroll : 0)
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

  /* 이전 타임라인에서 남은 inline opacity 가 CSS(특히 스코프·모디파이어)와 엇갈리지 않게 초기화 */
  gsap.set(dots, { clearProps: 'opacity' })

  const mask = getDemoTextMask()
  const ent = snapshot.value.ui_entropy_mode

  if (mask) {
    const offDots = dots.filter((_, i) => !mask[i])
    const litDots = dots.filter((_, i) => mask[i])
    gsap.set(offDots, { opacity: 0.06 })
    if (!litDots.length) return

    if (ent === 'static') {
      gsap.set(litDots, { opacity: 0.55 })
      return
    }
    if (ent === 'minimal') {
      gsap.set(litDots, { opacity: 0.58 })
      luminaTl = gsap.timeline({ repeat: -1 })
      luminaTl.to(litDots, { opacity: 0.48, duration: 1.2, ease: 'sine.inOut' })
      luminaTl.to(litDots, { opacity: 0.72, duration: 1.2, ease: 'sine.inOut' })
      return
    }

    const pulse = snapshot.value.who_pulse
    const dur = pulse === 'WILL' ? 1.1 : pulse === 'ECHO' ? 1.7 : 2.3
    gsap.set(litDots, { opacity: 0.45 })
    luminaTl = gsap.timeline({ repeat: -1 })
    luminaTl.to(litDots, {
      opacity: 0.92,
      duration: dur * 0.45,
      stagger: { each: 0.015, from: 'random' },
      ease: 'sine.inOut',
    })
    luminaTl.to(litDots, {
      opacity: 0.38,
      duration: dur * 0.55,
      stagger: { each: 0.012, from: 'random' },
      ease: 'sine.inOut',
    })
    return
  }

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
  const need = s.confidence_score < s.user_defined_threshold || s.how_state === 'STUCK' || s.who_pulse === 'ASK'

  if (!need) return

  const mask = getDemoTextMask()
  const targets = mask ? dots.filter((_, i) => mask[i]) : dots
  if (!targets.length) return

  const tl = gsap.timeline({ repeat: -1, repeatRefresh: true })
  tl.to(targets, {
    x: () => gsap.utils.random(-2.2, 2.2),
    y: () => gsap.utils.random(-2.2, 2.2),
    duration: 0.12,
    stagger: { each: 0.006 },
    ease: 'sine.inOut',
  })
  tl.to(targets, {
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
  const on = s.warn_token === 'ADAPTER_TIMEOUT' || (s.how_state === 'STUCK' && isLowConfidence.value)

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

watch(
  () => [snapshot.value.demo_hud_text ?? '', snapshot.value.demo_hud_scroll_offset ?? 0],
  () => {
    nextTick(syncAllVisuals)
  },
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
  measureFrame()
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
    measureFrame()
    applyBounds()
    syncAllVisuals()
    if (rootEl.value) {
      frameResizeObserver = new ResizeObserver(() => {
        measureFrame()
        applyBounds()
      })
      frameResizeObserver.observe(rootEl.value)
    }
  })
})

onBeforeUnmount(() => {
  frameResizeObserver?.disconnect()
  frameResizeObserver = null
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
/* 온라인 닉시 캐릭터 컨테이너 스타일 */
.nixie-online {
  position: fixed;
  z-index: 5000;
  width: 240px;
  height: auto;
  box-sizing: border-box;
  padding: 4px;
  user-select: none;
  touch-action: none;
  cursor: grab;
}

/* 드래그 중 커서 스타일 */
.nixie-online--dragging {
  cursor: grabbing;
}

/* 온라인 닉시 캐릭터 틸트 스타일 */
.nixie-online__tilt {
  width: 100%;
  height: 100%;
  transform-origin: 50% 60%;
}

/* 온라인 닉시 캐릭터 컨테이너 스타일 */
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
  display: flex;
  flex-direction: column;
  transition:
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

/* 코너 패딩이 시각적으로 균일해지도록 그리드를 외곽 라운드보다 안쪽에서 한 번 더 클립 */
.nixie-online__grid-mask {
  flex: 0 0 auto;
  width: 100%;
  min-width: 0;
  min-height: 0;
  margin: 0.5px;
  padding: 2px;
  box-sizing: border-box;
  border-radius: 5px;
  overflow: hidden;
}

/* 열:행 = COLS:ROWS → 1fr 트랙 정사각형 */
.nixie-online__grid-aspect {
  width: 100%;
  height: auto;
  min-height: 0;
  overflow: hidden;
  border-radius: 4px;
}

/* 가상 실행 고스트 레이어 스타일 */
.nixie-online__hud--virtual {
  border-style: dashed;
  opacity: 0.92;
}

/* 빨간색 경고 도트 스타일 */
.nixie-online__hud--reddish {
  border-color: rgba(220, 80, 60, 0.65);
  box-shadow:
    0 4px 18px rgba(200, 60, 40, 0.35),
    inset 0 0 0 1px rgba(255, 120, 80, 0.45);
}

/* 빈 영역 도트 스타일 */
.nixie-online__hud--void {
  filter: saturate(0.65);
}

/* 도트 그리드 — 2px gap: 정수 픽셀로 모니터/DPR에 덜 끌림 (1px보다 안정적) */
.nixie-online__grid {
  display: grid;
  gap: 0.8px;
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;
  padding: 0;
  box-sizing: border-box;
  contain: layout;
  transform: translateZ(0);
}

/* 도트 스타일 */
.nixie-online__dot {
  display: block;
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  border-radius: 1px;
  background: linear-gradient(180deg, #ffb347 0%, #f38807 55%, #dc8437 100%);
  box-shadow:
    0 0 3px rgba(255, 160, 60, 0.55),
    inset 0 0 0 1px rgba(0, 0, 0, 0.22);
  opacity: 0.45;
  will-change: transform, opacity;
}

/* 가상 실행 고스트 레이어 도트 스타일 */
.nixie-online__hud--virtual .nixie-online__dot {
  opacity: 0.38;
  box-shadow: none;
  background: linear-gradient(180deg, rgba(255, 179, 71, 0.45) 0%, rgba(200, 120, 40, 0.35) 100%);
}
</style>
