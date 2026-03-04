<template>
  <div class="explorer-view-card column" style="min-width: 0; width: 100%; max-width: 100%">
    <template v-if="listLoading && !items.length">
      <div class="row justify-center q-pa-lg">
        <q-spinner-dots size="32px" />
      </div>
    </template>
    <template v-else-if="listError">
      <div class="column items-center justify-center q-pa-lg text-grey-7 text-body2">
        <span class="q-mb-sm">목록을 불러오지 못했습니다.</span>
        <span class="text-caption">{{ listError }}</span>
      </div>
    </template>
    <template v-else-if="!items.length">
      <div class="column items-center justify-center q-pa-lg text-grey-7 text-body2">
        <span>선택한 범위에 파일이 없습니다.</span>
        <span class="text-caption q-mt-xs">앱을 통해 업로드된 파일만 표시됩니다.</span>
      </div>
    </template>
    <div v-else class="card-grid q-pa-sm">
      <q-card
        v-for="item in items"
        :key="item.id"
        flat
        bordered
        clickable
        :class="{ 'card-selected': selectedFile?.id === item.id }"
        class="file-card"
        @click="$emit('select', item)"
        @contextmenu.prevent="$emit('contextmenu', $event, item)"
      >
        <div class="file-card-media">
          <template v-if="isImage(item)">
            <img
              v-if="getDisplayUrl(item)"
              :src="getDisplayUrl(item)"
              :alt="item.original_name"
              class="card-thumbnail"
              loading="lazy"
              @error="onThumbError($event)"
            />
            <div v-else class="card-placeholder row items-center justify-center">
              <q-icon :name="getFileIcon(item)" size="40px" class="text-grey-6" />
            </div>
          </template>
          <template v-else-if="isAudio(item)">
            <audio
              v-if="getDisplayUrl(item)"
              controls
              class="card-audio"
              :src="getDisplayUrl(item)"
              @click.stop
            />
            <div v-else class="card-placeholder row items-center justify-center">
              <q-icon :name="getFileIcon(item)" size="40px" class="text-grey-6" />
            </div>
          </template>
          <template v-else-if="isVideo(item)">
            <video
              v-if="getDisplayUrl(item)"
              controls
              class="card-video"
              :src="getDisplayUrl(item)"
              @click.stop
            />
            <div v-else class="card-placeholder row items-center justify-center">
              <q-icon :name="getFileIcon(item)" size="40px" class="text-grey-6" />
            </div>
          </template>
          <template v-else>
            <div class="card-placeholder row items-center justify-center">
              <q-icon :name="getFileIcon(item)" size="40px" class="text-grey-6" />
            </div>
          </template>
        </div>
        <q-card-section class="q-py-xs">
          <div class="file-card-title text-body2 text-weight-medium ellipsis" :title="item.original_name">
            {{ item.original_name || '이름 없음' }} <span class="explorer-file-item-size">{{ formatSize(item.file_size) }}</span>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div v-if="listLoading && items.length" class="row justify-center q-pa-sm">
      <q-spinner-dots size="24px" />
    </div>
    <div v-if="hasMore && !listLoading" class="row justify-center q-pa-sm">
      <q-btn flat dense label="더 보기" @click="$emit('load-more')" />
    </div>
  </div>
</template>

<script setup>
import { getFileIconByType } from '@system/utils/fileExplorer'
import { getUploadDisplayUrl } from '@system/utils/apiBaseUrl'

defineProps({
  items: { type: Array, default: () => [] },
  listLoading: { type: Boolean, default: false },
  listError: { type: String, default: null },
  selectedFile: { type: Object, default: null },
  hasMore: { type: Boolean, default: false },
})

defineEmits(['select', 'load-more', 'contextmenu'])

function getDisplayUrl(item) {
  if (!item?.file_path) return item?.url || ''
  return getUploadDisplayUrl(item.file_path)
}

function isImage(item) {
  const t = (item?.file_type || item?.category || '').toLowerCase()
  return t === 'image' || t === 'images'
}

function isAudio(item) {
  const t = (item?.file_type || item?.category || '').toLowerCase()
  return t === 'audio'
}

function isVideo(item) {
  const t = (item?.file_type || item?.category || '').toLowerCase()
  return t === 'video'
}

function getFileIcon(item) {
  return getFileIconByType(item?.file_type || item?.category)
}

function onThumbError(evt) {
  const el = evt?.target
  if (el) el.style.display = 'none'
}

function formatSize(bytes) {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
</script>

<style lang="scss" scoped>
.explorer-view-card {
  min-height: 0;
  overflow: auto;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}
.file-card {
  min-width: 0;
  overflow: hidden;
  transition: box-shadow 0.15s ease;
}
.file-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
.card-selected {
  outline: 2px solid var(--q-primary);
  outline-offset: -2px;
}
.file-card-media {
  aspect-ratio: 1;
  background: rgba(0, 0, 0, 0.04);
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.card-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card-placeholder {
  width: 100%;
  height: 100%;
}
.card-audio,
.card-video {
  width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.file-card-title {
  color: var(--nexa-text-secondary);
  word-break: break-word;
  overflow-wrap: break-word;
}
.explorer-file-item-size {
  color: var(--q-secondary);
  font-size: 0.8em;
}
</style>
