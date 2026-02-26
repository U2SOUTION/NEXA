/**
 * Quasar/Vite 가상 모듈 및 환경 타입 선언 (vue-tsc용)
 */
/// <reference types="vite/client" />

declare module '@quasar/app-vite/wrappers' {
  import type { Router } from 'vue-router'
  export function defineRouter(fn: (context?: { store: unknown; ssrContext?: unknown }) => Router): Router
}
