<template>
  <div class="performance-metrics-cards row q-gutter-md">
    <!-- FPS 카드 -->
    <div class="col metric-card" :class="{ 'metric-card-warning': fpsStatus === 'warning', 'metric-card-danger': fpsStatus === 'danger' }">
      <div class="metric-card-header">
        <q-icon name="speed" size="24px" class="q-mr-sm" />
        <span class="metric-card-title">FPS</span>
      </div>
      <div class="metric-card-value">{{ displayFPS }}</div>
      <div class="metric-card-footer">
        <span class="metric-card-label">평균: {{ averageFPS || '-' }}</span>
        <span class="metric-card-label">최소: {{ minFPS || '-' }}</span>
      </div>
      <div class="metric-card-description">초당 프레임 수 (Frames Per Second). 60이 이상적이며, 30 미만이면 성능 저하를 의미합니다.</div>
    </div>

    <!-- 메모리 카드 -->
    <div class="col metric-card" :class="{ 'metric-card-warning': memoryStatus === 'warning', 'metric-card-danger': memoryStatus === 'danger' }">
      <div class="metric-card-header">
        <q-icon name="memory" size="24px" class="q-mr-sm" />
        <span class="metric-card-title">메모리</span>
      </div>
      <div class="metric-card-value">{{ memoryUsed || '-' }}</div>
      <div class="metric-card-footer">
        <span class="metric-card-label">사용률: {{ memoryUsagePercent || '-' }}%</span>
        <span class="metric-card-label">한계: {{ memoryLimit || '-' }}</span>
      </div>
      <div class="metric-card-description">JavaScript 힙 메모리 사용량. 계속 증가하면 메모리 누수를 의미할 수 있습니다.</div>
    </div>

    <!-- LCP 카드 -->
    <div class="col metric-card" :class="{ 'metric-card-warning': lcpStatus === 'warning', 'metric-card-danger': lcpStatus === 'danger' }">
      <div class="metric-card-header">
        <q-icon name="image" size="24px" class="q-mr-sm" />
        <span class="metric-card-title">LCP</span>
      </div>
      <div class="metric-card-value">{{ lcpValue || '-' }}</div>
      <div class="metric-card-footer">
        <q-chip :label="lcpEvaluation" size="sm" :color="lcpChipColor" />
      </div>
      <div class="metric-card-description">Largest Contentful Paint. 페이지의 주요 콘텐츠가 로드되는 시간입니다. 2.5초 이하가 좋습니다.</div>
    </div>

    <!-- API 응답 카드 -->
    <div class="col metric-card" :class="{ 'metric-card-warning': apiStatus === 'warning', 'metric-card-danger': apiStatus === 'danger' }">
      <div class="metric-card-header">
        <q-icon name="api" size="24px" class="q-mr-sm" />
        <span class="metric-card-title">API 응답</span>
      </div>
      <div class="metric-card-value">{{ props.apiDuration || '-' }}</div>
      <div class="metric-card-footer">
        <span class="metric-card-label">요청: {{ props.apiCount || 0 }}개</span>
        <span class="metric-card-label">실패율: {{ props.apiErrorRate || 0 }}%</span>
      </div>
      <div class="metric-card-description">API 응답 시간 (최근 1분 평균). 500ms 이하가 좋으며, 1초를 초과하면 성능 문제가 있을 수 있습니다.</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { evaluateWebVital } from 'src/utils/performance/webVitalsCollector'

const props = defineProps({
  currentFPS: {
    type: Number,
    default: 0,
  },
  averageFPS: {
    type: Number,
    default: 0,
  },
  minFPS: {
    type: Number,
    default: 0,
  },
  memoryUsed: {
    type: String,
    default: '-',
  },
  memoryUsagePercent: {
    type: Number,
    default: 0,
  },
  memoryLimit: {
    type: String,
    default: '-',
  },
  lcpValue: {
    type: String,
    default: '-',
  },
  apiDuration: {
    type: String,
    default: '-',
  },
  apiCount: {
    type: Number,
    default: 0,
  },
  apiErrorRate: {
    type: Number,
    default: 0,
  },
})

// ⚠️ FPS 렌더링 문제: 부모에서 currentFPS.value는 업데이트되지만
// 자식 컴포넌트의 watch가 props 변경을 감지하지 못함
// 메모리/LCP는 템플릿에서 props를 직접 사용하여 정상 작동하지만,
// FPS는 watch + computed를 사용하여 반응성이 끊김
// FPS 값을 로컬 ref로 관리 (반응성 보장 시도)
const localCurrentFPS = ref(props.currentFPS)

// props.currentFPS 변경 감지 (작동 안 함 - watch가 트리거되지 않음)
watch(
  () => props.currentFPS,
  (newValue) => {
    localCurrentFPS.value = newValue
  },
  { immediate: true },
)

// FPS 표시 값
const displayFPS = computed(() => {
  const fps = localCurrentFPS.value
  return fps > 0 ? fps : '-'
})

// FPS 상태 (좋음/경고/위험)
const fpsStatus = computed(() => {
  const fps = localCurrentFPS.value
  if (fps === 0 || fps === null || fps === undefined) return 'unknown'
  if (fps < 20) return 'danger'
  if (fps < 30) return 'warning'
  return 'good'
})

// 메모리 상태
const memoryStatus = computed(() => {
  if (!props.memoryUsagePercent) return 'unknown'
  if (props.memoryUsagePercent > 80) return 'danger'
  if (props.memoryUsagePercent > 60) return 'warning'
  return 'good'
})

// LCP 상태 및 평가
const lcpStatus = computed(() => {
  if (!props.lcpValue || props.lcpValue === '-') return 'unknown'
  const lcpNum = parseFloat(props.lcpValue)
  if (isNaN(lcpNum)) return 'unknown'
  const evaluation = evaluateWebVital('lcp', lcpNum)
  if (evaluation === 'poor') return 'danger'
  if (evaluation === 'needs-improvement') return 'warning'
  return 'good'
})

const lcpEvaluation = computed(() => {
  if (!props.lcpValue || props.lcpValue === '-') return '측정 중'
  const lcpNum = parseFloat(props.lcpValue)
  if (isNaN(lcpNum)) return '측정 중'
  const evaluation = evaluateWebVital('lcp', lcpNum)
  const labels = {
    good: '좋음',
    'needs-improvement': '개선 필요',
    poor: '나쁨',
  }
  return labels[evaluation] || '측정 중'
})

const lcpChipColor = computed(() => {
  if (lcpStatus.value === 'danger') return 'negative'
  if (lcpStatus.value === 'warning') return 'warning'
  return 'positive'
})

// API 상태
const apiStatus = computed(() => {
  if (!props.apiDuration || props.apiDuration === '-') return 'unknown'
  const apiNum = parseFloat(props.apiDuration)
  if (isNaN(apiNum)) return 'unknown'
  if (apiNum > 1000) return 'danger'
  if (apiNum > 500) return 'warning'
  return 'good'
})
</script>

<style lang="scss" scoped>
.performance-metrics-cards {
  margin-bottom: 1.5rem;
}

.metric-card {
  background: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--nexa-border-hover);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.metric-card-warning {
    border-color: var(--nexa-warning);
  }

  &.metric-card-danger {
    border-color: var(--nexa-error);
  }
}

.metric-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  color: var(--nexa-text-secondary);
}

.metric-card-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--nexa-text-secondary);
}

.metric-card-value {
  font-size: 2rem;
  font-weight: 600;
  color: var(--nexa-text-primary);
  margin-bottom: 0.5rem;
  min-height: 2.5rem;
}

.metric-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: var(--nexa-text-secondary);
}

.metric-card-label {
  font-size: 0.75rem;
}

.metric-card-description {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--nexa-border-color);
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--nexa-text-secondary);
}
</style>
