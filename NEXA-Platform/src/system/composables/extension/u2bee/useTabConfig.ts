// ============================================
// 탭 구성 관리 Composable
// ============================================
// U2BEE 탭 구성(표시/숨김, 순서) 관리

import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'u2bee_tab_config'

// 기본 탭 구성
interface TabItem {
  name: string
  label: string
  icon: string
  visible: boolean
  order: number
}

const defaultTabConfig: TabItem[] = [
  { name: 'rating', label: 'Rate', icon: 'star', visible: true, order: 0 },
  { name: 'list', label: 'List', icon: 'list', visible: true, order: 1 },
  { name: 'playbox', label: 'Play', icon: 'playlist_play', visible: true, order: 2 },
  { name: 'history', label: 'History', icon: 'history', visible: true, order: 3 },
  { name: 'statistics', label: 'Stats', icon: 'bar_chart', visible: true, order: 4 },
  { name: 'data', label: 'Data', icon: 'storage', visible: true, order: 5 },
  { name: 'config', label: 'Config', icon: 'settings', visible: true, order: 6 },
  { name: 'about', label: 'Help', icon: 'help_outline', visible: true, order: 7 },
]

/**
 * 탭 구성 관리 composable
 * @returns {Object} 탭 구성 및 관리 함수
 */
export function useTabConfig() {
  // 탭 구성 (반응형)
  const tabConfig = ref([...defaultTabConfig])

  // 로컬 스토리지에서 탭 구성 로드
  function loadTabConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // 기본 구성과 병합 (새로운 탭 추가 시 대비)
        const merged = defaultTabConfig.map((defaultTab: TabItem) => {
          const savedTab = parsed.find((t: TabItem) => t.name === defaultTab.name)
          return savedTab
            ? { ...defaultTab, ...savedTab }
            : defaultTab
        })
        // 저장된 탭이 더 많으면 추가 (향후 확장 기능용)
        parsed.forEach((savedTab: TabItem) => {
          if (!merged.find((t: TabItem) => t.name === savedTab.name)) {
            merged.push(savedTab)
          }
        })
        tabConfig.value = merged.sort((a, b) => a.order - b.order)
      }
    } catch (error) {
      console.error('Failed to load tab config:', error)
      tabConfig.value = [...defaultTabConfig]
    }
  }

  // 로컬 스토리지에 탭 구성 저장
  function saveTabConfig() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tabConfig.value))
    } catch (error) {
      console.error('Failed to save tab config:', error)
    }
  }

  // 표시되는 탭만 필터링 (visible === true)
  const visibleTabs = computed(() => {
    return tabConfig.value.filter((tab) => tab.visible).sort((a, b) => a.order - b.order)
  })

  // 탭 표시/숨김 토글
  function toggleTabVisibility(tabName: string) {
    const tab = tabConfig.value.find((t: TabItem) => t.name === tabName)
    if (tab) {
      tab.visible = !tab.visible
      saveTabConfig()
    }
  }

  // 탭 순서 변경
  function updateTabOrder(newOrder: string[]) {
    newOrder.forEach((tabName: string, index: number) => {
      const tab = tabConfig.value.find((t: TabItem) => t.name === tabName)
      if (tab) {
        tab.order = index
      }
    })
    saveTabConfig()
  }

  // 기본 구성으로 복원
  function resetToDefault() {
    tabConfig.value = [...defaultTabConfig]
    saveTabConfig()
  }

  // 초기 로드
  loadTabConfig()

  // 탭 구성 변경 감지 및 자동 저장
  watch(
    tabConfig,
    () => {
      saveTabConfig()
    },
    { deep: true }
  )

  return {
    tabConfig,
    visibleTabs,
    toggleTabVisibility,
    updateTabOrder,
    resetToDefault,
    saveTabConfig,
  }
}
