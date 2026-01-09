/**
 * NEXA 도메인 인터콤 (Standard Interface)
 * - 각 도메인이 시스템 레이어와 소통하기 위한 표준 API
 * - 도메인의 생명주기 및 상태 보고를 중앙에서 관제
 */
import { useDashboardLayoutStore } from '@system/store/dashboardLayoutStore'
import { useEventBus } from './useEventBus'

export function useDomainIntercom(domainName: string) {
  const layoutStore = useDashboardLayoutStore()
  const { emit, useListener } = useEventBus()

  /**
   * 도메인 활성화 보고
   */
  function reportActive() {
    console.log(`[Intercom] Domain ${domainName} is now active`)
    emit('system:domain-activated', { domain: domainName })
  }

  /**
   * 도메인 상태 변경 보고
   */
  function reportState(state: any) {
    emit(`domain:${domainName}:state-changed`, state)
  }

  /**
   * 시스템 레이아웃 제어 요청
   */
  function setSidebarOpen(side: 'left' | 'right', isOpen: boolean) {
    if (side === 'left') {
      layoutStore.mainNavigationOpen = isOpen
    } else {
      // right drawer toggle logic (UserSettingsStore 연동 필요)
    }
  }

  return {
    reportActive,
    reportState,
    setSidebarOpen,
    onSystemEvent: useListener
  }
}
