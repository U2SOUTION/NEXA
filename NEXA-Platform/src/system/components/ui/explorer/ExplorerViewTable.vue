<template>
  <div
      class="explorer-view-table column"
      :style="tableRootStyle"
    >
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
      <div class="explorer-table-wrap column">
        <div class="row items-center q-px-sm q-py-xs">
          <q-btn flat dense round size="sm" icon="view_column" title="컬럼 표시">
            <q-menu anchor="bottom left" self="top left">
              <q-list dense style="min-width: 140px">
                <q-item v-for="col in columnDefs" :key="col.name" clickable @click="toggleColumn(col.name)">
                  <q-item-section side>
                    <q-icon :name="visibleColumns.includes(col.name) ? 'visibility' : 'visibility_off'" size="sm" />
                  </q-item-section>
                  <q-item-section>{{ col.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
        <q-table
          flat
          dense
          :rows="items"
          :columns="columnDefs"
          :visible-columns="visibleColumns"
          row-key="id"
          :loading="listLoading"
          :selected="selectedRow"
          selection-single
          hide-pagination
          virtual-scroll
          :virtual-scroll-item-size="40"
          class="explorer-table"
          @row-click="onRowClick"
          @row-contextmenu="onRowContextMenu"
        >
          <template #body-cell-type="scope">
            <q-td class="explorer-table-cell ellipsis-cell">
              <q-icon :name="getFileIcon(scope.row)" size="20px" />
            </q-td>
          </template>
          <template #body-cell-name="scope">
            <q-td class="explorer-table-name explorer-table-cell ellipsis-cell text-weight-medium">{{ scope.row.original_name || '이름 없음' }}</q-td>
          </template>
          <template #body-cell-size="scope">
            <q-td class="explorer-table-size explorer-table-cell ellipsis-cell">{{ formatSize(scope.row.file_size) }}</q-td>
          </template>
          <template #body-cell-domain="scope">
            <q-td class="explorer-table-cell ellipsis-cell">{{ scope.row.domain || '-' }}</q-td>
          </template>
          <template #body-cell-category="scope">
            <q-td class="explorer-table-cell ellipsis-cell">{{ scope.row.file_type || scope.row.category || '-' }}</q-td>
          </template>
          <template #body-cell-created_at="scope">
            <q-td class="explorer-table-cell ellipsis-cell">{{ formatDate(scope.row.created_at) }}</q-td>
          </template>
        </q-table>
      </div>
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
import { computed, ref } from 'vue'
import { getFileIconByType } from '@system/utils/fileExplorer'

const props = defineProps({
  items: { type: Array, default: () => [] },
  listLoading: { type: Boolean, default: false },
  listError: { type: String, default: null },
  selectedFile: { type: Object, default: null },
  hasMore: { type: Boolean, default: false },
  /** 스플릿터 패널 너비. 있으면 테이블이 이 너비를 넘지 않음 */
  panelWidth: { type: Number, default: 0 },
  /** 스플릿터 패널 높이. 있으면 테이블이 이 높이를 꽉 채움 */
  panelHeight: { type: Number, default: 0 },
})

const tableRootStyle = computed(() => {
  const s = { minWidth: 0, width: '100%', maxWidth: '100%', height: '100%', minHeight: 0 }
  if (props.panelWidth > 0) s.maxWidth = `${props.panelWidth}px`
  return s
})

const emit = defineEmits(['select', 'load-more', 'contextmenu'])

const columnDefs = [
  { name: 'type', label: '유형', field: () => '', align: 'left', style: 'width: 44px; min-width: 44px', sortable: false },
  { name: 'name', label: '제목', field: 'original_name', align: 'left', style: 'min-width: 80px', sortable: true },
  { name: 'size', label: '용량', field: 'file_size', align: 'right', style: 'width: 88px; min-width: 88px', sortable: true },
  { name: 'domain', label: '출처', field: 'domain', align: 'left', style: 'min-width: 72px', sortable: true },
  { name: 'category', label: '분류', field: 'file_type', align: 'left', style: 'min-width: 72px', sortable: true },
  { name: 'created_at', label: '생성일', field: 'created_at', align: 'left', style: 'width: 100px; min-width: 100px', sortable: true },
]

const visibleColumns = ref(columnDefs.map((c) => c.name))

function toggleColumn(name) {
  const current = visibleColumns.value
  if (current.includes(name)) {
    if (current.length <= 1) return
    visibleColumns.value = current.filter((c) => c !== name)
  } else {
    const order = columnDefs.map((c) => c.name)
    const next = [...current, name].sort((a, b) => order.indexOf(a) - order.indexOf(b))
    visibleColumns.value = next
  }
}

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
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatDate(ts) {
  if (ts == null) return '-'
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function getFileIcon(item) {
  return getFileIconByType(item?.file_type || item?.category)
}
</script>

<style lang="scss" scoped>
/* 검은 영역(패널)을 테이블이 꽉 채우도록: 높이 100%, flex로 스크롤 영역만 남김 */
.explorer-view-table {
  min-width: 0;
  width: 100%;
  max-width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.explorer-table-wrap {
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.explorer-table {
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  width: 100%;
}
.explorer-view-table :deep(.q-table__container) {
  flex: 1 1 0;
  min-height: 0;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
}
.explorer-view-table :deep(.q-table__middle) {
  flex: 1 1 0;
  min-height: 0;
  overflow: auto;
}
.explorer-view-table :deep(.q-table__content) {
  width: 100%;
  max-width: 100%;
}
/* 가로 밀림 방지: 테이블 폭 100% 고정, 셀 말줄임 */
.explorer-view-table :deep(table) {
  table-layout: fixed;
  width: 100%;
  max-width: 100%;
}
.explorer-view-table :deep(.q-th),
.explorer-view-table :deep(.q-td) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
:deep(.explorer-table-name) {
  color: var(--nexa-text-secondary);
}
:deep(.explorer-table-size) {
  color: var(--q-secondary);
  font-size: 0.9em;
}
</style>
