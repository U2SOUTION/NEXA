/**
 * Mermaid 모듈 전역 타입
 */
declare global {
  interface Window {
    mermaidModule?: { default: import('mermaid').default }
    mermaidInitialized?: boolean
  }
}

export {}
