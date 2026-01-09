/**
 * 개발 가이드 Composable
 *
 * 개발 가이드의 상태 관리, 검색, 필터, 샘플 관리 등을 담당합니다.
 *
 * ⚠️ 리팩토링: 이제 내부적으로 devGuideStore를 사용합니다.
 * 기존 API는 유지되지만, 실제 상태는 Store에서 관리됩니다.
 */

import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDevGuideStore } from 'src/system/store/devGuideStore'
import { getComponentCategory } from 'src/system/utils/path-categorizer/index.js'
import { getTopLevelOrder } from '@system/config/devGuideConfig.js'

/**
 * 개발 가이드 Composable
 * @returns {Object} 개발 가이드 관련 상태 및 함수
 */
export function useDevGuide() {
  // Store 인스턴스
  const store = useDevGuideStore()

  // Store 상태를 반응형으로 가져오기
  const { searchQuery, filterCategory, filterTags, viewMode, activeTab, accordionMode, filterListOnSearch, samples, selectedSample, selectedFolderNode, recentSamples, favoriteSamples, categories, filteredSamples, filteredRecentSamples, filteredFavoriteSamples } = storeToRefs(store)

  // ============================================
  // Computed (Store의 computed를 그대로 사용)
  // ============================================

  // 계층적 구조 (최상위 레벨 > 카테고리 > 샘플)
  const hierarchicalStructure = computed(() => {
    const topLevelMap = new Map()

    samples.value.forEach((sample) => {
      const topLevel = sample.topLevel || store.getTopLevel(sample.componentPath) || '기타'
      const category = sample.category || '기타'

      if (!topLevelMap.has(topLevel)) {
        topLevelMap.set(topLevel, {
          name: topLevel,
          label: store.getLabelForTopLevel(topLevel),
          icon: 'folder', // 모든 폴더 아이콘 통일
          categories: new Map(),
        })
      }

      const topLevelData = topLevelMap.get(topLevel)
      if (!topLevelData.categories.has(category)) {
        topLevelData.categories.set(category, {
          name: category,
          icon: store.getIconForCategory(category),
          samples: [],
        })
      }

      topLevelData.categories.get(category).samples.push(sample)
    })

    // Map을 배열로 변환하고 정렬
    return Array.from(topLevelMap.values())
      .map((topLevel) => ({
        ...topLevel,
        categories: Array.from(topLevel.categories.values())
          .map((cat) => ({
            ...cat,
            samples: cat.samples.sort((a, b) => (a.displayName || a.name).localeCompare(b.displayName || b.name)),
          }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => {
        const order = getTopLevelOrder()
        const aIndex = order.indexOf(a.name)
        const bIndex = order.indexOf(b.name)
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
        if (aIndex !== -1) return -1
        if (bIndex !== -1) return 1
        return a.label.localeCompare(b.label)
      })
  })

  // ============================================
  // 핸들러 함수 (Store 액션을 래핑)
  // ============================================

  /**
   * 검색 변경 핸들러
   * @param {string} query - 검색어
   */
  function handleSearchChange(query) {
    store.setSearchQuery(query)
    // 검색어가 비어있으면 폴더 필터도 해제 (전체 리스트 표시)
    if (!query || !query.trim()) {
      store.selectFolder(null)
    }
    window.dispatchEvent(new CustomEvent('dev-guide-search-changed', { detail: { query } }))
  }

  /**
   * 카테고리 필터 변경 핸들러
   * @param {string} category - 카테고리
   */
  function handleCategoryFilterChange(category) {
    store.setFilterCategory(category)
    window.dispatchEvent(new CustomEvent('dev-guide-filter-changed', { detail: { category } }))
  }

  /**
   * 뷰 모드 변경 핸들러
   * @param {string} mode - 뷰 모드 ('flat' | 'hierarchy')
   */
  function handleViewModeChange(mode) {
    store.setViewMode(mode)
  }

  /**
   * 아코디언 모드 토글 변경 핸들러
   * @param {boolean} enabled - 아코디언 모드 활성화 여부
   */
  function handleAccordionModeChange(enabled) {
    store.setAccordionMode(enabled)
    window.dispatchEvent(new CustomEvent('dev-guide-accordion-mode-changed', { detail: { enabled } }))
  }

  /**
   * 리스트 필터링 토글 변경 핸들러
   * @param {boolean} enabled - 리스트 필터링 활성화 여부
   */
  function handleFilterListOnSearchChange(enabled) {
    store.setFilterListOnSearch(enabled)
  }

  /**
   * 샘플 선택 핸들러
   * @param {Object} sample - 선택된 샘플
   */
  function handleSampleSelect(sample) {
    store.selectSample(sample)
    // 전역 이벤트 발생 (하위 호환성 유지)
    window.dispatchEvent(new CustomEvent('dev-guide-sample-selected', { detail: { sample } }))
  }

  /**
   * 폴더 선택 핸들러
   * @param {Object} folderNode - 선택된 폴더 노드 { type: 'topLevel' | 'category', name: string, topLevel?: string }
   */
  function handleFolderSelect(folderNode) {
    console.log('[useDevGuide] 폴더 선택:', folderNode)
    store.selectFolder(folderNode)
    console.log('[useDevGuide] 필터링된 샘플 개수:', filteredSamples.value.length)
    window.dispatchEvent(new CustomEvent('dev-guide-folder-selected', { detail: { folderNode } }))
  }

  /**
   * 즐겨찾기 토글
   * @param {Object} sample - 샘플
   */
  function toggleFavorite(sample) {
    store.toggleFavorite(sample)
  }

  /**
   * 파일 시스템에서 샘플 파일 스캔 및 로드
   */
  async function loadSamplesFromFilesystem() {
    try {
      // Vite의 import.meta.glob을 사용하여 src/guides/ 하위의 모든 .vue 파일 스캔
      const guideModules = import.meta.glob('/src/guides/**/*.vue', { eager: false })

      const loadedSamples = []

      // 각 샘플 파일 처리
      for (const path in guideModules) {
        // 경로에서 샘플 정보 추출
        // 예: '/src/guides/styles/charts/bar/NexaChartBar.vue'
        const relativePath = path.replace('/src/', '')
        const pathParts = relativePath.split('/').filter((part) => part && part.trim() !== '')
        const fileName = pathParts[pathParts.length - 1]
        const componentName = fileName.replace('.vue', '')

        // 파일 메타데이터 읽기 (개발 환경에서만)
        let metadata = null
        if (import.meta.env.DEV) {
          try {
            const response = await fetch(`http://localhost:3000/api/dev/files/${relativePath}/metadata`)
            if (response.ok) {
              const data = await response.json()
              if (data.success && data.metadata) {
                metadata = data.metadata
              }
            }
          } catch {
            // API 호출 실패는 무시 (기본값 사용)
          }
        }

        // 카테고리 추출 (메타데이터 우선, 없으면 경로에서 추출)
        const extractedCategory = metadata?.category || getComponentCategory(relativePath)

        // 샘플 ID 생성 (파일명 기반)
        const sampleId = componentName
          .toLowerCase()
          .replace(/([A-Z])/g, '-$1')
          .toLowerCase()

        // 파일명에서 displayName 추출 (PascalCase를 읽기 쉬운 형태로)
        const displayName = componentName
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .replace(/^./, (str) => str.toUpperCase())

        // 태그 추출 (메타데이터 우선, 없으면 기본 태그)
        const tags = metadata?.tags || [extractedCategory, pathParts[1], componentName].filter(Boolean)

        // 설명 추출 (메타데이터 우선, 없으면 기본 설명)
        const description = metadata?.description || `${displayName} 샘플 컴포넌트`

        // 샘플 객체 생성
        const sample = {
          id: sampleId,
          name: componentName,
          displayName: displayName,
          category: extractedCategory || '기타',
          hierarchy: {
            type: pathParts[1] || '기타', // 'styles', 'patterns' 등
            subType: extractedCategory || '기타', // 'charts', 'panels' 등
            variant: pathParts[pathParts.length - 2] || '기타', // 'bar', 'line' 등
          },
          tags: tags,
          description: description,
          icon: store.getIconForCategory(extractedCategory),
          componentPath: relativePath,
          topLevel: store.getTopLevel(relativePath), // 최상위 레벨 추가
          codeSnippet: `<!-- ${componentName}.vue 샘플 -->\n<template>\n  <div class="${componentName.toLowerCase()}">\n    <!-- 샘플 내용 -->\n  </div>\n</template>`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

        loadedSamples.push(sample)
      }

      // 샘플 목록 업데이트 (Store에 저장)
      store.setSamples(loadedSamples)

      // 최근 샘플 및 즐겨찾기 샘플 로드
      store.loadRecentSamples(loadedSamples)
      store.loadFavoriteSamples(loadedSamples)

      console.log(`[useDevGuide] 샘플 로드 완료: ${loadedSamples.length}개`)
    } catch (error) {
      console.error('[useDevGuide] 샘플 로드 실패:', error)
      store.setSamples([])
    }
  }

  /**
   * 초기화
   */
  async function init() {
    // Store 초기화 (localStorage에서 설정 복원)
    store.init()

    // 파일 시스템에서 샘플 데이터 로드
    await loadSamplesFromFilesystem()
  }

  // 초기화 실행
  init()

  /**
   * 새로고침 (샘플 목록 다시 로드)
   */
  async function refresh() {
    await loadSamplesFromFilesystem()
  }

  return {
    // 상태 (Store에서 가져온 반응형 상태)
    searchQuery,
    filterCategory,
    filterTags,
    viewMode,
    activeTab,
    selectedSample,
    selectedFolderNode,
    filterListOnSearch,
    accordionMode,
    samples,
    recentSamples,
    favoriteSamples,
    categories,
    filteredSamples,
    filteredRecentSamples,
    filteredFavoriteSamples,
    hierarchicalStructure,

    // 함수 (Store 액션을 래핑)
    handleSearchChange,
    handleCategoryFilterChange,
    handleViewModeChange,
    handleFilterListOnSearchChange,
    handleAccordionModeChange,
    handleSampleSelect,
    handleFolderSelect,
    toggleFavorite,
    refresh,
    loadSamplesFromFilesystem,

    // 유틸리티 함수 (Store에서 가져옴)
    getTopLevel: store.getTopLevel,
    getLabelForTopLevel: store.getLabelForTopLevel,
    getIconForCategory: store.getIconForCategory,
    init,
  }
}
