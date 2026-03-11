/**
 * 에러 유틸 — strict 모드에서 catch (err: unknown) 처리
 */
export function errMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}
