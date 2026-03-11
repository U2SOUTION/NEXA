// 요청 바디 크기 제한 설정 (.env에서 오버라이드 가능)
export const JSON_BODY_LIMIT = process.env.JSON_BODY_LIMIT || '15mb'
export const URLENCODED_BODY_LIMIT = process.env.URLENCODED_BODY_LIMIT || '15mb'

export default {
  JSON_BODY_LIMIT,
  URLENCODED_BODY_LIMIT,
}
