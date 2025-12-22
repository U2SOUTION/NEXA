// ============================================
// 최근 복사한 색상 관리 유틸리티
// ============================================

const STORAGE_KEY = 'theme-manager-recent-colors'
const MAX_RECENT_COLORS = 50 // 최대 저장 개수

/**
 * 최근 색상 목록 가져오기
 * @returns {Array} 최근 색상 배열
 */
export function getRecentColors() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const colors = JSON.parse(stored)
    return Array.isArray(colors) ? colors : []
  } catch (error) {
    console.error('[RecentColorsManager] 저장된 색상 읽기 실패:', error)
    return []
  }
}

/**
 * 최근 색상 추가
 * @param {Object} colorData - 색상 데이터 { name: string, value: string }
 */
export function addRecentColor(colorData) {
  if (!colorData || !colorData.name || !colorData.value) {
    return
  }

  try {
    let colors = getRecentColors()

    // 중복 제거 (같은 변수명이면 제거)
    colors = colors.filter((color) => color.name !== colorData.name)

    // 새로운 색상을 맨 앞에 추가
    const newColor = {
      ...colorData,
      timestamp: Date.now(),
      id: `${colorData.name}-${Date.now()}`, // 고유 ID
    }

    colors.unshift(newColor)

    // 최대 개수 제한
    if (colors.length > MAX_RECENT_COLORS) {
      colors = colors.slice(0, MAX_RECENT_COLORS)
    }

    // localStorage에 저장
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors))

    // 변경 이벤트 발생
    window.dispatchEvent(
      new CustomEvent('recent-colors-changed', {
        detail: { colors },
      }),
    )
  } catch (error) {
    console.error('[RecentColorsManager] 색상 추가 실패:', error)
  }
}

/**
 * 최근 색상 삭제
 * @param {string} colorId - 삭제할 색상 ID
 */
export function removeRecentColor(colorId) {
  try {
    let colors = getRecentColors()
    colors = colors.filter((color) => color.id !== colorId)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors))

    // 변경 이벤트 발생
    window.dispatchEvent(
      new CustomEvent('recent-colors-changed', {
        detail: { colors },
      }),
    )
  } catch (error) {
    console.error('[RecentColorsManager] 색상 삭제 실패:', error)
  }
}

/**
 * 최근 색상 순서 변경 (드래그 앤 드롭)
 * @param {number} fromIndex - 이동할 항목의 원래 인덱스
 * @param {number} toIndex - 이동할 새 인덱스
 */
export function reorderRecentColors(fromIndex, toIndex) {
  try {
    let colors = getRecentColors()

    if (fromIndex < 0 || fromIndex >= colors.length || toIndex < 0 || toIndex >= colors.length) {
      return
    }

    // 배열에서 항목 제거 및 새 위치에 삽입
    const [movedItem] = colors.splice(fromIndex, 1)
    colors.splice(toIndex, 0, movedItem)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors))

    // 변경 이벤트 발생
    window.dispatchEvent(
      new CustomEvent('recent-colors-changed', {
        detail: { colors },
      }),
    )
  } catch (error) {
    console.error('[RecentColorsManager] 순서 변경 실패:', error)
  }
}

/**
 * 모든 최근 색상 삭제
 */
export function clearRecentColors() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(
      new CustomEvent('recent-colors-changed', {
        detail: { colors: [] },
      }),
    )
  } catch (error) {
    console.error('[RecentColorsManager] 전체 삭제 실패:', error)
  }
}
