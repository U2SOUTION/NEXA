/**
 * Express ESM/NodeNext 호환 — Router named export 보강
 * @types/express가 default만 내보낼 때 Router를 named로 사용하기 위함
 */
declare module 'express' {
  export function Router(options?: any): any
}
