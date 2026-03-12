/**
 * 에러 데이터 저장소 관리
 *
 * localStorage를 사용하여 에러 데이터를 저장하고 관리합니다.
 */

// 새 네임스페이스 키
const STORAGE_KEY = 'tracking-error:errors'

const MAX_ERRORS = 1000 // 최대 저장 에러 수
const ERROR_RETENTION_DAYS = 30 // 에러 보관 기간 (일)

/**
 * 에러 데이터 로드
 * @returns {Array} 에러 목록
 */
export function loadErrors(): Array<Record<string, unknown>> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return []
    }

    let errors
    try {
      errors = JSON.parse(stored)
    } catch (parseError: unknown) {
      console.error('[errorStorage] JSON 파싱 실패:', parseError)
      return []
    }

    if (!Array.isArray(errors)) {
      console.error('[errorStorage] 파싱된 데이터가 배열이 아닙니다')
      return []
    }

    if (errors.length === 0) {
      return []
    }

    // 오래된 에러 필터링
    const now = Date.now()
    const retentionTime = ERROR_RETENTION_DAYS * 24 * 60 * 60 * 1000

    const filteredErrors = errors.filter((error: Record<string, unknown> & { timestamp?: number }) => {
      if (!error.timestamp) {
        return false // 타임스탬프가 없으면 제외
      }

      const errorTime = new Date(error.timestamp).getTime()
      if (isNaN(errorTime)) {
        return false
      }

      return now - errorTime < retentionTime
    })

    // 필터링된 에러가 다르면 저장
    if (filteredErrors.length !== errors.length) {
      saveErrors(filteredErrors)
    }

    return filteredErrors
  } catch (error) {
    console.error('[errorStorage] 에러 로드 실패:', error)
    return []
  }
}

/**
 * 에러 데이터 저장
 * @param {Array} errors - 에러 목록
 */
export function saveErrors(errors: Array<Record<string, unknown>>): void {
  try {
    if (!Array.isArray(errors)) {
      console.error('[errorStorage] 저장할 데이터가 배열이 아닙니다:', typeof errors)
      return
    }

    // 최대 개수 제한
    const limitedErrors = errors.slice(0, MAX_ERRORS)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedErrors))
  } catch (err: unknown) {
    console.error('[errorStorage] 에러 저장 실패:', err)

    const e = err as Error & { name?: string }
    if (e?.name === 'QuotaExceededError') {
      const halfErrors = errors.slice(Math.floor(errors.length / 2))
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(halfErrors))
      } catch (retryError) {
        console.error('[errorStorage] 재시도 저장 실패:', retryError)
      }
    }
  }
}

/**
 * 에러 추가
 * @param {Object} error - 에러 객체
 */
export function addError(error: Record<string, unknown>): void {
  const errors = loadErrors()
  errors.unshift(error)
  saveErrors(errors)
}

/**
 * 에러 업데이트
 * @param {string} errorId - 에러 ID
 * @param {Object} updates - 업데이트할 필드
 */
export function updateError(errorId: string, updates: Record<string, unknown>): void {
  const errors = loadErrors()
  const index = errors.findIndex((e: Record<string, unknown>) => e.id === errorId)

  if (index !== -1) {
    errors[index] = { ...errors[index], ...updates }
    saveErrors(errors)
  }
}

/**
 * 에러 삭제
 * @param {string} errorId - 에러 ID
 */
export function deleteError(errorId: string): void {
  const errors = loadErrors()
  const filtered = errors.filter((e: Record<string, unknown>) => e.id !== errorId)
  saveErrors(filtered)
}

/**
 * 모든 에러 삭제
 */
export function clearAllErrors() {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * 저장소 사용량 확인
 * @returns {Object} 저장소 사용량 정보
 */
export function getStorageUsage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const size = stored ? new Blob([stored]).size : 0
    const maxSize = 5 * 1024 * 1024 // 5MB (localStorage 일반 제한)

    return {
      used: size,
      max: maxSize,
      percentage: (size / maxSize) * 100,
      errors: stored ? JSON.parse(stored).length : 0,
    }
  } catch (_error) {
    console.error('[errorStorage] 저장소 사용량 확인 실패:', _error)
    return {
      used: 0,
      max: 0,
      percentage: 0,
      errors: 0,
    }
  }
}

/**
 * 오래된 에러 자동 정리
 */
export function cleanupOldErrors() {
  const errors = loadErrors()
  const now = Date.now()
  const retentionTime = ERROR_RETENTION_DAYS * 24 * 60 * 60 * 1000

  const filteredErrors = errors.filter((error: Record<string, unknown> & { timestamp?: number }) => {
    if (error.timestamp == null) return false
    const errorTime = new Date(error.timestamp).getTime()
    return now - errorTime < retentionTime
  })

  if (filteredErrors.length !== errors.length) {
    saveErrors(filteredErrors)
  }
}
