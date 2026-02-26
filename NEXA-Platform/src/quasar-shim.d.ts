/**
 * Quasar/Vite 가상 모듈 타입 선언 (vue-tsc용)
 */
declare module '#q-app/wrappers' {
  import type { Router } from 'vue-router'
  export function defineRouter(fn: (context?: { store: unknown; ssrContext?: unknown }) => Router): Router
}
