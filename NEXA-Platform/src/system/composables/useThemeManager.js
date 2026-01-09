/**
 * 테마 관리 Composable
 * 
 * 테마 관리의 상태 관리, 검색, 필터, 정렬 등을 담당합니다.
 */

import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useUserSettingsStore } from 'src/system/store/userSettingsStore'
import { extractThemeColors } from 'src/system/utils/themeColorParser'

/**
 * 테마 관리 Composable
 * @returns {Object} 테마 관리 관련 상태 및 함수
 */
export function useThemeManager() {
  const $q = useQuasar()

  // ============================================
  // 상태 관리
  // ============================================
  const activeTab = ref('recent')
  const statisticsData = ref([])
  const selectedThemeColor = ref(null)

  // 검색/필터/정렬 상태
  const searchQuery = ref('')
  const categoryFilter = ref(null)
  const sortOption = ref('category')

  // 카테고리 목록
  const categories = ref([])

  // ============================================
  // 핸들러 함수
  // ============================================

  /**
   * 테마 변경 핸들러
   * @param {string} themeValue - 테마 값 ('dark' 또는 'light')
   */
  function handleThemeChange(themeValue) {
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

  /**
   * 검색 변경 핸들러
   * @param {string} query - 검색어
   */
  function handleSearchChange(query) {
    searchQuery.value = query
    // 전역 이벤트로 DevelopmentPage에 알림
    window.dispatchEvent(new CustomEvent('theme-manager-search-changed', { detail: { query } }))
  }

  /**
   * 카테고리 필터 변경 핸들러
   * @param {string} category - 카테고리
   */
  function handleCategoryFilterChange(category) {
    categoryFilter.value = category
    // 전역 이벤트로 DevelopmentPage에 알림
    window.dispatchEvent(new CustomEvent('theme-manager-filter-changed', { detail: { category } }))
  }

  /**
   * 정렬 변경 핸들러
   * @param {string} option - 정렬 옵션
   */
  function handleSortChange(option) {
    sortOption.value = option
    // 전역 이벤트로 DevelopmentPage에 알림
    window.dispatchEvent(new CustomEvent('theme-manager-sort-changed', { detail: { option } }))
  }

  /**
   * 통계 액션 핸들러
   * @param {string} actionType - 액션 타입
   */
  function handleStatisticsAction(actionType) {
    // TODO: 통계 분석 로직 구현
    console.log('[useThemeManager] 통계 액션:', actionType)
    // 임시로 빈 배열 설정 (나중에 실제 분석 결과로 교체)
    statisticsData.value = []

    // TODO: themeUsageAnalyzer.js를 사용하여 실제 분석 수행
  }

  /**
   * 테마 색상 선택 핸들러
   * @param {Object} colorData - 색상 데이터
   */
  function handleColorSelected(colorData) {
    selectedThemeColor.value = colorData
    // 전역 이벤트로 오른쪽 패널에 알림
    window.dispatchEvent(new CustomEvent('theme-color-selected', { detail: { color: colorData } }))
  }

  /**
   * 테마 카테고리 로드 함수
   */
  function loadCategories() {
    try {
      const extractedCategories = extractThemeColors()
      categories.value = extractedCategories
    } catch (error) {
      console.error('[useThemeManager] 테마 카테고리 로드 실패:', error)
    }
  }

  /**
   * 탭 변경 핸들러
   * @param {string} tabName - 탭 이름
   */
  function handleTabChange(tabName) {
    activeTab.value = tabName
  }

  // ============================================
  // 반환값
  // ============================================
  return {
    // 상태
    activeTab,
    statisticsData,
    selectedThemeColor,
    searchQuery,
    categoryFilter,
    sortOption,
    categories,

    // 함수
    handleThemeChange,
    handleSearchChange,
    handleCategoryFilterChange,
    handleSortChange,
    handleStatisticsAction,
    handleColorSelected,
    loadCategories,
    handleTabChange,
  }
}

