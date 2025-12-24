/**
 * diagramZoom.js
 * 다이어그램 줌/팬 유틸리티
 */

import * as d3 from 'd3'

/**
 * 줌 객체 생성
 * @param {Function} onZoom - 줌 이벤트 핸들러
 * @param {Object} options - 줌 옵션
 * @returns {Object} D3 zoom 객체
 */
export function createZoom(onZoom, options = {}) {
  const {
    scaleExtent = [0.1, 3],
    wheelDelta = null,
  } = options

  const zoom = d3.zoom()
    .scaleExtent(scaleExtent)
    .on('zoom', onZoom)

  if (wheelDelta) {
    zoom.wheelDelta(wheelDelta)
  }

  return zoom
}

/**
 * 초기 줌 설정 (그래프가 화면에 맞도록)
 * @param {Object} svg - D3 SVG 선택자
 * @param {Object} svgGroup - D3 그룹 선택자
 * @param {Number} containerWidth - 컨테이너 너비
 * @param {Number} containerHeight - 컨테이너 높이
 * @param {Object} zoom - D3 zoom 객체
 */
export function fitToScreen(svg, svgGroup, containerWidth, containerHeight, zoom) {
  try {
    const bounds = svgGroup.node().getBBox()
    const fullWidth = bounds.width
    const fullHeight = bounds.height
    const width = containerWidth
    const height = containerHeight
    const midX = bounds.x + fullWidth / 2
    const midY = bounds.y + fullHeight / 2

    if (fullWidth > 0 && fullHeight > 0) {
      const scale = Math.min(width / fullWidth, height / fullHeight) * 0.9
      const translate = [width / 2 - scale * midX, height / 2 - scale * midY]

      svg.call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale))
    }
  } catch (err) {
    console.warn('[diagramZoom] 초기 줌 설정 실패:', err)
  }
}

/**
 * 줌 인/아웃
 * @param {Object} svg - D3 SVG 선택자
 * @param {Object} zoom - D3 zoom 객체
 * @param {Number} scale - 스케일 값 (1보다 크면 확대, 작으면 축소)
 */
export function zoomTo(svg, zoom, scale) {
  svg.call(zoom.scaleBy, scale)
}

/**
 * 줌 리셋
 * @param {Object} svg - D3 SVG 선택자
 * @param {Object} zoom - D3 zoom 객체
 */
export function resetZoom(svg, zoom) {
  svg.call(zoom.transform, d3.zoomIdentity)
}

