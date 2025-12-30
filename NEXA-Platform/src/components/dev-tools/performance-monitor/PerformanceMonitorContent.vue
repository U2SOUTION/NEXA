<template>
  <div class="performance-monitor-content">
    <!-- 선택된 메트릭/요청이 없을 때: 메인 페이지 -->
    <div v-if="!selectedMetric && !selectedApiRequest && !selectedNetworkRequest" class="performance-monitor-main-view">
      <!-- 대형 타이틀 -->
      <div class="performance-monitor-large-title">PERFORMANCE MONITOR</div>

      <!-- 성능 MONITOR 탭 컨텐츠 -->
      <div v-if="activeTab === 'performance'" class="performance-tab-content">
        <!-- 헤더 -->
        <div class="performance-monitor-header q-pa-md">
          <div class="row items-center justify-between">
            <div class="row items-center q-gutter-md">
              <q-icon name="speed" size="24px" color="primary" />
              <div class="performance-monitor-title-section">
                <h3 class="performance-monitor-title">Performance Monitor</h3>
                <p class="performance-monitor-subtitle">성능 모니터</p>
              </div>
            </div>
            <div class="row items-center q-gutter-sm">
              <q-btn :color="isMonitoring ? 'negative' : 'positive'" :label="isMonitoring ? '중지' : '시작'" :icon="isMonitoring ? 'stop' : 'play_arrow'" @click="toggleMonitoring" />
              <q-btn flat color="grey-7" icon="settings" @click="showSettings = !showSettings" />
            </div>
          </div>
        </div>

        <!-- 메인 컨텐츠 -->
        <div class="performance-monitor-main">
          <!-- 성능 지표 카드 -->
          <PerformanceMetricsCards
            :current-fps="currentFPS"
            :average-fps="averageFPS"
            :min-fps="minFPS"
            :memory-used="memoryUsed"
            :memory-usage-percent="memoryUsagePercent"
            :memory-limit="memoryLimit"
            :lcp-value="lcpValue"
            :api-duration="apiDuration"
            :api-count="apiCount"
            :api-error-rate="apiErrorRate"
          />

          <!-- 성능 차트 영역 (구현 예정) -->
          <div class="performance-chart-area q-mt-md">
            <div class="chart-placeholder q-pa-lg text-center">
              <q-icon name="show_chart" size="48px" color="grey-5" class="q-mb-md" />
              <p class="text-grey-7">성능 차트 (구현 예정)</p>
            </div>
          </div>
        </div>
      </div>

      <!-- API TESTER 탭 컨텐츠 -->
      <div v-else-if="activeTab === 'api-tester'" class="api-tester-tab-content">
        <ApiTesterContent />
      </div>

      <!-- NETWORK 탭 컨텐츠 -->
      <div v-else-if="activeTab === 'network'" class="network-tab-content">
        <!-- 네트워크 컨텐츠는 나중에 통합 예정 -->
        <div class="coming-soon-wrapper">
          <div class="coming-soon-content">
            <q-icon name="network_check" size="80px" color="grey-7" class="q-mb-md" />
            <h2 class="coming-soon-title">NETWORK</h2>
            <p class="coming-soon-description">네트워크 모니터 기능은 곧 통합될 예정입니다.</p>
          </div>
        </div>
      </div>

      <!-- ERROR TRACKING 탭 컨텐츠 -->
      <div v-else-if="activeTab === 'error-tracking'" class="error-tracking-tab-content">
        <ErrorTrackingContent />
      </div>
    </div>

    <!-- 선택된 메트릭/요청이 있을 때: 상세 페이지 -->
    <div v-else-if="activeTab !== 'error-tracking'" class="performance-monitor-detail-view">
      <!-- 상세 정보 표시 (나중에 구현) -->
      <div class="detail-placeholder q-pa-lg text-center">
        <q-icon name="info" size="48px" color="grey-5" class="q-mb-md" />
        <p class="text-grey-7">상세 정보 (구현 예정)</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import PerformanceMetricsCards from './PerformanceMetricsCards.vue'
import ApiTesterContent from '../api-tester/ApiTesterContent.vue'
import ErrorTrackingContent from '../error-tracking/ErrorTrackingContent.vue'
import { startFPSMonitoring, stopFPSMonitoring, getCurrentFPS, getAverageFPS, getMinFPS } from 'src/utils/performance/fpsMonitor'
import { startMemoryMonitoring, stopMemoryMonitoring, collectMemorySnapshot } from 'src/utils/performance/memoryMonitor'
import { onWebVitals, getWebVitals } from 'src/utils/performance/webVitalsCollector'
import { enableAPIMonitoring, disableAPIMonitoring, getAPIStats } from 'src/utils/performance/apiPerformanceInterceptor'
import { collectAllBasicMetrics } from 'src/utils/performance/performanceCollector'
import { savePerformanceData } from 'src/utils/performance/performanceStorage'

const $q = useQuasar()

// 활성 탭 (사이드바와 동기화)
const activeTab = ref('performance')

// 선택된 항목
const selectedMetric = ref(null)
const selectedApiRequest = ref(null)
const selectedNetworkRequest = ref(null)

// 모니터링 상태
const isMonitoring = ref(false)
const showSettings = ref(false)

// 성능 지표
// ⚠️ FPS: 측정은 정상 작동, 하지만 UI 렌더링 안 됨 (Vue 반응성 문제)
const currentFPS = ref(0)
const averageFPS = ref(0)
const minFPS = ref(0)
// ✅ 메모리: 정상 작동
const memoryUsed = ref('-')
const memoryUsagePercent = ref(0)
const memoryLimit = ref('-')
// ✅ LCP: 정상 작동
const lcpValue = ref('-')
// ⚠️ API: 인터셉트는 정상 작동, 하지만 실제 API 호출이 없어서 데이터 0 (실제 사용 시 자동 작동)
const apiDuration = ref('-')
const apiCount = ref(0)
const apiErrorRate = ref(0)

let updateInterval = null
let metricsSaveInterval = null

// 모니터링 시작/중지
function toggleMonitoring() {
  if (isMonitoring.value) {
    stopMonitoring()
  } else {
    startMonitoring()
  }
}

// 모니터링 시작
function startMonitoring() {
  isMonitoring.value = true

  // ⚠️ FPS 모니터링: 측정 로직은 정상 작동 (currentFPS.value 업데이트됨)
  // 하지만 자식 컴포넌트에서 props 변경이 감지되지 않아 UI에 렌더링 안 됨
  console.log('[PerformanceMonitor] FPS 모니터링 시작')
  console.log('[PerformanceMonitor] 초기 currentFPS.value:', currentFPS.value)
  startFPSMonitoring(1000, (fps) => {
    console.log('[PerformanceMonitor] FPS 콜백 호출:', fps)
    console.log('[PerformanceMonitor] currentFPS.value 업데이트 전:', currentFPS.value)
    currentFPS.value = fps
    console.log('[PerformanceMonitor] currentFPS.value 업데이트 후:', currentFPS.value)
    const avgFPS = getAverageFPS()
    const minFPSValue = getMinFPS()
    if (avgFPS > 0) {
      averageFPS.value = avgFPS
    }
    if (minFPSValue > 0) {
      minFPS.value = minFPSValue
    }
  })

  // ✅ 메모리 모니터링: 정상 작동
  startMemoryMonitoring(1000, (memory) => {
    updateMemoryMetrics(memory)
  })

  // ✅ Web Vitals (LCP): 정상 작동
  onWebVitals((webVitals) => {
    console.log('[PerformanceMonitor] Web Vitals 업데이트:', webVitals)
    updateWebVitals(webVitals)
  })

  // ⚠️ API 모니터링: 인터셉트는 정상 작동, 하지만 실제 API 호출이 없어서 데이터 0
  // 실제 사용 시 (API 호출 발생 시) 자동으로 작동함
  enableAPIMonitoring()
  console.log('[PerformanceMonitor] API 모니터링 활성화됨')

  // 초기 메트릭 업데이트 (즉시 한 번 실행)
  updateMetrics()

  // 주기적 업데이트
  updateInterval = setInterval(() => {
    updateMetrics()
  }, 1000)

  // 성능 데이터 저장 (10초마다)
  metricsSaveInterval = setInterval(() => {
    saveMetricsData()
  }, 10000)

  $q.notify({
    type: 'positive',
    message: '성능 모니터링이 시작되었습니다.',
    position: 'top',
  })
}

// 모니터링 중지
function stopMonitoring() {
  isMonitoring.value = false

  stopFPSMonitoring()
  stopMemoryMonitoring()
  disableAPIMonitoring()

  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }

  if (metricsSaveInterval) {
    clearInterval(metricsSaveInterval)
    metricsSaveInterval = null
  }

  $q.notify({
    type: 'info',
    message: '성능 모니터링이 중지되었습니다.',
    position: 'top',
  })
}

// 메모리 메트릭 업데이트
function updateMemoryMetrics(memory) {
  const usedMB = (memory.usedJSHeapSize / (1024 * 1024)).toFixed(2)
  const limitMB = (memory.jsHeapSizeLimit / (1024 * 1024)).toFixed(2)
  const percent = ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(1)

  memoryUsed.value = `${usedMB} MB`
  memoryLimit.value = `${limitMB} MB`
  memoryUsagePercent.value = parseFloat(percent)
}

// Web Vitals 업데이트
function updateWebVitals(webVitals) {
  console.log('[PerformanceMonitor] updateWebVitals 호출:', webVitals)
  if (webVitals.lcp && webVitals.lcp.value !== null && webVitals.lcp.value !== undefined) {
    const lcpMs = webVitals.lcp.value
    console.log('[PerformanceMonitor] LCP 값 설정:', lcpMs)
    lcpValue.value = `${lcpMs.toFixed(0)}ms`
  }
}

// 전체 메트릭 업데이트
function updateMetrics() {
  // FPS 업데이트 (콜백에서 업데이트되지만, 여기서도 확인)
  const fps = getCurrentFPS()
  console.log('[PerformanceMonitor] updateMetrics - getCurrentFPS():', fps)
  console.log('[PerformanceMonitor] updateMetrics - currentFPS.value 업데이트 전:', currentFPS.value)
  // FPS가 0이어도 업데이트 (초기 상태 표시를 위해)
  currentFPS.value = fps
  console.log('[PerformanceMonitor] updateMetrics - currentFPS.value 업데이트 후:', currentFPS.value)
  const avgFPS = getAverageFPS()
  const minFPSValue = getMinFPS()
  if (avgFPS > 0) {
    averageFPS.value = avgFPS
  }
  if (minFPSValue > 0) {
    minFPS.value = minFPSValue
  }

  // Web Vitals 업데이트 (LCP는 페이지 로드 시점에만 측정되므로, 기존 값 확인)
  const webVitals = getWebVitals()
  console.log('[PerformanceMonitor] updateMetrics - Web Vitals:', webVitals)
  if (webVitals.lcp?.value !== null && webVitals.lcp?.value !== undefined) {
    lcpValue.value = `${webVitals.lcp.value.toFixed(0)}ms`
  }

  // ⚠️ API 통계: 인터셉트는 작동하지만 실제 API 호출이 없어서 count가 0
  // 실제 API 호출 발생 시 자동으로 데이터 수집됨
  const apiStats = getAPIStats({ duration: 60000 }) // 최근 1분
  console.log('[PerformanceMonitor] updateMetrics - API Stats:', apiStats)
  console.log('[PerformanceMonitor] API Metrics count:', apiStats.count)

  if (apiStats.count > 0 && apiStats.avgDuration > 0) {
    apiDuration.value = `${apiStats.avgDuration.toFixed(0)}ms`
    apiCount.value = apiStats.count
    apiErrorRate.value = parseFloat(apiStats.errorRate.toFixed(1))
  } else {
    // API 호출이 없을 때도 기본값 유지
    // 단, 모니터링이 시작된 직후에는 '-' 표시
    if (isMonitoring.value) {
      apiDuration.value = '-'
      apiCount.value = 0
      apiErrorRate.value = 0
    }
  }
}

// 성능 데이터 저장
function saveMetricsData() {
  const webVitals = getWebVitals()
  const apiStats = getAPIStats({ duration: 60000 })
  const memory = collectMemorySnapshot()

  const metricsData = {
    timestamp: Date.now(),
    frontend: {
      fps: currentFPS.value,
      memory: memory,
      webVitals: webVitals,
    },
    api: {
      requests: [],
      stats:
        apiStats.count > 0
          ? {
              avgDuration: apiStats.avgDuration,
              count: apiStats.count,
              errorRate: apiStats.errorRate,
            }
          : null,
    },
  }

  savePerformanceData(metricsData)
}

// 탭 변경 이벤트 리스너
function handleTabChange(event) {
  const tab = event.detail?.tab
  if (tab) {
    activeTab.value = tab
    // 탭 변경 시 선택 해제 (에러 트래킹 탭 제외)
    if (tab !== 'error-tracking') {
      selectedMetric.value = null
      selectedApiRequest.value = null
      selectedNetworkRequest.value = null
    }
  }
}

// 메트릭 선택 이벤트 리스너
function handleMetricSelected(event) {
  const metric = event.detail?.metric
  if (metric) {
    selectedMetric.value = metric
    selectedApiRequest.value = null
    selectedNetworkRequest.value = null
  }
}

// API 요청 선택 이벤트 리스너
function handleApiRequestSelected(event) {
  const request = event.detail?.request
  if (request) {
    selectedApiRequest.value = request
    selectedMetric.value = null
    selectedNetworkRequest.value = null
  }
}

// 네트워크 요청 선택 이벤트 리스너
function handleNetworkRequestSelected(event) {
  const request = event.detail?.request
  if (request) {
    selectedNetworkRequest.value = request
    selectedMetric.value = null
    selectedApiRequest.value = null
  }
}

// 메인 페이지로 이동 이벤트 리스너
function handleMainPage() {
  selectedMetric.value = null
  selectedApiRequest.value = null
  selectedNetworkRequest.value = null
}

onMounted(() => {
  // 컴포넌트 마운트 시 기본 메트릭 수집 (모니터링 시작 전)
  const basicMetrics = collectAllBasicMetrics()
  console.log('[PerformanceMonitor] onMounted - 기본 메트릭:', basicMetrics)
  if (basicMetrics.memory) {
    updateMemoryMetrics(basicMetrics.memory)
  }

  // Web Vitals에서 LCP 값 확인 (navigation timing을 통한 근사값 포함)
  const webVitals = getWebVitals()
  console.log('[PerformanceMonitor] onMounted - Web Vitals:', webVitals)
  if (webVitals.lcp && webVitals.lcp.value) {
    lcpValue.value = `${webVitals.lcp.value.toFixed(0)}ms`
  }

  // 전역 이벤트 리스너 등록
  window.addEventListener('performance-monitor-tab-change', handleTabChange)
  window.addEventListener('performance-monitor-metric-selected', handleMetricSelected)
  window.addEventListener('performance-monitor-api-request-selected', handleApiRequestSelected)
  window.addEventListener('performance-monitor-network-request-selected', handleNetworkRequestSelected)
  window.addEventListener('performance-monitor-main-page', handleMainPage)
})

onBeforeUnmount(() => {
  if (isMonitoring.value) {
    stopMonitoring()
  }

  // 전역 이벤트 리스너 제거
  window.removeEventListener('performance-monitor-tab-change', handleTabChange)
  window.removeEventListener('performance-monitor-metric-selected', handleMetricSelected)
  window.removeEventListener('performance-monitor-api-request-selected', handleApiRequestSelected)
  window.removeEventListener('performance-monitor-network-request-selected', handleNetworkRequestSelected)
  window.removeEventListener('performance-monitor-main-page', handleMainPage)

  // 전역 이벤트 리스너 제거
  window.removeEventListener('performance-monitor-tab-change', handleTabChange)
  window.removeEventListener('performance-monitor-metric-selected', handleMetricSelected)
  window.removeEventListener('performance-monitor-api-request-selected', handleApiRequestSelected)
  window.removeEventListener('performance-monitor-network-request-selected', handleNetworkRequestSelected)
  window.removeEventListener('performance-monitor-main-page', handleMainPage)
})
</script>

<style lang="scss" scoped>
.performance-monitor-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--nexa-background);
}

.performance-monitor-large-title {
  font-size: 50px;
  font-weight: 900;
  color: var(--nexa-text-primary);
  text-transform: uppercase;
  letter-spacing: 2px;
  line-height: 1.2;
  margin-top: 50px;
  margin-bottom: 2px;
  background: transparent;
}

.performance-monitor-header {
  background: var(--nexa-surface);
  border-bottom: 1px solid var(--nexa-border-color);
}

.performance-monitor-title-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.performance-monitor-title {
  color: var(--nexa-text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
}

.performance-monitor-subtitle {
  color: var(--nexa-text-secondary);
  font-size: 0.875rem;
  font-weight: 400;
  margin: 0;
  line-height: 1.2;
}

.performance-monitor-main {
  margin-top: 20px;
  flex: 1;
  overflow-y: auto;
}

.chart-placeholder {
  background: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
  border-radius: 8px;
  min-height: 300px;
}

.performance-monitor-main-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.performance-tab-content,
.api-tester-tab-content,
.network-tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.coming-soon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}

.coming-soon-content {
  text-align: center;
  max-width: 600px;
}

.coming-soon-title {
  color: var(--nexa-text-primary);
  font-size: 2rem;
  font-weight: 600;
  margin: 1rem 0;
}

.coming-soon-description {
  color: var(--nexa-text-secondary);
  font-size: 1rem;
  margin: 0;
}

.performance-monitor-detail-view {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-placeholder {
  text-align: center;
}
</style>
