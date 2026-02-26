/**
 * FileTreeNodeRenderer.js
 * 파일 트리 노드 렌더러
 * 파일/폴더 타입별 커스텀 렌더링
 */

/**
 * 파일 타입별 색상 가져오기
 * @param {String} fileName - 파일명
 * @returns {String} 색상 (CSS 변수 또는 hex)
 */
export function getFileTypeColor(fileName) {
  if (!fileName) return 'var(--nexa-surface)'

  const ext = fileName.split('.').pop()?.toLowerCase()
  const colorMap = {
    vue: 'var(--nexa-primary)',
    js: 'var(--nexa-success)',
    ts: 'var(--nexa-info)',
    scss: 'var(--nexa-warning)',
    css: 'var(--nexa-warning)',
    json: 'var(--nexa-accent)',
  }

  return colorMap[ext] || 'var(--nexa-surface)'
}

/**
 * 폴더 노드 렌더링
 * 향후 확장용 placeholder 함수
 * @param {Object} parent - D3 선택자 (노드 그룹)
 * @param {Object} nodeData - 노드 데이터
 */
export function renderFolderNode(parent, nodeData) {
  // 기본 렌더링은 FileTreeDiagram에서 처리
  // 여기서는 추가 커스터마이징만 수행
  // 향후 확장 시 사용 예정
  void parent
  void nodeData
}

/**
 * 파일 노드 렌더링
 * 향후 확장용 placeholder 함수
 * @param {Object} parent - D3 선택자 (노드 그룹)
 * @param {Object} nodeData - 노드 데이터
 */
export function renderFileNode(parent, nodeData) {
  // 기본 렌더링은 FileTreeDiagram에서 처리
  // 여기서는 추가 커스터마이징만 수행
  // 향후 확장 시 사용 예정
  void parent
  void nodeData
}
