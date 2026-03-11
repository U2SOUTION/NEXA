/**
 * 에러 유틸 — strict 모드에서 catch (err: unknown) 처리
 */
export function errMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

/** err.code (예: ER_DUP_ENTRY) 접근용 */
export function errCode(e: unknown): string | undefined {
  return (e as { code?: string })?.code
}
