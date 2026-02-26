/**
 * 컴포넌트 의존성 분석기
 * Vue 컴포넌트 파일에서 import 관계를 분석하여 의존성 그래프 생성
 */

/**
 * 파일 내용에서 import 문 추출 (간단한 정규식 기반)
 * @param {string} content - 파일 내용
 * @returns {Array<string>} import 경로 배열
 */
function extractImports(content) {
  const imports = []

  // 정규식 패턴들
  const patterns = [
    // import Component from './path/to/Component.vue'
    // import Component from '@/components/path/to/Component.vue'
    /import\s+[\w\s,{}*]+\s+from\s+['"]([^'"]+)['"]/g,
    // import('./path/to/Component.vue')
    // import('@/components/path/to/Component.vue')
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    // defineAsyncComponent(() => import('./path/to/Component.vue'))
    /defineAsyncComponent\s*\(\s*\(\)\s*=>\s*import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(content)) !== null) {
      const importPath = match[1]
      if (importPath && !importPath.startsWith('vue') && !importPath.startsWith('quasar')) {
        imports.push(importPath)
      }
    }
  }

  return [...new Set(imports)] // 중복 제거
}

/**
 * 상대 경로를 절대 경로로 변환
 * @param {string} importPath - import 경로
 * @param {string} basePath - 현재 파일 경로
 * @returns {string} 절대 경로
 */
function resolveImportPath(importPath, basePath) {
  // 이미 절대 경로인 경우 (src/ 또는 @/로 시작)
  if (importPath.startsWith('src/') || importPath.startsWith('@/')) {
    return importPath.replace('@/', 'src/').replace(/\.vue$/, '')
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

    return pathParts.join('/').replace(/\.vue$/, '')
  }

  return importPath.replace(/\.vue$/, '')
}

/**
 * 컴포넌트 경로를 노드 ID로 변환
 * @param {string} path - 컴포넌트 경로
 * @returns {string} 노드 ID
 */
function pathToNodeId(path) {
  // 'components/ui/BaseModal.vue' → 'BaseModal'
  // 'components/dev-tools/document-manager/DocumentManagerContent.vue' → 'DocumentManagerContent'
  const fileName = path.split('/').pop()
  return fileName.replace('.vue', '')
}

/**
 * 컴포넌트 파일 내용 읽기
 * @param {string} path - 컴포넌트 경로 (상대 경로, 예: 'components/ui/BaseModal.vue')
 * @returns {Promise<string>} 파일 내용
 */
async function readComponentFile(path) {
  try {
    // Vite의 동적 import with ?raw를 사용하여 파일 내용 읽기
    // 경로 정규화: 'system/components/ui/BaseModal.vue' → '/src/system/components/ui/BaseModal.vue?raw'
    const fullPath = path.startsWith('src/') ? `/${path}?raw` : `/src/${path}?raw`

    // 동적 import는 빌드 타임에 알 수 없는 경로를 처리하기 어려움
    // 대신 fetch를 사용하여 개발 서버에서 파일 읽기
    if (import.meta.env.DEV) {
      const response = await fetch(fullPath)
      if (response.ok) {
        return await response.text()
      }
    }

    // 프로덕션에서는 import.meta.glob 사용 (미리 등록된 파일만)
    // TODO: 향후 개선 시 import.meta.glob로 모든 파일 미리 등록
    console.warn(`[ComponentDependencyAnalyzer] 파일 읽기 실패 (개발 모드에서만 지원): ${path}`)
    return ''
  } catch (error) {
    console.warn(`[ComponentDependencyAnalyzer] 파일 읽기 실패: ${path}`, error)
    return ''
  }
}

/**
 * 카테고리의 컴포넌트들에 대한 의존성 그래프 생성
 * @param {Array} components - 컴포넌트 배열
 * @returns {Promise<Object>} 다이어그램 데이터 { nodes: [], edges: [] }
 */
export async function analyzeCategoryDependencies(components) {
  const nodes = []
  const edges = []
  const nodeMap = new Map() // path -> node index

  // 1. 카테고리의 모든 컴포넌트를 노드로 추가
  for (const component of components) {
    const nodeId = pathToNodeId(component.path)
    const node = {
      id: nodeId,
      label: component.name,
      path: component.path,
      type: 'component',
    }
    nodes.push(node)
    nodeMap.set(component.path, nodeId)
  }

  // 2. 각 컴포넌트의 import 관계 분석
  for (const component of components) {
    try {
      const content = await readComponentFile(component.path)
      const imports = extractImports(content)

      for (const importPath of imports) {
        const resolvedPath = resolveImportPath(importPath, component.path)

        // 같은 카테고리 내 컴포넌트인지 확인
        const targetComponent = components.find((comp) => resolvedPath.includes(comp.path.replace('.vue', '')) || comp.path.includes(resolvedPath))

        if (targetComponent) {
          const fromId = pathToNodeId(component.path)
          const toId = pathToNodeId(targetComponent.path)

          // 중복 엣지 방지
          const edgeExists = edges.some((edge) => edge.from === fromId && edge.to === toId)

          if (!edgeExists) {
            edges.push({
              from: fromId,
              to: toId,
              type: 'import',
              label: importPath,
            })
          }
        } else {
          // 외부 컴포넌트도 노드로 추가 (옵션)
          const externalNodeId = pathToNodeId(resolvedPath)
          if (!nodeMap.has(resolvedPath)) {
            const externalNode = {
              id: externalNodeId,
              label: externalNodeId,
              path: resolvedPath,
              type: 'external',
            }
            nodes.push(externalNode)
            nodeMap.set(resolvedPath, externalNodeId)

            edges.push({
              from: pathToNodeId(component.path),
              to: externalNodeId,
              type: 'import',
              label: importPath,
            })
          }
        }
      }
    } catch (error) {
      console.warn(`[ComponentDependencyAnalyzer] 분석 실패: ${component.path}`, error)
    }
  }

  return {
    nodes,
    edges,
  }
}

/**
 * ERD 다이어그램 형식으로 변환
 * @param {Object} graphData - { nodes: [], edges: [] }
 * @returns {Object} ERD 다이어그램 데이터 형식
 */
export function convertToERDFormat(graphData) {
  // ERD 형식: { tables: [], relationships: [] }
  const tables = graphData.nodes.map((node) => ({
    name: node.id,
    label: node.label,
    path: node.path,
    type: node.type,
  }))

  const relationships = graphData.edges.map((edge) => ({
    fromTable: edge.from,
    toTable: edge.to,
    fromColumn: edge.label || 'import',
    toColumn: 'component',
    type: edge.type,
  }))

  return {
    tables,
    relationships,
  }
}
