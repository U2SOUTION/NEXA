import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
  // IndexPage.vue의 layout ref와 직접 연결되지는 않음.
  // 여기서는 패널 추가/삭제 '이벤트'를 전달하는 역할에 집중.
  // 실제 layout 데이터는 IndexPage 컴포넌트가 소유하고 관리.

  const nextPanelIdCounter = ref(1) // 패널 ID 생성용 카운터

  const presets = ref(['single', 'split-lr', 'l-shape', 'split-tb'])
  const activePreset = ref('single') // 초기 프리셋

  // 각 창(pane)에 속한 패널들의 목록을 관리
  // 키: paneId, 값: 패널 객체 배열
  const panes = ref({})

  // 현재 프리셋에 따른 pane 설정 정보 (ID 및 초기 패널 정보 등)
  // setActivePreset 시 업데이트됨
  // IndexPage.vue의 Pane 컴포넌트 id prop과 일치해야 함
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
          isContainer: true, // 이 pane이 다른 splitpanes를 포함함을 명시
          nestedConfig: {
            // 중첩 splitpanes 정보
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
        // 중첩된 pane의 ID들을 가져옴
        p.nestedConfig.panes.forEach((np) => ids.push(np.id))
      } else {
        ids.push(p.id) // 일반 pane ID
      }
    })
    return ids
  }

  const getCurrentPaneIds = computed(() => {
    // 최상위 실제 컨텐츠를 담을 수 있는 pane ID 목록 반환 (컨테이너 제외)
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

  function setActivePreset(presetName) {
    if (presets.value.includes(presetName)) {
      activePreset.value = presetName
      console.log('Pinia: Active preset set to:', presetName)

      const newPanesState = {}
      const allValidPaneIds = getAllPaneIdsForPreset(presetName) // 수정된 로직 사용

      allValidPaneIds.forEach((paneId) => {
        newPanesState[paneId] = []
      })
      panes.value = newPanesState
      console.log('Pinia: Panes initialized for preset:', presetName, JSON.stringify(panes.value))
    } else {
      console.warn('Pinia: Invalid preset name:', presetName)
    }
  }

  // 특정 pane에 패널 추가
  function addPanelToPane(paneId, panelData = {}) {
    if (panes.value[paneId]) {
      const newPanel = {
        id: panelData.id || getNextPanelId(),
        title: panelData.title || '새 패널',
        content: panelData.content || '패널 내용입니다.',
        // vue-grid-layout을 위한 기본값 (IndexPage에서 덮어쓸 수 있음)
        x: panelData.x === undefined ? 0 : panelData.x,
        y: panelData.y === undefined ? 0 : panelData.y,
        w: panelData.w === undefined ? 4 : panelData.w,
        h: panelData.h === undefined ? 5 : panelData.h,
        i: panelData.i || panelData.id || getNextPanelId(), // i는 grid-item의 key, id와 동일하게 설정
        ...panelData,
      }
      panes.value[paneId].push(newPanel)
      console.log(`Pinia: Panel added to pane ${paneId}:`, JSON.stringify(newPanel))
    } else {
      console.warn(`Pinia: Pane with id "${paneId}" not found for current preset. Available panes:`, Object.keys(panes.value).join(', '))
    }
  }

  // 특정 pane에서 패널 제거
  function removePanelFromPane(paneId, panelId) {
    if (panes.value[paneId]) {
      panes.value[paneId] = panes.value[paneId].filter((p) => p.id !== panelId)
      console.log(`Pinia: Panel ${panelId} removed from pane ${paneId}`)
    } else {
      console.warn(`Pinia: Pane with id "${paneId}" not found for panel removal.`)
    }
  }

  // 패널의 그리드 레이아웃 속성 업데이트
  function updatePanelGridLayout(paneId, panelId, newLayoutProps) {
    if (panes.value[paneId]) {
      const panel = panes.value[paneId].find((p) => p.i === panelId) // panel.i를 사용 (grid-item의 id)
      if (panel) {
        let updated = false
        if (newLayoutProps.x !== undefined && panel.x !== newLayoutProps.x) {
          panel.x = newLayoutProps.x
          updated = true
        }
        if (newLayoutProps.y !== undefined && panel.y !== newLayoutProps.y) {
          panel.y = newLayoutProps.y
          updated = true
        }
        if (newLayoutProps.w !== undefined && panel.w !== newLayoutProps.w) {
          panel.w = newLayoutProps.w
          updated = true
        }
        if (newLayoutProps.h !== undefined && panel.h !== newLayoutProps.h) {
          panel.h = newLayoutProps.h
          updated = true
        }

        if (updated) {
          console.log(`Pinia: Panel ${panelId} in pane ${paneId} grid updated:`, {
            i: panel.i,
            x: panel.x,
            y: panel.y,
            w: panel.w,
            h: panel.h,
          })
        }
      } else {
        console.warn(`Pinia: Panel ${panelId} (i) not found in pane ${paneId} for grid update.`)
      }
    } else {
      console.warn(`Pinia: Pane ${paneId} not found for panel grid update.`)
    }
  }

  // 현재 프리셋의 모든 패널 클리어
  function clearAllPanels() {
    const currentConfig = presetPaneConfigurations[activePreset.value]
    if (currentConfig) {
      currentConfig.panes.forEach((paneConfig) => {
        if (panes.value[paneConfig.id]) {
          panes.value[paneConfig.id] = []
        }
      })
    }
    console.log('Pinia: All panels cleared for current preset.')
  }

  // --- 기존 기능 유지 ---
  const panelToRemove = ref(null) // IndexPage 호환용
  const requestRemovePanel = (panelId) => {
    // IndexPage 호환용, 모든 창에서 검색해서 지워야 함.
    console.warn('Pinia: requestRemovePanel is deprecated. Use removePanelFromPane(paneId, panelId) instead.')
    for (const paneId in panes.value) {
      const panelExists = panes.value[paneId].some((p) => p.id === panelId)
      if (panelExists) {
        removePanelFromPane(paneId, panelId)
        return // 찾아서 지웠으면 종료
      }
    }
    // panelToRemove.value = panelId // 기존 IndexPage 로직이 panelToRemove를 watch하고 있다면 필요할 수 있음
  }
  function resetRemoveRequest() {
    // IndexPage 호환용
    panelToRemove.value = null
  }

  // 오른쪽 패널 뷰 상태 추가 (AddDevice, AddBoard 등 Form 표시용)
  const rightPaneView = ref('dashboard') // 초기값은 대시보드, 'addDeviceForm' 등으로 변경 가능
  function setRightPaneView(viewName) {
    rightPaneView.value = viewName
    console.log('Pinia: Right pane view set to:', viewName)
  }
  // --------------------

  const requestGenericAddPanelFlag = ref(false)
  const selectedPaneId = ref(null) // 선택된 Pane ID

  function triggerGenericAddPanel() {
    requestGenericAddPanelFlag.value = true
    console.log('Pinia: Generic add panel triggered.')
  }

  function setSelectedPaneId(paneId) {
    if (selectedPaneId.value === paneId) {
      // 이미 선택된 것을 다시 클릭하면 선택 해제 (토글) - 선택 사항
      // selectedPaneId.value = null;
    } else {
      selectedPaneId.value = paneId
    }
    console.log('Pinia: Selected pane ID set to:', selectedPaneId.value)
  }

  // Helper getter to find a panel by its ID within a specific pane
  const getPanelById = computed(() => {
    return (paneId, panelInstanceId) => {
      if (panes.value[paneId]) {
        return panes.value[paneId].find((p) => p.id === panelInstanceId || p.i === panelInstanceId)
      }
      return null
    }
  })

  // Action to move a panel from one pane to another
  function movePanelToAnotherPane({ panelInstanceId, sourcePaneId, targetPaneId }) {
    if (!panelInstanceId || !sourcePaneId || !targetPaneId || sourcePaneId === targetPaneId) {
      console.warn('Pinia: Invalid arguments for movePanelToAnotherPane.', {
        panelInstanceId,
        sourcePaneId,
        targetPaneId,
      })
      return
    }

    if (!panes.value[sourcePaneId] || !panes.value[targetPaneId]) {
      console.warn('Pinia: Source or target pane not found.', { sourcePaneId, targetPaneId })
      return
    }

    const panelIndex = panes.value[sourcePaneId].findIndex((p) => p.id === panelInstanceId || p.i === panelInstanceId)
    if (panelIndex === -1) {
      console.warn(`Pinia: Panel ${panelInstanceId} not found in source pane ${sourcePaneId}.`)
      return
    }

    // 1. Remove panel from source pane
    const [panelToMove] = panes.value[sourcePaneId].splice(panelIndex, 1)
    console.log(`Pinia: Panel ${panelInstanceId} removed from ${sourcePaneId}.`)

    // 2. Adjust panel's x, y for the target pane (simple placement at the bottom)
    let newY = 0
    if (panes.value[targetPaneId].length > 0) {
      newY = Math.max(0, ...panes.value[targetPaneId].map((p) => p.y + p.h))
    }
    panelToMove.x = 0 // Or some other default x
    panelToMove.y = newY
    // panelToMove.i remains the same (it's the unique ID)

    // 3. Add panel to target pane
    panes.value[targetPaneId].push(panelToMove)
    console.log(`Pinia: Panel ${panelInstanceId} added to ${targetPaneId} at x:${panelToMove.x}, y:${panelToMove.y}.`)

    // Ensure reactivity if direct push isn't enough for vue-grid-layout (though usually it is for arrays)
    // panes.value[targetPaneId] = [...panes.value[targetPaneId]];
    // panes.value[sourcePaneId] = [...panes.value[sourcePaneId]];
  }

  // 초기화 (앱 시작 시 또는 필요시 호출)
  // defineStore 실행 시점에 setActivePreset을 호출해야 초기 panes 상태가 설정됨.
  if (Object.keys(panes.value).length === 0) {
    setActivePreset(activePreset.value)
  }

  return {
    presets,
    activePreset,
    setActivePreset,
    panes,
    addPanelToPane,
    removePanelFromPane,
    updatePanelGridLayout,
    clearAllPanels,
    getNextPanelId,
    getCurrentPaneIds,
    presetPaneConfigurations,

    // 기존 IndexPage.vue와의 호환성을 위한 부분
    panelToRemove, // IndexPage.vue가 이를 watch 하고 있다면 필요
    requestRemovePanel, // 기존 호출 방식 유지 (점진적 deprecated)
    resetRemoveRequest, // 기존 호출 방식 유지

    rightPaneView, // 우측 폼 표시용
    setRightPaneView,

    // 새로 추가된 부분
    requestGenericAddPanelFlag,
    triggerGenericAddPanel,

    // 새로 추가된 부분
    selectedPaneId,
    setSelectedPaneId,

    // New additions
    getPanelById,
    movePanelToAnotherPane,
  }
})
