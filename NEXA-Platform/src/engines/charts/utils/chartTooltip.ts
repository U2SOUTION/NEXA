// @ts-nocheck — strict 타입은 추후 엔진 재작성 시 적용
/**
 * chartTooltip.js
 * 차트 툴팁 공통 유틸리티
 */
import * as d3 from 'd3'

/**
 * 툴팁 생성
 * @returns {Object} D3 선택된 툴팁 요소
 */
export function createTooltip() {
  // 이미 존재하는 툴팁이 있으면 반환
  const existing = d3.select('.chart-tooltip')
  if (!existing.empty()) {
    return existing
  }

  return (
    d3
    .select('body')
    .append('div')
      .attr('class', 'chart-tooltip chart-tooltip-multi')
      // 기본 스타일은 CSS에서 관리, 동적으로 변경되는 속성만 인라인으로 설정
    .style('position', 'fixed')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('z-index', 10000)
    .style('display', 'none')
  )
}

/**
 * 툴팁 내용 생성
 * @param {Object} config - 설정 객체
 * @param {Object} config.d - 데이터 포인트
 * @param {String} config.xField - X축 필드명
 * @param {String} config.yField - Y축 필드명
 * @param {Array} config.columns - 컬럼 정의 배열
 * @param {String} config.aggregation - 집계 방식
 * @param {Array} config.aggregationOptions - 집계 옵션 배열
 * @returns {String} 툴팁 HTML 내용
 */
export function createTooltipContent({ d, xField, yField, columns, aggregation, aggregationOptions }) {
  const xAxisLabel = columns.find((col) => col.field === xField)?.label || xField
  let yAxisLabel = ''
  if (yField === '__count__') {
    yAxisLabel = '개수'
  } else {
    const yFieldColumn = columns.find((col) => col.field === yField)
    const aggregationLabel = aggregationOptions.find((opt) => opt.value === aggregation)?.label || ''
    yAxisLabel = yFieldColumn ? `${aggregationLabel} (${yFieldColumn.label})` : aggregationLabel
  }

  return `<div class="chart-tooltip-title">${xAxisLabel}: ${d.x}</div><div class="chart-tooltip-value">${yAxisLabel}: ${d.y.toLocaleString('ko-KR')}</div><div class="chart-tooltip-count">레코드 수: ${d.count}개</div>`
}

/**
 * 툴팁 표시
 * @param {Object} tooltip - D3 선택된 툴팁 요소
 * @param {Event} event - 마우스 이벤트
 * @param {String} content - 툴팁 내용
 */
export function showTooltip(tooltip, event, content) {
  if (!tooltip || tooltip.empty()) return

  tooltip
    .html(content)
    .style('display', 'block')
    .style('opacity', 1)
    .style('left', event.clientX + 10 + 'px')
    .style('top', event.clientY - 10 + 'px')
}

/**
 * 툴팁 숨김
 * @param {Object} tooltip - D3 선택된 툴팁 요소
 */
export function hideTooltip(tooltip) {
  if (!tooltip || tooltip.empty()) return
  tooltip.style('opacity', 0).style('display', 'none')
}

/**
 * 툴팁 위치 업데이트
 * @param {Object} tooltip - D3 선택된 툴팁 요소
 * @param {Event} event - 마우스 이벤트
 */
export function updateTooltipPosition(tooltip, event) {
  if (!tooltip || tooltip.empty()) return
  tooltip.style('left', event.clientX + 10 + 'px').style('top', event.clientY - 10 + 'px')
}
