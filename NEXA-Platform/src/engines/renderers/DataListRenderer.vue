<!--
  DataListRenderer.vue
  범용 리스트 데이터 렌더러 컴포넌트

  모든 리스트에서 공통으로 사용할 수 있는 범용 리스트 데이터 렌더러 컴포넌트입니다.
  뷰 모드 설정을 적용하고, 선택적 기능(드래그앤드롭, 선택, 호버 등)을 제공합니다.
-->
<template>
  <div class="data-list-renderer" ref="listWrapperRef" :key="`list-renderer-${LIST_SETTINGS.expandMode}`">
    <div v-if="loading" class="text-center q-pa-xl">
      <div class="text-h6">로딩 중...</div>
    </div>

    <div v-else-if="rows.length === 0" class="text-center q-pa-xl">
      <q-icon name="inbox" size="64px" color="grey-5" />
      <div class="text-h6 q-mt-md text-grey-6">데이터가 없습니다</div>
    </div>

    <div v-else class="data-list-container">
      <!-- 전체 펼침 모드 (항상 펼쳐진 상태) - 일단 주석 처리 -->

      <!-- 커스텀 아코디언 모드 (q-expansion-item 대신 완전 커스텀) -->
      <div
        :key="`expandable-${currentExpandMode}`"
        class="data-list-items"
        :class="{
          'list-spacing-compact': LIST_SETTINGS.rowSpacing === 'compact',
          'list-spacing-normal': LIST_SETTINGS.rowSpacing === 'normal' || !LIST_SETTINGS.rowSpacing,
          'list-spacing-comfortable': LIST_SETTINGS.rowSpacing === 'comfortable',
          'list-font-small': LIST_SETTINGS.fontSize === 'small',
          'list-font-medium': LIST_SETTINGS.fontSize === 'medium' || !LIST_SETTINGS.fontSize,
          'list-font-large': LIST_SETTINGS.fontSize === 'large',
        }"
      >
        <div
          v-for="(row, index) in paginatedRows"
          :key="row[rowKey]"
          :data-row-id="row[rowKey]"
          :class="getListItemClass(row)"
          :style="getListItemStyle(row)"
          class="data-list-item"
          @dblclick="handleRowDoubleClick($event, row)"
          @contextmenu="handleRowContextMenu($event, row)"
          @dragover.prevent="features.draggable ? handleDragOver($event, row) : undefined"
          @dragenter.prevent="features.draggable ? handleDragEnter(row) : undefined"
          @dragleave="features.draggable ? handleDragLeave() : undefined"
          @drop.prevent="features.draggable ? handleDragDrop($event, row) : undefined"
        >
          <!-- 헤더 (배경색 적용 영역) -->
          <div
            class="data-list-header"
            :class="{ 'draggable-header': features.draggable }"
            :draggable="features.draggable"
            @dragstart.stop="features.draggable ? handleDragStart($event, row) : undefined"
            @dragend.stop="features.draggable ? handleDragEnd($event) : undefined"
            @mousedown.stop="features.selectable ? handleExpansionItemMouseDown($event, row) : undefined"
            @mouseup="features.selectable ? handleRowMouseUp($event) : undefined"
            @click="features.selectable ? handleExpansionItemClick($event, row) : undefined"
            @mouseenter="features.hoverable ? handleRowMouseEnter($event, row) : undefined"
            @mousemove="features.hoverable ? handleRowMouseMove($event, row) : undefined"
            @mouseleave="features.hoverable ? handleRowMouseLeave($event) : undefined"
          >
            <div class="data-list-header-content row items-center no-wrap">
              <div v-if="shouldShowRowNumber" class="list-item-number">
                <span class="text-caption text-grey-6">{{ getRowNumberWithPagination(index, localPagination) }}</span>
              </div>

              <div class="list-item-header-name flex-1">
                <div class="list-item-header-content-inner">
                  <div class="list-item-field" style="font-weight: 700">
                    <span class="list-field-value">{{ getFieldValueForList(row, { name: 'name', field: 'name', label: 'Class Name' }) || '-' }}</span>
                  </div>
                </div>
              </div>

              <div v-if="shouldShowActions" class="list-item-actions row items-center q-gutter-x-xs">
                <q-icon v-if="isInactive(row)" name="do_not_disturb" color="grey-6" size="16px" />
                <q-icon v-if="getFieldValueHelper(row, 'favorite')" name="star" color="yellow" size="16px" />
                <q-icon v-else name="star_border" color="grey-6" size="16px" />
                <q-icon v-if="(Number(getFieldValueHelper(row, 'file_upload_count')) || 0) > 0" name="attach_file" color="grey-6" size="16px" />
              </div>

              <!-- 화살표 (헤더 내부에 포함) -->
              <div class="data-list-header-toggle" @click.stop="handleExpansionToggle(row)">
                <q-icon :name="getExpansionModelValue(row) ? 'expand_less' : 'expand_more'" />
              </div>
            </div>
          </div>

          <!-- 컨텐츠 (v-show로 표시/숨김) -->
          <div v-show="isAlwaysExpanded || getExpansionModelValue(row)" class="data-list-content">
            <div class="list-item-content q-pa-md">
              <div v-for="field in visibleFieldsList" :key="field.name" class="list-item-field">
                <span class="list-field-label">{{ field.label }}:</span>
                <span class="list-field-value">{{ getFieldValueForList(row, field) || '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 페이징 영역 (하단 고정) -->
      <div v-if="pagination" class="list-pagination-fixed">
        <DataPageNavigation v-model="localPagination" :total="rows.length" :rows-per-page-options="rowsPerPageOptions" :auto-calculate-rows="false" :show-limit-select="true" :show-info="true" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive, nextTick } from 'vue'
import DataPageNavigation from '@system/components/ui/DataPageNavigation.vue'
import { getRowNumberWithPagination } from '@system/utils/dataViewUtils.js'
import { getFieldValue, normalizeFieldMapping, getDefaultFieldMapping } from '@system/utils/view-mode/viewFieldMapping.js'

const props = defineProps({
  // 기본 데이터
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
  pagination: {
    type: Object,
    required: true,
    default: () => ({
      page: 1,
      rowsPerPage: 25,
    }),
  },

  // 필드명 매핑
  fieldMapping: {
    type: Object,
    default: () => getDefaultFieldMapping(),
  },

  // 사용 가능한 필드 목록
  availableFields: {
    type: Array,
    default: () => [],
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

  // 리스트 뷰 설정
  settings: {
    type: Object,
    default: () => ({}),
  },

  // 페이징 리미트 선택 옵션 (부모에서 전달되지 않을 때만 사용되는 fallback)
  // 일반적으로 PartClassesView에서 viewModeSettings의 값을 전달하므로 이 기본값은 거의 사용되지 않음
  rowsPerPageOptions: {
    type: Array,
    default: () => [10, 25, 50, 100],
  },

  // 선택된 행
  selectedRows: {
    type: Array,
    default: () => [],
  },

  // 롱프레스 중인 행 ID
  longPressingRowId: {
    type: [String, Number, null],
    default: null,
  },

  // 선택된 행 ID
  selectedRowId: {
    type: [String, Number, null],
    default: null,
  },
})

const emit = defineEmits([
  'update:selectedRows',
  'update:pagination',
  'row-click',
  'row-double-click',
  'row-context-menu',
  'row-mouse-down',
  'row-mouse-up',
  'row-mouse-enter',
  'row-mouse-move',
  'row-mouse-leave',
  'drag-start',
  'drag-end',
  'drag-over',
  'drag-enter',
  'drag-leave',
  'drag-drop',
  'calculation-complete',
])

// Refs
const listWrapperRef = ref(null)

// 정규화된 필드명 매핑
const normalizedFieldMapping = computed(() => {
  return normalizeFieldMapping(getDefaultFieldMapping(), props.fieldMapping)
})

// ============================================
// 리스트 뷰 설정 (사용자 설정용)
// ============================================
const LIST_SETTINGS = reactive({
  visibleFields: [],
  fieldOrder: [],
  rowSpacing: 'normal', // 'compact' | 'normal' | 'comfortable'
  fontSize: 'medium', // 'small' | 'medium' | 'large'
  expandMode: 'accordion', // 'expanded' | 'accordion' | 'independent'
  showRowNumber: true,
  showActions: true,
})

// 확장 모드 확인 (LIST_SETTINGS에서 가져오기)
const currentExpandMode = computed(() => {
  return LIST_SETTINGS.expandMode || 'expanded'
})

// 토글 모드용 computed 활성화
const isAlwaysExpanded = computed(() => {
  return currentExpandMode.value === 'expanded'
})
const isAccordionMode = computed(() => {
  return currentExpandMode.value === 'accordion'
})
const isIndependentMode = computed(() => {
  return currentExpandMode.value === 'independent'
})

// 아코디언 모드용 그룹 (하나만 열리도록) - q-expansion-item의 group prop 사용
// group prop에 전달되는 배열 (자동으로 하나만 유지)
const accordionGroupModel = ref([])

// 독립 토글 모드용 열림 상태 관리 (배열로 관리 - 각 항목의 name을 저장)
const independentExpandedItems = ref([])

// 확장 모델 값 계산 함수 (반응성 보장)
function getExpansionModelValue(row) {
  if (!row) return false

  const rowIdStr = String(row[props.rowKey])

  // expanded 모드: 항상 true
  if (isAlwaysExpanded.value) {
    return true
  }

  // accordion 모드: accordionGroupModel에 포함되어 있으면 true
  if (isAccordionMode.value) {
    return (accordionGroupModel.value || []).includes(rowIdStr)
  }

  // independent 모드: independentExpandedItems에 포함되어 있으면 true
  if (isIndependentMode.value) {
    return (independentExpandedItems.value || []).includes(rowIdStr)
  }

  // 기본값: false
  return false
}

// 확장 상태 업데이트 핸들러
function handleExpansionModelUpdate(rowId, value) {
  const rowIdStr = String(rowId)

  // expanded 모드에서는 항상 펼쳐져야 하므로 업데이트 무시
  if (isAlwaysExpanded.value) {
    // expanded 모드에서는 항상 true이므로 업데이트를 무시
    return
  }

  if (isAccordionMode.value) {
    // 아코디언 모드: group prop이 배열을 관리하므로 직접 배열을 업데이트
    if (value) {
      // 열기: 배열에 추가 (group prop이 자동으로 하나만 유지)
      if (!accordionGroupModel.value.includes(rowIdStr)) {
        accordionGroupModel.value = [rowIdStr]
      }
    } else {
      // 닫기
      accordionGroupModel.value = accordionGroupModel.value.filter((id) => id !== rowIdStr)
    }
  } else if (isIndependentMode.value) {
    // 독립 토글 모드: 배열에 추가/제거
    if (value) {
      if (!independentExpandedItems.value.includes(rowIdStr)) {
        independentExpandedItems.value.push(rowIdStr)
      }
    } else {
      const index = independentExpandedItems.value.indexOf(rowIdStr)
      if (index > -1) {
        independentExpandedItems.value.splice(index, 1)
      }
    }
  }
}

// props.settings 변경 시 LIST_SETTINGS 업데이트 (실시간 반영)
watch(
  () => props.settings,
  (newSettings) => {
    // props.settings가 없거나 빈 객체일 때는 기본값 유지
    if (!newSettings || Object.keys(newSettings).length === 0) {
      return
    }

    // visibleFields 업데이트
    if (newSettings.visibleFields !== undefined) {
      LIST_SETTINGS.visibleFields = newSettings.visibleFields
    }

    // fieldOrder 업데이트
    if (newSettings.fieldOrder !== undefined) {
      LIST_SETTINGS.fieldOrder = newSettings.fieldOrder
    }

    // rowSpacing 업데이트
    if (newSettings.rowSpacing !== undefined) {
      LIST_SETTINGS.rowSpacing = newSettings.rowSpacing
    }

    // fontSize 업데이트
    if (newSettings.fontSize !== undefined) {
      LIST_SETTINGS.fontSize = newSettings.fontSize
    }

    // expandMode 업데이트
    if (newSettings.expandMode !== undefined && newSettings.expandMode !== null) {
      // expandMode가 객체인 경우 value 속성 추출 (q-select에서 객체로 저장된 경우 대비)
      let expandModeValue = newSettings.expandMode
      if (typeof expandModeValue === 'object' && expandModeValue !== null && 'value' in expandModeValue) {
        expandModeValue = expandModeValue.value
      }

      // props.settings에 값이 있으면 무조건 업데이트 (카드 렌더러 패턴)
      LIST_SETTINGS.expandMode = expandModeValue
    }

    // showRowNumber 업데이트
    if (newSettings.showRowNumber !== undefined) {
      LIST_SETTINGS.showRowNumber = newSettings.showRowNumber
    }

    // showActions 업데이트
    if (newSettings.showActions !== undefined) {
      LIST_SETTINGS.showActions = newSettings.showActions
    }
  },
  { deep: true, immediate: true },
)

// LIST_SETTINGS.expandMode 변경 시 확장 상태 초기화 및 강제 재렌더링
watch(
  () => LIST_SETTINGS.expandMode,
  (newExpandMode, oldExpandMode) => {
    // expandMode가 실제로 변경되었을 때만 초기화
    if (newExpandMode !== oldExpandMode) {
      accordionGroupModel.value = []
      independentExpandedItems.value = []

      // DOM 업데이트를 위해 nextTick 사용
      nextTick(() => {
        // 강제 재렌더링을 위한 추가 처리 (필요시)
      })
    }
  },
  { immediate: true },
)

// 페이지 변경 시 확장 상태 초기화
watch(
  () => props.pagination?.page,
  () => {
    if (isAccordionMode.value) {
      accordionGroupModel.value = []
    } else if (isIndependentMode.value) {
      independentExpandedItems.value = []
    }
  },
)

// 표시할 필드 목록
const visibleFieldsList = computed(() => {
  if (!props.availableFields || props.availableFields.length === 0) {
    return []
  }

  const visibleFields = LIST_SETTINGS.visibleFields || []
  if (visibleFields.length === 0) {
    // 모든 필드 표시
    return props.availableFields.filter((field) => field.name !== 'id')
  }

  // 설정된 필드만 표시
  const fieldMap = new Map(props.availableFields.map((f) => [f.name, f]))
  return visibleFields.map((fieldName) => fieldMap.get(fieldName)).filter((field) => field !== undefined)
})

// 로컬 페이지네이션 (v-model)
const localPagination = computed({
  get: () => props.pagination,
  set: (value) => {
    emit('update:pagination', value)
  },
})

// 페이징된 행 목록
const paginatedRows = computed(() => {
  if (!props.pagination || !props.pagination.rowsPerPage) {
    return props.rows
  }

  const start = (props.pagination.page - 1) * props.pagination.rowsPerPage
  const end = start + props.pagination.rowsPerPage
  return props.rows.slice(start, end)
})

// 필드 값 가져오기 헬퍼
function getFieldValueHelper(row, fieldKey) {
  return getFieldValue(row, fieldKey, normalizedFieldMapping.value)
}

// 리스트 뷰용 필드 값 가져오기 (field.field 우선 사용)
function getFieldValueForList(row, field) {
  if (!row || !field) {
    return undefined
  }

  // field.field가 있으면 직접 사용 (실제 데이터베이스 필드명)
  if (field.field) {
    return row[field.field]
  }

  // field.field가 없으면 필드 매핑을 통해 가져오기
  return getFieldValueHelper(row, field.name)
}

// 행 번호 표시 여부
const shouldShowRowNumber = computed(() => {
  return LIST_SETTINGS.showRowNumber !== false
})

// 액션 표시 여부
const shouldShowActions = computed(() => {
  return LIST_SETTINGS.showActions !== false
})

// 비활성 아이템 확인
function isInactive(row) {
  return getFieldValueHelper(row, 'active') === false || getFieldValueHelper(row, 'active') === 0
}

// 리스트 아이템 클래스 계산
function getListItemClass(row) {
  const classes = ['data-list-item']
  const rowId = row[props.rowKey]

  // 선택된 행
  if (props.selectedRows && Array.isArray(props.selectedRows)) {
    const isSelected = props.selectedRows.some((selectedRow) => selectedRow[props.rowKey] === rowId)
    if (isSelected) {
      classes.push('nexa-item-selected')
    }
  }

  // 롱프레스 상태
  if (props.longPressingRowId !== null && props.longPressingRowId !== undefined && props.longPressingRowId === rowId) {
    classes.push('nexa-item-long-pressing')
  }

  // 비활성 아이템
  if (isInactive(row)) {
    classes.push('nexa-item-inactive')
  }

  // 드래그 가능한 행
  if (props.features.draggable) {
    classes.push('draggable-row')
  }

  // 드래그 상태
  if (props.features.draggable && draggedRowId.value === rowId) {
    classes.push('is-dragging')
  }
  if (props.features.draggable && dragOverRowId.value === rowId) {
    classes.push('drag-over')
  }

  return classes.join(' ')
}

// 리스트 아이템 스타일 계산
function getListItemStyle(row) {
  if (props.features.draggable && dragOverRowId.value === row[props.rowKey]) {
    return {
      backgroundColor: 'rgba(65, 170, 223, 0.3)',
      borderLeft: '3px solid #41aadf',
    }
  }
  return {}
}

// 드래그앤드롭 상태
const draggedRowId = ref(null)
const dragOverRowId = ref(null)

// rowId로 row 찾기 헬퍼 함수
function getRowById(rowId) {
  if (!rowId || !props.rows || props.rows.length === 0) {
    return null
  }
  return props.rows.find((row) => String(row[props.rowKey]) === String(rowId)) || null
}

// 이벤트 핸들러
function handleRowClick(event, row) {
  if (row) {
    emit('row-click', event, row)
  }
}

function handleRowDoubleClick(event, row) {
  emit('row-double-click', event, row)
}

function handleRowContextMenu(event, row) {
  if (props.features.contextMenu) {
    emit('row-context-menu', event, row)
  }
}

function handleRowMouseDown(event, row) {
  emit('row-mouse-down', event, row)
}

function handleRowMouseUp(event) {
  emit('row-mouse-up', event)
}

function handleRowMouseEnter(event, row) {
  // row가 항상 전달되도록 템플릿에서 보장하되, 안전장치는 유지
  // (Quasar 컴포넌트의 예측 불가능한 동작 대비)
  if (!row) {
    const target = event?.currentTarget || event?.target
    const parentWithRowId = target?.closest('[data-row-id]')
    if (parentWithRowId) {
      const dataRowId = parentWithRowId.getAttribute('data-row-id')
      if (dataRowId) {
        row = getRowById(dataRowId)
      }
    }
  }

  if (row) {
    // nextTick으로 감싸서 Vue의 컴포넌트 업데이트 사이클과 충돌 방지
    // q-expansion-item의 동적 렌더링 중 발생할 수 있는 emitsOptions 에러 방지
    nextTick(() => {
      try {
        emit('row-mouse-enter', event, row)
      } catch (err) {
        // 개발 환경에서만 로그
        if (process.env.NODE_ENV === 'development') {
          console.warn('row-mouse-enter emit failed:', err)
        }
      }
    })
  }
}

function handleRowMouseMove(event, row) {
  // row가 항상 전달되도록 템플릿에서 보장하되, 안전장치는 유지
  // (Quasar 컴포넌트의 예측 불가능한 동작 대비)
  if (!row) {
    const target = event?.currentTarget || event?.target
    const parentWithRowId = target?.closest('[data-row-id]')
    if (parentWithRowId) {
      const dataRowId = parentWithRowId.getAttribute('data-row-id')
      if (dataRowId) {
        row = getRowById(dataRowId)
      }
    }
  }

  if (row) {
    // nextTick으로 감싸서 Vue의 컴포넌트 업데이트 사이클과 충돌 방지
    // q-expansion-item의 동적 렌더링 중 발생할 수 있는 emitsOptions 에러 방지
    nextTick(() => {
      try {
        emit('row-mouse-move', event, row)
      } catch (err) {
        // 개발 환경에서만 로그
        if (process.env.NODE_ENV === 'development') {
          console.warn('row-mouse-move emit failed:', err)
        }
      }
    })
  }
}

function handleRowMouseLeave(event) {
  emit('row-mouse-leave', event)
}

function handleDragStart(event, row) {
  // 드래그 시작 시 롱프레스 타이머 취소 및 멀티 셀렉트 모드 해제
  emit('row-mouse-up', event)

  draggedRowId.value = row[props.rowKey]
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('application/json', JSON.stringify({ id: row[props.rowKey] }))
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

// 확장 토글 핸들러 (화살표 클릭 시)
function handleExpansionToggle(row) {
  if (!row) return
  const rowId = row[props.rowKey]
  const currentValue = getExpansionModelValue(row)

  // 아코디언 모드: 다른 항목 닫기
  if (isAccordionMode.value) {
    if (currentValue) {
      // 이미 열려있으면 닫기
      handleExpansionModelUpdate(rowId, false)
    } else {
      // 닫혀있으면 열기 (다른 항목은 자동으로 닫힘)
      handleExpansionModelUpdate(rowId, true)
    }
  } else {
    // 독립 모드: 단순 토글
    handleExpansionModelUpdate(rowId, !currentValue)
  }
}

// 아코디언 아이템 click 핸들러 (확장 토글과 멀티 셀렉트 분리)
function handleExpansionItemClick(event, row) {
  if (!row) return

  const target = event.target

  // 확장 아이콘 영역 체크 (커스텀 구조)
  const isToggleIcon = target.closest('.data-list-header-toggle') || target.closest('button')

  // 헤더 클릭 시 항상 확장/축소 처리
  handleExpansionToggle(row)

  // 확장 아이콘이 아닌 경우 추가로 멀티 셀렉트 처리
  if (!isToggleIcon) {
    handleRowClick(event, row)
  }
}

// 아코디언 아이템 mousedown 핸들러 (확장 토글과 행 클릭 분리)
function handleExpansionItemMouseDown(event, row) {
  if (!row) return

  const target = event.target

  // 확장 아이콘 영역 체크 (커스텀 구조)
  const isToggleIcon = target.closest('.data-list-header-toggle') || target.closest('button')

  // 확장 아이콘이 아닌 경우에만 롱프레스 감지 시작
  if (!isToggleIcon) {
    handleRowMouseDown(event, row)
  }
}

// 외부에서 접근 가능한 메서드
defineExpose({
  listWrapperRef,
})
</script>

<style lang="scss" scoped>
// NEXA 시스템 스타일은 quasar.config.js에서 전역으로 import됨
// @import '../../../css/nexa-list-features.scss'; // 제거됨 (nexa-system.scss로 통합)
</style>
