<!--
  DataChartRenderer.vue
  범용 차트 데이터 렌더러 컴포넌트
  D3.js를 사용하여 다양한 차트 타입을 지원합니다.
-->
<template>
  <div class="data-chart-renderer">
    <!-- 차트 설정 패널 -->
    <div class="chart-settings-panel">
      <div class="settings-row">
        <!-- 차트 타입 선택 -->
        <div v-if="showChartTypeSelector" class="setting-item">
          <label>차트 타입</label>
          <q-select v-model="localChartType" :options="chartTypeOptions" option-label="label" option-value="value" dense outlined @update:model-value="handleChartTypeChange" />
        </div>

        <!-- X축 필드 선택 -->
        <div class="setting-item">
          <label>X축 필드</label>
          <q-select v-model="localXAxisField" :options="xAxisFieldOptions" option-label="label" option-value="value" dense outlined clearable @update:model-value="handleXAxisFieldChange" />
        </div>

        <!-- Y축 필드 선택 -->
        <div class="setting-item">
          <label>Y축 필드</label>
          <q-select v-model="localYAxisField" :options="yAxisFieldOptions" option-label="label" option-value="value" dense outlined clearable @update:model-value="handleYAxisFieldChange" />
        </div>

        <!-- 집계 방식 선택 -->
        <div v-if="localYAxisField && localYAxisField !== '__count__'" class="setting-item">
          <label>집계 방식</label>
          <q-select v-model="localAggregation" :options="aggregationOptions" dense outlined @update:model-value="handleAggregationChange" />
        </div>
      </div>
    </div>

    <!-- 차트 컨테이너 -->
    <div class="chart-container" ref="chartContainerRef">
      <!-- 차트 제목 -->
      <div v-if="chartTitle" class="chart-title-wrapper">
        <text class="chart-title-text">{{ chartTitle }}</text>
      </div>

      <!-- 단일 차트 모드 -->
      <Chart
        v-if="!multiLayerMode && !loading && processedData.length > 0"
        :type="singleChartType"
        :data="processedData"
        :width="chartWidth"
        :height="chartHeight"
        :options="chartOptions"
        :x-field="xAxisFieldName"
        :y-field="yAxisFieldName"
        :columns="columns"
        :aggregation="aggregation"
        :aggregation-options="aggregationOptions"
        :margin="computedMargin"
        :style="singleChartStyle"
        :interaction="singleChartInteraction"
        :show-labels="singleChartShowLabels"
        @data-click="handleDataClick"
        @data-hover="handleDataHover"
      />

      <!-- 복수 차트 레이어 모드 -->
      <MultiChartContainer
        v-if="multiLayerMode && !loading && chartLayers.length > 0"
        :layers="chartLayers"
        :width="chartWidth"
        :height="chartHeight"
        :margin="computedMargin"
        :shared-axes="true"
        :background="backgroundConfig"
        :columns="columns"
        :aggregation-options="aggregationOptions"
        @data-click="handleLayerDataClick"
        @data-hover="handleDataHover"
      />
    </div>

    <!-- 데이터 없음 메시지 -->
    <div v-if="!loading && processedData.length === 0" class="no-data-message">
      <q-icon name="bar_chart" size="48px" />
      <p>표시할 데이터가 없습니다.</p>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="chart-loading">
      <q-spinner color="primary" size="48px" />
      <p>차트를 불러오는 중...</p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as d3 from 'd3'
import Chart from '@engines/charts/NexaChart.vue'
import MultiChartContainer from '@engines/charts/MultiChartContainer.vue'
import { getChartMetadata } from '@engines/charts/config/chartMetadata'

const props = defineProps({
  // 기본 데이터
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
  // 컬럼 정의 (필드 정보)
  columns: {
    type: Array,
    required: true,
    default: () => [],
  },
  // 행 키 필드명
  rowKey: {
    type: String,
    required: true,
    default: 'id',
  },
  // 로딩 상태
  loading: {
    type: Boolean,
    default: false,
  },
  // 차트 설정
  viewSettings: {
    type: Object,
    default: () => ({}),
  },
  // 차트 타입 선택기 표시 여부
  showChartTypeSelector: {
    type: Boolean,
    default: false,
  },
  // 복수 레이어 모드 (layers가 제공되면 활성화)
  layers: {
    type: Array,
    default: null,
  },
  // 배경 이미지 설정
  background: {
    type: Object,
    default: null,
  },
  // 단일 차트용 스타일 효과
  style: {
    type: Object,
    default: null,
  },
  // 단일 차트용 시각효과
  effects: {
    type: Object,
    default: null,
  },
  // 단일 차트용 인터랙션 설정
  interaction: {
    type: Object,
    default: null,
  },
  // 단일 차트용 라벨 표시 여부
  showLabels: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['chart-type-change', 'data-click', 'data-hover', 'settings-change'])

// Refs
const chartContainerRef = ref(null)

// 차트 타입 옵션
const chartTypeOptions = [
  { label: '막대 차트', value: 'bar' },
  { label: '라인 차트', value: 'line' },
  { label: '영역 차트', value: 'area' },
  { label: '파이 차트', value: 'pie' },
  { label: '분산 차트', value: 'scatter' },
]

// 로컬 차트 타입 (설정에서 가져오거나 기본값)
// chartTypes가 있으면 첫 번째 사용, 없으면 chartType 사용
const localChartType = ref(props.viewSettings?.chartTypes?.[0] || props.viewSettings?.chartType || 'bar')

// 기본값 계산 함수 (개선: 범주형 필드 우선 선택)
function getDefaultXAxisField() {
  // 1순위: category 필드
  const categoryField = props.columns.find((col) => col.field === 'category')
  if (categoryField) return 'category'

  // 2순위: type이 'string' 또는 'category'인 필드 (columns에 type 정보가 있는 경우)
  const stringField = props.columns.find((col) => col.type === 'string' || col.type === 'category')
  if (stringField) return stringField.field

  // 3순위: name 필드
  const nameField = props.columns.find((col) => col.field === 'name')
  if (nameField) return 'name'

  // 4순위: 범주형으로 보이는 필드명 패턴 (type, status, category, kind, group 등)
  const categoryLikeFields = ['type', 'status', 'category', 'kind', 'group']
  for (const fieldName of categoryLikeFields) {
    const field = props.columns.find((col) => col.field === fieldName)
    if (field) return field.field
  }

  // 5순위: id, sort_order, 날짜 필드가 아닌 첫 번째 필드
  const fallbackField = props.columns.find((col) => {
    const field = col.field
    return field !== 'id' && field !== 'sort_order' && field !== 'sub_sort_order' && !field.includes('_at')
  })
  return fallbackField?.field || props.columns[0]?.field || null
}

function getDefaultYAxisField() {
  // count 집계를 기본값으로 사용 (필드 선택 없이 개수 집계)
  return '__count__'
}

// 로컬 설정 값 (사용자가 변경한 값)
// props.viewSettings가 변경되어도 초기값은 한 번만 설정
const localXAxisField = ref(null)
const localYAxisField = ref(null)
const localAggregation = ref('count')

// 초기값 설정 (한 번만)
if (localXAxisField.value === null) {
  localXAxisField.value = props.viewSettings?.xAxisField || getDefaultXAxisField()
}
if (localYAxisField.value === null) {
  localYAxisField.value = props.viewSettings?.yAxisField || getDefaultYAxisField()
}
if (!props.viewSettings?.aggregation) {
  localAggregation.value = 'count'
} else {
  localAggregation.value = props.viewSettings.aggregation
}

// 필드명 추출 유틸리티 함수 (타입 체크 중복 제거)
function extractFieldName(rawValue) {
  if (!rawValue) return null
  return typeof rawValue === 'object' && rawValue !== null ? rawValue.value : String(rawValue)
}

// 필드명을 항상 문자열로 반환하는 computed 속성 (개선: 중복 제거)
const xAxisFieldName = computed(() => extractFieldName(localXAxisField.value))
const yAxisFieldName = computed(() => extractFieldName(localYAxisField.value))

// 차트 설정에서 값 가져오기
const aggregation = computed(() => localAggregation.value)
const groupBy = computed(() => props.viewSettings?.groupBy || null)
const chartOptions = computed(() => props.viewSettings?.chartOptions || {})

// 차트 제목 계산
const chartTitle = computed(() => {
  const xField = xAxisFieldName.value || ''
  const yField = yAxisFieldName.value || ''
  if (!xField || !yField) return ''

  const xAxisLabel = props.columns.find((col) => col.field === xField)?.label || xField
  let yAxisLabel = ''
  if (yField === '__count__') {
    yAxisLabel = '개수'
  } else {
    const yFieldColumn = props.columns.find((col) => col.field === yField)
    const aggregationLabel = aggregationOptions.find((opt) => opt.value === aggregation.value)?.label || ''
    yAxisLabel = yFieldColumn ? `${aggregationLabel} (${yFieldColumn.label})` : aggregationLabel
  }
  return `${xAxisLabel}별 ${yAxisLabel}`
})

// 차트 크기 (동적 업데이트를 위해 ref 사용)
const chartWidth = ref(800)
const chartHeight = ref(400)

// 차트 크기 업데이트 함수
function updateChartSize() {
  if (!chartContainerRef.value) {
    chartWidth.value = 800
    chartHeight.value = 400
    return
  }

  const containerWidth = chartContainerRef.value.clientWidth || 800
  const containerHeight = chartContainerRef.value.clientHeight || 400
  const titleHeight = chartTitle.value ? 50 : 0

  chartWidth.value = containerWidth
  chartHeight.value = Math.max(400, containerHeight - titleHeight)
}

// 반응형 margin 계산
const computedMargin = computed(() => {
  const width = chartWidth.value
  const titleHeight = chartTitle.value ? 50 : 0
  const xAxisTickLabelHeight = 60
  const xAxisLabelHeight = 120
  const leftMarginLabelOffset = 0

  const baseMargin = 40
  const baseLeftMargin = baseMargin + leftMarginLabelOffset
  const baseBottomMargin = xAxisTickLabelHeight + xAxisLabelHeight
  const topMargin = titleHeight

  let rightMargin = baseMargin
  let leftMargin = baseLeftMargin
  let bottomMargin = baseBottomMargin

  if (width < 600) {
    rightMargin = Math.max(baseMargin, Math.max(20, width * 0.05))
    leftMargin = Math.max(baseLeftMargin, baseMargin + width * 0.05)
    bottomMargin = xAxisTickLabelHeight + Math.max(80, xAxisLabelHeight * 0.7) + 10
  } else if (width < 1024) {
    rightMargin = Math.max(baseMargin, Math.max(60, width * 0.08))
    leftMargin = Math.max(baseLeftMargin, baseMargin + width * 0.06)
  } else if (width < 1440) {
    rightMargin = Math.max(baseMargin, 100)
    leftMargin = baseLeftMargin
  }

  return {
    top: topMargin,
    right: Math.round(rightMargin),
    bottom: Math.round(bottomMargin),
    left: Math.round(leftMargin),
  }
})

// X축 필드 옵션 (모든 필드)
const xAxisFieldOptions = computed(() => {
  return props.columns.map((col) => ({
    label: col.label || col.name,
    value: col.field,
  }))
})

// Y축 필드 옵션 (모든 필드 + count 집계)
const yAxisFieldOptions = computed(() => {
  const options = [
    { label: '개수 (Count)', value: '__count__' }, // 개수 집계 옵션
    ...props.columns.map((col) => ({
      label: col.label || col.name,
      value: col.field,
    })),
  ]

  return options
})

// 집계 방식 옵션
const aggregationOptions = [
  { label: '합계', value: 'sum' },
  { label: '평균', value: 'avg' },
  { label: '최소값', value: 'min' },
  { label: '최대값', value: 'max' },
  { label: '개수', value: 'count' },
]

// 데이터 처리
const processedData = computed(() => {
  if (!props.rows || props.rows.length === 0) return []

  // X축 필드 확인 (computed 속성 사용, 개선: 중복 제거)
  const xField = xAxisFieldName.value
  if (!xField) {
    console.warn('[DataChartRenderer] X축 필드가 설정되지 않았습니다.')
    return []
  }

  // Y축 필드 확인 (computed 속성 사용, 개선: 중복 제거)
  const yField = yAxisFieldName.value
  if (!yField) {
    console.warn('[DataChartRenderer] Y축 필드가 설정되지 않았습니다.')
    return []
  }
  const isCountAggregation = yField === '__count__'

  // 데이터 집계
  let data = []

  if (isCountAggregation) {
    // 개수 집계: X축 필드별로 그룹화하여 개수 계산
    const grouped = d3.group(props.rows, (d) => {
      // xField가 문자열인지 확인
      const fieldName = typeof xField === 'string' ? xField : String(xField)
      const value = d[fieldName]
      // null, undefined, 빈 문자열 모두 '(없음)'으로 처리
      if (value === null || value === undefined || value === '') {
        return '(없음)'
      }
      return String(value)
    })
    data = Array.from(grouped, ([key, values]) => {
      return {
        x: key,
        y: values.length,
        count: values.length,
        originalRows: values,
      }
    })
  } else if (groupBy.value) {
    // 그룹화가 있는 경우
    const grouped = d3.group(props.rows, (d) => d[groupBy.value])
    data = Array.from(grouped, ([key, values]) => {
      const yValues = values.map((v) => {
        const val = v[yField]
        return typeof val === 'number' ? val : parseFloat(val) || 0
      })
      let aggregated = 0
      switch (aggregation.value) {
        case 'sum':
          aggregated = d3.sum(yValues)
          break
        case 'avg':
          aggregated = d3.mean(yValues)
          break
        case 'min':
          aggregated = d3.min(yValues)
          break
        case 'max':
          aggregated = d3.max(yValues)
          break
        case 'count':
          aggregated = values.length
          break
        default:
          aggregated = d3.sum(yValues)
      }
      return {
        x: key,
        y: aggregated,
        count: values.length,
        originalRows: values,
      }
    })
  } else {
    // 그룹화가 없는 경우: X축 필드별로 그룹화하여 Y축 필드 집계
    // (isCountAggregation이 false인 경우에만 이 블록 실행)
    // xField와 yField는 이미 문자열로 변환됨

    // 문자열을 해시 숫자로 변환하는 헬퍼 함수
    // 같은 문자열은 항상 같은 해시값을 반환 (일관성 유지)
    function stringToHash(str) {
      let hash = 0
      if (str.length === 0) return hash
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // Convert to 32bit integer
      }
      return hash
    }

    const grouped = d3.group(props.rows, (d) => {
      const value = d[xField]
      // null, undefined, 빈 문자열 모두 '(없음)'으로 처리
      if (value === null || value === undefined || value === '') {
        return '(없음)'
      }
      return String(value)
    })
    data = Array.from(grouped, ([key, values]) => {
      // Y축 필드 집계 (개선: 문자열을 숫자로 변환하는 옵션 제공)
      const yValues = values.map((v) => {
        const val = v[yField]
        if (typeof val === 'number') return val

        const parsed = parseFloat(val)
        if (isNaN(parsed)) {
          // 문자열을 숫자로 변환 시도 (해시 기반)
          // 옵션 1: 문자열 해시값 사용 (일관된 숫자 생성)
          const hashValue = stringToHash(String(val))

          // 옵션 2: 0으로 대체 (기본값)
          // return 0

          // 옵션 3: 문자열 길이 사용
          // return String(val).length

          // 현재: 해시값 사용 (문자열마다 고유한 숫자 값 생성)
          // 해시값을 0-100 범위로 정규화 (차트에서 보기 좋게)
          const normalizedHash = Math.abs(hashValue % 100) / 100 // 0.0 ~ 0.99 범위

          // 디버깅: 개발 모드에서만 상세 로그 (console.warn 대신 console.debug)
          if (import.meta.env.DEV) {
            console.debug(`[DataChartRenderer] Y축 필드 "${yField}"의 값 "${val}"을 숫자로 변환할 수 없습니다.`, `해시값: ${hashValue}, 정규화: ${normalizedHash}`, v)
          }

          return normalizedHash
        }
        return parsed
      })
      let aggregated = 0
      switch (aggregation.value) {
        case 'sum':
          aggregated = d3.sum(yValues)
          break
        case 'avg':
          aggregated = d3.mean(yValues)
          break
        case 'min':
          aggregated = d3.min(yValues)
          break
        case 'max':
          aggregated = d3.max(yValues)
          break
        case 'count':
          aggregated = values.length
          break
        default:
          aggregated = d3.sum(yValues)
      }
      return {
        x: key,
        y: aggregated,
        count: values.length,
        originalRows: values,
      }
    })
  }

  // X축 값으로 정렬 (문자열인 경우)
  data.sort((a, b) => {
    if (typeof a.x === 'string' && typeof b.x === 'string') {
      return a.x.localeCompare(b.x)
    }
    return a.x - b.x
  })

  return data
})

// 차트 타입 변경 핸들러
function handleChartTypeChange(newType) {
  // q-select에서 객체나 값이 전달될 수 있으므로 값만 추출
  const chartTypeValue = typeof newType === 'object' && newType !== null ? newType.value : newType
  localChartType.value = chartTypeValue
  emit('chart-type-change', chartTypeValue)
  emitSettingsChange()

  // 디버깅: 차트 타입 변경 확인
  if (import.meta.env.DEV) {
    console.log('[DataChartRenderer] 차트 타입 변경:', {
      newType,
      chartTypeValue,
      localChartType: localChartType.value,
    })
  }

  // Chart.vue가 자체적으로 watch를 통해 데이터 변경을 감지하므로 renderChart() 호출 불필요
}

// X축 필드 변경 핸들러
function handleXAxisFieldChange(newField) {
  const fieldValue = extractFieldName(newField)
  localXAxisField.value = fieldValue
  emitSettingsChange()
  // Chart.vue가 자체적으로 watch를 통해 데이터 변경을 감지하므로 renderChart() 호출 불필요
}

// Y축 필드 변경 핸들러
function handleYAxisFieldChange(newField) {
  const fieldValue = extractFieldName(newField)
  localYAxisField.value = fieldValue
  // count 집계인 경우 aggregation을 count로 설정
  if (fieldValue === '__count__') {
    localAggregation.value = 'count'
  }
  emitSettingsChange()
  // Chart.vue가 자체적으로 watch를 통해 데이터 변경을 감지하므로 renderChart() 호출 불필요
}

// 집계 방식 변경 핸들러
function handleAggregationChange(newAggregation) {
  localAggregation.value = newAggregation
  emitSettingsChange()
  // Chart.vue가 자체적으로 watch를 통해 데이터 변경을 감지하므로 renderChart() 호출 불필요
}

// 설정 변경 이벤트 emit
function emitSettingsChange() {
  emit('settings-change', {
    chartType: localChartType.value,
    xAxisField: localXAxisField.value,
    yAxisField: localYAxisField.value,
    aggregation: localAggregation.value,
  })
}

// 데이터 클릭 핸들러
function handleDataClick(data) {
  emit('data-click', data)
}

// 데이터 호버 핸들러
function handleDataHover(data) {
  emit('data-hover', data)
}

// 레이어 데이터 클릭 핸들러
function handleLayerDataClick({ layer, data }) {
  emit('data-click', { layer, data })
}

// viewSettings에서 layers 생성 (chartTypes 기반)
const generatedLayers = computed(() => {
  const settings = props.viewSettings
  if (!settings) return null

  // chartTypes가 2개 이상이면 멀티 모드
  const chartTypes = settings.chartTypes || (settings.chartType ? [settings.chartType] : [])
  if (chartTypes.length <= 1) return null

  // settings.layers가 있으면 사용, 없으면 chartTypes로부터 생성
  if (settings.layers && settings.layers.length > 0) {
    return settings.layers.map((layer) => ({
      ...layer,
      // 데이터는 나중에 처리
      rows: props.rows,
      columns: props.columns,
    }))
  }

  // chartTypes로부터 기본 layers 생성
  // 레이어별 style은 null로 초기화하여 전역 설정 상속
  return chartTypes.map((type, index) => ({
    id: `layer-${index}`,
    type: type,
    layerIndex: index,
    xField: null, // 공통 필드 사용
    yField: null, // 공통 필드 사용
    aggregation: null, // 공통 집계 사용
    rows: props.rows,
    columns: props.columns,
    style: {
      // null로 설정하여 전역 설정 상속 (병합 함수에서 처리)
      opacity: null,
      blur: null,
      neonIntensity: null,
      strokeWidth: null,
      dotSize: null,
      nodeSize: null,
      color: null,
    },
    interaction: settings.interaction || {},
    showLabels: settings.chartOptions?.showLabels !== false,
    options: settings.chartOptions || {},
  }))
})

// 복수 레이어 모드 여부
const multiLayerMode = computed(() => {
  // props.layers가 직접 제공되면 우선 사용
  if (props.layers && props.layers.length > 0) {
    return true
  }
  // viewSettings에서 생성된 layers가 있으면 멀티 모드
  return generatedLayers.value && generatedLayers.value.length > 0
})

// 배경 설정
const backgroundConfig = computed(() => {
  return props.background || null
})

// 단일 차트 타입 (chartTypes의 첫 번째 또는 chartType)
const singleChartType = computed(() => {
  const settings = props.viewSettings
  if (settings?.chartTypes && settings.chartTypes.length > 0) {
    return settings.chartTypes[0]
  }
  return settings?.chartType || localChartType.value || 'bar'
})

// 단일 차트용 스타일 설정
// 멀티 차트와 동일한 로직 적용: strokeWidth가 명시적으로 설정된 경우에만 사용, 없으면 CSS 기본값 사용
const singleChartStyle = computed(() => {
  const rawStyle = props.style || props.viewSettings?.style || {}
  const rawEffects = props.effects || props.viewSettings?.effects || {}
  const chartType = singleChartType.value

  // mergeLayerStyle과 동일한 로직 적용 (단일 차트는 layerStyle이 없으므로 null 전달)
  return mergeLayerStyle(chartType, rawStyle, rawEffects, null, false, false)
})

// 단일 차트용 인터랙션 설정
const singleChartInteraction = computed(() => {
  return props.interaction || props.viewSettings?.interaction || {}
})

// 단일 차트용 라벨 표시 여부
const singleChartShowLabels = computed(() => {
  if (props.showLabels !== undefined) return props.showLabels
  // chartOptions.showLabels 우선 확인
  if (props.viewSettings?.chartOptions?.showLabels !== undefined) {
    return props.viewSettings.chartOptions.showLabels !== false
  }
  return props.viewSettings?.showLabels !== false
})

// 복수 레이어용 차트 레이어 데이터 생성
const chartLayers = computed(() => {
  if (!multiLayerMode.value) return []

  // 사용할 layers 결정 (props.layers 우선, 없으면 generatedLayers)
  const layersToUse = props.layers || generatedLayers.value || []
  if (layersToUse.length === 0) return []

  // visible이 false인 레이어는 제외
  const visibleLayers = layersToUse.filter((layer) => layer.visible !== false)

  return visibleLayers.map((layer, index) => {
    // 레이어별 필드 결정 (null이면 공통 필드 사용)
    const layerXField = layer.xField !== null && layer.xField !== undefined ? layer.xField : xAxisFieldName.value
    const layerYField = layer.yField !== null && layer.yField !== undefined ? layer.yField : yAxisFieldName.value
    const layerAggregation = layer.aggregation !== null && layer.aggregation !== undefined ? layer.aggregation : aggregation.value

    // 레이어별 데이터 처리
    let layerData = []
    if (layer.data) {
      // 이미 처리된 데이터인 경우
      layerData = layer.data
    } else if (layer.rows && layer.columns) {
      // 원시 데이터인 경우 처리
      layerData = processLayerData(layer.rows, {
        ...layer,
        xField: layerXField,
        yField: layerYField,
        aggregation: layerAggregation,
      })
    } else {
      // 공통 데이터 사용 (processedData 기반으로 필터링/재집계)
      layerData = processLayerDataFromProcessed(processedData.value, {
        xField: layerXField,
        yField: layerYField,
        aggregation: layerAggregation,
      })
    }

    // 전역 스타일과 레이어별 스타일 병합 (차트 타입별 필터링 적용)
    const globalStyle = props.style || props.viewSettings?.style || {}
    const globalEffects = props.effects || props.viewSettings?.effects || {}
    const globalOptions = props.viewSettings?.chartOptions || {}
    const globalInteraction = props.viewSettings?.interaction || {}
    // 모드 스위치 값을 직접 참조
    const applyToAllStyles = props.viewSettings?.applyToAllStyles === true
    const applyToAllEffects = props.viewSettings?.applyToAllEffects === true
    const mergedStyle = mergeLayerStyle(layer.type || 'bar', globalStyle, globalEffects, layer.style, applyToAllStyles, applyToAllEffects)

    // 레이어 옵션: 항상 전역 설정만 사용 (상세 제어 기능 제거)
    // 기본값 처리: undefined일 때는 기본값(true) 사용, false일 때는 비활성화
    const mergedOptions = {
      showLabels: globalOptions.showLabels !== false,
      animation: globalOptions.animation !== false,
      showGrid: globalOptions.showGrid !== false, // false가 아니면 표시 (기본값 true 고려)
      showLegend: globalOptions.showLegend !== false, // false가 아니면 표시 (기본값 true 고려)
    }

    // 레이어 인터랙션: 항상 전역 설정만 사용 (상세 제어 기능 제거)
    const mergedInteraction = {
      tooltip: globalInteraction.tooltip !== false,
      hover: globalInteraction.hover !== false,
      click: globalInteraction.click !== false,
    }

    // showLabels: 항상 전역 설정만 사용
    const finalShowLabels = globalOptions.showLabels !== false

    return {
      id: layer.id || `layer-${index}`,
      type: layer.type || 'bar',
      data: layerData,
      layerIndex: layer.layerIndex !== undefined ? layer.layerIndex : index,
      xField: layerXField,
      yField: layerYField,
      aggregation: layerAggregation,
      showLabels: finalShowLabels,
      style: mergedStyle, // 병합된 스타일 사용
      interaction: mergedInteraction, // 병합된 인터랙션 사용
      options: mergedOptions, // 병합된 옵션 사용
    }
  })
})

// 차트 타입별 전역 스타일 필터링 (지원하는 속성만 가져오기)
function getGlobalStyleForChartType(chartType, globalStyle) {
  if (!globalStyle) return {}

  const metadata = getChartMetadata(chartType)
  const filtered = {}

  // 스타일은 차트 타입별로 지원하는 속성만 필터링
  if (metadata.supports?.strokeWidth && globalStyle.strokeWidth !== undefined) {
    filtered.strokeWidth = globalStyle.strokeWidth
  }
  if (metadata.supports?.dotSize && globalStyle.dotSize !== undefined) {
    filtered.dotSize = globalStyle.dotSize
  }
  if (metadata.supports?.nodeSize && globalStyle.nodeSize !== undefined) {
    filtered.nodeSize = globalStyle.nodeSize
  }
  // 색상: undefined가 아닌 경우 모두 포함 (null이나 빈 문자열도 포함하여 명시적으로 색상을 제거하는 경우 처리)
  if (metadata.supports?.color && globalStyle.color !== undefined) {
    filtered.color = globalStyle.color
  }

  return filtered
}

/**
 * 레이어별 스타일 병합 함수 (차트 타입별 필터링 적용)
 *
 * 병합 우선순위:
 * 1. applyToAllStyles = true → 전역 설정 무조건 사용 (상세 설정 무시)
 * 2. applyToAllStyles = false → 상세 설정 우선 (있으면), 없으면 전역 설정
 * 3. applyToAllEffects = true → 전역 효과 무조건 사용 (상세 설정 무시)
 * 4. applyToAllEffects = false → 상세 설정 우선 (있으면), 없으면 전역 설정
 *
 * 차트 타입별로 지원하는 속성만 전역에서 가져옴 (getGlobalStyleForChartType 사용)
 *
 * @param {string} chartType - 차트 타입
 * @param {Object} globalStyle - 전역 스타일 객체
 * @param {Object} globalEffects - 전역 시각효과 객체
 * @param {Object} layerStyle - 레이어별 스타일 객체
 * @param {boolean} applyToAllStyles - 전체 설정 우선 모드 여부 (true: 전역 설정 무조건 사용, false: 상세 설정 우선)
 * @param {boolean} applyToAllEffects - 전체 설정 우선 모드 여부 (true: 전역 설정 무조건 사용, false: 상세 설정 우선)
 * @returns {Object} 병합된 스타일 객체
 */
function mergeLayerStyle(chartType, globalStyle, globalEffects, layerStyle, applyToAllStyles = false, applyToAllEffects = false) {
  const globalForType = getGlobalStyleForChartType(chartType, globalStyle)

  // 스타일 속성: 전체 설정 우선이면 전역, 아니면 상세(있으면) 또는 전역
  // strokeWidth: 명시적으로 설정된 경우에만 값 사용, 없으면 undefined (CSS 기본값 사용)
  let strokeWidth
  if (applyToAllStyles) {
    // 전체 설정 우선 모드: 전역 strokeWidth 사용 (명시적으로 설정된 경우만)
    strokeWidth = globalForType.strokeWidth
  } else {
    // 상세 설정 보호 모드: 상세 설정 우선, 없으면 전역 설정 (명시적으로 설정된 경우만)
    strokeWidth = layerStyle?.strokeWidth !== undefined ? layerStyle.strokeWidth : globalForType.strokeWidth
  }
  const dotSize = applyToAllStyles ? globalForType.dotSize : (layerStyle?.dotSize ?? globalForType.dotSize)
  const nodeSize = applyToAllStyles ? globalForType.nodeSize : (layerStyle?.nodeSize ?? globalForType.nodeSize)
  // 색상: null이나 빈 문자열이 아닌 경우에만 사용, 그 외에는 undefined (lineChart.js에서 기본값 사용)
  let color
  if (applyToAllStyles) {
    // 전체 설정 우선 모드: 전역 색상 사용
    if (globalForType.color !== undefined && globalForType.color !== null && globalForType.color !== '') {
      color = globalForType.color
    }
    // undefined면 lineChart.js에서 기본값 사용
  } else {
    // 상세 설정 보호 모드: 상세 설정 우선, 없으면 전역 설정
    if (layerStyle?.color !== undefined && layerStyle?.color !== null && layerStyle?.color !== '') {
      color = layerStyle.color
    } else if (globalForType.color !== undefined && globalForType.color !== null && globalForType.color !== '') {
      color = globalForType.color
    }
    // undefined면 lineChart.js에서 기본값 사용
  }

  // 시각효과 속성: 전체 설정 우선이면 전역, 아니면 상세(있으면) 또는 전역
  const opacity = applyToAllEffects ? globalEffects?.opacity : (layerStyle?.opacity ?? globalEffects?.opacity)
  const blur = applyToAllEffects ? globalEffects?.blur : (layerStyle?.blur ?? globalEffects?.blur)
  const neonIntensity = applyToAllEffects ? globalEffects?.neonIntensity : (layerStyle?.neonIntensity ?? globalEffects?.neonIntensity)

  return {
    opacity,
    blur,
    neonIntensity,
    strokeWidth,
    dotSize,
    nodeSize,
    color,
  }
}

// 참고: 레이어별 옵션 및 인터랙션 상세 제어 기능은 제거됨
// 현재는 전역 설정만 사용 (전체 제어만 가능)
// 향후 상세 제어 기능 추가 시 mergeLayerOptions, mergeLayerInteraction 함수 재구현 예정

// 공통 processedData에서 레이어별 데이터 생성 (필드가 다른 경우)
function processLayerDataFromProcessed(processedData, layerConfig) {
  if (!processedData || processedData.length === 0) return []
  if (!layerConfig.xField || !layerConfig.yField) return processedData

  // 필드가 공통 필드와 같으면 그대로 사용
  if (layerConfig.xField === xAxisFieldName.value && layerConfig.yField === yAxisFieldName.value && layerConfig.aggregation === aggregation.value) {
    return processedData
  }

  // 필드가 다르면 원본 rows에서 재처리 필요
  // 이 경우는 processLayerData를 사용
  return processLayerData(props.rows, layerConfig)
}

// 레이어 데이터 처리 (간단한 버전)
function processLayerData(rows, layerConfig) {
  if (!rows || rows.length === 0) return []

  const xField = layerConfig.xField || xAxisFieldName.value
  const yField = layerConfig.yField || yAxisFieldName.value
  const agg = layerConfig.aggregation || aggregation.value
  const isCountAggregation = yField === '__count__'

  if (isCountAggregation) {
    const grouped = d3.group(rows, (d) => {
      const value = d[xField]
      if (value === null || value === undefined || value === '') {
        return '(없음)'
      }
      return String(value)
    })
    return Array.from(grouped, ([key, values]) => ({
      x: key,
      y: values.length,
      count: values.length,
      originalRows: values,
    }))
  } else {
    const grouped = d3.group(rows, (d) => {
      const value = d[xField]
      if (value === null || value === undefined || value === '') {
        return '(없음)'
      }
      return String(value)
    })
    return Array.from(grouped, ([key, values]) => {
      const yValues = values.map((v) => {
        const val = v[yField]
        return typeof val === 'number' ? val : parseFloat(val) || 0
      })
      let aggregated = 0
      switch (agg) {
        case 'sum':
          aggregated = d3.sum(yValues)
          break
        case 'avg':
          aggregated = d3.mean(yValues)
          break
        case 'min':
          aggregated = d3.min(yValues)
          break
        case 'max':
          aggregated = d3.max(yValues)
          break
        case 'count':
          aggregated = values.length
          break
        default:
          aggregated = d3.sum(yValues)
      }
      return {
        x: key,
        y: aggregated,
        count: values.length,
        originalRows: values,
      }
    })
  }
}

// Watch
// Chart.vue가 자체적으로 watch와 resize observer를 관리하므로
// 여기서는 viewSettings 변경만 감지하여 로컬 상태를 업데이트합니다
watch(
  () => props.viewSettings,
  (newSettings) => {
    if (newSettings?.chartType) {
      localChartType.value = newSettings.chartType
    }
    if (newSettings?.xAxisField !== undefined) {
      localXAxisField.value = extractFieldName(newSettings.xAxisField) || getDefaultXAxisField()
    }
    if (newSettings?.yAxisField !== undefined) {
      localYAxisField.value = extractFieldName(newSettings.yAxisField) || getDefaultYAxisField()
      if (localYAxisField.value === '__count__') {
        localAggregation.value = 'count'
      }
    }
    if (newSettings?.aggregation) {
      localAggregation.value = newSettings.aggregation
    }
  },
  { deep: true },
)

// 차트 제목 변경 시 높이 재계산
watch(
  () => chartTitle.value,
  () => {
    updateChartSize()
  },
)

// ResizeObserver 설정
let resizeObserver = null

function setupResizeObserver() {
  if (typeof ResizeObserver !== 'undefined' && chartContainerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      nextTick(() => {
        updateChartSize()
      })
    })
    resizeObserver.observe(chartContainerRef.value)
  }
}

// Lifecycle hooks
onMounted(() => {
  // 초기 크기 설정
  nextTick(() => {
    updateChartSize()
    setupResizeObserver()
  })
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})
</script>

<style lang="scss" scoped>
@import './DataChartRenderer.scss';
</style>

<!-- 차트 툴팁 전역 스타일 (body에 직접 추가되므로 전역 스타일 필요) -->
<!-- 툴팁 스타일은 전역 CSS로 이동됨 (src/system/css/nexa-system/_chart.scss) -->
