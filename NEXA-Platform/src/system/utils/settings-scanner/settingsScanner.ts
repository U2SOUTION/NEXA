/**
 * 설정 스캐너 유틸리티
 *
 * 시스템의 모든 설정을 스캔하고 분류하는 유틸리티
 * - config/ 폴더의 설정 파일들
 * - localStorage에 저장된 설정들
 * - 기타 설정 파일들
 *
 * @see [NEXA-PLATFORM-TS-01] §9.3.1 - 경로 주입으로 domains/frame/engines 타입 의존성 분리
 */

export interface ScannedConfigItem {
  id: string
  name: string
  path: string
  category: string
  type: string
  data: unknown
  size: number
  lastModified: string
}

export interface ConfigModuleEntry {
  path: string
  name: string
}

/** 기본 스캔 대상 모듈 경로 (변수 사용으로 TS가 동적 import를 해석하지 않음 → domains/frame/engines 의존성 분리) */
const DEFAULT_CONFIG_ENTRIES: ConfigModuleEntry[] = [
  { path: '@system/config/devGuideConfig', name: 'devGuideConfig' },
  { path: '@system/config/documentConfig', name: 'documentConfig' },
  { path: '@frame/registry/domainRegistry', name: 'domainRegistry' },
  { path: '@system/config/componentTaxonomy', name: 'componentTaxonomy' },
  { path: '@system/config/componentCategories', name: 'componentCategories' },
  { path: '@system/config/fileTypes', name: 'fileTypes' },
  { path: '@system/config/url-state/urlStateConfig', name: 'urlStateConfig' },
  { path: '@engines/diagram/config/diagramSettings', name: 'diagramSettings' },
  { path: '@domains/parts/components/config/viewModeSettings', name: 'viewModeSettings' },
]

/**
 * Config 폴더의 모든 설정 파일 스캔
 * @param entries - 스캔할 모듈 목록 (미지정 시 기본 목록 사용)
 * @returns 설정 파일 정보 배열
 */
export async function scanConfigFiles(entries?: ConfigModuleEntry[]): Promise<ScannedConfigItem[]> {
  const configFiles: ScannedConfigItem[] = []
  const list = entries ?? DEFAULT_CONFIG_ENTRIES

  try {
    const configModules = await Promise.allSettled(
      list.map(({ path: specifier, name }) =>
        // specifier를 변수로 사용 → TypeScript가 모듈을 해석하지 않아 domains/frame/engines 의존성 분리
        import(/* @vite-ignore */ specifier).then((m: { default?: unknown }) => ({
          name,
          path: specifier,
          module: m,
        })),
      ),
    )

    configModules.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { name, path, module } = result.value
        const configData = extractConfigData(module.default ?? module)

        configFiles.push({
          id: name,
          name,
          path,
          category: 'config',
          type: 'config-file',
          data: configData,
          size: JSON.stringify(configData).length,
          lastModified: new Date().toISOString(),
        })
      } else {
        console.warn('[SettingsScanner] Config 파일 로드 실패:', result.reason)
      }
    })
  } catch (error) {
    console.error('[SettingsScanner] Config 파일 스캔 오류:', error)
  }

  return configFiles
}

type ExtractResult = unknown

function extractConfigData(
  obj: unknown,
  visited = new WeakSet<object>(),
  depth = 0,
): ExtractResult {
  if (depth > 5) return '[너무 깊은 중첩]'
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj
  if (visited.has(obj as object)) return '[순환 참조]'

  visited.add(obj as object)

  if (Array.isArray(obj)) {
    return obj.slice(0, 10).map((item) => extractConfigData(item, visited, depth + 1))
  }

  const result: Record<string, ExtractResult> = {}
  const keys = Object.keys(obj as object).slice(0, 20)

  for (const key of keys) {
    try {
      result[key] = extractConfigData((obj as Record<string, unknown>)[key], visited, depth + 1)
    } catch {
      result[key] = '[추출 실패]'
    }
  }

  return result
}

export interface ScannedLocalStorageItem {
  id: string
  name: string
  path: string
  category: string
  type: string
  data: unknown
  rawValue: string | null
  size: number
  parseError: string | null
  lastModified: string
}

export function scanLocalStorageSettings(): ScannedLocalStorageItem[] {
  const settings: ScannedLocalStorageItem[] = []

  try {
    const keys = Object.keys(localStorage)

    keys.forEach((key) => {
      try {
        const value = localStorage.getItem(key)
        const strValue = value ?? ''
        let parsedValue: unknown = null
        let parseError: string | null = null

        try {
          parsedValue = JSON.parse(strValue)
        } catch {
          parsedValue = value
          parseError = 'JSON이 아님'
        }

        if (isSettingKey(key)) {
          settings.push({
            id: key,
            name: key,
            path: 'localStorage',
            category: getCategoryFromKey(key),
            type: 'localStorage',
            data: parsedValue,
            rawValue: value,
            size: new Blob([strValue]).size,
            parseError,
            lastModified: new Date().toISOString(),
          })
        }
      } catch (err) {
        console.warn(`[SettingsScanner] localStorage 키 "${key}" 처리 실패:`, err)
      }
    })
  } catch (error) {
    console.error('[SettingsScanner] localStorage 스캔 오류:', error)
  }

  return settings
}

function isSettingKey(key: string): boolean {
  const settingPrefixes = ['dev-', 'user', 'Part-', 'Board-', 'Mermaid-', 'Theme-', 'Error-', 'Performance-', 'Document-']

  return settingPrefixes.some((prefix) => key.startsWith(prefix) || key.toLowerCase().includes('setting') || key.toLowerCase().includes('config'))
}

function getCategoryFromKey(key: string): string {
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

export interface ScannedSystemItem {
  id: string
  name: string
  path: string
  category: string
  type: string
  data: unknown
  size: number
  lastModified: string
}

export async function scanSystemSettings(): Promise<ScannedSystemItem[]> {
  const systemSettings: ScannedSystemItem[] = []

  try {
    const systemModule = await import('@system/settings/system')
    const systemData = extractConfigData(
      (systemModule as { systemSettings?: unknown; default?: unknown }).systemSettings ??
        (systemModule as { default?: unknown }).default,
    )

    systemSettings.push({
      id: 'system-settings',
      name: 'systemSettings',
      path: '@system/settings/system',
      category: '시스템',
      type: 'system-config',
      data: systemData,
      size: JSON.stringify(systemData).length,
      lastModified: new Date().toISOString(),
    })
  } catch (err) {
    console.warn('[SettingsScanner] 시스템 설정 로드 실패:', err)
  }

  return systemSettings
}

export type ScannedSetting = ScannedConfigItem | ScannedLocalStorageItem | ScannedSystemItem

export interface ScanStatistics {
  totalCount: number
  totalSize: number
  categoryStats: Record<string, { count: number; size: number }>
  configFilesCount: number
  localStorageCount: number
  systemSettingsCount: number
}

export interface ScanAllSettingsResult {
  configFiles: ScannedConfigItem[]
  localStorageSettings: ScannedLocalStorageItem[]
  systemSettings: ScannedSystemItem[]
  statistics: ScanStatistics
}

export async function scanAllSettings(): Promise<ScanAllSettingsResult> {
  const [configFiles, localStorageSettings, systemSettings] = await Promise.all([
    scanConfigFiles(),
    Promise.resolve(scanLocalStorageSettings()),
    scanSystemSettings(),
  ])

  const allItems = [...configFiles, ...localStorageSettings, ...systemSettings]
  const totalCount = allItems.length
  const totalSize = allItems.reduce((sum, item) => sum + (item.size ?? 0), 0)

  const categoryStats: Record<string, { count: number; size: number }> = {}
  allItems.forEach((item) => {
    const category = item.category ?? '기타'
    if (!categoryStats[category]) {
      categoryStats[category] = { count: 0, size: 0 }
    }
    categoryStats[category].count++
    categoryStats[category].size += item.size ?? 0
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

export function searchSettings(allSettings: ScannedSetting[], query: string): ScannedSetting[] {
  if (!query || query.trim() === '') return allSettings

  const lowerQuery = query.toLowerCase()
  return allSettings.filter((setting) => {
    const name = (setting.name ?? '').toLowerCase()
    const path = (setting.path ?? '').toLowerCase()
    const category = (setting.category ?? '').toLowerCase()
    const dataStr = JSON.stringify(setting.data ?? '').toLowerCase()
    return (
      name.includes(lowerQuery) ||
      path.includes(lowerQuery) ||
      category.includes(lowerQuery) ||
      dataStr.includes(lowerQuery)
    )
  })
}

export interface FilterOptions {
  category?: string
  type?: string
}

export function filterSettings(
  allSettings: ScannedSetting[],
  filters: FilterOptions,
): ScannedSetting[] {
  let filtered = [...allSettings]

  if (filters.category) {
    filtered = filtered.filter((s) => s.category === filters.category)
  }
  if (filters.type) {
    filtered = filtered.filter((s) => s.type === filters.type)
  }

  return filtered
}
