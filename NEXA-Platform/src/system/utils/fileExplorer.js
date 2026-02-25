/**
 * 전역 탐색기용 순수 유틸: 파일 타입 아이콘, 트리 노드 빌드
 */

const CATEGORY_LABELS = {
  images: '이미지',
  documents: '문서',
  audio: '오디오',
  video: '영상',
}

const FILE_TYPE_ICONS = {
  image: 'image',
  images: 'image',
  pdf: 'picture_as_pdf',
  document: 'description',
  documents: 'description',
  audio: 'audiotrack',
  video: 'videocam',
  '3d_model': 'view_in_ar',
  archive: 'folder_zip',
  other: 'insert_drive_file',
}

/**
 * 파일 타입/카테고리에 따른 Quasar 아이콘 이름
 * @param {string} fileType - file_type 또는 category
 * @returns {string}
 */
export function getFileIconByType(fileType) {
  if (!fileType) return FILE_TYPE_ICONS.other
  const t = String(fileType).toLowerCase()
  return FILE_TYPE_ICONS[t] || FILE_TYPE_ICONS.other
}

/**
 * 카테고리 키 → 표시 라벨
 * @param {string} category
 * @returns {string}
 */
export function getCategoryLabel(category) {
  if (!category) return '문서'
  return CATEGORY_LABELS[category] || category
}

/**
 * 경로 배열을 계층 트리로 변환 (path '2024/01' -> { label: '01', path: '2024/01', children } 등)
 * @param {string[]} paths - '' 제외한 상대 경로
 * @param {string} domain
 * @param {string} domainId
 * @returns {Array<{ id: string, label: string, icon: string, domain: string, path: string, children?: array }>}
 */
function buildPathTree(paths, domain, domainId) {
  const root = { children: new Map() }
  for (const p of paths) {
    if (!p) continue
    const parts = p.split('/')
    let cur = root
    let acc = ''
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i]
      acc = acc ? `${acc}/${name}` : name
      if (!cur.children.has(name)) {
        cur.children.set(name, { path: acc, children: new Map() })
      }
      cur = cur.children.get(name)
    }
  }
  function toNodes(parent) {
    const list = []
    for (const [name, data] of parent.children.entries()) {
      const path = data.path
      const id = `${domainId}-${path.replace(/\//g, '::')}`
      const children = toNodes(data)
      list.push({
        id,
        label: name,
        icon: 'folder',
        domain,
        path,
        children: children.length ? children : undefined,
      })
    }
    return list.sort((a, b) => a.label.localeCompare(b.label))
  }
  return toNodes(root)
}

/**
 * GET /api/files/explorer/tree 응답(도메인별 paths)을 QTree 노드 배열로 변환
 * @param {{ domains: Array<{ domain: string, paths: string[] }> }} treeData
 * @returns {Array<{ id: string, label: string, icon: string, domain?: string, path?: string, children?: array }>}
 */
export function buildFileTreeFromApiResponse(treeData) {
  if (!treeData?.domains?.length) {
    return []
  }

  const nodes = []
  for (const { domain, paths } of treeData.domains) {
    const domainId = `domain-${domain}`
    const pathList = Array.isArray(paths) ? paths.filter((p) => p != null && String(p).trim() !== '') : []
    const pathChildren = buildPathTree(pathList, domain, domainId)
    nodes.push({
      id: domainId,
      label: domain,
      icon: 'folder',
      domain,
      path: null,
      children: pathChildren.length ? pathChildren : undefined,
    })
  }
  return nodes
}

/**
 * 트리 노드 배열에서 선택 id와 그 조상 노드 id 목록 반환 (펼침용)
 * @param {Array<{ id: string, children?: array }>} nodes
 * @param {string} selectedId
 * @returns {string[]}
 */
export function getExpandedIdsForSelection(nodes, selectedId) {
  const ids = []
  function collect(ns) {
    if (!ns?.length) return
    for (const n of ns) {
      if (!n.id) {
        collect(n.children)
        continue
      }
      const isAncestorOrSelf = selectedId === n.id ||
        selectedId.startsWith(n.id + '-') ||
        selectedId.startsWith(n.id + '::')
      if (isAncestorOrSelf) ids.push(n.id)
      collect(n.children)
    }
  }
  collect(nodes)
  return ids
}
