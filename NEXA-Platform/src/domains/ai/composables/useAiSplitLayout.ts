/**
 * AI 도메인 content 3영역 스플릿 레이아웃 상태.
 * 영역별 패널 목록, 표시/숨김, 스플릿 비율. localStorage 저장.
 */
import { ref, watch } from 'vue'

const LAYOUT_KEY = 'nexa-ai-split-layout'

/** 영역별 최소·최대 비율(%). 추후 환경설정으로 분리 예정 */
export const SPLIT_LIMITS: { minPct: number; maxPct: number } = { minPct: 5, maxPct: 90 }

const DEFAULT_LEFT = ['chat']
const DEFAULT_CENTER = ['editor', 'code', 'image', 'audio', 'video', 'viewer']
const DEFAULT_RIGHT = ['explorer']

const DEFAULT_SIZES = { left: 22, center: 56, right: 22 }

/** 저장된 centerPanelIds */
function migrateCenterPanelIds(saved: string[] | undefined): string[] {
  let list = Array.isArray(saved) ? [...saved] : [...DEFAULT_CENTER]
  const newDefaults = DEFAULT_CENTER.filter((id) => !list.includes(id))
  if (newDefaults.length) list = [...list, ...newDefaults]
  const viewerIdx = list.indexOf('viewer')
  if (viewerIdx >= 0 && viewerIdx < list.length - 1) {
    list = [...list.filter((id) => id !== 'viewer'), 'viewer']
  }
  return list
}

function loadLayout() {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return {
      leftPanelIds: Array.isArray(data.leftPanelIds) ? data.leftPanelIds : DEFAULT_LEFT,
      centerPanelIds: migrateCenterPanelIds(data.centerPanelIds),
      rightPanelIds: Array.isArray(data.rightPanelIds) ? data.rightPanelIds : DEFAULT_RIGHT,
      leftVisible: data.leftVisible !== false,
      centerVisible: data.centerVisible !== false,
      rightVisible: data.rightVisible !== false,
      leftSize: typeof data.leftSize === 'number' ? data.leftSize : DEFAULT_SIZES.left,
      centerSize: typeof data.centerSize === 'number' ? data.centerSize : DEFAULT_SIZES.center,
      rightSize: typeof data.rightSize === 'number' ? data.rightSize : DEFAULT_SIZES.right,
      leftActiveIndex: Math.max(0, data.leftActiveIndex ?? 0),
      centerActiveIndex: Math.max(0, data.centerActiveIndex ?? 0),
      rightActiveIndex: Math.max(0, data.rightActiveIndex ?? 0),
    }
  } catch {
    return null
  }
}

function saveLayout(data: {
  leftPanelIds: string[]
  centerPanelIds: string[]
  rightPanelIds: string[]
  leftVisible: boolean
  centerVisible: boolean
  rightVisible: boolean
  leftSize: number
  centerSize: number
  rightSize: number
  leftActiveIndex: number
  centerActiveIndex: number
  rightActiveIndex: number
}) {
  try {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('[useAiSplitLayout] 저장 실패:', e)
  }
}

const loaded = loadLayout()

export const leftPanelIds = ref<string[]>(loaded?.leftPanelIds ?? [...DEFAULT_LEFT])
export const centerPanelIds = ref<string[]>(loaded?.centerPanelIds ?? [...DEFAULT_CENTER])
export const rightPanelIds = ref<string[]>(loaded?.rightPanelIds ?? [...DEFAULT_RIGHT])
export const leftVisible = ref(loaded?.leftVisible ?? true)
export const centerVisible = ref(loaded?.centerVisible ?? true)
export const rightVisible = ref(loaded?.rightVisible ?? true)
export const leftSize = ref(loaded?.leftSize ?? DEFAULT_SIZES.left)
export const centerSize = ref(loaded?.centerSize ?? DEFAULT_SIZES.center)
export const rightSize = ref(loaded?.rightSize ?? DEFAULT_SIZES.right)
export const leftActiveIndex = ref(loaded?.leftActiveIndex ?? 0)
export const centerActiveIndex = ref(loaded?.centerActiveIndex ?? 0)
export const rightActiveIndex = ref(loaded?.rightActiveIndex ?? 0)

watch(
  [
    leftPanelIds,
    centerPanelIds,
    rightPanelIds,
    leftVisible,
    centerVisible,
    rightVisible,
    leftSize,
    centerSize,
    rightSize,
    leftActiveIndex,
    centerActiveIndex,
    rightActiveIndex,
  ],
  () => {
    saveLayout({
      leftPanelIds: leftPanelIds.value,
      centerPanelIds: centerPanelIds.value,
      rightPanelIds: rightPanelIds.value,
      leftVisible: leftVisible.value,
      centerVisible: centerVisible.value,
      rightVisible: rightVisible.value,
      leftSize: leftSize.value,
      centerSize: centerSize.value,
      rightSize: rightSize.value,
      leftActiveIndex: leftActiveIndex.value,
      centerActiveIndex: centerActiveIndex.value,
      rightActiveIndex: rightActiveIndex.value,
    })
  },
  { deep: true },
)

/** panelId가 어느 영역에 있는지, 해당 영역 탭 인덱스 반환 */
export function getAreaAndIndexForPanel(panelId: string): { area: 'left' | 'center' | 'right'; index: number } | null {
  const leftIdx = leftPanelIds.value.indexOf(panelId)
  if (leftIdx >= 0) return { area: 'left', index: leftIdx }
  const centerIdx = centerPanelIds.value.indexOf(panelId)
  if (centerIdx >= 0) return { area: 'center', index: centerIdx }
  const rightIdx = rightPanelIds.value.indexOf(panelId)
  if (rightIdx >= 0) return { area: 'right', index: rightIdx }
  return null
}

/** 해당 panelId를 보이게 하고 그 탭으로 전환 (setCenterTab 호환) */
export function showPanel(panelId: string) {
  const info = getAreaAndIndexForPanel(panelId)
  if (!info) return
  if (info.area === 'left') {
    leftVisible.value = true
    leftActiveIndex.value = info.index
  } else if (info.area === 'center') {
    centerVisible.value = true
    centerActiveIndex.value = info.index
  } else {
    rightVisible.value = true
    rightActiveIndex.value = info.index
  }
}

/** 기본 프리셋 적용 */
export function applyPreset(preset: 'default' | 'code') {
  if (preset === 'default') {
    leftPanelIds.value = [...DEFAULT_LEFT]
    centerPanelIds.value = [...DEFAULT_CENTER]
    rightPanelIds.value = [...DEFAULT_RIGHT]
    leftVisible.value = true
    centerVisible.value = true
    rightVisible.value = true
    leftSize.value = DEFAULT_SIZES.left
    centerSize.value = DEFAULT_SIZES.center
    rightSize.value = DEFAULT_SIZES.right
    leftActiveIndex.value = 0
    centerActiveIndex.value = 0
    rightActiveIndex.value = 0
  } else if (preset === 'code') {
    leftPanelIds.value = ['chat']
    centerPanelIds.value = ['code', 'editor', 'image', 'audio', 'video', 'viewer']
    rightPanelIds.value = ['explorer']
    leftVisible.value = true
    centerVisible.value = true
    rightVisible.value = true
    leftSize.value = 25
    centerSize.value = 50
    rightSize.value = 25
    leftActiveIndex.value = 0
    centerActiveIndex.value = 0
    rightActiveIndex.value = 0
  }
}

/** 비율만 기본값으로 초기화 (패널 구성·표시 상태 유지) */
export function resetSplitSizes() {
  leftSize.value = DEFAULT_SIZES.left
  centerSize.value = DEFAULT_SIZES.center
  rightSize.value = DEFAULT_SIZES.right
}

/** 패널 순서 변경 (드래그앤드롭용). activeIndex도 함께 보정 */
export function reorderPanel(area: 'left' | 'center' | 'right', fromIndex: number, toIndex: number) {
  const ids = area === 'left' ? leftPanelIds : area === 'center' ? centerPanelIds : rightPanelIds
  const active = area === 'left' ? leftActiveIndex : area === 'center' ? centerActiveIndex : rightActiveIndex
  const arr = [...ids.value]
  const [item] = arr.splice(fromIndex, 1)
  arr.splice(toIndex, 0, item)
  ids.value = arr
  let newActive = active.value
  if (active.value === fromIndex) newActive = toIndex
  else if (fromIndex < active.value && toIndex >= active.value) newActive = active.value - 1
  else if (fromIndex > active.value && toIndex <= active.value) newActive = active.value + 1
  active.value = newActive
}
