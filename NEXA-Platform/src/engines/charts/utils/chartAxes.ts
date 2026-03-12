// @ts-nocheck — strict 타입은 추후 엔진 재작성 시 적용
/**
 * chartAxes.js
 * 차트 축 그리기 공통 유틸리티
 */
import * as d3 from 'd3'

/**
 * 축 라벨 텍스트 생성
 * @param {String} yField - Y축 필드명
 * @param {Array} columns - 컬럼 정의 배열
 * @param {String} aggregation - 집계 방식
 * @param {Array} aggregationOptions - 집계 옵션 배열
 * @returns {String} Y축 라벨 텍스트
 */
export function getYAxisLabel(yField, columns, aggregation, aggregationOptions) {
  if (yField === '__count__') {
    return '개수'
  }
  const yFieldColumn = columns.find((col) => col.field === yField)
  const aggregationLabel = aggregationOptions.find((opt) => opt.value === aggregation)?.label || ''
  return yFieldColumn ? `${aggregationLabel} (${yFieldColumn.label})` : `${aggregationLabel} (${yField})`
}

/**
 * X축 렌더링
 * @param {Object} config - 설정 객체
 * @param {Function} config.xScale - X축 스케일
 * @param {Number} config.chartWidth - 차트 너비
 * @param {Number} config.chartHeight - 차트 높이
 * @param {String} config.xField - X축 필드명
 * @param {Array} config.columns - 컬럼 정의 배열
 * @param {Object} config.chartGroup - D3 그룹 요소
 */
export function renderXAxis({ xScale, chartWidth, chartHeight, xField, columns, chartGroup }) {
  const xAxis = d3.axisBottom(xScale)
  const xAxisGroup = chartGroup.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${chartHeight})`).call(xAxis)

  // X축 모든 라인 제거
  xAxisGroup.select('path').remove()
  xAxisGroup.selectAll('line').remove()

  // X축 틱 라벨 회전 및 색상 설정 (CSS 변수 사용)
  const rootStyle = getComputedStyle(document.documentElement)
  const tickColor = rootStyle.getPropertyValue('--chart-color-axis-tick-x').trim() || '#000000'
  xAxisGroup.selectAll('text').attr('transform', 'rotate(-45)').attr('dx', '-0.5em').attr('dy', '0.5em').attr('fill', tickColor).style('fill', tickColor)

  // X축 라벨 (필드명)
  const xAxisLabel = columns.find((col) => col.field === xField)?.label || xField
  const xAxisTickLabelHeight = 60
  const xAxisLabelY = chartHeight + xAxisTickLabelHeight + 5
  const axisLabelColor = rootStyle.getPropertyValue('--chart-color-axis-label').trim() || '#000000'
  chartGroup
    .append('text')
    .attr('class', 'axis-label x-axis-label')
    .attr('x', chartWidth / 2)
    .attr('y', xAxisLabelY)
    .attr('text-anchor', 'middle')
    .attr('fill', axisLabelColor)
    .style('fill', axisLabelColor)
    .text(xAxisLabel)
}

/**
 * Y축 렌더링
 * @param {Object} config - 설정 객체
 * @param {Function} config.yScale - Y축 스케일
 * @param {Number} config.chartHeight - 차트 높이
 * @param {String} config.yField - Y축 필드명
 * @param {Array} config.columns - 컬럼 정의 배열
 * @param {String} config.aggregation - 집계 방식
 * @param {Array} config.aggregationOptions - 집계 옵션 배열
 * @param {Object} config.chartGroup - D3 그룹 요소
 */
export function renderYAxis({ yScale, chartHeight, yField, columns, aggregation, aggregationOptions, chartGroup }) {
  const yAxis = d3.axisLeft(yScale).tickSize(5)
  const yAxisGroup = chartGroup.append('g').attr('class', 'y-axis').call(yAxis)

  // Y축 path 제거 (도메인 경계선 제거)
  yAxisGroup.select('path').remove()

  // Y축 틱 라벨 색상 설정 (CSS 변수 사용)
  const rootStyle = getComputedStyle(document.documentElement)
  const tickColor = rootStyle.getPropertyValue('--chart-color-axis-tick-y').trim() || '#000000'
  yAxisGroup.selectAll('text').attr('fill', tickColor).style('fill', tickColor)

  // Y축 라벨
  const yAxisLabel = getYAxisLabel(yField, columns, aggregation, aggregationOptions)
  const yAxisLabelX = -chartHeight / 2
  const yAxisTickLabelWidth = 20
  const yAxisLabelY = -yAxisTickLabelWidth
  const axisLabelColor = rootStyle.getPropertyValue('--chart-color-axis-label').trim() || '#000000'
  chartGroup.append('text').attr('class', 'axis-label y-axis-label').attr('x', yAxisLabelX).attr('y', yAxisLabelY).attr('transform', 'rotate(-90)').attr('fill', axisLabelColor).style('fill', axisLabelColor).text(yAxisLabel)
}

/**
 * 그리드 렌더링 (Y축 틱 위치에 수평선)
 * @param {Object} config - 설정 객체
 * @param {Function} config.yScale - Y축 스케일
 * @param {Number} config.chartWidth - 차트 너비
 * @param {Object} config.chartGroup - D3 그룹 요소
 * @param {Boolean} config.showGrid - 그리드 표시 여부
 */
export function renderGrid({ yScale, chartWidth, chartGroup, showGrid = false }) {
  if (!showGrid) return

  // 기존 그리드 제거
  chartGroup.selectAll('.grid-line').remove()

  // 그리드 그룹 생성
  const gridGroup = chartGroup.append('g').attr('class', 'grid')

  // Y축 틱 위치에 수평선 그리기
  const ticks = yScale.ticks()
  gridGroup
    .selectAll('line.horizontal')
    .data(ticks)
    .enter()
    .append('line')
    .attr('class', 'grid-line horizontal')
    .attr('x1', 0)
    .attr('x2', chartWidth)
    .attr('y1', (d) => yScale(d))
    .attr('y2', (d) => yScale(d))
  // stroke는 CSS에서 관리 (_chart.scss)
}

/**
 * 범례 렌더링 (우측 아래)
 * @param {Object} config - 설정 객체
 * @param {Array} config.legendItems - 범례 항목 배열 [{ label, color, type }]
 * @param {Number} config.chartWidth - 차트 너비
 * @param {Number} config.chartHeight - 차트 높이
 * @param {Object} config.chartGroup - D3 그룹 요소
 * @param {Boolean} config.showLegend - 범례 표시 여부
 */
export function renderLegend({ legendItems = [], chartWidth, chartHeight, chartGroup, showLegend = false }) {
  if (!showLegend || !legendItems || legendItems.length === 0) return

  // 기존 범례 제거
  chartGroup.selectAll('.chart-legend').remove()

  // 범례 그룹 생성 (우측 아래)
  const legendGroup = chartGroup.append('g').attr('class', 'chart-legend')
  const legendPadding = 10
  const legendItemHeight = 20
  const legendItemSpacing = 5
  const legendWidth = 150
  const legendX = chartWidth - legendWidth - legendPadding
  const legendY = chartHeight - legendItems.length * (legendItemHeight + legendItemSpacing) - legendPadding

  // 각 범례 항목 렌더링
  legendItems.forEach((item, index) => {
    const itemY = legendY + index * (legendItemHeight + legendItemSpacing)
    const itemGroup = legendGroup.append('g').attr('class', 'legend-item').attr('transform', `translate(${legendX}, ${itemY})`)

    // 막대/파이 차트는 3가지 색상을 명확히 구분하여 표시, 나머지는 단색
    const isMultiColorChart = item.type === 'bar' || item.type === 'pie'

    if (isMultiColorChart) {
      // 칼라 차트 색상 3가지 (CSS 변수에서 읽기)
      const rootStyle = getComputedStyle(document.documentElement)
      const color1 = rootStyle.getPropertyValue('--chart-color-legend-multi-1').trim() || '#ff9800'
      const color2 = rootStyle.getPropertyValue('--chart-color-legend-multi-2').trim() || '#555555'
      const color3 = rootStyle.getPropertyValue('--chart-color-legend-multi-3').trim() || '#ffd600'
      const colors = [color1, color2, color3]

      // 범례 박스 크기 (CSS 변수에서 읽기)
      const cssBoxSize = rootStyle.getPropertyValue('--chart-legend-box-size').trim()
      const boxWidth = cssBoxSize ? parseFloat(cssBoxSize) : 15
      const boxHeight = boxWidth // 정사각형
      const segmentWidth = boxWidth / 3

      // 전체 박스 테두리
      // width, height는 SVG 속성이므로 JS에서 설정, stroke는 CSS에서 관리
      itemGroup.append('rect').attr('width', boxWidth).attr('height', boxHeight).attr('fill', 'none')

      // 3개의 색상 박스를 나란히 배치
      colors.forEach((color, colorIndex) => {
        itemGroup
          .append('rect')
          .attr('x', colorIndex * segmentWidth)
          .attr('y', 0)
          .attr('width', segmentWidth)
          .attr('height', boxHeight)
          .attr('fill', color)
      })
    } else {
      // 단색 차트는 기존 방식대로
      // width, height는 SVG 속성이므로 JS에서 설정, stroke는 CSS에서 관리
      const rootStyle = getComputedStyle(document.documentElement)
      const cssStrokeColor = rootStyle.getPropertyValue('--chart-color-stroke').trim() || '#2196F3'
      const cssBoxSize = rootStyle.getPropertyValue('--chart-legend-box-size').trim()
      const boxSize = cssBoxSize ? parseFloat(cssBoxSize) : 15
      const fillColor = item.color || cssStrokeColor
      itemGroup.append('rect').attr('width', boxSize).attr('height', boxSize).attr('fill', fillColor)
    }

    // 라벨 텍스트
    // font-size, font-weight, fill은 전역 CSS(_chart.scss)에서 관리하되, SVG 요소 특성상 style로도 설정
    itemGroup
      .append('text')
      .attr('x', 20)
      .attr('y', 12)
      // fill은 CSS에서 관리 (_chart.scss)
      .style('font-size', '12px') // CSS 스타일로 설정 (SVG 속성보다 우선순위 높음)
      .style('font-weight', '500')
      .text(item.label || item.type || '')
  })
}

/**
 * 공유 축 렌더링 (복수 레이어용)
 * @param {Object} config - 설정 객체
 */
export function renderSharedAxes({ xScale, yScale, chartWidth, chartHeight, xField, yField, columns, aggregation, aggregationOptions, chartGroup }) {
  renderXAxis({ xScale, chartWidth, chartHeight, xField, columns, chartGroup })
  renderYAxis({ yScale, chartHeight, yField, columns, aggregation, aggregationOptions, chartGroup })
}
