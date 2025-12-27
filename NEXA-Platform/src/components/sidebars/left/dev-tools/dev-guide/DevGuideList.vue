<!-- DevGuideList.vue
  개발 가이드 샘플 목록 컴포넌트
  최근 사용, 즐겨찾기, 전체 샘플 탭 포함
-->
<template>
  <div class="dev-guide-list">
    <q-scroll-area class="list-scroll-area">
      <!-- 샘플 라이브러리 아코디언 -->
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
                <template v-if="viewMode === 'flat'">
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

                <!-- 계층적 분류 모드 -->
                <template v-else>
                  <div v-for="category in hierarchicalCategories" :key="category.name" class="category-group">
                    <q-expansion-item :label="category.name" :icon="category.icon">
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

      <!-- 통계 아코디언 -->
      <div class="accordion-wrapper">
        <q-expansion-item icon="analytics" label="통계" class="statistics-expansion">
          <div class="statistics-actions q-pa-sm">
            <q-btn outlined dense icon="analytics" label="전체 통계 분석" class="accordion-action-btn q-mb-sm" @click="handleStatisticsAction('full-analysis')" />
            <q-btn outlined dense icon="trending_up" label="인기 샘플" class="accordion-action-btn q-mb-sm" @click="handleStatisticsAction('popular')" />
            <q-btn outlined dense icon="delete_outline" label="미사용 샘플" class="accordion-action-btn q-mb-sm" @click="handleStatisticsAction('unused')" />
            <q-btn outlined dense icon="category" label="카테고리별 통계" class="accordion-action-btn q-mb-sm" @click="handleStatisticsAction('by-category')" />
            <q-btn outlined dense icon="schedule" label="사용 빈도 통계" class="accordion-action-btn" @click="handleStatisticsAction('by-usage')" />
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

const { activeTab, selectedSample, recentSamples, favoriteSamples, filteredSamples, viewMode, handleSampleSelect, toggleFavorite } = useDevGuide()

// 계층적 카테고리 (계층적 분류 모드용)
const hierarchicalCategories = computed(() => {
  const categoryMap = new Map()
  filteredSamples.value.forEach((sample) => {
    const category = sample.category || '기타'
    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        name: category,
        icon: 'folder',
        samples: [],
      })
    }
    categoryMap.get(category).samples.push(sample)
  })
  return Array.from(categoryMap.values())
})

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

// 통계 액션 핸들러
function handleStatisticsAction(actionType) {
  // TODO: 통계 분석 로직 구현
  console.log('[DevGuideList] 통계 액션:', actionType)
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

  .statistics-expansion {
    :deep(.q-expansion-item__container) {
      border-bottom: 1px solid var(--nexa-border-color);
    }
  }

  .statistics-actions {
    .accordion-action-btn {
      width: 100%;
    }
  }
}
</style>
