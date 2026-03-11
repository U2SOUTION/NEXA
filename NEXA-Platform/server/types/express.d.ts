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
      /** Multer 단일 파일 (single) */
      file?: { fieldname: string; originalname: string; path?: string; buffer?: Buffer; [k: string]: any }
      /** Multer 다중 파일 (array, fields) */
      files?: any
    }
  }
}

export {}
