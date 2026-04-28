/**
 * 클립보드 유틸리티
 * 텍스트를 클립보드에 복사하는 범용 함수
 */

/**
 * textarea + execCommand('copy') — 사용자 클릭 직후 동기 호출에 적합
 * (readonly는 일부 브라우저에서 복사를 막을 수 있어 사용하지 않음)
 */
export function fallbackCopyTextToClipboard(text: string): boolean {
  if (typeof text !== 'string' || text.length === 0) return false

  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.setAttribute('aria-hidden', 'true')
  textArea.setAttribute('tabindex', '-1')
  textArea.style.cssText = [
    'position:fixed',
    'left:0',
    'top:0',
    'width:12rem',
    'height:8rem',
    'opacity:0.02',
    'z-index:2147483647',
    'pointer-events:auto',
    'margin:0',
    'padding:4px',
    'border:none',
    'outline:none',
    'box-shadow:none',
    'font:inherit',
  ].join(';')

  document.body.appendChild(textArea)
  try {
    textArea.focus({ preventScroll: true })
  } catch {
    textArea.focus()
  }
  textArea.select()
  if (typeof textArea.setSelectionRange === 'function') {
    textArea.setSelectionRange(0, text.length, 'forward')
  }

  let successful = false
  try {
    successful = document.execCommand('copy')
  } catch (err) {
    console.error('[clipboard] execCommand(copy) 실패:', err)
  }
  document.body.removeChild(textArea)
  return successful
}

/**
 * Selection + execCommand — textarea 경로가 실패할 때 보조
 */
export function fallbackCopyViaSelectionRange(text: string): boolean {
  if (typeof text !== 'string' || text.length === 0) return false
  const body = document.body
  if (!body) return false

  const node = document.createTextNode(text)
  let successful = false
  try {
    body.appendChild(node)
    const range = document.createRange()
    range.selectNodeContents(node)
    const sel = window.getSelection()
    if (!sel) return false
    sel.removeAllRanges()
    sel.addRange(range)
    successful = document.execCommand('copy')
    sel.removeAllRanges()
  } catch (err) {
    console.error('[clipboard] Range 복사 실패:', err)
  } finally {
    if (node.parentNode) node.parentNode.removeChild(node)
  }
  return successful
}

/** 동기 경로만 사용 (메뉴/모달 클릭 직후 등, await 없이 호출) */
export function trySyncClipboardCopy(text: string): boolean {
  return fallbackCopyTextToClipboard(text) || fallbackCopyViaSelectionRange(text)
}

/**
 * 클립보드에 텍스트 복사 (Clipboard API 우선, 실패 시 동기 fallback)
 */
export async function copyTextToClipboard(text: string): Promise<void> {
  if (typeof text !== 'string' || text.length === 0) return

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch (err) {
      console.warn('[clipboard] writeText 실패, 동기 fallback 시도:', err)
    }
  }

  if (trySyncClipboardCopy(text)) return

  throw new Error('클립보드 복사에 실패했습니다.')
}
