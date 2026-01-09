<!-- DependencyAnalysisList.vue
  의존성 분석 목록 컴포넌트
  분석 결과 목록 표시 및 선택 기능
-->

<template>
  <div class="dependency-analysis-list-container">
    <q-scroll-area class="dependency-analysis-list-scroll-area">
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-section q-pa-lg text-center">
        <q-spinner color="primary" size="3em" />
        <div class="q-mt-md text-caption">분석 결과를 불러오는 중...</div>
      </div>

      <!-- 분석 결과 목록 -->
      <q-list v-else separator>
        <q-item
          v-for="result in analysisResults"
          :key="result.id"
          clickable
          :active="selectedResult?.id === result.id"
          active-class="result-item-active"
          @click="handleResultSelect(result)"
        >
          <q-item-section avatar>
            <q-icon :name="getResultIcon(result.type)" :color="getResultColor(result.type)" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="result-name">{{ result.name || '이름 없음' }}</q-item-label>
            <q-item-label caption class="result-meta">
              <span v-if="result.package">{{ result.package }}</span>
              <span v-if="result.version" class="q-ml-sm">{{ result.version }}</span>
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-icon name="chevron_right" color="grey-7" />
          </q-item-section>
        </q-item>

        <!-- 결과가 없을 때 -->
        <div v-if="analysisResults.length === 0" class="empty-section q-pa-lg text-center">
          <q-icon name="hub" size="48px" color="grey-5" class="q-mb-md" />
          <div class="text-grey-7">의존성 분석 결과가 없습니다.</div>
        </div>
      </q-list>
    </q-scroll-area>
  </div>
</template>

<script setup>
defineProps({
  analysisResults: {
    type: Array,
    default: () => [],
  },
  selectedResult: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['result-selected'])

function handleResultSelect(result) {
  emit('result-selected', result)
}

function getResultIcon(type) {
  const icons = {
    package: 'inventory_2',
    unused: 'warning',
    circular: 'sync',
  }
  return icons[type] || 'info'
}

function getResultColor(type) {
  const colors = {
    package: 'blue',
    unused: 'orange',
    circular: 'red',
  }
  return colors[type] || 'grey-7'
}
</script>

<style lang="scss" scoped>
.dependency-analysis-list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dependency-analysis-list-scroll-area {
  flex: 1;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.result-item-active {
  background-color: var(--nexa-surface-hover);
}

.result-name {
  color: var(--nexa-text-primary);
  font-weight: 500;
  word-break: break-all;
}

.result-meta {
  color: var(--nexa-text-secondary);
}

.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}
</style>
