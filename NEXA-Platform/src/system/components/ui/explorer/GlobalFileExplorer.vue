<template>
  <div class="global-file-explorer column">
    <div class="explorer-top-bar row items-center q-px-md q-py-sm">
      <div class="explorer-top-bar-left">
        <span class="explorer-top-bar-title text-h6">NEXA File Explorer</span>
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
        <div class="list-section column explorer-right">
          <q-tab-panels v-model="viewMode" animated class="col">
            <q-tab-panel name="list" class="q-pa-none">
              <ExplorerViewList :items="displayedItems" :list-loading="listLoading" :list-error="listError" :selected-file="selectedFile" :has-more="hasMore" @select="onSelectFile" @load-more="loadMore" @contextmenu="onContextMenu" />
            </q-tab-panel>
            <q-tab-panel name="table" class="q-pa-none">
              <ExplorerViewTable :items="displayedItems" :list-loading="listLoading" :list-error="listError" :selected-file="selectedFile" :has-more="hasMore" @select="onSelectFile" @load-more="loadMore" @contextmenu="onContextMenu" />
            </q-tab-panel>
            <q-tab-panel name="card" class="q-pa-none">
              <ExplorerViewCard :items="displayedItems" :list-loading="listLoading" :list-error="listError" :selected-file="selectedFile" :has-more="hasMore" @select="onSelectFile" @load-more="loadMore" @contextmenu="onContextMenu" />
            </q-tab-panel>
          </q-tab-panels>
        </div>
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
import { useGlobalFileExplorer } from '@system/composables/useGlobalFileExplorer'
import { useFileSelection } from '@system/composables/useFileSelection'
import { getExpandedIdsForSelection } from '@system/utils/fileExplorer'

const props = defineProps({
  mode: { type: String, default: 'embed' },
  scope: { type: String, default: '' },
  initialDomain: { type: String, default: '' },
})

const emit = defineEmits(['select', 'contextmenu'])

const splitterModel = ref(220)
const viewMode = ref('list')
const viewModeOptions = [
  { label: 'List', value: 'list', icon: 'list' },
  { label: 'Table', value: 'table', icon: 'table_chart' },
  { label: 'Card', value: 'card', icon: 'view_module' },
]
const expandedNodeIds = ref([])

const { treeNodes, items, listLoading, listError, selectedNodeId, hasMore, loadTree, selectNode, loadMore, sortBy, filterCategory, scopeDomain } = useGlobalFileExplorer()

const domainOptions = computed(() => {
  const options = [{ value: '', label: 'All' }]
  if (!treeNodes.value?.length) return options
  for (const n of treeNodes.value) {
    if (n.domain) {
      const cap = n.domain.charAt(0).toUpperCase() + n.domain.slice(1)
      options.push({ value: n.domain, label: cap })
    }
  }
  return options
})

function capLabel(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

/** ai 도메인 아래에 Code 가상 노드 추가, 라벨 영문 첫자 대문자 */
function injectCodeNodeUnderAi(nodes) {
  if (!nodes?.length) return nodes
  return nodes.map((n) => {
    const label = capLabel(n.label ?? n.domain ?? '')
    const children = n.children?.length ? n.children.map((c) => ({ ...c, label: capLabel(c.label ?? c.domain ?? '') })) : []
    if (n.domain !== 'ai') return { ...n, label }
    const codeChild = { id: 'virtual-code-ai', label: 'Code', icon: 'folder', domain: 'ai', path: null }
    return { ...n, label, children: [...children, codeChild] }
  })
}

const filteredTreeNodes = computed(() => {
  const base = scopeDomain.value
    ? treeNodes.value.filter((n) => n.domain === scopeDomain.value)
    : treeNodes.value || []
  return injectCodeNodeUnderAi(base)
})

/** 코드 파일 확장자 (extToMonacoLanguage와 동기화) */
const CODE_EXTENSIONS = [
  'js', 'mjs', 'cjs', 'ts', 'mts', 'cts', 'jsx', 'tsx',
  'json', 'yaml', 'yml', 'xml', 'py', 'css', 'scss', 'html', 'htm', 'vue',
  'md', 'sql', 'sh', 'bash', 'env', 'toml', 'ini', 'cfg', 'conf',
  'c', 'h', 'cpp', 'cc', 'cxx', 'hpp', 'ino',
  'kt', 'kts', 'swift', 'dart',
  'dockerfile', 'makefile', 'mk',
]
function isCodeFile(item) {
  const name = (item?.original_name || item?.file_path || '').toLowerCase()
  const ext = name.match(/\.([a-z0-9]+)$/)?.[1] || ''
  return CODE_EXTENSIONS.includes(ext)
}

const displayedItems = computed(() => {
  let list = items.value
  const cat = (filterCategory.value || '').toLowerCase()
  const isCodeNode = selectedNodeId.value === 'virtual-code-ai'
  if (cat || isCodeNode) {
    list = list.filter((item) => {
      if (cat === 'code' || isCodeNode) return isCodeFile(item)
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
    if (id === 'virtual-code-ai') {
      expandedNodeIds.value = ['domain-ai']
      return
    }
    if (id && id !== 'all') {
      expandedNodeIds.value = getExpandedIdsForSelection(treeNodes.value, id)
    } else {
      expandedNodeIds.value = treeNodes.value.map((n) => n.id).filter(Boolean)
    }
  },
  { immediate: true },
)

const { selectedFile, setSelectedFile } = useFileSelection()

function onSelectFile(file) {
  setSelectedFile(file)
  emit('select', file)
}

function onContextMenu(evt, file) {
  setSelectedFile(file)
  emit('contextmenu', evt, file)
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
.explorer-top-bar-right {
  margin-left: auto;
  flex-shrink: 0;
}
.explorer-top-bar-title {
  font-weight: 600;
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
