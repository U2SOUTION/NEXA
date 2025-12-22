<!--
  DataTableRenderer.vue
  범용 테이블 데이터 렌더러 컴포넌트

  모든 테이블에서 공통으로 사용할 수 있는 범용 테이블 데이터 렌더러 컴포넌트입니다.
  뷰 모드 설정을 적용하고, 선택적 기능(드래그앤드롭, 선택, 호버 등)을 제공합니다.
-->
<template>
  <div class="data-table-renderer" ref="tableWrapperRef">
    <div class="parts-table" :class="{ 'table-striped': striped }">
      <q-table
        v-if="loading || rows.length > 0"
        ref="qTableRef"
        :rows="rows"
        :columns="displayColumns"
        :row-key="rowKey"
        :loading="loading"
        v-model:pagination="localPagination"
        @row-contextmenu="handleRowContextMenu"
        v-model:selected="localSelectedRows"
        :selection="selectionMode"
        :row-class="rowClass"
        :rows-per-page-options="rowsPerPageOptions"
        flat
        bordered
        :style="{ border: 'none', boxShadow: 'none', outline: 'none' }"
      >
        <!-- 헤더 슬롯 -->
        <template v-if="$slots.header" v-slot:header="props">
          <slot name="header" :props="props" :getColumnClass="getColumnClass" />
        </template>
        <template v-else v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" :class="getColumnClass(col)" :style="col.headerStyle || col.style">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <!-- 페이징 슬롯 -->
        <template v-if="$slots.bottom" v-slot:bottom>
          <slot name="bottom" :pagination="localPagination" :total="rows.length" :table-wrapper-ref="getEffectiveTableWrapperRef()" />
        </template>
        <template v-else v-slot:bottom>
          <DataPageNavigation
            v-if="useDefaultPagination"
            ref="paginationTableRef"
            v-model="localPagination"
            :total="rows.length"
            :table-wrapper-ref="tableWrapperRef"
            :rows-per-page-options="rowsPerPageOptions"
            :auto-calculate-rows="autoCalculateRows"
            @calculation-complete="handleCalculationComplete"
          />
        </template>

        <!-- Body 슬롯 -->
        <template v-slot:body="props">
          <q-tr
            :props="props"
            :data-row-id="props.row[rowKey]"
            :class="getRowClass(props, features, rowKey, longPressingRowId)"
            :style="getRowStyle(props, features, rowKey)"
            :draggable="features.draggable"
            @click="handleRowClick($event, props.row)"
            @mousedown="features.selectable ? handleRowMouseDown($event, props.row) : undefined"
            @mouseup="features.selectable ? handleRowMouseUp($event) : undefined"
            @mouseenter="features.hoverable ? handleRowMouseEnter($event, props.row) : undefined"
            @mousemove="features.hoverable ? handleRowMouseMove($event, props.row) : undefined"
            @mouseleave="features.hoverable ? handleRowMouseLeave($event) : undefined"
            @dragstart="features.draggable ? handleDragStart($event, props.row) : undefined"
            @dragend="features.draggable ? handleDragEnd($event) : undefined"
            @dragover.prevent="features.draggable ? handleDragOver($event, props.row) : undefined"
            @dragenter.prevent="features.draggable ? handleDragEnter(props.row) : undefined"
            @dragleave="features.draggable ? handleDragLeave() : undefined"
            @drop.prevent="features.draggable ? handleDragDrop($event, props.row) : undefined"
          >
            <q-td v-for="col in props.cols" :key="col.name" :props="props" :class="[getColumnClass(col), { 'last-cell': col.name === props.cols[props.cols.length - 1].name }]" :style="[col.style, getCellStyle(props, features, rowKey)]">
              <!-- 컬럼별 커스텀 슬롯 -->
              <slot :name="`body-cell-${col.name}`" :props="props" :col="col" :fieldMapping="normalizedFieldMapping" :getFieldValue="getFieldValueHelper">
                <!-- 기본 렌더링 -->
                {{ col.value }}
              </slot>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DataPageNavigation from 'src/components/ui/DataPageNavigation.vue'
import { applyTableViewSettings } from 'src/utils/view-mode/viewSettingsApplier'
import { getFieldValue, normalizeFieldMapping, getDefaultFieldMapping } from 'src/utils/view-mode/viewFieldMapping'

const props = defineProps({
  // 기본 데이터
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
  columns: {
    type: Array,
    required: true,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pagination: {
    type: Object,
    required: true,
    default: () => ({
      sortBy: null,
      descending: false,
      page: 1,
      rowsPerPage: 25,
    }),
  },
  rowKey: {
    type: String,
    default: 'id',
  },

  // 필드명 매핑
  fieldMapping: {
    type: Object,
    default: () => getDefaultFieldMapping(),
  },

  // 기능 플래그
  features: {
    type: Object,
    default: () => ({
      draggable: false,
      selectable: false,
      hoverable: false,
      contextMenu: false,
    }),
  },

  // 뷰 모드 설정
  viewSettings: {
    type: Object,
    default: () => ({}),
  },

  // 페이징 리미트 선택 옵션 (부모에서 전달되지 않을 때만 사용되는 fallback)
  // 일반적으로 PartClassesView에서 viewModeSettings의 값을 전달하므로 이 기본값은 거의 사용되지 않음
  rowsPerPageOptions: {
    type: Array,
    default: () => [10, 25, 50, 100],
  },
  useDefaultPagination: {
    type: Boolean,
    default: true,
  },
  autoCalculateRows: {
    type: Boolean,
    default: true,
  },

  // 행 클래스 함수
  rowClass: {
    type: Function,
    default: null,
  },

  // 선택된 행
  selectedRows: {
    type: Array,
    default: () => [],
  },

  // 스트라이프 표시 여부 (선택적)
  // 기본값: false (가독성 및 멀티 셀렉터와의 충돌 방지)
  // true로 설정 시: 인터랙티브가 필요없는 데이터, 로우가 많은 데이터 등에 유용
  striped: {
    type: Boolean,
    default: false,
  },

  // 외부 테이블 래퍼 ref (부모 컴포넌트의 tableWrapperRef)
  // 이 prop이 제공되면 내부 tableWrapperRef 대신 이 ref를 사용
  externalTableWrapperRef: {
    type: [Object, null],
    default: null,
  },

  // 롱프레스 중인 행 ID (부모 컴포넌트에서 전달)
  longPressingRowId: {
    type: [String, Number, null],
    default: null,
  },
})

const emit = defineEmits(['update:pagination', 'update:selectedRows', 'row-click', 'row-context-menu', 'row-mouse-down', 'row-mouse-up', 'row-mouse-enter', 'row-mouse-move', 'row-mouse-leave', 'drag-start', 'drag-end', 'drag-over', 'drag-enter', 'drag-leave', 'drag-drop', 'calculation-complete'])

// Refs
const tableWrapperRef = ref(null)
const paginationTableRef = ref(null)
const qTableRef = ref(null)

// 효과적인 tableWrapperRef 반환 (externalTableWrapperRef 우선)
function getEffectiveTableWrapperRef() {
  if (props.externalTableWrapperRef) {
    return props.externalTableWrapperRef
  }
  return tableWrapperRef
}

// 정규화된 필드명 매핑
const normalizedFieldMapping = computed(() => {
  return normalizeFieldMapping(getDefaultFieldMapping(), props.fieldMapping)
})

// 뷰 모드 설정이 적용된 컬럼
const displayColumns = computed(() => {
  if (!props.columns || props.columns.length === 0) {
    return []
  }

  // 뷰 모드 설정이 있으면 적용
  if (props.viewSettings && Object.keys(props.viewSettings).length > 0) {
    return applyTableViewSettings(props.columns, props.viewSettings)
  }

  return props.columns
})

// 로컬 페이지네이션 (v-model)
const localPagination = computed({
  get: () => props.pagination,
  set: (value) => {
    emit('update:pagination', value)
  },
})

// 로컬 선택된 행 (v-model)
const localSelectedRows = computed({
  get: () => props.selectedRows,
  set: (value) => {
    emit('update:selectedRows', value)
  },
})

// 선택 모드
const selectionMode = computed(() => {
  if (!props.features.selectable) {
    return 'none'
  }
  // TODO: multiSelectMode 로직은 부모 컴포넌트에서 처리
  return 'multiple'
})

// Quasar row-class prop용 함수 (컴포넌트 props.selectedRows를 클로저로 캡처)
// 모든 뷰에서 통일된 클래스명 사용 (nexa-item.scss 참조)
// - .nexa-item-selected: 선택된 아이템
// - .nexa-item-inactive: 비활성 아이템 (사용자 정의 rowClass에서 처리)
const rowClass = computed(() => {
  return (row) => {
    const classes = []

    // 선택된 행: .nexa-item-selected 클래스 추가 (모든 뷰 통일)
    if (props.selectedRows && Array.isArray(props.selectedRows)) {
      const isSelected = props.selectedRows.some((selectedRow) => selectedRow[props.rowKey] === row[props.rowKey])
      if (isSelected) {
        classes.push('nexa-item-selected')
      }
    }

    // 사용자 정의 rowClass prop 함수 (예: .nexa-item-inactive 등)
    if (props.rowClass) {
      const customClass = props.rowClass(row)
      if (customClass) {
        classes.push(customClass)
      }
    }

    return classes.join(' ')
  }
})

// TODO: 기본 정렬 기능 구현
// - 뷰 모드 설정의 defaultSort를 테이블에 적용
// - 설정에서 정렬 컬럼/방향 변경 시 실시간 반영
// - 테이블에서 직접 정렬 변경 시 설정에 저장
// 문제점: Quasar 테이블의 v-model:pagination과 computed의 set을 통한 정렬 변경이
// 같은 컬럼에서 descending만 변경될 때 제대로 반영되지 않음
// 해결 방안:
// 1. @request 이벤트 사용 (시도했으나 페이징 문제 발생)
// 2. ref를 통한 직접 접근
// 3. 테이블 key를 이용한 강제 재렌더링
// 4. 테이블에서 직접 정렬 변경 시에만 저장하고, 설정에서 변경은 포기

// 필드 값 가져오기 헬퍼 (이름 충돌 방지)
function getFieldValueHelper(row, fieldKey) {
  return getFieldValue(row, fieldKey, normalizedFieldMapping.value)
}

// 행 클래스 계산 (직접 호출용)
// 모든 뷰에서 통일된 클래스명 사용 (nexa-item.scss 참조)
// - .nexa-item-selected: 선택된 아이템
// - .nexa-item-inactive: 비활성 아이템 (사용자 정의 rowClass에서 처리)
// - .nexa-item-long-pressing: 롱프레스 아이템
function getRowClass(props, featuresParam, rowKeyParam, longPressingRowIdParam) {
  const classes = ['table-row-with-actions']
  const row = props.row || props // Quasar row-class는 row만 전달, 직접 호출은 props 객체
  const rowId = row[rowKeyParam]

  // 선택된 행: .nexa-item-selected 클래스 추가 (모든 뷰 통일)
  // 컴포넌트의 props.selectedRows를 직접 참조 (클로저를 통해 접근)
  if (props.selectedRows && Array.isArray(props.selectedRows)) {
    const isSelected = props.selectedRows.some((selectedRow) => selectedRow[rowKeyParam] === rowId)
    if (isSelected) {
      classes.push('nexa-item-selected')
    }
  }

  // 롱프레스 상태: .nexa-item-long-pressing 클래스 추가
  if (longPressingRowIdParam !== null && longPressingRowIdParam !== undefined && longPressingRowIdParam === props.row[rowKeyParam]) {
    classes.push('nexa-item-long-pressing')
  }

  // 드래그 가능한 행
  if (featuresParam.draggable) {
    classes.push('draggable-row')
  }

  // 드래그 상태
  if (featuresParam.draggable && draggedRowId.value === props.row[rowKeyParam]) {
    classes.push('is-dragging')
  }
  if (featuresParam.draggable && dragOverRowId.value === props.row[rowKeyParam]) {
    classes.push('drag-over')
  }

  return classes.join(' ')
}

// 행 스타일 계산
function getRowStyle(props, featuresParam, rowKeyParam) {
  if (featuresParam.draggable && dragOverRowId.value === props.row[rowKeyParam]) {
    return {
      backgroundColor: 'rgba(65, 170, 223, 0.3)',
      borderLeft: '3px solid #41aadf',
      borderTop: '1px dashed rgba(65, 170, 223, 0.5)',
      borderBottom: '1px dashed rgba(65, 170, 223, 0.5)',
    }
  }
  return {}
}

// 셀 스타일 계산
function getCellStyle(props, featuresParam, rowKeyParam) {
  if (featuresParam.draggable && dragOverRowId.value === props.row[rowKeyParam]) {
    return { backgroundColor: 'rgba(65, 170, 223, 0.3)' }
  }
  return {}
}

// 컬럼 클래스 계산 (col.name + col.classes)
function getColumnClass(col) {
  const classes = [col.name]
  if (col.classes) {
    // col.classes가 문자열이면 공백으로 분리, 배열이면 그대로 사용
    if (typeof col.classes === 'string') {
      classes.push(...col.classes.split(' ').filter((c) => c))
    } else if (Array.isArray(col.classes)) {
      classes.push(...col.classes)
    }
  }
  return classes.join(' ')
}

// 드래그앤드롭 상태 (features.draggable이 true일 때만 사용)
const draggedRowId = ref(null)
const dragOverRowId = ref(null)

// 이벤트 핸들러
function handleRowClick(event, row) {
  emit('row-click', event, row)
}

function handleRowContextMenu(event) {
  if (props.features.contextMenu) {
    emit('row-context-menu', event)
  }
}

function handleRowMouseDown(event, row) {
  emit('row-mouse-down', event, row)
}

function handleRowMouseUp(event) {
  emit('row-mouse-up', event)
}

function handleRowMouseEnter(event, row) {
  emit('row-mouse-enter', event, row)
}

function handleRowMouseMove(event, row) {
  emit('row-mouse-move', event, row)
}

function handleRowMouseLeave(event) {
  emit('row-mouse-leave', event)
}

function handleDragStart(event, row) {
  draggedRowId.value = row[props.rowKey]
  emit('drag-start', event, row)
}

function handleDragEnd(event) {
  draggedRowId.value = null
  dragOverRowId.value = null
  emit('drag-end', event)
}

function handleDragOver(event, row) {
  emit('drag-over', event, row)
}

function handleDragEnter(row) {
  dragOverRowId.value = row[props.rowKey]
  emit('drag-enter', row)
}

function handleDragLeave() {
  dragOverRowId.value = null
  emit('drag-leave')
}

function handleDragDrop(event, row) {
  dragOverRowId.value = null
  emit('drag-drop', event, row)
}

function handleCalculationComplete() {
  emit('calculation-complete')
}

// 외부에서 접근 가능한 메서드
defineExpose({
  tableWrapperRef,
  paginationTableRef,
})
</script>

<style lang="scss" scoped>
// NEXA 시스템 스타일은 quasar.config.js에서 전역으로 import됨
// @import '../../../css/nexa-table-features.scss'; // 제거됨 (nexa-system.scss로 통합)

// 1단계는 app.scss에서 전역으로 적용됨
// .table-row-with-actions 스타일은 nexa-table-features.scss에서 관리됨
// 드래그, 선택, 호버 등 모든 기능 스타일은 2단계에서 처리
</style>
