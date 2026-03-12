/**
 * useContextMenu.js
 *
 * 컨텍스트 메뉴의 모든 로직 통합 (설정 + 유틸리티 + 상태 관리)
 *
 * 사용법:
 * ```javascript
 * import { useContextMenu } from '@system/composables/useContextMenu'
 *
 * const { showContextMenu, hideContextMenu, contextMenuState } = useContextMenu()
 *
 * // 메뉴 표시
 * showContextMenu(event, menuItems)
 *
 * // 메뉴 숨기기
 * hideContextMenu()
 * ```
 */

import { ref } from 'vue'

// ===== 설정 상수 =====

// 기본 설정 (향후 애니메이션/z-index 적용 시 사용)
const _DEFAULT_ANIMATION_DURATION = 200
const _DEFAULT_Z_INDEX = 9999
const MENU_PADDING = 8

// 키보드 단축키 (향후 사용 예정)
const _KEYBOARD_SHORTCUTS = {
  CLOSE: 'Escape',
  ENTER: 'Enter',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
}
void _DEFAULT_ANIMATION_DURATION
void _DEFAULT_Z_INDEX
void _KEYBOARD_SHORTCUTS

// 스타일 설정
const STYLES = {
  MIN_WIDTH: 200,
  MAX_WIDTH: 400,
  ITEM_HEIGHT: 36,
  SEPARATOR_HEIGHT: 8,
}

// ===== 유틸리티 함수 =====

/**
 * 메뉴 위치 계산 (화면 경계 처리)
 * @param {MouseEvent} event - 마우스 이벤트
 * @param {number} menuWidth - 메뉴 너비
 * @param {number} menuHeight - 메뉴 높이
 * @returns {{x: number, y: number}} 계산된 위치
 */
function calculateMenuPosition(
  event: MouseEvent,
  menuWidth = STYLES.MIN_WIDTH,
  menuHeight = 200
): { x: number; y: number } {
  const x = event.clientX
  const y = event.clientY
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  let finalX = x
  let finalY = y

  // 오른쪽 경계 체크
  if (x + menuWidth > windowWidth) {
    finalX = windowWidth - menuWidth - MENU_PADDING
    if (finalX < 0) finalX = MENU_PADDING
  }

  // 아래쪽 경계 체크
  if (y + menuHeight > windowHeight) {
    finalY = windowHeight - menuHeight - MENU_PADDING
    if (finalY < 0) finalY = MENU_PADDING
  }

  // 왼쪽 경계 체크
  if (finalX < MENU_PADDING) {
    finalX = MENU_PADDING
  }

  // 위쪽 경계 체크
  if (finalY < MENU_PADDING) {
    finalY = MENU_PADDING
  }

  return { x: finalX, y: finalY }
}

/**
 * 메뉴 아이템 검증
 * @param {Array} items - 메뉴 아이템 배열
 * @returns {boolean} 유효성 여부
 */
function validateMenuItems(items: unknown[]): boolean {
  if (!Array.isArray(items)) {
    console.warn('[useContextMenu] items must be an array')
    return false
  }

  for (const item of items) {
    const it = item as Record<string, unknown>
    if (it.separator) continue

    if (!it.id) {
      console.warn('[useContextMenu] menu item must have an id', item)
      return false
    }

    if (!it.label && !it.separator) {
      console.warn('[useContextMenu] menu item must have a label', item)
      return false
    }

    if (!it.action && !it.separator) {
      console.warn('[useContextMenu] menu item must have an action', item)
      return false
    }
  }

  return true
}

/**
 * 메뉴 아이템 필터링 (권한, 조건부 표시)
 * @param {Array} items - 메뉴 아이템 배열
 * @param {Object} context - 컨텍스트 정보
 * @returns {Array} 필터링된 아이템 배열
 */
function filterMenuItems(
  items: unknown[],
  context: Record<string, unknown> = {}
): unknown[] {
  if (!Array.isArray(items)) return []

  return items.filter((item: unknown) => {
    const it = item as Record<string, unknown>
    // 구분선은 항상 표시
    if (it.separator) return true

    // visible 속성 확인
    if (it.visible === false) return false
    if (typeof it.visible === 'function') {
      return (it.visible as (i: unknown, c: Record<string, unknown>) => boolean)(item, context)
    }

    return true
  })
}

/**
 * 메뉴 아이템 정렬 (선택적)
 * @param {Array} items - 메뉴 아이템 배열
 * @returns {Array} 정렬된 아이템 배열
 */
function sortMenuItems(items: unknown[]): unknown[] {
  // 현재는 정렬하지 않음 (향후 필요 시 구현)
  return items
}

// ===== Composable =====

/**
 * 컨텍스트 메뉴 Composable
 * @returns {Object} 컨텍스트 메뉴 관련 함수 및 상태
 */
export function useContextMenu() {
  // 상태
  const visible = ref(false)
  const position = ref({ x: 0, y: 0 })
  const items = ref<unknown[]>([])

  // 상태 객체 (computed로 반환)
  const contextMenuState = {
    visible,
    position,
    items,
  }

  /**
   * 컨텍스트 메뉴 표시
   * @param {MouseEvent} event - 마우스 이벤트
   * @param {Array} menuItems - 메뉴 아이템 배열
   */
  function showContextMenu(event: MouseEvent, menuItems: unknown[] = []) {
    if (!event) {
      console.warn('[useContextMenu] event is required')
      return
    }

    // 메뉴 아이템 검증
    if (!validateMenuItems(menuItems)) {
      console.warn('[useContextMenu] invalid menu items')
      return
    }

    // 메뉴 아이템 필터링 및 정렬
    const filteredItems = filterMenuItems(menuItems)
    const sortedItems = sortMenuItems(filteredItems)

    // 위치 계산 (임시로 기본 크기 사용, 실제로는 메뉴 렌더링 후 정확한 크기로 재계산 필요)
    const calculatedPosition = calculateMenuPosition(event, STYLES.MIN_WIDTH, 200)

    // 상태 업데이트
    items.value = sortedItems
    position.value = calculatedPosition
    visible.value = true
  }

  /**
   * 컨텍스트 메뉴 숨기기
   */
  function hideContextMenu() {
    visible.value = false
    // 상태는 유지 (재사용을 위해)
  }

  return {
    showContextMenu,
    hideContextMenu,
    contextMenuState,
    // 유틸리티 함수도 export (필요 시)
    calculateMenuPosition,
    validateMenuItems,
    filterMenuItems,
    sortMenuItems,
  }
}

