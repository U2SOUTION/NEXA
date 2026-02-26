/**
 * 전역 단축키 관리 Composable
 *
 * 기능:
 * - 전역 단축키 등록/해제
 * - 단축키 설정 저장/로드 (localStorage)
 * - 입력 필드 포커스 감지 및 예외 처리
 * - Ctrl/Cmd 키 자동 감지 (크로스 플랫폼 지원)
 * - 단축키 카테고리별 정렬
 */

import { ref } from 'vue'

// ============================================
// 단축키 카테고리 정의
// ============================================

/**
 * 단축키 카테고리 정의
 * 네비게이션 관련 단축키를 가장 위에 배치
 */
export const SHORTCUT_CATEGORIES = [
  {
    name: 'navigation',
    title: '네비게이션',
    icon: 'navigation',
    ids: ['goToHome', 'goToSettings', 'goToDev', 'goToSettingsTheme', 'goBack', 'goForward'],
  },
  {
    name: 'sidebar',
    title: '사이드바',
    icon: 'view_sidebar',
    ids: ['toggleLeftSidebarCtrlLeft', 'toggleRightSidebarCtrlRight', 'toggleRightSidebarMode', 'openRightSidebarPush', 'openRightSidebarOverlay'],
  },
  {
    name: 'theme',
    title: '테마 및 UI',
    icon: 'palette',
    ids: ['toggleTheme'],
  },
  {
    name: 'utility',
    title: '유틸리티',
    icon: 'build',
    ids: ['refreshPage', 'hardRefresh', 'clearConsole'],
  },
  {
    name: 'custom',
    title: '사용자 정의',
    icon: 'star',
    ids: [], // 동적으로 추가됨
  },
]

// 단축키 레지스트리 (key → handler 매핑)
const shortcutRegistry = new Map()

// 단축키 설정 (localStorage에서 로드)
const shortcutSettings = ref({})

// 전역 이벤트 리스너 상태
let isGlobalShortcutsActive = false
let globalKeyDownHandler = null

// localStorage 키
const STORAGE_KEY = 'nexa-global-shortcuts'

/**
 * 단축키 설정 로드 (localStorage)
 */
function loadShortcutSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      shortcutSettings.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('[useGlobalShortcuts] 설정 로드 실패:', error)
    shortcutSettings.value = {}
  }
}

/**
 * 단축키 설정 저장 (localStorage)
 */
function saveShortcutSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcutSettings.value))
  } catch (error) {
    console.error('[useGlobalShortcuts] 설정 저장 실패:', error)
  }
}

/**
 * 단축키 설정 가져오기
 */
function getShortcutSetting(shortcutId) {
  return shortcutSettings.value[shortcutId] || null
}

/**
 * 단축키 설정 업데이트
 */
function updateShortcutSetting(shortcutId, setting) {
  shortcutSettings.value[shortcutId] = setting
  saveShortcutSettings()
}

/**
 * 키 조합 문자열을 객체로 변환
 * 예: 'ctrl+b' -> { key: 'b', ctrlKey: true }
 * 예: 'ctrl+shift+s' -> { key: 's', ctrlKey: true, shiftKey: true }
 *
 * @param {string} combo - 키 조합 문자열 (예: 'ctrl+b', 'ctrl+shift+s')
 * @returns {Object} 키 조합 객체
 */
function parseKeyCombo(combo) {
  if (typeof combo !== 'string') {
    return combo // 이미 객체인 경우 그대로 반환
  }

  const parts = combo
    .toLowerCase()
    .split('+')
    .map((p) => p.trim())

  // 마지막 부분이 실제 키
  let key = parts[parts.length - 1]

  // 특수 키 이름 변환 (브라우저 이벤트 키 이름으로 변환)
  const specialKeys = {
    left: 'ArrowLeft',
    right: 'ArrowRight',
    up: 'ArrowUp',
    down: 'ArrowDown',
    space: ' ',
  }
  if (specialKeys[key]) {
    key = specialKeys[key]
  }

  const result = {
    key: key,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
  }

  for (let i = 0; i < parts.length - 1; i++) {
    const mod = parts[i]
    if (mod === 'ctrl' || mod === 'control') {
      result.ctrlKey = true
    } else if (mod === 'cmd' || mod === 'meta') {
      result.metaKey = true
    } else if (mod === 'shift') {
      result.shiftKey = true
    } else if (mod === 'alt') {
      result.altKey = true
    }
  }

  return result
}

/**
 * 단축키 매칭 확인
 */
function matchesShortcut(event, shortcutConfig) {
  const setting = getShortcutSetting(shortcutConfig.id) || shortcutConfig

  // 키 조합 문자열이면 파싱
  const parsedSetting = setting.combo ? parseKeyCombo(setting.combo) : setting

  // 키 매칭
  if (event.key.toLowerCase() !== parsedSetting.key.toLowerCase()) {
    return false
  }

  // Ctrl/Cmd 키 매칭 (크로스 플랫폼)
  const needsCtrl = parsedSetting.ctrlKey || parsedSetting.metaKey
  const hasCtrl = event.ctrlKey || event.metaKey
  if (needsCtrl && !hasCtrl) {
    return false
  }
  if (!needsCtrl && hasCtrl) {
    return false
  }

  // Shift 키 매칭
  if (parsedSetting.shiftKey !== undefined) {
    if (parsedSetting.shiftKey !== event.shiftKey) {
      return false
    }
  }

  // Alt 키 매칭
  if (parsedSetting.altKey !== undefined) {
    if (parsedSetting.altKey !== event.altKey) {
      return false
    }
  }

  return true
}

/**
 * 입력 필드 포커스 확인
 */
function isInputFieldFocused() {
  const activeElement = document.activeElement
  if (!activeElement) return false

  return activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable || activeElement.closest('input, textarea, [contenteditable]')
}

/**
 * 전역 키보드 이벤트 핸들러
 */
function createGlobalKeyDownHandler() {
  return (event) => {
    // 입력 필드에 포커스가 있고 Ctrl/Cmd 조합이 아니면 무시
    if (isInputFieldFocused() && !event.ctrlKey && !event.metaKey) {
      return
    }

    // 등록된 단축키 확인
    for (const [shortcutId, shortcutConfig] of shortcutRegistry.entries()) {
      if (matchesShortcut(event, shortcutConfig)) {
        // 단축키 비활성화 확인
        const setting = getShortcutSetting(shortcutId)
        if (setting && setting.enabled === false) {
          continue
        }

        // F12는 브라우저 기본 동작(개발자 도구 열기)을 막지 않음
        const isF12 = event.key === 'F12' || event.key === 'f12'
        if (!isF12) {
          event.preventDefault()
          event.stopPropagation()
        }

        // 핸들러 실행
        if (shortcutConfig.handler) {
          shortcutConfig.handler(event)
        }

        // F12의 경우 브라우저 기본 동작을 허용하기 위해 이벤트 전파
        if (isF12) {
          return // 이벤트를 막지 않고 브라우저 기본 동작 허용
        }

        return // 첫 번째 매칭된 단축키만 실행
      }
    }
  }
}

/**
 * 기본 단축키 정의 (handler는 외부에서 주입받음)
 *
 * @param {Object} handlers - 단축키 핸들러 객체
 * @returns {Array} 기본 단축키 배열
 */
export function getDefaultShortcuts(handlers = {}) {
  return [
    // 사이드바 토글
    {
      description: '우측 사이드바 Push 모드로 오픈/클로즈 토글',
      combo: 'ctrl+shift+p',
      id: 'openRightSidebarPush',
      handler: handlers.openRightSidebarPush || (() => {}),
    },
    {
      description: '우측 사이드바 Overlay 모드로 오픈/클로즈 토글',
      combo: 'ctrl+shift+o',
      id: 'openRightSidebarOverlay',
      handler: handlers.openRightSidebarOverlay || (() => {}),
    },
    // 네비게이션
    {
      description: '홈으로 이동',
      combo: 'ctrl+h',
      id: 'goToHome',
      handler: handlers.goToHome || (() => {}),
    },
    {
      description: '설정 페이지로 이동',
      combo: 'ctrl+shift+s',
      id: 'goToSettings',
      handler: handlers.goToSettings || (() => {}),
    },
    {
      description: 'DEV 페이지로 이동',
      combo: 'ctrl+shift+d',
      id: 'goToDev',
      handler: handlers.goToDev || (() => {}),
    },
    {
      description: '설정 페이지 테마 탭으로 이동',
      combo: 'ctrl+shift+u',
      id: 'goToSettingsTheme',
      handler: handlers.goToSettingsTheme || (() => {}),
    },
    // 테마 및 UI
    {
      description: '테마 전환 (다크/라이트)',
      combo: 'ctrl+shift+t',
      id: 'toggleTheme',
      handler: handlers.toggleTheme || (() => {}),
    },
    // 유틸리티
    {
      description: '페이지 새로고침',
      combo: 'ctrl+z',
      id: 'refreshPage',
      handler: handlers.refreshPage || (() => {}),
    },
    {
      description: '하드 리프레시 (캐시 무시)',
      combo: 'ctrl+shift+r',
      id: 'hardRefresh',
      handler: handlers.hardRefresh || (() => {}),
    },
    {
      description: '콘솔 클리어',
      combo: 'ctrl+shift+k',
      id: 'clearConsole',
      handler: handlers.clearConsole || (() => {}),
    },
    {
      description: '뒤로가기',
      combo: 'alt+left',
      id: 'goBack',
      handler: handlers.goBack || (() => {}),
    },
    {
      description: '앞으로가기',
      combo: 'alt+right',
      id: 'goForward',
      handler: handlers.goForward || (() => {}),
    },
    {
      description: '왼쪽 사이드바 토글 (Ctrl+Left)',
      combo: 'ctrl+left',
      id: 'toggleLeftSidebarCtrlLeft',
      handler: handlers.toggleLeftSidebarCtrlLeft || (() => {}),
    },
    {
      description: '오른쪽 사이드 패널 토글 (Ctrl+Right)',
      combo: 'ctrl+right',
      id: 'toggleRightSidebarCtrlRight',
      handler: handlers.toggleRightSidebarCtrlRight || (() => {}),
    },
    {
      description: '우측 사이드바 모드 전환 (Push ↔ Overlay)',
      combo: 'ctrl+shift+m',
      id: 'toggleRightSidebarMode',
      handler: handlers.toggleRightSidebarMode || (() => {}),
    },
  ]
}

export function useGlobalShortcuts() {
  /**
   * 단축키 등록
   *
   * @param {string} shortcutId - 단축키 고유 ID
   * @param {Object} config - 단축키 설정
   * @param {string} config.key - 키 (예: 'b', ']', 'Escape')
   * @param {boolean} config.ctrlKey - Ctrl 키 필요 여부
   * @param {boolean} config.metaKey - Cmd 키 필요 여부 (Mac)
   * @param {boolean} config.shiftKey - Shift 키 필요 여부 (선택사항)
   * @param {boolean} config.altKey - Alt 키 필요 여부 (선택사항)
   * @param {Function} config.handler - 단축키 실행 핸들러
   * @param {string} config.description - 단축키 설명 (설정 UI용)
   * @param {boolean} config.enabled - 단축키 활성화 여부 (기본값: true)
   */
  function registerShortcut(shortcutId, config) {
    // 키 조합 문자열이 있으면 파싱
    const parsedConfig = config.combo ? { ...config, ...parseKeyCombo(config.combo) } : config

    if ((!parsedConfig.key && !config.combo) || !parsedConfig.handler) {
      console.warn(`[useGlobalShortcuts] 단축키 등록 실패: ${shortcutId} - key(또는 combo)와 handler가 필요합니다`)
      return
    }

    // 기본 설정 저장 (combo가 있으면 파싱된 값 사용)
    const defaultSetting = parsedConfig.combo
      ? {
          combo: parsedConfig.combo,
          key: parsedConfig.key,
          ctrlKey: parsedConfig.ctrlKey || false,
          metaKey: parsedConfig.metaKey || false,
          shiftKey: parsedConfig.shiftKey || false,
          altKey: parsedConfig.altKey || false,
          enabled: parsedConfig.enabled !== undefined ? parsedConfig.enabled : true,
          description: parsedConfig.description || '',
        }
      : {
          key: parsedConfig.key,
          ctrlKey: parsedConfig.ctrlKey || false,
          metaKey: parsedConfig.metaKey || false,
          shiftKey: parsedConfig.shiftKey || false,
          altKey: parsedConfig.altKey || false,
          enabled: parsedConfig.enabled !== undefined ? parsedConfig.enabled : true,
          description: parsedConfig.description || '',
        }

    // localStorage에 저장된 설정이 없으면 기본 설정 저장
    if (!getShortcutSetting(shortcutId)) {
      updateShortcutSetting(shortcutId, defaultSetting)
    }

    // 레지스트리에 등록
    shortcutRegistry.set(shortcutId, {
      id: shortcutId,
      ...parsedConfig,
    })
  }

  /**
   * 단축키 해제
   *
   * @param {string} shortcutId - 단축키 고유 ID
   */
  function unregisterShortcut(shortcutId) {
    shortcutRegistry.delete(shortcutId)
  }

  /**
   * 단축키 설정 업데이트
   *
   * @param {string} shortcutId - 단축키 고유 ID
   * @param {Object} newSetting - 새로운 설정
   */
  function updateShortcut(shortcutId, newSetting) {
    updateShortcutSetting(shortcutId, {
      ...getShortcutSetting(shortcutId),
      ...newSetting,
    })
  }

  /**
   * 단축키 활성화/비활성화
   *
   * @param {string} shortcutId - 단축키 고유 ID
   * @param {boolean} enabled - 활성화 여부
   */
  function setShortcutEnabled(shortcutId, enabled) {
    updateShortcut(shortcutId, { enabled })
  }

  /**
   * 단축키 배열로 일괄 등록
   *
   * @param {Array} shortcuts - 단축키 배열
   */
  function registerShortcuts(shortcuts) {
    if (!Array.isArray(shortcuts)) {
      console.warn('[useGlobalShortcuts] registerShortcuts: 배열이 필요합니다')
      return
    }

    shortcuts.forEach((shortcut) => {
      if (!shortcut.id) {
        console.warn('[useGlobalShortcuts] registerShortcuts: 단축키에 id가 필요합니다', shortcut)
        return
      }
      registerShortcut(shortcut.id, shortcut)
    })
  }

  /**
   * 기본 단축키를 localStorage와 동기화
   * 코드에서 기본 단축키가 변경되었을 때 자동으로 반영
   */
  function syncDefaultShortcutsWithStorage() {
    // 설정이 로드되지 않았다면 로드
    if (Object.keys(shortcutSettings.value).length === 0) {
      loadShortcutSettings()
    }

    // 기본 단축키 목록 가져오기 (handler 없이)
    const defaultShortcutsList = getDefaultShortcuts({})
    const defaultShortcutIds = new Set(defaultShortcutsList.map((s) => s.id))

    // localStorage에서 삭제된 기본 단축키 제거 (커스텀 단축키는 유지)
    const savedSettings = shortcutSettings.value
    let hasChanges = false
    for (const shortcutId of Object.keys(savedSettings)) {
      // 기본 단축키이지만 더 이상 기본 목록에 없는 경우 제거
      if (!shortcutId.startsWith('custom_') && !defaultShortcutIds.has(shortcutId)) {
        delete shortcutSettings.value[shortcutId]
        hasChanges = true
      }
    }
    if (hasChanges) {
      saveShortcutSettings()
    }

    // 기본 단축키들을 localStorage에 동기화
    // - 없는 경우: 기본값으로 저장
    // - 있는 경우: combo 또는 description이 변경되었으면 기본값으로 업데이트 (코드 변경 반영)
    for (const defaultShortcut of defaultShortcutsList) {
      const existingSetting = getShortcutSetting(defaultShortcut.id)
      const parsedCombo = parseKeyCombo(defaultShortcut.combo)
      const defaultSetting = {
        combo: defaultShortcut.combo,
        key: parsedCombo.key,
        ctrlKey: parsedCombo.ctrlKey || false,
        metaKey: parsedCombo.metaKey || false,
        shiftKey: parsedCombo.shiftKey || false,
        altKey: parsedCombo.altKey || false,
        enabled: true,
        description: defaultShortcut.description || defaultShortcut.id,
      }

      if (!existingSetting) {
        // 없는 경우: 기본값으로 저장
        updateShortcutSetting(defaultShortcut.id, defaultSetting)
      } else if (existingSetting.combo !== defaultShortcut.combo) {
        // combo가 변경되었으면 기본값으로 업데이트 (코드 변경 반영)
        updateShortcutSetting(defaultShortcut.id, {
          ...defaultSetting,
          enabled: existingSetting.enabled !== undefined ? existingSetting.enabled : true,
        })
      } else if (existingSetting.description !== defaultShortcut.description) {
        // combo는 같지만 description이 변경되었을 수 있으므로 업데이트 (코드 변경 반영)
        updateShortcutSetting(defaultShortcut.id, {
          ...defaultSetting,
          enabled: existingSetting.enabled !== undefined ? existingSetting.enabled : true,
        })
      }
      // combo와 description이 모두 같으면 업데이트하지 않음 (사용자 설정 유지)
    }
  }

  /**
   * 등록된 단축키 목록 가져오기
   * localStorage에 저장된 단축키도 포함하여 반환
   */
  function getRegisteredShortcuts() {
    // 기본 단축키 동기화
    syncDefaultShortcutsWithStorage()

    // localStorage에 저장된 모든 단축키 설정 가져오기 (정리 후)
    const cleanedSettings = shortcutSettings.value

    // localStorage에 저장된 모든 단축키를 레지스트리에 자동 등록
    for (const [shortcutId, setting] of Object.entries(cleanedSettings)) {
      // 레지스트리에 없는 경우 자동 등록
      if (!shortcutRegistry.has(shortcutId)) {
        // 커스텀 단축키인 경우
        if (shortcutId.startsWith('custom_')) {
          registerShortcut(shortcutId, {
            combo: setting.combo,
            description: setting.description || shortcutId,
            enabled: setting.enabled !== undefined ? setting.enabled : true,
            handler: () => {
              console.log(`[useGlobalShortcuts] 커스텀 단축키 실행: ${shortcutId}`)
            },
          })
        } else {
          // 기본 단축키인 경우 - handler는 나중에 주입되므로 빈 함수로 등록
          // 실제 handler는 MainLayout에서 등록될 때 업데이트됨
          registerShortcut(shortcutId, {
            combo: setting.combo,
            key: setting.key,
            ctrlKey: setting.ctrlKey,
            metaKey: setting.metaKey,
            shiftKey: setting.shiftKey,
            altKey: setting.altKey,
            description: setting.description || shortcutId,
            enabled: setting.enabled !== undefined ? setting.enabled : true,
            handler: () => {
              console.log(`[useGlobalShortcuts] 기본 단축키 실행: ${shortcutId} (handler가 아직 주입되지 않음)`)
            },
          })
        }
      }
    }

    // 메모리에 등록된 단축키
    const registeredShortcuts = Array.from(shortcutRegistry.entries()).map(([id, config]) => ({
      id,
      ...config,
      setting: getShortcutSetting(id),
    }))

    return registeredShortcuts
  }

  /**
   * 단축키 핸들러 가져오기
   * @param {string} shortcutId - 단축키 ID
   * @returns {Function|null} 핸들러 함수 또는 null
   */
  function getShortcutHandler(shortcutId) {
    const shortcutConfig = shortcutRegistry.get(shortcutId)
    return shortcutConfig?.handler || null
  }

  /**
   * 전역 단축키 활성화
   */
  function setupGlobalShortcuts() {
    if (isGlobalShortcutsActive) {
      return // 이미 활성화됨
    }

    // 설정 로드
    loadShortcutSettings()

    // 기본 단축키 동기화 (코드 변경 반영)
    syncDefaultShortcutsWithStorage()

    // localStorage에 저장된 커스텀 단축키를 레지스트리에 다시 등록
    const savedSettings = shortcutSettings.value
    for (const [shortcutId, setting] of Object.entries(savedSettings)) {
      // 레지스트리에 없고, 커스텀 단축키인 경우 (custom_ 접두사)
      if (!shortcutRegistry.has(shortcutId) && shortcutId.startsWith('custom_')) {
        // 기본 핸들러로 등록 (실제 기능은 나중에 설정 가능)
        registerShortcut(shortcutId, {
          combo: setting.combo,
          description: setting.description || shortcutId,
          enabled: setting.enabled !== undefined ? setting.enabled : true,
          handler: () => {
            console.log(`[useGlobalShortcuts] 커스텀 단축키 실행: ${shortcutId}`)
          },
        })
      }
    }

    // 전역 이벤트 핸들러 생성
    globalKeyDownHandler = createGlobalKeyDownHandler()
    window.addEventListener('keydown', globalKeyDownHandler)

    isGlobalShortcutsActive = true
  }

  /**
   * 전역 단축키 비활성화
   */
  function cleanupGlobalShortcuts() {
    if (!isGlobalShortcutsActive) {
      return
    }

    if (globalKeyDownHandler) {
      window.removeEventListener('keydown', globalKeyDownHandler)
      globalKeyDownHandler = null
    }

    isGlobalShortcutsActive = false
  }

  /**
   * 카테고리별로 정리된 단축키 반환
   * @param {Array} shortcuts - 정렬할 단축키 배열 (getRegisteredShortcuts() 결과)
   * @returns {Array} 카테고리별로 정리된 단축키 배열
   */
  function getCategorizedShortcuts(shortcuts = []) {
    const categorized = []

    // 각 카테고리에 해당하는 단축키 찾기
    SHORTCUT_CATEGORIES.forEach((category) => {
      const categoryShortcuts = []

      if (category.name === 'custom') {
        // 사용자 정의 단축키는 custom_로 시작하는 것들
        shortcuts.forEach((shortcut) => {
          if (shortcut.id.startsWith('custom_')) {
            categoryShortcuts.push(shortcut)
          }
        })
      } else {
        // 다른 카테고리는 ids로 매칭
        category.ids.forEach((id) => {
          const shortcut = shortcuts.find((s) => s.id === id)
          if (shortcut) {
            categoryShortcuts.push(shortcut)
          }
        })
      }

      // 단축키가 있는 카테고리만 추가
      if (categoryShortcuts.length > 0) {
        categorized.push({
          ...category,
          shortcuts: categoryShortcuts,
        })
      }
    })

    return categorized
  }

  return {
    // 단축키 관리
    registerShortcut,
    registerShortcuts, // 배열로 일괄 등록
    unregisterShortcut,
    updateShortcut,
    setShortcutEnabled,
    getRegisteredShortcuts,
    getShortcutHandler,

    // 전역 단축키 활성화/비활성화
    setupGlobalShortcuts,
    cleanupGlobalShortcuts,

    // 설정 관리
    getShortcutSetting,
    loadShortcutSettings,
    saveShortcutSettings,

    // 카테고리 관리
    getCategorizedShortcuts,
  }
}
