import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'

export type UserSettingsTheme = {
  isDarkMode: boolean
}

export type UserSettingsDrawer = {
  leftWidth: number
  rightWidth: number
  rightMode: 'push' | 'overlay'
  rightOpen: boolean
}

export type UserSettingsPartsManagement = {
  shelfBinDisplayMode?: 'scroll' | 'compact'
  binScale?: number
}

/** Nexion(Vue Flow) 캔버스 — 설정 UI에서 조정, localStorage `userSettings`에 저장 */
export type UserSettingsNexionFlow = {
  edgeStrokeColor: string
  edgeStrokeWidth: number
  /** 비우면 연결 미리보기 색(`connectionStrokeColor`)으로 선택 강조 */
  edgeSelectedStrokeColor: string
  connectionStrokeColor: string
  connectionStrokeWidth: number
  /** 비우면 `var(--nexa-background)` 계열 사용 */
  canvasBgColor: string
  /** 핸들 연결 스냅 거리(px). 0이면 끔(핸들 정중앙에만 연결), 1–120 사용 */
  connectionRadius: number
  /** 비우면 라이트/다크에 맞는 기본 미니맵 톤 사용 */
  minimapMaskColor: string
  minimapMaskStrokeColor: string
  minimapNodeColor: string
  minimapNodeStrokeColor: string
  /** 카드 헤더(이름) 기본 글자 크기(px). 프랙탈 줌·LOD와 별도로 설정 기준 크기 */
  cardTitleFontPx: number
  /** 카드 본문(중앙 컨텐츠·안내 문구 등) 글자 크기(px) */
  cardBodyFontPx: number
  /** 카드 풋터(부가 ID 등) 글자 크기(px) */
  cardFooterFontPx: number
}

export type UserSettings = {
  theme: UserSettingsTheme
  drawer: UserSettingsDrawer
  partsManagement: UserSettingsPartsManagement
  nexionFlow: UserSettingsNexionFlow
}

/** 연결선 두께: 0.3~5px. 1 미만은 0.1 단위, 1 이상은 정수만 */
export function sanitizeNexionEdgeStrokeWidth(raw: number): number {
  const n = Number(raw)
  const fallback = 2
  if (!Number.isFinite(n)) return fallback

  let v = Math.min(5, Math.max(0.3, n))

  if (v >= 1) {
    return Math.min(5, Math.max(1, Math.round(v)))
  }

  v = Math.round(v * 10) / 10
  if (v >= 1) return 1
  return Math.min(0.9, Math.max(0.3, v))
}

/** 제거된 nexionFlow 필드 — 예전 localStorage 정리용 */
const LEGACY_NEXION_FLOW_KEYS = [
  'backgroundDotGap',
  'backgroundDotSize',
  'backgroundPatternColor',
  'backgroundVariant',
  'snapToGrid',
] as const

/** 핸들 근접 연결 스냅 반경 */
function sanitizeNexionConnectionRadius(raw: number): number {
  const n = Number(raw)
  const fallback = 72
  if (!Number.isFinite(n)) return fallback
  return Math.min(120, Math.max(0, Math.round(n)))
}

export function sanitizeNexionCardTitleFontPx(raw: number): number {
  const n = Number(raw)
  const fallback = 13
  if (!Number.isFinite(n)) return fallback
  return Math.min(18, Math.max(10, Math.round(n)))
}

export function sanitizeNexionCardBodyFontPx(raw: number): number {
  const n = Number(raw)
  const fallback = 12
  if (!Number.isFinite(n)) return fallback
  return Math.min(18, Math.max(7, Math.round(n)))
}

export function sanitizeNexionCardFooterFontPx(raw: number): number {
  const n = Number(raw)
  const fallback = 11
  if (!Number.isFinite(n)) return fallback
  return Math.min(14, Math.max(6, Math.round(n)))
}

export function getDefaultNexionFlowUi(): UserSettingsNexionFlow {
  return {
    edgeStrokeColor: '#1976d2',
    edgeStrokeWidth: 2,
    edgeSelectedStrokeColor: '',
    connectionStrokeColor: '#1976d2',
    connectionStrokeWidth: 2,
    canvasBgColor: '',
    connectionRadius: 72,
    minimapMaskColor: '',
    minimapMaskStrokeColor: '',
    minimapNodeColor: '',
    minimapNodeStrokeColor: '',
    cardTitleFontPx: 13,
    cardBodyFontPx: 12,
    cardFooterFontPx: 11,
  }
}

const defaultSettings: UserSettings = {
  theme: {
    isDarkMode: true,
  },
  drawer: {
    leftWidth: 250,
    rightWidth: 300,
    rightMode: 'push',
    rightOpen: false,
  },
  partsManagement: {
    shelfBinDisplayMode: 'scroll',
    binScale: 0.5,
  },
  nexionFlow: getDefaultNexionFlowUi(),
}

export const useUserSettingsStore = defineStore('userSettings', () => {
  const $q = useQuasar()

  const settings = ref<UserSettings>({ ...defaultSettings })

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings) as Partial<UserSettings>
        settings.value = {
          ...defaultSettings,
          ...settings.value,
          ...parsedSettings,
          theme: { ...defaultSettings.theme, ...settings.value.theme, ...parsedSettings.theme },
          drawer: { ...defaultSettings.drawer, ...settings.value.drawer, ...parsedSettings.drawer },
          partsManagement: {
            ...defaultSettings.partsManagement,
            ...settings.value.partsManagement,
            ...parsedSettings.partsManagement,
          },
          nexionFlow: (() => {
            const merged: UserSettingsNexionFlow = {
              ...defaultSettings.nexionFlow,
              ...settings.value.nexionFlow,
              ...(parsedSettings.nexionFlow ?? {}),
            }
            merged.edgeStrokeWidth = sanitizeNexionEdgeStrokeWidth(merged.edgeStrokeWidth)
            merged.connectionRadius = sanitizeNexionConnectionRadius(merged.connectionRadius)
            merged.cardTitleFontPx = sanitizeNexionCardTitleFontPx(merged.cardTitleFontPx)
            merged.cardBodyFontPx = sanitizeNexionCardBodyFontPx(merged.cardBodyFontPx)
            merged.cardFooterFontPx = sanitizeNexionCardFooterFontPx(merged.cardFooterFontPx)
            const loose = merged as unknown as Record<string, unknown>
            for (const k of LEGACY_NEXION_FLOW_KEYS) delete loose[k]
            return merged
          })(),
        }
      } catch (error) {
        console.error('Failed to parse user settings:', error)
      }
    }
  }

  const saveSettings = () => {
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings.value))
    } catch (error) {
      console.error('Failed to save user settings:', error)
    }
  }

  const initializeTheme = () => {
    loadSettings()
    const isDark = settings.value.theme.isDarkMode
    $q.dark.set(isDark)
    document.body.classList.toggle('dark', isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }

  const toggleTheme = () => {
    settings.value.theme.isDarkMode = !settings.value.theme.isDarkMode
    const isDark = settings.value.theme.isDarkMode
    $q.dark.set(isDark)
    document.body.classList.toggle('dark', isDark)
    document.documentElement.classList.toggle('dark', isDark)
    saveSettings()
  }

  const setDrawerWidth = (side: 'left' | 'right', width: number) => {
    if (side === 'left') settings.value.drawer.leftWidth = width
    if (side === 'right') settings.value.drawer.rightWidth = width
    saveSettings()
  }

  const setRightDrawerMode = (mode: 'push' | 'overlay') => {
    settings.value.drawer.rightMode = mode
    saveSettings()
  }

  const setRightDrawerOpen = (isOpen: boolean) => {
    settings.value.drawer.rightOpen = isOpen
    saveSettings()
  }

  const setShelfBinDisplayMode = (mode: 'scroll' | 'compact') => {
    if (!settings.value.partsManagement) {
      settings.value.partsManagement = {}
    }
    settings.value.partsManagement.shelfBinDisplayMode = mode
    saveSettings()
  }

  const setBinScale = (scale: number) => {
    if (!settings.value.partsManagement) {
      settings.value.partsManagement = {}
    }
    settings.value.partsManagement.binScale = Math.max(0.1, Math.min(1.0, scale))
    saveSettings()
  }

  const patchNexionFlowSettings = (partial: Partial<UserSettingsNexionFlow>) => {
    const next = {
      ...settings.value.nexionFlow,
      ...partial,
    }
    if (partial.edgeStrokeWidth !== undefined) {
      next.edgeStrokeWidth = sanitizeNexionEdgeStrokeWidth(partial.edgeStrokeWidth)
    }
    if (partial.connectionRadius !== undefined) {
      next.connectionRadius = sanitizeNexionConnectionRadius(partial.connectionRadius)
    }
    if (partial.cardTitleFontPx !== undefined) {
      next.cardTitleFontPx = sanitizeNexionCardTitleFontPx(partial.cardTitleFontPx)
    }
    if (partial.cardBodyFontPx !== undefined) {
      next.cardBodyFontPx = sanitizeNexionCardBodyFontPx(partial.cardBodyFontPx)
    }
    if (partial.cardFooterFontPx !== undefined) {
      next.cardFooterFontPx = sanitizeNexionCardFooterFontPx(partial.cardFooterFontPx)
    }
    settings.value.nexionFlow = next
    saveSettings()
  }

  const resetNexionFlowSettings = () => {
    settings.value.nexionFlow = getDefaultNexionFlowUi()
    saveSettings()
  }

  watch(
    () => settings.value.theme.isDarkMode,
    (newValue) => {
      $q.dark.set(newValue)
      document.body.classList.toggle('dark', newValue)
    },
  )

  return {
    settings,
    initializeTheme,
    toggleTheme,
    loadSettings,
    saveSettings,
    setDrawerWidth,
    setRightDrawerMode,
    setRightDrawerOpen,
    setShelfBinDisplayMode,
    setBinScale,
    patchNexionFlowSettings,
    resetNexionFlowSettings,
  }
})
