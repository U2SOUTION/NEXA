<!-- DevGuideStatistics.vue
  개발 가이드 통계 패널
  통계 분석 기능 제공
-->
<template>
  <div class="dev-guide-statistics">
    <div class="statistics-actions q-pa-md">
      <!-- 캐시 최적화 정보 -->
      <div class="cache-info-section">
        <div class="cache-info-header q-mb-sm">
          <q-icon name="memory" class="cache-info-icon" />
          <span class="cache-info-title">캐시 최적화 정보</span>
        </div>
        <div class="cache-info-content">
          <div class="cache-info-grid">
            <div class="cache-info-item">
              <div class="cache-info-label">캐시된 컴포넌트</div>
              <div class="cache-info-value">{{ loadedPreviewsSize }} / {{ maxCacheSize }}</div>
            </div>
            <div class="cache-info-item">
              <div class="cache-info-label">현재 보이는 샘플</div>
              <div class="cache-info-value">{{ visibleSamplesSize }}</div>
            </div>
            <div class="cache-info-item">
              <div class="cache-info-label">로딩 중</div>
              <div class="cache-info-value">{{ loadingPreviewsSize }}</div>
            </div>
            <div class="cache-info-item">
              <div class="cache-info-label">에러</div>
              <div class="cache-info-value">{{ previewErrorsSize }}</div>
            </div>
            <div class="cache-info-item">
              <div class="cache-info-label">캐시 사용률</div>
              <div class="cache-info-value">{{ cacheUsageRate }}%</div>
            </div>
            <div class="cache-info-item">
              <div class="cache-info-label">정리 임계값</div>
              <div class="cache-info-value">{{ cleanupThreshold }}분</div>
            </div>
          </div>
          <div class="cache-info-actions q-mt-md">
            <q-btn flat dense label="캐시 정리" icon="cleaning_services" @click="handleCleanupCache" :disable="!cleanupOldCache" />
            <q-btn flat dense label="캐시 초기화" icon="refresh" @click="handleClearCache" :disable="!clearAllCache" />
          </div>
        </div>
      </div>
      <q-btn outlined dense icon="analytics" label="전체 통계 분석" class="statistics-action-btn q-mb-sm" @click="handleStatisticsAction('full-analysis')" />
      <q-btn outlined dense icon="trending_up" label="인기 샘플" class="statistics-action-btn q-mb-sm" @click="handleStatisticsAction('popular')" />
      <q-btn outlined dense icon="delete_outline" label="미사용 샘플" class="statistics-action-btn q-mb-sm" @click="handleStatisticsAction('unused')" />
      <q-btn outlined dense icon="category" label="카테고리별 통계" class="statistics-action-btn q-mb-sm" @click="handleStatisticsAction('by-category')" />
      <q-btn outlined dense icon="schedule" label="사용 빈도 통계" class="statistics-action-btn" @click="handleStatisticsAction('by-usage')" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

// DevGuideContent에서 전역 이벤트로 전달하는 캐시 관련 상태 및 함수
const previewStates = ref(null)
const CACHE_CONFIG = ref(null)
const cleanupOldCache = ref(null)
const clearAllCache = ref(null)

// 반응형 값들을 직접 ref로 관리 (중첩된 ref 문제 해결)
const loadedPreviewsSize = ref(0)
const visibleSamplesSize = ref(0)
const loadingPreviewsSize = ref(0)
const previewErrorsSize = ref(0)
const maxCacheSize = ref(0)
const cleanupThreshold = ref(0)

// 캐시 사용률 계산 (computed로 안전하게 처리)
const cacheUsageRate = computed(() => {
  const loaded = loadedPreviewsSize.value
  const max = maxCacheSize.value
  if (max === 0) return 0
  return Math.round((loaded / max) * 100)
})

// 전역 이벤트 리스너
function handleCacheStateUpdate(event) {
  const { previewStates: states, CACHE_CONFIG: config, cleanupOldCache: cleanup, clearAllCache: clear } = event.detail
  
  // 원본 객체 저장 (함수 호출용)
  previewStates.value = states
  CACHE_CONFIG.value = config
  cleanupOldCache.value = cleanup
  clearAllCache.value = clear
  
  // 반응형 값 직접 업데이트 (중첩된 ref 문제 해결)
  if (states) {
    loadedPreviewsSize.value = states.loadedPreviews?.value?.size ?? 0
    visibleSamplesSize.value = states.visibleSamples?.value?.size ?? 0
    loadingPreviewsSize.value = states.loadingPreviews?.value?.size ?? 0
    previewErrorsSize.value = states.previewErrors?.value?.size ?? 0
  }
  
  if (config) {
    maxCacheSize.value = config.MAX_CACHE_SIZE ?? 0
    if (config.CACHE_CLEANUP_THRESHOLD) {
      cleanupThreshold.value = Math.round(config.CACHE_CLEANUP_THRESHOLD / 1000 / 60)
    }
  }
  
  if (import.meta.env.DEV) {
    console.log('[DevGuideStatistics] 캐시 상태 업데이트:', {
      loadedPreviews: loadedPreviewsSize.value,
      visibleSamples: visibleSamplesSize.value,
      maxCacheSize: maxCacheSize.value,
    })
  }
}

// 상태 요청 함수 (재시도 로직 포함)
function requestCacheState(retryCount = 0) {
  window.dispatchEvent(new CustomEvent('dev-guide-cache-state-request'))
  
  // DevGuideContent가 아직 준비되지 않았을 수 있으므로 재시도
  if (retryCount < 3 && (!previewStates.value || !CACHE_CONFIG.value)) {
    setTimeout(() => {
      requestCacheState(retryCount + 1)
    }, 200 * (retryCount + 1)) // 200ms, 400ms, 600ms 간격으로 재시도
  }
}

onMounted(() => {
  window.addEventListener('dev-guide-cache-state-updated', handleCacheStateUpdate)
  // DOM이 준비된 후 상태 요청 (재시도 로직 포함)
  nextTick(() => {
    requestCacheState()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('dev-guide-cache-state-updated', handleCacheStateUpdate)
})

// 통계 액션 핸들러
function handleStatisticsAction(actionType) {
  // TODO: 통계 분석 로직 구현
  console.log('[DevGuideStatistics] 통계 액션:', actionType)
}

// 캐시 정리 핸들러
function handleCleanupCache() {
  if (cleanupOldCache.value) {
    cleanupOldCache.value()
  }
}

// 캐시 초기화 핸들러
function handleClearCache() {
  if (clearAllCache.value) {
    clearAllCache.value()
  }
}
</script>

<style lang="scss" scoped>
.dev-guide-statistics {
  .statistics-actions {
    .cache-info-section {
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--nexa-border-color);

      .cache-info-header {
        display: flex;
        align-items: center;
        gap: 8px;

        .cache-info-icon {
          color: var(--nexa-text-secondary);
          font-size: 1.2rem;
        }

        .cache-info-title {
          color: var(--nexa-text-primary);
          font-weight: 600;
          font-size: 0.875rem;
        }
      }

      .cache-info-content {
        margin-top: 12px;

        .cache-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 12px;

          .cache-info-item {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .cache-info-label {
              font-size: 0.75rem;
              color: var(--nexa-text-secondary);
            }

            .cache-info-value {
              font-size: 0.875rem;
              font-weight: 600;
              color: var(--nexa-text-primary);
            }
          }
        }

        .cache-info-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-start;
        }
      }
    }

    .statistics-action-btn {
      width: 100%;
    }
  }
}
</style>

