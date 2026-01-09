<!-- DevGuideStatistics.vue
  개발 가이드 통계 패널
  통계 분석 기능 제공
-->
<template>
  <div class="dev-guide-statistics">
    <div class="statistics-actions">
      <!-- 통계 아코디언 -->
      <div class="statistics-accordions">
        <!-- 캐시 최적화 정보 -->
        <q-expansion-item icon="memory" label="캐시 최적화 정보" :model-value="expandedAccordion === 'cache'" @update:model-value="toggleAccordion('cache', $event)" class="statistics-accordion-item">
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
        </q-expansion-item>
        <!-- 전체 통계 분석 -->
        <q-expansion-item icon="analytics" label="전체 통계 분석" :model-value="expandedAccordion === 'full-analysis'" @update:model-value="toggleAccordion('full-analysis', $event)" class="statistics-accordion-item">
          <div class="statistics-content">
            <div class="statistics-section">
              <h3 class="section-title">개요</h3>
              <div class="statistics-grid">
                <div class="stat-item">
                  <div class="stat-label">전체 샘플 수</div>
                  <div class="stat-value">{{ fullStats?.overview?.totalSamples || 0 }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">카테고리 수</div>
                  <div class="stat-value">{{ fullStats?.overview?.totalCategories || 0 }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">즐겨찾기</div>
                  <div class="stat-value">{{ fullStats?.overview?.favoriteCount || 0 }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">최근 사용</div>
                  <div class="stat-value">{{ fullStats?.overview?.recentCount || 0 }}</div>
                </div>
              </div>
            </div>

            <div class="statistics-section">
              <h3 class="section-title">카테고리 분포</h3>
              <div v-if="fullStats?.categories?.topCategory" class="top-category-info">
                <div class="info-item">
                  <span class="info-label">가장 많은 샘플:</span>
                  <span class="info-value">{{ fullStats.categories.topCategory.name }} ({{ fullStats.categories.topCategory.count }}개)</span>
                </div>
              </div>
              <div class="category-list">
                <div v-for="[category, count] in Object.entries(fullStats?.categories?.distribution || {})" :key="category" class="category-item">
                  <span class="category-name">{{ category }}</span>
                  <span class="category-count">{{ count }}개</span>
                </div>
              </div>
            </div>

            <div class="statistics-section">
              <h3 class="section-title">인기 태그 (상위 10개)</h3>
              <div class="tag-list">
                <q-chip v-for="tag in fullStats?.tags?.topTags || []" :key="tag.tag" size="sm"> {{ tag.tag }} ({{ tag.count }}) </q-chip>
              </div>
            </div>

            <div class="statistics-section">
              <h3 class="section-title">캐시 상태</h3>
              <div class="statistics-grid">
                <div class="stat-item">
                  <div class="stat-label">캐시된 컴포넌트</div>
                  <div class="stat-value">{{ fullStats?.cache?.loadedPreviews || 0 }} / {{ fullStats?.cache?.maxCacheSize || 0 }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">캐시 사용률</div>
                  <div class="stat-value">{{ fullStats?.cache?.cacheUsageRate || 0 }}%</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">로딩 중</div>
                  <div class="stat-value">{{ fullStats?.cache?.loadingPreviews || 0 }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">에러</div>
                  <div class="stat-value">{{ fullStats?.cache?.previewErrors || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
        </q-expansion-item>

        <!-- 카테고리별 통계 -->
        <q-expansion-item icon="category" label="카테고리별 통계" :model-value="expandedAccordion === 'by-category'" @update:model-value="toggleAccordion('by-category', $event)" class="statistics-accordion-item">
          <div class="statistics-content">
            <div class="statistics-section">
              <h3 class="section-title">요약</h3>
              <div class="statistics-grid">
                <div class="stat-item">
                  <div class="stat-label">전체 카테고리</div>
                  <div class="stat-value">{{ categoryStats?.totalCategories || 0 }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">전체 샘플</div>
                  <div class="stat-value">{{ categoryStats?.summary?.totalSamples || 0 }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">카테고리당 평균</div>
                  <div class="stat-value">{{ categoryStats?.summary?.averageSamplesPerCategory || 0 }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">최대 샘플 수</div>
                  <div class="stat-value">{{ categoryStats?.summary?.maxSamplesInCategory || 0 }}</div>
                </div>
              </div>
            </div>

            <div class="statistics-section">
              <h3 class="section-title">카테고리별 상세</h3>
              <div class="category-detail-list">
                <div v-for="category in categoryStats?.categories || []" :key="category.name" class="category-detail-item">
                  <div class="category-detail-header">
                    <span class="category-detail-name">{{ category.name }}</span>
                    <span class="category-detail-count">{{ category.totalSamples }}개</span>
                  </div>
                  <div class="category-detail-stats">
                    <div class="detail-stat">
                      <span class="detail-label">즐겨찾기:</span>
                      <span class="detail-value">{{ category.favoriteCount }}</span>
                    </div>
                    <div class="detail-stat">
                      <span class="detail-label">최근 사용:</span>
                      <span class="detail-value">{{ category.recentCount }}</span>
                    </div>
                    <div class="detail-stat">
                      <span class="detail-label">캐시됨:</span>
                      <span class="detail-value">{{ category.cachedCount }}</span>
                    </div>
                    <div class="detail-stat">
                      <span class="detail-label">에러:</span>
                      <span class="detail-value">{{ category.errorCount }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-expansion-item>

        <!-- Phase 2 기능 (미구현) -->
        <q-expansion-item icon="trending_up" label="인기 샘플" disable class="statistics-accordion-item" />
        <q-expansion-item icon="delete_outline" label="미사용 샘플" disable class="statistics-accordion-item" />
        <q-expansion-item icon="schedule" label="사용 빈도 통계" disable class="statistics-accordion-item" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDevGuideStore } from '@system/store/devGuideStore.js'

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

// 아코디언 상태
const expandedAccordion = ref(null)
const fullStats = ref(null)
const categoryStats = ref(null)

// 아코디언 토글 핸들러
function toggleAccordion(accordionType, isExpanded) {
  if (isExpanded) {
    expandedAccordion.value = accordionType

    // 통계 데이터 로드
    if (accordionType === 'full-analysis' && !fullStats.value) {
      fullStats.value = store.getFullStatistics()
    } else if (accordionType === 'by-category' && !categoryStats.value) {
      categoryStats.value = store.getCategoryStatistics()
    }
  } else {
    expandedAccordion.value = null
  }
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
    .statistics-accordions {
      .cache-info-content {
        padding: 12px;

        .cache-info-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px 10px;
          margin-bottom: 8px;

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
          gap: 6px;
          justify-content: flex-start;

          :deep(.q-btn) {
            font-size: 0.7rem;
            padding: 4px 8px;
          }
        }
      }
    }
  }
}

// 통계 콘텐츠 스타일
.statistics-content {
  padding: 12px;
  .statistics-section {
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      color: var(--nexa-text-primary);
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--nexa-border-color);
    }

    .statistics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 5px;

      .stat-item {
        //background-color: var(--nexa-surface);
        border: 1px solid var(--nexa-border-color);
        border-radius: 4px;
        padding: 10px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        text-align: left;
        gap: 8px;

        .stat-label {
          color: var(--nexa-text-secondary);
          font-size: 0.75rem;
          margin-bottom: 0;
          flex-shrink: 0;
        }

        .stat-value {
          color: var(--nexa-text-primary);
          font-size: 1rem;
          font-weight: 700;
          text-align: right;
          flex-shrink: 0;
        }
      }
    }

    .top-category-info {
      background-color: var(--nexa-surface);
      border: 1px solid var(--nexa-border-color);
      padding: 8px 12px;
      margin-bottom: 6px;

      .info-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .info-label {
          color: var(--nexa-text-secondary);
          font-size: 0.8rem;
        }

        .info-value {
          color: var(--nexa-text-primary);
          font-size: 0.8rem;
          font-weight: 600;
        }
      }
    }

    .category-list {
      display: flex;
      flex-direction: column;
      //gap: 1px;

      .category-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 12px;
        //background-color: var(--nexa-surface);
        border-bottom: 1px solid var(--nexa-border-color);

        .category-name {
          color: var(--nexa-text-primary);
          font-size: 0.8rem;
        }

        .category-count {
          color: var(--nexa-text-secondary);
          font-size: 0.8rem;
          font-weight: 600;
        }
      }
    }

    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0px;
    }

    .category-detail-list {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .category-detail-item {
        // background-color: var(--nexa-surface);
        border: 1px solid var(--nexa-border-color);
        padding: 10px;

        .category-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--nexa-border-color);

          .category-detail-name {
            color: var(--nexa-text-primary);
            font-size: 0.9rem;
            font-weight: 600;
          }

          .category-detail-count {
            color: var(--nexa-text-secondary);
            font-size: 0.8rem;
            font-weight: 600;
          }
        }

        .category-detail-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
          gap: 4px;

          .detail-stat {
            display: flex;
            align-items: center;
            gap: 8px;

            .detail-label {
              color: var(--nexa-text-secondary);
              font-size: 0.75rem;
            }

            .detail-value {
              color: var(--nexa-text-primary);
              font-size: 0.875rem;
              font-weight: 600;
            }
          }
        }
      }
    }
  }
}
</style>
