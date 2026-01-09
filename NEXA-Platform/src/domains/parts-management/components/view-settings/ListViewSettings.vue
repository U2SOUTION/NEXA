<!-- ListViewSettings.vue
  리스트 뷰 설정 컴포넌트
-->
<template>
  <div class="list-view-settings">
    <q-expansion-item
      v-model="expanded.visibleFields"
      label="표시 필드"
      icon="list"
      header-class="text-weight-bold"
    >
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

    <q-expansion-item
      v-model="expanded.appearance"
      label="외관 설정"
      icon="format_size"
      header-class="text-weight-bold"
    >
      <q-card>
        <q-card-section>
          <div class="row q-gutter-md">
            <q-select
              v-model="localSettings.rowSpacing"
              :options="rowSpacingOptions"
              label="행 간격"
              dense
              class="col"
            />
            <q-select
              v-model="localSettings.fontSize"
              :options="fontSizeOptions"
              label="폰트 크기"
              dense
              class="col"
            />
            <q-select
              v-model="localSettings.expandMode"
              :options="expandModeOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="확장 모드"
              dense
              class="col"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- 페이징 설정 -->
    <q-expansion-item
      v-model="expanded.pagination"
      label="페이징 설정"
      icon="view_list"
      header-class="text-weight-bold"
    >
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
    <q-expansion-item
      v-model="expanded.sidebarNavigation"
      label="사이드바 네비게이션"
      icon="view_sidebar"
      header-class="text-weight-bold"
    >
      <q-card>
        <q-card-section>
          <div class="row q-gutter-md">
            <q-input
              v-model.number="localSettings.sidebarNavigation.hoverView.maxRegularFileImages"
              type="number"
              label="일반 첨부 파일 이미지 최대 표시 수 (0: 표시 안 함)"
              min="0"
              max="10"
              dense
              class="col"
            />
            <q-input
              v-model.number="localSettings.sidebarNavigation.hoverView.maxEditorImages"
              type="number"
              label="에디터 이미지 최대 표시 수 (0: 표시 안 함)"
              min="0"
              max="10"
              dense
              class="col"
            />
          </div>
          <div class="q-mt-md">
            <q-btn
              flat
              dense
              color="primary"
              icon="sync"
              label="모든 뷰에 동시 적용"
              @click="handleApplyToAllViews"
              class="full-width"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { defaultListViewSettings } from '../config/viewModeSettings'

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
    settings.rowsPerPageOptions = defaultListViewSettings.rowsPerPageOptions || [10, 25, 50, 100]
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

// 로컬 설정
const localSettings = ref(
  ensureRowsPerPageOptions(
  ensureSidebarNavigation({
    ...defaultListViewSettings,
    ...props.settings,
  }),
  ),
)

// 확장 상태
const expanded = ref({
  visibleFields: false,
  appearance: false,
  pagination: false,
  sidebarNavigation: false,
})

// 행 간격 옵션
const rowSpacingOptions = [
  { label: '좁게', value: 'compact' },
  { label: '보통', value: 'normal' },
  { label: '넓게', value: 'comfortable' },
]

// 폰트 크기 옵션
const fontSizeOptions = [
  { label: '작게', value: 'small' },
  { label: '보통', value: 'medium' },
  { label: '크게', value: 'large' },
]

// 확장 모드 옵션
const expandModeOptions = [
  { label: '전체 펼침', value: 'expanded' },
  { label: '아코디언', value: 'accordion' },
  { label: '독립 토글', value: 'independent' },
]

// 페이징 리미트 옵션 프리셋
const rowsPerPagePresets = [
  { label: '기본 (10, 25, 50, 100)', value: [10, 25, 50, 100] },
  { label: '작은 단위 (5, 10, 25, 50)', value: [5, 10, 25, 50] },
  { label: '큰 단위 (25, 50, 100, 200)', value: [25, 50, 100, 200] },
  { label: '매우 큰 단위 (50, 100, 200, 500)', value: [50, 100, 200, 500] },
]

// 설정 변경 감지 (무한 루프 방지: props 변경으로 인한 업데이트는 제외)
let isUpdatingFromProps = false

watch(
  localSettings,
  (newSettings) => {
    if (!isUpdatingFromProps) {
    emit('update:settings', { ...newSettings })
    }
  },
  { deep: true },
)

// props 변경 감지
watch(
  () => props.settings,
  (newSettings) => {
    isUpdatingFromProps = true
    localSettings.value = ensureRowsPerPageOptions(
      ensureSidebarNavigation({
      ...defaultListViewSettings,
      ...newSettings,
      }),
    )
    // 다음 틱에서 플래그 해제
    nextTick(() => {
      isUpdatingFromProps = false
    })
  },
  { deep: true },
)

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
// 여기서는 리스트 뷰에만 특화된 스타일만 정의
// 향후 리스트 뷰 전용 스타일이 필요하면 여기에 추가
</style>
