/**
 * 뷰 모드 설정 파일
 * @description 뷰 모드 설정 파일
 * @version 1.0.0
 * @since 2025-12-06
 */

// 뷰 모드 타입
export const VIEW_MODES = {
  TABLE: 'table',
  CARD: 'card',
  LIST: 'list',
  GALLERY: 'gallery',
  TIMELINE: 'timeline',
  CHART: 'chart',
}

// 뷰 모드 라벨 매핑
export const VIEW_MODE_LABELS = {
  [VIEW_MODES.TABLE]: '테이블 뷰',
  [VIEW_MODES.CARD]: '카드 뷰',
  [VIEW_MODES.LIST]: '리스트 뷰',
  [VIEW_MODES.GALLERY]: '갤러리 뷰',
  [VIEW_MODES.TIMELINE]: '타임라인 뷰',
  [VIEW_MODES.CHART]: '차트 뷰',
}
// 뷰 모드 아이콘 매핑
export const VIEW_MODE_ICONS = {
  [VIEW_MODES.TABLE]: 'table_chart',
  [VIEW_MODES.CARD]: 'view_module',
  [VIEW_MODES.LIST]: 'view_list',
  [VIEW_MODES.GALLERY]: 'collections',
  [VIEW_MODES.TIMELINE]: 'schedule',
  [VIEW_MODES.CHART]: 'show_chart',
}

// 뷰 모드 순서
export const VIEW_MODE_ORDER = [VIEW_MODES.TABLE, VIEW_MODES.CARD, VIEW_MODES.LIST, VIEW_MODES.GALLERY, VIEW_MODES.TIMELINE, VIEW_MODES.CHART]

export const VIEW_MODE_OPTIONS = VIEW_MODE_ORDER.map((mode) => {
  const disabledModes = []

  return {
    value: mode,
    label: VIEW_MODE_LABELS[mode],
    icon: VIEW_MODE_ICONS[mode],
    enabled: !disabledModes.includes(mode),
  }
})

// 사이드바 네비게이션 설정
export const defaultSidebarNavigationSettings = {
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
// 테이블 뷰 설정
export const defaultTableViewSettings = {
  visibleColumns: [],
  columnOrder: [],
  columnWidths: {},
  stickyColumns: {
    left: [],
    right: [],
  },
  defaultSort: {
    column: null,
    direction: 'asc',
  },
  rowsPerPageOptions: [10, 25, 50, 100],
  sidebarNavigation: {
    ...defaultSidebarNavigationSettings,
    hoverView: {
      maxRegularFileImages: 1,
      maxEditorImages: 1,
    },
  },
}

// 카드 뷰 설정
export const defaultCardViewSettings = {
  cardSize: 'medium',
  gridColNum: 24,
  cardMaxWidth: 250,
  cardMinWidth: 200,
  cardMinHeight: 200,
  cardMaxHeight: 400,
  visibleFields: [],
  showImage: true,
  imagePosition: 'top',
  cardStyle: {
    backgroundColor: null,
    border: true,
    shadow: true,
  },
  rowsPerPageOptions: [10, 25, 50, 100],
  sidebarNavigation: {
    ...defaultSidebarNavigationSettings,
    hoverView: {
      maxRegularFileImages: 1,
      maxEditorImages: 1,
    },
  },
}

// 리스트 뷰 설정
export const defaultListViewSettings = {
  visibleFields: [],
  fieldOrder: [],
  rowSpacing: 'normal',
  fontSize: 'medium',
  expandMode: 'expanded',
  rowsPerPageOptions: [10, 25, 50, 100],
  sidebarNavigation: {
    ...defaultSidebarNavigationSettings,
    hoverView: {
      maxRegularFileImages: 1,
      maxEditorImages: 1,
    },
  },
}

// 갤러리 뷰 설정
export const defaultGalleryViewSettings = {
  thumbnailSize: 'medium',
  gridColumns: 4,
  imageAspectRatio: '1:1',
  showHoverInfo: true,
  hoverInfoFields: [],
  sidebarNavigation: {
    ...defaultSidebarNavigationSettings,
    hoverView: {
      maxRegularFileImages: 2,
      maxEditorImages: 2,
    },
  },
}

// 타임라인 뷰 설정
export const defaultTimelineViewSettings = {
  timeUnit: 'day',
  visibleFields: [],
  eventStyle: {
    color: null,
    icon: null,
  },
  sidebarNavigation: {
    ...defaultSidebarNavigationSettings,
    hoverView: {
      maxRegularFileImages: 1,
      maxEditorImages: 1,
    },
  },
}

// 차트 뷰 설정
export const defaultChartViewSettings = {
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
  interaction: {
    tooltip: true,
    hover: true,
    click: true,
  },
  layers: [],
  sidebarNavigation: {
    ...defaultSidebarNavigationSettings,
    hoverView: {
      maxRegularFileImages: 0,
      maxEditorImages: 0,
    },
  },
}

// 뷰 모드 설정
export const defaultViewModeSettings = {
  [VIEW_MODES.TABLE]: defaultTableViewSettings,
  [VIEW_MODES.CARD]: defaultCardViewSettings,
  [VIEW_MODES.LIST]: defaultListViewSettings,
  [VIEW_MODES.GALLERY]: defaultGalleryViewSettings,
  [VIEW_MODES.TIMELINE]: defaultTimelineViewSettings,
  [VIEW_MODES.CHART]: defaultChartViewSettings,
}

// 뷰 모드 설정 로드
export function loadViewModeSettings(storageKey, viewMode) {
  try {
    let stored = localStorage.getItem(storageKey)
    
    // 새 키에 없으면 구형 키에서 확인 (하위 호환성)
    if (!stored && storageKey.startsWith('part-classes-view-mode-settings')) {
      const oldKey = storageKey.replace('part-classes-view-mode-settings', 'NEXA-part-classes-view-mode-settings')
      stored = localStorage.getItem(oldKey)
      // 구형 키에서 찾았으면 새 키로 마이그레이션
      if (stored) {
        localStorage.setItem(storageKey, stored)
        localStorage.removeItem(oldKey)
      }
    }
    
    if (stored) {
      const allSettings = JSON.parse(stored)
      return allSettings[viewMode] || defaultViewModeSettings[viewMode]
    }
  } catch (error) {
    console.error('뷰 모드 설정 로드 실패:', error)
  }
  return defaultViewModeSettings[viewMode]
}

// 뷰 모드 설정 저장
export function saveViewModeSettings(storageKey, viewMode, settings) {
  try {
    let stored = localStorage.getItem(storageKey)
    
    // 새 키에 없으면 구형 키에서 확인 (하위 호환성)
    if (!stored && storageKey.startsWith('part-classes-view-mode-settings')) {
      const oldKey = storageKey.replace('part-classes-view-mode-settings', 'NEXA-part-classes-view-mode-settings')
      stored = localStorage.getItem(oldKey)
      // 구형 키에서 찾았으면 새 키로 마이그레이션
      if (stored) {
        localStorage.setItem(storageKey, stored)
        localStorage.removeItem(oldKey)
      }
    }
    
    let allSettings = {}
    if (stored) {
      allSettings = JSON.parse(stored)
    }
    allSettings[viewMode] = settings
    localStorage.setItem(storageKey, JSON.stringify(allSettings))
    
    // 구형 키 제거 (마이그레이션)
    if (storageKey.startsWith('part-classes-view-mode-settings')) {
      const oldKey = storageKey.replace('part-classes-view-mode-settings', 'NEXA-part-classes-view-mode-settings')
      if (localStorage.getItem(oldKey)) {
        localStorage.removeItem(oldKey)
      }
    }
  } catch (error) {
    console.error('뷰 모드 설정 저장 실패:', error)
  }
}

// 뷰 모드 설정 초기화
export function resetViewModeSettings(storageKey, viewMode) {
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const allSettings = JSON.parse(stored)
      allSettings[viewMode] = defaultViewModeSettings[viewMode]
      localStorage.setItem(storageKey, JSON.stringify(allSettings))
    }
  } catch (error) {
    console.error('뷰 모드 설정 초기화 실패:', error)
  }
}

// 뷰 모드 라벨 가져오기
export function getViewModeLabel(viewMode) {
  return VIEW_MODE_LABELS[viewMode] || '알 수 없는 뷰'
}

// 사이드바 네비게이션 설정 가져오기
export function getSidebarNavigationSettings(viewSettings) {
  if (!viewSettings || !viewSettings.sidebarNavigation) {
    return { ...defaultSidebarNavigationSettings }
  }
  return {
    ...defaultSidebarNavigationSettings,
    ...viewSettings.sidebarNavigation,
  }
}
