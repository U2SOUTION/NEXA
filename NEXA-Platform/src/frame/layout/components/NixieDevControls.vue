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

    <!-- 흐름 + 펄스 -->
    <div class="row items-center q-gutter-x-xs q-mb-xs no-wrap">
      <span class="nixie-dev-controls__lbl">흐름</span>
      <q-btn dense outline size="sm" padding="xs sm" label="FLOW" @click="nmap.setHowState('FLOW')" />
      <q-btn dense outline size="sm" padding="xs sm" label="STUCK" @click="nmap.setHowState('STUCK')" />
      <q-btn dense outline size="sm" padding="xs sm" label="VOID" @click="nmap.setHowState('VOID')" />
      <q-separator vertical inset class="q-mx-xs" />
      <span class="nixie-dev-controls__lbl">펄스</span>
      <q-btn dense flat size="sm" padding="xs sm" label="WILL" @click="nmap.setWhoPulse('WILL')" />
      <q-btn dense flat size="sm" padding="xs sm" label="ECHO" @click="nmap.setWhoPulse('ECHO')" />
      <q-btn dense flat size="sm" padding="xs sm" label="ASK" @click="nmap.setWhoPulse('ASK')" />
    </div>

    <!-- 신뢰도 -->
    <div class="row items-center q-gutter-x-xs q-mb-xs">
      <span class="nixie-dev-controls__lbl">신뢰도</span>
      <q-slider :model-value="snapshot.confidence_score" :min="0" :max="100" dense color="primary" class="nixie-dev-controls__slider col" @update:model-value="nmap.setConfidenceScore" />
      <span class="text-caption nixie-dev-controls__num">{{ snapshot.confidence_score }}</span>
    </div>

    <!-- 경고 -->
    <div class="row items-center q-gutter-x-xs q-mb-xs">
      <span class="nixie-dev-controls__lbl">경고</span>
      <q-btn dense outline size="sm" padding="xs sm" label="타임아웃" @click="nmap.setWarnToken('ADAPTER_TIMEOUT')" />
      <q-btn dense flat size="sm" padding="xs sm" label="해제" @click="nmap.setWarnToken(null)" />
    </div>

    <!-- 엔트로피 + 가상 + Nebula -->
    <div class="row items-center q-gutter-x-xs q-mb-xs flex-wrap">
      <span class="nixie-dev-controls__lbl">엔트로피</span>
      <q-btn dense outline size="sm" padding="xs sm" label="full" @click="nmap.setUiEntropyMode('full')" />
      <q-btn dense outline size="sm" padding="xs sm" label="minimal" @click="nmap.setUiEntropyMode('minimal')" />
      <q-btn dense outline size="sm" padding="xs sm" label="static" @click="nmap.setUiEntropyMode('static')" />
      <q-separator vertical inset class="q-mx-xs" />
      <q-toggle :model-value="snapshot.is_virtual" dense left-label label="가상" @update:model-value="nmap.setIsVirtual" />
      <q-separator vertical inset class="q-mx-xs" />
      <q-btn dense outline size="sm" padding="xs sm" label="Nebula" @click="nmap.simulateNebulaInflux()" />
      <q-btn dense flat size="sm" padding="xs sm" label="Lokeol" @click="nmap.clearNebulaToLocal()" />
    </div>

    <!-- 임계값 -->
    <div class="row items-center q-gutter-x-xs q-mb-xs">
      <span class="nixie-dev-controls__lbl">임계값</span>
      <q-slider :model-value="snapshot.user_defined_threshold" :min="70" :max="100" dense color="amber" class="nixie-dev-controls__slider col" @update:model-value="nmap.setUserDefinedThreshold" />
      <span class="text-caption nixie-dev-controls__num">{{ snapshot.user_defined_threshold }}</span>
    </div>

    <q-separator class="q-my-xs" />

    <!-- HUD 텍스트 -->
    <div class="row items-start q-gutter-x-xs q-mb-xs">
      <span class="nixie-dev-controls__lbl q-pt-sm">HUD</span>
      <div class="col">
        <q-input v-model="hudDraft" dense outlined hide-bottom-space placeholder="A–Z, blur/Enter 반영" @focus="hudInputFocused = true" @blur="onHudBlur" @keydown.enter.prevent="commitHudText" />
      </div>
      <q-btn dense flat size="sm" padding="xs sm" class="q-mt-xs" label="지우기" @click="clearHudText" />
    </div>

    <q-btn dense flat color="primary" size="sm" class="full-width q-mt-xs" label="스냅샷 기본값" @click="nmap.resetToDefaults()" />
  </div>
</template>

<script setup>
import { useNmapSnapshotStore } from '@system/store/nmapSnapshotStore'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'

defineProps({
  /** Nexion 우측 패널 아코디언 안에 넣을 때 true (제목·외곽선 생략) */
  embedded: {
    type: Boolean,
    default: false,
  },
})

const nmap = useNmapSnapshotStore()
const { snapshot } = storeToRefs(nmap)

/** 타이핑은 로컬에만 두고, blur / Enter 에서 스토어 반영 → 닉시 HUD 갱신 */
const hudDraft = ref('')
const hudInputFocused = ref(false)

onMounted(() => {
  hudDraft.value = snapshot.value.demo_hud_text ?? ''
})

watch(
  () => snapshot.value.demo_hud_text,
  (v) => {
    if (!hudInputFocused.value) hudDraft.value = v ?? ''
  },
)

function commitHudText() {
  nmap.setDemoHudText(hudDraft.value)
  hudDraft.value = snapshot.value.demo_hud_text ?? ''
}

function onHudBlur() {
  hudInputFocused.value = false
  commitHudText()
}

function clearHudText() {
  nmap.setDemoHudText('')
  hudDraft.value = ''
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
  opacity: 0.72;
  min-width: 2.5rem;
}

.nixie-dev-controls__slider {
  min-width: 72px;
  max-width: 100%;
}

.nixie-dev-controls__num {
  min-width: 1.5rem;
  text-align: right;
}
</style>
