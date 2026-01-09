/**
 * areaChart.js
 * 영역 차트 렌더링 함수
 * 레이어 모드 지원: xScale, yScale을 파라미터로 받으면 공유 스케일 사용
 */
import * as d3 from 'd3'
import { createXScale, createYScale } from '../utils/chartScales.js'
import { renderXAxis, renderYAxis, renderGrid } from '../utils/chartAxes.js'
import { setupLayerInteraction } from '../utils/chartEvents.js'
import { createElementFilter } from '../utils/chartFilters.js'

export function renderAreaChart({
  data,
  chartWidth,
  chartHeight,
  xField,
  yField,
  columns,
  chartOptions = {},
  chartGroup,
  axesGroup, // 축 그룹 (제공되면 별도 그룹에 렌더링)
  svg,
  tooltip,
  aggregation,
  aggregationOptions,
  onDataClick,
  onDataHover,
  // 레이어 모드 옵션
  xScale, // 공유 스케일 (제공되면 사용)
  yScale, // 공유 스케일 (제공되면 사용)
  showAxes = true, // 축 렌더링 여부 (레이어 모드에서는 false)
  showLabels = true, // 데이터 라벨 표시 여부 (현재 미구현)
  interaction = {}, // 인터랙션 옵션
  style = {}, // 스타일 옵션
}) {
  // 라벨 표시 여부 확인
  const labelsEnabled = showLabels !== false && chartOptions.showLabels !== false
  if (!data || data.length === 0) {
    console.warn('[AreaChart] 렌더링할 데이터가 없습니다.')
    return
  }

  // 스케일 생성 (공유 스케일이 없으면 새로 생성)
  const finalXScale = xScale || createXScale(data, chartWidth)
  const finalYScale = yScale || createYScale(data, chartHeight)

  // svg가 없으면 chartGroup의 부모에서 찾기
  if (!svg) {
    svg = d3.select(chartGroup.node().ownerSVGElement)
  }

  const area = d3
    .area()
    .x((d) => finalXScale(String(d.x)) + finalXScale.bandwidth() / 2)
    .y0(chartHeight)
    .y1((d) => finalYScale(d.y))
    .curve(d3.curveMonotoneX)

  const gradientId = 'areaGradient-' + Math.random().toString(36).substr(2, 9)
  const gradient = svg.append('defs').append('linearGradient').attr('id', gradientId).attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%')

  // 색상 설정 (style.color > style.stroke > CSS 변수 기본값 순서)
  // style.color가 명시적으로 설정되어 있으면 사용 (null이나 빈 문자열이 아닌 경우)
  const rootStyle = getComputedStyle(document.documentElement)
  const cssStrokeColor = rootStyle.getPropertyValue('--chart-color-stroke').trim() || '#2196F3'
  const areaColor = style.color !== undefined && style.color !== null && style.color !== '' ? style.color : style.stroke || cssStrokeColor

  // 그라데이션 색상 설정
  gradient.append('stop').attr('offset', '0%').attr('stop-color', areaColor).attr('stop-opacity', 0.6)

  gradient.append('stop').attr('offset', '100%').attr('stop-color', areaColor).attr('stop-opacity', 0.1)

  const areaPath = chartGroup.append('path').datum(data).attr('class', 'area-chart').attr('d', area).attr('fill', `url(#${gradientId})`)

  const line = d3
    .line()
    .x((d) => finalXScale(String(d.x)) + finalXScale.bandwidth() / 2)
    .y((d) => finalYScale(d.y))
    .curve(d3.curveMonotoneX)

  const linePath = chartGroup.append('path').datum(data).attr('class', 'area-line').attr('d', line)

  // 선 색상 설정 (CSS보다 우선순위가 높도록 인라인 스타일로도 설정)
  linePath.attr('stroke', areaColor).style('stroke', areaColor)

  // 선 두께 설정
  // style.strokeWidth가 명시적으로 설정된 경우 JS에서 설정, 없으면 CSS 변수 기본값 사용
  let strokeWidth

  if (style.strokeWidth !== undefined) {
    // 명시적으로 설정된 경우 사용
    strokeWidth = style.strokeWidth
  } else {
    // CSS 변수에서 기본값 읽기
    const rootStyle = getComputedStyle(document.documentElement)
    const cssDefault = rootStyle.getPropertyValue('--chart-stroke-width-default').trim()
    strokeWidth = cssDefault ? parseFloat(cssDefault) : 2 // CSS 변수가 없으면 기본값 2
  }

  linePath.attr('stroke-width', strokeWidth).style('stroke-width', `${strokeWidth}px`)

  // 스타일 적용
  if (style.opacity !== undefined) {
    areaPath.attr('opacity', style.opacity)
    linePath.attr('opacity', style.opacity)
  }

  // 필터 효과 적용 (네온 + 흐리기 통합)
  // 영역과 선은 별도의 필터를 사용하여 각각 효과 적용
  const neonIntensity = style.neonIntensity || 0
  const blurAmount = style.blur || 0

  if ((neonIntensity > 0 || blurAmount > 0) && svg) {
    // 색상을 hex 문자열로 변환하여 필터 ID 생성
    const colorObj = d3.color(areaColor)
    if (!colorObj) {
      console.warn(`[AreaChart] 색상 파싱 실패: ${areaColor}`)
    } else {
      const colorHex = colorObj.formatHex().replace('#', '')

      // 영역용 필터 ID 생성
      const blurSuffix = blurAmount > 0 ? `-blur-${String(blurAmount).replace('.', '_')}` : ''
      const areaFilterId = `filter-${colorHex}-${String(neonIntensity).replace('.', '_')}${blurSuffix}-area`

      // 선용 필터 ID 생성
      const lineFilterId = `filter-${colorHex}-${String(neonIntensity).replace('.', '_')}${blurSuffix}-line`

      // 영역 필터 생성 (bar 타입 사용)
      const areaFilter = createElementFilter(svg, areaFilterId, areaColor, neonIntensity, blurAmount, { chartType: 'bar' })
      if (areaFilter) {
        areaPath.attr('filter', `url(#${areaFilterId})`)
      } else {
        areaPath.attr('filter', null)
      }

      // 선 필터 생성 (line 타입 사용)
      const lineFilter = createElementFilter(svg, lineFilterId, areaColor, neonIntensity, blurAmount, { chartType: 'line' })
      if (lineFilter) {
        linePath.attr('filter', `url(#${lineFilterId})`)
      } else {
        linePath.attr('filter', null)
      }
    }
  } else {
    // 효과가 없으면 모든 필터 제거
    areaPath.attr('filter', null)
    linePath.attr('filter', null)
  }

  if (chartOptions.animation !== false) {
    const totalLength = linePath.node().getTotalLength()
    linePath
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0)
    areaPath.attr('opacity', 0).transition().duration(800).ease(d3.easeCubicOut).attr('opacity', 1)
  }

  // 노드 점 크기 설정
  // style.nodeSize가 명시적으로 설정된 경우 사용, 없으면 CSS 변수 기본값 사용
  let nodeSize
  if (style.nodeSize !== undefined) {
    nodeSize = style.nodeSize
  } else {
    const rootStyle = getComputedStyle(document.documentElement)
    const cssDefault = rootStyle.getPropertyValue('--chart-node-size-default').trim()
    nodeSize = cssDefault ? parseFloat(cssDefault) : 4 // CSS 변수가 없으면 기본값 4
  }

  // 기존 노드 점 색상 업데이트
  chartGroup.selectAll('.area-dot').attr('fill', areaColor).style('fill', areaColor)

  const dots = chartGroup
    .selectAll('.area-dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'area-dot')
    .attr('cx', (d) => finalXScale(String(d.x)) + finalXScale.bandwidth() / 2)
    .attr('cy', (d) => finalYScale(d.y))
    .attr('r', nodeSize)
    // cursor는 CSS에서 관리하되, SVG 요소 특성상 style로도 설정
    .style('cursor', 'var(--chart-cursor-hover, move)')
    .attr('fill', areaColor) // 노드 점도 같은 색상
    .style('fill', areaColor) // CSS보다 우선순위가 높도록 인라인 스타일로도 설정

  // 노드 점에 필터 효과 적용 함수
  const applyNodeFilters = () => {
    if (nodeSize === 0) return

    const currentDots = chartGroup.selectAll('.area-dot')
    const dotsCount = currentDots.size()

    if (dotsCount === 0) return

    if ((neonIntensity > 0 || blurAmount > 0) && svg) {
      // 먼저 모든 노드 점의 기존 필터를 제거
      currentDots.attr('filter', null)

      // 색상을 hex 문자열로 변환하여 필터 ID 생성
      const colorObj = d3.color(areaColor)
      if (!colorObj) {
        console.warn(`[AreaChart] 노드 점 색상 파싱 실패: ${areaColor}`)
        return
      }
      const colorHex = colorObj.formatHex().replace('#', '')

      // 필터 ID 생성 (색상, 네온 강도, 흐리기 강도 포함, 노드 점임을 표시)
      const blurSuffix = blurAmount > 0 ? `-blur-${String(blurAmount).replace('.', '_')}` : ''
      const filterId = `filter-${colorHex}-${String(neonIntensity).replace('.', '_')}${blurSuffix}-area-node`

      // 공통 필터 생성 함수 사용 (scatter 타입 사용 - 점이므로)
      const filter = createElementFilter(svg, filterId, areaColor, neonIntensity, blurAmount, { chartType: 'scatter' })

      if (filter) {
        currentDots.attr('filter', `url(#${filterId})`)
      } else {
        currentDots.attr('filter', null)
      }
    } else {
      // 효과가 없으면 모든 필터 제거
      currentDots.attr('filter', null)
    }
  }

  if (chartOptions.animation !== false && nodeSize > 0) {
    dots
      .attr('r', 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .ease(d3.easeCubicOut)
      .attr('r', nodeSize)
      .on('end', function () {
        // 애니메이션 완료 후 필터 적용
        applyNodeFilters()
      })
  } else if (nodeSize === 0) {
    // 노드 크기가 0이면 숨김
    dots.attr('r', 0).style('display', 'none')
  } else {
    // 애니메이션이 없으면 즉시 필터 적용
    applyNodeFilters()
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
    elements: dots,
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
    chartType: 'area',
    mode,
  })

  // 데이터 포인트 위 값 라벨 표시 (옵션)
  if (labelsEnabled) {
    chartGroup
      .selectAll('.area-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'area-label')
      .attr('x', (d) => finalXScale(String(d.x)) + finalXScale.bandwidth() / 2)
      .attr('y', (d) => finalYScale(d.y) - nodeSize - 5)
      .attr('text-anchor', 'middle')
      // fill은 CSS에서 관리 (_chart.scss의 .area-label { fill: var(--chart-color-data-label); })
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
