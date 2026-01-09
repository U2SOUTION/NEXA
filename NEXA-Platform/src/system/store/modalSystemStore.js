/**
 * modalSystemStore.js
 * 모달 시스템 전역 상태 관리
 *
 * 기능:
 * - 모든 모달의 위치/크기 상태 관리
 * - 모달 스택 관리 (여러 모달 열림 상태)
 * - 전역 단축키 등록/관리
 * - 모달 간 상호작용 (전환, 최소화, 최대화 등)
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useModalSystemStore = defineStore('modalSystem', () => {
  // ===== 전역 상태 =====

  // 모달 레지스트리 (모든 등록된 모달 정보)
  // key: modalId, value: { id, position, size, features, ... }
  const modalRegistry = ref(new Map())

  // 최대화 전 원본 상태 저장 (복원용)
  // key: modalId, value: { position, size }
  const preMaximizeState = ref(new Map())

  // 모달 스택 (열린 순서대로 관리)
  const modalStack = ref([])

  // 현재 활성 모달 ID
  const activeModalId = ref(null)

  // 전역 단축키 활성화 여부
  const shortcutsEnabled = ref(true)

  // localStorage 저장을 위한 debounce 타이머
  const saveTimers = new Map()

  // ===== 설정 =====

  // 기본 설정
  const defaultConfig = {
    minWidth: 300,
    minHeight: 200,
    maxWidth: window.innerWidth * 0.9,
    maxHeight: window.innerHeight * 0.9,
    rememberPosition: true, // 위치/크기 기억
    snapToEdges: true, // 화면 가장자리에 맞춤
    snapThreshold: 20, // 스냅 임계값 (px)
  }

  // ===== 모달 등록/해제 =====

  /**
   * 모달 등록
   * @param {string} modalId - 모달 고유 ID
   * @param {Object} config - 모달 설정
   */
  function registerModal(modalId, config = {}) {
    // 저장된 상태는 loadModalState에서 가져오지만,
    // config에 명시적으로 전달된 값이 우선순위가 높음
    // savedState는 useDraggableResizableModal에서 이미 처리되므로 여기서는 사용하지 않음

    modalRegistry.value.set(modalId, {
      id: modalId,
      position: config.position || { x: 0, y: 0 },
      size: config.size || { width: 600, height: 400 },
      features: {
        minimized: false,
        maximized: false,
        pinned: false, // 항상 위에 고정
        ...config.features,
      },
      zIndex: getNextZIndex(),
      ...config,
    })
  }

  /**
   * 모달 해제
   * @param {string} modalId - 모달 고유 ID
   */
  function unregisterModal(modalId) {
    // 모달 해제 시 즉시 저장 (debounce 타이머가 있으면 취소하고 즉시 저장)
    if (saveTimers.has(modalId)) {
      clearTimeout(saveTimers.get(modalId))
      saveTimers.delete(modalId)
      saveModalState(modalId) // 즉시 저장
    }

    modalRegistry.value.delete(modalId)
    preMaximizeState.value.delete(modalId) // 최대화 전 상태도 정리
    removeFromStack(modalId)
    if (activeModalId.value === modalId) {
      activeModalId.value = modalStack.value.length > 0 ? modalStack.value[modalStack.value.length - 1] : null
    }
  }

  // ===== 모달 스택 관리 =====

  /**
   * 모달을 스택에 추가 (열림)
   * @param {string} modalId - 모달 ID
   */
  function addToStack(modalId) {
    if (!modalStack.value.includes(modalId)) {
      modalStack.value.push(modalId)
      activeModalId.value = modalId
      bringToFront(modalId)
    }
  }

  /**
   * 모달을 스택에서 제거 (닫힘)
   * @param {string} modalId - 모달 ID
   */
  function removeFromStack(modalId) {
    const index = modalStack.value.indexOf(modalId)
    if (index > -1) {
      modalStack.value.splice(index, 1)
      if (activeModalId.value === modalId) {
        activeModalId.value = modalStack.value.length > 0 ? modalStack.value[modalStack.value.length - 1] : null
      }
    }
  }

  /**
   * 모달을 맨 앞으로 가져오기
   * @param {string} modalId - 모달 ID
   */
  function bringToFront(modalId) {
    const modal = modalRegistry.value.get(modalId)
    if (modal) {
      modal.zIndex = getNextZIndex()
      activeModalId.value = modalId

      // 스택에서도 맨 위로 이동
      const index = modalStack.value.indexOf(modalId)
      if (index > -1) {
        modalStack.value.splice(index, 1)
        modalStack.value.push(modalId)
      }
    }
  }

  /**
   * 다음 z-index 계산
   * @returns {number} 다음 z-index 값
   */
  function getNextZIndex() {
    let maxZIndex = 2000 // 기본 시작값
    modalRegistry.value.forEach((modal) => {
      if (modal.zIndex > maxZIndex) {
        maxZIndex = modal.zIndex
      }
    })
    return maxZIndex + 1
  }

  // ===== 위치/크기 관리 =====

  /**
   * 모달 위치 업데이트
   * @param {string} modalId - 모달 ID
   * @param {Object} position - 새 위치 { x, y }
   */
  function updatePosition(modalId, position) {
    const modal = modalRegistry.value.get(modalId)
    if (modal) {
      // Map의 반응성을 보장하기 위해 새 Map을 생성하여 할당
      // Vue 3에서 Map.set()은 반응성을 트리거하지 않으므로 새 Map을 생성해야 함
      const newRegistry = new Map(modalRegistry.value)
      newRegistry.set(modalId, {
        ...modal,
        position: { ...modal.position, ...position },
      })
      modalRegistry.value = newRegistry
      if (defaultConfig.rememberPosition) {
        debouncedSaveModalState(modalId)
      }
    }
  }

  /**
   * 모달 크기 업데이트
   * @param {string} modalId - 모달 ID
   * @param {Object} size - 새 크기 { width, height }
   */
  function updateSize(modalId, size) {
    const modal = modalRegistry.value.get(modalId)
    if (modal) {
      // Map의 반응성을 보장하기 위해 새 Map을 생성하여 할당
      // Vue 3에서 Map.set()은 반응성을 트리거하지 않으므로 새 Map을 생성해야 함
      const newRegistry = new Map(modalRegistry.value)
      newRegistry.set(modalId, {
        ...modal,
        size: { ...modal.size, ...size },
      })
      modalRegistry.value = newRegistry
      // 크기는 저장하지 않음 (위치만 저장)
      // updateSize는 메모리 내 상태만 업데이트하고 localStorage에는 저장하지 않음
    }
  }

  /**
   * 모달 상태 가져오기
   * @param {string} modalId - 모달 ID
   * @returns {Object|null} 모달 상태
   */
  function getModalState(modalId) {
    return modalRegistry.value.get(modalId) || null
  }

  // ===== 기능 관리 =====

  /**
   * 모달 최소화
   * @param {string} modalId - 모달 ID
   */
  function minimizeModal(modalId) {
    const modal = modalRegistry.value.get(modalId)
    if (modal) {
      modal.features.minimized = true
      modal.features.maximized = false
    }
  }

  /**
   * 모달 최대화
   * @param {string} modalId - 모달 ID
   */
  function maximizeModal(modalId) {
    const modal = modalRegistry.value.get(modalId)
    if (modal && !modal.features.maximized) {
      // 최대화 전 상태 저장 (복원용)
      preMaximizeState.value.set(modalId, {
        position: { ...modal.position },
        size: { ...modal.size },
      })
      // Map의 반응성을 보장하기 위해 새 Map을 생성하여 할당
      const newRegistry = new Map(modalRegistry.value)
      newRegistry.set(modalId, {
        ...modal,
        features: {
          ...modal.features,
          maximized: true,
          minimized: false,
        },
      })
      modalRegistry.value = newRegistry
    }
  }

  /**
   * 모달 복원 (최소화/최대화 해제)
   * @param {string} modalId - 모달 ID
   */
  function restoreModal(modalId) {
    const modal = modalRegistry.value.get(modalId)
    if (modal) {
      // 최대화 전 상태로 복원
      const preState = preMaximizeState.value.get(modalId)
      if (preState) {
        // Map의 반응성을 보장하기 위해 새 Map을 생성하여 할당
        const newRegistry = new Map(modalRegistry.value)
        newRegistry.set(modalId, {
          ...modal,
          position: preState.position,
          size: preState.size,
          features: {
            ...modal.features,
            minimized: false,
            maximized: false,
          },
        })
        modalRegistry.value = newRegistry
        preMaximizeState.value.delete(modalId)
      } else {
        // 최대화 전 상태가 없으면 features만 변경
        const newRegistry = new Map(modalRegistry.value)
        newRegistry.set(modalId, {
          ...modal,
          features: {
            ...modal.features,
            minimized: false,
            maximized: false,
          },
        })
        modalRegistry.value = newRegistry
      }
    }
  }

  /**
   * 모달 최대화 해제 (별칭 함수)
   * @param {string} modalId - 모달 ID
   */
  function unmaximizeModal(modalId) {
    restoreModal(modalId)
  }

  /**
   * 모든 모달 최소화
   */
  function minimizeAllModals() {
    modalStack.value.forEach((modalId) => {
      minimizeModal(modalId)
    })
  }

  /**
   * 모든 모달 복원
   */
  function restoreAllModals() {
    modalStack.value.forEach((modalId) => {
      restoreModal(modalId)
    })
  }

  // ===== localStorage 관리 =====

  /**
   * 모달 상태 저장 (즉시 저장)
   * 크기는 저장하지 않고 위치만 저장
   * @param {string} modalId - 모달 ID
   */
  function saveModalState(modalId) {
    const modal = modalRegistry.value.get(modalId)
    if (modal) {
      try {
        const state = {
          position: modal.position,
          // size는 저장하지 않음 - 항상 initialSize 사용
        }
        localStorage.setItem(`modal-state-${modalId}`, JSON.stringify(state))
      } catch (error) {
        console.error(`[ModalSystemStore] Failed to save state for ${modalId}:`, error)
      }
    }
  }

  /**
   * 모달 상태 저장 (debounced - 500ms 지연)
   * 드래그/리사이즈 중에는 매번 저장하지 않고 일정 시간 후에 저장하여 성능 개선
   * @param {string} modalId - 모달 ID
   */
  function debouncedSaveModalState(modalId) {
    // 기존 타이머가 있으면 취소
    if (saveTimers.has(modalId)) {
      clearTimeout(saveTimers.get(modalId))
    }

    // 500ms 후에 저장
    const timer = setTimeout(() => {
      saveModalState(modalId)
      saveTimers.delete(modalId)
    }, 500)

    saveTimers.set(modalId, timer)
  }

  /**
   * 모달 상태 로드
   * @param {string} modalId - 모달 ID
   * @returns {Object|null} 저장된 상태
   */
  function loadModalState(modalId) {
    try {
      const saved = localStorage.getItem(`modal-state-${modalId}`)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error(`[ModalSystemStore] Failed to load state for ${modalId}:`, error)
      return null
    }
  }

  // ===== 전역 단축키 =====

  let keyboardListeners = []

  /**
   * 전역 단축키 등록
   */
  function setupGlobalShortcuts() {
    if (keyboardListeners.length > 0) {
      return // 이미 등록됨
    }

    const handleKeyDown = (event) => {
      if (!shortcutsEnabled.value) return

      // 입력 필드에 포커스가 있으면 무시
      const activeElement = document.activeElement
      const isInputField = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable || activeElement.closest('input, textarea, [contenteditable]'))

      if (isInputField && !event.ctrlKey && !event.metaKey) {
        return // Ctrl/Cmd 조합이 아니면 입력 필드에서는 무시
      }

      // ESC: 현재 활성 모달 닫기
      if (event.key === 'Escape' && activeModalId.value) {
        event.preventDefault()
        event.stopPropagation()
        // 모달 닫기는 각 모달 컴포넌트에서 처리 (emit으로 전달)
        return
      }

      // Ctrl+W: 현재 활성 모달 닫기
      if ((event.ctrlKey || event.metaKey) && event.key === 'w') {
        if (activeModalId.value) {
          event.preventDefault()
          event.stopPropagation()
          // 모달 닫기는 각 모달 컴포넌트에서 처리
        }
        return
      }

      // Ctrl+M: 모든 모달 최소화/복원 토글
      if ((event.ctrlKey || event.metaKey) && event.key === 'm' && !event.shiftKey) {
        event.preventDefault()
        const allMinimized = modalStack.value.every((id) => modalRegistry.value.get(id)?.features.minimized)
        if (allMinimized) {
          restoreAllModals()
        } else {
          minimizeAllModals()
        }
        return
      }

      // Ctrl+Tab: 다음 모달로 전환
      if ((event.ctrlKey || event.metaKey) && event.key === 'Tab' && !event.shiftKey) {
        if (modalStack.value.length > 1) {
          event.preventDefault()
          const currentIndex = modalStack.value.indexOf(activeModalId.value)
          const nextIndex = (currentIndex + 1) % modalStack.value.length
          bringToFront(modalStack.value[nextIndex])
        }
        return
      }

      // Ctrl+Shift+Tab: 이전 모달로 전환
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'Tab') {
        if (modalStack.value.length > 1) {
          event.preventDefault()
          const currentIndex = modalStack.value.indexOf(activeModalId.value)
          const prevIndex = currentIndex === 0 ? modalStack.value.length - 1 : currentIndex - 1
          bringToFront(modalStack.value[prevIndex])
        }
        return
      }

      // Ctrl+Arrow: 활성 모달 이동 (향후 구현)
      // Ctrl+Shift+Arrow: 활성 모달 크기 조정 (향후 구현)
    }

    window.addEventListener('keydown', handleKeyDown)
    keyboardListeners.push({ type: 'keydown', handler: handleKeyDown })
  }

  /**
   * 전역 단축키 해제
   */
  function cleanupGlobalShortcuts() {
    keyboardListeners.forEach(({ type, handler }) => {
      window.removeEventListener(type, handler)
    })
    keyboardListeners = []
  }

  // ===== Computed =====

  const activeModal = computed(() => {
    return activeModalId.value ? modalRegistry.value.get(activeModalId.value) : null
  })

  const openModalsCount = computed(() => modalStack.value.length)

  // ===== 초기화 =====

  // 앱 시작 시 전역 단축키 등록
  setupGlobalShortcuts()

  return {
    // 상태
    modalRegistry,
    modalStack,
    activeModalId,
    activeModal,
    openModalsCount,
    shortcutsEnabled,

    // 모달 등록/해제
    registerModal,
    unregisterModal,

    // 스택 관리
    addToStack,
    removeFromStack,
    bringToFront,

    // 위치/크기
    updatePosition,
    updateSize,
    getModalState,

    // 기능
    minimizeModal,
    maximizeModal,
    restoreModal,
    unmaximizeModal,
    minimizeAllModals,
    restoreAllModals,

    // 단축키
    setupGlobalShortcuts,
    cleanupGlobalShortcuts,

    // 유틸리티
    getNextZIndex,
    saveModalState,
    loadModalState,
  }
})
