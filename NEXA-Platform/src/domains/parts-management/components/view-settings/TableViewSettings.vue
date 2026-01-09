<!-- TableViewSettings.vue
  테이블 뷰 설정 컴포넌트
-->
<template>
  <div class="table-view-settings">
    <!-- 컬럼 표시/숨김 -->
    <q-expansion-item :model-value="expanded === 'visibleColumns'" @update:model-value="expanded = $event ? 'visibleColumns' : ''" label="컬럼 표시/숨김" icon="view_column" header-class="text-weight-bold" class="visible-columns-expansion">
      <q-card>
        <q-card-section>
          <div class="q-mb-sm">
            <q-checkbox v-model="selectAllVisibleColumns" label="표시 컬럼 모두 선택/해제" @update:model-value="handleSelectAllVisibleColumns" />
          </div>
          <q-separator class="q-mb-sm" />
          <q-list>
            <q-item v-for="column in availableColumns" :key="column.name" tag="label">
              <q-item-section avatar>
                <q-checkbox v-model="localSettings.visibleColumns" :val="column.name" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="column-label-row">
                  <span class="column-display-name">{{ column.label }}</span>
                  <span v-if="column.name" class="column-db-name">{{ column.name }}</span>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- 컬럼 순서 -->
    <q-expansion-item :model-value="expanded === 'columnOrder'" @update:model-value="expanded = $event ? 'columnOrder' : ''" label="컬럼 순서" icon="swap_vert" header-class="text-weight-bold" class="column-order-expansion">
      <q-card style="padding-top: 4px !important">
        <q-card-section style="padding-top: 4px !important; padding-bottom: 4px !important">
          <div class="text-caption" style="margin-bottom: 4px !important">위/아래 버튼으로 순서를 변경할 수 있습니다 (드래그 앤 드롭은 향후 구현)</div>
          <q-list style="margin-top: 0 !important; padding-top: 0 !important">
            <q-item v-for="(columnName, index) in orderedColumns" :key="columnName" :data-column-name="columnName" class="column-order-item">
              <q-item-section avatar>
                <q-icon name="drag_handle" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ getColumnLabel(columnName) }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="column-order-buttons">
                  <q-btn flat dense icon="arrow_upward" size="sm" :disable="index === 0" @click="moveColumn(index, 'up')" class="column-order-btn" />
                  <q-btn flat dense icon="arrow_downward" size="sm" :disable="index === orderedColumns.length - 1" @click="moveColumn(index, 'down')" class="column-order-btn" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- 컬럼 너비 조정 -->
    <q-expansion-item :model-value="expanded === 'columnWidths'" @update:model-value="expanded = $event ? 'columnWidths' : ''" label="컬럼 너비 조정" icon="width_wide" header-class="text-weight-bold" class="column-width-expansion">
      <q-card style="padding-top: 4px !important">
        <q-card-section style="padding-top: 4px !important; padding-bottom: 4px !important">
          <div class="text-caption" style="margin-bottom: 4px !important">
            <div class="row items-center q-gutter-xs q-mt-xs">
              <q-icon name="warning" size="16px" color="warning" />
              <span>최소 너비는 <strong>70px</strong>입니다.</span>
            </div>
            <div class="row items-center q-gutter-xs">
              <span>각 컬럼의 너비를 픽셀(px) 단위로 조정할 수 있습니다. 값을 비우면 자동으로 배분됩니다.</span>
            </div>
          </div>
          <q-list style="margin-top: 0 !important; padding-top: 0 !important">
            <q-item v-for="column in availableColumns" :key="column.name">
              <q-item-section>
                <q-item-label class="column-label-row">
                  <span class="column-display-name">{{ column.label }}</span>
                  <span v-if="column.name" class="column-db-name">{{ column.name }}</span>
                </q-item-label>
              </q-item-section>
              <q-item-section side class="column-width-section">
                <div class="column-width-controls">
                  <q-input :model-value="getColumnWidthValue(column.name)" type="number" dense hide-bottom-space :min="10" :max="1000" @update:model-value="handleColumnWidthValueChange(column.name, $event)">
                    <template #prepend>
                      <span class="column-width-label">너비</span>
                    </template>
                    <template #append>
                      <span class="column-width-unit-label">px</span>
                    </template>
                  </q-input>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <q-expansion-item :model-value="expanded === 'stickyColumns'" @update:model-value="expanded = $event ? 'stickyColumns' : ''" label="컬럼 고정" icon="lock" header-class="text-weight-bold">
      <q-card>
        <q-card-section>
          <div class="row q-gutter-md">
            <div class="col">
              <div class="text-weight-medium q-mb-xs" style="padding-left: 0">왼쪽 고정</div>
              <q-select v-model="localSettings.stickyColumns.left" :options="availableColumns" option-label="label" option-value="name" emit-value map-options multiple dense />
            </div>
            <div class="col">
              <div class="text-weight-medium q-mb-xs" style="padding-left: 0">오른쪽 고정</div>
              <q-select v-model="localSettings.stickyColumns.right" :options="availableColumns" option-label="label" option-value="name" emit-value map-options multiple dense />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- 기본 정렬 -->
    <q-expansion-item :model-value="expanded === 'defaultSort'" @update:model-value="expanded = $event ? 'defaultSort' : ''" label="기본 정렬" icon="sort" header-class="text-weight-bold">
      <q-card>
        <q-card-section>
          <div class="row q-gutter-md">
            <q-select v-model="localSettings.defaultSort.column" :options="sortableColumns" option-label="label" option-value="name" emit-value map-options label="정렬 컬럼" dense clearable class="col" />
            <q-select v-model="localSettings.defaultSort.direction" :options="sortDirections" label="정렬 방향" dense class="col" />
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- 페이징 설정 -->
    <q-expansion-item :model-value="expanded === 'pagination'" @update:model-value="expanded = $event ? 'pagination' : ''" label="페이징 설정" icon="view_list" header-class="text-weight-bold">
      <q-card>
        <q-card-section>
          <div class="row q-gutter-md">
            <div class="col-12">
              <q-select v-model="localSettings.rowsPerPageOptions" :options="rowsPerPagePresets" option-label="label" option-value="value" emit-value map-options label="페이지당 항목 수 옵션" dense hint="페이징 하단에서 선택할 수 있는 옵션 목록" />
            </div>
            <div class="col-12">
              <div class="text-caption text-grey-7">
                <q-icon name="info" size="12px" class="q-mr-xs" />
                현재 설정: {{ localSettings.rowsPerPageOptions?.join(', ') || '[10, 25, 50, 100]' }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- 사이드바 네비게이션 설정 -->
    <q-expansion-item :model-value="expanded === 'sidebarNavigation'" @update:model-value="expanded = $event ? 'sidebarNavigation' : ''" label="사이드바 네비게이션" icon="view_sidebar" header-class="text-weight-bold">
      <q-card>
        <q-card-section>
          <div class="row q-gutter-md">
            <q-input v-model.number="localSettings.sidebarNavigation.hoverView.maxRegularFileImages" type="number" label="일반 첨부 파일 이미지 최대 표시 수 (0: 표시 안 함)" min="0" max="10" dense class="col" />
            <q-input v-model.number="localSettings.sidebarNavigation.hoverView.maxEditorImages" type="number" label="에디터 이미지 최대 표시 수 (0: 표시 안 함)" min="0" max="10" dense class="col" />
          </div>
          <div class="q-mt-md">
            <q-btn flat dense color="primary" icon="sync" label="모든 뷰에 동시 적용" @click="handleApplyToAllViews" class="full-width" />
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- 테이블 뷰 프리셋 -->
    <q-expansion-item :model-value="expanded === 'tableViewPresets'" @update:model-value="handlePresetExpansion($event)" label="테이블 뷰 프리셋" icon="bookmark" header-class="text-weight-bold">
      <q-card>
        <q-card-section>
          <div class="q-mb-md">
            <q-input v-model="presetNameInput" placeholder="프리셋 이름을 입력하세요" dense clearable>
              <template v-slot:append>
                <q-btn flat dense icon="add" :disable="!presetNameInput || presetNameInput.trim() === ''" @click="handleSavePreset" />
              </template>
            </q-input>
          </div>
          <q-separator v-if="presets.length > 0" class="q-mb-sm" />
          <q-list v-if="presets.length > 0">
            <q-item v-for="preset in presets" :key="preset.id" clickable @click="handleLoadPreset(preset)">
              <q-item-section avatar>
                <q-icon name="bookmark" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ preset.name }}</q-item-label>
                <q-item-label caption>{{ formatPresetDate(preset.createdAt) }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat dense icon="delete" @click.stop="handleDeletePreset(preset.id)" />
              </q-item-section>
            </q-item>
          </q-list>
          <q-item v-else>
            <q-item-section>
              <q-item-label class="text-grey">저장된 프리셋이 없습니다.</q-item-label>
            </q-item-section>
          </q-item>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { defaultTableViewSettings } from '../config/viewModeSettings'

const props = defineProps({
  settings: {
    type: Object,
    required: true,
  },
  availableColumns: {
    type: Array,
    required: true,
  },
  storageKey: {
    type: String,
    default: 'NEXA-part-classes-table-view-presets',
  },
})

const emit = defineEmits(['update:settings', 'apply-to-all-views'])

const $q = useQuasar()

// 로컬 설정 (props를 복사)
// columnWidths를 정규화 (객체 형식에서 숫자로 변환, 호환성 처리)
const normalizeColumnWidths = (widths) => {
  if (!widths || typeof widths !== 'object') return {}
  const normalized = {}
  Object.keys(widths).forEach((key) => {
    const width = widths[key]
    if (typeof width === 'number') {
      // 이미 숫자 형식
      normalized[key] = width
    } else if (width && typeof width === 'object' && width.value !== null && width.value !== undefined) {
      // 객체 형식에서 숫자로 변환 (px만 지원)
      normalized[key] = width.value
    }
    // value가 null이거나 없는 경우는 제외 (자동 배분)
  })
  return normalized
}

// rowsPerPageOptions 기본값 보장
const ensureRowsPerPageOptions = (settings) => {
  if (!settings.rowsPerPageOptions || !Array.isArray(settings.rowsPerPageOptions) || settings.rowsPerPageOptions.length === 0) {
    settings.rowsPerPageOptions = defaultTableViewSettings.rowsPerPageOptions || [10, 25, 50, 100]
  }
  return settings
}

// sidebarNavigation 기본값 보장
const ensureSidebarNavigation = (settings) => {
  if (!settings.sidebarNavigation) {
    settings.sidebarNavigation = {
      hoverView: {
        maxRegularFileImages: 1,
        maxEditorImages: 1,
      },
    }
  } else if (!settings.sidebarNavigation.hoverView) {
    settings.sidebarNavigation.hoverView = {
      maxRegularFileImages: 1,
      maxEditorImages: 1,
    }
  } else {
    // hoverView가 있으면 개별 값 보장
    if (settings.sidebarNavigation.hoverView.maxRegularFileImages === undefined) {
      settings.sidebarNavigation.hoverView.maxRegularFileImages = 1
    }
    if (settings.sidebarNavigation.hoverView.maxEditorImages === undefined) {
      settings.sidebarNavigation.hoverView.maxEditorImages = 1
    }
  }
  return settings
}

const localSettings = ref(
  ensureRowsPerPageOptions(
    ensureSidebarNavigation({
      ...defaultTableViewSettings,
      ...props.settings,
      columnWidths: normalizeColumnWidths(props.settings.columnWidths),
    }),
  ),
)

// 확장 상태 (하나만 열리도록)
const expanded = ref('')

// 모두 선택 상태
const selectAllVisibleColumns = computed({
  get: () => {
    if (props.availableColumns.length === 0) return false
    return props.availableColumns.every((col) => localSettings.value.visibleColumns.includes(col.name))
  },
  set: (value) => {
    if (value) {
      const newVisibleColumns = [...new Set([...localSettings.value.visibleColumns, ...props.availableColumns.map((col) => col.name)])]
      localSettings.value.visibleColumns = newVisibleColumns
    } else {
      const allColumnNames = props.availableColumns.map((col) => col.name)
      localSettings.value.visibleColumns = localSettings.value.visibleColumns.filter((name) => !allColumnNames.includes(name))
    }
  },
})

// 테이블 뷰 프리셋 관련
const presetNameInput = ref('')
const presets = ref([])

// 정렬 가능한 컬럼
const sortableColumns = computed(() => {
  return props.availableColumns.filter((col) => col.sortable !== false)
})

// 정렬 방향 옵션
const sortDirections = [
  { label: '오름차순', value: 'asc' },
  { label: '내림차순', value: 'desc' },
]

// 페이징 리미트 옵션 프리셋
const rowsPerPagePresets = [
  { label: '기본 (10, 25, 50, 100)', value: [10, 25, 50, 100] },
  { label: '작은 단위 (5, 10, 25, 50)', value: [5, 10, 25, 50] },
  { label: '큰 단위 (25, 50, 100, 200)', value: [25, 50, 100, 200] },
  { label: '매우 큰 단위 (50, 100, 200, 500)', value: [50, 100, 200, 500] },
]

// 정렬된 컬럼 목록
const orderedColumns = computed(() => {
  if (localSettings.value.columnOrder && localSettings.value.columnOrder.length > 0) {
    return localSettings.value.columnOrder
  }
  return props.availableColumns.map((col) => col.name)
})

// 컬럼 라벨 가져오기
function getColumnLabel(columnName) {
  const column = props.availableColumns.find((col) => col.name === columnName)
  return column?.label || columnName
}

// 모두 선택/해제
function handleSelectAllVisibleColumns(value) {
  selectAllVisibleColumns.value = value
}

// 컬럼 순서 변경 (FLIP 애니메이션 적용)
// FLIP 애니메이션 사용 이유: Vue의 transition-group이 Quasar 컴포넌트와 함께 사용 시
// 배열 순서 변경을 제대로 감지하지 못하여 수동으로 FLIP 기법을 구현
async function moveColumn(index, direction) {
  const currentOrder = [...orderedColumns.value]

  // FLIP 애니메이션 Step 1: First - 이동 전 각 컬럼의 위치를 저장
  const columnItems = document.querySelectorAll('.column-order-item')
  const beforePositions = new Map()
  columnItems.forEach((el) => {
    const columnName = el.getAttribute('data-column-name')
    if (columnName) {
      const rect = el.getBoundingClientRect()
      beforePositions.set(columnName, {
        top: rect.top,
        left: rect.left,
        height: rect.height,
      })
    }
  })

  // 배열 순서 변경
  const newOrder = [...currentOrder]
  if (direction === 'up' && index > 0) {
    ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
  } else if (direction === 'down' && index < newOrder.length - 1) {
    ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
  }
  localSettings.value.columnOrder = newOrder
  emit('update:settings', { ...localSettings.value })

  // DOM 업데이트 대기 (Vue가 배열 변경을 반영할 시간)
  await nextTick()
  await nextTick()

  // FLIP 애니메이션 Step 2-4: Last, Invert, Play
  const afterItems = document.querySelectorAll('.column-order-item')
  afterItems.forEach((el) => {
    const columnName = el.getAttribute('data-column-name')
    if (columnName && beforePositions.has(columnName)) {
      const before = beforePositions.get(columnName) // Step 1에서 저장한 원래 위치
      const after = el.getBoundingClientRect() // Step 2: Last - 배열 변경 후 새 위치

      const deltaY = before.top - after.top // 이동해야 할 거리 계산

      if (Math.abs(deltaY) > 1) {
        // Step 3: Invert - 요소를 원래 위치로 되돌림 (사용자 눈에는 변화 없음)
        el.style.transform = `translateY(${deltaY}px)`
        el.style.transition = 'none' // 즉시 이동 (애니메이션 없음)

        // Step 4: Play - transform을 제거하여 목표 위치로 부드럽게 이동
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transform = '' // transform 제거 = 목표 위치로 이동
            el.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' // 부드러운 애니메이션
          })
        })
      }
    }
  })

  // 애니메이션 완료 후 transition 제거
  setTimeout(() => {
    afterItems.forEach((el) => {
      el.style.transition = ''
    })
  }, 500)
}

// 컬럼 너비 값 가져오기
function getColumnWidthValue(columnName) {
  const width = localSettings.value.columnWidths[columnName]
  if (typeof width === 'number') {
    return width
  }
  return null
}

// 컬럼 너비 값 변경
function handleColumnWidthValueChange(columnName, value) {
  const numeric = value === '' || value === null || value === undefined ? null : Number(value)

  if (numeric === null || Number.isNaN(numeric)) {
    // 값이 비워진 경우: 설정에서 제거 (자동 배분)
    delete localSettings.value.columnWidths[columnName]
  } else {
    // 값이 있는 경우: 10~1000px 범위로 제한 (겹치더라도 사용자가 설정한 값 반영)
    const clampedValue = Math.min(1000, Math.max(10, numeric))
    localSettings.value.columnWidths[columnName] = clampedValue
  }
  emit('update:settings', { ...localSettings.value })
}

// 프리셋 로드
function loadPresets() {
  try {
    const stored = localStorage.getItem(props.storageKey)
    if (stored) {
      presets.value = JSON.parse(stored)
    } else {
      presets.value = []
    }
  } catch (error) {
    console.error('프리셋 로드 실패:', error)
    presets.value = []
  }
}

// 프리셋 저장
function savePresets() {
  try {
    localStorage.setItem(props.storageKey, JSON.stringify(presets.value))
  } catch (error) {
    console.error('프리셋 저장 실패:', error)
    $q.notify({
      type: 'negative',
      message: '프리셋 저장에 실패했습니다.',
      position: 'top',
      timeout: 2000,
    })
  }
}

// 프리셋 저장 핸들러
function handleSavePreset() {
  if (!presetNameInput.value || presetNameInput.value.trim() === '') {
    return
  }

  const preset = {
    id: Date.now().toString(),
    name: presetNameInput.value.trim(),
    createdAt: new Date().toISOString(),
    settings: {
      visibleColumns: [...localSettings.value.visibleColumns],
      columnOrder: [...(localSettings.value.columnOrder || [])],
      columnWidths: JSON.parse(JSON.stringify(localSettings.value.columnWidths)), // 깊은 복사
      stickyColumns: {
        left: [...localSettings.value.stickyColumns.left],
        right: [...localSettings.value.stickyColumns.right],
      },
      defaultSort: {
        column: localSettings.value.defaultSort.column,
        direction: localSettings.value.defaultSort.direction,
      },
    },
  }

  presets.value.push(preset)
  savePresets()

  presetNameInput.value = ''
  $q.notify({
    type: 'positive',
    message: `"${preset.name}" 프리셋이 저장되었습니다.`,
    position: 'top',
    timeout: 1500,
  })
}

// 프리셋 로드 핸들러
function handleLoadPreset(preset) {
  if (preset.settings) {
    localSettings.value = {
      ...defaultTableViewSettings,
      ...preset.settings,
    }
    emit('update:settings', { ...localSettings.value })
    $q.notify({
      type: 'info',
      message: `"${preset.name}" 프리셋이 적용되었습니다.`,
      position: 'top',
      timeout: 1500,
    })
  }
}

// 프리셋 삭제 핸들러
function handleDeletePreset(presetId) {
  $q.dialog({
    title: '프리셋 삭제',
    message: '이 프리셋을 삭제하시겠습니까?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    presets.value = presets.value.filter((p) => p.id !== presetId)
    savePresets()
    $q.notify({
      type: 'info',
      message: '프리셋이 삭제되었습니다.',
      position: 'top',
      timeout: 1500,
    })
  })
}

// 프리셋 날짜 포맷
function formatPresetDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// props 변경 감지 (부모에서 설정이 변경된 경우에만 localSettings 업데이트)
// 무한 루프 방지를 위해 실제로 변경이 있을 때만 업데이트
watch(
  () => props.settings,
  (newSettings) => {
    const normalizedNewSettings = ensureRowsPerPageOptions(
      ensureSidebarNavigation({
        ...defaultTableViewSettings,
        ...newSettings,
        columnWidths: normalizeColumnWidths(newSettings?.columnWidths),
      }),
    )

    // 깊은 비교를 통해 실제로 변경이 있는지 확인
    const currentStr = JSON.stringify(localSettings.value)
    const newStr = JSON.stringify(normalizedNewSettings)

    // 실제로 변경이 있을 때만 업데이트
    if (currentStr !== newStr) {
      isUpdatingFromProps.value = true
      localSettings.value = normalizedNewSettings
      // 다음 틱에서 플래그 해제 (비동기로 실행하여 watch 순서 보장)
      nextTick(() => {
        isUpdatingFromProps.value = false
      })
    }
  },
  { deep: true },
)

// 무한 루프 방지를 위한 플래그
const isUpdatingFromProps = ref(false)
const lastEmittedSettings = ref(null)

// 설정 변경 감지 (localSettings가 변경되면 부모에 알림)
// 무한 루프 방지를 위해 실제로 변경이 있을 때만 emit
watch(
  localSettings,
  (newSettings) => {
    // props로부터 업데이트 중이면 emit하지 않음
    if (isUpdatingFromProps.value) {
      return
    }

    const newSettingsStr = JSON.stringify(newSettings)
    // 이전에 emit한 값과 다를 때만 emit
    if (lastEmittedSettings.value !== newSettingsStr) {
      lastEmittedSettings.value = newSettingsStr
      emit('update:settings', { ...newSettings })
    }
  },
  { deep: true },
)

// 프리셋 확장 핸들러
function handlePresetExpansion(isOpen) {
  expanded.value = isOpen ? 'tableViewPresets' : ''
  if (isOpen) {
    loadPresets()
  }
}

// 모든 뷰에 동시 적용
function handleApplyToAllViews() {
  const sidebarNavSettings = {
    ...localSettings.value.sidebarNavigation,
  }
  emit('apply-to-all-views', sidebarNavSettings)
}
</script>

<style lang="scss" scoped>
// 공통 스타일은 ViewModeSettingsModal에서 관리
// 여기서는 테이블 뷰에만 특화된 스타일만 정의

// 아코디언 내부 요소 간격 최소화
:deep(.q-list) {
  padding: 0; // 리스트 패딩 제거

  .q-item {
    padding: 6px 0; // 아이템 상하 패딩 최소화
    min-height: 36px; // 최소 높이 줄임
  }

  .q-item__section {
    padding: 0 8px; // 섹션 좌우 패딩 줄임
  }
}

:deep(.q-separator) {
  margin: 8px 0; // 구분선 마진 줄임
}

:deep(.q-card__section) {
  padding: 12px 16px; // 카드 섹션 패딩 줄임
}

:deep(.text-caption) {
  margin-bottom: 8px !important; // 캡션 하단 마진 줄임
}

// 컬럼 라벨 한 줄 표시
.column-label-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.column-display-name {
  font-size: 14px;
  color: var(--nexa-text-primary);
}

.column-db-name {
  font-size: 11px;
  color: var(--nexa-text-secondary);
  opacity: 0.6;
  font-family: monospace;
}

// 컬럼 너비 입력/단위 한 줄 배치
.column-width-section {
  min-width: 220px;
}

.column-width-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-width-label {
  font-size: 11px;
  color: var(--nexa-text-secondary);
}

// 컬럼 너비 단위 라벨 스타일
.column-width-unit-label {
  font-size: 12px;
  color: var(--nexa-text-secondary);
  opacity: 0.7;
  padding: 0 4px;
}

// 컬럼 순서 아이템 호버 효과 (컬럼 순서 아코디언 내부만)
.column-order-expansion {
  .q-card .q-list .q-item {
    transition: background-color 0.2s ease;
    border-radius: 6px; // 코너 라운드 적용
    overflow: hidden; // 자식 요소가 라운드를 넘지 않도록

    &:hover {
      background-color: var(--nexa-table-hover-bg, rgba(0, 0, 0, 0.05));
    }
  }
}

// 컬럼 너비 조정 아이템 호버 효과 (컬럼 너비 조정 아코디언 내부만)
.column-width-expansion {
  .q-card .q-list .q-item {
    transition: background-color 0.2s ease;
    border-radius: 6px; // 코너 라운드 적용
    overflow: hidden; // 자식 요소가 라운드를 넘지 않도록

    &:hover {
      background-color: var(--nexa-table-hover-bg, rgba(0, 0, 0, 0.05));
    }
  }
}

// 컬럼 순서 버튼 스타일
.column-order-buttons {
  display: flex;
  flex-direction: row; // 가로 배치
  gap: 2px; // 버튼 간 간격 최소화
  align-items: center;
}

.column-order-btn {
  min-width: 28px !important; // 버튼 최소 너비 줄임
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--nexa-border-color) !important;
  border-radius: 4px;

  :deep(.q-icon) {
    font-size: 14px; // 아이콘 크기 줄임
  }

  &:hover:not(.q-btn--disabled) {
    background-color: var(--nexa-ui-primary);
    border-color: var(--nexa-ui-primary);
    color: white;
  }

  &.q-btn--disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}
</style>
