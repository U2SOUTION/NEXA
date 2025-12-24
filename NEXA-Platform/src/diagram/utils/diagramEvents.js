/**
 * diagramEvents.js
 * 다이어그램 이벤트 처리 유틸리티
 */

/**
 * 이벤트 타입
 */
export const diagramEventTypes = {
  NODE_CLICK: 'node-click',
  NODE_HOVER: 'node-hover',
  NODE_DOUBLE_CLICK: 'node-double-click',
  EDGE_CLICK: 'edge-click',
  EDGE_HOVER: 'edge-hover',
  CANVAS_CLICK: 'canvas-click',
  ZOOM: 'zoom',
  PAN: 'pan',
}

/**
 * 노드 클릭 이벤트 생성
 * @param {String} nodeId - 노드 ID
 * @param {Object} nodeData - 노드 데이터
 * @returns {Object} 이벤트 객체
 */
export function createNodeClickEvent(nodeId, nodeData) {
  return {
    type: diagramEventTypes.NODE_CLICK,
    nodeId,
    nodeData,
    timestamp: Date.now(),
  }
}

/**
 * 노드 호버 이벤트 생성
 * @param {String} nodeId - 노드 ID
 * @param {Object} nodeData - 노드 데이터
 * @param {Boolean} isEntering - 호버 진입 여부
 * @returns {Object} 이벤트 객체
 */
export function createNodeHoverEvent(nodeId, nodeData, isEntering) {
  return {
    type: diagramEventTypes.NODE_HOVER,
    nodeId,
    nodeData,
    isEntering,
    timestamp: Date.now(),
  }
}

/**
 * 엣지 클릭 이벤트 생성
 * @param {String} edgeId - 엣지 ID
 * @param {Object} edgeData - 엣지 데이터
 * @returns {Object} 이벤트 객체
 */
export function createEdgeClickEvent(edgeId, edgeData) {
  return {
    type: diagramEventTypes.EDGE_CLICK,
    edgeId,
    edgeData,
    timestamp: Date.now(),
  }
}

