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
import { scanAndCategorizeComponents } from 'src/utils/componentScanner.js'
import { buildCategoryStructure, mapComponentToCategory, getAllCategoriesFlat } from 'src/config/componentCategories.js'

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
// 자동 스캔으로 초기화 (onMounted에서 실제 스캔 실행)
const componentLibraryCategories = ref([]) // 디렉토리 기반 자동 분류
const componentLibraryManualCategories = ref([]) // 하드코딩된 수동 분류
const componentLibraryViolations = ref([])
const componentLibrarySelectedCategory = ref(null)
const componentLibrarySelectedComponent = ref(null)
const componentLibrarySelectedViolation = ref(null)
const componentLibrarySearchQuery = ref('')
const componentLibraryDepth = ref(2) // 기본값: 2단계

// 통계 계산 및 전달 함수
function updateComponentLibraryStatistics() {
  const categories = componentLibraryCategories.value
  const manualCategories = componentLibraryManualCategories.value

  // ============================================
  // 1. 전체 컴포넌트 수집 (중복 제거)
  // ============================================
  // 디렉토리 기반 카테고리의 모든 컴포넌트 수집
  const directoryComponents = categories.flatMap((cat) => cat.components || [])

  // 고유한 컴포넌트만 추출 (path 기준)
  const uniqueComponentsSet = new Set(directoryComponents.map((comp) => comp.path))
  const uniqueComponents = Array.from(uniqueComponentsSet).map((path) => directoryComponents.find((comp) => comp.path === path))

  // ============================================
  // 2. 전체 탭 통계
  // ============================================
  const totalComponents = uniqueComponents.length
  const scannedComponents = uniqueComponents.length // 현재는 스캔된 컴포넌트 = 전체 컴포넌트

  // 시스템 카테고리에 매핑된 컴포넌트 수집 (중복 제거)
  const systemMappedComponentsSet = new Set()
  function collectSystemComponents(category) {
    if (category.components) {
      category.components.forEach((comp) => systemMappedComponentsSet.add(comp.path))
    }
    if (category.subcategories) {
      category.subcategories.forEach((subCat) => collectSystemComponents(subCat))
    }
  }
  manualCategories.forEach((cat) => collectSystemComponents(cat))
  const categorizedComponents = systemMappedComponentsSet.size
  const uncategorizedComponents = totalComponents - categorizedComponents

  // 중복 매핑된 컴포넌트 계산 (여러 시스템 카테고리에 속한 컴포넌트)
  const componentCategoryCount = new Map()
  function countComponentMappings(category) {
    if (category.components) {
      category.components.forEach((comp) => {
        const count = componentCategoryCount.get(comp.path) || 0
        componentCategoryCount.set(comp.path, count + 1)
      })
    }
    if (category.subcategories) {
      category.subcategories.forEach((subCat) => countComponentMappings(subCat))
    }
  }
  manualCategories.forEach((cat) => countComponentMappings(cat))
  const duplicateMappedComponents = Array.from(componentCategoryCount.values()).filter((count) => count > 1).length

  // ============================================
  // 3. 시스템 탭 통계
  // ============================================
  const systemsCount = manualCategories.length

  // 시스템별 컴포넌트 수 계산 (중복 제거)
  function countSystemComponents(category) {
    const componentSet = new Set()
    if (category.components) {
      category.components.forEach((comp) => componentSet.add(comp.path))
    }
    if (category.subcategories) {
      category.subcategories.forEach((subCat) => {
        const subComponents = countSystemComponents(subCat)
        subComponents.forEach((path) => componentSet.add(path))
      })
    }
    return componentSet
  }

  const systemComponentCounts = manualCategories.map((cat) => ({
    name: cat.displayName,
    count: countSystemComponents(cat).size,
  }))

  const systemsComponentCount = systemComponentCounts.reduce((sum, item) => sum + item.count, 0)
  const averageComponentsPerSystem = systemsCount > 0 ? Math.round(systemsComponentCount / systemsCount) : 0
  const topSystemByComponents = systemComponentCounts.length > 0 ? systemComponentCounts.reduce((max, item) => (item.count > max.count ? item : max), systemComponentCounts[0]) : null
  const emptySystems = systemComponentCounts.filter((item) => item.count === 0).length

  // ============================================
  // 4. 디렉토리 탭 통계
  // ============================================
  const directoryCategoryCount = categories.length
  const directoryComponentCount = uniqueComponents.length

  // 깊이별 통계
  const depths = categories.map((cat) => {
    if (cat.components && cat.components.length > 0) {
      return cat.components[0].depth || 1
    }
    return 1
  })
  const maxDepth = depths.length > 0 ? Math.max(...depths) : 0
  const averageDepth = depths.length > 0 ? Math.round(depths.reduce((sum, d) => sum + d, 0) / depths.length) : 0

  // 깊이별 컴포넌트 수 분포
  const componentsByDepth = new Map()
  uniqueComponents.forEach((comp) => {
    const depth = comp.depth || 1
    const count = componentsByDepth.get(depth) || 0
    componentsByDepth.set(depth, count + 1)
  })

  // ============================================
  // 5. 체계분석 탭 통계 (componentTaxonomy 기반)
  // ============================================
  // 이 통계는 TaxonomyDetail에서 직접 계산하므로 여기서는 기본값만 전달
  // (실제 계산은 TaxonomyDetail에서 componentTaxonomy를 사용)

  // ============================================
  // 6. 통계 업데이트 이벤트 전달
  // ============================================
  window.dispatchEvent(
    new CustomEvent('component-library-statistics-updated', {
      detail: {
        // 전체 탭 통계
        totalComponents,
        scannedComponents,
        categorizedComponents,
        uncategorizedComponents,
        duplicateMappedComponents,

        // 시스템 탭 통계
        systemsCount,
        systemsComponentCount,
        averageComponentsPerSystem,
        topSystemByComponents: topSystemByComponents
          ? {
              name: topSystemByComponents.name,
              count: topSystemByComponents.count,
            }
          : null,
        emptySystems,

        // 디렉토리 탭 통계
        directoryCategoryCount,
        directoryComponentCount,
        maxDepth,
        averageDepth,
        componentsByDepth: Object.fromEntries(componentsByDepth),
      },
    }),
  )

  console.log('[DevSidebar] 통계 업데이트:', {
    totalComponents,
    scannedComponents,
    categorizedComponents,
    uncategorizedComponents,
    duplicateMappedComponents,
    systemsCount,
    systemsComponentCount,
    averageComponentsPerSystem,
    topSystemByComponents,
    emptySystems,
    directoryCategoryCount,
    directoryComponentCount,
    maxDepth,
    averageDepth,
  })
}

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
  // 전역 이벤트로 CategoryDetail에 알림
  window.dispatchEvent(
    new CustomEvent('component-library-category-selected', {
      detail: {
        category: componentLibraryCategories.value.find((cat) => cat.name === categoryName),
      },
    }),
  )
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

// 컴포넌트 라이브러리 탭 변경 핸들러
function handleComponentLibraryTabChange(tabName) {
  console.log('[DevSidebar] 탭 변경 요청:', tabName)
  window.dispatchEvent(
    new CustomEvent('component-library-tab-changed', {
      detail: {
        tab: tabName,
      },
    }),
  )
  console.log('[DevSidebar] 탭 변경 이벤트 전달 완료')
}

// 컴포넌트를 하드코딩된 카테고리에 매핑
function mapComponentsToManualCategories(allComponents) {
  // 카테고리 구조 동적 생성
  const manualCategories = buildCategoryStructure()

  // 모든 카테고리와 하위 카테고리를 평면 배열로 만들기
  const allManualCategories = getAllCategoriesFlat(manualCategories)

  // 각 컴포넌트를 적절한 카테고리에 매핑
  for (const component of allComponents) {
    const categoryId = mapComponentToCategory(component.path)
    if (categoryId) {
      const targetCategory = allManualCategories.find((cat) => cat.name === categoryId)
      if (targetCategory) {
        targetCategory.components.push(component)
      }
    }
  }

  return manualCategories
}

// 컴포넌트 라이브러리 새로고침 핸들러
async function handleComponentLibraryRefresh() {
  console.log('[DevSidebar] 컴포넌트 라이브러리 새로고침 시작 (깊이:', componentLibraryDepth.value, ')')
  try {
    // 디렉토리 기반 자동 분류
    const categories = await scanAndCategorizeComponents(componentLibraryDepth.value)
    componentLibraryCategories.value = categories

    // 모든 컴포넌트 수집
    const allComponents = categories.flatMap((cat) => cat.components || [])

    // 하드코딩된 카테고리에 컴포넌트 매핑
    const manualCategories = mapComponentsToManualCategories(allComponents)
    componentLibraryManualCategories.value = manualCategories

    console.log('[DevSidebar] 컴포넌트 스캔 완료:', categories.length, '개 카테고리 (자동),', manualCategories.length, '개 카테고리 (수동)')

    // 통계 업데이트 (watch가 자동으로 호출하지만, 명시적으로 호출하여 즉시 업데이트)
    updateComponentLibraryStatistics()
  } catch (error) {
    console.error('[DevSidebar] 컴포넌트 스캔 중 오류:', error)
  }
}

// 컴포넌트 라이브러리 깊이 변경 핸들러
async function handleComponentLibraryDepthChange(depth) {
  console.log('[DevSidebar] 깊이 변경:', depth)
  componentLibraryDepth.value = depth
  // 깊이 변경 시 자동으로 스캔 다시 실행
  await handleComponentLibraryRefresh()
}

// 컴포넌트 라이브러리 차원 선택 핸들러 (부류체계)
function handleComponentLibraryDimensionSelected(dimensionId) {
  window.dispatchEvent(
    new CustomEvent('component-library-dimension-selected', {
      detail: {
        dimensionId: dimensionId,
      },
    }),
  )
}

// 컴포넌트 라이브러리 부류체계 카테고리 선택 핸들러
function handleComponentLibraryTaxonomyCategorySelected(data) {
  window.dispatchEvent(
    new CustomEvent('component-library-taxonomy-category-selected', {
      detail: data,
    }),
  )
}

// 컴포넌트 라이브러리 초기 스캔
async function initializeComponentLibrary() {
  await handleComponentLibraryRefresh()
}

// 컴포넌트 라이브러리 설정 핸들러
function handleComponentLibrarySettings() {
  // TODO: 설정 다이얼로그 표시
  console.log('[DevSidebar] 컴포넌트 라이브러리 설정')
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
    } else if (newMenu === 'component-library') {
      // 컴포넌트 라이브러리 메뉴 활성화 시 초기 스캔
      initializeComponentLibrary()
    }
  },
  { immediate: true },
)

// 컴포넌트 라이브러리 카테고리 변경 시 통계 업데이트
watch(
  [() => componentLibraryCategories.value, () => componentLibraryManualCategories.value],
  () => {
    // 카테고리 데이터가 있을 때만 통계 업데이트
    if (componentLibraryCategories.value.length > 0 || componentLibraryManualCategories.value.length > 0) {
      updateComponentLibraryStatistics()
    }
  },
  { deep: true },
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

  // 컴포넌트 라이브러리 통계 요청 이벤트 리스너 등록
  window.addEventListener('component-library-statistics-request', handleStatisticsRequest)

  // 컴포넌트 라이브러리 초기 스캔
  initializeComponentLibrary()

  // 이후 변경사항은 handleActiveMenuChange로 처리 (이미 등록되어 있음)
})

// 통계 요청 이벤트 리스너
function handleStatisticsRequest() {
  // 현재 통계를 즉시 전달
  updateComponentLibraryStatistics()
}

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  window.removeEventListener('database-viewer-refresh', handleDatabaseViewerRefreshEvent)
  window.removeEventListener('component-library-statistics-request', handleStatisticsRequest)
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
