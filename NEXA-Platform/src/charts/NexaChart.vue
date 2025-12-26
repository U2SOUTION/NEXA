<!-- eslint-disable vue/multi-word-component-names -->
<!--
  Chart.vue
  재사용 가능한 순수 차트 컴포넌트
  타입, 데이터, 옵션만 전달하면 렌더링됩니다.
-->
<template>
  <div ref="chartContainerRef" class="chart-wrapper">
    <div ref="chartSvgRef" class="chart-svg-container"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as d3 from 'd3'
import { renderBarChart } from './bar/BarChart.js'
import { renderLineChart } from './line/LineChart.js'
import { renderAreaChart } from './area/AreaChart.js'
import { renderPieChart } from './pie/PieChart.js'
import { renderScatterChart } from './scatter/ScatterChart.js'

const props = defineProps({
  // 차트 타입
  type: {
    type: String,
    required: true,
    validator: (value) => ['bar', 'line', 'area', 'pie', 'scatter'].includes(value),
  },
  // 차트 데이터 (처리된 데이터: [{ x, y, count, originalRows? }])
  data: {
    type: Array,
    required: true,
    default: () => [],
  },
  // 차트 크기 (선택적 - 없으면 컨테이너 크기 자동 사용)
  width: {
    type: Number,
    default: null,
  },
  height: {
    type: Number,
    default: null,
  },
  // 차트 옵션
  options: {
    type: Object,
    default: () => ({
      animation: true,
      showLabels: true,
    }),
  },
  // 축 설정
  xField: {
    type: String,
    default: 'x',
  },
  yField: {
    type: String,
    default: 'y',
  },
  columns: {
    type: Array,
    default: () => [],
  },
  aggregation: {
    type: String,
    default: 'count',
  },
  aggregationOptions: {
    type: Array,
    default: () => [],
  },
  // 마진 설정 (선택적)
  margin: {
    type: Object,
    default: () => ({
      top: 50,
      right: 40,
      bottom: 120,
      left: 40,
    }),
  },
  // 스타일 효과 (단일 차트용)
  style: {
    type: Object,
    default: () => ({}),
  },
  // 인터랙션 설정 (단일 차트용)
  interaction: {
    type: Object,
    default: () => ({}),
  },
  // 데이터 라벨 표시 여부
  showLabels: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['data-click', 'data-hover'])

// Refs
const chartContainerRef = ref(null)
const chartSvgRef = ref(null)

// 실제 사용할 차트 크기 (컨테이너 크기 또는 props)
const actualWidth = ref(800)
const actualHeight = ref(400)

// D3 객체
let svg = null
let chartGroup = null
let tooltip = null

// 렌더링 중 플래그 (무한 루프 방지)
let isRendering = false

// 컨테이너 크기 업데이트 함수
function updateChartSize() {
  if (!chartContainerRef.value) {
    return false
  }

  const containerWidth = chartContainerRef.value.clientWidth
  const containerHeight = chartContainerRef.value.clientHeight

  if (containerWidth <= 0 || containerHeight <= 0) {
    return false
  }

  // 최대 크기 제한 (무한 증가 방지)
  const MAX_WIDTH = 2000
  const MAX_HEIGHT = 2000

  const newWidth = Math.min(props.width ?? containerWidth, MAX_WIDTH)
  const newHeight = Math.min(props.height ?? containerHeight, MAX_HEIGHT)

  // 값이 실제로 변경되었을 때만 업데이트 (무한 루프 방지)
  if (actualWidth.value !== newWidth || actualHeight.value !== newHeight) {
    actualWidth.value = newWidth
    actualHeight.value = newHeight
    return true // 크기가 변경되었음을 반환
  }

  return false // 크기가 변경되지 않았음을 반환
}

// 차트 렌더링 함수
function renderChart() {
  // 이미 렌더링 중이면 중복 실행 방지
  if (isRendering) {
    return
  }

  isRendering = true

  try {
    if (!chartSvgRef.value || !props.data || props.data.length === 0) {
      // 데이터가 없으면 SVG만 제거
      if (chartSvgRef.value) {
        d3.select(chartSvgRef.value).selectAll('*').remove()
      }
      return
    }

    // 기존 SVG 제거
    d3.select(chartSvgRef.value).selectAll('*').remove()

    // 툴팁이 없으면 생성 (한 번만)
    // 단독 차트용 클래스 추가하여 CSS에서 별도 제어 가능하도록
    if (!tooltip) {
      tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'chart-tooltip chart-tooltip-single')
        // 기본 스타일은 CSS에서 관리, 동적으로 변경되는 속성만 인라인으로 설정
        .style('position', 'fixed')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('z-index', 10000)
        .style('display', 'none')
    }

    // 마진 설정
    const margin = props.margin || {
      top: 50,
      right: 40,
      bottom: 120,
      left: 40,
    }

    // 실제 크기 사용
    const chartWidth = Math.max(0, actualWidth.value - margin.left - margin.right)
    const chartHeight = Math.max(0, actualHeight.value - margin.top - margin.bottom)

    // SVG 생성
    // overflow, display는 CSS에서 관리 (_chart.scss)
    svg = d3.select(chartSvgRef.value).append('svg').attr('width', actualWidth.value).attr('height', actualHeight.value)

    // 차트 그룹 생성 (축 제외)
    chartGroup = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // 축 그룹 생성 (별도 그룹으로 분리하여 필터 효과 제외)
    const axesGroup = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`).attr('class', 'chart-axes-group')

    // 스타일 효과 적용 (단일 차트용 - 차트 데이터 요소에만 적용, 축 제외)
    const style = props.style || {}
    if (style.opacity !== undefined) {
      chartGroup.style('opacity', style.opacity)
    }

    // 차트 그리기 영역 보더 (파이 차트 제외)
    if (props.type !== 'pie') {
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

    // 차트 타입에 따라 렌더링 함수 호출
    const chartConfig = {
      data: props.data,
      chartWidth,
      chartHeight,
      xField: props.xField,
      yField: props.yField,
      columns: props.columns || [],
      chartOptions: props.options || {},
      chartGroup,
      axesGroup, // 축은 별도 그룹으로 전달
      svg,
      tooltip,
      aggregation: props.aggregation || 'count',
      aggregationOptions: props.aggregationOptions || [],
      onDataClick: (data) => emit('data-click', data),
      onDataHover: (data) => emit('data-hover', data),
      // 단일 차트용 스타일 및 인터랙션 옵션
      showAxes: true, // 단일 차트는 축 표시
      showLabels: props.showLabels,
      interaction: props.interaction,
      style: props.style,
    }

    switch (props.type) {
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
      // 알 수 없는 차트 타입
    }

    // 범례 렌더링 (우측 아래) - 단독 차트 모드에서는 범례 숨김
    // 멀티 차트 모드에서만 범례가 의미가 있으므로 단독 차트에서는 표시하지 않음
    // (단독 차트는 Chart.vue를 사용하지 않고 DataChartRenderer에서 직접 처리)
  } finally {
    // 렌더링 완료 후 플래그 해제 (동기적으로 해제하여 안정성 확보)
    isRendering = false
  }
}

// 데이터 변경 시 재렌더링
watch(
  () => [props.data, props.type, props.options, props.style, props.width, props.height],
  () => {
    nextTick(() => {
      // props.width/height가 변경되었을 때만 크기 업데이트
      if (props.width !== null || props.height !== null) {
        updateChartSize()
      }
      renderChart()
    })
  },
  { deep: true },
)

// 리사이즈 핸들러
let resizeObserver = null
let resizeTimer = null
let lastWidth = 0
let lastHeight = 0

function setupResizeObserver() {
  if (typeof ResizeObserver === 'undefined' || !chartContainerRef.value) {
    return
  }

  // 기존 옵저버가 있으면 제거
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (!entry?.contentRect) {
      return
    }

    const { width, height } = entry.contentRect

    // 유효한 크기인지 확인
    if (width <= 0 || height <= 0) {
      return
    }

    // 실제 크기 변경이 있었는지 먼저 확인 (불필요한 타이머 실행 방지)
    if (width === lastWidth && height === lastHeight) {
      return
    }

    // 크기 업데이트 (다음 debounce에서 사용)
    lastWidth = width
    lastHeight = height

    // debounce 적용 (무한 루프 방지)
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }

    resizeTimer = setTimeout(() => {
      // 실제 크기 변경이 있었는지 확인
      const hasSizeChanged = updateChartSize()
      if (hasSizeChanged) {
        // requestAnimationFrame으로 렌더링 최적화
        requestAnimationFrame(() => {
          nextTick(() => {
            renderChart()
          })
        })
      }
      resizeTimer = null
    }, 100) // 100ms debounce
  })

  resizeObserver.observe(chartContainerRef.value)
}

// Lifecycle
onMounted(() => {
  nextTick(() => {
    updateChartSize()
    setupResizeObserver()
    renderChart()
  })
})

onUnmounted(() => {
  // 타이머 정리
  if (resizeTimer) {
    clearTimeout(resizeTimer)
    resizeTimer = null
  }

  // ResizeObserver 정리
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  // D3 객체 정리
  if (svg) {
    svg.remove()
    svg = null
  }
  if (tooltip) {
    tooltip.remove()
    tooltip = null
  }

  // 플래그 및 변수 초기화
  isRendering = false
  lastWidth = 0
  lastHeight = 0
})
</script>

<style lang="scss" scoped>
@import '../renderers/DataChartRenderer.scss';

.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.chart-svg-container {
  width: 100%;
  height: 100%;
}
</style>
