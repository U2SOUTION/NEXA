<!-- CardViewSettings.vue
  카드 뷰 설정 컴포넌트
-->
<template>
  <div class="card-view-settings">
    <q-list>
      <!-- 반응형 레이아웃 설정 -->
      <q-expansion-item v-model="expanded.responsive" label="카드크기 및 레이아웃 (반응형)" icon="view_quilt" header-class="text-weight-bold" group="settings-accordion">
      <q-card>
        <q-card-section>
            <!-- 자동/수동 모드 토글 -->
            <div class="auto-mode-toggle-wrapper">
              <div class="toggle-label q-mb-xs">카드 크기및 레이아웃 설정 모드 선택</div>
              <q-btn-toggle
                v-model="localSettings.responsive.enabled"
                :options="[
                  { label: '수동', value: false, icon: 'settings' },
                  { label: '자동', value: true, icon: 'auto_awesome' },
                ]"
                toggle-color="primary"
                color="grey-7"
                text-color="white"
                size="md"
                class="auto-mode-btn-toggle"
            />
          </div>

            <!-- 현재 모드 상태 표시 (토글 바로 아래, 라벨 좌측 정렬) -->
            <div class="mode-status-text">
              <q-icon :name="localSettings.responsive.enabled ? 'auto_awesome' : 'settings'" :color="localSettings.responsive.enabled ? 'primary' : 'orange'" class="q-mr-xs" />
              <span :class="localSettings.responsive.enabled ? 'text-primary' : 'text-orange'">
                {{ currentModeText }}
              </span>
            </div>

            <!-- 자동 모드일 때는 힌트 메시지만 표시 -->
            <div v-if="localSettings.responsive.enabled" class="card-height-hint q-mb-md">
              <q-icon name="info" size="16px" class="q-mr-xs" />
              <span class="card-height-hint-main">직접 입력 하시려면 수동 모드를 선택해주세요</span>

              <div class="card-height-hint-content">
                자동 모드에서 자동 할당되는 항목:
                <ul class="card-height-hint-list">
                  <li>열 수: 화면 크기에 따라 자동 조정</li>
                  <li>카드 높이: 카드 너비의 120%로 자동 할당</li>
                </ul>
              </div>
            </div>

            <!-- 자동 모드: 1줄 배치 -->
            <div v-if="localSettings.responsive.enabled" class="row q-gutter-md q-mb-md">
              <div class="col">
                <q-select v-model.number="localSettings.gridColNum" :options="gridColNumOptions" option-label="label" option-value="value" emit-value map-options dense label="그리드 정밀도" />
              </div>
              <div class="col">
                <q-input v-model.number="localSettings.gap.horizontal" type="number" label="가로 간격 (0-50px)" min="0" max="50" dense />
              </div>
              <div class="col">
                <q-input v-model.number="localSettings.gap.vertical" type="number" label="세로 간격 (0-50px)" min="0" max="50" dense />
              </div>
            </div>

            <!-- 수동 모드: 2줄 배치 -->
            <template v-else>
              <!-- 1줄: 그리드 정밀도 + 목표 열 수 + 절대 고정 열 수 -->
              <div class="row q-gutter-md q-mb-sm" style="margin-top: 10px">
                <div class="col">
                  <q-select v-model.number="localSettings.gridColNum" :options="gridColNumOptions" option-label="label" option-value="value" emit-value map-options dense label="그리드 정밀도" />
                </div>
                <div class="col">
                  <q-select v-model.number="localSettings.colsPerRow" :options="availableColsOptions" option-label="label" option-value="value" emit-value map-options dense label="목표 열 수" />
                </div>
                <div class="col">
                  <div class="q-mt-sm">
                    <q-checkbox v-model="localSettings.responsive.fixedCols" label="절대 고정 열 수" dense />
                  </div>
                </div>
              </div>

              <!-- 힌트 메시지 (별도 줄, 가로로 길게) -->
              <div class="text-caption text-grey-7 q-mb-md" style="padding-left: 4px">
                <q-icon name="info" size="12px" class="q-mr-xs" />
                <span v-if="!localSettings.responsive.fixedCols">큰 화면에서 목표로 하는 열 수입니다. <br />브라우저 창 크기를 조절하면 실제 표시되는 열 수가 자동으로 조정됩니다.</span>
                <span v-else>화면 크기와 무관하게 항상 설정한 열 수를 유지합니다.</span>
              </div>

              <!-- 2줄: 카드 높이 + 카드 간격 -->
              <div class="row q-gutter-md q-mb-md" style="margin-top: 10px">
                <div class="col">
                  <q-input v-model.number="cardHeightInputValue" type="number" :label="cardHeightLabel" :min="cardHeightUnit === 'pixel' ? 100 : 50" :max="cardHeightUnit === 'pixel' ? 1000 : 250" dense @blur="validateCardHeight" />
                </div>
                <div class="col-auto" style="min-width: 100px">
                  <q-select v-model="cardHeightUnit" :options="cardHeightUnitOptions" option-label="label" option-value="value" emit-value map-options dense label="단위" @update:model-value="handleCardHeightUnitChange" />
                </div>
                <div class="col">
                  <q-input v-model.number="localSettings.gap.horizontal" type="number" label="가로 간격 (2-20px)" min="2" max="20" dense />
                </div>
                <div class="col">
                  <q-input v-model.number="localSettings.gap.vertical" type="number" label="세로 간격 (2-20px)" min="2" max="20" dense />
          </div>
          </div>

              <!-- 비율 힌트 (ratio 모드일 때만) -->
              <div v-if="cardHeightUnit === 'ratio'" class="text-caption text-grey-7 q-mb-md">비율은 직접 입력해주세요. 범위: 50% ~ 250% (예: 140 = 140%)</div>
            </template>
        </q-card-section>
      </q-card>
    </q-expansion-item>

      <q-expansion-item v-model="expanded.visibleFields" label="표시 필드" icon="list" header-class="text-weight-bold" group="settings-accordion">
      <q-card>
        <q-card-section>
          <q-list>
            <q-item v-for="field in availableFields" :key="field.name" tag="label">
              <q-item-section avatar>
                <q-checkbox v-model="localSettings.visibleFields" :val="field.name" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ field.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-expansion-item>

      <q-expansion-item v-model="expanded.image" label="이미지 설정" icon="image" header-class="text-weight-bold" group="settings-accordion">
      <q-card>
        <q-card-section>
          <q-checkbox v-model="localSettings.showImage" label="이미지 표시" />
            <q-select v-if="localSettings.showImage" v-model="localSettings.imagePosition" :options="imagePositionOptions" label="이미지 위치" dense class="q-mt-md" />
        </q-card-section>
      </q-card>
    </q-expansion-item>

      <q-expansion-item v-model="expanded.cardStyle" label="카드 스타일" icon="palette" header-class="text-weight-bold" group="settings-accordion">
      <q-card>
        <q-card-section>
          <q-checkbox v-model="localSettings.cardStyle.border" label="테두리 표시" />
            <q-checkbox v-model="localSettings.cardStyle.shadow" label="그림자 표시" class="q-mt-sm" />
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- 페이징 설정 -->
      <q-expansion-item v-model="expanded.pagination" label="페이징 설정" icon="view_list" header-class="text-weight-bold" group="settings-accordion">
        <q-card>
          <q-card-section>
            <div class="row q-gutter-md">
              <div class="col-12">
                <q-select
                  v-model="localSettings.rowsPerPageOptions"
                  :options="rowsPerPagePresets"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  label="페이지당 항목 수 옵션"
                  dense
                  hint="페이징 하단에서 선택할 수 있는 옵션 목록"
          />
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
      <q-expansion-item v-model="expanded.sidebarNavigation" label="사이드바 네비게이션" icon="view_sidebar" header-class="text-weight-bold" group="settings-accordion">
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
    </q-list>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { useQuasar } from 'quasar'
import { defaultCardViewSettings } from '../config/viewModeSettings'

const $q = useQuasar()

const props = defineProps({
  settings: {
    type: Object,
    required: true,
  },
  availableFields: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['update:settings', 'apply-to-all-views'])

// rowsPerPageOptions 기본값 보장
const ensureRowsPerPageOptions = (settings) => {
  if (!settings.rowsPerPageOptions || !Array.isArray(settings.rowsPerPageOptions) || settings.rowsPerPageOptions.length === 0) {
    settings.rowsPerPageOptions = defaultCardViewSettings.rowsPerPageOptions || [10, 25, 50, 100]
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
    if (settings.sidebarNavigation.hoverView.maxRegularFileImages === undefined) {
      settings.sidebarNavigation.hoverView.maxRegularFileImages = 1
    }
    if (settings.sidebarNavigation.hoverView.maxEditorImages === undefined) {
      settings.sidebarNavigation.hoverView.maxEditorImages = 1
    }
  }
  return settings
}

// gridColNum 기본값 보장 (하위 호환성: gridColumns도 지원)
const ensureGridColNum = (settings) => {
  if (!settings.gridColNum && settings.gridColumns) {
    // 기존 gridColumns 값을 gridColNum으로 변환
    // gridColumns는 1-6 범위였지만, gridColNum은 12-48 범위
    // 변환 로직: gridColumns 3 = gridColNum 24 (기본값)
    const conversionMap = { 1: 12, 2: 24, 3: 24, 4: 48, 5: 48, 6: 48 }
    settings.gridColNum = conversionMap[settings.gridColumns] || 24
    delete settings.gridColumns // 구버전 속성 제거
  } else if (!settings.gridColNum) {
    settings.gridColNum = defaultCardViewSettings.gridColNum || 24
  }
  
  // gridColNum이 옵션에 없는 값이면 가장 가까운 옵션 값으로 조정
  const validOptions = [12, 24, 48]
  if (!validOptions.includes(settings.gridColNum)) {
    // 가장 가까운 옵션 값으로 조정
    let closest = validOptions[0]
    let minDiff = Math.abs(settings.gridColNum - closest)
    for (const option of validOptions) {
      const diff = Math.abs(settings.gridColNum - option)
      if (diff < minDiff) {
        minDiff = diff
        closest = option
      }
    }
    settings.gridColNum = closest
  }
  
  return settings
}

// GRID_SETTINGS 구조 기본값 보장
const ensureGridSettings = (settings) => {
  // responsive 기본값
  if (!settings.responsive) {
    settings.responsive = {
      enabled: true,
      colsPerRow: null,
      fixedCols: false, // 절대 모드 (고정 열 수) - 기본값: false (반응형)
    }
  } else {
    if (settings.responsive.enabled === undefined) {
      settings.responsive.enabled = true
    }
    if (settings.responsive.colsPerRow === undefined) {
      settings.responsive.colsPerRow = null
    }
    if (settings.responsive.fixedCols === undefined) {
      settings.responsive.fixedCols = false
    }
  }

  // autoMode 기본값
  if (!settings.autoMode) {
    settings.autoMode = {
      minCols: 1,
      maxCols: 12,
      minCardWidthPx: 350,
      cardWidthPx: 400,
    }
  } else {
    if (settings.autoMode.minCols === undefined) settings.autoMode.minCols = 1
    if (settings.autoMode.maxCols === undefined) settings.autoMode.maxCols = 12
    if (settings.autoMode.minCardWidthPx === undefined) settings.autoMode.minCardWidthPx = 350
    if (settings.autoMode.cardWidthPx === undefined) settings.autoMode.cardWidthPx = 400
  }

  // cardHeight 기본값
  if (!settings.cardHeight) {
    settings.cardHeight = {
      mode: 'auto',
      ratio: 1.4,
      pixel: 350,
    }
  } else {
    if (settings.cardHeight.mode === undefined) settings.cardHeight.mode = 'auto'
    if (settings.cardHeight.ratio === undefined) settings.cardHeight.ratio = 1.4
    if (settings.cardHeight.pixel === undefined) settings.cardHeight.pixel = 350
  }

  // gap 기본값
  if (!settings.gap) {
    settings.gap = {
      horizontal: 6,
      vertical: 6,
    }
  } else {
    if (settings.gap.horizontal === undefined) settings.gap.horizontal = 6
    if (settings.gap.vertical === undefined) settings.gap.vertical = 6
  }

  // colsPerRow 기본값
  if (settings.colsPerRow === undefined) {
    settings.colsPerRow = 12
  }

  return settings
}

// 로컬 설정
const localSettings = ref(
  ensureGridSettings(
  ensureGridColNum(
      ensureRowsPerPageOptions(
    ensureSidebarNavigation({
      ...defaultCardViewSettings,
      ...props.settings,
    }),
      ),
    ),
  ),
)

// 확장 상태
const expanded = ref({
  responsive: false,
  visibleFields: false,
  image: false,
  cardStyle: false,
  pagination: false,
  sidebarNavigation: false,
})

// 페이징 리미트 옵션 프리셋
const rowsPerPagePresets = [
  { label: '기본 (10, 25, 50, 100)', value: [10, 25, 50, 100] },
  { label: '작은 단위 (5, 10, 25, 50)', value: [5, 10, 25, 50] },
  { label: '큰 단위 (25, 50, 100, 200)', value: [25, 50, 100, 200] },
  { label: '매우 큰 단위 (50, 100, 200, 500)', value: [50, 100, 200, 500] },
]

// 이미지 위치 옵션
const imagePositionOptions = [
  { label: '상단', value: 'top' },
  { label: '왼쪽', value: 'left' },
  { label: '오른쪽', value: 'right' },
]

// 그리드 정밀도 옵션
const gridColNumOptions = [
  { label: '낮음 (12)', value: 12 },
  { label: '보통 (24)', value: 24 },
  { label: '높음 (48)', value: 48 },
]

// 카드 높이 모드 옵션
// 카드 높이 단위 옵션
const cardHeightUnitOptions = [
  { label: 'px', value: 'pixel' },
  { label: '%', value: 'ratio' },
]

// 카드 높이 입력값 (수동 모드용)
const cardHeightInputValue = ref(350)
const cardHeightUnit = ref('pixel')

// 약수 계산 함수
function getDivisors(num) {
  const divisors = []
  for (let i = 1; i <= num; i++) {
    if (num % i === 0) {
      divisors.push(i)
    }
  }
  return divisors
}

// 현재 모드 상태 텍스트
const currentModeText = computed(() => {
  if (localSettings.value.responsive?.enabled) {
    return '자동 모드: 화면 크기에 따라 열 수가 자동으로 조정됩니다'
  } else {
    const fixedCols = localSettings.value.responsive?.fixedCols
    if (fixedCols) {
      return '수동 모드 (절대): 설정한 열 수가 항상 고정됩니다'
    } else {
      return '수동 모드: 목표 열 수를 설정합니다 (화면 크기에 따라 자동 조정)'
    }
  }
})

// 사용 가능한 열 수 옵션 (약수 기반)
const availableColsOptions = computed(() => {
  const gridColNum = localSettings.value.gridColNum || 24
  const divisors = getDivisors(gridColNum)
  return divisors.map((div) => ({
    label: `${div}열`,
    value: div,
  }))
})

// 카드 높이 입력 라벨 (단위에 따라 동적 변경)
const cardHeightLabel = computed(() => {
  if (cardHeightUnit.value === 'pixel') {
    return '카드 높이 (100-1000px)'
  } else {
    return '카드 높이 (50-250%)'
  }
})

// 카드 높이 단위 변경 시 값 변환
function handleCardHeightUnitChange(newUnit) {
  if (newUnit === 'pixel') {
    // ratio → pixel: 현재 비율 값을 픽셀로 변환 (대략적인 값)
    if (cardHeightUnit.value === 'ratio') {
      const ratioValue = cardHeightInputValue.value
      // 기본 카드 너비 400px 기준으로 계산
      cardHeightInputValue.value = Math.round((ratioValue / 100) * 400)
    }
  } else if (newUnit === 'ratio') {
    // pixel → ratio: 현재 픽셀 값을 비율로 변환
    if (cardHeightUnit.value === 'pixel') {
      const pixelValue = cardHeightInputValue.value
      // 기본 카드 너비 400px 기준으로 계산
      cardHeightInputValue.value = Math.round((pixelValue / 400) * 100)
    }
  }

  // localSettings 업데이트
  updateCardHeightSettings()
}

// 카드 높이 입력값 검증
function validateCardHeight() {
  const value = cardHeightInputValue.value
  const unit = cardHeightUnit.value

  if (unit === 'pixel') {
    if (value < 100 || value > 1000) {
      $q.notify({
        type: 'negative',
        message: '카드 높이는 100px ~ 1000px 범위로 입력해주세요.',
        position: 'top',
        timeout: 2000,
      })
      // 범위 내로 조정
      cardHeightInputValue.value = Math.max(100, Math.min(1000, value))
      updateCardHeightSettings()
    }
  } else if (unit === 'ratio') {
    if (value < 50 || value > 250) {
      $q.notify({
        type: 'negative',
        message: '카드 높이 비율은 50% ~ 250% 범위로 입력해주세요.',
        position: 'top',
        timeout: 2000,
      })
      // 범위 내로 조정
      cardHeightInputValue.value = Math.max(50, Math.min(250, value))
      updateCardHeightSettings()
    }
  }

  updateCardHeightSettings()
}

// localSettings에 카드 높이 값 업데이트
function updateCardHeightSettings() {
  const value = cardHeightInputValue.value
  const unit = cardHeightUnit.value

  if (unit === 'pixel') {
    localSettings.value.cardHeight.mode = 'pixel'
    localSettings.value.cardHeight.pixel = value
  } else if (unit === 'ratio') {
    localSettings.value.cardHeight.mode = 'ratio'
    localSettings.value.cardHeight.ratio = value / 100 // 비율은 0.5~2.5 범위
  }
}

// 카드 높이 입력값 초기화
function initializeCardHeightInput() {
  const mode = localSettings.value.cardHeight?.mode || 'auto'
  if (mode === 'pixel') {
    cardHeightInputValue.value = localSettings.value.cardHeight?.pixel || 350
    cardHeightUnit.value = 'pixel'
  } else if (mode === 'ratio') {
    const ratio = localSettings.value.cardHeight?.ratio || 1.4
    cardHeightInputValue.value = Math.round(ratio * 100) // 1.4 → 140
    cardHeightUnit.value = 'ratio'
  } else {
    // auto 모드
    cardHeightInputValue.value = 350
    cardHeightUnit.value = 'pixel'
  }
}

// 수동 모드에서 colsPerRow가 약수가 아닌 경우 자동 조정
watch(
  () => [localSettings.value.colsPerRow, localSettings.value.gridColNum, localSettings.value.responsive?.enabled],
  ([colsPerRow, gridColNum, enabled]) => {
    // 수동 모드이고, 약수가 아닌 경우에만 조정
    if (!enabled && colsPerRow && gridColNum) {
      const divisors = getDivisors(gridColNum)
      if (!divisors.includes(colsPerRow)) {
        // 가장 가까운 약수로 조정
        let closest = divisors[0]
        let minDiff = Math.abs(colsPerRow - closest)
        for (const div of divisors) {
          const diff = Math.abs(colsPerRow - div)
          if (diff < minDiff) {
            minDiff = diff
            closest = div
          }
        }
        localSettings.value.colsPerRow = closest
      }
    }
  },
)

// watch 무한 루프 방지 플래그
let isUpdatingFromProps = false

// 설정 변경 감지 (debounce로 성능 최적화 - 입력 필드 반응성 개선)
let emitTimeout = null
watch(
  localSettings,
  (newSettings) => {
    // props에서 업데이트 중이면 emit하지 않음
    if (isUpdatingFromProps) {
      return
    }
    // debounce: 100ms 내 여러 번 변경되면 마지막 변경만 반영 (실시간 반영을 위해 단축)
    if (emitTimeout) {
      clearTimeout(emitTimeout)
    }
    emitTimeout = setTimeout(() => {
      emit('update:settings', { ...newSettings })
    }, 100)
  },
  { deep: true },
)

// props 변경 감지
watch(
  () => props.settings,
  (newSettings) => {
    isUpdatingFromProps = true
    localSettings.value = ensureGridSettings(
      ensureGridColNum(
        ensureRowsPerPageOptions(
      ensureSidebarNavigation({
        ...defaultCardViewSettings,
        ...newSettings,
      }),
        ),
      ),
    )
    nextTick(() => {
      isUpdatingFromProps = false
      initializeCardHeightInput()
    })
  },
  { deep: true },
)

// 자동 모드 변경 시 카드 높이도 자동으로 설정
watch(
  () => localSettings.value.responsive?.enabled,
  (enabled) => {
    if (enabled) {
      // 자동 모드로 전환 시 카드 높이도 자동으로 설정
      localSettings.value.cardHeight.mode = 'auto'
    }
  },
)

// 초기화
initializeCardHeightInput()

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
// 여기서는 카드 뷰에만 특화된 스타일만 정의
// 향후 카드 뷰 전용 스타일이 필요하면 여기에 추가

// 자동 모드 토글 래퍼 (하단 마진 추가)
.auto-mode-toggle-wrapper {
  margin-bottom: 12px; // 안내 메시지와의 간격
}

// 자동 모드 버튼 토글 스타일 (q-btn-toggle 사용)
.auto-mode-btn-toggle {
  border-radius: 4px;
}

// 그리드 정밀도 셀렉트 스타일 (옵션 텍스트 크기 및 색상 조정)
.grid-col-num-select {
  :deep(.q-field__native) {
    font-size: 13px;
    color: var(--nexa-text-secondary);
    opacity: 0.8;
  }

  :deep(.q-field__input) {
    font-size: 13px;
    color: var(--nexa-text-secondary);
    opacity: 0.8;
  }
}

// 모드 상태 텍스트 스타일 (라벨 좌측 정렬, 간격 조정)
.mode-status-text {
  margin-top: 8px; // 상단 간격 조정 (버튼과의 간격)
  margin-bottom: 20px; // 하단 간격 조정 (그리드 정밀도와의 간격)
  padding-left: 0; // 패딩 제거
  font-size: 0.875rem; // text-body2 크기
  line-height: 1.4;
}

// 카드 높이 힌트 메시지 스타일 (흐리게 표현)
.card-height-hint {
  font-size: 12px;
  color: var(--nexa-text-hint) !important; // 전역 힌트 텍스트 색상 사용 (다른 스타일 오버라이드 방지)
  font-weight: 100;
  line-height: 1.6;

  .card-height-hint-main {
    font-size: 13px; // 메인 메시지만 더 큰 폰트
    font-weight: 400;
  }

  .card-height-hint-content {
    margin-left: 16px; // 오른쪽으로 들여쓰기
  }

  .card-height-hint-list {
    margin: 4px 0 4px 16px;
    padding: 0;
    list-style-type: disc;

    li {
      margin: 2px 0;
      padding-left: 4px;
    }
  }
}
</style>
