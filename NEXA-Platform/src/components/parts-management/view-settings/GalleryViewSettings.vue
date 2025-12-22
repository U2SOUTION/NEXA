<!-- GalleryViewSettings.vue
  갤러리 뷰 설정 컴포넌트
-->
<template>
  <div class="gallery-view-settings">
    <q-expansion-item
      v-model="expanded.thumbnail"
      label="썸네일 설정"
      icon="collections"
      header-class="text-weight-bold"
    >
      <q-card>
        <q-card-section>
          <div class="row q-gutter-md">
            <q-select
              v-model="localSettings.thumbnailSize"
              :options="thumbnailSizeOptions"
              label="썸네일 크기"
              dense
              class="col"
            />
            <q-input
              v-model.number="localSettings.gridColumns"
              type="number"
              label="그리드 열 수"
              min="2"
              max="6"
              dense
              class="col"
            />
          </div>
          <q-select
            v-model="localSettings.imageAspectRatio"
            :options="aspectRatioOptions"
            label="이미지 비율"
            dense
            class="q-mt-md"
          />
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <q-expansion-item
      v-model="expanded.hoverInfo"
      label="호버 정보"
      icon="info"
      header-class="text-weight-bold"
    >
      <q-card>
        <q-card-section>
          <q-checkbox
            v-model="localSettings.showHoverInfo"
            label="호버 시 정보 표시"
          />
          <q-select
            v-if="localSettings.showHoverInfo"
            v-model="localSettings.hoverInfoFields"
            :options="availableFields"
            option-label="label"
            option-value="name"
            emit-value
            map-options
            multiple
            label="표시할 필드"
            dense
            class="q-mt-md"
          />
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
import { defaultGalleryViewSettings } from '../config/viewModeSettings'

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
        maxRegularFileImages: 2,
        maxEditorImages: 2,
      },
    }
  } else if (!settings.sidebarNavigation.hoverView) {
    settings.sidebarNavigation.hoverView = {
      maxRegularFileImages: 2,
      maxEditorImages: 2,
    }
  } else {
    if (settings.sidebarNavigation.hoverView.maxRegularFileImages === undefined) {
      settings.sidebarNavigation.hoverView.maxRegularFileImages = 2
    }
    if (settings.sidebarNavigation.hoverView.maxEditorImages === undefined) {
      settings.sidebarNavigation.hoverView.maxEditorImages = 2
    }
  }
  return settings
}

// 로컬 설정
const localSettings = ref(
  ensureSidebarNavigation({
    ...defaultGalleryViewSettings,
    ...props.settings,
  }),
)

// 확장 상태
const expanded = ref({
  thumbnail: false,
  hoverInfo: false,
  sidebarNavigation: false,
})

// 썸네일 크기 옵션
const thumbnailSizeOptions = [
  { label: '작음', value: 'small' },
  { label: '보통', value: 'medium' },
  { label: '큼', value: 'large' },
]

// 이미지 비율 옵션
const aspectRatioOptions = [
  { label: '1:1 (정사각형)', value: '1:1' },
  { label: '4:3', value: '4:3' },
  { label: '16:9', value: '16:9' },
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
      ...defaultGalleryViewSettings,
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
// 여기서는 갤러리 뷰에만 특화된 스타일만 정의
// 향후 갤러리 뷰 전용 스타일이 필요하면 여기에 추가
</style>

