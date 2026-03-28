import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { Edge, GraphEdge, GraphNode, Node } from '@vue-flow/core'
import { applyEdgeChanges, applyNodeChanges, addEdge as vfAddEdge } from '@vue-flow/core'
import type { Connection, EdgeChange, NodeChange } from '@vue-flow/core'
import { v4 as uuidv4 } from 'uuid'

const LOD_ZOOM_DETAIL = 0.55

function shortLinkId(): string {
  return `nxn-${uuidv4().slice(0, 8)}`
}

const defaultEdgeOptions = {
  type: 'smoothstep' as const,
  style: { stroke: 'var(--nexa-primary, #1976d2)', strokeWidth: 2 },
}

export const useNexionFlowStore = defineStore('nexionFlow', () => {
  const nodes = shallowRef<Node[]>([])
  const edges = shallowRef<Edge[]>([])
  const selectedNodeId = ref<string | null>(null)
  const viewportZoom = ref(1)
  /** 뷰 중앙(플로 좌표) — 좌측 패널 “중앙에 추가”에 사용, FlowHooks가 갱신 */
  const spawnFlowPosition = ref({ x: 240, y: 200 })
  const pendingFitNodeId = ref<string | null>(null)

  function setViewportZoom(z: number) {
    viewportZoom.value = z
  }

  function setSpawnFlowPosition(p: { x: number; y: number }) {
    spawnFlowPosition.value = p
  }

  function requestFitView(nodeId: string) {
    pendingFitNodeId.value = nodeId
  }

  function consumePendingFitView(): string | null {
    const id = pendingFitNodeId.value
    pendingFitNodeId.value = null
    return id
  }

  function showNodeDetail(zoom: number): boolean {
    return zoom >= LOD_ZOOM_DETAIL
  }

  /** Vue Flow `apply-default`(기본 true)일 때는 사용하지 않음. 제어 모드 전환 시에만 연결. */
  function onNodesChange(changes: NodeChange[]) {
    nodes.value = applyNodeChanges(changes, nodes.value as unknown as GraphNode[]) as Node[]
  }

  function selectNode(id: string | null) {
    selectedNodeId.value = id
  }

  function onEdgesChange(changes: EdgeChange[]) {
    edges.value = applyEdgeChanges(changes, edges.value as unknown as GraphEdge[]) as Edge[]
  }

  function onConnect(conn: Connection) {
    if (!conn.source || !conn.target) return
    edges.value = vfAddEdge(
      {
        ...conn,
        id: `e-${conn.source}-${conn.target}-${uuidv4().slice(0, 6)}`,
        ...defaultEdgeOptions,
      },
      edges.value,
    ) as Edge[]
  }

  function addDocNodeAtSpawn() {
    const p = spawnFlowPosition.value
    return addDocNode({ x: p.x + (Math.random() - 0.5) * 24, y: p.y + (Math.random() - 0.5) * 24 })
  }

  function addGroupAtSpawn() {
    const p = spawnFlowPosition.value
    return addGroupNode({ x: p.x - 100, y: p.y - 80 })
  }

  function addDocNode(flowPosition: { x: number; y: number }, parentId?: string) {
    const id = `node-${uuidv4().slice(0, 8)}`
    const linkId = shortLinkId()
    const n: Node = {
      id,
      type: 'nexionCard',
      position: flowPosition,
      data: { label: '새 카드', linkId },
      ...(parentId
        ? {
            parentNode: parentId,
            extent: 'parent' as const,
            expandParent: true,
          }
        : {}),
    }
    nodes.value = [...nodes.value, n]
    selectNode(id)
    return id
  }

  function addGroupNode(flowPosition: { x: number; y: number }) {
    const id = `group-${uuidv4().slice(0, 8)}`
    const n: Node = {
      id,
      type: 'nexionGroup',
      position: flowPosition,
      data: { label: '그룹', linkId: shortLinkId() },
      style: { width: '320px', height: '240px' },
    }
    nodes.value = [...nodes.value, n]
    selectNode(id)
    return id
  }

  function addChildCard(parentId: string) {
    const parent = nodes.value.find((x) => x.id === parentId)
    if (!parent || parent.type !== 'nexionGroup') return null
    // 자식 좌표는 부모 로컬(부모 박스 기준)
    return addDocNode({ x: 20, y: 52 }, parentId)
  }

  function removeNode(id: string) {
    nodes.value = nodes.value.filter((n) => n.id !== id && n.parentNode !== id)
    edges.value = edges.value.filter((e) => e.source !== id && e.target !== id)
    if (selectedNodeId.value === id) selectedNodeId.value = null
  }

  function setNodeLabel(id: string, label: string) {
    nodes.value = nodes.value.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, label } } : n,
    )
  }

  function resetPrototype() {
    nodes.value = []
    edges.value = []
    selectedNodeId.value = null
  }

  return {
    nodes,
    edges,
    selectedNodeId,
    viewportZoom,
    spawnFlowPosition,
    pendingFitNodeId,
    defaultEdgeOptions,
    LOD_ZOOM_DETAIL,
    setViewportZoom,
    showNodeDetail,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addDocNode,
    addDocNodeAtSpawn,
    addGroupAtSpawn,
    addGroupNode,
    addChildCard,
    removeNode,
    setNodeLabel,
    resetPrototype,
    selectNode,
    setSpawnFlowPosition,
    requestFitView,
    consumePendingFitView,
  }
})
