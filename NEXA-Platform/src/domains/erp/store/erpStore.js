import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useErpStore = defineStore('erp', () => {
  // 현재 활성화된 하위 메뉴 (project, work-document, schedule, collaboration, reference, logbook, parts, finance)
  const activeSubMenu = ref('project')

  function setActiveSubMenu(menuId) {
    activeSubMenu.value = menuId
  }

  return {
    activeSubMenu,
    setActiveSubMenu,
  }
})
