/**
 * 프로젝트 API 컨트롤러 [NEXA-AUTH-01] §2.2 3단계
 */
import type { RequestLike, ResponseLike } from '../../types/request-response.js'
import { createProjectSchema, updateProjectSchema } from '@system/schemas/projects.js'
import { ApiErrorCode } from '@system/schemas/errors.js'
import type { ProjectResponse } from './project.types.js'
import * as projectsService from './projects.service.js'

function validationErrorResponse(res: ResponseLike, err: { issues: Array<{ path: unknown[]; message: string }> }): ResponseLike {
  const errors = err.issues.map((i) => ({ path: Array.isArray(i.path) ? i.path.map(String).join('.') : '', message: i.message }))
  return res.status(400).json({ code: ApiErrorCode.VALIDATION_ERROR, message: '입력값 검증 실패', errors }) as ResponseLike
}

function toResponse(row: Record<string, unknown> | null): ProjectResponse | null {
  if (!row) return null
  return {
    id: String(row.id ?? ''),
    user_id: String(row.user_id ?? ''),
    name: String(row.name ?? ''),
    description: row.description != null ? String(row.description) : null,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  }
}

export async function getProjects(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  if (!req.user?.id) {
    return res.status(401).json({ code: ApiErrorCode.UNAUTHORIZED, message: '인증이 필요합니다.' })
  }
  try {
    const rows = await projectsService.listByUserId(req.user.id)
    return res.json(rows.map((row) => toResponse(row as Record<string, unknown>)))
  } catch (err) {
    console.error('[GET /api/projects]', err)
    return res.status(500).json({ code: ApiErrorCode.SERVER_ERROR, message: (err as Error).message })
  }
}

export async function postProject(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  if (!req.user?.id) {
    return res.status(401).json({ code: ApiErrorCode.UNAUTHORIZED, message: '인증이 필요합니다.' })
  }
  const parsed = createProjectSchema.safeParse(req.body ?? {})
  if (!parsed.success) return validationErrorResponse(res, parsed.error)
  try {
    const project = await projectsService.create(req.user.id, parsed.data)
    return res.status(201).json(toResponse(project as Record<string, unknown>))
  } catch (err) {
    console.error('[POST /api/projects]', err)
    return res.status(500).json({ code: ApiErrorCode.SERVER_ERROR, message: (err as Error).message })
  }
}

export async function getProject(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  if (!req.user?.id) {
    return res.status(401).json({ code: ApiErrorCode.UNAUTHORIZED, message: '인증이 필요합니다.' })
  }
  try {
    const project = await projectsService.getById(req.params.id as string, req.user.id)
    if (!project) {
      return res.status(404).json({ code: ApiErrorCode.NOT_FOUND, message: '프로젝트를 찾을 수 없습니다.' })
    }
    return res.json(toResponse(project as Record<string, unknown>))
  } catch (err) {
    console.error('[GET /api/projects/:id]', err)
    return res.status(500).json({ code: ApiErrorCode.SERVER_ERROR, message: (err as Error).message })
  }
}

export async function patchProject(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  if (!req.user?.id) {
    return res.status(401).json({ code: ApiErrorCode.UNAUTHORIZED, message: '인증이 필요합니다.' })
  }
  const parsed = updateProjectSchema.safeParse(req.body ?? {})
  if (!parsed.success) return validationErrorResponse(res, parsed.error)
  try {
    const project = await projectsService.update(
      req.params.id as string,
      req.user.id,
      parsed.data
    )
    if (!project) {
      return res.status(404).json({ code: ApiErrorCode.NOT_FOUND, message: '프로젝트를 찾을 수 없습니다.' })
    }
    return res.json(toResponse(project as Record<string, unknown>))
  } catch (err) {
    console.error('[PATCH /api/projects/:id]', err)
    return res.status(500).json({ code: ApiErrorCode.SERVER_ERROR, message: (err as Error).message })
  }
}

export async function deleteProject(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  if (!req.user?.id) {
    return res.status(401).json({ code: ApiErrorCode.UNAUTHORIZED, message: '인증이 필요합니다.' })
  }
  try {
    const ok = await projectsService.remove(req.params.id as string, req.user.id)
    if (!ok) {
      return res.status(404).json({ code: ApiErrorCode.NOT_FOUND, message: '프로젝트를 찾을 수 없습니다.' })
    }
    return res.status(204).send()
  } catch (err) {
    console.error('[DELETE /api/projects/:id]', err)
    return res.status(500).json({ code: ApiErrorCode.SERVER_ERROR, message: (err as Error).message })
  }
}
