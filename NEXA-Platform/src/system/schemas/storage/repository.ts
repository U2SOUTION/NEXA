import { z } from 'zod'

/**
 * [StorageMetadataSchema]
 * 저장소 내의 설계도 파일 관리 정보를 정의합니다.
 * 설계도가 저장될 때 "파일 크기는 얼마인가?", "해시값이 무엇인가?"라는 저장 정보 데이터의 규격입니다.
 * 설계도 파일의 파일 ID, 파일 경로, 파일 형식, 파일 크기, 체크섬, 백업 기록을 정의합니다.
 * 설계도 파일의 백업 기록을 정의합니다.
 * 설계도 파일의 백업 기록을 정의합니다.
 */
export const StorageMetadataSchema = z.object({
  fileId: z.string(),
  filePath: z.string(),
  format: z.enum(['JSON', 'YAML', 'BINARY']),
  fileSize: z.number(), // bytes
  checksum: z.string(), // 데이터 무결성 확인용 해시값
  backupHistory: z
    .array(
      z.object({
        timestamp: z.string(),
        tag: z.string().optional(),
      }),
    )
    .default([]),
})

export type StorageMetadata = z.infer<typeof StorageMetadataSchema>
