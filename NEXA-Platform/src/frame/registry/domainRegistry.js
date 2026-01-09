/**
 * 도메인 레지스트리 (Domain Registry) v2
 * 
 * 플랫폼의 모든 도메인(메뉴)에 대한 컴포넌트 구성을 관리합니다.
 * - left: 왼쪽 사이드바 컴포넌트
 * - content: 메인 컨텐츠 컴포넌트
 * - right: 오른쪽 패널 컴포넌트
 */

/**
 * 도메인별 컴포넌트 구성
 */
const domainConfigs = {
  // 홈
  home: {
    left: () => import('src/frame/views/home/HomeLeftNav.vue'),
    content: null, // 홈은 라우터에서 처리하거나 특정 뷰 사용
    right: null
  },
  // 넥사보드
  'nexa-board': {
    left: () => import('src/domains/board/views/left/BoardLeftNav.vue'),
    content: null, // 보드는 복잡한 레이아웃이므로 라우터 유지 권장
    right: () => import('src/domains/board/views/right/BoardRightPanel.vue')
  },
  // 넥사패널
  'nexa-pannel': {
    left: () => import('src/domains/panel/views/left/PanelLeftNav.vue'),
    content: null,
    right: () => import('src/domains/panel/views/right/PanelRightPanel.vue')
  },
  // 노드 (자동화)
  automation: {
    left: () => import('src/domains/node/views/left/NodeLeftNav.vue'),
    content: () => import('src/domains/node/views/content/NodeContent.vue'),
    right: () => import('src/domains/node/views/right/NodeRightPanel.vue')
  },
  // 인프라 관리
  infra: {
    left: () => import('src/domains/infra/views/left/InfraSidebar.vue'),
    content: () => import('src/domains/infra/views/content/InfraContent.vue'),
    right: () => import('src/domains/infra/views/right/InfraRightPanel.vue')
  },
  // 설정 도메인 (리팩토링됨)
  settings: {
    left: () => import('src/domains/settings/views/left/SettingsSidebar.vue'),
    content: () => import('src/domains/settings/views/content/SettingsContent.vue'),
    right: null
  },
  // 개발 도구
  dev: {
    left: () => import('src/domains/dev/views/DevLeftNav.vue'),
    content: () => import('src/domains/dev/DevDomain.vue'),
    right: () => import('src/domains/dev/views/DevRightPanel.vue'),
    behavior: {
      autoOpen: true,
      message: '문서를 선택하거나 새로 만드세요.'
    }
  },
  // 부품 관리
  'parts-management': {
    left: () => import('src/domains/parts-management/views/left/PartsManagementLeftNav.vue'),
    content: null, // 기존 라우터 유지
    right: () => import('src/domains/parts-management/views/right/PartsManagementRightPanel.vue')
  },
  // ... 기타 도메인 등록
  'nexa-trace': {
    left: () => import('src/domains/trace/views/left/TraceLeftNav.vue'),
    content: null,
    right: null
  },
  erp: {
    left: () => import('src/domains/erp/views/left/ErpLeftNav.vue'),
    content: null,
    right: () => import('src/domains/erp/views/right/ErpRightPanel.vue')
  }
}

// 기본 동작 설정
const DEFAULT_BEHAVIOR = {
  autoOpen: false,
  defaultOpen: true,
  saveState: true
}

/**
 * 왼쪽 사이드바 컴포넌트 가져오기
 */
export async function getLeftSidebarComponent(domain) {
  if (!domainConfigs[domain]?.left) return null
  const module = await domainConfigs[domain].left()
  return module.default || module
}

/**
 * 메인 컨텐츠 컴포넌트 가져오기
 */
export async function getContentComponent(domain) {
  if (!domainConfigs[domain]?.content) return null
  const module = await domainConfigs[domain].content()
  return module.default || module
}

/**
 * 오른쪽 패널 컴포넌트 가져오기
 */
export async function getRightSidebarComponent(domain) {
  const componentFn = domainConfigs[domain]?.right || (domain === 'default' ? () => import('src/frame/views/common/DefaultRightPanel.vue') : null)
  
  if (!componentFn) return null
  const module = await componentFn()
  return module.default || module
}

/**
 * 도메인 설정 가져오기
 */
export function getDomainConfig(domain) {
  return domainConfigs[domain] || null
}

/**
 * 도메인 동작 설정 가져오기
 */
export function getDomainBehavior(domain) {
  const config = domainConfigs[domain]
  return { ...DEFAULT_BEHAVIOR, ...(config?.behavior || {}) }
}

export default domainConfigs
