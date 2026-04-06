<!--
  NIXIE N-MAP 시뮬레이션 — 스토어 actions 만 호출.
  Nexion 우측 패널 아코디언에 embedded 로 배치(배포 시 체험용 노출 가능).
  명세: docs/Nexion/[NXN] [SPEC] 심플 닉시 GSAP 적용 UI 구현 v0.1.md
-->
<template>
  <div class="nixie-dev-controls" :class="{ 'nixie-dev-controls--embedded': embedded }">
    <template v-if="!embedded">
      <div class="text-caption text-weight-bold q-mb-xs">NIXIE · N-MAP 시뮬</div>
      <q-separator class="q-mb-sm" />
    </template>

    <div class="text-overline q-mb-xs">흐름 / 펄스</div>
    <div class="row q-col-gutter-xs q-mb-sm">
      <div class="col-4"><q-btn dense outline size="sm" class="full-width" label="FLOW" @click="nmap.setHowState('FLOW')" /></div>
      <div class="col-4"><q-btn dense outline size="sm" class="full-width" label="STUCK" @click="nmap.setHowState('STUCK')" /></div>
      <div class="col-4"><q-btn dense outline size="sm" class="full-width" label="VOID" @click="nmap.setHowState('VOID')" /></div>
    </div>
    <div class="row q-col-gutter-xs q-mb-sm">
      <div class="col-4"><q-btn dense flat size="sm" class="full-width" label="WILL" @click="nmap.setWhoPulse('WILL')" /></div>
      <div class="col-4"><q-btn dense flat size="sm" class="full-width" label="ECHO" @click="nmap.setWhoPulse('ECHO')" /></div>
      <div class="col-4"><q-btn dense flat size="sm" class="full-width" label="ASK" @click="nmap.setWhoPulse('ASK')" /></div>
    </div>

    <div class="text-overline q-mb-xs">신뢰도</div>
    <div class="row items-center q-gutter-sm q-mb-xs">
      <q-slider :model-value="snapshot.confidence_score" :min="0" :max="100" label color="primary" class="col" @update:model-value="nmap.setConfidenceScore" />
      <span class="text-caption" style="min-width: 2rem">{{ snapshot.confidence_score }}</span>
    </div>
    <div class="row q-col-gutter-xs q-mb-sm">
      <q-btn dense outline size="sm" label="고신뢰 100" @click="nmap.setConfidenceScore(100)" />
      <q-btn dense outline size="sm" label="저신뢰 90" @click="nmap.setConfidenceScore(90)" />
      <q-btn dense outline size="sm" label="저신뢰 80" @click="nmap.setConfidenceScore(80)" />
    </div>

    <div class="text-overline q-mb-xs">경고 토큰</div>
    <div class="row q-col-gutter-xs q-mb-sm">
      <q-btn dense outline size="sm" label="타임아웃" @click="nmap.setWarnToken('ADAPTER_TIMEOUT')" />
      <q-btn dense flat size="sm" label="해제" @click="nmap.setWarnToken(null)" />
    </div>

    <q-separator class="q-my-sm" />

    <div class="text-overline q-mb-xs">로우-엔트로피</div>
    <div class="row q-col-gutter-xs q-mb-sm">
      <q-btn dense outline size="sm" label="full" @click="nmap.setUiEntropyMode('full')" />
      <q-btn dense outline size="sm" label="minimal" @click="nmap.setUiEntropyMode('minimal')" />
      <q-btn dense outline size="sm" label="static" @click="nmap.setUiEntropyMode('static')" />
    </div>

    <div class="text-overline q-mb-xs">가상 실행 (Ghost)</div>
    <q-toggle :model-value="snapshot.is_virtual" dense label="is_virtual" class="q-mb-sm" @update:model-value="nmap.setIsVirtual" />

    <div class="text-overline q-mb-xs">Nebula Influx</div>
    <div class="row q-col-gutter-xs q-mb-sm">
      <q-btn dense outline size="sm" label="외부 쉘 유입" @click="nmap.simulateNebulaInflux()" />
      <q-btn dense flat size="sm" label="로컬 복귀" @click="nmap.clearNebulaToLocal()" />
    </div>

    <div class="text-overline q-mb-xs">임계값 (Threshold)</div>
    <div class="row items-center q-gutter-sm q-mb-sm">
      <q-slider :model-value="snapshot.user_defined_threshold" :min="70" :max="100" label color="amber" class="col" @update:model-value="nmap.setUserDefinedThreshold" />
      <span class="text-caption" style="min-width: 2rem">{{ snapshot.user_defined_threshold }}</span>
    </div>
    <div class="row q-col-gutter-xs q-mb-sm">
      <q-btn dense outline size="sm" label="95" @click="nmap.setUserDefinedThreshold(95)" />
      <q-btn dense outline size="sm" label="98" @click="nmap.setUserDefinedThreshold(98)" />
    </div>

    <q-separator class="q-my-sm" />

    <div class="text-overline q-mb-xs">HUD 텍스트 시뮬 (A–Z·스페이스, 길이 제한 없음)</div>
    <div class="text-caption text-grey-6 q-mb-xs">반영: 필드 밖 클릭(포커스 아웃) 또는 Enter. 한글·숫자는 제거되며 A–Z만 HUD에 그려짐. 한 번에 보이는 글자 수는 HUD 폭(현재 3글자).</div>
    <q-input
      v-model="hudDraft"
      dense
      outlined
      class="q-mb-xs"
      placeholder="예: NEXA MAP (포커스 아웃 또는 Enter 로 HUD 반영)"
      @focus="hudInputFocused = true"
      @blur="onHudBlur"
      @keydown.enter.prevent="commitHudText"
    />
    <div class="row q-col-gutter-xs q-mb-sm">
      <q-btn dense flat size="sm" label="텍스트 지우기" @click="clearHudText" />
    </div>

    <q-separator class="q-my-sm" />
    <q-btn dense flat color="primary" size="sm" label="스냅샷 기본값" @click="nmap.resetToDefaults()" />
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
  padding: 8px;
  max-height: 55vh;
  overflow: auto;
}

.nixie-dev-controls--embedded {
  padding: 4px 8px 12px;
  max-height: min(58vh, 520px);
  border-bottom: none;
  background: transparent;
}
</style>
