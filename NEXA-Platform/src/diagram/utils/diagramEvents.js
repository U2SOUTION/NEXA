/**
 * diagramEvents.js
 * 다이어그램 이벤트 처리 유틸리티
 */

import * as d3 from 'd3'

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

/**
 * 노드 호버 효과 적용 (공통 유틸리티)
 * CSS 클래스만 추가/제거하고, 실제 스타일은 CSS에서 처리
 * @param {d3.Selection} nodeElement - D3 노드 요소 선택
 * @param {Boolean} isEntering - 호버 진입 여부
 */
export function applyNodeHoverEffect(nodeElement, isEntering) {
  if (!nodeElement || !nodeElement.node()) return

  if (isEntering) {
    nodeElement.classed('node-hover', true)
    nodeElement.raise() // 노드를 최상위로 올림
  } else {
    nodeElement.classed('node-hover', false)
  }
}

/**
 * 노드 호버 이벤트 핸들러 생성 (공통 유틸리티)
 * @param {Object} options - 옵션
 * @param {Function} options.onNodeHover - 노드 호버 콜백 함수
 * @param {Function} options.getNodeId - 노드 ID를 가져오는 함수 (event, d, nodeElement) => nodeId
 * @param {Function} options.getNodeData - 노드 데이터를 가져오는 함수 (nodeId) => nodeData
 * @returns {Object} { onMouseenter, onMouseleave } 이벤트 핸들러
 */
export function createNodeHoverHandlers({ onNodeHover, getNodeId, getNodeData }) {
  if (!onNodeHover) {
    return { onMouseenter: null, onMouseleave: null }
  }

  const onMouseenter = function (event, d) {
    const nodeElement = d3.select(this)
    const nodeId = getNodeId ? getNodeId(event, d, nodeElement) : d
    const nodeData = getNodeData ? getNodeData(nodeId) : null

    // CSS 클래스 추가 (호버 효과)
    applyNodeHoverEffect(nodeElement, true)

    // 콜백 호출
    onNodeHover(nodeId, nodeData, true)
  }

  const onMouseleave = function (event, d) {
    const nodeElement = d3.select(this)
    const nodeId = getNodeId ? getNodeId(event, d, nodeElement) : d
    const nodeData = getNodeData ? getNodeData(nodeId) : null

    // CSS 클래스 제거
    applyNodeHoverEffect(nodeElement, false)

    // 콜백 호출
    onNodeHover(nodeId, nodeData, false)
  }

  return { onMouseenter, onMouseleave }
}
