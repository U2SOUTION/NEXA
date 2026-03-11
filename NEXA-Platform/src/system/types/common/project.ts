/**
 * 프로젝트 API 타입 — 서버·프론트 공유
 * GET/POST/PATCH /api/projects 응답
 */
import type { ProjectId, UserId } from '../ids'

export interface Project {
  id: ProjectId
  user_id: UserId
  name: string
  description: string | null
  created_at: string
  updated_at: string
}
