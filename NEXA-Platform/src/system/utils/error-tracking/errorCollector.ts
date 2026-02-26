/**
 * 전역 에러 수집기
 *
 * window.onerror, unhandledrejection, Vue 에러 핸들러를 등록하여
 * 모든 에러를 자동으로 수집합니다.
 */

// import { addError } from './errorStorage' // useErrorTracking에서 이벤트로 처리하므로 제거

let isInitialized = false
let isCollecting = true
let errorCollector = null

/**
 * 에러 정보 정규화
 * @param {Object} errorData - 원본 에러 데이터
 * @returns {Object} 정규화된 에러 객체
 */
function normalizeError(errorData) {
  const { message, source, lineno, colno, error, filename, stack, url, userAgent, level = 'error' } = errorData

  // 스택 트레이스 추출
  let errorStack = stack
  if (!errorStack && error) {
    errorStack = error.stack
  }
  if (!errorStack && error?.error) {
    errorStack = error.error?.stack
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

  // 에러 타입 감지하여 level 설정
  let detectedLevel = level
  if (error) {
    const errorType = error.constructor?.name || error.name
    const errorMessage = message || error?.message || ''
    
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

  const normalized = {
    message: message || error?.message || '알 수 없는 에러',
    level: detectedLevel,
    file: errorFile || null,
    line: errorLine || null,
    column: errorColumn || null,
    stack: errorStack || null,
    url: url || window.location.href,
    userAgent: userAgent || navigator.userAgent,
    timestamp: Date.now(),
    // 에러 타입 정보 추가 (차트 분류용)
    errorType: error?.constructor?.name || error?.name || null,
  }


  return normalized
}

/**
 * 에러 수집 핸들러
 * @param {Object} errorData - 에러 데이터
 */
function collectError(errorData) {
  if (!isCollecting) {
    return
  }

  try {
    const normalizedError = normalizeError(errorData)

    // ID가 없으면 생성
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

/**
 * JavaScript 에러 핸들러
 */
function handleWindowError(message, source, lineno, colno, error) {
  collectError({
    message,
    source,
    lineno,
    colno,
    error,
    level: 'error',
  })

  // 기본 에러 핸들링은 유지 (콘솔에 출력)
  return false
}

/**
 * Promise rejection 핸들러
 */
function handleUnhandledRejection(event) {
  const reason = event.reason

  let message = 'Unhandled Promise Rejection'
  let error = null

  if (reason instanceof Error) {
    message = reason.message
    error = reason
  } else if (typeof reason === 'string') {
    message = reason
  } else if (reason && typeof reason === 'object') {
    message = reason.message || JSON.stringify(reason)
    error = reason
  }

  collectError({
    message,
    error,
    level: 'unhandled',
  })
}

/**
 * Vue 에러 핸들러 (이벤트 기반)
 */
function handleVueError(event) {
  const { error, info } = event.detail
  collectError({
    message: error.message,
    error,
    level: 'error',
    vueInfo: info,
  })
}

/**
 * 네트워크 에러 인터셉트 (fetch)
 */
function interceptFetch() {
  const originalFetch = window.fetch

  window.fetch = async function (...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || 'unknown'
    const method = args[1]?.method || 'GET'

    // 에러 수집에서 제외할 URL 패턴 (예상된 실패)
    const shouldIgnoreError = (url) => {
      // URL 디코딩 (인코딩된 URL도 체크하기 위해)
      let decodedUrl = url
      try {
        decodedUrl = decodeURIComponent(url)
      } catch {
        // 디코딩 실패 시 원본 URL 사용
      }
      
      // 인덱스 파일 요청 (400은 예상된 에러 - 파일이 없을 수 있음)
      // 인코딩된 형태와 디코딩된 형태 모두 체크
      if (url.includes('.error-analysis-index.json') || decodedUrl.includes('.error-analysis-index.json')) {
        return true
      }
      // 폴더 스캔 요청 (404는 예상된 에러 - API가 폴더를 지원하지 않을 수 있음)
      if ((url.includes('/api/docs/Error/Platform') || decodedUrl.includes('/api/docs/Error/Platform')) && 
          !url.includes('.md') && !decodedUrl.includes('.md') && 
          !url.includes('.json') && !decodedUrl.includes('.json')) {
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
    } catch (error) {
      // 예상된 실패는 무시
      const shouldIgnoreError = (url) => {
        // URL 디코딩 (인코딩된 URL도 체크하기 위해)
        let decodedUrl = url
        try {
          decodedUrl = decodeURIComponent(url)
        } catch {
          // 디코딩 실패 시 원본 URL 사용
        }
        
        // 인덱스 파일 요청 (400은 예상된 에러 - 파일이 없을 수 있음)
        if (url.includes('.error-analysis-index.json') || decodedUrl.includes('.error-analysis-index.json')) {
          return true
        }
        // 폴더 스캔 요청 (404는 예상된 에러 - API가 폴더를 지원하지 않을 수 있음)
        if ((url.includes('/api/docs/Error/Platform') || decodedUrl.includes('/api/docs/Error/Platform')) && 
            !url.includes('.md') && !decodedUrl.includes('.md') && 
            !url.includes('.json') && !decodedUrl.includes('.json')) {
          return true
        }
        return false
      }

      if (shouldIgnoreError(url)) {
        throw error
      }

      // 네트워크 연결 실패 등의 에러
      // 에러 메시지에서 상태 코드 추출 시도 (예: "404 Not Found")
      const errorMessage = error.message || 'Failed to fetch'
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
        error,
        level,
        file: url,
        line: null,
        column: null,
        stack: error.stack || `Network Error\n  URL: ${url}\n  Method: ${method}\n  Error: ${error.message}`,
        url: window.location.href,
        userAgent: navigator.userAgent,
        networkInfo: {
          requestUrl: url,
          method,
          error: error.message,
          errorType: error.name,
        },
      })
      throw error
    }
  }
}

/**
 * 에러 수집기 초기화
 * @param {Object} options - 초기화 옵션
 * @param {boolean} options.collecting - 수집 활성화 여부
 * @param {boolean} options.interceptNetwork - 네트워크 에러 인터셉트 여부
 */
export function initializeErrorCollector(options = {}) {
  if (isInitialized) {
    // 이미 초기화되었으면 조용히 반환 (콘솔 로그 출력 안 함)
    return
  }

  isCollecting = options.collecting !== false
  isInitialized = true

  // window.onerror 핸들러 등록
  window.onerror = handleWindowError

  // unhandledrejection 핸들러 등록
  window.addEventListener('unhandledrejection', handleUnhandledRejection)

  // Vue 에러 핸들러 등록 (이벤트 기반)
  window.addEventListener('error-tracking-vue-error', handleVueError)

  // 네트워크 에러 인터셉트
  if (options.interceptNetwork !== false) {
    interceptFetch()
  }

}

/**
 * 에러 수집 활성화/비활성화
 * @param {boolean} enabled - 활성화 여부
 */
export function setCollectingEnabled(enabled) {
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
  window.removeEventListener('error-tracking-vue-error', handleVueError)
  isInitialized = false

}

/**
 * 에러 수집기 인스턴스 반환 (싱글톤)
 */
export function getErrorCollector() {
  if (!errorCollector) {
    errorCollector = {
      initialize: initializeErrorCollector,
      setCollectingEnabled,
      cleanup: cleanupErrorCollector,
    }
  }
  return errorCollector
}
