/**
 * 채팅 메시지에서 목차 항목 추출 (첫 줄 기반)
 * @param {Array<{role:string, content?:string}>} messages
 * @returns {Array<{idx:number, label:string, role:string}>}
 */
export function extractOutlineFromMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return []
  return messages
    .map((msg, idx) => {
      const content = (msg.content ?? '').trim()
      if (!content) return null
      const firstLine = content.split('\n')[0]?.trim() || ''
      const label = stripMarkdownToPlain(firstLine)
      if (!label) return null
      return { idx, label, role: msg.role }
    })
    .filter(Boolean)
}

/** 마크다운 첫 줄을 플레인 텍스트로 변환 */
function stripMarkdownToPlain(text) {
  if (!text || typeof text !== 'string') return ''
  return text
    .replace(/^#+\s*/, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .trim()
}
