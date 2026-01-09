/**
 * 시간 포맷팅 유틸리티
 * 타임스탬프를 다양한 형식으로 변환
 */

/**
 * 상대 시간 포맷팅 (몇 분 전)
 * @param {number} timestamp - 타임스탬프 (밀리초)
 * @returns {string} 포맷팅된 상대 시간 문자열
 */
export function formatTimeRelative(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // 1분 이내
  if (diff < 60000) {
    return '방금 전'
  }

  // 1시간 이내
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}분 전`
  }

  // 24시간 이내
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}시간 전`
  }

  // 7일 이내
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}일 전`
  }

  return ''
}

/**
 * 절대 시간 포맷팅 (원본 시간)
 * @param {number} timestamp - 타임스탬프 (밀리초)
 * @returns {string} 포맷팅된 절대 시간 문자열
 */
export function formatTimeAbsolute(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * 시간 포맷팅 (기존 호환성 유지)
 * 상대 시간이 있으면 상대 시간을, 없으면 절대 시간을 반환
 * @param {number} timestamp - 타임스탬프 (밀리초)
 * @returns {string} 포맷팅된 시간 문자열
 */
export function formatTime(timestamp) {
  if (!timestamp) return ''
  const relative = formatTimeRelative(timestamp)
  if (relative) {
    return relative
  }
  return formatTimeAbsolute(timestamp)
}

/**
 * 기간 포맷팅 (발생 기간 계산)
 * @param {number} timestamp - 타임스탬프 (밀리초)
 * @returns {string} 포맷팅된 기간 문자열
 */
export function formatDuration(timestamp) {
  if (!timestamp) return ''
  const now = Date.now()
  const diff = now - timestamp

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days}일 ${hours}시간`
  } else if (hours > 0) {
    return `${hours}시간 ${minutes}분`
  } else {
    return `${minutes}분`
  }
}

