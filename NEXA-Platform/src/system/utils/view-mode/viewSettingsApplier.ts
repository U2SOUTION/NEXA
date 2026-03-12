/**
 * viewSettingsApplier.js
 * 뷰 설정 적용 유틸리티 (모든 뷰 모드 통합)
 *
 * 각 뷰 모드의 설정을 적용하는 함수들을 통합 관리합니다.
 * 테이블 뷰, 카드 뷰, 리스트 뷰 등 모든 뷰 모드의 설정 적용 로직을 포함합니다.
 */

// ============================================
// 테이블 뷰 설정 적용 함수
// ============================================

/**
 * 테이블 뷰 설정을 기본 컬럼 정의에 적용합니다.
 * @param {Array} baseColumns - 기본 컬럼 정의 배열
 * @param {Object} settings - 테이블 뷰 설정 객체
 * @returns {Array} 설정이 적용된 컬럼 배열
 */
export function applyTableViewSettings(baseColumns: Array<{ name: string }>, settings: { visibleColumns?: string[]; columnOrder?: string[]; columnWidths?: Record<string, number>; stickyColumns?: string[] }) {
  if (!baseColumns || !Array.isArray(baseColumns)) {
    return []
  }

  if (!settings) {
    return baseColumns
  }

  let columns = [...baseColumns]

  columns = filterVisibleColumns(columns, settings.visibleColumns ?? [])
  columns = reorderColumns(columns, settings.columnOrder ?? [])
  columns = applyColumnWidths(columns, settings.columnWidths ?? {})
  const sticky = settings.stickyColumns && typeof settings.stickyColumns === 'object' && !Array.isArray(settings.stickyColumns) ? settings.stickyColumns : { left: [], right: [] }
  columns = applyStickyColumns(columns, sticky)

  return columns
}

/**
 * 표시할 컬럼만 필터링합니다.
 * @param {Array} columns - 컬럼 정의 배열
 * @param {Array} visibleColumns - 표시할 컬럼 이름 배열 (빈 배열이면 모두 표시)
 * @returns {Array} 필터링된 컬럼 배열
 */
export function filterVisibleColumns(columns: Array<{ name: string }>, visibleColumns: string[]) {
  if (!columns || !Array.isArray(columns)) {
    return []
  }

  // visibleColumns가 빈 배열이거나 없으면 모든 컬럼 표시
  if (!visibleColumns || visibleColumns.length === 0) {
    return columns
  }

  return columns.filter((col) => visibleColumns.includes(col.name))
}

/**
 * 컬럼 순서를 재정렬합니다.
 * @param {Array} columns - 컬럼 정의 배열
 * @param {Array} columnOrder - 컬럼 순서 배열 (빈 배열이면 기본 순서 유지)
 * @returns {Array} 재정렬된 컬럼 배열
 */
export function reorderColumns(columns: Array<{ name: string }>, columnOrder: string[]) {
  if (!columns || !Array.isArray(columns)) {
    return []
  }

  // columnOrder가 빈 배열이거나 없으면 기본 순서 유지
  if (!columnOrder || columnOrder.length === 0) {
    return columns
  }

  // columnOrder에 있는 컬럼만 순서대로 정렬
  const orderedColumns: Array<{ name: string }> = []
  const columnMap = new Map(columns.map((col: { name: string }) => [col.name, col]))

  // columnOrder 순서대로 추가
  columnOrder.forEach((colName: string) => {
    const col = columnMap.get(colName)
    if (col) {
      orderedColumns.push(col)
      columnMap.delete(colName)
    }
  })

  // columnOrder에 없는 컬럼은 뒤에 추가
  columnMap.forEach((col: { name: string }) => {
    orderedColumns.push(col)
  })

  return orderedColumns
}

/**
 * 컬럼 너비를 적용합니다.
 * @param {Array} columns - 컬럼 정의 배열
 * @param {Object} columnWidths - 컬럼 너비 설정 객체 { columnName: number } (px 단위)
 * @returns {Array} 너비가 적용된 컬럼 배열
 */
export function applyColumnWidths(columns: Array<{ name: string; width?: string; style?: Record<string, unknown> }>, columnWidths: Record<string, number>) {
  if (!columns || !Array.isArray(columns)) {
    return []
  }

  if (!columnWidths || typeof columnWidths !== 'object') {
    return columns
  }

  return columns.map((col) => {
    const width = columnWidths[col.name]
    
    // 너비가 설정되지 않은 경우: 자동 배분 (width 속성 제거)
    if (!width || typeof width !== 'number') {
      const newCol = { ...col }
      // 기존 width 속성 제거하여 브라우저가 자동 배분하도록 함
      if (newCol.width) {
        delete newCol.width
      }
      // style에서도 width 제거
      if (newCol.style && typeof newCol.style === 'object' && !Array.isArray(newCol.style)) {
        const { width: _dropped, ...styleWithoutWidth } = newCol.style
        void _dropped
        newCol.style = styleWithoutWidth
      }
      return newCol
    }

    // 너비가 설정된 경우: px 단위로 적용
    const newCol = { ...col }
    const baseStyle =
      col.style && typeof col.style === 'object' && !Array.isArray(col.style) ? col.style : {}

    newCol.width = `${width}px`
    newCol.style = { ...baseStyle, width: `${width}px` }
    
    return newCol
  })
}

/**
 * 고정 컬럼을 적용합니다.
 * @param {Array} columns - 컬럼 정의 배열
 * @param {Object} stickyColumns - 고정 컬럼 설정 { left: [], right: [] }
 * @returns {Array} 고정 컬럼이 적용된 컬럼 배열
 */
export function applyStickyColumns(columns: Array<{ name: string; classes?: string }>, stickyColumns: { left?: string[]; right?: string[] }) {
  if (!columns || !Array.isArray(columns)) {
    return []
  }

  if (!stickyColumns || typeof stickyColumns !== 'object') {
    return columns
  }

  const leftSticky = stickyColumns.left || []
  const rightSticky = stickyColumns.right || []

  return columns.map((col: { name: string; classes?: string }) => {
    const newCol = { ...col }
    // CSS 클래스 추가
    if (leftSticky.includes(col.name)) {
      newCol.classes = `sticky-column-left ${col.classes || ''}`.trim()
    } else if (rightSticky.includes(col.name)) {
      newCol.classes = `sticky-column-right ${col.classes || ''}`.trim()
    }

    return newCol
  })
}

/**
 * 기본 정렬을 적용합니다.
 * @param {Object} pagination - 페이지네이션 객체 (v-model)
 * @param {Object} defaultSort - 기본 정렬 설정 { column: string, direction: 'asc' | 'desc' }
 * @returns {Object} 정렬이 적용된 새로운 페이지네이션 객체
 */
export function applyDefaultSort(pagination: { sortBy?: string; descending?: boolean }, defaultSort: { column?: string; direction?: 'asc' | 'desc' }) {
  if (!pagination || !defaultSort) {
    return pagination
  }

  if (defaultSort.column) {
    const newDescending = defaultSort.direction === 'desc'
    
    // sortBy가 같고 descending도 같으면 변경 없음
    if (pagination.sortBy === defaultSort.column && pagination.descending === newDescending) {
      return pagination
    }
    
    // 새로운 객체를 반환하여 반응성 보장
    // sortBy를 강제로 재설정하여 Quasar 테이블이 변경을 감지하도록 함
    return {
      ...pagination,
      sortBy: defaultSort.column,
      descending: newDescending,
    }
  }

  return pagination
}

// ============================================
// 카드 뷰 설정 적용 함수 (향후 구현)
// ============================================

/**
 * 카드 뷰 설정을 기본 필드 정의에 적용합니다.
 * @param {Array} baseFields - 기본 필드 정의 배열
 * @param {Object} settings - 카드 뷰 설정 객체 (향후 구현 예정)
 * @returns {Array} 설정이 적용된 필드 배열
 */
export function applyCardViewSettings(baseFields: unknown[], _settings?: unknown) {
  void _settings
  // TODO: Phase 6에서 구현 예정
  return baseFields
}

// ============================================
// 리스트 뷰 설정 적용 함수 (향후 구현)
// ============================================

/**
 * 리스트 뷰 설정을 기본 필드 정의에 적용합니다.
 * @param {Array} baseFields - 기본 필드 정의 배열
 * @param {Object} settings - 리스트 뷰 설정 객체 (향후 구현 예정)
 * @returns {Array} 설정이 적용된 필드 배열
 */
export function applyListViewSettings(baseFields: unknown[], _settings?: unknown) {
  void _settings
  // TODO: Phase 6에서 구현 예정
  return baseFields
}
