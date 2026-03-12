/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck — strict 타입은 추후 엔진 재작성 시 적용
/**
 * BarChart.js
 * 막대 차트 렌더링 함수
 * 레이어 모드 지원: xScale, yScale을 파라미터로 받으면 공유 스케일 사용
 */
import * as d3 from 'd3'
import { createXScale, createYScale, createColorScale } from '../utils/chartScales'
import { renderXAxis, renderYAxis, renderGrid } from '../utils/chartAxes'
import { setupLayerInteraction } from '../utils/chartEvents'
import { defaultTheme } from '../utils/chartTheme'
import { createElementFilter } from '../utils/chartFilters'

export function renderBarChart({
  data,
  chartWidth,
  chartHeight,
  xField,
  yField,
  columns,
  chartOptions = {},
  chartGroup,
  axesGroup, // 축 그룹 (제공되면 별도 그룹에 렌더링)
  tooltip,
  aggregation,
  aggregationOptions,
  onDataClick,
  onDataHover,
  // 레이어 모드 옵션
  xScale, // 공유 스케일 (제공되면 사용)
  yScale, // 공유 스케일 (제공되면 사용)
  showAxes = true, // 축 렌더링 여부 (레이어 모드에서는 false)
  showLabels = true, // 데이터 라벨 표시 여부
  interaction = {}, // 인터랙션 옵션
  style = {}, // 스타일 옵션
  svg, // SVG 요소 (필터 생성용)
}) {
  if (!data || data.length === 0) {
    console.warn('[BarChart] 렌더링할 데이터가 없습니다.')
    return
  }

  // 스케일 생성 (공유 스케일이 없으면 새로 생성)
  const finalXScale = xScale || createXScale(data, chartWidth)
  const finalYScale = yScale || createYScale(data, chartHeight)

  // 색상 스케일
  const colorScale = createColorScale(data)

  // 막대 그리기
  const bars = chartGroup
    .selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d) => finalXScale(String(d.x)))
    .attr('y', (d) => finalYScale(d.y))
    .attr('width', finalXScale.bandwidth())
    .attr('height', (d) => chartHeight - finalYScale(d.y))
    .attr('fill', (d) => colorScale(d.x))
    // cursor는 CSS에서 관리하되, SVG 요소 특성상 style로도 설정
    .style('cursor', 'var(--chart-cursor-hover, move)')

  // 스타일 적용 (레이어 모드)
  if (style.opacity !== undefined) {
    bars.attr('opacity', style.opacity)
  }

  // 필터 효과 적용 (네온 + 흐리기 통합)
  const neonIntensity = style.neonIntensity || 0
  const blurAmount = style.blur || 0

  if ((neonIntensity > 0 || blurAmount > 0) && svg) {
    bars.each(function () {
      const element = d3.select(this)
      const fillColor = element.attr('fill')

      // 색상을 hex 문자열로 변환하여 필터 ID 생성
      const colorObj = d3.color(fillColor)
      if (!colorObj) {
        console.warn(`[BarChart] 색상 파싱 실패: ${fillColor}`)
        return
      }
      const colorHex = colorObj.formatHex().replace('#', '')

      // 필터 ID 생성 (색상, 네온 강도, 흐리기 강도 포함)
      const blurSuffix = blurAmount > 0 ? `-blur-${String(blurAmount).replace('.', '_')}` : ''
      const filterId = `filter-${colorHex}-${String(neonIntensity).replace('.', '_')}${blurSuffix}-bar`

      // 공통 필터 생성 함수 사용
      const filter = createElementFilter(svg, filterId, fillColor, neonIntensity, blurAmount, { chartType: 'bar' })

      if (filter) {
        element.attr('filter', `url(#${filterId})`)
      } else {
        element.attr('filter', null)
      }
    })
  } else {
    // 효과가 없으면 모든 필터 제거
    bars.attr('filter', null)
  }

  // 애니메이션 (옵션)
  const animationEnabled = chartOptions.animation !== false && style.animation?.enabled !== false
  if (animationEnabled) {
    const duration = style.animation?.duration || defaultTheme.animation.duration
    bars
      .attr('y', chartHeight)
      .attr('height', 0)
      .transition()
      .duration(duration)
      .ease(defaultTheme.animation.easing)
      .attr('y', (d) => finalYScale(d.y))
      .attr('height', (d) => chartHeight - finalYScale(d.y))
  }

  // 인터랙션 설정 (공통 유틸리티 사용)
  const interactionConfig = {
    tooltip: chartOptions.tooltip !== false,
    hover: chartOptions.hover !== false,
    click: chartOptions.click !== false,
    ...interaction,
  }

  // 싱글/멀티 모드 판단 (xScale, yScale이 제공되면 멀티 모드)
  const mode = xScale && yScale ? 'multi' : 'single'

  setupLayerInteraction({
    elements: bars,
    interaction: interactionConfig,
    tooltip,
    onDataClick,
    onDataHover,
    dataConfig: {
      xField,
      yField,
      columns,
      aggregation,
      aggregationOptions,
    },
    chartType: 'bar',
    mode,
  })

  // 막대 위 값 라벨 표시 (옵션)
  const labelsEnabled = showLabels !== false && chartOptions.showLabels !== false
  if (labelsEnabled) {
    // CSS 변수에서 데이터 라벨 색상 읽기
    const rootStyle = getComputedStyle(document.documentElement)
    const dataLabelColor = rootStyle.getPropertyValue('--chart-color-data-label').trim() || '#000000'

    chartGroup
      .selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', (d) => finalXScale(String(d.x)) + finalXScale.bandwidth() / 2)
      .attr('y', (d) => finalYScale(d.y) - 5)
      .attr('fill', dataLabelColor)
      .style('fill', dataLabelColor)
      .text((d) => {
        // 숫자 포맷팅 (천 단위 구분)
        if (d.y >= 1000) {
          return d.y.toLocaleString('ko-KR')
        }
        return d.y.toFixed(d.y % 1 === 0 ? 0 : 1)
      })
  }

  // 그리드 렌더링 (축보다 먼저 그려서 뒤에 위치)
  // chartOptions.showGrid가 false가 아니면 그리드 표시 (기본값 true 고려)
  if (showAxes && chartOptions.showGrid !== false) {
    const gridTargetGroup = axesGroup || chartGroup
    renderGrid({
      yScale: finalYScale,
      chartWidth,
      chartGroup: gridTargetGroup,
      showGrid: chartOptions.showGrid !== false,
    })
  }

  // 축 렌더링 (레이어 모드에서는 제외)
  // 축은 별도 그룹에 렌더링하여 필터 효과 제외
  if (showAxes) {
    const axesTargetGroup = axesGroup || chartGroup
    renderXAxis({
      xScale: finalXScale,
      chartWidth,
      chartHeight,
      xField,
      columns,
      chartGroup: axesTargetGroup,
    })

    renderYAxis({
      yScale: finalYScale,
      chartHeight,
      yField,
      columns,
      aggregation,
      aggregationOptions,
      chartGroup: axesTargetGroup,
    })
  }
}
