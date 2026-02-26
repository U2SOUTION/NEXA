import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export type ErpSubMenuId =
  | 'project'
  | 'work-document'
  | 'schedule'
  | 'collaboration'
  | 'reference'
  | 'logbook'
  | 'parts'
  | 'finance'
  | 'dashboard'

export const useErpStore = defineStore('erp', () => {
  const activeSubMenu: Ref<string> = ref('dashboard')
  const lastSubMenu: Ref<string> = ref(
    (typeof localStorage !== 'undefined' && localStorage.getItem('erp-last-submenu')) || 'dashboard',
  )
  const defaultLanding: Ref<string> = ref(
    (typeof localStorage !== 'undefined' && localStorage.getItem('erp-default-landing')) || '',
  )

  function setActiveSubMenu(menuId: string): void {
    activeSubMenu.value = menuId
    lastSubMenu.value = menuId
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('erp-last-submenu', menuId)
    }
  }

  function setDefaultLanding(menuId: string): void {
    defaultLanding.value = menuId
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('erp-default-landing', menuId)
    }
  }

  return {
    activeSubMenu,
    lastSubMenu,
    defaultLanding,
    setActiveSubMenu,
    setDefaultLanding,
  }
})
