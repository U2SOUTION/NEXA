/**
 * 전역 탐색기용 순수 유틸: 파일 타입 아이콘, 트리 노드 빌드
 */

const CATEGORY_LABELS = {
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

/**
 * 파일 타입/카테고리/확장자에 따른 Quasar 아이콘 이름
 * @param {string} fileType - file_type, category, 또는 확장자
 * @returns {string}
 */
export function getFileIconByType(fileType) {
  if (!fileType) return FILE_TYPE_ICONS.other
  const t = String(fileType).toLowerCase().trim()
  return FILE_TYPE_ICONS[t] || FILE_TYPE_ICONS.other
}

/**
 * 파일 객체에서 아이콘 반환 (file_type, category, 확장자 순으로 확인)
 * @param {{ file_type?: string, category?: string, original_name?: string, file_path?: string }} item
 * @returns {string}
 */
export function getFileIconForItem(item) {
  if (!item) return FILE_TYPE_ICONS.other
  const fromType = getFileIconByType(item.file_type || item.category)
  if (fromType !== FILE_TYPE_ICONS.other) return fromType
  const name = (item.original_name || item.file_path || '').toLowerCase()
  const ext = name.match(/\.([a-z0-9]+)$/)?.[1] || ''
  if (ext) return getFileIconByType(ext)
  return FILE_TYPE_ICONS.other
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
