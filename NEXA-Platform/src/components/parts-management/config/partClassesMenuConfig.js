/**
 * PartClassesView 메뉴 아이템 설정
 * 작업 메뉴, 추가 메뉴 등의 아이템 정의
 *
 * 이 파일은 PartClassesView의 메뉴 구조를 중앙에서 관리하여
 * 코드 중복을 줄이고 유지보수를 용이하게 합니다.
 */

/**
 * 추가 메뉴 아이템 설정
 * "분류추가" 드롭다운 메뉴의 아이템들
 */
export const addActionMenuItems = [
  {
    id: 'add-to-top',
    label: '전체목록 상단 추가',
    icon: 'vertical_align_top',
    action: 'handleAddToTop',
    disabled: () => false, // 항상 활성화
  },
  {
    id: 'insert-above',
    label: '선택상단 끼워넣기',
    icon: 'arrow_upward',
    action: 'handleInsertAbove',
    disabled: (context) => context.selectedCount !== 1, // 선택된 항목이 1개가 아니면 비활성화
  },
  {
    id: 'insert-below',
    label: '선택하단 끼워넣기',
    icon: 'arrow_downward',
    action: 'handleInsertBelow',
    disabled: (context) => context.selectedCount !== 1, // 선택된 항목이 1개가 아니면 비활성화
  },
  {
    id: 'add-to-bottom',
    label: '전체목록 하단 추가',
    icon: 'vertical_align_bottom',
    action: 'handleAddToBottom',
    disabled: () => false, // 항상 활성화
  },
]

/**
 * 작업 메뉴의 추가 아이템들 (BasicActionsModule, StatusManagementModule 등 외)
 * 위치 정보, 재고, 부품함 관련 메뉴 아이템
 */
export const workActionAdditionalItems = [
  {
    id: 'location-info',
    label: '위치 정보 관리',
    icon: 'location_on',
    disabled: (context) => !context.selectedRowId,
    separator: true, // 위에 구분선 추가
  },
  {
    id: 'location-move',
    label: '위치 이동',
    icon: 'drive_file_move',
    disabled: (context) => !context.selectedRowId,
  },
  {
    id: 'location-duplicate',
    label: '위치 복제',
    icon: 'content_copy',
    disabled: (context) => !context.selectedRowId,
    separator: true,
  },
  {
    id: 'inventory-check',
    label: '재고 확인',
    icon: 'inventory',
    disabled: (context) => !context.selectedRowId,
  },
  {
    id: 'part-status-change',
    label: '부품 상태 변경',
    icon: 'toggle_on',
    disabled: (context) => !context.selectedRowId,
  },
  {
    id: 'part-activate-toggle',
    label: '부품 활성화/비활성화',
    icon: 'power_settings_new',
    disabled: (context) => !context.selectedRowId,
    separator: true,
  },
  {
    id: 'bin-list',
    label: '부품함 목록 보기',
    icon: 'view_list',
    disabled: (context) => !context.selectedRowId,
  },
  {
    id: 'bin-history',
    label: '부품함 이력',
    icon: 'history',
    disabled: (context) => !context.selectedRowId,
  },
  {
    id: 'bin-statistics',
    label: '부품함 통계',
    icon: 'bar_chart',
    disabled: (context) => !context.selectedRowId,
    separator: true,
  },
  {
    id: 'bin-template',
    label: '부품함 템플릿 생성',
    icon: 'description',
    disabled: (context) => !context.selectedRowId,
  },
  {
    id: 'batch-work',
    label: '일괄 작업',
    icon: 'playlist_add_check',
    disabled: (context) => !context.selectedRowId,
    separator: true,
  },
  {
    id: 'reinitialize-sort',
    label: '순서 재정렬 (10단위)',
    icon: 'sort',
    caption: '모든 항목을 10, 20, 30... 으로 재정렬',
    disabled: () => false, // 항상 활성화
    action: 'reinitializeSortOrder',
  },
]

/**
 * 메뉴 아이템 렌더링 헬퍼 함수
 * @param {Array} items - 메뉴 아이템 배열
 * @param {object} context - 컨텍스트 (selectedRowId, selectedCount 등)
 * @returns {Array} 필터링 및 정렬된 메뉴 아이템 배열
 */
export function getMenuItems(items, context = {}) {
  return items
    .map((item, index) => {
      const isDisabled = item.disabled ? item.disabled(context) : false
      return {
        ...item,
        index,
        isDisabled,
      }
    })
    .filter((item) => item !== null)
}

/**
 * 메뉴 아이템을 그룹으로 분리 (separator 기준)
 * @param {Array} items - 메뉴 아이템 배열
 * @returns {Array} 그룹화된 메뉴 아이템 배열
 */
export function groupMenuItemsBySeparator(items) {
  const groups = []
  let currentGroup = []

  items.forEach((item) => {
    if (item.separator && currentGroup.length > 0) {
      groups.push(currentGroup)
      currentGroup = []
    }
    currentGroup.push(item)
  })

  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }

  return groups
}
