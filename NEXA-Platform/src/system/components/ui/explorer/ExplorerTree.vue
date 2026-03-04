<template>
  <div class="explorer-tree column">
    <q-tree
      :key="treeStructureKey"
      :nodes="treeNodes"
      node-key="id"
      :selected="selectedNodeIdProp"
      :expanded="expandedIds"
      dense
      class="col"
      @update:selected="onSelected"
      @update:expanded="onExpanded"
    >
      <template #default-header="prop">
        <div class="row items-center q-tree-node-label">
          <q-icon :name="prop.node.icon || 'folder'" size="18px" class="q-mr-sm" />
          <span>{{ prop.node.label }}</span>
        </div>
      </template>
    </q-tree>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  treeNodes: { type: Array, default: () => [] },
  selectedNodeId: { type: String, default: 'all' },
  expandedIds: { type: Array, default: () => [] },
})

const emit = defineEmits(['select-node', 'update:expandedIds'])

const treeStructureKey = computed(() => {
  if (!props.treeNodes?.length) return 'empty'
  return props.treeNodes
    .map((n) => n.id + (n.children?.length ?? 0))
    .join('-')
})

const selectedNodeIdProp = computed(() => props.selectedNodeId || 'all')

function onExpanded(val) {
  emit('update:expandedIds', val)
}

function onSelected(val) {
  const id = Array.isArray(val) ? val[0] : val
  if (!id) return
  const node = findNode(props.treeNodes, id)
  if (node) emit('select-node', node)
}

function findNode(nodes, id) {
  if (!nodes?.length) return null
  for (const n of nodes) {
    if (n.id === id) return n
    const child = findNode(n.children, id)
    if (child) return child
  }
  return null
}
</script>
