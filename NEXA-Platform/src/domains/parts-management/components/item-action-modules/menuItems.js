/**
 * menuItems.js
 *
 * 관리작업 메뉴 모듈의 메뉴 아이템 정의 (컨텍스트 메뉴용)
 * 기존 모듈 컴포넌트와 동일한 로직을 공유하여 일관성 유지
 */

/**
 * 기본 작업 모듈의 메뉴 아이템 반환
 * @param {Object} params - 파라미터
 * @param {number|string|null} params.selectedRowId - 선택된 행 ID
 * @param {number} params.selectedCount - 선택된 행 개수
 * @returns {Array} 메뉴 아이템 배열
 */
export function getBasicActionsMenuItems({ selectedRowId = null, selectedCount = 0 }) {
  const items = []

  // 위에 끼워넣기
  items.push({
    id: 'insert-above',
    label: '위에 끼워넣기',
    icon: 'arrow_upward',
    action: 'insert-above',
    disabled: selectedCount !== 1,
  })

  // 아래에 끼워넣기
  items.push({
    id: 'insert-below',
    label: '아래에 끼워넣기',
    icon: 'arrow_downward',
    action: 'insert-below',
    disabled: selectedCount !== 1,
  })

  items.push({ separator: true })

  // 편집
  items.push({
    id: 'edit',
    label: '편집',
    icon: 'edit',
    action: 'edit',
    disabled: !selectedRowId || selectedCount > 1,
  })

  // 삭제
  items.push({
    id: 'delete',
    label: selectedCount > 1 ? `일괄 삭제 (${selectedCount}개)` : '삭제',
    icon: 'delete',
    action: 'delete',
    disabled: selectedCount === 0,
  })

  // 순서 변경
  items.push({
    id: 'reorder',
    label: selectedCount > 1 ? `순서 변경 (${selectedCount}개)` : '순서 변경',
    icon: 'swap_vert',
    action: 'reorder',
    disabled: selectedCount === 0,
  })

  // 복제
  items.push({
    id: 'duplicate',
    label: '복제',
    icon: 'content_copy',
    action: 'duplicate',
    disabled: !selectedRowId || selectedCount !== 1, // 단일 선택일 때만 활성화
  })

  return items
}

/**
 * 상태 관리 모듈의 메뉴 아이템 반환
 * @param {Object} params - 파라미터
 * @param {number} params.selectedCount - 선택된 행 개수
 * @param {boolean} params.hasActiveFilter - 활성 필터 여부
 * @param {string} params.activateStatusMenuLabel - 활성화 메뉴 라벨
 * @param {string} params.favoriteMenuItemLabel - 즐겨찾기 메뉴 라벨
 * @returns {Array} 메뉴 아이템 배열
 */
export function getStatusManagementMenuItems({
  selectedCount = 0,
  hasActiveFilter = false,
  activateStatusMenuLabel = '활성화/비활성화',
  favoriteMenuItemLabel = '즐겨찾기',
}) {
  const items = []

  // 활성화/비활성화
  items.push({
    id: 'toggle-activate',
    label: activateStatusMenuLabel,
    icon: 'toggle_on',
    action: 'toggle-activate',
    disabled: selectedCount === 0 && !hasActiveFilter,
  })

  // 즐겨찾기
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
 * @param {Object} params - 파라미터
 * @param {number|string|null} params.selectedRowId - 선택된 행 ID
 * @param {number} params.selectedCount - 선택된 행 개수
 * @returns {Array} 메뉴 아이템 배열
 */
export function getViewMenuItems({ selectedRowId = null, selectedCount = 0 }) {
  const items = []

  // 상세보기
  items.push({
    id: 'view-detail',
    label: '상세보기',
    icon: 'info',
    action: 'view-detail',
    disabled: !selectedRowId || selectedCount > 1,
  })

  // 변경 이력
  items.push({
    id: 'view-history',
    label: '변경 이력',
    icon: 'history',
    action: 'view-history',
    disabled: !selectedRowId || selectedCount > 1,
  })

  // 관련 부품 보기
  items.push({
    id: 'view-related',
    label: '관련 부품 보기',
    icon: 'inventory_2',
    action: 'view-related',
    disabled: !selectedRowId || selectedCount > 1,
  })

  return items
}

/**
 * 출력/내보내기/공유 모듈의 메뉴 아이템 반환
 * @param {Object} params - 파라미터
 * @param {number} params.selectedCount - 선택된 행 개수
 * @param {boolean} params.hasActiveFilter - 활성 필터 여부
 * @param {string} params.printMenuLabel - 인쇄 메뉴 라벨
 * @param {string} params.exportMenuLabel - 내보내기 메뉴 라벨
 * @returns {Array} 메뉴 아이템 배열
 */
export function getPrintExportMenuItems({
  selectedCount = 0,
  hasActiveFilter = false,
  printMenuLabel = '데이터 인쇄',
  exportMenuLabel = '내보내기',
}) {
  const items = []
  const canShare = hasActiveFilter || selectedCount > 0

  // 공유 URL
  items.push({
    id: 'share',
    label: '공유 URL',
    icon: 'share',
    action: 'share',
    disabled: !canShare,
  })

  items.push({ separator: true })

  // QR 코드 출력
  items.push({
    id: 'print-qrcode',
    label: selectedCount > 1 ? `QR 코드 출력 (${selectedCount}개)` : 'QR 코드 출력',
    icon: 'qr_code', // 기존 바코드 아이콘을 QR 코드에 사용
    action: 'print-qrcode',
    disabled: selectedCount === 0,
  })
  // 바코드 출력
  items.push({
    id: 'print-barcode',
    label: selectedCount > 1 ? `바코드 출력 (${selectedCount}개)` : '바코드 출력',
    icon: 'view_column', // 바코드 아이콘 (세로로 긴 줄 형태) - Material Icons에서 "Barcode"로 표시된 아이콘 대체
    action: 'print-barcode',
    disabled: selectedCount === 0,
  })

  // 라벨 출력
  items.push({
    id: 'print-label',
    label: selectedCount > 1 ? `라벨 출력 (${selectedCount}개)` : '라벨 출력',
    icon: 'label',
    action: 'print-label',
    disabled: selectedCount === 0,
  })

  // 데이터 인쇄
  items.push({
    id: 'print-data',
    label: printMenuLabel,
    icon: 'print',
    action: 'print-data',
    disabled: false, // 항상 활성화 (선택/필터 없어도 전체 인쇄 가능)
  })

  // 내보내기
  items.push({
    id: 'export',
    label: exportMenuLabel,
    icon: 'download',
    action: 'export',
    disabled: false,
  })

  return items
}
