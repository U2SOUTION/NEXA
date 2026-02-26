import { defineStore } from 'pinia'
import { ref, computed, watch, nextTick, type Ref, type ComputedRef } from 'vue'
import { useBoardMenuStore } from './boardMenuStore'
import { useQuasar } from 'quasar'

export type PresetKey = 'single' | 'split-lr' | 'l-shape' | 'split-tb'

export type PaneConfigItem = {
  id: string
  title: string
  defaultSize: number
  isContainer?: boolean
  nestedConfig?: {
    horizontal: boolean
    panes: PaneConfigItem[]
  }
}

export type PresetPaneConfig = {
  horizontal: boolean
  panes: PaneConfigItem[]
}

export type NexaPanel = {
  id: string
  title: string
  content?: string
  x?: number
  y?: number
  w?: number
  h?: number
  i: string
  [key: string]: unknown
}

export type PaneState = {
  nexaPanels?: NexaPanel[]
  size?: number | null
}

export type DashboardPanesState = Record<string, PaneState>

/** 보드 노드 중 대시보드에서 사용하는 최소 형태 */
export type BoardNodeForDashboard = {
  id: string
  type: string
  dashboardPreset?: PresetKey | null
  isLayoutConfigured?: boolean
  dashboardPanesConfig?: DashboardPanesState | null
  [key: string]: unknown
}

export type ResizedPaneInfo = { id: string; size: number }

const presetPaneConfigurations: Record<PresetKey, PresetPaneConfig> = {
  single: {
    horizontal: false,
    panes: [{ id: 'mainPane', title: '메인 컨텐츠', defaultSize: 100 }],
  },
  'split-lr': {
    horizontal: false,
    panes: [
      { id: 'leftPane', title: '왼쪽 창', defaultSize: 30 },
      { id: 'rightPane', title: '오른쪽 창', defaultSize: 70 },
    ],
  },
  'l-shape': {
    horizontal: false,
    panes: [
      { id: 'leftPaneL', title: 'L 왼쪽', defaultSize: 30 },
      {
        id: 'rightPaneLContainer',
        title: 'L 오른쪽 컨테이너',
        defaultSize: 70,
        isContainer: true,
        nestedConfig: {
          horizontal: true,
          panes: [
            { id: 'rightTopPaneL', title: 'L 오른쪽 위', defaultSize: 70 },
            { id: 'rightBottomPaneL', title: 'L 오른쪽 아래', defaultSize: 30 },
          ],
        },
      },
    ],
  },
  'split-tb': {
    horizontal: true,
    panes: [
      { id: 'topPane', title: '위쪽 창', defaultSize: 70 },
      { id: 'bottomPane', title: '아래쪽 창', defaultSize: 30 },
    ],
  },
}

export const useDashboardLayoutStore = defineStore('dashboardLayout', () => {
  const boardMenuStore = useBoardMenuStore()
  const $q = useQuasar()

  const nextPanelIdCounter: Ref<number> = ref(1)
  const presets: Ref<PresetKey[]> = ref(['single', 'split-lr', 'l-shape', 'split-tb'])
  const activePreset: Ref<PresetKey> = ref('single')
  const panes: Ref<DashboardPanesState> = ref({})

  function getAllPaneIdsForPreset(presetKey: PresetKey): string[] {
    const config = presetPaneConfigurations[presetKey]
    if (!config) return []
    const ids: string[] = []
    config.panes.forEach((p) => {
      if (p.nestedConfig) {
        p.nestedConfig.panes.forEach((np) => ids.push(np.id))
      } else {
        ids.push(p.id)
      }
    })
    return ids
  }

  const getCurrentPaneIds: ComputedRef<string[]> = computed(() => {
    const config = presetPaneConfigurations[activePreset.value]
    if (!config) return []
    const ids: string[] = []
    config.panes.forEach((p) => {
      if (p.nestedConfig) {
        p.nestedConfig.panes.forEach((np) => ids.push(np.id))
      } else {
        ids.push(p.id)
      }
    })
    return ids
  })

  function getNextPanelId(): string {
    const id = `panel-${nextPanelIdCounter.value}`
    nextPanelIdCounter.value++
    return id
  }

  function setActivePreset(
    presetName: PresetKey,
    boardNodeForPanes: BoardNodeForDashboard | null = null,
  ): void {
    console.log(
      `[DLS setActivePreset] Called with presetName: ${presetName}, boardNode id: ${boardNodeForPanes?.id}, isLayoutConfigured: ${boardNodeForPanes?.isLayoutConfigured}`,
    )
    if (boardNodeForPanes?.dashboardPanesConfig) {
      console.log(
        '[DLS setActivePreset] boardNodeForPanes.dashboardPanesConfig:',
        JSON.parse(JSON.stringify(boardNodeForPanes.dashboardPanesConfig)),
      )
    }

    if (presets.value.includes(presetName)) {
      activePreset.value = presetName

      const newPanesState: DashboardPanesState = {}
      const presetConfig = presetPaneConfigurations[presetName]
      if (!presetConfig) {
        console.warn('[DashboardLayoutStore] Invalid preset name for config:', presetName)
        return
      }

      const boardDashboardPanesConfig = boardNodeForPanes?.dashboardPanesConfig
        ? JSON.parse(JSON.stringify(boardNodeForPanes.dashboardPanesConfig))
        : null

      console.log(`[DLS setActivePreset] Initializing panes for preset: ${presetName}.`)

      if (presetName === 'l-shape') {
        const lShapeConfig = presetPaneConfigurations['l-shape']
        lShapeConfig.panes.forEach((paneConfig) => {
          const paneId = paneConfig.id
          const savedConfig = boardDashboardPanesConfig ? boardDashboardPanesConfig[paneId] : null
          const defaultSize = paneConfig.defaultSize

          if (paneConfig.isContainer) {
            newPanesState[paneId] = {
              size:
                savedConfig?.size !== undefined && savedConfig?.size !== null
                  ? savedConfig.size
                  : defaultSize,
            }
          } else {
            newPanesState[paneId] = {
              nexaPanels: savedConfig?.nexaPanels || [],
              size:
                savedConfig?.size !== undefined && savedConfig?.size !== null
                  ? savedConfig.size
                  : defaultSize,
            }
          }
        })

        if (lShapeConfig.panes[1]?.isContainer && lShapeConfig.panes[1]?.nestedConfig?.panes) {
          lShapeConfig.panes[1].nestedConfig!.panes.forEach((nestedPaneConfig) => {
            const paneId = nestedPaneConfig.id
            const savedConfig = boardDashboardPanesConfig
              ? boardDashboardPanesConfig[paneId]
              : null
            const defaultSize = nestedPaneConfig.defaultSize
            newPanesState[paneId] = {
              nexaPanels: savedConfig?.nexaPanels || [],
              size:
                savedConfig?.size !== undefined && savedConfig?.size !== null
                  ? savedConfig.size
                  : defaultSize,
            }
          })
        }
      } else {
        const allValidPaneIds = getAllPaneIdsForPreset(presetName)
        allValidPaneIds.forEach((paneId) => {
          let paneDefaultConfig = presetConfig.panes.find((p) => p.id === paneId)
          if (
            !paneDefaultConfig &&
            presetConfig.panes.some((p) => p.isContainer)
          ) {
            const containerPane = presetConfig.panes.find(
              (p) =>
                p.isContainer &&
                p.nestedConfig &&
                p.nestedConfig.panes.some((np) => np.id === paneId),
            )
            if (containerPane?.nestedConfig) {
              paneDefaultConfig = containerPane.nestedConfig.panes.find((np) => np.id === paneId)
            }
          }

          const defaultSize = paneDefaultConfig ? paneDefaultConfig.defaultSize : 50

          if (boardDashboardPanesConfig && boardDashboardPanesConfig[paneId]) {
            newPanesState[paneId] = {
              nexaPanels: boardDashboardPanesConfig[paneId].nexaPanels || [],
              size:
                boardDashboardPanesConfig[paneId].size !== undefined &&
                boardDashboardPanesConfig[paneId].size !== null
                  ? boardDashboardPanesConfig[paneId].size
                  : defaultSize,
            }
          } else {
            newPanesState[paneId] = { nexaPanels: [], size: defaultSize }
          }
        })
      }

      panes.value = newPanesState

      if (
        boardNodeForPanes &&
        boardNodeForPanes.type === 'board' &&
        (boardNodeForPanes as { isLayoutConfigured?: boolean }).isLayoutConfigured
      ) {
        _saveDashboardConfigToBoardStore()
      }
    } else {
      console.warn('[DashboardLayoutStore] Invalid preset name:', presetName)
    }
  }

  function addPanelToPane(
    paneId: string,
    panelData: Partial<NexaPanel> = {},
  ): void {
    if (!panes.value[paneId]) {
      const currentPreset =
        activePreset.value || (presets.value.includes('single') ? 'single' : presets.value[0])
      const allValidPaneIds = getAllPaneIdsForPreset(currentPreset)

      if (allValidPaneIds.includes(paneId)) {
        const presetConfig = presetPaneConfigurations[currentPreset]
        if (presetConfig) {
          allValidPaneIds.forEach((pid) => {
            if (!panes.value[pid]) {
              let paneDefaultConfig = presetConfig.panes.find((p) => p.id === pid)
              if (!paneDefaultConfig && presetConfig.panes.some((p) => p.isContainer)) {
                const containerPane = presetConfig.panes.find(
                  (p) =>
                    p.isContainer &&
                    p.nestedConfig?.panes.some((np) => np.id === pid),
                )
                if (containerPane?.nestedConfig) {
                  paneDefaultConfig = containerPane.nestedConfig.panes.find((np) => np.id === pid)
                }
              }
              const defaultSize = paneDefaultConfig ? paneDefaultConfig.defaultSize : 50
              panes.value[pid] = { nexaPanels: [], size: defaultSize }
            }
          })
        }
      } else {
        console.error(
          `[DashboardLayoutStore] Pane "${paneId}" is not valid for preset "${currentPreset}".`,
        )
        return
      }
    }

    if (panes.value[paneId]) {
      const newPanel: NexaPanel = {
        id: (panelData.id as string) || getNextPanelId(),
        title: (panelData.title as string) || '새 패널',
        content: (panelData.content as string) || '패널 내용입니다.',
        x: panelData.x === undefined ? 0 : panelData.x,
        y: panelData.y === undefined ? 0 : panelData.y,
        w: panelData.w === undefined ? 4 : panelData.w,
        h: panelData.h === undefined ? 5 : panelData.h,
        i: (panelData.i as string) || (panelData.id as string) || getNextPanelId(),
        ...panelData,
      }
      if (!panes.value[paneId].nexaPanels) {
        panes.value[paneId].nexaPanels = []
      }
      panes.value[paneId].nexaPanels!.push(newPanel)
      _saveDashboardConfigToBoardStore()
    }
  }

  function removePanelFromPane(paneId: string, panelId: string): void {
    if (panes.value[paneId]?.nexaPanels) {
      panes.value[paneId].nexaPanels = panes.value[paneId].nexaPanels!.filter(
        (p) => p.id !== panelId && p.i !== panelId,
      )
      _saveDashboardConfigToBoardStore()
    }
  }

  function updatePanelGridLayout(
    paneId: string,
    panelId: string,
    newLayoutProps: Partial<NexaPanel>,
  ): void {
    if (panes.value[paneId]?.nexaPanels) {
      const panel = panes.value[paneId].nexaPanels!.find((p) => p.i === panelId)
      if (panel) {
        Object.assign(panel, newLayoutProps)
        _saveDashboardConfigToBoardStore()
      }
    }
  }

  function clearAllPanels(): void {
    getCurrentPaneIds.value.forEach((paneId) => {
      if (panes.value[paneId]) {
        panes.value[paneId].nexaPanels = []
      }
    })
    _saveDashboardConfigToBoardStore()
  }

  const genericAddPanelTrigger: Ref<number> = ref(0)
  function triggerGenericAddPanel(): void {
    genericAddPanelTrigger.value++
  }

  const currentViewMode: Ref<string> = ref('dashboard')
  const selectedNodeIdForEditor: Ref<string | null> = ref(null)
  const selectedNodeForDashboard: Ref<BoardNodeForDashboard | null> = ref(null)

  const mainNavigationOpen: Ref<boolean> = ref(false)
  const selectedPaneId: Ref<string | null> = ref(null)

  function setCurrentViewMode(mode: string): void {
    if (['dashboard', 'boardManagement'].includes(mode)) {
      currentViewMode.value = mode
    }
  }

  function setSelectedNodeIdForEditor(nodeId: string | null): void {
    selectedNodeIdForEditor.value = nodeId
  }

  function setSelectedNodeForDashboard(nodeInfo: BoardNodeForDashboard | null): void {
    selectedNodeForDashboard.value = nodeInfo ? { ...nodeInfo } : null

    if (nodeInfo && nodeInfo.type === 'board') {
      const node = nodeInfo as BoardNodeForDashboard & { isLayoutConfigured?: boolean; dashboardPreset?: PresetKey }
      if (node.isLayoutConfigured && node.dashboardPreset) {
        setActivePreset(node.dashboardPreset, nodeInfo)
      } else if (node.dashboardPreset && !node.isLayoutConfigured) {
        setActivePreset(node.dashboardPreset, null)
      } else {
        const defaultPresetKey: PresetKey =
          presets.value.includes('single') ? 'single' : (presets.value[0] as PresetKey)
        activePreset.value = defaultPresetKey
        const newPanesState: DashboardPanesState = {}
        getAllPaneIdsForPreset(defaultPresetKey).forEach((pid) => {
          const pConf =
            presetPaneConfigurations[defaultPresetKey].panes.find((p) => p.id === pid) ||
            presetPaneConfigurations[defaultPresetKey].panes
              .find((p) => p.isContainer)
              ?.nestedConfig?.panes.find((np) => np.id === pid)
          newPanesState[pid] = { nexaPanels: [], size: pConf?.defaultSize || 50 }
        })
        panes.value = newPanesState
      }
    } else if (!nodeInfo) {
      const defaultPresetKey: PresetKey =
        activePreset.value || (presets.value.includes('single') ? 'single' : (presets.value[0] as PresetKey))
      setActivePreset(defaultPresetKey, null)
    }
  }

  function toggleMainNavigation(): void {
    mainNavigationOpen.value = !mainNavigationOpen.value
  }

  function setSelectedPaneId(paneId: string | null): void {
    selectedPaneId.value = getCurrentPaneIds.value.includes(paneId!) ? paneId : null
  }

  function updatePaneSizes(resizedPanesInfo: ResizedPaneInfo[]): void {
    let changed = false
    if (Array.isArray(resizedPanesInfo)) {
      resizedPanesInfo.forEach((paneInfo) => {
        if (
          panes.value[paneInfo.id] &&
          typeof paneInfo.size === 'number' &&
          panes.value[paneInfo.id].size !== paneInfo.size
        ) {
          panes.value[paneInfo.id].size = paneInfo.size
          changed = true
        }
      })
    }
    if (changed) _saveDashboardConfigToBoardStore()
  }

  function _saveDashboardConfigToBoardStore(): void {
    const selectedBoard = boardMenuStore.getNodeById(selectedNodeForDashboard.value?.id as string)
    const board = selectedBoard as { type?: string; id?: string; isLayoutConfigured?: boolean } | undefined

    if (board?.type === 'board' && board?.isLayoutConfigured) {
      const configToSave = JSON.parse(JSON.stringify(panes.value))
      boardMenuStore.updateBoardDashboardConfig(board.id!, configToSave)
    }
  }

  function requestSaveLayout(): void {
    _saveDashboardConfigToBoardStore()
  }

  watch(
    activePreset,
    (newPresetName, oldPresetName) => {
      if (newPresetName !== oldPresetName) {
        const node = selectedNodeForDashboard.value as (BoardNodeForDashboard & { type?: string; id?: string; isLayoutConfigured?: boolean }) | null
        if (node?.type === 'board') {
          boardMenuStore.updateNode(node.id, { dashboardPreset: newPresetName })
          const updatedBoardNode = boardMenuStore.getNodeById(node.id)
          setActivePreset(newPresetName, updatedBoardNode as BoardNodeForDashboard | null)
          if (
            updatedBoardNode &&
            (updatedBoardNode as { isLayoutConfigured?: boolean }).isLayoutConfigured
          ) {
            _saveDashboardConfigToBoardStore()
          }
        } else {
          setActivePreset(newPresetName, null)
        }
      }
    },
    { immediate: false },
  )

  const sidePanelOpen: Ref<boolean> = ref(false)
  const sidePanelMode: Ref<'push' | 'overlay'> = ref('push')
  const sidePanelWidth: Ref<number> = ref(300)
  const sidePanelMinWidth: Ref<number> = ref(200)
  const sidePanelMaxWidth: Ref<number> = ref(800)

  const isMobile: ComputedRef<boolean> = computed(() => $q.screen.width < 768)

  function toggleSidePanel(): void {
    sidePanelOpen.value = !sidePanelOpen.value
  }

  function setSidePanelMode(mode: 'push' | 'overlay'): void {
    if (mode !== 'push' && mode !== 'overlay') return
    sidePanelMode.value = mode
    sidePanelOpen.value = !sidePanelOpen.value
  }

  function setSidePanelWidth(width: number): void {
    const maxAllowedWidth = Math.min(sidePanelMaxWidth.value, window.innerWidth * 0.8)
    const newWidth = Math.max(sidePanelMinWidth.value, Math.min(maxAllowedWidth, width))
    if (sidePanelWidth.value !== newWidth) {
      sidePanelWidth.value = newWidth
    }
  }

  watch(
    isMobile,
    (newIsMobile) => {
      if (newIsMobile) {
        sidePanelMode.value = 'overlay'
        sidePanelOpen.value = false
      } else {
        const savedState = localStorage.getItem('sidePanelState')
        if (savedState) {
          try {
            const state = JSON.parse(savedState) as { mode?: string; isOpen?: boolean }
            sidePanelMode.value = (state.mode as 'push' | 'overlay') || 'push'
            sidePanelOpen.value = Boolean(state.isOpen)
          } catch {
            sidePanelMode.value = 'push'
            sidePanelOpen.value = false
          }
        }
      }
    },
    { immediate: true },
  )

  return {
    presets,
    activePreset,
    panes,
    presetPaneConfigurations,
    getCurrentPaneIds,
    getNextPanelId,
    setActivePreset,
    addPanelToPane,
    removePanelFromPane,
    updatePanelGridLayout,
    clearAllPanels,
    genericAddPanelTrigger,
    triggerGenericAddPanel,
    currentViewMode,
    setCurrentViewMode,
    selectedNodeIdForEditor,
    setSelectedNodeIdForEditor,
    selectedNodeForDashboard,
    setSelectedNodeForDashboard,
    mainNavigationOpen,
    toggleMainNavigation,
    selectedPaneId,
    setSelectedPaneId,
    updatePaneSizes,
    _saveDashboardConfigToBoardStore,
    requestSaveLayout,
    getAllPaneIdsForPreset,
    sidePanelOpen,
    sidePanelMode,
    sidePanelWidth,
    sidePanelMinWidth,
    sidePanelMaxWidth,
    toggleSidePanel,
    setSidePanelMode,
    setSidePanelWidth,
  }
})
