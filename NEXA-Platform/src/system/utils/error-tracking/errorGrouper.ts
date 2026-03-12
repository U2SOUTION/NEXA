/**
 * 에러 그룹화 유틸리티
 *
 * 유사한 에러를 그룹화하여 효율적으로 관리합니다.
 */

/**
 * 에러 메시지 정규화 (동적 값 제거)
 * @param {string} message - 원본 에러 메시지
 * @returns {string} 정규화된 메시지
 */
function normalizeErrorMessage(message: string): string {
  if (!message) return ''

  let normalized = message

  // URL 패턴 제거 (http://, https://)
  normalized = normalized.replace(/https?:\/\/[^\s]+/g, '[URL]')

  // 파일 경로의 절대 경로 부분 제거 (Windows: E:\, C:\ 등)
  normalized = normalized.replace(/[A-Z]:\\[^\s]+/gi, '[PATH]')
  normalized = normalized.replace(/\/[^\s/]+/g, '[PATH]')

  // 숫자 패턴 제거 (라인 번호, ID 등) - 하지만 너무 공격적이지 않도록
  // 단독 숫자만 제거 (단어 내 숫자는 유지)
  normalized = normalized.replace(/\b\d+\b/g, '[NUMBER]')

  // 공백 정규화
  normalized = normalized.replace(/\s+/g, ' ').trim()

  return normalized
}

/**
 * 두 에러가 같은 그룹에 속하는지 확인
 * @param {Object} error1 - 첫 번째 에러
 * @param {Object} error2 - 두 번째 에러
 * @returns {boolean} 같은 그룹 여부
 */
type SimilarErrorInput = { level?: string; type?: string; message?: string; file?: string | null; line?: number | null; ruleId?: string | null }

export function areErrorsSimilar(error1: SimilarErrorInput, error2: SimilarErrorInput): boolean {
  // 레벨이 다르면 다른 그룹
  if (error1.level !== error2.level) {
    return false
  }

  // 타입이 다르면 다른 그룹 (lint vs 일반 에러)
  // 타입이 없으면 기본값 'javascript'로 처리
  const type1 = error1.type || 'javascript'
  const type2 = error2.type || 'javascript'
  if (type1 !== type2) {
    return false
  }

  // 메시지가 정확히 일치하면 같은 그룹 (메시지 기준 우선 처리)
  const msg1 = (error1.message || '').trim()
  const msg2 = (error2.message || '').trim()

  if (msg1 === msg2 && msg1.length > 0) {
    return true
  }

  // 린트 오류의 경우: 파일, 라인, ruleId가 모두 같으면 같은 그룹
  if (type1 === 'lint' && type2 === 'lint') {
    if (error1.file && error2.file && error1.file === error2.file) {
      if (error1.line && error2.line && error1.line === error2.line) {
        if (error1.ruleId && error2.ruleId) {
          return error1.ruleId === error2.ruleId
        }
        // ruleId가 없으면 파일과 라인만으로 판단
        return true
      }
    }
  }

  // 일반 에러의 경우: 파일과 라인이 정확히 같으면 같은 그룹
  if (error1.file && error2.file && error1.file === error2.file) {
    if (error1.line && error2.line && error1.line === error2.line) {
      return true
    }
  }

  return false
}

/**
 * 에러 목록을 그룹화
 * @param {Array} errors - 에러 목록
 * @returns {Array} 그룹화된 에러 목록 (각 그룹의 대표 에러에 count 속성 추가)
 */
export function groupSimilarErrors(errors: Array<Record<string, unknown>>): Array<Record<string, unknown> & { count?: number }> {
  const groups: Array<Record<string, unknown> & { count?: number }> = []
  const processed = new Set<number>()

  for (let i = 0; i < errors.length; i++) {
    if (processed.has(i)) continue

    const error = errors[i]!
    const group = {
      ...error,
      count: 1,
      similarErrors: [error],
      firstOccurrence: error.timestamp,
      lastOccurrence: error.timestamp,
    }

    // 유사한 에러 찾기
    for (let j = i + 1; j < errors.length; j++) {
      if (processed.has(j)) continue

      if (areErrorsSimilar(error, errors[j])) {
        group.count += 1
        group.similarErrors.push(errors[j])
        const ts = (errors[j] as Record<string, unknown> & { timestamp?: number }).timestamp ?? 0
        const current = (group as { lastOccurrence?: number }).lastOccurrence ?? 0
        ;(group as { lastOccurrence: number }).lastOccurrence = Math.max(current, ts)
        processed.add(j)
      }
    }

    groups.push(group)
    processed.add(i)
  }

  return groups
}

/**
 * 특정 에러와 유사한 모든 에러 찾기
 * @param {Object} targetError - 대상 에러
 * @param {Array} errors - 전체 에러 목록
 * @returns {Array} 유사한 에러 목록
 */
export function findSimilarErrors(targetError: Record<string, unknown>, errors: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  const similarErrors = errors.filter((error) => {
    // ID가 있고 같으면 스킵 (ID가 없으면 다른 방식으로 비교)
    if (error.id && targetError.id && error.id === targetError.id) {
      return false
    }
    // ID가 없거나 다른 경우에만 유사성 비교
    const isSimilar = areErrorsSimilar(targetError, error)
    return isSimilar
  })

  return similarErrors
}

/**
 * 에러 그룹 키 생성 (그룹 식별용)
 * @param {Object} error - 에러 객체
 * @returns {string} 그룹 키
 */
export function getErrorGroupKey(error: { message?: string; file?: string; line?: number | string; level?: string }): string {
  const normalizedMessage = normalizeErrorMessage(error.message || '')
  const file = error.file || ''
  const line = error.line || ''
  const level = error.level || 'error'

  return `${level}:${normalizedMessage}:${file}:${line}`
}
