/**
 * 프로젝트 API 컨트롤러 [NEXA-AUTH-01] §2.2 3단계
 */
import * as projectsService from './projects.service.js'

function toResponse(row) {
  if (!row) return null
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    description: row.description,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export async function getProjects(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: '인증이 필요합니다.' })
  }
  try {
    const rows = await projectsService.listByUserId(req.user.id)
    return res.json(rows.map(toResponse))
  } catch (err) {
    console.error('[GET /api/projects]', err)
    return res.status(500).json({ code: 'SERVER_ERROR', message: err.message })
  }
}

export async function postProject(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: '인증이 필요합니다.' })
  }
  try {
    const { name, description } = req.body || {}
    const project = await projectsService.create(req.user.id, { name, description })
    return res.status(201).json(toResponse(project))
  } catch (err) {
    console.error('[POST /api/projects]', err)
    return res.status(500).json({ code: 'SERVER_ERROR', message: err.message })
  }
}

export async function getProject(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: '인증이 필요합니다.' })
  }
  try {
    const project = await projectsService.getById(req.params.id, req.user.id)
    if (!project) {
      return res.status(404).json({ code: 'NOT_FOUND', message: '프로젝트를 찾을 수 없습니다.' })
    }
    return res.json(toResponse(project))
  } catch (err) {
    console.error('[GET /api/projects/:id]', err)
    return res.status(500).json({ code: 'SERVER_ERROR', message: err.message })
  }
}

export async function patchProject(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: '인증이 필요합니다.' })
  }
  try {
    const project = await projectsService.update(
      req.params.id,
      req.user.id,
      req.body || {}
    )
    if (!project) {
      return res.status(404).json({ code: 'NOT_FOUND', message: '프로젝트를 찾을 수 없습니다.' })
    }
    return res.json(toResponse(project))
  } catch (err) {
    console.error('[PATCH /api/projects/:id]', err)
    return res.status(500).json({ code: 'SERVER_ERROR', message: err.message })
  }
}

export async function deleteProject(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: '인증이 필요합니다.' })
  }
  try {
    const ok = await projectsService.remove(req.params.id, req.user.id)
    if (!ok) {
      return res.status(404).json({ code: 'NOT_FOUND', message: '프로젝트를 찾을 수 없습니다.' })
    }
    return res.status(204).send()
  } catch (err) {
    console.error('[DELETE /api/projects/:id]', err)
    return res.status(500).json({ code: 'SERVER_ERROR', message: err.message })
  }
}
