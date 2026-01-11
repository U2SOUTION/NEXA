/**
 * partsManagementContextMenu.js
 *
 * 부품관리 페이지 전용 컨텍스트 메뉴 아이템 정의
 * 기존 관리작업 메뉴 모듈을 재사용하여 일관성 유지
 *
 * 사용법:
 * ```javascript
 * import { getPartClassesContextMenuItems } from '@/components/context-menu-items/partsManagementContextMenu'
 *
 * const items = getPartClassesContextMenuItems({
 *   selectedRow: row,
 *   selectedRows: [row],
 *   selectedRowId: row.id,
 *   selectedCount: 1,
 *   hasActiveFilter: false,
 *   activateStatusMenuLabel: '활성화',
 *   favoriteMenuItemLabel: '즐겨찾기',
 *   printMenuLabel: '데이터 인쇄',
 *   exportMenuLabel: '내보내기',
 *   disabledMenuItemColor: '#777777',
 * })
 * ```
 */

import {
  getBasicActionsMenuItems,
  getStatusManagementMenuItems,
  getViewMenuItems,
  getPrintExportMenuItems,
} from '../item-action-modules/menuItems'

/**
 * 부품 분류 컨텍스트 메뉴 아이템 생성
 * @param {Object} params - 파라미터
 * @param {Object} params.selectedRow - 선택된 행 데이터 (단일 선택 시)
 * @param {Array} params.selectedRows - 선택된 행 데이터 배열 (복수 선택 시)
 * @param {number|string|null} params.selectedRowId - 선택된 행 ID
 * @param {number} params.selectedCount - 선택된 행 개수
 * @param {boolean} params.hasActiveFilter - 활성 필터 여부
 * @param {string} params.activateStatusMenuLabel - 활성화 메뉴 라벨
 * @param {string} params.favoriteMenuItemLabel - 즐겨찾기 메뉴 라벨
 * @param {string} params.printMenuLabel - 인쇄 메뉴 라벨
 * @param {string} params.exportMenuLabel - 내보내기 메뉴 라벨
 * @param {string} params.disabledMenuItemColor - 비활성화 메뉴 색상
 * @param {Object} params.context - 추가 컨텍스트 정보 (향후 사용 예정)
 * @returns {Array} 메뉴 아이템 배열
 */
/* eslint-disable no-unused-vars */
export function getPartClassesContextMenuItems({
  selectedRow: _selectedRow = null,
  selectedRows: _selectedRows = [],
  selectedRowId = null,
  selectedCount = 0,
  hasActiveFilter = false,
  activateStatusMenuLabel = '활성화/비활성화',
  favoriteMenuItemLabel = '즐겨찾기',
  printMenuLabel = '데이터 인쇄',
  exportMenuLabel = '내보내기',
  disabledMenuItemColor: _disabledMenuItemColor = '#777777',
  context: _context = {},
}) {
  /* eslint-enable no-unused-vars */
  const items = []

  // 선택이 없을 때 (빈 영역 우클릭)
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

    // 출력/내보내기/공유 모듈 (선택이 없을 때도 표시)
    const printExport = getPrintExportMenuItems({
      selectedCount: 0,
      hasActiveFilter,
      printMenuLabel,
      exportMenuLabel,
    })
    items.push(...printExport)

    return items
  }

  // 추가 메뉴 (선택이 있을 때)
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

  // 기본 작업 모듈
  const basicActions = getBasicActionsMenuItems({
    selectedRowId,
    selectedCount,
  })
  items.push(...basicActions)

  items.push({ separator: true })

  // 상태 관리 모듈
  const statusManagement = getStatusManagementMenuItems({
    selectedCount,
    hasActiveFilter,
    activateStatusMenuLabel,
    favoriteMenuItemLabel,
  })
  items.push(...statusManagement)

  items.push({ separator: true })

  // 조회 모듈
  const viewItems = getViewMenuItems({
    selectedRowId,
    selectedCount,
  })
  items.push(...viewItems)

  items.push({ separator: true })

  // 출력/내보내기/공유 모듈
  const printExport = getPrintExportMenuItems({
    selectedCount,
    hasActiveFilter,
    printMenuLabel,
    exportMenuLabel,
  })
  items.push(...printExport)

  items.push({ separator: true })

  // 위치 정보 관리
  items.push({
    id: 'location-info',
    label: '위치 정보 관리',
    icon: 'location_on',
    action: 'location-info',
    disabled: !selectedRowId,
  })

  // 위치 이동
  items.push({
    id: 'location-move',
    label: '위치 이동',
    icon: 'drive_file_move',
    action: 'location-move',
    disabled: !selectedRowId,
  })

  // 위치 복제
  items.push({
    id: 'location-duplicate',
    label: '위치 복제',
    icon: 'content_copy',
    action: 'location-duplicate',
    disabled: !selectedRowId,
  })

  items.push({ separator: true })

  // 재고 관리
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
export function getPartModelsContextMenuItems({
  selectedRow = null,
  selectedRows = [],
  context = {},
}) {
  // TODO: 부품 모델 전용 메뉴 아이템 정의
  return getPartClassesContextMenuItems({ selectedRow, selectedRows, context })
}

/**
 * 부품 스펙 컨텍스트 메뉴 아이템 생성 (향후 확장용)
 */
export function getPartSpecsContextMenuItems({
  selectedRow = null,
  selectedRows = [],
  context = {},
}) {
  // TODO: 부품 스펙 전용 메뉴 아이템 정의
  return getPartClassesContextMenuItems({ selectedRow, selectedRows, context })
}
