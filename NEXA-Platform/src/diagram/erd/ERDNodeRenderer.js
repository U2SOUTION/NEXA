/**
 * ERDNodeRenderer.js
 * ERD 노드 렌더링 로직
 * (향후 확장용 - 현재는 ERDDiagram.js에 통합)
 */

/**
 * 노드 렌더링 옵션
 */
export const nodeRenderOptions = {
  default: {
    width: 150,
    height: 60,
    padding: 10,
  },
  selected: {
    width: 200,
    height: 80,
    padding: 12,
  },
}

/**
 * 노드 생성 (향후 확장용)
 * @param {Object} nodeData - 노드 데이터
 * @param {Object} _options - 렌더링 옵션 (향후 구현)
 * @returns {Object} 노드 객체
 */
// eslint-disable-next-line no-unused-vars
export function createNode(nodeData, _options = {}) {
  // 향후 구현
  return nodeData
}

