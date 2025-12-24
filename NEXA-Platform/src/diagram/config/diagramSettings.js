/**
 * diagramSettings.js
 * 다이어그램 설정 관리 (ERD 전용)
 * localStorage에 저장/로드
 */

const STORAGE_KEY = 'nexa-diagram-erd-settings'

/**
 * 기본 설정값
 */
export const defaultERDSettings = {
  // 노드 크기
  nodeSize: {
    selected: {
      width: 120,
      height: 30,
    },
    unselected: {
      width: 100,
      height: 25,
    },
  },
  // 레이아웃 간격
  layout: {
    nodesep: 200, // 같은 레벨 내 노드 간 수평 최소 간격
    ranksep: 120, // 서로 다른 레벨 간 수직 최소 간격
    marginx: 150, // 마진 X
    marginy: 150, // 마진 Y
    rankdir: 'LR', // 레이아웃 방향 (TB: 상하, LR: 좌우, BT: 하상, RL: 우좌)
  },
}

/**
 * 설정 로드 (localStorage에서)
 * @returns {Object} 설정 객체
 */
export function loadERDSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // 기본값과 병합하여 누락된 항목 보완
      return {
        nodeSize: {
          ...defaultERDSettings.nodeSize,
          ...parsed.nodeSize,
          selected: {
            ...defaultERDSettings.nodeSize.selected,
            ...parsed.nodeSize?.selected,
          },
          unselected: {
            ...defaultERDSettings.nodeSize.unselected,
            ...parsed.nodeSize?.unselected,
          },
        },
        layout: {
          ...defaultERDSettings.layout,
          ...parsed.layout,
        },
      }
    }
  } catch (error) {
    console.warn('[diagramSettings] 설정 로드 실패:', error)
  }
  return defaultERDSettings
}

/**
 * 설정 저장 (localStorage에)
 * @param {Object} settings - 설정 객체
 */
export function saveERDSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('[diagramSettings] 설정 저장 실패:', error)
    throw error
  }
}

/**
 * 설정 초기화 (기본값으로 리셋)
 */
export function resetERDSettings() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('[diagramSettings] 설정 초기화 실패:', error)
    throw error
  }
}

/**
 * 현재 설정 가져오기 (싱글톤 패턴)
 */
let currentSettings = null

export function getERDSettings() {
  if (!currentSettings) {
    currentSettings = loadERDSettings()
  }
  return currentSettings
}

/**
 * 설정 업데이트
 * @param {Object} updates - 업데이트할 설정 (부분 업데이트 가능)
 */
export function updateERDSettings(updates) {
  const current = getERDSettings()
  const updated = {
    nodeSize: {
      ...current.nodeSize,
      ...updates.nodeSize,
      selected: {
        ...current.nodeSize.selected,
        ...updates.nodeSize?.selected,
      },
      unselected: {
        ...current.nodeSize.unselected,
        ...updates.nodeSize?.unselected,
      },
    },
    layout: {
      ...current.layout,
      ...updates.layout,
    },
  }
  currentSettings = updated
  saveERDSettings(updated)
  return updated
}
