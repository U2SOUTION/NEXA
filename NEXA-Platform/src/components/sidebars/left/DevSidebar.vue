<!-- DevSidebar.vue
  개발 문서 관리 페이지 왼쪽 사이드바
  공통 헤더, 문서 관리 헤더, 문서 관리 리스트 포함
-->

<template>
  <div class="dev-sidebar">
    <!-- 공통 헤더 -->
    <LeftSidebarHeader title="DEV" subtitle="개발 문서 및 요구사항 관리" title-link="/dev" :show-restore-option="true" @header-hover="isLeftHeaderHovered = $event" @title-click="handleDevHeaderClick" />

    <!-- DevMenuSlider (항상 표시) -->
    <DevMenuSlider :header-hovered="isLeftHeaderHovered" @update:active-menu="handleActiveMenuChange" @open-settings="openSettings" />

    <!-- 문서 관리 헤더 및 리스트 (activeMenu === 'document-manager') -->
    <template v-if="activeMenu === 'document-manager'">
      <DocumentManagerHeader
        :header-hovered="isLeftHeaderHovered"
        :global-search-query="searchQuery"
        :search-mode="searchMode"
        :show-excluded-files="excludedFiles"
        :hide-completed="documentStore.hideCompleted"
        :auto-highlight-on-scroll="documentStore.autoHighlightOnScroll"
        :is-trash-view="contentRef?.isTrashView || false"
        :trash-count="documentStore.trashFiles.length"
        :get-search-placeholder="getSearchPlaceholder"
        :get-search-mode-icon="getSearchModeIcon"
        :get-search-mode-label="getSearchModeLabel"
        @update:global-search-query="searchQuery = $event"
        @perform-global-search="performGlobalSearch"
        @toggle-search-mode="toggleSearchMode"
        @toggle-excluded-files="toggleExcludedFiles"
        @toggle-hide-completed="toggleHideCompleted"
        @toggle-highlight="toggleHighlight"
        @toggle-trash-view="toggleTrashView"
        @load-markdown-files="loadMarkdownFiles"
        @open-settings="openSettings"
      />

      <!-- 문서 관리 리스트 -->
      <DocumentManagerList
        ref="contentRef"
        :global-search-query="searchQuery"
        :global-search-results="globalSearchResults"
        :global-search-excluded="globalSearchExcluded"
        :search-mode="searchMode"
        :show-excluded-files="excludedFiles"
        @move-to-trash="handleMoveSelectedToTrash"
        @restore="handleRestoreSelected"
        @permanently-delete="handlePermanentlyDeleteSelected"
      />
    </template>

    <!-- 테마 관리 헤더 및 리스트 (activeMenu === 'theme-manager') -->
    <template v-else-if="activeMenu === 'theme-manager'">
      <ThemeManagerHeader :categories="themeCategories" @theme-change="handleThemeManagerThemeChange" @search-change="handleSearchChange" @filter="handleCategoryFilterChange" @sort="handleSortChange" @statistics-action="handleStatisticsAction" />
      <ThemeManagerList :active-tab="themeManagerActiveTab" :statistics-data="themeStatisticsData" @tab-change="handleThemeManagerTabChange" @color-selected="handleThemeColorSelected" @statistics-action="handleStatisticsAction" />
    </template>

    <!-- 데이터베이스 뷰어 헤더 및 리스트 (activeMenu === 'database-viewer') -->
    <template v-else-if="activeMenu === 'database-viewer'">
      <DatabaseViewerHeader :db-info="databaseViewerDbInfo" :table-count="databaseViewerTableCount" @refresh="handleDatabaseViewerRefresh" @search-change="handleDatabaseViewerSearchChange" @settings="handleDatabaseViewerSettings" @sub-menu-change="handleDatabaseViewerSubMenuChange" />
      <DatabaseViewerList :search-query="databaseViewerSearchQuery" :refresh-trigger="databaseViewerRefreshTrigger" @table-selected="handleDatabaseViewerTableSelected" />
    </template>

    <!-- 컴포넌트 라이브러리 사이드바 (activeMenu === 'component-library') -->
    <template v-else-if="activeMenu === 'component-library'">
      <ComponentLibrarySidebar
        :categories="componentLibraryCategories"
        :manual-categories="componentLibraryManualCategories"
        :violations="componentLibraryViolations"
        :selected-category="componentLibrarySelectedCategory"
        :selected-component="componentLibrarySelectedComponent"
        :selected-violation="componentLibrarySelectedViolation"
        @search-change="handleComponentLibrarySearchChange"
        @category-selected="handleComponentLibraryCategorySelected"
        @component-selected="handleComponentLibraryComponentSelected"
        @violation-selected="handleComponentLibraryViolationSelected"
        @show-file-structure="handleComponentLibraryShowFileStructure"
        @show-file-structure-detail="handleComponentLibraryShowFileStructureDetail"
        @refresh="handleComponentLibraryRefresh"
        @settings="handleComponentLibrarySettings"
        @tab-change="handleComponentLibraryTabChange"
        @depth-change="handleComponentLibraryDepthChange"
        @dimension-selected="handleComponentLibraryDimensionSelected"
        @taxonomy-category-selected="handleComponentLibraryTaxonomyCategorySelected"
      />
    </template>

    <!-- 개발 가이드 헤더 및 리스트 (activeMenu === 'dev-guide') -->
    <template v-else-if="activeMenu === 'dev-guide'">
      <DevGuideHeader :header-hovered="isLeftHeaderHovered" @refresh="handleDevGuideRefresh" @settings="handleDevGuideSettings" />
      <DevGuideList :header-hovered="isLeftHeaderHovered" />
    </template>

    <!-- 에러 트래킹 -->
    <template v-else-if="activeMenu === 'error-tracking'">
      <ErrorTrackingSidebar
        :errors="errorTrackingErrors"
        :filtered-errors="errorTrackingFilteredErrors"
        :selected-error="errorTrackingSelectedError"
        :search-query="errorTrackingSearchQuery"
        :is-collecting="errorTrackingIsCollecting"
        :is-loading="errorTrackingIsLoading"
        :statistics="errorTrackingStatistics"
        @refresh="handleErrorTrackingRefresh"
        @search-change="handleErrorTrackingSearchChange"
        @settings="handleErrorTrackingSettings"
        @filter-change="handleErrorTrackingFilterChange"
        @sort-change="handleErrorTrackingSortChange"
        @collecting-toggle="handleErrorTrackingCollectingToggle"
        @error-selected="handleErrorTrackingErrorSelected"
        @tab-change="handleErrorTrackingTabChange"
      />
    </template>

    <!-- 설정 모달 -->
    <DocumentSettingsModal v-model="showSettingsModal" @save="handleSettingsSave" @reset-usage="handleResetUsage" @reset-priority="handleResetPriority" />
  </div>
</template>

<script setup>
import { ref, toRef, watch, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import LeftSidebarHeader from './LeftSidebarHeader.vue'
import DevMenuSlider from './dev-tools/DevMenuSlider.vue'
import DocumentManagerHeader from './dev-tools/document-manager/DocumentManagerHeader.vue'
import DocumentManagerList from './dev-tools/document-manager/DocumentManagerList.vue'
import ThemeManagerHeader from './dev-tools/theme-manager/ThemeManagerHeader.vue'
import ThemeManagerList from './dev-tools/theme-manager/ThemeManagerList.vue'
import DatabaseViewerHeader from './dev-tools/database-viewer/DatabaseViewerHeader.vue'
import DatabaseViewerList from './dev-tools/database-viewer/DatabaseViewerList.vue'
import ComponentLibrarySidebar from './dev-tools/component-library/ComponentLibrarySidebar.vue'
import ErrorTrackingSidebar from './dev-tools/error-tracking/ErrorTrackingSidebar.vue'
import DevGuideHeader from './dev-tools/dev-guide/DevGuideHeader.vue'
import DevGuideList from './dev-tools/dev-guide/DevGuideList.vue'
import DocumentSettingsModal from 'src/components/modals/DocumentSettingsModal.vue'
import { loadTOCSettings, saveTOCSettings } from 'src/modules/document-manager/services/documentStorage.js'
import { useDocumentMultiSelection } from 'src/composables/dev-tools/useDocumentMultiSelection.js'
import { useDocumentManagerStore } from 'src/stores/documentManagerStore.js'
import { useDocumentSearch } from 'src/modules/document-manager/composables/useDocumentSearch.js'
import { useComponentLibrary } from 'src/composables/dev-tools/useComponentLibrary.js'
import { useDatabaseViewer } from 'src/composables/dev-tools/useDatabaseViewer.js'
import { useThemeManager } from 'src/composables/dev-tools/useThemeManager.js'
import { useDocumentFilters } from 'src/composables/dev-tools/useDocumentFilters.js'
import { useErrorTracking } from 'src/composables/dev-tools/useErrorTracking.js'

// Quasar 인스턴스
const $q = useQuasar()

// LeftSidebarHeader 호버 상태
const isLeftHeaderHovered = ref(false)

// Store 사용
const documentStore = useDocumentManagerStore()

// Active menu 상태 (DevelopmentPage와 동기화)
const activeMenu = ref(null)

// Active menu 변경 핸들러
function handleActiveMenuChange(menuId) {
  activeMenu.value = menuId
  // 전역 이벤트로 DevelopmentPage와 DevToolsPanel에 알림
  window.dispatchEvent(new CustomEvent('dev-menu-changed', { detail: { activeMenu: menuId } }))
}

// DEV 헤더 클릭 핸들러 (메인 페이지로 이동)
function handleDevHeaderClick() {
  // activeMenu를 null로 리셋하여 DevelopmentPage 기본 뷰 표시
  activeMenu.value = null
  window.dispatchEvent(new CustomEvent('dev-menu-changed', { detail: { activeMenu: null } }))
}

// 테마 관리 (composable 사용)
const {
  activeTab: themeManagerActiveTab,
  statisticsData: themeStatisticsData,
  // eslint-disable-next-line no-unused-vars
  selectedThemeColor,
  // eslint-disable-next-line no-unused-vars
  searchQuery: themeSearchQuery,
  // eslint-disable-next-line no-unused-vars
  categoryFilter,
  // eslint-disable-next-line no-unused-vars
  sortOption,
  categories: themeCategories,
  handleThemeChange: handleThemeManagerThemeChange,
  handleSearchChange,
  handleCategoryFilterChange,
  handleSortChange,
  handleStatisticsAction,
  handleColorSelected: handleThemeColorSelected,
  loadCategories: loadThemeCategories,
  handleTabChange: handleThemeManagerTabChange,
} = useThemeManager()

// 데이터베이스 뷰어 관리 (composable 사용)
const {
  dbInfo: databaseViewerDbInfo,
  tableCount: databaseViewerTableCount,
  searchQuery: databaseViewerSearchQuery,
  refreshTrigger: databaseViewerRefreshTrigger,
  // eslint-disable-next-line no-unused-vars
  subMenu: databaseViewerSubMenu,
  // eslint-disable-next-line no-unused-vars
  selectedTable: databaseViewerSelectedTable,
  refresh: handleDatabaseViewerRefresh,
  handleSearchChange: handleDatabaseViewerSearchChange,
  handleTableSelected: handleDatabaseViewerTableSelected,
  handleSettings: handleDatabaseViewerSettings,
  handleSubMenuChange: handleDatabaseViewerSubMenuChange,
  handleRefreshEvent: handleDatabaseViewerRefreshEvent,
} = useDatabaseViewer()

// 컴포넌트 라이브러리 관리 (composable 사용)
const {
  categories: componentLibraryCategories,
  manualCategories: componentLibraryManualCategories,
  violations: componentLibraryViolations,
  selectedCategory: componentLibrarySelectedCategory,
  selectedComponent: componentLibrarySelectedComponent,
  selectedViolation: componentLibrarySelectedViolation,
  refresh: handleComponentLibraryRefresh,
  initialize: initializeComponentLibrary,
  handleDepthChange: handleComponentLibraryDepthChange,
  handleSearchChange: handleComponentLibrarySearchChange,
  handleCategorySelected: handleComponentLibraryCategorySelected,
  handleComponentSelected: handleComponentLibraryComponentSelected,
  handleViolationSelected: handleComponentLibraryViolationSelected,
  handleTabChange: handleComponentLibraryTabChange,
  handleDimensionSelected: handleComponentLibraryDimensionSelected,
  handleTaxonomyCategorySelected: handleComponentLibraryTaxonomyCategorySelected,
  handleShowFileStructure: handleComponentLibraryShowFileStructure,
  handleShowFileStructureDetail: handleComponentLibraryShowFileStructureDetail,
  handleSettings: handleComponentLibrarySettings,
  handleStatisticsRequest,
} = useComponentLibrary()

// 에러 트래킹 관리 (composable 사용)
const {
  errors: errorTrackingErrors,
  filteredErrors: errorTrackingFilteredErrors,
  selectedError: errorTrackingSelectedError,
  searchQuery: errorTrackingSearchQuery,
  isCollecting: errorTrackingIsCollecting,
  isLoading: errorTrackingIsLoading,
  statistics: errorTrackingStatistics,
  refresh: handleErrorTrackingRefresh,
  handleSearchChange: handleErrorTrackingSearchChange,
  handleFilterChange: handleErrorTrackingFilterChange,
  handleSortChange: handleErrorTrackingSortChange,
  handleCollectingToggle: handleErrorTrackingCollectingToggle,
  selectError: handleErrorTrackingErrorSelected,
  initialize: initializeErrorTracking,
  updateErrorStatus: handleErrorTrackingStatusUpdate,
  deleteError: handleErrorTrackingDelete,
  findSimilarErrorsForError: errorTrackingFindSimilarErrorsForError,
  batchUpdateErrorStatus: errorTrackingBatchUpdateErrorStatus,
  batchDeleteError: errorTrackingBatchDeleteError,
} = useErrorTracking()

// Content 컴포넌트 참조
const contentRef = ref(null)

// 문서 멀티 셀렉션 작업 (composable 사용)
const { moveSelectedToTrash: handleMoveSelectedToTrash, restoreSelected: handleRestoreSelected, permanentlyDeleteSelected: handlePermanentlyDeleteSelected } = useDocumentMultiSelection(documentStore, contentRef)

// 설정 모달 상태
const showSettingsModal = ref(false)

// 검색 관련 상태 및 함수
const searchMode = ref('both')
const trashFiles = toRef(documentStore, 'trashFiles')

// 설정 저장 함수 (실제 구현)
const saveSettings = () => {
  // DocumentManagerList의 saveSettings 호출
  if (contentRef.value?.saveSettings) {
    contentRef.value.saveSettings()
  }

  // showExcludedFiles와 searchMode도 저장
  saveTOCSettings({
    showExcludedFiles: excludedFiles.value,
    searchMode: searchMode.value,
  })
}

// 검색 기능 (DevSidebar에서 중앙 관리)
const {
  globalSearchQuery: searchQuery,
  globalSearchKeywords,
  globalSearchResults,
  globalSearchExcluded,
  showExcludedFiles: excludedFiles,
  performGlobalSearch,
  toggleSearchMode,
  getSearchModeIcon,
  getSearchModeLabel,
  getSearchPlaceholder,
} = useDocumentSearch(toRef(documentStore, 'markdownFiles'), toRef(documentStore, 'fileContents'), searchMode, saveSettings, trashFiles)

// 문서 필터 관리 (composable 사용) - saveSettings와 excludedFiles가 정의된 후에 호출
const { toggleExcludedFiles, toggleHideCompleted, toggleHighlight, toggleTrashView } = useDocumentFilters(documentStore, contentRef, saveSettings, excludedFiles)

// 검색 키워드를 store에 동기화 (DevelopmentPage에서 사용)
watch(
  () => globalSearchKeywords.value,
  (newKeywords) => {
    documentStore.globalSearchKeywords = newKeywords
  },
  { immediate: true, deep: true },
)

// 검색 결과를 store에 동기화 (DevelopmentPage에서 사용)
watch(
  () => globalSearchResults.value,
  (newResults) => {
    documentStore.globalSearchResults = newResults
  },
  { immediate: true, deep: true },
)

// 검색 제외 목록을 store에 동기화
watch(
  () => globalSearchExcluded.value,
  (newExcluded) => {
    documentStore.globalSearchExcluded = newExcluded
  },
  { immediate: true, deep: true },
)

// 설정 모달 저장 핸들러
function handleSettingsSave() {
  // DocumentManagerList에서 처리
  if (contentRef.value) {
    // 필요시 contentRef를 통해 설정 저장
  }
}

// 사용빈도 초기화 핸들러
function handleResetUsage() {
  // DocumentManagerList에서 처리
  if (contentRef.value) {
    // 필요시 contentRef를 통해 초기화
  }
}

// 우선순위 초기화 핸들러
function handleResetPriority() {
  // DocumentManagerList에서 처리
  if (contentRef.value) {
    // 필요시 contentRef를 통해 초기화
  }
}

async function loadMarkdownFiles() {
  try {
    const beforeCount = documentStore.markdownFiles.length
    // Store의 loadMarkdownFiles를 직접 호출하여 파일 목록 새로고침
    await documentStore.loadMarkdownFiles()
    const afterCount = documentStore.markdownFiles.length
    const addedCount = afterCount - beforeCount

    let message = `파일 목록이 새로고침되었습니다 (${afterCount}개 파일)`
    if (addedCount > 0) {
      message += `, +${addedCount}개 추가`
    }

    $q.notify({
      type: 'positive',
      message: message,
      position: 'top',
      timeout: 5000,
      icon: 'refresh',
    })
  } catch (error) {
    console.error('[DevSidebar] 파일 목록 새로고침 실패:', error)
    $q.notify({
      type: 'negative',
      message: `새로고침 실패: ${error.message || '알 수 없는 오류'}`,
      position: 'top',
      timeout: 6000,
      icon: 'error',
    })
  }
}

function openSettings() {
  showSettingsModal.value = true
}

// activeMenu가 'theme-manager'로 변경될 때 카테고리 로드
watch(
  () => activeMenu.value,
  (newMenu) => {
    if (newMenu === 'theme-manager') {
      loadThemeCategories()
    } else if (newMenu === 'database-viewer') {
      // 데이터베이스 뷰어 메뉴 활성화 시 초기 데이터 로드
      handleDatabaseViewerRefresh()
    } else if (newMenu === 'component-library') {
      // 컴포넌트 라이브러리 메뉴 활성화 시 초기 스캔
      initializeComponentLibrary()
    } else if (newMenu === 'error-tracking') {
      // 에러 트래킹 메뉴 활성화 시 초기화
      initializeErrorTracking()
    }
  },
  { immediate: true },
)

// 초기 activeMenu 로드 함수 (DevelopmentPage와 동일한 로직)
function getInitialActiveMenu() {
  try {
    // 이전 메뉴 복원 옵션 확인
    const restoreOption = localStorage.getItem('dev-restore-last-menu')
    const shouldRestore = restoreOption === null || restoreOption === 'true' // 기본값: true

    if (shouldRestore) {
      const saved = localStorage.getItem('dev-active-menu')
      if (saved) {
        // 유효한 메뉴 ID인지 확인
        const validMenus = [
          'document-manager',
          'theme-manager',
          'dev-guide',
          'component-library',
          'database-viewer',
          'api-tester',
          'log-viewer',
          'performance-monitor',
          'error-tracking',
          'settings-manager',
          'test-runner',
          'build-tools',
          'network-monitor',
          'environment-variables',
          'package-manager',
          'document-generator',
          'deployment-manager',
        ]
        if (validMenus.includes(saved)) {
          return saved
        }
      }
    }
  } catch (error) {
    console.error('[DevSidebar] 초기 메뉴 로드 실패:', error)
  }
  return null
}

// 컴포넌트 마운트 시 설정 로드
onMounted(() => {
  // showExcludedFiles와 searchMode 설정 로드
  loadTOCSettings({
    showExcludedFiles: excludedFiles,
    searchMode,
  })

  // 초기 activeMenu 설정 (DevelopmentPage와 동기화)
  const initialMenu = getInitialActiveMenu()
  if (initialMenu !== null) {
    activeMenu.value = initialMenu
  }

  // DevelopmentPage에서 메뉴 변경 이벤트를 받아서 동기화 (지속적으로 리스닝)
  function handleMenuChanged(event) {
    const menuId = event.detail.activeMenu
    // null 포함하여 항상 동기화 (메인 페이지로 리셋 시에도 처리)
    activeMenu.value = menuId
    
    // 테마 관리 메뉴가 활성화되어 있으면 카테고리 로드
    if (menuId === 'theme-manager') {
      loadThemeCategories()
    }
  }

  // dev-menu-changed 이벤트를 지속적으로 리스닝
  window.addEventListener('dev-menu-changed', handleMenuChanged)

  // 언마운트 시 제거를 위해 참조 저장
  window.__devSidebarMenuChangedHandler = handleMenuChanged

  // 데이터베이스 뷰어 새로고침 이벤트 리스너 등록
  window.addEventListener('database-viewer-refresh', handleDatabaseViewerRefreshEvent)

  // 컴포넌트 라이브러리 통계 요청 이벤트 리스너 등록
  window.addEventListener('component-library-statistics-request', handleStatisticsRequest)

  // 에러 트래킹 이벤트 리스너 등록
  window.addEventListener('error-tracking-status-update', (event) => {
    const { errorId, status, includeSimilar, error: errorObject } = event.detail
    if (includeSimilar) {
      errorTrackingBatchUpdateErrorStatus(errorId, status, true, errorObject) // includeSimilar와 errorObject 파라미터 전달
    } else {
      handleErrorTrackingStatusUpdate(errorId, status)
    }
  })

  // 에러 ID 찾기 이벤트 리스너
  window.addEventListener('error-tracking-find-error-id', (event) => {
    const { error } = event.detail
    if (error) {
      // 메시지와 타임스탬프로 찾기
      const foundError = errorTrackingErrors.value.find((e) => {
        return e.message === error.message && e.timestamp === error.timestamp && e.level === error.level
      })

      if (foundError && foundError.id) {
        window.dispatchEvent(
          new CustomEvent('error-tracking-error-id-found', {
            detail: { errorId: foundError.id },
          }),
        )
      }
    }
  })
  window.addEventListener('error-tracking-delete', (event) => {
    const { errorId, includeSimilar, error: errorObject } = event.detail
    if (includeSimilar) {
      errorTrackingBatchDeleteError(errorId, true, errorObject) // includeSimilar와 errorObject 파라미터 전달
    } else {
      handleErrorTrackingDelete(errorId)
    }
  })
  window.addEventListener('error-tracking-error-selected', (event) => {
    // 선택된 에러의 유사한 에러 개수 계산
    const error = event.detail.error
    if (error) {
      const similarCount = errorTrackingFindSimilarErrorsForError(error).length
      window.dispatchEvent(
        new CustomEvent('error-tracking-similar-errors-count', {
          detail: { count: similarCount },
        }),
      )
    }
  })
  window.addEventListener('error-tracking-request-similar-count', (event) => {
    // 유사한 에러 개수 요청 처리
    const error = event.detail.error
    if (error) {
      const similarCount = errorTrackingFindSimilarErrorsForError(error).length
      window.dispatchEvent(
        new CustomEvent('error-tracking-similar-errors-count', {
          detail: { count: similarCount },
        }),
      )
    }
  })
  window.addEventListener('error-tracking-request-errors', () => {
    // 에러 목록 요청 처리
    window.dispatchEvent(
      new CustomEvent('error-tracking-errors-updated', {
        detail: { errors: errorTrackingErrors.value },
      }),
    )
    // 통계도 함께 전송
    window.dispatchEvent(
      new CustomEvent('error-tracking-statistics-updated', {
        detail: errorTrackingStatistics.value,
      }),
    )
  })

  // 컴포넌트 라이브러리 초기 스캔
  initializeComponentLibrary()

  // 이후 변경사항은 handleActiveMenuChange로 처리 (이미 등록되어 있음)
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  window.removeEventListener('database-viewer-refresh', handleDatabaseViewerRefreshEvent)
  window.removeEventListener('component-library-statistics-request', handleStatisticsRequest)
  if (window.__devSidebarMenuChangedHandler) {
    window.removeEventListener('dev-menu-changed', window.__devSidebarMenuChangedHandler)
    delete window.__devSidebarMenuChangedHandler
  }
})

// 개발 가이드 새로고침 핸들러
function handleDevGuideRefresh() {
  console.log('[DevSidebar] 개발 가이드 새로고침')
  // TODO: 개발 가이드 샘플 목록 새로고침
}

// 개발 가이드 설정 핸들러
function handleDevGuideSettings() {
  console.log('[DevSidebar] 개발 가이드 설정')
  // TODO: 설정 모달 열기
}

// 에러 트래킹 설정 핸들러
function handleErrorTrackingSettings() {
  console.log('[DevSidebar] 에러 트래킹 설정')
  // TODO: 설정 모달 열기
}

// 에러 트래킹 탭 변경 핸들러
function handleErrorTrackingTabChange(tab) {
  // 탭 변경 시 상태 필터 또는 타입 필터 업데이트
  if (tab === 'lint') {
    // Lint 탭 선택 시
    handleErrorTrackingFilterChange({
      level: 'lint', // lint 타입 필터
      status: null,
      timeRange: null,
    })
  } else {
    // 상태 탭 선택 시
    handleErrorTrackingFilterChange({
      level: null, // 레벨 필터는 유지
      status: tab === 'all' ? null : tab,
      timeRange: null, // 시간 범위 필터는 유지
    })
  }
}
</script>

<style lang="scss" scoped>
.dev-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;

  // 리스트 컨테이너 오른쪽 패딩 (보더가 가려지지 않도록)
  :deep(.q-list) {
    padding-right: 2px;
  }

  :deep(.q-item:not(:first-child)) {
    border-top-color: var(--nexa-border-color);
    border-top-width: 1px;
  }
}
</style>
