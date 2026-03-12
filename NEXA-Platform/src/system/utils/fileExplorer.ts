/**
 * 전역 탐색기용 순수 유틸: 파일 타입 아이콘, 트리 노드 빌드
 */

/** 파일 타입별 Material Icons (기본 12종 + 코드 세분화) */
const FILE_TYPE_ICONS: Record<string, string> = {
  // 1. 이미지
  image: 'image',
  images: 'image',
  media: 'image',
  // 2. 비디오
  video: 'videocam',
  // 3. 오디오
  audio: 'audiotrack',
  // 4. PDF
  pdf: 'picture_as_pdf',
  // 5. 문서(워드 등)
  document: 'description',
  documents: 'description',
  // 6. 스프레드시트
  spreadsheet: 'table_chart',
  xlsx: 'table_chart',
  xls: 'table_chart',
  csv: 'table_chart',
  // 7. 프레젠테이션
  presentation: 'slideshow',
  pptx: 'slideshow',
  ppt: 'slideshow',
  // 8. 코드 (기본)
  code: 'code',
  // 9. 아카이브
  archive: 'folder_zip',
  // 10. 3D
  '3d_model': 'view_in_ar',
  model: 'view_in_ar',
  // 11. 텍스트
  text: 'text_snippet',
  txt: 'text_snippet',
  // 12. 기타
  other: 'insert_drive_file',

  // 코드 세분화 (AI, Node.js, Vue, Python, ESP32 등)
  // Python
  python: 'code',
  py: 'code',
  pyw: 'code',
  ipynb: 'science',
  // JavaScript/TypeScript
  javascript: 'code',
  typescript: 'code',
  js: 'code',
  mjs: 'code',
  cjs: 'code',
  ts: 'code',
  tsx: 'code',
  jsx: 'code',
  // Vue
  vue: 'widgets',
  sfc: 'widgets',
  // Config
  config: 'settings',
  json: 'settings',
  yaml: 'settings',
  yml: 'settings',
  toml: 'settings',
  env: 'settings',
  ini: 'settings',
  cfg: 'settings',
  conf: 'settings',
  // Markdown
  markdown: 'text_snippet',
  md: 'text_snippet',
  // HTML/CSS
  html: 'web',
  htm: 'web',
  css: 'palette',
  scss: 'palette',
  // SQL
  sql: 'storage',
  // Shell
  shell: 'terminal',
  sh: 'terminal',
  bash: 'terminal',
  zsh: 'terminal',
  // Docker/빌드
  docker: 'layers',
  dockerfile: 'layers',
  makefile: 'build',
  mk: 'build',
  cmakelists: 'build',
  // C/C++ (ESP-IDF, 펌웨어)
  cpp: 'code',
  c: 'code',
  h: 'code',
  hpp: 'code',
  cc: 'code',
  cxx: 'code',
  // Arduino/ESP32
  arduino: 'memory',
  ino: 'memory',
  // 펌웨어 바이너리
  firmware: 'memory',
  bin: 'memory',
  elf: 'memory',
  hex: 'memory',
}

export function getFileIconByType(fileType: string | null | undefined): string {
  if (!fileType) return FILE_TYPE_ICONS.other
  const t = String(fileType).toLowerCase().trim()
  return FILE_TYPE_ICONS[t] ?? FILE_TYPE_ICONS.other
}

export interface FileItemLike {
  file_type?: string
  category?: string
  original_name?: string
  file_path?: string
}

export function getFileIconForItem(item: FileItemLike | null | undefined): string {
  if (!item) return FILE_TYPE_ICONS.other
  const fromType = getFileIconByType(item.file_type ?? item.category)
  if (fromType !== FILE_TYPE_ICONS.other) return fromType
  const name = (item.original_name ?? item.file_path ?? '').toLowerCase()
  const ext = name.match(/\.([a-z0-9]+)$/)?.[1] ?? ''
  if (ext) return getFileIconByType(ext)
  return FILE_TYPE_ICONS.other
}

const CATEGORY_LABELS: Record<string, string> = {
  images: '이미지',
  documents: '문서',
  audio: '오디오',
  video: '영상',
  media: '미디어',
  model: '3D 모델',
  archive: '압축',
  code: '코드',
  spreadsheet: '스프레드시트',
  presentation: '프레젠테이션',
  text: '텍스트',
  other: '기타',
  python: 'Python',
  javascript: 'JavaScript',
  vue: 'Vue',
  config: '설정',
  markdown: 'Markdown',
  html: 'HTML/CSS',
  sql: 'SQL',
  shell: 'Shell',
  docker: 'Docker',
  cpp: 'C/C++',
  arduino: 'Arduino',
  firmware: '펌웨어',
}

export function getCategoryLabel(category: string | null | undefined): string {
  if (!category) return '문서'
  return CATEGORY_LABELS[category] ?? category
}

export interface FileTreeNode {
  id: string
  label: string
  icon: string
  domain?: string
  path?: string | null
  children?: FileTreeNode[]
}

interface PathNode { path: string; children: Map<string, PathNode> }

function buildPathTree(paths: string[], domain: string, domainId: string): FileTreeNode[] {
  const root: PathNode = { path: '', children: new Map() }
  for (const p of paths) {
    if (!p) continue
    const parts = p.split('/')
    let cur = root
    let acc = ''
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i]!
      acc = acc ? `${acc}/${name}` : name
      if (!cur.children.has(name)) {
        cur.children.set(name, { path: acc, children: new Map() })
      }
      cur = cur.children.get(name)!
    }
  }
  function toNodes(parent: PathNode): FileTreeNode[] {
    const list: FileTreeNode[] = []
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
        children: children.length > 0 ? children : undefined,
      })
    }
    return list.sort((a, b) => a.label.localeCompare(b.label))
  }
  return toNodes(root)
}

export interface ExplorerTreeDomain {
  domain: string
  paths: string[]
}

export function buildFileTreeFromApiResponse(treeData: { domains?: ExplorerTreeDomain[] } | null | undefined): FileTreeNode[] {
  if (!treeData?.domains?.length) {
    return []
  }

  const nodes: FileTreeNode[] = []
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

export function getExpandedIdsForSelection(nodes: FileTreeNode[] | null | undefined, selectedId: string): string[] {
  const ids: string[] = []
  function collect(ns: FileTreeNode[] | undefined): void {
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
  collect(nodes ?? [])
  return ids
}
