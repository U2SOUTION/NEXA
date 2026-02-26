const STORAGE_KEY = 'theme-manager-recent-colors'
const MAX_RECENT_COLORS = 50

export interface RecentColorItem {
  name: string
  value: string
  timestamp?: number
  id?: string
}

export function getRecentColors(): RecentColorItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const colors = JSON.parse(stored)
    return Array.isArray(colors) ? colors : []
  } catch (e) {
    console.error('[RecentColorsManager] 저장된 색상 읽기 실패:', e)
    return []
  }
}

export function addRecentColor(colorData: { name: string; value: string }): void {
  if (!colorData?.name || !colorData?.value) return
  try {
    let colors = getRecentColors()
    colors = colors.filter((c) => c.name !== colorData.name)
    const newColor: RecentColorItem = { ...colorData, timestamp: Date.now(), id: colorData.name + '-' + Date.now() }
    colors.unshift(newColor)
    if (colors.length > MAX_RECENT_COLORS) colors = colors.slice(0, MAX_RECENT_COLORS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors))
    window.dispatchEvent(new CustomEvent('recent-colors-changed', { detail: { colors } }))
  } catch (e) {
    console.error('[RecentColorsManager] 색상 추가 실패:', e)
  }
}

export function removeRecentColor(colorId: string): void {
  try {
    const colors = getRecentColors().filter((c) => c.id !== colorId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors))
    window.dispatchEvent(new CustomEvent('recent-colors-changed', { detail: { colors } }))
  } catch (e) {
    console.error('[RecentColorsManager] 색상 삭제 실패:', e)
  }
}

export function reorderRecentColors(fromIndex: number, toIndex: number): void {
  try {
    const colors = getRecentColors()
    if (fromIndex < 0 || fromIndex >= colors.length || toIndex < 0 || toIndex >= colors.length) return
    const [moved] = colors.splice(fromIndex, 1)
    colors.splice(toIndex, 0, moved)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors))
    window.dispatchEvent(new CustomEvent('recent-colors-changed', { detail: { colors } }))
  } catch (e) {
    console.error('[RecentColorsManager] 순서 변경 실패:', e)
  }
}

export function clearRecentColors(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new CustomEvent('recent-colors-changed', { detail: { colors: [] } }))
  } catch (e) {
    console.error('[RecentColorsManager] 전체 삭제 실패:', e)
  }
}
