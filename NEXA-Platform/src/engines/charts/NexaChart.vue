<!-- eslint-disable vue/multi-word-component-names -->
<!--
  Chart.vue
  재사용 가능한 순수 차트 컴포넌트
  타입, 데이터, 옵션만 전달하면 렌더링됩니다.
-->
<template>
  <div ref="chartContainerRef" class="chart-wrapper">
    <!-- 헤더 (타이틀 및 보조 정보/액션) -->
    <div v-if="title" class="chart-header">
      <div class="chart-header-title">
        <q-icon v-if="titleIcon" :name="titleIcon" class="chart-title-icon" />
        <span class="chart-title-text">{{ title }}</span>
      </div>
      <div class="chart-header-actions">
        <slot name="title-right" :isRefreshing="isRefreshing" :handleRefresh="handleRefresh" />
      </div>
    </div>
    <div ref="chartSvgRef" class="chart-svg-container"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as d3 from 'd3'
import { renderBarChart } from './bar/BarChart'
import { renderLineChart } from './line/LineChart'
import { renderAreaChart } from './area/AreaChart'
import { renderPieChart } from './pie/PieChart'
import { renderScatterChart } from './scatter/ScatterChart'

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
  // 차트 타이틀 (선택적)
  title: {
    type: String,
    default: null,
  },
  // 타이틀 아이콘 (선택적)
  titleIcon: {
    type: String,
    default: null,
  },
  // 새로고침 콜백 함수 (선택적)
  onRefresh: {
    type: Function,
    default: null,
  },
})

const emit = defineEmits(['data-click', 'data-hover'])

// ============================================
// 차트 액션 기능 (기본 기능: 새로고침)
// ============================================
/**
 * 차트 액션 기능 확장 계획
 *
 * 이 섹션은 NexaChart의 기본 액션 기능들을 관리합니다.
 * 현재는 새로고침 기능을 기본으로 제공하며, 향후 다양한 액션 기능을 추가할 수 있는 구조입니다.
 *
 * 향후 확장 가능한 기능 예시:
 *
 * 1. 필터링 기능
 *    - onFilter: Function - 필터링 콜백
 *    - isFiltering: ref(false) - 필터링 상태
 *    - handleFilter: Function - 필터링 처리
 *    - Slot Props: { isFiltering, handleFilter, filterOptions }
 *
 * 2. 내보내기 기능
 *    - onExport: Function - 내보내기 콜백
 *    - isExporting: ref(false) - 내보내기 상태
 *    - handleExport: Function - 내보내기 처리
 *    - exportFormats: ['png', 'svg', 'csv'] - 지원 형식
 *    - Slot Props: { isExporting, handleExport, exportFormats }
 *
 * 3. 설정 기능
 *    - onSettings: Function - 설정 콜백
 *    - isSettingsOpen: ref(false) - 설정 넥셋 상태
 *    - handleSettings: Function - 설정 처리
 *    - settingsOptions: Object - 설정 옵션
 *    - Slot Props: { isSettingsOpen, handleSettings, settingsOptions }
 *
 * 4. 줌 기능
 *    - onZoom: Function - 줌 콜백
 *    - zoomLevel: ref(1) - 현재 줌 레벨
 *    - handleZoomIn/Out: Function - 줌 인/아웃 처리
 *    - Slot Props: { zoomLevel, handleZoomIn, handleZoomOut, canZoomIn, canZoomOut }
 *
 * 5. 데이터 상세 기능
 *    - onDataDetail: Function - 데이터 상세 콜백
 *    - selectedData: ref(null) - 선택된 데이터
 *    - handleDataClick: Function - 데이터 클릭 처리
 *    - Slot Props: { selectedData, handleDataClick }
 *
 * 확장 방법:
 * - 각 기능별로 독립적인 prop, ref, 함수 추가
 * - Slot Props에 새로운 상태/함수 포함
 * - title-right slot을 통해 부모 컴포넌트에서 유연하게 사용
 * - 기능 간 독립성 유지 (필요한 기능만 사용)
 */

// 새로고침 상태
const isRefreshing = ref(false)

// 새로고침 처리 함수
function handleRefresh() {
  if (isRefreshing.value || !props.onRefresh) return

  isRefreshing.value = true
  props.onRefresh()

  // 차트 재렌더링을 통해 애니메이션 재생
  // nextTick을 사용하여 데이터 업데이트를 기다린 후 차트 재렌더링
  nextTick(() => {
    // 약간의 지연을 두어 데이터 업데이트 완료 보장
    setTimeout(() => {
      renderChart()
    }, 50)
  })

  // 0.6초 후 로딩 상태 해제 (애니메이션 피드백)
  setTimeout(() => {
    isRefreshing.value = false
  }, 600)
}

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

// 툴팁 고유 ID (인스턴스별 고유 툴팁 관리)
const tooltipId = `nexa-chart-tooltip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

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

    // 툴팁이 없으면 생성 (인스턴스별 고유 툴팁)
    // 단독 차트용 클래스 추가하여 CSS에서 별도 제어 가능하도록
    if (!tooltip) {
      // 기존 툴팁이 있으면 제거 (안전장치 - 동일 인스턴스 재생성 시)
      const existingTooltip = d3.select(`[data-chart-tooltip-id="${tooltipId}"]`)
      if (!existingTooltip.empty()) {
        existingTooltip.remove()
      }

      tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'chart-tooltip chart-tooltip-single')
        .attr('data-chart-tooltip-id', tooltipId) // 고유 ID 추가
        // 기본 스타일은 CSS에서 관리, 동적으로 변경되는 속성만 인라인으로 설정
        .style('position', 'fixed')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('z-index', 10000)
        .style('display', 'none')
    }

    // 마진 설정 (기본값: 타이틀 없을 때는 top: 50)
    const margin = props.margin
      ? { ...props.margin }
      : {
          top: 20,
          right: 20,
          bottom: 20,
          left: 40,
        }

    // 타이틀이 있으면 타이틀 높이만큼만 top 마진 설정 (겹침 방지, 최소 간격)
    if (props.title) {
      // 타이틀 높이 계산: font-size (1.25rem ≈ 20px) + line-height + 여유 공간
      // 실제 측정값: 약 14px (아이콘 포함, 최소 간격)
      margin.top = 14
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

// 데이터 변경 시 재렌더링 (참조만 감시 - 성능 최적화)
watch(
  () => props.data,
  () => {
    nextTick(() => {
      renderChart()
    })
  },
)

// 다른 props 변경 시 재렌더링 (deep 감시 유지)
watch(
  () => [props.type, props.options, props.style, props.width, props.height],
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
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
  line-height: 1;
}

.chart-header-title {
  display: flex;
  align-items: center;
}

.chart-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-title-icon {
  margin-right: 0.5rem;
}

.chart-title-text {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--nexa-text-primary);
  line-height: 1;
  margin: 0;
  padding: 0;
}

.chart-svg-container {
  width: 100%;
  flex: 1;
  margin: 0;
  padding: 0;
}
</style>
