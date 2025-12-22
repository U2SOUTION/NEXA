<!--
  DataCardRenderer.vue
  범용 카드 데이터 렌더러 컴포넌트

  [알려진 제한사항]
  - 좌우 드래그 시 카드 맞교환: 현재 vue3-grid-layout-next 라이브러리의 기본 동작으로는
    좌우 이동 시 카드가 맞교환되지 않고 아래로 밀리는 현상이 있습니다.
    prevent-collision 옵션으로는 해결되지 않았으며, 필요 시 handleCardMoved 이벤트에서
    맞교환 로직을 직접 구현해야 합니다.

  [다른 뷰 모드 구현 시 주의사항 - 마우스 호버 이벤트]

  1. 마우스 이벤트 바인딩:
     - @mouseenter 이벤트는 features?.hoverable이 true일 때만 활성화되어야 함
     - 이벤트 핸들러에서 row 객체를 정확히 찾아서 전달해야 함
     - 예: @mouseenter="features?.hoverable ? (evt) => handleCardMouseEnter(evt, getRowById(item.i)) : undefined"

  2. row 객체 찾기:
     - handleCardMouseEnter 함수에서 row가 없을 경우 대체 방법 제공 필요
     - data-row-id 속성을 사용하여 row를 찾을 수 있도록 구현
     - event.currentTarget 또는 event.target에서 data-row-id 추출
     - 부모 요소에서도 찾을 수 있도록 closest('[data-row-id]') 사용

  3. 이벤트 emit:
     - row 객체를 찾은 후에만 emit('row-mouse-enter', event, row) 호출
     - event와 row를 함께 전달해야 부모 컴포넌트에서 처리 가능

  4. 부모 컴포넌트 연결:
     - 부모 컴포넌트에서 @row-mouse-enter="onRowMouseEnter" 바인딩 필요
     - onRowMouseEnter 함수에서 composable의 onRowMouseEnterComposable 호출
     - 예: function onRowMouseEnter(evt, row) { onRowMouseEnterComposable(evt, row) }

  5. data-row-id 속성:
     - 각 카드 요소에 :data-row-id="item.i" 속성 필수
     - 이 속성이 없으면 row 객체를 찾을 수 없음

  6. features 설정:
     - cardFeatures 객체에 hoverable: true 설정 필요
     - 예: const cardFeatures = { selectable: true, hoverable: true }
-->
<template>
  <div class="data-card-renderer">
    <div v-if="loading" class="text-center q-pa-xl">
      <div class="text-h6">로딩 중...</div>
    </div>

    <div v-else-if="rows.length === 0" class="text-center q-pa-xl">
      <q-icon name="inbox" size="64px" color="grey-5" />
      <div class="text-h6 q-mt-md text-grey-6">데이터가 없습니다</div>
    </div>

    <div v-else class="data-card-container-wrapper">
      <div class="data-card-container" ref="containerRef">
        <transition name="slide-left">
          <grid-layout
            :key="paginationKey"
            :layout="cardLayout"
            :col-num="effectiveGridColNum"
            :row-height="effectiveRowHeight"
            :is-draggable="isDraggable"
            :is-resizable="isResizable"
            :responsive="responsive"
            :vertical-compact="false"
            :use-css-transforms="useCssTransforms"
            :margin="effectiveMargin"
            :max-rows="maxRows"
            :prevent-collision="preventCollision"
            :compact-type="null"
            class="data-card-grid-layout"
            @layout-updated="handleLayoutUpdated"
          >
            <grid-item
              v-for="(item, index) in cardLayout"
              :key="item.i"
              :x="item.x"
              :y="item.y"
              :w="item.w"
              :h="item.h"
              :i="item.i"
              :min-w="minW"
              :min-h="CARD_HEIGHT_GRID_UNITS"
              :max-h="CARD_HEIGHT_GRID_UNITS"
              :max-w="maxW"
              :static="item.static || false"
              class="data-card-grid-item"
              :drag-allow-from="`.card-header-section[data-row-id='${item.i}']`"
              :draggable-cancel="'.card-content-section, .card-footer-section, .q-btn, .q-icon'"
              @moved="handleCardMoved"
              @resized="handleCardResized"
              @dragstart="handleCardDragStart"
              @dragend="handleCardDragEnd"
              @dragmove="handleCardDragMove"
            >
              <q-card
                :class="[
                  'full-height',
                  {
                    'nexa-item-selected': isSelected(item.i),
                    'nexa-item-inactive': isInactive(item.i),
                    'nexa-item-long-pressing': isLongPressing(item.i),
                  },
                ]"
                :data-row-id="item.i"
                @click="(evt) => handleCardClick(evt, getRowById(item.i))"
                @dblclick="(evt) => handleCardDoubleClick(evt, getRowById(item.i))"
                @contextmenu="(evt) => handleCardContextMenu(evt, getRowById(item.i))"
                @mousedown="
                  (evt) => {
                    if (features?.selectable) {
                      const row = getRowById(item.i)
                      handleCardMouseDown(evt, row)
                    }
                  }
                "
                @mouseup="features?.selectable ? handleCardMouseUp : undefined"
                @mouseenter="
                  (evt) => {
                    if (features?.hoverable) {
                      const row = getRowById(item.i)
                      handleCardMouseEnter(evt, row)
                    }
                  }
                "
                @mousemove="features?.hoverable ? (evt) => handleCardMouseMove(evt, getRowById(item.i)) : undefined"
                @mouseleave="features?.hoverable ? handleCardMouseLeave : undefined"
              >
                <!-- ===== 상단 영역 (헤더/타이틀만) ===== -->
                <div class="card-header-section" :data-row-id="item.i">
                  <div class="card-header-title q-pa-sm">
                    <div class="text-h6 text-weight-bold">
                      {{ getFieldValue(item.i, 'name') || '-' }}
                    </div>
                  </div>
                </div>

                <!-- ===== 중간 영역 (내용 + 이미지) ===== -->
                <div class="card-content-section q-pa-md">
                  <!-- 이미지 (상단) -->
                  <div v-if="shouldShowImage && imagePosition === 'top'" class="card-image-container q-mb-md">
                    <img v-if="getCardImage(item.i)" :src="getCardImage(item.i)" alt="" class="card-image" />
                  </div>

                  <!-- 이미지와 필드 목록 (왼쪽/오른쪽) -->
                  <div v-if="shouldShowImage && (imagePosition === 'left' || imagePosition === 'right')" class="row q-mb-md">
                    <div :class="imagePosition === 'left' ? 'col-auto q-mr-md' : 'col-auto q-ml-md order-last'">
                      <img v-if="getCardImage(item.i)" :src="getCardImage(item.i)" alt="" class="card-image" style="max-width: 100px" />
                    </div>
                    <div class="col">
                      <div v-for="field in visibleFieldsList" :key="field.name" class="q-mb-xs">
                        <div class="field-inline">
                          <span class="text-caption text-grey-6">{{ field.label }}:</span>
                          <span class="text-body2">{{ getFieldValue(item.i, field.name) || '-' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 필드 목록 (이미지가 없거나 top일 때) -->
                  <template v-else>
                    <div v-for="field in visibleFieldsList" :key="field.name" class="q-mb-xs">
                      <div class="field-inline">
                        <span class="text-caption text-grey-6">{{ field.label }}:</span>
                        <span class="text-body2">{{ getFieldValue(item.i, field.name) || '-' }}</span>
                      </div>
                    </div>
                  </template>
                </div>

                <!-- ===== 하단 영역 (푸터) ===== -->
                <div class="card-footer-section q-pa-sm">
                  <div class="row items-center justify-between">
                    <div class="col-auto">
                      <div class="row items-center q-gutter-x-sm">
                        <span class="text-caption text-grey-6">{{ getRowNumberWithPagination(index, props.pagination) }}</span>
                        <q-icon v-if="isInactive(item.i)" name="do_not_disturb" color="grey-6" size="16px" />
                        <q-icon v-if="getFieldValue(item.i, 'favorite')" name="star" color="yellow" size="16px" />
                        <q-icon v-else name="star_border" color="grey-6" size="16px" />
                        <q-icon v-if="(Number(getFieldValue(item.i, 'file_upload_count')) || 0) > 0" name="attach_file" color="grey-6" size="16px" />
                      </div>
                    </div>
                    <div class="col-auto">
                      <q-btn flat dense round size="sm" icon="more_horiz" color="grey-6" @click.stop="(evt) => handleCardContextMenu(evt, getRowById(item.i))" />
                    </div>
                  </div>
                </div>
              </q-card>
            </grid-item>
          </grid-layout>
        </transition>
      </div>
      <!-- 페이징 영역 (하단 고정) -->
      <div v-if="pagination" class="card-pagination-fixed">
        <DataPageNavigation v-model="localPagination" :total="rows.length" :rows-per-page-options="rowsPerPageOptions" :auto-calculate-rows="false" :show-limit-select="true" :show-info="true" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { GridLayout, GridItem } from 'vue3-grid-layout-next'
import 'vue3-grid-layout-next/dist/style.css'
import DataPageNavigation from 'src/components/ui/DataPageNavigation.vue'
import { getRowNumberWithPagination } from 'src/utils/dataViewUtils'

const props = defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
  rowKey: {
    type: String,
    default: 'id',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  // GridLayout 옵션들
  gridColNum: {
    type: Number,
    default: undefined,
  },
  colsPerRow: {
    type: Number,
    default: undefined,
  },
  rowHeight: {
    type: Number,
    default: undefined,
  },
  isDraggable: {
    type: Boolean,
    default: true,
  },
  isResizable: {
    type: Boolean,
    default: false,
  },
  responsive: {
    type: Boolean,
    default: false,
  },
  verticalCompact: {
    type: Boolean,
    default: true,
  },
  useCssTransforms: {
    type: Boolean,
    default: true,
  },
  margin: {
    type: Array,
    default: undefined,
  },
  maxRows: {
    type: Number,
    default: Infinity,
  },
  preventCollision: {
    type: Boolean,
    default: false,
  },
  compactType: {
    type: String,
    default: 'vertical',
    validator: (value) => ['vertical', 'horizontal', null].includes(value),
  },
  // GridItem 옵션들
  minW: {
    type: Number,
    default: 1,
  },
  minH: {
    type: Number,
    default: 1,
  },
  maxW: {
    type: Number,
    default: Infinity,
  },
  maxH: {
    type: Number,
    default: Infinity,
  },
  // 카드 뷰 설정 (실시간 반영용)
  settings: {
    type: Object,
    default: undefined,
  },
  // 필드명 매핑
  fieldMapping: {
    type: Object,
    default: () => ({}),
  },
  // 사용 가능한 필드 목록
  availableFields: {
    type: Array,
    default: () => [],
  },
  // 선택된 행 목록
  selectedRows: {
    type: Array,
    default: () => [],
  },
  // 롱프레스 중인 행 ID
  longPressingRowId: {
    type: [String, Number],
    default: null,
  },
  // 기능 설정 (selectable, hoverable 등)
  features: {
    type: Object,
    default: () => ({
      selectable: true,
      hoverable: true,
    }),
  },
  // 페이징 설정
  pagination: {
    type: Object,
    default: null,
    validator: (value) => {
      if (value === null) return true
      return typeof value.page === 'number' && typeof value.rowsPerPage === 'number'
    },
  },
  // 페이징 리미트 선택 옵션 (부모에서 전달되지 않을 때만 사용되는 fallback)
  // 일반적으로 PartClassesView에서 viewModeSettings의 값을 전달하므로 이 기본값은 거의 사용되지 않음
  rowsPerPageOptions: {
    type: Array,
    default: () => [10, 25, 50, 100],
  },
})

const emit = defineEmits([
  'layout-updated',
  'card-moved',
  'card-resized',
  'card-drag-start',
  'card-drag-end',
  'card-drag-move',
  'row-click',
  'row-double-click',
  'row-context-menu',
  'row-mouse-down',
  'row-mouse-up',
  'row-mouse-enter',
  'row-mouse-leave',
  'row-mouse-move',
  'update:selectedRows',
  'update:pagination',
  'drag-start',
  'drag-end',
  'drag-over',
  'drag-enter',
  'drag-leave',
  'drag-drop',
  'calculation-complete',
])

// ============================================
// 그리드 레이아웃 기본 설정
// ============================================
//그리드 높이를 1로 하여 정확히 픽셀단위로 카드 높이를 제어할 수 있도록 함
//높이를 1로 하면 그리드 행 사이에 margin이 누적되지 않아서 카드 높이를 정확히 픽셀 단위로 제어할 수 있음
//실제 카드 높이 = cardH × rowHeight + (cardH - 1) × verticalMargin
const CARD_HEIGHT_GRID_UNITS = 1 // 카드 높이 (그리드 단위) - 항상 1로 고정

// ============================================
// 그리드 레이아웃 설정 (사용자 설정용)
// ============================================
const GRID_SETTINGS = reactive({
  gridColNum: 24, // 그리드 열 수 (가로 정밀도)
  colsPerRow: 12, // 한 행에 표시할 카드 개수 (수동 모드용)
  cardHeightPx: 350, // 카드 높이 (픽셀 단위) - 실제 카드 높이 제어

  // 카드 간격 (Gap) 설정
  gap: {
    horizontal: 10, // 가로 간격 (기본값: 6px)
    vertical: 10, // 세로 간격 (기본값: 6px)
  },

  // 반응형 설정
  responsive: {
    enabled: true, // 자동 모드 활성화 (기본값: true)
    colsPerRow: null, // 수동 모드일 때만 값 있음
    fixedCols: false, // 절대 모드 (고정 열 수) - 기본값: false (반응형)
  },

  // 자동 모드 설정 (반응형 레이아웃)
  autoMode: {
    minCols: 1, // 최소 열 수 (작은 화면에서도 최소 이 값 이상 유지)
    maxCols: 12, // 최대 열 수 (큰 화면에서도 최대 이 값 이하로 제한)
    minCardWidthPx: 350, // 값이 클수록 → 작은 화면에서 열 수 감소 (카드가 더 넓어짐), 카드 크기 기준값 (열 수 계산에 사용)
    cardWidthPx: 400, // cardHeight 계산 시 사용됨, 카드 높이 계산용 예상 너비 (실제 카드 너비는 그리드 시스템이 결정)
  },

  // 카드 높이 설정
  cardHeight: {
    mode: 'auto', // 'auto' | 'ratio' | 'pixel'
    ratio: 1.4, // 비율 모드: 카드 너비 대비 높이 비율 (기본값: 1.4 = 140%)
    pixel: 350, // 픽셀 모드: 고정 픽셀 높이
  },
})

// ============================================
// 실제 사용할 값 (props 우선, 없으면 GRID_SETTINGS 사용)
// ============================================
const effectiveGridColNum = computed(() => props.gridColNum ?? GRID_SETTINGS.gridColNum)

// 카드 간격 (Gap) 계산
// props.margin이 있으면 props 사용, 없으면 GRID_SETTINGS.gap 사용
const effectiveMargin = computed(() => {
  if (props.margin) {
    return props.margin
  }
  // gap 기반으로 [horizontal, vertical] 반환
  return [GRID_SETTINGS.gap.horizontal, GRID_SETTINGS.gap.vertical]
})

// 카드 너비 계산 (그리드 기반)
// 실제 카드 너비는 그리드 시스템에 의해 결정되므로, 예상값을 사용
const effectiveCardWidthPx = computed(() => {
  // 자동 모드에서는 autoMode.cardWidthPx 사용
  // 실제로는 그리드 시스템이 너비를 결정하지만, 높이 계산을 위한 예상값으로 사용
  return GRID_SETTINGS.autoMode.cardWidthPx
})

// 카드 높이 계산 (모드에 따라)
const effectiveCardHeightPx = computed(() => {
  const cardWidth = effectiveCardWidthPx.value
  return getCardHeight(GRID_SETTINGS.cardHeight, cardWidth)
})

// 자동 열수 계산 (자동 모드일 때)
// 브라우저 크기에 따라 자동으로 열 수를 계산
const autoColsPerRow = computed(() => {
  if (!GRID_SETTINGS.responsive.enabled) {
    return null
  }

  // autoMode 설정값 직접 사용 (기본값 처리 제거 - 명확하게)
  const { minCols, maxCols, minCardWidthPx } = GRID_SETTINGS.autoMode
  const margin = effectiveMargin.value[0]

  return calculateAutoColsPerRow(windowWidth.value, effectiveGridColNum.value, minCardWidthPx, margin, maxCols, minCols)
})

// 수동 모드 열수 계산 (최소 카드 너비 기반 반응형)
// 사용자가 설정한 colsPerRow를 최대 열 수로 사용하여 화면 크기에 따라 자동 조정
const manualColsPerRow = computed(() => {
  if (GRID_SETTINGS.responsive.enabled) {
    return null // 자동 모드일 때는 null
  }

  // 사용자가 설정한 열 수
  const targetCols = GRID_SETTINGS.responsive.colsPerRow ?? GRID_SETTINGS.colsPerRow

  // 절대 모드 (fixedCols)일 때는 반응형 계산 없이 고정값 반환
  if (GRID_SETTINGS.responsive.fixedCols) {
    return targetCols
  }

  // 반응형 모드: 화면 크기에 따라 자동 조정
  const { minCols } = GRID_SETTINGS.autoMode
  const margin = effectiveMargin.value[0]
  const currentMinCardWidthPx = GRID_SETTINGS.autoMode.minCardWidthPx

  // 화면 크기에 따라 minCardWidthPx를 동적으로 조정
  // 큰 화면: 사용자가 설정한 열 수에 맞게 작게 설정
  // 작은 화면: 카드가 너무 많아지지 않도록 크게 설정
  const availableWidth = windowWidth.value - margin * 2
  const largeScreenWidth = 1920 // 큰 화면 기준

  // 작은 화면에서는 minCardWidthPx를 더 크게 설정하여 열 수를 줄임
  // 화면이 작을수록 minCardWidthPx를 더 크게 (카드가 더 커지도록)
  let effectiveMinCardWidthPx

  if (windowWidth.value >= largeScreenWidth) {
    // 큰 화면: 목표 열 수에 맞게 계산된 값 사용
    const calculatedMinCardWidthPx = Math.floor(availableWidth / targetCols - margin)
    effectiveMinCardWidthPx = Math.max(Math.min(calculatedMinCardWidthPx, currentMinCardWidthPx), currentMinCardWidthPx * 0.5)
  } else {
    // 작은 화면: 화면이 작을수록 minCardWidthPx를 더 크게 설정
    // 화면 크기 비율에 따라 minCardWidthPx 조정 (작은 화면일수록 더 크게)
    const screenRatio = windowWidth.value / largeScreenWidth // 0 ~ 1
    // 작은 화면에서는 기본값보다 더 크게 설정 (최대 1.5배까지)
    const scaleFactor = 1 + (1 - screenRatio) * 0.5 // 1.0 ~ 1.5
    effectiveMinCardWidthPx = currentMinCardWidthPx * scaleFactor
  }

  // 최소 카드 너비를 참조하여 화면 크기에 따라 열 수 자동 조정
  // 사용자가 설정한 값(targetCols)은 최대 크기일 때의 목표 열 수로 사용
  return calculateAutoColsPerRow(
    windowWidth.value,
    effectiveGridColNum.value,
    effectiveMinCardWidthPx,
    margin,
    targetCols, // maxCols 대신 사용자가 설정한 값 사용
    minCols,
  )
})

// 최종 열 수 (props 우선, 없으면 자동/수동 모드에 따라 결정)
const effectiveColsPerRow = computed(() => {
  // props가 있으면 props 사용
  if (props.colsPerRow !== undefined) {
    return props.colsPerRow
  }

  // 자동 모드
  if (GRID_SETTINGS.responsive.enabled) {
    return autoColsPerRow.value ?? GRID_SETTINGS.colsPerRow
  }

  // 수동 모드: 최소 카드 너비 기반 반응형 계산
  return manualColsPerRow.value ?? GRID_SETTINGS.colsPerRow
})

// rowHeight: props가 있으면 props 사용, 없으면 계산된 카드 높이 사용
const effectiveRowHeight = computed(() => props.rowHeight ?? effectiveCardHeightPx.value)

// ============================================
// 페이징 처리
// ============================================
// 페이징된 rows 계산
const paginatedRows = computed(() => {
  if (!props.pagination) {
    return props.rows
  }
  const { page, rowsPerPage } = props.pagination
  const start = (page - 1) * rowsPerPage
  const end = start + rowsPerPage
  return props.rows.slice(start, end)
})

// 로컬 페이징 (v-model)
const localPagination = computed({
  get: () => props.pagination,
  set: (value) => {
    emit('update:pagination', value)
  },
})

// 페이지 전환 애니메이션용 키 (pagination.page 변경 시 변경)
const paginationKey = computed(() => {
  if (!props.pagination) return 'page-1'
  return `page-${props.pagination.page}`
})

const cardLayout = ref([])

// ============================================
// 브라우저 크기 감지 (초기 레이아웃 계산용), 1920 브라우저가 없는 서버(SSR) 계산을 위해 필요, 이후  onMounted에서 실제 브라우저 크기로 업데이트
// ============================================
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1920)

// Debounce 함수
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 브라우저 크기 업데이트 함수
function updateWindowWidth() {
  windowWidth.value = window.innerWidth
}

// Debounced 업데이트 함수
const debouncedUpdateWindowWidth = debounce(updateWindowWidth, 150)

// 마운트 시 실제 브라우저 크기로 업데이트
onMounted(() => {
  windowWidth.value = window.innerWidth
  window.addEventListener('resize', debouncedUpdateWindowWidth)
})

// 컨테이너 ref (부모에서 접근 가능하도록)
const containerRef = ref(null)

onUnmounted(() => {
  window.removeEventListener('resize', debouncedUpdateWindowWidth)
})

// 컴포넌트 expose (부모에서 접근 가능하도록)
defineExpose({
  containerRef,
})

// ============================================
// 유틸리티 함수
// ============================================
/**
 * 숫자의 모든 약수 구하기
 * @param {number} num - 대상 숫자
 * @returns {number[]} 약수 배열 (오름차순)
 */
function getDivisors(num) {
  const divisors = []
  for (let i = 1; i <= num; i++) {
    if (num % i === 0) {
      divisors.push(i)
    }
  }
  return divisors
}

/**
 * 브라우저 크기에 따른 자동 열수 계산
 * 1. 화면에 들어갈 수 있는 카드 수 계산: (windowWidth - margin*2) / (minCardWidthPx + margin)
 * 2. gridColNum의 약수 중에서 선택 (minCols 이상, maxCols 이하)
 * 3. 계산된 카드 수 이하의 최대 약수 선택
 *
 * @param {number} windowWidth - 브라우저 너비 (픽셀)
 * @param {number} gridColNum - 그리드 정밀도
 * @param {number} minCardWidthPx - 최소 카드 너비 (작은 화면 열 수 제어)
 * @param {number} margin - 카드 간격 (가로)
 * @param {number} maxCols - 최대 열 수
 * @param {number} minCols - 최소 열 수
 * @returns {number} 계산된 열 수
 */
function calculateAutoColsPerRow(windowWidth, gridColNum, minCardWidthPx, margin, maxCols, minCols) {
  // gridColNum의 약수 중 maxCols 이하, minCols 이상만 사용
  const allDivisors = getDivisors(gridColNum)
  const availableCols = allDivisors.filter((col) => col >= minCols && col <= maxCols).sort((a, b) => a - b)

  // 한 행에 들어갈 수 있는 카드 수 계산 (최소 카드 너비 기준)
  // availableWidth = windowWidth - (좌우 여백)
  // 한 카드가 차지하는 최소 공간 = minCardWidthPx + margin
  const availableWidth = windowWidth - margin * 2
  const cardsPerRow = Math.floor(availableWidth / (minCardWidthPx + margin))

  // availableCols에서 cardsPerRow보다 작거나 같은 값 중 최대값 선택
  const selectedCols = availableCols.filter((col) => col <= cardsPerRow).sort((a, b) => b - a)[0]

  // minCols와 maxCols 사이의 값으로 제한
  if (selectedCols === undefined) {
    return Math.max(minCols, availableCols[0] || minCols)
  }

  return Math.max(minCols, Math.min(selectedCols, maxCols))
}

/**
 * 최종 카드 높이 계산
 * 옵션 1: 고정 비율 사용 (복잡도 낮음)
 * @param {object} settings - GRID_SETTINGS.cardHeight
 * @param {number} cardWidthPx - 카드 너비 (픽셀)
 * @returns {number} 최종 카드 높이 (픽셀)
 */
function getCardHeight(settings, cardWidthPx) {
  switch (settings.mode) {
    case 'auto':
      // 자동 모드: 고정 비율 1.4 사용
      return Math.round(cardWidthPx * 0.9)

    case 'ratio':
      // 비율 모드: 사용자가 지정한 비율 사용
      return Math.round(cardWidthPx * settings.ratio)

    case 'pixel':
      // 픽셀 모드: 고정 픽셀 높이
      return settings.pixel

    default:
      // 기본값: 자동 모드 (고정 비율 1.4)
      return Math.round(cardWidthPx * 1.4)
  }
}

// rows를 Map으로 변환하여 빠른 조회 (getRowById 최적화)
const rowsMap = computed(() => {
  const map = new Map()
  props.rows.forEach((row) => {
    map.set(String(row[props.rowKey]), row)
  })
  return map
})

// ============================================
// 레이아웃 초기화
// ============================================
function initializeLayout() {
  // 페이징된 rows 사용
  const rowsToDisplay = paginatedRows.value

  if (!rowsToDisplay || rowsToDisplay.length === 0) {
    cardLayout.value = []
    return
  }

  const colsPerRow = effectiveColsPerRow.value
  const gridColNum = effectiveGridColNum.value
  const cardW = Math.floor(gridColNum / colsPerRow)

  const layout = rowsToDisplay.map((row, index) => {
    const rowIndex = Math.floor(index / colsPerRow)
    const colIndex = index % colsPerRow

    return {
      i: String(row[props.rowKey]),
      x: colIndex * cardW,
      y: rowIndex * CARD_HEIGHT_GRID_UNITS, // 그리드 단위만 사용 (margin은 라이브러리가 처리)
      w: cardW,
      h: CARD_HEIGHT_GRID_UNITS, // 항상 1로 고정
      static: false,
    }
  })

  cardLayout.value = layout
}

// ============================================
// 이벤트 핸들러
// ============================================
function handleLayoutUpdated(newLayout) {
  // 라이브러리가 레이아웃을 변경할 때 카드 높이와 너비를 강제로 보존
  // 너비만 저장 (높이는 항상 1이므로 불필요, x, y는 사용 안 함)
  const originalWidthMap = new Map()
  cardLayout.value.forEach((item) => {
    originalWidthMap.set(item.i, item.w)
  })

  // 새 레이아웃에 원래 높이와 너비 적용
  newLayout.forEach((item) => {
    item.h = CARD_HEIGHT_GRID_UNITS // 항상 1로 고정
    const originalWidth = originalWidthMap.get(item.i)
    if (originalWidth !== undefined) {
      item.w = originalWidth // 너비 보존
    }
  })

  cardLayout.value = newLayout
  emit('layout-updated', newLayout)
}

// rows를 Map으로 변환하여 O(1) 조회 성능
function getRowById(id) {
  return rowsMap.value.get(String(id))
}

// 필드 값 가져오기 (fieldMapping 적용)
function getFieldValue(id, fieldName) {
  const row = getRowById(id)
  if (!row) return null

  // fieldMapping이 있으면 매핑된 필드명 사용, 없으면 원본 필드명 사용
  const mappedFieldName = props.fieldMapping?.[fieldName] || fieldName
  return row[mappedFieldName]
}

// 카드 이미지 가져오기
function getCardImage(id) {
  const row = getRowById(id)
  if (!row) return null

  // 이미지 필드 찾기 (image, image_url, thumbnail 등)
  const imageFields = ['image', 'image_url', 'thumbnail', 'photo', 'picture']
  for (const field of imageFields) {
    const mappedField = props.fieldMapping?.[field] || field
    if (row[mappedField]) {
      return row[mappedField]
    }
  }
  return null
}

// 표시할 필드 목록 계산
const visibleFieldsList = computed(() => {
  if (!props.availableFields || props.availableFields.length === 0) {
    return []
  }

  const settings = props.settings || {}
  const visibleFields = settings.visibleFields || []

  // visibleFields가 비어있으면 모든 필드 표시
  if (visibleFields.length === 0) {
    return props.availableFields.filter((field) => field.name !== 'name') // name은 이미 제목으로 표시
  }

  // visibleFields에 있는 필드만 필터링 (name 제외)
  return props.availableFields.filter((field) => visibleFields.includes(field.name) && field.name !== 'name')
})

// 이미지 표시 여부
const shouldShowImage = computed(() => {
  const settings = props.settings || {}
  return settings.showImage !== false // 기본값: true
})

// 이미지 위치
const imagePosition = computed(() => {
  const settings = props.settings || {}
  return settings.imagePosition || 'top' // 기본값: 'top'
})

// 선택 상태 확인 (DataTableRenderer 패턴 참고)
function isSelected(id) {
  if (!props.selectedRows || !Array.isArray(props.selectedRows) || props.selectedRows.length === 0) {
    return false
  }
  // selectedRows가 ID 배열인지 객체 배열인지 확인
  const firstItem = props.selectedRows[0]
  if (firstItem === undefined || firstItem === null) {
    return false
  }
  const isIdArray = typeof firstItem !== 'object'
  if (isIdArray) {
    // ID 배열인 경우
    return props.selectedRows.includes(id)
  } else {
    // 객체 배열인 경우
    return props.selectedRows.some((selectedRow) => String(selectedRow[props.rowKey]) === String(id))
  }
}

// 롱프레스 상태 확인
function isLongPressing(id) {
  return props.longPressingRowId !== null && props.longPressingRowId !== undefined && String(props.longPressingRowId) === String(id)
}

// 비활성 상태 확인
function isInactive(id) {
  const row = getRowById(id)
  if (!row) return false
  // is_active 필드 확인 (fieldMapping 적용)
  const activeField = props.fieldMapping?.active || 'active'
  const mappedActiveField = props.fieldMapping?.[activeField] || activeField
  const isActive = row[mappedActiveField]
  return isActive === 0 || isActive === false
}

// ============================================
// 카드 이벤트 핸들러 (DataTableRenderer 패턴 참고)
// ============================================
function handleCardClick(event, row) {
  // row가 없으면 item.i로 직접 찾기 시도 (handleCardMouseEnter 패턴 참고)
  if (!row) {
    const cardElement = event?.currentTarget || event?.target
    if (cardElement) {
      const rowId = cardElement.getAttribute('data-row-id')
      if (rowId) {
        row = getRowById(rowId)
      } else {
        // data-row-id가 없으면 가장 가까운 부모 요소에서 찾기
        const parentWithRowId = cardElement.closest('[data-row-id]')
        if (parentWithRowId) {
          const dataRowId = parentWithRowId.getAttribute('data-row-id')
          if (dataRowId) {
            row = getRowById(dataRowId)
          }
        }
      }
    }
  }
  if (row) {
    emit('row-click', event, row)
  }
}

function handleCardDoubleClick(event, row) {
  if (row) {
    emit('row-double-click', event, row)
  }
}

function handleCardContextMenu(event, row) {
  if (row) {
    emit('row-context-menu', event, row)
  }
}

function handleCardMouseDown(event, row) {
  // row가 없으면 item.i로 직접 찾기 시도 (handleCardMouseEnter 패턴 참고)
  if (!row) {
    const cardElement = event?.currentTarget || event?.target
    if (cardElement) {
      const rowId = cardElement.getAttribute('data-row-id')
      if (rowId) {
        row = getRowById(rowId)
      } else {
        // data-row-id가 없으면 가장 가까운 부모 요소에서 찾기
        const parentWithRowId = cardElement.closest('[data-row-id]')
        if (parentWithRowId) {
          const dataRowId = parentWithRowId.getAttribute('data-row-id')
          if (dataRowId) {
            row = getRowById(dataRowId)
          }
        }
      }
    }
  }
  if (row) {
    emit('row-mouse-down', event, row)
  }
}

function handleCardMouseUp(event) {
  emit('row-mouse-up', event)
}

function handleCardMouseEnter(event, row) {
  if (!row) {
    // row가 없으면 item.i로 직접 찾기 시도
    const cardElement = event?.currentTarget || event?.target
    if (cardElement) {
      const rowId = cardElement.getAttribute('data-row-id')
      if (rowId) {
        row = getRowById(rowId)
      } else {
        // data-row-id가 없으면 가장 가까운 부모 요소에서 찾기
        const parentWithRowId = cardElement.closest('[data-row-id]')
        if (parentWithRowId) {
          const dataRowId = parentWithRowId.getAttribute('data-row-id')
          if (dataRowId) {
            row = getRowById(dataRowId)
          }
        }
      }
    }
  }
  if (row) {
    emit('row-mouse-enter', event, row)
  }
}

function handleCardMouseMove(event, row) {
  if (!row) {
    // row가 없으면 item.i로 직접 찾기 시도
    const cardElement = event?.currentTarget || event?.target
    if (cardElement) {
      const rowId = cardElement.getAttribute('data-row-id')
      if (rowId) {
        row = getRowById(rowId)
      } else {
        // data-row-id가 없으면 가장 가까운 부모 요소에서 찾기
        const parentWithRowId = cardElement.closest('[data-row-id]')
        if (parentWithRowId) {
          const dataRowId = parentWithRowId.getAttribute('data-row-id')
          if (dataRowId) {
            row = getRowById(dataRowId)
          }
        }
      }
    }
  }
  if (row) {
    emit('row-mouse-move', event, row)
  }
}

function handleCardMouseLeave(event) {
  // mouseleave 이벤트는 row 정보가 필요 없지만, 일관성을 위해 emit
  emit('row-mouse-leave', event)
}

function handleCardMoved(i, newX, newY) {
  emit('card-moved', i, newX, newY)
}

function handleCardResized(i, newH, newW, newHPx, newWPx) {
  emit('card-resized', i, newH, newW, newHPx, newWPx)
}

function handleCardDragStart(i) {
  emit('card-drag-start', i)
}

function handleCardDragEnd(i) {
  emit('card-drag-end', i)
}

function handleCardDragMove(i, newX, newY) {
  emit('card-drag-move', i, newX, newY)
}

// ============================================
// Watch: 레이아웃 재계산 트리거
// ============================================
// rows 변경 시 레이아웃 재계산
watch(
  () => props.rows,
  (newRows, oldRows) => {
    if (newRows && newRows.length > 0) {
      // 뷰 모드 전환 감지: 이전에 rows가 없었거나 길이가 0이었을 때
      const isViewModeSwitch = !oldRows || oldRows.length === 0

      if (isViewModeSwitch) {
        // 뷰 모드 전환 시: DOM이 완전히 렌더링될 때까지 대기 후 레이아웃 재계산
        nextTick(() => {
          // windowWidth를 최신값으로 업데이트
          if (typeof window !== 'undefined') {
            windowWidth.value = window.innerWidth
          }
          // 약간의 지연 후 레이아웃 초기화 (컨테이너가 완전히 렌더링되도록)
          // requestAnimationFrame을 사용하여 강제 reflow 방지
          setTimeout(() => {
            requestAnimationFrame(() => {
              initializeLayout()
            })
          }, 50)
        })
      } else {
        // 일반적인 rows 변경: requestAnimationFrame을 사용하여 강제 reflow 방지
        requestAnimationFrame(() => {
          initializeLayout()
        })
      }
    } else {
      cardLayout.value = []
    }
  },
  { immediate: true },
)

// 브라우저 크기 변경 시 레이아웃 재계산 (자동 모드와 수동 모드 모두 반응형)
watch(
  () => windowWidth.value,
  () => {
    // 자동 모드와 수동 모드 모두에서 최소 카드 너비 기반 반응형 계산이 동작하므로 재계산 필요
    // requestAnimationFrame을 사용하여 강제 reflow 방지
    if (props.rows && props.rows.length > 0) {
      requestAnimationFrame(() => {
        initializeLayout()
      })
    }
  },
)

// props.settings 변경 시 GRID_SETTINGS 업데이트 (실시간 반영)
watch(
  () => props.settings,
  (newSettings) => {
    if (!newSettings) return

    // gridColNum 업데이트
    if (newSettings.gridColNum !== undefined) {
      GRID_SETTINGS.gridColNum = newSettings.gridColNum
    }

    // colsPerRow 업데이트
    if (newSettings.colsPerRow !== undefined) {
      GRID_SETTINGS.colsPerRow = newSettings.colsPerRow
    }

    // responsive 업데이트
    if (newSettings.responsive) {
      if (newSettings.responsive.enabled !== undefined) {
        GRID_SETTINGS.responsive.enabled = newSettings.responsive.enabled
      }
      if (newSettings.responsive.colsPerRow !== undefined) {
        GRID_SETTINGS.responsive.colsPerRow = newSettings.responsive.colsPerRow
      }
      if (newSettings.responsive.fixedCols !== undefined) {
        GRID_SETTINGS.responsive.fixedCols = newSettings.responsive.fixedCols
      }
    }

    // autoMode 업데이트
    if (newSettings.autoMode) {
      if (newSettings.autoMode.minCols !== undefined) {
        GRID_SETTINGS.autoMode.minCols = newSettings.autoMode.minCols
      }
      if (newSettings.autoMode.maxCols !== undefined) {
        GRID_SETTINGS.autoMode.maxCols = newSettings.autoMode.maxCols
      }
      if (newSettings.autoMode.minCardWidthPx !== undefined) {
        GRID_SETTINGS.autoMode.minCardWidthPx = newSettings.autoMode.minCardWidthPx
      }
      if (newSettings.autoMode.cardWidthPx !== undefined) {
        GRID_SETTINGS.autoMode.cardWidthPx = newSettings.autoMode.cardWidthPx
      }
    }

    // cardHeight 업데이트
    if (newSettings.cardHeight) {
      if (newSettings.cardHeight.mode !== undefined) {
        GRID_SETTINGS.cardHeight.mode = newSettings.cardHeight.mode
      }
      if (newSettings.cardHeight.ratio !== undefined) {
        GRID_SETTINGS.cardHeight.ratio = newSettings.cardHeight.ratio
      }
      if (newSettings.cardHeight.pixel !== undefined) {
        GRID_SETTINGS.cardHeight.pixel = newSettings.cardHeight.pixel
      }
    }

    // gap 업데이트
    if (newSettings.gap) {
      if (newSettings.gap.horizontal !== undefined) {
        GRID_SETTINGS.gap.horizontal = newSettings.gap.horizontal
      }
      if (newSettings.gap.vertical !== undefined) {
        GRID_SETTINGS.gap.vertical = newSettings.gap.vertical
      }
    }
  },
  { deep: true, immediate: true },
)

// GRID_SETTINGS 변경 시 (gap 제외)
watch(
  () => [
    GRID_SETTINGS.gridColNum,
    GRID_SETTINGS.colsPerRow,
    GRID_SETTINGS.cardHeightPx,
    GRID_SETTINGS.responsive.enabled,
    GRID_SETTINGS.responsive.colsPerRow,
    GRID_SETTINGS.responsive.fixedCols,
    GRID_SETTINGS.autoMode.maxCols,
    GRID_SETTINGS.autoMode.minCols,
    GRID_SETTINGS.autoMode.minCardWidthPx,
    GRID_SETTINGS.autoMode.cardWidthPx,
    GRID_SETTINGS.cardHeight.mode,
    GRID_SETTINGS.cardHeight.ratio,
    GRID_SETTINGS.cardHeight.pixel,
  ],
  () => {
    if (props.rows && props.rows.length > 0) {
      initializeLayout()
    }
  },
)

// gap 변경 시: 라이브러리가 자동으로 처리하므로 레이아웃 재초기화 불필요
// 하지만 gap 변경도 감지하여 반영되도록 watch 추가 (라이브러리가 자동 처리)
watch(
  () => [GRID_SETTINGS.gap.horizontal, GRID_SETTINGS.gap.vertical],
  () => {
    // gap은 vue3-grid-layout-next가 자동으로 처리하므로 레이아웃을 재초기화할 필요 없음
    // 레이아웃을 재초기화하면 라이브러리가 카드 높이를 변경할 수 있음
    // 여기서는 watch만 추가하여 변경을 감지 (실제 반영은 라이브러리가 처리)
  },
)

// pagination 변경 시 레이아웃 재계산
watch(
  () => props.pagination,
  () => {
    if (props.rows && props.rows.length > 0) {
      initializeLayout()
    }
  },
  { deep: true },
)
</script>

<style lang="scss">
// NEXA 시스템 스타일은 quasar.config.js에서 전역으로 import됨
// @import '../../../css/nexa-card-features.scss'; // 제거됨 (nexa-system.scss로 통합)
</style>

<style lang="scss" scoped>
.data-card-renderer {
  width: 100%;
}

.data-card-container-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0; /* flex 자식 요소가 overflow를 처리할 수 있도록 */
}

.data-card-container {
  width: 100%;
  min-height: 100px;
  flex: 1;
  overflow-y: auto;
}

.card-pagination-fixed {
  width: 100%;
  padding: 0 12px;
}

.data-card-grid-layout {
  width: 100%;
}

.data-card-grid-item:hover {
  opacity: 0.9;
}
</style>
