<!-- WebcamViewer.vue
  전역 웹캠 뷰어 컴포넌트
  - 비디오 프리뷰, 캡처, 설정(반전/해상도/필터) 모달
  - 다른 도메인에서 재사용 가능
-->
<template>
  <div class="nexa-webcam-viewer">
    <div class="webcam-video-wrap">
      <video v-show="stream" ref="videoRef" autoplay playsinline muted class="webcam-video" :style="videoStyle" />
      <div v-if="!stream && !error" class="webcam-placeholder">웹캠을 켜면 영상이 표시됩니다</div>
      <div v-if="error" class="webcam-error text-caption text-negative">{{ error }}</div>
    </div>
    <div class="webcam-buttons row items-center justify-between q-mt-sm">
      <q-btn v-if="showCaptureButton" outline dense color="primary" icon="camera_alt" label="캡처첨부" class="webcam-capture-btn" :disable="!stream" @click="capture" />
      <q-space v-else />
      <q-btn round dense flat size="sm" icon="settings" title="웹캠 설정" @click="settingsModalOpen = true" />
    </div>

    <q-dialog v-model="settingsModalOpen" class="nexa-webcam-settings-dialog" persistent>
      <q-card class="nexa-webcam-settings-card">
        <q-card-section class="row items-center q-pb-none">
          <div>
            <div class="webcam-modal-title">Webcam Settings</div>
            <div class="webcam-modal-subtitle">웹캠 설정</div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense @click="settingsModalOpen = false" />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="webcam-setting-block q-mb-lg">
            <div class="text-caption text-grey-7 text-uppercase q-mb-sm">화면 반전</div>
            <q-select :model-value="flipMode" :options="flipOptions" outlined dense emit-value map-options hide-bottom-space @update:model-value="emit('update:flipMode', $event)" />
          </div>
          <div class="webcam-setting-block q-mb-lg">
            <div class="text-caption text-grey-7 text-uppercase q-mb-sm">해상도</div>
            <q-select :model-value="resolution" :options="resolutionOptions" outlined dense emit-value map-options hide-bottom-space @update:model-value="onResolutionChange" />
          </div>
          <div class="webcam-setting-block">
            <div class="text-caption text-grey-7 text-uppercase q-mb-sm">필터</div>
            <div class="webcam-filter-row q-mb-md">
              <div class="text-body2 q-mb-xs">밝기</div>
              <div class="row items-center no-wrap q-gutter-sm">
                <q-slider :model-value="brightness" :min="0" :max="200" :step="5" class="col" @update:model-value="emit('update:brightness', $event)" />
                <span class="text-caption" style="min-width: 2.5em">{{ brightness }}%</span>
              </div>
            </div>
            <div class="webcam-filter-row q-mb-md">
              <div class="text-body2 q-mb-xs">대비</div>
              <div class="row items-center no-wrap q-gutter-sm">
                <q-slider :model-value="contrast" :min="0" :max="200" :step="5" class="col" @update:model-value="emit('update:contrast', $event)" />
                <span class="text-caption" style="min-width: 2.5em">{{ contrast }}%</span>
              </div>
            </div>
            <div class="webcam-filter-row q-mb-md">
              <div class="text-body2 q-mb-xs">채도</div>
              <div class="row items-center no-wrap q-gutter-sm">
                <q-slider :model-value="saturate" :min="0" :max="200" :step="5" class="col" @update:model-value="emit('update:saturate', $event)" />
                <span class="text-caption" style="min-width: 2.5em">{{ saturate }}%</span>
              </div>
            </div>
            <div class="webcam-filter-row">
              <q-toggle :model-value="grayscale" label="흑백" @update:model-value="emit('update:grayscale', $event)" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  flipMode: { type: String, default: 'none' },
  resolution: { type: String, default: '640x480' },
  brightness: { type: Number, default: 100 },
  contrast: { type: Number, default: 100 },
  saturate: { type: Number, default: 100 },
  grayscale: { type: Boolean, default: false },
  showCaptureButton: { type: Boolean, default: true },
})

const emit = defineEmits(['capture', 'update:flipMode', 'update:resolution', 'update:brightness', 'update:contrast', 'update:saturate', 'update:grayscale'])

const videoRef = ref(null)
const stream = ref(null)
const error = ref('')
const settingsModalOpen = ref(false)

const flipOptions = [
  { label: '없음', value: 'none' },
  { label: '좌우 반전 (거울)', value: 'horizontal' },
  { label: '상하 반전', value: 'vertical' },
  { label: '좌우+상하', value: 'both' },
]

const resolutionOptions = [
  { label: '640 × 480', value: '640x480' },
  { label: '800 × 600', value: '800x600' },
  { label: '1280 × 720', value: '1280x720' },
  { label: '1920 × 1080', value: '1920x1080' },
]

const videoStyle = computed(() => {
  const mode = props.flipMode
  let transform = ''
  if (mode === 'horizontal') transform = 'scaleX(-1)'
  else if (mode === 'vertical') transform = 'scaleY(-1)'
  else if (mode === 'both') transform = 'scale(-1, -1)'
  const b = (props.brightness / 100).toFixed(2)
  const c = (props.contrast / 100).toFixed(2)
  const s = (props.saturate / 100).toFixed(2)
  const g = props.grayscale ? 1 : 0
  const filter = `brightness(${b}) contrast(${c}) saturate(${s}) grayscale(${g})`
  return { transform: transform || undefined, filter }
})

function getCaptureFilter() {
  const b = (props.brightness / 100).toFixed(2)
  const c = (props.contrast / 100).toFixed(2)
  const s = (props.saturate / 100).toFixed(2)
  const g = props.grayscale ? 1 : 0
  return `brightness(${b}) contrast(${c}) saturate(${s}) grayscale(${g})`
}

function onResolutionChange(val) {
  emit('update:resolution', val)
  if (stream.value) {
    stop()
    nextTick(() => start())
  }
}

async function start() {
  stop()
  error.value = ''
  const [w, h] = (props.resolution || '640x480').split('x').map(Number)
  try {
    const s = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: w }, height: { ideal: h } },
    })
    stream.value = s
    await nextTick()
    if (videoRef.value) {
      videoRef.value.srcObject = s
    }
  } catch (err) {
    error.value = err.message || '웹캠을 사용할 수 없습니다.'
    stream.value = null
  }
}

function stop() {
  const s = stream.value
  if (s) {
    s.getTracks().forEach((t) => t.stop())
    stream.value = null
  }
  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
}

function capture() {
  const video = videoRef.value
  if (!video || !stream.value || video.readyState < 2) return
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const mode = props.flipMode
  const flipH = mode === 'horizontal' || mode === 'both'
  const flipV = mode === 'vertical' || mode === 'both'
  if (flipH || flipV) {
    ctx.translate(flipH ? canvas.width : 0, flipV ? canvas.height : 0)
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
  }
  ctx.filter = getCaptureFilter()
  ctx.drawImage(video, 0, 0)
  const dataUrl = canvas.toDataURL('image/png')
  emit('capture', dataUrl)
}

onBeforeUnmount(stop)

defineExpose({ start, stop })
</script>

<style lang="scss" scoped>
.nexa-webcam-viewer {
  .webcam-buttons {
    min-height: 36px;
  }

  .webcam-capture-btn {
    font-size: 0.75rem;
    padding-left: 14px;
    padding-right: 14px;
  }

  .webcam-video-wrap {
    position: relative;
    background: #111;
    border-radius: 8px;
    overflow: hidden;
    aspect-ratio: 4/3;

    .webcam-placeholder {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.4);
      padding: 16px;
    }
  }

  .webcam-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .webcam-error {
    position: absolute;
    bottom: 8px;
    left: 8px;
    right: 8px;
  }
}
</style>

<style lang="scss">
.nexa-webcam-settings-dialog .nexa-webcam-settings-card {
  min-width: 320px;
  padding: 20px;

  .webcam-modal-title {
    font-size: 2rem;
    font-weight: 900;
    letter-spacing: -1px;
    color: var(--nexa-text-primary);
  }

  .webcam-modal-subtitle {
    font-size: 0.75rem;
    color: var(--nexa-text-primary);
    margin-bottom: 10px;
  }
}
</style>
