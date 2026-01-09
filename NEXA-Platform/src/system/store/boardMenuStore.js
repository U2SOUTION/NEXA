import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { uid } from 'quasar' // Quasar의 uid 유틸리티 사용 (고유 ID 생성)

export const useBoardMenuStore = defineStore('boardMenu', () => {
  // --- 상태 (State) ---
  const nodes = ref([]) // 모든 노드(그룹 및 보드) 정보를 담는 배열
  // 예시 노드 구조:
  // {
  //   id: 'string' (고유 ID),
  //   parentId: 'string' | null (부모 노드 ID, 최상위는 null),
  //   name: 'string' (노드 이름),
  //   type: 'group' | 'board' (노드 타입),
  //   childrenIds: ['string'], // 자식 노드 ID 목록 (옵션, 빠른 조회용)
  //   expanded: false, // UI에서 확장되었는지 여부 (옵션)
  //   // 보드 전용 속성 (type === 'board' 일 때)
  //   devices: [], // 연결된 디바이스 ID 목록
  //   dashboardPreset: 'single', // 선택된 대시보드 레이아웃 프리셋
  //   isLayoutConfigured: false, // 대시보드 레이아웃이 사용자에 의해 설정되었는지 여부
  //   dashboardPanesConfig: {}, // 패널 구성 정보 (dashboardLayoutStore.panes와 유사한 구조)
  //   icon: 'folder', // 메뉴 표시용 아이콘 (옵션)
  //   color: 'primary' // 메뉴 표시용 색상 (옵션)
  // }

  const LOCAL_STORAGE_KEY = 'boardMenuDataNexa' // 키 이름 변경 가능

  // --- 내부 헬퍼 함수 ---
  function _saveToLocalStorage() {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nodes.value))
      console.log('[BoardMenuStore] Board menu data saved to localStorage.')
    } catch (error) {
      console.error('[BoardMenuStore] Error saving to localStorage:', error)
    }
  }

  function _loadFromLocalStorage() {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        // childrenIds가 없는 경우를 대비하여 초기화
        nodes.value = parsedData.map((node) => ({ ...node, childrenIds: node.childrenIds || [] }))
        console.log('[BoardMenuStore] Board menu data loaded from localStorage.')
      } else {
        nodes.value = []
      }
    } catch (error) {
      console.error('[BoardMenuStore] Error loading from localStorage:', error)
      nodes.value = []
    }
  }

  // --- 액션 (Actions) ---
  function addNode(nodeData) {
    const newNode = {
      id: uid(),
      parentId: nodeData.parentId || null,
      name: nodeData.name || '새 항목',
      type: nodeData.type || 'group',
      childrenIds: [],
      expanded: nodeData.type === 'group' ? false : undefined,
      icon: nodeData.type === 'group' ? 'folder' : 'description',
      ...nodeData,
      ...(nodeData.type === 'board' && {
        devices: nodeData.devices || [],
        dashboardPreset: nodeData.dashboardPreset !== undefined ? nodeData.dashboardPreset : null,
        isLayoutConfigured: nodeData.isLayoutConfigured !== undefined ? nodeData.isLayoutConfigured : false,
        dashboardPanesConfig: nodeData.dashboardPanesConfig || {}, // 초기값은 빈 객체 유지
      }),
    }

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
    console.log('[BoardMenuStore] Node added:', JSON.parse(JSON.stringify(newNode)))
    return newNode
  }

  function updateNode(nodeId, updates) {
    const nodeIndex = nodes.value.findIndex((n) => n.id === nodeId)
    if (nodeIndex !== -1) {
      nodes.value[nodeIndex] = { ...nodes.value[nodeIndex], ...updates }
      console.log('[BoardMenuStore] Node updated:', nodeId, JSON.parse(JSON.stringify(updates)))
      return nodes.value[nodeIndex]
    } else {
      console.warn('[BoardMenuStore] Node not found for update:', nodeId)
      return null
    }
  }

  function removeNode(nodeIdToRemove) {
    const nodesToDeleteIds = new Set()
    const queue = [nodeIdToRemove]

    while (queue.length > 0) {
      const currentId = queue.shift()
      if (!currentId || nodesToDeleteIds.has(currentId)) continue

      nodesToDeleteIds.add(currentId)
      const node = nodes.value.find((n) => n.id === currentId)
      if (node && node.childrenIds) {
        node.childrenIds.forEach((childId) => queue.push(childId))
      }
    }

    const nodeToRemoveDirectly = nodes.value.find((n) => n.id === nodeIdToRemove)
    if (nodeToRemoveDirectly && nodeToRemoveDirectly.parentId) {
      const parentNode = nodes.value.find((n) => n.id === nodeToRemoveDirectly.parentId)
      if (parentNode && parentNode.childrenIds) {
        parentNode.childrenIds = parentNode.childrenIds.filter((id) => id !== nodeIdToRemove)
      }
    }

    nodes.value = nodes.value.filter((n) => !nodesToDeleteIds.has(n.id))
    console.log('[BoardMenuStore] Nodes removed (IDs):', Array.from(nodesToDeleteIds))
  }

  // 보드 레이아웃 설정 액션
  function configureBoardLayout(boardId, presetName, initialPanesConfig) {
    const nodeIndex = nodes.value.findIndex((n) => n.id === boardId)
    if (nodeIndex !== -1 && nodes.value[nodeIndex].type === 'board') {
      nodes.value[nodeIndex] = {
        ...nodes.value[nodeIndex],
        dashboardPreset: presetName,
        isLayoutConfigured: true,
        dashboardPanesConfig: initialPanesConfig || {},
      }
      console.log(`[BoardMenuStore] Board layout configured for ${boardId}: preset ${presetName}, config:`, initialPanesConfig ? JSON.parse(JSON.stringify(initialPanesConfig)) : {})
      return nodes.value[nodeIndex]
    } else {
      console.warn(`[BoardMenuStore] Board node not found or not a board type for layout config: ${boardId}`)
      return null
    }
  }

  // 보드 대시보드 설정(패널, Pane 크기 등) 업데이트 액션
  function updateBoardDashboardConfig(boardId, newPanesConfig) {
    const nodeIndex = nodes.value.findIndex((n) => n.id === boardId)
    if (nodeIndex !== -1 && nodes.value[nodeIndex].type === 'board') {
      // 전체 newPanesConfig 객체로 dashboardPanesConfig를 교체합니다.
      // dashboardLayoutStore의 panes 구조와 동일하게 유지됩니다.
      nodes.value[nodeIndex].dashboardPanesConfig = { ...newPanesConfig }
      console.log(`[BoardMenuStore] Board dashboard config updated for ${boardId}:`, JSON.parse(JSON.stringify(newPanesConfig)))
      return nodes.value[nodeIndex]
    } else {
      console.warn(`[BoardMenuStore] Board node not found or not a board type for dashboard config update: ${boardId}`)
      return null
    }
  }

  // --- 겟터 (Getters) ---
  const getRootNodes = computed(() => {
    return nodes.value.filter((node) => !node.parentId)
  })

  const getChildNodes = computed(() => {
    // 함수를 반환하여 파라미터를 받을 수 있도록 함
    return (parentId) => {
      if (!parentId) return []
      // 방법 1: 부모 노드의 childrenIds를 참조 (childrenIds 관리가 정확하다는 전제)
      // const parent = nodes.value.find(n => n.id === parentId);
      // if (parent && parent.childrenIds) {
      //   return parent.childrenIds.map(id => nodes.value.find(n => n.id === id)).filter(Boolean);
      // }
      // return [];

      // 방법 2: 전체 nodes 배열에서 parentId를 기준으로 필터링 (더 안전하고 직관적일 수 있음)
      return nodes.value.filter((node) => node.parentId === parentId)
    }
  })

  const getNodeById = computed(() => {
    return (nodeId) => {
      if (!nodeId) return null
      return nodes.value.find((node) => node.id === nodeId) || null
    }
  })

  // 스토어 초기화 시 로컬 스토리지에서 데이터 로드
  _loadFromLocalStorage()

  // nodes 상태 변경 시 자동으로 로컬 스토리지에 저장 (디바운스/쓰로틀링 고려 가능)
  watch(
    nodes,
    () => {
      _saveToLocalStorage()
    },
    { deep: true },
  )

  return {
    nodes, // 전체 노드 배열 (디버깅 또는 직접 접근용)
    addNode,
    updateNode,
    removeNode,
    configureBoardLayout,
    updateBoardDashboardConfig,
    getRootNodes,
    getChildNodes,
    getNodeById,
    // 테스트 또는 초기화용 (필요시)
    // _loadFromLocalStorage,
    // _saveToLocalStorage,
  }
})
