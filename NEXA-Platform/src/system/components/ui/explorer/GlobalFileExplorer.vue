<template>
  <div class="global-file-explorer column">
    <div class="explorer-top-bar row items-center q-px-md q-py-sm">
      <div class="explorer-top-bar-left">
        <span class="explorer-top-bar-title text-h6">NEXA File Explorer</span>
      </div>
      <div class="explorer-top-bar-center row items-center q-gutter-sm">
        <q-input
          v-model="searchQuery"
          dense
          outlined
          placeholder="검색..."
          class="explorer-top-bar-search"
          debounce="300"
          @update:model-value="onSearch"
        >
          <template #prepend>
            <q-icon name="search" size="18px" />
          </template>
        </q-input>
        <q-select
          v-model="sortBy"
          dense
          outlined
          emit-value
          map-options
          options-dense
          class="explorer-top-bar-sort"
          :options="sortOptions"
        >
          <template #prepend>
            <q-icon name="sort" size="18px" />
          </template>
        </q-select>
        <q-select
          v-model="filterCategory"
          dense
          outlined
          emit-value
          map-options
          options-dense
          class="explorer-top-bar-filter"
          :options="filterOptions"
        >
          <template #prepend>
            <q-icon name="filter_list" size="18px" />
          </template>
        </q-select>
        <q-btn flat dense round icon="refresh" size="sm" @click="refreshList">
          <q-tooltip>새로고침</q-tooltip>
        </q-btn>
      </div>
      <div class="explorer-top-bar-right">
        <q-btn-toggle v-model="viewMode" toggle-color="primary" dense no-caps size="sm" class="explorer-view-mode-toggle" :options="viewModeOptions" />
      </div>
    </div>
    <q-splitter v-model="splitterModel" unit="px" :limits="[120, 600]" class="col">
      <template #before>
        <div class="explorer-left column q-pa-sm">
          <div class="scope-row q-mb-sm">
            <q-select v-model="scopeDomain" :options="domainOptions" dense outlined emit-value map-options options-dense class="scope-select" @update:model-value="onScopeDomainChange" />
          </div>
          <ExplorerTree :tree-nodes="filteredTreeNodes" :selected-node-id="selectedNodeId" :expanded-ids="expandedNodeIds" @select-node="selectNode" @update:expanded-ids="expandedNodeIds = $event" />
        </div>
      </template>
      <template #after>
        <q-splitter v-model="listPreviewSplitter" unit="px" :limits="[200, 800]" class="explorer-right row">
          <template #before>
            <div class="list-section column">
              <q-tab-panels v-model="viewMode" animated class="col">
                <q-tab-panel name="list" class="q-pa-none">
                  <ExplorerViewList :items="displayedItems" :list-loading="listLoading" :list-error="listError" :selected-file="selectedFile" :has-more="hasMore" @select="onSelectFile" @load-more="loadMore" />
                </q-tab-panel>
                <q-tab-panel name="table" class="q-pa-none">
                  <ExplorerViewTable :items="displayedItems" :list-loading="listLoading" :list-error="listError" :selected-file="selectedFile" :has-more="hasMore" @select="onSelectFile" @load-more="loadMore" />
                </q-tab-panel>
                <q-tab-panel name="card" class="q-pa-none">
                  <ExplorerViewCard :items="displayedItems" :list-loading="listLoading" :list-error="listError" :selected-file="selectedFile" :has-more="hasMore" @select="onSelectFile" @load-more="loadMore" />
                </q-tab-panel>
              </q-tab-panels>
            </div>
          </template>
          <template #after>
            <div class="preview-area column">
              <ExplorerPreview :file="selectedFile" />
            </div>
          </template>
        </q-splitter>
      </template>
    </q-splitter>
  </div>
</template>

<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import ExplorerTree from './ExplorerTree.vue'
import ExplorerViewList from './ExplorerViewList.vue'
import ExplorerViewTable from './ExplorerViewTable.vue'
import ExplorerViewCard from './ExplorerViewCard.vue'
import ExplorerPreview from './ExplorerPreview.vue'
import { useGlobalFileExplorer } from '@system/composables/useGlobalFileExplorer'
import { useFileSelection } from '@system/composables/useFileSelection'
import { getExpandedIdsForSelection } from '@system/utils/fileExplorer'

const props = defineProps({
  mode: { type: String, default: 'embed' },
  scope: { type: String, default: '' },
  initialDomain: { type: String, default: '' },
})

const emit = defineEmits(['select'])

const splitterModel = ref(220)
const listPreviewSplitter = ref(400)
const viewMode = ref('list')
const viewModeOptions = [
  { label: '목록', value: 'list', icon: 'list' },
  { label: '테이블', value: 'table', icon: 'table_chart' },
  { label: '카드', value: 'card', icon: 'view_module' },
]
const sortBy = ref('date_desc')
const filterCategory = ref('')
const sortOptions = [
  { label: '최신순', value: 'date_desc' },
  { label: '오래된순', value: 'date_asc' },
  { label: '이름순', value: 'name_asc' },
  { label: '이름 역순', value: 'name_desc' },
  { label: '크기순', value: 'size_asc' },
  { label: '크기 역순', value: 'size_desc' },
]
const filterOptions = [
  { label: '전체', value: '' },
  { label: '이미지', value: 'image' },
  { label: '문서', value: 'document' },
  { label: '오디오', value: 'audio' },
  { label: '영상', value: 'video' },
]
const expandedNodeIds = ref([])
const scopeDomain = ref('')

const { treeNodes, items, listLoading, listError, selectedNodeId, hasMore, searchQuery, loadTree, selectNode, loadMore, setSearchQuery, refreshList } = useGlobalFileExplorer()

const domainOptions = computed(() => {
  const options = [{ value: '', label: '전체' }]
  if (!treeNodes.value?.length) return options
  for (const n of treeNodes.value) {
    if (n.domain) options.push({ value: n.domain, label: n.domain })
  }
  return options
})

const filteredTreeNodes = computed(() => {
  if (!scopeDomain.value) return treeNodes.value
  return treeNodes.value.filter((n) => n.domain === scopeDomain.value)
})

const displayedItems = computed(() => {
  let list = items.value
  const cat = (filterCategory.value || '').toLowerCase()
  if (cat) {
    list = list.filter((item) => {
      const t = (item.file_type || item.category || '').toLowerCase()
      if (cat === 'image') return t === 'image' || t === 'images'
      return t === cat
    })
  }
  const order = sortBy.value || 'date_desc'
  return [...list].sort((a, b) => {
    if (order === 'date_desc') return (b.created_at || 0) - (a.created_at || 0)
    if (order === 'date_asc') return (a.created_at || 0) - (b.created_at || 0)
    if (order === 'name_asc') return (a.original_name || '').localeCompare(b.original_name || '')
    if (order === 'name_desc') return (b.original_name || '').localeCompare(a.original_name || '')
    if (order === 'size_asc') return (a.file_size || 0) - (b.file_size || 0)
    if (order === 'size_desc') return (b.file_size || 0) - (a.file_size || 0)
    return 0
  })
})

function onScopeDomainChange(val) {
  if (val) {
    const node = treeNodes.value.find((n) => n.domain === val)
    if (node) selectNode(node)
  } else {
    const first = treeNodes.value[0]
    if (first) selectNode(first)
  }
}

watch(
  () => [treeNodes.value, selectedNodeId.value],
  () => {
    const id = selectedNodeId.value
    if (!treeNodes.value?.length) return
    if (id && id !== 'all') {
      expandedNodeIds.value = getExpandedIdsForSelection(treeNodes.value, id)
    } else {
      expandedNodeIds.value = treeNodes.value.map((n) => n.id).filter(Boolean)
    }
  },
  { immediate: true },
)

const { selectedFile, setSelectedFile } = useFileSelection()

function onSearch(v) {
  setSearchQuery(v || '')
}

function onSelectFile(file) {
  setSelectedFile(file)
  emit('select', file)
}

onMounted(() => {
  loadTree().then(() => {
    if (props.initialDomain) {
      scopeDomain.value = props.initialDomain
      const node = treeNodes.value.find((n) => n.domain === props.initialDomain) || treeNodes.value.find((n) => n.id === `domain-${props.initialDomain}`)
      if (node) selectNode(node)
    } else {
      scopeDomain.value = ''
      const first = treeNodes.value[0]
      if (first) selectNode(first)
    }
  })
})
</script>

<style lang="scss" scoped>
.global-file-explorer {
  min-height: 0;
  height: 100%;
}
.explorer-top-bar {
  flex-shrink: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 1);
  background: rgba(0, 0, 0, 0.2);
  gap: 12px;
}
.explorer-top-bar-left {
  flex-shrink: 0;
}
.explorer-top-bar-center {
  flex: 1;
  min-width: 0;
  justify-content: center;
}
.explorer-top-bar-right {
  flex-shrink: 0;
}
.explorer-top-bar-title {
  font-weight: 600;
}
.explorer-top-bar-search {
  min-width: 120px;
  max-width: 220px;
}
.explorer-top-bar-sort,
.explorer-top-bar-filter {
  min-width: 100px;
  max-width: 120px;
}
.explorer-view-mode-toggle {
  font-size: 0.75rem;
}
// deep: 뷰모드 토글 버튼 크기 축소용
.explorer-view-mode-toggle :deep(.q-btn) {
  min-height: 28px;
  padding: 0 8px;
}
.scope-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.scope-label {
  flex-shrink: 0;
}
.scope-select {
  flex-shrink: 0;
  min-width: 0;
}
.explorer-left {
  min-width: 0;
  min-height: 0;
  overflow: auto;
}
.explorer-right {
  min-height: 0;
  min-width: 0;
}
.list-section {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
.preview-area {
  min-width: 0;
  min-height: 0;
  width: 100%;
  border-left: 1px solid var(--nexa-border-color);
}

// deep 사용 이유: Quasar QSplitter 구분선(separator) DOM 구조 접근 필요, 전용 래퍼 노출 불가
.global-file-explorer :deep(.q-splitter__separator) {
  background-color: var(--nexa-border-color);
  opacity: 0.8;
}
.global-file-explorer :deep(.q-splitter__separator-area) {
  background-color: var(--nexa-border-color);
  opacity: 0.3;
}
</style>
