<!-- ExportModal.vue
  내보내기 모달
-->
<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
  >
    <q-card class="export-dialog-card">
      <!-- 1. 상단 타이틀 -->
      <div class="export-header">
        <div class="export-title">
          <span class="export-title-en">EXPORT DATA</span>
          <div class="export-title-row">
            <span class="export-title-ko">데이터 내보내기</span>
            <span class="export-type-badge">{{ typeLabel }}</span>
          </div>
        </div>
      </div>

      <!-- 2. 중간 컨텐츠 -->
      <div class="export-content-card">
        <!-- 구조적 래퍼 (시각적 스타일 없음) -->
        <div class="export-content-wrapper">
          <!-- 탭 (스크롤 없음) -->
          <div class="export-tabs-section">
            <q-tabs
              v-model="activeTab"
              dense
              class="export-tabs"
              active-color="primary"
              @update:model-value="handleTabChange"
            >
              <q-tab name="common" label="공통 옵션" icon="settings" />
              <q-tab name="csv" label="CSV" icon="description" />
              <q-tab name="excel" label="Excel" icon="table_chart" />
              <q-tab name="pdf" label="PDF" icon="picture_as_pdf" />
            </q-tabs>
          </div>

          <!-- 컨텐츠 (스크롤 가능) -->
          <div class="export-content-section">
            <q-tab-panels v-model="activeTab" animated class="export-tab-panels">
              <!-- 공통 옵션 탭 -->
              <q-tab-panel name="common" class="export-tab-panel">
                <!-- 열 선택 -->
                <q-expansion-item
                  v-model="openedExpansions.columnSelection"
                  icon="view_column"
                  label="열 선택"
                  header-class="export-expansion-header"
                  class="export-expansion-item"
                  @update:model-value="handleExpansionChange('columnSelection', $event)"
                >
                  <div class="export-section-content">
                    <div class="export-column-selector">
                      <div class="export-column-selector-header q-mb-sm">
                        <q-checkbox
                          v-model="selectAllColumns"
                          label="모두 선택"
                          @update:model-value="handleSelectAllColumns"
                        />
                        <q-btn
                          flat
                          dense
                          size="sm"
                          label="기본 열로 리셋"
                          @click="resetToDefaultColumns"
                          class="q-ml-auto"
                        />
                      </div>
                      <q-separator class="q-mb-sm" />
                      <div class="export-column-list">
                        <q-checkbox
                          v-for="column in availableColumns"
                          :key="column.name"
                          v-model="selectedColumns"
                          :val="column.name"
                          :label="column.label"
                          class="export-column-item"
                        />
                      </div>
                    </div>
                  </div>
                </q-expansion-item>

                <!-- 데이터 포맷팅 -->
                <q-expansion-item
                  v-model="openedExpansions.dataFormatting"
                  icon="format_color_text"
                  label="데이터 포맷팅"
                  header-class="export-expansion-header"
                  class="export-expansion-item"
                  @update:model-value="handleExpansionChange('dataFormatting', $event)"
                >
                  <div class="export-section-content">
                    <!-- 날짜 형식 -->
                    <div class="export-option-group">
                      <div class="export-option-label">날짜 형식</div>
                      <q-option-group
                        v-model="formattingOptions.dateFormat"
                        :options="dateFormatOptions"
                        color="primary"
                        type="radio"
                        class="q-mt-sm"
                      />
                    </div>

                    <!-- 숫자 형식 -->
                    <div class="export-option-group q-mt-md">
                      <div class="export-option-label">숫자 형식</div>
                      <q-checkbox
                        v-model="formattingOptions.numberFormat.useThousandSeparator"
                        label="천 단위 구분자 사용"
                      />
                      <q-input
                        v-model.number="formattingOptions.numberFormat.decimalPlaces"
                        type="number"
                        label="소수점 자릿수"
                        min="0"
                        max="10"
                        class="q-mt-sm"
                        dense
                        outlined
                      />
                    </div>

                    <!-- NULL 처리 -->
                    <div class="export-option-group q-mt-md">
                      <div class="export-option-label">NULL/빈 값 처리</div>
                      <q-option-group
                        v-model="formattingOptions.nullValue"
                        :options="nullValueOptions"
                        color="primary"
                        type="radio"
                        class="q-mt-sm"
                      />
                    </div>

                    <!-- HTML 태그 제거 -->
                    <div class="export-option-group q-mt-md">
                      <q-checkbox
                        v-model="formattingOptions.removeHtmlTags"
                        label="HTML 태그 제거 (detailed_description 등)"
                      />
                    </div>
                  </div>
                </q-expansion-item>

                <!-- 미리보기 -->
                <q-expansion-item
                  v-model="openedExpansions.preview"
                  icon="preview"
                  header-class="export-expansion-header"
                  class="export-expansion-item"
                  @update:model-value="handleExpansionChange('preview', $event)"
                >
                  <template #header>
                    <q-item-section avatar>
                      <q-icon name="preview" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>미리보기</q-item-label>
                      <q-item-label caption class="text-grey-6">
                        첫 10개 행 (선택된 열만 표시)
                      </q-item-label>
                    </q-item-section>
                  </template>
                  <div class="export-section-content">
                    <div class="export-preview">
                      <q-table
                        :rows="previewData"
                        :columns="previewColumns"
                        flat
                        dense
                        hide-pagination
                        class="export-preview-table"
                      />
                    </div>
                  </div>
                </q-expansion-item>
              </q-tab-panel>

              <!-- CSV 탭 -->
              <q-tab-panel name="csv" class="export-tab-panel">
                <q-expansion-item
                  icon="description"
                  label="CSV 고급 옵션"
                  header-class="export-expansion-header"
                  class="export-expansion-item"
                  default-opened
                >
                  <div class="export-section-content">
                    <!-- 구분자 -->
                    <div class="export-option-group">
                      <div class="export-option-label">구분자</div>
                      <q-option-group
                        v-model="csvOptions.delimiter"
                        :options="delimiterOptions"
                        color="primary"
                        type="radio"
                        class="q-mt-sm"
                      />
                    </div>

                    <!-- 인코딩 -->
                    <div class="export-option-group q-mt-md">
                      <div class="export-option-label">인코딩</div>
                      <q-select
                        v-model="csvOptions.encoding"
                        :options="encodingOptions"
                        outlined
                        dense
                        class="q-mt-sm"
                      />
                    </div>

                    <!-- 줄바꿈 형식 -->
                    <div class="export-option-group q-mt-md">
                      <div class="export-option-label">줄바꿈 형식</div>
                      <q-option-group
                        v-model="csvOptions.lineEnding"
                        :options="lineEndingOptions"
                        color="primary"
                        type="radio"
                        class="q-mt-sm"
                      />
                    </div>
                  </div>
                </q-expansion-item>
              </q-tab-panel>

              <!-- Excel 탭 -->
              <q-tab-panel name="excel" class="export-tab-panel">
                <q-expansion-item
                  icon="table_chart"
                  label="Excel 고급 옵션"
                  header-class="export-expansion-header"
                  class="export-expansion-item"
                  default-opened
                >
                  <div class="export-section-content">
                    <!-- 스타일링 -->
                    <div class="export-option-group">
                      <div class="export-option-label">스타일링</div>
                      <q-checkbox v-model="excelOptions.styling.headerBold" label="헤더 굵게" />
                      <q-checkbox
                        v-model="excelOptions.styling.headerBackground"
                        label="헤더 배경색"
                        class="q-mt-sm"
                      />
                      <q-checkbox
                        v-model="excelOptions.styling.borders"
                        label="테두리"
                        class="q-mt-sm"
                      />
                      <q-checkbox
                        v-model="excelOptions.styling.autoWidth"
                        label="열 너비 자동 조정"
                        class="q-mt-sm"
                      />
                    </div>

                    <!-- 여러 시트 -->
                    <div class="export-option-group q-mt-md">
                      <div class="export-option-label">시트 분리</div>
                      <q-option-group
                        v-model="excelOptions.sheetSplit"
                        :options="sheetSplitOptions"
                        color="primary"
                        type="radio"
                        class="q-mt-sm"
                      />
                    </div>
                  </div>
                </q-expansion-item>
              </q-tab-panel>

              <!-- PDF 탭 -->
              <q-tab-panel name="pdf" class="export-tab-panel">
                <q-expansion-item
                  icon="picture_as_pdf"
                  label="PDF 고급 옵션"
                  header-class="export-expansion-header"
                  class="export-expansion-item"
                  default-opened
                >
                  <div class="export-section-content">
                    <!-- 레이아웃 -->
                    <div class="export-option-group">
                      <div class="export-option-label">페이지 크기</div>
                      <q-select
                        v-model="pdfOptions.pageSize"
                        :options="pageSizeOptions"
                        outlined
                        dense
                        class="q-mt-sm"
                      />
                    </div>

                    <div class="export-option-group q-mt-md">
                      <div class="export-option-label">방향</div>
                      <q-option-group
                        v-model="pdfOptions.orientation"
                        :options="orientationOptions"
                        color="primary"
                        type="radio"
                        class="q-mt-sm"
                      />
                    </div>

                    <!-- 헤더/푸터 -->
                    <div class="export-option-group q-mt-md">
                      <q-checkbox v-model="pdfOptions.header.show" label="헤더 표시" />
                      <q-input
                        v-if="pdfOptions.header.show"
                        v-model="pdfOptions.header.title"
                        label="헤더 제목"
                        class="q-mt-sm"
                        dense
                        outlined
                      />
                    </div>

                    <div class="export-option-group q-mt-md">
                      <q-checkbox v-model="pdfOptions.footer.show" label="푸터 표시" />
                      <q-checkbox
                        v-if="pdfOptions.footer.show"
                        v-model="pdfOptions.footer.pageNumber"
                        label="페이지 번호"
                        class="q-mt-sm"
                      />
                    </div>
                  </div>
                </q-expansion-item>
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </div>
      </div>

      <!-- 3. 하단 버튼 -->
      <div class="export-actions">
        <q-btn
          flat
          label="취소"
          v-close-popup
          class="export-cancel-btn"
          :disable="isProcessing"
          @click="$emit('close')"
        />
        <q-btn
          :label="buttonLabel"
          @click="handleConfirm"
          class="export-confirm-btn"
          :loading="isProcessing"
          :disable="isProcessing"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { partClassesFields } from 'src/components/parts-management/config/partClassesFields'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  typeLabel: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  format: {
    type: String,
    default: 'csv',
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
  previewData: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'update:format', 'confirm', 'close'])

// 로컬 상태
const localFormat = ref(props.format || 'csv')
const activeTab = ref(props.format || 'csv')

// 아코디언 상태 (하나만 열리도록)
const openedExpansions = ref({
  columnSelection: true, // 기본으로 열 선택 열림
  dataFormatting: false,
  preview: false,
})

// 아코디언 변경 핸들러 (하나만 열리도록)
function handleExpansionChange(name, isOpen) {
  if (isOpen) {
    // 다른 모든 expansion 닫기
    Object.keys(openedExpansions.value).forEach((key) => {
      if (key !== name) {
        openedExpansions.value[key] = false
      }
    })
  }
}

// props.format 변경 시 동기화
watch(
  () => props.format,
  (newFormat) => {
    if (newFormat) {
      localFormat.value = newFormat
      activeTab.value = newFormat
    }
  },
  { immediate: true },
)

// 탭 변경 시 형식 자동 선택
function handleTabChange(tabName) {
  activeTab.value = tabName

  if (tabName !== 'common') {
    localFormat.value = tabName
    emit('update:format', tabName)
  }
}

// 열 선택 관련
const availableColumns = computed(() => partClassesFields.filter((col) => col.name !== 'id'))
const selectedColumns = ref(availableColumns.value.map((col) => col.name))
const selectAllColumns = computed({
  get: () => selectedColumns.value.length === availableColumns.value.length,
  set: (value) => {
    selectedColumns.value = value ? availableColumns.value.map((col) => col.name) : []
  },
})

function handleSelectAllColumns(value) {
  selectedColumns.value = value ? availableColumns.value.map((col) => col.name) : []
}

function resetToDefaultColumns() {
  selectedColumns.value = availableColumns.value.map((col) => col.name)
}

// 데이터 포맷팅 옵션
const formattingOptions = ref({
  dateFormat: 'iso',
  numberFormat: {
    useThousandSeparator: true,
    decimalPlaces: 2,
  },
  nullValue: 'empty',
  removeHtmlTags: true,
})

const dateFormatOptions = [
  { label: 'ISO 8601 (YYYY-MM-DD)', value: 'iso' },
  { label: '로컬 형식', value: 'local' },
  { label: 'Excel 날짜 형식', value: 'excel' },
]

const nullValueOptions = [
  { label: '빈 문자열', value: 'empty' },
  { label: 'N/A', value: 'na' },
  { label: '-', value: 'dash' },
]

// CSV 옵션
const csvOptions = ref({
  delimiter: 'comma',
  encoding: 'utf8bom',
  lineEnding: 'lf',
})

const delimiterOptions = [
  { label: '쉼표 (,)', value: 'comma' },
  { label: '세미콜론 (;)', value: 'semicolon' },
  { label: '탭 (\\t)', value: 'tab' },
]

const encodingOptions = [
  { label: 'UTF-8', value: 'utf8' },
  { label: 'UTF-8 with BOM (Excel 호환)', value: 'utf8bom' },
  { label: 'EUC-KR', value: 'euckr' },
  { label: 'CP949 (Windows)', value: 'cp949' },
]

const lineEndingOptions = [
  { label: 'LF (\\n)', value: 'lf' },
  { label: 'CRLF (\\r\\n)', value: 'crlf' },
  { label: 'CR (\\r)', value: 'cr' },
]

// Excel 옵션
const excelOptions = ref({
  styling: {
    headerBold: true,
    headerBackground: true,
    borders: true,
    autoWidth: true,
  },
  sheetSplit: 'none',
})

const sheetSplitOptions = [
  { label: '시트 분리 안 함', value: 'none' },
  { label: '카테고리별 시트 분리', value: 'category' },
  { label: '상태별 시트 분리', value: 'status' },
]

// PDF 옵션
const pdfOptions = ref({
  pageSize: 'a4',
  orientation: 'portrait',
  header: {
    show: true,
    title: '부품 분류 목록',
  },
  footer: {
    show: true,
    pageNumber: true,
  },
})

const pageSizeOptions = [
  { label: 'A4', value: 'a4' },
  { label: 'A3', value: 'a3' },
  { label: 'Letter', value: 'letter' },
]

const orientationOptions = [
  { label: '세로', value: 'portrait' },
  { label: '가로', value: 'landscape' },
]

// 미리보기 데이터
const previewColumns = computed(() => {
  return availableColumns.value
    .filter((col) => selectedColumns.value.includes(col.name))
    .map((col) => ({
      name: col.name,
      label: col.label,
      field: col.field || col.name,
      align: col.align || 'left',
    }))
})

const previewData = computed(() => {
  if (!props.previewData || props.previewData.length === 0) {
    return []
  }
  return props.previewData.slice(0, 10).map((row) => {
    const previewRow = {}
    selectedColumns.value.forEach((colName) => {
      previewRow[colName] = row[colName] ?? ''
    })
    return previewRow
  })
})

// 버튼 라벨
const buttonLabel = computed(() => {
  return props.isProcessing ? '내보내기 중...' : '내보내기'
})

// 확인 버튼 클릭
function handleConfirm() {
  if (!localFormat.value || activeTab.value === 'common') {
    localFormat.value = 'csv'
    activeTab.value = 'csv'
    emit('update:format', 'csv')
  }

  const exportOptions = {
    format: localFormat.value,
    columns: selectedColumns.value,
    formatting: formattingOptions.value,
    csv: csvOptions.value,
    excel: excelOptions.value,
    pdf: pdfOptions.value,
  }
  emit('confirm', exportOptions)
}
</script>

<style lang="scss" scoped>
.export-dialog-card {
  min-width: 800px;
  max-width: 90vw;
  width: 900px;
  max-height: 90vh;
  padding: 24px;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-surface);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow: visible;

  :deep(.q-card__section) {
    padding: 0;
  }
}

// 1. 상단 타이틀
.export-header {
  margin-bottom: 24px;
}

.export-title {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.export-title-en {
  font-size: 3.5em;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 1.2;
  color: var(--q-primary);
}

.export-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.export-title-ko {
  font-size: 24px;
  font-weight: 600;
  color: var(--q-primary);
}

.export-type-badge {
  font-size: 16px;
  font-weight: 500;
  color: var(--nexa-text-primary);
  opacity: 0.7;
  padding: 4px 12px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid var(--nexa-border-color);
}

// 2. 중간 컨텐츠 래퍼 (논리적 구분용 - 시각적 스타일 없음)
.export-content-card {
  flex: 1;
  min-height: 0;
  margin: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// 구조적 래퍼 (시각적 스타일 없음 - 스크롤 관리용)
.export-content-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  // 시각적 스타일 없음 (구조적 래퍼만)
}

// 탭 섹션 (스크롤 없음) - 카드 형식
.export-tabs-section {
  flex-shrink: 0;
  border: 1px solid var(--nexa-border-color);
  border-radius: 8px;
  padding: 16px 24px;
  margin: 0 0 16px 0;
  //background-color: rgba(255, 255, 255, 0);
}

.export-tabs {
  margin: 0;
  padding: 0;

  :deep(.q-tabs__content) {
    padding: 0;
    margin: 0;
  }

  :deep(.q-tabs__container) {
    padding: 0;
    margin: 0;
  }

  :deep(.q-tab) {
    padding: 8px 16px;
    min-height: 48px;
    margin: 0;
  }

  :deep(.q-tab__content) {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 0;
    margin: 0;
  }

  :deep(.q-tab__icon) {
    font-size: 24px;
    margin-right: 0;
  }

  :deep(.q-tab__label) {
    margin: 0;
    padding: 0;
  }
}

// 컨텐츠 섹션 (스크롤 가능) - 카드 형식
.export-content-section {
  //flex: 1;
  //min-height: 0;
  //overflow-y: auto;
  border: 0;
  padding: 0;
  margin: 0;
}

.export-tab-panels {
  background: transparent;
  //padding: 16px 24px;

  :deep(.q-tab-panel) {
    padding: 0;
    background: transparent;
  }
}

.export-tab-panel {
  padding: 0;
}

.export-expansion-item {
  margin-bottom: 8px;
  border: 1px solid var(--nexa-border-color);
  border-radius: 8px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.01);

  :deep(.q-expansion-item__container) {
    .q-expansion-item__header {
      padding: 12px 16px;
      background-color: rgba(255, 255, 255, 0.02);
      min-height: 48px;
    }

    .q-expansion-item__content {
      background-color: rgba(255, 255, 255, 0.01);
    }

    .q-expansion-item__icon {
      font-size: 24px;
      margin-right: 12px;
    }
  }
}

.export-expansion-header {
  font-weight: 500;
  color: var(--nexa-text-primary);
  font-size: 15px;
}

.export-section-content {
  padding: 16px;
}

.export-option-group {
  display: flex;
  flex-direction: column;
}

.export-option-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--nexa-text-primary);
  margin-bottom: 8px;
}

.export-column-selector {
  .export-column-selector-header {
    display: flex;
    align-items: center;
  }

  .export-column-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 300px;
    overflow-y: auto;
    padding: 8px 0;
  }

  .export-column-item {
    padding: 4px 0;
  }
}

.export-preview {
  .export-preview-table {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid var(--nexa-border-color);
    border-radius: 4px;
    background-color: white;

    :deep(.q-table__container) {
      background-color: white;
    }

    :deep(.q-table__top) {
      background-color: white;
    }

    :deep(.q-table__bottom) {
      background-color: white;
    }

    :deep(thead tr) {
      background-color: white;
    }

    :deep(tbody tr) {
      background-color: white;
    }

    :deep(tbody tr:nth-child(even)) {
      background-color: #f5f5f5;
    }

    :deep(.q-table tbody td) {
      background-color: transparent;
      color: #000;
    }

    :deep(.q-table thead th) {
      background-color: #f0f0f0;
      color: #000;
      font-weight: 600;
    }
  }
}

// 3. 하단 버튼
.export-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px 0 0 0;
  margin-top: 16px;
}

.export-cancel-btn,
.export-confirm-btn {
  min-width: 120px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 500;
  border: 1px solid var(--q-primary);
}

.export-cancel-btn {
  color: var(--q-primary);
}

.export-cancel-btn:hover {
  background-color: var(--q-primary);
  color: white;
  border-color: var(--q-primary);
}

.export-confirm-btn {
  background-color: var(--q-primary);

  :deep(.q-btn__content),
  :deep(.q-btn__content span) {
    color: white;
  }

  color: white;
}

.export-confirm-btn:hover {
  background-color: var(--q-primary);
  opacity: 0.9;
  border-color: var(--q-primary);

  :deep(.q-btn__content),
  :deep(.q-btn__content span) {
    color: white;
  }

  color: white;
}
</style>
