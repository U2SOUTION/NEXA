/**
 * partsManagementContextMenu.ts
 *
 * 부품관리 페이지 전용 컨텍스트 메뉴 아이템 정의
 * 기존 관리작업 메뉴 모듈을 재사용하여 일관성 유지
 */

import {
  getBasicActionsMenuItems,
  getStatusManagementMenuItems,
  getViewMenuItems,
  getPrintExportMenuItems,
} from '../item-action-modules/menuItems'
import type { ContextMenuItem } from '../item-action-modules/menuItems'

export interface PartClassesContextMenuParams {
  selectedRow?: unknown
  selectedRows?: unknown[]
  selectedRowId?: string | number | null
  selectedCount?: number
  hasActiveFilter?: boolean
  activateStatusMenuLabel?: string
  favoriteMenuItemLabel?: string
  printMenuLabel?: string
  exportMenuLabel?: string
  disabledMenuItemColor?: string
  context?: Record<string, unknown>
}

/**
 * 부품 분류 컨텍스트 메뉴 아이템 생성
 */
export function getPartClassesContextMenuItems({
  selectedRowId = null,
  selectedRows = [],
  selectedCount = 0,
  hasActiveFilter = false,
  activateStatusMenuLabel = '활성화/비활성화',
  favoriteMenuItemLabel = '즐겨찾기',
  printMenuLabel = '데이터 인쇄',
  exportMenuLabel = '내보내기',
}: PartClassesContextMenuParams = {}): ContextMenuItem[] {
  const items: ContextMenuItem[] = []

  if (selectedCount === 0) {
    items.push(
      {
        id: 'add-to-top',
        label: '전체목록 상단 추가',
        icon: 'vertical_align_top',
        action: 'add-to-top',
      },
      {
        id: 'add-to-bottom',
        label: '전체목록 하단 추가',
        icon: 'vertical_align_bottom',
        action: 'add-to-bottom',
      },
      { separator: true },
      {
        id: 'refresh',
        label: '새로고침',
        icon: 'refresh',
        action: 'refresh',
        shortcut: 'F5',
      },
      { separator: true },
    )
    const printExport = getPrintExportMenuItems({
      selectedCount: 0,
      hasActiveFilter,
      printMenuLabel,
      exportMenuLabel,
    })
    items.push(...printExport)
    return items
  }

  items.push(
    {
      id: 'add-to-top',
      label: '전체목록 상단 추가',
      icon: 'vertical_align_top',
      action: 'add-to-top',
      disabled: false,
    },
    {
      id: 'add-to-bottom',
      label: '전체목록 하단 추가',
      icon: 'vertical_align_bottom',
      action: 'add-to-bottom',
      disabled: false,
    },
  )
  items.push({ separator: true })
  items.push(
    ...getBasicActionsMenuItems({ selectedRowId, selectedCount }),
  )
  items.push({ separator: true })
  items.push(
    ...getStatusManagementMenuItems({
      selectedCount,
      hasActiveFilter,
      activateStatusMenuLabel,
      favoriteMenuItemLabel,
    }),
  )
  items.push({ separator: true })
  items.push(...getViewMenuItems({ selectedRowId, selectedCount }))
  items.push({ separator: true })
  items.push(
    ...getPrintExportMenuItems({
      selectedCount,
      hasActiveFilter,
      printMenuLabel,
      exportMenuLabel,
    }),
  )
  items.push({ separator: true })
  items.push(
    {
      id: 'location-info',
      label: '위치 정보 관리',
      icon: 'location_on',
      action: 'location-info',
      disabled: !selectedRowId,
    },
    {
      id: 'location-move',
      label: '위치 이동',
      icon: 'drive_file_move',
      action: 'location-move',
      disabled: !selectedRowId,
    },
    {
      id: 'location-duplicate',
      label: '위치 복제',
      icon: 'content_copy',
      action: 'location-duplicate',
      disabled: !selectedRowId,
    },
  )
  items.push({ separator: true })
  items.push({
    id: 'inventory',
    label: '재고 관리',
    icon: 'inventory',
    action: 'inventory',
    disabled: !selectedRowId,
  })

  return items
}

/**
 * 부품 모델 컨텍스트 메뉴 아이템 생성 (향후 확장용)
 */
export function getPartModelsContextMenuItems(
  params: PartClassesContextMenuParams = {},
): ContextMenuItem[] {
  return getPartClassesContextMenuItems(params)
}

/**
 * 부품 스펙 컨텍스트 메뉴 아이템 생성 (향후 확장용)
 */
export function getPartSpecsContextMenuItems(
  params: PartClassesContextMenuParams = {},
): ContextMenuItem[] {
  return getPartClassesContextMenuItems(params)
}
