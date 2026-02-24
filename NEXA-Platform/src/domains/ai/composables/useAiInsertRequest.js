/**
 * 도메인 내 공유: 메모/외부에서 에디터 삽입·열기 요청.
 * AiLeftNav(메모)와 AiContent가 형제이므로 inject 불가 → 콜백 등록으로 연결.
 */
const insertListeners = new Set()
const openEditorListeners = new Set()

export function useAiInsertRequest() {
  function requestInsert(content) {
    if (!content || typeof content !== 'string') return
    const trimmed = content.trim()
    if (!trimmed) return
    insertListeners.forEach((fn) => fn(trimmed))
  }

  function requestOpenEditor() {
    openEditorListeners.forEach((fn) => fn())
  }

  function onInsertRequest(callback) {
    insertListeners.add(callback)
    return () => insertListeners.delete(callback)
  }

  function onOpenEditorRequest(callback) {
    openEditorListeners.add(callback)
    return () => openEditorListeners.delete(callback)
  }

  return {
    requestInsert,
    requestOpenEditor,
    onInsertRequest,
    onOpenEditorRequest,
  }
}
