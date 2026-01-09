import { defineStore } from 'pinia'
import { ref, computed, watch, nextTick } from 'vue'
import { useBoardMenuStore } from './boardMenuStore'
import { useQuasar } from 'quasar'

export const useDashboardLayoutStore = defineStore('dashboardLayout', () => {
  const boardMenuStore = useBoardMenuStore()
  const $q = useQuasar()

  const nextPanelIdCounter = ref(1)
  const presets = ref(['single', 'split-lr', 'l-shape', 'split-tb'])
  const activePreset = ref('single')
  const panes = ref({}) // 키: paneId, 값: { nexaPanels: 패널 객체 배열, size: number | null }

  const presetPaneConfigurations = {
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

  const getAllPaneIdsForPreset = (presetKey) => {
    const config = presetPaneConfigurations[presetKey]
    if (!config) return []
    let ids = []
    config.panes.forEach((p) => {
      if (p.nestedConfig) {
        p.nestedConfig.panes.forEach((np) => ids.push(np.id))
      } else {
        ids.push(p.id)
      }
    })
    return ids
  }

  const getCurrentPaneIds = computed(() => {
    const config = presetPaneConfigurations[activePreset.value]
    if (!config) return []
    let ids = []
    config.panes.forEach((p) => {
      if (p.nestedConfig) {
        p.nestedConfig.panes.forEach((np) => ids.push(np.id))
      } else {
        ids.push(p.id)
      }
    })
    return ids
  })

  function getNextPanelId() {
    const id = `panel-${nextPanelIdCounter.value}`
    nextPanelIdCounter.value++
    return id
  }

  function setActivePreset(presetName, boardNodeForPanes = null) {
    console.log(`[DLS setActivePreset] Called with presetName: ${presetName}, boardNode id: ${boardNodeForPanes?.id}, isLayoutConfigured: ${boardNodeForPanes?.isLayoutConfigured}`)
    if (boardNodeForPanes?.dashboardPanesConfig) {
      console.log('[DLS setActivePreset] boardNodeForPanes.dashboardPanesConfig:', JSON.parse(JSON.stringify(boardNodeForPanes.dashboardPanesConfig)))
    }

    if (presets.value.includes(presetName)) {
      activePreset.value = presetName

      const newPanesState = {}
      const presetConfig = presetPaneConfigurations[presetName]
      if (!presetConfig) {
        console.warn('[DashboardLayoutStore] Invalid preset name for config:', presetName)
        return
      }

      const boardDashboardPanesConfig = boardNodeForPanes?.dashboardPanesConfig ? JSON.parse(JSON.stringify(boardNodeForPanes.dashboardPanesConfig)) : null

      console.log(`[DLS setActivePreset] Initializing panes for preset: ${presetName}.`)

      if (presetName === 'l-shape') {
        // L-Shape 특수 처리
        const lShapeConfig = presetPaneConfigurations['l-shape']
        // 1. 루트 Pane들 초기화 (leftPaneL, rightPaneLContainer)
        lShapeConfig.panes.forEach((paneConfig) => {
          const paneId = paneConfig.id
          const savedConfig = boardDashboardPanesConfig ? boardDashboardPanesConfig[paneId] : null
          const defaultSize = paneConfig.defaultSize

          if (paneConfig.isContainer) {
            // 컨테이너 Pane (예: rightPaneLContainer)
            newPanesState[paneId] = {
              // isContainer: true, // 필요하다면 메타 정보 추가
              size: savedConfig?.size !== undefined && savedConfig?.size !== null ? savedConfig.size : defaultSize,
            }
            console.log(`[DLS setActivePreset L-Shape Container] Pane ${paneId} initialized. Size: ${newPanesState[paneId].size}`)
          } else {
            // 일반 Pane (예: leftPaneL)
            newPanesState[paneId] = {
              nexaPanels: savedConfig?.nexaPanels || [],
              size: savedConfig?.size !== undefined && savedConfig?.size !== null ? savedConfig.size : defaultSize,
            }
            console.log(`[DLS setActivePreset L-Shape Root] Pane ${paneId} initialized. Size: ${newPanesState[paneId].size}`)
          }
        })

        // 2. 중첩 Pane들 초기화 (rightTopPaneL, rightBottomPaneL)
        if (lShapeConfig.panes[1]?.isContainer && lShapeConfig.panes[1]?.nestedConfig?.panes) {
          lShapeConfig.panes[1].nestedConfig.panes.forEach((nestedPaneConfig) => {
            const paneId = nestedPaneConfig.id
            const savedConfig = boardDashboardPanesConfig ? boardDashboardPanesConfig[paneId] : null
            const defaultSize = nestedPaneConfig.defaultSize
            newPanesState[paneId] = {
              nexaPanels: savedConfig?.nexaPanels || [],
              size: savedConfig?.size !== undefined && savedConfig?.size !== null ? savedConfig.size : defaultSize,
            }
            console.log(`[DLS setActivePreset L-Shape Nested] Pane ${paneId} initialized. Size: ${newPanesState[paneId].size}`)
          })
        }
      } else {
        // 다른 일반 프리셋 처리 (기존 로직 활용)
        const allValidPaneIds = getAllPaneIdsForPreset(presetName)
        allValidPaneIds.forEach((paneId) => {
          let paneDefaultConfig = presetConfig.panes.find((p) => p.id === paneId)
          // 중첩 구조가 일반 프리셋에도 있을 경우를 대비한 로직 (현재는 l-shape만 중첩)
          if (!paneDefaultConfig && presetConfig.panes.some((p) => p.isContainer)) {
            const containerPane = presetConfig.panes.find((p) => p.isContainer && p.nestedConfig && p.nestedConfig.panes.some((np) => np.id === paneId))
            if (containerPane) {
              paneDefaultConfig = containerPane.nestedConfig.panes.find((np) => np.id === paneId)
            }
          }

          const defaultSize = paneDefaultConfig ? paneDefaultConfig.defaultSize : 50

          if (boardDashboardPanesConfig && boardDashboardPanesConfig[paneId]) {
            newPanesState[paneId] = {
              nexaPanels: boardDashboardPanesConfig[paneId].nexaPanels || [],
              size: boardDashboardPanesConfig[paneId].size !== undefined && boardDashboardPanesConfig[paneId].size !== null ? boardDashboardPanesConfig[paneId].size : defaultSize,
            }
            console.log(`[DLS setActivePreset General] Pane ${paneId} initialized from board config. Size: ${newPanesState[paneId].size}`)
          } else {
            newPanesState[paneId] = {
              nexaPanels: [],
              size: defaultSize,
            }
            console.log(`[DLS setActivePreset General] Pane ${paneId} initialized with default size: ${defaultSize}`)
          }
        })
      }

      panes.value = newPanesState
      console.log('[DLS setActivePreset] panes.value after initialization:', JSON.parse(JSON.stringify(panes.value)))

      // 보드가 선택되고 구성된 경우에만 저장
      if (boardNodeForPanes && boardNodeForPanes.type === 'board' && boardNodeForPanes.isLayoutConfigured) {
        console.log(`[DLS setActivePreset] Attempting to save for configured board ${boardNodeForPanes.id}`)
        _saveDashboardConfigToBoardStore()
      } else if (boardNodeForPanes && boardNodeForPanes.type === 'board' && !boardNodeForPanes.isLayoutConfigured) {
        // 보드가 선택되었지만 아직 구성되지 않은 경우, 보드에 프리셋만 저장
        console.log(`[DLS setActivePreset] Board ${boardNodeForPanes.id} selected but not configured. Preset will be saved to board node.`)
        // boardMenuStore.updateNode는 이미 호출되었을 수 있으므로 여기서는 로그만
      } else {
        console.log(`[DLS setActivePreset] Not saving to board store. boardNode: id=${boardNodeForPanes?.id}, type=${boardNodeForPanes?.type}, configured=${boardNodeForPanes?.isLayoutConfigured}`)
      }
    } else {
      console.warn('[DashboardLayoutStore] Invalid preset name:', presetName)
    }
  }

  function addPanelToPane(paneId, panelData = {}) {
    // Pane이 없으면 자동으로 초기화
    if (!panes.value[paneId]) {
      // 현재 preset에 맞게 panes 초기화
      const currentPreset = activePreset.value || (presets.value.includes('single') ? 'single' : presets.value[0])
      const allValidPaneIds = getAllPaneIdsForPreset(currentPreset)

      // 요청된 paneId가 유효한 pane인지 확인
      if (allValidPaneIds.includes(paneId)) {
        const presetConfig = presetPaneConfigurations[currentPreset]
        if (presetConfig) {
          // 모든 pane 초기화
          allValidPaneIds.forEach((pid) => {
            if (!panes.value[pid]) {
              let paneDefaultConfig = presetConfig.panes.find((p) => p.id === pid)
              // 중첩 구조 처리
              if (!paneDefaultConfig && presetConfig.panes.some((p) => p.isContainer)) {
                const containerPane = presetConfig.panes.find((p) => p.isContainer && p.nestedConfig && p.nestedConfig.panes.some((np) => np.id === pid))
                if (containerPane) {
                  paneDefaultConfig = containerPane.nestedConfig.panes.find((np) => np.id === pid)
                }
              }
              const defaultSize = paneDefaultConfig ? paneDefaultConfig.defaultSize : 50
              panes.value[pid] = {
                nexaPanels: [],
                size: defaultSize,
              }
            }
          })
          // 자동 초기화 성공 시 디버그 로그만 출력 (경고 제거)
          console.debug(`[DashboardLayoutStore] Panes auto-initialized for preset "${currentPreset}":`, Object.keys(panes.value).join(', '))
        }
      } else {
        console.error(`[DashboardLayoutStore] Pane "${paneId}" is not valid for preset "${currentPreset}". Valid panes:`, allValidPaneIds.join(', '))
        return
      }
    }

    // Pane이 이제 존재하는지 확인
    if (panes.value[paneId]) {
      const newPanel = {
        id: panelData.id || getNextPanelId(),
        title: panelData.title || '새 패널',
        content: panelData.content || '패널 내용입니다.',
        x: panelData.x === undefined ? 0 : panelData.x,
        y: panelData.y === undefined ? 0 : panelData.y,
        w: panelData.w === undefined ? 4 : panelData.w,
        h: panelData.h === undefined ? 5 : panelData.h,
        i: panelData.i || panelData.id || getNextPanelId(),
        ...panelData,
      }
      if (!panes.value[paneId].nexaPanels) {
        panes.value[paneId].nexaPanels = []
      }
      panes.value[paneId].nexaPanels.push(newPanel)
      _saveDashboardConfigToBoardStore()
    } else {
      console.error(`[DashboardLayoutStore] Failed to initialize pane "${paneId}". Cannot add panel.`)
    }
  }

  function removePanelFromPane(paneId, panelId) {
    if (panes.value[paneId] && panes.value[paneId].nexaPanels) {
      panes.value[paneId].nexaPanels = panes.value[paneId].nexaPanels.filter((p) => p.id !== panelId && p.i !== panelId)
      _saveDashboardConfigToBoardStore()
    } else {
      console.warn(`[DashboardLayoutStore] Pane ${paneId} or its nexaPanels not found for panel removal.`)
    }
  }

  function updatePanelGridLayout(paneId, panelId, newLayoutProps) {
    if (panes.value[paneId] && panes.value[paneId].nexaPanels) {
      const panel = panes.value[paneId].nexaPanels.find((p) => p.i === panelId)
      if (panel) {
        Object.assign(panel, newLayoutProps)
        _saveDashboardConfigToBoardStore()
      } else {
        console.warn(`[DashboardLayoutStore] Panel ${panelId} (i) not found in ${paneId} for grid update.`)
      }
    } else {
      console.warn(`[DashboardLayoutStore] Pane ${paneId} or its nexaPanels not found for panel grid update.`)
    }
  }

  function clearAllPanels() {
    getCurrentPaneIds.value.forEach((paneId) => {
      if (panes.value[paneId]) {
        panes.value[paneId].nexaPanels = []
      }
    })
    _saveDashboardConfigToBoardStore()
  }

  const genericAddPanelTrigger = ref(0)
  function triggerGenericAddPanel() {
    genericAddPanelTrigger.value++
  }

  const currentViewMode = ref('dashboard')
  const selectedNodeIdForEditor = ref(null)
  const selectedNodeForDashboard = ref(null)

  // 메인 네비게이션 메뉴 (왼쪽 드로어) 관련 상태
  const mainNavigationOpen = ref(false)
  const selectedPaneId = ref(null)

  function setCurrentViewMode(mode) {
    console.log(`[DLS setCurrentViewMode] Attempting to set mode to: ${mode}`)
    if (['dashboard', 'boardManagement'].includes(mode)) {
      currentViewMode.value = mode
      console.log(`[DLS setCurrentViewMode] Mode changed to: ${currentViewMode.value}`)
    } else {
      console.warn(`[DLS setCurrentViewMode] Invalid mode: ${mode}`)
    }
  }

  function setSelectedNodeIdForEditor(nodeId) {
    selectedNodeIdForEditor.value = nodeId
  }

  function setSelectedNodeForDashboard(nodeInfo) {
    console.log(`[DLS setSelectedNodeForDashboard] Called with nodeInfo id: ${nodeInfo?.id}, type: ${nodeInfo?.type}, preset: ${nodeInfo?.dashboardPreset}, configured: ${nodeInfo?.isLayoutConfigured}`)
    if (nodeInfo?.dashboardPanesConfig) {
      console.log('[DLS setSelectedNodeForDashboard] nodeInfo.dashboardPanesConfig:', JSON.parse(JSON.stringify(nodeInfo.dashboardPanesConfig)))
    }

    selectedNodeForDashboard.value = nodeInfo ? { ...nodeInfo } : null

    if (nodeInfo && nodeInfo.type === 'board') {
      if (nodeInfo.isLayoutConfigured && nodeInfo.dashboardPreset) {
        console.log(`[DLS setSelectedNodeForDashboard] Board ${nodeInfo.id} is configured. Preset: ${nodeInfo.dashboardPreset}. Loading its config.`)
        setActivePreset(nodeInfo.dashboardPreset, nodeInfo)
      } else if (nodeInfo.dashboardPreset && !nodeInfo.isLayoutConfigured) {
        console.log(`[DLS setSelectedNodeForDashboard] Board ${nodeInfo.id} has preset ${nodeInfo.dashboardPreset} but NOT configured. Loading preset structure only.`)
        setActivePreset(nodeInfo.dashboardPreset, null) // Load preset structure, but not specific board's potentially stale/empty panes config
      } else {
        console.log(`[DLS setSelectedNodeForDashboard] Board ${nodeInfo.id} has NO preset or not configured. Setting to default UI placeholder state.`)
        const defaultPresetKey = presets.value.includes('single') ? 'single' : presets.value[0]
        activePreset.value = defaultPresetKey
        const newPanesState = {}
        getAllPaneIdsForPreset(defaultPresetKey).forEach((pid) => {
          const pConf = presetPaneConfigurations[defaultPresetKey].panes.find((p) => p.id === pid) || presetPaneConfigurations[defaultPresetKey].panes.find((p) => p.isContainer)?.nestedConfig.panes.find((np) => np.id === pid)
          newPanesState[pid] = { nexaPanels: [], size: pConf?.defaultSize || 50 }
        })
        panes.value = newPanesState
        console.log('[DLS setSelectedNodeForDashboard] Panes set to default for unconfigured board:', JSON.parse(JSON.stringify(panes.value)))
      }
    } else if (!nodeInfo) {
      console.log('[DLS setSelectedNodeForDashboard] No node selected. Setting active preset to default.')
      const defaultPresetKey = activePreset.value || (presets.value.includes('single') ? 'single' : presets.value[0])
      setActivePreset(defaultPresetKey, null)
    } else {
      // This case implies nodeInfo is a group or some other type not handled for dashboard display
      // 그룹 노드 클릭은 정상적인 동작이며, 대시보드는 보드 노드에만 적용됩니다.
      console.log('[DLS setSelectedNodeForDashboard] Node is not a board or null, dashboard state unchanged for node type:', nodeInfo?.type)
    }
  }

  function toggleMainNavigation() {
    mainNavigationOpen.value = !mainNavigationOpen.value
  }

  function setSelectedPaneId(paneId) {
    if (getCurrentPaneIds.value.includes(paneId)) {
      selectedPaneId.value = paneId
    } else {
      selectedPaneId.value = null
    }
  }

  function updatePaneSizes(resizedPanesInfo) {
    console.log('[DLS updatePaneSizes] Called with:', JSON.parse(JSON.stringify(resizedPanesInfo)))
    let changed = false
    if (Array.isArray(resizedPanesInfo)) {
      resizedPanesInfo.forEach((paneInfo) => {
        if (panes.value[paneInfo.id] && typeof paneInfo.size === 'number' && panes.value[paneInfo.id].size !== paneInfo.size) {
          console.log(`[DLS updatePaneSizes] Updating pane ${paneInfo.id} size from ${panes.value[paneInfo.id].size} to ${paneInfo.size}`)
          panes.value[paneInfo.id].size = paneInfo.size
          changed = true
        } else if (!panes.value[paneInfo.id]) {
          console.warn(`[DLS updatePaneSizes] Pane with id "${paneInfo.id}" not found in current panes.value.`)
        } else if (panes.value[paneInfo.id] && typeof paneInfo.size === 'number' && panes.value[paneInfo.id].size === paneInfo.size) {
          // console.log(`[DLS updatePaneSizes] Pane ${paneInfo.id} size is already ${paneInfo.size}. No change.`);
        }
      })
    }

    if (changed) {
      console.log('[DLS updatePaneSizes] Pane sizes changed in store. Attempting to save.')
      _saveDashboardConfigToBoardStore()
    } else {
      console.log('[DLS updatePaneSizes] No actual size changes detected. Not saving.')
    }
  }

  function _saveDashboardConfigToBoardStore() {
    const selectedBoard = boardMenuStore.getNodeById(selectedNodeForDashboard.value?.id)

    if (selectedBoard && selectedBoard.type === 'board' && selectedBoard.isLayoutConfigured) {
      // 저장할 때, panes.value에 있는 모든 정보를 그대로 저장합니다.
      // 컨테이너 pane의 size 정보도 포함됩니다.
      const configToSave = JSON.parse(JSON.stringify(panes.value))

      console.log(`[DLS _saveDashboardConfigToBoardStore] Saving for board ${selectedBoard.id}, isLayoutConfigured: ${selectedBoard.isLayoutConfigured}. Panes:`, configToSave)
      boardMenuStore.updateBoardDashboardConfig(selectedBoard.id, configToSave)
    } else {
      // 보드가 선택되지 않은 경우는 정상적인 상황일 수 있으므로 디버그 레벨로 변경
      console.debug(
        '[DLS _saveDashboardConfigToBoardStore] No board selected, or board not configured for dashboard saving.',
        `SelectedNode ID: ${selectedNodeForDashboard.value?.id}`,
        `Selected Board found: ${!!selectedBoard}`,
        `Is board type: ${selectedBoard?.type === 'board'} `,
        `Is layout configured: ${selectedBoard?.isLayoutConfigured}`,
      )
    }
  }

  function requestSaveLayout() {
    console.log('[DLS requestSaveLayout] Layout save requested.')
    _saveDashboardConfigToBoardStore()
  }

  watch(
    activePreset,
    (newPresetName, oldPresetName) => {
      console.log(`[DLS watch activePreset] Changed from ${oldPresetName} to ${newPresetName}`)
      if (newPresetName !== oldPresetName) {
        if (selectedNodeForDashboard.value && selectedNodeForDashboard.value.type === 'board') {
          console.log(`[DLS watch activePreset] Board ${selectedNodeForDashboard.value.id} is selected. Updating its preset to ${newPresetName}.`)
          boardMenuStore.updateNode(selectedNodeForDashboard.value.id, {
            dashboardPreset: newPresetName,
          })

          const updatedBoardNode = boardMenuStore.getNodeById(selectedNodeForDashboard.value.id)
          console.log('[DLS watch activePreset] updatedBoardNode after preset name update:', updatedBoardNode ? JSON.parse(JSON.stringify(updatedBoardNode)) : null)
          // When preset is changed by user via UI (which triggers this watch typically),
          // we should re-initialize the panes based on the new preset's default structure,
          // but try to use the existing board's dashboardPanesConfig for nexaPanel data and potentially sizes if they are compatible.
          // The `setActivePreset` will handle loading from `updatedBoardNode.dashboardPanesConfig`
          setActivePreset(newPresetName, updatedBoardNode)

          // Save is usually handled by setActivePreset if conditions met, or by subsequent actions like pane resize.
          // However, changing preset for a configured board should probably persist this new dashboard structure.
          if (updatedBoardNode && updatedBoardNode.isLayoutConfigured) {
            console.log('[DLS watch activePreset] Saving config after programmatically calling setActivePreset due to preset change for a configured board.')
            _saveDashboardConfigToBoardStore()
          }
        } else {
          console.log(`[DLS watch activePreset] No board selected or not a board. Setting panes for ${newPresetName} with default structure.`)
          setActivePreset(newPresetName, null) // No board context, so load default preset structure
        }
      }
    },
    { immediate: false },
  )

  // 도구 패널 상태
  const sidePanelOpen = ref(false)
  const sidePanelMode = ref('push')
  const sidePanelWidth = ref(300)
  const sidePanelMinWidth = ref(200)
  const sidePanelMaxWidth = ref(800)

  // 반응형 패널 모드 설정
  const isMobile = computed(() => $q.screen.width < 768)

  // 도구 패널 토글 함수
  function toggleSidePanel() {
    console.log('[DashboardLayoutStore] Toggling side panel, current state:', sidePanelOpen.value)
    sidePanelOpen.value = !sidePanelOpen.value
    console.log('[DashboardLayoutStore] New side panel state:', sidePanelOpen.value)
    nextTick(() => {
      // saveSidePanelState()
    })
  }

  // 도구 패널 모드 설정 함수
  function setSidePanelMode(mode) {
    if (mode !== 'push' && mode !== 'overlay') {
      console.warn('[DashboardLayoutStore] Invalid side panel mode:', mode)
      return
    }

    sidePanelMode.value = mode
    if (sidePanelOpen.value) {
      sidePanelOpen.value = false
    } else {
      sidePanelOpen.value = true
    }
    nextTick(() => {
      // saveSidePanelState()
    })
  }

  // 도구 패널 너비 설정 함수
  function setSidePanelWidth(width) {
    const maxAllowedWidth = Math.min(sidePanelMaxWidth.value, window.innerWidth * 0.8)
    const newWidth = Math.max(sidePanelMinWidth.value, Math.min(maxAllowedWidth, width))

    if (sidePanelWidth.value !== newWidth) {
      sidePanelWidth.value = newWidth
      // 오버레이 모드에서 리사이징 시 즉시 반영
      if (sidePanelMode.value === 'overlay') {
        nextTick(() => {
          const drawer = document.querySelector('.q-drawer--right.drawer-overlay')
          if (drawer) {
            drawer.style.width = `${newWidth}px`
          }
        })
      }
      nextTick(() => {
        // saveSidePanelState()
      })
    }
  }

  // 화면 크기 변경 시 모드 자동 변경
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
            const state = JSON.parse(savedState)
            sidePanelMode.value = state.mode || 'push'
            sidePanelOpen.value = Boolean(state.isOpen)
          } catch {
            console.warn('[DashboardLayoutStore] Failed to restore saved panel state, using default')
            sidePanelMode.value = 'push'
            sidePanelOpen.value = false
          }
        }
      }
      nextTick(() => {
        // saveSidePanelState()
      })
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
