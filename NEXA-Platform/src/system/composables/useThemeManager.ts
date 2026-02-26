/**
 * 테마 관리 Composable
 * 테마 관리의 상태 관리, 검색, 필터, 정렬 등을 담당합니다.
 */

import { ref, type Ref } from 'vue'
import { useQuasar } from 'quasar'
import { useUserSettingsStore } from '@system/store/userSettingsStore'
import { extractThemeColors } from '@system/utils/themeColorParser'

export type ThemeCategoryItem = {
  category: string
  categoryDisplay?: string
  colors: Array<{ name: string; value: string }>
}

export type ThemeColorData = Record<string, unknown>

export function useThemeManager() {
  const $q = useQuasar()

  const activeTab: Ref<string> = ref('recent')
  const statisticsData: Ref<unknown[]> = ref([])
  const selectedThemeColor: Ref<ThemeColorData | null> = ref(null)

  const searchQuery: Ref<string> = ref('')
  const categoryFilter: Ref<string | null> = ref(null)
  const sortOption: Ref<string> = ref('category')

  const categories: Ref<ThemeCategoryItem[]> = ref([])

  function handleThemeChange(themeValue: string) {
    const userSettings = useUserSettingsStore()
    const isDark = themeValue === 'dark'

    userSettings.settings.theme.isDarkMode = isDark
    $q.dark.set(isDark)
    document.body.classList.toggle('dark', isDark)
    userSettings.saveSettings()

    window.dispatchEvent(
      new CustomEvent('theme-manager-theme-changed', { detail: { theme: themeValue } }),
    )
  }

  function handleSearchChange(query: string) {
    searchQuery.value = query
    window.dispatchEvent(
      new CustomEvent('theme-manager-search-changed', { detail: { query } }),
    )
  }

  function handleCategoryFilterChange(category: string | null) {
    categoryFilter.value = category
    window.dispatchEvent(
      new CustomEvent('theme-manager-filter-changed', { detail: { category } }),
    )
  }

  function handleSortChange(option: string) {
    sortOption.value = option
    window.dispatchEvent(
      new CustomEvent('theme-manager-sort-changed', { detail: { option } }),
    )
  }

  function handleStatisticsAction(actionType: string) {
    console.log('[useThemeManager] 통계 액션:', actionType)
    statisticsData.value = []
  }

  function handleColorSelected(colorData: ThemeColorData) {
    selectedThemeColor.value = colorData
    window.dispatchEvent(
      new CustomEvent('theme-color-selected', { detail: { color: colorData } }),
    )
  }

  function loadCategories() {
    try {
      const extractedCategories = extractThemeColors()
      categories.value = extractedCategories as ThemeCategoryItem[]
    } catch (error) {
      console.error('[useThemeManager] 테마 카테고리 로드 실패:', error)
    }
  }

  function handleTabChange(tabName: string) {
    activeTab.value = tabName
  }

  return {
    activeTab,
    statisticsData,
    selectedThemeColor,
    searchQuery,
    categoryFilter,
    sortOption,
    categories,
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
