import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'

export const useUserSettingsStore = defineStore('userSettings', () => {
  const $q = useQuasar()

  // 사용자 설정 상태
  const settings = ref({
    theme: {
      isDarkMode: true, // 기본값은 다크 모드
    },
    drawer: {
      leftWidth: 250,
      rightWidth: 300,
      rightMode: 'push', // 'push' 또는 'overlay'
      rightOpen: false, // 오른쪽 도구패널 열림/닫힘 상태
    },
    partsManagement: {
      shelfBinDisplayMode: 'scroll', // 'scroll' 또는 'compact' (레거시, 사용 안 함)
      binScale: 0.5, // 빈 스케일 (0.1 ~ 1.0)
    },
  })

  // 초기 설정 로드
  const loadSettings = () => {
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings)
        settings.value = {
          ...settings.value,
          ...parsedSettings,
        }
      } catch (error) {
        console.error('Failed to parse user settings:', error)
      }
    }
  }

  // 설정 저장
  const saveSettings = () => {
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings.value))
    } catch (error) {
      console.error('Failed to save user settings:', error)
    }
  }

  // 테마 관련 메서드
  const initializeTheme = () => {
    loadSettings()
    const isDark = settings.value.theme.isDarkMode
    $q.dark.set(isDark)
    document.body.classList.toggle('dark', isDark)
  }

  const toggleTheme = () => {
    settings.value.theme.isDarkMode = !settings.value.theme.isDarkMode
    const isDark = settings.value.theme.isDarkMode
    $q.dark.set(isDark)
    document.body.classList.toggle('dark', isDark)
    saveSettings()
  }

  // 드로어 관련 메서드
  const setDrawerWidth = (side, width) => {
    if (side === 'left') settings.value.drawer.leftWidth = width
    if (side === 'right') settings.value.drawer.rightWidth = width
    saveSettings()
  }
  const setRightDrawerMode = (mode) => {
    settings.value.drawer.rightMode = mode
    saveSettings()
  }
  const setRightDrawerOpen = (isOpen) => {
    settings.value.drawer.rightOpen = isOpen
    saveSettings()
  }

  // 부품 관리 관련 메서드
  const setShelfBinDisplayMode = (mode) => {
    if (!settings.value.partsManagement) {
      settings.value.partsManagement = {}
    }
    settings.value.partsManagement.shelfBinDisplayMode = mode
    saveSettings()
  }

  const setBinScale = (scale) => {
    if (!settings.value.partsManagement) {
      settings.value.partsManagement = {}
    }
    settings.value.partsManagement.binScale = Math.max(0.1, Math.min(1.0, scale))
    saveSettings()
  }

  // 설정 변경 감시
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
