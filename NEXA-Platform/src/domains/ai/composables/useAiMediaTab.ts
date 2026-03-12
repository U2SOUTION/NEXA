/**
 * AI 도메인: 미디어 탭/아코디언 열기 요청.
 * 탐색기에서 미디어 추가 시 해당 탭·아코디언 열기용.
 */
type MediaCategory = 'images' | 'audio' | 'video' | 'documents'
const openMediaTabListeners = new Set<(category: MediaCategory) => void>()

export function useAiMediaTab() {
  function requestOpenMediaTab(category: MediaCategory): void {
    openMediaTabListeners.forEach((fn: (category: MediaCategory) => void) => {
      try {
        fn(category)
      } catch (e) {
        console.error('[useAiMediaTab] listener error:', e)
      }
    })
  }

  function onOpenMediaTab(callback: (category: MediaCategory) => void): () => void {
    openMediaTabListeners.add(callback)
    return () => openMediaTabListeners.delete(callback)
  }

  return { requestOpenMediaTab, onOpenMediaTab }
}
