import { defineStore } from 'pinia'

export const useBoardEditorStore = defineStore('boardEditor', {
  state: () => ({
    // 드로어에서 선택된 부모가 될 수 있는 노드의 정보
    // 예: { id: 'some-uuid', type: 'group', name: '선택된 그룹명' } 또는 null
    selectedPotentialParentInDrawer: null,

    // BoardAdminPage에서 사용할 드로어 선택 정보 (새로운 상태)
    // null: 아무것도 선택되지 않음
    // { id, type, name }: 특정 노드 선택
    // { type: 'root-context' }: 빈 공간 선택 (최상위 컨텍스트)
    drawerSelectionForAdmin: null,

    // 새로운 상태 추가
    nodeToExpandAndHighlight: null, // 예: { nodeId: 'uuid', parentId: 'uuid' | null }
  }),
  actions: {
    // 드로어에서 노드가 클릭될 때 호출될 액션
    setPotentialParentInDrawer(nodeInfo) {
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

    // --- BoardAdminPage를 위한 새로운 액션들 ---
    setDrawerItemSelectionForAdmin(nodeInfo) {
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

    // 새로운 액션 추가
    setNodeToExpandAndHighlight(nodeInfo) {
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
    // 현재 선택된 부모 노드의 ID를 쉽게 가져오기 위한 getter (옵션)
    getSelectedParentId: (state) => {
      return state.selectedPotentialParentInDrawer ? state.selectedPotentialParentInDrawer.id : null
    },
    // 현재 선택된 부모 노드의 타입을 쉽게 가져오기 위한 getter (옵션)
    getSelectedParentType: (state) => {
      return state.selectedPotentialParentInDrawer
        ? state.selectedPotentialParentInDrawer.type
        : null
    },

    // --- BoardAdminPage를 위한 새로운 Getter들 ---
    getDrawerSelectionContextForAdmin: (state) => {
      if (state.drawerSelectionForAdmin) {
        return state.drawerSelectionForAdmin.type // 'group', 'board', 또는 'root-context'
      }
      return null
    },
    selectedNodeNameForAdmin: (state) => {
      if (state.drawerSelectionForAdmin && state.drawerSelectionForAdmin.id) {
        return state.drawerSelectionForAdmin.name
      }
      return null
    },
    // 드로어에서 실제 아이템(노드)이 선택되었는지 여부 (root-context 제외)
    isActualNodeSelectedForAdmin: (state) => {
      return !!(state.drawerSelectionForAdmin && state.drawerSelectionForAdmin.id)
    },

    // 새로운 getter (옵션이지만, 컴포넌트에서 사용하기 편리할 수 있음)
    getNodeToExpandAndHighlight: (state) => {
      return state.nodeToExpandAndHighlight
    },
  },
})

