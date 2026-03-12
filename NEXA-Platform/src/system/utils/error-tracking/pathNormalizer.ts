/**
 * 경로 정규화 유틸리티
 * 개발 서버 URL, 절대 경로 등을 프로젝트 상대 경로로 변환
 */

/**
 * 가상 경로 체크 (.q-cache, chunk- 등 Vite/Quasar 캐시 경로)
 * @param {string} path - 체크할 경로
 * @returns {boolean} 가상 경로 여부
 */
export function isVirtualPath(path: string): boolean {
  if (!path) return false
  return (
    path.includes('/.q-cache/') ||
    path.includes('/chunk-') ||
    path.includes('/node_modules/.q-cache/') ||
    /\/node_modules\/[^/]+\/chunk-/.test(path)
  )
}

/**
 * URL 경로 정규화 (공통 함수)
 * @param {string} urlPath - 정규화할 URL 경로
 * @param {Object} options - 옵션
 * @param {boolean} options.preserveVirtual - 가상 경로 보존 여부 (기본값: true)
 * @param {boolean} options.removeQuery - 쿼리 파라미터 제거 여부 (기본값: true)
 * @returns {string} 정규화된 경로
 */
export function normalizeUrlPath(urlPath: string, options: { preserveVirtual?: boolean; removeQuery?: boolean } = {}): string {
  const { preserveVirtual = true, removeQuery = true } = options

  if (!urlPath) return urlPath

  let normalized = urlPath

  // 쿼리 파라미터 제거
  if (removeQuery && normalized.includes('?')) {
    normalized = normalized.split('?')[0]
  }

  // 가상 경로인 경우 원본 URL 유지
  if (preserveVirtual && isVirtualPath(normalized)) {
    return normalized
  }

  // src/ 경로 정규화
  if (normalized.includes('/src/')) {
    return normalized.replace(/^https?:\/\/[^/]+(?::\d+)?\/src\//, 'NEXA-Platform/src/')
  }

  // node_modules/ 경로 정규화 (가상 경로 제외)
  if (normalized.includes('/node_modules/') && !isVirtualPath(normalized)) {
    return normalized.replace(/^https?:\/\/[^/]+(?::\d+)?\/node_modules\//, 'NEXA-Platform/node_modules/')
  }

  // 개발 서버 URL만 제거
  const devServerUrlPattern = /^https?:\/\/[^/]+(?::\d+)?\//
  if (devServerUrlPattern.test(normalized)) {
    return normalized.replace(devServerUrlPattern, '')
  }

  return normalized
}

/**
 * 파일 경로를 실제 프로젝트 경로로 변환 (개발 서버 URL → 프로젝트 경로)
 * @param {string} filePath - 변환할 파일 경로
 * @returns {string} 정규화된 파일 경로
 */
export function normalizeFilePathForAI(filePath: string): string {
  if (!filePath || filePath === 'unknown') {
    return 'unknown'
  }

  let normalized = filePath

  // file:// 프로토콜 제거
  if (normalized.startsWith('file://')) {
    normalized = normalized.replace(/^file:\/\/[^/]+\//, '')
    normalized = normalized.replace(/^\/+/, '')
  }

  // 절대 경로에서 프로젝트 경로 추출
  const absolutePathPattern = /[A-Z]:[\\/].*?NEXA-Platform[\\/]src[\\/]/
  if (absolutePathPattern.test(normalized)) {
    const match = normalized.match(/(NEXA-Platform[\\/]src[\\/].*)/i)
    if (match) {
      return match[1].replace(/\\/g, '/')
    }
  }

  // 백슬래시를 슬래시로 변환
  normalized = normalized.replace(/\\/g, '/')

  // 개발 서버 URL 정규화
  if (/^https?:\/\//.test(normalized)) {
    normalized = normalizeUrlPath(normalized, { preserveVirtual: true })
  }

  // 이미 node_modules/로 시작하는 경우
  if (normalized.startsWith('node_modules/') && !normalized.includes('NEXA-Platform/') && !isVirtualPath(normalized)) {
    normalized = 'NEXA-Platform/' + normalized
  }

  return normalized
}

/**
 * STACK 트레이스 내의 경로도 변환
 * @param {string} stack - 스택 트레이스 문자열
 * @returns {string} 정규화된 스택 트레이스
 */
export function normalizeStackForAI(stack: string): string {
  if (!stack || stack === '없음') {
    return stack
  }

  const lines = stack.split('\n')
  const normalizedLines = lines.map((line: string) => {
    let processedLine = line

    // 쿼리 파라미터 + 라인:컬럼 패턴: http://localhost:9000/path/file.js?t=123:45:67
    const urlWithQueryPattern = /(https?:\/\/[^/]+(?::\d+)?\/(?:src|node_modules)\/[^?\s]+)\?([^:\s]+):(\d+):(\d+)/g
    processedLine = processedLine.replace(urlWithQueryPattern, (_match: string, urlPath: string, _query: string, lineNum: string, colNum: string) => {
      const normalized = normalizeUrlPath(urlPath, { preserveVirtual: true })
      return normalized + ':' + lineNum + ':' + colNum
    })

    // 라인:컬럼 패턴: http://localhost:9000/path/file.js:45:67
    const urlPattern = /(https?:\/\/[^/]+(?::\d+)?\/(?:src|node_modules)\/[^:\s]+):(\d+):(\d+)/g
    processedLine = processedLine.replace(urlPattern, (_match: string, urlPath: string, lineNum: string, colNum: string) => {
      const normalized = normalizeUrlPath(urlPath, { preserveVirtual: true })
      return normalized + ':' + lineNum + ':' + colNum
    })

    // URL만 있는 패턴: http://localhost:9000/path/file.js
    const urlOnlyPattern = /(https?:\/\/[^/]+(?::\d+)?\/(?:src|node_modules)\/[^\s:?]+)(?:\?[^\s:]+)?/g
    processedLine = processedLine.replace(urlOnlyPattern, (_match: string, urlPath: string) => {
      return normalizeUrlPath(urlPath, { preserveVirtual: true })
    })

    return processedLine
  })

  // 이미 변환된 라인에서 node_modules/로 시작하는 경우 처리
  const finalLines = normalizedLines.map((line: string) => {
    if (line.includes('NEXA-Platform/') || isVirtualPath(line)) {
      return line
    }
    return line.replace(/\bnode_modules\//g, 'NEXA-Platform/node_modules/')
  })

  return finalLines.join('\n')
}

