/**
 * 채팅 메시지에서 목차 항목 추출 (첫 줄 기반)
 */

export interface ChatOutlineMessage {
  role: string
  content?: string
  [key: string]: unknown
}

export interface OutlineItem {
  idx: number
  label: string
  role: string
}

export function extractOutlineFromMessages(messages: ChatOutlineMessage[]): OutlineItem[] {
  if (!Array.isArray(messages) || messages.length === 0) return []
  return messages
    .map((msg, idx): OutlineItem | null => {
      const content = (msg.content ?? '').trim()
      if (!content) return null
      const firstLine = content.split('\n')[0]?.trim() || ''
      const label = stripMarkdownToPlain(firstLine)
      if (!label) return null
      return { idx, label, role: msg.role }
    })
    .filter((x): x is OutlineItem => x !== null)
}

/** 마크다운 첫 줄을 플레인 텍스트로 변환 */
function stripMarkdownToPlain(text: string): string {
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
