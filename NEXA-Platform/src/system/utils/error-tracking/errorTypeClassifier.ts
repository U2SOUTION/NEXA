/**
 * 에러 타입 분류 유틸리티
 *
 * 에러 객체를 분석하여 타입을 분류하고, 아이콘, 색상, 라벨을 반환합니다.
 */

/**
 * 에러 타입 분류 (차트/필터링용)
 * @param {Object} error - 에러 객체
 * @returns {string} 에러 타입 키워드 ('lint', 'typeError', 'referenceError', 'networkError', 'promiseRejection', 'warning', 'unhandled', 'error')
 */
export function classifyErrorType(error: { type?: string; errorType?: string; message?: string; level?: string } | null | undefined): string {
  if (!error) return 'error'

  // Lint 타입
  if (error.type === 'lint') {
    return 'lint'
  }

  // 에러 타입별 분류
  const errorType = error.errorType || ''
  const message = (error.message || '').toLowerCase()

  // TypeError
  if (errorType === 'TypeError' || message.includes('typeerror') || message.includes('type error')) {
    return 'typeError'
  }

  // ReferenceError
  if (errorType === 'ReferenceError' || message.includes('referenceerror') || message.includes('reference error')) {
    return 'referenceError'
  }

  // Network Error
  if (message.includes('network') || message.includes('fetch') || message.includes('request failed')) {
    return 'networkError'
  }

  // Promise Rejection
  if (message.includes('promise') || message.includes('rejection') || message.includes('unhandled')) {
    return 'promiseRejection'
  }

  // 레벨별 기본 타입
  switch (error.level) {
    case 'warning':
      return 'warning'
    case 'unhandled':
      return 'unhandled'
    case 'error':
    default:
      return 'error'
  }
}

/**
 * 에러 타입별 아이콘 반환
 * @param {Object} error - 에러 객체
 * @returns {string} Material Icons 아이콘 이름
 */
export function getErrorIcon(error: { type?: string; errorType?: string; message?: string; level?: string } | null | undefined): string {
  if (!error) return 'bug_report'

  // Lint 타입
  if (error.type === 'lint') {
    return 'code'
  }

  // 에러 타입별 분류
  const errorType = error.errorType || ''
  const message = (error.message || '').toLowerCase()

  // TypeError
  if (errorType === 'TypeError' || message.includes('typeerror') || message.includes('type error')) {
    return 'type_specimen'
  }

  // ReferenceError
  if (errorType === 'ReferenceError' || message.includes('referenceerror') || message.includes('reference error')) {
    return 'link_off'
  }

  // Network Error
  if (message.includes('network') || message.includes('fetch') || message.includes('request failed')) {
    return 'cloud_off'
  }

  // Promise Rejection
  if (message.includes('promise') || message.includes('rejection') || message.includes('unhandled')) {
    return 'sync_problem'
  }

  // 레벨별 기본 아이콘
  switch (error.level) {
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    case 'unhandled':
      return 'error_outline' // X 표시(cancel) 대신 사용
    default:
      return 'bug_report'
  }
}

/**
 * 에러 타입별 색상 반환 (Quasar 색상 이름)
 * @param {Object} error - 에러 객체
 * @returns {string} Quasar 색상 이름
 */
export function getErrorColor(error: { type?: string; errorType?: string; message?: string; level?: string } | null | undefined): string {
  if (!error) return 'grey-7'

  // Lint 타입
  if (error.type === 'lint') {
    return 'accent'
  }

  // 에러 타입별 분류
  const errorType = error.errorType || ''
  const message = (error.message || '').toLowerCase()

  // TypeError, ReferenceError
  if (errorType === 'TypeError' || errorType === 'ReferenceError' || message.includes('typeerror') || message.includes('referenceerror')) {
    return 'negative'
  }

  // Network Error
  if (message.includes('network') || message.includes('fetch') || message.includes('request failed')) {
    return 'negative'
  }

  // Promise Rejection
  if (message.includes('promise') || message.includes('rejection') || message.includes('unhandled')) {
    return 'negative'
  }

  // 레벨별 기본 색상
  switch (error.level) {
    case 'error':
      return 'negative'
    case 'warning':
      return 'warning'
    case 'unhandled':
      return 'negative'
    default:
      return 'grey-7'
  }
}

/**
 * 에러 타입별 라벨 반환
 * @param {Object} error - 에러 객체
 * @returns {string} 에러 타입 라벨
 */
export function getErrorTypeLabel(error: { type?: string; errorType?: string; message?: string; level?: string } | null | undefined): string {
  if (!error) return '알 수 없음'

  // Lint 타입
  if (error.type === 'lint') {
    return 'Lint'
  }

  // 에러 타입별 분류
  const errorType = error.errorType || ''
  const message = (error.message || '').toLowerCase()

  // TypeError
  if (errorType === 'TypeError' || message.includes('typeerror') || message.includes('type error')) {
    return 'TypeError'
  }

  // ReferenceError
  if (errorType === 'ReferenceError' || message.includes('referenceerror') || message.includes('reference error')) {
    return 'ReferenceError'
  }

  // Network Error
  if (message.includes('network') || message.includes('fetch') || message.includes('request failed')) {
    return 'Network'
  }

  // Promise Rejection
  if (message.includes('promise') || message.includes('rejection') || message.includes('unhandled')) {
    return 'Promise'
  }

  // 레벨별 기본 라벨
  switch (error.level) {
    case 'error':
      return 'Error'
    case 'warning':
      return 'Warning'
    case 'unhandled':
      return 'Unhandled'
    default:
      return error.level || '알 수 없음'
  }
}

/**
 * 에러 타입별 차트용 라벨 반환
 * @param {string} typeKey - 에러 타입 키워드
 * @returns {string} 차트에 표시할 라벨
 */
export function getErrorTypeChartLabel(typeKey: string): string {
  const typeNameMap: Record<string, string> = {
    error: 'Error',
    warning: 'Warning',
    unhandled: 'Unhandled',
    lint: 'Lint',
    typeError: 'TypeError',
    referenceError: 'ReferenceError',
    networkError: 'Network',
    promiseRejection: 'Promise',
  }

  return typeNameMap[typeKey] || typeKey.charAt(0).toUpperCase() + typeKey.slice(1)
}
