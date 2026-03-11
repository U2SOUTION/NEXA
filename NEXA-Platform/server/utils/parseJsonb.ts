/**
 * JSONB 컬럼 검증 유틸 — 단언 대신 Zod safeParse 사용
 * [NEXA-PLATFORM-TS-01] §2.2
 *
 * 사용: const meta = parseJsonb(row.metadata, MetadataSchema) ?? defaultMetadata
 */
/**
 * DB에서 꺼낸 JSONB 값(raw)을 스키마로 검증해 타입 안전하게 반환.
 * 실패 시 로깅 후 null 반환.
 * @param schema Zod 스키마 (Zod v4 nullable 등 모든 형태 지원)
 */
export function parseJsonb<T>(raw: unknown, schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false; error: unknown } }): T | null {
  const result = schema.safeParse(raw)
  if (result.success) return result.data
  const err = result as { error: { flatten?: () => unknown } }
  console.warn('[parseJsonb] validation failed:', err.error?.flatten?.() ?? err.error)
  return null
}
