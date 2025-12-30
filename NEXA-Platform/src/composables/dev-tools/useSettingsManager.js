/**
 * 설정 관리 Composable
 * 
 * 설정 스캔, 검색, 필터링 등의 기능 제공
 */

import { ref, computed, onMounted } from 'vue'
import { scanAllSettings, searchSettings, filterSettings } from 'src/utils/settings-scanner/settingsScanner.js'

export function useSettingsManager() {
  // 상태
  const isLoading = ref(false)
  const allSettings = ref([])
  const selectedSetting = ref(null)
  const searchQuery = ref('')
  const filterCategory = ref(null)
  const filterType = ref(null)
  const statistics = ref(null)

  // 검색 및 필터링된 설정
  const filteredSettings = computed(() => {
    let result = [...allSettings.value]

    // 검색
    if (searchQuery.value) {
      result = searchSettings(result, searchQuery.value)
    }

    // 필터링
    if (filterCategory.value || filterType.value) {
      result = filterSettings(result, {
        category: filterCategory.value,
        type: filterType.value,
      })
    }

    return result
  })

  // 카테고리 목록
  const categories = computed(() => {
    const categorySet = new Set()
    allSettings.value.forEach(setting => {
      if (setting.category) {
        categorySet.add(setting.category)
      }
    })
    return Array.from(categorySet).sort()
  })

  // 타입 목록
  const types = computed(() => {
    const typeSet = new Set()
    allSettings.value.forEach(setting => {
      if (setting.type) {
        typeSet.add(setting.type)
      }
    })
    return Array.from(typeSet).sort()
  })

  // 설정 스캔
  async function scanSettings() {
    isLoading.value = true
    try {
      const result = await scanAllSettings()
      
      // 모든 설정을 하나의 배열로 합치기
      allSettings.value = [
        ...result.configFiles,
        ...result.localStorageSettings,
        ...result.systemSettings,
      ]
      
      statistics.value = result.statistics
    } catch (error) {
      console.error('[useSettingsManager] 설정 스캔 실패:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 설정 선택
  function selectSetting(setting) {
    selectedSetting.value = setting
  }

  // 검색 변경
  function handleSearchChange(query) {
    searchQuery.value = query
  }

  // 카테고리 필터 변경
  function handleCategoryFilterChange(category) {
    filterCategory.value = category
  }

  // 타입 필터 변경
  function handleTypeFilterChange(type) {
    filterType.value = type
  }

  // 필터 초기화
  function resetFilters() {
    searchQuery.value = ''
    filterCategory.value = null
    filterType.value = null
  }

  // 초기화
  onMounted(() => {
    scanSettings()
  })

  return {
    // 상태
    isLoading,
    allSettings,
    selectedSetting,
    searchQuery,
    filterCategory,
    filterType,
    statistics,
    
    // Computed
    filteredSettings,
    categories,
    types,
    
    // 메서드
    scanSettings,
    selectSetting,
    handleSearchChange,
    handleCategoryFilterChange,
    handleTypeFilterChange,
    resetFilters,
  }
}
