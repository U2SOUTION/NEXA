/**
 * 디바이스 API 라우트 [NEXA-AUTH-01] §5.2
 * POST/GET /api/devices, PATCH/DELETE /api/devices/:id
 * 인증: JWT 또는 X-Device-Token (미들웨어에서 처리)
 */
import { Router } from 'express'
import { postDevice, getDevices, patchDevice, deleteDevice } from './devices.controller.js'

const router = Router()

router.post('/devices', postDevice)
router.get('/devices', getDevices)
router.patch('/devices/:id', patchDevice)
router.delete('/devices/:id', deleteDevice)

export default router
