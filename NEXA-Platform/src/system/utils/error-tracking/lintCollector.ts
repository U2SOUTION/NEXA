/**
 * 린트 오류 수집기
 *
 * 변경된 파일의 ESLint 오류를 수집하여 에러 트래킹 시스템에 통합합니다.
 */

// 브라우저 환경에서는 ESLint API를 직접 사용할 수 없으므로
// Vite 개발 서버의 린트 결과를 활용하거나
// 별도의 API 엔드포인트를 통해 수집합니다.

interface LintErrorLike {
  message?: string
  ruleId?: string
  severity?: number
  line?: number
  column?: number
  source?: string | null
  fixable?: boolean
}

let lintErrorsCache = new Map<string, LintErrorLike[]>()
let isWatching = false

/**
 * Vite 개발 서버의 린트 오류 수집
 * vite-plugin-checker가 생성한 린트 오류를 수집합니다.
 */
export function collectLintErrorsFromVite() {
  // vite-plugin-checker는 브라우저 콘솔에 오류를 표시하지만
  // 직접 접근할 수 없으므로, 개발 서버 API를 통해 수집해야 합니다.
  // 임시로 window.__VITE_LINT_ERRORS__ 같은 전역 변수를 사용할 수 있지만,
  // vite-plugin-checker가 이를 제공하지 않으므로
  // 대신 파일 변경 이벤트를 감지하여 수집합니다.
  
  return []
}

/**
 * 파일 경로를 상대 경로로 변환
 */
function normalizeFilePath(filePath: string): string {
  if (!filePath) return ''
  
  // 절대 경로를 상대 경로로 변환
  const projectRoot = import.meta.env.DEV ? '' : ''
  if (filePath.startsWith(projectRoot)) {
    return filePath.substring(projectRoot.length)
  }
  
  // Windows 경로 처리
  if (filePath.includes('\\')) {
    return filePath.replace(/\\/g, '/')
  }
  
  return filePath
}

/**
 * 린트 오류를 에러 트래킹 형식으로 변환
 */
function convertLintErrorToTrackingError(lintError: LintErrorLike, filePath: string): Record<string, unknown> {
  const normalizedPath = normalizeFilePath(filePath)
  
  return {
    id: `lint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    message: `[Lint] ${lintError.message} (${lintError.ruleId || 'unknown'})`,
    level: lintError.severity === 2 ? 'error' : 'warning',
    file: normalizedPath,
    line: lintError.line || null,
    column: lintError.column || null,
    stack: null, // 린트 오류는 스택 트레이스가 없음
    timestamp: Date.now(),
    status: 'new',
    count: 1,
    url: window.location.href,
    userAgent: navigator.userAgent,
    type: 'lint', // 린트 오류임을 표시
    ruleId: lintError.ruleId || null,
    source: lintError.source || null,
    fixable: lintError.fixable || false,
  }
}

/**
 * 파일의 린트 오류 수집 (변경된 파일 기준)
 * @param {string} filePath - 파일 경로
 * @returns {Array} 린트 오류 목록
 */
export async function collectLintErrorsForFile(filePath: string): Promise<Array<Record<string, unknown>>> {
  try {
    // 개발 환경에서만 수집
    if (!import.meta.env.DEV) {
      return []
    }

    // Vite 개발 서버 API를 통해 린트 오류 수집 시도
    // vite-plugin-checker는 내부적으로 ESLint를 실행하지만
    // 브라우저에서 직접 접근할 수 없으므로,
    // 파일 변경 이벤트를 통해 간접적으로 수집합니다.
    
    // 임시: 파일 경로 기반으로 캐시된 오류 반환
    const cachedErrors = lintErrorsCache.get(filePath)
    if (cachedErrors) {
      return cachedErrors.map(error => convertLintErrorToTrackingError(error, filePath))
    }

    return []
  } catch (error) {
    console.error('[LintCollector] 린트 오류 수집 실패:', error)
    return []
  }
}

/**
 * 파일 변경 이벤트 핸들러
 * Vite HMR 이벤트를 통해 파일 변경을 감지하고 린트 오류를 수집합니다.
 */
export function watchFileChanges(callback: (error: Record<string, unknown>) => void): void {
  if (isWatching) {
    return
  }

  isWatching = true

  // Vite HMR 이벤트 리스너
  if (import.meta.hot) {
    import.meta.hot.on('vite:lint', (data: { errors?: Array<{ filePath?: string; file?: string; errors?: LintErrorLike[] }> }) => {
      // vite-plugin-checker가 생성한 린트 오류 데이터
      if (data && data.errors) {
        (data.errors ?? []).forEach((fileError: { filePath?: string; file?: string; errors?: LintErrorLike[] }) => {
          const filePath = fileError.filePath || fileError.file
          if (filePath) {
            // 캐시 업데이트
            lintErrorsCache.set(filePath, fileError.errors || [])
            
            // 에러 트래킹 시스템에 전달
            const trackingErrors = (fileError.errors ?? []).map((error: LintErrorLike) =>
              convertLintErrorToTrackingError(error, filePath)
            )
            
            trackingErrors.forEach((error: Record<string, unknown>) => {
              callback(error)
            })
          }
        })
      }
    })
  }

  // 대체 방법: 파일 변경 감지를 위한 폴링 (개발 환경에서만)
  if (import.meta.env.DEV) {
    // Vite 개발 서버의 린트 API 엔드포인트 호출 시도
    // 실제로는 vite-plugin-checker가 이를 제공하지 않으므로
    // 브라우저 콘솔의 오류를 파싱하는 방법을 사용할 수 있습니다.
    
    // 주기적으로 콘솔 오류 확인 (임시 방법)
    const originalConsoleError = console.error
    console.error = function(...args) {
      originalConsoleError.apply(console, args)
      
      // ESLint 오류 패턴 감지
      const message = args.join(' ')
      if (message.includes('[ESLint]') || message.includes('eslint')) {
        // ESLint 오류 메시지 파싱
        const lintErrorMatch = message.match(/\[ESLint\]\s+(.+?)\s+\((.+?)\)\s+(.+?):(\d+):(\d+)/)
        if (lintErrorMatch) {
          const [, errorMessage, ruleId, filePath, line, column] = lintErrorMatch
          
          const lintError = {
            message: errorMessage.trim(),
            ruleId: ruleId.trim(),
            line: parseInt(line, 10),
            column: parseInt(column, 10),
            severity: 2, // error
            source: null,
            fixable: false,
          }
          
          // 캐시 업데이트
          const existingErrors = lintErrorsCache.get(filePath) || []
          existingErrors.push(lintError)
          lintErrorsCache.set(filePath, existingErrors)
          
          // 에러 트래킹 시스템에 전달
          const trackingError = convertLintErrorToTrackingError(lintError, filePath)
          callback(trackingError)
        }
      }
    }
  }
}

/**
 * 린트 오류 캐시 초기화
 */
export function clearLintCache() {
  lintErrorsCache.clear()
}

/**
 * 특정 파일의 린트 오류 캐시 제거
 */
export function clearLintCacheForFile(filePath: string): void {
  lintErrorsCache.delete(filePath)
}

/**
 * 모든 린트 오류 수집 (전체 스캔 - 나중에 구현)
 * @returns {Promise<Array>} 린트 오류 목록
 */
export async function collectAllLintErrors() {
  // TODO: 전체 파일 스캔 기능 구현
  // 현재는 변경된 파일 기준으로만 수집
  console.warn('[LintCollector] 전체 스캔 기능은 아직 구현되지 않았습니다.')
  return []
}

