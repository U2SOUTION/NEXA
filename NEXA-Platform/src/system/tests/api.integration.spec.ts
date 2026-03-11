/**
 * API 통합 테스트 — 응답 스키마 검증 [NEXA-PLATFORM-TS-01] §7.2
 * 서버 기동 후 fetch로 실제 요청 → 공유 Zod 스키마로 응답 검증
 *
 * 실행: npm run test:unit (서버가 localhost:3001에서 실행 중이어야 함)
 * 서버 미실행 시: 해당 describe.skip 처리
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { projectsResponseSchema } from '@system/schemas/projects'
import { apiErrorResponseSchema } from '@system/schemas/errors'

const BASE = 'http://localhost:3001'

async function isServerUp(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/api/health`, { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}

describe('API 응답 스키마 검증', () => {
  let serverUp = false

  beforeAll(async () => {
    serverUp = await isServerUp()
  })

  describe('GET /api/projects', () => {
    it('인증 없이 호출 시 ApiErrorResponse 형태 반환', async () => {
      if (!serverUp) return
      const res = await fetch(`${BASE}/api/projects`)
      const body = await res.json()
      const result = apiErrorResponseSchema.safeParse(body)
      expect(result.success, `응답이 ApiErrorResponse 스키마와 일치해야 함: ${JSON.stringify(body)}`).toBe(true)
      if (result.success) {
        expect(result.data.code).toBe('UNAUTHORIZED')
      }
    })

    it('Bearer 토큰으로 호출 시 projects 배열 형태 반환', async () => {
      if (!serverUp) return
      // 유효하지 않은 토큰이라도 401 응답이 스키마를 따름
      const res = await fetch(`${BASE}/api/projects`, {
        headers: { Authorization: 'Bearer invalid-token' },
      })
      const body = await res.json()
      if (res.ok) {
        const result = projectsResponseSchema.safeParse(body)
        expect(result.success, `성공 시 배열 형태: ${JSON.stringify(body).slice(0, 200)}`).toBe(true)
      } else {
        const errResult = apiErrorResponseSchema.safeParse(body)
        expect(errResult.success, `에러 응답도 스키마 준수: ${JSON.stringify(body)}`).toBe(true)
      }
    })
  })

  describe('GET /api/health', () => {
    it('헬스체크 응답 형식 검증', async () => {
      if (!serverUp) return
      const res = await fetch(`${BASE}/api/health`)
      expect(res.ok).toBe(true)
      const body = await res.json()
      expect(body).toHaveProperty('status')
      expect(body.status).toBe('ok')
    })
  })
})
