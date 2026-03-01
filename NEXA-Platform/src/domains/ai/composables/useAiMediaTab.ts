/**
 * AI 도메인: 미디어 탭/아코디언 열기 요청.
 * 탐색기에서 미디어 추가 시 해당 탭·아코디언 열기용.
 */
const openMediaTabListeners = new Set()

export function useAiMediaTab() {
  function requestOpenMediaTab(category: 'images' | 'audio' | 'video' | 'documents') {
    openMediaTabListeners.forEach((fn) => {
      try {
        fn(category)
      } catch (e) {
        console.error('[useAiMediaTab] listener error:', e)
      }
    })
  }

  function onOpenMediaTab(callback: (category: 'images' | 'audio' | 'video' | 'documents') => void) {
    openMediaTabListeners.add(callback)
    return () => openMediaTabListeners.delete(callback)
  }

  return { requestOpenMediaTab, onOpenMediaTab }
}
