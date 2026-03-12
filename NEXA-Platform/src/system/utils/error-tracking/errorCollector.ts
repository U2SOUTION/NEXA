/**
 * 전역 에러 수집기
 *
 * window.onerror, unhandledrejection, Vue 에러 핸들러를 등록하여
 * 모든 에러를 자동으로 수집합니다.
 */

import type { NormalizedError } from './errorTrackingTypes'

let isInitialized = false
let isCollecting = true

interface ErrorCollectorInstance {
  initialize: typeof initializeErrorCollector
  setCollectingEnabled: typeof setCollectingEnabled
  cleanup: typeof cleanupErrorCollector
}

let errorCollector: ErrorCollectorInstance | null = null

interface RawErrorData {
  message?: string
  source?: string
  lineno?: number
  colno?: number
  error?: unknown
  filename?: string
  stack?: string
  url?: string
  userAgent?: string
  level?: string
}

function normalizeError(errorData: RawErrorData): NormalizedError {
  const { message, source, lineno, colno, error, filename, stack, url, userAgent, level = 'error' } = errorData
  const err = error as { stack?: string; error?: { stack?: string }; constructor?: { name?: string }; name?: string; message?: string } | undefined

  let errorStack = stack
  if (!errorStack && err) {
    errorStack = err.stack
  }
  if (!errorStack && err?.error) {
    errorStack = (err.error as { stack?: string }).stack
  }

  // 파일명 및 라인 번호 추출
  let errorFile = filename || source
  let errorLine = lineno
  let errorColumn = colno

  // 스택 트레이스에서 파일명과 라인 번호 파싱
  if (errorStack && !errorFile) {
    const stackLines = errorStack.split('\n')
    if (stackLines.length > 0) {
      const firstLine = stackLines[0]
      // 스택 트레이스 형식: "at functionName (file://path/to/file.js:line:column)"
      const match = firstLine.match(/\((.+):(\d+):(\d+)\)/)
      if (match) {
        errorFile = match[1]
        errorLine = parseInt(match[2], 10)
        errorColumn = parseInt(match[3], 10)
        // 다른 패턴 시도: "at file://path/to/file.js:line:column"
        const altMatch = firstLine.match(/at\s+(.+):(\d+):(\d+)/)
        if (altMatch) {
          errorFile = altMatch[1]
          errorLine = parseInt(altMatch[2], 10)
          errorColumn = parseInt(altMatch[3], 10)
        }
      }
    }
  }

  let detectedLevel = level
  if (err) {
    const errorType = err.constructor?.name ?? err.name ?? ''
    const errorMessage = message || (err?.message ?? '')
    
    // 에러 타입에 따라 level 분류
    if (errorType === 'TypeError' || errorMessage.includes('TypeError')) {
      detectedLevel = 'error' // TypeError는 error 레벨
    } else if (errorType === 'ReferenceError' || errorMessage.includes('ReferenceError')) {
      detectedLevel = 'error' // ReferenceError는 error 레벨
    } else if (errorType === 'SyntaxError' || errorMessage.includes('SyntaxError')) {
      detectedLevel = 'error' // SyntaxError는 error 레벨
    } else if (errorType === 'RangeError' || errorMessage.includes('RangeError')) {
      detectedLevel = 'error' // RangeError는 error 레벨
    } else if (errorType === 'EvalError' || errorMessage.includes('EvalError')) {
      detectedLevel = 'error' // EvalError는 error 레벨
    } else if (errorType === 'URIError' || errorMessage.includes('URIError')) {
      detectedLevel = 'error' // URIError는 error 레벨
    } else if (errorMessage.toLowerCase().includes('warning')) {
      detectedLevel = 'warning' // 메시지에 warning이 포함된 경우
    } else if (errorMessage.toLowerCase().includes('unhandled') || errorMessage.toLowerCase().includes('rejection')) {
      detectedLevel = 'unhandled' // Promise rejection 관련
    }
  }

  const normalized: NormalizedError = {
    message: message || (err?.message ?? '알 수 없는 에러'),
    level: detectedLevel,
    file: errorFile || null,
    line: errorLine || null,
    column: errorColumn || null,
    stack: errorStack || null,
    url: url || window.location.href,
    userAgent: userAgent || navigator.userAgent,
    timestamp: Date.now(),
    // 에러 타입 정보 추가 (차트 분류용)
    errorType: err?.constructor?.name ?? err?.name ?? null,
  }


  return normalized
}

function collectError(errorData: RawErrorData & Partial<NormalizedError>): void {
  if (!isCollecting) {
    return
  }

  try {
    const normalizedError = normalizeError(errorData) as NormalizedError & { id?: string; status?: string; count?: number }

    if (!normalizedError.id) {
      normalizedError.id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }

    // status가 없으면 기본값 설정
    if (!normalizedError.status) {
      normalizedError.status = 'new'
    }

    // count가 없으면 기본값 설정
    if (!normalizedError.count) {
      normalizedError.count = 1
    }

    // 에러 저장은 useErrorTracking의 handleErrorCollected에서 처리
    // 여기서는 이벤트만 발생시켜 useErrorTracking이 처리하도록 함
    window.dispatchEvent(
      new CustomEvent('error-tracking-error-collected', {
        detail: { error: normalizedError },
      }),
    )
  } catch {
    // 에러 수집 실패는 조용히 처리 (콘솔 로그 출력 안 함)
  }
}

function handleWindowError(message: string | Event, source?: string | null, lineno?: number | null, colno?: number | null, error?: Error | null): boolean {
  collectError({
    message: typeof message === 'string' ? message : (error?.message ?? 'Unknown error'),
    source: source ?? undefined,
    lineno: lineno ?? undefined,
    colno: colno ?? undefined,
    error,
    level: 'error',
  })

  // 기본 에러 핸들링은 유지 (콘솔에 출력)
  return false
}

function handleUnhandledRejection(event: PromiseRejectionEvent): void {
  const reason = event.reason

  let message = 'Unhandled Promise Rejection'
  let error = null

  if (reason instanceof Error) {
    message = reason.message
    error = reason
  } else if (typeof reason === 'string') {
    message = reason
  } else if (reason && typeof reason === 'object') {
    message = (reason as { message?: string }).message ?? JSON.stringify(reason)
    error = reason as Error
  }

  collectError({
    message,
    error,
    level: 'unhandled',
  })
}

function handleVueError(event: CustomEvent<{ error: Error; info?: string }>): void {
  const detail = event.detail as { error: Error; info?: string }
  const { error, info } = detail
  collectError({
    message: error.message,
    error,
    level: 'error',
    vueInfo: info ?? undefined,
  })
}

/**
 * 네트워크 에러 인터셉트 (fetch)
 */
function interceptFetch() {
  const originalFetch = window.fetch

  window.fetch = async function (...args: Parameters<typeof fetch>) {
    const input = args[0]
    const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : (input && typeof input === 'object' && 'url' in input ? String((input as { url: string }).url) : 'unknown'))
    const method = (args[1] as { method?: string } | undefined)?.method ?? 'GET'

    const shouldIgnoreError = (urlToCheck: string): boolean => {
      // URL 디코딩 (인코딩된 URL도 체크하기 위해)
      let decodedUrl = urlToCheck
      try {
        decodedUrl = decodeURIComponent(urlToCheck)
      } catch {
        // 디코딩 실패 시 원본 URL 사용
      }
      
      // 인덱스 파일 요청 (400은 예상된 에러 - 파일이 없을 수 있음)
      // 인코딩된 형태와 디코딩된 형태 모두 체크
      if (urlToCheck.includes('.error-analysis-index.json') || decodedUrl.includes('.error-analysis-index.json')) {
        return true
      }
      if ((urlToCheck.includes('/api/docs/Error/Platform') || decodedUrl.includes('/api/docs/Error/Platform')) && 
          !urlToCheck.includes('.md') && !decodedUrl.includes('.md') && 
          !urlToCheck.includes('.json') && !decodedUrl.includes('.json')) {
        return true
      }
      return false
    }

    try {
      const response = await originalFetch.apply(this, args)

      // HTTP 에러 상태 코드 체크 (400 이상)
      if (!response.ok && response.status >= 400) {
        // 예상된 실패는 무시
        if (shouldIgnoreError(url)) {
          return response
        }

        // 404는 경고로 처리 (존재하지 않는 리소스는 일반적일 수 있음)
        const level = response.status === 404 ? 'warning' : 'error'

        collectError({
          message: `HTTP ${response.status} ${response.statusText}: ${method} ${url}`,
          level,
          file: url,
          line: null,
          column: null,
          stack: `Network Error\n  URL: ${url}\n  Method: ${method}\n  Status: ${response.status} ${response.statusText}`,
          url: window.location.href,
          userAgent: navigator.userAgent,
          networkInfo: {
            requestUrl: url,
            method,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
          },
        })
      }

      return response
    } catch (err: unknown) {
      const shouldIgnoreErrorInCatch = (urlToCheck: string): boolean => {
        // URL 디코딩 (인코딩된 URL도 체크하기 위해)
        let decoded = urlToCheck
        try {
          decoded = decodeURIComponent(urlToCheck)
        } catch {
          // ignore
        }
        if (urlToCheck.includes('.error-analysis-index.json') || decoded.includes('.error-analysis-index.json')) return true
        if ((urlToCheck.includes('/api/docs/Error/Platform') || decoded.includes('/api/docs/Error/Platform')) && 
            !urlToCheck.includes('.md') && !decoded.includes('.md') && 
            !urlToCheck.includes('.json') && !decoded.includes('.json')) return true
        return false
      }

      if (shouldIgnoreErrorInCatch(url)) {
        throw err
      }

      const e = err as Error
      const errorMessage = e?.message ?? 'Failed to fetch'
      let statusCode = null
      let statusText = errorMessage

      // "404 Not Found" 형식의 메시지에서 상태 코드 추출
      const statusMatch = errorMessage.match(/^(\d+)\s+(.+)$/)
      if (statusMatch) {
        statusCode = statusMatch[1]
        statusText = statusMatch[2]
      }

      // HTTP 에러와 동일한 형식으로 메시지 생성 (유사도 판단을 위해)
      const message = statusCode ? `HTTP ${statusCode} ${statusText}: ${method} ${url}` : `Network Error: ${errorMessage} - ${method} ${url}`

      // 404는 경고로 처리 (HTTP 에러와 동일하게)
      const level = statusCode === '404' ? 'warning' : 'error'

      collectError({
        message,
        error: e,
        level,
        file: url,
        line: null,
        column: null,
        stack: e?.stack ?? `Network Error\n  URL: ${url}\n  Method: ${method}\n  Error: ${e?.message ?? ''}`,
        url: window.location.href,
        userAgent: navigator.userAgent,
        networkInfo: {
          requestUrl: url,
          method,
          error: e?.message,
          errorType: (e as Error & { name?: string }).name,
        },
      })
      throw err
    }
  }
}

/**
 * 에러 수집기 초기화
 * @param {Object} options - 초기화 옵션
 * @param {boolean} options.collecting - 수집 활성화 여부
 * @param {boolean} options.interceptNetwork - 네트워크 에러 인터셉트 여부
 */
export function initializeErrorCollector(options: { collecting?: boolean; interceptNetwork?: boolean } = {}): void {
  if (isInitialized) {
    // 이미 초기화되었으면 조용히 반환 (콘솔 로그 출력 안 함)
    return
  }

  isCollecting = (options as { collecting?: boolean }).collecting !== false
  isInitialized = true

  // window.onerror 핸들러 등록
  window.onerror = handleWindowError

  // unhandledrejection 핸들러 등록
  window.addEventListener('unhandledrejection', handleUnhandledRejection)

  // Vue 에러 핸들러 등록 (이벤트 기반)
  window.addEventListener('error-tracking-vue-error', handleVueError as (ev: Event) => void)

  if ((options as { interceptNetwork?: boolean }).interceptNetwork !== false) {
    interceptFetch()
  }

}

/**
 * 에러 수집 활성화/비활성화
 * @param {boolean} enabled - 활성화 여부
 */
export function setCollectingEnabled(enabled: boolean): void {
  isCollecting = enabled
  window.dispatchEvent(
    new CustomEvent('error-tracking-collecting-changed', {
      detail: { enabled },
    }),
  )
}

/**
 * 에러 수집기 정리
 */
export function cleanupErrorCollector() {
  if (!isInitialized) {
    return
  }

  window.onerror = null
  window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  window.removeEventListener('error-tracking-vue-error', handleVueError as (ev: Event) => void)
  isInitialized = false

}

/**
 * 에러 수집기 인스턴스 반환 (싱글톤)
 */
export function getErrorCollector(): ErrorCollectorInstance {
  if (errorCollector == null) {
    errorCollector = {
      initialize: initializeErrorCollector,
      setCollectingEnabled,
      cleanup: cleanupErrorCollector,
    }
  }
  return errorCollector
}
