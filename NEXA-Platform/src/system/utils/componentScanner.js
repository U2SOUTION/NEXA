/**
 * 컴포넌트 스캐너
 * 디렉토리 기반으로 Vue 컴포넌트를 자동 스캔하고 카테고리별로 분류
 */

// 카테고리 디스플레이 이름 매핑
const CATEGORY_DISPLAY_NAMES = {
  ui: 'UI 컴포넌트',
  form: '폼 컴포넌트',
  'parts-management': '부품 관리',
  sidebars: '사이드바',
  settings: '설정',
  'side-panel': '사이드 패널',
  'dev-tools': '개발 도구',
  panel: '패널',
  diagram: '다이어그램',
  charts: '차트',
  board: '보드',
}

// 아이콘 매핑
const CATEGORY_ICONS = {
  ui: 'widgets',
  form: 'edit',
  'parts-management': 'inventory_2',
  sidebars: 'menu',
  settings: 'settings',
  'side-panel': 'view_sidebar',
  'dev-tools': 'build',
  panel: 'dashboard',
  diagram: 'account_tree',
  charts: 'bar_chart',
  board: 'dashboard',
}

/**
 * 컴포넌트 경로에서 디렉토리 경로 배열 추출
 * @param {string} path - 컴포넌트 경로 (예: 'src/components/ui/BaseModal.vue' 또는 'src/domains/board/components/BoardConfigEditor.vue')
 * @returns {Array<string>} 디렉토리 경로 배열 (예: ['ui'] 또는 ['domains', 'board'])
 */
function extractDirectoryPath(path) {
  // src/components/.../Name.vue 형식
  const componentsMatch = path.match(/src\/components\/(.+)\/[^/]+\.vue$/)
  if (componentsMatch) {
    return componentsMatch[1].split('/')
  }

  // src/domains/.../components/.../Name.vue 형식
  const domainsMatch = path.match(/src\/domains\/(.+)\/components\/(.+)\/[^/]+\.vue$/)
  if (domainsMatch) {
    return ['domains', ...domainsMatch[1].split('/'), ...domainsMatch[2].split('/')]
  }

  // src/domains/.../components/Name.vue 형식
  const domainsDirectMatch = path.match(/src\/domains\/(.+)\/components\/[^/]+\.vue$/)
  if (domainsDirectMatch) {
    return ['domains', ...domainsDirectMatch[1].split('/')]
  }

  return []
}

/**
 * 컴포넌트 경로에서 카테고리 이름 추출 (깊이 제한 적용)
 * @param {string} path - 컴포넌트 경로
 * @param {number} maxDepth - 최대 깊이 (1 = 첫 번째 디렉토리만, 0 = 전체)
 * @returns {string} 카테고리 이름
 */
function extractCategoryFromPath(path, maxDepth = 0) {
  const directories = extractDirectoryPath(path)

  if (directories.length === 0) {
    // 매칭되지 않는 경우 (예: src/frame/... 등)
    if (path.includes('src/frame/')) return 'frame'
    if (path.includes('src/engines/')) return 'engines'
    return 'other'
  }

  // maxDepth가 0이면 전체 경로 사용, 아니면 지정된 깊이만 사용
  if (maxDepth > 0 && maxDepth < directories.length) {
    return directories.slice(0, maxDepth).join('-')
  }

  // 전체 경로 사용
  return directories.join('-')
}

/**
 * 컴포넌트 이름 추출
 * @param {string} path - 컴포넌트 경로
 * @returns {string} 컴포넌트 이름
 */
function extractComponentName(path) {
  const fileName = path.split('/').pop()
  return fileName.replace('.vue', '')
}

/**
 * 컴포넌트 아이콘 추출 (파일명 기반 추론)
 * @param {string} componentName - 컴포넌트 이름
 * @returns {string} 아이콘 이름
 */
function inferComponentIcon(componentName) {
  const name = componentName.toLowerCase()

  // 일반적인 패턴 매칭
  if (name.includes('modal') || name.includes('dialog')) return 'window'
  if (name.includes('menu')) return 'menu'
  if (name.includes('table')) return 'table_view'
  if (name.includes('form')) return 'edit'
  if (name.includes('button')) return 'radio_button_checked'
  if (name.includes('input')) return 'input'
  if (name.includes('card')) return 'card'
  if (name.includes('list')) return 'list'
  if (name.includes('grid')) return 'grid_view'
  if (name.includes('chart')) return 'bar_chart'
  if (name.includes('diagram')) return 'account_tree'
  if (name.includes('settings')) return 'settings'
  if (name.includes('navigation') || name.includes('nav')) return 'navigation'
  if (name.includes('upload')) return 'cloud_upload'
  if (name.includes('loader') || name.includes('skeleton')) return 'hourglass_empty'
  if (name.includes('panel')) return 'dashboard'
  if (name.includes('sidebar')) return 'menu'
  if (name.includes('header')) return 'menu'
  if (name.includes('footer')) return 'menu'

  // 기본값
  return 'widgets'
}

/**
 * 카테고리 디스플레이 이름 가져오기
 * @param {string} categoryName - 카테고리 이름
 * @returns {string} 디스플레이 이름
 */
function getCategoryDisplayName(categoryName) {
  return (
    CATEGORY_DISPLAY_NAMES[categoryName] ||
    categoryName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  )
}

/**
 * 카테고리 아이콘 가져오기
 * @param {string} categoryName - 카테고리 이름
 * @returns {string} 아이콘 이름
 */
function getCategoryIcon(categoryName) {
  return CATEGORY_ICONS[categoryName] || 'folder'
}

/**
 * 카테고리 디스플레이 이름 포맷팅 (깊이 정보 포함)
 * @param {string} categoryName - 카테고리 이름 (예: 'sidebars-left-dev-tools')
 * @returns {string} 포맷팅된 디스플레이 이름
 */
function formatCategoryDisplayName(categoryName) {
  const parts = categoryName.split('-')

  // 첫 번째 부분은 기존 매핑 사용
  if (parts.length === 1) {
    return getCategoryDisplayName(parts[0])
  }

  // 여러 부분이면 첫 번째는 매핑, 나머지는 그대로 표시
  const firstPart = getCategoryDisplayName(parts[0])
  const restParts = parts.slice(1).map((part) =>
    part
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
  )

  return `${firstPart} > ${restParts.join(' > ')}`
}

/**
 * 모든 Vue 컴포넌트 스캔 및 카테고리별 분류
 * @param {number} maxDepth - 최대 깊이 (1 = 첫 번째 디렉토리만, 2 = 두 번째까지, 0 = 전체)
 * @returns {Promise<Array>} 카테고리별로 분류된 컴포넌트 배열
 */
export async function scanAndCategorizeComponents(maxDepth = 0) {
  try {
    // Vite의 import.meta.glob을 사용하여 모든 .vue 파일 스캔
    // src/components/, src/domains/**/components/ 하위의 모든 .vue 파일
    const componentModules = import.meta.glob(['/src/components/**/*.vue', '/src/domains/**/components/**/*.vue'], { eager: false })

    const categoryMap = new Map()

    // 각 컴포넌트 파일 처리
    for (const path in componentModules) {
      // 'src/components/ui/BaseModal.vue' 형식
      const categoryName = extractCategoryFromPath(path, maxDepth)
      const componentName = extractComponentName(path)
      const icon = inferComponentIcon(componentName)

      // 상대 경로로 변환 (src/ 제거)
      const relativePath = path.replace('/src/', '')

      // 전체 디렉토리 경로 추출 (라벨 표시용)
      const fullDirectoryPath = extractDirectoryPath(path)

      const component = {
        name: componentName,
        path: relativePath,
        icon: icon,
        // 깊이 제한 이하의 경로 정보 (나중에 라벨 표시용)
        directoryPath: fullDirectoryPath,
        depth: fullDirectoryPath.length,
      }

      // 카테고리별로 그룹화
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          name: categoryName,
          displayName: formatCategoryDisplayName(categoryName),
          icon: getCategoryIcon(categoryName.split('-')[0]), // 첫 번째 디렉토리의 아이콘 사용
          components: [],
          subcategories: [],
        })
      }

      categoryMap.get(categoryName).components.push(component)
    }

    // Map을 배열로 변환하고 정렬
    const categories = Array.from(categoryMap.values())
      .map((category) => ({
        ...category,
        components: category.components.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName))

    return categories
  } catch (error) {
    console.error('[ComponentScanner] 스캔 중 오류 발생:', error)
    return []
  }
}

/**
 * 컴포넌트 스캔 결과를 기존 하드코딩된 구조와 병합
 * (하위 카테고리 등 추가 정보 유지)
 * @param {Array} scannedCategories - 스캔된 카테고리 배열
 * @param {Array} existingCategories - 기존 카테고리 배열 (선택적)
 * @returns {Array} 병합된 카테고리 배열
 */
export function mergeWithExistingCategories(scannedCategories, existingCategories = []) {
  const merged = []
  const scannedMap = new Map(scannedCategories.map((cat) => [cat.name, cat]))

  // 기존 카테고리가 있으면 병합
  if (existingCategories.length > 0) {
    for (const existing of existingCategories) {
      const scanned = scannedMap.get(existing.name)

      if (scanned) {
        // 스캔된 컴포넌트와 기존 하위 카테고리 병합
        merged.push({
          ...existing,
          components: scanned.components, // 스캔된 컴포넌트로 업데이트
          // 하위 카테고리는 기존 것 유지 (수동 설정)
          subcategories: existing.subcategories || [],
        })
        scannedMap.delete(existing.name)
      } else {
        // 기존에만 있는 카테고리 유지
        merged.push(existing)
      }
    }
  }

  // 스캔된 것 중 기존에 없던 카테고리 추가
  for (const scanned of scannedMap.values()) {
    merged.push(scanned)
  }

  return merged.sort((a, b) => a.displayName.localeCompare(b.displayName))
}
