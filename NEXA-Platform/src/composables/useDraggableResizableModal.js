/**
 * useDraggableResizableModal.js
 * 드래그 가능하고 크기 조정 가능한 모달 Composable
 *
 * FLIP 애니메이션 사용 이유: Vue의 transition-group이 Quasar 컴포넌트와 함께 사용 시
 * 배열 순서 변경을 제대로 감지하지 못하여 수동으로 FLIP 기법을 구현
 *
 * @param {string} modalId - 모달 고유 ID
 * @param {Object} options - 옵션
 * @param {Object} options.initialPosition - 초기 위치 { x, y }
 * @param {Object} options.initialSize - 초기 크기 { width, height }
 * @param {boolean} options.draggable - 드래그 가능 여부 (기본: true)
 * @param {boolean} options.resizable - 리사이즈 가능 여부 (기본: true)
 * @param {boolean} options.rememberPosition - 위치/크기 기억 여부 (기본: true)
 * @param {Object} options.minSize - 최소 크기 { width, height }
 * @param {Object} options.maxSize - 최대 크기 { width, height }
 *
 * @returns {Object} 드래그/리사이즈 관련 함수 및 상태
 *
 * @example
 * const {
 *   position,
 *   size,
 *   modalStyle,
 *   handleDragStart,
 *   handleResizeStart,
 *   registerModal,
 *   unregisterModal
 * } = useDraggableResizableModal('my-modal', {
 *   initialSize: { width: 600, height: 400 }
 * })
 */
import { ref, computed, nextTick } from 'vue'
import { useModalSystemStore } from 'src/stores/modalSystemStore'

export function useDraggableResizableModal(modalId, options = {}) {
  const modalStore = useModalSystemStore()

  // ===== 옵션 =====
  const { initialPosition = { x: 0, y: 0 }, initialSize = { width: 500, height: 600 }, draggable = true, resizable = true, rememberPosition = true, minSize = { width: 300, height: 400 }, maxSize = { width: window.innerWidth * 0.9, height: window.innerHeight * 0.9 } } = options

  // ===== 상태 =====
  const position = ref({ ...initialPosition })
  const size = ref({ ...initialSize })
  // 동적 최소 크기 (콘텐츠에 따라 업데이트 가능)
  const dynamicMinSize = ref({ ...minSize })
  const isDragging = ref(false)
  const isResizing = ref(false)
  const dragStartPos = ref({ x: 0, y: 0 })
  const resizeStartPos = ref({ x: 0, y: 0 })
  const resizeStartSize = ref({ width: 0, height: 0 })
  const resizeDirection = ref(null) // 'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'
  const modalElementRef = ref(null) // 실제 DOM 요소 참조

  // ===== 모달 스타일 계산 =====
  const modalStyle = computed(() => {
    const modal = modalStore.getModalState(modalId)
    if (!modal) {
      // 모달이 등록되지 않았을 때 기본 스타일
      return {
        position: 'fixed',
      }
    }

    const { features } = modal
    const baseStyle = {
      position: 'fixed',
      left: `${modal.position.x}px`,
      top: `${modal.position.y}px`,
      width: `${modal.size.width}px`,
      height: `${modal.size.height}px`,
      zIndex: modal.zIndex,
      // 리사이즈 핸들을 위한 기준점 설정
      // fixed 요소 내부의 absolute 요소를 위한 relative 컨텍스트
    }

    // 최소화 상태
    if (features.minimized) {
      // 헤더 높이: 패딩 12px * 2 + 타이틀 높이(약 50px) = 약 74px
      // q-card 패딩은 CSS에서 제거되므로 헤더 높이만 고려
      return {
        ...baseStyle,
        height: '74px', // 헤더만 표시
        overflow: 'hidden',
      }
    }

    // 최대화 상태
    if (features.maximized) {
      return {
        position: 'fixed',
        left: '0px',
        top: '0px',
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        minWidth: '100vw',
        minHeight: '100vh',
        zIndex: modal.zIndex,
      }
    }

    return baseStyle
  })

  // ===== 드래그 기능 =====

  /**
   * 드래그 시작
   * @param {MouseEvent} event - 마우스 이벤트
   */
  function handleDragStart(event) {
    if (!draggable) return

    const modal = modalStore.getModalState(modalId)
    if (!modal || !modal.position) return // 모달이 없거나 position이 없으면 드래그 불가
    if (modal?.features?.maximized) return // 최대화 상태에서는 드래그 불가

    isDragging.value = true
    dragStartPos.value = {
      x: event.clientX - modal.position.x,
      y: event.clientY - modal.position.y,
    }

    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('mouseup', handleDragEnd)
    event.preventDefault()
  }

  /**
   * 실제 DOM 요소의 크기 가져오기
   * @returns {Object} { width, height }
   */
  function getActualModalSize() {
    // 실제 DOM 요소가 있으면 그 크기를 사용
    if (modalElementRef.value) {
      const rect = modalElementRef.value.getBoundingClientRect()
      return {
        width: rect.width,
        height: rect.height,
      }
    }

    // DOM 요소가 없으면 Store의 크기 사용
    const modal = modalStore.getModalState(modalId)
    if (modal) {
      return {
        width: modal.size.width,
        height: modal.features.minimized ? 40 : modal.size.height,
      }
    }

    // 기본값
    return {
      width: initialSize.width,
      height: initialSize.height,
    }
  }

  /**
   * 드래그 중
   * @param {MouseEvent} event - 마우스 이벤트
   */
  function handleDragMove(event) {
    if (!isDragging.value) return

    const modal = modalStore.getModalState(modalId)
    if (!modal) return

    let newX = event.clientX - dragStartPos.value.x
    let newY = event.clientY - dragStartPos.value.y

    // 화면 경계 체크
    // 실제 DOM 요소의 크기를 사용하여 정확한 경계 계산
    const actualSize = getActualModalSize()
    const modalWidth = actualSize.width
    const modalHeight = actualSize.height

    // 모달이 완전히 화면 안에 있도록 제한
    const maxX = window.innerWidth - modalWidth
    const maxY = window.innerHeight - modalHeight

    newX = Math.max(0, Math.min(newX, maxX))
    newY = Math.max(0, Math.min(newY, maxY))

    modalStore.updatePosition(modalId, { x: newX, y: newY })
    position.value = { x: newX, y: newY }
  }

  /**
   * 드래그 종료
   */
  function handleDragEnd() {
    isDragging.value = false
    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
  }

  // ===== 리사이즈 기능 =====

  /**
   * 리사이즈 시작
   * @param {MouseEvent} event - 마우스 이벤트
   * @param {string} direction - 리사이즈 방향 ('n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw')
   */
  function handleResizeStart(event, direction) {
    if (!resizable) {
      console.warn('[useDraggableResizableModal] Resize disabled')
      return
    }

    const modal = modalStore.getModalState(modalId)
    if (!modal || modal.features.maximized || modal.features.minimized) {
      return
    }

    isResizing.value = true
    resizeDirection.value = direction
    resizeStartPos.value = { x: event.clientX, y: event.clientY }
    resizeStartSize.value = { ...modal.size }
    position.value = { ...modal.position }

    document.addEventListener('mousemove', handleResizeMove)
    document.addEventListener('mouseup', handleResizeEnd)
    event.preventDefault()
    event.stopPropagation()
  }

  /**
   * 리사이즈 중
   * @param {MouseEvent} event - 마우스 이벤트
   */
  function handleResizeMove(event) {
    if (!isResizing.value) return

    const modal = modalStore.getModalState(modalId)
    if (!modal) return

    const deltaX = event.clientX - resizeStartPos.value.x
    const deltaY = event.clientY - resizeStartPos.value.y
    const direction = resizeDirection.value

    let newWidth = resizeStartSize.value.width
    let newHeight = resizeStartSize.value.height
    let newX = modal.position.x
    let newY = modal.position.y

    // 방향에 따른 크기 조정
    const hasEast = direction.includes('e')
    const hasWest = direction.includes('w')
    const hasSouth = direction.includes('s')
    const hasNorth = direction.includes('n')

    // 현재 화면 크기를 기준으로 최대 크기 계산 (동적으로 업데이트)
    const currentMaxWidth = Math.min(maxSize.width, window.innerWidth * 0.95) // 화면 너비의 95% 또는 설정된 maxSize 중 작은 값
    const currentMaxHeight = Math.min(maxSize.height, window.innerHeight * 0.95) // 화면 높이의 95% 또는 설정된 maxSize 중 작은 값

    if (hasEast) {
      // 동쪽(오른쪽)으로 리사이즈: 너비 증가
      newWidth = Math.max(dynamicMinSize.value.width, Math.min(currentMaxWidth, resizeStartSize.value.width + deltaX))
    }
    if (hasWest) {
      // 서쪽(왼쪽)으로 리사이즈: 너비 감소, 위치 조정
      newWidth = Math.max(dynamicMinSize.value.width, Math.min(currentMaxWidth, resizeStartSize.value.width - deltaX))
      newX = modal.position.x + (resizeStartSize.value.width - newWidth)
    }
    if (hasSouth) {
      // 남쪽(아래)으로 리사이즈: 높이 증가
      newHeight = Math.max(dynamicMinSize.value.height, Math.min(currentMaxHeight, resizeStartSize.value.height + deltaY))
    }
    if (hasNorth) {
      // 북쪽(위)으로 리사이즈: 높이 감소, 위치 조정
      newHeight = Math.max(dynamicMinSize.value.height, Math.min(currentMaxHeight, resizeStartSize.value.height - deltaY))
      newY = modal.position.y + (resizeStartSize.value.height - newHeight)
    }

    // 화면 경계 체크 (모달이 화면 밖으로 나가지 않도록)
    // maxSize로 이미 제한되지만, 위치 조정 시 추가 경계 체크 필요
    if (newX < 0) {
      newWidth += newX
      newX = 0
    }
    if (newY < 0) {
      newHeight += newY
      newY = 0
    }
    if (newX + newWidth > window.innerWidth) {
      newWidth = window.innerWidth - newX
    }
    if (newY + newHeight > window.innerHeight) {
      newHeight = window.innerHeight - newY
    }

    // Store 업데이트
    modalStore.updatePosition(modalId, { x: newX, y: newY })
    modalStore.updateSize(modalId, { width: newWidth, height: newHeight })
    position.value = { x: newX, y: newY }
    size.value = { width: newWidth, height: newHeight }
  }

  /**
   * 리사이즈 종료
   */
  function handleResizeEnd() {
    // 리사이즈 종료 시 최소 크기 확인 및 조정
    const modal = modalStore.getModalState(modalId)
    if (modal) {
      let needsUpdate = false
      const updatedSize = { ...modal.size }

      if (updatedSize.width < dynamicMinSize.value.width) {
        updatedSize.width = dynamicMinSize.value.width
        needsUpdate = true
      }
      if (updatedSize.height < dynamicMinSize.value.height) {
        updatedSize.height = dynamicMinSize.value.height
        needsUpdate = true
      }

      if (needsUpdate) {
        modalStore.updateSize(modalId, updatedSize)
        size.value = updatedSize
      }
    }

    isResizing.value = false
    document.removeEventListener('mousemove', handleResizeMove)
    document.removeEventListener('mouseup', handleResizeEnd)
  }

  // ===== 모달 등록/해제 =====

  /**
   * 저장된 위치가 유효한지 검증
   * @param {Object} pos - 위치 { x, y }
   * @param {Object} size - 크기 { width, height }
   * @returns {boolean} 유효 여부
   */
  function isValidPosition(pos, size) {
    if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
      return false
    }

    // 화면 밖에 있으면 유효하지 않음
    const maxX = window.innerWidth - (size?.width || initialSize.width)
    const maxY = window.innerHeight - (size?.height || initialSize.height)

    // (0, 0) 근처에 있으면 유효하지 않음 (초기화되지 않은 상태로 간주)
    const isNearOrigin = pos.x < 50 && pos.y < 50

    return pos.x >= 0 && pos.y >= 0 && pos.x <= maxX && pos.y <= maxY && !isNearOrigin
  }

  /**
   * 중앙 위치 계산 (실제 DOM 크기 사용)
   * @returns {Object} { x, y }
   */

  /**
   * 모달 등록 (Store에 등록)
   * 내부 함수 - initializeModal에서 호출
   */
  function registerModal() {
    const savedState = rememberPosition ? modalStore.loadModalState(modalId) : null

    // 저장된 위치가 있으면 사용 (크기는 항상 initialSize 사용)
    let finalPosition = initialPosition
    // 크기는 항상 initialSize 사용 (저장된 크기는 사용하지 않음)
    let finalSize = {
      width: Math.max(initialSize.width, minSize.width),
      height: Math.max(initialSize.height, minSize.height),
    }
    let shouldCalculateCenter = true

    if (savedState && savedState.position) {
      // 저장된 위치만 사용 (크기는 사용하지 않음)
      // 위치가 유효한지 검증 (초기 크기로 검증)
      if (isValidPosition(savedState.position, finalSize)) {
        finalPosition = savedState.position
        shouldCalculateCenter = false
      } else {
        // 유효하지 않은 위치는 무시하고 중앙 위치로 설정
        shouldCalculateCenter = true
      }
    }

    // 저장된 위치가 없거나 유효하지 않으면 임시로 초기 위치 사용
    // 실제 DOM 크기 측정 후 중앙 위치로 재계산
    modalStore.registerModal(modalId, {
      position: finalPosition,
      size: finalSize,
      features: {
        minimized: false,
        maximized: false,
        pinned: false,
      },
    })

    // Store의 상태와 동기화
    const modal = modalStore.getModalState(modalId)
    if (modal) {
      position.value = modal.position
      size.value = modal.size
    }

    // 저장된 위치가 없거나 유효하지 않을 때 실제 DOM 크기로 중앙 위치 계산
    if (shouldCalculateCenter) {
      // DOM이 완전히 렌더링될 때까지 대기 후 중앙 위치 계산
      let retryCount = 0
      const maxRetries = 10

      const calculateCenter = () => {
        if (!modalElementRef.value) {
          // DOM이 아직 준비되지 않았으면 다음 프레임에 재시도
          if (retryCount < maxRetries) {
            retryCount++
            requestAnimationFrame(calculateCenter)
          }
          return
        }

        const rect = modalElementRef.value.getBoundingClientRect()

        // modal-wrapper의 실제 크기 사용
        let actualWidth = rect.width
        let actualHeight = rect.height

        // 최소 유효 크기 확인 (초기 크기의 80% 이상)
        const minValidWidth = initialSize.width * 0.8
        const minValidHeight = initialSize.height * 0.8

        // 실제 크기가 초기 크기나 최소 크기보다 작으면 더 큰 값 사용 (스토리지에 정보가 없을 때 작게 뜨는 문제 해결)
        const minRequiredWidth = Math.max(initialSize.width, minSize.width)
        const minRequiredHeight = Math.max(initialSize.height, minSize.height)

        if (actualWidth < minRequiredWidth) {
          actualWidth = minRequiredWidth
        }
        if (actualHeight < minRequiredHeight) {
          actualHeight = minRequiredHeight
        }

        // 유효한 크기인지 확인
        if (actualWidth >= minValidWidth && actualHeight >= minValidHeight) {
          // 중앙 위치 계산
          const centerX = (window.innerWidth - actualWidth) / 2
          const centerY = (window.innerHeight - actualHeight) / 2

          const centerPosition = {
            x: Math.max(0, Math.round(centerX)),
            y: Math.max(0, Math.round(centerY)),
          }

          // 위치와 크기 업데이트
          modalStore.updatePosition(modalId, centerPosition)
          modalStore.updateSize(modalId, {
            width: Math.round(actualWidth),
            height: Math.round(actualHeight),
          })

          // 로컬 상태 동기화
          position.value = centerPosition
          size.value = {
            width: Math.round(actualWidth),
            height: Math.round(actualHeight),
          }
        } else {
          // 크기가 유효하지 않으면 약간의 지연 후 재시도
          if (retryCount < maxRetries) {
            retryCount++
            setTimeout(() => {
              if (modalElementRef.value) {
                calculateCenter()
              }
            }, 100)
          } else {
            // 최대 재시도 횟수 초과 시 초기 크기와 최소 크기 중 더 큰 값 사용
            const fallbackSize = {
              width: Math.max(initialSize.width, minSize.width),
              height: Math.max(initialSize.height, minSize.height),
            }
            const centerX = (window.innerWidth - fallbackSize.width) / 2
            const centerY = (window.innerHeight - fallbackSize.height) / 2

            const centerPosition = {
              x: Math.max(0, Math.round(centerX)),
              y: Math.max(0, Math.round(centerY)),
            }

            modalStore.updatePosition(modalId, centerPosition)
            modalStore.updateSize(modalId, fallbackSize)

            position.value = centerPosition
            size.value = fallbackSize
          }
        }
      }

      // nextTick 후 계산 시작
      nextTick(() => {
        requestAnimationFrame(calculateCenter)
      })
    }
  }

  /**
   * 모달 해제 (Store에서 제거)
   * 내부 함수 - cleanupModal에서 호출
   */
  function unregisterModal() {
    modalStore.removeFromStack(modalId)
    modalStore.unregisterModal(modalId)
  }

  // ===== 위치/크기 동기화 =====

  /**
   * Store의 상태를 로컬 상태와 동기화
   */
  function syncWithStore() {
    const modal = modalStore.getModalState(modalId)
    if (modal) {
      position.value = modal.position
      size.value = modal.size
    }
  }

  // ===== 라이프사이클 =====

  // Store 상태 변경 감지 (자동 동기화)
  let unwatch = null

  /**
   * 컨텐츠 크기에 맞춰 모달 크기 조정
   * 저장된 크기가 있더라도 컨텐츠가 더 크면 컨텐츠에 맞춰 늘림
   */
  function adjustSizeToContent() {
    if (!modalElementRef.value) return

    const modal = modalStore.getModalState(modalId)
    if (!modal || modal.features?.minimized || modal.features?.maximized) return

    // 헤더와 푸터 높이 계산
    const header = modalElementRef.value.querySelector('.base-modal-header')
    const footer = modalElementRef.value.querySelector('.base-modal-footer')
    const headerHeight = header ? header.offsetHeight : 0
    const footerHeight = footer ? footer.offsetHeight : 0

    // 컨텐츠 영역 찾기 (.base-modal-body 또는 .base-modal-content)
    const bodyArea = modalElementRef.value.querySelector('.base-modal-body')
    const contentArea = bodyArea?.querySelector('.base-modal-content') || bodyArea?.querySelector('.base-modal-tab-panels-wrapper')

    if (!contentArea) return

    // 컨텐츠의 실제 스크롤 높이 측정
    // scrollHeight는 스크롤 가능한 전체 콘텐츠 높이를 반환 (padding 포함)
    const contentScrollHeight = contentArea.scrollHeight

    // 필요한 전체 높이 계산 (헤더 + 컨텐츠 + 푸터 + 보더)
    const borderWidth = 2 // base-modal-card의 border
    const requiredHeight = headerHeight + contentScrollHeight + footerHeight + borderWidth

    // 현재 높이와 비교하여 더 큰 값 사용 (단, 최대 크기 제한 내에서)
    const currentHeight = modal.size.height
    const newHeight = Math.min(Math.max(requiredHeight, currentHeight, minSize.height), maxSize.height)

    // 높이가 실제로 더 크게 필요하면 업데이트 (약간의 여유를 두고 비교)
    if (newHeight > currentHeight + 5) {
      // 5px 여유로 작은 차이는 무시
      modalStore.updateSize(modalId, {
        width: modal.size.width,
        height: newHeight,
      })
      size.value = {
        width: modal.size.width,
        height: newHeight,
      }
    }
  }

  // 모달 등록 함수 (외부에서 호출)
  function initializeModal() {
    registerModal()
    syncWithStore()

    // Store 상태 변경 감지
    unwatch = modalStore.$subscribe(() => {
      syncWithStore()
    })

    // DOM 렌더링 후 컨텐츠 크기에 맞춰 조정
    nextTick(() => {
      // 약간의 지연을 두어 컨텐츠가 완전히 렌더링되도록 함
      setTimeout(() => {
        adjustSizeToContent()
      }, 100)
    })
  }

  // 모달 정리 함수 (외부에서 호출)
  function cleanupModal() {
    if (unwatch) {
      unwatch()
      unwatch = null
    }
    handleDragEnd()
    handleResizeEnd()
    unregisterModal()
  }

  /**
   * 동적 최소 크기 업데이트
   * @param {Object} newMinSize - 새 최소 크기 { width?, height? }
   * @param {boolean} forceUpdate - true면 현재 모달 크기를 강제로 조정하지 않음 (기본값: false)
   */
  function updateMinSize(newMinSize, forceUpdate = false) {
    if (newMinSize.width !== undefined) {
      dynamicMinSize.value.width = Math.max(minSize.width, newMinSize.width)
    }
    if (newMinSize.height !== undefined) {
      dynamicMinSize.value.height = Math.max(minSize.height, newMinSize.height)
    }

    // forceUpdate가 false일 때만 현재 크기가 새로운 최소 크기보다 작으면 조정
    // forceUpdate가 true면 최소 높이만 설정하고 현재 크기는 조정하지 않음
    if (!forceUpdate) {
      const modal = modalStore.getModalState(modalId)
      if (modal) {
        let needsUpdate = false
        const updatedSize = { ...modal.size }

        if (updatedSize.width < dynamicMinSize.value.width) {
          updatedSize.width = dynamicMinSize.value.width
          needsUpdate = true
        }
        if (updatedSize.height < dynamicMinSize.value.height) {
          updatedSize.height = dynamicMinSize.value.height
          needsUpdate = true
        }

        if (needsUpdate) {
          modalStore.updateSize(modalId, updatedSize)
          size.value = updatedSize
        }
      }
    }
  }

  /**
   * 동적 최소 크기 리셋 (초기값으로 복원)
   */
  function resetMinSize() {
    dynamicMinSize.value = { ...minSize }
  }

  return {
    // 상태
    position,
    size,
    isDragging,
    isResizing,
    modalStyle,
    modalElementRef, // 실제 DOM 요소 참조

    // 드래그
    handleDragStart,

    // 리사이즈
    handleResizeStart,

    // 모달 관리
    registerModal,
    unregisterModal,
    syncWithStore,
    initializeModal,
    cleanupModal,

    // 유틸리티
    getActualModalSize,
    updateMinSize, // 동적 최소 크기 업데이트
    resetMinSize, // 동적 최소 크기 리셋

    // Store 접근
    modalStore,
  }
}
