/**
 * 개발 가이드 Composable
 *
 * 개발 가이드의 상태 관리, 검색, 필터, 샘플 관리 등을 담당합니다.
 */

import { ref, computed } from 'vue'
import { getComponentCategory } from 'src/utils/path-categorizer/index.js'

// ============================================
// 싱글톤 상태 (모듈 레벨에서 관리)
// ============================================
const searchQuery = ref('')
const filterCategory = ref(null)
const filterTags = ref([])
const viewMode = ref('flat') // 'flat' | 'hierarchy'
const activeTab = ref('recent') // 'recent' | 'favorite' | 'all'
const selectedSample = ref(null)
const samples = ref([])
const recentSamples = ref([])
const favoriteSamples = ref([])

/**
 * 개발 가이드 Composable
 * @returns {Object} 개발 가이드 관련 상태 및 함수
 */
export function useDevGuide() {
  // ============================================
  // 상태 관리 (싱글톤 상태 사용)
  // ============================================

  // 카테고리 목록 (샘플 데이터에서 동적으로 추출)
  const categories = computed(() => {
    const categorySet = new Set()
    samples.value.forEach((sample) => {
      // 명시적으로 category가 있으면 사용
      if (sample.category) {
        categorySet.add(sample.category)
      }
      // category가 없으면 componentPath에서 추출
      else if (sample.componentPath) {
        const extractedCategory = getComponentCategory(sample.componentPath)
        if (extractedCategory) {
          categorySet.add(extractedCategory)
        }
      }
    })
    return Array.from(categorySet)
      .sort()
      .map((cat) => ({
        value: cat,
        label: cat,
      }))
  })

  // ============================================
  // Computed
  // ============================================
  const filteredSamples = computed(() => {
    let result = samples.value

    // 검색 필터
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter((sample) => {
        return sample.name?.toLowerCase().includes(query) || sample.displayName?.toLowerCase().includes(query) || sample.description?.toLowerCase().includes(query) || sample.tags?.some((tag) => tag.toLowerCase().includes(query))
      })
    }

    // 카테고리 필터
    if (filterCategory.value) {
      result = result.filter((sample) => {
        // 명시적 category 또는 자동 추출된 category 사용
        const sampleCategory = sample.category || (sample.componentPath ? getComponentCategory(sample.componentPath) : null)
        return sampleCategory === filterCategory.value
      })
    }

    // 태그 필터
    if (filterTags.value.length > 0) {
      result = result.filter((sample) => {
        return filterTags.value.every((tag) => sample.tags?.includes(tag))
      })
    }

    return result
  })

  // ============================================
  // 핸들러 함수
  // ============================================

  /**
   * 검색 변경 핸들러
   * @param {string} query - 검색어
   */
  function handleSearchChange(query) {
    searchQuery.value = query
    window.dispatchEvent(new CustomEvent('dev-guide-search-changed', { detail: { query } }))
  }

  /**
   * 카테고리 필터 변경 핸들러
   * @param {string} category - 카테고리
   */
  function handleCategoryFilterChange(category) {
    filterCategory.value = category
    window.dispatchEvent(new CustomEvent('dev-guide-filter-changed', { detail: { category } }))
  }

  /**
   * 뷰 모드 변경 핸들러
   * @param {string} mode - 뷰 모드 ('flat' | 'hierarchy')
   */
  function handleViewModeChange(mode) {
    viewMode.value = mode
    // localStorage에 저장
    try {
      localStorage.setItem('dev-guide-view-mode', mode)
    } catch (error) {
      console.error('[useDevGuide] 뷰 모드 저장 실패:', error)
    }
  }

  /**
   * 샘플 선택 핸들러
   * @param {Object} sample - 선택된 샘플
   */
  function handleSampleSelect(sample) {
    selectedSample.value = sample
    // 최근 사용 목록에 추가
    addToRecentSamples(sample)
    // 전역 이벤트 발생
    window.dispatchEvent(new CustomEvent('dev-guide-sample-selected', { detail: { sample } }))
  }

  /**
   * 최근 사용 샘플에 추가
   * @param {Object} sample - 샘플
   */
  function addToRecentSamples(sample) {
    // 중복 제거
    recentSamples.value = recentSamples.value.filter((s) => s.id !== sample.id)
    // 맨 앞에 추가
    recentSamples.value.unshift(sample)
    // 최대 20개 유지
    if (recentSamples.value.length > 20) {
      recentSamples.value = recentSamples.value.slice(0, 20)
    }
    // localStorage에 저장
    saveRecentSamples()
  }

  /**
   * 즐겨찾기 토글
   * @param {Object} sample - 샘플
   */
  function toggleFavorite(sample) {
    const index = favoriteSamples.value.findIndex((s) => s.id === sample.id)
    if (index >= 0) {
      favoriteSamples.value.splice(index, 1)
    } else {
      favoriteSamples.value.push(sample)
    }
    // localStorage에 저장
    saveFavoriteSamples()
  }

  /**
   * 최근 사용 샘플 저장
   */
  function saveRecentSamples() {
    try {
      localStorage.setItem('dev-guide-recent-samples', JSON.stringify(recentSamples.value.map((s) => s.id)))
    } catch (error) {
      console.error('[useDevGuide] 최근 샘플 저장 실패:', error)
    }
  }

  /**
   * 즐겨찾기 샘플 저장
   */
  function saveFavoriteSamples() {
    try {
      localStorage.setItem('dev-guide-favorite-samples', JSON.stringify(favoriteSamples.value.map((s) => s.id)))
    } catch (error) {
      console.error('[useDevGuide] 즐겨찾기 샘플 저장 실패:', error)
    }
  }

  /**
   * 경로에서 최상위 레벨 추출 (styles, patterns, conventions, best-practices)
   * @param {string} componentPath - 컴포넌트 경로
   * @returns {string|null} 최상위 레벨명
   */
  function getTopLevel(componentPath) {
    if (!componentPath) return null
    const parts = componentPath.split('/').filter((part) => part && part.trim() !== '')
    const guidesIndex = parts.findIndex((part) => part === 'guides')
    if (guidesIndex >= 0 && guidesIndex < parts.length - 1) {
      const topLevelFolders = ['styles', 'patterns', 'conventions', 'best-practices']
      const topLevel = parts[guidesIndex + 1]
      if (topLevelFolders.includes(topLevel)) {
        return topLevel
      }
    }
    return null
  }

  /**
   * 최상위 레벨에 따른 아이콘 반환
   * @param {string} topLevel - 최상위 레벨명
   * @returns {string} 아이콘명
   */
  function getIconForTopLevel(topLevel) {
    const iconMap = {
      styles: 'style',
      patterns: 'account_tree',
      conventions: 'code',
      'best-practices': 'star',
    }
    return iconMap[topLevel] || 'folder'
  }

  /**
   * 최상위 레벨에 따른 라벨 반환
   * @param {string} topLevel - 최상위 레벨명
   * @returns {string} 라벨명
   */
  function getLabelForTopLevel(topLevel) {
    const labelMap = {
      styles: '스타일',
      patterns: '패턴',
      conventions: '컨벤션',
      'best-practices': '베스트 프랙티스',
    }
    return labelMap[topLevel] || topLevel
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

        // 카테고리 추출
        const extractedCategory = getComponentCategory(relativePath)

        // 샘플 ID 생성 (파일명 기반)
        const sampleId = componentName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()

        // 파일명에서 displayName 추출 (PascalCase를 읽기 쉬운 형태로)
        const displayName = componentName
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .replace(/^./, (str) => str.toUpperCase())

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
          tags: [extractedCategory, pathParts[1], componentName].filter(Boolean),
          description: `${displayName} 샘플 컴포넌트`,
          icon: getIconForCategory(extractedCategory),
          componentPath: relativePath,
          topLevel: getTopLevel(relativePath), // 최상위 레벨 추가
          codeSnippet: `<!-- ${componentName}.vue 샘플 -->\n<template>\n  <div class="${componentName.toLowerCase()}">\n    <!-- 샘플 내용 -->\n  </div>\n</template>`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

        loadedSamples.push(sample)
      }

      // 샘플 목록 업데이트
      samples.value = loadedSamples

      console.log(`[useDevGuide] 샘플 로드 완료: ${loadedSamples.length}개`)
    } catch (error) {
      console.error('[useDevGuide] 샘플 로드 실패:', error)
      samples.value = []
    }
  }

  /**
   * 카테고리에 따른 아이콘 반환
   * @param {string} category - 카테고리명
   * @returns {string} 아이콘명
   */
  function getIconForCategory(category) {
    const iconMap = {
      // styles 하위 카테고리
      charts: 'bar_chart',
      panels: 'dashboard',
      sidebars: 'menu',
      buttons: 'smart_button',
      inputs: 'input',
      forms: 'description',
      modals: 'fullscreen',
      cards: 'credit_card',
      lists: 'list',
      tables: 'table_chart',
      // patterns 하위 카테고리
      'component-structure': 'account_tree',
      'state-management': 'storage',
      communication: 'hub',
      'module-structure': 'folder',
      // conventions 하위 카테고리
      naming: 'text_fields',
      'file-structure': 'folder_open',
      'code-style': 'code',
      // best-practices 하위 카테고리
      'error-handling': 'error_outline',
      performance: 'speed',
      accessibility: 'accessibility_new',
      security: 'security',
    }
    return iconMap[category] || 'style'
  }

  /**
   * 초기화
   */
  async function init() {
    // localStorage에서 뷰 모드 복원
    try {
      const savedViewMode = localStorage.getItem('dev-guide-view-mode')
      if (savedViewMode) {
        viewMode.value = savedViewMode
      }
    } catch (error) {
      console.error('[useDevGuide] 뷰 모드 복원 실패:', error)
    }

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

  /**
   * 계층적 구조 (최상위 레벨 > 카테고리 > 샘플)
   */
  const hierarchicalStructure = computed(() => {
    const topLevelMap = new Map()

    filteredSamples.value.forEach((sample) => {
      const topLevel = sample.topLevel || '기타'
      const category = sample.category || '기타'

      if (!topLevelMap.has(topLevel)) {
        topLevelMap.set(topLevel, {
          name: topLevel,
          label: getLabelForTopLevel(topLevel),
          icon: getIconForTopLevel(topLevel),
          categories: new Map(),
        })
      }

      const topLevelData = topLevelMap.get(topLevel)
      if (!topLevelData.categories.has(category)) {
        topLevelData.categories.set(category, {
          name: category,
          icon: getIconForCategory(category),
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
        // styles, patterns, conventions, best-practices 순서로 정렬
        const order = ['styles', 'patterns', 'conventions', 'best-practices']
        const aIndex = order.indexOf(a.name)
        const bIndex = order.indexOf(b.name)
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
        if (aIndex !== -1) return -1
        if (bIndex !== -1) return 1
        return a.label.localeCompare(b.label)
      })
  })

  return {
    // 상태
    searchQuery,
    filterCategory,
    filterTags,
    viewMode,
    activeTab,
    selectedSample,
    samples,
    recentSamples,
    favoriteSamples,
    categories,
    filteredSamples,
    hierarchicalStructure,
    // 함수
    handleSearchChange,
    handleCategoryFilterChange,
    handleViewModeChange,
    handleSampleSelect,
    toggleFavorite,
    refresh,
    loadSamplesFromFilesystem,
    getTopLevel,
    getIconForTopLevel,
    getLabelForTopLevel,
    init,
  }
}
