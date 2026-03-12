import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export type AdminSectionId =
  | 'overview'
  | 'members'
  | 'tier-access'
  | 'api-limits'
  | 'audit'
  | 'system'
  | 'edge-ota'
  | 'ai-resources'
  | 'ui-theme'

/** 검색 범위: 전체 메뉴 vs 현재 메뉴만 */
export type AdminSearchScope = 'all' | 'current'

/**
 * [NEXA-ADMIN-01] 관리자 도메인 UI 상태
 */
export const useAdminStore = defineStore('admin', () => {
  const activeSection: Ref<AdminSectionId> = ref('overview')
  const searchQuery: Ref<string> = ref('')
  const searchScope: Ref<AdminSearchScope> = ref('all')

  function setActiveSection(sectionId: AdminSectionId): void {
    activeSection.value = sectionId
  }

  function setSearchQuery(q: string): void {
    searchQuery.value = q
  }

  function setSearchScope(scope: AdminSearchScope): void {
    searchScope.value = scope
  }

  return {
    activeSection,
    searchQuery,
    searchScope,
    setActiveSection,
    setSearchQuery,
    setSearchScope,
  }
})
