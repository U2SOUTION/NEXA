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

import { getTopLevelLabel } from '@system/config/devGuideConfig'

interface BuildPathTreeOptions {
  rootPrefix?: string
  pathKey?: string
  iconGetter?: ((dirName: string, level: number) => string) | null
  labelGetter?: ((part: string, index: number, item: unknown) => string) | null
  onNodeCreate?: ((node: unknown, item: unknown, index: number) => void) | null
}

let sampleIdCounter = 100000

/**
 * 디렉토리 이름에 따른 라벨 반환
 * @param {string} dirName - 디렉토리 이름
 * @param {number} level - 레벨 (0부터 시작)
 * @returns {string} 라벨
 * 
 * 최상위 레벨만 한글 매핑하고, 서브 카테고리는 폴더명 그대로 사용
 */

export function getLabelForDirectory(dirName: string, level = 0): string {
  // 최상위 레벨인 경우 한글 매핑
  if (level === 0) {
    return getTopLevelLabel(dirName)
  }
  
  // 서브 카테고리는 폴더명 그대로 반환
  return dirName
}

/**
 * 경로에서 디렉토리 경로 추출
 * @param {string} filePath - 파일 경로
 * @param {string} rootPrefix - 제거할 루트 접두사 (예: 'guides')
 * @returns {Array<string>} 디렉토리 경로 배열
 */
export function extractDirectoryPath(filePath: string, rootPrefix = ''): string[] {
  if (!filePath) return []

  // 경로 정규화 (백슬래시를 슬래시로)
  const normalizedPath = filePath.replace(/\\/g, '/')
  const parts = normalizedPath.split('/').filter((part: string) => part && part.trim() !== '')

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
export function getIconForDirectory(dirName: string, level = 0, customIconGetter: ((d: string, l: number) => string) | null = null): string {
  if (customIconGetter) {
    const customIcon = customIconGetter(dirName, level)
    if (customIcon) return customIcon
  }

  // 모든 폴더 아이콘 통일
  return 'folder'
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
export function buildPathTree(items: unknown[], options: BuildPathTreeOptions = {}): unknown[] {
  const { rootPrefix = 'guides', pathKey = 'componentPath', iconGetter = null, labelGetter = null, onNodeCreate = null } = options

  if (!items || items.length === 0) {
    return []
  }

  sampleIdCounter = 100000
  const tree: Record<string, unknown> = {}
  let nodeId = 1

  items.forEach((item: unknown) => {
    const filePath = (item as Record<string, unknown>)[pathKey] as string | undefined
    if (!filePath) return

    // 디렉토리 경로 추출
    const directoryParts = extractDirectoryPath(filePath, rootPrefix)

    // 트리 구조 생성 (재귀적으로)
    let current = tree
    directoryParts.forEach((part: string, index: number) => {
      if (!(current as Record<string, unknown>)[part]) {
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

        if (onNodeCreate) {
          onNodeCreate(node, item, index)
        }

        ;(current as Record<string, unknown>)[part] = node
      }
      current = ((current as Record<string, unknown>)[part] as { children: Record<string, unknown> }).children
    })

    // 아이템을 해당 디렉토리에 추가
    const targetNode = getNodeByPath(tree as Record<string, { children: Record<string, unknown>; items: unknown[] }>, directoryParts)
    if (targetNode) {
      targetNode.items.push(item)
    }
  })

  return convertTreeToNodes(tree as Record<string, TreeNode>)
}

interface TreeNode {
  id: number
  label: string
  name: string
  icon: string
  children: Record<string, TreeNode>
  items: unknown[]
  level: number
  path: string
  fullPath: string
}

function getNodeByPath(tree: Record<string, { children: Record<string, unknown>; items: unknown[] }>, pathParts: string[]): { items: unknown[] } | null {
  return findNodeInTree(tree, pathParts) as { items: unknown[] } | null
}

function findNodeInTree(tree: Record<string, unknown>, pathParts: string[]): unknown {
  if (pathParts.length === 0) return null

  const [first, ...rest] = pathParts
  if (!tree[first]) return null

  if (rest.length === 0) {
    return tree[first]
  }

  return findNodeInTree((tree[first] as { children: Record<string, unknown> }).children, rest)
}

function convertTreeToNodes(tree: Record<string, TreeNode>): unknown[] {
  return Object.values(tree)
    .map((node: TreeNode) => {
      const directoryChildren = convertTreeToNodes(node.children)

      const fileChildren = (node.items || []).map((item: unknown) => {
        const id = sampleIdCounter++
        // 파일명에서 확장자 제거하여 라벨 생성
        const it = item as { name?: string; componentPath?: string; displayName?: string }
        const fileName = it.name || (it.componentPath ? it.componentPath.split('/').pop() ?? 'Unknown' : 'Unknown')
        const labelWithoutExt = fileName.replace(/\.\w+$/, '')

        let displayLabel: string
        if (it.displayName) {
          // displayName이 파일명과 유사한지 확인 (대소문자 무시)
          const displayNameLower = it.displayName.toLowerCase().trim()
          const fileNameLower = labelWithoutExt.toLowerCase().trim()

          // displayName이 파일명을 포함하거나, 파일명이 displayName을 포함하는 경우 파일명만 사용
          if (displayNameLower === fileNameLower || displayNameLower.includes(fileNameLower) || fileNameLower.includes(displayNameLower)) {
            displayLabel = labelWithoutExt
          } else {
            displayLabel = it.displayName
          }
        } else {
          displayLabel = labelWithoutExt
        }

        return {
          id,
          label: displayLabel,
          icon: 'description',
          sample: item,
          item,
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
export function filterByPath(items: unknown[], filterPath: string, pathKey = 'componentPath', rootPrefix = 'guides'): unknown[] {
  if (!filterPath) return items

  return items.filter((item: unknown) => {
    const filePath = (item as Record<string, unknown>)[pathKey] as string | undefined
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
interface QTreeNode { id: number; children?: QTreeNode[] }
export function findNodePath(nodes: QTreeNode[], targetId: number, path: QTreeNode[] = []): QTreeNode[] | null {
  for (const node of nodes) {
    const currentPath = [...path, node]
    if (node.id === targetId) {
      return currentPath
    }
    if (node.children && node.children.length > 0) {
      const found = findNodePath(node.children as QTreeNode[], targetId, currentPath)
      if (found) return found
    }
  }
  return null
}
