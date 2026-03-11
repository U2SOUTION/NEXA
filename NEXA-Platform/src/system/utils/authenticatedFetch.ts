/**
 * [NEXA-AUTH-01] 인증이 필요한 API 호출 시 Bearer 첨부, 401 시 refresh 후 재시도 또는 로그인 페이지로 리다이렉트
 * 사용처: 인증이 필요한 API를 호출하는 스토어/컴포넌트에서 fetch 대신 사용
 */
/* global RequestInit -- Fetch API 전역 타입 */
import { getApiBaseUrl } from '@system/utils/apiBaseUrl'

export type AuthenticatedFetchOptions = RequestInit & {
  /** 401 시 refresh 재시도 후 리다이렉트할 경로 (기본: /login) */
  redirectToLogin?: string
  /** refresh 실패 시 리다이렉트 여부 (기본: true) */
  redirectOnAuthFail?: boolean
}

/**
 * getAuthHeaders / refresh 콜백을 주입해 사용. (store 의존성 제거)
 * 앱에서는 useAuthenticatedFetch() composable로 사용 권장.
 */
export async function authenticatedFetch(
  url: string,
  options: AuthenticatedFetchOptions = {},
  getAuthHeaders: () => Record<string, string>,
  refreshAccess: () => Promise<boolean>,
  redirectTo: (path: string) => void
): Promise<Response> {
  const { redirectToLogin = '/login', redirectOnAuthFail = true, ...init } = options
  const headers = new Headers(init.headers)
  const auth = getAuthHeaders()
  Object.entries(auth).forEach(([k, v]) => headers.set(k, v))

  let res = await fetch(url, { ...init, headers })

  if (res.status === 401) {
    const renewed = await refreshAccess()
    if (renewed) {
      const auth2 = getAuthHeaders()
      const headers2 = new Headers(init.headers)
      Object.entries(auth2).forEach(([k, v]) => headers2.set(k, v))
      res = await fetch(url, { ...init, headers: headers2 })
    }
    if (res.status === 401 && redirectOnAuthFail && redirectToLogin) {
      const redirectUrl = redirectToLogin.startsWith('/') ? redirectToLogin : `/${redirectToLogin}`
      redirectTo(redirectUrl)
      return res
    }
  }
  return res
}

/**
 * API 상대 경로(예: auth/me, /auth/me)를 절대 URL로 변환 후 authenticatedFetch 호출
 */
export async function authenticatedApiFetch(
  path: string,
  options: AuthenticatedFetchOptions = {},
  getAuthHeaders: () => Record<string, string>,
  refreshAccess: () => Promise<boolean>,
  redirectTo: (path: string) => void
): Promise<Response> {
  const base = getApiBaseUrl()
  const url = path.startsWith('http') ? path : base + (path.startsWith('/') ? path : `/${path}`)
  return authenticatedFetch(url, options, getAuthHeaders, refreshAccess, redirectTo)
}
