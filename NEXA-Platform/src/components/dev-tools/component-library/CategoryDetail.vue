<!-- CategoryDetail.vue
  카테고리 상세 정보 컴포넌트
  카테고리 선택 시 의존성 다이어그램 표시
-->

<template>
  <div class="category-detail">
    <!-- 탭 정보 (선택된 카테고리가 없을 때) -->
    <TabInfo v-if="!selectedCategory" :tab-name="tabName" :statistics="statistics" />

    <!-- 선택된 카테고리가 있을 때는 기존 상세 정보 표시 -->
    <div v-else class="category-detail-content">
      <!-- 카테고리 헤더 -->
      <div class="category-header q-pa-md">
        <div class="row items-center q-gutter-sm">
          <q-icon :name="selectedCategory.icon || 'folder'" size="24px" color="primary" />
          <div class="col">
            <div class="text-h6">{{ selectedCategory.displayName }}</div>
            <div class="text-caption text-grey-7">
              <span v-if="selectedCategory.components">{{ selectedCategory.components.length }}개 컴포넌트</span>
            </div>
          </div>
          <q-btn flat dense icon="refresh" label="새로고침" @click="analyzeDependencies" :loading="isAnalyzing" />
        </div>
      </div>

      <!-- 의존성 다이어그램 -->
      <div v-if="diagramData.tables && diagramData.tables.length > 0" class="diagram-section">
        <NexaDiagram v-if="diagramData.tables && diagramData.relationships" ref="nexaDiagramRef" type="erd" :data="diagramData" :options="diagramOptions" :auto-load="false" @node-click="handleNodeClick" @node-hover="handleNodeHover" @error="handleDiagramError" @loaded="handleDiagramLoaded" />

        <!-- 로딩 상태 -->
        <div v-if="isAnalyzing" class="diagram-loading q-pa-lg text-center">
          <q-spinner color="primary" size="3em" />
          <div class="q-mt-md text-caption">의존성 분석 중...</div>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="diagramError" class="diagram-error q-pa-lg text-center">
          <q-icon name="error_outline" size="48px" color="negative" class="q-mb-md" />
          <div class="text-body2 text-negative q-mb-sm">{{ diagramError }}</div>
          <q-btn flat dense label="다시 시도" icon="refresh" @click="analyzeDependencies" />
        </div>
      </div>

      <!-- 다이어그램 없음 -->
      <div v-else-if="!isAnalyzing" class="empty-diagram q-pa-xl text-center">
        <q-icon name="account_tree" size="64px" color="grey-7" class="q-mb-md" />
        <div class="text-body2 text-grey-7">의존성 정보가 없습니다.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import NexaDiagram from 'src/diagram/NexaDiagram.vue'
import { analyzeCategoryDependencies, convertToERDFormat } from 'src/utils/componentDependencyAnalyzer.js'
import TabInfo from './TabInfo.vue'

const props = defineProps({
  tabName: {
    type: String,
    default: 'systems', // 'systems' 또는 'directory'
  },
})

const selectedCategory = ref(null)

// 통계 데이터 상태
const systemsCount = ref(0)
const systemsComponentCount = ref(0)
const averageComponentsPerSystem = ref(0)
const topSystemByComponents = ref(null)
const emptySystems = ref(0)

const directoryCategoryCount = ref(0)
const directoryComponentCount = ref(0)
const maxDepth = ref(0)
const averageDepth = ref(0)

// 통계 데이터
const statistics = computed(() => {
  if (props.tabName === 'systems') {
    const stats = {
      totalSystems: { label: '시스템 수', value: String(systemsCount.value), description: 'NEXA 시스템 카테고리' },
      totalComponents: { label: '컴포넌트 수', value: String(systemsComponentCount.value), description: '시스템별 분류된 컴포넌트' },
    }

    // 추가 통계가 있으면 표시
    if (averageComponentsPerSystem.value > 0) {
      stats.averageComponentsPerSystem = {
        label: '시스템당 평균',
        value: String(averageComponentsPerSystem.value),
        description: '시스템당 평균 컴포넌트 수',
      }
    }

    if (topSystemByComponents.value) {
      stats.topSystemByComponents = {
        label: '최다 컴포넌트',
        value: `${topSystemByComponents.value.name} (${topSystemByComponents.value.count})`,
        description: '컴포넌트가 가장 많은 시스템',
      }
    }

    if (emptySystems.value > 0) {
      stats.emptySystems = {
        label: '빈 시스템',
        value: String(emptySystems.value),
        description: '컴포넌트가 없는 시스템',
      }
    }

    return stats
  } else {
    const stats = {
      totalCategories: { label: '카테고리 수', value: String(directoryCategoryCount.value), description: '디렉토리 기반 카테고리' },
      totalComponents: { label: '컴포넌트 수', value: String(directoryComponentCount.value), description: '디렉토리별 분류된 컴포넌트' },
    }

    // 깊이 통계 추가
    if (maxDepth.value > 0) {
      stats.maxDepth = {
        label: '최대 깊이',
        value: String(maxDepth.value),
        description: '가장 깊은 디렉토리 깊이',
      }
    }

    if (averageDepth.value > 0) {
      stats.averageDepth = {
        label: '평균 깊이',
        value: String(averageDepth.value),
        description: '평균 디렉토리 깊이',
      }
    }

    return stats
  }
})

// 통계 업데이트 이벤트 리스너
function handleStatisticsUpdate(event) {
  if (event.detail) {
    if (props.tabName === 'systems') {
      if (event.detail.systemsCount !== undefined) {
        systemsCount.value = event.detail.systemsCount
      }
      if (event.detail.systemsComponentCount !== undefined) {
        systemsComponentCount.value = event.detail.systemsComponentCount
      }
      if (event.detail.averageComponentsPerSystem !== undefined) {
        averageComponentsPerSystem.value = event.detail.averageComponentsPerSystem
      }
      if (event.detail.topSystemByComponents !== undefined) {
        topSystemByComponents.value = event.detail.topSystemByComponents
      }
      if (event.detail.emptySystems !== undefined) {
        emptySystems.value = event.detail.emptySystems
      }
    } else {
      if (event.detail.directoryCategoryCount !== undefined) {
        directoryCategoryCount.value = event.detail.directoryCategoryCount
      }
      if (event.detail.directoryComponentCount !== undefined) {
        directoryComponentCount.value = event.detail.directoryComponentCount
      }
      if (event.detail.maxDepth !== undefined) {
        maxDepth.value = event.detail.maxDepth
      }
      if (event.detail.averageDepth !== undefined) {
        averageDepth.value = event.detail.averageDepth
      }
    }
  }
}
const isAnalyzing = ref(false)
const diagramError = ref(null)
const nexaDiagramRef = ref(null)

// 다이어그램 데이터
const diagramData = ref({
  tables: [],
  relationships: [],
})

// 다이어그램 옵션
const diagramOptions = computed(() => ({
  selectedNode: null,
  layoutType: 'hierarchical',
  layoutOptions: {
    rankdir: 'LR', // Left to Right
    nodesep: 50,
    ranksep: 80,
  },
  onNodeClick: handleNodeClick,
  onNodeHover: handleNodeHover,
}))

// 카테고리 선택 핸들러
function handleCategorySelected(event) {
  selectedCategory.value = event.detail.category
  if (selectedCategory.value && selectedCategory.value.components) {
    analyzeDependencies()
  }
}

// 의존성 분석
async function analyzeDependencies() {
  if (!selectedCategory.value || !selectedCategory.value.components) {
    return
  }

  isAnalyzing.value = true
  diagramError.value = null

  try {
    const graphData = await analyzeCategoryDependencies(selectedCategory.value.components)
    diagramData.value = convertToERDFormat(graphData)

    // 다이어그램 렌더링
    await nextTick()
    if (nexaDiagramRef.value) {
      nexaDiagramRef.value.renderDiagram()
    }
  } catch (error) {
    console.error('[CategoryDetail] 의존성 분석 실패:', error)
    diagramError.value = error.message || '의존성 분석 중 오류가 발생했습니다.'
  } finally {
    isAnalyzing.value = false
  }
}

// 노드 클릭 핸들러
function handleNodeClick(nodeId) {
  console.log('[CategoryDetail] 노드 클릭:', nodeId)
  // TODO: 컴포넌트 상세 정보 표시
}

// 노드 호버 핸들러
// eslint-disable-next-line no-unused-vars
function handleNodeHover(_nodeId, _isEntering) {
  // TODO: 호버 효과
}

// 다이어그램 에러 핸들러
function handleDiagramError(error) {
  console.error('[CategoryDetail] 다이어그램 에러:', error)
  diagramError.value = error.message || '다이어그램 렌더링 중 오류가 발생했습니다.'
}

// 다이어그램 로드 완료 핸들러
function handleDiagramLoaded(renderResult) {
  console.log('[CategoryDetail] 다이어그램 로드 완료:', renderResult)
}

// 카테고리 변경 시 자동 분석
watch(
  () => selectedCategory.value,
  (newCategory) => {
    if (newCategory && newCategory.components) {
      analyzeDependencies()
    }
  },
)

onMounted(() => {
  window.addEventListener('component-library-category-selected', handleCategorySelected)
  window.addEventListener('component-library-statistics-updated', handleStatisticsUpdate)

  // 마운트 시 통계 요청
  window.dispatchEvent(new CustomEvent('component-library-statistics-request'))
})

onUnmounted(() => {
  window.removeEventListener('component-library-category-selected', handleCategorySelected)
  window.removeEventListener('component-library-statistics-updated', handleStatisticsUpdate)
})
</script>

<style lang="scss" scoped>
.category-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-background);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--nexa-text-secondary);
}

.category-detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.category-header {
  border-bottom: 1px solid var(--nexa-border-color);
  background-color: var(--nexa-surface);
  flex-shrink: 0;
}

.diagram-section {
  flex: 1;
  position: relative;
  min-height: 400px;
  overflow: hidden;
}

.diagram-loading,
.diagram-error,
.empty-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--nexa-text-secondary);
}

:deep(.nexa-diagram-container) {
  width: 100%;
  height: 100%;
}
</style>
