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
function normalizeErrorMessage(message) {
  if (!message) return ''
  
  // URL 패턴 제거 (http://, https://)
  let normalized = message.replace(/https?:\/\/[^\s]+/g, '[URL]')
  
  // 숫자 패턴 제거 (라인 번호, ID 등)
  normalized = normalized.replace(/\d+/g, '[NUMBER]')
  
  // 파일 경로 패턴 제거
  normalized = normalized.replace(/[/\\][^\s/\\]+/g, '[PATH]')
  
  // 공백 정규화
  normalized = normalized.replace(/\s+/g, ' ').trim()
  
  return normalized
}

/**
 * 두 에러 메시지의 유사도 계산 (간단한 문자열 매칭)
 * @param {string} message1 - 첫 번째 메시지
 * @param {string} message2 - 두 번째 메시지
 * @returns {number} 유사도 (0-1)
 */
function calculateSimilarity(message1, message2) {
  if (!message1 || !message2) return 0
  
  const norm1 = normalizeErrorMessage(message1)
  const norm2 = normalizeErrorMessage(message2)
  
  // 정확히 일치하면 1.0
  if (norm1 === norm2) return 1.0
  
  // 한쪽이 다른 쪽을 포함하면 0.8
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.8
  
  // 공통 단어 비율 계산
  const words1 = norm1.split(' ').filter(w => w.length > 2)
  const words2 = norm2.split(' ').filter(w => w.length > 2)
  
  if (words1.length === 0 || words2.length === 0) return 0
  
  const commonWords = words1.filter(w => words2.includes(w))
  const similarity = (commonWords.length * 2) / (words1.length + words2.length)
  
  return similarity
}

/**
 * 두 에러가 같은 그룹에 속하는지 확인
 * @param {Object} error1 - 첫 번째 에러
 * @param {Object} error2 - 두 번째 에러
 * @returns {boolean} 같은 그룹 여부
 */
export function areErrorsSimilar(error1, error2) {
  // 레벨이 다르면 다른 그룹
  if (error1.level !== error2.level) return false
  
  // 메시지 유사도 확인
  const similarity = calculateSimilarity(error1.message, error2.message)
  
  // 유사도가 0.7 이상이면 같은 그룹
  if (similarity >= 0.7) return true
  
  // 파일과 라인이 같으면 같은 그룹
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
export function groupSimilarErrors(errors) {
  const groups = []
  const processed = new Set()
  
  for (let i = 0; i < errors.length; i++) {
    if (processed.has(i)) continue
    
    const error = errors[i]
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
        group.lastOccurrence = Math.max(group.lastOccurrence, errors[j].timestamp)
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
export function findSimilarErrors(targetError, errors) {
  return errors.filter(error => {
    if (error.id === targetError.id) return false
    return areErrorsSimilar(targetError, error)
  })
}

/**
 * 에러 그룹 키 생성 (그룹 식별용)
 * @param {Object} error - 에러 객체
 * @returns {string} 그룹 키
 */
export function getErrorGroupKey(error) {
  const normalizedMessage = normalizeErrorMessage(error.message || '')
  const file = error.file || ''
  const line = error.line || ''
  const level = error.level || 'error'
  
  return `${level}:${normalizedMessage}:${file}:${line}`
}

