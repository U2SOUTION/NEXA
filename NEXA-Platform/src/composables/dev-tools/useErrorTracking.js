/**
 * 에러 트래킹 관리 Composable
 *
 * 에러 트래킹의 상태 관리, 에러 수집, 필터링 등을 담당합니다.
 */

import { ref, computed, nextTick } from 'vue'
import { loadErrors, saveErrors, updateError as updateErrorStorage, deleteError as deleteErrorStorage } from 'src/utils/error-tracking/errorStorage.js'
import { setCollectingEnabled } from 'src/utils/error-tracking/errorCollector.js'
import { findSimilarErrors, areErrorsSimilar } from 'src/utils/error-tracking/errorGrouper.js'
import { watchFileChanges } from 'src/utils/error-tracking/lintCollector.js'

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

    // 레벨 필터 (lint 타입도 처리)
    if (filterLevel.value) {
      if (filterLevel.value === 'lint') {
        result = result.filter((error) => error.type === 'lint')
      } else {
        result = result.filter((error) => error.level === filterLevel.value && error.type !== 'lint')
      }
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

  // 이벤트 발생 디바운싱을 위한 타이머
  let emitTimer = null

  /**
   * 에러 목록 업데이트 이벤트 발생 (디바운싱 적용)
   */
  function emitErrorsUpdated() {
    // 기존 타이머 취소
    if (emitTimer) {
      clearTimeout(emitTimer)
    }

    // 디바운싱: 100ms 후 이벤트 발생 (UI 업데이트를 배치로 처리)
    emitTimer = setTimeout(() => {
      nextTick(() => {
        console.log('[useErrorTracking] emitErrorsUpdated 호출:', errors.value.length, '개 에러')
        window.dispatchEvent(
          new CustomEvent('error-tracking-errors-updated', {
            detail: { errors: errors.value },
          }),
        )
        console.log('[useErrorTracking] 통계 전송:', statistics.value)
        window.dispatchEvent(
          new CustomEvent('error-tracking-statistics-updated', {
            detail: statistics.value,
          }),
        )
        emitTimer = null
      })
    }, 100)
  }

  /**
   * 에러 목록 새로고침
   */
  async function refresh() {
    console.log('[useErrorTracking] refresh 시작')
    isLoading.value = true
    try {
      // localStorage에서 에러 데이터 로드
      const loadedErrors = loadErrors()
      console.log('[useErrorTracking] loadErrors 결과:', loadedErrors.length, '개')

      // ID가 없는 오래된 에러에 ID 생성 (마이그레이션)
      let hasChanges = false
      loadedErrors.forEach((error) => {
        if (!error.id) {
          error.id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
          hasChanges = true
        }
        // 기본값 설정
        if (!error.status) {
          error.status = 'new'
          hasChanges = true
        }
        if (!error.count) {
          error.count = 1
          hasChanges = true
        }
        // notes 필드 마이그레이션
        if (!error.notes) {
          error.notes = {
            cause: null,
            solution: null,
            learned: null,
            references: [],
            updatedAt: null,
            updatedBy: null,
          }
          hasChanges = true
        }
      })

      if (hasChanges) {
        console.log('[useErrorTracking] 마이그레이션 변경사항 저장')
      }

      // 변경사항이 있으면 저장
      if (hasChanges) {
        saveErrors(loadedErrors)
      }

      errors.value = loadedErrors
      console.log('[useErrorTracking] 에러 목록 새로고침 완료:', loadedErrors.length, '개')

      // 에러 목록 업데이트 이벤트
      emitErrorsUpdated()
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
      notes: {
        cause: null,
        solution: null,
        learned: null,
        references: [],
        updatedAt: null,
        updatedBy: null,
      },
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

    // 에러 목록 업데이트 이벤트
    emitErrorsUpdated()
  }

  /**
   * 에러 선택
   */
  function selectError(error) {
    if (!error) {
      selectedError.value = null
      return
    }

    // ID로 최신 에러 객체를 찾아서 할당 (참조 동기화)
    if (error.id) {
      const latestError = errors.value.find((e) => e.id === error.id)
      if (latestError) {
        selectedError.value = latestError
      } else {
        // ID로 찾지 못했으면 메시지, 레벨, 타임스탬프로 찾기
        const foundError = errors.value.find((e) => {
          if (e.message === error.message && e.level === error.level) {
            if (e.timestamp && error.timestamp) {
              const timeDiff = Math.abs(e.timestamp - error.timestamp)
              return timeDiff < 1000
            }
            return true
          }
          return false
        })
        selectedError.value = foundError || error
      }
    } else {
      // ID가 없으면 메시지, 레벨, 타임스탬프로 찾기
      const foundError = errors.value.find((e) => {
        if (e.message === error.message && e.level === error.level) {
          if (e.timestamp && error.timestamp) {
            const timeDiff = Math.abs(e.timestamp - error.timestamp)
            return timeDiff < 1000
          }
          return true
        }
        return false
      })
      selectedError.value = foundError || error
    }

    window.dispatchEvent(
      new CustomEvent('error-tracking-error-selected', {
        detail: { error: selectedError.value },
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

      // selectedError도 동기화
      if (selectedError.value && selectedError.value.id === errorId) {
        selectedError.value = error
      }

      // 에러 목록 업데이트 이벤트
      emitErrorsUpdated()
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
      // 에러 목록 업데이트 이벤트
      emitErrorsUpdated()
    }
  }

  /**
   * 유사한 에러 찾기 (표시용 - 필터링된 목록에서 검색)
   * 탭 필터링을 포함한 필터링된 에러 목록에서만 검색하여 현재 탭에 맞는 개수 표시
   */
  function findSimilarErrorsForError(error) {
    // filteredErrors를 사용하여 탭 필터링, 레벨 필터, 상태 필터, 검색어 등이 모두 반영된 목록에서 유사 에러 찾기
    return findSimilarErrors(error, filteredErrors.value)
  }

  /**
   * 유사한 에러 찾기 (일괄 처리용 - 전체 목록에서 검색)
   * 일괄 처리 시에는 필터링과 관계없이 전체 목록에서 모든 유사 에러를 찾아야 함
   */
  function findSimilarErrorsForErrorInAll(error) {
    // errors.value 전체 목록에서 유사 에러 찾기 (필터링 무시)
    return findSimilarErrors(error, errors.value)
  }

  /**
   * 일괄 상태 변경 (유사한 에러 포함)
   */
  function batchUpdateErrorStatus(errorId, status, includeSimilar = false, errorObject = null) {
    // errorId가 임시 ID 형식이거나 없으면, errorObject로 찾기
    let error = errors.value.find((e) => e.id === errorId)

    if (!error && errorObject) {
      // 먼저 메시지와 레벨로 정확히 일치하는 것 찾기
      error = errors.value.find((e) => {
        return e.message === errorObject.message && e.level === errorObject.level
      })

      // 정확히 일치하지 않으면 유사도로 찾기 (areErrorsSimilar 사용)
      if (!error) {
        error = errors.value.find((e) => {
          return areErrorsSimilar(e, errorObject)
        })
      }

      // 타임스탬프가 있으면 더 정확하게 찾기 (1초 오차 허용)
      if (!error && errorObject.timestamp) {
        error = errors.value.find((e) => {
          const timeDiff = Math.abs((e.timestamp || 0) - (errorObject.timestamp || 0))
          return (e.message === errorObject.message || areErrorsSimilar(e, errorObject)) && e.level === errorObject.level && timeDiff < 1000 // 1초 이내 차이 허용
        })
      }

      if (error) {
        // 찾은 에러에 ID가 없으면 생성
        if (!error.id) {
          error.id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
          // console.log('[ErrorTracking] 일괄 상태 변경: ID가 없어 새로 생성:', error.id)
          saveErrors(errors.value) // ID 생성 후 저장
        }
        errorId = error.id // 실제 ID로 교체
        // console.log('[ErrorTracking] 일괄 상태 변경: errorObject로 찾은 실제 ID:', errorId)
      } else {
        // 여전히 찾지 못했으면 디버깅 정보 출력 (에러가 많을 수 있으므로 로그 제거)
        // console.warn('[ErrorTracking] 일괄 상태 변경: errorObject로 찾기 실패', {
        //   errorObject: {
        //     message: errorObject.message,
        //     level: errorObject.level,
        //     timestamp: errorObject.timestamp,
        //   },
        //   availableErrors: errors.value.slice(0, 5).map((e) => ({
        //     message: e.message,
        //     level: e.level,
        //     timestamp: e.timestamp,
        //     id: e.id,
        //   })),
        // })
      }
    }

    if (!error) {
      // 에러를 찾지 못한 경우 조용히 실패 (이미 해결되었거나 삭제된 에러일 수 있음)
      // console.warn('[ErrorTracking] 일괄 상태 변경 실패: 에러를 찾을 수 없습니다.', errorId, errorObject)
      return
    }

    // 일괄 처리 시에는 전체 목록에서 유사 에러 찾기 (필터링 무시)
    const similarErrors = includeSimilar ? findSimilarErrorsForErrorInAll(error) : []
    const errorsToUpdate = includeSimilar ? [error, ...similarErrors] : [error]

    // console.log('[ErrorTracking] 일괄 상태 변경:', {
    //   targetError: error.message,
    //   status,
    //   includeSimilar,
    //   similarCount: similarErrors.length,
    //   totalCount: errorsToUpdate.length,
    //   similarErrors: similarErrors.map((e) => ({ id: e.id, message: e.message })),
    // })

    errorsToUpdate.forEach((err) => {
      err.status = status
      updateErrorStorage(err.id, { status })
    })

    saveErrors(errors.value)

    // selectedError도 동기화 (업데이트된 에러 중 하나가 선택된 에러인 경우)
    if (selectedError.value) {
      const updatedSelectedError = errors.value.find((e) => e.id === selectedError.value.id)
      if (updatedSelectedError) {
        selectedError.value = updatedSelectedError
      }
    }

    // 에러 목록 업데이트 이벤트
    emitErrorsUpdated()
  }

  /**
   * 일괄 삭제 (유사한 에러 포함)
   */
  function batchDeleteError(errorId, includeSimilar = false, errorObject = null) {
    // errorId가 없거나 임시 ID 형식이면, errorObject로 찾기
    let error = errorId ? errors.value.find((e) => e.id === errorId) : null

    if (!error && errorObject) {
      // 먼저 메시지와 레벨로 정확히 일치하는 것 찾기
      error = errors.value.find((e) => {
        return e.message === errorObject.message && e.level === errorObject.level
      })

      // 정확히 일치하지 않으면 유사도로 찾기 (areErrorsSimilar 사용)
      if (!error) {
        error = errors.value.find((e) => {
          return areErrorsSimilar(e, errorObject)
        })
      }

      // 타임스탬프가 있으면 더 정확하게 찾기 (1초 오차 허용)
      if (!error && errorObject.timestamp) {
        error = errors.value.find((e) => {
          const timeDiff = Math.abs((e.timestamp || 0) - (errorObject.timestamp || 0))
          return (e.message === errorObject.message || areErrorsSimilar(e, errorObject)) && e.level === errorObject.level && timeDiff < 1000 // 1초 이내 차이 허용
        })
      }

      if (error) {
        // 찾은 에러에 ID가 없으면 생성
        if (!error.id) {
          error.id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
          // console.log('[ErrorTracking] 일괄 삭제: ID가 없어 새로 생성:', error.id)
          saveErrors(errors.value) // ID 생성 후 저장
        }
        errorId = error.id // 실제 ID로 교체
        // console.log('[ErrorTracking] 일괄 삭제: errorObject로 찾은 실제 ID:', errorId)
      } else {
        // 여전히 찾지 못했으면 디버깅 정보 출력
        // console.warn('[ErrorTracking] 일괄 삭제: errorObject로 찾기 실패', {
        //   errorObject: {
        //     message: errorObject.message,
        //     level: errorObject.level,
        //     timestamp: errorObject.timestamp,
        //   },
        //   availableErrors: errors.value.slice(0, 5).map((e) => ({
        //     message: e.message,
        //     level: e.level,
        //     timestamp: e.timestamp,
        //     id: e.id,
        //   })),
        // })
      }
    }

    if (!error) {
      // console.warn('[ErrorTracking] 일괄 삭제 실패: 에러를 찾을 수 없습니다.', errorId, errorObject)
      return
    }

    // 일괄 처리 시에는 전체 목록에서 유사 에러 찾기 (필터링 무시)
    const similarErrors = includeSimilar ? findSimilarErrorsForErrorInAll(error) : []
    const errorsToDelete = includeSimilar ? [error, ...similarErrors] : [error]

    // console.log('[ErrorTracking] 일괄 삭제:', {
    //   targetError: error.message,
    //   includeSimilar,
    //   similarCount: similarErrors.length,
    //   totalCount: errorsToDelete.length,
    //   similarErrors: similarErrors.map((e) => ({ id: e.id, message: e.message })),
    // })

    errorsToDelete.forEach((err) => {
      const index = errors.value.findIndex((e) => e.id === err.id)
      if (index !== -1) {
        errors.value.splice(index, 1)
        deleteErrorStorage(err.id)
      }
    })

    if (selectedError.value && errorsToDelete.some((e) => e.id === selectedError.value.id)) {
      selectedError.value = null
    }

    saveErrors(errors.value)
    window.dispatchEvent(
      new CustomEvent('error-tracking-statistics-updated', {
        detail: statistics.value,
      }),
    )
  }

  /**
   * 린트 오류 추가
   */
  function addLintError(lintError) {
    if (!isCollecting.value) {
      return
    }

    // 중복 체크 (같은 파일, 라인, 규칙의 린트 오류는 제외)
    const existingError = errors.value.find((e) => e.type === 'lint' && e.file === lintError.file && e.line === lintError.line && e.ruleId === lintError.ruleId && e.status !== 'resolved' && e.status !== 'ignored')

    if (existingError) {
      // 기존 에러 업데이트 (타임스탬프만 갱신)
      existingError.timestamp = Date.now()
      saveErrors(errors.value)
      // 에러 목록 업데이트 이벤트
      emitErrorsUpdated()
      return
    }

    // 새 린트 오류 추가
    const error = {
      ...lintError,
      id: lintError.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      status: 'new',
      count: 1,
      notes: {
        cause: null,
        solution: null,
        learned: null,
        references: [],
        updatedAt: null,
        updatedBy: null,
      },
    }

    errors.value.unshift(error)
    saveErrors(errors.value)

    // 이벤트 전달
    window.dispatchEvent(
      new CustomEvent('error-tracking-error-collected', {
        detail: { error },
      }),
    )

    // 에러 목록 업데이트 이벤트
    emitErrorsUpdated()
  }

  /**
   * 에러 메모 저장
   * @param {string} errorId - 에러 ID
   * @param {Object} notes - 메모 데이터
   */
  function saveErrorNotes(errorId, notes) {
    console.log('[useErrorTracking] 메모 저장 시작:', errorId, {
      errorsCount: errors.value.length,
      hasSelectedError: !!selectedError.value,
    })

    // 먼저 errors 배열에서 찾기
    let error = errors.value.find((e) => e.id === errorId)

    // errors 배열에 없으면 selectedError 확인
    if (!error && selectedError.value && selectedError.value.id === errorId) {
      error = selectedError.value
    }

    // errors 배열이 비어있으면 localStorage에서 다시 로드
    if (errors.value.length === 0) {
      console.log('[useErrorTracking] errors 배열이 비어있음, localStorage에서 다시 로드')
      const loadedErrors = loadErrors()
      errors.value = loadedErrors
      error = errors.value.find((e) => e.id === errorId)

      // 여전히 없으면 selectedError 확인
      if (!error && selectedError.value && selectedError.value.id === errorId) {
        error = selectedError.value
        // selectedError를 errors 배열에 추가
        errors.value.unshift(error)
      }
    }

    if (!error) {
      console.warn('[useErrorTracking] 에러를 찾을 수 없습니다:', errorId, {
        errorsCount: errors.value.length,
        errorIds: errors.value.map((e) => e.id),
      })
      return
    }

    // notes 필드가 없으면 초기화
    if (!error.notes) {
      error.notes = {
        cause: null,
        solution: null,
        learned: null,
        references: [],
        updatedAt: null,
        updatedBy: null,
      }
    }

    // 메모 업데이트
    error.notes = {
      ...error.notes,
      ...notes,
      updatedAt: Date.now(),
      updatedBy: notes.updatedBy || 'user',
    }

    // errors 배열에도 반영 (selectedError가 errors 배열의 참조가 아닐 수 있음)
    const errorInArray = errors.value.find((e) => e.id === errorId)
    if (errorInArray) {
      errorInArray.notes = error.notes
    } else {
      // errors 배열에 없으면 추가
      console.log('[useErrorTracking] errors 배열에 에러 없음, 추가:', errorId)
      errors.value.unshift(error)
    }

    console.log('[useErrorTracking] 저장 전 errors 개수:', errors.value.length)

    // localStorage에 저장
    saveErrors(errors.value)

    // 에러 목록 업데이트 이벤트
    emitErrorsUpdated()

    console.log('[useErrorTracking] 메모 저장 완료:', errorId)
  }

  /**
   * 에러 메모 업데이트 (saveErrorNotes의 별칭)
   * @param {string} errorId - 에러 ID
   * @param {Object} notes - 메모 데이터
   */
  function updateErrorNotes(errorId, notes) {
    saveErrorNotes(errorId, notes)
  }

  /**
   * 초기화
   */
  async function initialize() {
    console.log('[useErrorTracking] 초기화 시작')
    await refresh()
    console.log('[useErrorTracking] refresh 완료, 에러 개수:', errors.value.length)

    // 에러 수집 이벤트 리스너 등록
    function handleErrorCollected(event) {
      console.log('[useErrorTracking] 에러 수집 이벤트 수신:', event.detail)
      const newError = event.detail.error

      if (!isCollecting.value) {
        console.log('[useErrorTracking] 에러 수집 비활성화 상태, 무시')
        return
      }

      // 이미 ID가 있으면 그대로 사용, 없으면 생성
      if (!newError.id) {
        newError.id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      }

      if (!newError.status) {
        newError.status = 'new'
      }

      if (!newError.count) {
        newError.count = 1
      }

      // 중복 체크: 유사한 에러가 이미 있는지 확인
      const existingError = errors.value.find((e) => {
        // ID가 같으면 같은 에러
        if (e.id && newError.id && e.id === newError.id) {
          return true
        }
        // 유사도로 확인 (areErrorsSimilar 사용)
        return areErrorsSimilar(e, newError)
      })

      if (existingError) {
        console.log('[useErrorTracking] 기존 에러 발견, 카운트 증가:', existingError.id)
        // 기존 에러의 카운트 증가 및 타임스탬프 업데이트
        existingError.count = (existingError.count || 1) + 1
        existingError.timestamp = newError.timestamp // 최신 발생 시간으로 업데이트

        // 상태가 'new'가 아니면 유지 (해결/무시된 에러는 상태 유지)
        if (existingError.status === 'new') {
          existingError.status = 'new'
        }

        // 저장소 업데이트
        updateErrorStorage(existingError.id, {
          count: existingError.count,
          timestamp: existingError.timestamp,
        })
        // errors 배열도 업데이트하여 동기화
        const errorIndex = errors.value.findIndex((e) => e.id === existingError.id)
        if (errorIndex !== -1) {
          errors.value[errorIndex] = existingError
        }
        saveErrors(errors.value)
        console.log('[useErrorTracking] 기존 에러 저장 완료:', existingError.id)
      } else {
        console.log('[useErrorTracking] 새로운 에러 추가:', newError.id)
        // 새로운 에러로 추가
        errors.value.unshift(newError)
        console.log('[useErrorTracking] errors 배열 업데이트 후 개수:', errors.value.length)
        saveErrors(errors.value)
        console.log('[useErrorTracking] 새 에러 저장 완료:', newError.id)
      }

      // 에러 목록 업데이트 이벤트
      emitErrorsUpdated()
    }

    window.addEventListener('error-tracking-error-collected', handleErrorCollected)
    console.log('[useErrorTracking] 에러 수집 이벤트 리스너 등록 완료')

    // 린트 오류 수집 시작 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log('[useErrorTracking] 린트 오류 수집 시작')
      watchFileChanges((lintError) => {
        addLintError(lintError)
      })
    }

    console.log('[useErrorTracking] 초기화 완료')
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
    addLintError,
    selectError,
    handleSearchChange,
    handleFilterChange,
    handleSortChange,
    handleCollectingToggle,
    updateErrorStatus,
    deleteError,
    findSimilarErrorsForError,
    batchUpdateErrorStatus,
    batchDeleteError,
    initialize,
    saveErrorNotes,
    updateErrorNotes,
  }
}
