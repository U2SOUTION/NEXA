/**
 * [NEXA-AUTH-01] 인증 토큰을 붙여 API 호출, 401 시 refresh 후 재시도 또는 로그인 페이지로 이동
 */
import { useRouter } from 'vue-router'
import { useAuthStore } from '@system/store/authStore'
import {
  authenticatedFetch,
  type AuthenticatedFetchOptions,
} from '@system/utils/authenticatedFetch'

export function useAuthenticatedFetch() {
  const router = useRouter()
  const authStore = useAuthStore()

  async function authFetch(url: string, options: AuthenticatedFetchOptions = {}): Promise<Response> {
    return authenticatedFetch(
      url,
      options,
      () => authStore.getAuthHeaders() as Record<string, string>,
      () => authStore.refreshAccess(),
      (path) => router.push(path)
    )
  }

  return { authFetch }
}
