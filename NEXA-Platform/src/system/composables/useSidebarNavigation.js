/**
 * 사이드바 네비게이션 Composable
 *
 * 모든 뷰에서 공통으로 사용하는 사이드바 호버/상세 뷰 전환 로직
 *
 * 사이드바 네비게이션 설정은 viewModeSettings.js의
 * defaultSidebarNavigationSettings를 참조하세요.
 *
 * @see @domains/parts/components/config/viewModeSettings.js - 뷰 모드 설정 (사이드바 네비게이션 설정 포함)
 * @see docs/sidebar-navigation-settings-location-review.md - 사이드바 네비게이션 설정 위치 검토
 *
 * @param {Object} options - 설정 옵션
 * @param {Array|ComputedRef} options.items - 데이터 배열
 * @param {string} options.itemIdKey - ID 필드명 (기본값: 'id')
 * @param {string} options.sidebarMode - 사이드바 모드 (예: 'parts-data')
 * @param {string} options.selectedView - 선택된 뷰 (예: 'part-classes')
 * @param {Object} options.partsManagementStore - partsManagementStore 인스턴스
 * @param {Object} options.partsDataStore - partsDataStore 인스턴스
 * @param {Ref|ComputedRef} options.selectedRowId - 선택된 행 ID (useMultiSelection에서 가져옴)
 * @param {number} options.hoverDebounceTime - 호버 디바운스 시간 (기본값: 50ms)
 * @param {number} options.mouseLeaveDelay - 마우스 떠남 지연 시간 (기본값: 200ms)
 * @param {Object} options.sidebarNavigationSettings - 사이드바 네비게이션 설정 객체 (뷰모드 설정에서 가져올 수 있음)
 * @param {Function} options.onHover - 호버 시 추가 콜백 (item, event)
 * @param {Function} options.onClick - 클릭 시 추가 콜백 (item)
 * @param {Function} options.onDoubleClick - 더블클릭 시 추가 콜백 (item)
 * @param {Ref} options.containerRef - 컨테이너 ref (테이블 뷰 전용, 선택적)
 * @param {Function} options.onMouseLeave - 마우스 떠남 시 추가 콜백 (선택적)
 *
 * @returns {Object} 사이드바 네비게이션 관련 상태 및 함수
 */
import { ref, computed } from 'vue'

export function useSidebarNavigation(options = {}) {
  // sidebarNavigationSettings가 있으면 우선 사용, 없으면 개별 옵션 사용
  const sidebarNavSettings = options.sidebarNavigationSettings || {}

  const {
    items = ref([]),
    itemIdKey = 'id',
    sidebarMode = 'parts-data',
    selectedView = 'part-classes',
    partsManagementStore,
    partsDataStore,
    selectedRowId = ref(null),
    hoverDebounceTime = 50,
    mouseLeaveDelay = 200,
    onHover = () => {},
    onClick = () => {},
    onDoubleClick = () => {},
    containerRef = null,
    onMouseLeave = null,
  } = options

  // sidebarNavigationSettings에서 설정이 있으면 덮어쓰기
  const finalHoverDebounceTime = sidebarNavSettings.hoverDebounceTime ?? hoverDebounceTime
  const finalMouseLeaveDelay = sidebarNavSettings.mouseLeaveDelay ?? mouseLeaveDelay

  // 호버된 행 ID
  const hoveredRowId = ref(null)

  // 디바운스 타이머
  let hoverDebounceTimer = null
  let mouseLeaveTimer = null

  // 상세 뷰 상태 (store와 동기화)
  const sidebarDetailViewRowId = ref(null)
  const isSidebarDetailViewActive = computed({
    get: () => partsDataStore.isSidebarDetailViewActive,
    set: (value) => {
      partsDataStore.isSidebarDetailViewActive = value
    },
  })

  // 클릭으로 선택된 항목 ID를 추적 (handleRowClick에서 설정)
  const clickedRowId = ref(null)

  // items를 computed로 변환 (ref 또는 computed 모두 처리)
  const itemsValue = computed(() => {
    // items가 ref나 computed인 경우
    if (items && typeof items === 'object' && 'value' in items) {
      const value = items.value
      // value가 배열이면 그대로 반환, computed라면 value() 호출
      return Array.isArray(value) ? value : typeof value === 'function' ? value() : value
    }
    // items가 함수인 경우 (computed)
    if (typeof items === 'function') {
      const value = items()
      return Array.isArray(value) ? value : typeof value === 'function' ? value() : value
    }
    // items가 직접 배열인 경우
    return Array.isArray(items) ? items : []
  })

  // selectedRowId를 computed로 변환
  const selectedRowIdValue = computed(() => {
    if (typeof selectedRowId === 'function') {
      return selectedRowId.value
    }
    return selectedRowId.value || null
  })

  // 사이드바 모드/뷰 전환 헬퍼
  function ensureSidebarModeAndView() {
    if (partsManagementStore.sidebarMode !== sidebarMode) {
      partsManagementStore.setSidebarMode(sidebarMode)
    }
    if (partsManagementStore.selectedPartsDataView !== selectedView) {
      partsManagementStore.setSelectedPartsDataView(selectedView)
    }
  }

  // 호버 뷰 활성화
  function activateHoverView(item) {
    if (!item) return

    ensureSidebarModeAndView()

    // 사이드바 호버 뷰에서는 selectedPartClass와 selectedPartClasses 모두 설정
    partsDataStore.selectedPartClass = item
    partsDataStore.selectedPartClasses = [item]
  }

  // 호버 뷰 해제
  function deactivateHoverView() {
    // 클릭으로 선택한 경우 유지, 마우스 오버로만 선택된 경우에만 해제
    // clickedRowId, selectedRowIdValue, 또는 partsDataStore.selectedPartClass를 체크
    const hasClickedSelection = clickedRowId.value !== null || selectedRowIdValue.value !== null || partsDataStore.selectedPartClass !== null

    if (!hasClickedSelection) {
      partsDataStore.selectedPartClass = null
      partsDataStore.selectedPartClasses = []
    }
    // 클릭으로 선택된 항목이 있으면 selectedPartClass와 selectedPartClasses는 유지
  }

  // 행 마우스 진입 핸들러
  function onRowMouseEnter(evt, row = null) {
    // row가 직접 전달된 경우 (카드 뷰 또는 테이블 뷰에서 row 파라미터로 전달)
    let rowId = null
    if (row && row[itemIdKey]) {
      rowId = row[itemIdKey]
    } else if (evt) {
      // evt에서 rowId 추출 (테이블 뷰 또는 카드 뷰에서 row가 전달되지 않은 경우)
      // currentTarget이 있으면 사용, 없으면 target 사용
      const rowElement = evt.currentTarget || evt.target
      if (rowElement) {
        // data-row-id 속성 확인
        const dataRowId = rowElement.getAttribute('data-row-id')
        if (dataRowId) {
          rowId = parseInt(dataRowId)
        } else {
          // data-row-id가 없으면 가장 가까운 부모 요소에서 찾기
          const parentWithRowId = rowElement.closest('[data-row-id]')
          if (parentWithRowId) {
            const dataRowId = parentWithRowId.getAttribute('data-row-id')
            if (dataRowId) {
              rowId = parseInt(dataRowId)
            }
          }
        }
      }
    }

    if (!rowId) return

    // 이전 타이머 취소
    if (mouseLeaveTimer) {
      clearTimeout(mouseLeaveTimer)
      mouseLeaveTimer = null
    }

    // 디바운싱: 빠른 마우스 이동 시 불필요한 업데이트 방지
    if (hoverDebounceTimer) {
      clearTimeout(hoverDebounceTimer)
    }

    hoverDebounceTimer = setTimeout(() => {
      hoveredRowId.value = rowId

      // itemsValue가 배열인지 확인
      const itemsArray = Array.isArray(itemsValue.value) ? itemsValue.value : []

      // 호버된 항목 찾기
      const hoveredItem = itemsArray.find((item) => item && item[itemIdKey] === rowId)
      if (!hoveredItem) return

      // 사이드바 호버 뷰: 사이드바 상세 뷰가 활성화되지 않았을 때만 호버 뷰 활성화
      // 상세 뷰가 활성화되어 있으면 호버로 변경하지 않음 (클릭으로 열린 상세 뷰 유지)
      if (!isSidebarDetailViewActive.value) {
        activateHoverView(hoveredItem)
      }

      // 추가 콜백 호출 (오버레이 위치 업데이트 등)
      onHover(hoveredItem, evt)
    }, finalHoverDebounceTime)
  }

  // 행 마우스 이동 핸들러
  function onRowMouseMove(evt, row = null) {
    if (!hoveredRowId.value) return

    // row가 직접 전달된 경우 (카드 뷰 또는 테이블 뷰에서 row 파라미터로 전달)
    let rowId = null
    if (row && row[itemIdKey]) {
      rowId = row[itemIdKey]
    } else if (evt) {
      // evt에서 rowId 추출 (테이블 뷰)
      // currentTarget이 있으면 사용, 없으면 target 사용
      const rowElement = evt.currentTarget || evt.target
      if (rowElement) {
        // data-row-id 속성 확인
        const dataRowId = rowElement.getAttribute('data-row-id')
        if (dataRowId) {
          rowId = parseInt(dataRowId)
        } else {
          // data-row-id가 없으면 가장 가까운 부모 요소에서 찾기
          const parentWithRowId = rowElement.closest('[data-row-id]')
          if (parentWithRowId) {
            const dataRowId = parentWithRowId.getAttribute('data-row-id')
            if (dataRowId) {
              rowId = parseInt(dataRowId)
            }
          }
        }
      }
    }

    // 현재 호버된 행과 일치하는지 확인
    if (rowId === hoveredRowId.value) {
      // itemsValue가 배열인지 확인
      const itemsArray = Array.isArray(itemsValue.value) ? itemsValue.value : []
      // 추가 콜백 호출 (오버레이 위치 업데이트 등)
      const hoveredItem = itemsArray.find((item) => item && item[itemIdKey] === rowId)
      if (hoveredItem) {
        onHover(hoveredItem, evt)
      }
    }
  }

  // 행 마우스 떠남 핸들러
  function onRowMouseLeave() {
    // 다른 행으로 이동할 수 있으므로 타이머만 설정 (실제 숨김은 컨테이너 떠남에서 처리)
    // 컨테이너가 있으면 onContainerMouseLeave에서 처리
  }

  // 컨테이너 마우스 떠남 핸들러 (테이블 뷰 전용)
  function onContainerMouseLeave(evt) {
    if (!containerRef) return

    // 마우스가 실제로 컨테이너 영역을 벗어났는지 확인
    const relatedTarget = evt?.relatedTarget
    if (relatedTarget) {
      // containerRef가 ref 객체인지 확인하고 DOM 요소 추출
      let container = null
      if (typeof containerRef === 'function') {
        container = containerRef.value
      } else if (containerRef && typeof containerRef === 'object' && 'value' in containerRef) {
        container = containerRef.value
      } else {
        container = containerRef
      }

      // container가 DOM 요소인지 확인 (contains 메서드가 있는지 확인)
      if (container && typeof container.contains === 'function' && container.contains(relatedTarget)) {
        return // 컨테이너 내부로 이동한 것이면 무시
      }

      // 사이드바 영역으로 이동한 경우도 무시 (클릭으로 선택된 항목이 있을 때)
      // 사이드바는 보통 특정 클래스나 ID를 가지고 있음
      const sidebarElement = relatedTarget.closest('.parts-management-sidebar, .q-drawer, [class*="sidebar"], [id*="sidebar"]')
      if (sidebarElement) {
        // 사이드바로 이동한 경우, 클릭으로 선택된 항목이 있으면 무시
        // 또는 partsDataStore에 선택된 항목이 있으면 무시
        if (selectedRowIdValue.value !== null || partsDataStore.selectedPartClass !== null) {
          return
        }
      }
    }

    // 디바운스 타이머 취소
    if (hoverDebounceTimer) {
      clearTimeout(hoverDebounceTimer)
      hoverDebounceTimer = null
    }

    // 마우스가 작업 아이콘으로 이동하는 경우를 고려하여 약간의 지연
    mouseLeaveTimer = setTimeout(() => {
      // 클릭으로 선택된 항목이 있으면 호버 뷰를 해제하지 않음
      // (사이드바에서 추가 작업을 할 수 있도록 정보 유지)
      // clickedRowId, selectedRowIdValue, 또는 partsDataStore.selectedPartClass를 체크
      const hasClickedSelection = clickedRowId.value !== null || selectedRowIdValue.value !== null || partsDataStore.selectedPartClass !== null

      if (hasClickedSelection) {
        // 클릭으로 선택된 항목이 있으면 호버 상태만 초기화하고 정보는 유지
        hoveredRowId.value = null
        // selectedPartClass와 selectedPartClasses는 유지됨
        return
      }

      // 현재 호버된 행이 실제로 존재하는지 확인
      const hoveredRow = hoveredRowId.value ? document.querySelector(`[data-row-id="${hoveredRowId.value}"]`) : null

      if (!hoveredRow) {
        hoveredRowId.value = null
        deactivateHoverView()

        // 추가 콜백 호출
        if (onMouseLeave) {
          onMouseLeave(evt)
        }
      }
    }, finalMouseLeaveDelay)
  }

  // 행 클릭 핸들러
  function handleRowClick(row) {
    console.log('[useSidebarNavigation] handleRowClick 호출', {
      rowId: row[itemIdKey],
      isSidebarDetailViewActive: isSidebarDetailViewActive.value,
      partsDataStore_isSidebarDetailViewActive: partsDataStore.isSidebarDetailViewActive,
    })
    ensureSidebarModeAndView()

    // 클릭으로 선택된 항목을 store에 설정 (사이드바에서 추가 작업 가능하도록)
    partsDataStore.selectedPartClass = row
    partsDataStore.selectedPartClasses = [row]

    // selectedRowId도 즉시 업데이트 (onContainerMouseLeave에서 체크하기 위해)
    // selectedRowId는 ref이므로 직접 업데이트
    const rowId = row[itemIdKey]
    clickedRowId.value = rowId // 클릭된 항목 ID 추적

    if (selectedRowId && typeof selectedRowId === 'object' && 'value' in selectedRowId) {
      selectedRowId.value = rowId
    } else if (typeof selectedRowId === 'function') {
      // computed인 경우 setter가 있으면 사용
      if (selectedRowId.set) {
        selectedRowId.set(rowId)
      }
    }

    console.log('[useSidebarNavigation] handleRowClick: isSidebarDetailViewActive 체크', {
      isSidebarDetailViewActive_value: isSidebarDetailViewActive.value,
      partsDataStore_isSidebarDetailViewActive: partsDataStore.isSidebarDetailViewActive,
    })
    if (isSidebarDetailViewActive.value) {
      // 사이드바 상세 뷰일 때: 선택만 변경
      console.log('[useSidebarNavigation] handleRowClick: 이미 상세 뷰 활성화됨, 선택만 변경')
      sidebarDetailViewRowId.value = rowId
    } else {
      // 기본 모드일 때: 사이드바 상세 뷰 진입
      console.log('[useSidebarNavigation] handleRowClick: 상세 뷰 활성화')
      partsDataStore.isSidebarDetailViewActive = true
      sidebarDetailViewRowId.value = rowId
      console.log('[useSidebarNavigation] handleRowClick: 상세 뷰 활성화 후', {
        isSidebarDetailViewActive_value: isSidebarDetailViewActive.value,
        partsDataStore_isSidebarDetailViewActive: partsDataStore.isSidebarDetailViewActive,
      })
    }

    // 추가 콜백 호출
    onClick(row)
  }

  // 행 더블 클릭 핸들러
  function handleRowDoubleClick(row) {
    if (isSidebarDetailViewActive.value) {
      // 사이드바 상세 뷰일 때: 해제 (사이드바 호버 뷰로 전환)
      exitSidebarDetailView()
    } else {
      // 기본 모드일 때: 사이드바 상세 뷰 진입
      partsDataStore.isSidebarDetailViewActive = true
      sidebarDetailViewRowId.value = row[itemIdKey]
    }

    // 추가 콜백 호출
    onDoubleClick(row)
  }

  // 사이드바 상세 뷰 해제 함수 (사이드바 호버 뷰로 전환)
  function exitSidebarDetailView() {
    partsDataStore.isSidebarDetailViewActive = false
    sidebarDetailViewRowId.value = null

    // 현재 호버된 행이 있으면 해당 정보를 호버 뷰로 표시
    const currentHoveredRowId = hoveredRowId.value
    if (currentHoveredRowId) {
      // itemsValue가 배열인지 확인
      const itemsArray = Array.isArray(itemsValue.value) ? itemsValue.value : []
      const hoveredItem = itemsArray.find((item) => item && item[itemIdKey] === currentHoveredRowId)
      if (hoveredItem) {
        ensureSidebarModeAndView()
        activateHoverView(hoveredItem)
      } else {
        deactivateHoverView()
      }
    } else {
      deactivateHoverView()
    }
  }

  // 정리 함수
  function cleanup() {
    if (hoverDebounceTimer) {
      clearTimeout(hoverDebounceTimer)
      hoverDebounceTimer = null
    }
    if (mouseLeaveTimer) {
      clearTimeout(mouseLeaveTimer)
      mouseLeaveTimer = null
    }
  }

  return {
    // 상태
    hoveredRowId,
    sidebarDetailViewRowId,
    isSidebarDetailViewActive,

    // 이벤트 핸들러
    onRowMouseEnter,
    onRowMouseLeave,
    onRowMouseMove,
    onContainerMouseLeave,
    handleRowClick,
    handleRowDoubleClick,

    // 유틸리티
    exitSidebarDetailView,
    cleanup,
  }
}
