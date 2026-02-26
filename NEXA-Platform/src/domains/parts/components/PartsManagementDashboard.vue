<!-- PartsManagementDashboard.vue
  부품 관리 메인 대시보드
-->
<template>
  <div class="parts-management-dashboard">
    <div class="q-pa-lg">
      <div class="row items-center dashboard-title">LOGISTICS MANAGEMENT DASHBOARD</div>

      <!-- 통계 카드 -->
      <!-- 첫 번째 줄: 3개 -->
      <div class="stat-cards-container">
        <q-card class="stat-card">
          <q-card-section>
            <div class="text-h6 text-grey-7 q-mb-xs">총 부품 분류</div>
            <div class="text-h3 text-primary">{{ stats.totalClasses }}</div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card">
          <q-card-section>
            <div class="text-h6 text-grey-7 q-mb-xs">총 부품 유형</div>
            <div class="text-h3 text-primary">{{ stats.totalTypes }}</div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card">
          <q-card-section>
            <div class="text-h6 text-grey-7 q-mb-xs">총 개별 부품</div>
            <div class="text-h3 text-primary">{{ stats.totalParts }}</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 두 번째 줄: 1개 -->
      <div class="stat-card-single-container">
        <q-card class="stat-card">
          <q-card-section>
            <div class="text-h6 text-grey-7 q-mb-xs">등록된 공간</div>
            <div class="text-h3 text-primary">{{ stats.totalSpaces }}</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 빠른 접근 -->
      <div class="quick-access-cards-container">
        <q-card class="stat-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">빠른 접근</div>
            <div class="row q-gutter-sm">
              <q-btn flat color="primary" icon="warehouse" label="물리 공간" @click="goToPhysicalSpace" class="col-12 col-md-6" />
              <q-btn flat color="primary" icon="category" label="부품 데이터" @click="goToPartsData" class="col-12 col-md-6" />
            </div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">부품 관리</div>
            <div class="row q-gutter-sm">
              <q-btn flat color="primary" icon="category" label="부품 분류" @click="goToPartClasses" class="col-12 col-md-4" />
              <q-btn flat color="primary" icon="inventory" label="부품 유형" @click="goToPartTypes" class="col-12 col-md-4" />
              <q-btn flat color="primary" icon="description" label="개별 부품" @click="goToPartSpecs" class="col-12 col-md-4" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 통계 차트 -->
      <div class="chart-container">
        <div ref="chartContainerRef" class="chart-responsive-wrapper">
          <ChartComponent v-if="chartData && chartData.length > 0" type="line" :data="chartData" :width="chartWidth" :height="chartHeight" :options="chartOptions" :style="chartStyle" :interaction="chartInteraction" :margin="chartMargin" :show-labels="true" />
          <div v-else class="text-caption text-grey-6">데이터를 불러오는 중...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { usePartsManagementStore } from '@system/store/partsManagementStore'
import { usePartsDataStore } from '@system/store/partsDataStore'
import ChartComponent from '@engines/charts/NexaChart.vue'

const partsManagementStore = usePartsManagementStore()
const partsDataStore = usePartsDataStore()

// 통계 데이터
const stats = ref({
  totalClasses: 0,
  totalTypes: 0,
  totalParts: 0,
  totalSpaces: 0,
})

// 차트 컨테이너 ref
const chartContainerRef = ref(null)
const chartWidth = ref(800)
const chartHeight = ref(400)

// 차트 데이터 (현재 통계 숫자 사용)
const chartData = computed(() => {
  if (stats.value.totalClasses === 0 && stats.value.totalTypes === 0 && stats.value.totalParts === 0 && stats.value.totalSpaces === 0) {
    return []
  }

  return [
    { x: '부품 분류', y: stats.value.totalClasses, count: stats.value.totalClasses },
    { x: '부품 유형', y: stats.value.totalTypes, count: stats.value.totalTypes },
    { x: '개별 부품', y: stats.value.totalParts, count: stats.value.totalParts },
    { x: '등록된 공간', y: stats.value.totalSpaces, count: stats.value.totalSpaces },
  ]
})

// 차트 옵션
const chartOptions = {
  animation: true,
  showLabels: true,
  showGrid: true,
  tooltip: true,
  hover: true,
  click: true,
}

// 차트 스타일
const chartStyle = {
  color: '#2196F3',
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
  top: 0,
  right: 5,
  bottom: 0,
  left: 5,
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

// 통계 데이터 로드
async function loadStats() {
  try {
    await Promise.all([partsDataStore.fetchPartClasses(), partsDataStore.fetchPartModels(), partsDataStore.fetchPartSpecs()])

    stats.value = {
      totalClasses: partsDataStore.partClasses.length,
      totalTypes: partsDataStore.partModels.length,
      totalParts: partsDataStore.partSpecs.length,
      totalSpaces: partsManagementStore.getRootNodes.length,
    }
  } catch (error) {
    console.error('통계 데이터 로드 실패:', error)
  }
}

// 네비게이션 함수들
function goToPhysicalSpace() {
  partsManagementStore.setSidebarMode('physical')
}

function goToPartsData() {
  partsManagementStore.setSidebarMode('parts-data')
}

function goToPartClasses() {
  partsManagementStore.setSidebarMode('parts-data')
  partsManagementStore.setSelectedPartsDataView('part-classes')
}

function goToPartTypes() {
  partsManagementStore.setSidebarMode('parts-data')
  partsManagementStore.setSelectedPartsDataView('part-models')
}

function goToPartSpecs() {
  partsManagementStore.setSidebarMode('parts-data')
  partsManagementStore.setSelectedPartsDataView('part-specs')
}

onMounted(() => {
  loadStats()

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
// ============================================
// 구조적 변경 사항 설명
// CSS 변수를 사용하여 테마 색상 중앙 관리 (light.scss, dark.scss)

.parts-management-dashboard {
  height: 100%;
  overflow-y: auto;
  --card-gap: 8px;

  // 필요시 line-height를 조정할 수 있는 클래스들
  .line-height-normal {
    line-height: 1.5;
  }

  .line-height-tight {
    line-height: 0.8;
  }

  .line-height-negative {
    line-height: 0.5;
  }
}

.dashboard-title {
  width: 100%;
  display: block;
  font-size: clamp(2rem, 3vw, 4rem);
  color: var(--nexa-background, rgba(0, 0, 0, 0.87));
  background-color: var(--nexa-background-upper, rgba(0, 0, 0, 0.87));
  font-family: 'Impact', 'Arial Black', 'Roboto Black', sans-serif;
  letter-spacing: clamp(2px, 0.5vw, 1vw);
  line-height: 1;
  text-align: left;
  box-sizing: border-box;
  margin-bottom: var(--card-gap);
}

.stat-card {
  flex: 1 1 0;
  min-width: 300px;
  min-height: 150px;
  background-color: var(--nexa-item-bg, rgba(255, 255, 255, 0.8));
  border: 1px solid var(--nexa-border-color, rgba(83, 83, 83, 0.928));
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}

.stat-cards-container {
  margin-bottom: var(--card-gap);
  display: flex;
  flex-wrap: wrap;
  gap: var(--card-gap);
  width: 100%;
}

.stat-card-single-container {
  display: flex;
  width: 100%;
  margin-bottom: var(--card-gap);
}

.quick-access-cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--card-gap);
  width: 100%;
  margin-bottom: var(--card-gap);
}

.chart-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-top: var(--card-gap, 8px); // 마진이 적용되지 않아서 padding으로 처리 이유는 아직 이해 안됨
}

.chart-responsive-wrapper {
  width: 100%;
  height: 150px;
  min-height: 150px;
  position: relative;
  // 차트 크기는 CSS에서 단일 소스로 관리
  // JavaScript는 이 컨테이너의 실제 크기를 읽어서 차트 컴포넌트에 전달
}
</style>
