/**
 * DependencyNodeRenderer.js
 * 의존성 그래프 노드 렌더러
 * 파일 타입별 커스텀 렌더링
 */

/**
 * 파일 타입별 아이콘 가져오기
 * @param {String} filePath - 파일 경로
 * @returns {String} Material Icon 이름
 */
export function getFileTypeIcon(filePath) {
  if (!filePath) return 'description'
  
  const ext = filePath.split('.').pop()?.toLowerCase()
  const iconMap = {
    vue: 'code',
    js: 'javascript',
    ts: 'typescript',
    scss: 'style',
    css: 'style',
    json: 'data_object',
    md: 'description',
    html: 'html',
  }
  
  return iconMap[ext] || 'description'
}

/**
 * 노드 커스텀 렌더링
 * 향후 확장용 placeholder 함수
 * @param {Object} parent - D3 선택자 (노드 그룹)
 * @param {Object} nodeData - 노드 데이터
 */
export function renderCustomNode(parent, nodeData) {
  // 기본 렌더링은 dagre-d3-es가 처리
  // 여기서는 추가 커스터마이징만 수행
  // 향후 확장 시 사용 예정
  // const rect = parent.select('rect')
  // const text = parent.select('text')
  
  // 파일 타입별 아이콘 추가 (향후 확장)
  // 현재는 기본 렌더링 사용
  void parent
  void nodeData
}
