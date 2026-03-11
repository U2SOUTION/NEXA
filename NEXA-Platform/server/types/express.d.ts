/**
 * Express Request 확장 — req.user, req.device 전역 타입 주입
 * [NEXA-PLATFORM-TS-01] §5.3.1
 */
import type { AuthUser, DeviceRow } from './common.js'
import type { Multer } from 'multer'

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
      device?: DeviceRow
      /** Multer 단일 파일 (single) */
      file?: { fieldname: string; originalname: string; path?: string; buffer?: Buffer; [k: string]: unknown }
      /** Multer 다중 파일 (array, fields) */
      files?: Multer.File[] | { [field: string]: Multer.File[] } | undefined
    }
  }
}

export {}
