/**
 * 도메인 내 공유: 메모/외부에서 에디터 삽입·열기 요청.
 * NexiaLeftNav(메모)와 NexiaContent가 형제이므로 inject 불가 → 콜백 등록으로 연결.
 * 청크 분리 시 동일 인스턴스 공유를 위해 전역 키 사용.
 */
const GLOBAL_KEY = '__nexa_ai_insert_request__'

interface AiInsertRequestStore {
  insert: Set<(content: string) => void>
  open: Set<() => void>
}

declare global {
  interface Window {
    __nexa_ai_insert_request__?: AiInsertRequestStore
  }
}

function getListeners(): AiInsertRequestStore {
  const g =
    typeof globalThis !== 'undefined'
      ? (globalThis as unknown as Record<string, AiInsertRequestStore>)
      : typeof window !== 'undefined'
        ? (window as unknown as Record<string, AiInsertRequestStore>)
        : ({} as Record<string, AiInsertRequestStore>)
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = { insert: new Set(), open: new Set() }
  }
  return g[GLOBAL_KEY]
}

const insertListeners = getListeners().insert
const openEditorListeners = getListeners().open

export function useNexiaInsertRequest() {
  function requestInsert(content: string): void {
    if (!content || typeof content !== 'string') return
    const trimmed = content.trim()
    if (!trimmed) return
    insertListeners.forEach((fn) => fn(trimmed))
  }

  function requestOpenEditor(): void {
    openEditorListeners.forEach((fn) => fn())
  }

  function onInsertRequest(callback: (content: string) => void): () => void {
    insertListeners.add(callback)
    return () => insertListeners.delete(callback)
  }

  function onOpenEditorRequest(callback: () => void): () => void {
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
