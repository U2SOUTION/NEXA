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

/** body-parser: .ts 소스 배포로 strict 체크 시 오류 방지용 스텁 */
declare module 'body-parser' {
  type Handler = (req: unknown, res: unknown, next: (err?: unknown) => void) => void
  function json(options?: object): Handler
  function raw(options?: { type?: string; limit?: string }): Handler
  const bp: { json: typeof json; raw: typeof raw }
  export = bp
}

/** json-schema: transitive deps의 .ts 소스로 strict 체크 오류 방지 */
declare module 'json-schema' {
  const schema: unknown
  export = schema
}

/** mime, multer: .ts 소스 배포로 strict 체크 시 오류 방지 (필요 타입은 사용처에서 보강) */
declare module 'mime' {
  function getType(path: string): string | null
  function getExtension(mimeType: string): string | null
  const mime: { getType: typeof getType; getExtension: typeof getExtension }
  export = mime
}

declare module 'multer' {
  interface Options { dest?: string; storage?: unknown; limits?: { fileSize?: number } }
  type Middleware = (req: unknown, res: unknown, next: (err?: unknown) => void) => void
  interface MulterInstance { single: (name: string) => Middleware }
  function multer(opts?: Options): MulterInstance
  namespace multer {
    function diskStorage(opts: object): unknown
  }
  export = multer
}

declare module 'range-parser' {
  function parse(size: number, str: string, opts?: object): unknown
  export = parse
}

declare module 'send' {
  function send(req: unknown, path: string, opts?: object): unknown
  export = send
}

declare module 'serve-static' {
  function serveStatic(root: string, opts?: object): (req: unknown, res: unknown, next: (err?: unknown) => void) => void
  export = serveStatic
}

declare module 'uuid' {
  export function v4(): string
  export function v7(): string
}

declare module 'string_decoder' {
  class StringDecoder {
    write(buffer: Buffer | Uint8Array): string
    end(buffer?: Buffer | Uint8Array): string
  }
  export = StringDecoder
}
