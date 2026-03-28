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
  connectionStrokeColor: string
  connectionStrokeWidth: number
  /** 비우면 `var(--nexa-background)` 계열 사용 */
  canvasBgColor: string
  backgroundDotGap: number
  backgroundDotSize: number
  backgroundPatternColor: string
  /** Vue Flow Background는 `dots` | `lines` 만 지원 (구버전 `cross` 등은 로드 시 dots로 정규화) */
  backgroundVariant: 'dots' | 'lines'
  /** 핸들에 연결 끌어 놓을 때 스냅 거리(px) */
  connectionRadius: number
  snapToGrid: boolean
  /** 비우면 라이트/다크에 맞는 기본 미니맵 톤 사용 */
  minimapMaskColor: string
  minimapMaskStrokeColor: string
  minimapNodeColor: string
  minimapNodeStrokeColor: string
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

function sanitizeNexionBackgroundVariant(raw: unknown): 'dots' | 'lines' {
  return raw === 'lines' ? 'lines' : 'dots'
}

export function getDefaultNexionFlowUi(): UserSettingsNexionFlow {
  return {
    edgeStrokeColor: '#1976d2',
    edgeStrokeWidth: 2,
    connectionStrokeColor: '#1976d2',
    connectionStrokeWidth: 2,
    canvasBgColor: '',
    backgroundDotGap: 18,
    backgroundDotSize: 1.25,
    backgroundPatternColor: 'rgba(25, 118, 210, 0.35)',
    backgroundVariant: 'dots',
    connectionRadius: 72,
    snapToGrid: false,
    minimapMaskColor: '',
    minimapMaskStrokeColor: '',
    minimapNodeColor: '',
    minimapNodeStrokeColor: '',
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
            merged.backgroundVariant = sanitizeNexionBackgroundVariant(merged.backgroundVariant)
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
    if (partial.backgroundVariant !== undefined) {
      next.backgroundVariant = sanitizeNexionBackgroundVariant(partial.backgroundVariant)
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
