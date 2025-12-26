<!-- DevSidebar.vue
  개발 문서 관리 페이지 왼쪽 사이드바
  공통 헤더, 문서 관리 헤더, 문서 관리 리스트 포함
-->

<template>
  <div class="dev-sidebar">
    <!-- 공통 헤더 -->
    <LeftSidebarHeader title="DEV" subtitle="개발 문서 및 요구사항 관리" @header-hover="isLeftHeaderHovered = $event" />

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
      <ThemeManagerList :active-tab="themeManagerActiveTab" :statistics-data="themeStatisticsData" @tab-change="themeManagerActiveTab = $event" @color-selected="handleThemeColorSelected" @statistics-action="handleStatisticsAction" />
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
import DocumentSettingsModal from 'src/components/modals/DocumentSettingsModal.vue'
import { moveToTrash, restoreFromTrash, permanentlyDeleteFromTrash, loadTOCSettings, saveTOCSettings } from 'src/modules/document-manager/services/documentStorage.js'
import { useDocumentManagerStore } from 'src/stores/documentManagerStore.js'
import { useUserSettingsStore } from 'src/stores/userSettingsStore'
import { useDocumentSearch } from 'src/modules/document-manager/composables/useDocumentSearch.js'
import { extractThemeColors } from 'src/utils/themeColorParser'

// Quasar 인스턴스
const $q = useQuasar()

// LeftSidebarHeader 호버 상태
const isLeftHeaderHovered = ref(false)

// Store 사용
const documentStore = useDocumentManagerStore()

// Active menu 상태
const activeMenu = ref('document-manager')

// Active menu 변경 핸들러
function handleActiveMenuChange(menuId) {
  activeMenu.value = menuId
  // 전역 이벤트로 DevelopmentPage와 DevToolsPanel에 알림
  window.dispatchEvent(new CustomEvent('dev-menu-changed', { detail: { activeMenu: menuId } }))
}

// 테마 관리 관련 상태
const themeManagerActiveTab = ref('recent')
const themeStatisticsData = ref([])
const selectedThemeColor = ref(null)

// 검색/필터/정렬 상태 (테마 관리용)
const themeSearchQuery = ref('')
const categoryFilter = ref(null)
const sortOption = ref('category')

// 카테고리 목록 (ThemeManagerHeader에 전달)
const themeCategories = ref([])

// 데이터베이스 뷰어 관련 상태
const databaseViewerDbInfo = ref({
  databaseName: null,
  version: null,
  charset: null,
})
const databaseViewerTableCount = ref(0)
const databaseViewerSearchQuery = ref('')
const databaseViewerRefreshTrigger = ref(0)
const databaseViewerSubMenu = ref('erd')

// 컴포넌트 라이브러리 관련 상태
const componentLibraryCategories = ref([
  {
    name: 'ui',
    displayName: 'UI 컴포넌트',
    components: [
      { name: 'BaseModal', path: 'components/ui/BaseModal.vue', icon: 'modal' },
      { name: 'ContextMenu', path: 'components/ui/ContextMenu.vue', icon: 'menu' },
      { name: 'DataPageNavigation', path: 'components/ui/DataPageNavigation.vue', icon: 'navigation' },
      { name: 'GlobalSkeletonLoader', path: 'components/ui/GlobalSkeletonLoader.vue', icon: 'hourglass_empty' },
      { name: 'TableActionsOverlay', path: 'components/ui/TableActionsOverlay.vue', icon: 'more_vert' },
      { name: 'TableEmptyState', path: 'components/ui/TableEmptyState.vue', icon: 'inbox' },
      { name: 'TableFilterBar', path: 'components/ui/TableFilterBar.vue', icon: 'filter_list' },
      { name: 'UploadProgress', path: 'components/ui/UploadProgress.vue', icon: 'cloud_upload' },
    ],
  },
  {
    name: 'form',
    displayName: '폼 컴포넌트',
    components: [
      { name: 'AddBoardForm', path: 'components/form/AddBoardForm.vue', icon: 'dashboard' },
      { name: 'AddDeviceForm', path: 'components/form/AddDeviceForm.vue', icon: 'devices' },
      { name: 'AddGroupForm', path: 'components/form/AddGroupForm.vue', icon: 'group' },
    ],
  },
  {
    name: 'parts-management',
    displayName: '부품 관리',
    components: [
      { name: 'PartClassesView', path: 'components/parts-management/PartClassesView.vue', icon: 'category' },
      { name: 'PartModelsView', path: 'components/parts-management/PartModelsView.vue', icon: 'inventory_2' },
      { name: 'PartFilesView', path: 'components/parts-management/PartFilesView.vue', icon: 'folder' },
      { name: 'PartSpecsView', path: 'components/parts-management/PartSpecsView.vue', icon: 'description' },
      { name: 'StorageBlockGrid', path: 'components/parts-management/StorageBlockGrid.vue', icon: 'grid_view' },
      { name: 'PartsDataDashboard', path: 'components/parts-management/PartsDataDashboard.vue', icon: 'dashboard' },
    ],
  },
  {
    name: 'sidebars',
    displayName: '사이드바',
    components: [
      { name: 'DevToolsPanel', path: 'components/sidebars/right/DevToolsPanel.vue', icon: 'build' },
      { name: 'RightSidebarHeader', path: 'components/sidebars/right/RightSidebarHeader.vue', icon: 'menu' },
      { name: 'NexaBoardToolsPanel', path: 'components/sidebars/right/NexaBoardToolsPanel.vue', icon: 'dashboard' },
    ],
  },
  {
    name: 'settings',
    displayName: '설정',
    components: [
      { name: 'IotSettings', path: 'components/settings/IotSettings.vue', icon: 'settings' },
      { name: 'LayoutSettings', path: 'components/settings/LayoutSettings.vue', icon: 'view_quilt' },
      { name: 'ShortcutsSettings', path: 'components/settings/ShortcutsSettings.vue', icon: 'keyboard' },
      { name: 'SystemSettings', path: 'components/settings/SystemSettings.vue', icon: 'computer' },
      { name: 'ThemeSettings', path: 'components/settings/ThemeSettings.vue', icon: 'palette' },
    ],
  },
  {
    name: 'side-panel',
    displayName: '사이드 패널',
    components: [
      { name: 'DeviceSection', path: 'components/side-panel/sections/DeviceSection.vue', icon: 'devices' },
      { name: 'HistorySection', path: 'components/side-panel/sections/HistorySection.vue', icon: 'history' },
      { name: 'LayoutSection', path: 'components/side-panel/sections/LayoutSection.vue', icon: 'view_quilt' },
      { name: 'NexaPanelSection', path: 'components/side-panel/sections/NexaPanelSection.vue', icon: 'dashboard' },
      { name: 'NotificationSection', path: 'components/side-panel/sections/NotificationSection.vue', icon: 'notifications' },
    ],
  },
])
const componentLibraryViolations = ref([])
const componentLibrarySelectedCategory = ref(null)
const componentLibrarySelectedComponent = ref(null)
const componentLibrarySelectedViolation = ref(null)
const componentLibrarySearchQuery = ref('')

// 테마 관리 테마 변경 핸들러
function handleThemeManagerThemeChange(themeValue) {
  const $q = useQuasar()
  const userSettings = useUserSettingsStore()
  const isDark = themeValue === 'dark'

  // 사용자 설정 스토어를 통해 테마 변경
  userSettings.settings.theme.isDarkMode = isDark
  $q.dark.set(isDark)
  document.body.classList.toggle('dark', isDark)
  userSettings.saveSettings()

  // 테마 변경 이벤트를 DevelopmentPage로 전달
  window.dispatchEvent(new CustomEvent('theme-manager-theme-changed', { detail: { theme: themeValue } }))
}

// 검색 변경 핸들러
function handleSearchChange(query) {
  themeSearchQuery.value = query
  // 전역 이벤트로 DevelopmentPage에 알림
  window.dispatchEvent(new CustomEvent('theme-manager-search-changed', { detail: { query } }))
}

// 카테고리 필터 변경 핸들러
function handleCategoryFilterChange(category) {
  categoryFilter.value = category
  // 전역 이벤트로 DevelopmentPage에 알림
  window.dispatchEvent(new CustomEvent('theme-manager-filter-changed', { detail: { category } }))
}

// 정렬 변경 핸들러
function handleSortChange(option) {
  sortOption.value = option
  // 전역 이벤트로 DevelopmentPage에 알림
  window.dispatchEvent(new CustomEvent('theme-manager-sort-changed', { detail: { option } }))
}

// 통계 액션 핸들러
function handleStatisticsAction(actionType) {
  // TODO: 통계 분석 로직 구현
  console.log('[ThemeManager] 통계 액션:', actionType)
  // 임시로 빈 배열 설정 (나중에 실제 분석 결과로 교체)
  themeStatisticsData.value = []

  // TODO: themeUsageAnalyzer.js를 사용하여 실제 분석 수행
}

// 테마 색상 선택 핸들러
function handleThemeColorSelected(colorData) {
  selectedThemeColor.value = colorData
  // 전역 이벤트로 오른쪽 패널에 알림
  window.dispatchEvent(new CustomEvent('theme-color-selected', { detail: { color: colorData } }))
}

// 테마 카테고리 로드 함수
function loadThemeCategories() {
  try {
    const categories = extractThemeColors()
    themeCategories.value = categories
  } catch (error) {
    console.error('[DevSidebar] 테마 카테고리 로드 실패:', error)
  }
}

// 데이터베이스 뷰어 새로고침 핸들러
async function handleDatabaseViewerRefresh() {
  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

    // 데이터베이스 정보 조회
    const infoResponse = await fetch(`${apiBaseUrl}/db/info`)
    const infoData = await infoResponse.json()

    // 503 에러는 데이터베이스 연결 문제
    if (infoResponse.status === 503) {
      console.warn('[DevSidebar] 데이터베이스 연결이 없습니다:', infoData.message)
      databaseViewerDbInfo.value = {
        databaseName: null,
        version: null,
        charset: null,
      }
      databaseViewerTableCount.value = 0
      return
    }

    if (infoData.success && infoData.data) {
      databaseViewerDbInfo.value = infoData.data
    }

    // 테이블 목록 조회 (개수만)
    const tablesResponse = await fetch(`${apiBaseUrl}/db/tables`)
    const tablesData = await tablesResponse.json()

    // 503 에러는 데이터베이스 연결 문제
    if (tablesResponse.status === 503) {
      console.warn('[DevSidebar] 데이터베이스 연결이 없습니다:', tablesData.message)
      databaseViewerTableCount.value = 0
      return
    }

    if (tablesData.success && tablesData.data) {
      databaseViewerTableCount.value = tablesData.data.length
    }

    // 리스트 컴포넌트 새로고침 트리거
    databaseViewerRefreshTrigger.value++
  } catch (error) {
    // ERR_CONNECTION_REFUSED 등 네트워크 에러 처리
    if (error.name === 'TypeError' && error.message?.includes('Failed to fetch')) {
      console.warn('[DevSidebar] 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.')
      databaseViewerDbInfo.value = {
        databaseName: null,
        version: null,
        charset: null,
      }
      databaseViewerTableCount.value = 0
    } else {
      console.error('[DevSidebar] 데이터베이스 뷰어 새로고침 실패:', error)
    }
  }
}

// 데이터베이스 뷰어 검색 변경 핸들러
function handleDatabaseViewerSearchChange(query) {
  databaseViewerSearchQuery.value = query
}

// 데이터베이스 뷰어 선택된 테이블 상태
const databaseViewerSelectedTable = ref(null)

// 데이터베이스 뷰어 테이블 선택 핸들러
function handleDatabaseViewerTableSelected(tableName) {
  databaseViewerSelectedTable.value = tableName
  // 전역 이벤트로 DatabaseViewerContent에 알림
  window.dispatchEvent(
    new CustomEvent('database-table-selected', {
      detail: {
        tableName: tableName,
      },
    }),
  )
}

// 데이터베이스 뷰어 설정 핸들러
function handleDatabaseViewerSettings() {
  // TODO: 설정 모달 열기
  console.log('[DevSidebar] 데이터베이스 뷰어 설정')
}

// 데이터베이스 뷰어 서브 메뉴 변경 핸들러
function handleDatabaseViewerSubMenuChange(subMenu) {
  databaseViewerSubMenu.value = subMenu
  // 전역 이벤트로 DatabaseViewerContent에 알림 (선택된 테이블 정보도 포함)
  window.dispatchEvent(
    new CustomEvent('database-viewer-sub-menu-changed', {
      detail: {
        subMenu: subMenu,
        selectedTable: databaseViewerSelectedTable.value, // 선택된 테이블 정보 포함
      },
    }),
  )
  // 서브 메뉴 변경 시 선택된 테이블이 있으면 테이블 선택 이벤트 재발생
}

// 컴포넌트 라이브러리 검색 변경 핸들러
function handleComponentLibrarySearchChange(query) {
  componentLibrarySearchQuery.value = query
}

// 컴포넌트 라이브러리 카테고리 선택 핸들러
function handleComponentLibraryCategorySelected(categoryName) {
  componentLibrarySelectedCategory.value = categoryName
  componentLibrarySelectedComponent.value = null
  componentLibrarySelectedViolation.value = null
}

// 컴포넌트 라이브러리 컴포넌트 선택 핸들러
function handleComponentLibraryComponentSelected(component) {
  componentLibrarySelectedComponent.value = component
  componentLibrarySelectedViolation.value = null
  // 전역 이벤트로 DevToolsPanel에 알림
  window.dispatchEvent(
    new CustomEvent('component-library-component-selected', {
      detail: {
        component: component,
      },
    }),
  )
}

// 컴포넌트 라이브러리 위반 항목 선택 핸들러
function handleComponentLibraryViolationSelected(violation) {
  componentLibrarySelectedViolation.value = violation
  componentLibrarySelectedComponent.value = null
  // 전역 이벤트로 DevToolsPanel에 알림
  window.dispatchEvent(
    new CustomEvent('component-library-violation-selected', {
      detail: {
        violation: violation,
      },
    }),
  )
}

// 컴포넌트 라이브러리 파일 구조 표시 핸들러
function handleComponentLibraryShowFileStructure() {
  // TODO: 파일 구조 표시 구현
  console.log('[DevSidebar] 파일 구조 표시')
}

function handleComponentLibraryShowFileStructureDetail() {
  // TODO: 파일 구조 상세 표시 구현
  console.log('[DevSidebar] 파일 구조 상세 표시')
}

// Content 컴포넌트 참조
const contentRef = ref(null)

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

// 필터 토글 함수들
function toggleExcludedFiles() {
  excludedFiles.value = !excludedFiles.value
  saveSettings()
}

function toggleHideCompleted() {
  documentStore.hideCompleted = !documentStore.hideCompleted
  saveSettings()
}

function toggleHighlight() {
  documentStore.autoHighlightOnScroll = !documentStore.autoHighlightOnScroll
  saveSettings()
}

function toggleTrashView() {
  if (contentRef.value && contentRef.value.isTrashView !== undefined) {
    contentRef.value.isTrashView = !contentRef.value.isTrashView
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

// 멀티 셀렉션 일괄 작업 함수들
async function handleMoveSelectedToTrash(selectedFiles) {
  if (!selectedFiles || selectedFiles.length === 0) return

  const count = selectedFiles.length
  const confirmed = await $q.dialog({
    title: '휴지통 이동',
    message: `선택한 ${count}개 문서를 휴지통으로 이동하시겠습니까?`,
    persistent: true,
    ok: {
      label: '이동',
      color: 'negative',
      flat: false,
    },
    cancel: {
      label: '취소',
      flat: true,
    },
  })

  if (confirmed) {
    try {
      for (const file of selectedFiles) {
        moveToTrash(file.name, documentStore)
      }
      if (contentRef.value) {
        contentRef.value.clearSelection()
      }

      // 현재 선택된 파일이 이동된 파일 중 하나면 선택 해제
      if (documentStore.selectedFile && selectedFiles.some((f) => f.name === documentStore.selectedFile.name)) {
        documentStore.selectedFile = null
      }

      $q.notify({
        type: 'positive',
        message: `${count}개 문서를 휴지통으로 이동했습니다`,
        position: 'top',
        timeout: 2000,
      })
    } catch (error) {
      console.error('[MultiSelection] 휴지통 이동 실패:', error)
      $q.notify({
        type: 'negative',
        message: `휴지통 이동 실패: ${error.message || '알 수 없는 오류'}`,
        position: 'top',
        timeout: 3000,
      })
    }
  }
}

// 선택된 파일들 복원
async function handleRestoreSelected(selectedFiles) {
  if (!selectedFiles || selectedFiles.length === 0) return

  const count = selectedFiles.length
  const confirmed = await $q.dialog({
    title: '복원',
    message: `선택한 ${count}개 문서를 복원하시겠습니까?`,
    persistent: true,
    ok: {
      label: '복원',
      color: 'primary',
      flat: false,
    },
    cancel: {
      label: '취소',
      flat: true,
    },
  })

  if (confirmed) {
    try {
      for (const file of selectedFiles) {
        restoreFromTrash(file.name, documentStore)
      }
      if (contentRef.value) {
        contentRef.value.clearSelection()
      }

      // 현재 선택된 파일이 복원된 파일 중 하나면 선택 해제
      if (documentStore.selectedFile && selectedFiles.some((f) => f.name === documentStore.selectedFile.name)) {
        documentStore.selectedFile = null
      }

      $q.notify({
        type: 'positive',
        message: `${count}개 문서를 복원했습니다`,
        position: 'top',
        timeout: 2000,
      })
    } catch (error) {
      console.error('[MultiSelection] 복원 실패:', error)
      $q.notify({
        type: 'negative',
        message: `복원 실패: ${error.message || '알 수 없는 오류'}`,
        position: 'top',
        timeout: 3000,
      })
    }
  }
}

// 선택된 파일들 영구 삭제
async function handlePermanentlyDeleteSelected(selectedFiles) {
  if (!selectedFiles || selectedFiles.length === 0) return

  const count = selectedFiles.length
  const confirmed = await $q.dialog({
    title: '영구 삭제',
    message: `선택한 ${count}개 문서를 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
    persistent: true,
    ok: {
      label: '삭제',
      color: 'negative',
      flat: false,
    },
    cancel: {
      label: '취소',
      flat: true,
    },
  })

  if (confirmed) {
    try {
      let successCount = 0
      let failedFiles = []

      for (const file of selectedFiles) {
        try {
          // relativePath를 우선 사용, 없으면 name 사용
          const filePath = file.relativePath || file.path || file.name
          await permanentlyDeleteFromTrash(filePath, documentStore)
          successCount++
        } catch (error) {
          const filePath = file.relativePath || file.path || file.name
          console.error(`[MultiSelection] 파일 영구 삭제 실패: ${filePath}`, error)
          failedFiles.push(filePath)
        }
      }

      if (contentRef.value) {
        contentRef.value.clearSelection()
      }

      // 현재 선택된 파일이 삭제된 파일 중 하나면 선택 해제
      if (documentStore.selectedFile && selectedFiles.some((f) => f.name === documentStore.selectedFile.name)) {
        documentStore.selectedFile = null
      }

      if (failedFiles.length > 0) {
        $q.notify({
          type: 'warning',
          message: `${successCount}개 파일 삭제 성공, ${failedFiles.length}개 파일 삭제 실패`,
          position: 'top',
          timeout: 3000,
        })
      } else {
        $q.notify({
          type: 'positive',
          message: `${successCount}개 문서를 영구적으로 삭제했습니다`,
          position: 'top',
          timeout: 2000,
        })
      }
    } catch (error) {
      console.error('[MultiSelection] 영구 삭제 실패:', error)
      $q.notify({
        type: 'negative',
        message: `영구 삭제 실패: ${error.message || '알 수 없는 오류'}`,
        position: 'top',
        timeout: 3000,
      })
    }
  }
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
    }
  },
  { immediate: true },
)

// 데이터베이스 뷰어 새로고침 이벤트 리스너
function handleDatabaseViewerRefreshEvent() {
  console.log('[DevSidebar] database-viewer-refresh 이벤트 수신')
  handleDatabaseViewerRefresh()
}

// 컴포넌트 마운트 시 설정 로드
onMounted(() => {
  // showExcludedFiles와 searchMode 설정 로드
  loadTOCSettings({
    showExcludedFiles: excludedFiles,
    searchMode,
  })

  // DevelopmentPage에서 초기 메뉴 이벤트를 받아서 동기화
  function handleInitialMenuChange(event) {
    const menuId = event.detail.activeMenu
    if (activeMenu.value !== menuId) {
      activeMenu.value = menuId
    }
    // 테마 관리 메뉴가 활성화되어 있으면 카테고리 로드
    if (menuId === 'theme-manager') {
      loadThemeCategories()
    }
  }

  // 초기 이벤트 리스너 (한 번만 실행)
  const initialHandler = (event) => {
    handleInitialMenuChange(event)
    window.removeEventListener('dev-menu-changed', initialHandler)
  }
  window.addEventListener('dev-menu-changed', initialHandler)

  // 데이터베이스 뷰어 새로고침 이벤트 리스너 등록
  window.addEventListener('database-viewer-refresh', handleDatabaseViewerRefreshEvent)

  // 이후 변경사항은 handleActiveMenuChange로 처리 (이미 등록되어 있음)
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  window.removeEventListener('database-viewer-refresh', handleDatabaseViewerRefreshEvent)
})
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
