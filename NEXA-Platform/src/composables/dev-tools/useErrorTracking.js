/**
 * 에러 트래킹 관리 Composable
 *
 * 에러 트래킹의 상태 관리, 에러 수집, 필터링 등을 담당합니다.
 */

import { ref, computed } from 'vue'
import { loadErrors, saveErrors, updateError as updateErrorStorage, deleteError as deleteErrorStorage } from 'src/utils/error-tracking/errorStorage.js'
import { setCollectingEnabled } from 'src/utils/error-tracking/errorCollector.js'

/**
 * 에러 트래킹 관리 Composable
 * @returns {Object} 에러 트래킹 관련 상태 및 함수
 */
export function useErrorTracking() {
  // ============================================
  // 상태 관리
  // ============================================
  const errors = ref([]) // 에러 목록
  const selectedError = ref(null) // 선택된 에러
  const searchQuery = ref('') // 검색 쿼리
  const isCollecting = ref(true) // 에러 수집 활성화 여부
  const isLoading = ref(false) // 로딩 상태

  // 필터 상태
  const filterLevel = ref(null) // 에러 레벨 필터
  const filterStatus = ref(null) // 에러 상태 필터
  const filterTimeRange = ref(null) // 시간 범위 필터
  const sortOption = ref('newest') // 정렬 옵션

  // ============================================
  // Computed
  // ============================================

  /**
   * 필터링된 에러 목록
   */
  const filteredErrors = computed(() => {
    let result = [...errors.value]

    // 레벨 필터
    if (filterLevel.value) {
      result = result.filter((error) => error.level === filterLevel.value)
    }

    // 상태 필터
    if (filterStatus.value) {
      result = result.filter((error) => error.status === filterStatus.value)
    }

    // 시간 범위 필터
    if (filterTimeRange.value) {
      const now = Date.now()
      const timeRanges = {
        today: 24 * 60 * 60 * 1000,
        yesterday: 2 * 24 * 60 * 60 * 1000,
        '7days': 7 * 24 * 60 * 60 * 1000,
        '30days': 30 * 24 * 60 * 60 * 1000,
      }
      const range = timeRanges[filterTimeRange.value]
      if (range) {
        result = result.filter((error) => {
          const errorTime = new Date(error.timestamp).getTime()
          return now - errorTime < range
        })
      }
    }

    // 검색 필터
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter((error) => {
        const message = (error.message || '').toLowerCase()
        const file = (error.file || '').toLowerCase()
        const stack = (error.stack || '').toLowerCase()
        return message.includes(query) || file.includes(query) || stack.includes(query)
      })
    }

    // 정렬
    result.sort((a, b) => {
      switch (sortOption.value) {
        case 'newest':
          return new Date(b.timestamp) - new Date(a.timestamp)
        case 'frequency':
          return (b.count || 1) - (a.count || 1)
        case 'severity': {
          const severityOrder = { error: 3, warning: 2, unhandled: 1 }
          return (severityOrder[b.level] || 0) - (severityOrder[a.level] || 0)
        }
        default:
          return 0
      }
    })

    return result
  })

  /**
   * 통계 정보
   */
  const statistics = computed(() => {
    const total = errors.value.length
    const newCount = errors.value.filter((e) => e.status === 'new').length
    const resolvedCount = errors.value.filter((e) => e.status === 'resolved').length
    const ignoredCount = errors.value.filter((e) => e.status === 'ignored').length

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayCount = errors.value.filter((e) => {
      const errorDate = new Date(e.timestamp)
      return errorDate >= today
    }).length

    return {
      total,
      new: newCount,
      resolved: resolvedCount,
      ignored: ignoredCount,
      today: todayCount,
    }
  })

  // ============================================
  // 핸들러 함수
  // ============================================

  /**
   * 에러 목록 새로고침
   */
  async function refresh() {
    isLoading.value = true
    try {
      // localStorage에서 에러 데이터 로드
      const loadedErrors = loadErrors()
      errors.value = loadedErrors
      console.log('[useErrorTracking] 에러 목록 새로고침 완료:', loadedErrors.length, '개')
    } catch (error) {
      console.error('[useErrorTracking] 에러 목록 새로고침 실패:', error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 에러 추가
   */
  function addError(errorData) {
    if (!isCollecting.value) {
      return
    }

    const error = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      message: errorData.message || '알 수 없는 에러',
      level: errorData.level || 'error',
      file: errorData.file || null,
      line: errorData.line || null,
      column: errorData.column || null,
      stack: errorData.stack || null,
      timestamp: Date.now(),
      status: 'new',
      count: 1,
      url: errorData.url || window.location.href,
      userAgent: errorData.userAgent || navigator.userAgent,
    }

    errors.value.unshift(error)
    
    // localStorage에 저장
    saveErrors(errors.value)

    // 이벤트 전달
    window.dispatchEvent(
      new CustomEvent('error-tracking-error-added', {
        detail: { error },
      }),
    )

    // 통계 업데이트 이벤트
    window.dispatchEvent(
      new CustomEvent('error-tracking-statistics-updated', {
        detail: statistics.value,
      }),
    )
  }

  /**
   * 에러 선택
   */
  function selectError(error) {
    selectedError.value = error
    window.dispatchEvent(
      new CustomEvent('error-tracking-error-selected', {
        detail: { error },
      }),
    )
  }

  /**
   * 검색 변경
   */
  function handleSearchChange(query) {
    searchQuery.value = query
  }

  /**
   * 필터 변경
   */
  function handleFilterChange(filters) {
    filterLevel.value = filters.level
    filterStatus.value = filters.status
    filterTimeRange.value = filters.timeRange
  }

  /**
   * 정렬 변경
   */
  function handleSortChange(option) {
    sortOption.value = option
  }

  /**
   * 수집 토글
   */
  function handleCollectingToggle(enabled) {
    isCollecting.value = enabled
    setCollectingEnabled(enabled)
    window.dispatchEvent(
      new CustomEvent('error-tracking-collecting-toggled', {
        detail: { enabled },
      }),
    )
  }

  /**
   * 에러 상태 변경
   */
  function updateErrorStatus(errorId, status) {
    const error = errors.value.find((e) => e.id === errorId)
    if (error) {
      error.status = status
      updateErrorStorage(errorId, { status })
      saveErrors(errors.value)
      window.dispatchEvent(
        new CustomEvent('error-tracking-statistics-updated', {
          detail: statistics.value,
        }),
      )
    }
  }

  /**
   * 에러 삭제
   */
  function deleteError(errorId) {
    const index = errors.value.findIndex((e) => e.id === errorId)
    if (index !== -1) {
      errors.value.splice(index, 1)
      deleteErrorStorage(errorId)
      saveErrors(errors.value)
      if (selectedError.value?.id === errorId) {
        selectedError.value = null
      }
      window.dispatchEvent(
        new CustomEvent('error-tracking-statistics-updated', {
          detail: statistics.value,
        }),
      )
    }
  }

  /**
   * 초기화
   */
  async function initialize() {
    await refresh()
    
    // 에러 수집 이벤트 리스너 등록
    function handleErrorCollected(event) {
      const newError = event.detail.error
      // 에러 ID 생성
      newError.id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      newError.status = 'new'
      newError.count = 1
      
      // 에러 목록에 추가
      errors.value.unshift(newError)
      saveErrors(errors.value)
      
      // 통계 업데이트
      window.dispatchEvent(
        new CustomEvent('error-tracking-statistics-updated', {
          detail: statistics.value,
        }),
      )
    }
    
    window.addEventListener('error-tracking-error-collected', handleErrorCollected)
    
    // 정리 함수 저장 (나중에 사용 가능)
    return () => {
      window.removeEventListener('error-tracking-error-collected', handleErrorCollected)
    }
  }

  // ============================================
  // 반환
  // ============================================
  return {
    // 상태
    errors,
    selectedError,
    searchQuery,
    isCollecting,
    isLoading,
    filterLevel,
    filterStatus,
    filterTimeRange,
    sortOption,

    // Computed
    filteredErrors,
    statistics,

    // 함수
    refresh,
    addError,
    selectError,
    handleSearchChange,
    handleFilterChange,
    handleSortChange,
    handleCollectingToggle,
    updateErrorStatus,
    deleteError,
    initialize,
  }
}

