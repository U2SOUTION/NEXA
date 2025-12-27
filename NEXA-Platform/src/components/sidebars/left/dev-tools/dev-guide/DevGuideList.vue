<!-- DevGuideList.vue
  개발 가이드 샘플 목록 컴포넌트
  최근 사용, 즐겨찾기, 전체 샘플 탭 포함
-->
<template>
  <div class="dev-guide-list">
    <q-scroll-area class="list-scroll-area">
      <!-- 샘플 라이브러리 아코디언 (Phase 1-3) -->
      <div class="accordion-wrapper">
        <q-expansion-item icon="style" label="샘플 라이브러리" default-opened class="samples-expansion">
          <q-tabs v-model="activeTab" dense class="samples-tabs" @update:model-value="handleTabChange">
            <q-tab name="recent" label="최근" icon="schedule" />
            <q-tab name="favorite" label="즐겨찾기" icon="star" />
            <q-tab name="all" label="전체" icon="list" />
          </q-tabs>

          <q-tab-panels v-model="activeTab" class="samples-tab-panels">
            <!-- 최근 사용 탭 -->
            <q-tab-panel name="recent" class="q-pa-sm">
              <div v-if="recentSamples.length > 0" class="samples-list">
                <div v-for="sample in recentSamples" :key="sample.id" :class="['sample-item', { 'sample-item-selected': selectedSample?.id === sample.id }]" @click="handleSampleSelect(sample)">
                  <div class="sample-item-content">
                    <q-icon :name="sample.icon || 'style'" class="sample-icon" />
                    <div class="sample-info">
                      <div class="sample-name">{{ sample.displayName || sample.name }}</div>
                      <div class="sample-category">{{ sample.category }}</div>
                      <div v-if="sample.tags && sample.tags.length > 0" class="sample-tags">
                        <q-chip v-for="tag in sample.tags.slice(0, 3)" :key="tag" dense size="sm">
                          {{ tag }}
                        </q-chip>
                      </div>
                    </div>
                  </div>
                  <div class="sample-actions">
                    <q-btn flat dense round :icon="isFavorite(sample.id) ? 'star' : 'star_border'" size="sm" :class="{ 'favorite-btn': true, active: isFavorite(sample.id) }" @click.stop="handleToggleFavorite(sample)" />
                    <q-btn flat dense round icon="close" size="sm" class="delete-btn" @click.stop="handleDeleteRecent(sample.id)" />
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <q-icon name="schedule" size="48px" class="q-mb-sm" />
                <div class="empty-message">최근 사용한 샘플이 없습니다.</div>
                <div class="empty-hint">샘플을 선택하면 여기에 표시됩니다.</div>
              </div>
            </q-tab-panel>

            <!-- 즐겨찾기 탭 -->
            <q-tab-panel name="favorite" class="q-pa-sm">
              <div v-if="favoriteSamples.length > 0" class="samples-list">
                <div v-for="sample in favoriteSamples" :key="sample.id" :class="['sample-item', { 'sample-item-selected': selectedSample?.id === sample.id }]" @click="handleSampleSelect(sample)">
                  <div class="sample-item-content">
                    <q-icon :name="sample.icon || 'style'" class="sample-icon" />
                    <div class="sample-info">
                      <div class="sample-name">{{ sample.displayName || sample.name }}</div>
                      <div class="sample-category">{{ sample.category }}</div>
                    </div>
                  </div>
                  <div class="sample-actions">
                    <q-btn flat dense round icon="star" size="sm" class="favorite-btn active" @click.stop="handleToggleFavorite(sample)" />
                    <q-btn flat dense round icon="close" size="sm" class="delete-btn" @click.stop="handleDeleteFavorite(sample.id)" />
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <q-icon name="star" size="48px" class="q-mb-sm" />
                <div class="empty-message">즐겨찾기 샘플이 없습니다.</div>
                <div class="empty-hint">최근 샘플 목록에서 별 아이콘을 클릭하여 즐겨찾기에 추가하세요.</div>
              </div>
            </q-tab-panel>

            <!-- 전체 샘플 탭 -->
            <q-tab-panel name="all" class="q-pa-sm">
              <div v-if="filteredSamples.length > 0" class="samples-list">
                <!-- 평면 분류 모드 -->
                <template v-if="currentViewMode === 'flat'">
                  <div v-for="sample in filteredSamples" :key="sample.id" :class="['sample-item', { 'sample-item-selected': selectedSample?.id === sample.id }]" @click="handleSampleSelect(sample)">
                    <div class="sample-item-content">
                      <q-icon :name="sample.icon || 'style'" class="sample-icon" />
                      <div class="sample-info">
                        <div class="sample-name">{{ sample.displayName || sample.name }}</div>
                        <div class="sample-category">{{ sample.category }}</div>
                        <div v-if="sample.tags && sample.tags.length > 0" class="sample-tags">
                          <q-chip v-for="tag in sample.tags.slice(0, 3)" :key="tag" dense size="sm">
                            {{ tag }}
                          </q-chip>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- 계층적 분류 모드 (최상위 레벨 > 카테고리 > 샘플) -->
                <template v-else-if="currentViewMode === 'hierarchy'">
                  <div v-if="hierarchicalStructure && hierarchicalStructure.length > 0">
                    <div v-for="topLevel in hierarchicalStructure" :key="topLevel.name" class="top-level-group">
                      <q-expansion-item :label="topLevel.label" :icon="topLevel.icon" class="top-level-expansion">
                        <div v-for="category in topLevel.categories" :key="category.name" class="category-group">
                          <q-expansion-item :label="category.name" :icon="category.icon" class="category-expansion">
                            <div v-for="sample in category.samples" :key="sample.id" :class="['sample-item', { 'sample-item-selected': selectedSample?.id === sample.id }]" @click="handleSampleSelect(sample)">
                              <div class="sample-item-content">
                                <q-icon :name="sample.icon || 'style'" class="sample-icon" />
                                <div class="sample-info">
                                  <div class="sample-name">{{ sample.displayName || sample.name }}</div>
                                </div>
                              </div>
                            </div>
                          </q-expansion-item>
                        </div>
                      </q-expansion-item>
                    </div>
                  </div>
                  <div v-else class="empty-state">
                    <q-icon name="account_tree" size="48px" class="q-mb-sm" />
                    <div class="empty-message">계층 구조 데이터가 없습니다.</div>
                    <div class="empty-hint">샘플을 로드하면 계층 구조가 표시됩니다.</div>
                  </div>
                </template>
              </div>
              <div v-else class="empty-state">
                <q-icon name="style" size="48px" class="q-mb-sm" />
                <div class="empty-message">샘플이 없습니다.</div>
                <div class="empty-hint">샘플을 등록하면 여기에 표시됩니다.</div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-expansion-item>
      </div>

      <!-- 코딩 컨벤션 아코디언 (Phase 4: 향후 구현) -->
      <div class="accordion-wrapper">
        <q-expansion-item icon="code" label="코딩 컨벤션" class="conventions-expansion">
          <div class="coming-soon-section q-pa-md">
            <div class="coming-soon-content">
              <q-icon name="code" size="48px" class="q-mb-sm" />
              <div class="coming-soon-title">코딩 컨벤션 가이드</div>
              <div class="coming-soon-description">Phase 4에서 구현 예정</div>
              <div class="coming-soon-features q-mt-md">
                <div class="feature-item">
                  <q-icon name="text_fields" size="sm" />
                  <span>네이밍 규칙 샘플</span>
                </div>
                <div class="feature-item">
                  <q-icon name="folder_open" size="sm" />
                  <span>파일 구조 패턴</span>
                </div>
                <div class="feature-item">
                  <q-icon name="code" size="sm" />
                  <span>코드 스타일 가이드</span>
                </div>
              </div>
            </div>
          </div>
        </q-expansion-item>
      </div>

      <!-- 아키텍처 패턴 아코디언 (Phase 5: 향후 구현) -->
      <div class="accordion-wrapper">
        <q-expansion-item icon="account_tree" label="아키텍처 패턴" class="patterns-expansion">
          <div class="coming-soon-section q-pa-md">
            <div class="coming-soon-content">
              <q-icon name="account_tree" size="48px" class="q-mb-sm" />
              <div class="coming-soon-title">아키텍처 패턴 가이드</div>
              <div class="coming-soon-description">Phase 5에서 구현 예정</div>
              <div class="coming-soon-features q-mt-md">
                <div class="feature-item">
                  <q-icon name="account_tree" size="sm" />
                  <span>컴포넌트 구조 패턴</span>
                </div>
                <div class="feature-item">
                  <q-icon name="storage" size="sm" />
                  <span>상태 관리 패턴</span>
                </div>
                <div class="feature-item">
                  <q-icon name="hub" size="sm" />
                  <span>통신 패턴</span>
                </div>
                <div class="feature-item">
                  <q-icon name="folder" size="sm" />
                  <span>모듈 구조 패턴</span>
                </div>
              </div>
            </div>
          </div>
        </q-expansion-item>
      </div>

      <!-- 베스트 프랙티스 아코디언 (Phase 6: 향후 구현) -->
      <div class="accordion-wrapper">
        <q-expansion-item icon="star" label="베스트 프랙티스" class="best-practices-expansion">
          <div class="coming-soon-section q-pa-md">
            <div class="coming-soon-content">
              <q-icon name="star" size="48px" class="q-mb-sm" />
              <div class="coming-soon-title">베스트 프랙티스 가이드</div>
              <div class="coming-soon-description">Phase 6에서 구현 예정</div>
              <div class="coming-soon-features q-mt-md">
                <div class="feature-item">
                  <q-icon name="error_outline" size="sm" />
                  <span>에러 처리 패턴</span>
                </div>
                <div class="feature-item">
                  <q-icon name="speed" size="sm" />
                  <span>성능 최적화</span>
                </div>
                <div class="feature-item">
                  <q-icon name="accessibility_new" size="sm" />
                  <span>접근성 가이드</span>
                </div>
                <div class="feature-item">
                  <q-icon name="security" size="sm" />
                  <span>보안 가이드</span>
                </div>
              </div>
            </div>
          </div>
        </q-expansion-item>
      </div>

      <!-- 빠른 액세스 섹션 (Phase 6: 향후 구현) -->
      <div class="accordion-wrapper">
        <q-expansion-item icon="flash_on" label="빠른 액세스" class="quick-access-expansion">
          <div class="coming-soon-section q-pa-md">
            <div class="coming-soon-content">
              <q-icon name="flash_on" size="48px" class="q-mb-sm" />
              <div class="coming-soon-title">빠른 액세스</div>
              <div class="coming-soon-description">Phase 6에서 구현 예정</div>
              <div class="coming-soon-features q-mt-md">
                <div class="feature-item">
                  <q-icon name="star" size="sm" />
                  <span>자주 사용하는 샘플 (최대 5개)</span>
                </div>
                <div class="feature-item">
                  <q-icon name="history" size="sm" />
                  <span>최근 검색어</span>
                </div>
                <div class="feature-item">
                  <q-icon name="smart_toy" size="sm" />
                  <span>추천 샘플 (AI 기반)</span>
                </div>
              </div>
            </div>
          </div>
        </q-expansion-item>
      </div>

      <!-- 고급 필터 (Phase 6: 향후 구현) -->
      <div class="accordion-wrapper">
        <q-expansion-item icon="tune" label="고급 필터" class="advanced-filter-expansion">
          <div class="coming-soon-section q-pa-md">
            <div class="coming-soon-content">
              <q-icon name="tune" size="48px" class="q-mb-sm" />
              <div class="coming-soon-title">고급 필터</div>
              <div class="coming-soon-description">Phase 6에서 구현 예정</div>
              <div class="coming-soon-features q-mt-md">
                <div class="feature-item">
                  <q-icon name="apps" size="sm" />
                  <span>프로젝트별 필터 (Platform, Desktop, Edge, Mobile)</span>
                </div>
                <div class="feature-item">
                  <q-icon name="signal_cellular_alt" size="sm" />
                  <span>난이도 필터 (초급, 중급, 고급)</span>
                </div>
                <div class="feature-item">
                  <q-icon name="label" size="sm" />
                  <span>태그 다중 선택</span>
                </div>
                <div class="feature-item">
                  <q-icon name="sort" size="sm" />
                  <span>정렬 옵션 (이름순, 카테고리순, 최근 수정순, 사용 빈도순)</span>
                </div>
              </div>
            </div>
          </div>
        </q-expansion-item>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDevGuide } from 'src/composables/dev-tools/useDevGuide'

defineProps({
  headerHovered: {
    type: Boolean,
    default: false,
  },
})

const { activeTab, selectedSample, recentSamples, favoriteSamples, filteredSamples, viewMode, hierarchicalStructure, handleSampleSelect, toggleFavorite } = useDevGuide()

// viewMode를 computed로 변환하여 템플릿에서 사용
const currentViewMode = computed(() => viewMode.value)

// 즐겨찾기 확인
function isFavorite(sampleId) {
  return favoriteSamples.value.some((s) => s.id === sampleId)
}

// 탭 변경 핸들러
function handleTabChange() {
  // activeTab은 useDevGuide에서 관리
}

// 즐겨찾기 토글
function handleToggleFavorite(sample) {
  toggleFavorite(sample)
}

// 최근 사용에서 삭제
function handleDeleteRecent(sampleId) {
  const index = recentSamples.value.findIndex((s) => s.id === sampleId)
  if (index >= 0) {
    recentSamples.value.splice(index, 1)
  }
}

// 즐겨찾기에서 삭제
function handleDeleteFavorite(sampleId) {
  const index = favoriteSamples.value.findIndex((s) => s.id === sampleId)
  if (index >= 0) {
    favoriteSamples.value.splice(index, 1)
  }
}
</script>

<style lang="scss" scoped>
.dev-guide-list {
  height: 100%;

  .list-scroll-area {
    height: 100%;
  }

  .accordion-wrapper {
    margin-bottom: 8px;
  }

  .samples-expansion {
    :deep(.q-expansion-item__container) {
      border-bottom: 1px solid var(--nexa-border-color);
    }
  }

  .samples-tabs {
    border-bottom: 1px solid var(--nexa-border-color);
  }

  .samples-tab-panels {
    min-height: 200px;
  }

  .top-level-group {
    margin-bottom: 4px;

    .top-level-expansion {
      :deep(.q-expansion-item__container) {
        border-bottom: 1px solid var(--nexa-border-color);
        font-weight: 600;
      }
    }

    .category-group {
      margin-left: 8px;
      margin-bottom: 2px;

      .category-expansion {
        :deep(.q-expansion-item__container) {
          border-bottom: 1px solid var(--nexa-border-color);
          font-weight: 500;
        }

        :deep(.q-expansion-item__content) {
          padding-left: 8px;
        }
      }
    }
  }

  .samples-list {
    .sample-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px;
      margin-bottom: 4px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--nexa-surface-hover);
      }

      &.sample-item-selected {
        background-color: var(--nexa-surface-hover);
        border-left: 3px solid var(--nexa-primary);
      }

      .sample-item-content {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;

        .sample-icon {
          margin-right: 8px;
          color: var(--nexa-text-secondary);
        }

        .sample-info {
          flex: 1;
          min-width: 0;

          .sample-name {
            font-weight: 500;
            color: var(--nexa-text-primary);
            margin-bottom: 2px;
          }

          .sample-category {
            font-size: 12px;
            color: var(--nexa-text-secondary);
            margin-bottom: 4px;
          }

          .sample-tags {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
          }
        }
      }

      .sample-actions {
        display: flex;
        gap: 4px;

        .favorite-btn {
          color: var(--nexa-text-secondary);

          &.active {
            color: var(--nexa-warning);
          }
        }

        .delete-btn {
          color: var(--nexa-text-secondary);
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    text-align: center;
    color: var(--nexa-text-secondary);

    .empty-message {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .empty-hint {
      font-size: 12px;
      color: var(--nexa-text-disabled);
    }
  }

  .conventions-expansion,
  .patterns-expansion,
  .best-practices-expansion,
  .quick-access-expansion,
  .advanced-filter-expansion {
    :deep(.q-expansion-item__container) {
      border-bottom: 1px solid var(--nexa-border-color);
    }
  }

  .coming-soon-section {
    .coming-soon-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: var(--nexa-text-secondary);

      .q-icon {
        color: var(--nexa-text-disabled);
        margin-bottom: 8px;
      }

      .coming-soon-title {
        font-weight: 600;
        color: var(--nexa-text-primary);
        margin-bottom: 4px;
        font-size: 1rem;
      }

      .coming-soon-description {
        font-size: 0.875rem;
        color: var(--nexa-text-secondary);
        margin-bottom: 16px;
      }

      .coming-soon-features {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        margin-top: 16px;

        .feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background-color: var(--nexa-background);
          border: 1px solid var(--nexa-border-color);
          border-radius: 4px;
          font-size: 0.875rem;
          color: var(--nexa-text-secondary);
          text-align: left;

          .q-icon {
            color: var(--nexa-text-disabled);
            margin: 0;
          }
        }
      }
    }
  }
}
</style>
