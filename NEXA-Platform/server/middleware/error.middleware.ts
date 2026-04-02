// server/middleware/error.middleware.ts
// Express 에러 미들웨어 — 인자 4개(err, req, res, next) 필수
import type { Request, Response, NextFunction } from 'express'
import { toApiErrorBody, exposeErrorDetailsToClient } from '../utils/errUtils.js'

export function errorMiddleware(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err)
  }

  console.error('Express 에러:', err)

  const { status, body } = toApiErrorBody(err)

  const payload: Record<string, unknown> = { ...body }

  if (exposeErrorDetailsToClient()) {
    payload.path = req.path
    payload.method = req.method
  }

  res.status(status).json(payload)
}
