import { defineStore, storeToRefs } from 'pinia'
import { computed, ref, shallowRef, triggerRef, watch } from 'vue'
import type { Edge, GraphEdge, GraphNode, Node } from '@vue-flow/core'
import { applyEdgeChanges, applyNodeChanges, addEdge as vfAddEdge } from '@vue-flow/core'
import type { Connection, EdgeChange, NodeChange } from '@vue-flow/core'
import { v4 as uuidv4 } from 'uuid'

import { useUserSettingsStore } from '@system/store/userSettingsStore'

import { isNexionFlowDebug, nxnDiag } from '../utils/nexionFlowDebug'

const LOD_ZOOM_DETAIL = 0.55

function shortLinkId(): string {
  return `nxn-${uuidv4().slice(0, 8)}`
}

const NXN_LOG = import.meta.env.DEV

function nxnLog(...args: unknown[]) {
  if (NXN_LOG) console.log('[NexionFlow]', ...args)
}

export const useNexionFlowStore = defineStore('nexionFlow', () => {
  const userSettings = useUserSettingsStore()
  const { settings: userSettingsRef } = storeToRefs(userSettings)

  const defaultEdgeOptions = computed(() => ({
    type: 'smoothstep' as const,
    /** `stroke`은 인라인으로 넣지 않음 — CSS `--nxn-edge-stroke`·선택 스타일이 먹도록 */
    style: {
      strokeWidth: userSettingsRef.value.nexionFlow.edgeStrokeWidth,
    },
  }))

  const nodes = shallowRef<Node[]>([])
  /** 연결 반영은 v-model·addEdge 모두 새 배열 할당 — shallowRef만으로는 뷰 갱신이 약할 때 triggerRef 보강 */
  const edges = shallowRef<Edge[]>([])
  const selectedNodeId = ref<string | null>(null)
  /** 우측 패널·버튼용 — 캔버스에서 연결선 클릭 시 설정 */
  const selectedEdgeId = ref<string | null>(null)

  watch(
    edges,
    (list) => {
      if (selectedEdgeId.value != null && !list.some((e) => e.id === selectedEdgeId.value)) {
        selectedEdgeId.value = null
      }
    },
    { deep: true },
  )

  /**
   * 엣지 생성 시 스타일이 객체로 박히면 CSS 변수보다 우선해 색/두께 변경이 캔버스에 안 보임.
   * 사용자 설정 변경 시 모든 엣지 `style`을 다시 맞춘다.
   */
  function syncAllEdgesStyleFromNexionUi() {
    const { edgeStrokeWidth } = userSettingsRef.value.nexionFlow
    const list = edges.value
    if (!list.length) return
    edges.value = list.map((e) => {
      const prev =
        e.style && typeof e.style === 'object' && !Array.isArray(e.style) ? { ...e.style } : {}
      delete (prev as { stroke?: unknown }).stroke
      return {
        ...e,
        style: {
          ...prev,
          strokeWidth: edgeStrokeWidth,
        },
      }
    })
    triggerRef(edges)
  }

  watch(
    () => [
      userSettingsRef.value.nexionFlow.edgeStrokeColor,
      userSettingsRef.value.nexionFlow.edgeStrokeWidth,
    ] as const,
    () => {
      syncAllEdgesStyleFromNexionUi()
    },
    { flush: 'post', immediate: true },
  )
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
    if (id != null) selectedEdgeId.value = null
  }

  function selectEdge(id: string | null) {
    selectedEdgeId.value = id
    if (id != null) selectedNodeId.value = null
  }

  /** 빈 판 클릭 등 — 우측 패널·선택 상태만 초기화(Vue Flow 자체 선택은 내부 동작 따름) */
  function clearUiSelection() {
    selectedNodeId.value = null
    selectedEdgeId.value = null
  }

  function removeEdge(edgeId: string) {
    const next = edges.value.filter((e) => e.id !== edgeId)
    if (next.length === edges.value.length) return
    edges.value = next
    triggerRef(edges)
    if (selectedEdgeId.value === edgeId) selectedEdgeId.value = null
  }

  function onEdgesChange(changes: EdgeChange[]) {
    edges.value = applyEdgeChanges(changes, edges.value as unknown as GraphEdge[]) as Edge[]
  }

  function onConnect(conn: Connection) {
    nxnLog('onConnect payload', { ...conn })
    if (!conn.source || !conn.target) {
      nxnLog('onConnect skipped: missing source or target')
      return
    }
    const dup = edges.value.some((e) => e.source === conn.source && e.target === conn.target)
    if (dup) {
      nxnLog('onConnect skipped: duplicate source→target', conn.source, '→', conn.target)
      return
    }
    const before = edges.value.length
    // source/target/sourceHandle/targetHandle는 conn이 최종 우선(스프레드 순서)
    const next = vfAddEdge(
      {
        ...defaultEdgeOptions.value,
        id: `e-${conn.source}-${conn.target}-${uuidv4().slice(0, 6)}`,
        ...conn,
        // setEdges → createGraphEdges 재검증 시 핸들이 비면 엣지가 통째로 제거될 수 있어 명시 보정
        sourceHandle: conn.sourceHandle ?? 'out',
        targetHandle: conn.targetHandle ?? 'in',
      },
      edges.value,
    ) as Edge[]
    edges.value = next
    triggerRef(edges)
    nxnLog('onConnect applied addEdge', { before, after: next.length, lastEdge: next[next.length - 1] })
    if (isNexionFlowDebug()) {
      const le = next[next.length - 1]
      nxnDiag('onConnect 직후 마지막 엣지(필드)', {
        id: le?.id,
        source: le?.source,
        target: le?.target,
        sourceHandle: le?.sourceHandle,
        targetHandle: le?.targetHandle,
        type: le?.type,
      })
    }
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
    triggerRef(edges)
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
    selectedEdgeId.value = null
  }

  return {
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    viewportZoom,
    spawnFlowPosition,
    pendingFitNodeId,
    defaultEdgeOptions,
    syncAllEdgesStyleFromNexionUi,
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
    selectEdge,
    removeEdge,
    clearUiSelection,
    setSpawnFlowPosition,
    requestFitView,
    consumePendingFitView,
  }
})
