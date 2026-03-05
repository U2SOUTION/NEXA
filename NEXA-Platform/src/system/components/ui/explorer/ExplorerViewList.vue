<template>
  <div class="explorer-view-list column" style="min-width: 0; width: 100%; max-width: 100%">
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
    <q-virtual-scroll v-else :items="items" virtual-scroll-item-size="48" class="col" style="min-width: 0" @virtual-scroll="onScroll">
      <template #default="{ item }">
        <q-item dense clickable :active="selectedFile?.id === item?.id" active-class="bg-primary-2" class="explorer-file-item" style="min-width: 0" @click="$emit('select', item)" @contextmenu.prevent="$emit('contextmenu', $event, item)">
          <q-item-section avatar>
            <q-icon :name="getFileIcon(item)" size="24px" />
          </q-item-section>
          <q-item-section style="min-width: 0">
            <q-item-label class="explorer-file-item-title"
              >{{ item.original_name || '이름 없음' }} <span class="explorer-file-item-size">{{ formatSize(item.file_size) }}</span></q-item-label
            >
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
import { getFileIconForItem } from '@system/utils/fileExplorer'

const props = defineProps({
  items: { type: Array, default: () => [] },
  listLoading: { type: Boolean, default: false },
  listError: { type: String, default: null },
  selectedFile: { type: Object, default: null },
  hasMore: { type: Boolean, default: false },
})

const emit = defineEmits(['select', 'load-more', 'contextmenu'])

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
  return getFileIconForItem(item)
}
</script>

<style lang="scss" scoped>
.explorer-view-list {
  min-width: 0;
  width: 100%;
  max-width: 100%;
}
.explorer-view-list :deep(.q-virtual-scroll) {
  min-width: 0;
}
/* 아이템 사이 구분선: 각 행(자식)에만 보더, 컨테이너가 아님 */
/* 아이템 사이 구분선 1줄만 (separator prop 제거했으므로 여기서만 적용) */
.explorer-view-list :deep(.q-virtual-scroll__content > *) {
  border-bottom: 1px solid var(--nexa-border-color);
  padding-top: 3px;
  padding-bottom: 5px;
}
:deep(.explorer-file-item) {
  min-width: 0;
}
.explorer-file-item :deep(.q-item__section) {
  min-width: 0 !important;
}
/* 제목(파일명 + 용량): 밝기 낮은 테마 색상 */
:deep(.explorer-file-item-title) {
  color: var(--nexa-text-secondary);
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}
/* 용량: 색상·크기 별도 지정 */
.explorer-file-item-size {
  color: var(--q-secondary);
  font-size: 0.8em;
}
</style>
