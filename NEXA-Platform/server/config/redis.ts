/**
 * Redis 클라이언트 (NEXA 인증·캐시)
 * @see [NEXA-AUTH-01] — Device Token 캐시, 비밀번호 리셋 토큰, refresh 블랙리스트
 * REDIS_URL 미설정 시 client = null, 로그아웃 블랙리스트 등 Redis 의존 기능만 비동작
 */
interface RedisClientLike {
  on(event: string, fn: (err: Error) => void): void
  get(key: string): Promise<string | null>
  setex(key: string, sec: number, val: string): Promise<string>
  del(key: string): Promise<number>
}
import Redis from 'ioredis'
const RedisConstructor = Redis as unknown as new (url: string, opts?: object) => RedisClientLike

const REDIS_URL =
  process.env.REDIS_URL ||
  (process.env.REDIS_HOST
    ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}`
    : null)

let client: InstanceType<typeof RedisConstructor> | null = null
if (REDIS_URL) {
  try {
    client = new RedisConstructor(REDIS_URL, {
      maxRetriesPerRequest: 2,
      retryStrategy(times: number) {
        if (times > 3) return null
        return Math.min(times * 200, 2000)
      },
    })
    client.on('error', (err) => console.warn('[Redis]', err.message))
    client.on('connect', () => console.log('[Redis] 연결됨'))
  } catch (err: unknown) {
    const e = err as Error
    console.warn('[Redis] 연결 실패:', e.message)
  }
} else {
  console.warn('[Redis] REDIS_URL 미설정 — 로그아웃 블랙리스트 등 Redis 기능 비활성')
}

export { client as redisClient }
export default client
