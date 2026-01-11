import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useErpStore = defineStore('erp', () => {
  // 현재 활성화된 하위 메뉴 (project, work-document, schedule, collaboration, reference, logbook, parts, finance, dashboard)
  const activeSubMenu = ref('dashboard')
  const lastSubMenu = ref(localStorage.getItem('erp-last-submenu') || 'dashboard')
  const defaultLanding = ref(localStorage.getItem('erp-default-landing') || '')

  function setActiveSubMenu(menuId) {
    activeSubMenu.value = menuId
    lastSubMenu.value = menuId
    localStorage.setItem('erp-last-submenu', menuId)
  }

  function setDefaultLanding(menuId) {
    defaultLanding.value = menuId
    localStorage.setItem('erp-default-landing', menuId)
  }

  return {
    activeSubMenu,
    lastSubMenu,
    defaultLanding,
    setActiveSubMenu,
    setDefaultLanding,
  }
})
