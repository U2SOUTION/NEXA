import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * [SettingsStore]
 * 설정 도메인의 로컬 UI 상태를 관리합니다.
 */
export const useSettingsStore = defineStore('settings', () => {
  // 현재 활성화된 설정 탭
  const activeTab = ref('shortcuts')

  /**
   * 탭 변경 함수
   * @param {string} tabId 
   */
  function setActiveTab(tabId) {
    activeTab.value = tabId
  }

  return {
    activeTab,
    setActiveTab
  }
})

export default useSettingsStore
