<!-- ChartSample.vue
  차트 샘플
  아코디언 화살표 가려짐 테스트용
  PartsManagementDashboard.vue의 차트 구현 패턴을 참고하여 NexaChart 컴포넌트 사용
-->
<template>
  <div class="chart-sample">
    <div class="text-subtitle2 q-mb-sm">막대 그래프 테스트 (가로 확장 방지)</div>
    <div class="chart-container">
      <div ref="chartContainerRef" class="chart-responsive-wrapper">
        <ChartComponent v-if="chartData && chartData.length > 0" type="bar" :data="chartData" :width="chartWidth" :height="chartHeight" :options="chartOptions" :style="chartStyle" :interaction="chartInteraction" :margin="chartMargin" :show-labels="true" />
        <div v-else class="text-caption text-grey-6">데이터를 불러오는 중...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import ChartComponent from 'src/charts/NexaChart.vue'

// 차트 컨테이너 ref
const chartContainerRef = ref(null)
const chartWidth = ref(800)
const chartHeight = ref(300)

// 샘플 데이터
const chartData = ref([
  { x: '항목 1', y: 30, count: 30 },
  { x: '항목 2', y: 45, count: 45 },
  { x: '항목 3', y: 25, count: 25 },
  { x: '항목 4', y: 60, count: 60 },
  { x: '매우 긴 항목 이름: 이 항목은 가로로 매우 길게 확장될 수 있어서 아코디언 화살표를 가릴 수 있습니다', y: 40, count: 40 },
])

// 차트 옵션
const chartOptions = {
  animation: true,
  showLabels: true,
  showGrid: true,
  tooltip: true,
  hover: true,
  click: true,
}

// 차트 스타일 (CSS 변수에서 색상 읽어오기)
const getChartColor = () => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue('--nexa-chart-color-1').trim() || '#0076fd'
  }
  return '#0076fd'
}

const chartStyle = {
  color: getChartColor(), // 테마 변수에서 색상 읽어오기
  strokeWidth: 2,
  nodeSize: 6,
  neonIntensity: 0.3,
  blur: 2,
  animation: {
    duration: 1000,
  },
}

// 차트 인터랙션 설정
const chartInteraction = {
  tooltip: true,
  hover: true,
  click: true,
}

// 차트 마진 설정
const chartMargin = {
  top: 20,
  right: 20,
  bottom: 60, // 긴 라벨을 위한 여유 공간
  left: 40,
}

// 반응형 크기 계산 함수
// CSS에서 설정한 컨테이너 크기를 읽어서 차트 컴포넌트에 전달
function updateChartSize() {
  if (chartContainerRef.value) {
    const containerWidth = chartContainerRef.value.clientWidth
    const containerHeight = chartContainerRef.value.clientHeight
    chartWidth.value = containerWidth
    chartHeight.value = containerHeight
  }
}

let resizeObserver = null

onMounted(() => {
  nextTick(() => {
    updateChartSize()
    if (typeof ResizeObserver !== 'undefined' && chartContainerRef.value) {
      resizeObserver = new ResizeObserver(() => updateChartSize())
      resizeObserver.observe(chartContainerRef.value)
    }
    window.addEventListener('resize', updateChartSize)
  })
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  window.removeEventListener('resize', updateChartSize)
})
</script>

<style lang="scss" scoped>
.chart-sample {
  width: 100%;
  overflow: hidden;
  min-width: 0;

  .chart-container {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .chart-responsive-wrapper {
    width: 100%;
    height: 300px;
    min-height: 300px;
    position: relative;
    // 차트 크기는 CSS에서 단일 소스로 관리
    // JavaScript는 이 컨테이너의 실제 크기를 읽어서 차트 컴포넌트에 전달
  }
}
</style>
