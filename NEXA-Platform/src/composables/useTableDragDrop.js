/**
 * 범용 테이블 드래그 앤 드롭 Composable
 *
 * 기능:
 * - 드래그 시작/종료
 * - 드롭 처리
 * - 순서 계산 (콜백으로 처리)
 * - 시각적 피드백
 *
 * @param {Object} options - 설정 옵션
 * @param {Array} options.items - 드래그 가능한 항목 목록 (ref 또는 computed)
 * @param {Function} options.onDrop - 드롭 완료 시 콜백 (sourceItem, targetItem, newIndex 전달)
 * @param {Function} options.calculateNewOrder - 새로운 순서 계산 함수 (sourceIndex, targetIndex, items 전달, 새 순서 반환)
 * @param {String} options.rowSelector - 행 선택자 (기본값: '.draggable-row[data-row-id]')
 * @param {String} options.idAttribute - ID 속성명 (기본값: 'data-row-id')
 *
 * @returns {Object} 드래그 앤 드롭 관련 상태 및 함수
 */
import { ref, onUnmounted } from 'vue'

export function useTableDragDrop(options = {}) {
  const {
    items = ref([]),
    onDrop = () => {},
    calculateNewOrder = null,
    rowSelector = '.draggable-row[data-row-id]',
    idAttribute = 'data-row-id',
  } = options

  // 드래그 상태
  const draggedRowId = ref(null)
  const dragOverRowId = ref(null)
  const isReordering = ref(false)
  let previousHoveredRowId = null

  // 드래그 시작
  function handleDragStart(event, row) {
    draggedRowId.value = row.id
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/json', JSON.stringify({ id: row.id }))

    // 드래그 중인 행 시각적 피드백
    if (event.currentTarget) {
      event.currentTarget.style.opacity = '0.5'
    }

    // 마우스 이동 이벤트 리스너 추가
    document.addEventListener('dragover', handleDocumentDragOver, { passive: true })
  }

  // 드래그 종료
  function handleDragEnd(event) {
    // 스타일 복원
    if (event.currentTarget) {
      event.currentTarget.style.opacity = ''
    }

    draggedRowId.value = null
    dragOverRowId.value = null
    previousHoveredRowId = null

    // 마우스 이동 이벤트 리스너 제거
    document.removeEventListener('dragover', handleDocumentDragOver)
  }

  // document 레벨 dragover 핸들러 (드래그 중 마우스 위치 추적)
  function handleDocumentDragOver(event) {
    if (!draggedRowId.value) {
      return
    }

    // 마우스 위치에서 가장 가까운 행 찾기
    const mouseY = event.clientY
    const rows = document.querySelectorAll(rowSelector)

    let hoveredRowId = null

    for (const row of rows) {
      const rect = row.getBoundingClientRect()
      const rowId = parseInt(row.getAttribute(idAttribute))

      // 마우스가 행 영역 내에 있는지 확인
      if (mouseY >= rect.top && mouseY <= rect.bottom && rowId !== draggedRowId.value) {
        hoveredRowId = rowId
        break
      }
    }

    // 대상 행이 변경된 경우에만 상태 업데이트
    if (previousHoveredRowId !== hoveredRowId) {
      previousHoveredRowId = hoveredRowId
    }

    // 상태가 변경된 경우에만 업데이트
    const currentDragOver = dragOverRowId.value !== null ? Number(dragOverRowId.value) : null
    const newDragOver = hoveredRowId !== null ? Number(hoveredRowId) : null

    if (currentDragOver !== newDragOver) {
      dragOverRowId.value = hoveredRowId
    }
  }

  // dragover 핸들러
  function handleDragOver(event, row) {
    if (draggedRowId.value === null || draggedRowId.value === row.id) {
      return
    }
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  // dragenter 핸들러
  function handleDragEnter(row) {
    if (draggedRowId.value !== null && draggedRowId.value !== row.id) {
      dragOverRowId.value = row.id
    }
  }

  // dragleave 핸들러
  function handleDragLeave() {
    // handleDocumentDragOver에서 마우스 위치를 추적하므로 여기서는 처리하지 않음
  }

  // drop 핸들러
  async function handleDrop(event, targetRow) {
    event.preventDefault()
    const dragDataStr = event.dataTransfer.getData('application/json')

    if (!dragDataStr || !draggedRowId.value) {
      dragOverRowId.value = null
      return
    }

    const dragData = JSON.parse(dragDataStr)
    const sourceId = dragData.id

    if (sourceId === targetRow.id || isReordering.value) {
      dragOverRowId.value = null
      return
    }

    try {
      isReordering.value = true

      const itemsValue = typeof items.value === 'function' ? items.value() : items.value

      // 현재 필터링된 목록에서 인덱스 찾기
      const sourceIndex = itemsValue.findIndex((item) => item.id === sourceId)
      const targetIndex = itemsValue.findIndex((item) => item.id === targetRow.id)

      if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
        dragOverRowId.value = null
        return
      }

      // 이동할 항목 찾기
      const movedItem = itemsValue[sourceIndex]
      if (!movedItem) {
        dragOverRowId.value = null
        return
      }

      // 새로운 순서 계산 (콜백 사용)
      let newOrder = null
      if (calculateNewOrder) {
        newOrder = calculateNewOrder(sourceIndex, targetIndex, itemsValue, movedItem, targetRow)
      } else {
        // 기본 계산: targetIndex 위치에 삽입
        newOrder = targetIndex
      }

      // 콜백 호출
      await onDrop(movedItem, targetRow, newOrder, sourceIndex, targetIndex)
    } catch (error) {
      console.error('[useTableDragDrop] 드롭 처리 중 오류:', error)
      throw error
    } finally {
      isReordering.value = false
      dragOverRowId.value = null
      draggedRowId.value = null
    }
  }

  // 정리 함수
  function cleanup() {
    document.removeEventListener('dragover', handleDocumentDragOver)
    draggedRowId.value = null
    dragOverRowId.value = null
    isReordering.value = false
  }

  // 컴포넌트 언마운트 시 정리
  onUnmounted(() => {
    cleanup()
  })

  return {
    // 상태
    draggedRowId,
    dragOverRowId,
    isReordering,

    // 함수
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    cleanup,
  }
}
