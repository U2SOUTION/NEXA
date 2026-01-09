<!-- HistoryTab.vue
  GraphDoc 히스토리 탭
  분석 히스토리 목록 표시 및 관리
-->

<template>
  <div class="history-tab">
    <!-- 검색 및 정렬 헤더 -->
    <div class="history-header q-pa-sm">
      <div class="row items-center q-gutter-xs">
        <q-input v-model="searchQuery" placeholder="검색..." dense outlined clearable class="col">
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn flat dense round :icon="getSortIcon()" @click="handleSortToggle">
          <q-tooltip>{{ getSortTooltip() }}</q-tooltip>
        </q-btn>
        <q-btn flat dense round icon="delete_sweep" @click="handleClearAll">
          <q-tooltip>전체 삭제</q-tooltip>
        </q-btn>
      </div>
    </div>

    <q-separator />

    <!-- 히스토리 목록 -->
    <q-scroll-area class="history-list-area" style="height: 400px">
      <div v-if="filteredHistory.length === 0" class="empty-state q-pa-md text-center">
        <q-icon name="history" size="48px" color="grey-5" class="q-mb-sm" />
        <div class="text-caption text-grey-6">
          {{ searchQuery ? '검색 결과가 없습니다' : '히스토리가 없습니다' }}
        </div>
      </div>

      <div v-else class="history-list">
        <div v-for="item in filteredHistory" :key="item.id" class="history-item" @click="handleItemClick(item)">
          <q-icon :name="getDiagramIcon(item.diagramType)" :color="getDiagramColor(item.diagramType)" size="20px" class="history-item-icon" />
          <div class="history-item-text">
            <span class="history-item-name">{{ item.displayName || item.title }}</span>
            <span class="history-item-meta">{{ formatTimestamp(item.timestamp) }}</span>
          </div>
          <q-btn flat dense round icon="close" size="sm" class="history-item-delete" @click.stop="handleDeleteItem(item.id)">
            <q-tooltip>삭제</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-scroll-area>

    <!-- 우클릭 메뉴 (현재 비활성화 - 다음에 다른 방식으로 구현 예정) -->
    <!--
    <q-menu ref="contextMenu" touch-position>
      <q-list dense>
        <q-item clickable v-close-popup @click="handleCopyTarget(contextMenuItem)">
          <q-item-section avatar>
            <q-icon name="content_copy" />
          </q-item-section>
          <q-item-section>경로 복사</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="handleDeleteItem(contextMenuItem?.id)">
          <q-item-section avatar>
            <q-icon name="delete" />
          </q-item-section>
          <q-item-section>삭제</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
    -->
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useGraphDocHistory } from '@system/composables/useGraphDocHistory.js'

const $q = useQuasar()

// 히스토리 관리
const { history, removeHistoryItem, clearHistory } = useGraphDocHistory()

// 디버깅: 히스토리 데이터 확인
onMounted(() => {
  console.log('[HistoryTab] 마운트 완료, 히스토리 데이터:', history.value)
  console.log('[HistoryTab] 히스토리 개수:', history.value?.length || 0)
  console.log('[HistoryTab] filteredHistory 개수:', filteredHistory.value?.length || 0)
})

// 히스토리 변경 감지
watch(
  history,
  (newHistory) => {
    console.log('[HistoryTab] 히스토리 변경 감지:', newHistory?.length || 0, '개')
  },
  { deep: true },
)

// 검색 및 정렬
const searchQuery = ref('')
const sortBy = ref('newest')

// 정렬 순서: newest -> oldest -> nodeCount -> name -> newest
const sortOrder = ['newest', 'oldest', 'nodeCount', 'name']

// 정렬 아이콘
function getSortIcon() {
  const icons = {
    newest: 'schedule',
    oldest: 'schedule',
    nodeCount: 'bar_chart',
    name: 'sort_by_alpha',
  }
  return icons[sortBy.value] || 'schedule'
}

// 정렬 툴팁
function getSortTooltip() {
  const tooltips = {
    newest: '최신순',
    oldest: '오래된순',
    nodeCount: '노드 수 순',
    name: '이름순',
  }
  return tooltips[sortBy.value] || '정렬'
}

// 정렬 토글
function handleSortToggle() {
  const currentIndex = sortOrder.indexOf(sortBy.value)
  const nextIndex = (currentIndex + 1) % sortOrder.length
  sortBy.value = sortOrder[nextIndex]
}

// 우클릭 메뉴 (현재 비활성화 - 다음에 다른 방식으로 구현 예정)
// const contextMenu = ref(null)
// const contextMenuItem = ref(null)

// 필터링 및 정렬된 히스토리
const filteredHistory = computed(() => {
  let result = [...history.value]

  // 검색 필터
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((item) => {
      return item.target.toLowerCase().includes(query) || item.title.toLowerCase().includes(query) || (item.displayName && item.displayName.toLowerCase().includes(query))
    })
  }

  // 정렬
  switch (sortBy.value) {
    case 'newest':
      result.sort((a, b) => b.timestamp - a.timestamp)
      break
    case 'oldest':
      result.sort((a, b) => a.timestamp - b.timestamp)
      break
    case 'nodeCount':
      result.sort((a, b) => (b.metadata?.nodeCount || 0) - (a.metadata?.nodeCount || 0))
      break
    case 'name':
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
      break
  }

  return result
})

// 다이어그램 아이콘
function getDiagramIcon(diagramType) {
  const icons = {
    dependencyGraph: 'commit',
    dependencyAnalysis: 'hub',
    fileStructure: 'folder',
    codeSearch: 'code',
  }
  return icons[diagramType] || 'description'
}

// 다이어그램 색상
function getDiagramColor(diagramType) {
  const colors = {
    dependencyGraph: 'primary',
    dependencyAnalysis: 'info',
    fileStructure: 'secondary',
    codeSearch: 'accent',
  }
  return colors[diagramType] || 'grey'
}

// 타임스탬프 포맷
function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // 1분 이내
  if (diff < 60000) {
    return '방금 전'
  }
  // 1시간 이내
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}분 전`
  }
  // 24시간 이내
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}시간 전`
  }
  // 7일 이내
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}일 전`
  }
  // 그 외
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 항목 클릭 (재분석)
function handleItemClick(item) {
  console.log('[HistoryTab] 히스토리 항목 클릭:', item)

  // 전역 이벤트로 재분석 요청
  window.dispatchEvent(
    new CustomEvent('graph-doc-history-item-clicked', {
      detail: {
        target: item.target,
        diagramType: item.diagramType,
      },
    }),
  )
}

// 우클릭 메뉴 (현재 비활성화 - 다음에 다른 방식으로 구현 예정)
// function handleContextMenu(event, item) {
//   contextMenuItem.value = item
//   contextMenu.value?.show(event)
// }

// 경로 복사 (현재 비활성화 - 우클릭 메뉴와 함께 다음에 다른 방식으로 구현 예정)
// function handleCopyTarget(item) {
//   if (!item) return
//
//   navigator.clipboard.writeText(item.target).then(() => {
//     $q.notify({
//       type: 'positive',
//       message: '경로가 복사되었습니다',
//       position: 'top',
//       timeout: 2000,
//     })
//   })
// }

// 항목 삭제
function handleDeleteItem(id) {
  if (!id) return

  $q.dialog({
    title: '히스토리 삭제',
    message: '이 항목을 삭제하시겠습니까?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    removeHistoryItem(id)
    $q.notify({
      type: 'positive',
      message: '히스토리가 삭제되었습니다',
      position: 'top',
      timeout: 2000,
    })
  })
}

// 전체 삭제
function handleClearAll() {
  $q.dialog({
    title: '전체 삭제',
    message: '모든 히스토리를 삭제하시겠습니까?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    clearHistory()
    $q.notify({
      type: 'positive',
      message: '모든 히스토리가 삭제되었습니다',
      position: 'top',
      timeout: 2000,
    })
  })
}
</script>

<style lang="scss" scoped>
.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 12px;
  cursor: pointer;
  min-width: 0;

  &:not(:hover) {
    .history-item-delete {
      margin-right: -8px;
    }
  }

  &:hover {
    background-color: var(--nexa-surface-hover);

    .history-item-delete {
      opacity: 1;
      visibility: visible;
      width: auto !important;
      min-width: auto !important;
      max-width: 40px !important;
      flex-basis: auto !important;
      //pointer-events: auto;
    }
  }
}

.history-item-icon {
  flex-shrink: 0;
}

.history-item-text {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  width: 0;
}

.history-item-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--nexa-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-item-meta {
  font-size: 0.75rem;
  color: var(--nexa-text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}

.history-item-delete {
  flex-shrink: 0;
  visibility: hidden;
  //width: 0 !important;
  min-width: 0 !important;
  max-width: 0 !important;
  overflow: hidden;
  //pointer-events: none;
  //flex-basis: 0 !important;
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease,
    width 0.3s ease,
    max-width 0.3s ease;
}
</style>
