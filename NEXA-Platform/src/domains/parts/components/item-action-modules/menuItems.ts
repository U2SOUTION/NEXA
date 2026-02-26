/**
 * menuItems.ts
 *
 * 관리작업 메뉴 모듈의 메뉴 아이템 정의 (컨텍스트 메뉴용)
 * 기존 모듈 컴포넌트와 동일한 로직을 공유하여 일관성 유지
 */

export interface BasicActionsParams {
  selectedRowId?: string | number | null
  selectedCount?: number
}

export interface StatusManagementParams {
  selectedCount?: number
  hasActiveFilter?: boolean
  activateStatusMenuLabel?: string
  favoriteMenuItemLabel?: string
}

export interface ViewMenuParams {
  selectedRowId?: string | number | null
  selectedCount?: number
}

export interface PrintExportParams {
  selectedCount?: number
  hasActiveFilter?: boolean
  printMenuLabel?: string
  exportMenuLabel?: string
}

export interface ContextMenuItem {
  id?: string
  label?: string
  icon?: string
  action?: string
  disabled?: boolean
  separator?: boolean
  shortcut?: string
}

/**
 * 기본 작업 모듈의 메뉴 아이템 반환
 */
export function getBasicActionsMenuItems({
  selectedRowId = null,
  selectedCount = 0,
}: BasicActionsParams = {}): ContextMenuItem[] {
  const items: ContextMenuItem[] = []

  items.push({
    id: 'insert-above',
    label: '위에 끼워넣기',
    icon: 'arrow_upward',
    action: 'insert-above',
    disabled: selectedCount !== 1,
  })

  items.push({
    id: 'insert-below',
    label: '아래에 끼워넣기',
    icon: 'arrow_downward',
    action: 'insert-below',
    disabled: selectedCount !== 1,
  })

  items.push({ separator: true })

  items.push({
    id: 'edit',
    label: '편집',
    icon: 'edit',
    action: 'edit',
    disabled: !selectedRowId || (selectedCount ?? 0) > 1,
  })

  items.push({
    id: 'delete',
    label: (selectedCount ?? 0) > 1 ? `일괄 삭제 (${selectedCount}개)` : '삭제',
    icon: 'delete',
    action: 'delete',
    disabled: (selectedCount ?? 0) === 0,
  })

  items.push({
    id: 'reorder',
    label: (selectedCount ?? 0) > 1 ? `순서 변경 (${selectedCount}개)` : '순서 변경',
    icon: 'swap_vert',
    action: 'reorder',
    disabled: (selectedCount ?? 0) === 0,
  })

  items.push({
    id: 'duplicate',
    label: '복제',
    icon: 'content_copy',
    action: 'duplicate',
    disabled: !selectedRowId || selectedCount !== 1,
  })

  return items
}

/**
 * 상태 관리 모듈의 메뉴 아이템 반환
 */
export function getStatusManagementMenuItems({
  selectedCount = 0,
  hasActiveFilter = false,
  activateStatusMenuLabel = '활성화/비활성화',
  favoriteMenuItemLabel = '즐겨찾기',
}: StatusManagementParams = {}): ContextMenuItem[] {
  const items: ContextMenuItem[] = []

  items.push({
    id: 'toggle-activate',
    label: activateStatusMenuLabel,
    icon: 'toggle_on',
    action: 'toggle-activate',
    disabled: selectedCount === 0 && !hasActiveFilter,
  })

  items.push({
    id: 'toggle-favorite',
    label: favoriteMenuItemLabel,
    icon: 'star_border',
    action: 'toggle-favorite',
    disabled: selectedCount === 0,
  })

  return items
}

/**
 * 조회 모듈의 메뉴 아이템 반환
 */
export function getViewMenuItems({
  selectedRowId = null,
  selectedCount = 0,
}: ViewMenuParams = {}): ContextMenuItem[] {
  const items: ContextMenuItem[] = []

  items.push({
    id: 'view-detail',
    label: '상세보기',
    icon: 'info',
    action: 'view-detail',
    disabled: !selectedRowId || (selectedCount ?? 0) > 1,
  })

  items.push({
    id: 'view-history',
    label: '변경 이력',
    icon: 'history',
    action: 'view-history',
    disabled: !selectedRowId || (selectedCount ?? 0) > 1,
  })

  items.push({
    id: 'view-related',
    label: '관련 부품 보기',
    icon: 'inventory_2',
    action: 'view-related',
    disabled: !selectedRowId || (selectedCount ?? 0) > 1,
  })

  return items
}

/**
 * 출력/내보내기/공유 모듈의 메뉴 아이템 반환
 */
export function getPrintExportMenuItems({
  selectedCount = 0,
  hasActiveFilter = false,
  printMenuLabel = '데이터 인쇄',
  exportMenuLabel = '내보내기',
}: PrintExportParams = {}): ContextMenuItem[] {
  const items: ContextMenuItem[] = []
  const canShare = hasActiveFilter || selectedCount > 0

  items.push({
    id: 'share',
    label: '공유 URL',
    icon: 'share',
    action: 'share',
    disabled: !canShare,
  })

  items.push({ separator: true })

  items.push({
    id: 'print-qrcode',
    label: selectedCount > 1 ? `QR 코드 출력 (${selectedCount}개)` : 'QR 코드 출력',
    icon: 'qr_code',
    action: 'print-qrcode',
    disabled: selectedCount === 0,
  })

  items.push({
    id: 'print-barcode',
    label: selectedCount > 1 ? `바코드 출력 (${selectedCount}개)` : '바코드 출력',
    icon: 'view_column',
    action: 'print-barcode',
    disabled: selectedCount === 0,
  })

  items.push({
    id: 'print-label',
    label: selectedCount > 1 ? `라벨 출력 (${selectedCount}개)` : '라벨 출력',
    icon: 'label',
    action: 'print-label',
    disabled: selectedCount === 0,
  })

  items.push({
    id: 'print-data',
    label: printMenuLabel,
    icon: 'print',
    action: 'print-data',
    disabled: false,
  })

  items.push({
    id: 'export',
    label: exportMenuLabel,
    icon: 'download',
    action: 'export',
    disabled: false,
  })

  return items
}
