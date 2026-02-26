/**
 * 설정 스캐너 유틸리티
 *
 * 시스템의 모든 설정을 스캔하고 분류하는 유틸리티
 * - config/ 폴더의 설정 파일들
 * - localStorage에 저장된 설정들
 * - 기타 설정 파일들
 */

/**
 * Config 폴더의 모든 설정 파일 스캔
 * @returns {Promise<Array>} 설정 파일 정보 배열
 */
export async function scanConfigFiles() {
  const configFiles = []

  try {
    // config/ 폴더의 파일들 (동적 import)
    const configModules = await Promise.allSettled([
      import('@system/config/devGuideConfig.js').then((m) => ({ name: 'devGuideConfig', path: '@system/config/devGuideConfig.js', module: m })),
      import('@system/config/documentConfig.js').then((m) => ({ name: 'documentConfig', path: '@system/config/documentConfig.js', module: m })),
      import('@frame/registry/domainRegistry').then((m) => ({ name: 'domainRegistry', path: 'src/frame/registry/domainRegistry', module: m })),
      import('@system/config/componentTaxonomy.js').then((m) => ({ name: 'componentTaxonomy', path: '@system/config/componentTaxonomy.js', module: m })),
      import('@system/config/componentCategories.js').then((m) => ({ name: 'componentCategories', path: '@system/config/componentCategories.js', module: m })),
      import('@system/config/fileTypes.js').then((m) => ({ name: 'fileTypes', path: '@system/config/fileTypes.js', module: m })),
      import('@system/config/url-state/urlStateConfig.js').then((m) => ({ name: 'urlStateConfig', path: '@system/config/url-state/urlStateConfig.js', module: m })),
      import('@engines/diagram/config/diagramSettings.js').then((m) => ({ name: 'diagramSettings', path: '@engines/diagram/config/diagramSettings.js', module: m })),
      import('@domains/parts/components/config/viewModeSettings.js').then((m) => ({ name: 'viewModeSettings', path: '@domains/parts/components/config/viewModeSettings.js', module: m })),
    ])

    configModules.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { name, path, module } = result.value
        const configData = extractConfigData(module.default || module)

        configFiles.push({
          id: name,
          name: name,
          path: path,
          category: 'config',
          type: 'config-file',
          data: configData,
          size: JSON.stringify(configData).length,
          lastModified: new Date().toISOString(), // 실제로는 파일 시스템에서 가져와야 함
        })
      } else {
        console.warn(`[SettingsScanner] Config 파일 로드 실패:`, result.reason)
      }
    })
  } catch (error) {
    console.error('[SettingsScanner] Config 파일 스캔 오류:', error)
  }

  return configFiles
}

/**
 * Config 데이터 추출 (순환 참조 방지)
 */
function extractConfigData(obj, visited = new WeakSet(), depth = 0) {
  if (depth > 5) return '[너무 깊은 중첩]'
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj
  if (visited.has(obj)) return '[순환 참조]'

  visited.add(obj)

  if (Array.isArray(obj)) {
    return obj.slice(0, 10).map((item) => extractConfigData(item, visited, depth + 1)) // 최대 10개만
  }

  const result = {}
  const keys = Object.keys(obj).slice(0, 20) // 최대 20개 키만

  for (const key of keys) {
    try {
      result[key] = extractConfigData(obj[key], visited, depth + 1)
    } catch {
      result[key] = '[추출 실패]'
    }
  }

  return result
}

/**
 * localStorage의 모든 설정 스캔
 * @returns {Array} localStorage 설정 정보 배열
 */
export function scanLocalStorageSettings() {
  const settings = []

  try {
    // localStorage의 모든 키 가져오기
    const keys = Object.keys(localStorage)

    keys.forEach((key) => {
      try {
        const value = localStorage.getItem(key)
        let parsedValue = null
        let parseError = null

        // JSON 파싱 시도
        try {
          parsedValue = JSON.parse(value)
        } catch {
          // JSON이 아니면 문자열로 저장
          parsedValue = value
          parseError = 'JSON이 아님'
        }

        // 설정 관련 키만 필터링 (dev-, user-, Part-, Board- 등)
        if (isSettingKey(key)) {
          settings.push({
            id: key,
            name: key,
            path: 'localStorage',
            category: getCategoryFromKey(key),
            type: 'localStorage',
            data: parsedValue,
            rawValue: value,
            size: new Blob([value]).size,
            parseError: parseError,
            lastModified: new Date().toISOString(), // localStorage는 수정 시간을 저장하지 않음
          })
        }
      } catch (error) {
        console.warn(`[SettingsScanner] localStorage 키 "${key}" 처리 실패:`, error)
      }
    })
  } catch (error) {
    console.error('[SettingsScanner] localStorage 스캔 오류:', error)
  }

  return settings
}

/**
 * 키가 설정 관련인지 확인
 */
function isSettingKey(key) {
  const settingPrefixes = ['dev-', 'user', 'Part-', 'Board-', 'Mermaid-', 'Theme-', 'Error-', 'Performance-', 'Document-']

  return settingPrefixes.some((prefix) => key.startsWith(prefix) || key.toLowerCase().includes('setting') || key.toLowerCase().includes('config'))
}

/**
 * 키에서 카테고리 추출
 */
function getCategoryFromKey(key) {
  if (key.startsWith('dev-guide-')) return '개발 가이드'
  if (key.startsWith('dev-')) return '개발 도구'
  if (key.startsWith('user')) return '사용자 설정'
  if (key.startsWith('Part-')) return '부품 관리'
  if (key.startsWith('Board-')) return '보드 메뉴'
  if (key.startsWith('Mermaid-')) return 'Mermaid 스타일'
  if (key.startsWith('Theme-')) return '테마 관리'
  if (key.startsWith('Error-')) return '에러 추적'
  if (key.startsWith('Performance-')) return '성능 모니터'
  if (key.startsWith('Document-')) return '문서 관리'

  return '기타'
}

/**
 * 시스템 설정 파일 스캔
 * @returns {Array} 시스템 설정 정보 배열
 */
export async function scanSystemSettings() {
  const systemSettings = []

  try {
    const systemModule = await import('@system/settings/system.js')
    const systemData = extractConfigData(systemModule.systemSettings || systemModule.default)

    systemSettings.push({
      id: 'system-settings',
      name: 'systemSettings',
      path: '@system/settings/system.js',
      category: '시스템',
      type: 'system-config',
      data: systemData,
      size: JSON.stringify(systemData).length,
      lastModified: new Date().toISOString(),
    })
  } catch (error) {
    console.warn('[SettingsScanner] 시스템 설정 로드 실패:', error)
  }

  return systemSettings
}

/**
 * 전체 설정 스캔
 * @returns {Promise<Object>} 모든 설정 정보
 */
export async function scanAllSettings() {
  const [configFiles, localStorageSettings, systemSettings] = await Promise.all([scanConfigFiles(), Promise.resolve(scanLocalStorageSettings()), scanSystemSettings()])

  // 통계 계산
  const totalCount = configFiles.length + localStorageSettings.length + systemSettings.length
  const totalSize = [...configFiles, ...localStorageSettings, ...systemSettings].reduce((sum, item) => sum + (item.size || 0), 0)

  // 카테고리별 통계
  const categoryStats = {}
  ;[...configFiles, ...localStorageSettings, ...systemSettings].forEach((item) => {
    const category = item.category || '기타'
    if (!categoryStats[category]) {
      categoryStats[category] = { count: 0, size: 0 }
    }
    categoryStats[category].count++
    categoryStats[category].size += item.size || 0
  })

  return {
    configFiles,
    localStorageSettings,
    systemSettings,
    statistics: {
      totalCount,
      totalSize,
      categoryStats,
      configFilesCount: configFiles.length,
      localStorageCount: localStorageSettings.length,
      systemSettingsCount: systemSettings.length,
    },
  }
}

/**
 * 설정 검색
 * @param {Array} allSettings - 모든 설정 배열
 * @param {string} query - 검색어
 * @returns {Array} 검색 결과
 */
export function searchSettings(allSettings, query) {
  if (!query || query.trim() === '') return allSettings

  const lowerQuery = query.toLowerCase()

  return allSettings.filter((setting) => {
    return setting.name.toLowerCase().includes(lowerQuery) || setting.path.toLowerCase().includes(lowerQuery) || setting.category.toLowerCase().includes(lowerQuery) || JSON.stringify(setting.data).toLowerCase().includes(lowerQuery)
  })
}

/**
 * 설정 필터링
 * @param {Array} allSettings - 모든 설정 배열
 * @param {Object} filters - 필터 옵션
 * @returns {Array} 필터링된 설정
 */
export function filterSettings(allSettings, filters) {
  let filtered = [...allSettings]

  if (filters.category) {
    filtered = filtered.filter((s) => s.category === filters.category)
  }

  if (filters.type) {
    filtered = filtered.filter((s) => s.type === filters.type)
  }

  return filtered
}
