<template>
  <div class="global-file-explorer column">
    <div class="explorer-top-bar row items-center q-px-md q-py-sm">
      <q-space />
      <q-btn-toggle
        v-model="viewModeModel"
        toggle-color="primary"
        :options="[
          { label: '목록', value: 'list', icon: 'view_list' },
          { label: '카드', value: 'card', icon: 'view_module' },
          { label: '테이블', value: 'table', icon: 'table_chart' },
        ]"
        dense
        no-caps
        size="sm"
        class="view-mode-toggle"
      />
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
        <div ref="listSectionRef" class="list-section column explorer-right" :style="listSectionStyle">
          <ExplorerViewList v-if="viewModeModel === 'list'" :items="displayedItems" :list-loading="listLoading" :list-error="listError" :selected-file="selectedFile" :has-more="hasMore" @select="onSelectFile" @load-more="loadMore" @contextmenu="onContextMenu" />
          <ExplorerViewCard v-else-if="viewModeModel === 'card'" :items="displayedItems" :list-loading="listLoading" :list-error="listError" :selected-file="selectedFile" :has-more="hasMore" @select="onSelectFile" @load-more="loadMore" @contextmenu="onContextMenu" />
          <ExplorerViewTable
            v-else
            :items="displayedItems"
            :list-loading="listLoading"
            :list-error="listError"
            :selected-file="selectedFile"
            :has-more="hasMore"
            :panel-width="panelSize.width"
            :panel-height="panelSize.height"
            @select="onSelectFile"
            @load-more="loadMore"
            @contextmenu="onContextMenu"
          />
        </div>
      </template>
    </q-splitter>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, nextTick, computed, ref, watch } from 'vue'

const MIN_TREE_WIDTH = 120
const MAX_TREE_WIDTH = 600
const DEFAULT_TREE_WIDTH = 220
import ExplorerTree from './ExplorerTree.vue'
import ExplorerViewList from './ExplorerViewList.vue'
import ExplorerViewCard from './ExplorerViewCard.vue'
import ExplorerViewTable from './ExplorerViewTable.vue'
import { useGlobalFileExplorer } from '@system/composables/useGlobalFileExplorer'
import { useFileSelection } from '@system/composables/useFileSelection'
import { getExpandedIdsForSelection } from '@system/utils/fileExplorer'

const props = defineProps({
  mode: { type: String, default: 'embed' },
  scope: { type: String, default: '' },
  initialDomain: { type: String, default: '' },
  /** 부모에서 저장 시 사용. 지정 시 이 값으로 트리 너비 제어·갱신 시 update:treeWidth emit */
  treeWidth: { type: Number, default: undefined },
  /** 부모에서 저장 시 사용. 'list' | 'card' | 'table'. 미지정 시 내부 기본값만 사용 */
  viewMode: { type: String, default: undefined },
})

const emit = defineEmits(['select', 'contextmenu', 'update:treeWidth', 'update:viewMode'])

const internalTreeWidth = ref(DEFAULT_TREE_WIDTH)
const splitterModel = computed({
  get: () => (props.treeWidth !== undefined && props.treeWidth !== null ? props.treeWidth : internalTreeWidth.value),
  set: (v) => {
    const n = Math.max(MIN_TREE_WIDTH, Math.min(MAX_TREE_WIDTH, Math.round(Number(v))))
    if (props.treeWidth !== undefined && props.treeWidth !== null) {
      emit('update:treeWidth', n)
    } else {
      internalTreeWidth.value = n
    }
  },
})
const internalViewMode = ref('list')
const viewModeModel = computed({
  get: () => (props.viewMode === 'list' || props.viewMode === 'card' || props.viewMode === 'table' ? props.viewMode : internalViewMode.value),
  set: (v) => {
    if (props.viewMode === 'list' || props.viewMode === 'card' || props.viewMode === 'table') {
      emit('update:viewMode', v)
    } else {
      internalViewMode.value = v
    }
  },
})
const expandedNodeIds = ref([])
const listSectionRef = ref(null)
/** 스플릿터 오른쪽 패널 크기. 테이블 뷰에서 list-section·테이블이 이 크기를 채우도록 사용 */
const panelSize = ref({ width: 0, height: 0 })
let listSectionResizeObserver = null
/** ResizeObserver로 관찰 중인 요소 (스플릿터 패널). unmount 시 unobserve용 */
let observedPanelEl = null

/** 테이블 뷰일 때만 list-section 높이=패널 높이로 고정해 검은 영역이 패널 크기만큼만 나오고, 테이블이 그걸 채우도록 함 */
const listSectionStyle = computed(() => {
  const base = { minWidth: 0, width: '100%', maxWidth: '100%' }
  if (viewModeModel.value !== 'table' || !panelSize.value.height) {
    return { ...base, overflow: 'auto' }
  }
  return {
    ...base,
    height: `${panelSize.value.height}px`,
    overflow: 'hidden',
  }
})

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
  const base = scopeDomain.value ? treeNodes.value.filter((n) => n.domain === scopeDomain.value) : treeNodes.value || []
  return injectCodeNodeUnderAi(base)
})

/** 코드 파일 확장자 (extToMonacoLanguage와 동기화) */
const CODE_EXTENSIONS = [
  'js',
  'mjs',
  'cjs',
  'ts',
  'mts',
  'cts',
  'jsx',
  'tsx',
  'json',
  'yaml',
  'yml',
  'xml',
  'py',
  'css',
  'scss',
  'html',
  'htm',
  'vue',
  'md',
  'sql',
  'sh',
  'bash',
  'env',
  'toml',
  'ini',
  'cfg',
  'conf',
  'c',
  'h',
  'cpp',
  'cc',
  'cxx',
  'hpp',
  'ino',
  'kt',
  'kts',
  'swift',
  'dart',
  'dockerfile',
  'makefile',
  'mk',
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

function measurePanel(el, label) {
  if (!el) return
  const rect = el.getBoundingClientRect()
  const width = Math.round(rect.width)
  const height = Math.round(rect.height)
  panelSize.value = { width, height }
  console.log(`[Explorer ${label}]`, { width, height })
}

onMounted(() => {
  nextTick(() => {
    const listEl = listSectionRef.value
    if (!listEl || typeof ResizeObserver === 'undefined') return
    // 실제 보이는 높이/너비는 스플릿터가 제한하는 '패널'에 있음. list-section은 내용 높이만 가짐.
    const panelEl = listEl.parentElement
    if (!panelEl) {
      measurePanel(listEl, 'list-section (no parent)')
      return
    }
    measurePanel(panelEl, 'splitter-panel (after)')
    listSectionResizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        measurePanel(entry.target, 'splitter-panel (after)')
      }
    })
    listSectionResizeObserver.observe(panelEl)
    observedPanelEl = panelEl
  })
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

onBeforeUnmount(() => {
  if (listSectionResizeObserver && observedPanelEl) {
    listSectionResizeObserver.unobserve(observedPanelEl)
    listSectionResizeObserver.disconnect()
    listSectionResizeObserver = null
    observedPanelEl = null
  }
})
</script>

<style lang="scss" scoped>
.global-file-explorer {
  min-height: 0;
  height: 100%;
}
.explorer-top-bar {
  border-bottom: 1px solid var(--nexa-border-color);
}
/* 토글 버튼(목록/카드/테이블) 각각의 좌우 패딩 */
.view-mode-toggle :deep(.q-btn) {
  padding-left: 10px;
  padding-right: 10px;
}
.explorer-right,
.list-section {
  min-width: 0;
  width: 100%;
  max-width: 100%;
  overflow: auto;
}
:deep(.q-splitter__panel) {
  min-width: 0;
}
</style>
