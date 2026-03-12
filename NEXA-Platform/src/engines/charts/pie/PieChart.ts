// @ts-nocheck — strict 타입은 추후 엔진 재작성 시 적용
/**
 * pieChart.js
 * 파이 차트 렌더링 함수
 */
import * as d3 from 'd3'
import { createElementFilter } from '../utils/chartFilters'

export function renderPieChart({
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
  showAxes = true, // 파이 차트는 축 없음 (향후 사용 예정)
  showLabels = true, // 데이터 라벨 표시 여부 (향후 사용 예정)
  interaction = {}, // 인터랙션 옵션 (향후 사용 예정)
  style = {}, // 스타일 옵션
}) {
  // 향후 구현 예정 파라미터
  void showAxes
  void showLabels
  if (!data || data.length === 0) {
    console.warn('[PieChart] 렌더링할 데이터가 없습니다.')
    return
  }

  const radius = Math.min(chartWidth, chartHeight) / 2 - 20

  const pie = d3
    .pie()
    .value((d) => d.y)
    .sort(null)

  const arc = d3.arc().innerRadius(0).outerRadius(radius)

  const labelArc = d3
    .arc()
    .innerRadius(radius * 0.7)
    .outerRadius(radius * 0.7)

  const colorScale = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.x))
    .range(d3.schemeCategory10)

  const g = chartGroup.append('g').attr('transform', `translate(${chartWidth / 2},${chartHeight / 2})`)

  const arcs = g.selectAll('.arc').data(pie(data)).enter().append('g').attr('class', 'arc')

  // CSS 변수에서 stroke 색상과 두께 읽기
  const rootStyle = getComputedStyle(document.documentElement)
  const pieStrokeColor = rootStyle.getPropertyValue('--chart-color-pie-stroke').trim() || '#ffffff'
  const pieStrokeWidth = rootStyle.getPropertyValue('--chart-stroke-width-pie-default').trim() || '2'

  const paths = arcs
    .append('path')
    .attr('class', 'pie-segment')
    .attr('d', arc)
    .attr('fill', (d) => colorScale(d.data.x))
    // stroke는 CSS 변수에서 읽어서 attr와 style 둘 다 설정 (라인 차트와 동일한 패턴)
    .attr('stroke', pieStrokeColor)
    .style('stroke', pieStrokeColor)
    .attr('stroke-width', pieStrokeWidth)
    .style('stroke-width', `${pieStrokeWidth}px`)
    // cursor는 CSS에서 관리하되, SVG 요소 특성상 style로도 설정
    .style('cursor', 'var(--chart-cursor-hover, move)')

  // 외부 라벨용 별도 그룹 생성 (조각들 위에 렌더링되도록)
  // 라벨이 다른 요소에 가려지지 않도록 마지막에 추가하여 최상위에 렌더링
  const labelGroup = g.append('g').attr('class', 'pie-label-group').style('pointer-events', 'none')

  // 스타일 적용
  if (style.opacity !== undefined) {
    paths.attr('opacity', style.opacity)
  }

  // 네온 효과 및 흐리기 효과 적용
  const neonIntensity = style.neonIntensity || 0
  const blurAmount = style.blur || 0

  if ((neonIntensity > 0 || blurAmount > 0) && svg) {
    // 먼저 모든 조각의 기존 필터를 제거하여 깨끗한 상태로 시작
    paths.attr('filter', null)

    // 개별 조각에 각 색상에 맞는 필터 적용
    paths.each(function () {
      const element = d3.select(this)
      const fillColor = element.attr('fill')

      // 색상을 hex 문자열로 변환하여 필터 ID 생성
      const colorObj = d3.color(fillColor)
      if (!colorObj) {
        console.warn(`[PieChart] 색상 파싱 실패: ${fillColor}`)
        return
      }
      const colorHex = colorObj.formatHex().replace('#', '')

      // 필터 ID 생성 (색상, 네온 강도, 흐리기 강도 포함)
      const blurSuffix = blurAmount > 0 ? `-blur-${String(blurAmount).replace('.', '_')}` : ''
      const filterId = `filter-${colorHex}-${String(neonIntensity).replace('.', '_')}${blurSuffix}-pie`

      // 공통 필터 생성 함수 사용
      const filter = createElementFilter(svg, filterId, fillColor, neonIntensity, blurAmount, { chartType: 'pie' })

      if (filter) {
        element.attr('filter', `url(#${filterId})`)
      } else {
        element.attr('filter', null)
      }
    })
  } else {
    // 효과가 없으면 모든 필터 제거
    paths.attr('filter', null)
  }

  if (chartOptions.animation !== false) {
    paths.each(function (d) {
      const currentArc = d3.select(this)
      const currentAngle = d.startAngle
      const interpolate = d3.interpolate(currentAngle, d.endAngle)
      currentArc
        .attr('d', () => arc({ ...d, endAngle: currentAngle }))
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attrTween('d', function () {
          return (t) => {
            d.endAngle = interpolate(t)
            return arc(d)
          }
        })
    })
  }

  if (chartOptions.showLabels !== false) {
    // 작은 조각들을 먼저 수집하여 오프셋 적용
    const smallSegments = []
    const largeSegments = []

    arcs.each(function (d) {
      const percent = ((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100
      const midAngle = (d.startAngle + d.endAngle) / 2

      if (percent > 5) {
        largeSegments.push({ d, percent, midAngle, arcGroup: d3.select(this) })
      } else {
        smallSegments.push({ d, percent, midAngle, arcGroup: d3.select(this) })
      }
    })

    // 큰 조각: 내부 라벨 렌더링
    largeSegments.forEach(({ d, percent, arcGroup }) => {
      const labelText = arcGroup
        .append('text')
        .attr('transform', `translate(${labelArc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('class', 'pie-label-internal')
        .style('font-size', '11px') // CSS 스타일로 설정 (SVG 속성보다 우선순위 높음)
        .style('font-weight', '500')

      labelText.append('tspan').attr('x', 0).attr('dy', '0em').text(d.data.x)

      labelText
        .append('tspan')
        .attr('x', 0)
        .attr('dy', '1.2em')
        .attr('opacity', 0.8)
        .style('font-size', '0.9em') // 두 번째 줄은 0.9em
        .text(`${percent.toFixed(1)}%`)
    })

    // 작은 조각 라벨은 모든 요소 렌더링 후 마지막에 추가하여 최상위에 표시

    // 작은 조각: 각도 순으로 정렬 후 오프셋 적용하여 외부 라벨 렌더링
    if (smallSegments.length > 0) {
      smallSegments.sort((a, b) => a.midAngle - b.midAngle)

      // 작은 조각에 마우스 오버 이벤트 추가
      smallSegments.forEach(({ d, arcGroup }) => {
        const path = arcGroup.select('path')
        // cursor는 CSS에서 관리 (_chart.scss)
        path
          .on('mouseenter', function () {
            // 해당 라벨 표시
            labelGroup.selectAll(`text[data-label-id="${d.data.x}"]`).style('opacity', '1').style('visibility', 'visible')
          })
          .on('mouseleave', function () {
            // 해당 라벨 숨김
            labelGroup.selectAll(`text[data-label-id="${d.data.x}"]`).style('opacity', '0').style('visibility', 'hidden')
          })
      })

      // 라벨 반지름: 차트 영역 내에 들어오도록 조정
      // 라벨 너비를 고려하여 여유 공간 확보 (약 80px)
      const labelMargin = 80
      const maxLabelRadius = Math.min(chartWidth, chartHeight) * 0.45 - labelMargin / 2
      const labelRadius = Math.min(radius + 20, maxLabelRadius)
      const labelHeight = 18 // 라벨 높이 (글자 높이 + 여백)
      const angleOffset = Math.PI / 60 // 약 3도씩 각도 오프셋

      smallSegments.forEach(({ d, percent }, index) => {
        // 작은 조각의 라벨을 12시 방향(위쪽)으로 배치
        // 12시 방향은 -90도 (또는 270도)
        const topAngle = -Math.PI / 2 // 12시 방향 (위쪽)

        // 각도 오프셋 적용 (인덱스에 따라 약간씩 틀기)
        const adjustedAngle = topAngle + angleOffset * (index - (smallSegments.length - 1) / 2)

        // 수직 오프셋 적용 (각도 방향에 수직으로)
        const verticalOffset = (index - (smallSegments.length - 1) / 2) * labelHeight
        const perpendicularAngle = adjustedAngle + Math.PI / 2

        // 조정된 위치 계산 (12시 방향 기준)
        const baseX = Math.cos(adjustedAngle) * labelRadius
        const baseY = Math.sin(adjustedAngle) * labelRadius
        let labelX = baseX + Math.cos(perpendicularAngle) * verticalOffset
        let labelY = baseY + Math.sin(perpendicularAngle) * verticalOffset

        // 차트 영역 경계 체크 및 조정
        const centerX = chartWidth / 2
        const centerY = chartHeight / 2
        const absoluteX = centerX + labelX
        const absoluteY = centerY + labelY
        const labelWidth = 70 // 예상 라벨 너비
        const labelHeightPx = 30 // 예상 라벨 높이

        // 위쪽 경계 체크 및 조정 (12시 방향이므로 위쪽 여유 공간 확보)
        if (absoluteY - labelHeightPx / 2 < 20) {
          const overflow = Math.abs(absoluteY - labelHeightPx / 2 - 20)
          labelY += overflow
        }
        // 오른쪽 경계 체크 및 조정
        if (absoluteX + labelWidth / 2 > chartWidth - 10) {
          const overflow = absoluteX + labelWidth / 2 - (chartWidth - 10)
          labelX -= overflow
        }
        // 왼쪽 경계 체크 및 조정
        if (absoluteX - labelWidth / 2 < 10) {
          const overflow = Math.abs(absoluteX - labelWidth / 2 - 10)
          labelX += overflow
        }
        // 아래쪽 경계 체크 (12시 방향이므로 일반적으로 문제 없음)
        if (absoluteY + labelHeightPx / 2 > chartHeight - 10) {
          const overflow = absoluteY + labelHeightPx / 2 - (chartHeight - 10)
          labelY -= overflow
        }

        // 외부 라벨 렌더링 (라인 없이 라벨만)
        // 박스 중앙 계산 (디버깅 박스 제거 후에도 위치 유지)
        const boxX = labelX - 5
        const boxWidth = 70
        const boxCenterX = boxX + boxWidth / 2 // 박스 중앙 X 좌표

        const labelText = labelGroup
      .append('text')
          .attr('transform', `translate(${boxCenterX},${labelY})`) // 박스 중앙에 맞춤
          .attr('text-anchor', 'middle') // 12시 방향이므로 중앙 정렬
          .attr('class', 'pie-label-external')
          .attr('data-label-id', d.data.x) // 라벨 식별자 추가
          .attr('dy', '0.35em') // 수직 정렬 보정
          .attr('fill', '#000000') // 명시적으로 검은색 설정
          .style('font-size', '11px') // CSS 스타일로 설정 (SVG 속성보다 우선순위 높음)
          .style('font-weight', '500')
          .style('fill', '#000000') // 인라인 스타일로도 설정하여 CSS 우선순위 확보
          .style('text-anchor', 'middle') // 스타일로도 명시
          .style('opacity', '0') // 기본적으로 숨김
          .style('visibility', 'hidden') // 기본적으로 숨김
          .style('pointer-events', 'none') // 마우스 이벤트 무시
          .style('z-index', '9999') // z-index 설정

        // 첫 번째 줄: 타이틀 (중앙 정렬)
        labelText.append('tspan').attr('x', 0).attr('dy', '0em').attr('text-anchor', 'middle').attr('fill', '#000000').style('fill', '#000000').style('text-anchor', 'middle').text(d.data.x)

        // 두 번째 줄: 퍼센트 (타이틀과 중앙 정렬)
        labelText
          .append('tspan')
          .attr('x', 0) // 중앙 정렬을 위해 x를 0으로 명시
          .attr('dy', '1.2em')
          .attr('text-anchor', 'middle') // 중앙 정렬 명시
          .attr('opacity', 0.8)
          .attr('fill', '#000000')
          .style('font-size', '0.9em') // 두 번째 줄은 0.9em
          .style('fill', '#000000')
          .style('text-anchor', 'middle') // 스타일로도 명시
          .text(`${percent.toFixed(1)}%`)
      })
    }
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
  paths
    .on('mouseenter', function (event, d) {
        const element = d3.select(this)
        // 호버 효과: opacity 1, stroke 두께 증가로 강조, 약간 확대
        const originalOpacity = element.attr('opacity')
        element.attr('data-original-opacity', originalOpacity || '0.8')
        element.attr('opacity', 1)

        // stroke 두께 증가 (CSS 변수에서 기본값 읽기)
        const currentStrokeWidth = element.attr('stroke-width') || pieStrokeWidth
        element.attr('data-original-stroke-width', currentStrokeWidth)
        const newStrokeWidth = Math.max(3, parseFloat(currentStrokeWidth) + 1)
        element.attr('stroke-width', newStrokeWidth)

        // 파이 차트 조각 약간 확대 (transform scale 사용)
        const originalTransform = element.attr('transform') || ''
        element.attr('data-original-transform', originalTransform)
        // 현재 transform에 scale 추가 (중앙 기준 확대)
        const scale = 1.1
        // transform에서 translate 추출 (이미 있는 경우)
        const translateMatch = originalTransform.match(/translate\(([^)]+)\)/)
        if (translateMatch) {
          element.attr('transform', `${translateMatch[0]} scale(${scale})`)
        } else {
          // transform이 없으면 기본 위치에서 확대 (중앙 기준)
          element.attr('transform', `scale(${scale})`)
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
      const percent = ((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100
      const tooltipContent = `
        <div style="font-weight: 600; margin-bottom: 4px;">${xAxisLabel}: ${d.data.x}</div>
        <div>${yAxisLabel}: ${d.data.y.toLocaleString('ko-KR')}</div>
        <div>비율: ${percent.toFixed(1)}%</div>
        <div style="margin-top: 4px; font-size: 11px; opacity: 0.8;">레코드 수: ${d.data.count}개</div>
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
        const row = d.data.originalRows ? d.data.originalRows[0] : d.data.originalRow
        onDataHover({ ...d.data, originalRow: row }, event)
      }
    })
    .on('mouseleave', function () {
        const element = d3.select(this)
        // 호버 효과 제거: opacity와 stroke-width, transform 원래대로
        const originalOpacity = element.attr('data-original-opacity')
        if (originalOpacity) {
          element.attr('opacity', originalOpacity === '1' ? null : originalOpacity)
        } else {
          element.attr('opacity', null)
        }

        const originalStrokeWidth = element.attr('data-original-stroke-width')
        if (originalStrokeWidth) {
          element.attr('stroke-width', originalStrokeWidth)
        }

        // transform 원래대로 복원
        const originalTransform = element.attr('data-original-transform')
        if (originalTransform !== undefined) {
          element.attr('transform', originalTransform || null)
        }

        // 저장된 데이터 속성 제거
        element.attr('data-original-opacity', null)
        element.attr('data-original-stroke-width', null)
        element.attr('data-original-transform', null)
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
    paths.on('click', function (event, d) {
      const row = d.data.originalRows ? d.data.originalRows[0] : d.data.originalRow
      if (onDataClick) {
        onDataClick({ ...d.data, originalRow: row })
      }
    })
  }
}
