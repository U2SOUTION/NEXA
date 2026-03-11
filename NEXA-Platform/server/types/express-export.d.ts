/**
 * Express ESM/NodeNext 호환
 * - default export callable + .json/.urlencoded/.static (NodeNext 해석 이슈 대응)
 * - Router named export 보강
 */
declare module 'express' {
  import type {
    Application,
    RequestHandler,
    IRouter,
    Request,
    Response,
    NextFunction,
  } from 'express-serve-static-core'

  const express: {
    (): Application
    json: (options?: { limit?: number | string }) => RequestHandler
    urlencoded: (options?: { extended?: boolean; limit?: number | string }) => RequestHandler
    static: (root: string, options?: object) => RequestHandler
    Router: (options?: { caseSensitive?: boolean; mergeParams?: boolean; strict?: boolean }) => IRouter
  }
  export default express
  export type { Request, Response, NextFunction, Application, RequestHandler }
  export function Router(options?: { caseSensitive?: boolean; mergeParams?: boolean; strict?: boolean }): IRouter
}
