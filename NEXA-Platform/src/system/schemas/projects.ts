/**
 * 프로젝트 API 스키마 — 서버·프론트·통합 테스트 공유
 * [NEXA-PLATFORM-TS-01] §2.1, §7.2
 */
import { z } from 'zod'

/** POST /api/projects body */
export const createProjectSchema = z.object({
  name: z.string().max(500).optional().default(''),
  description: z.string().max(2000).nullable().optional().default(null),
})

/** PATCH /api/projects/:id body */
export const updateProjectSchema = z.object({
  name: z.string().max(500).optional(),
  description: z.string().max(2000).nullable().optional(),
})

/** 단일 프로젝트 응답 */
export const projectResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

/** GET /api/projects 목록 응답 (배열) */
export const projectsResponseSchema = z.array(projectResponseSchema)

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type ProjectResponse = z.infer<typeof projectResponseSchema>
