/**
 * ContextMenuSetting.js
 *
 * 설정 페이지 전용 컨텍스트 메뉴 아이템 정의
 *
 * 사용법:
 * ```javascript
 * import { getSettingsContextMenuItems } from '@/settings/ContextMenuSetting'
 *
 * const items = getSettingsContextMenuItems({
 *   selectedTab: 'theme',
 *   context: { mode: 'settings' }
 * })
 * ```
 */

/**
 * 설정 페이지 컨텍스트 메뉴 아이템 생성
 * @param {Object} params - 파라미터
 * @param {string} params.selectedTab - 현재 선택된 탭 ('theme' | 'layout' | 'iot' | 'system')
 * @param {Object} params.context - 추가 컨텍스트 정보 (향후 사용 예정)
 * @returns {Array} 메뉴 아이템 배열
 */
export function getSettingsContextMenuItems({ selectedTab = null, context: _context = {} }) {
  void _context
  const items = []

  // 탭별 메뉴
  if (selectedTab) {
    items.push(
      {
        id: 'reset-tab',
        label: `${getTabLabel(selectedTab)} 설정 초기화`,
        icon: 'refresh',
        action: 'reset-tab',
      },
      { separator: true },
    )
  }

  // 공통 메뉴
  items.push(
    {
      id: 'reset-all',
      label: '모든 설정 초기화',
      icon: 'restart_alt',
      action: 'reset-all',
      danger: true,
    },
    {
      id: 'export-settings',
      label: '설정 내보내기',
      icon: 'download',
      action: 'export-settings',
    },
    {
      id: 'import-settings',
      label: '설정 가져오기',
      icon: 'upload',
      action: 'import-settings',
    },
    { separator: true },
    {
      id: 'refresh',
      label: '새로고침',
      icon: 'refresh',
      action: 'refresh',
      shortcut: 'F5',
    },
  )

  return items
}

type SettingsTab = 'theme' | 'layout' | 'iot' | 'system'

/**
 * 탭 라벨 가져오기
 * @param tab - 탭 이름
 * @returns 탭 라벨
 */
function getTabLabel(tab: SettingsTab | string): string {
  const labels: Record<string, string> = {
    theme: '테마',
    layout: '레이아웃',
    iot: 'IOT',
    system: '시스템',
  }
  return labels[tab] ?? tab
}

