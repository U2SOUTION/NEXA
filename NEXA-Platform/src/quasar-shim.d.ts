/**
 * Quasar/Vite 가상 모듈 및 환경 타입 선언 (vue-tsc용)
 */
/// <reference types="vite/client" />

declare module '@quasar/app-vite/wrappers' {
  import type { Router } from 'vue-router'
  export function defineRouter(fn: (context?: { store: unknown; ssrContext?: unknown }) => Router): Router
}

/** Quasar layout alias: layouts/ → src/frame/layout */
declare module 'layouts/MainLayout.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
declare module 'layouts/U2BeeLayout.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
