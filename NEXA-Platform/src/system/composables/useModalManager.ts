/**
 * 모달 관리 Composable
 * 여러 모달의 열기/닫기 상태를 중앙에서 관리
 *
 * @param {string[]} modalNames - 모달 이름 배열
 * @returns {object} 모달 관리 함수 및 상태
 *
 * @example
 * const {
 *   openModal,
 *   closeModal,
 *   isOpen,
 *   getModalData,
 *   setModalData,
 *   modalState
 * } = useModalManager(['add', 'delete', 'edit'])
 *
 * // 사용
 * openModal('add', { item: selectedItem })
 * isOpen('add') // true
 * getModalData('add') // { item: selectedItem }
 * closeModal('add')
 */
import { computed, reactive } from 'vue'

export function useModalManager(modalNames = []) {
  // 모달 상태 관리 (각 모달의 열림/닫힘 상태)
  const modalStates = reactive({})

  // 모달 데이터 관리 (각 모달에 전달할 데이터)
  const modalData = reactive({})

  // 초기화: 모든 모달을 닫힌 상태로 설정
  modalNames.forEach((name) => {
    modalStates[name] = false
    modalData[name] = null
  })

  /**
   * 모달 열기
   * @param {string} name - 모달 이름
   * @param {unknown} data - 모달에 전달할 데이터 (선택적)
   */
  function openModal(name, data = null) {
    if (!modalNames.includes(name)) {
      console.warn(`[useModalManager] 모달 "${name}"이 등록되지 않았습니다.`)
      return
    }
    modalStates[name] = true
    if (data !== null) {
      modalData[name] = data
    }
  }

  /**
   * 모달 닫기
   * @param {string} name - 모달 이름
   * @param {boolean} clearData - 데이터도 함께 제거할지 여부 (기본: true)
   */
  function closeModal(name, clearData = true) {
    if (!modalNames.includes(name)) {
      console.warn(`[useModalManager] 모달 "${name}"이 등록되지 않았습니다.`)
      return
    }
    modalStates[name] = false
    if (clearData) {
      modalData[name] = null
    }
  }

  /**
   * 모달 열림 상태 확인
   * @param {string} name - 모달 이름
   * @returns {boolean} 모달이 열려있는지 여부
   */
  function isOpen(name) {
    if (!modalNames.includes(name)) {
      return false
    }
    return modalStates[name] === true
  }

  /**
   * 모달 데이터 가져오기
   * @param {string} name - 모달 이름
   * @returns {unknown} 모달 데이터
   */
  function getModalData(name) {
    if (!modalNames.includes(name)) {
      return null
    }
    return modalData[name]
  }

  /**
   * 모달 데이터 설정
   * @param {string} name - 모달 이름
   * @param {unknown} data - 설정할 데이터
   */
  function setModalData(name, data) {
    if (!modalNames.includes(name)) {
      console.warn(`[useModalManager] 모달 "${name}"이 등록되지 않았습니다.`)
      return
    }
    modalData[name] = data
  }

  /**
   * 모든 모달 닫기
   * @param {boolean} clearData - 데이터도 함께 제거할지 여부 (기본: true)
   */
  function closeAllModals(clearData = true) {
    modalNames.forEach((name) => {
      modalStates[name] = false
      if (clearData) {
        modalData[name] = null
      }
    })
  }

  /**
   * 특정 모달의 상태를 computed로 반환 (v-model 바인딩용)
   * @param {string} name - 모달 이름
   * @returns {object} { value, set } 형태의 computed
   */
  function getModalComputed(name) {
    return computed({
      get: () => {
        if (!modalNames.includes(name)) {
          return false
        }
        return modalStates[name] === true
      },
      set: (value) => {
        if (value) {
          openModal(name)
        } else {
          closeModal(name)
        }
      },
    })
  }

  return {
    // 상태
    modalState: modalStates,
    modalData,

    // 함수
    openModal,
    closeModal,
    isOpen,
    getModalData,
    setModalData,
    closeAllModals,
    getModalComputed,
  }
}
