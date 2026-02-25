<template>
  <div class="global-file-explorer column">
    <q-splitter v-model="splitterModel" unit="px" :limits="[120, 600]" class="col">
      <template #before>
        <div class="explorer-left column q-pa-sm">
          <div class="scope-row q-mb-sm">
            <span class="text-subtitle2 scope-label">범위</span>
            <q-select
              v-model="scopeDomain"
              :options="domainOptions"
              dense
              outlined
              emit-value
              map-options
              options-dense
              class="scope-select"
              @update:model-value="onScopeDomainChange"
            />
          </div>
          <ExplorerTree
            :tree-nodes="filteredTreeNodes"
            :selected-node-id="selectedNodeId"
            :expanded-ids="expandedNodeIds"
            @select-node="selectNode"
            @update:expanded-ids="expandedNodeIds = $event"
          />
        </div>
      </template>
      <template #after>
        <q-splitter v-model="listPreviewSplitter" unit="px" :limits="[200, 800]" class="explorer-right row">
          <template #before>
            <div class="list-section column">
              <div class="toolbar row items-center q-pa-xs">
                <q-input
                  v-model="searchQuery"
                  dense
                  outlined
                  placeholder="검색..."
                  class="col-grow q-mr-sm"
                  debounce="300"
                  @update:model-value="onSearch"
                >
                  <template #prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
                <q-btn flat dense round icon="refresh" @click="refreshList">
                  <q-tooltip>새로고침</q-tooltip>
                </q-btn>
              </div>
              <q-tabs v-model="viewMode" dense class="q-px-sm">
                <q-tab name="list" label="목록" icon="list" />
              </q-tabs>
              <q-tab-panels v-model="viewMode" animated class="col">
                <q-tab-panel name="list" class="q-pa-none">
                  <ExplorerViewList
                    :items="items"
                    :list-loading="listLoading"
                    :list-error="listError"
                    :selected-file="selectedFile"
                    :has-more="hasMore"
                    @select="onSelectFile"
                    @load-more="loadMore"
                  />
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
import ExplorerPreview from './ExplorerPreview.vue'
import { useGlobalFileExplorer } from '@system/composables/useGlobalFileExplorer.js'
import { useFileSelection } from '@system/composables/useFileSelection.js'
import { getExpandedIdsForSelection } from '@system/utils/fileExplorer.js'

const props = defineProps({
  mode: { type: String, default: 'embed' },
  scope: { type: String, default: '' },
  initialDomain: { type: String, default: '' },
})

const emit = defineEmits(['select'])

const splitterModel = ref(220)
const listPreviewSplitter = ref(400)
const viewMode = ref('list')
const expandedNodeIds = ref([])
const scopeDomain = ref('')

const {
  treeNodes,
  items,
  listLoading,
  listError,
  selectedNodeId,
  hasMore,
  searchQuery,
  loadTree,
  selectNode,
  loadMore,
  setSearchQuery,
  refreshList,
} = useGlobalFileExplorer()

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
.toolbar {
  flex-shrink: 0;
}
.preview-area {
  min-width: 0;
  min-height: 0;
  width: 100%;
  border-left: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
