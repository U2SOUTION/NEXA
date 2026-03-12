/**
 * [NEXA-ADMIN-01] 비밀번호 정책 — 슈퍼관리자(admin) 강제 강한 비밀번호
 * 최소 10자, 영문·숫자·특수문자 각 1자 이상
 */
const MIN_LENGTH = 10
const HAS_LETTER = /[a-zA-Z]/
const HAS_NUMBER = /\d/
const HAS_SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/

export interface PasswordPolicyResult {
  valid: boolean
  message?: string
}

export function validateStrongPassword(password: string): PasswordPolicyResult {
  if (typeof password !== 'string' || password.length < MIN_LENGTH) {
    return { valid: false, message: `비밀번호는 ${MIN_LENGTH}자 이상이어야 합니다.` }
  }
  if (!HAS_LETTER.test(password)) {
    return { valid: false, message: '비밀번호에 영문자를 포함해 주세요.' }
  }
  if (!HAS_NUMBER.test(password)) {
    return { valid: false, message: '비밀번호에 숫자를 포함해 주세요.' }
  }
  if (!HAS_SPECIAL.test(password)) {
    return { valid: false, message: '비밀번호에 특수문자를 포함해 주세요.' }
  }
  return { valid: true }
}
