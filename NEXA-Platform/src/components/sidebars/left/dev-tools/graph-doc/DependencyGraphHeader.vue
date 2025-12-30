<!-- DependencyGraphHeader.vue
  의존성 그래프 헤더 컴포넌트
  분석 대상 입력 및 분석 버튼
-->

<template>
  <div class="dependency-graph-header">
    <div class="header-content q-pa-md">
      <div class="row items-center q-gutter-md">
        <div class="col">
          <q-input
            :model-value="analysisTarget"
            label="분석 대상"
            placeholder="예: /dev, /portfolio, src/pages/DevelopmentPage.vue"
            outlined
            dense
            @update:model-value="handleAnalysisTargetChange"
            @keyup.enter="handleAnalyze"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            label="분석"
            icon="play_arrow"
            :loading="isAnalyzing"
            @click="handleAnalyze"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
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

function handleAnalyze() {
  emit('analyze')
}

function handleAnalysisTargetChange(value) {
  emit('analysis-target-change', value)
}
</script>

<style lang="scss" scoped>
.dependency-graph-header {
  background: var(--nexa-background-darker);
  border-bottom: 1px solid var(--nexa-border-color);
}

.header-content {
  // 헤더 컨텐츠 스타일
}
</style>
