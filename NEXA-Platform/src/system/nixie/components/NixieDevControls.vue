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
      <span class="nixie-dev-controls__lbl">모스</span>
      <q-btn
        dense
        size="sm"
        padding="xs sm"
        label="변환"
        :outline="!snapshot.demo_hud_morse_enabled"
        :unelevated="snapshot.demo_hud_morse_enabled"
        :color="snapshot.demo_hud_morse_enabled ? 'deep-purple-7' : 'grey-7'"
        @click="toggleMorseMode"
      />
      <span class="text-caption text-grey-6">공백은 `^` 로 표시</span>
      <q-toggle
        v-if="snapshot.demo_hud_morse_enabled"
        dense
        class="nixie-dev-controls__dit-toggle q-ml-auto"
        :model-value="snapshot.morse_dit_ms_override != null"
        label="dit(ms) 직접"
        @update:model-value="nmap.setMorseUseCustomDit"
      />
    </div>

    <template v-if="snapshot.demo_hud_morse_enabled">
      <div class="row items-center no-wrap q-gutter-x-xs q-mb-xs">
        <span class="nixie-dev-controls__lbl">WPM</span>
        <q-slider
          :model-value="snapshot.morse_wpm"
          :min="5"
          :max="60"
          :disable="snapshot.morse_dit_ms_override != null"
          dense
          color="purple"
          class="nixie-dev-controls__slider col"
          @update:model-value="nmap.setMorseWpm"
        />
        <span class="text-caption text-grey-4 nixie-dev-controls__num nixie-dev-controls__num--unit">{{ snapshot.morse_wpm }} WPM</span>
      </div>
      <div v-if="snapshot.morse_dit_ms_override != null" class="row items-center no-wrap q-gutter-x-xs q-mb-xs">
        <span class="nixie-dev-controls__lbl">dit</span>
        <q-slider
          :model-value="snapshot.morse_dit_ms_override"
          :min="20"
          :max="500"
          dense
          color="purple"
          class="nixie-dev-controls__slider col"
          @update:model-value="nmap.setMorseDitMsOverride"
        />
        <span class="text-caption text-grey-4 nixie-dev-controls__num nixie-dev-controls__num--unit">{{ snapshot.morse_dit_ms_override }} ms</span>
      </div>
      <div class="row items-center no-wrap q-gutter-x-xs q-mb-xs">
        <span class="nixie-dev-controls__lbl">톤</span>
        <q-slider
          :model-value="snapshot.morse_tone_hz"
          :min="300"
          :max="2000"
          dense
          color="indigo"
          class="nixie-dev-controls__slider col"
          @update:model-value="nmap.setMorseToneHz"
        />
        <span class="text-caption text-grey-4 nixie-dev-controls__num nixie-dev-controls__num--unit">{{ snapshot.morse_tone_hz }} Hz</span>
      </div>
      <div class="text-caption text-grey-6 text-center q-mb-xs q-px-xs">
        재생 타임라인: dit {{ morseResolvedDitMs }}ms · 총 {{ morsePlayDurationMs }}ms (DOT/DASH/GAP)
      </div>
    </template>

    <!-- HUD: 분해 줄은 2행·입력 열만 → 라벨|입력|지우기는 항상 한 행에서 세로 가운데 정렬 -->
    <div class="nixie-dev-controls__hud" :class="{ 'nixie-dev-controls__hud--decomposed': showHudDecomposedLine }">
      <div v-if="showHudDecomposedLine" class="nixie-dev-controls__hud-decomposed text-caption text-grey-6">분해 출력: {{ hudDecomposedPreview || '(없음)' }}</div>
      <span class="nixie-dev-controls__lbl nixie-dev-controls__hud-label">HUD</span>
      <div class="col min-width-0 nixie-dev-controls__hud-field">
        <div v-if="snapshot.demo_hud_morse_enabled" class="text-caption text-deep-purple-5 q-mb-xs">
          모스 출력: {{ hudMorsePreview || '(없음)' }}
        </div>
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
import { buildMorseSoundTimeline, morseTimelineTotalMs, resolveMorseDitMs } from '@system/nixie/morseTimeline'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'

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

const showHudDecomposedLine = computed(() => hasHangulChar.test(hudDraft.value ?? ''))
const hudDecomposedPreview = computed(() => normalizeDemoHudText(hudDraft.value ?? ''))
const hudMorsePreview = computed(() => encodeTextToMorseHudText(hudDraft.value ?? ''))

const morseResolvedDitMs = computed(() =>
  resolveMorseDitMs({
    wpm: snapshot.value.morse_wpm,
    ditMsOverride: snapshot.value.morse_dit_ms_override,
  }),
)

const morsePlayDurationMs = computed(() => {
  if (!snapshot.value.demo_hud_morse_enabled) return 0
  const t = normalizeDemoHudText(snapshot.value.demo_hud_text ?? '')
  if (!t.length) return 0
  return morseTimelineTotalMs(buildMorseSoundTimeline(t, morseResolvedDitMs.value))
})

onMounted(() => {
  hudDraft.value = snapshot.value.demo_hud_text_raw ?? ''
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
  max-height: 55vh;
  overflow: auto;
}

.nixie-dev-controls--embedded {
  padding: 4px 6px 8px;
  max-height: min(50vh, 420px);
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

/** 모스 행: 변환·설명과 dit 토글 한 줄(토글은 우측 정렬) */
.nixie-dev-controls__morse-head {
  flex-wrap: wrap;
  align-items: center;
  row-gap: 4px;
}

.nixie-dev-controls__dit-toggle {
  flex-shrink: 0;
}

/** HUD: 3열 그리드 — `grid-template-areas` 만으로 분해 줄 유무에 따라 행 구성 */
.nixie-dev-controls__hud {
  display: grid;
  grid-template-columns: auto 1fr auto;
  column-gap: 8px;
  row-gap: 4px;
  align-items: center;
  margin-bottom: 4px;
  grid-template-areas:
    'label input clear';
}

.nixie-dev-controls__hud--decomposed {
  grid-template-areas:
    '. preview .'
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

.nixie-dev-controls__hud-decomposed {
  grid-area: preview;
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
