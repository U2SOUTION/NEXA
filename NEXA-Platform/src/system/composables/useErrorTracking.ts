/**
 * 에러 트래킹 관리 Composable
 *
 * 에러 트래킹의 상태 관리, 에러 수집, 필터링 등을 담당합니다.
 */

import { ref, computed, nextTick } from 'vue'
import { loadErrors, saveErrors, updateError as updateErrorStorage, deleteError as deleteErrorStorage } from '@system/utils/error-tracking/errorStorage'
import { setCollectingEnabled } from '@system/utils/error-tracking/errorCollector'
import { findSimilarErrors, areErrorsSimilar } from '@system/utils/error-tracking/errorGrouper'
import { watchFileChanges } from '@system/utils/error-tracking/lintCollector'
import { classifyErrorType } from '@system/utils/error-tracking/errorTypeClassifier'

export interface TrackedError extends Record<string, unknown> {
  id?: string
  message?: string
  level?: string
  file?: string | null
  line?: number | null
  column?: number | null
  stack?: string | null
  timestamp?: number
  status?: string
  count?: number
  type?: string
  ruleId?: string | null
  notes?: {
    cause?: string | null
    solution?: string | null
    learned?: string | null
    references?: unknown[]
    updatedAt?: number | null
    updatedBy?: string | null
  }
}

/**
 * 에러 트래킹 관리 Composable
 * @returns {Object} 에러 트래킹 관련 상태 및 함수
 */
export function useErrorTracking() {
  const errors = ref<TrackedError[]>([])
  const selectedError = ref<TrackedError | null>(null)
  const searchQuery = ref('')
  const isCollecting = ref(true)
  const isLoading = ref(false)

  const filterErrorType = ref<string | null>(null)
  const filterStatus = ref<string | null>(null)
  const filterTimeRange = ref<string | null>(null)
  const sortOption = ref('newest')

  // ============================================
  // Computed
  // ============================================

  /**
   * 필터링된 에러 목록
   */
  const filteredErrors = computed(() => {
    let result: TrackedError[] = [...errors.value]

    if (filterErrorType.value) {
      const targetType = filterErrorType.value
      result = result.filter((err) => classifyErrorType(err) === targetType)
    }

    if (filterStatus.value) {
      result = result.filter((err) => err.status === filterStatus.value)
    }

    if (filterTimeRange.value) {
      const now = Date.now()
      const timeRanges: Record<string, number> = {
        today: 24 * 60 * 60 * 1000,
        yesterday: 2 * 24 * 60 * 60 * 1000,
        '7days': 7 * 24 * 60 * 60 * 1000,
        '30days': 30 * 24 * 60 * 60 * 1000,
      }
      const range = timeRanges[filterTimeRange.value]
      if (range) {
        result = result.filter((err) => {
          const errorTime = new Date(err.timestamp ?? 0).getTime()
          return now - errorTime < range
        })
      }
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter((err) => {
        const message = (err.message ?? '').toLowerCase()
        const file = (err.file ?? '').toLowerCase()
        const stack = (err.stack ?? '').toLowerCase()
        return message.includes(query) || file.includes(query) || stack.includes(query)
      })
    }

    result.sort((a, b) => {
      switch (sortOption.value) {
        case 'newest':
          return new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime()
        case 'frequency':
          return (b.count ?? 1) - (a.count ?? 1)
        case 'severity': {
          const severityOrder: Record<string, number> = { error: 3, warning: 2, unhandled: 1 }
          return (severityOrder[b.level ?? ''] ?? 0) - (severityOrder[a.level ?? ''] ?? 0)
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
    const newCount = errors.value.filter((e: TrackedError) => e.status === 'new').length
    const resolvedCount = errors.value.filter((e: TrackedError) => e.status === 'resolved').length
    const ignoredCount = errors.value.filter((e: TrackedError) => e.status === 'ignored').length

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayCount = errors.value.filter((e: TrackedError) => {
      const errorDate = new Date(e.timestamp ?? 0)
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

  let emitTimer: ReturnType<typeof setTimeout> | null = null

  function emitErrorsUpdated() {
    if (emitTimer != null) {
      clearTimeout(emitTimer)
    }

    emitTimer = setTimeout(() => {
      nextTick(() => {
        window.dispatchEvent(
          new CustomEvent('error-tracking-errors-updated', {
            detail: { errors: errors.value },
          }),
        )
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
    isLoading.value = true
    try {
      // localStorage에서 에러 데이터 로드
      const loadedErrors = loadErrors()

      let hasChanges = false
      const tracked = loadedErrors as TrackedError[]
      tracked.forEach((error: TrackedError) => {
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
        saveErrors(tracked)
      }

      errors.value = tracked

      // 에러 목록 업데이트 이벤트
      emitErrorsUpdated()
    } catch (err: unknown) {
      console.error('[useErrorTracking] 에러 목록 새로고침 실패:', err)
    } finally {
      isLoading.value = false
    }
  }

  function addError(errorData: Record<string, unknown>) {
    if (!isCollecting.value) {
      return
    }

    const error: TrackedError = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      message: (errorData.message as string) ?? '알 수 없는 에러',
      level: (errorData.level as string) ?? 'error',
      file: (errorData.file as string | null) ?? null,
      line: (errorData.line as number | null) ?? null,
      column: (errorData.column as number | null) ?? null,
      stack: (errorData.stack as string | null) ?? null,
      timestamp: Date.now(),
      status: 'new',
      count: 1,
      url: (errorData.url as string) ?? window.location.href,
      userAgent: (errorData.userAgent as string) ?? navigator.userAgent,
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

  function selectError(error: TrackedError | null | undefined) {
    if (!error) {
      selectedError.value = null
      return
    }

    if (error.id) {
      const latestError = errors.value.find((e: TrackedError) => e.id === error.id)
      if (latestError) {
        selectedError.value = latestError
      } else {
        const foundError = errors.value.find((e: TrackedError) => {
          if (e.message === error.message && e.level === error.level) {
            if (e.timestamp != null && error.timestamp != null) {
              return Math.abs(e.timestamp - error.timestamp) < 1000
            }
            return true
          }
          return false
        })
        selectedError.value = foundError ?? error
      }
    } else {
      const foundError = errors.value.find((e: TrackedError) => {
        if (e.message === error.message && e.level === error.level) {
          if (e.timestamp != null && error.timestamp != null) {
            return Math.abs(e.timestamp - error.timestamp) < 1000
          }
          return true
        }
        return false
      })
      selectedError.value = foundError ?? error
    }

    const sel = selectedError.value
    window.dispatchEvent(
      new CustomEvent('error-tracking-error-selected', {
        detail: { error: sel },
      }),
    )
  }

  function handleSearchChange(query: string) {
    searchQuery.value = query
  }

  function handleFilterChange(filters: { errorType?: string | null; status?: string | null; timeRange?: string | null }) {
    filterErrorType.value = filters.errorType ?? null
    filterStatus.value = filters.status ?? null
    filterTimeRange.value = filters.timeRange ?? null
  }

  function handleSortChange(option: string) {
    sortOption.value = option
  }

  function handleCollectingToggle(enabled: boolean) {
    isCollecting.value = enabled
    setCollectingEnabled(enabled)
    window.dispatchEvent(
      new CustomEvent('error-tracking-collecting-toggled', {
        detail: { enabled },
      }),
    )
  }

  function updateErrorStatus(errorId: string, status: string) {
    const error = errors.value.find((e: TrackedError) => e.id === errorId)
    if (error) {
      error.status = status
      updateErrorStorage(errorId, { status })
      saveErrors(errors.value)

      const sel = selectedError.value
      if (sel != null && sel.id === errorId) {
        selectedError.value = error
      }

      emitErrorsUpdated()
    }
  }

  function deleteError(errorId: string) {
    const index = errors.value.findIndex((e: TrackedError) => e.id === errorId)
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

  function findSimilarErrorsForError(error: TrackedError) {
    // filteredErrors를 사용하여 탭 필터링, 레벨 필터, 상태 필터, 검색어 등이 모두 반영된 목록에서 유사 에러 찾기
    return findSimilarErrors(error, filteredErrors.value)
  }

  function findSimilarErrorsForErrorInAll(error: TrackedError) {
    // errors.value 전체 목록에서 유사 에러 찾기 (필터링 무시)
    return findSimilarErrors(error, errors.value)
  }

  function batchUpdateErrorStatus(
    errorId: string | undefined,
    status: string,
    includeSimilar = false,
    errorObject: TrackedError | null = null
  ) {
    let error = errorId ? errors.value.find((e: TrackedError) => e.id === errorId) : undefined

    if (!error && errorObject) {
      error = errors.value.find((e: TrackedError) => e.message === errorObject.message && e.level === errorObject.level)

      if (!error) {
        error = errors.value.find((e: TrackedError) => areErrorsSimilar(e, errorObject))
      }

      if (!error && errorObject.timestamp != null) {
        error = errors.value.find((e: TrackedError) => {
          const timeDiff = Math.abs((e.timestamp ?? 0) - (errorObject.timestamp ?? 0))
          return (e.message === errorObject.message || areErrorsSimilar(e, errorObject)) && e.level === errorObject.level && timeDiff < 1000
        })
      }

      if (error) {
        if (!error.id) {
          error.id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
          saveErrors(errors.value)
        }
        errorId = error.id
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

    errorsToUpdate.forEach((err: TrackedError) => {
      err.status = status
      if (err.id) updateErrorStorage(err.id, { status })
    })

    saveErrors(errors.value)

    const sel = selectedError.value
    if (sel != null) {
      const updatedSelectedError = errors.value.find((e: TrackedError) => e.id === sel.id)
      if (updatedSelectedError) {
        selectedError.value = updatedSelectedError
      }
    }

    // 에러 목록 업데이트 이벤트
    emitErrorsUpdated()
  }

  function batchDeleteError(
    errorId: string | undefined,
    includeSimilar = false,
    errorObject: TrackedError | null = null
  ) {
    let error: TrackedError | undefined = errorId ? errors.value.find((e: TrackedError) => e.id === errorId) : undefined

    if (!error && errorObject) {
      error = errors.value.find((e: TrackedError) => e.message === errorObject.message && e.level === errorObject.level)

      if (!error) {
        error = errors.value.find((e: TrackedError) => areErrorsSimilar(e, errorObject))
      }

      if (!error && errorObject.timestamp != null) {
        error = errors.value.find((e: TrackedError) => {
          const timeDiff = Math.abs((e.timestamp ?? 0) - (errorObject.timestamp ?? 0))
          return (e.message === errorObject.message || areErrorsSimilar(e, errorObject)) && e.level === errorObject.level && timeDiff < 1000
        })
      }

      if (error) {
        if (!error.id) {
          error.id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
          saveErrors(errors.value)
        }
        errorId = error.id
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

    errorsToDelete.forEach((err: TrackedError) => {
      const id = err.id
      if (!id) return
      const index = errors.value.findIndex((e: TrackedError) => e.id === id)
      if (index !== -1) {
        errors.value.splice(index, 1)
        deleteErrorStorage(id)
      }
    })

    const sel = selectedError.value
    if (sel != null && errorsToDelete.some((e: TrackedError) => e.id === sel.id)) {
      selectedError.value = null
    }

    saveErrors(errors.value)
    window.dispatchEvent(
      new CustomEvent('error-tracking-statistics-updated', {
        detail: statistics.value,
      }),
    )
  }

  function addLintError(lintError: Record<string, unknown> & { file?: string; line?: number; ruleId?: string; id?: string }) {
    if (!isCollecting.value) {
      return
    }

    const existingError = errors.value.find((e: TrackedError) => e.type === 'lint' && e.file === lintError.file && e.line === lintError.line && e.ruleId === lintError.ruleId && e.status !== 'resolved' && e.status !== 'ignored')

    if (existingError) {
      // 기존 에러 업데이트 (타임스탬프만 갱신)
      existingError.timestamp = Date.now()
      saveErrors(errors.value)
      // 에러 목록 업데이트 이벤트
      emitErrorsUpdated()
      return
    }

    const error: TrackedError = {
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

  function saveErrorNotes(errorId: string, notes: Record<string, unknown>) {
    let error: TrackedError | undefined = errors.value.find((e: TrackedError) => e.id === errorId)

    const sel = selectedError.value
    if (!error && sel != null && sel.id === errorId) {
      error = sel
    }

    if (errors.value.length === 0) {
      const loadedErrors = loadErrors() as TrackedError[]
      errors.value = loadedErrors
      error = errors.value.find((e: TrackedError) => e.id === errorId)

      if (!error && sel != null && sel.id === errorId) {
        error = sel
        errors.value.unshift(error)
      }
    }

    if (!error) {
      return
    }

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

    error.notes = {
      ...error.notes,
      ...notes,
      updatedAt: Date.now(),
      updatedBy: (notes.updatedBy as string) ?? 'user',
    }

    const errorInArray = errors.value.find((e: TrackedError) => e.id === errorId)
    if (errorInArray) {
      errorInArray.notes = error.notes
    } else {
      errors.value.unshift(error)
    }

    // localStorage에 저장
    saveErrors(errors.value)

    // 에러 목록 업데이트 이벤트
    emitErrorsUpdated()
  }

  function updateErrorNotes(errorId: string, notes: Record<string, unknown>) {
    saveErrorNotes(errorId, notes)
  }

  /**
   * 초기화
   */
  async function initialize() {
    await refresh()

    function handleErrorCollected(evt: Event) {
      const event = evt as CustomEvent<{ error: TrackedError }>
      const newError = event.detail.error

      if (!isCollecting.value) {
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

      const existingError = errors.value.find((e: TrackedError) => {
        if (e.id && newError.id && e.id === newError.id) return true
        return areErrorsSimilar(e, newError)
      })

      if (existingError) {
        existingError.count = (existingError.count ?? 1) + 1
        existingError.timestamp = newError.timestamp

        if (existingError.status === 'new') {
          existingError.status = 'new'
        }

        const eid = existingError.id
        if (eid) updateErrorStorage(eid, {
          count: existingError.count,
          timestamp: existingError.timestamp,
        })
        const errorIndex = errors.value.findIndex((e: TrackedError) => e.id === existingError.id)
        if (errorIndex !== -1) {
          errors.value[errorIndex] = existingError
        }
        saveErrors(errors.value)
      } else {
        // 새로운 에러로 추가
        errors.value.unshift(newError)
        saveErrors(errors.value)
      }

      // 에러 목록 업데이트 이벤트
      emitErrorsUpdated()
    }

    window.addEventListener('error-tracking-error-collected', handleErrorCollected)

    // 린트 오류 수집 시작 (개발 환경에서만)
    if (import.meta.env.DEV) {
      watchFileChanges((lintError: Record<string, unknown>) => {
        addLintError(lintError as Parameters<typeof addLintError>[0])
      })
    }
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
    filterErrorType,
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
