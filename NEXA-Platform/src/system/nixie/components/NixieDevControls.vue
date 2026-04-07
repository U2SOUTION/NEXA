<!--
  NIXIE N-MAP 시뮬레이션 — 스토어 actions 만 호출.
  Nexion 우측 패널 아코디언에 embedded 로 배치(배포 시 체험용 노출 가능).
  명세: docs/Nexion/[NXN] [SPEC] 심플 닉시 GSAP 적용 UI 구현 v0.1.md
-->
<template>
  <div class="nixie-dev-controls" :class="{ 'nixie-dev-controls--embedded': embedded }">
    <template v-if="!embedded">
      <div class="text-caption text-weight-bold q-mb-xs">NIXIE · N-MAP 시뮬</div>
      <q-separator class="q-mb-xs" />
    </template>
    <p class="text-caption text-grey-7 q-mb-sm q-px-sm q-pt-xs text-center">화면의 <strong>닉시</strong>는 전역 오버레이. 컨트롤은 Pinia 스토어만 갱신하며, 사용자 체험용.</p>

    <!-- 흐름 + 펄스 -->
    <div class="row items-center q-gutter-x-xs q-mb-xs no-wrap">
      <span class="nixie-dev-controls__lbl">흐름</span>
      <q-btn dense size="sm" padding="xs sm" label="FLOW" :outline="snapshot.how_state !== 'FLOW'" :unelevated="snapshot.how_state === 'FLOW'" :color="snapshot.how_state === 'FLOW' ? 'primary' : 'grey-7'" @click="nmap.setHowState('FLOW')" />
      <q-btn dense size="sm" padding="xs sm" label="STUCK" :outline="snapshot.how_state !== 'STUCK'" :unelevated="snapshot.how_state === 'STUCK'" :color="snapshot.how_state === 'STUCK' ? 'amber-9' : 'grey-7'" @click="nmap.setHowState('STUCK')" />
      <q-btn dense size="sm" padding="xs sm" label="VOID" :outline="snapshot.how_state !== 'VOID'" :unelevated="snapshot.how_state === 'VOID'" :color="snapshot.how_state === 'VOID' ? 'blue-grey-6' : 'grey-7'" @click="nmap.setHowState('VOID')" />
      <q-separator vertical inset class="q-mx-xs" />
      <span class="nixie-dev-controls__lbl">펄스</span>
      <q-btn dense size="sm" padding="xs sm" label="WILL" :flat="snapshot.who_pulse !== 'WILL'" :unelevated="snapshot.who_pulse === 'WILL'" :color="snapshot.who_pulse === 'WILL' ? 'deep-orange-8' : 'grey-7'" @click="nmap.setWhoPulse('WILL')" />
      <q-btn dense size="sm" padding="xs sm" label="ECHO" :flat="snapshot.who_pulse !== 'ECHO'" :unelevated="snapshot.who_pulse === 'ECHO'" :color="snapshot.who_pulse === 'ECHO' ? 'cyan-8' : 'grey-7'" @click="nmap.setWhoPulse('ECHO')" />
      <q-btn dense size="sm" padding="xs sm" label="ASK" :flat="snapshot.who_pulse !== 'ASK'" :unelevated="snapshot.who_pulse === 'ASK'" :color="snapshot.who_pulse === 'ASK' ? 'purple-8' : 'grey-7'" @click="nmap.setWhoPulse('ASK')" />
    </div>

    <!-- 슬라이더 3단: 신뢰도 / 엔트로피 / 임계값 -->
    <div class="row items-center no-wrap q-gutter-x-xs q-mb-xs">
      <span class="nixie-dev-controls__lbl">신뢰도</span>
      <q-slider :model-value="snapshot.confidence_score" :min="0" :max="100" dense color="primary" class="nixie-dev-controls__slider col" @update:model-value="nmap.setConfidenceScore" />
      <span class="text-caption text-grey-4 nixie-dev-controls__num nixie-dev-controls__num--unit">{{ snapshot.confidence_score }} %</span>
    </div>
    <div class="row items-center no-wrap q-gutter-x-xs q-mb-xs">
      <span class="nixie-dev-controls__lbl">엔트로피</span>
      <q-slider :model-value="snapshot.entropy_level" :min="0" :max="100" dense color="deep-orange" class="nixie-dev-controls__slider col" @update:model-value="nmap.setEntropyLevel" />
      <span class="text-caption text-grey-4 nixie-dev-controls__num nixie-dev-controls__num--unit">{{ snapshot.entropy_level }} %</span>
    </div>
    <div class="row items-center no-wrap q-gutter-x-xs q-mb-xs">
      <span class="nixie-dev-controls__lbl">임계값</span>
      <q-slider :model-value="snapshot.user_defined_threshold" :min="70" :max="100" dense color="amber" class="nixie-dev-controls__slider col" @update:model-value="nmap.setUserDefinedThreshold" />
      <span class="text-caption text-grey-4 nixie-dev-controls__num nixie-dev-controls__num--unit">{{ snapshot.user_defined_threshold }} %</span>
    </div>

    <!-- 경고·상태 액션 묶음 -->
    <div class="row items-center q-gutter-x-xs q-mb-xs flex-wrap">
      <span class="nixie-dev-controls__lbl">경고/상태</span>
      <q-btn dense size="sm" padding="xs sm" label="타임아웃" :outline="snapshot.warn_token !== 'ADAPTER_TIMEOUT'" :unelevated="snapshot.warn_token === 'ADAPTER_TIMEOUT'" :color="snapshot.warn_token === 'ADAPTER_TIMEOUT' ? 'negative' : 'grey-7'" @click="nmap.setWarnToken('ADAPTER_TIMEOUT')" />
      <q-btn dense size="sm" padding="xs sm" label="해제" :flat="snapshot.warn_token != null" :unelevated="snapshot.warn_token == null" :color="snapshot.warn_token == null ? 'positive' : 'grey-7'" @click="nmap.setWarnToken(null)" />
      <q-separator vertical inset class="q-mx-xs" />
      <q-toggle :model-value="snapshot.is_virtual" dense left-label label="가상" @update:model-value="nmap.setIsVirtual" />
      <q-separator vertical inset class="q-mx-xs" />
      <q-btn
        dense
        size="sm"
        padding="xs sm"
        label="Nebula"
        :outline="snapshot.source_shell_id == null || snapshot.source_shell_id === 'local'"
        :unelevated="snapshot.source_shell_id != null && snapshot.source_shell_id !== 'local'"
        :color="snapshot.source_shell_id != null && snapshot.source_shell_id !== 'local' ? 'indigo-7' : 'grey-7'"
        @click="nmap.simulateNebulaInflux()"
      />
      <q-btn
        dense
        size="sm"
        padding="xs sm"
        label="Lokeol"
        :flat="snapshot.source_shell_id != null && snapshot.source_shell_id !== 'local'"
        :unelevated="snapshot.source_shell_id == null || snapshot.source_shell_id === 'local'"
        :color="snapshot.source_shell_id == null || snapshot.source_shell_id === 'local' ? 'teal-7' : 'grey-7'"
        @click="nmap.clearNebulaToLocal()"
      />
    </div>

    <q-separator class="q-my-xs" />

    <div class="row items-center q-gutter-x-xs q-mb-xs nixie-dev-controls__morse-head">
      <span class="nixie-dev-controls__lbl">MORSE</span>
      <q-btn dense size="sm" padding="xs sm" label="변환" :outline="!snapshot.demo_hud_morse_enabled" :unelevated="snapshot.demo_hud_morse_enabled" :color="snapshot.demo_hud_morse_enabled ? 'deep-purple-7' : 'grey-7'" @click="toggleMorseMode" />
      <span class="text-caption text-grey-6">공백은 `^` 로 표시</span>
      <div v-if="snapshot.demo_hud_morse_enabled" class="row items-center no-wrap q-gutter-x-xs q-ml-auto nixie-dev-controls__morse-trail">
        <span class="text-caption text-grey-6 nixie-dev-controls__morse-play-lbl">미리듣기</span>
        <q-spinner v-if="morsePlaying" color="positive" size="1.15em" class="nixie-dev-controls__morse-spinner" />
        <q-btn
          flat
          round
          dense
          color="positive"
          :icon="morsePlaying ? 'stop' : 'play_arrow'"
          :disable="!morsePlaying && !canPlayMorsePreview"
          :aria-label="morsePlaying ? '모스 재생 중지' : '모스 재생'"
          @click="onMorsePlayClick"
        />
      </div>
    </div>

    <template v-if="snapshot.demo_hud_morse_enabled">
      <div class="row items-center no-wrap q-gutter-x-xs q-mb-xs">
        <span class="nixie-dev-controls__lbl">DIT</span>
        <q-slider :model-value="snapshot.morse_dit_ms" :min="20" :max="500" dense color="purple" class="nixie-dev-controls__slider col" @update:model-value="nmap.setMorseDitMs" />
        <span class="text-caption text-grey-4 nixie-dev-controls__num nixie-dev-controls__num--unit">{{ snapshot.morse_dit_ms }} ms</span>
      </div>
      <div class="row items-center no-wrap q-gutter-x-xs q-mb-xs">
        <span class="nixie-dev-controls__lbl">TONE</span>
        <q-slider :model-value="snapshot.morse_tone_hz" :min="50" :max="2000" dense color="indigo" class="nixie-dev-controls__slider col" @update:model-value="nmap.setMorseToneHz" />
        <span class="text-caption text-grey-4 nixie-dev-controls__num nixie-dev-controls__num--unit">{{ snapshot.morse_tone_hz }} Hz</span>
      </div>
      <div class="row items-center no-wrap q-gutter-x-xs q-mb-xs">
        <span class="nixie-dev-controls__lbl">VOLUME</span>
        <q-slider :model-value="snapshot.morse_volume" :min="0" :max="100" dense color="teal" class="nixie-dev-controls__slider col" @update:model-value="nmap.setMorseVolume" />
        <span class="text-caption text-grey-4 nixie-dev-controls__num nixie-dev-controls__num--unit">{{ snapshot.morse_volume }} %</span>
      </div>
      <div class="text-center q-mb-xs q-px-xs nixie-dev-controls__morse-timeline">
        <div class="text-caption text-grey-6">재생 타임라인: dit {{ morseResolvedDitMs }}ms · 총 {{ morsePlayDurationMs }}ms (DOT/DASH/GAP)</div>
        <div class="nixie-dev-controls__morse-timeline-hint text-grey-7">
          PARIS <strong>{{ morseParisWpmApprox }}</strong> WPM · dash {{ morseDahMs }}ms · 점/대시 {{ morseResolvedDitMs }}ms · 글간격 {{ morseInterCharGapMs }}ms · 단어(^) {{ morseWordGapMs }}ms · 톤 {{ snapshot.morse_tone_hz }}Hz · 볼륨 {{ snapshot.morse_volume }}%
        </div>
      </div>
    </template>

    <!-- HUD: 분해·모스 미리보기는 한 줄(그리드 preview 행) — 라벨|입력|지우기는 그 아래 행 -->
    <div class="nixie-dev-controls__hud" :class="{ 'nixie-dev-controls__hud--preview': showHudPreviewRow }">
      <div v-if="showHudPreviewRow" class="nixie-dev-controls__hud-preview q-px-xs text-center">
        <template v-if="showHudDecomposedLine">
          <span class="text-grey-6">분해: {{ hudDecomposedPreview || '(없음)' }}</span>
        </template>
        <span v-if="showHudDecomposedLine && snapshot.demo_hud_morse_enabled" class="nixie-dev-controls__hud-preview-sep text-grey-5">·</span>
        <template v-if="snapshot.demo_hud_morse_enabled">
          <span class="text-deep-purple-5">모스: {{ hudMorsePreview || '(없음)' }}</span>
        </template>
      </div>
      <span class="nixie-dev-controls__lbl nixie-dev-controls__hud-label">HUD</span>
      <div class="col min-width-0 nixie-dev-controls__hud-field">
        <q-input
          v-model="hudDraft"
          dense
          outlined
          hide-bottom-space
          input-class="nixie-dev-controls__hud-input"
          autocapitalize="off"
          autocomplete="off"
          :spellcheck="false"
          placeholder="A–Z·a–z·0–9·한글·모스 . - blur/Enter"
          @focus="hudInputFocused = true"
          @blur="onHudBlur"
          @keydown.enter.prevent="commitHudText"
        />
      </div>
      <q-btn class="nixie-dev-controls__hud-clear" dense flat size="sm" padding="8px 12px" label="지우기" @click="clearHudText" />
    </div>

    <q-btn dense flat color="primary" size="sm" class="full-width q-mt-xs" label="스냅샷 기본값" @click="nmap.resetToDefaults()" />
  </div>
</template>

<script setup>
import { useNmapSnapshotStore } from '@system/store/nmapSnapshotStore'
import { encodeTextToMorseHudText, normalizeDemoHudText } from '@system/nixie/nixieDotMap'
import { buildMorseSoundTimeline, clampMorseDitMs, morseTimelineTotalMs } from '@system/nixie/morseTimeline'
import { playMorseTimeline, stopMorsePlayback } from '@system/nixie/morseWebAudio'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

defineProps({
  /** Nexion 우측 패널 아코디언 안에 넣을 때 true (제목·외곽선 생략) */
  embedded: {
    type: Boolean,
    default: false,
  },
})

const nmap = useNmapSnapshotStore()
const { snapshot } = storeToRefs(nmap)
const hasHangulChar = /[\u3131-\u318e\uac00-\ud7a3]/
const hudDraft = ref('')
const hudInputFocused = ref(false)
const morsePlaying = ref(false)

const showHudDecomposedLine = computed(() => hasHangulChar.test(hudDraft.value ?? ''))
/** 분해 줄·모스 미리보기 중 하나라도 쓰면 그리드 상단에 한 줄로 표시 */
const showHudPreviewRow = computed(() => showHudDecomposedLine.value || snapshot.value.demo_hud_morse_enabled)
const hudDecomposedPreview = computed(() => normalizeDemoHudText(hudDraft.value ?? ''))
const hudMorsePreview = computed(() => encodeTextToMorseHudText(hudDraft.value ?? ''))

const morseResolvedDitMs = computed(() => clampMorseDitMs(snapshot.value.morse_dit_ms))

/** PARIS 기준 관용 환산: WPM ≈ 1200 / dit(ms) — 교육·교신에서 흔한 참고값(엄밀한 시험 단위는 아님) */
const morseParisWpmApprox = computed(() => {
  const d = morseResolvedDitMs.value
  if (d <= 0) return 0
  return Math.max(1, Math.round(1200 / d))
})

const morseDahMs = computed(() => morseResolvedDitMs.value * 3)
const morseInterCharGapMs = computed(() => morseResolvedDitMs.value * 3)
const morseWordGapMs = computed(() => morseResolvedDitMs.value * 7)

const morsePlayDurationMs = computed(() => {
  if (!snapshot.value.demo_hud_morse_enabled) return 0
  const t = normalizeDemoHudText(snapshot.value.demo_hud_text ?? '')
  if (!t.length) return 0
  return morseTimelineTotalMs(buildMorseSoundTimeline(t, morseResolvedDitMs.value))
})

/** HUD 입력 기준 모스 미리듣기(모스 출력과 동일 파이프라인) */
const canPlayMorsePreview = computed(() => {
  if (!snapshot.value.demo_hud_morse_enabled) return false
  if ((snapshot.value.morse_volume ?? 0) <= 0) return false
  const s = normalizeDemoHudText(encodeTextToMorseHudText(hudDraft.value ?? ''))
  if (!s.length) return false
  return buildMorseSoundTimeline(s, morseResolvedDitMs.value).length > 0
})

function onMorsePlayClick() {
  if (morsePlaying.value) {
    stopMorsePlayback()
    return
  }
  void playMorsePreview()
}

async function playMorsePreview() {
  if (!canPlayMorsePreview.value) return
  const s = normalizeDemoHudText(encodeTextToMorseHudText(hudDraft.value ?? ''))
  const events = buildMorseSoundTimeline(s, morseResolvedDitMs.value)
  if (!events.length) return
  morsePlaying.value = true
  try {
    await playMorseTimeline(events, {
      frequencyHz: snapshot.value.morse_tone_hz,
      volume: ((snapshot.value.morse_volume ?? 0) / 100) * 0.35,
    })
  } finally {
    morsePlaying.value = false
  }
}

onMounted(() => {
  hudDraft.value = snapshot.value.demo_hud_text_raw ?? ''
})

onBeforeUnmount(() => {
  stopMorsePlayback()
})

watch(
  () => snapshot.value.demo_hud_text_raw,
  (v) => {
    if (!hudInputFocused.value) hudDraft.value = v ?? ''
  },
)

function commitHudText() {
  nmap.setDemoHudText(hudDraft.value)
}

function onHudBlur() {
  hudInputFocused.value = false
  commitHudText()
}

function clearHudText() {
  nmap.setDemoHudText('')
  hudDraft.value = ''
}

function toggleMorseMode() {
  nmap.setDemoHudMorseEnabled(!snapshot.value.demo_hud_morse_enabled)
}
</script>

<style scoped lang="scss">
.nixie-dev-controls {
  padding: 6px 8px;
  /* 높이 제한·내부 overflow 제거 — 우측 패널 `panel-scroll-area`만 세로 스크롤 */
  overflow: visible;
}

.nixie-dev-controls--embedded {
  padding: 4px 6px 8px;
  border-bottom: none;
  background: transparent;
}

.nixie-dev-controls__lbl {
  flex-shrink: 0;
  font-size: 11px;
  line-height: 1.2;
  opacity: 0.52;
  min-width: 3.1rem;
  text-align: right;
  margin-right: 4px;
}

/** 모스 행: 변환·설명·재생 아이콘(우측) */
.nixie-dev-controls__morse-head {
  flex-wrap: wrap;
  align-items: center;
  row-gap: 4px;
}

.nixie-dev-controls__morse-trail {
  flex-shrink: 0;
}

.nixie-dev-controls__morse-play-lbl {
  flex-shrink: 0;
  white-space: nowrap;
}

.nixie-dev-controls__morse-spinner {
  flex-shrink: 0;
}

.nixie-dev-controls__morse-timeline-hint {
  font-size: 10px;
  line-height: 1.2;
  opacity: 0.88;
}

/** HUD: 3열 그리드 — `grid-template-areas` 만으로 분해 줄 유무에 따라 행 구성 */
.nixie-dev-controls__hud {
  display: grid;
  grid-template-columns: auto 1fr auto;
  column-gap: 8px;
  row-gap: 4px;
  align-items: center;
  margin-bottom: 4px;
  grid-template-areas: 'label input clear';
}

.nixie-dev-controls__hud--preview {
  grid-template-areas:
    'preview preview preview'
    'label input clear';
}

.nixie-dev-controls__hud-label {
  grid-area: label;
}

.nixie-dev-controls__hud-field {
  grid-area: input;
}

.nixie-dev-controls__hud-clear {
  grid-area: clear;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 6px;
}

.nixie-dev-controls__hud-preview {
  grid-area: preview;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  font-size: 10px;
  line-height: 1.2;
  opacity: 0.88;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.nixie-dev-controls__hud-preview-sep {
  user-select: none;
}

.nixie-dev-controls__slider {
  min-width: 0;
  flex: 1 1 auto;
  max-width: 100%;
}

.nixie-dev-controls__num {
  min-width: 1.5rem;
  text-align: right;
}

.nixie-dev-controls__num--unit {
  flex: 0 0 auto;
  min-width: 4.75rem;
  white-space: nowrap;
}

/* 대문자 강제·자동 대문자 방지 — HUD에 입력한 대·소문자 그대로 표시 */
:deep(.nixie-dev-controls__hud-input) {
  text-transform: none;
  font-variant: normal;
}
</style>
