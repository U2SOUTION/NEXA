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
    left: () => import('@frame/views/home/HomeLeftNav.vue'),
    content: () => import('@frame/views/home/HomeView.vue'),
    right: null
  },
  // 넥사보드
  'nexa-board': {
    left: () => import('@domains/board/views/left/BoardLeftNav.vue'),
    content: () => import('@domains/board/BoardDomain.vue'),
    right: () => import('@domains/board/views/right/BoardRightPanel.vue')
  },
  // 넥사패널
  'nexa-pannel': {
    left: () => import('@domains/panel/views/left/PanelLeftNav.vue'),
    content: () => import('@domains/panel/PanelDomain.vue'),
    right: () => import('@domains/panel/views/right/PanelRightPanel.vue')
  },
  // 노드 (자동화)
  automation: {
    left: () => import('@domains/node/views/left/NodeLeftNav.vue'),
    content: () => import('@domains/node/views/content/NodeContent.vue'),
    right: () => import('@domains/node/views/right/NodeRightPanel.vue')
  },
  // 인프라 관리
  infra: {
    left: () => import('@domains/infra/views/left/InfraSidebar.vue'),
    content: () => import('@domains/infra/views/content/InfraContent.vue'),
    right: () => import('@domains/infra/views/right/InfraRightPanel.vue')
  },
  // 네트워크 관리
  network: {
    left: () => import('@domains/network/views/NetworkLeftNav.vue'),
    content: () => import('@domains/network/NetworkDomain.vue'),
    right: null
  },
  // 솔루션
  solutions: {
    left: () => import('@domains/solutions/views/SolutionsLeftNav.vue'),
    content: () => import('@domains/solutions/SolutionsDomain.vue'),
    right: null
  },
  // 설정 도메인 (리팩토링됨)
  settings: {
    left: () => import('@domains/settings/views/left/SettingsSidebar.vue'),
    content: () => import('@domains/settings/views/content/SettingsContent.vue'),
    right: null
  },
  // 개발 도구
  dev: {
    left: () => import('@domains/dev/views/DevLeftNav.vue'),
    content: () => import('@domains/dev/DevDomain.vue'),
    right: () => import('@domains/dev/views/DevRightPanel.vue'),
    behavior: {
      autoOpen: true,
      message: '문서를 선택하거나 새로 만드세요.'
    }
  },
  // 부품 관리
  'parts-management': {
    left: () => import('@domains/parts-management/views/left/PartsManagementLeftNav.vue'),
    content: () => import('@domains/parts-management/PartsManagementDomain.vue'),
    right: () => import('@domains/parts-management/views/right/PartsManagementRightPanel.vue')
  },
  // 포트폴리오
  portfolio: {
    left: () => import('@domains/portfolio/views/left/PortfolioLeftNav.vue'),
    content: () => import('@domains/portfolio/PortfolioDomain.vue'),
    right: null
  },
  // 추적
  'nexa-trace': {
    left: () => import('@domains/trace/views/left/TraceLeftNav.vue'),
    content: () => import('@domains/trace/TraceDomain.vue'),
    right: null
  },
  // ERP
  'nexa-erp': {
    left: () => import('@domains/erp/views/left/ErpLeftNav.vue'),
    content: () => import('@domains/erp/ErpDomain.vue'),
    right: () => import('@domains/erp/views/right/ErpRightPanel.vue')
  },
  // 확장 프로그램
  extension: {
    left: () => import('@domains/extension/views/ExtensionLeftNav.vue'),
    content: () => import('@domains/extension/views/content/ExtensionContent.vue'),
    right: null
  },
  // 도움말
  help: {
    left: () => import('@frame/views/help/HelpLeftNav.vue'),
    content: () => import('@frame/views/help/HelpView.vue'),
    right: null
  },
  // 마이페이지
  my: {
    left: () => import('@frame/views/my/MyLeftNav.vue'),
    content: () => import('@frame/views/my/MyView.vue'),
    right: null
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
  const componentFn = domainConfigs[domain]?.right || (domain === 'default' ? () => import('@frame/views/common/DefaultRightPanel.vue') : null)
  
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
