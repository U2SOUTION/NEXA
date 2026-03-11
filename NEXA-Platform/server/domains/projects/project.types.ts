/**
 * 프로젝트 도메인 타입 [NEXA-PLATFORM-TS-01] §5.2
 */

/** POST /api/projects body */
export interface CreateProjectPayload {
  name?: string
  description?: string | null
}

/** PATCH /api/projects/:id body */
export interface UpdateProjectPayload {
  name?: string
  description?: string | null
}

/** 프로젝트 API 응답 */
export interface ProjectResponse {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}
