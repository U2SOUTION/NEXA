// ============================================
// 즐겨찾기 색상 관리 유틸리티
// ============================================

const STORAGE_KEY = 'theme-manager-favorite-colors'
const MAX_FAVORITE_COLORS = 100 // 최대 저장 개수 (최근보다 많게 설정)

/**
 * 즐겨찾기 색상 목록 가져오기
 * @returns {Array} 즐겨찾기 색상 배열
 */
export function getFavoriteColors() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const colors = JSON.parse(stored)
    return Array.isArray(colors) ? colors : []
  } catch (error) {
    console.error('[FavoriteColorsManager] 저장된 색상 읽기 실패:', error)
    return []
  }
}

/**
 * 즐겨찾기 색상 추가
 * @param {Object} colorData - 색상 데이터 { name: string, value: string }
 */
export function addFavoriteColor(colorData) {
  if (!colorData || !colorData.name || !colorData.value) {
    return
  }

  try {
    let colors = getFavoriteColors()

    // 중복 체크 (이미 즐겨찾기에 있으면 추가하지 않음)
    const isDuplicate = colors.some((color) => color.name === colorData.name)
    if (isDuplicate) {
      return // 이미 즐겨찾기에 있으면 아무것도 하지 않음
    }

    // 새로운 색상을 맨 앞에 추가
    const newColor = {
      ...colorData,
      timestamp: Date.now(),
      id: `${colorData.name}-${Date.now()}`, // 고유 ID
    }

    colors.unshift(newColor)

    // 최대 개수 제한
    if (colors.length > MAX_FAVORITE_COLORS) {
      colors = colors.slice(0, MAX_FAVORITE_COLORS)
    }

    // localStorage에 저장
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors))

    // 변경 이벤트 발생
    window.dispatchEvent(
      new CustomEvent('favorite-colors-changed', {
        detail: { colors },
      }),
    )
  } catch (error) {
    console.error('[FavoriteColorsManager] 색상 추가 실패:', error)
  }
}

/**
 * 즐겨찾기 색상 삭제
 * @param {string} colorId - 삭제할 색상 ID
 */
export function removeFavoriteColor(colorId) {
  try {
    let colors = getFavoriteColors()
    colors = colors.filter((color) => color.id !== colorId)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors))

    // 변경 이벤트 발생
    window.dispatchEvent(
      new CustomEvent('favorite-colors-changed', {
        detail: { colors },
      }),
    )
  } catch (error) {
    console.error('[FavoriteColorsManager] 색상 삭제 실패:', error)
  }
}

/**
 * 즐겨찾기 색상 토글 (추가/삭제)
 * @param {Object} colorData - 색상 데이터 { name: string, value: string }
 * @returns {boolean} 토글 후 즐겨찾기 상태 (true: 즐겨찾기됨, false: 해제됨)
 */
export function toggleFavoriteColor(colorData) {
  if (!colorData || !colorData.name || !colorData.value) {
    return false
  }

  try {
    const colors = getFavoriteColors()
    const existingIndex = colors.findIndex((color) => color.name === colorData.name)

    if (existingIndex >= 0) {
      // 이미 즐겨찾기에 있으면 제거
      removeFavoriteColor(colors[existingIndex].id)
      return false
    } else {
      // 즐겨찾기에 없으면 추가
      addFavoriteColor(colorData)
      return true
    }
  } catch (error) {
    console.error('[FavoriteColorsManager] 색상 토글 실패:', error)
    return false
  }
}

/**
 * 특정 색상이 즐겨찾기에 있는지 확인
 * @param {string} colorName - 확인할 색상 변수명
 * @returns {boolean} 즐겨찾기 여부
 */
export function isFavoriteColor(colorName) {
  try {
    const colors = getFavoriteColors()
    return colors.some((color) => color.name === colorName)
  } catch (error) {
    console.error('[FavoriteColorsManager] 즐겨찾기 확인 실패:', error)
    return false
  }
}

/**
 * 즐겨찾기 색상 순서 변경 (드래그 앤 드롭)
 * @param {number} fromIndex - 이동할 항목의 원래 인덱스
 * @param {number} toIndex - 이동할 새 인덱스
 */
export function reorderFavoriteColors(fromIndex, toIndex) {
  try {
    let colors = getFavoriteColors()

    if (fromIndex < 0 || fromIndex >= colors.length || toIndex < 0 || toIndex >= colors.length) {
      return
    }

    // 배열에서 항목 제거 및 새 위치에 삽입
    const [movedItem] = colors.splice(fromIndex, 1)
    colors.splice(toIndex, 0, movedItem)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors))

    // 변경 이벤트 발생
    window.dispatchEvent(
      new CustomEvent('favorite-colors-changed', {
        detail: { colors },
      }),
    )
  } catch (error) {
    console.error('[FavoriteColorsManager] 순서 변경 실패:', error)
  }
}

/**
 * 모든 즐겨찾기 색상 삭제
 */
export function clearFavoriteColors() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(
      new CustomEvent('favorite-colors-changed', {
        detail: { colors: [] },
      }),
    )
  } catch (error) {
    console.error('[FavoriteColorsManager] 전체 삭제 실패:', error)
  }
}
