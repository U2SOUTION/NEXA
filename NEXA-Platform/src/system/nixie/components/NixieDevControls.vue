<!--
  NIXIE N-MAP 시뮬레이션 — 스토어 actions 만 호출.
  Nexion 우측 패널 아코디언에 embedded 로 배치(배포 시 체험용 노출 가능).
  명세: docs/Nexion/[NXN] [SPEC] 심플 닉시 GSAP 적용 UI 구현 v0.1.md

  현재 상태(모스·오디오)
  - DIT/TONE/VOLUME: 드래그는 로컬 ref, 손 뗄 때(@change) 스토어 반영. 재생 중 TONE/VOLUME은 morseWebAudio 라이브 반영, DIT는 재생 재시작.
  - 미리듣기: 스피너+중지, stop 시 오디오·Promise 정리. 재생 세대 번호로 finally 경합 방지.
  - 스냅샷 applyPatch 가 통째로 갈아끼워지므로 morse 필드는 배열 watch 금지 → dit/tone/volume 스칼라별 watch 로만 로컬 슬라이더 동기화.
  - N-MAP 수치 → 모스 파라미터 자동 매핑은 아직 없음. 본격 닉시 진행 시 연출 레이어에서 추가 예정.
  - PAN L / ALL / R: 스냅샷 `morse_stereo_pan` + Web Audio `StereoPannerNode`, 재생 중 버튼만으로도 실시간 체험 가능.
  - 사운드 레이어 4축(FILTER·RELEASE·DETUNE·JITTER): 단계 A는 로컬 ref만(0~100), Web Audio 미연동 — docs/NIXIE [IMPL] 사운드 레이어 4축(UI·Web Audio) 구현 순서.md
-->
<template>
  <div class="nixie-dev-controls" :class="{ 'nixie-dev-controls--embedded': embedded }">
    <template v-if="!embedded">
      <div class="text-caption text-weight-bold q-mb-xs">NIXIE · N-MAP 시뮬</div>
      <q-separator class="q-mb-xs" />
    </template>
    <!-- <p class="text-caption text-grey-7 q-mb-sm q-px-sm q-pt-xs text-center">화면의 <strong>닉시</strong>는 전역 오버레이. 컨트롤은 Pinia 스토어만 갱신하며, 사용자 체험용.</p> -->

    <!-- 흐름 + 펄스: 공간 부족 시 블록 단위로 다음 줄로 래핑 -->
    <div class="row items-center q-gutter-x-xs q-gutter-y-xs q-mb-xs nixie-dev-controls__state-wrap">
      <div class="row items-center q-gutter-x-xs no-wrap nixie-dev-controls__state-group">
        <span class="nixie-dev-controls__lbl">흐름</span>
        <q-btn dense size="sm" padding="xs sm" label="FLOW" :outline="snapshot.how_state !== 'FLOW'" :unelevated="snapshot.how_state === 'FLOW'" :color="snapshot.how_state === 'FLOW' ? 'primary' : 'grey-7'" @click="nmap.setHowState('FLOW')" />
        <q-btn dense size="sm" padding="xs sm" label="STUCK" :outline="snapshot.how_state !== 'STUCK'" :unelevated="snapshot.how_state === 'STUCK'" :color="snapshot.how_state === 'STUCK' ? 'amber-9' : 'grey-7'" @click="nmap.setHowState('STUCK')" />
        <q-btn dense size="sm" padding="xs sm" label="VOID" :outline="snapshot.how_state !== 'VOID'" :unelevated="snapshot.how_state === 'VOID'" :color="snapshot.how_state === 'VOID' ? 'blue-grey-6' : 'grey-7'" @click="nmap.setHowState('VOID')" />
      </div>
      <div class="row items-center q-gutter-x-xs no-wrap nixie-dev-controls__state-group">
        <span class="nixie-dev-controls__lbl">펄스</span>
        <q-btn dense size="sm" padding="xs sm" label="WILL" :flat="snapshot.who_pulse !== 'WILL'" :unelevated="snapshot.who_pulse === 'WILL'" :color="snapshot.who_pulse === 'WILL' ? 'deep-orange-8' : 'grey-7'" @click="nmap.setWhoPulse('WILL')" />
        <q-btn dense size="sm" padding="xs sm" label="ECHO" :flat="snapshot.who_pulse !== 'ECHO'" :unelevated="snapshot.who_pulse === 'ECHO'" :color="snapshot.who_pulse === 'ECHO' ? 'cyan-8' : 'grey-7'" @click="nmap.setWhoPulse('ECHO')" />
        <q-btn dense size="sm" padding="xs sm" label="ASK" :flat="snapshot.who_pulse !== 'ASK'" :unelevated="snapshot.who_pulse === 'ASK'" :color="snapshot.who_pulse === 'ASK' ? 'purple-8' : 'grey-7'" @click="nmap.setWhoPulse('ASK')" />
      </div>
    </div>

    <!-- 슬라이더: 신뢰도 / 엔트로피 / 임계값 / 닉시 마퀴 흐름 속도(슬라이더↑=빠름 → 내부는 interval_ms 역매핑) -->
    <div class="row items-center no-wrap q-mb-xs nixie-dev-controls__slider-row">
      <span class="nixie-dev-controls__lbl">신뢰도</span>
      <q-slider :model-value="snapshot.confidence_score" :min="0" :max="100" dense color="primary" class="nixie-dev-controls__slider col" @update:model-value="nmap.setConfidenceScore" />
      <span class="text-caption text-grey-4 nixie-dev-controls__num nixie-dev-controls__num--unit">{{ snapshot.confidence_score }} %</span>
    </div>
    <div class="row items-center no-wrap q-mb-xs nixie-dev-controls__slider-row">
      <span class="nixie-dev-controls__lbl">엔트로피</span>
      <q-slider :model-value="snapshot.entropy_level" :min="0" :max="100" dense color="deep-orange" class="nixie-dev-controls__slider col" @update:model-value="nmap.setEntropyLevel" />
      <span class="text-caption text-grey-4 nixie-dev-controls__num nixie-dev-controls__num--unit">{{ snapshot.entropy_level }} %</span>
    </div>
    <div class="row items-center no-wrap q-mb-xs nixie-dev-controls__slider-row">
      <span class="nixie-dev-controls__lbl">임계값</span>
      <q-slider :model-value="snapshot.user_defined_threshold" :min="70" :max="100" dense color="amber" class="nixie-dev-controls__slider col" @update:model-value="nmap.setUserDefinedThreshold" />
      <span class="text-caption text-grey-4 nixie-dev-controls__num nixie-dev-controls__num--unit">{{ snapshot.user_defined_threshold }} %</span>
    </div>
    <div class="row items-center no-wrap q-mb-xs nixie-dev-controls__slider-row">
      <span class="nixie-dev-controls__lbl" title="값이 클수록 빠름 · 실제 마퀴는 틱 간격(ms)이 짧아짐">흐름속도</span>
      <q-slider :model-value="hudMarqueeSpeedUi" :min="HUD_MARQUEE_MS_MIN" :max="HUD_MARQUEE_MS_MAX" dense color="primary" class="nixie-dev-controls__slider col" @update:model-value="commitHudMarqueeSpeedUi" />
      <span class="text-caption text-grey-4 nixie-dev-controls__num nixie-dev-controls__num--unit">{{ hudMarqueeSpeedUiRounded }}</span>
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
      <div class="nixie-dev-controls__morse-scope col">
        <AudioScopeCanvas :active="morsePlaying" :pull-bytes="pullMorseScopeBytes" :pull-playhead-progress="pullMorsePlayheadProgress" />
      </div>
      <div class="row items-center no-wrap q-gutter-x-xs q-ml-auto nixie-dev-controls__morse-trail">
        <q-spinner v-if="morsePlaying" color="positive" size="1.15em" class="nixie-dev-controls__morse-spinner" />
        <q-btn flat round dense color="positive" :icon="morsePlaying ? 'stop' : 'play_arrow'" :aria-label="morsePlaying ? '모스 재생 중지' : '모스 재생/상세 열기'" @click="onMorsePlayClick" />
        <q-btn
          flat
          round
          size="sm"
          :icon="'repeat_one'"
          :color="morseLoopEnabled ? 'red-6' : 'grey-6'"
          :aria-label="morseLoopEnabled ? '연속 재생 켜짐' : '연속 재생 꺼짐'"
          :title="morseLoopEnabled ? '연속 재생 ON' : '연속 재생 OFF'"
          class="nixie-dev-controls__morse-loop-btn"
          @click="morseLoopEnabled = !morseLoopEnabled"
        />
      </div>
    </div>

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
          ref="hudInputEl"
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
    </div>

    <transition name="morse-detail-expand">
      <div v-if="snapshot.demo_hud_morse_enabled" class="nixie-dev-controls__morse-detail">
        <div class="row items-center no-wrap q-mb-xs nixie-dev-controls__slider-row">
          <span class="nixie-dev-controls__lbl">DIT</span>
          <q-slider v-model="morseDitSlider" :min="20" :max="500" dense color="purple" class="nixie-dev-controls__slider col" @change="onMorseDitSliderChange" />
          <span class="text-caption text-grey-4 nixie-dev-controls__num nixie-dev-controls__num--unit">{{ morseDitMsUi }} ms</span>
        </div>
        <div class="row items-center no-wrap q-mb-xs nixie-dev-controls__slider-row">
          <span class="nixie-dev-controls__lbl">TONE</span>
          <q-slider v-model="morseToneSlider" :min="0" :max="MORSE_TONE_LOG_STEPS" dense color="indigo" class="nixie-dev-controls__slider col" @change="onMorseToneSliderChange" />
          <span class="text-caption text-grey-4 nixie-dev-controls__num nixie-dev-controls__num--unit">{{ morseToneHzUi }} Hz</span>
        </div>
        <div class="row items-center no-wrap q-mb-xs nixie-dev-controls__slider-row">
          <span class="nixie-dev-controls__lbl">VOLUME</span>
          <q-slider v-model="morseVolumeSlider" :min="0" :max="100" dense color="teal" class="nixie-dev-controls__slider col" @change="onMorseVolumeSliderChange" />
          <span class="text-caption text-grey-4 nixie-dev-controls__num nixie-dev-controls__num--unit">{{ morseVolumeSlider }} %</span>
        </div>
        <div class="row items-center q-mb-xs flex-wrap nixie-dev-controls__morse-sync-row">
          <div class="row items-center no-wrap q-gutter-x-xs">
            <q-toggle dense left-label :model-value="snapshot.morse_hud_sync_with_playback ?? true" label="동기·HUD" @update:model-value="nmap.setMorseHudSyncWithPlayback" />
          </div>
          <div class="row items-center no-wrap q-gutter-x-xs">
            <q-toggle dense left-label :disable="!(snapshot.morse_hud_sync_with_playback ?? true)" :model-value="snapshot.morse_hud_per_event_highlight === true" label="단점·장점 강조" @update:model-value="nmap.setMorseHudPerEventHighlight" />
          </div>
        </div>
        <div class="row items-center no-wrap q-gutter-x-xs q-mb-xs">
          <span class="nixie-dev-controls__lbl">CHANNEL</span>
          <q-btn-group outline class="nixie-dev-controls__morse-pan-group col">
            <q-btn dense size="sm" padding="xs sm" label="ALPHA" :unelevated="(snapshot.morse_stereo_pan ?? 0) === -1" :color="(snapshot.morse_stereo_pan ?? 0) === -1 ? 'deep-purple-7' : 'grey-7'" @click="commitMorseStereoPan(-1)" />
            <q-btn dense size="sm" padding="xs sm" label="DUAL" :unelevated="(snapshot.morse_stereo_pan ?? 0) === 0" :color="(snapshot.morse_stereo_pan ?? 0) === 0 ? 'deep-purple-7' : 'grey-7'" @click="commitMorseStereoPan(0)" />
            <q-btn dense size="sm" padding="xs sm" label="OMEGA" :unelevated="(snapshot.morse_stereo_pan ?? 0) === 1" :color="(snapshot.morse_stereo_pan ?? 0) === 1 ? 'deep-purple-7' : 'grey-7'" @click="commitMorseStereoPan(1)" />
          </q-btn-group>
        </div>
        <!-- 사운드 레이어 4축 — 단계 A: CHANNEL 아래, 한 슬라이더당 한 행 · 로컬만(0~100) -->
        <div class="row items-center no-wrap q-mb-xs nixie-dev-controls__slider-row">
          <span class="nixie-dev-controls__lbl" title="Filter (subtractive layer)">FILTER</span>
          <q-slider v-model="soundLayerFilter" :min="0" :max="100" dense color="blue-grey-5" class="nixie-dev-controls__slider col" />
          <span class="text-caption text-grey-4 nixie-dev-controls__num nixie-dev-controls__num--unit">{{ soundLayerFilter }} %</span>
        </div>
        <div class="row items-center no-wrap q-mb-xs nixie-dev-controls__slider-row">
          <span class="nixie-dev-controls__lbl" title="Release / tail">RELEASE</span>
          <q-slider v-model="soundLayerRelease" :min="0" :max="100" dense color="teal-6" class="nixie-dev-controls__slider col" />
          <span class="text-caption text-grey-4 nixie-dev-controls__num nixie-dev-controls__num--unit">{{ soundLayerRelease }} ms</span>
        </div>
        <div class="row items-center no-wrap q-mb-xs nixie-dev-controls__slider-row">
          <span class="nixie-dev-controls__lbl" title="Detune">DETUNE</span>
          <q-slider v-model="soundLayerDetune" :min="0" :max="100" dense color="orange-7" class="nixie-dev-controls__slider col" />
          <span class="text-caption text-grey-4 nixie-dev-controls__num nixie-dev-controls__num--unit">{{ soundLayerDetune }} ct</span>
        </div>
        <div class="row items-center no-wrap q-mb-xs nixie-dev-controls__slider-row">
          <span class="nixie-dev-controls__lbl" title="Jitter">JITTER</span>
          <q-slider v-model="soundLayerJitter" :min="0" :max="100" dense color="pink-6" class="nixie-dev-controls__slider col" />
          <span class="text-caption text-grey-4 nixie-dev-controls__num nixie-dev-controls__num--unit">{{ soundLayerJitter }} %</span>
        </div>
        <div ref="morseAtomicClockHostEl" class="row items-center no-wrap q-gutter-x-xs q-mb-xs">
          <span class="nixie-dev-controls__lbl">A-Clock</span>
          <div class="col min-width-0">
            <q-select
              v-if="isAtomicClockCompact"
              dense
              outlined
              hide-bottom-space
              emit-value
              map-options
              :model-value="snapshot.morse_atomic_clock"
              :options="morseAtomicClockSelectOptions"
              option-value="value"
              option-label="label"
              class="nixie-dev-controls__atom-select"
              @update:model-value="commitMorseAtomicClock"
            />
            <div v-else class="row q-gutter-xs nixie-dev-controls__atom-wrap">
              <q-btn
                v-for="atom in morseAtomicClockOptions"
                :key="atom.key"
                dense
                size="sm"
                padding="xs sm"
                :label="atom.label"
                :title="atom.tooltip"
                :outline="snapshot.morse_atomic_clock !== atom.key"
                :unelevated="snapshot.morse_atomic_clock === atom.key"
                :color="snapshot.morse_atomic_clock === atom.key ? 'indigo-7' : 'grey-7'"
                class="nixie-dev-controls__atom-btn"
                @click="commitMorseAtomicClock(atom.key)"
              />
            </div>
          </div>
        </div>
        <div class="text-center q-mb-xs q-px-xs nixie-dev-controls__morse-timeline">
          <div class="nixie-dev-controls__morse-timeline-hint text-grey-7">
            재생 타임라인: 총 {{ morsePlayDurationMsUi }}ms · PARIS <strong>{{ morseParisWpmApproxUi }}</strong> WPM · dit {{ morseDitMsUi }}ms · dash {{ morseDahMsUi }}ms · 점/대시 {{ morseDitMsUi }}ms · 글간격 {{ morseInterCharGapMsUi }}ms · 단어(^) {{ morseWordGapMsUi }}ms · 톤
            {{ morseToneHzUi }}Hz · 볼륨 {{ morseVolumeSlider }}% · 원자 {{ morseAtomicClockLabel }}
          </div>
        </div>
      </div>
    </transition>

    <div class="row items-center justify-center q-gutter-x-sm q-mt-xs nixie-dev-controls__action-row">
      <q-btn dense outline color="primary" size="sm" class="nixie-dev-controls__action-btn" label="스냅샷 기본값" @click="nmap.resetToDefaults()" />
      <q-btn dense outline color="grey-6" size="sm" class="nixie-dev-controls__action-btn" :label="snapshot.demo_hud_morse_enabled ? '상세 접기' : '상세 펼치기'" @click="nmap.setDemoHudMorseEnabled(!snapshot.demo_hud_morse_enabled)" />
    </div>
  </div>
</template>

<script setup>
import { NIXIE_HUD_MARQUEE } from '@system/nixie/nixieUiConfig'
import { useNmapSnapshotStore } from '@system/store/nmapSnapshotStore'
import { encodeTextToMorseHudText, normalizeDemoHudText, scrollOffsetToCenterToken } from '@system/nixie/nixieDotMap'
import { buildMorseSoundTimeline, buildMorseSoundTimelineWithMeta, clampMorseDitMs, morseTimelineTotalMs } from '@system/nixie/morseTimeline'
import { MORSE_MASTER_GAIN_MAX, getMorsePlaybackProgress01, playMorseTimeline, readMorseScopeTimeDomain, setMorseCarrierFrequencyHz, setMorseMasterGainLinear, setMorseStereoPanValue, stopMorsePlayback } from '@system/nixie/morseWebAudio'
import AudioScopeCanvas from '@engines/audio/components/AudioScopeCanvas.vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

defineProps({
  /** Nexion 우측 패널 아코디언 안에 넣을 때 true (제목·외곽선 생략) */
  embedded: {
    type: Boolean,
    default: false,
  },
})

const nmap = useNmapSnapshotStore()
const $q = useQuasar()
const { snapshot } = storeToRefs(nmap)
const hasHangulChar = /[\u3131-\u318e\uac00-\ud7a3]/
const hudDraft = ref('')
const hudInputEl = ref(null)
const hudInputFocused = ref(false)
const morsePlaying = ref(false)
const morseLoopEnabled = ref(false)
const morseLoopRequested = ref(false)
const morseAtomicClockHostEl = ref(null)
const isAtomicClockCompact = ref(false)
let morseAtomicClockResizeObserver = null
/** dit 변경 등으로 재생이 겹칠 때 이전 `finally`가 UI 상태를 덮어쓰지 않게 함 */
let morsePlayGeneration = 0
const morseAtomicClockOptions = [
  { key: 'H_1420MHz', label: 'H 1420MHz', tooltip: 'Hydrogen' },
  { key: 'Cs_9192631770Hz', label: 'Cs 9.19GHz', tooltip: 'Cesium' },
  { key: 'Rb_6834682610Hz', label: 'Rb 6.83GHz', tooltip: 'Rubidium' },
  { key: 'Sr_429THz', label: 'Sr 429THz', tooltip: 'Strontium' },
  { key: 'Yb_518THz', label: 'Yb 518THz', tooltip: 'Ytterbium' },
  { key: 'YbPlus_E2_688THz', label: 'Yb+ E2 688THz', tooltip: 'Ytterbium Ion (E2)' },
  { key: 'YbPlus_E3_642THz', label: 'Yb+ E3 642THz', tooltip: 'Ytterbium Ion (E3)' },
  { key: 'HgPlus_1064THz', label: 'Hg+ 1064THz', tooltip: 'Mercury Ion' },
  { key: 'AlPlus_1121THz', label: 'Al+ 1121THz', tooltip: 'Aluminium Ion' },
  { key: 'CaPlus_411THz', label: 'Ca+ 411THz', tooltip: 'Calcium Ion' },
  { key: 'Mg_655THz', label: 'Mg 655THz', tooltip: 'Magnesium' },
  { key: 'InPlus_1267THz', label: 'In+ 1267THz', tooltip: 'Indium Ion' },
  { key: 'TlPlus_1483THz', label: 'Tl+ 1483THz', tooltip: 'Thallium Ion' },
  { key: 'Dy_235THz', label: 'Dy 235THz', tooltip: 'Dysprosium' },
  { key: 'Th229_Nuclear', label: 'Th-229 Nuclear', tooltip: 'Thorium-229 Nuclear Clock' },
]
/** 원자 프리셋별 DIT(ms) 기본값 — 체험용 1차 매핑 */
const morseAtomicClockDitPresetMs = {
  H_1420MHz: 60,
  Cs_9192631770Hz: 48,
  Rb_6834682610Hz: 52,
  Sr_429THz: 66,
  Yb_518THz: 64,
  YbPlus_E2_688THz: 58,
  YbPlus_E3_642THz: 62,
  HgPlus_1064THz: 46,
  AlPlus_1121THz: 44,
  CaPlus_411THz: 72,
  Mg_655THz: 56,
  InPlus_1267THz: 42,
  TlPlus_1483THz: 40,
  Dy_235THz: 84,
  Th229_Nuclear: 96,
}
const MORSE_TONE_MIN_HZ = 1
const MORSE_TONE_MAX_HZ = 12000
const MORSE_TONE_LOG_STEPS = 1000

/** 닉시 마퀴: 슬라이더는 클수록 빠름 · 스토어는 틱 간격(ms). `SUM - ui` → ui=max 일 때 `intervalMsMin`(가장 빠름) */
const HUD_MARQUEE_MS_MIN = NIXIE_HUD_MARQUEE.marqueeSpeedUiMin
const HUD_MARQUEE_MS_MAX = NIXIE_HUD_MARQUEE.marqueeSpeedUiMax
const HUD_MARQUEE_MS_SUM = HUD_MARQUEE_MS_MIN + HUD_MARQUEE_MS_MAX

const hudMarqueeSpeedUi = computed(() => {
  const ms = snapshot.value.hud_marquee_interval_ms ?? NIXIE_HUD_MARQUEE.intervalMs
  return HUD_MARQUEE_MS_SUM - ms
})
const hudMarqueeSpeedUiRounded = computed(() => `${Math.round(hudMarqueeSpeedUi.value)}`)

function commitHudMarqueeSpeedUi(ui) {
  nmap.setHudMarqueeIntervalMs(HUD_MARQUEE_MS_SUM - Math.round(Number(ui)))
}

/** 모스 슬라이더: 드래그는 로컬만, 손 뗄 때(@change) 스토어·재생 반영 */
const morseDitSlider = ref(60)
/** 로그 스케일 톤 슬라이더 위치(0~MORSE_TONE_LOG_STEPS) */
const morseToneSlider = ref(0)
const morseVolumeSlider = ref(35)

/** 사운드 레이어 4축 — 단계 A: 0~100 로컬만, 오디오 미연동 */
const soundLayerFilter = ref(0)
const soundLayerRelease = ref(0)
const soundLayerDetune = ref(0)
const soundLayerJitter = ref(0)

function clampMorseToneHz(v) {
  const n = Math.round(Number(v) || MORSE_TONE_MIN_HZ)
  return Math.max(MORSE_TONE_MIN_HZ, Math.min(MORSE_TONE_MAX_HZ, n))
}

function toneSliderPosToHz(pos) {
  const p = Math.max(0, Math.min(MORSE_TONE_LOG_STEPS, Number(pos) || 0))
  const ratio = p / MORSE_TONE_LOG_STEPS
  const hz = MORSE_TONE_MIN_HZ * Math.pow(MORSE_TONE_MAX_HZ / MORSE_TONE_MIN_HZ, ratio)
  return clampMorseToneHz(hz)
}

function toneHzToSliderPos(hz) {
  const h = clampMorseToneHz(hz)
  const ratio = Math.log(h / MORSE_TONE_MIN_HZ) / Math.log(MORSE_TONE_MAX_HZ / MORSE_TONE_MIN_HZ)
  return Math.round(ratio * MORSE_TONE_LOG_STEPS)
}

/** 스냅샷은 `applyPatch` 때마다 객체 전체가 갈아끼워짐. 배열을 watch 소스로 쓰면 매번 새 참조라
 *  다른 필드(신뢰도·엔트로피 등)만 바뀌어도 콜백이 돌아 로컬 슬라이더가 덮어써져 핸들/값이 엇갈림.
 *  모스 필드 **스칼라**만 각각 watch 해서 실제 변경 시에만 동기화한다. */
watch(
  () => snapshot.value.morse_dit_ms,
  (v) => {
    morseDitSlider.value = v
  },
  { immediate: true },
)
watch(
  () => snapshot.value.morse_tone_hz,
  (v) => {
    morseToneSlider.value = toneHzToSliderPos(v)
  },
  { immediate: true },
)
watch(
  () => snapshot.value.morse_volume,
  (v) => {
    morseVolumeSlider.value = v
  },
  { immediate: true },
)

const showHudDecomposedLine = computed(() => hasHangulChar.test(hudDraft.value ?? ''))
/** 분해 줄·모스 미리보기 중 하나라도 쓰면 그리드 상단에 한 줄로 표시 */
const showHudPreviewRow = computed(() => showHudDecomposedLine.value || snapshot.value.demo_hud_morse_enabled)
const hudDecomposedPreview = computed(() => normalizeDemoHudText(hudDraft.value ?? ''))
const hudMorsePreview = computed(() => encodeTextToMorseHudText(hudDraft.value ?? ''))

/** 슬라이더 값 기준(드래그 중 포함) — 타임라인 힌트·표시용 */
const morseDitMsUi = computed(() => clampMorseDitMs(morseDitSlider.value))

/** PARIS 기준 관용 환산: WPM ≈ 1200 / dit(ms) — 교육·교신에서 흔한 참고값(엄밀한 시험 단위는 아님) */
const morseParisWpmApproxUi = computed(() => {
  const d = morseDitMsUi.value
  if (d <= 0) return 0
  return Math.max(1, Math.round(1200 / d))
})

const morseDahMsUi = computed(() => morseDitMsUi.value * 3)
const morseInterCharGapMsUi = computed(() => morseDitMsUi.value * 3)
const morseWordGapMsUi = computed(() => morseDitMsUi.value * 7)
const morseToneHzUi = computed(() => toneSliderPosToHz(morseToneSlider.value))
const morseAtomicClockLabel = computed(() => {
  const key = snapshot.value.morse_atomic_clock
  const found = morseAtomicClockOptions.find((x) => x.key === key)
  return found ? found.label : 'H 1420MHz'
})
const morseAtomicClockSelectOptions = computed(() => morseAtomicClockOptions.map((x) => ({ label: x.label, value: x.key })))

const morsePlayDurationMsUi = computed(() => {
  if (!snapshot.value.demo_hud_morse_enabled) return 0
  const t = normalizeDemoHudText(snapshot.value.demo_hud_text ?? '')
  if (!t.length) return 0
  return morseTimelineTotalMs(buildMorseSoundTimeline(t, morseDitMsUi.value))
})

/** HUD 입력 기준 모스 미리듣기(모스 출력과 동일 파이프라인) */
const canPlayMorsePreview = computed(() => {
  if ((morseVolumeSlider.value ?? 0) <= 0) return false
  const s = normalizeDemoHudText(encodeTextToMorseHudText(hudDraft.value ?? ''))
  if (!s.length) return false
  return buildMorseSoundTimeline(s, morseDitMsUi.value).length > 0
})

function onMorsePlayClick() {
  if (morsePlaying.value) {
    morseLoopRequested.value = false
    stopMorsePlayback()
    return
  }
  if (!snapshot.value.demo_hud_morse_enabled) nmap.setDemoHudMorseEnabled(true)
  if (canPlayMorsePreview.value) {
    void playMorsePreview()
    return
  }
  void focusHudInputWithGuide()
}

async function focusHudInputWithGuide() {
  await nextTick()
  hudInputEl.value?.focus?.()
  $q.notify({
    message: '재생할 값이 없습니다. HUD 입력창에 텍스트를 입력해 주세요.',
    color: 'deep-purple-7',
    textColor: 'white',
    position: 'bottom',
    timeout: 1700,
    group: 'nixie-hud-input-guide',
    progress: true,
  })
}

async function playMorsePreview() {
  if (!canPlayMorsePreview.value) return
  const gen = ++morsePlayGeneration
  morseLoopRequested.value = true
  morsePlaying.value = true
  try {
    do {
      commitHudText()
      const s = normalizeDemoHudText(encodeTextToMorseHudText(hudDraft.value ?? ''))
      const dit = morseDitMsUi.value
      const { events, eventDisplayTokenIndex, eventHudCharRange } = buildMorseSoundTimelineWithMeta(s, dit)
      if (!events.length) break

      let lastHudScrollDedupe = NaN
      let lastHudTokenDedupe = NaN
      let lastHudScroll = snapshot.value.demo_hud_scroll_offset ?? 0
      const syncHud = (snapshot.value.morse_hud_sync_with_playback ?? true) && Boolean(snapshot.value.demo_hud_morse_enabled)
      /** 재생 시작 시점 기준 — 훅마다 snapshot 재읽기와 달리 고정(기본 true=디트·다시 강조) */
      const preferPerEventHighlight = snapshot.value.morse_hud_per_event_highlight === true

      function applyMorsePlaybackFrame(eventIndex, e) {
        const perEvent = preferPerEventHighlight
        const tok = eventDisplayTokenIndex[eventIndex] ?? -1
        const scrollForTok = tok >= 0 ? scrollOffsetToCenterToken(s, tok) : lastHudScroll

        if (!perEvent) {
          if (tok < 0) return
          const scroll = scrollForTok
          if (scroll !== lastHudScrollDedupe || tok !== lastHudTokenDedupe) {
            lastHudScrollDedupe = scroll
            lastHudTokenDedupe = tok
            lastHudScroll = scroll
            nmap.setMorsePlaybackHudFrame(scroll, tok)
          }
          return
        }

        if (tok < 0) {
          nmap.setMorsePlaybackHudFrame(lastHudScroll, -1, { accentActive: false })
          return
        }

        lastHudScroll = scrollForTok
        if (e.kind === 'dot' || e.kind === 'dash') {
          const r = eventHudCharRange[eventIndex]
          if (r && r.end > r.start) {
            nmap.setMorsePlaybackHudFrame(scrollForTok, tok, { highlightCharRange: r })
          }
        } else {
          nmap.setMorsePlaybackHudFrame(scrollForTok, tok, { accentActive: false })
        }
      }

      await playMorseTimeline(events, {
        frequencyHz: morseToneHzUi.value,
        volume: (Math.max(0, Math.min(100, Math.round(Number(morseVolumeSlider.value) || 0))) / 100) * MORSE_MASTER_GAIN_MAX,
        stereoPan: clampMorseStereoPan(snapshot.value.morse_stereo_pan),
        onAfterPrepare: () => {
          if (!syncHud) return
          nmap.beginMorsePlaybackHudSync({
            generation: gen,
            restoreScroll: snapshot.value.demo_hud_scroll_offset ?? 0,
          })
          lastHudScroll = snapshot.value.demo_hud_scroll_offset ?? 0
          if (preferPerEventHighlight) {
            const fi = events.findIndex((ev, idx) => (ev.kind === 'dot' || ev.kind === 'dash') && (eventDisplayTokenIndex[idx] ?? -1) >= 0)
            if (fi >= 0) {
              const tok = eventDisplayTokenIndex[fi] ?? -1
              const r = eventHudCharRange[fi]
              if (tok >= 0 && r && r.end > r.start) {
                const scroll = scrollOffsetToCenterToken(s, tok)
                lastHudScrollDedupe = scroll
                lastHudTokenDedupe = tok
                lastHudScroll = scroll
                nmap.setMorsePlaybackHudFrame(scroll, tok, { highlightCharRange: r })
              }
            }
          } else {
            const firstTokIdx = eventDisplayTokenIndex.findIndex((t) => t >= 0)
            if (firstTokIdx >= 0) {
              const tok = eventDisplayTokenIndex[firstTokIdx] ?? -1
              if (tok < 0) return
              const scroll = scrollOffsetToCenterToken(s, tok)
              lastHudScrollDedupe = scroll
              lastHudTokenDedupe = tok
              lastHudScroll = scroll
              nmap.setMorsePlaybackHudFrame(scroll, tok)
            }
          }
        },
        playbackHooks: {
          onEventStart: (i, e) => {
            if (gen !== morsePlayGeneration) return
            if (syncHud) {
              applyMorsePlaybackFrame(i, e)
            }
          },
          onComplete: () => {
            if (syncHud) nmap.endMorsePlaybackHudSync()
          },
          onStopped: () => {
            if (syncHud) nmap.endMorsePlaybackHudSync()
          },
        },
      })
      if (!morseLoopRequested.value || gen !== morsePlayGeneration) break
    } while (morseLoopEnabled.value)
  } finally {
    if (gen === morsePlayGeneration) {
      morseLoopRequested.value = false
      morsePlaying.value = false
    }
  }
}

function onMorseDitSliderChange(val) {
  nmap.setMorseDitMs(val)
  if (morsePlaying.value) {
    morsePlayGeneration += 1
    stopMorsePlayback({ immediate: true })
    void playMorsePreview()
  }
}

function onMorseToneSliderChange(val) {
  const hz = toneSliderPosToHz(val)
  nmap.setMorseToneHz(hz)
  setMorseCarrierFrequencyHz(hz)
}

function onMorseVolumeSliderChange(val) {
  nmap.setMorseVolume(val)
  setMorseMasterGainLinear((Math.max(0, Math.min(100, val)) / 100) * MORSE_MASTER_GAIN_MAX)
}

function clampMorseStereoPan(v) {
  const n = Number(v)
  if (n <= -0.5) return -1
  if (n >= 0.5) return 1
  return 0
}

function pullMorseScopeBytes(bytes) {
  return readMorseScopeTimeDomain(bytes)
}

/** 스코프 캔버스 플레이헤드 — 재생 중에만 0~1, 아니면 null */
function pullMorsePlayheadProgress() {
  if (!morsePlaying.value) return null
  return getMorsePlaybackProgress01()
}

/** @param pan {-1|0|1} L / ALL / R */
function commitMorseStereoPan(pan) {
  nmap.setMorseStereoPan(pan)
  setMorseStereoPanValue(pan)
}

function commitMorseAtomicClock(key) {
  if (!key) return
  const wasPlaying = morsePlaying.value
  nmap.setMorseAtomicClock(key)
  const nextDit = morseAtomicClockDitPresetMs[key] ?? 60
  /** 버튼 클릭 즉시: 슬라이더 핸들 + 실제 DIT 적용(재생 중이면 재시작) */
  morseDitSlider.value = nextDit
  onMorseDitSliderChange(nextDit)
  /** 원자 버튼 = 플레이 버튼 겸용(단, 이미 재생 중이면 자동 재생 트리거 금지) */
  if (!wasPlaying && canPlayMorsePreview.value) {
    void playMorsePreview()
  }
}

function updateAtomicClockCompactMode() {
  const host = morseAtomicClockHostEl.value
  const w = host?.clientWidth ?? 0
  /** 버튼 목록이 과밀해지기 시작하는 폭에서 select로 자동 전환 */
  isAtomicClockCompact.value = w > 0 && w <= 360
}

function bindAtomicClockResizeObserver() {
  if (!morseAtomicClockResizeObserver) return
  morseAtomicClockResizeObserver.disconnect()
  const host = morseAtomicClockHostEl.value
  if (host) morseAtomicClockResizeObserver.observe(host)
}

onMounted(() => {
  hudDraft.value = snapshot.value.demo_hud_text_raw ?? ''
  morseAtomicClockResizeObserver = new ResizeObserver(() => updateAtomicClockCompactMode())
  void nextTick(() => {
    bindAtomicClockResizeObserver()
    updateAtomicClockCompactMode()
  })
})

onBeforeUnmount(() => {
  stopMorsePlayback({ immediate: true })
  if (morseAtomicClockResizeObserver) {
    morseAtomicClockResizeObserver.disconnect()
    morseAtomicClockResizeObserver = null
  }
})

watch(
  () => snapshot.value.demo_hud_text_raw,
  (v) => {
    if (!hudInputFocused.value) hudDraft.value = v ?? ''
  },
)

watch(
  () => snapshot.value.demo_hud_morse_enabled,
  async (enabled) => {
    if (!enabled) {
      isAtomicClockCompact.value = false
      return
    }
    await nextTick()
    bindAtomicClockResizeObserver()
    updateAtomicClockCompactMode()
  },
)

function commitHudText() {
  nmap.setDemoHudText(hudDraft.value)
}

function onHudBlur() {
  hudInputFocused.value = false
  commitHudText()
}
</script>

<style scoped lang="scss">
.q-my-xs {
  margin-top: 8px;
  margin-bottom: 0;
}

.nixie-dev-controls {
  padding: 6px 8px;
  /* 높이 제한·내부 overflow 제거 — 우측 패널 `panel-scroll-area`만 세로 스크롤 */
  overflow: visible;
}

.nixie-dev-controls--embedded {
  padding: 4px 6px 8px;
  border-bottom: none;
  background: transparent;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
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

.nixie-dev-controls__morse-detail {
  overflow: hidden;
}

.morse-detail-expand-enter-active,
.morse-detail-expand-leave-active {
  transition:
    max-height 0.24s ease,
    opacity 0.2s ease,
    transform 0.2s ease;
}

.morse-detail-expand-enter-from,
.morse-detail-expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-4px);
}

.morse-detail-expand-enter-to,
.morse-detail-expand-leave-from {
  max-height: 1200px;
  opacity: 1;
  transform: translateY(0);
}

.nixie-dev-controls__state-wrap {
  flex-wrap: wrap;
}

.nixie-dev-controls__state-group {
  flex: 0 0 auto;
}

.nixie-dev-controls__action-row {
  flex-wrap: wrap;
}

.nixie-dev-controls__action-btn {
  min-width: 90px;
}

.nixie-dev-controls__slider-row {
  gap: 5px;
}

/** HUD 동기 + 강조 한 행 — 두 묶음 사이 간격 */
.nixie-dev-controls__morse-sync-row {
  column-gap: 18px;
  row-gap: 6px;
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

/** 모스 음원 스코프 캔버스 */
.nixie-dev-controls__morse-scope {
  position: relative;
  overflow: visible;
  min-width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.09);
}

.nixie-dev-controls__morse-loop-btn :deep(.q-icon) {
  font-size: 0.95rem;
}

.nixie-dev-controls__morse-pan-group {
  min-width: 0;
  flex: 1 1 auto;
  justify-content: stretch;
}

.nixie-dev-controls__morse-pan-group :deep(.q-btn) {
  flex: 1 1 0;
}

.nixie-dev-controls__atom-wrap {
  min-width: 0;
  flex-wrap: wrap;
}

.nixie-dev-controls__atom-btn {
  flex: 0 0 auto;
}

.nixie-dev-controls__morse-timeline-hint {
  font-size: 10px;
  line-height: 1.2;
  opacity: 0.88;
}

/** HUD: 3열 그리드 — `grid-template-areas` 만으로 분해 줄 유무에 따라 행 구성 */
.nixie-dev-controls__hud {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 5px;
  row-gap: 4px;
  align-items: center;
  margin-bottom: 4px;
  grid-template-areas: 'label input';
}

.nixie-dev-controls__hud--preview {
  grid-template-areas:
    'preview preview'
    'label input';
}

.nixie-dev-controls__hud-label {
  grid-area: label;
  margin-right: 0;
}

.nixie-dev-controls__hud-field {
  grid-area: input;
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
  min-width: 2.5rem;
  white-space: nowrap;
}

/* 대문자 강제·자동 대문자 방지 — HUD에 입력한 대·소문자 그대로 표시 */
:deep(.nixie-dev-controls__hud-input) {
  text-transform: none;
  font-variant: normal;
}
</style>
