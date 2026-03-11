/**
 * 인증 스토어 [NEXA-AUTH-01]
 * 로그인/회원가입/로그아웃, 토큰 저장·복원, 사용자 정보
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthUser } from '@system/types'
import { getApiBaseUrl } from '@system/utils/apiBaseUrl'

const STORAGE_ACCESS = 'nexa_auth_access_token'
const STORAGE_REFRESH = 'nexa_auth_refresh_token'
const STORAGE_USER = 'nexa_auth_user'

export type { AuthUser }

export function getTierLabel(tier: string): string {
  const map: Record<string, string> = {
    BASIC: '베타 테스터',
    STANDARD: '정회원',
  }
  return map[tier] ?? tier
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const user = ref<AuthUser | null>(null)

  const isLoggedIn = computed(() => !!accessToken.value && !!user.value)
  const tierLabel = computed(() => (user.value ? getTierLabel(user.value.tier) : ''))

  function getStoredTokens() {
    if (typeof localStorage === 'undefined') return
    try {
      const a = localStorage.getItem(STORAGE_ACCESS)
      const r = localStorage.getItem(STORAGE_REFRESH)
      const u = localStorage.getItem(STORAGE_USER)
      if (a) accessToken.value = a
      if (r) refreshToken.value = r
      if (u) {
        try {
          user.value = JSON.parse(u) as AuthUser
        } catch {
          user.value = null
        }
      }
    } catch {
      // ignore
    }
  }

  function persistTokens(access: string, refresh: string, userData: AuthUser) {
    accessToken.value = access
    refreshToken.value = refresh
    user.value = userData
    try {
      localStorage.setItem(STORAGE_ACCESS, access)
      localStorage.setItem(STORAGE_REFRESH, refresh)
      localStorage.setItem(STORAGE_USER, JSON.stringify(userData))
    } catch {
      // ignore
    }
  }

  function clearAuth() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    try {
      localStorage.removeItem(STORAGE_ACCESS)
      localStorage.removeItem(STORAGE_REFRESH)
      localStorage.removeItem(STORAGE_USER)
    } catch {
      // ignore
    }
  }

  const API = () => getApiBaseUrl()

  async function login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch(`${API()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return { ok: false, error: data.message || data.error || `HTTP ${res.status}` }
      }
      if (data.access_token && data.user) {
        persistTokens(data.access_token, data.refresh_token || '', data.user)
        return { ok: true }
      }
      return { ok: false, error: '응답 형식 오류' }
    } catch (e) {
      return { ok: false, error: (e as Error).message || '네트워크 오류' }
    }
  }

  async function register(payload: { email: string; password: string; display_name?: string }): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch(`${API()}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload.email.trim().toLowerCase(),
          password: payload.password,
          display_name: (payload.display_name || '').trim() || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return { ok: false, error: data.message || data.error || `HTTP ${res.status}` }
      }
      if (data.access_token && data.user) {
        persistTokens(data.access_token, data.refresh_token || '', data.user)
        return { ok: true }
      }
      return { ok: false, error: '응답 형식 오류' }
    } catch (e) {
      return { ok: false, error: (e as Error).message || '네트워크 오류' }
    }
  }

  async function logout(): Promise<void> {
    const refresh = refreshToken.value
    if (refresh) {
      try {
        await fetch(`${API()}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refresh }),
        })
      } catch {
        // ignore
      }
    }
    clearAuth()
  }

  async function refreshAccess(): Promise<boolean> {
    const refresh = refreshToken.value
    if (!refresh) return false
    try {
      const res = await fetch(`${API()}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        clearAuth()
        return false
      }
      if (data.access_token && user.value) {
        accessToken.value = data.access_token
        try {
          localStorage.setItem(STORAGE_ACCESS, data.access_token)
        } catch {
          // ignore
        }
        return true
      }
      return false
    } catch {
      clearAuth()
      return false
    }
  }

  async function fetchMe(): Promise<boolean> {
    const token = accessToken.value
    if (!token) return false
    try {
      const res = await fetch(`${API()}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) {
        const renewed = await refreshAccess()
        if (renewed) return fetchMe()
        return false
      }
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.user) {
        user.value = data.user
        try {
          localStorage.setItem(STORAGE_USER, JSON.stringify(data.user))
        } catch {
          // ignore
        }
        return true
      }
      return false
    } catch {
      return false
    }
  }

  function init() {
    getStoredTokens()
  }

  return {
    accessToken,
    refreshToken,
    user,
    isLoggedIn,
    tierLabel,
    getTierLabel,
    init,
    login,
    register,
    logout,
    refreshAccess,
    fetchMe,
    persistTokens,
    clearAuth,
    getAuthHeaders: () => (accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {}),
  }
})
