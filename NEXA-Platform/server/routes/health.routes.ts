/**
 * 서버 헬스체크 API
 * Docker healthcheck, 로드밸런서·K8s 프로브용
 */
import express from 'express'
import { pool } from '../config/dbConfig.js'

// @types/express default export 타입에 Router 미포함 → 단언 사용 (2단계에서 타입 보강)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const router = (express as any).Router()

// 경량 헬스: 서버 기동 여부만 확인
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

// readiness: DB 연결 확인 후 200
router.get('/health/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.status(200).json({ status: 'ready', db: 'connected' })
  } catch (err) {
    res.status(503).json({ status: 'not ready', db: 'disconnected', error: err.message })
  }
})

export default router
