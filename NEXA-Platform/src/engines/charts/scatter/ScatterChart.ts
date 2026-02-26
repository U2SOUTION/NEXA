/**
 * scatterChart.js
 * 분산 차트 렌더링 함수
 * 레이어 모드 지원: xScale, yScale을 파라미터로 받으면 공유 스케일 사용
 */
import * as d3 from 'd3'
import { createXScale, createYScale } from '../utils/chartScales'
import { createElementFilter } from '../utils/chartFilters'

export function renderScatterChart({
  data,
  chartWidth,
  chartHeight,
  xField,
  yField,
  columns,
  chartOptions,
  chartGroup,
  svg, // SVG 요소 (필터 생성용)
  tooltip,
  aggregation,
  aggregationOptions,
  onDataClick,
  onDataHover,
  // 레이어 모드 옵션
  xScale, // 공유 스케일 (제공되면 사용)
  yScale, // 공유 스케일 (제공되면 사용)
  showAxes = true, // 축 렌더링 여부
  showLabels = true, // 데이터 라벨 표시 여부 (향후 사용 예정)
  interaction = {}, // 인터랙션 옵션 (향후 사용 예정)
  style = {}, // 스타일 옵션
}) {
  // 향후 구현 예정 파라미터
  void showLabels
  void interaction

  if (!data || data.length === 0) {
    console.warn('[ScatterChart] 렌더링할 데이터가 없습니다.')
    return
  }

  // 스케일 생성 (공유 스케일이 없으면 새로 생성)
  const finalXScale = xScale || createXScale(data, chartWidth)
  const finalYScale = yScale || createYScale(data, chartHeight)

  const colorScale = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.x))
    .range(d3.schemeCategory10)

  // 데이터 점 크기 설정
  // style.dotSize가 명시적으로 설정된 경우 사용, 없으면 CSS 변수 기본값 사용
  let dotRadius
  if (style.dotSize !== undefined) {
    dotRadius = style.dotSize
  } else {
    const rootStyle = getComputedStyle(document.documentElement)
    const cssDefault = rootStyle.getPropertyValue('--chart-dot-radius-default').trim()
    dotRadius = cssDefault ? parseFloat(cssDefault) : 6 // CSS 변수가 없으면 기본값 6
  }

  // 색상 설정 (style.color가 있으면 단일 색상, 없으면 colorScale 사용)
  const customColor = style.color

  // D3 업데이트 패턴: enter, update, exit 모두 처리
  const dots = chartGroup.selectAll('.scatter-dot').data(data, (d) => `${d.x}-${d.y}`)

  // 기존 요소 제거 (exit)
  dots.exit().remove()

  // 새 요소 추가 (enter)
  const dotsEnter = dots
    .enter()
    .append('circle')
    .attr('class', 'scatter-dot')
    // cursor는 CSS에서 관리하되, SVG 요소 특성상 style로도 설정
    .style('cursor', 'var(--chart-cursor-hover, move)')

  // 모든 요소 업데이트 (enter + update)
  const dotsUpdate = dotsEnter.merge(dots)
  dotsUpdate
    .attr('cx', (d) => finalXScale(String(d.x)) + finalXScale.bandwidth() / 2)
    .attr('cy', (d) => finalYScale(d.y))
    .attr('r', dotRadius)
    .attr('fill', customColor || ((d) => colorScale(d.x)))
    .attr('stroke', customColor || ((d) => colorScale(d.x))) // stroke를 fill 색상과 일치
    .style('stroke', customColor || ((d) => colorScale(d.x))) // 인라인 스타일로도 설정하여 CSS 우선순위 확보

  // 스타일 적용
  if (style.opacity !== undefined) {
    dotsUpdate.attr('opacity', style.opacity)
  }

  // 네온 효과 및 흐리기 효과 적용 함수
  const applyFilters = () => {
    const neonIntensity = style.neonIntensity || 0
    const blurAmount = style.blur || 0

    // SVG 유효성 검사
    if (!svg || svg.empty()) {
      console.warn('[ScatterChart] SVG가 유효하지 않습니다. 네온/흐리기 효과를 적용할 수 없습니다.')
      return
    }

    // dots를 다시 선택 (재렌더링 시 최신 요소를 가져오기 위해)
    const currentDots = chartGroup.selectAll('.scatter-dot')
    const dotsCount = currentDots.size()

    // 점이 없으면 조용히 반환 (데이터가 없거나 아직 렌더링되지 않은 경우)
    if (dotsCount === 0) {
      return
    }

    if (neonIntensity > 0 || blurAmount > 0) {
      // 먼저 모든 점의 기존 필터를 제거하여 깨끗한 상태로 시작
      currentDots.attr('filter', null)

      // 개별 점에 각 색상에 맞는 필터 적용
      currentDots.each(function () {
        const element = d3.select(this)
        const fillColor = element.attr('fill')

        // 색상을 hex 문자열로 변환하여 필터 ID 생성
        const colorObj = d3.color(fillColor)
        if (!colorObj) {
          console.warn(`[ScatterChart] 색상 파싱 실패: ${fillColor}`)
          return
        }
        const colorHex = colorObj.formatHex().replace('#', '')

        // 필터 ID 생성 (색상, 네온 강도, 흐리기 강도 포함)
        const blurSuffix = blurAmount > 0 ? `-blur-${String(blurAmount).replace('.', '_')}` : ''
        const filterId = `filter-${colorHex}-${String(neonIntensity).replace('.', '_')}${blurSuffix}-scatter`

        // 공통 필터 생성 함수 사용
        const filter = createElementFilter(svg, filterId, fillColor, neonIntensity, blurAmount, { chartType: 'scatter' })

        if (filter) {
          element.attr('filter', `url(#${filterId})`)
        } else {
          element.attr('filter', null)
        }
      })
    } else {
      // 효과가 없으면 모든 필터 제거
      currentDots.attr('filter', null)
    }
  }

  // 애니메이션 처리: 애니메이션이 있으면 완료 후 필터 적용, 없으면 즉시 적용
  // 스타일 변경 시에는 애니메이션을 건너뛰고 즉시 필터 적용
  const hasStyleEffects = (style.neonIntensity || 0) > 0 || (style.blur || 0) > 0
  const shouldAnimate = chartOptions.animation !== false && !hasStyleEffects

  if (shouldAnimate) {
    // 애니메이션 시작 전에 r을 0으로 설정 (필터 적용 전) - 새로 추가된 요소만
    dotsEnter.attr('r', 0)

    // 애니메이션 실행
    const duration = 800
    const maxDelay = (data.length - 1) * 50
    const totalAnimationTime = duration + maxDelay

    dotsEnter
      .transition()
      .duration(duration)
      .delay((d, i) => i * 50)
      .ease(d3.easeCubicOut)
      .attr('r', dotRadius)

    // 모든 애니메이션이 완료된 후 필터 적용 (필터 영역이 올바르게 계산되도록)
    setTimeout(() => {
      applyFilters()
    }, totalAnimationTime + 100) // 여유 시간 추가
  } else {
    // 애니메이션이 없거나 스타일 효과가 있으면 즉시 필터 적용
    // 스타일 변경 시에는 애니메이션 없이 바로 필터 적용
    if (hasStyleEffects) {
      // 스타일 효과가 있으면 애니메이션 없이 바로 필터 적용
      dotsUpdate.attr('r', dotRadius) // 크기를 먼저 설정
    }
    applyFilters()
  }

  // 인터랙션 옵션 확인
  const interactionConfig = {
    tooltip: chartOptions?.tooltip !== false,
    hover: chartOptions?.hover !== false,
    click: chartOptions?.click !== false,
    ...interaction,
  }

  // 호버 효과
  if (interactionConfig.hover !== false) {
    dotsUpdate
      .on('mouseenter', function (event, d) {
        const element = d3.select(this)
        // 호버 효과: opacity 1, 크기 증가, stroke 추가로 강조
        const originalOpacity = element.attr('opacity')
        element.attr('data-original-opacity', originalOpacity || '0.7')
        element.attr('opacity', 1)

        // 원래 크기 저장하고 약간 증가
        const originalR = element.attr('r') || '6'
        element.attr('data-original-r', originalR)
        const newR = parseFloat(originalR) * 1.3
        element.attr('r', newR)

        // stroke 추가 (시각적 강조)
        const originalStroke = element.attr('stroke')
        const originalStrokeWidth = element.attr('stroke-width')
        element.attr('data-original-stroke', originalStroke || 'none')
        element.attr('data-original-stroke-width', originalStrokeWidth || '0')

        if (!originalStroke || originalStroke === 'none') {
          const fillColor = element.attr('fill') || '#2196F3'
          const colorObj = d3.color(fillColor)
          const strokeColor = colorObj ? colorObj.darker(0.8).formatHex() : '#000000'
          element.attr('stroke', strokeColor).attr('stroke-width', 2)
        } else {
          const currentWidth = parseFloat(originalStrokeWidth) || 1
          element.attr('stroke-width', Math.max(2, currentWidth + 1))
        }

        // 툴팁 표시
        if (interactionConfig.tooltip !== false && tooltip) {
          const xAxisLabel = columns.find((col) => col.field === xField)?.label || xField
          let yAxisLabel = ''
          if (yField === '__count__') {
            yAxisLabel = '개수'
          } else {
            const yFieldColumn = columns.find((col) => col.field === yField)
            const aggregationLabel = aggregationOptions.find((opt) => opt.value === aggregation)?.label || ''
            yAxisLabel = yFieldColumn ? `${aggregationLabel} (${yFieldColumn.label})` : aggregationLabel
          }
          const tooltipContent = `
        <div style="font-weight: 600; margin-bottom: 4px;">${xAxisLabel}: ${d.x}</div>
        <div>${yAxisLabel}: ${d.y.toLocaleString('ko-KR')}</div>
        <div style="margin-top: 4px; font-size: 11px; opacity: 0.8;">레코드 수: ${d.count}개</div>
      `
          tooltip
            .html(tooltipContent)
            .style('display', 'block')
            .style('opacity', 1)
            .style('left', event.clientX + 10 + 'px')
            .style('top', event.clientY - 10 + 'px')
        }

        // 데이터 호버 콜백 (사이드바 네비게이션용)
        if (onDataHover) {
          const row = d.originalRows ? d.originalRows[0] : d.originalRow
          onDataHover({ ...d, originalRow: row }, event)
        }
      })
      .on('mouseleave', function () {
        const element = d3.select(this)
        // 호버 효과 제거: opacity, 크기, stroke 원래대로
        const originalOpacity = element.attr('data-original-opacity')
        if (originalOpacity) {
          element.attr('opacity', originalOpacity === '1' ? null : originalOpacity)
        } else {
          element.attr('opacity', 0.7)
        }

        const originalR = element.attr('data-original-r')
        if (originalR) {
          element.attr('r', originalR)
        }

        // stroke 원래대로 복원
        const originalStroke = element.attr('data-original-stroke')
        const originalStrokeWidth = element.attr('data-original-stroke-width')

        if (originalStroke === 'none' || !originalStroke) {
          element.attr('stroke', null).attr('stroke-width', null)
        } else {
          element.attr('stroke', originalStroke)
          if (originalStrokeWidth && originalStrokeWidth !== '0') {
            element.attr('stroke-width', originalStrokeWidth)
          } else {
            element.attr('stroke-width', null)
          }
        }

        // 저장된 데이터 속성 제거
        element.attr('data-original-opacity', null)
        element.attr('data-original-r', null)
        element.attr('data-original-stroke', null)
        element.attr('data-original-stroke-width', null)
        if (tooltip) {
          tooltip.style('opacity', 0).style('display', 'none')
        }
      })
      .on('mousemove', function (event) {
        // 툴팁 위치 업데이트
        if (interactionConfig.tooltip !== false && tooltip) {
          tooltip.style('left', event.clientX + 10 + 'px').style('top', event.clientY - 10 + 'px')
        }
      })
  }

  // 클릭 이벤트
  if (interactionConfig.click !== false) {
    dotsUpdate.on('click', function (event, d) {
      const row = d.originalRows ? d.originalRows[0] : d.originalRow
      if (onDataClick) {
        onDataClick({ ...d, originalRow: row })
      }
    })
  }

  // 공통 축 렌더링 (레이어 모드에서는 제외)
  if (showAxes) {
    renderAxes(finalXScale, finalYScale, chartWidth, chartHeight, xField, yField, columns, aggregation, aggregationOptions, chartGroup)
  }
}

// 공통 축 그리기
function renderAxes(xScale, yScale, chartWidth, chartHeight, xField, yField, columns, aggregation, aggregationOptions, chartGroup) {
  const xAxis = d3.axisBottom(xScale)
  const xAxisGroup = chartGroup.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${chartHeight})`).call(xAxis)

  xAxisGroup.select('path').remove()
  xAxisGroup.selectAll('line').remove()

  // X축 틱 라벨 회전 및 색상 설정 (CSS 변수 사용)
  const rootStyle = getComputedStyle(document.documentElement)
  const tickColorX = rootStyle.getPropertyValue('--chart-color-axis-tick-x').trim() || '#000000'
  xAxisGroup.selectAll('text').attr('transform', 'rotate(-45)').attr('dx', '-0.5em').attr('dy', '0.5em').attr('fill', tickColorX).style('fill', tickColorX)

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

  const yAxis = d3.axisLeft(yScale).tickSize(5)
  const yAxisGroup = chartGroup.append('g').attr('class', 'y-axis').call(yAxis)

  yAxisGroup.select('path').remove()

  // Y축 틱 라벨 색상 설정 (CSS 변수 사용)
  const tickColorY = rootStyle.getPropertyValue('--chart-color-axis-tick-y').trim() || '#000000'
  yAxisGroup.selectAll('text').attr('fill', tickColorY).style('fill', tickColorY)

  let yAxisLabel = ''
  if (yField === '__count__') {
    yAxisLabel = '개수'
  } else {
    const yFieldColumn = columns.find((col) => col.field === yField)
    const aggregationLabel = aggregationOptions.find((opt) => opt.value === aggregation)?.label || ''
    yAxisLabel = yFieldColumn ? `${aggregationLabel} (${yFieldColumn.label})` : `${aggregationLabel} (${yField})`
  }
  const yAxisLabelX = -chartHeight / 2
  const yAxisTickLabelWidth = 20
  const yAxisLabelY = -yAxisTickLabelWidth
  chartGroup.append('text').attr('class', 'axis-label y-axis-label').attr('x', yAxisLabelX).attr('y', yAxisLabelY).attr('transform', 'rotate(-90)').attr('fill', axisLabelColor).style('fill', axisLabelColor).text(yAxisLabel)
}
