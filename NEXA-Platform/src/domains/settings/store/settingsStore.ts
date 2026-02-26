import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

/**
 * [SettingsStore]
 * 설정 도메인의 로컬 UI 상태를 관리합니다.
 */
export const useSettingsStore = defineStore('settings', () => {
  const activeTab: Ref<string> = ref('shortcuts')

  function setActiveTab(tabId: string): void {
    activeTab.value = tabId
  }

  return {
    activeTab,
    setActiveTab,
  }
})

export default useSettingsStore
