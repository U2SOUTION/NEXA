/**
 * 테이블 키보드 이벤트 Composable
 *
 * 사용법:
 * ```javascript
 * import { useTableKeyboard } from 'src/system/composables/useTableKeyboard'
 *
 * const { handleKeyDown, setupKeyboardListeners, cleanupKeyboardListeners } = useTableKeyboard({
 *   filteredClasses,
 *   selectedRows,
 *   multiSelectMode,
 *   lastSelectedIndex,
 *   pagination,
 *   isSidebarDetailViewActive,
 *   exitSidebarDetailView,
 *   partsDataStore
 * })
 * ```
 */


/**
 * 테이블 키보드 이벤트 Composable
 *
 * @param {Object} params - 파라미터
 * @param {import('vue').ComputedRef<Array>} params.filteredClasses - 필터링된 목록
 * @param {import('vue').Ref<Array>} params.selectedRows - 선택된 행들
 * @param {import('vue').Ref<boolean>} params.multiSelectMode - 복수 선택 모드 여부
 * @param {import('vue').Ref<number>} params.lastSelectedIndex - 마지막 선택 인덱스
 * @param {import('vue').Ref<Object>} params.pagination - 페이지네이션 상태
 * @param {import('vue').ComputedRef<boolean>} params.isSidebarDetailViewActive - 사이드바 상세 뷰 활성 여부
 * @param {Function} params.exitSidebarDetailView - 사이드바 상세 뷰 해제 함수
 * @param {Object} params.partsDataStore - 부품 데이터 스토어
 * @param {Function} params.clearSelection - 선택 초기화 함수 (optional)
 * @returns {Object} 키보드 이벤트 핸들러 및 설정 함수
 */
export function useTableKeyboard({
  filteredClasses,
  selectedRows,
  multiSelectMode,
  lastSelectedIndex,
  pagination,
  isSidebarDetailViewActive,
  exitSidebarDetailView,
  partsDataStore,
  clearSelection,
}) {
  /**
   * 선택 반전 함수
   */
  function invertSelection() {
    // 현재 선택된 항목 ID 집합
    const selectedIds = new Set(selectedRows.value.map((r) => r.id))

    // 필터된 결과에서 선택되지 않은 항목만 선택
    const inverted = filteredClasses.value.filter((row) => !selectedIds.has(row.id))

    selectedRows.value = inverted

    if (selectedRows.value.length > 0) {
      lastSelectedIndex.value = filteredClasses.value.findIndex(
        (r) => r.id === selectedRows.value[selectedRows.value.length - 1].id,
      )
      partsDataStore.selectedPartClass = selectedRows.value[0]
    } else {
      lastSelectedIndex.value = -1
    }

    // 복수 선택 모드 진입
    multiSelectMode.value = true
  }

  /**
   * 키보드 이벤트 핸들러
   *
   * @param {KeyboardEvent} evt - 키보드 이벤트
   */
  function handleKeyDown(evt) {
    // ESC 키: 사이드바 상세 뷰 해제만 처리 (멀티 셀렉션 해제는 useMultiSelection에서 처리)
    if (evt.key === 'Escape' || evt.keyCode === 27) {
      // 입력 필드에 포커스가 있으면 기본 동작 허용
      const activeElement = document.activeElement
      const isInputField =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.isContentEditable ||
          activeElement.closest('input, textarea, [contenteditable]'))

      // 입력 필드가 아니면 처리
      if (!isInputField) {
        // 사이드바 상세 뷰가 활성화되어 있으면 호버 뷰로 전환
        if (isSidebarDetailViewActive.value) {
          evt.preventDefault()
          evt.stopPropagation()
          exitSidebarDetailView()
          return
        }

        // 사이드바 상세 뷰가 아니면 멀티 셀렉션 해제는 useMultiSelection에서 처리
        // (useMultiSelection이 enableEscKey 옵션으로 자동 처리)
        // 하위 호환성: useMultiSelection을 사용하지 않는 경우만 직접 처리
        // 주의: useMultiSelection을 사용하는 경우 clearSelection이 제공되지만
        // ESC 키 처리는 useMultiSelection에서 하므로 여기서는 호출하지 않음
        if (!clearSelection) {
          // useMultiSelection을 사용하지 않는 경우 (하위 호환성)
          selectedRows.value = []
          lastSelectedIndex.value = -1
          multiSelectMode.value = false
        }
        // useMultiSelection을 사용하는 경우는 이벤트를 전파하여 useMultiSelection이 처리하도록 함
      }
      return
    }

    // Ctrl + A: 전체 선택
    if ((evt.ctrlKey || evt.metaKey) && (evt.key === 'a' || evt.key === 'A') && evt.keyCode === 65) {
      // 입력 필드에 포커스가 있으면 기본 동작 허용 (텍스트 선택)
      const activeElement = document.activeElement
      const isInputField =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.isContentEditable ||
          activeElement.closest('input, textarea, [contenteditable]'))

      // 입력 필드가 아니고, 필터된 결과가 있을 때만 처리
      if (!isInputField && filteredClasses.value.length > 0) {
        // 기본 동작 방지 (브라우저 전체 텍스트 선택 방지)
        evt.preventDefault()
        evt.stopPropagation()
        evt.stopImmediatePropagation()

        // ===== 현재 페이지에 "보이는 로우"만 전체 선택 =====
        const page = pagination.value.page || 1
        const rowsPerPage = pagination.value.rowsPerPage || 0

        let visibleRows = filteredClasses.value

        // rowsPerPage가 0이면 "전체"이므로 그대로 사용, 그 외에는 현재 페이지 범위로 제한
        if (rowsPerPage > 0) {
          const start = (page - 1) * rowsPerPage
          const end = start + rowsPerPage
          visibleRows = filteredClasses.value.slice(start, end)
        }

        if (visibleRows.length === 0) {
          return
        }

        // 이미 선택된 항목은 유지하면서, 보이는 로우만 추가 선택
        const selectedIdSet = new Set(selectedRows.value.map((r) => r.id))
        const newSelected = [...selectedRows.value]

        visibleRows.forEach((row) => {
          if (!selectedIdSet.has(row.id)) {
            newSelected.push(row)
          }
        })

        selectedRows.value = newSelected

        if (selectedRows.value.length > 0) {
          // lastSelectedIndex는 현재 페이지에서 마지막으로 선택된 로우 기준으로 설정
          const lastVisible = visibleRows[visibleRows.length - 1]
          lastSelectedIndex.value = filteredClasses.value.findIndex((r) => r.id === lastVisible.id)

          // 복수 선택 모드 진입 (전체 선택 시)
          multiSelectMode.value = true

          // 첫 번째 선택된 항목을 상세 패널과 동기화
          partsDataStore.selectedPartClass = selectedRows.value[0]
        }
      }
      return
    }

    // Ctrl + Shift + I: 선택 반전
    if (
      (evt.ctrlKey || evt.metaKey) &&
      evt.shiftKey &&
      (evt.key === 'i' || evt.key === 'I') &&
      evt.keyCode === 73
    ) {
      // 입력 필드에 포커스가 있으면 기본 동작 허용
      const activeElement = document.activeElement
      const isInputField =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.isContentEditable ||
          activeElement.closest('input, textarea, [contenteditable]'))

      // 입력 필드가 아니고, 필터된 결과가 있을 때만 처리
      if (!isInputField && filteredClasses.value.length > 0) {
        // 기본 동작 방지
        evt.preventDefault()
        evt.stopPropagation()
        evt.stopImmediatePropagation()

        // 선택 반전
        invertSelection()
      }
    }
  }

  /**
   * 키보드 이벤트 리스너 설정
   */
  function setupKeyboardListeners() {
    // 키보드 이벤트 리스너 추가 (capture phase에서 등록하여 먼저 처리)
    window.addEventListener('keydown', handleKeyDown, true)
  }

  /**
   * 키보드 이벤트 리스너 정리
   */
  function cleanupKeyboardListeners() {
    window.removeEventListener('keydown', handleKeyDown, true)
  }

  return {
    handleKeyDown,
    invertSelection,
    setupKeyboardListeners,
    cleanupKeyboardListeners,
  }
}

