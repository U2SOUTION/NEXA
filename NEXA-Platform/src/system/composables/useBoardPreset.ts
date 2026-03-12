import { ref, computed } from 'vue'
import {
  useDashboardLayoutStore,
  type PresetKey,
} from '@system/store/dashboardLayoutStore'
import { useBoardMenuStore } from '@system/store/boardMenuStore'

interface BoardNodeLike extends Record<string, unknown> {
  id: string
  type: string
  isLayoutConfigured?: boolean
}

interface SelectPresetOptions {
  immediate?: boolean
  save?: boolean
}

/**
 * 보드창 프리셋 관련 모든 로직을 통합한 composable
 * @param mode - 'setup' | 'edit' | 'options'
 */
export function useBoardPreset(mode = 'select') {
  const dashboardLayoutStore = useDashboardLayoutStore()
  const boardMenuStore = useBoardMenuStore()

  // 선택 로직
  const tempSelectedPreset = ref<PresetKey | null>(null)
  const activePreset = computed(() => dashboardLayoutStore.activePreset)
  const presets = computed(() => dashboardLayoutStore.presets)

  /**
   * 프리셋 선택
   * @param {string} preset - 프리셋 이름
   * @param {object} options - { immediate: boolean, save: boolean }
   */
  function selectPreset(preset: PresetKey, options: SelectPresetOptions = {}) {
    const { immediate = false, save = false } = options

    // 현재 선택된 보드 노드 가져오기
    let boardNode = dashboardLayoutStore.selectedNodeForDashboard

    if (!boardNode && dashboardLayoutStore.selectedNodeForDashboard?.id) {
      const nodeId = dashboardLayoutStore.selectedNodeForDashboard.id
      boardNode = boardMenuStore.getNodeById(nodeId)
    }

    // 즉시 반영 모드
    if (immediate) {
      // 프리셋 변경 (보드 노드가 있으면 전달, 없으면 null)
      dashboardLayoutStore.setActivePreset(preset, boardNode)

      // 보드가 선택된 경우에만 저장 처리
      if (boardNode && boardNode.type === 'board') {
        // 보드가 아직 레이아웃이 설정되지 않은 경우
        if (!boardNode.isLayoutConfigured) {
          boardMenuStore.updateNode(boardNode.id, {
            dashboardPreset: preset,
          })

          const updatedNode = boardMenuStore.getNodeById(boardNode.id)
          if (updatedNode) {
            dashboardLayoutStore.setSelectedNodeForDashboard(updatedNode)
            dashboardLayoutStore.setActivePreset(preset, updatedNode)
          }
        } else {
          // 보드가 이미 구성된 경우
          boardMenuStore.updateNode(boardNode.id, {
            dashboardPreset: preset,
          })

          const updatedNode = boardMenuStore.getNodeById(boardNode.id)
          if (updatedNode) {
            dashboardLayoutStore.setSelectedNodeForDashboard(updatedNode)
            dashboardLayoutStore.setActivePreset(preset, updatedNode)
          }
        }

        // 저장 시도
        if (save) {
          setTimeout(() => {
            dashboardLayoutStore.requestSaveLayout()
          }, 200)
        }
      }
    } else {
      // 임시 선택 모드 (확인 필요)
      tempSelectedPreset.value = preset
    }
  }

  /**
   * 임시 선택을 확정
   */
  async function confirmSelection() {
    if (!tempSelectedPreset.value) {
      return false
    }

    const preset = tempSelectedPreset.value
    const selectedNode = dashboardLayoutStore.selectedNodeForDashboard

    if (selectedNode && selectedNode.type === 'board') {
      await applyPreset(preset, selectedNode)
      return true
    }

    return false
  }

  /**
   * 프리셋을 보드에 적용
   * @param {string} preset - 프리셋 이름
   * @param {object} boardNode - 보드 노드
   */
  async function applyPreset(preset: PresetKey, boardNode: BoardNodeLike | null) {
    if (!boardNode || boardNode.type !== 'board') {
      return false
    }

    dashboardLayoutStore.setActivePreset(preset, boardNode)

    if (boardNode.isLayoutConfigured) {
      // 이미 구성된 보드의 경우 프리셋만 업데이트
      boardMenuStore.updateNode(boardNode.id, {
        dashboardPreset: preset,
      })

      const updatedNode = boardMenuStore.getNodeById(boardNode.id)
      if (updatedNode) {
        dashboardLayoutStore.setSelectedNodeForDashboard(updatedNode)
        dashboardLayoutStore.setActivePreset(preset, updatedNode)
      }

      setTimeout(() => {
        dashboardLayoutStore.requestSaveLayout()
      }, 200)
    }

    return true
  }

  /**
   * 신규 보드에 프리셋 초기화
   * @param {string} preset - 프리셋 이름
   * @param {object} boardNode - 보드 노드
   */
  async function initializePreset(preset: PresetKey, boardNode: BoardNodeLike | null) {
    if (!boardNode || boardNode.type !== 'board') {
      return false
    }

    const boardId = boardNode.id

    try {
      // 초기 패널 설정 생성 (빈 상태로 시작)
      const initialPanesConfig: Record<string, { nexaPanels: unknown[]; size: number }> = {}
      const allPaneIds = dashboardLayoutStore.getAllPaneIdsForPreset(preset)
      const presetConfigs = dashboardLayoutStore.presetPaneConfigurations
      const presetConf = presetConfigs[preset as keyof typeof presetConfigs]

      allPaneIds.forEach((paneId: string) => {
        let paneDefaultConfig = presetConf?.panes.find((p: { id: string }) => p.id === paneId)

        // 중첩 구조 처리
        if (!paneDefaultConfig && presetConf?.panes.some((p: { isContainer?: boolean }) => p.isContainer)) {
          const containerPane = presetConf.panes.find(
            (p: { isContainer?: boolean; nestedConfig?: { panes: { id: string }[] } }) =>
              p.isContainer && p.nestedConfig?.panes.some((np: { id: string }) => np.id === paneId)
          )
          if (containerPane?.nestedConfig) {
            paneDefaultConfig = containerPane.nestedConfig.panes.find((np: { id: string }) => np.id === paneId)
          }
        }

        const defaultSize = paneDefaultConfig?.defaultSize ?? 50

        initialPanesConfig[paneId] = {
          nexaPanels: [],
          size: defaultSize,
        }
      })

      const updatedNode = await boardMenuStore.configureBoardLayout(
        boardId,
        preset,
        initialPanesConfig as Parameters<typeof boardMenuStore.configureBoardLayout>[2]
      )

      if (updatedNode) {
        dashboardLayoutStore.setActivePreset(preset, updatedNode)
        dashboardLayoutStore.setSelectedNodeForDashboard({ ...updatedNode })
        return true
      }

      return false
    } catch (error) {
      console.error('[useBoardPreset] Error initializing preset:', error)
      return false
    }
  }

  // 옵션 관리 (미래 확장)
  const presetOptions = ref<Record<PresetKey, Record<string, unknown>>>({} as Record<PresetKey, Record<string, unknown>>)

  function setOption(preset: PresetKey, optionKey: string, value: unknown) {
    if (!presetOptions.value[preset]) {
      presetOptions.value[preset] = {}
    }
    presetOptions.value[preset][optionKey] = value
  }

  function getOptions(preset: PresetKey) {
    return presetOptions.value[preset] || {}
  }

  return {
    // 선택
    tempSelectedPreset,
    activePreset,
    presets,
    selectPreset,
    confirmSelection,
    // 구성
    applyPreset,
    initializePreset,
    // 옵션
    presetOptions,
    setOption,
    getOptions,
    mode,
  }
}

