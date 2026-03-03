<template>
  <div class="explorer-view-table column">
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
    <template v-else>
      <q-table
        flat
        dense
        :rows="items"
        :columns="columns"
        row-key="id"
        :loading="listLoading"
        :selected="selectedRow"
        selection-single
        hide-pagination
        virtual-scroll
        :virtual-scroll-item-size="40"
        class="col explorer-table"
        @row-click="onRowClick"
        @row-contextmenu="onRowContextMenu"
      >
        <template #body-cell-type="scope">
          <q-td>
            <q-icon :name="getFileIcon(scope.row)" size="20px" />
          </q-td>
        </template>
        <template #body-cell-name="scope">
          <q-td class="text-weight-medium">{{ scope.row.original_name || '이름 없음' }}</q-td>
        </template>
        <template #body-cell-size="scope">
          <q-td>{{ formatSize(scope.row.file_size) }}</q-td>
        </template>
        <template #body-cell-domain="scope">
          <q-td>{{ scope.row.domain || '-' }}</q-td>
        </template>
      </q-table>
      <div v-if="listLoading && items.length" class="row justify-center q-pa-sm">
        <q-spinner-dots size="24px" />
      </div>
      <div v-if="hasMore && !listLoading" class="row justify-center q-pa-sm">
        <q-btn flat dense label="더 보기" @click="$emit('load-more')" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getFileIconByType } from '@system/utils/fileExplorer'

const props = defineProps({
  items: { type: Array, default: () => [] },
  listLoading: { type: Boolean, default: false },
  listError: { type: String, default: null },
  selectedFile: { type: Object, default: null },
  hasMore: { type: Boolean, default: false },
})

const emit = defineEmits(['select', 'load-more', 'contextmenu'])

const columns = [
  { name: 'type', label: '', field: () => '', align: 'left', style: 'width: 40px' },
  { name: 'name', label: 'Name', field: 'original_name', align: 'left', sortable: true },
  { name: 'size', label: 'Size', field: 'file_size', align: 'right', style: 'width: 90px' },
  { name: 'domain', label: 'Domain', field: 'domain', align: 'left', style: 'width: 80px' },
]

const selectedRow = computed(() => {
  if (!props.selectedFile?.id) return []
  const r = props.items.find((item) => item.id === props.selectedFile.id)
  return r ? [r] : []
})

function onRowClick(_evt, row) {
  emit('select', row)
}

function onRowContextMenu(evt, row) {
  evt?.preventDefault?.()
  emit('contextmenu', evt, row)
}

function formatSize(bytes) {
  if (bytes == null) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function getFileIcon(item) {
  return getFileIconByType(item?.file_type || item?.category)
}
</script>

<style lang="scss" scoped>
.explorer-view-table {
  min-height: 0;
}
.explorer-table {
  min-height: 0;
}
</style>
