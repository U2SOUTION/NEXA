const STORAGE_KEY = 'theme-manager-favorite-colors'
const MAX_FAVORITE_COLORS = 100

export interface FavoriteColorItem {
  name: string
  value: string
  timestamp?: number
  id?: string
}

export function getFavoriteColors(): FavoriteColorItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const colors = JSON.parse(stored)
    return Array.isArray(colors) ? colors : []
  } catch (e) {
    console.error('[FavoriteColorsManager] 저장된 색상 읽기 실패:', e)
    return []
  }
}

export function addFavoriteColor(colorData: { name: string; value: string }): void {
  if (!colorData?.name || !colorData?.value) return
  try {
    const colors = getFavoriteColors()
    if (colors.some((c) => c.name === colorData.name)) return
    const newColor: FavoriteColorItem = { ...colorData, timestamp: Date.now(), id: colorData.name + '-' + Date.now() }
    const next = [newColor, ...colors].slice(0, MAX_FAVORITE_COLORS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('favorite-colors-changed', { detail: { colors: next } }))
  } catch (e) {
    console.error('[FavoriteColorsManager] 색상 추가 실패:', e)
  }
}

export function removeFavoriteColor(colorId: string): void {
  try {
    const colors = getFavoriteColors().filter((c) => c.id !== colorId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors))
    window.dispatchEvent(new CustomEvent('favorite-colors-changed', { detail: { colors } }))
  } catch (e) {
    console.error('[FavoriteColorsManager] 색상 삭제 실패:', e)
  }
}

export function toggleFavoriteColor(colorData: { name: string; value: string }): boolean {
  if (!colorData?.name || !colorData?.value) return false
  try {
    const colors = getFavoriteColors()
    const idx = colors.findIndex((c) => c.name === colorData.name)
    if (idx >= 0) {
      removeFavoriteColor(colors[idx].id as string)
      return false
    }
    addFavoriteColor(colorData)
    return true
  } catch (e) {
    console.error('[FavoriteColorsManager] 색상 토글 실패:', e)
    return false
  }
}

export function isFavoriteColor(colorName: string): boolean {
  try {
    return getFavoriteColors().some((c) => c.name === colorName)
  } catch (e) {
    console.error('[FavoriteColorsManager] 즐겨찾기 확인 실패:', e)
    return false
  }
}

export function reorderFavoriteColors(fromIndex: number, toIndex: number): void {
  try {
    const colors = getFavoriteColors()
    if (fromIndex < 0 || fromIndex >= colors.length || toIndex < 0 || toIndex >= colors.length) return
    const [moved] = colors.splice(fromIndex, 1)
    colors.splice(toIndex, 0, moved)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors))
    window.dispatchEvent(new CustomEvent('favorite-colors-changed', { detail: { colors } }))
  } catch (e) {
    console.error('[FavoriteColorsManager] 순서 변경 실패:', e)
  }
}

export function clearFavoriteColors(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new CustomEvent('favorite-colors-changed', { detail: { colors: [] } }))
  } catch (e) {
    console.error('[FavoriteColorsManager] 전체 삭제 실패:', e)
  }
}
