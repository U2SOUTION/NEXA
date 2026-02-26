/**
 * 뷰 모드 설정 파일
 * @description 뷰 모드 설정 파일
 * @version 1.0.0
 * @since 2025-12-06
 */

export const VIEW_MODES = {
  TABLE: 'table',
  CARD: 'card',
  LIST: 'list',
  GALLERY: 'gallery',
  TIMELINE: 'timeline',
  CHART: 'chart',
} as const

export type ViewMode = (typeof VIEW_MODES)[keyof typeof VIEW_MODES]

export const VIEW_MODE_LABELS: Record<string, string> = {
  [VIEW_MODES.TABLE]: '테이블 뷰',
  [VIEW_MODES.CARD]: '카드 뷰',
  [VIEW_MODES.LIST]: '리스트 뷰',
  [VIEW_MODES.GALLERY]: '갤러리 뷰',
  [VIEW_MODES.TIMELINE]: '타임라인 뷰',
  [VIEW_MODES.CHART]: '차트 뷰',
}

export const VIEW_MODE_ICONS: Record<string, string> = {
  [VIEW_MODES.TABLE]: 'table_chart',
  [VIEW_MODES.CARD]: 'view_module',
  [VIEW_MODES.LIST]: 'view_list',
  [VIEW_MODES.GALLERY]: 'collections',
  [VIEW_MODES.TIMELINE]: 'schedule',
  [VIEW_MODES.CHART]: 'show_chart',
}

export const VIEW_MODE_ORDER: ViewMode[] = [
  VIEW_MODES.TABLE,
  VIEW_MODES.CARD,
  VIEW_MODES.LIST,
  VIEW_MODES.GALLERY,
  VIEW_MODES.TIMELINE,
  VIEW_MODES.CHART,
]

export interface ViewModeOption {
  value: ViewMode
  label: string
  icon: string
  enabled: boolean
}

export const VIEW_MODE_OPTIONS: ViewModeOption[] = VIEW_MODE_ORDER.map(
  (mode) => {
    const disabledModes: ViewMode[] = []
    return {
      value: mode,
      label: VIEW_MODE_LABELS[mode],
      icon: VIEW_MODE_ICONS[mode],
      enabled: !disabledModes.includes(mode),
    }
  },
)

export interface SidebarNavigationHoverView {
  maxRegularFileImages: number
  maxEditorImages: number
}

export interface DefaultSidebarNavigationSettings {
  hoverDebounceTime: number
  mouseLeaveDelay: number
  enableHover: boolean
  enableClick: boolean
  enableDoubleClick: boolean
  hoverView: SidebarNavigationHoverView
}

export const defaultSidebarNavigationSettings: DefaultSidebarNavigationSettings =
  {
    hoverDebounceTime: 50,
    mouseLeaveDelay: 200,
    enableHover: true,
    enableClick: true,
    enableDoubleClick: true,
    hoverView: {
      maxRegularFileImages: 1,
      maxEditorImages: 1,
    },
  }

export interface DefaultSortSettings {
  column: string | null
  direction: 'asc' | 'desc'
}

export interface TableViewSettings {
  visibleColumns: string[]
  columnOrder: string[]
  columnWidths: Record<string, number | string>
  stickyColumns: { left: string[]; right: string[] }
  defaultSort: DefaultSortSettings
  rowsPerPageOptions: number[]
  sidebarNavigation: DefaultSidebarNavigationSettings & {
    hoverView: SidebarNavigationHoverView
  }
}

export const defaultTableViewSettings: TableViewSettings = {
  visibleColumns: [],
  columnOrder: [],
  columnWidths: {},
  stickyColumns: { left: [], right: [] },
  defaultSort: { column: null, direction: 'asc' },
  rowsPerPageOptions: [10, 25, 50, 100],
  sidebarNavigation: {
    ...defaultSidebarNavigationSettings,
    hoverView: { maxRegularFileImages: 1, maxEditorImages: 1 },
  },
}

export interface CardViewSettings {
  cardSize: string
  gridColNum: number
  cardMaxWidth: number
  cardMinWidth: number
  cardMinHeight: number
  cardMaxHeight: number
  visibleFields: string[]
  showImage: boolean
  imagePosition: string
  cardStyle: { backgroundColor: string | null; border: boolean; shadow: boolean }
  rowsPerPageOptions: number[]
  sidebarNavigation: DefaultSidebarNavigationSettings & {
    hoverView: SidebarNavigationHoverView
  }
}

export const defaultCardViewSettings: CardViewSettings = {
  cardSize: 'medium',
  gridColNum: 24,
  cardMaxWidth: 250,
  cardMinWidth: 200,
  cardMinHeight: 200,
  cardMaxHeight: 400,
  visibleFields: [],
  showImage: true,
  imagePosition: 'top',
  cardStyle: { backgroundColor: null, border: true, shadow: true },
  rowsPerPageOptions: [10, 25, 50, 100],
  sidebarNavigation: {
    ...defaultSidebarNavigationSettings,
    hoverView: { maxRegularFileImages: 1, maxEditorImages: 1 },
  },
}

export interface ListViewSettings {
  visibleFields: string[]
  fieldOrder: string[]
  rowSpacing: string
  fontSize: string
  expandMode: string
  rowsPerPageOptions: number[]
  sidebarNavigation: DefaultSidebarNavigationSettings & {
    hoverView: SidebarNavigationHoverView
  }
}

export const defaultListViewSettings: ListViewSettings = {
  visibleFields: [],
  fieldOrder: [],
  rowSpacing: 'normal',
  fontSize: 'medium',
  expandMode: 'expanded',
  rowsPerPageOptions: [10, 25, 50, 100],
  sidebarNavigation: {
    ...defaultSidebarNavigationSettings,
    hoverView: { maxRegularFileImages: 1, maxEditorImages: 1 },
  },
}

export interface GalleryViewSettings {
  thumbnailSize: string
  gridColumns: number
  imageAspectRatio: string
  showHoverInfo: boolean
  hoverInfoFields: string[]
  sidebarNavigation: DefaultSidebarNavigationSettings & {
    hoverView: SidebarNavigationHoverView
  }
}

export const defaultGalleryViewSettings: GalleryViewSettings = {
  thumbnailSize: 'medium',
  gridColumns: 4,
  imageAspectRatio: '1:1',
  showHoverInfo: true,
  hoverInfoFields: [],
  sidebarNavigation: {
    ...defaultSidebarNavigationSettings,
    hoverView: { maxRegularFileImages: 2, maxEditorImages: 2 },
  },
}

export interface TimelineViewSettings {
  timeUnit: string
  visibleFields: string[]
  eventStyle: { color: string | null; icon: string | null }
  sidebarNavigation: DefaultSidebarNavigationSettings & {
    hoverView: SidebarNavigationHoverView
  }
}

export const defaultTimelineViewSettings: TimelineViewSettings = {
  timeUnit: 'day',
  visibleFields: [],
  eventStyle: { color: null, icon: null },
  sidebarNavigation: {
    ...defaultSidebarNavigationSettings,
    hoverView: { maxRegularFileImages: 1, maxEditorImages: 1 },
  },
}

export interface ChartViewSettings {
  xAxisField: string | null
  yAxisField: string | null
  chartType: string
  chartTypes: string[]
  aggregation: string
  groupBy: string | null
  visibleFields: string[]
  chartOptions: Record<string, boolean>
  style: Record<string, number | string | null>
  interaction: Record<string, boolean>
  layers: unknown[]
  sidebarNavigation: DefaultSidebarNavigationSettings & {
    hoverView: SidebarNavigationHoverView
  }
}

export const defaultChartViewSettings: ChartViewSettings = {
  xAxisField: null,
  yAxisField: null,
  chartType: 'line',
  chartTypes: ['line'],
  aggregation: 'sum',
  groupBy: null,
  visibleFields: [],
  chartOptions: {
    showLegend: true,
    showGrid: true,
    showLabels: true,
    animation: true,
  },
  style: {
    opacity: 1,
    blur: 0,
    neonIntensity: 0,
    strokeWidth: 2,
    dotSize: 6,
    nodeSize: 4,
    color: null,
  },
  interaction: { tooltip: true, hover: true, click: true },
  layers: [],
  sidebarNavigation: {
    ...defaultSidebarNavigationSettings,
    hoverView: { maxRegularFileImages: 0, maxEditorImages: 0 },
  },
}

export type ViewModeSetting =
  | TableViewSettings
  | CardViewSettings
  | ListViewSettings
  | GalleryViewSettings
  | TimelineViewSettings
  | ChartViewSettings

export type ViewModeSettingsMap = Record<ViewMode, ViewModeSetting>

export const defaultViewModeSettings: ViewModeSettingsMap = {
  [VIEW_MODES.TABLE]: defaultTableViewSettings,
  [VIEW_MODES.CARD]: defaultCardViewSettings,
  [VIEW_MODES.LIST]: defaultListViewSettings,
  [VIEW_MODES.GALLERY]: defaultGalleryViewSettings,
  [VIEW_MODES.TIMELINE]: defaultTimelineViewSettings,
  [VIEW_MODES.CHART]: defaultChartViewSettings,
}

export function loadViewModeSettings(
  storageKey: string,
  viewMode: ViewMode,
): ViewModeSetting {
  try {
    let stored = localStorage.getItem(storageKey)
    if (!stored && storageKey.startsWith('part-classes-view-mode-settings')) {
      const oldKey = storageKey.replace(
        'part-classes-view-mode-settings',
        'NEXA-part-classes-view-mode-settings',
      )
      stored = localStorage.getItem(oldKey)
      if (stored) {
        localStorage.setItem(storageKey, stored)
        localStorage.removeItem(oldKey)
      }
    }
    if (stored) {
      const allSettings = JSON.parse(stored) as ViewModeSettingsMap
      return allSettings[viewMode] ?? defaultViewModeSettings[viewMode]
    }
  } catch (error) {
    console.error('뷰 모드 설정 로드 실패:', error)
  }
  return defaultViewModeSettings[viewMode]
}

export function saveViewModeSettings(
  storageKey: string,
  viewMode: ViewMode,
  settings: ViewModeSetting,
): void {
  try {
    let stored = localStorage.getItem(storageKey)
    if (!stored && storageKey.startsWith('part-classes-view-mode-settings')) {
      const oldKey = storageKey.replace(
        'part-classes-view-mode-settings',
        'NEXA-part-classes-view-mode-settings',
      )
      stored = localStorage.getItem(oldKey)
      if (stored) {
        localStorage.setItem(storageKey, stored)
        localStorage.removeItem(oldKey)
      }
    }
    let allSettings: Partial<ViewModeSettingsMap> = {}
    if (stored) {
      allSettings = JSON.parse(stored) as ViewModeSettingsMap
    }
    allSettings[viewMode] = settings
    localStorage.setItem(storageKey, JSON.stringify(allSettings))
    if (storageKey.startsWith('part-classes-view-mode-settings')) {
      const oldKey = storageKey.replace(
        'part-classes-view-mode-settings',
        'NEXA-part-classes-view-mode-settings',
      )
      if (localStorage.getItem(oldKey)) {
        localStorage.removeItem(oldKey)
      }
    }
  } catch (error) {
    console.error('뷰 모드 설정 저장 실패:', error)
  }
}

export function resetViewModeSettings(
  storageKey: string,
  viewMode: ViewMode,
): void {
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const allSettings = JSON.parse(stored) as ViewModeSettingsMap
      allSettings[viewMode] = defaultViewModeSettings[viewMode]
      localStorage.setItem(storageKey, JSON.stringify(allSettings))
    }
  } catch (error) {
    console.error('뷰 모드 설정 초기화 실패:', error)
  }
}

export function getViewModeLabel(viewMode: string): string {
  return VIEW_MODE_LABELS[viewMode] ?? '알 수 없는 뷰'
}

export function getSidebarNavigationSettings(
  viewSettings: { sidebarNavigation?: Partial<DefaultSidebarNavigationSettings> } | null | undefined,
): DefaultSidebarNavigationSettings {
  if (!viewSettings?.sidebarNavigation) {
    return { ...defaultSidebarNavigationSettings }
  }
  return {
    ...defaultSidebarNavigationSettings,
    ...viewSettings.sidebarNavigation,
  }
}
