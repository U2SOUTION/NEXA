/**
 * FileStructureAnalyzer.js
 * 파일 구조 분석기
 * 프로젝트의 실제 파일 구조를 스캔하여 트리 구조로 변환
 */

/**
 * 파일명에서 파일 타입 추출
 * @param {string} path - 파일 경로
 * @returns {string} 파일 타입 (예: 'vue', 'js', 'folder')
 */
function getFileType(path) {
  if (!path) return 'folder'
  const match = path.match(/\.([^.]+)$/)
  return match ? match[1].toLowerCase() : 'folder'
}

/**
 * 파일 경로에서 파일명 추출
 * @param {string} path - 파일 경로
 * @returns {string} 파일명
 */
function getFileName(path) {
  if (!path) return ''
  return path.split('/').pop() || path
}

/**
 * 경로 정규화 (쿼리 파라미터와 해시 제거)
 * @param {string} path - 원본 경로
 * @returns {string} 정규화된 경로
 */
function cleanPath(path) {
  if (!path) return ''
  // 쿼리 파라미터 제거 (예: '/dev?mode=test' -> '/dev')
  const withoutQuery = path.split('?')[0]
  // 해시 제거 (예: '/dev#section' -> '/dev')
  const withoutHash = withoutQuery.split('#')[0]
  return withoutHash.trim()
}

/**
 * 라우트 경로를 실제 파일 경로로 매핑
 * @param {string} routePath - 라우트 경로 (예: '/dev')
 * @returns {string|null} 실제 파일 경로 또는 null
 */
function mapRouteToFilePath(routePath) {
  const routeMap = {
    '/dev': 'src/pages/DevelopmentPage.vue',
    '/portfolio': 'src/pages/PortfolioPage.vue',
    // 필요에 따라 추가 매핑
  }
  return routeMap[routePath] || null
}

/**
 * 대상 파일/디렉토리 찾기
 * @param {string} target - 분석 대상 (예: '/dev', 'src/pages', 'src/components/ui')
 * @returns {Promise<string[]>} 파일 경로 배열
 */
async function findTargetFiles(target) {
  const files = []
  const cleanedTarget = cleanPath(target)
  let normalizedTarget = cleanedTarget

  // 라우트 경로 매핑 시도
  if (cleanedTarget.startsWith('/')) {
    const mappedFile = mapRouteToFilePath(cleanedTarget)
    if (mappedFile) {
      files.push(mappedFile)
      console.log('[FileStructureAnalyzer] 라우트 경로 매핑:', cleanedTarget, '→', mappedFile)
      return files
    }
  }

  // 디렉토리인 경우 - Vite의 import.meta.glob 사용
  try {
    // 모든 파일 스캔 (vue, js, ts, scss, css, json, md 등)
    const modules = import.meta.glob('/src/**/*.{vue,js,ts,scss,css,json,md}', { eager: false })
    console.log('[FileStructureAnalyzer] import.meta.glob 모듈 개수:', Object.keys(modules).length)

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

    console.log('[FileStructureAnalyzer] 검색 대상 경로:', targetPath)

    // 경로가 targetPath를 포함하는 파일 찾기
    for (const path in modules) {
      // '/src/pages/dev/DevelopmentPage.vue' → 'src/pages/dev/DevelopmentPage.vue'
      const normalizedPath = path.replace('/src/', 'src/')

      // targetPath로 시작하는 경로인지 확인
      if (normalizedPath.startsWith(targetPath)) {
        files.push(normalizedPath)
      }
    }

    console.log('[FileStructureAnalyzer] 찾은 파일 개수:', files.length)
  } catch (error) {
    console.error('[FileStructureAnalyzer] 파일 찾기 실패:', error)
  }

  return files
}

/**
 * 파일 구조 분석
 * @param {string} target - 분석 대상 (예: '/dev', 'src/pages', 'src/components/ui')
 * @returns {Promise<Array>} 파일 목록 배열 [{ path, type, name }]
 */
export async function analyzeFileStructure(target) {
  console.log('[FileStructureAnalyzer] 파일 구조 분석 시작:', target)

  // 1. 분석 대상 파일들 찾기
  const targetFiles = await findTargetFiles(target)
  console.log('[FileStructureAnalyzer] 찾은 파일 개수:', targetFiles.length)

  if (targetFiles.length === 0) {
    console.warn('[FileStructureAnalyzer] 분석 대상 파일을 찾을 수 없습니다:', target)
    return []
  }

  // 2. 파일 목록 변환
  const files = targetFiles.map((filePath) => ({
    path: filePath,
    type: getFileType(filePath),
    name: getFileName(filePath),
  }))

  console.log('[FileStructureAnalyzer] 파일 구조 분석 완료:', { filesCount: files.length })
  return files
}
