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
const activeTab = ref('all') // 'all' | 'recent' | 'favorite'
const selectedSample = ref(null)
const selectedFolderNode = ref(null)
const filterListOnSearch = ref(true) // 리스트도 검색 필터 적용 여부
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
  /**
   * 샘플 필터링 헬퍼 함수 (검색, 카테고리, 태그 필터 적용)
   * @param {Array} sampleList - 필터링할 샘플 목록
   * @returns {Array} 필터링된 샘플 목록
   */
  /**
   * 한글 검색어를 영문 키워드로 변환 (간단한 매핑)
   * @param {string} query - 검색어
   * @returns {Array<string>} 검색어 배열 (원본 + 변환된 키워드)
   */
  function expandSearchQuery(query) {
    const lowerQuery = query.toLowerCase().trim()
    const keywords = [lowerQuery]

    // 한글-영문 매핑 (일반적인 용어)
    const keywordMap = {
      사이드바: ['sidebar', 'side-bar'],
      버튼: ['button', 'btn'],
      차트: ['chart'],
      패널: ['panel'],
      폼: ['form'],
      입력: ['input'],
      카드: ['card'],
      리스트: ['list'],
      테이블: ['table'],
      모달: ['modal'],
      아이콘: ['icon'],
      스타일: ['style', 'styles'],
      패턴: ['pattern', 'patterns'],
      컨벤션: ['convention', 'conventions'],
      베스트프랙티스: ['best-practice', 'best-practices'],
    }

    // 한글 키워드가 매핑에 있으면 영문 키워드 추가
    for (const [korean, english] of Object.entries(keywordMap)) {
      if (lowerQuery.includes(korean)) {
        keywords.push(...english)
      }
      // 역방향: 영문 키워드가 검색어에 포함되면 한글도 추가
      english.forEach((eng) => {
        if (lowerQuery.includes(eng)) {
          keywords.push(korean)
        }
      })
    }

    return [...new Set(keywords)] // 중복 제거
  }

  function applyFilters(sampleList) {
    let result = [...sampleList]

    // 검색 필터
    if (searchQuery.value && searchQuery.value.trim()) {
      const originalQuery = searchQuery.value.toLowerCase().trim()
      const searchKeywords = expandSearchQuery(originalQuery)

      result = result.filter((sample) => {
        // 모든 키워드 중 하나라도 매칭되면 통과
        return searchKeywords.some((keyword) => {
          const nameMatch = sample.name?.toLowerCase().includes(keyword)
          const displayNameMatch = sample.displayName?.toLowerCase().includes(keyword)
          const descriptionMatch = sample.description?.toLowerCase().includes(keyword)

          // 태그 검색: 배열인 경우 각 태그에 대해 부분 일치 검사
          const tagsMatch =
            Array.isArray(sample.tags) && sample.tags.length > 0
              ? sample.tags.some((tag) => {
                  const tagStr = String(tag).toLowerCase()
                  return tagStr.includes(keyword) || keyword.includes(tagStr)
                })
              : false

          const categoryMatch = sample.category?.toLowerCase().includes(keyword)
          const componentPathMatch = sample.componentPath?.toLowerCase().includes(keyword)
          return nameMatch || displayNameMatch || descriptionMatch || tagsMatch || categoryMatch || componentPathMatch
        })
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
  }

  const filteredSamples = computed(() => {
    let result = applyFilters(samples.value)

    // 폴더 필터 적용 (선택된 폴더의 자식 샘플만 표시)
    // 단, 검색어가 있을 때만 폴더 필터 적용 (검색어가 없으면 전체 표시)
    if (selectedFolderNode.value && searchQuery.value && searchQuery.value.trim()) {
      const folderNode = selectedFolderNode.value
      console.log('[useDevGuide] 폴더 필터 적용:', folderNode, '필터 전 샘플 개수:', result.length)

      if (folderNode.type === 'topLevel') {
        result = result.filter((sample) => {
          const sampleTopLevel = getTopLevel(sample.componentPath)
          const matches = sampleTopLevel === folderNode.name
          if (matches) {
            console.log('[useDevGuide] 매칭 샘플:', sample.name, 'topLevel:', sampleTopLevel)
          }
          return matches
        })
      } else if (folderNode.type === 'category') {
        result = result.filter((sample) => {
          const sampleTopLevel = getTopLevel(sample.componentPath)
          const sampleCategory = sample.category || getComponentCategory(sample.componentPath)
          const matches = sampleTopLevel === folderNode.topLevel && sampleCategory === folderNode.name
          if (matches) {
            console.log('[useDevGuide] 매칭 샘플:', sample.name, 'topLevel:', sampleTopLevel, 'category:', sampleCategory)
          } else {
            console.log('[useDevGuide] 미매칭 샘플:', sample.name, 'topLevel:', sampleTopLevel, 'category:', sampleCategory, '기대값:', folderNode.topLevel, folderNode.name)
          }
          return matches
        })
      }

      console.log('[useDevGuide] 필터 후 샘플 개수:', result.length)
    }

    return result
  })

  // 필터링된 최근 샘플
  const filteredRecentSamples = computed(() => {
    return applyFilters(recentSamples.value)
  })

  // 필터링된 즐겨찾기 샘플
  const filteredFavoriteSamples = computed(() => {
    return applyFilters(favoriteSamples.value)
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
    // 검색어가 비어있으면 폴더 필터도 해제 (전체 리스트 표시)
    if (!query || !query.trim()) {
      selectedFolderNode.value = null
    } else {
      // 검색어가 있으면 선택된 샘플을 해제하여 검색 결과를 컨텐츠 창에 표시
      selectedSample.value = null
    }
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
   * 리스트 필터링 토글 변경 핸들러
   * @param {boolean} enabled - 리스트 필터링 활성화 여부
   */
  function handleFilterListOnSearchChange(enabled) {
    filterListOnSearch.value = enabled
    // localStorage에 저장
    try {
      localStorage.setItem('dev-guide-filter-list-on-search', String(enabled))
    } catch (error) {
      console.error('[useDevGuide] 리스트 필터링 설정 저장 실패:', error)
    }
  }

  /**
   * 샘플 선택 핸들러
   * @param {Object} sample - 선택된 샘플
   */
  function handleSampleSelect(sample) {
    selectedSample.value = sample
    selectedFolderNode.value = null // 샘플 선택 시 폴더 필터 해제
    // 최근 사용 목록에 추가
    addToRecentSamples(sample)
    // 전역 이벤트 발생
    window.dispatchEvent(new CustomEvent('dev-guide-sample-selected', { detail: { sample } }))
  }

  /**
   * 폴더 선택 핸들러
   * @param {Object} folderNode - 선택된 폴더 노드 { type: 'topLevel' | 'category', name: string, topLevel?: string }
   */
  function handleFolderSelect(folderNode) {
    console.log('[useDevGuide] 폴더 선택:', folderNode)
    selectedFolderNode.value = folderNode
    selectedSample.value = null // 폴더 선택 시 샘플 선택 해제
    console.log('[useDevGuide] 필터링된 샘플 개수:', filteredSamples.value.length)
    window.dispatchEvent(new CustomEvent('dev-guide-folder-selected', { detail: { folderNode } }))
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
      // localStorage에서 리스트 필터링 설정 복원
      const savedFilterListOnSearch = localStorage.getItem('dev-guide-filter-list-on-search')
      if (savedFilterListOnSearch !== null) {
        filterListOnSearch.value = savedFilterListOnSearch === 'true'
      }
    } catch (error) {
      console.error('[useDevGuide] 설정 복원 실패:', error)
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
   * 트리는 항상 전체 샘플을 표시해야 하므로 filteredSamples가 아닌 samples를 사용
   */
  const hierarchicalStructure = computed(() => {
    const topLevelMap = new Map()

    samples.value.forEach((sample) => {
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
    selectedFolderNode,
    filterListOnSearch,
    samples,
    recentSamples,
    favoriteSamples,
    categories,
    filteredSamples,
    filteredRecentSamples,
    filteredFavoriteSamples,
    hierarchicalStructure,
    // 함수
    handleSearchChange,
    handleCategoryFilterChange,
    handleViewModeChange,
    handleFilterListOnSearchChange,
    handleSampleSelect,
    handleFolderSelect,
    toggleFavorite,
    refresh,
    loadSamplesFromFilesystem,
    getTopLevel,
    getIconForTopLevel,
    getLabelForTopLevel,
    getIconForCategory,
    init,
  }
}
