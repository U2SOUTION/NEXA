/** 노드 타입 (path, id, name 등) */
interface GraphNode {
  id?: string
  path?: string
  name?: string
  type?: string
}

/** 필터 옵션 */
export interface DependencyFilterOptions {
  includeNpmPackages?: boolean
  npmPackagePatterns?: string[]
  excludedPaths?: string[]
  includedFileTypes?: string[]
  excludedFileTypes?: string[]
  maxDepth?: number
  customFilter?: ((node: GraphNode) => boolean) | null
}

/**
 * GraphDoc 의존성 그래프 분석기
 * 파일 경로나 디렉토리 경로를 기반으로 실제 파일 의존성을 분석
 *
 * 필터 옵션 객체 구조:
 * - includeNpmPackages: boolean (기본: false) - npm 패키지 포함 여부
 * - npmPackagePatterns: string[] (기본: []) - 포함/제외할 npm 패키지 패턴
 * - excludedPaths: string[] (기본: []) - 제외할 경로 패턴
 * - includedFileTypes: string[] (기본: []) - 포함할 파일 타입. 빈 배열이면 모두 포함
 * - excludedFileTypes: string[] (기본: []) - 제외할 파일 타입
 * - maxDepth: number (기본: 3) - 최대 탐색 깊이
 * - customFilter: Function (기본: null) - 커스텀 필터 함수 (node) => boolean
 */

/**
 * 기본 필터 옵션
 */
interface ResolvedFilterOptions {
  includeNpmPackages: boolean
  npmPackagePatterns: string[]
  excludedPaths: string[]
  includedFileTypes: string[]
  excludedFileTypes: string[]
  maxDepth: number
  customFilter: ((node: GraphNode) => boolean) | null
}

const DEFAULT_FILTER_OPTIONS: ResolvedFilterOptions = {
  includeNpmPackages: false,
  npmPackagePatterns: [],
  excludedPaths: [],
  includedFileTypes: [],
  excludedFileTypes: [],
  maxDepth: 3,
  customFilter: null,
}

/**
 * npm 패키지인지 확인
 * @param {string} importPath - import 경로
 * @returns {boolean} npm 패키지 여부
 */
function isNpmPackage(importPath: string): boolean {
  if (!importPath || typeof importPath !== 'string') return false

  // @로 시작하는 scoped 패키지 (단, @/는 경로 별칭이므로 제외)
  if (importPath.startsWith('@') && !importPath.startsWith('@/')) {
    return true
  }

  // 확장자가 없고 경로 구분자도 없는 경우 npm 패키지로 추정
  if (!importPath.includes('/') && !importPath.startsWith('.') && !importPath.startsWith('src/') && !importPath.startsWith('@/')) {
    return true
  }

  return false
}

/**
 * 경로가 패턴과 일치하는지 확인 (간단한 glob 패턴 지원)
 * @param {string} path - 경로
 * @param {string[]} patterns - 패턴 배열
 * @returns {boolean} 일치 여부
 */
function matchesPattern(path: string, patterns: string[]): boolean {
  if (!patterns || patterns.length === 0) return false

  return patterns.some((pattern: string) => {
    // 간단한 glob 패턴 지원 (*, **)
    const regex = new RegExp('^' + pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*') + '$')
    return regex.test(path)
  })
}

/**
 * 파일 타입 추출 (이미 getFileType 함수가 존재하므로 재사용)
 * @param {string} path - 파일 경로
 * @returns {string|null} 파일 타입 (예: 'vue', 'js')
 */
function extractFileType(path: string): string | null {
  if (!path) return null
  const match = path.match(/\.([^.]+)$/)
  return match ? match[1].toLowerCase() : null
}

/**
 * 의존성 필터 생성
 * @param {DependencyFilterOptions} options - 필터 옵션
 * @returns {Object} 필터 함수 객체
 */
function createDependencyFilter(options: DependencyFilterOptions = {}) {
  const opts: ResolvedFilterOptions = { ...DEFAULT_FILTER_OPTIONS, ...options }

  /**
   * import 경로 필터
   * @param {string} importPath - import 경로
   * @returns {boolean} 포함 여부
   */
  function shouldIncludeImport(importPath: string): boolean {
    if (!importPath) return false

    // npm 패키지 처리
    if (isNpmPackage(importPath)) {
      if (!opts.includeNpmPackages) {
        return false
      }

      // npm 패키지 패턴 필터링
      if (opts.npmPackagePatterns.length > 0) {
        return matchesPattern(importPath, opts.npmPackagePatterns)
      }

      return true
    }

    // 경로 패턴 필터링
    if (opts.excludedPaths.length > 0 && matchesPattern(importPath, opts.excludedPaths)) {
      return false
    }

    return true
  }

  /**
   * 노드 필터
   * @param {Object} node - 노드 객체
   * @returns {boolean} 포함 여부
   */
  function shouldIncludeNode(node: GraphNode): boolean {
    const path = node.path || node.id || node.name
    if (!path) return false

    // src/@... 형태인 경우도 npm 패키지로 인식
    // 예: src/@vite-plugin-checker-runtime.vue -> @vite-plugin-checker-runtime.vue
    const npmPackagePath = path.startsWith('src/@') ? path.substring(4) : path

    // npm 패키지 처리
    if (isNpmPackage(npmPackagePath)) {
      if (!opts.includeNpmPackages) {
        return false
      }

      if (opts.npmPackagePatterns.length > 0) {
        return matchesPattern(npmPackagePath, opts.npmPackagePatterns)
      }

      return true
    }

    // 경로 패턴 필터링
    if (opts.excludedPaths.length > 0 && matchesPattern(path, opts.excludedPaths)) {
      return false
    }

    // 파일 타입 필터링
    const fileType = extractFileType(path)
    if (fileType) {
      if (opts.excludedFileTypes.length > 0 && opts.excludedFileTypes.includes(fileType)) {
        return false
      }

      if (opts.includedFileTypes.length > 0 && !opts.includedFileTypes.includes(fileType)) {
        return false
      }
    }

    // 커스텀 필터
    if (opts.customFilter && typeof opts.customFilter === 'function') {
      return opts.customFilter(node)
    }

    return true
  }

  return {
    shouldIncludeImport,
    shouldIncludeNode,
    options: opts,
  }
}

/**
 * 파일 내용에서 import 문 추출
 * @param {string} content - 파일 내용
 * @param {Function} importFilter - import 필터 함수 (optional)
 * @returns {Array<string>} import 경로 배열
 */
function extractImports(content: string, importFilter: ((path: string) => boolean) | null = null): string[] {
  const imports = []

  // 정규식 패턴들
  const patterns = [
    // import Component from './path/to/Component.vue'
    // import { func } from './utils'
    // import Component from '@/components/path'
    /import\s+[\w\s,{}*]+\s+from\s+['"]([^'"]+)['"]/g,
    // import('./path/to/Component.vue')
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    // defineAsyncComponent(() => import('./path/to/Component.vue'))
    /defineAsyncComponent\s*\(\s*\(\)\s*=>\s*import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(content)) !== null) {
      const importPath = match[1]
      if (!importPath) continue

      // 필터 사용 (제공된 경우)
      if (importFilter && typeof importFilter === 'function') {
        if (!importFilter(importPath)) {
          continue
        }
      } else {
        // 기본 필터: npm 패키지 제외 (하위 호환성)
        if (isNpmPackage(importPath)) {
          continue
        }
      }

      imports.push(importPath)
    }
  }

  return [...new Set(imports)] // 중복 제거
}

/**
 * 상대 경로를 절대 경로로 변환
 * @param {string} importPath - import 경로
 * @param {string} basePath - 현재 파일 경로 (예: 'src/pages/DevelopmentPage.vue')
 * @param {Function} importFilter - import 필터 함수 (optional)
 * @returns {string|null} 절대 경로 (예: 'src/components/ui/BaseModal.vue') 또는 null (필터링된 경우)
 */
function resolveImportPath(importPath: string, basePath: string, importFilter: ((path: string) => boolean) | null = null): string | null {
  // 필터 사용 (제공된 경우)
  if (importFilter && typeof importFilter === 'function') {
    if (!importFilter(importPath)) {
      return null
    }
  } else {
    // 기본 필터: npm 패키지 제외 (하위 호환성)
    if (isNpmPackage(importPath)) {
      return null
    }
  }

  // 이미 절대 경로인 경우 (src/ 또는 @/로 시작)
  if (importPath.startsWith('src/') || importPath.startsWith('@/')) {
    let resolved = importPath.replace('@/', 'src/')
    // .vue 확장자가 없으면 추가
    if (resolved.includes('/') && !resolved.endsWith('.vue') && !resolved.endsWith('.js') && !resolved.endsWith('.ts') && !resolved.endsWith('.scss') && !resolved.endsWith('.css')) {
      resolved += '.vue'
    }
    return resolved
  }

  // 상대 경로인 경우
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    const baseDir = basePath.substring(0, basePath.lastIndexOf('/'))
    const pathParts = baseDir.split('/')
    const importParts = importPath.split('/')

    for (const part of importParts) {
      if (part === '.') {
        continue
      } else if (part === '..') {
        pathParts.pop()
      } else {
        pathParts.push(part)
      }
    }

    let resolved = pathParts.join('/')
    // .vue 확장자가 없으면 추가
    if (resolved.includes('/') && !resolved.endsWith('.vue') && !resolved.endsWith('.js') && !resolved.endsWith('.ts') && !resolved.endsWith('.scss') && !resolved.endsWith('.css')) {
      resolved += '.vue'
    }
    return resolved
  }

  // 그 외의 경우 (절대 경로로 가정)
  // 하지만 npm 패키지인 경우 null 반환 (안전장치)
  if (isNpmPackage(importPath)) {
    return null
  }

  let resolved = importPath
  if (resolved.includes('/') && !resolved.endsWith('.vue') && !resolved.endsWith('.js') && !resolved.endsWith('.ts') && !resolved.endsWith('.scss') && !resolved.endsWith('.css')) {
    resolved += '.vue'
  }
  return resolved
}

/**
 * 파일 내용 읽기
 * @param {string} path - 파일 경로 (예: 'src/pages/DevelopmentPage.vue')
 * @returns {Promise<string>} 파일 내용
 */
async function readFile(path: string): Promise<string> {
  try {
    // 경로 정규화: 'src/pages/DevelopmentPage.vue' → '/src/pages/DevelopmentPage.vue?raw'
    const fullPath = path.startsWith('src/') ? `/${path}?raw` : `/src/${path}?raw`

    // 개발 모드에서만 fetch 사용
    if (import.meta.env.DEV) {
      const response = await fetch(fullPath)
      if (response.ok) {
        return await response.text()
      }
    }

    console.warn(`[DependencyGraphAnalyzer] 파일 읽기 실패 (개발 모드에서만 지원): ${path}`)
    return ''
  } catch (error: unknown) {
    console.warn(`[DependencyGraphAnalyzer] 파일 읽기 실패: ${path}`, error)
    return ''
  }
}

/**
 * 파일의 첫 번째 주석 추출
 * @param {string} content - 파일 내용
 * @param {string} fileType - 파일 타입 (vue, js, ts)
 * @returns {string|null} 첫 번째 주석 내용 또는 null
 */
function extractFirstComment(content: string, fileType: string): string | null {
  if (!content) return null

  let scriptContent = content

  // Vue 파일: <script> 태그 내부의 주석만 추출
  if (fileType === 'vue') {
    // <script> 태그 찾기 (setup, lang 등 속성 고려)
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
    if (scriptMatch) {
      scriptContent = scriptMatch[1]
    } else {
      // <script> 태그가 없으면 전체 내용 사용 (템플릿 주석은 제외)
      return null
    }
  }

  // 주석 패턴들 (우선순위 순)
  const patterns = [
    // JSDoc 스타일: /** ... */ (여러 줄)
    {
      pattern: /\/\*\*([\s\S]*?)\*\//,
      isMultiLine: true,
    },
    // 블록 주석: /* ... */
    {
      pattern: /\/\*([\s\S]*?)\*\//,
      isMultiLine: true,
    },
    // 한 줄 주석: // ... (첫 번째 것만)
    {
      pattern: /\/\/(.+?)(?:\n|$)/,
      isMultiLine: false,
    },
  ]

  for (const { pattern, isMultiLine } of patterns) {
    const match = scriptContent.match(pattern)
    if (match) {
      let comment = match[1] || match[0]

      // 주석 내용 정제
      if (isMultiLine) {
        // 여러 줄 주석: 각 줄의 * 제거
        comment = comment
          .replace(/^\s*\*\s?/gm, '') // JSDoc의 * 제거
          .replace(/^\s*\/\*\s?/gm, '') // /* 제거
          .replace(/\s?\*\/\s*$/gm, '') // */ 제거
          .trim()
      } else {
        // 한 줄 주석: // 제거
        comment = comment.replace(/^\s*\/\/\s?/, '').trim()
      }

      if (comment) {
        // 첫 줄만 반환 (요약 정보, 최대 100자)
        const firstLine = comment.split('\n')[0].trim()
        return firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine
      }
    }
  }

  return null
}

/**
 * 파일 경로에서 파일 타입 추출
 * @param {string} path - 파일 경로
 * @returns {string} 파일 타입 (vue, js, ts, scss, css, json, md 등)
 */
function getFileType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  return ext || 'unknown'
}

/**
 * 파일 경로에서 파일명 추출
 * @param {string} path - 파일 경로
 * @returns {string} 파일명
 */
function getFileName(path: string): string {
  return path.split('/').pop() || path
}

/**
 * 라우트 경로를 파일 경로로 매핑
 * @param {string} routePath - 라우트 경로 (예: '/dev', '/portfolio')
 * @returns {string|null} 파일 경로 또는 null
 */
function mapRouteToFile(routePath: string): string | null {
  const routeMap: Record<string, string> = {
    '/dev': 'src/pages/DevelopmentPage.vue',
    '/portfolio': 'src/pages/PortfolioPage.vue',
    '/erp': 'src/pages/NexaErpPage.vue',
    '/system': 'src/pages/SystemPage.vue',
    '/network': 'src/pages/NetworkPage.vue',
    '/solutions': 'src/pages/SolutionsPage.vue',
    '/help': 'src/pages/HelpPage.vue',
    '/my': 'src/pages/MyPage.vue',
    '/parts-management': 'src/pages/PartsManagementPage.vue',
    '/nexet': 'src/pages/NexaPanelPage.vue',
    '/nexel': 'src/domains/nexel/NexelDomain.vue',
    '/nexa-teach': 'src/pages/NexaTeachPage.vue',
    '/nexage': 'src/domains/nexage/NexageDomain.vue',
    '/nexage/admin': 'src/domains/nexage/views/admin/NexageAdminPage.vue',
    '/nexeed': 'src/domains/nexeed/NexeedDomain.vue',
    '/': 'src/pages/HomePage.vue',
  }
  return routeMap[routePath] || null
}

/**
 * 입력된 경로에서 쿼리 파라미터와 해시 제거
 * @param {string} path - 경로 문자열
 * @returns {string} 정제된 경로
 */
function cleanPath(path: string): string {
  // 쿼리 파라미터 제거: /parts-management?mode=physical → /parts-management
  // 해시 제거: /parts-management#section → /parts-management
  return path.split('?')[0].split('#')[0].trim()
}

/**
 * 분석 대상 경로에 해당하는 파일들 찾기
 * @param {string} target - 분석 대상 (예: '/dev', '/portfolio', 'src/pages/DevelopmentPage.vue', '/parts-management?mode=physical')
 * @returns {Promise<Array<string>>} 파일 경로 배열
 */
async function findTargetFiles(target: string): Promise<string[]> {
  const files = []
  // 쿼리 파라미터와 해시 제거
  const cleanedTarget = cleanPath(target)
  const normalizedTarget = cleanedTarget.trim()

  // 특정 파일인 경우
  if (normalizedTarget.endsWith('.vue') || normalizedTarget.endsWith('.js') || normalizedTarget.endsWith('.ts')) {
    const filePath = normalizedTarget.startsWith('src/') ? normalizedTarget : `src/${normalizedTarget}`
    files.push(filePath)
    return files
  }

  // 라우트 경로인 경우 파일 경로로 매핑
  if (normalizedTarget.startsWith('/')) {
    const mappedFile = mapRouteToFile(normalizedTarget)
    if (mappedFile) {
      files.push(mappedFile)
      console.log('[DependencyGraphAnalyzer] 라우트 경로 매핑:', normalizedTarget, '→', mappedFile)
      return files
    }
  }

  // 디렉토리인 경우 - Vite의 import.meta.glob 사용
  try {
    // 모든 Vue, JS, TS 파일 스캔
    const modules = import.meta.glob('/src/**/*.{vue,js,ts}', { eager: false })
    console.log('[DependencyGraphAnalyzer] import.meta.glob 모듈 개수:', Object.keys(modules).length)

    // target에 맞는 파일 필터링
    let targetPath = ''
    if (normalizedTarget.startsWith('/')) {
      // '/dev' → 'src/pages/dev' (라우트 매핑 실패 시 디렉토리로 시도)
      const dirName = normalizedTarget.substring(1)
      targetPath = `src/pages/${dirName}`
    } else if (normalizedTarget.startsWith('src/')) {
      // 'src/components/ui' → 그대로 사용
      targetPath = normalizedTarget
    } else {
      // 'components/ui' → 'src/components/ui'
      targetPath = `src/${normalizedTarget}`
    }

    console.log('[DependencyGraphAnalyzer] 검색 대상 경로:', targetPath)

    // 경로가 targetPath를 포함하는 파일 찾기
    for (const path in modules) {
      // '/src/pages/dev/DevelopmentPage.vue' → 'src/pages/dev/DevelopmentPage.vue'
      const normalizedPath = path.replace('/src/', 'src/')

      // targetPath로 시작하는 경로인지 확인
      if (normalizedPath.startsWith(targetPath)) {
        files.push(normalizedPath)
        // 성능 최적화: 개별 파일 발견 로그는 제거 (요약 로그만 출력)
        // 개발 모드에서만 필요시 주석 해제
        // if (import.meta.env.DEV) {
        //   console.log('[DependencyGraphAnalyzer] 파일 발견:', normalizedPath)
        // }
      }
    }

    console.log('[DependencyGraphAnalyzer] 찾은 파일 개수:', files.length)
  } catch (error) {
    console.error('[DependencyGraphAnalyzer] 파일 찾기 실패:', error)
  }

  return files
}

/**
 * 의존성 그래프 분석
 * @param {string} target - 분석 대상 (예: '/dev', '/portfolio', 'src/pages/DevelopmentPage.vue', '/parts-management?mode=physical')
 * @param {DependencyFilterOptions} filterOptions - 필터 옵션
 * @returns {Promise<Object>} 그래프 데이터 { nodes: [], edges: [] }
 */
export async function analyzeDependencyGraph(target: string, filterOptions: DependencyFilterOptions = {}) {
  // 필터 생성
  const filter = createDependencyFilter(filterOptions)
  const { maxDepth } = filter.options

  // 쿼리 파라미터와 해시 제거
  const cleanedTarget = cleanPath(target)
  console.log('[DependencyGraphAnalyzer] 분석 시작:', cleanedTarget, '(원본:', target, ')')

  // 1. 분석 대상 파일들 찾기 (findTargetFiles 내부에서도 cleanPath를 호출하지만, 여기서도 명시적으로 처리)
  const targetFiles = await findTargetFiles(cleanedTarget)
  console.log('[DependencyGraphAnalyzer] 찾은 파일 개수:', targetFiles.length)

  if (targetFiles.length === 0) {
    console.warn('[DependencyGraphAnalyzer] 분석 대상 파일을 찾을 수 없습니다:', cleanedTarget, '(원본:', target, ')')
    return { nodes: [], edges: [] }
  }

  const nodes: Array<{ id: string; name: string; path: string; type: string }> = []
  const edges: Array<{ from: string; to: string; label: string }> = []
  const nodeMap = new Map() // path -> node
  const processedFiles = new Set() // 이미 처리한 파일

  // 2. 대상 파일들을 노드로 추가 (필터 적용)
  for (const filePath of targetFiles) {
    if (!processedFiles.has(filePath)) {
      const node = {
        id: filePath,
        name: getFileName(filePath),
        path: filePath,
        type: getFileType(filePath),
      }

      // 필터 적용
      if (!filter.shouldIncludeNode(node)) {
        continue
      }

      nodes.push(node)
      nodeMap.set(filePath, node)
      processedFiles.add(filePath)
    }
  }

  // 3. 각 파일의 import 관계 분석
  const filesToProcess = [...targetFiles]
  let currentDepth = 0

  while (filesToProcess.length > 0 && currentDepth < maxDepth) {
    const currentBatch = [...filesToProcess]
    filesToProcess.length = 0 // 다음 배치를 위해 초기화

    for (const filePath of currentBatch) {
      try {
        const content = await readFile(filePath)
        if (!content) continue

        const imports = extractImports(content, filter.shouldIncludeImport as (path: string) => boolean)

        for (const importPath of imports) {
          const resolvedPath = resolveImportPath(importPath, filePath, filter.shouldIncludeImport as (path: string) => boolean)

          // 필터에 의해 제외된 경우
          if (!resolvedPath) {
            continue
          }

          // 노드가 없으면 추가 (외부 의존성)
          if (!nodeMap.has(resolvedPath)) {
            const node = {
              id: resolvedPath,
              name: getFileName(resolvedPath),
              path: resolvedPath,
              type: getFileType(resolvedPath),
            }

            // 노드 필터 적용
            if (!filter.shouldIncludeNode(node)) {
              continue
            }

            nodes.push(node)
            nodeMap.set(resolvedPath, node)

            // 다음 깊이에서 처리할 파일로 추가 (vue, js, ts 파일만)
            if ((resolvedPath.endsWith('.vue') || resolvedPath.endsWith('.js') || resolvedPath.endsWith('.ts')) && !processedFiles.has(resolvedPath)) {
              filesToProcess.push(resolvedPath)
              processedFiles.add(resolvedPath)
            }
          }

          // 엣지 추가 (중복 체크, 양쪽 노드가 모두 필터를 통과한 경우만)
          const fromNode = nodeMap.get(filePath)
          const toNode = nodeMap.get(resolvedPath)
          if (!fromNode || !toNode) {
            continue
          }

          const fromId = filePath
          const toId = resolvedPath
          const edgeExists = edges.some((edge) => edge.from === fromId && edge.to === toId)

          if (!edgeExists) {
            edges.push({
              from: fromId,
              to: toId,
              label: importPath,
            })
          }
        }
      } catch (error: unknown) {
        console.warn(`[DependencyGraphAnalyzer] 파일 분석 실패: ${filePath}`, error)
      }
    }

    currentDepth++
  }

  // 최종 노드 및 엣지 필터링 (추가 안전장치)
  const filteredNodes = nodes.filter((node) => filter.shouldIncludeNode(node))
  const filteredEdges = edges.filter((edge) => {
    const fromNode = filteredNodes.find((n) => (n.id || n.path) === edge.from)
    const toNode = filteredNodes.find((n) => (n.id || n.path) === edge.to)
    return fromNode && toNode
  })

  console.log('[DependencyGraphAnalyzer] 분석 완료:', {
    nodesCount: filteredNodes.length,
    edgesCount: filteredEdges.length,
    originalNodesCount: nodes.length,
    originalEdgesCount: edges.length,
  })

  // 메인 파일의 주석 추출 (첫 번째 파일만)
  let mainFileComment = null
  let mainFilePath = null
  if (targetFiles.length > 0) {
    try {
      mainFilePath = targetFiles[0]
      const content = await readFile(mainFilePath)
      if (content) {
        const fileType = getFileType(mainFilePath)
        mainFileComment = extractFirstComment(content, fileType)
        if (mainFileComment) {
          console.log('[DependencyGraphAnalyzer] 메인 파일 주석 추출:', mainFileComment.substring(0, 50) + '...')
        }
      }
    } catch (error: unknown) {
      console.warn('[DependencyGraphAnalyzer] 주석 추출 실패:', error)
    }
  }

  return {
    nodes: filteredNodes,
    edges: filteredEdges,
    metadata: {
      mainFileComment,
      mainFilePath,
    },
  }
}

// 필터 유틸리티 함수 export (외부에서 사용 가능하도록)
export { isNpmPackage, createDependencyFilter }
