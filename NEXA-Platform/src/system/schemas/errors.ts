/**
 * API 비즈니스 에러 코드·응답 타입 — 서버·프론트 공유
 * [NEXA-PLATFORM-TS-01] §2.5
 */
import { z } from 'zod'

const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  DEVICE_TOKEN_INVALID: 'DEVICE_TOKEN_INVALID',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_IN_USE: 'EMAIL_IN_USE',
  SERVER_ERROR: 'SERVER_ERROR',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  REFRESH_TOKEN_REVOKED: 'REFRESH_TOKEN_REVOKED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_TOKEN: 'INVALID_TOKEN',
  DEVICE_INACTIVE: 'DEVICE_INACTIVE',
  MISSING_DOMAIN: 'MISSING_DOMAIN',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  HASH_COMPUTE_FAILED: 'HASH_COMPUTE_FAILED',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  EXPLORER_FAILED: 'EXPLORER_FAILED',
  EXPLORER_TREE_FAILED: 'EXPLORER_TREE_FAILED',
  INVALID_PARAMS: 'INVALID_PARAMS',
  AI_MODEL_LOAD_FAILED: 'AI_MODEL_LOAD_FAILED',
  AI_TIMEOUT: 'AI_TIMEOUT',
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',
} as const

/** 런타임 에러 코드 객체 (예: ApiErrorCode.VALIDATION_ERROR) */
export const ApiErrorCode = API_ERROR_CODES
/** 에러 코드 유니온 타입 (예: code: ApiErrorCodeType) */
export type ApiErrorCodeType = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES]

export interface ValidationErrorItem {
  path: string
  message: string
}

export interface ValidationErrorResponse {
  code: typeof API_ERROR_CODES.VALIDATION_ERROR
  message: string
  errors: ValidationErrorItem[]
}

export interface ApiErrorResponse {
  code: ApiErrorCodeType
  message: string
  details?: unknown
}

const apiErrorCodeSchema = z.enum(
  Object.values(API_ERROR_CODES) as [ApiErrorCodeType, ...ApiErrorCodeType[]]
)

export const apiErrorResponseSchema = z.object({
  code: apiErrorCodeSchema,
  message: z.string(),
  details: z.unknown().optional(),
})

export const validationErrorResponseSchema = z.object({
  code: z.literal(API_ERROR_CODES.VALIDATION_ERROR),
  message: z.string(),
  errors: z.array(z.object({ path: z.string(), message: z.string() })),
})
