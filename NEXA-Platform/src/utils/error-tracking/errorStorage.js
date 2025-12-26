/**
 * 에러 데이터 저장소 관리
 *
 * localStorage를 사용하여 에러 데이터를 저장하고 관리합니다.
 */

const STORAGE_KEY = 'nexa-error-tracking-errors'
const MAX_ERRORS = 1000 // 최대 저장 에러 수
const ERROR_RETENTION_DAYS = 30 // 에러 보관 기간 (일)

/**
 * 에러 데이터 로드
 * @returns {Array} 에러 목록
 */
export function loadErrors() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }

    const errors = JSON.parse(stored)
    
    // 오래된 에러 필터링
    const now = Date.now()
    const retentionTime = ERROR_RETENTION_DAYS * 24 * 60 * 60 * 1000
    
    const filteredErrors = errors.filter((error) => {
      const errorTime = new Date(error.timestamp).getTime()
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
export function saveErrors(errors) {
  try {
    // 최대 개수 제한
    const limitedErrors = errors.slice(0, MAX_ERRORS)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedErrors))
  } catch (error) {
    console.error('[errorStorage] 에러 저장 실패:', error)
    
    // 저장소 용량 초과 시 오래된 에러 삭제 후 재시도
    if (error.name === 'QuotaExceededError') {
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
export function addError(error) {
  const errors = loadErrors()
  errors.unshift(error)
  saveErrors(errors)
}

/**
 * 에러 업데이트
 * @param {string} errorId - 에러 ID
 * @param {Object} updates - 업데이트할 필드
 */
export function updateError(errorId, updates) {
  const errors = loadErrors()
  const index = errors.findIndex((e) => e.id === errorId)
  
  if (index !== -1) {
    errors[index] = { ...errors[index], ...updates }
    saveErrors(errors)
  }
}

/**
 * 에러 삭제
 * @param {string} errorId - 에러 ID
 */
export function deleteError(errorId) {
  const errors = loadErrors()
  const filtered = errors.filter((e) => e.id !== errorId)
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
  } catch (error) {
    console.error('[errorStorage] 저장소 사용량 확인 실패:', error)
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
  
  const filteredErrors = errors.filter((error) => {
    const errorTime = new Date(error.timestamp).getTime()
    return now - errorTime < retentionTime
  })

  if (filteredErrors.length !== errors.length) {
    saveErrors(filteredErrors)
    console.log(`[errorStorage] 오래된 에러 ${errors.length - filteredErrors.length}개 정리됨`)
  }
}

