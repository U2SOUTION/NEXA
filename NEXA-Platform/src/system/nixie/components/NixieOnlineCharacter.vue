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
        :style="hudWarnStyle"
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
import { NIXIE_HUD_MARQUEE } from '@system/nixie/nixieHudMarqueeConfig'
import { mapHudTextToDots, normalizeDemoHudText, textFitsCompletelyInGrid, NIXIE_GRID_COLS as COLS, NIXIE_GRID_ROWS as ROWS } from '@system/nixie/nixieDotMap'
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

/** @type {ReturnType<typeof setInterval> | null} */
let hudMarqueeTimer = null

function syncHudMarqueeTimer() {
  if (hudMarqueeTimer != null) {
    clearInterval(hudMarqueeTimer)
    hudMarqueeTimer = null
  }
  const full = normalizeDemoHudText(snapshot.value.demo_hud_text ?? '')
  if (!full.length || textFitsCompletelyInGrid(full)) {
    nmapStore.tickDemoHudMarquee()
    return
  }
  nmapStore.tickDemoHudMarquee()
  const ms = Math.max(16, Math.floor(NIXIE_HUD_MARQUEE.intervalMs))
  hudMarqueeTimer = window.setInterval(() => {
    if (document.hidden) return
    nmapStore.tickDemoHudMarquee()
  }, ms)
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max)
}

/**
 * 신뢰도가 `user_defined_threshold`보다 아래로 얼마나 떨어졌는지 0~1.
 * 임계값 이상이면 0, 0에 가까울수록 1에 가깝게(선형).
 */
function confidenceRelativeThresholdStress(confidence, threshold) {
  const c = clamp(Number(confidence), 0, 100)
  const th = clamp(Number(threshold), 0, 100)
  if (c >= th) return 0
  const thSafe = Math.max(th, 1e-6)
  return clamp((th - c) / thSafe, 0, 1)
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
  const norm = normalizeDemoHudText(String(raw))
  if (!norm.length) return null
  const scroll = Number(snapshot.value.demo_hud_scroll_offset ?? 0)
  return mapHudTextToDots(norm, Number.isFinite(scroll) ? scroll : 0)
}

const thresholdStress = computed(() => confidenceRelativeThresholdStress(snapshot.value.confidence_score, snapshot.value.user_defined_threshold))

/** 경고 테두리 강도 0~1 — warn 시 1, STUCK 시 임계 대비 스트레스 연속값 */
const hudWarnStyle = computed(() => {
  const s = snapshot.value
  let t = 0
  if (s.warn_token != null) t = 1
  else if (s.how_state === 'STUCK') t = thresholdStress.value
  return { '--nixie-warn-t': String(t) }
})

const isReddish = computed(() => {
  const s = snapshot.value
  return s.warn_token != null || (s.how_state === 'STUCK' && thresholdStress.value > 0.02)
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
  const entropy = clamp(Number(snapshot.value.entropy_level ?? 100), 0, 100) / 100
  const pulseMix = 0.55 + entropy * 0.45

  if (mask) {
    const offDots = dots.filter((_, i) => !mask[i])
    const litDots = dots.filter((_, i) => mask[i])
    gsap.set(offDots, { opacity: 0.03 + entropy * 0.08 })
    if (!litDots.length) return

    const pulse = snapshot.value.who_pulse
    const baseDur = pulse === 'WILL' ? 1.1 : pulse === 'ECHO' ? 1.7 : 2.3
    const dur = clamp(baseDur * (1.45 - entropy * 0.75), 0.35, 2.8)
    const minOpacity = 0.2 + entropy * 0.25
    const maxOpacity = 0.55 + entropy * 0.37
    gsap.set(litDots, { opacity: minOpacity + 0.05 })
    luminaTl = gsap.timeline({ repeat: -1 })
    luminaTl.to(litDots, {
      opacity: maxOpacity,
      duration: dur * 0.45 * pulseMix,
      stagger: { each: 0.006 + entropy * 0.012, from: 'random' },
      ease: 'sine.inOut',
    })
    luminaTl.to(litDots, {
      opacity: minOpacity,
      duration: dur * 0.55 * pulseMix,
      stagger: { each: 0.005 + entropy * 0.01, from: 'random' },
      ease: 'sine.inOut',
    })
    return
  }

  const pulse = snapshot.value.who_pulse
  const baseDur = pulse === 'WILL' ? 1.1 : pulse === 'ECHO' ? 1.7 : 2.3
  const dur = clamp(baseDur * (1.45 - entropy * 0.75), 0.35, 2.8)
  const minOpacity = 0.16 + entropy * 0.22
  const maxOpacity = 0.48 + entropy * 0.44
  gsap.set(dots, { opacity: minOpacity + 0.04 })
  luminaTl = gsap.timeline({ repeat: -1 })
  luminaTl.to(dots, {
    opacity: maxOpacity,
    duration: dur * 0.45 * pulseMix,
    stagger: { each: 0.006 + entropy * 0.012, from: 'random' },
    ease: 'sine.inOut',
  })
  luminaTl.to(dots, {
    opacity: minOpacity,
    duration: dur * 0.55 * pulseMix,
    stagger: { each: 0.005 + entropy * 0.01, from: 'random' },
    ease: 'sine.inOut',
  })
}

function syncJitter() {
  killJitter()
  const dots = getDots()
  if (!dots.length) return

  /**
   * Jitter(일렁임) 연속 매핑 규칙:
   * - confidence_score: 전반 불안정도(낮을수록 커짐)
   * - user_defined_threshold: 사용자가 정한 "걱정선"(안전 하한), 판단 기준선
   *   -> confidence가 이 선 아래로 얼마나 내려왔는지(thStress)를 0~1로 반영
   * - entropy_level: 연출 스케일 게인(0이면 거의 정적, 100이면 최대)
   * - STUCK / ASK / warn_token: 단계 전환이 아니라 intensity 가중치로만 더함
   */
  const entropy = clamp(Number(snapshot.value.entropy_level ?? 100), 0, 100) / 100

  const s = snapshot.value
  const confidence = clamp(Number(s.confidence_score ?? 100), 0, 100)
  const instability = 1 - confidence / 100
  const thStress = confidenceRelativeThresholdStress(confidence, Number(s.user_defined_threshold ?? 100))

  // 전역 낮은 신뢰도 + 임계선 대비 부족 분을 함께 반영(연속).
  let intensity = clamp(0.55 * instability + 0.45 * thStress, 0, 1)
  if (s.how_state === 'STUCK') intensity += 0.08
  if (s.who_pulse === 'ASK') intensity += 0.06
  if (s.warn_token != null) intensity += 0.05
  intensity *= entropy
  intensity = clamp(intensity, 0, 1)

  // 거의 안정 상태에서는 미세 연산을 생략.
  if (intensity < 0.02) return

  const mask = getDemoTextMask()
  const targets = mask ? dots.filter((_, i) => mask[i]) : dots
  if (!targets.length) return

  const amplitude = 0.08 + intensity * 2.4
  const durationOut = clamp(0.22 - intensity * 0.12, 0.08, 0.22)
  const durationBack = clamp(0.24 - intensity * 0.1, 0.09, 0.24)
  const staggerEach = 0.004 + intensity * 0.004

  const tl = gsap.timeline({ repeat: -1, repeatRefresh: true })
  tl.to(targets, {
    x: () => gsap.utils.random(-amplitude, amplitude),
    y: () => gsap.utils.random(-amplitude, amplitude),
    duration: durationOut,
    stagger: { each: staggerEach },
    ease: 'sine.inOut',
  })
  tl.to(targets, {
    x: 0,
    y: 0,
    duration: durationBack,
    stagger: { each: staggerEach },
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
  const confidence = clamp(Number(s.confidence_score ?? 100), 0, 100)
  const instability = 1 - confidence / 100
  const thresholdStress = confidenceRelativeThresholdStress(confidence, s.user_defined_threshold)
  const entropy = clamp(Number(s.entropy_level ?? 100), 0, 100) / 100

  // 갸우뚱 강도: 신뢰도 하락 + 임계선 하회 정도 + 엔트로피를 연속 합성.
  // STUCK일 때만 이 강도를 사용하고, 타임아웃은 최대 강도로 고정.
  const blended = clamp(0.45 * instability + 0.55 * thresholdStress, 0, 1)
  let mag = 0
  if (s.warn_token === 'ADAPTER_TIMEOUT') mag = 1
  else if (s.how_state === 'STUCK') mag = blended * (0.35 + entropy * 0.65)

  let targetDeg = 12 * clamp(mag, 0, 1)

  if (targetDeg < 0.25) {
    confusedTween = gsap.to(el, { rotation: 0, duration: 0.35, ease: 'power2.out' })
    return
  }

  // 이벤트마다 "현재 방향"의 반대로만 기울임(무조건 역전).
  const currentRotation = Number(gsap.getProperty(el, 'rotation') ?? 0)
  const dir = currentRotation >= 0 ? -1 : 1
  targetDeg *= dir

  // 반동감을 키우기 위해 목표 각도에 추가 오버슈트를 주고,
  // 이후 settle 단계에서 살짝 되돌아오게 2-스텝 타임라인 사용.
  const overshoot = targetDeg * 1.2
  confusedTween = gsap.timeline()
  confusedTween.to(el, {
    rotation: overshoot,
    duration: 0.32,
    ease: 'back.out(2.4)',
  })
  confusedTween.to(el, {
    rotation: targetDeg,
    duration: 0.2,
    ease: 'elastic.out(1, 0.45)',
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

watch(
  () => snapshot.value.demo_hud_text ?? '',
  () => {
    nextTick(syncHudMarqueeTimer)
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
    syncHudMarqueeTimer()
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
  if (hudMarqueeTimer != null) {
    clearInterval(hudMarqueeTimer)
    hudMarqueeTimer = null
  }
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
  border-color: rgba(220, 80, 60, calc(0.35 + var(--nixie-warn-t, 0) * 0.45));
  box-shadow:
    0 4px calc(16px + var(--nixie-warn-t, 0) * 8px) rgba(200, 60, 40, calc(0.2 + var(--nixie-warn-t, 0) * 0.35)),
    inset 0 0 0 1px rgba(255, 120, 80, calc(0.25 + var(--nixie-warn-t, 0) * 0.35));
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
