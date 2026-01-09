/**
 * 개발 도구 메뉴 상태 관리 Composable
 *
 * DevSidebar와 DevelopmentPage 간의 메뉴 상태를 중앙에서 관리합니다.
 * - 메뉴 선택 상태
 * - 각 메뉴별 세부 상태 (테마 관리, 설정 관리, DevOps 등)
 * - localStorage 저장/복원
 * - URL 동기화
 */

import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 전역 상태 (모든 컴포넌트에서 공유)
const globalState = {
  activeMenu: ref(null),
  themeSearchQuery: ref(''),
  themeCategoryFilter: ref(null),
  themeSortOption: ref('category'),
  settingsManagerSelectedSetting: ref(null),
  settingsManagerStatistics: ref(null),
  devOpsActiveTab: ref('build'),
  devOpsSelectedBuild: ref(null),
  devOpsSelectedDeployment: ref(null),
  devOpsSelectedEnvironmentVariable: ref(null),
  devOpsSelectedPackage: ref(null),
}

// 초기화 플래그 (watch 중복 등록 방지)
let isInitialized = false

export function useDevMenuState() {
  const route = useRoute()
  const router = useRouter()

  // ============================================
  // 상태 (State) - 전역 상태 사용
  // ============================================

  // 활성 메뉴
  const activeMenu = globalState.activeMenu

  // 테마 관리 상태 (전역 상태 사용)
  const themeSearchQuery = globalState.themeSearchQuery
  const themeCategoryFilter = globalState.themeCategoryFilter
  const themeSortOption = globalState.themeSortOption

  // 설정 관리 상태 (전역 상태 사용)
  const settingsManagerSelectedSetting = globalState.settingsManagerSelectedSetting
  const settingsManagerStatistics = globalState.settingsManagerStatistics

  // DevOps 상태 (전역 상태 사용)
  const devOpsActiveTab = globalState.devOpsActiveTab
  const devOpsSelectedBuild = globalState.devOpsSelectedBuild
  const devOpsSelectedDeployment = globalState.devOpsSelectedDeployment
  const devOpsSelectedEnvironmentVariable = globalState.devOpsSelectedEnvironmentVariable
  const devOpsSelectedPackage = globalState.devOpsSelectedPackage

  // ============================================
  // localStorage 관리
  // ============================================

  /**
   * 메뉴 상태 저장
   * @param {string} menuId - 메뉴 ID
   * @param {object} state - 저장할 상태 객체
   */
  function saveMenuState(menuId, state) {
    try {
      const stateKey = `dev-menu-state-${menuId}`
      localStorage.setItem(stateKey, JSON.stringify(state))
      // 현재 활성 메뉴의 상태 키도 저장 (빠른 복원용)
      localStorage.setItem('dev-active-menu-state-key', stateKey)
    } catch (error) {
      console.error(`[useDevMenuState] 메뉴 상태 저장 실패 (${menuId}):`, error)
    }
  }

  /**
   * 메뉴 상태 로드
   * @param {string} menuId - 메뉴 ID
   * @returns {object|null} 저장된 상태 객체 또는 null
   */
  function loadMenuState(menuId) {
    try {
      const stateKey = `dev-menu-state-${menuId}`
      const saved = localStorage.getItem(stateKey)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error(`[useDevMenuState] 메뉴 상태 로드 실패 (${menuId}):`, error)
      return null
    }
  }

  /**
   * 현재 활성 메뉴의 상태를 자동으로 저장
   */
  function saveCurrentMenuState() {
    if (!activeMenu.value) return

    const state = getCurrentMenuState()
    if (state) {
      saveMenuState(activeMenu.value, state)
    }
  }

  /**
   * 현재 활성 메뉴의 상태 객체 생성
   * @returns {object|null} 현재 메뉴의 상태 객체
   */
  function getCurrentMenuState() {
    if (!activeMenu.value) return null

    switch (activeMenu.value) {
      case 'theme-manager':
        return {
          searchQuery: themeSearchQuery.value,
          categoryFilter: themeCategoryFilter.value,
          sortOption: themeSortOption.value,
        }
      case 'settings-manager':
        return {
          selectedSetting: settingsManagerSelectedSetting.value,
          statistics: settingsManagerStatistics.value,
        }
      case 'devops':
        return {
          activeTab: devOpsActiveTab.value,
          selectedBuild: devOpsSelectedBuild.value,
          selectedDeployment: devOpsSelectedDeployment.value,
          selectedEnvironmentVariable: devOpsSelectedEnvironmentVariable.value,
          selectedPackage: devOpsSelectedPackage.value,
        }
      default:
        return null
    }
  }

  /**
   * 메뉴 상태 복원
   * @param {string} menuId - 메뉴 ID
   * @param {object} state - 복원할 상태 객체
   */
  function restoreMenuState(menuId, state) {
    if (!state) return

    switch (menuId) {
      case 'theme-manager':
        if (state.searchQuery !== undefined) {
          themeSearchQuery.value = state.searchQuery
        }
        if (state.categoryFilter !== undefined) {
          themeCategoryFilter.value = state.categoryFilter
        }
        if (state.sortOption) {
          themeSortOption.value = state.sortOption
        }
        break
      case 'settings-manager':
        if (state.selectedSetting) {
          settingsManagerSelectedSetting.value = state.selectedSetting
        }
        if (state.statistics) {
          settingsManagerStatistics.value = state.statistics
        }
        break
      case 'devops':
        if (state.activeTab) {
          devOpsActiveTab.value = state.activeTab
        }
        if (state.selectedBuild) {
          devOpsSelectedBuild.value = state.selectedBuild
        }
        if (state.selectedDeployment) {
          devOpsSelectedDeployment.value = state.selectedDeployment
        }
        if (state.selectedEnvironmentVariable) {
          devOpsSelectedEnvironmentVariable.value = state.selectedEnvironmentVariable
        }
        if (state.selectedPackage) {
          devOpsSelectedPackage.value = state.selectedPackage
        }
        break
      // 다른 메뉴들의 상태 복원은 필요시 추가
    }
  }

  // ============================================
  // 메뉴 관리
  // ============================================

  /**
   * URL에서 메뉴 읽기
   * @returns {string|null} 메뉴 ID 또는 null
   */
  function getMenuFromURL() {
    const menuFromURL = route.query.menu
    if (menuFromURL && typeof menuFromURL === 'string') {
      // 유효한 메뉴 ID 목록 (필요시 파라미터로 받을 수 있음)
      const validMenus = ['document-manager', 'theme-manager', 'dev-guide', 'component-library', 'database-viewer', 'performance-monitor', 'settings-manager', 'document-generator', 'devops']
      if (validMenus.includes(menuFromURL)) {
        return menuFromURL
      }
    }
    return null
  }

  /**
   * 초기 메뉴 로드 (URL만 사용)
   * @returns {string|null} 메뉴 ID 또는 null
   */
  function getInitialActiveMenu() {
    // URL에서만 메뉴 읽기 (localStorage 복원 제거)
    return getMenuFromURL()
  }

  /**
   * 메뉴 변경 핸들러
   * @param {string|null} menuId - 메뉴 ID 또는 null
   * @param {boolean} skipUrlUpdate - URL 업데이트를 건너뛸지 여부 (브라우저 뒤로가기 등에서 사용)
   */
  function setActiveMenu(menuId, skipUrlUpdate = false) {
    // 이전 메뉴 상태 저장
    if (activeMenu.value) {
      saveCurrentMenuState()
    }

    activeMenu.value = menuId

    // URL 업데이트 (skipUrlUpdate가 false일 때만)
    if (!skipUrlUpdate) {
      if (menuId) {
        router.push({
          path: route.path,
          query: { ...route.query, menu: menuId },
          hash: route.hash,
        })
        // localStorage에 저장 (다음 접속 시 복원용)
        try {
          localStorage.setItem('dev-active-menu', menuId)
        } catch (error) {
          console.error('[useDevMenuState] 메뉴 상태 저장 실패:', error)
        }
      } else {
        // 메뉴가 없으면 쿼리 파라미터에서 menu 제거
        const newQuery = { ...route.query }
        delete newQuery.menu
        router.push({
          path: route.path,
          query: newQuery,
          hash: route.hash,
        })
        // localStorage에서도 제거 (명시적으로 기본 페이지로 이동)
        try {
          localStorage.removeItem('dev-active-menu')
          localStorage.removeItem('dev-active-menu-state-key')
        } catch (error) {
          console.error('[useDevMenuState] 메뉴 상태 삭제 실패:', error)
        }
      }
    }

    // 새 메뉴 상태 복원
    if (menuId) {
      const savedState = loadMenuState(menuId)
      if (savedState) {
        restoreMenuState(menuId, savedState)
      }
    }
  }

  /**
   * 초기화 (컴포넌트 마운트 시 호출)
   * 중복 호출 방지: 첫 번째 호출만 실제 초기화 수행
   */
  function initialize() {
    // 이미 초기화되었으면 스킵
    if (isInitialized) {
      return
    }
    isInitialized = true

    const initialMenu = getInitialActiveMenu()
    if (initialMenu) {
      activeMenu.value = initialMenu
      // 상태 복원
      const savedState = loadMenuState(initialMenu)
      if (savedState) {
        restoreMenuState(initialMenu, savedState)
      }
    }

    // URL 변경 감지하여 메뉴 자동 선택
    watch(
      () => route.query.menu,
      (newMenu) => {
        if (newMenu && typeof newMenu === 'string') {
          const validMenus = ['document-manager', 'theme-manager', 'dev-guide', 'component-library', 'database-viewer', 'performance-monitor', 'settings-manager', 'document-generator', 'devops']
          if (validMenus.includes(newMenu) && activeMenu.value !== newMenu) {
            // URL 변경 감지 시에는 URL 업데이트를 건너뜀 (브라우저 뒤로가기 등)
            setActiveMenu(newMenu, true)
          }
        } else if (!newMenu && activeMenu.value) {
          // URL에서 menu가 제거되면 메뉴도 초기화
          // URL 업데이트는 필요 없음 (이미 URL에서 제거됨)
          activeMenu.value = null
        }
      },
      { immediate: true },
    )

    // 상태 변경 시 자동 저장 (debounce 적용 가능)
    watch(
      [
        () => (activeMenu.value === 'theme-manager' ? themeSearchQuery.value : null),
        () => (activeMenu.value === 'theme-manager' ? themeCategoryFilter.value : null),
        () => (activeMenu.value === 'theme-manager' ? themeSortOption.value : null),
        () => (activeMenu.value === 'settings-manager' ? settingsManagerSelectedSetting.value : null),
        () => (activeMenu.value === 'settings-manager' ? settingsManagerStatistics.value : null),
        () => (activeMenu.value === 'devops' ? devOpsActiveTab.value : null),
        () => (activeMenu.value === 'devops' ? devOpsSelectedBuild.value : null),
        () => (activeMenu.value === 'devops' ? devOpsSelectedDeployment.value : null),
        () => (activeMenu.value === 'devops' ? devOpsSelectedEnvironmentVariable.value : null),
        () => (activeMenu.value === 'devops' ? devOpsSelectedPackage.value : null),
      ],
      () => {
        if (activeMenu.value) {
          saveCurrentMenuState()
        }
      },
      { deep: true },
    )
  }

  // ============================================
  // 반환
  // ============================================

  return {
    // 상태
    activeMenu,
    themeSearchQuery,
    themeCategoryFilter,
    themeSortOption,
    settingsManagerSelectedSetting,
    settingsManagerStatistics,
    devOpsActiveTab,
    devOpsSelectedBuild,
    devOpsSelectedDeployment,
    devOpsSelectedEnvironmentVariable,
    devOpsSelectedPackage,

    // 함수
    setActiveMenu,
    getInitialActiveMenu,
    getMenuFromURL,
    saveMenuState,
    loadMenuState,
    restoreMenuState,
    saveCurrentMenuState,
    getCurrentMenuState,
    initialize,
  }
}
