/**
 * [FilesSchema]
 * 파일 업로드·관리 시스템의 전역 데이터 규격
 * AI 드롭존, archive, parts 등 모든 도메인에서 공통 사용
 *
 * @see docs/AI_드롭존_첨부_기능_플랜.md
 */

/** AI 워크플로우 상태 */
export type AiWorkflowStatus = 'pending' | 'processing' | 'completed' | 'failed'

/** 사람 검증 상태 */
export type AiReviewStatus = 'pending_review' | 'verified' | 'needs_reprocess'

/** 파일 카테고리 (폴더 분류) */
export type FileCategory = 'documents' | 'images' | 'audio' | 'video'

/** 파일 타입 */
export type FileType = 'document' | 'image' | 'audio' | 'video'

/**
 * files 테이블 레코드
 */
export interface FileRecord {
  id: number
  file_path: string
  virtual_path: string | null
  original_name: string
  file_type: FileType | null
  mime_type: string | null
  file_size: number | null
  category: FileCategory | null
  user_id: string
  content_hash: string
  project_id: string | null
  source: string | null
  edge_sid: number | null
  source_metadata: Record<string, unknown> | null
  ai_workflow_status: AiWorkflowStatus
  ai_workflow_step: number
  ai_workflow_error: string | null
  ai_workflow_updated_at: string | null
  ai_review_status: AiReviewStatus | null
  ai_reviewed_at: string | null
  ai_reviewed_by: string | null
  created_at: string
}

/**
 * file_references 테이블 레코드
 */
export interface FileReferenceRecord {
  id: number
  file_id: number
  domain: string
  project_id: string | null
  virtual_path: string | null
  created_at: string
}

/**
 * 업로드 API 응답
 */
export interface UploadFileResponse {
  id: number
  file_path: string
  original_name: string
  url: string
  content_hash: string
}

/**
 * 목록 조회 파라미터
 */
export interface ListFilesParams {
  domain: string
  category?: FileCategory
  path?: string
  project_id?: string
}

/**
 * 목록 조회 응답 항목
 */
export interface ListFilesItem {
  id: number
  file_path: string
  original_name: string
  file_type: FileType | null
  category: FileCategory | null
  file_size: number | null
  url: string
}
