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
            <q-btn flat dense label="캐시 정리" icon="cleaning_services" @click="handleCleanupCache" />
            <q-btn flat dense label="캐시 초기화" icon="refresh" @click="handleClearCache" />
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
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDevGuideStore } from 'src/stores/devGuideStore'

// Store 인스턴스
const store = useDevGuideStore()

// Store의 캐시 통계를 반응형으로 가져오기
const { cacheStats } = storeToRefs(store)

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
function handleCleanupCache() {
  store.cleanupOldCache()
}

// 캐시 초기화 핸들러
function handleClearCache() {
  store.clearAllCache()
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

