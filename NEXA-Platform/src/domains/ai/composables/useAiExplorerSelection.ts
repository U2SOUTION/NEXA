/**
 * AI 도메인: 탐색기 선택 파일 → 채팅/에디터/이미지·음원·영상 편집기 주입
 * Phase 2: 전역 선택 계약 위에, AI 도메인 전용 주입 의도별 API 제공.
 * Phase 4에서 각 패널이 onInject* 로 등록 후 실제 처리.
 *
 * 파일 페이로드: useFileSelection 계약과 동일 (API 파일 객체 필드)
 */

const injectToChatListeners = new Set()
const injectToEditorListeners = new Set()
const openInImageEditorListeners = new Set()
const openInAudioEditorListeners = new Set()
const openInVideoEditorListeners = new Set()
const openInCodePanelListeners = new Set()

function emit(listeners, file) {
  if (!file || typeof file !== 'object') return
  listeners.forEach((fn) => {
    try {
      fn(file)
    } catch (e) {
      console.error('[useAiExplorerSelection] listener error:', e)
    }
  })
}

function register(listeners, callback) {
  if (typeof callback !== 'function') return () => {}
  listeners.add(callback)
  return () => listeners.delete(callback)
}

export function useAiExplorerSelection() {
  function requestInjectToChat(file) {
    emit(injectToChatListeners, file)
  }

  function requestInjectToEditor(file) {
    emit(injectToEditorListeners, file)
  }

  function requestOpenInImageEditor(file) {
    emit(openInImageEditorListeners, file)
  }

  function requestOpenInAudioEditor(file) {
    emit(openInAudioEditorListeners, file)
  }

  function requestOpenInVideoEditor(file) {
    emit(openInVideoEditorListeners, file)
  }

  function requestOpenInCodePanel(file) {
    emit(openInCodePanelListeners, file)
  }

  function onInjectToChat(callback) {
    return register(injectToChatListeners, callback)
  }

  function onInjectToEditor(callback) {
    return register(injectToEditorListeners, callback)
  }

  function onOpenInImageEditor(callback) {
    return register(openInImageEditorListeners, callback)
  }

  function onOpenInAudioEditor(callback) {
    return register(openInAudioEditorListeners, callback)
  }

  function onOpenInVideoEditor(callback) {
    return register(openInVideoEditorListeners, callback)
  }

  function onOpenInCodePanel(callback) {
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
