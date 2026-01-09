<!--
  MultiChartContainer.vue
  복수 차트 레이어 컨테이너
  여러 차트를 겹쳐서 표시하며 공유 축을 사용합니다.
-->
<template>
  <div ref="chartContainerRef" class="multi-chart-container" :style="{ width: width + 'px', height: height + 'px' }">
    <div ref="chartSvgRef" class="chart-svg-container"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as d3 from 'd3'
import { createSharedXScale, createSharedYScale } from './utils/chartScales.js'
import { renderSharedAxes, renderGrid, renderLegend } from './utils/chartAxes.js'
import { createTooltip } from './utils/chartTooltip.js'
import { renderBackground } from './utils/chartBackground.js'
import { renderBarChart } from './bar/BarChart.js'
import { renderLineChart } from './line/LineChart.js'
import { renderAreaChart } from './area/AreaChart.js'
import { renderPieChart } from './pie/PieChart.js'
import { renderScatterChart } from './scatter/ScatterChart.js'
import { getChartMetadata } from './config/chartMetadata.js'

const props = defineProps({
  // 차트 레이어 설정 배열
  layers: {
    type: Array,
    required: true,
    default: () => [],
  },
  // 차트 크기
  width: {
    type: Number,
    default: 800,
  },
  height: {
    type: Number,
    default: 400,
  },
  // 마진 설정
  margin: {
    type: Object,
    default: () => ({
      top: 50,
      right: 40,
      bottom: 120,
      left: 40,
    }),
  },
  // 축 공유 여부
  sharedAxes: {
    type: Boolean,
    default: true,
  },
  // 배경 이미지 설정
  background: {
    type: Object,
    default: null,
  },
  // 컬럼 정의 (축 라벨용)
  columns: {
    type: Array,
    default: () => [],
  },
  // 집계 옵션
  aggregationOptions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['data-click', 'data-hover', 'layer-click'])

// Refs
const chartContainerRef = ref(null)
const chartSvgRef = ref(null)

// D3 객체
let svg = null
let chartGroup = null
let tooltip = null

// 차트 렌더링 함수
function renderChart() {
  if (!chartSvgRef.value || !props.layers || props.layers.length === 0) {
    if (chartSvgRef.value) {
      d3.select(chartSvgRef.value).selectAll('*').remove()
    }
    return
  }

  // 기존 SVG 제거
  d3.select(chartSvgRef.value).selectAll('*').remove()

  // 툴팁 생성
  if (!tooltip) {
    tooltip = createTooltip()
  }

  // 마진 설정
  const margin = props.margin || {
    top: 50,
    right: 40,
    bottom: 120,
    left: 40,
  }

  // 차트 그리기 영역 크기
  const chartWidth = Math.max(0, props.width - margin.left - margin.right)
  const chartHeight = Math.max(0, props.height - margin.top - margin.bottom)

  // SVG 생성
  // overflow, display는 CSS에서 관리 (_chart.scss)
  svg = d3.select(chartSvgRef.value).append('svg').attr('width', props.width).attr('height', props.height)

  // 메인 차트 그룹 생성
  chartGroup = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // 1. 배경 이미지 렌더링 (최우선)
  if (props.background?.image) {
    renderBackground({
      svg,
      chartWidth,
      chartHeight,
      background: props.background,
    })
  }

  // 2. 차트 그리기 영역 보더 (파이 차트만 있는 경우 제외)
  // 멀티 차트에서는 파이 차트가 포함되어 있어도 보더 표시
  const hasOnlyPieCharts = props.layers.length > 0 && props.layers.every((layer) => layer.type === 'pie')
  if (!hasOnlyPieCharts) {
    const borderStrokeWidth = 1
    const borderOffset = borderStrokeWidth - 6
    chartGroup
      .append('rect')
      .attr('class', 'chart-border')
      .attr('x', borderOffset)
      .attr('y', borderOffset)
      .attr('width', chartWidth - borderOffset * 2)
      .attr('height', chartHeight - borderOffset * 2)
      .attr('fill', 'none')
      .attr('pointer-events', 'none')
  }

  // 3. 공유 스케일 계산
  // 각 레이어가 독립적인 데이터 소스를 가질 수 있으므로, 모든 레이어 데이터를 통합하여 공유 스케일 생성
  // 단, 모든 레이어가 같은 X축 필드를 사용할 때만 공유 스케일 사용 (겹쳐서 표시)
  // 파이 차트는 스케일을 사용하지 않으므로 공유 스케일 계산에서 제외
  let sharedXScale = null
  let sharedYScale = null

  if (props.sharedAxes) {
    // 스케일을 사용하는 레이어만 필터링 (파이 차트 제외)
    const scaleLayers = props.layers.filter((layer) => layer.type !== 'pie' && layer.data && layer.data.length > 0)

    if (scaleLayers.length > 0) {
      // 모든 레이어의 X축 필드가 같은지 확인
      const firstLayerXField = scaleLayers[0].xField
      const allSameXField = scaleLayers.every((layer) => {
        const layerXField = layer.xField || null
        return layerXField === firstLayerXField
      })

      // X축 필드가 모두 같으면 공유 스케일 사용 (겹쳐서 표시)
      if (allSameXField) {
        const scaleData = scaleLayers.flatMap((layer) => layer.data || [])
        if (scaleData.length > 0) {
          sharedXScale = createSharedXScale(scaleData, chartWidth)
          sharedYScale = createSharedYScale(scaleData, chartHeight)
  }
      }
      // X축 필드가 다르면 공유 스케일을 사용하지 않음 (각 레이어가 독립적인 스케일 사용)
    }
  }

  // 4. 공유 축 렌더링 (한 번만, 별도 그룹으로 분리하여 필터 효과 제외)
  // 멀티 차트에서는 파이 차트만 있는 경우가 아니면 항상 축 표시
  const axesGroup = chartGroup.append('g').attr('class', 'shared-axes-group')
  if (!hasOnlyPieCharts && props.sharedAxes && sharedXScale && sharedYScale && props.layers.length > 0) {
    const firstLayer = props.layers[0]

    // 그리드 렌더링 (축보다 먼저 그려서 뒤에 위치)
    // 첫 번째 레이어의 옵션을 확인하여 그리드 표시 여부 결정
    const showGrid = firstLayer.options?.showGrid !== false
    if (showGrid) {
      renderGrid({
        yScale: sharedYScale,
        chartWidth,
        chartGroup: axesGroup,
        showGrid: true,
      })
    }

    renderSharedAxes({
      xScale: sharedXScale,
      yScale: sharedYScale,
      chartWidth,
      chartHeight,
      xField: firstLayer.xField || 'x',
      yField: firstLayer.yField || 'y',
      columns: props.columns || [],
      aggregation: firstLayer.aggregation || 'count',
      aggregationOptions: props.aggregationOptions || [],
      chartGroup: axesGroup, // 축은 별도 그룹에 렌더링
    })
  }

  // 5. 레이어를 z-index 순서로 정렬
  const sortedLayers = [...props.layers].sort((a, b) => (a.layerIndex || 0) - (b.layerIndex || 0))

  // 6. 각 레이어 렌더링
  sortedLayers.forEach((layer, index) => {
    renderChartLayer(layer, {
      svg,
      chartGroup,
      axesGroup, // 공유 축 그룹 전달
      chartWidth,
      chartHeight,
      sharedXScale,
      sharedYScale,
      tooltip,
      columns: props.columns || [],
      aggregationOptions: props.aggregationOptions || [],
      layerIndex: index,
    })
  })

  // 7. 범례 렌더링 (우측 아래)
  // 첫 번째 레이어의 옵션을 확인하여 범례 표시 여부 결정
  if (sortedLayers.length > 0) {
    const firstLayer = sortedLayers[0]
    const showLegend = firstLayer.options?.showLegend !== false

    if (showLegend) {
      // 모든 레이어를 범례에 포함 (막대/파이 차트는 무지개 그라데이션으로 표시)
      const legendItems = sortedLayers.map((layer) => {
        const metadata = getChartMetadata(layer.type)
        // 레이어별 색상 결정 (style.color > 기본 색상)
        // 막대/파이 차트는 무지개 그라데이션을 사용하므로 color는 무시됨
        const layerColor = layer.style?.color || metadata?.defaultStyle?.color || '#2196F3'
        return {
          label: metadata?.name || layer.type,
          color: layerColor,
          type: layer.type,
        }
      })

      // 범례 항목이 있으면 렌더링
      if (legendItems.length > 0) {
        renderLegend({
          legendItems,
          chartWidth,
          chartHeight,
          chartGroup,
          showLegend: true,
        })
      }
    }
  }
}

// 개별 차트 레이어 렌더링
function renderChartLayer(layer, config) {
  const { svg, chartGroup, chartWidth, chartHeight, sharedXScale, sharedYScale, tooltip, columns, aggregationOptions, layerIndex } = config

  if (!layer.data || layer.data.length === 0) {
    console.warn(`[MultiChartContainer] 레이어 ${layerIndex}에 데이터가 없습니다.`)
    return
  }

  // 레이어 그룹 생성
  const layerGroup = chartGroup.append('g').attr('class', 'chart-layer').attr('data-layer-index', layerIndex)

  // 스타일 적용 (레이어 그룹 전체 투명도만 적용)
  // 네온/흐리기 효과는 개별 차트 요소에 적용 (각 색상에 맞게)
  const style = layer.style || {}
  if (style.opacity !== undefined) {
    layerGroup.style('opacity', style.opacity)
  }

  // 차트 타입에 따라 렌더링 함수 호출
  const chartConfig = {
    data: layer.data,
    chartWidth,
    chartHeight,
    xField: layer.xField || 'x',
    yField: layer.yField || 'y',
    columns,
    chartOptions: layer.options || {},
    chartGroup: layerGroup,
    axesGroup: null, // 멀티 레이어에서는 축을 별도로 렌더링하지 않음 (공유 축 사용)
    svg, // areaChart 등에서 필요
    tooltip,
    aggregation: layer.aggregation || 'count',
    aggregationOptions,
    onDataClick: (data) => emit('data-click', { layer, data }),
    onDataHover: (data) => emit('data-hover', { layer, data }),
    // 레이어 모드 옵션
    xScale: sharedXScale, // 공유 스케일 사용
    yScale: sharedYScale, // 공유 스케일 사용
    showAxes: false, // 축은 공유 축으로 렌더링
    showLabels: layer.showLabels !== false, // 라벨 표시 여부
    interaction: layer.interaction || {}, // 인터랙션 옵션
    style, // 스타일 옵션
  }

  switch (layer.type) {
    case 'bar':
      renderBarChart(chartConfig)
      break
    case 'line':
      renderLineChart(chartConfig)
      break
    case 'area':
      renderAreaChart(chartConfig)
      break
    case 'pie':
      renderPieChart(chartConfig)
      break
    case 'scatter':
      renderScatterChart(chartConfig)
      break
    default:
      console.warn(`[MultiChartContainer] 알 수 없는 차트 타입: ${layer.type}`)
  }
}

// 데이터 변경 시 재렌더링
watch(
  () => [props.layers, props.width, props.height, props.margin, props.sharedAxes, props.background],
  () => {
    nextTick(() => renderChart())
  },
  { deep: true },
)

// 리사이즈 핸들러
let resizeObserver = null

function setupResizeObserver() {
  if (typeof ResizeObserver !== 'undefined' && chartContainerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      nextTick(() => {
        renderChart()
      })
    })
    resizeObserver.observe(chartContainerRef.value)
  }
}

// Lifecycle
onMounted(() => {
  setupResizeObserver()
  nextTick(() => {
    renderChart()
  })
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (svg) {
    svg.remove()
    svg = null
  }
  if (tooltip) {
    tooltip.remove()
    tooltip = null
  }
})
</script>

<style lang="scss" scoped>
.multi-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.chart-svg-container {
  width: 100%;
  height: 100%;
}
</style>
