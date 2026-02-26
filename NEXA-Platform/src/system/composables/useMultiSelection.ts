/**
 * 범용 멀티 선택 관리 Composable
 *
 * 기능:
 * - 단일/복수 선택
 * - 롱프레스 감지
 * - Shift/Ctrl 선택
 * - 선택 상태 관리
 *
 * @param {Object} options - 설정 옵션
 * @param {Array} options.items - 선택 가능한 항목 목록 (ref 또는 computed)
 * @param {Function} options.onSelectionChange - 선택 변경 시 콜백 (선택된 항목 배열 전달)
 * @param {Function} options.onRowClick - 행 클릭 시 콜백 (row, event 전달)
 * @param {Function} options.onRowDoubleClick - 행 더블 클릭 시 콜백 (row 전달)
 * @param {Number} options.longPressDelay - 롱프레스 감지 시간 (ms, 기본값: 300)
 * @param {Number} options.doubleClickDelay - 더블 클릭 감지 시간 (ms, 기본값: 200)
 * @param {Boolean} options.enableEscKey - ESC 키로 선택 해제 활성화 여부 (기본값: true)
 *
 * @returns {Object} 선택 관련 상태 및 함수
 * @returns {Ref<Array>} selectedRows - 선택된 행 배열
 * @returns {Computed<Number|null>} selectedRowId - 첫 번째 선택된 행의 ID
 * @returns {Computed<Number>} selectedCount - 선택된 행 개수
 * @returns {Ref<Boolean>} multiSelectMode - 멀티 셀렉트 모드 여부
 * @returns {Ref<Number>} lastSelectedIndex - 마지막 선택된 행의 인덱스
 * @returns {Ref<Boolean>} isLongPressing - 롱 프레스 중 여부
 * @returns {Ref<Number|null>} longPressingRowId - 롱 프레스 중인 행의 ID (CSS 스타일 적용용)
 * @returns {Function} onRowClick - 행 클릭 핸들러 (이벤트 핸들러에 바인딩)
 * @returns {Function} onRowMouseDown - 행 마우스 다운 핸들러 (롱 프레스 감지용)
 * @returns {Function} onRowMouseUp - 행 마우스 업 핸들러 (롱 프레스 종료용)
 * @returns {Function} toggleRowSelection - 행 선택 토글 함수
 * @returns {Function} clearSelection - 선택 초기화 함수
 * @returns {Function} selectRow - 특정 행 선택 함수
 * @returns {Function} cleanup - 정리 함수 (onUnmounted에서 호출)
 * @returns {Function} handleEscKey - ESC 키 핸들러 (수동으로 호출 가능)
 *
 * @example
 * // 기본 사용법
 * const {
 *   selectedRows,
 *   selectedRowId,
 *   selectedCount,
 *   multiSelectMode,
 *   longPressingRowId,
 *   onRowClick: handleRowClick,
 *   onRowMouseDown: handleRowMouseDown,
 *   onRowMouseUp: handleRowMouseUp,
 *   clearSelection,
 *   cleanup,
 * } = useMultiSelection({
 *   items: filteredItems, // ref 또는 computed
 *   onSelectionChange: (newSelectedRows) => {
 *     // 선택 변경 시 처리
 *     console.log('선택된 항목:', newSelectedRows)
 *   },
 *   onRowClick: (row, event) => {
 *     // 행 클릭 시 처리 (단일 선택 모드에서만 호출됨)
 *   },
 *   onRowDoubleClick: (row) => {
 *     // 행 더블 클릭 시 처리
 *   },
 * })
 *
 * // 템플릿에서 사용
 * // <DataTableRenderer
 * //   :rows="items"
 * //   :selected-rows="selectedRows"
 * //   :long-pressing-row-id="longPressingRowId"
 * //   @row-click="handleRowClick"
 * //   @row-mouse-down="handleRowMouseDown"
 * //   @row-mouse-up="handleRowMouseUp"
 * // />
 *
 * // 컴포넌트 언마운트 시 정리
 * onUnmounted(() => {
 *   cleanup()
 * })
 *
 * @주의사항
 *
 * 1. 이벤트 바인딩 필수:
 *    - @row-click="handleRowClick" (또는 onRowClick)
 *    - @row-mouse-down="handleRowMouseDown" (또는 onRowMouseDown) - 롱 프레스 필수
 *    - @row-mouse-up="handleRowMouseUp" (또는 onRowMouseUp) - 롱 프레스 필수
 *    - 롱 프레스 기능을 사용하려면 mouse-down과 mouse-up 이벤트가 모두 바인딩되어야 함
 *
 * 2. items 옵션:
 *    - ref 또는 computed를 전달해야 함
 *    - 필터링된 항목 목록을 전달하는 경우, 필터링 로직이 변경되면 자동으로 반영됨
 *    - 예: items: computed(() => filteredItems.value)
 *
 * 3. 롱 프레스 기능:
 *    - 롱 프레스 감지 시간은 longPressDelay 옵션으로 조정 가능 (기본값: 300ms)
 *    - 롱 프레스로 멀티 셀렉트 모드에 진입하면, 이후 클릭으로 항목을 추가 선택할 수 있음
 *    - 롱 프레스 후 마우스를 놓으면 자신이 선택된 상태로 유지됨
 *    - longPressingRowId를 뷰 컴포넌트에 전달하여 CSS 스타일 적용 가능
 *
 * 4. 선택 상태 관리:
 *    - selectedRows는 객체 배열로 관리됨 (ID 배열이 아님)
 *    - 카드 뷰 등에서 ID 배열이 필요한 경우, 변환 로직 필요
 *    - onSelectionChange 콜백에서 선택 상태를 store나 다른 상태와 동기화
 *
 * 5. 멀티 셀렉트 모드:
 *    - 롱 프레스로 자동 진입
 *    - Ctrl/Cmd + 클릭으로 개별 토글
 *    - Shift + 클릭으로 범위 선택
 *    - ESC 키로 멀티 셀렉트 모드 해제 (enableEscKey 옵션으로 활성화/비활성화 가능)
 *
 * 6. 정리 함수:
 *    - 컴포넌트가 언마운트될 때 cleanup() 함수를 반드시 호출해야 함
 *    - 타이머와 이벤트 리스너가 정리되지 않으면 메모리 누수 발생 가능
 *
 * 7. 전역 mouseup 리스너:
 *    - 카드 뷰 등에서 카드 밖에서 마우스를 놓을 경우를 대비하여
 *    - 부모 컴포넌트에서 전역 mouseup 리스너를 추가하는 것을 권장
 *    - 예: window.addEventListener('mouseup', handleRowMouseUp)
 *
 * 8. 뷰 컴포넌트와의 연동:
 *    - DataTableRenderer: selectedRows, longPressingRowId를 props로 전달
 *    - DataCardRenderer: selectedRows, longPressingRowId를 props로 전달
 *    - selectedRows는 객체 배열이지만, 카드 뷰에서는 ID 배열로 변환 필요할 수 있음
 *
 * 9. 사이드바 네비게이션과의 연동:
 *    - useSidebarNavigation composable과 함께 사용 시
 *    - selectedRowId를 useSidebarNavigation에 전달하여 동기화
 *    - onRowClick 콜백에서 사이드바 네비게이션의 handleRowClick 호출
 *
 * 10. 선택 해제:
 *     - clearSelection() 함수로 모든 선택 해제
 *     - 멀티 셀렉트 모드도 함께 해제됨
 *     - ESC 키로도 선택 해제 가능 (enableEscKey 옵션으로 활성화/비활성화 가능)
 *     - ESC 키 이벤트 리스너는 자동으로 등록/해제됨 (enableEscKey가 true일 때)
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export function useMultiSelection(options = {}) {
  const {
    items = ref([]),
    onSelectionChange = () => {},
    onRowClick = () => {},
    onRowDoubleClick = () => {},
    longPressDelay = 300,
    doubleClickDelay = 200, // 더블 클릭 감지 시간 단축 (300ms → 200ms)
    enableEscKey = true, // ESC 키로 선택 해제 활성화 여부
  } = options

  // 선택 상태
  const selectedRows = ref([])
  const selectedRowId = computed(() => selectedRows.value[0]?.id || null)
  const selectedCount = computed(() => selectedRows.value.length)

  // 복수 선택 관련 상태
  const multiSelectMode = ref(false)
  const lastSelectedIndex = ref(-1)
  const longPressTimer = ref(null)
  const isLongPressing = ref(false)
  const longPressingRowId = ref(null)
  const longPressingClearTimer = ref(null) // longPressingRowId 자동 클리어 타이머

  // 더블 클릭 감지
  let clickTimer = null
  let clickCount = 0

  // 선택 변경 시 콜백 호출
  function notifySelectionChange() {
    onSelectionChange(selectedRows.value)
  }

  // 행 선택 토글
  function toggleRowSelection(row) {
    const index = selectedRows.value.findIndex((r) => r.id === row.id)
    const itemsValue = typeof items.value === 'function' ? items.value() : items.value

    if (index >= 0) {
      // 이미 선택됨: 해제
      selectedRows.value.splice(index, 1)
      // 마지막 선택 인덱스 업데이트
      if (selectedRows.value.length > 0) {
        const lastSelected = selectedRows.value[selectedRows.value.length - 1]
        lastSelectedIndex.value = itemsValue.findIndex((r) => r.id === lastSelected.id)
      } else {
        lastSelectedIndex.value = -1
      }
    } else {
      // 선택되지 않음: 추가
      selectedRows.value.push(row)
      lastSelectedIndex.value = itemsValue.findIndex((r) => r.id === row.id)
    }

    notifySelectionChange()
  }

  // 복수 선택 처리
  function handleMultiSelect(evt, row, isCtrlKey, isShiftKey) {
    const itemsValue = typeof items.value === 'function' ? items.value() : items.value
    const rowIndex = itemsValue.findIndex((r) => r.id === row.id)

    if (isShiftKey) {
      if (lastSelectedIndex.value >= 0) {
        // Shift 클릭: 범위 선택
        const start = Math.min(lastSelectedIndex.value, rowIndex)
        const end = Math.max(lastSelectedIndex.value, rowIndex)
        const rangeRows = itemsValue.slice(start, end + 1)

        // 범위 내 모든 행 선택 (기존 선택 유지)
        rangeRows.forEach((r) => {
          if (!selectedRows.value.find((sr) => sr.id === r.id)) {
            selectedRows.value.push(r)
          }
        })
        lastSelectedIndex.value = rowIndex
      } else {
        // 첫 번째 Shift 클릭: 현재 행만 선택하고 기준점 설정
        if (!selectedRows.value.find((sr) => sr.id === row.id)) {
          selectedRows.value.push(row)
        }
        lastSelectedIndex.value = rowIndex
        if (!multiSelectMode.value) {
          multiSelectMode.value = true
        }
      }
    } else {
      // Ctrl 클릭 또는 복수 선택 모드: 개별 토글
      const isAlreadySelected = selectedRows.value.some((sr) => sr.id === row.id)
      const isLongPressedRow = longPressingRowId.value === row.id

      // 💥 [수정] 롱 프레스로 방금 선택된 항목에 대한 클릭은 토글 대신 클리어 로직만 수행
      if (isLongPressedRow && isAlreadySelected) {
        // 이 클릭은 롱 프레스 완료 후 발생하는 클릭 이벤트이므로, 선택 해제 없이 longPressingRowId만 클리어
        // (onRowMouseDown에서 이미 선택이 완료됨)
        // 자동 클리어 타이머 취소 (만약 onRowMouseUp에서 취소되지 않았다면)
        if (longPressingClearTimer.value) {
          clearTimeout(longPressingClearTimer.value)
          longPressingClearTimer.value = null
        }
        longPressingRowId.value = null // 롱 프레스 ID 클리어

        // lastSelectedIndex는 onRowMouseDown에서 이미 설정됨
        // notifySelectionChange도 이미 onRowMouseDown에서 호출됨 (선택 상태 변경 없음)
        return // 토글 로직을 건너뜁니다.
      }

      // 💥 [추가 보완] longPressingRowId가 null이지만, multiSelectMode가 true이고 이미 선택된 항목이면
      // 롱 프레스로 선택된 항목일 가능성이 높으므로 선택 해제 방지
      // (타이머가 클릭 이벤트보다 먼저 실행되어 longPressingRowId가 클리어된 경우 대비)
      if (!isLongPressedRow && isAlreadySelected && multiSelectMode.value && selectedRows.value.length === 1) {
        // 롱 프레스로 선택된 항목일 가능성이 높음 (단일 선택 상태에서 멀티 셀렉트 모드 진입)
        // 선택 해제 방지
        return
      }

      // 롱 프레스에 의한 클릭이 아니거나, 다른 항목을 클릭한 경우
      toggleRowSelection(row)
      lastSelectedIndex.value = rowIndex
    }

    notifySelectionChange()
  }

  // 단일 클릭 처리
  function handleSingleClick(row) {
    const itemsValue = typeof items.value === 'function' ? items.value() : items.value

    // 복수 선택 모드이면 선택 토글만 수행
    if (multiSelectMode.value) {
      toggleRowSelection(row)
      return
    }

    // lastSelectedIndex 업데이트
    const rowIndex = itemsValue.findIndex((r) => r.id === row.id)
    lastSelectedIndex.value = rowIndex

    // 단일 선택
    selectedRows.value = [row]
    notifySelectionChange()

    // 콜백 호출
    onRowClick(row, { type: 'single' })
  }

  // 더블 클릭 처리
  function handleDoubleClick(row) {
    const itemsValue = typeof items.value === 'function' ? items.value() : items.value
    const rowIndex = itemsValue.findIndex((r) => r.id === row.id)
    lastSelectedIndex.value = rowIndex

    // 단일 선택
    selectedRows.value = [row]
    notifySelectionChange()

    // 콜백 호출
    onRowDoubleClick(row)
  }

  // 행 클릭 핸들러
  function onRowClickHandler(evt, row) {
    // evt.target이 null인 경우 처리
    if (!evt || !evt.target) {
      return
    }

    // 작업 아이콘 클릭은 무시
    if (
      evt.target.closest('.row-actions-overlay-fixed') ||
      evt.target.closest('.action-btn') ||
      evt.target.closest('.table-actions-overlay') ||
      evt.target.closest('.card-footer-fixed') || // 카드 뷰 하단 고정 영역
      evt.target.closest('.q-checkbox') || // 체크박스 클릭 무시
      evt.target.closest('.q-btn') // 버튼 클릭 무시
    ) {
      return
    }

    // 텍스트 선택 중이면 무시
    if (window.getSelection().toString().length > 0) {
      return
    }

    // Ctrl/Cmd 키 감지
    const isCtrlKey = evt.ctrlKey || evt.metaKey
    const isShiftKey = evt.shiftKey

    // 복수 선택 모드이거나 Ctrl/Shift 키가 눌려있으면 복수 선택 처리
    // 멀티 셀렉트 모드에서는 롱 프레스 중 클릭도 허용 (롱 프레스 후 자신을 선택하기 위함)
    if (multiSelectMode.value || isCtrlKey || isShiftKey) {
      // 클릭 이벤트가 발생했으므로, 자동 클리어 타이머 취소
      // 이렇게 하면 600ms 타이머가 클릭 이벤트보다 먼저 실행되어 longPressingRowId를 클리어하는 것을 방지
      if (longPressingClearTimer.value) {
        clearTimeout(longPressingClearTimer.value)
        longPressingClearTimer.value = null
      }
      handleMultiSelect(evt, row, isCtrlKey, isShiftKey)
      // longPressingRowId는 handleMultiSelect 내부에서 클리어됨 (롱 프레스로 선택된 항목인 경우)
      // 다른 항목을 클릭한 경우에는 여전히 유지되므로, 여기서는 클리어하지 않음
      return
    }

    // 롱프레스 중이면 클릭 무시 (단일 선택 모드일 때만)
    if (isLongPressing.value) {
      return
    }

    // 더블 클릭 감지
    clickCount++

    if (clickCount === 1) {
      // 첫 번째 클릭: 즉시 선택 적용하고 더블 클릭 감지를 위해 타이머 시작
      handleSingleClick(row)
      clickTimer = setTimeout(() => {
        clickCount = 0
      }, doubleClickDelay)
    } else if (clickCount === 2) {
      // 더블 클릭: 타이머 취소하고 더블 클릭 처리 (선택은 이미 적용됨)
      clearTimeout(clickTimer)
      handleDoubleClick(row)
      clickCount = 0
    }
  }

  // 롱프레스 시작
  function onRowMouseDown(evt, row) {
    if (evt.button === 0) {
      // 왼쪽 클릭
      // 텍스트 선택 방지 (Shift + 클릭 시 텍스트 블록 선택 방지)
      if (evt.shiftKey || evt.ctrlKey || evt.metaKey) {
        evt.preventDefault()
      }
      // 롱프레스가 완료될 때까지 longPressingRowId는 설정하지 않음

      longPressTimer.value = setTimeout(() => {
        isLongPressing.value = true

        // 롱프레스 감지: 이전 선택 모두 취소하고 새로운 선택 시작
        if (multiSelectMode.value) {
          selectedRows.value = []
          lastSelectedIndex.value = -1
        }

        // 복수 선택 모드 진입
        multiSelectMode.value = true

        // 현재 행 강제 선택
        const itemsValue = typeof items.value === 'function' ? items.value() : items.value
        selectedRows.value.push(row)
        lastSelectedIndex.value = itemsValue.findIndex((r) => r.id === row.id)

        // 롱프레스 완료 시 시각적 피드백 적용 (즉시 CSS 클래스 적용)
        longPressingRowId.value = row.id

        // 기존 클리어 타이머가 있으면 취소
        if (longPressingClearTimer.value) {
          clearTimeout(longPressingClearTimer.value)
          longPressingClearTimer.value = null
        }

        // 롱프레스 완료 후 시각적 피드백 유지
        // longPressingRowId는 handleMultiSelect에서 클리어되거나, 일정 시간 후 자동 클리어
        // 시각적 피드백을 위해 일정 시간 후에 클리어 (CSS 클래스 제거용)
        // 단, 클릭 이벤트가 발생하면 onRowMouseUp 또는 onRowClickHandler에서 타이머를 취소함
        // 타이머를 충분히 길게 설정하여 클릭 이벤트가 발생할 시간을 확보
        longPressingClearTimer.value = setTimeout(() => {
          // 클릭 이벤트가 아직 처리되지 않았고, 같은 항목이면 클리어
          if (longPressingRowId.value === row.id) {
          longPressingRowId.value = null
            longPressingClearTimer.value = null
          }
        }, 1000) // 클릭 이벤트가 발생할 시간을 확보하기 위해 1000ms로 설정

        notifySelectionChange()
      }, longPressDelay)
    }
  }

  // 롱프레스 종료
  function onRowMouseUp() {
    if (longPressTimer.value) {
      clearTimeout(longPressTimer.value)
      longPressTimer.value = null
    }

    // 롱프레스 상태 즉시 해제 (click 이벤트보다 먼저 처리되도록)
    // 마우스를 놓으면 더 이상 롱 프레스 중이 아니므로 즉시 false로 설정
      isLongPressing.value = false

    // 마우스를 놓으면 클릭 이벤트가 곧 발생할 것이므로, 자동 클리어 타이머 취소
    // 이렇게 하면 클릭 이벤트가 발생할 때까지 longPressingRowId가 유지됨
    if (longPressingClearTimer.value) {
      clearTimeout(longPressingClearTimer.value)
      longPressingClearTimer.value = null
    }
  }

  // 선택 초기화
  function clearSelection() {
    selectedRows.value = []
    lastSelectedIndex.value = -1
    multiSelectMode.value = false
    notifySelectionChange()
  }

  // 특정 행 선택
  function selectRow(row) {
    selectedRows.value = [row]
    const itemsValue = typeof items.value === 'function' ? items.value() : items.value
    lastSelectedIndex.value = itemsValue.findIndex((r) => r.id === row.id)
    notifySelectionChange()
  }

  // ESC 키 핸들러
  function handleEscKey(event) {
    // ESC 키만 처리
    if (event.key !== 'Escape' && event.keyCode !== 27) {
      return false
    }

    // 입력 필드에 포커스가 있으면 기본 동작 허용
    const activeElement = document.activeElement
    const isInputField =
      activeElement &&
      (activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable ||
        activeElement.closest('input, textarea, [contenteditable]'))

    // 입력 필드가 아니고 멀티 셀렉션 모드이거나 선택된 항목이 있으면 해제
    if (!isInputField && (multiSelectMode.value || selectedRows.value.length > 0)) {
      clearSelection()
      event.preventDefault()
      event.stopPropagation()
      return true
    }

    return false
  }

  // 전역 ESC 키 이벤트 리스너
  function handleGlobalKeydown(event) {
    if (enableEscKey) {
      handleEscKey(event)
    }
  }

  // 정리 함수
  function cleanup() {
    if (longPressTimer.value) {
      clearTimeout(longPressTimer.value)
    }
    if (longPressingClearTimer.value) {
      clearTimeout(longPressingClearTimer.value)
    }
    if (clickTimer) {
      clearTimeout(clickTimer)
    }
    // ESC 키 이벤트 리스너 제거
    if (enableEscKey) {
      window.removeEventListener('keydown', handleGlobalKeydown)
    }
  }

  // ESC 키 이벤트 리스너 등록
  if (enableEscKey) {
    onMounted(() => {
      window.addEventListener('keydown', handleGlobalKeydown)
    })
    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleGlobalKeydown)
    })
  }

  return {
    // 상태
    selectedRows,
    selectedRowId,
    selectedCount,
    multiSelectMode,
    lastSelectedIndex,
    isLongPressing,
    longPressingRowId,

    // 함수
    onRowClick: onRowClickHandler,
    onRowMouseDown,
    onRowMouseUp,
    toggleRowSelection,
    clearSelection,
    selectRow,
    handleEscKey,
    cleanup,
  }
}
