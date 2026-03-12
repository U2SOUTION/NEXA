/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck — strict 타입은 추후 엔진 재작성 시 적용
/**
 * FlowDiagram.js
 * 플로우차트 다이어그램 렌더러
 * (향후 구현)
 */

/**
 * 플로우차트 다이어그램 렌더링
 * @param {HTMLElement} container - 다이어그램 컨테이너 DOM 요소
 * @param {Object} data - 다이어그램 데이터
 * @param {Object} _options - 렌더링 옵션 (향후 구현)
 * @returns {Promise<Object>} 렌더링 결과
 */
export async function renderFlow(container, data, _options = {}) {
  void _options
  console.log('[FlowDiagram] renderFlow - 향후 구현 예정')
  return {
    svg: null,
    svgGroup: null,
    zoom: null,
    graph: null,
  }
}

