/**
 * DB JSONB 컬럼용 Zod 스키마 [NEXA-PLATFORM-TS-01] §2.2
 * parseJsonb(row.column, schema) 로 검증 후 사용
 */
import { z } from 'zod'

/** users.allowed_domains: 허용 도메인 문자열 배열 또는 null */
export const allowedDomainsSchema = z.array(z.string()).nullable()
export type AllowedDomains = z.infer<typeof allowedDomainsSchema>

/** archive_doc.content_json: 문서 본문 (TipTap/ProseMirror 등 유연한 JSON) */
export const archiveContentJsonSchema = z.union([
  z.record(z.string(), z.unknown()),
  z.array(z.unknown()),
])
export type ArchiveContentJson = z.infer<typeof archiveContentJsonSchema>

/** device_registry.metadata: 디바이스 메타데이터 (선택) */
export const deviceMetadataSchema = z.record(z.string(), z.unknown()).optional().nullable()
export type DeviceMetadata = z.infer<typeof deviceMetadataSchema>
