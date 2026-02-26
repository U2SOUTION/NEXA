/**
 * lineChart.js
 * 라인 차트 렌더링 함수
 * 레이어 모드 지원: xScale, yScale을 파라미터로 받으면 공유 스케일 사용
 */
import * as d3 from 'd3'
import { createXScale, createYScale } from '../utils/chartScales'
import { renderXAxis, renderYAxis, renderGrid } from '../utils/chartAxes'
import { setupLayerInteraction } from '../utils/chartEvents'
import { defaultTheme } from '../utils/chartTheme'
import { createElementFilter } from '../utils/chartFilters'

export function renderLineChart({
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
  showLabels = true, // 데이터 라벨 표시 여부 (현재 미구현)
  interaction = {}, // 인터랙션 옵션
  style = {}, // 스타일 옵션
  svg, // SVG 요소 (필터 생성용)
}) {
  // 라벨 표시 여부 확인
  const labelsEnabled = showLabels !== false && chartOptions.showLabels !== false
  if (!data || data.length === 0) {
    console.warn('[LineChart] 렌더링할 데이터가 없습니다.')
    return
  }

  // 스케일 생성 (공유 스케일이 없으면 새로 생성)
  const finalXScale = xScale || createXScale(data, chartWidth)
  const finalYScale = yScale || createYScale(data, chartHeight)

  const line = d3
    .line()
    .x((d) => finalXScale(String(d.x)) + finalXScale.bandwidth() / 2)
    .y((d) => finalYScale(d.y))
    .curve(d3.curveMonotoneX)

  const linePath = chartGroup.append('path').datum(data).attr('class', 'line-chart').attr('d', line)

  // 색상 설정 (style.color > style.stroke > CSS 변수 기본값 순서)
  // style.color가 명시적으로 설정되어 있으면 사용 (null이나 빈 문자열이 아닌 경우)
  const rootStyle = getComputedStyle(document.documentElement)
  const cssStrokeColor = rootStyle.getPropertyValue('--chart-color-stroke').trim() || '#2196F3'
  const strokeColor = style.color !== undefined && style.color !== null && style.color !== '' ? style.color : style.stroke || cssStrokeColor

  // CSS보다 우선순위가 높도록 인라인 스타일로 설정
  linePath.attr('stroke', strokeColor).style('stroke', strokeColor)

  // 선 두께 설정
  // style.strokeWidth가 명시적으로 설정된 경우 JS에서 설정, 없으면 CSS 변수 기본값 사용
  const neonIntensity = style.neonIntensity || 0
  let finalStrokeWidth

  if (style.strokeWidth !== undefined) {
    // 명시적으로 설정된 경우 사용
    finalStrokeWidth = style.strokeWidth
  } else {
    // CSS 변수에서 기본값 읽기
    const rootStyle = getComputedStyle(document.documentElement)
    const cssDefault = rootStyle.getPropertyValue('--chart-stroke-width-default').trim()
    finalStrokeWidth = cssDefault ? parseFloat(cssDefault) : 2 // CSS 변수가 없으면 기본값 2
  }

  linePath.attr('stroke-width', finalStrokeWidth).style('stroke-width', `${finalStrokeWidth}px`)

  // 스타일 적용 (레이어 모드)
  if (style.opacity !== undefined) {
    linePath.attr('opacity', style.opacity)
  }

  // 필터 효과 적용 (네온 + 흐리기 통합)
  const blurAmount = style.blur || 0
  linePath.attr('filter', null)

  if ((neonIntensity > 0 || blurAmount > 0) && svg) {
    // 색상을 hex 문자열로 변환하여 필터 ID 생성
    const colorObj = d3.color(strokeColor)
    if (!colorObj) {
      console.warn(`[LineChart] 색상 파싱 실패: ${strokeColor}`)
    } else {
      const colorHex = colorObj.formatHex().replace('#', '')

      // 필터 ID 생성 (색상, 네온 강도, 흐리기 강도 포함)
      const blurSuffix = blurAmount > 0 ? `-blur-${String(blurAmount).replace('.', '_')}` : ''
      const filterId = `filter-${colorHex}-${String(neonIntensity).replace('.', '_')}${blurSuffix}-line`

      // 공통 필터 생성 함수 사용
      const filter = createElementFilter(svg, filterId, strokeColor, neonIntensity, blurAmount, { chartType: 'line' })

      if (filter) {
        linePath.attr('filter', `url(#${filterId})`)
      } else {
        linePath.attr('filter', null)
      }
    }
  } else {
    // 효과가 없으면 모든 필터 제거
    linePath.attr('filter', null)
  }

  // 애니메이션
  const animationEnabled = chartOptions.animation !== false && style.animation?.enabled !== false
  if (animationEnabled) {
    const duration = style.animation?.duration || defaultTheme.animation.duration
    const totalLength = linePath.node().getTotalLength()
    linePath
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(duration)
      .ease(defaultTheme.animation.easing)
      .attr('stroke-dashoffset', 0)
      .on('end', function () {
        // 애니메이션 완료 후 선 두께 다시 확인 및 설정
        // finalStrokeWidth는 이미 위에서 계산되었으므로 재사용
        const currentWidth = d3.select(this).attr('stroke-width')
        if (currentWidth !== String(finalStrokeWidth)) {
          d3.select(this).attr('stroke-width', finalStrokeWidth).style('stroke-width', `${finalStrokeWidth}px`)
        }
      })
  }

  // 노드 크기 설정
  // style.nodeSize가 명시적으로 설정된 경우 사용, 없으면 CSS 변수 기본값 사용
  let nodeSize
  if (style.nodeSize !== undefined) {
    nodeSize = style.nodeSize
  } else {
    const rootStyle = getComputedStyle(document.documentElement)
    const cssDefault = rootStyle.getPropertyValue('--chart-node-size-default').trim()
    nodeSize = cssDefault ? parseFloat(cssDefault) : 4 // CSS 변수가 없으면 기본값 4
  }

  // 기존 노드들도 색상 업데이트
  chartGroup.selectAll('.line-dot').attr('fill', strokeColor).style('fill', strokeColor)

  const dots = chartGroup
    .selectAll('.line-dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'line-dot')
    .attr('cx', (d) => finalXScale(String(d.x)) + finalXScale.bandwidth() / 2)
    .attr('cy', (d) => finalYScale(d.y))
    .attr('r', nodeSize)
    .attr('fill', strokeColor) // 노드 점도 같은 색상
    // cursor는 CSS에서 관리하되, SVG 요소 특성상 style로도 설정
    .style('cursor', 'var(--chart-cursor-hover, move)')
    .style('fill', strokeColor) // CSS보다 우선순위가 높도록 인라인 스타일로도 설정

  // 노드 점에 필터 효과 적용 함수
  const applyNodeFilters = () => {
    if (nodeSize === 0) return

    const currentDots = chartGroup.selectAll('.line-dot')
    const dotsCount = currentDots.size()

    if (dotsCount === 0) return

    if ((neonIntensity > 0 || blurAmount > 0) && svg) {
      // 먼저 모든 노드 점의 기존 필터를 제거
      currentDots.attr('filter', null)

      // 색상을 hex 문자열로 변환하여 필터 ID 생성
      const colorObj = d3.color(strokeColor)
      if (!colorObj) {
        console.warn(`[LineChart] 노드 점 색상 파싱 실패: ${strokeColor}`)
        return
      }
      const colorHex = colorObj.formatHex().replace('#', '')

      // 필터 ID 생성 (색상, 네온 강도, 흐리기 강도 포함, 노드 점임을 표시)
      const blurSuffix = blurAmount > 0 ? `-blur-${String(blurAmount).replace('.', '_')}` : ''
      const filterId = `filter-${colorHex}-${String(neonIntensity).replace('.', '_')}${blurSuffix}-line-node`

      // 공통 필터 생성 함수 사용 (scatter 타입 사용 - 점이므로)
      const filter = createElementFilter(svg, filterId, strokeColor, neonIntensity, blurAmount, { chartType: 'scatter' })

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

  if (animationEnabled && nodeSize > 0) {
    const duration = style.animation?.duration || defaultTheme.animation.duration
    dots
      .attr('r', 0)
      .transition()
      .duration(duration)
      .delay((d, i) => i * 50)
      .ease(defaultTheme.animation.easing)
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
    chartType: 'line',
    mode,
  })

  // 데이터 포인트 위 값 라벨 표시 (옵션)
  if (labelsEnabled) {
    chartGroup
      .selectAll('.line-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'line-label')
      .attr('x', (d) => finalXScale(String(d.x)) + finalXScale.bandwidth() / 2)
      .attr('y', (d) => finalYScale(d.y) - nodeSize - 5)
      .attr('text-anchor', 'middle')
      // fill은 CSS에서 관리 (_chart.scss의 .line-label { fill: var(--chart-color-data-label); })
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
