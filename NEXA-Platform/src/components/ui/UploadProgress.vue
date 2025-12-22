<!-- UploadProgress.vue
  파일 업로드 진행률 표시 컴포넌트
-->
<template>
  <div v-if="show" class="upload-progress">
    <div class="upload-progress-header q-mb-sm">
      <div class="text-subtitle2">파일 업로드 중...</div>
      <q-btn flat dense round icon="close" size="sm" @click="handleCancel" />
    </div>

    <!-- 전체 진행률 -->
    <div v-if="files.length > 1" class="q-mb-md">
      <div class="row items-center justify-between q-mb-xs">
        <div class="text-caption">전체 진행률</div>
        <div class="text-caption">{{ overallProgress }}%</div>
      </div>
      <q-linear-progress :value="overallProgress / 100" color="primary" size="8px" rounded />
    </div>

    <!-- 개별 파일 진행률 -->
    <div class="file-progress-list">
      <div v-for="(file, index) in files" :key="index" class="file-progress-item q-mb-sm">
        <div class="row items-center q-gutter-sm">
          <!-- 파일 아이콘 -->
          <q-icon name="description" size="24px" />

          <!-- 파일 정보 및 진행률 -->
          <div class="col">
            <div class="row items-center justify-between q-mb-xs">
              <div class="text-body2 text-ellipsis" :title="file.name">
                {{ file.name }}
              </div>
              <div class="text-caption">{{ file.progress }}%</div>
            </div>
            <q-linear-progress
              :value="file.progress / 100"
              :color="file.error ? 'negative' : 'primary'"
              size="6px"
              rounded
            />
            <div v-if="file.error" class="text-caption text-negative q-mt-xs">
              {{ file.error }}
            </div>
            <div v-else-if="file.speed" class="text-caption text-grey-6 q-mt-xs">
              {{ file.speed }} / {{ file.eta }}
            </div>
          </div>

          <!-- 상태 아이콘 -->
          <q-icon v-if="file.completed" name="check_circle" color="positive" size="20px" />
          <q-icon v-else-if="file.error" name="error" color="negative" size="20px" />
          <q-spinner v-else color="primary" size="20px" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  files: {
    type: Array,
    default: () => [],
    // 파일 객체 구조: { name: string, progress: number, error?: string, completed?: boolean, speed?: string, eta?: string }
  },
  show: {
    type: Boolean,
    default: false,
  },
  onCancel: {
    type: Function,
    default: null,
  },
})

const emit = defineEmits(['cancel'])

// 전체 진행률 계산
const overallProgress = computed(() => {
  if (props.files.length === 0) return 0
  const totalProgress = props.files.reduce((sum, file) => sum + (file.progress || 0), 0)
  return Math.round(totalProgress / props.files.length)
})

function handleCancel() {
  if (props.onCancel) {
    props.onCancel()
  }
  emit('cancel')
}
</script>

<style lang="scss" scoped>
.upload-progress {
  margin-top: 16px;
  padding: 16px;
  border-radius: 4px;
  background-color: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);

  .upload-progress-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.file-progress-list {
  max-height: 300px;
  overflow-y: auto;
}

.file-progress-item {
  padding: 8px;
  border-radius: 4px;
  background-color: var(--nexa-surface);
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}
</style>
