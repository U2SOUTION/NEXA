/**
 * 도메인 내 공유: 메모/외부에서 에디터 삽입 요청.
 * AiLeftNav(메모)와 AiContent가 형제이므로 inject 불가 → 콜백 등록으로 연결.
 */
const listeners = new Set()

export function useAiInsertRequest() {
  function requestInsert(content) {
    if (!content || typeof content !== 'string') return
    const trimmed = content.trim()
    if (!trimmed) return
    listeners.forEach((fn) => fn(trimmed))
  }

  function onInsertRequest(callback) {
    listeners.add(callback)
    return () => listeners.delete(callback)
  }

  return {
    requestInsert,
    onInsertRequest,
  }
}
