<template>
  <div class="explorer-view-list column">
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
    <q-virtual-scroll
      v-else
      :items="items"
      virtual-scroll-item-size="48"
      class="col"
      separator
      @virtual-scroll="onScroll"
    >
      <template #default="{ item }">
        <q-item
          dense
          clickable
          :active="selectedFile?.id === item?.id"
          active-class="bg-primary-2"
          class="explorer-file-item"
          @click="$emit('select', item)"
        >
          <q-item-section avatar>
            <q-icon :name="getFileIcon(item)" size="24px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item.original_name || '이름 없음' }}</q-item-label>
            <q-item-label caption>{{ formatSize(item.file_size) }} · {{ item.domain }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-virtual-scroll>
    <div v-if="listLoading && items.length" class="row justify-center q-pa-sm">
      <q-spinner-dots size="24px" />
    </div>
  </div>
</template>

<script setup>
import { getFileIconByType } from '@system/utils/fileExplorer.js'

const props = defineProps({
  items: { type: Array, default: () => [] },
  listLoading: { type: Boolean, default: false },
  listError: { type: String, default: null },
  selectedFile: { type: Object, default: null },
  hasMore: { type: Boolean, default: false },
})

const emit = defineEmits(['select', 'load-more'])

function onScroll({ to, direction }) {
  if (direction !== 'increase') return
  if (!props.hasMore || props.listLoading) return
  if (to >= props.items.length - 5) emit('load-more')
}

function formatSize(bytes) {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function getFileIcon(item) {
  return getFileIconByType(item?.file_type || item?.category)
}
</script>

<style lang="scss" scoped>
.explorer-view-list {
  min-height: 0;
}
.explorer-file-item {
  min-height: 48px;
}
</style>
