/**
 * 설정 관리 Composable
 *
 * 설정 스캔, 검색, 필터링 등의 기능 제공
 */

import { ref, computed, onMounted } from 'vue'
import { scanAllSettings, searchSettings, filterSettings } from '@system/utils/settings-scanner/settingsScanner'

export interface ScannedSetting {
  id: string
  name: string
  path: string
  category?: string
  type?: string
  data?: unknown
  size?: number
  lastModified?: string
  rawValue?: string | null
  parseError?: string | null
}

export interface ScanStatistics {
  totalCount: number
  totalSize: number
  categoryStats?: Record<string, { count: number; size: number }>
  configFilesCount?: number
  localStorageCount?: number
  systemSettingsCount?: number
}

export function useSettingsManager() {
  const isLoading = ref(false)
  const allSettings = ref<ScannedSetting[]>([])
  const selectedSetting = ref<ScannedSetting | null>(null)
  const searchQuery = ref('')
  const filterCategory = ref<string | null>(null)
  const filterType = ref<string | null>(null)
  const statistics = ref<ScanStatistics | null>(null)

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

  const categories = computed(() => {
    const categorySet = new Set<string>()
    allSettings.value.forEach((setting: ScannedSetting) => {
      if (setting.category) {
        categorySet.add(setting.category)
      }
    })
    return Array.from(categorySet).sort()
  })

  const types = computed(() => {
    const typeSet = new Set<string>()
    allSettings.value.forEach((setting: ScannedSetting) => {
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
    } catch (err: unknown) {
      console.error('[useSettingsManager] 설정 스캔 실패:', err)
    } finally {
      isLoading.value = false
    }
  }

  function selectSetting(setting: ScannedSetting | null) {
    selectedSetting.value = setting
  }

  function handleSearchChange(query: string) {
    searchQuery.value = query
  }

  function handleCategoryFilterChange(category: string | null) {
    filterCategory.value = category
  }

  function handleTypeFilterChange(type: string | null) {
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
