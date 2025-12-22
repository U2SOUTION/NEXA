<!-- TimelineViewSettings.vue
  타임라인 뷰 설정 컴포넌트
-->
<template>
  <div class="timeline-view-settings">
    <q-expansion-item
      v-model="expanded.timeUnit"
      label="시간 단위"
      icon="schedule"
      header-class="text-weight-bold"
    >
      <q-card>
        <q-card-section>
          <q-select
            v-model="localSettings.timeUnit"
            :options="timeUnitOptions"
            label="시간 단위"
            dense
          />
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <q-expansion-item
      v-model="expanded.visibleFields"
      label="표시 필드"
      icon="list"
      header-class="text-weight-bold"
    >
      <q-card>
        <q-card-section>
          <q-list>
            <q-item
              v-for="field in availableFields"
              :key="field.name"
              tag="label"
            >
              <q-item-section avatar>
                <q-checkbox
                  v-model="localSettings.visibleFields"
                  :val="field.name"
                />
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
      v-model="expanded.eventStyle"
      label="이벤트 스타일"
      icon="palette"
      header-class="text-weight-bold"
    >
      <q-card>
        <q-card-section>
          <div class="text-caption q-mb-sm">
            이벤트 스타일 설정 (향후 구현)
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
import { ref, watch } from 'vue'
import { defaultTimelineViewSettings } from '../config/viewModeSettings'

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
  ensureSidebarNavigation({
    ...defaultTimelineViewSettings,
    ...props.settings,
  }),
)

// 확장 상태
const expanded = ref({
  timeUnit: false,
  visibleFields: false,
  eventStyle: false,
  sidebarNavigation: false,
})

// 시간 단위 옵션
const timeUnitOptions = [
  { label: '일', value: 'day' },
  { label: '주', value: 'week' },
  { label: '월', value: 'month' },
  { label: '년', value: 'year' },
]

// 설정 변경 감지
watch(
  localSettings,
  (newSettings) => {
    emit('update:settings', { ...newSettings })
  },
  { deep: true },
)

// props 변경 감지
watch(
  () => props.settings,
  (newSettings) => {
    localSettings.value = ensureSidebarNavigation({
      ...defaultTimelineViewSettings,
      ...newSettings,
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
// 여기서는 타임라인 뷰에만 특화된 스타일만 정의
// 향후 타임라인 뷰 전용 스타일이 필요하면 여기에 추가
</style>

