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

export type UserSettings = {
  theme: UserSettingsTheme
  drawer: UserSettingsDrawer
  partsManagement: UserSettingsPartsManagement
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
  }
})
