<template>
  <div class="explorer-preview column">
    <template v-if="!file">
      <div class="empty-preview text-grey-6 text-center q-pa-lg">파일을 선택하면 미리보기가 표시됩니다.</div>
    </template>
    <template v-else>
      <div class="preview-header row items-center q-pa-sm">
        <span class="ellipsis">{{ file.original_name }}</span>
      </div>
      <div class="preview-body col">
        <template v-if="isImage">
          <img v-if="!imageError" :src="previewUrl" alt="" class="preview-image" @error="onImageError" />
          <div v-else class="text-grey-6 text-center q-pa-md">미리보기를 불러올 수 없습니다.</div>
        </template>
        <template v-else-if="isVideo">
          <div class="video-preview column">
            <div class="media-preview-header column items-center q-pa-sm">
              <h2 class="media-player-title">NEXA Video Player</h2>
              <span class="media-player-subtitle">영상 미리보기</span>
            </div>
            <div class="media-options row q-px-sm q-pb-xs wrap q-gutter-x-sm q-gutter-y-xs">
              <q-toggle v-model="videoAutoplay" dense label="자동 재생" />
              <q-toggle v-model="videoLoop" dense label="반복 재생" />
              <q-toggle v-model="videoMuted" dense label="음소거" />
            </div>
            <video
              v-if="previewUrl"
              ref="videoEl"
              controls
              class="preview-video q-px-sm q-pb-sm"
              :src="previewUrl"
              :autoplay="videoAutoplay"
              :loop="videoLoop"
              :muted="videoMuted"
            >
              이 브라우저는 영상 재생을 지원하지 않습니다.
            </video>
            <div v-else class="text-grey-6 text-center q-pa-md">재생할 수 있는 주소가 없습니다.</div>
          </div>
        </template>
        <template v-else-if="isAudio">
          <div class="audio-preview column">
            <div class="media-preview-header column items-center q-pa-sm">
              <h2 class="media-player-title">NEXA Sound Player</h2>
              <span class="media-player-subtitle">오디오 미리듣기</span>
            </div>
            <div class="media-options row q-px-sm q-pb-xs wrap q-gutter-x-sm q-gutter-y-xs">
              <q-toggle v-model="audioAutoplay" dense label="자동 재생" />
              <q-toggle v-model="audioLoop" dense label="반복 재생" />
              <q-toggle v-model="audioMuted" dense label="음소거" />
            </div>
            <audio v-if="previewUrl" ref="audioEl" controls class="preview-audio q-px-sm q-pb-sm" :src="previewUrl" :autoplay="audioAutoplay" :loop="audioLoop" :muted="audioMuted">이 브라우저는 오디오 재생을 지원하지 않습니다.</audio>
            <div v-else class="text-grey-6 text-center q-pa-md">재생할 수 있는 주소가 없습니다.</div>
          </div>
        </template>
        <!-- 문서 미리보기: 추후 에디터 문서(그대로 표시), 마크다운(기존 파서), 그 외(PDF/Office 등 외부 라이브러리) 지원 예정 -->
        <div v-else class="document-preview-placeholder text-grey-6 text-center q-pa-lg">
          준비중
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { getUploadDisplayUrl } from '@system/utils/apiBaseUrl.js'

const props = defineProps({
  file: { type: Object, default: null },
})

const imageError = ref(false)
const audioEl = ref(null)
const audioAutoplay = ref(false)
const audioLoop = ref(false)
const audioMuted = ref(false)
const videoEl = ref(null)
const videoAutoplay = ref(false)
const videoLoop = ref(false)
const videoMuted = ref(false)

const isImage = computed(() => {
  const t = (props.file?.file_type || props.file?.category || '').toLowerCase()
  return t === 'image' || t === 'images'
})

const isAudio = computed(() => {
  const t = (props.file?.file_type || props.file?.category || '').toLowerCase()
  return t === 'audio'
})

const isVideo = computed(() => {
  const t = (props.file?.file_type || props.file?.category || '').toLowerCase()
  return t === 'video'
})

// same-origin 우선: 앱과 API 포트가 다르면 절대 url은 이미지 로드 실패 → file_path 기준 사용
const previewUrl = computed(() => {
  if (!props.file) return ''
  if (props.file.file_path) return getUploadDisplayUrl(props.file.file_path)
  if (props.file.url) return props.file.url
  return ''
})

function onImageError() {
  imageError.value = true
}

watch(
  () => props.file,
  () => {
    imageError.value = false
  },
)
</script>

<style lang="scss" scoped>
.explorer-preview {
  min-height: 0;
}
.empty-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-header {
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.preview-body {
  min-height: 0;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.video-preview,
.audio-preview {
  width: 100%;
  min-height: 0;
}
.media-preview-header {
  flex-shrink: 0;
}
.media-player-title {
  margin: 0;
  font-size: 2.25rem;
  font-weight: 900;
  color: inherit;
  letter-spacing: 0.02em;
}
.media-player-subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}
.media-options {
  flex-shrink: 0;
}
.preview-video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  flex-shrink: 0;
}
.preview-audio {
  max-width: 100%;
  width: 100%;
  flex-shrink: 0;
}
</style>
