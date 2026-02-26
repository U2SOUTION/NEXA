/**
 * diagramLayout.js
 * 다이어그램 레이아웃 알고리즘
 */

/**
 * 레이아웃 알고리즘 타입
 */
export const layoutTypes = {
  HIERARCHICAL: 'hierarchical', // 계층형 (dagre 기본)
  CIRCULAR: 'circular', // 원형
  GRID: 'grid', // 그리드
  FORCE: 'force', // 물리 기반 (D3 force)
  MANUAL: 'manual', // 수동 배치
}

/**
 * 레이아웃 옵션 기본값
 */
export const defaultLayoutOptions = {
  [layoutTypes.HIERARCHICAL]: {
    rankdir: 'LR', // 좌우 방향 (TB: 상하, LR: 좌우, BT: 하상, RL: 우좌)
    nodesep: 100, // 노드 간격 (기본값 증가)
    ranksep: 120, // 레벨 간격 (기본값 증가)
    marginx: 50,
    marginy: 50,
  },
  [layoutTypes.CIRCULAR]: {
    radius: 200,
    startAngle: 0,
    endAngle: 2 * Math.PI,
  },
  [layoutTypes.GRID]: {
    rows: null, // null이면 자동 계산
    cols: null,
    cellWidth: 200,
    cellHeight: 150,
  },
  [layoutTypes.FORCE]: {
    charge: -300,
    linkDistance: 100,
    linkStrength: 0.5,
  },
  [layoutTypes.MANUAL]: {
    // 수동 배치는 옵션 없음
  },
}

/**
 * 레이아웃 옵션 가져오기
 * @param {String} layoutType - 레이아웃 타입
 * @param {Object} customOptions - 사용자 정의 옵션
 * @returns {Object} 레이아웃 옵션
 */
export function getLayoutOptions(layoutType, customOptions = {}) {
  const defaults = defaultLayoutOptions[layoutType] || {}
  return { ...defaults, ...customOptions }
}

