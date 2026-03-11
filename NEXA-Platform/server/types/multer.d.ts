/**
 * Multer ESM/NodeNext 호환 타입
 * NodeNext에서 default export 타입이 호출 가능·diskStorage 보유하도록 보강
 */
declare module 'multer' {
  interface StorageEngine {
    _handleFile(req: any, file: any, callback: (e?: Error, i?: any) => void): void
    _removeFile(req: any, file: any, callback: (e: Error | null) => void): void
  }
  function diskStorage(options: {
    destination?: (req: any, file: any, cb: (e: Error | null, d: string) => void) => void
    filename?: (req: any, file: any, cb: (e: Error | null, n: string) => void) => void
  }): StorageEngine
  interface Options {
    storage?: StorageEngine
    limits?: { fileSize?: number }
  }
  interface Instance {
    single(name: string): any
    array(name: string, maxCount?: number): any
    fields(fields: Array<{ name: string; maxCount?: number }>): any
    any(): any
    none(): any
  }
  interface MulterFn {
    (options?: Options): Instance
    diskStorage: typeof diskStorage
  }
  const multer: MulterFn
  export default multer
  export { diskStorage }
}
