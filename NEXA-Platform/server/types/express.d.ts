/**
 * Express Request 확장 — req.user, req.device 전역 타입 주입
 * [NEXA-PLATFORM-TS-01] §5.3.1
 */
import type { AuthUser, DeviceRow } from './common'

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
      device?: DeviceRow
    }
  }
}

export {}
