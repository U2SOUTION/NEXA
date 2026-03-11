/**
 * 프로젝트 API 라우트 [NEXA-AUTH-01] §2.2 3단계
 * GET/POST /api/projects, GET/PATCH/DELETE /api/projects/:id
 * 인증: JWT 또는 X-Device-Token (미들웨어에서 처리)
 */
import { Router } from 'express'
import {
  getProjects,
  postProject,
  getProject,
  patchProject,
  deleteProject,
} from './projects.controller.js'

const router = Router()

router.get('/projects', getProjects)
router.post('/projects', postProject)
router.get('/projects/:id', getProject)
router.patch('/projects/:id', patchProject)
router.delete('/projects/:id', deleteProject)

export default router
