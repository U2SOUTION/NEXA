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
          <div class="cache-info-list">
            <div class="cache-info-item">
              <span class="cache-info-label">캐시된 컴포넌트</span>
              <span class="cache-info-value">{{ loadedPreviewsSize }} / {{ maxCacheSize }}</span>
            </div>
            <div class="cache-info-item">
              <span class="cache-info-label">현재 보이는 샘플</span>
              <span class="cache-info-value">{{ visibleSamplesSize }}</span>
            </div>
            <div class="cache-info-item">
              <span class="cache-info-label">로딩 중</span>
              <span class="cache-info-value">{{ loadingPreviewsSize }}</span>
            </div>
            <div class="cache-info-item">
              <span class="cache-info-label">에러</span>
              <span class="cache-info-value">{{ previewErrorsSize }}</span>
            </div>
            <div class="cache-info-item">
              <span class="cache-info-label">캐시 사용률</span>
              <span class="cache-info-value">{{ cacheUsageRate }}%</span>
            </div>
            <div class="cache-info-item">
              <span class="cache-info-label">정리 임계값</span>
              <span class="cache-info-value">{{ cleanupThreshold }}분</span>
            </div>
          </div>
          <div class="cache-info-actions q-mt-md">
            <q-btn flat dense :disable="isCleaningCache" @click="handleCleanupCache">
              <q-spinner v-if="isCleaningCache" size="16px" color="primary" class="q-mr-xs" />
              <q-icon v-else name="cleaning_services" class="q-mr-xs" />
              <span>캐시 정리</span>
            </q-btn>
            <q-btn flat dense :disable="isClearingCache" @click="handleClearCache">
              <q-spinner v-if="isClearingCache" size="16px" color="primary" class="q-mr-xs" />
              <q-icon v-else name="refresh" class="q-mr-xs" />
              <span>캐시 초기화</span>
            </q-btn>
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
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDevGuideStore } from 'src/stores/devGuideStore'

// Store 인스턴스
const store = useDevGuideStore()

// Store의 캐시 통계를 반응형으로 가져오기
const { cacheStats } = storeToRefs(store)

// 로딩 상태
const isCleaningCache = ref(false)
const isClearingCache = ref(false)

// 템플릿에서 사용할 계산된 값들
const loadedPreviewsSize = computed(() => cacheStats.value.loadedPreviews)
const visibleSamplesSize = computed(() => cacheStats.value.visibleSamples)
const loadingPreviewsSize = computed(() => cacheStats.value.loadingPreviews)
const previewErrorsSize = computed(() => cacheStats.value.previewErrors)
const maxCacheSize = computed(() => cacheStats.value.maxCacheSize)
const cacheUsageRate = computed(() => cacheStats.value.cacheUsageRate)
const cleanupThreshold = computed(() => cacheStats.value.cleanupThresholdMinutes)

// 통계 액션 핸들러
function handleStatisticsAction(actionType) {
  // TODO: 통계 분석 로직 구현
  console.log('[DevGuideStatistics] 통계 액션:', actionType)
}

// 캐시 정리 핸들러
async function handleCleanupCache() {
  isCleaningCache.value = true
  try {
    // 비동기로 처리하여 UI 업데이트 보장
    await new Promise((resolve) => {
      store.cleanupOldCache()
      // 애니메이션이 보이도록 충분한 지연
      setTimeout(resolve, 500)
    })
  } finally {
    isCleaningCache.value = false
  }
}

// 캐시 초기화 핸들러
async function handleClearCache() {
  isClearingCache.value = true
  try {
    // 비동기로 처리하여 UI 업데이트 보장
    await new Promise((resolve) => {
      store.clearAllCache()
      // 애니메이션이 보이도록 충분한 지연
      setTimeout(resolve, 500)
    })
  } finally {
    isClearingCache.value = false
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
          font-size: 1rem;
        }
      }

      .cache-info-content {
        margin-top: 12px;
        padding-left: 24px; /* 타이틀보다 들여쓰기 */

        .cache-info-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px 12px;
          margin-bottom: 12px;

          .cache-info-item {
            display: flex;
            align-items: center;
            gap: 12px;

            .cache-info-label {
              font-size: 0.75rem;
              color: var(--nexa-text-secondary);
              width: 90px; /* 라벨 폭 고정 */
              flex-shrink: 0; /* 라벨 폭 유지 */
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

          :deep(.q-btn) {
            font-size: 0.7rem;
          }
        }
      }
    }

    .statistics-action-btn {
      width: 100%;
    }
  }
}
</style>
