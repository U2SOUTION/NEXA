/**
 * node_modules 내 일부 패키지가 .ts 소스를 배포하여 typecheck 시 오류 발생.
 * skipLibCheck는 .d.ts만 대상이므로, paths로 스텁으로 대체.
 */
declare module '@opentelemetry/api' {
  const api: unknown
  export = api
}

declare module 'cors' {
  const fn: (options?: object) => (req: unknown, res: unknown, next: (err?: unknown) => void) => void
  export = fn
}

declare module 'ioredis' {
  interface RedisClient {
    on(event: string, fn: (err?: Error) => void): void
    get(key: string): Promise<string | null>
    setex(key: string, sec: number, val: string): Promise<string>
    del(key: string): Promise<number>
  }
  const Redis: new (url: string, opts?: object) => RedisClient
  export = Redis
}

declare module 'http-errors' {
  function createError(status: number, message?: string): Error
  export = createError
}

declare module 'jsonwebtoken' {
  function sign(payload: object, secret: string, opts?: object): string
  function verify(token: string, secret: string): object
  export = { sign, verify }
}
