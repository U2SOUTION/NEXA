/**
 * 클립보드 유틸리티
 * 텍스트를 클립보드에 복사하는 범용 함수
 */

/**
 * 클립보드에 텍스트 복사 (최신 API 사용, 실패 시 fallback 사용)
 * @param {string} text - 복사할 텍스트
 * @returns {Promise<void>}
 */
export function copyTextToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).catch((err) => {
      console.error('클립보드 복사 실패:', err)
      fallbackCopyTextToClipboard(text)
    })
  } else {
    fallbackCopyTextToClipboard(text)
    return Promise.resolve()
  }
}

/**
 * 클립보드 복사 fallback (구형 브라우저 지원)
 * @param {string} text - 복사할 텍스트
 */
export function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.left = '-999999px'
  textArea.style.top = '-999999px'
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  try {
    document.execCommand('copy')
  } catch (err) {
    console.error('클립보드 복사 실패:', err)
  }
  document.body.removeChild(textArea)
}

