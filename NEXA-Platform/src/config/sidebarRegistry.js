/**
 * 사이드바 레지스트리
 *
 * 왼쪽과 오른쪽 사이드바를 모두 관리합니다.
 * 새로운 사이드바를 추가할 때는 여기에만 등록하면 됩니다.
 * MainLayout.vue는 수정할 필요가 없습니다.
 *
 * 관리자 페이지에서 동적으로 설정을 관리할 수 있도록 설계되었습니다.
 * 우선순위: 관리자 설정 > 프리셋 > 기본값
 */

/**
 * 사이드바 동작 설정 타입
 * @typedef {Object} SidebarBehaviorConfig
 * @property {boolean} autoOpen - 컨텐츠에 따라 자동으로 열지 여부
 * @property {string} autoOpenPriority - 자동 오픈 우선순위 ('required' | 'recommended')
 * @property {boolean} showMessage - 안내 메시지만 보여줄지 여부 (autoOpen이 false일 때)
 * @property {boolean} respectMobileHidden - 모바일에서 숨김 상태를 유지할지 여부
 * @property {boolean} defaultOpen - 기본 열림 상태 (최초 진입 시)
 * @property {boolean} saveState - 열림/닫힘 상태를 저장할지 여부
 * @property {string|null} message - 안내 메시지 (showMessage가 true일 때 표시)
 * @property {boolean} notificationOnAutoOpen - 오픈 실패 시 알림 사용 여부
 * @property {string} notificationPriority - 알림 우선순위 ('required' | 'recommended')
 */

// ============================================
// 기본값 및 프리셋 정의
// ============================================

/**
 * 기본 behavior 설정 (모든 사이드바의 기본값)
 */
const DEFAULT_BEHAVIOR = {
  autoOpen: false,
  autoOpenPriority: 'recommended',
  showMessage: false,
  respectMobileHidden: true,
  defaultOpen: true,
  saveState: true,
  message: null,
  notificationOnAutoOpen: true,
  notificationPriority: 'recommended',
}

/**
 * 프리셋 정의 (자주 사용되는 설정 조합)
 */
const BEHAVIOR_PRESETS = {
  // 왼쪽 사이드바 기본 프리셋
  leftDefault: {
    ...DEFAULT_BEHAVIOR,
    defaultOpen: true,
  },
  // 오른쪽 사이드바 기본 프리셋
  rightDefault: {
    ...DEFAULT_BEHAVIOR,
    defaultOpen: false, // 오른쪽은 기본 닫힘
  },
  // 권장 자동 오픈 프리셋
  autoOpenRecommended: {
    ...DEFAULT_BEHAVIOR,
    autoOpen: true,
    autoOpenPriority: 'recommended',
    showMessage: true,
  },
  // 필수 자동 오픈 프리셋
  autoOpenRequired: {
    ...DEFAULT_BEHAVIOR,
    autoOpen: true,
    autoOpenPriority: 'required',
    showMessage: false,
  },
}

// ============================================
// 관리자 설정 관리 (동적 설정 지원)
// ============================================

/**
 * 관리자 설정 캐시 (API/DB에서 로드된 설정)
 * @type {Object|null}
 */
let adminSidebarSettings = null

/**
 * 관리자 설정 로드 여부
 * @type {boolean}
 */
let settingsLoaded = false

/**
 * 관리자 설정 로드 (API 또는 로컬 스토리지)
 * @returns {Promise<Object|null>} 관리자 설정 또는 null
 */
async function loadAdminSidebarSettings() {
  try {
    // API에서 로드 시도
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
    const response = await fetch(`${apiBaseUrl}/admin/sidebar-settings`)
    if (response.ok) {
      adminSidebarSettings = await response.json()
      console.log('[SidebarRegistry] 관리자 설정 로드 성공 (API)')
      return adminSidebarSettings
    }
  } catch (error) {
    console.warn('[SidebarRegistry] API에서 관리자 설정 로드 실패:', error.message)
  }

  // 로컬 스토리지에서 로드 시도 (캐시)
  try {
    const stored = localStorage.getItem('admin-sidebar-settings')
    if (stored) {
      adminSidebarSettings = JSON.parse(stored)
      console.log('[SidebarRegistry] 관리자 설정 로드 성공 (로컬 스토리지)')
      return adminSidebarSettings
    }
  } catch (error) {
    console.warn('[SidebarRegistry] 로컬 스토리지에서 관리자 설정 로드 실패:', error)
  }

  return null
}

/**
 * 관리자 설정 저장
 * @param {Object} settings - 저장할 설정
 * @returns {Promise<void>}
 */
export async function saveAdminSidebarSettings(settings) {
  adminSidebarSettings = settings

  try {
    // API에 저장
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
    await fetch(`${apiBaseUrl}/admin/sidebar-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    console.log('[SidebarRegistry] 관리자 설정 저장 성공 (API)')
  } catch (error) {
    console.warn('[SidebarRegistry] API에 관리자 설정 저장 실패, 로컬 스토리지에 저장:', error.message)
  }

  // 로컬 스토리지에도 저장 (캐시)
  try {
    localStorage.setItem('admin-sidebar-settings', JSON.stringify(settings))
  } catch (error) {
    console.warn('[SidebarRegistry] 로컬 스토리지 저장 실패:', error)
  }

  // 설정 업데이트 이벤트 발생
  window.dispatchEvent(new CustomEvent('sidebar-settings-updated', { detail: settings }))
}

/**
 * 특정 메뉴의 관리자 설정 가져오기
 * @param {string} menuName - 메뉴 이름
 * @param {string} side - 사이드 ('left' | 'right')
 * @returns {Object|null} 관리자 설정 또는 null
 */
function getAdminBehavior(menuName, side = 'left') {
  if (!adminSidebarSettings) return null

  // 특정 메뉴 설정
  const menuSettings = adminSidebarSettings[side]?.[menuName]
  if (menuSettings) return menuSettings

  // 사이드별 전역 설정 ('*')
  const sideGlobalSettings = adminSidebarSettings[side]?.['*']
  if (sideGlobalSettings) return sideGlobalSettings

  // 전역 설정
  const globalSettings = adminSidebarSettings.global
  if (globalSettings) return globalSettings

  return null
}

/**
 * 사이드바 설정 초기화 (관리자 설정 로드)
 * @returns {Promise<void>}
 */
export async function initializeSidebarSettings() {
  if (settingsLoaded) return
  await loadAdminSidebarSettings()
  settingsLoaded = true
}

// ============================================
// Behavior 생성 헬퍼 함수
// ============================================

/**
 * Behavior 설정 생성 (우선순위: 관리자 설정 > 프리셋 > 기본값 > 오버라이드)
 * @param {string} menuName - 메뉴 이름
 * @param {string} side - 사이드 ('left' | 'right')
 * @param {string} preset - 프리셋 이름 (기본값: 'leftDefault' 또는 'rightDefault')
 * @param {Object} overrides - 추가 오버라이드 설정
 * @returns {SidebarBehaviorConfig} 병합된 behavior 설정
 */
function createBehavior(menuName, side = 'left', preset = null, overrides = {}) {
  // 프리셋 결정
  if (!preset) {
    preset = side === 'right' ? 'rightDefault' : 'leftDefault'
  }

  // 1단계: 프리셋 또는 기본값
  const base = BEHAVIOR_PRESETS[preset] || BEHAVIOR_PRESETS.leftDefault

  // 2단계: 관리자 설정 병합 (가장 높은 우선순위)
  const adminBehavior = getAdminBehavior(menuName, side)
  if (adminBehavior) {
    return { ...base, ...adminBehavior, ...overrides }
  }

  // 3단계: 코드에서 오버라이드
  return { ...base, ...overrides }
}

// ============================================
// 왼쪽 사이드바 (Left Sidebar)
// ============================================
// 주의: behavior는 초기화 시점에 생성되지만, getLeftSidebarBehavior/getRightSidebarBehavior
// 호출 시 최신 관리자 설정을 반영하기 위해 동적으로 재생성됩니다.
const leftSidebarConfigs = {
  'nexa-board': {
    component: () => import('src/components/sidebars/left/NexaBoardSidebar.vue'),
    preset: 'leftDefault',
    overrides: {},
  },
  'parts-management': {
    component: () => import('src/components/sidebars/left/PartsManagementSidebar.vue'),
    preset: 'leftDefault',
    overrides: {},
  },
  home: {
    component: () => import('src/components/sidebars/left/HomeSidebar.vue'),
    preset: 'leftDefault',
    overrides: {},
  },
  portfolio: {
    component: () => import('src/components/sidebars/left/PortfolioSidebar.vue'),
    preset: 'leftDefault',
    overrides: {},
  },
  system: {
    component: () => import('src/components/sidebars/left/SystemSidebar.vue'),
    preset: 'leftDefault',
    overrides: {},
  },
  network: {
    component: () => import('src/components/sidebars/left/NetworkSidebar.vue'),
    preset: 'leftDefault',
    overrides: {},
  },
  solutions: {
    component: () => import('src/components/sidebars/left/SolutionsSidebar.vue'),
    preset: 'leftDefault',
    overrides: {},
  },
  help: {
    component: () => import('src/components/sidebars/left/HelpSidebar.vue'),
    preset: 'leftDefault',
    overrides: {},
  },
  my: {
    component: () => import('src/components/sidebars/left/MySidebar.vue'),
    preset: 'leftDefault',
    overrides: {},
  },
  'nexa-pannel': {
    component: () => import('src/components/sidebars/left/NexaPannelSidebar.vue'),
    preset: 'leftDefault',
    overrides: {},
  },
  automation: {
    component: () => import('src/components/sidebars/left/NexaNodeSidebar.vue'),
    preset: 'leftDefault',
    overrides: {},
  },
  erp: {
    component: () => import('src/components/sidebars/left/ErpSidebar.vue'),
    preset: 'leftDefault',
    overrides: {},
  },
  dev: {
    component: () => import('src/components/sidebars/left/DevSidebar.vue'),
    preset: 'autoOpenRecommended',
    overrides: {
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
    preset: 'rightDefault',
    overrides: {},
  },
  // DEV 메뉴 전용 우측 패널 (Mermaid 스타일 편집 등)
  dev: {
    component: () => import('src/components/sidebars/right/DevToolsPanel.vue'),
    preset: 'rightDefault',
    overrides: {},
  },
  // 기본 우측 사이드바 (등록되지 않은 메뉴용)
  default: {
    component: () => import('src/components/sidebars/right/DefaultRightPanel.vue'),
    preset: 'rightDefault',
    overrides: {},
  },
  // 페이지별 오른쪽 사이드바는 여기에 추가
  // 'parts-management': {
  //   component: () => import('src/components/parts-management/PartsManagementRightPanel.vue'),
  //   preset: 'autoOpenRecommended',
  //   overrides: {},
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
 * @returns {Object|null} 사이드바 설정 또는 null (behavior는 동적으로 생성됨)
 */
export function getLeftSidebarConfig(menuName) {
  if (!menuName || !leftSidebarConfigs[menuName]) {
    return null
  }
  const config = { ...leftSidebarConfigs[menuName] }
  // 하위 호환성을 위해 behavior getter 추가
  Object.defineProperty(config, 'behavior', {
    get() {
      return getLeftSidebarBehavior(menuName)
    },
    enumerable: true,
    configurable: true,
  })
  return config
}

/**
 * 오른쪽 사이드바 설정 가져오기
 * @param {string} menuName - 메뉴 이름 (없으면 'default' 사용)
 * @returns {Object|null} 사이드바 설정 또는 null (behavior는 동적으로 생성됨)
 */
export function getRightSidebarConfig(menuName = 'default') {
  const configKey = rightSidebarConfigs[menuName] ? menuName : 'default'
  const config = rightSidebarConfigs[configKey]
  if (!config) return null

  const configCopy = { ...config }
  // 하위 호환성을 위해 behavior getter 추가
  Object.defineProperty(configCopy, 'behavior', {
    get() {
      return getRightSidebarBehavior(configKey)
    },
    enumerable: true,
    configurable: true,
  })
  return configCopy
}

/**
 * 왼쪽 사이드바 동작 설정 가져오기 (최신 관리자 설정 반영)
 * @param {string} menuName - 메뉴 이름
 * @returns {SidebarBehaviorConfig|null} 동작 설정 또는 null
 */
export function getLeftSidebarBehavior(menuName) {
  const config = getLeftSidebarConfig(menuName)
  if (!config) return null

  // 최신 관리자 설정을 반영하기 위해 동적으로 재생성
  // config에 저장된 preset과 overrides를 사용하여 재생성
  const preset = config.preset || 'leftDefault'
  const overrides = config.overrides || {}
  return createBehavior(menuName, 'left', preset, overrides)
}

/**
 * 오른쪽 사이드바 동작 설정 가져오기 (최신 관리자 설정 반영)
 * @param {string} menuName - 메뉴 이름 (없으면 'default' 사용)
 * @returns {SidebarBehaviorConfig|null} 동작 설정 또는 null
 */
export function getRightSidebarBehavior(menuName = 'default') {
  const config = getRightSidebarConfig(menuName)
  if (!config) return null

  // 최신 관리자 설정을 반영하기 위해 동적으로 재생성
  const preset = config.preset || 'rightDefault'
  const overrides = config.overrides || {}
  return createBehavior(menuName, 'right', preset, overrides)
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

// ============================================
// 초기화
// ============================================

// 앱 시작 시 관리자 설정 로드 (비동기, 블로킹하지 않음)
initializeSidebarSettings().catch((error) => {
  console.warn('[SidebarRegistry] 초기화 실패, 기본값 사용:', error)
})
