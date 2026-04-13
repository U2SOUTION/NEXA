/**
 * AI 도메인: 탐색기 선택 파일 → 채팅/에디터/이미지·음원·영상 편집기 주입
 * Phase 2: 전역 선택 계약 위에, AI 도메인 전용 주입 의도별 API 제공.
 * Phase 4에서 각 패널이 onInject* 로 등록 후 실제 처리.
 *
 * 파일 페이로드: useFileSelection 계약과 동일 (API 파일 객체 필드)
 */
import type { ExplorerFile } from '../types/nexiaDomainTypes'

type ListenerFn = (file: ExplorerFile) => void

const injectToChatListeners = new Set<ListenerFn>()
const injectToEditorListeners = new Set<ListenerFn>()
const openInImageEditorListeners = new Set<ListenerFn>()
const openInAudioEditorListeners = new Set<ListenerFn>()
const openInVideoEditorListeners = new Set<ListenerFn>()
const openInCodePanelListeners = new Set<ListenerFn>()

function emit(listeners: Set<ListenerFn>, file: ExplorerFile | null | undefined): void {
  if (!file || typeof file !== 'object') return
  listeners.forEach((fn) => {
    try {
      fn(file)
    } catch (e) {
      console.error('[useNexiaExplorerSelection] listener error:', e)
    }
  })
}

function register(listeners: Set<ListenerFn>, callback: ListenerFn): () => void {
  if (typeof callback !== 'function') return () => {}
  listeners.add(callback)
  return () => listeners.delete(callback)
}

export function useNexiaExplorerSelection() {
  function requestInjectToChat(file: ExplorerFile): void {
    emit(injectToChatListeners, file)
  }

  function requestInjectToEditor(file: ExplorerFile): void {
    emit(injectToEditorListeners, file)
  }

  function requestOpenInImageEditor(file: ExplorerFile): void {
    emit(openInImageEditorListeners, file)
  }

  function requestOpenInAudioEditor(file: ExplorerFile): void {
    emit(openInAudioEditorListeners, file)
  }

  function requestOpenInVideoEditor(file: ExplorerFile): void {
    emit(openInVideoEditorListeners, file)
  }

  function requestOpenInCodePanel(file: ExplorerFile): void {
    emit(openInCodePanelListeners, file)
  }

  function onInjectToChat(callback: ListenerFn): () => void {
    return register(injectToChatListeners, callback)
  }

  function onInjectToEditor(callback: ListenerFn): () => void {
    return register(injectToEditorListeners, callback)
  }

  function onOpenInImageEditor(callback: ListenerFn): () => void {
    return register(openInImageEditorListeners, callback)
  }

  function onOpenInAudioEditor(callback: ListenerFn): () => void {
    return register(openInAudioEditorListeners, callback)
  }

  function onOpenInVideoEditor(callback: ListenerFn): () => void {
    return register(openInVideoEditorListeners, callback)
  }

  function onOpenInCodePanel(callback: ListenerFn): () => void {
    return register(openInCodePanelListeners, callback)
  }

  return {
    requestInjectToChat,
    requestInjectToEditor,
    requestOpenInImageEditor,
    requestOpenInAudioEditor,
    requestOpenInVideoEditor,
    requestOpenInCodePanel,
    onInjectToChat,
    onInjectToEditor,
    onOpenInImageEditor,
    onOpenInAudioEditor,
    onOpenInVideoEditor,
    onOpenInCodePanel,
  }
}
