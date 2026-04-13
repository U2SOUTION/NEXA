/**
 * 도메인 레이아웃 레지스트리 (Domain Layout Registry) v2
 *
 * 플랫폼의 모든 도메인(메뉴)에 대한 컴포넌트 구성을 관리합니다.
 * - headerActions: 헤더 액션 컴포넌트 주입받기
 * - left: 왼쪽 사이드바 컴포넌트 주입받기
 * - content: 메인 컨텐츠 컴포넌트 주입받기
 * - right: 오른쪽 넥셋 컴포넌트 주입받기
 */
import type { Component } from 'vue'

type LazyComponent = () => Promise<{ default: Component } | Component>

type DomainBehavior = {
  autoOpen?: boolean
  defaultOpen?: boolean
  saveState?: boolean
  message?: string
}

type DomainConfig = {
  left?: LazyComponent
  content?: LazyComponent
  right?: LazyComponent | null
  headerActions?: LazyComponent
  behavior?: DomainBehavior
}

/**
 * 도메인별 컴포넌트 구성
 */
const domainConfigs: Record<string, DomainConfig> = {
  // 홈
  home: {
    left: () => import('@domains/home/views/left/HomeLeftNav.vue'),
    content: () => import('@domains/home/views/content/HomeView.vue'),
    right: null,
  },
  // 넥사보드
  'nexa-board': {
    left: () => import('@domains/board/views/left/BoardLeftNav.vue'),
    content: () => import('@domains/board/BoardDomain.vue'),
    right: () => import('@domains/board/views/right/BoardRightPanel.vue'),
    headerActions: () => import('@domains/board/components/BoardHeaderActions.vue'),
  },
  // 넥사넥셋
  nexet: {
    left: () => import('@domains/nexet/views/left/NexetLeftNav.vue'),
    content: () => import('@domains/nexet/NexetDomain.vue'),
    right: () => import('@domains/nexet/views/right/NexetRightPanel.vue'),
  },
  // 넥사노드 (자동화)
  automation: {
    left: () => import('@domains/node/views/left/NodeLeftNav.vue'),
    content: () => import('@domains/node/views/content/NodeContent.vue'),
    right: () => import('@domains/node/views/right/NodeRightPanel.vue'),
  },
  // 인프라 관리
  infra: {
    left: () => import('@domains/infra/views/left/InfraSidebar.vue'),
    content: () => import('@domains/infra/views/content/InfraContent.vue'),
    right: () => import('@domains/infra/views/right/InfraRightPanel.vue'),
  },
  // 네트워크 관리
  network: {
    left: () => import('@domains/network/views/NetworkLeftNav.vue'),
    content: () => import('@domains/network/NetworkDomain.vue'),
    right: null,
  },
  // 솔루션
  solutions: {
    left: () => import('@domains/solutions/views/SolutionsLeftNav.vue'),
    content: () => import('@domains/solutions/SolutionsDomain.vue'),
    right: null,
  },
  // 설정 도메인 (리팩토링됨)
  settings: {
    left: () => import('@domains/settings/views/left/SettingsSidebar.vue'),
    content: () => import('@domains/settings/views/content/SettingsContent.vue'),
    right: null,
  },
  // 개발 도구
  dev: {
    left: () => import('@domains/dev/views/DevLeftNav.vue'),
    content: () => import('@domains/dev/DevDomain.vue'),
    right: () => import('@domains/dev/views/DevRightPanel.vue'),
    behavior: {
      autoOpen: true,
      message: '문서를 선택하거나 새로 만드세요.',
    },
  },
  // ERP
  'nexa-erp': {
    left: () => import('@domains/erp/views/left/ErpLeftNav.vue'),
    content: () => import('@domains/erp/ErpDomain.vue'),
    right: () => import('@domains/erp/views/right/ErpRightPanel.vue'),
  },
  // ERP - 부품 관리 (ERP 하위 전용 서브도메인)
  'erp-parts': {
    left: () => import('@domains/erp/views/left/ErpLeftNav.vue'),
    content: () => import('@domains/parts/PartsManagementDomain.vue'),
    right: () => import('@domains/erp/views/right/ErpRightPanel.vue'),
  },
  // 포트폴리오
  portfolio: {
    left: () => import('@domains/portfolio/views/left/PortfolioLeftNav.vue'),
    content: () => import('@domains/portfolio/PortfolioDomain.vue'),
    right: null,
  },
  // 넥사아카이브
  'nexa-archive': {
    left: () => import('@domains/archive/views/left/ArchiveLeftNav.vue'),
    content: () => import('@domains/archive/ArchiveDomain.vue'),
    right: () => import('@domains/archive/views/right/ArchiveRightPanel.vue'),
  },
  // 넥사트레이스
  'nexa-trace': {
    left: () => import('@domains/trace/views/left/TraceLeftNav.vue'),
    content: () => import('@domains/trace/TraceDomain.vue'),
    right: null,
  },
  // NEXA Nexion (지식 데스크 · Vue Flow)
  nexion: {
    left: () => import('@domains/nexion/views/left/NexionLeftNav.vue'),
    content: () => import('@domains/nexion/NexionDomain.vue'),
    right: () => import('@domains/nexion/views/right/NexionRightPanel.vue'),
  },
  // 넥사 AI (Ollama)
  'nexa-ai': {
    left: () => import('@domains/ai/views/left/AiLeftNav.vue'),
    content: () => import('@domains/ai/AiDomain.vue'),
    right: () => import('@domains/ai/views/right/AiRightPanel.vue'),
  },
  // 확장 프로그램
  extension: {
    left: () => import('@domains/extension/views/ExtensionLeftNav.vue'),
    content: () => import('@domains/extension/views/content/ExtensionContent.vue'),
    right: null,
  },
  // 도움말
  help: {
    left: () => import('@domains/help/views/left/HelpLeftNav.vue'),
    content: () => import('@domains/help/views/content/HelpView.vue'),
    right: null,
  },
  // 마이페이지
  my: {
    left: () => import('@domains/my/views/left/MyLeftNav.vue'),
    content: () => import('@domains/my/views/content/MyView.vue'),
    right: null,
  },
  // [NEXA-ADMIN-01] 관리자 도메인 (슈퍼 관리자 전용)
  'nexa-admin': {
    left: () => import('@domains/admin/views/left/AdminLeftNav.vue'),
    content: () => import('@domains/admin/AdminDomain.vue'),
    right: () => import('@domains/admin/views/right/AdminRightPanel.vue'),
  },
}

const DEFAULT_BEHAVIOR: DomainBehavior = {
  autoOpen: false,
  defaultOpen: true,
  saveState: true,
}

export async function getLeftSidebarComponent(domain: string): Promise<Component | null> {
  if (!domainConfigs[domain]?.left) return null
  const module = await domainConfigs[domain].left!()
  return (module as { default?: Component }).default ?? (module as Component)
}

export async function getContentComponent(domain: string): Promise<Component | null> {
  if (!domainConfigs[domain]?.content) return null
  const module = await domainConfigs[domain].content!()
  return (module as { default?: Component }).default ?? (module as Component)
}

export async function getRightSidebarComponent(domain: string): Promise<Component | null> {
  const componentFn = domainConfigs[domain]?.right ?? (() => import('@frame/views/common/DefaultRightPanel.vue'))
  const module = await componentFn()
  return (module as { default?: Component }).default ?? (module as Component)
}

export async function getHeaderActionsComponent(domain: string): Promise<Component | null> {
  if (!domainConfigs[domain]?.headerActions) return null
  const module = await domainConfigs[domain].headerActions!()
  return (module as { default?: Component }).default ?? (module as Component)
}

export function getDomainConfig(domain: string): DomainConfig | null {
  return domainConfigs[domain] ?? null
}

export function getDomainBehavior(domain: string): DomainBehavior {
  const config = domainConfigs[domain]
  return { ...DEFAULT_BEHAVIOR, ...(config?.behavior ?? {}) }
}

export default domainConfigs
