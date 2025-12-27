/**
 * 개발 가이드 Composable
 * 
 * 개발 가이드의 상태 관리, 검색, 필터, 샘플 관리 등을 담당합니다.
 */

import { ref, computed } from 'vue'

/**
 * 개발 가이드 Composable
 * @returns {Object} 개발 가이드 관련 상태 및 함수
 */
export function useDevGuide() {
  // ============================================
  // 상태 관리
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

  // 카테고리 목록
  const categories = ref([
    { value: 'NexaChart', label: 'NexaChart' },
    { value: 'NexaPanel', label: 'NexaPanel' },
    { value: 'LeftSidebar', label: 'LeftSidebar' },
    { value: 'ContentArea', label: 'ContentArea' },
    { value: 'RightSidebar', label: 'RightSidebar' },
  ])

  // ============================================
  // Computed
  // ============================================
  const filteredSamples = computed(() => {
    let result = samples.value

    // 검색 필터
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter((sample) => {
        return (
          sample.name?.toLowerCase().includes(query) ||
          sample.displayName?.toLowerCase().includes(query) ||
          sample.description?.toLowerCase().includes(query) ||
          sample.tags?.some((tag) => tag.toLowerCase().includes(query))
        )
      })
    }

    // 카테고리 필터
    if (filterCategory.value) {
      result = result.filter((sample) => sample.category === filterCategory.value)
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
   * 초기화
   */
  function init() {
    // localStorage에서 뷰 모드 복원
    try {
      const savedViewMode = localStorage.getItem('dev-guide-view-mode')
      if (savedViewMode) {
        viewMode.value = savedViewMode
      }
    } catch (error) {
      console.error('[useDevGuide] 뷰 모드 복원 실패:', error)
    }

    // TODO: 샘플 데이터 로드 (sampleRegistry.js에서)
    // 현재는 빈 배열로 시작
    samples.value = []
  }

  // 초기화 실행
  init()

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
    // 함수
    handleSearchChange,
    handleCategoryFilterChange,
    handleViewModeChange,
    handleSampleSelect,
    toggleFavorite,
    init,
  }
}

