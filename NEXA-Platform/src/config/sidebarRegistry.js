/**
 * 사이드바 레지스트리
 *
 * 왼쪽과 오른쪽 사이드바를 모두 관리합니다.
 * 새로운 사이드바를 추가할 때는 여기에만 등록하면 됩니다.
 * MainLayout.vue는 수정할 필요가 없습니다.
 */

/**
 * 사이드바 동작 설정 타입
 * @typedef {Object} SidebarBehaviorConfig
 * @property {boolean} autoOpen - 컨텐츠에 따라 자동으로 열지 여부
 * @property {boolean} showMessage - 안내 메시지만 보여줄지 여부 (autoOpen이 false일 때)
 * @property {boolean} respectMobileHidden - 모바일에서 숨김 상태를 유지할지 여부
 * @property {boolean} defaultOpen - 기본 열림 상태 (최초 진입 시)
 * @property {boolean} saveState - 열림/닫힘 상태를 저장할지 여부
 * @property {string|null} message - 안내 메시지 (showMessage가 true일 때 표시)
 */

// ============================================
// 왼쪽 사이드바 (Left Sidebar)
// ============================================
const leftSidebarConfigs = {
  'nexa-board': {
    component: () => import('src/components/sidebars/left/NexaBoardSidebar.vue'),
    behavior: {
      autoOpen: false,
      showMessage: false,
      respectMobileHidden: true,
      defaultOpen: true,
      saveState: true,
      message: null,
    },
  },
  'parts-management': {
    component: () => import('src/components/sidebars/left/PartsManagementSidebar.vue'),
    behavior: {
      autoOpen: false, // 컨텐츠에 따라 자동으로 열지 여부
      showMessage: false, // 안내 메시지만 보여줄지 여부
      respectMobileHidden: true, // 모바일에서 숨김 상태 유지
      defaultOpen: true, // 기본 열림 상태
      saveState: true, // 상태 저장 여부
      message: null, // 안내 메시지 (showMessage가 true일 때)
    },
  },
  home: {
    component: () => import('src/components/sidebars/left/HomeSidebar.vue'),
    behavior: {
      autoOpen: false,
      showMessage: false,
      respectMobileHidden: true,
      defaultOpen: true,
      saveState: true,
      message: null,
    },
  },
  portfolio: {
    component: () => import('src/components/sidebars/left/PortfolioSidebar.vue'),
    behavior: {
      autoOpen: false,
      showMessage: false,
      respectMobileHidden: true,
      defaultOpen: true,
      saveState: true,
      message: null,
    },
  },
  system: {
    component: () => import('src/components/sidebars/left/SystemSidebar.vue'),
    behavior: {
      autoOpen: false,
      showMessage: false,
      respectMobileHidden: true,
      defaultOpen: true,
      saveState: true,
      message: null,
    },
  },
  network: {
    component: () => import('src/components/sidebars/left/NetworkSidebar.vue'),
    behavior: {
      autoOpen: false,
      showMessage: false,
      respectMobileHidden: true,
      defaultOpen: true,
      saveState: true,
      message: null,
    },
  },
  solutions: {
    component: () => import('src/components/sidebars/left/SolutionsSidebar.vue'),
    behavior: {
      autoOpen: false,
      showMessage: false,
      respectMobileHidden: true,
      defaultOpen: true,
      saveState: true,
      message: null,
    },
  },
  help: {
    component: () => import('src/components/sidebars/left/HelpSidebar.vue'),
    behavior: {
      autoOpen: false,
      showMessage: false,
      respectMobileHidden: true,
      defaultOpen: true,
      saveState: true,
      message: null,
    },
  },
  my: {
    component: () => import('src/components/sidebars/left/MySidebar.vue'),
    behavior: {
      autoOpen: false,
      showMessage: false,
      respectMobileHidden: true,
      defaultOpen: true,
      saveState: true,
      message: null,
    },
  },
  'nexa-pannel': {
    component: () => import('src/components/sidebars/left/NexaPannelSidebar.vue'),
    behavior: {
      autoOpen: false,
      showMessage: false,
      respectMobileHidden: true,
      defaultOpen: true,
      saveState: true,
      message: null,
    },
  },
  automation: {
    component: () => import('src/components/sidebars/left/NexaNodeSidebar.vue'),
    behavior: {
      autoOpen: false,
      showMessage: false,
      respectMobileHidden: true,
      defaultOpen: true,
      saveState: true,
      message: null,
    },
  },
  erp: {
    component: () => import('src/components/sidebars/left/ErpSidebar.vue'),
    behavior: {
      autoOpen: false,
      showMessage: false,
      respectMobileHidden: true,
      defaultOpen: true,
      saveState: true,
      message: null,
    },
  },
  dev: {
    component: () => import('src/components/sidebars/left/DevSidebar.vue'),
    behavior: {
      autoOpen: true, // 문서가 없을 때 자동으로 열기
      showMessage: true, // 문서가 없을 때 안내 메시지 표시
      respectMobileHidden: true,
      defaultOpen: true,
      saveState: true,
      message: '문서를 선택하거나 새로 만드세요.',
    },
  },
}

// ============================================
// 오른쪽 사이드바 (Right Sidebar)
// ============================================
const rightSidebarConfigs = {
  // 넥사보드 전용 도구 패널
  'nexa-board': {
    component: () => import('src/components/sidebars/right/NexaBoardToolsPanel.vue'),
    behavior: {
      autoOpen: false,
      showMessage: false,
      respectMobileHidden: true,
      defaultOpen: false,
      saveState: true,
      message: null,
    },
  },
  // DEV 메뉴 전용 우측 패널 (Mermaid 스타일 편집 등)
  dev: {
    component: () => import('src/components/sidebars/right/DevToolsPanel.vue'),
    behavior: {
      autoOpen: false,
      showMessage: false,
      respectMobileHidden: true,
      defaultOpen: false,
      saveState: true,
      message: null,
    },
  },
  // 기본 우측 사이드바 (등록되지 않은 메뉴용)
  default: {
    component: () => import('src/components/sidebars/right/DefaultRightPanel.vue'),
    behavior: {
      autoOpen: false,
      showMessage: false,
      respectMobileHidden: true,
      defaultOpen: false,
      saveState: true,
      message: null,
    },
  },
  // 페이지별 오른쪽 사이드바는 여기에 추가
  // 'parts-management': {
  //   component: () => import('src/components/parts-management/PartsManagementRightPanel.vue'),
  //   behavior: {
  //     autoOpen: true, // 부품 선택 시 자동으로 열기
  //     showMessage: false,
  //     respectMobileHidden: true,
  //     defaultOpen: false,
  //     saveState: true,
  //     message: null,
  //   },
  // },
}

// 레거시 호환성을 위한 컴포넌트 맵 (하위 호환성)
const leftSidebarComponents = {}
const rightSidebarComponents = {}

// 설정에서 컴포넌트 맵 생성
Object.keys(leftSidebarConfigs).forEach((key) => {
  leftSidebarComponents[key] = leftSidebarConfigs[key].component
})

Object.keys(rightSidebarConfigs).forEach((key) => {
  rightSidebarComponents[key] = rightSidebarConfigs[key].component
})

// 사이드바 컴포넌트 캐시
const leftSidebarCache = new Map()
const rightSidebarCache = new Map()

/**
 * 왼쪽 사이드바 컴포넌트 가져오기
 * @param {string} menuName - 메뉴 이름
 * @returns {Promise<Component>|null} 사이드바 컴포넌트 또는 null
 */
export async function getLeftSidebarComponent(menuName) {
  if (!menuName || !leftSidebarComponents[menuName]) {
    return null
  }

  // 캐시 확인
  if (leftSidebarCache.has(menuName)) {
    return leftSidebarCache.get(menuName)
  }

  try {
    // 동적 import
    const module = await leftSidebarComponents[menuName]()
    const component = module.default || module
    leftSidebarCache.set(menuName, component)
    return component
  } catch (error) {
    console.error(`Failed to load left sidebar for ${menuName}:`, error)
    return null
  }
}

/**
 * 오른쪽 사이드바 컴포넌트 가져오기
 * @param {string} menuName - 메뉴 이름 (없으면 'default' 사용)
 * @returns {Promise<Component>|null} 사이드바 컴포넌트 또는 null
 */
export async function getRightSidebarComponent(menuName = 'default') {
  const componentKey = rightSidebarComponents[menuName] ? menuName : 'default'

  // 캐시 확인
  if (rightSidebarCache.has(componentKey)) {
    return rightSidebarCache.get(componentKey)
  }

  try {
    // 동적 import
    const module = await rightSidebarComponents[componentKey]()
    const component = module.default || module
    rightSidebarCache.set(componentKey, component)
    return component
  } catch (error) {
    console.error(`Failed to load right sidebar for ${componentKey}:`, error)
    return null
  }
}

/**
 * 왼쪽 사이드바 설정 가져오기
 * @param {string} menuName - 메뉴 이름
 * @returns {Object|null} 사이드바 설정 또는 null
 */
export function getLeftSidebarConfig(menuName) {
  if (!menuName || !leftSidebarConfigs[menuName]) {
    return null
  }
  return leftSidebarConfigs[menuName]
}

/**
 * 오른쪽 사이드바 설정 가져오기
 * @param {string} menuName - 메뉴 이름 (없으면 'default' 사용)
 * @returns {Object|null} 사이드바 설정 또는 null
 */
export function getRightSidebarConfig(menuName = 'default') {
  const configKey = rightSidebarConfigs[menuName] ? menuName : 'default'
  return rightSidebarConfigs[configKey] || null
}

/**
 * 왼쪽 사이드바 동작 설정 가져오기
 * @param {string} menuName - 메뉴 이름
 * @returns {SidebarBehaviorConfig|null} 동작 설정 또는 null
 */
export function getLeftSidebarBehavior(menuName) {
  const config = getLeftSidebarConfig(menuName)
  return config ? config.behavior : null
}

/**
 * 오른쪽 사이드바 동작 설정 가져오기
 * @param {string} menuName - 메뉴 이름 (없으면 'default' 사용)
 * @returns {SidebarBehaviorConfig|null} 동작 설정 또는 null
 */
export function getRightSidebarBehavior(menuName = 'default') {
  const config = getRightSidebarConfig(menuName)
  return config ? config.behavior : null
}

/**
 * 왼쪽 사이드바 레지스트리에 등록된 메뉴 목록
 */
export const registeredLeftMenus = Object.keys(leftSidebarComponents)

/**
 * 오른쪽 사이드바 레지스트리에 등록된 메뉴 목록
 */
export const registeredRightMenus = Object.keys(rightSidebarComponents)

/**
 * 메뉴에 왼쪽 사이드바가 등록되어 있는지 확인
 */
export function hasLeftSidebar(menuName) {
  return Object.prototype.hasOwnProperty.call(leftSidebarComponents, menuName)
}

/**
 * 메뉴에 오른쪽 사이드바가 등록되어 있는지 확인
 */
export function hasRightSidebar(menuName) {
  return Object.prototype.hasOwnProperty.call(rightSidebarComponents, menuName)
}

// ============================================
// 하위 호환성을 위한 레거시 함수들
// ============================================

/**
 * @deprecated getLeftSidebarComponent를 사용하세요
 */
export async function getSidebarComponent(menuName) {
  return getLeftSidebarComponent(menuName)
}

/**
 * @deprecated registeredLeftMenus를 사용하세요
 */
export const registeredMenus = registeredLeftMenus

/**
 * @deprecated hasLeftSidebar를 사용하세요
 */
export function hasSidebar(menuName) {
  return hasLeftSidebar(menuName)
}
