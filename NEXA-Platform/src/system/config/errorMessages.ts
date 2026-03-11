/**
 * API 에러 코드 → 사용자 메시지 맵 — i18n·토스트용
 * [NEXA-PLATFORM-TS-01] §2.5
 * ApiErrorCodeType에 새 코드 추가 시 여기에도 필수 추가 → 타입 에러로 누락 방지
 */
import { ApiErrorCode } from '@/system/schemas/errors'
import type { ApiErrorCodeType } from '@/system/schemas/errors'

export const ERROR_MESSAGES: Record<ApiErrorCodeType, string> = {
  [ApiErrorCode.VALIDATION_ERROR]: '입력값을 확인해 주세요.',
  [ApiErrorCode.UNAUTHORIZED]: '로그인이 필요합니다.',
  [ApiErrorCode.FORBIDDEN]: '접근 권한이 없습니다.',
  [ApiErrorCode.NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
  [ApiErrorCode.CONFLICT]: '충돌이 발생했습니다. 다시 시도해 주세요.',
  [ApiErrorCode.DEVICE_TOKEN_INVALID]: '디바이스 인증에 실패했습니다.',
  [ApiErrorCode.INVALID_CREDENTIALS]: '이메일 또는 비밀번호가 올바르지 않습니다.',
  [ApiErrorCode.EMAIL_IN_USE]: '이미 사용 중인 이메일입니다.',
  [ApiErrorCode.SERVER_ERROR]: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  [ApiErrorCode.INVALID_REFRESH_TOKEN]: '유효하지 않거나 만료된 토큰입니다.',
  [ApiErrorCode.REFRESH_TOKEN_REVOKED]: '이미 로그아웃된 토큰입니다.',
  [ApiErrorCode.USER_NOT_FOUND]: '사용자를 찾을 수 없습니다.',
  [ApiErrorCode.INVALID_TOKEN]: '유효하지 않은 토큰입니다.',
  [ApiErrorCode.DEVICE_INACTIVE]: '비활성화된 디바이스입니다.',
  [ApiErrorCode.MISSING_DOMAIN]: 'domain 파라미터가 필요합니다.',
  [ApiErrorCode.INVALID_FILE_TYPE]: '지원하지 않는 파일 형식입니다.',
  [ApiErrorCode.HASH_COMPUTE_FAILED]: '파일 해시 계산에 실패했습니다.',
  [ApiErrorCode.UPLOAD_FAILED]: '업로드에 실패했습니다.',
  [ApiErrorCode.EXPLORER_FAILED]: '탐색기 조회에 실패했습니다.',
  [ApiErrorCode.EXPLORER_TREE_FAILED]: '트리 조회에 실패했습니다.',
  [ApiErrorCode.INVALID_PARAMS]: '필수 파라미터가 누락되었습니다.',
  [ApiErrorCode.AI_MODEL_LOAD_FAILED]: 'AI 모델을 불러올 수 없습니다.',
  [ApiErrorCode.AI_TIMEOUT]: 'AI 응답 시간이 초과되었습니다.',
  [ApiErrorCode.AI_SERVICE_UNAVAILABLE]: 'AI 서비스를 사용할 수 없습니다.',
}
