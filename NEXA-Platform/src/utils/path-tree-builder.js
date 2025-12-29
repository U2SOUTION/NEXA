/**
 * 경로 기반 트리 구조 생성 유틸리티
 *
 * 실제 디렉토리 구조를 그대로 반영하여 트리 노드를 생성합니다.
 * 하드코딩 없이 동적으로 처리하여 재사용 가능합니다.
 *
 * @example
 * const samples = [
 *   { componentPath: 'guides/styles/ButtonGroup.vue', ... },
 *   { componentPath: 'guides/patterns/sidebars/right/DevToolsPanelSample.vue', ... }
 * ]
 * const tree = buildPathTree(samples, { rootPrefix: 'guides' })
 */

/**
 * 경로에서 디렉토리 경로 추출
 * @param {string} filePath - 파일 경로
 * @param {string} rootPrefix - 제거할 루트 접두사 (예: 'guides')
 * @returns {Array<string>} 디렉토리 경로 배열
 */
export function extractDirectoryPath(filePath, rootPrefix = '') {
  if (!filePath) return []

  // 경로 정규화 (백슬래시를 슬래시로)
  const normalizedPath = filePath.replace(/\\/g, '/')
  const parts = normalizedPath.split('/').filter((part) => part && part.trim() !== '')

  // rootPrefix 제거
  if (rootPrefix) {
    const prefixIndex = parts.indexOf(rootPrefix)
    if (prefixIndex >= 0) {
      parts.splice(prefixIndex, 1)
    }
  }

  // 파일명 제거 (마지막 요소가 .vue, .js 등 확장자를 가진 경우)
  const lastPart = parts[parts.length - 1]
  if (lastPart && /\.\w+$/.test(lastPart)) {
    parts.pop()
  }

  return parts
}

/**
 * 디렉토리 이름에 따른 아이콘 반환
 * @param {string} dirName - 디렉토리 이름
 * @param {number} level - 레벨 (0부터 시작)
 * @param {Function} customIconGetter - 커스텀 아이콘 getter 함수 (optional)
 * @returns {string} 아이콘 이름
 */
export function getIconForDirectory(dirName, level = 0, customIconGetter = null) {
  if (customIconGetter && typeof customIconGetter === 'function') {
    const customIcon = customIconGetter(dirName, level)
    if (customIcon) return customIcon
  }

  // 기본 아이콘 매핑
  const iconMap = {
    styles: 'palette',
    patterns: 'extension',
    library: 'widgets',
    conventions: 'rule',
    'best-practices': 'star',
    buttons: 'smart_button',
    cards: 'view_module',
    charts: 'bar_chart',
    panels: 'dashboard',
    sidebars: 'view_sidebar',
    left: 'chevron_left',
    right: 'chevron_right',
    forms: 'description',
    inputs: 'input',
    lists: 'list',
    modals: 'modal',
    tables: 'table_chart',
  }

  const lowerName = dirName.toLowerCase()
  return iconMap[lowerName] || (level === 0 ? 'folder' : 'folder_open')
}

/**
 * 경로 기반 트리 구조 생성
 * @param {Array<Object>} items - 아이템 배열 (componentPath 속성 필요)
 * @param {Object} options - 옵션
 * @param {string} options.rootPrefix - 제거할 루트 접두사 (기본값: 'guides')
 * @param {string} options.pathKey - 경로 속성명 (기본값: 'componentPath')
 * @param {Function} options.iconGetter - 아이콘 getter 함수 (optional)
 * @param {Function} options.labelGetter - 라벨 getter 함수 (optional)
 * @param {Function} options.onNodeCreate - 노드 생성 시 콜백 (optional)
 * @returns {Array<Object>} q-tree 형식의 노드 배열
 */
export function buildPathTree(items, options = {}) {
  const { rootPrefix = 'guides', pathKey = 'componentPath', iconGetter = null, labelGetter = null, onNodeCreate = null } = options

  if (!items || items.length === 0) {
    return []
  }

  // 트리 구조를 객체로 생성
  const tree = {}
  let nodeId = 1

  // 샘플 ID 카운터 초기화
  if (convertTreeToNodes.sampleIdCounter) {
    convertTreeToNodes.sampleIdCounter = 100000
  }

  items.forEach((item) => {
    const filePath = item[pathKey]
    if (!filePath) return

    // 디렉토리 경로 추출
    const directoryParts = extractDirectoryPath(filePath, rootPrefix)

    // 트리 구조 생성 (재귀적으로)
    let current = tree
    directoryParts.forEach((part, index) => {
      if (!current[part]) {
        const node = {
          id: nodeId++,
          label: labelGetter ? labelGetter(part, index, item) : part,
          name: part,
          icon: getIconForDirectory(part, index, iconGetter),
          children: {},
          items: [], // 해당 디렉토리의 아이템들
          level: index,
          path: directoryParts.slice(0, index + 1).join('/'),
          fullPath: rootPrefix ? `${rootPrefix}/${directoryParts.slice(0, index + 1).join('/')}` : directoryParts.slice(0, index + 1).join('/'),
        }

        // 콜백 호출
        if (onNodeCreate) {
          onNodeCreate(node, item, index)
        }

        current[part] = node
      }
      current = current[part].children
    })

    // 아이템을 해당 디렉토리에 추가
    const targetNode = getNodeByPath(tree, directoryParts)
    if (targetNode) {
      targetNode.items.push(item)
    }
  })

  // 트리 구조를 q-tree 노드 형식으로 변환
  return convertTreeToNodes(tree)
}

/**
 * 경로로 노드 찾기
 * @param {Object} tree - 트리 객체
 * @param {Array<string>} pathParts - 경로 파트 배열
 * @returns {Object|null} 노드 객체
 */
function getNodeByPath(tree, pathParts) {
  return findNodeInTree(tree, pathParts)
}

/**
 * 트리에서 경로로 노드 찾기 (재귀)
 * @param {Object} tree - 트리 객체
 * @param {Array<string>} pathParts - 경로 파트 배열
 * @returns {Object|null} 노드 객체
 */
function findNodeInTree(tree, pathParts) {
  if (pathParts.length === 0) return null

  const [first, ...rest] = pathParts
  if (!tree[first]) return null

  if (rest.length === 0) {
    return tree[first]
  }

  return findNodeInTree(tree[first].children, rest)
}

/**
 * 트리 구조를 q-tree 노드 형식으로 변환
 * @param {Object} tree - 트리 객체
 * @returns {Array<Object>} q-tree 노드 배열
 */
function convertTreeToNodes(tree) {
  // 전역 샘플 ID 카운터 (함수 내부에서만 사용)
  if (!convertTreeToNodes.sampleIdCounter) {
    convertTreeToNodes.sampleIdCounter = 100000
  }

  return Object.values(tree)
    .map((node) => {
      // 하위 디렉토리만 children에 포함 (파일은 제외)
      const directoryChildren = convertTreeToNodes(node.children)

      // 파일 아이템들을 children으로 변환 (q-tree가 인식하도록)
      const fileChildren = (node.items || []).map((item) => {
        const id = convertTreeToNodes.sampleIdCounter++
        // 파일명에서 확장자 제거하여 라벨 생성
        const fileName = item.name || (item.componentPath ? item.componentPath.split('/').pop() : 'Unknown')
        const labelWithoutExt = fileName.replace(/\.\w+$/, '')

        // displayName 처리: 파일명과 동일하거나 유사하면 파일명만 사용, 다르면 displayName 사용
        let displayLabel
        if (item.displayName) {
          // displayName이 파일명과 유사한지 확인 (대소문자 무시)
          const displayNameLower = item.displayName.toLowerCase().trim()
          const fileNameLower = labelWithoutExt.toLowerCase().trim()

          // displayName이 파일명을 포함하거나, 파일명이 displayName을 포함하는 경우 파일명만 사용
          if (displayNameLower === fileNameLower || displayNameLower.includes(fileNameLower) || fileNameLower.includes(displayNameLower)) {
            displayLabel = labelWithoutExt
          } else {
            displayLabel = item.displayName
          }
        } else {
          displayLabel = labelWithoutExt
        }

        return {
          id: id,
          label: displayLabel,
          icon: 'description', // 파일 아이콘으로 변경 (폴더와 구분)
          sample: item, // 원본 아이템 데이터 보관
          item: item, // 호환성을 위한 별칭
          // 파일 노드는 children이 없어야 화살표가 생기지 않음
          children: undefined,
        }
      })

      // children 설정 규칙:
      // 1. 하위 디렉토리와 파일 아이템을 모두 포함
      // 2. 둘 다 없으면 undefined (리프 노드)
      let children
      if (directoryChildren.length > 0 || fileChildren.length > 0) {
        children = [...directoryChildren, ...fileChildren]
      } else {
        children = undefined
      }

      return {
        id: node.id,
        label: node.label,
        name: node.name,
        icon: node.icon,
        level: node.level,
        path: node.path,
        fullPath: node.fullPath,
        children: children,
        // 파일 아이템들은 items에도 보관 (필터링 등에 사용)
        items: node.items,
        // 필터링을 위한 메타데이터
        _meta: {
          isDirectory: true,
          itemCount: node.items.length,
        },
      }
    })
    .sort((a, b) => {
      // 디렉토리 먼저, 그 다음 파일
      // children이 있거나 items가 있으면 디렉토리로 간주
      const aIsDir = (a.children && a.children.length > 0) || (a.items && a.items.length > 0)
      const bIsDir = (b.children && b.children.length > 0) || (b.items && b.items.length > 0)
      if (aIsDir && !bIsDir) return -1
      if (!aIsDir && bIsDir) return 1
      return a.label.localeCompare(b.label)
    })
}

/**
 * 경로 기반 필터링
 * @param {Array<Object>} items - 아이템 배열
 * @param {string} filterPath - 필터링할 경로
 * @param {string} pathKey - 경로 속성명 (기본값: 'componentPath')
 * @param {string} rootPrefix - 제거할 루트 접두사 (기본값: 'guides')
 * @returns {Array<Object>} 필터링된 아이템 배열
 */
export function filterByPath(items, filterPath, pathKey = 'componentPath', rootPrefix = 'guides') {
  if (!filterPath) return items

  return items.filter((item) => {
    const filePath = item[pathKey]
    if (!filePath) return false

    const directoryParts = extractDirectoryPath(filePath, rootPrefix)
    const itemPath = directoryParts.join('/')
    const normalizedFilterPath = filterPath.replace(/\\/g, '/')

    // 정확히 일치하거나 하위 경로인지 확인
    return itemPath === normalizedFilterPath || itemPath.startsWith(normalizedFilterPath + '/')
  })
}

/**
 * 노드 경로 찾기 (노드 ID로)
 * @param {Array<Object>} nodes - 노드 배열
 * @param {number} targetId - 찾을 노드 ID
 * @param {Array<Object>} path - 현재 경로 (재귀용)
 * @returns {Array<Object>|null} 노드 경로 배열
 */
export function findNodePath(nodes, targetId, path = []) {
  for (const node of nodes) {
    const currentPath = [...path, node]
    if (node.id === targetId) {
      return currentPath
    }
    if (node.children && node.children.length > 0) {
      const found = findNodePath(node.children, targetId, currentPath)
      if (found) return found
    }
  }
  return null
}
