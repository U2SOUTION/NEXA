import { defineStore } from 'pinia'
import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'
import { uid } from 'quasar'
import type { PresetKey } from './dashboardLayoutStore'
import type { DashboardPanesState } from './dashboardLayoutStore'

export type BoardMenuNodeBase = {
  id: string
  parentId: string | null
  name: string
  type: 'group' | 'board'
  childrenIds: string[]
  expanded?: boolean
  icon?: string
  color?: string
}

export type BoardMenuNode = BoardMenuNodeBase & (
  | { type: 'group' }
  | {
      type: 'board'
      devices?: string[]
      dashboardPreset?: PresetKey | null
      isLayoutConfigured?: boolean
      dashboardPanesConfig?: DashboardPanesState
    }
)

export type AddNodeData = {
  parentId?: string | null
  name?: string
  type?: 'group' | 'board'
  [key: string]: unknown
}

const LOCAL_STORAGE_KEY = 'boardMenuDataNexa'

export const useBoardMenuStore = defineStore('boardMenu', () => {
  const nodes: Ref<BoardMenuNode[]> = ref([])

  function _saveToLocalStorage(): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nodes.value))
    } catch (error) {
      console.error('[BoardMenuStore] Error saving to localStorage:', error)
    }
  }

  function _loadFromLocalStorage(): void {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (storedData) {
        const parsedData = JSON.parse(storedData) as BoardMenuNode[]
        nodes.value = parsedData.map((node) => ({
          ...node,
          childrenIds: node.childrenIds || [],
        }))
      } else {
        nodes.value = []
      }
    } catch (error) {
      console.error('[BoardMenuStore] Error loading from localStorage:', error)
      nodes.value = []
    }
  }

  function addNode(nodeData: AddNodeData): BoardMenuNode {
    const newNode: BoardMenuNode = {
      id: uid(),
      parentId: nodeData.parentId ?? null,
      name: (nodeData.name as string) ?? '새 항목',
      type: (nodeData.type as 'group' | 'board') ?? 'group',
      childrenIds: [],
      expanded: nodeData.type === 'group' ? false : undefined,
      icon: nodeData.type === 'group' ? 'folder' : 'description',
      ...nodeData,
      ...(nodeData.type === 'board' && {
        devices: (nodeData.devices as string[]) ?? [],
        dashboardPreset: nodeData.dashboardPreset !== undefined ? nodeData.dashboardPreset : null,
        isLayoutConfigured: nodeData.isLayoutConfigured !== undefined ? nodeData.isLayoutConfigured : false,
        dashboardPanesConfig: (nodeData.dashboardPanesConfig as DashboardPanesState) ?? {},
      }),
    } as BoardMenuNode

    nodes.value.push(newNode)

    if (newNode.parentId) {
      const parentNode = nodes.value.find((n) => n.id === newNode.parentId)
      if (parentNode) {
        if (!parentNode.childrenIds) parentNode.childrenIds = []
        if (!parentNode.childrenIds.includes(newNode.id)) {
          parentNode.childrenIds.push(newNode.id)
        }
      }
    }
    return newNode
  }

  function updateNode(
    nodeId: string,
    updates: Partial<BoardMenuNode>,
  ): BoardMenuNode | null {
    const nodeIndex = nodes.value.findIndex((n) => n.id === nodeId)
    if (nodeIndex !== -1) {
      nodes.value[nodeIndex] = { ...nodes.value[nodeIndex], ...updates } as BoardMenuNode
      return nodes.value[nodeIndex]
    }
    return null
  }

  function removeNode(nodeIdToRemove: string): void {
    const nodesToDeleteIds = new Set<string>()
    const queue: string[] = [nodeIdToRemove]

    while (queue.length > 0) {
      const currentId = queue.shift()
      if (!currentId || nodesToDeleteIds.has(currentId)) continue

      nodesToDeleteIds.add(currentId)
      const node = nodes.value.find((n) => n.id === currentId)
      if (node?.childrenIds) {
        node.childrenIds.forEach((childId) => queue.push(childId))
      }
    }

    const nodeToRemoveDirectly = nodes.value.find((n) => n.id === nodeIdToRemove)
    if (nodeToRemoveDirectly?.parentId) {
      const parentNode = nodes.value.find((n) => n.id === nodeToRemoveDirectly.parentId)
      if (parentNode?.childrenIds) {
        parentNode.childrenIds = parentNode.childrenIds.filter((id) => id !== nodeIdToRemove)
      }
    }

    nodes.value = nodes.value.filter((n) => !nodesToDeleteIds.has(n.id))
  }

  function configureBoardLayout(
    boardId: string,
    presetName: PresetKey,
    initialPanesConfig?: DashboardPanesState,
  ): BoardMenuNode | null {
    const nodeIndex = nodes.value.findIndex((n) => n.id === boardId)
    if (nodeIndex !== -1 && nodes.value[nodeIndex].type === 'board') {
      const node = nodes.value[nodeIndex] as BoardMenuNode & {
        dashboardPreset?: PresetKey
        isLayoutConfigured?: boolean
        dashboardPanesConfig?: DashboardPanesState
      }
      node.dashboardPreset = presetName
      node.isLayoutConfigured = true
      node.dashboardPanesConfig = initialPanesConfig ?? {}
      return nodes.value[nodeIndex]
    }
    return null
  }

  function updateBoardDashboardConfig(
    boardId: string,
    newPanesConfig: DashboardPanesState,
  ): BoardMenuNode | null {
    const nodeIndex = nodes.value.findIndex((n) => n.id === boardId)
    if (nodeIndex !== -1 && nodes.value[nodeIndex].type === 'board') {
      const node = nodes.value[nodeIndex] as BoardMenuNode & { dashboardPanesConfig?: DashboardPanesState }
      node.dashboardPanesConfig = { ...newPanesConfig }
      return nodes.value[nodeIndex]
    }
    return null
  }

  const getRootNodes: ComputedRef<BoardMenuNode[]> = computed(() =>
    nodes.value.filter((node) => !node.parentId),
  )

  const getChildNodes: ComputedRef<(parentId: string) => BoardMenuNode[]> = computed(
    () => (parentId: string) => {
      if (!parentId) return []
      return nodes.value.filter((node) => node.parentId === parentId)
    },
  )

  const getNodeById: ComputedRef<(nodeId: string) => BoardMenuNode | null> = computed(
    () => (nodeId: string) => {
      if (!nodeId) return null
      return nodes.value.find((node) => node.id === nodeId) ?? null
    },
  )

  _loadFromLocalStorage()

  watch(
    nodes,
    () => {
      _saveToLocalStorage()
    },
    { deep: true },
  )

  return {
    nodes,
    addNode,
    updateNode,
    removeNode,
    configureBoardLayout,
    updateBoardDashboardConfig,
    getRootNodes,
    getChildNodes,
    getNodeById,
  }
})
