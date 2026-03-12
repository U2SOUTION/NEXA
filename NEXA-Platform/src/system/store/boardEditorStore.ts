import { defineStore } from 'pinia'

export interface DrawerNodeInfo {
  id: string
  type: string
  name?: string
}

export type DrawerSelectionForAdmin =
  | { id: string; type: string; name: string }
  | { type: 'root-context' }
  | null

export interface NodeToExpandInfo {
  nodeId: string
  parentId: string | null
}

export interface BoardEditorState {
  selectedPotentialParentInDrawer: DrawerNodeInfo | null
  drawerSelectionForAdmin: DrawerSelectionForAdmin
  nodeToExpandAndHighlight: NodeToExpandInfo | null
}

export const useBoardEditorStore = defineStore('boardEditor', {
  state: (): BoardEditorState => ({
    selectedPotentialParentInDrawer: null,
    drawerSelectionForAdmin: null,
    nodeToExpandAndHighlight: null,
  }),
  actions: {
    setPotentialParentInDrawer(nodeInfo: DrawerNodeInfo | null) {
      // nodeInfo는 id, type, name 등의 필요한 정보를 포함해야 합니다.
      // 여기서 간단한 유효성 검사 (예: nodeInfo 객체 존재 여부)를 추가할 수 있습니다.
      if (nodeInfo && typeof nodeInfo === 'object' && nodeInfo.id && nodeInfo.type) {
        this.selectedPotentialParentInDrawer = { ...nodeInfo }
      } else {
        // 유효하지 않은 정보가 오면 null로 처리하거나, 오류를 로깅할 수 있습니다.
        this.selectedPotentialParentInDrawer = null
        console.warn(
          '[BoardEditorStore] setPotentialParentInDrawer: Invalid nodeInfo received.',
          nodeInfo,
        )
      }
    },
    // 선택된 부모 정보를 초기화하는 액션
    clearPotentialParentInDrawer() {
      this.selectedPotentialParentInDrawer = null
    },

    setDrawerItemSelectionForAdmin(nodeInfo: { id: string; type: string; name: string } | null) {
      if (
        nodeInfo &&
        typeof nodeInfo === 'object' &&
        nodeInfo.id &&
        nodeInfo.type &&
        nodeInfo.name
      ) {
        this.drawerSelectionForAdmin = { ...nodeInfo }
      } else if (nodeInfo === null) {
        this.drawerSelectionForAdmin = null
      } else {
        this.drawerSelectionForAdmin = null
        console.warn(
          '[BoardEditorStore] setDrawerItemSelectionForAdmin: Invalid nodeInfo or null expected.',
          nodeInfo,
        )
      }
    },
    setDrawerEmptySpaceSelectionForAdmin() {
      this.drawerSelectionForAdmin = { type: 'root-context' }
    },
    clearDrawerSelectionForAdmin() {
      this.drawerSelectionForAdmin = null
    },

    setNodeToExpandAndHighlight(nodeInfo: { nodeId?: string; parentId?: string | null } | null) {
      if (nodeInfo && typeof nodeInfo === 'object' && nodeInfo.nodeId) {
        this.nodeToExpandAndHighlight = {
          nodeId: nodeInfo.nodeId,
          parentId: nodeInfo.parentId !== undefined ? nodeInfo.parentId : null,
        }
        console.log(
          '[BoardEditorStore] Node to expand and highlight set:',
          this.nodeToExpandAndHighlight,
        )
      } else {
        this.nodeToExpandAndHighlight = null
        console.warn(
          '[BoardEditorStore] setNodeToExpandAndHighlight: Invalid nodeInfo received.',
          nodeInfo,
        )
      }
    },
    clearNodeToExpandAndHighlight() {
      if (this.nodeToExpandAndHighlight !== null) {
        console.log(
          '[BoardEditorStore] Cleared nodeToExpandAndHighlight. Was:',
          JSON.parse(JSON.stringify(this.nodeToExpandAndHighlight)),
        )
      }
      this.nodeToExpandAndHighlight = null
    },
  },
  getters: {
    getSelectedParentId: (state: BoardEditorState) => {
      return state.selectedPotentialParentInDrawer ? state.selectedPotentialParentInDrawer.id : null
    },
    getSelectedParentType: (state: BoardEditorState) => {
      return state.selectedPotentialParentInDrawer
        ? state.selectedPotentialParentInDrawer.type
        : null
    },

    getDrawerSelectionContextForAdmin: (state: BoardEditorState) => {
      if (state.drawerSelectionForAdmin) {
        return state.drawerSelectionForAdmin.type // 'group', 'board', 또는 'root-context'
      }
      return null
    },
    selectedNodeNameForAdmin: (state: BoardEditorState) => {
      const sel = state.drawerSelectionForAdmin
      if (sel && 'id' in sel) return sel.name
      return null
    },
    isActualNodeSelectedForAdmin: (state: BoardEditorState) => {
      const sel = state.drawerSelectionForAdmin
      return !!(sel && 'id' in sel)
    },

    getNodeToExpandAndHighlight: (state: BoardEditorState) => {
      return state.nodeToExpandAndHighlight
    },
  },
})

