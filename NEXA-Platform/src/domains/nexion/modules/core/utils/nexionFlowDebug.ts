/**
 * **추가** 상세 진단만 켜는 플래그.
 * - `@connect` 직후 Pinia vs DOM 개수는 **DEV에서 항상** `[NexionFlow] 동기화 점검` 으로 출력됨.
 * - 이 플래그를 켜면 `isValidConnection` 거부 사유, edges-change 전체, vue-flow error 스택 등이 `[NexionFlow:진단]` 으로 더 붙음.
 *
 *   localStorage.setItem('nexion-flow-debug', '1')
 * 후 새로고침. 끌 때: removeItem.
 */
const LS_KEY = 'nexion-flow-debug'

export function isNexionFlowDebug(): boolean {
  if (!import.meta.env.DEV) return false
  try {
    return globalThis.localStorage?.getItem(LS_KEY) === '1'
  } catch {
    return false
  }
}

export function nxnDiag(label: string, data?: unknown): void {
  if (!isNexionFlowDebug()) return
  console.log(`[NexionFlow:진단] ${label}`, data === undefined ? '' : data)
}

export function printNexionFlowDebugHintOnce(): void {
  if (!import.meta.env.DEV) return
  const w = globalThis as typeof globalThis & { __nexionFlowDebugHint?: boolean }
  if (w.__nexionFlowDebugHint) return
  w.__nexionFlowDebugHint = true
  console.info(
    '[NexionFlow] 연결 후 항상(DEV) `동기화 점검` 로그 확인. 더 자세히: localStorage.setItem("nexion-flow-debug","1") 후 새로고침',
  )
}
