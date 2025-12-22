<!-- PrintModal.vue
  통합 출력 모달 컴포넌트
  바코드/QR 코드/라벨/데이터 인쇄 통합
  ExportModal과 유사한 Tab + Accordion 구조 적용
-->
<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
  >
    <q-card class="print-modal-card">
      <!-- 1. 상단 타이틀 -->
      <div class="print-header">
        <div class="print-title">
          <span class="print-title-en">{{ titleEn }}</span>
          <div class="print-title-row">
            <span class="print-title-ko">{{ titleKo }}</span>
            <span v-if="mode === 'data-print'" class="print-type-badge">{{
              dataPrintTypeLabel
            }}</span>
          </div>
        </div>
      </div>

      <!-- 2. 중간 컨텐츠 -->
      <div class="print-content-card">
        <!-- 구조적 래퍼 (시각적 스타일 없음) -->
        <div class="print-content-wrapper">
          <!-- 탭 (스크롤 없음) -->
          <div class="print-tabs-section">
            <q-tabs
              v-model="activeTab"
              dense
              class="print-tabs"
              active-color="primary"
              @update:model-value="handleTabChange"
            >
              <q-tab v-if="mode === 'data-print'" name="printer" label="프린터 옵션" icon="print" />
              <q-tab
                v-if="mode === 'data-print'"
                name="data-options"
                label="데이터 처리 옵션"
                icon="settings"
              />
              <q-tab v-if="mode === 'barcode'" name="barcode" label="바코드 출력" icon="qr_code" />
              <q-tab
                v-if="mode === 'qrcode'"
                name="qrcode"
                label="QR 코드 출력"
                icon="qr_code_scanner"
              />
              <q-tab v-if="mode === 'label'" name="label" label="라벨 출력" icon="label" />
            </q-tabs>
          </div>

          <!-- 컨텐츠 (스크롤 가능) -->
          <div class="print-content-section">
            <q-tab-panels v-model="activeTab" animated class="print-tab-panels">
              <!-- 프린터 옵션 탭 -->
              <q-tab-panel v-if="mode === 'data-print'" name="printer" class="print-tab-panel">
                <!-- 기본 인쇄 옵션 -->
                <q-expansion-item
                  v-model="openedExpansions.printOptions"
                  icon="settings"
                  label="인쇄 옵션"
                  header-class="print-expansion-header"
                  class="print-expansion-item"
                  default-opened
                  @update:model-value="handleExpansionChange('printOptions', $event)"
                >
                  <div class="print-section-content">
                    <div class="print-options-list">
                      <div class="print-option-row">
                        <div class="print-option-label">용지 크기</div>
                        <q-option-group
                          v-model="localPrintOptions.paperSize"
                          :options="paperSizeOptions"
                          color="primary"
                          type="radio"
                          inline
                        />
                      </div>

                      <div class="print-option-row">
                        <div class="print-option-label">인쇄 방향</div>
                        <q-option-group
                          v-model="localPrintOptions.orientation"
                          :options="orientationOptions"
                          color="primary"
                          type="radio"
                          inline
                        />
                      </div>

                      <div class="print-option-row">
                        <div class="print-option-label">색상</div>
                        <q-option-group
                          v-model="localPrintOptions.color"
                          :options="colorOptions"
                          color="primary"
                          type="radio"
                          inline
                        />
                      </div>

                      <div class="print-option-row">
                        <div class="print-option-label">페이지 범위</div>
                        <div class="print-option-controls">
                          <q-option-group
                            v-model="localPrintOptions.pages"
                            :options="pagesOptions"
                            color="primary"
                            type="radio"
                            inline
                          />
                          <q-input
                            v-if="localPrintOptions.pages === 'range'"
                            v-model="localPrintOptions.pageRange"
                            placeholder="예: 1-5,10,15-20"
                            class="q-ml-sm"
                            dense
                            outlined
                            style="min-width: 200px"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </q-expansion-item>

                <!-- 인쇄 스타일 -->
                <q-expansion-item
                  v-model="openedExpansions.printStyle"
                  icon="palette"
                  label="인쇄 스타일"
                  header-class="print-expansion-header"
                  class="print-expansion-item"
                  @update:model-value="handleExpansionChange('printStyle', $event)"
                >
                  <div class="print-section-content">
                    <!-- 폰트 크기 -->
                    <div class="print-option-group">
                      <div class="print-option-label">폰트 크기</div>
                      <q-select
                        v-model="localPrintOptions.style.fontSize"
                        :options="fontSizeOptions"
                        outlined
                        dense
                        class="q-mt-sm"
                      />
                    </div>

                    <!-- 테이블 스타일 -->
                    <div class="print-option-group q-mt-md">
                      <div class="print-option-label">테이블 스타일</div>
                      <q-checkbox
                        v-model="localPrintOptions.style.showBorders"
                        label="보더 표시"
                        class="q-mt-sm"
                      />
                      <div class="print-option-row q-mt-sm">
                        <div
                          class="print-option-label"
                          style="min-width: 80px; height: auto; padding-top: 0"
                        >
                          보더 두께
                        </div>
                        <q-select
                          v-model="localPrintOptions.style.borderWidth"
                          :options="borderWidthOptions"
                          outlined
                          dense
                          style="min-width: 120px"
                        />
                      </div>
                      <div class="print-option-row q-mt-sm">
                        <div
                          class="print-option-label"
                          style="min-width: 80px; height: auto; padding-top: 0"
                        >
                          셀 간격
                        </div>
                        <q-select
                          v-model="localPrintOptions.style.cellPadding"
                          :options="cellPaddingOptions"
                          outlined
                          dense
                          style="min-width: 120px"
                        />
                      </div>
                      <div class="print-option-row q-mt-sm">
                        <div
                          class="print-option-label"
                          style="min-width: 80px; height: auto; padding-top: 0"
                        >
                          텍스트 정렬
                        </div>
                        <q-option-group
                          v-model="localPrintOptions.style.textAlign"
                          :options="textAlignOptions"
                          color="primary"
                          type="radio"
                          inline
                        />
                      </div>
                      <q-checkbox
                        v-model="localPrintOptions.style.alternateRows"
                        label="교대로 행 색상"
                        class="q-mt-sm"
                      />
                      <q-checkbox
                        v-model="localPrintOptions.style.headerBold"
                        label="헤더 굵게"
                        class="q-mt-sm"
                      />
                    </div>
                  </div>
                </q-expansion-item>

                <!-- 워터마크 -->
                <q-expansion-item
                  v-model="openedExpansions.watermark"
                  icon="water_drop"
                  label="워터마크"
                  header-class="print-expansion-header"
                  class="print-expansion-item"
                  @update:model-value="handleExpansionChange('watermark', $event)"
                >
                  <div class="print-section-content">
                    <q-checkbox v-model="localPrintOptions.watermark.show" label="워터마크 표시" />
                    <div v-if="localPrintOptions.watermark.show" class="q-mt-md">
                      <div class="print-option-group">
                        <div class="print-option-label">워터마크 텍스트</div>
                        <q-option-group
                          v-model="localPrintOptions.watermark.text"
                          :options="watermarkTextOptions"
                          color="primary"
                          type="radio"
                          class="q-mt-sm"
                        />
                        <q-input
                          v-if="localPrintOptions.watermark.text === 'custom'"
                          v-model="localPrintOptions.watermark.customText"
                          placeholder="사용자 정의 텍스트 입력"
                          class="q-mt-sm"
                          dense
                          outlined
                        />
                      </div>
                      <div class="print-option-row q-mt-md">
                        <div
                          class="print-option-label"
                          style="min-width: 80px; height: auto; padding-top: 0"
                        >
                          위치
                        </div>
                        <q-option-group
                          v-model="localPrintOptions.watermark.position"
                          :options="watermarkPositionOptions"
                          color="primary"
                          type="radio"
                          inline
                        />
                      </div>
                      <div class="print-option-row q-mt-sm">
                        <div
                          class="print-option-label"
                          style="min-width: 80px; height: auto; padding-top: 0"
                        >
                          투명도
                        </div>
                        <q-slider
                          v-model="localPrintOptions.watermark.opacity"
                          :min="10"
                          :max="100"
                          :step="10"
                          label
                          label-always
                          style="flex: 1; max-width: 300px"
                        />
                      </div>
                    </div>
                  </div>
                </q-expansion-item>
              </q-tab-panel>

              <!-- 데이터 처리 옵션 탭 -->
              <q-tab-panel v-if="mode === 'data-print'" name="data-options" class="print-tab-panel">
                <!-- 열 선택 -->
                <q-expansion-item
                  v-model="openedExpansions.columnSelection"
                  icon="view_column"
                  label="열 선택"
                  header-class="print-expansion-header"
                  class="print-expansion-item"
                  default-opened
                  @update:model-value="handleExpansionChange('columnSelection', $event)"
                >
                  <div class="print-section-content">
                    <div class="print-column-selector">
                      <div class="print-column-selector-header q-mb-sm">
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
                      <div class="print-column-list">
                        <q-checkbox
                          v-for="column in availableColumns"
                          :key="column.name"
                          v-model="selectedColumns"
                          :val="column.name"
                          :label="column.label"
                          class="print-column-item"
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
                  header-class="print-expansion-header"
                  class="print-expansion-item"
                  @update:model-value="handleExpansionChange('dataFormatting', $event)"
                >
                  <div class="print-section-content">
                    <!-- 날짜 형식 -->
                    <div class="print-option-group">
                      <div class="print-option-label">날짜 형식</div>
                      <q-option-group
                        v-model="formattingOptions.dateFormat"
                        :options="dateFormatOptions"
                        color="primary"
                        type="radio"
                        class="q-mt-sm"
                      />
                    </div>

                    <!-- 숫자 형식 -->
                    <div class="print-option-group q-mt-md">
                      <div class="print-option-label">숫자 형식</div>
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
                    <div class="print-option-group q-mt-md">
                      <div class="print-option-label">NULL/빈 값 처리</div>
                      <q-option-group
                        v-model="formattingOptions.nullValue"
                        :options="nullValueOptions"
                        color="primary"
                        type="radio"
                        class="q-mt-sm"
                      />
                    </div>

                    <!-- HTML 태그 제거 -->
                    <div class="print-option-group q-mt-md">
                      <q-checkbox
                        v-model="formattingOptions.removeHtmlTags"
                        label="HTML 태그 제거 (detailed_description 등)"
                      />
                    </div>
                  </div>
                </q-expansion-item>

                <!-- 헤더/푸터 -->
                <q-expansion-item
                  v-model="openedExpansions.headerFooter"
                  icon="description"
                  label="헤더/푸터"
                  header-class="print-expansion-header"
                  class="print-expansion-item"
                  @update:model-value="handleExpansionChange('headerFooter', $event)"
                >
                  <div class="print-section-content">
                    <div class="print-option-group">
                      <q-checkbox v-model="localPrintOptions.header.show" label="헤더 표시" />
                      <q-input
                        v-if="localPrintOptions.header.show"
                        v-model="localPrintOptions.header.title"
                        label="헤더 제목"
                        class="q-mt-sm"
                        dense
                        outlined
                      />
                      <q-checkbox
                        v-if="localPrintOptions.header.show"
                        v-model="localPrintOptions.header.showDate"
                        label="날짜 표시"
                        class="q-mt-sm"
                      />
                    </div>

                    <div class="print-option-group q-mt-md">
                      <q-checkbox v-model="localPrintOptions.footer.show" label="푸터 표시" />
                      <q-checkbox
                        v-if="localPrintOptions.footer.show"
                        v-model="localPrintOptions.footer.pageNumber"
                        label="페이지 번호"
                        class="q-mt-sm"
                      />
                      <q-checkbox
                        v-if="localPrintOptions.footer.show"
                        v-model="localPrintOptions.footer.showDate"
                        label="날짜 표시"
                        class="q-mt-sm"
                      />
                    </div>
                  </div>
                </q-expansion-item>

                <!-- 미리보기 -->
                <q-expansion-item
                  v-model="openedExpansions.preview"
                  icon="preview"
                  header-class="print-expansion-header"
                  class="print-expansion-item"
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
                  <div class="print-section-content">
                    <div class="print-preview">
                      <!-- 헤더 (옵션 활성화 시) -->
                      <div v-if="localPrintOptions.header?.show" class="print-preview-header">
                        <div class="print-preview-header-title">
                          {{ localPrintOptions.header.title || '부품 분류 목록' }}
                        </div>
                        <div
                          v-if="localPrintOptions.header.showDate"
                          class="print-preview-header-date"
                        >
                          {{ new Date().toLocaleDateString('ko-KR') }}
                        </div>
                      </div>
                      <!-- 테이블 -->
                      <q-table
                        :rows="previewData"
                        :columns="previewColumns"
                        flat
                        dense
                        hide-pagination
                        class="print-preview-table"
                      />
                      <!-- 푸터 (옵션 활성화 시) -->
                      <div v-if="localPrintOptions.footer?.show" class="print-preview-footer">
                        <div
                          v-if="localPrintOptions.footer.pageNumber"
                          class="print-preview-footer-page"
                        >
                          페이지 1 / 1
                        </div>
                        <div
                          v-if="localPrintOptions.footer.showDate"
                          class="print-preview-footer-date"
                        >
                          {{ new Date().toLocaleDateString('ko-KR') }}
                        </div>
                      </div>
                    </div>
                  </div>
                </q-expansion-item>
              </q-tab-panel>

              <!-- 바코드 출력 탭 (향후 구현) -->
              <q-tab-panel v-if="mode === 'barcode'" name="barcode" class="print-tab-panel">
                <div class="print-dev-notice">
                  <q-icon name="info" size="24px" color="primary" class="q-mr-sm" />
                  <div class="print-dev-notice-text">
                    <div class="print-dev-notice-title">개발 예정 기능</div>
                    <div class="print-dev-notice-desc">바코드 출력 기능은 현재 개발 중입니다.</div>
                  </div>
                </div>
              </q-tab-panel>

              <!-- QR 코드 출력 탭 (향후 구현) -->
              <q-tab-panel v-if="mode === 'qrcode'" name="qrcode" class="print-tab-panel">
                <div class="print-dev-notice">
                  <q-icon name="info" size="24px" color="primary" class="q-mr-sm" />
                  <div class="print-dev-notice-text">
                    <div class="print-dev-notice-title">개발 예정 기능</div>
                    <div class="print-dev-notice-desc">QR 코드 출력 기능은 현재 개발 중입니다.</div>
                  </div>
                </div>
              </q-tab-panel>

              <!-- 라벨 출력 탭 (향후 구현) -->
              <q-tab-panel v-if="mode === 'label'" name="label" class="print-tab-panel">
                <div class="print-dev-notice">
                  <q-icon name="info" size="24px" color="primary" class="q-mr-sm" />
                  <div class="print-dev-notice-text">
                    <div class="print-dev-notice-title">개발 예정 기능</div>
                    <div class="print-dev-notice-desc">라벨 출력 기능은 현재 개발 중입니다.</div>
                  </div>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </div>
      </div>

      <!-- 3. 하단 버튼 -->
      <div class="print-actions">
        <q-btn
          flat
          label="닫기"
          v-close-popup
          class="print-close-btn"
          :disable="isPrinting"
          @click="closeModal"
        />
        <q-btn
          v-if="mode === 'data-print'"
          :label="printButtonLabel"
          @click="confirmPrint"
          class="print-confirm-btn"
          :loading="isPrinting"
          :disable="isPrinting"
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
  mode: {
    type: String,
    required: true,
    validator: (value) => ['barcode', 'qrcode', 'label', 'data-print'].includes(value),
  },
  targets: {
    type: Array,
    default: () => [],
  },
  // 데이터 인쇄용 props
  dataPrintType: {
    type: String,
    default: 'selected', // 'selected' | 'filtered' | 'all'
  },
  dataPrintCount: {
    type: Number,
    default: 0,
  },
  printOptions: {
    type: Object,
    default: () => ({
      paperSize: 'a4',
      orientation: 'portrait',
      color: 'color',
      pages: 'all',
      pageRange: '',
      header: {
        show: true,
        title: '부품 분류 목록',
        showDate: true,
      },
      footer: {
        show: true,
        pageNumber: true,
        showDate: true,
      },
      style: {
        fontSize: 'medium',
        showBorders: true,
        alternateRows: true,
        headerBold: true,
      },
    }),
  },
  previewData: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'close', 'confirm-print', 'print-complete'])

// 로컬 상태
const activeTab = ref(props.mode === 'data-print' ? 'printer' : 'common')

// 모달이 열릴 때마다 프린터 옵션 탭을 기본으로 선택
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.mode === 'data-print') {
      activeTab.value = 'printer'
      // 모달이 열릴 때 isPrinting 상태 리셋
      isPrinting.value = false
    } else if (!isOpen) {
      // 모달이 닫힐 때 isPrinting 상태 리셋
      isPrinting.value = false
    }
  },
)

// 아코디언 상태 (하나만 열리도록)
const openedExpansions = ref({
  // 프린터 옵션 탭
  printOptions: true, // 기본으로 인쇄 옵션 열림
  headerFooter: false,
  printStyle: false,
  watermark: false,
  // 데이터 처리 옵션 탭
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

// 탭 변경 핸들러
function handleTabChange(tabName) {
  activeTab.value = tabName
}

// 로컬 인쇄 옵션 (데이터 인쇄 모드용)
const localPrintOptions = ref({
  ...props.printOptions,
  header: {
    show: props.printOptions.header?.show ?? true,
    title: props.printOptions.header?.title ?? '부품 분류 목록',
    showDate: props.printOptions.header?.showDate ?? true,
  },
  footer: {
    show: props.printOptions.footer?.show ?? true,
    pageNumber: props.printOptions.footer?.pageNumber ?? true,
    showDate: props.printOptions.footer?.showDate ?? true,
  },
  style: {
    fontSize: props.printOptions.style?.fontSize ?? 'medium',
    showBorders: props.printOptions.style?.showBorders ?? true,
    borderWidth: props.printOptions.style?.borderWidth ?? 'thin',
    cellPadding: props.printOptions.style?.cellPadding ?? 'medium',
    textAlign: props.printOptions.style?.textAlign ?? 'left',
    alternateRows: props.printOptions.style?.alternateRows ?? true,
    headerBold: props.printOptions.style?.headerBold ?? true,
  },
  watermark: {
    show: props.printOptions.watermark?.show ?? false,
    text: props.printOptions.watermark?.text ?? 'draft',
    customText: props.printOptions.watermark?.customText ?? '',
    position: props.printOptions.watermark?.position ?? 'center',
    opacity: props.printOptions.watermark?.opacity ?? 30,
  },
})

// props.printOptions 변경 시 로컬 옵션 동기화
watch(
  () => props.printOptions,
  (newOptions) => {
    localPrintOptions.value = {
      ...newOptions,
      header: {
        show: newOptions.header?.show ?? true,
        title: newOptions.header?.title ?? '부품 분류 목록',
        showDate: newOptions.header?.showDate ?? true,
      },
      footer: {
        show: newOptions.footer?.show ?? true,
        pageNumber: newOptions.footer?.pageNumber ?? true,
        showDate: newOptions.footer?.showDate ?? true,
      },
      style: {
        fontSize: newOptions.style?.fontSize ?? 'medium',
        showBorders: newOptions.style?.showBorders ?? true,
        borderWidth: newOptions.style?.borderWidth ?? 'thin',
        cellPadding: newOptions.style?.cellPadding ?? 'medium',
        textAlign: newOptions.style?.textAlign ?? 'left',
        alternateRows: newOptions.style?.alternateRows ?? true,
        headerBold: newOptions.style?.headerBold ?? true,
      },
      watermark: {
        show: newOptions.watermark?.show ?? false,
        text: newOptions.watermark?.text ?? 'draft',
        customText: newOptions.watermark?.customText ?? '',
        position: newOptions.watermark?.position ?? 'center',
        opacity: newOptions.watermark?.opacity ?? 30,
      },
    }
  },
  { deep: true },
)

const isPrinting = ref(false)

const titleEn = computed(() => {
  switch (props.mode) {
    case 'barcode':
      return 'BARCODE PRINT'
    case 'qrcode':
      return 'QR CODE PRINT'
    case 'label':
      return 'LABEL PRINT'
    case 'data-print':
      return 'PRINT DATA'
    default:
      return 'PRINT'
  }
})

const titleKo = computed(() => {
  switch (props.mode) {
    case 'barcode':
      return '바코드 출력'
    case 'qrcode':
      return 'QR 코드 출력'
    case 'label':
      return '라벨 출력'
    case 'data-print':
      return '데이터 인쇄'
    default:
      return '출력'
  }
})

const dataPrintTypeLabel = computed(() => {
  switch (props.dataPrintType) {
    case 'selected':
      return props.dataPrintCount > 1
        ? `선택 항목 인쇄 (${props.dataPrintCount}개)`
        : '선택 항목 인쇄'
    case 'filtered':
      return `필터 결과 인쇄 (${props.dataPrintCount}개)`
    case 'all':
      return `전체 인쇄 (${props.dataPrintCount}개)`
    default:
      return '데이터 인쇄'
  }
})

const printButtonLabel = computed(() => {
  return isPrinting.value ? '미리보기 열기 중...' : '미리보기 및 인쇄'
})

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

// 인쇄 옵션 옵션들
const paperSizeOptions = [
  { label: 'A4', value: 'a4' },
  { label: 'A3', value: 'a3' },
  { label: 'Letter', value: 'letter' },
]

const orientationOptions = [
  { label: '세로', value: 'portrait' },
  { label: '가로', value: 'landscape' },
]

const colorOptions = [
  { label: '컬러', value: 'color' },
  { label: '흑백', value: 'grayscale' },
]

const pagesOptions = [
  { label: '전체', value: 'all' },
  { label: '현재 페이지만', value: 'current' },
  { label: '페이지 범위', value: 'range' },
]

const fontSizeOptions = [
  { label: '작게 (8pt)', value: 'small' },
  { label: '보통 (10pt)', value: 'medium' },
  { label: '크게 (12pt)', value: 'large' },
  { label: '아주크게 (16pt)', value: 'xlarge' },
]

const borderWidthOptions = [
  { label: '얇게 (1px)', value: 'thin' },
  { label: '보통 (2px)', value: 'medium' },
  { label: '두껍게 (3px)', value: 'thick' },
]

const cellPaddingOptions = [
  { label: '좁게 (4px)', value: 'small' },
  { label: '보통 (8px)', value: 'medium' },
  { label: '넓게 (12px)', value: 'large' },
]

const textAlignOptions = [
  { label: '왼쪽', value: 'left' },
  { label: '가운데', value: 'center' },
  { label: '오른쪽', value: 'right' },
]

const watermarkTextOptions = [
  { label: '초안', value: 'draft' },
  { label: '비밀', value: 'confidential' },
  { label: '사용자 정의', value: 'custom' },
]

const watermarkPositionOptions = [
  { label: '중앙', value: 'center' },
  { label: '좌상단', value: 'top-left' },
  { label: '우상단', value: 'top-right' },
  { label: '좌하단', value: 'bottom-left' },
  { label: '우하단', value: 'bottom-right' },
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

function closeModal() {
  if (!isPrinting.value) {
    emit('close')
    emit('update:modelValue', false)
  }
}

async function confirmPrint() {
  if (isPrinting.value) return

  try {
    isPrinting.value = true

    // 부모 컴포넌트에 인쇄 확인 이벤트 발생
    emit('confirm-print', {
      options: { ...localPrintOptions.value },
      columns: selectedColumns.value,
      formatting: formattingOptions.value,
      type: props.dataPrintType,
      count: props.dataPrintCount,
      onWindowOpen: () => {
        // 인쇄 창이 열리면 isPrinting 상태 리셋 (모달은 유지)
        isPrinting.value = false
      },
    })

    // 인쇄 창이 열리면 isPrinting은 onWindowOpen 콜백에서 리셋됨
    // 모달은 유지되어 사용자가 설정을 다시 수정할 수 있음
  } catch (error) {
    console.error('인쇄 오류:', error)
    isPrinting.value = false
    // 에러 발생 시 모달 닫기
    closeModal()
  }
}
</script>

<style lang="scss" scoped>
.print-modal-card {
  min-width: 800px;
  max-width: 90vw;
  width: 900px;
  max-height: 90vh;
  padding: 24px;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-surface);
  border-radius: 8px;
  border: 2px solid var(--q-primary);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow: visible;

  :deep(.q-card__section) {
    padding: 0;
  }

  @media (max-width: 600px) {
    min-width: 95vw;
    width: 95vw;
    max-width: 95vw;
  }
}

// 1. 상단 타이틀
.print-header {
  margin-bottom: 24px;
}

.print-title {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.print-title-en {
  font-size: 3.5em;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 1.2;
  color: var(--q-primary);
}

.print-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.print-title-ko {
  font-size: 24px;
  font-weight: 600;
  color: var(--q-primary);
}

.print-type-badge {
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
.print-content-card {
  flex: 1;
  min-height: 0;
  margin: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// 구조적 래퍼 (시각적 스타일 없음 - 스크롤 관리용)
.print-content-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  // 시각적 스타일 없음 (구조적 래퍼만)
}

// 탭 섹션 (스크롤 없음)
.print-tabs-section {
  flex-shrink: 0;
  border: 1px solid var(--nexa-border-color);
  border-radius: 8px;
  padding: 16px 24px;
  margin: 0 0 16px 0;
}

.print-tabs {
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

// 컨텐츠 섹션 (스크롤 가능)
.print-content-section {
  border: 0;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  max-height: calc(90vh - 400px);
}

.print-tab-panels {
  background: transparent;

  :deep(.q-tab-panel) {
    padding: 0;
    background: transparent;
  }
}

.print-tab-panel {
  padding: 0;
}

.print-expansion-item {
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

.print-expansion-header {
  font-weight: 500;
  color: var(--nexa-text-primary);
  font-size: 15px;
}

.print-section-content {
  padding: 16px;
}

.print-option-group {
  display: flex;
  flex-direction: column;
}

.print-option-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--nexa-text-primary);
  margin-bottom: 8px;
}

.print-column-selector {
  .print-column-selector-header {
    display: flex;
    align-items: center;
  }

  .print-column-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 300px;
    overflow-y: auto;
    padding: 8px 0;
  }

  .print-column-item {
    padding: 4px 0;
  }
}

.print-options-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.print-option-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  min-height: 40px;
}

.print-option-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--nexa-text-primary);
  min-width: 100px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  line-height: 1.5;
  padding-top: 8px; /* 라디오 버튼 그룹의 첫 번째 요소와 정렬 */
  height: 40px; /* 라디오 버튼 그룹 높이와 맞춤 */
}

.print-option-controls {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
  padding-top: 4px; /* 라디오 버튼 그룹과 정렬 */
}

/* 라디오 버튼 그룹 정렬 조정 */
.print-option-row :deep(.q-option-group) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.print-preview {
  background-color: white;
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
  padding: 16px;
  min-height: 200px;

  .print-preview-header {
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid #e0e0e0;

    .print-preview-header-title {
      font-size: 18px;
      font-weight: 700;
      color: #000;
      margin-bottom: 8px;
    }

    .print-preview-header-date {
      font-size: 12px;
      color: #666;
    }
  }

  .print-preview-table {
    max-height: 300px;
    overflow-y: auto;
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

  .print-preview-footer {
    padding-top: 16px;
    margin-top: 16px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    color: #666;

    .print-preview-footer-page {
      flex: 1;
      text-align: center;
    }

    .print-preview-footer-date {
      flex: 1;
      text-align: right;
    }
  }
}

.print-dev-notice {
  padding: 16px;
  background-color: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.print-dev-notice-text {
  flex: 1;
}

.print-dev-notice-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--nexa-text-primary);
  margin-bottom: 4px;
}

.print-dev-notice-desc {
  font-size: 14px;
  color: var(--nexa-text-primary);
  opacity: 0.8;
}

// 3. 하단 버튼
.print-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px 0 0 0;
  margin-top: 16px;
}

.print-close-btn {
  min-width: 120px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 500;
  border: 1px solid var(--q-primary);
  background-color: transparent;
  color: var(--q-primary);

  :deep(.q-btn__content) {
    color: var(--q-primary);
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

.print-confirm-btn {
  min-width: 120px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 500;
  background-color: var(--q-primary);
  color: white;

  :deep(.q-btn__content) {
    color: white;
  }

  &:hover {
    opacity: 0.9;
  }
}
</style>
