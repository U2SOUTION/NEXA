<!-- FileStructureHeader.vue
  파일 구조 헤더 컴포넌트
  분석 대상 입력 및 분석 버튼
-->

<template>
  <div class="file-structure-header">
    <div class="header-content q-pa-md">
      <div class="row items-center q-gutter-md">
        <div class="col">
          <q-input v-model="localAnalysisTarget" label="분석 대상" placeholder="예: /dev, src/pages, src/components/ui" outlined dense hint="라우트, 디렉토리 경로를 입력" @update:model-value="handleAnalysisTargetChange" @keyup.enter="handleAnalyze">
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-auto">
          <q-btn color="primary" label="분석" icon="play_arrow" :loading="isAnalyzing" @click="handleAnalyze" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  analysisTarget: {
    type: String,
    default: '',
  },
  isAnalyzing: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['analyze', 'analysis-target-change'])

// 로컬 입력값 상태 (사용자가 입력한 최신 값 추적)
const localAnalysisTarget = ref(props.analysisTarget)

// props 변경 시 로컬 상태 동기화
watch(
  () => props.analysisTarget,
  (newValue) => {
    localAnalysisTarget.value = newValue
  },
  { immediate: true },
)

function handleAnalyze() {
  // 로컬 상태의 최신 입력값을 전달
  emit('analyze', localAnalysisTarget.value)
}

function handleAnalysisTargetChange(value) {
  // 로컬 상태 업데이트
  localAnalysisTarget.value = value
  // 부모에게 변경 사항 알림
  emit('analysis-target-change', value)
}
</script>

<style lang="scss" scoped>
.file-structure-header {
  background: var(--nexa-background-darker);
  border-bottom: 1px solid var(--nexa-border-color);
}

.header-content {
  .header-title {
    color: var(--nexa-text-primary);
    font-size: 0.875rem;
    font-weight: 600;
  }
}
</style>
