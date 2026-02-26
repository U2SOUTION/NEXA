/**
 * PartClassesView 메뉴 아이템 설정
 * 작업 메뉴, 추가 메뉴 등의 아이템 정의
 */

export interface MenuItemContext {
  selectedRowId?: string | number | null
  selectedCount?: number
  [key: string]: unknown
}

export interface AddActionMenuItem {
  id: string
  label: string
  icon: string
  action: string
  disabled: (context: MenuItemContext) => boolean
  separator?: boolean
}

export interface WorkActionMenuItem {
  id: string
  label: string
  icon: string
  disabled: (context: MenuItemContext) => boolean
  separator?: boolean
  caption?: string
  action?: string
}

export const addActionMenuItems: AddActionMenuItem[] = [
  { id: 'add-to-top', label: '전체목록 상단 추가', icon: 'vertical_align_top', action: 'handleAddToTop', disabled: () => false },
  { id: 'insert-above', label: '선택상단 끼워넣기', icon: 'arrow_upward', action: 'handleInsertAbove', disabled: (ctx) => ctx.selectedCount !== 1 },
  { id: 'insert-below', label: '선택하단 끼워넣기', icon: 'arrow_downward', action: 'handleInsertBelow', disabled: (ctx) => ctx.selectedCount !== 1 },
  { id: 'add-to-bottom', label: '전체목록 하단 추가', icon: 'vertical_align_bottom', action: 'handleAddToBottom', disabled: () => false },
]

export const workActionAdditionalItems: WorkActionMenuItem[] = [
  { id: 'location-info', label: '위치 정보 관리', icon: 'location_on', disabled: (ctx) => !ctx.selectedRowId, separator: true },
  { id: 'location-move', label: '위치 이동', icon: 'drive_file_move', disabled: (ctx) => !ctx.selectedRowId },
  { id: 'location-duplicate', label: '위치 복제', icon: 'content_copy', disabled: (ctx) => !ctx.selectedRowId, separator: true },
  { id: 'inventory-check', label: '재고 확인', icon: 'inventory', disabled: (ctx) => !ctx.selectedRowId },
  { id: 'part-status-change', label: '부품 상태 변경', icon: 'toggle_on', disabled: (ctx) => !ctx.selectedRowId },
  { id: 'part-activate-toggle', label: '부품 활성화/비활성화', icon: 'power_settings_new', disabled: (ctx) => !ctx.selectedRowId, separator: true },
  { id: 'bin-list', label: '부품함 목록 보기', icon: 'view_list', disabled: (ctx) => !ctx.selectedRowId },
  { id: 'bin-history', label: '부품함 이력', icon: 'history', disabled: (ctx) => !ctx.selectedRowId },
  { id: 'bin-statistics', label: '부품함 통계', icon: 'bar_chart', disabled: (ctx) => !ctx.selectedRowId, separator: true },
  { id: 'bin-template', label: '부품함 템플릿 생성', icon: 'description', disabled: (ctx) => !ctx.selectedRowId },
  { id: 'batch-work', label: '일괄 작업', icon: 'playlist_add_check', disabled: (ctx) => !ctx.selectedRowId, separator: true },
  { id: 'reinitialize-sort', label: '순서 재정렬 (10단위)', icon: 'sort', caption: '모든 항목을 10, 20, 30... 으로 재정렬', disabled: () => false, action: 'reinitializeSortOrder' },
]

export type MenuItemWithDisabled = (AddActionMenuItem | WorkActionMenuItem) & { index: number; isDisabled: boolean }

export function getMenuItems(
  items: (AddActionMenuItem | WorkActionMenuItem)[],
  context: MenuItemContext = {},
): MenuItemWithDisabled[] {
  return items
    .map((item, index) => ({
      ...item,
      index,
      isDisabled: item.disabled ? item.disabled(context) : false,
    }))
    .filter((x): x is MenuItemWithDisabled => x != null)
}

export function groupMenuItemsBySeparator(
  items: (AddActionMenuItem | WorkActionMenuItem)[],
): (AddActionMenuItem | WorkActionMenuItem)[][] {
  const groups: (AddActionMenuItem | WorkActionMenuItem)[][] = []
  let currentGroup: (AddActionMenuItem | WorkActionMenuItem)[] = []
  items.forEach((item) => {
    if (item.separator && currentGroup.length > 0) {
      groups.push(currentGroup)
      currentGroup = []
    }
    currentGroup.push(item)
  })
  if (currentGroup.length > 0) groups.push(currentGroup)
  return groups
}
