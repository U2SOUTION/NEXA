<template>
  <div class="explorer-view-table column" :style="wrapperStyle">
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
      <div ref="tableWrapRef" class="table-wrap column">
        <q-table
          :rows="items"
          :columns="columns"
          row-key="id"
          v-model:pagination="pagination"
          virtual-scroll
          :virtual-scroll-item-size="ROW_HEIGHT"
          :table-style="tableStyle"
          :rows-per-page-options="[0]"
          hide-pagination
          hide-bottom
          flat
          dense
          bordered
          class="explorer-table"
          @row-click="(evt, row) => $emit('select', row)"
        >
          <template #body="props">
            <q-tr :props="props" :class="{ 'row-selected': selectedFile?.id === props.row?.id }" class="cursor-pointer" @contextmenu.prevent="$emit('contextmenu', $event, props.row)">
              <q-td key="name" :props="props" class="cell-ellipsis cell-name">
                <div class="row items-center no-wrap cell-inner">
                  <q-icon :name="getFileIcon(props.row)" size="20px" class="q-mr-sm flex-shrink-0" />
                  <span class="ellipsis" :title="props.row.original_name">{{ props.row.original_name || '이름 없음' }}</span>
                </div>
              </q-td>
              <q-td key="size" :props="props" class="cell-ellipsis">
                <span class="text-grey-7">{{ formatSize(props.row.file_size) }}</span>
              </q-td>
              <q-td key="type" :props="props" class="cell-ellipsis">
                <span class="text-grey-7">{{ getTypeLabel(props.row) }}</span>
              </q-td>
              <q-td key="date" :props="props" class="cell-ellipsis">
                <span class="text-grey-7">{{ formatDate(props.row.created_at) }}</span>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
      <div v-if="listLoading && items.length" class="row justify-center q-pa-sm">
        <q-spinner-dots size="24px" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { getFileIconForItem, getCategoryLabel } from '@system/utils/fileExplorer'

const ROW_HEIGHT = 40
const TABLE_HEADER_HEIGHT = 40

const props = defineProps({
  items: { type: Array, default: () => [] },
  listLoading: { type: Boolean, default: false },
  listError: { type: String, default: null },
  selectedFile: { type: Object, default: null },
  hasMore: { type: Boolean, default: false },
  panelWidth: { type: Number, default: 0 },
  panelHeight: { type: Number, default: 0 },
})

const emit = defineEmits(['select', 'load-more', 'contextmenu'])

const tableWrapRef = ref(null)
let scrollEl = null

// 비율은 CSS .explorer-table nth-child 로 적용 (Quasar column style이 th/td에 반영되지 않음)
const columns = [
  { name: 'name', label: '이름', field: 'original_name', align: 'left', sortable: true },
  { name: 'size', label: '크기', field: 'file_size', align: 'right', sortable: true },
  { name: 'type', label: '유형', field: (row) => row.file_type || row.category, align: 'left', sortable: true },
  { name: 'date', label: '날짜', field: 'created_at', align: 'left', sortable: true },
]

// 헤더 클릭 시 정렬용. 기본값: 날짜 내림차순(최신 먼저)
const pagination = ref({
  sortBy: 'date',
  descending: true,
  page: 1,
  rowsPerPage: 0,
})

const wrapperStyle = computed(() => {
  const base = { minWidth: 0, width: '100%', maxWidth: '100%' }
  if (props.panelHeight && props.panelHeight > 0) {
    return { ...base, height: `${props.panelHeight}px`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }
  }
  return { ...base, overflow: 'auto' }
})

const tableStyle = computed(() => {
  if (!props.panelHeight || props.panelHeight <= 0) return {}
  const bodyHeight = Math.max(100, props.panelHeight - TABLE_HEADER_HEIGHT - (props.listLoading && props.items.length ? 48 : 0))
  return { maxHeight: `${bodyHeight}px` }
})

function formatSize(bytes) {
  if (bytes == null) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatDate(ts) {
  if (ts == null) return '-'
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function getFileIcon(item) {
  return getFileIconForItem(item)
}

function getTypeLabel(item) {
  const t = item?.file_type || item?.category
  return getCategoryLabel(t) || t || '-'
}

function onScroll() {
  if (!props.hasMore || props.listLoading) return
  if (!scrollEl) return
  const { scrollTop, clientHeight, scrollHeight } = scrollEl
  if (scrollTop + clientHeight >= scrollHeight - 80) {
    emit('load-more')
  }
}

onMounted(() => {
  if (!tableWrapRef.value) return
  scrollEl = tableWrapRef.value.querySelector('.q-table__middle')
  if (scrollEl) scrollEl.addEventListener('scroll', onScroll)
})

onBeforeUnmount(() => {
  if (scrollEl) {
    scrollEl.removeEventListener('scroll', onScroll)
    scrollEl = null
  }
})
</script>

<style lang="scss" scoped>
.explorer-view-table {
  min-width: 0;
  width: 100%;
  max-width: 100%;
}
.table-wrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  min-width: 0;
}
:deep(.explorer-table) {
  font-size: 0.875rem;
  width: 100% !important;
  table-layout: fixed;
}
:deep(.explorer-table .q-table__container) {
  min-width: 0;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}
:deep(.explorer-table .q-table__middle) {
  min-width: 0;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}
:deep(.explorer-table table) {
  table-layout: fixed;
  width: 100%;
}
/* 열 너비 비율: 이름 72%, 크기 10%, 유형 8%, 날짜 10% — CSS로 직접 지정해야 Quasar에서 적용됨 */
:deep(.explorer-table th:nth-child(1)),
:deep(.explorer-table td:nth-child(1)) { width: 72%; min-width: 0; }
:deep(.explorer-table th:nth-child(2)),
:deep(.explorer-table td:nth-child(2)) { width: 10%; min-width: 0; }
:deep(.explorer-table th:nth-child(3)),
:deep(.explorer-table td:nth-child(3)) { width: 8%; min-width: 0; }
:deep(.explorer-table th:nth-child(4)),
:deep(.explorer-table td:nth-child(4)) { width: 10%; min-width: 0; }
:deep(.explorer-table th) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
:deep(.explorer-table td) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
:deep(.explorer-table td.cell-name .cell-inner) {
  min-width: 0;
  overflow: hidden;
}
:deep(.explorer-table td.cell-name .ellipsis) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
:deep(.explorer-table thead th) {
  font-weight: 600;
  background: var(--nexa-bg-secondary, rgba(0, 0, 0, 0.03));
  border-bottom: 1px solid var(--nexa-border-color);
}
:deep(.explorer-table th:not(:first-child)),
:deep(.explorer-table td:not(:first-child)) {
  border-left: 1px solid var(--nexa-border-color);
}
:deep(.explorer-table tbody tr.row-selected) {
  background: var(--q-primary);
  color: var(--q-primary-inverse, #fff);
}
:deep(.explorer-table tbody tr.row-selected .text-grey-7) {
  color: inherit;
  opacity: 0.9;
}
:deep(.explorer-table tbody tr:hover) {
  background: var(--nexa-bg-hover, rgba(0, 0, 0, 0.04));
}
</style>
