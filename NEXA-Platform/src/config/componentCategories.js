/**
 * 컴포넌트 카테고리 정의 (수동 분류)
 *
 * NEXA 시스템의 중요한 모듈을 기준으로 컴포넌트를 논리적으로 분류
 * - 카테고리 타입 정의와 한글명 매핑 분리
 * - 추가/삭제가 쉬운 구조
 * - 디렉토리 구조와 무관한 논리적 분류
 *
 * 구조:
 * 1. CATEGORY_TYPES: 카테고리 타입 정의 (ID, 아이콘, 설명)
 * 2. CATEGORY_DISPLAY_NAMES: 한글명 매핑
 * 3. CATEGORY_STRUCTURE: 카테고리 계층 구조
 * 4. PATH_MAPPING_RULES: 경로 기반 자동 매핑 규칙
 */

// ============================================================================
// 1. 카테고리 타입 정의 (카테고리 ID, 아이콘, 설명)
// ============================================================================

export const CATEGORY_TYPES = {
  // UI 컴포넌트
  UI: {
    id: 'ui',
    icon: 'widgets',
    description: '기본 UI 컴포넌트',
  },
  UI_BASIC: {
    id: 'ui-basic',
    icon: 'widgets',
    description: '기본 UI 컴포넌트',
  },
  UI_ADVANCED: {
    id: 'ui-advanced',
    icon: 'dashboard',
    description: '고급 UI 컴포넌트',
  },

  // 폼 컴포넌트
  FORM: {
    id: 'form',
    icon: 'edit',
    description: '입력 폼 관련 컴포넌트',
  },

  // 레이아웃
  LAYOUT: {
    id: 'layout',
    icon: 'view_quilt',
    description: '레이아웃 관련 컴포넌트',
  },
  LAYOUT_SIDEBARS: {
    id: 'layout-sidebars',
    icon: 'menu',
    description: '사이드바 컴포넌트',
  },
  LAYOUT_PANELS: {
    id: 'layout-panels',
    icon: 'dashboard',
    description: '패널 컴포넌트',
  },

  // 부품 관리 시스템
  PARTS_MANAGEMENT: {
    id: 'parts-management',
    icon: 'inventory_2',
    description: '부품 관리 시스템 컴포넌트',
  },
  PARTS_MANAGEMENT_CLASSES: {
    id: 'parts-management-classes',
    icon: 'category',
    description: '부품 분류 관리',
  },
  PARTS_MANAGEMENT_MODELS: {
    id: 'parts-management-models',
    icon: 'precision_manufacturing',
    description: '부품 모델 관리',
  },
  PARTS_MANAGEMENT_INVENTORY: {
    id: 'parts-management-inventory',
    icon: 'warehouse',
    description: '재고 관리',
  },

  // 디바이스 관리 시스템
  DEVICE_MANAGEMENT: {
    id: 'device-management',
    icon: 'devices',
    description: '디바이스 관리 시스템 컴포넌트',
  },
  DEVICE_MANAGEMENT_LIST: {
    id: 'device-management-list',
    icon: 'list',
    description: '디바이스 목록',
  },
  DEVICE_MANAGEMENT_DETAIL: {
    id: 'device-management-detail',
    icon: 'info',
    description: '디바이스 상세',
  },

  // 대시보드/넥사보드
  DASHBOARD: {
    id: 'dashboard',
    icon: 'dashboard',
    description: '대시보드 컴포넌트',
  },
  NEXA_BOARD: {
    id: 'nexa-board',
    icon: 'view_quilt',
    description: '넥사보드 컴포넌트',
  },
  NEXA_PANEL: {
    id: 'nexa-panel',
    icon: 'widgets',
    description: '넥사패널 컴포넌트',
  },

  // 다이어그램/차트
  DIAGRAM: {
    id: 'diagram',
    icon: 'account_tree',
    description: '다이어그램 컴포넌트',
  },
  CHART: {
    id: 'chart',
    icon: 'bar_chart',
    description: '차트 컴포넌트',
  },

  // 개발 도구
  DEV_TOOLS: {
    id: 'dev-tools',
    icon: 'build',
    description: '개발 도구',
  },
  DEV_TOOLS_DOCUMENT_MANAGER: {
    id: 'dev-tools-document-manager',
    icon: 'description',
    description: '문서 관리',
  },
  DEV_TOOLS_COMPONENT_LIBRARY: {
    id: 'dev-tools-component-library',
    icon: 'widgets',
    description: '컴포넌트 라이브러리',
  },
  DEV_TOOLS_DATABASE_VIEWER: {
    id: 'dev-tools-database-viewer',
    icon: 'storage',
    description: '데이터베이스 뷰어',
  },
  DEV_TOOLS_THEME_MANAGER: {
    id: 'dev-tools-theme-manager',
    icon: 'palette',
    description: '테마 관리',
  },

  // 모달/다이얼로그
  MODAL: {
    id: 'modal',
    icon: 'window',
    description: '모달/다이얼로그 컴포넌트',
  },

  // 설정
  SETTINGS: {
    id: 'settings',
    icon: 'settings',
    description: '설정 컴포넌트',
  },
}

// ============================================================================
// 2. 한글명 매핑 (추가/삭제가 쉬운 구조)
// ============================================================================

export const CATEGORY_DISPLAY_NAMES = {
  // UI 컴포넌트
  ui: 'UI 컴포넌트',
  'ui-basic': '기본 UI',
  'ui-advanced': '고급 UI',

  // 폼 컴포넌트
  form: '폼 컴포넌트',

  // 레이아웃
  layout: '레이아웃',
  'layout-sidebars': '사이드바',
  'layout-panels': '패널',

  // 부품 관리 시스템
  'parts-management': '부품 관리',
  'parts-management-classes': '부품 분류',
  'parts-management-models': '부품 모델',
  'parts-management-inventory': '재고 관리',

  // 디바이스 관리 시스템
  'device-management': '디바이스 관리',
  'device-management-list': '디바이스 목록',
  'device-management-detail': '디바이스 상세',

  // 대시보드/넥사보드
  dashboard: '대시보드',
  'nexa-board': '넥사보드',
  'nexa-panel': '넥사패널',

  // 다이어그램/차트
  diagram: '다이어그램',
  chart: '차트',

  // 개발 도구
  'dev-tools': '개발 도구',
  'dev-tools-document-manager': '문서 관리',
  'dev-tools-component-library': '컴포넌트 라이브러리',
  'dev-tools-database-viewer': '데이터베이스 뷰어',
  'dev-tools-theme-manager': '테마 관리',

  // 모달/다이얼로그
  modal: '모달/다이얼로그',

  // 설정
  settings: '설정',
}

// ============================================================================
// 3. 카테고리 계층 구조 정의
// ============================================================================

export const CATEGORY_STRUCTURE = [
  {
    type: CATEGORY_TYPES.UI,
    subcategories: [{ type: CATEGORY_TYPES.UI_BASIC }, { type: CATEGORY_TYPES.UI_ADVANCED }],
  },
  {
    type: CATEGORY_TYPES.FORM,
  },
  {
    type: CATEGORY_TYPES.LAYOUT,
    subcategories: [{ type: CATEGORY_TYPES.LAYOUT_SIDEBARS }, { type: CATEGORY_TYPES.LAYOUT_PANELS }],
  },
  {
    type: CATEGORY_TYPES.PARTS_MANAGEMENT,
    subcategories: [{ type: CATEGORY_TYPES.PARTS_MANAGEMENT_CLASSES }, { type: CATEGORY_TYPES.PARTS_MANAGEMENT_MODELS }, { type: CATEGORY_TYPES.PARTS_MANAGEMENT_INVENTORY }],
  },
  {
    type: CATEGORY_TYPES.DEVICE_MANAGEMENT,
    subcategories: [{ type: CATEGORY_TYPES.DEVICE_MANAGEMENT_LIST }, { type: CATEGORY_TYPES.DEVICE_MANAGEMENT_DETAIL }],
  },
  {
    type: CATEGORY_TYPES.DASHBOARD,
    subcategories: [{ type: CATEGORY_TYPES.NEXA_BOARD }, { type: CATEGORY_TYPES.NEXA_PANEL }],
  },
  {
    type: CATEGORY_TYPES.DIAGRAM,
  },
  {
    type: CATEGORY_TYPES.CHART,
  },
  {
    type: CATEGORY_TYPES.DEV_TOOLS,
    subcategories: [{ type: CATEGORY_TYPES.DEV_TOOLS_DOCUMENT_MANAGER }, { type: CATEGORY_TYPES.DEV_TOOLS_COMPONENT_LIBRARY }, { type: CATEGORY_TYPES.DEV_TOOLS_DATABASE_VIEWER }, { type: CATEGORY_TYPES.DEV_TOOLS_THEME_MANAGER }],
  },
  {
    type: CATEGORY_TYPES.MODAL,
  },
  {
    type: CATEGORY_TYPES.SETTINGS,
  },
]

// ============================================================================
// 4. 경로 기반 자동 매핑 규칙
// ============================================================================

export const PATH_MAPPING_RULES = [
  // UI 컴포넌트
  {
    pattern: /components\/ui\/(basic|base)/i,
    categoryId: CATEGORY_TYPES.UI_BASIC.id,
  },
  {
    pattern: /components\/ui\//i,
    categoryId: CATEGORY_TYPES.UI.id,
  },

  // 폼 컴포넌트
  {
    pattern: /components\/form\/|form/i,
    categoryId: CATEGORY_TYPES.FORM.id,
  },

  // 레이아웃 - 사이드바
  {
    pattern: /sidebars\//i,
    categoryId: CATEGORY_TYPES.LAYOUT_SIDEBARS.id,
  },

  // 레이아웃 - 패널
  {
    pattern: /(panel|panels)\//i,
    categoryId: CATEGORY_TYPES.LAYOUT_PANELS.id,
  },

  // 부품 관리 시스템
  {
    pattern: /parts-management\/classes|part-classes/i,
    categoryId: CATEGORY_TYPES.PARTS_MANAGEMENT_CLASSES.id,
  },
  {
    pattern: /parts-management\/models|part-models/i,
    categoryId: CATEGORY_TYPES.PARTS_MANAGEMENT_MODELS.id,
  },
  {
    pattern: /parts-management\/inventory|inventory/i,
    categoryId: CATEGORY_TYPES.PARTS_MANAGEMENT_INVENTORY.id,
  },
  {
    pattern: /parts-management|parts\//i,
    categoryId: CATEGORY_TYPES.PARTS_MANAGEMENT.id,
  },

  // 디바이스 관리 시스템
  {
    pattern: /device-management\/list|devices\/list/i,
    categoryId: CATEGORY_TYPES.DEVICE_MANAGEMENT_LIST.id,
  },
  {
    pattern: /device-management\/detail|devices\/detail/i,
    categoryId: CATEGORY_TYPES.DEVICE_MANAGEMENT_DETAIL.id,
  },
  {
    pattern: /device-management|devices\//i,
    categoryId: CATEGORY_TYPES.DEVICE_MANAGEMENT.id,
  },

  // 대시보드/넥사보드
  {
    pattern: /nexa-board|dashboard\/board/i,
    categoryId: CATEGORY_TYPES.NEXA_BOARD.id,
  },
  {
    pattern: /nexa-panel|panels\/nexa/i,
    categoryId: CATEGORY_TYPES.NEXA_PANEL.id,
  },
  {
    pattern: /dashboard\//i,
    categoryId: CATEGORY_TYPES.DASHBOARD.id,
  },

  // 다이어그램
  {
    pattern: /diagram\/|diagrams\//i,
    categoryId: CATEGORY_TYPES.DIAGRAM.id,
  },

  // 차트
  {
    pattern: /chart\/|charts\//i,
    categoryId: CATEGORY_TYPES.CHART.id,
  },

  // 개발 도구
  {
    pattern: /dev-tools\/document-manager/i,
    categoryId: CATEGORY_TYPES.DEV_TOOLS_DOCUMENT_MANAGER.id,
  },
  {
    pattern: /dev-tools\/component-library/i,
    categoryId: CATEGORY_TYPES.DEV_TOOLS_COMPONENT_LIBRARY.id,
  },
  {
    pattern: /dev-tools\/database-viewer/i,
    categoryId: CATEGORY_TYPES.DEV_TOOLS_DATABASE_VIEWER.id,
  },
  {
    pattern: /dev-tools\/theme-manager/i,
    categoryId: CATEGORY_TYPES.DEV_TOOLS_THEME_MANAGER.id,
  },
  {
    pattern: /dev-tools\//i,
    categoryId: CATEGORY_TYPES.DEV_TOOLS.id,
  },

  // 모달/다이얼로그
  {
    pattern: /modal\/|modals\//i,
    categoryId: CATEGORY_TYPES.MODAL.id,
  },

  // 설정
  {
    pattern: /settings\//i,
    categoryId: CATEGORY_TYPES.SETTINGS.id,
  },
]

// ============================================================================
// 5. 카테고리 구조 빌더 (동적 생성)
// ============================================================================

/**
 * 카테고리 구조를 동적으로 생성
 * @returns {Array} 카테고리 배열 (components는 빈 배열로 초기화)
 */
export function buildCategoryStructure() {
  return CATEGORY_STRUCTURE.map((categoryDef) => {
    const category = {
      name: categoryDef.type.id,
      displayName: CATEGORY_DISPLAY_NAMES[categoryDef.type.id] || categoryDef.type.id,
      icon: categoryDef.type.icon,
      description: categoryDef.type.description,
      components: [],
      subcategories: [],
    }

    // 하위 카테고리 처리
    if (categoryDef.subcategories && categoryDef.subcategories.length > 0) {
      category.subcategories = categoryDef.subcategories.map((subDef) => ({
        name: subDef.type.id,
        displayName: CATEGORY_DISPLAY_NAMES[subDef.type.id] || subDef.type.id,
        icon: subDef.type.icon,
        description: subDef.type.description,
        components: [],
      }))
    }

    return category
  })
}

/**
 * 컴포넌트 경로를 기반으로 카테고리에 자동 매핑
 * @param {string} componentPath - 컴포넌트 경로
 * @returns {string|null} 카테고리 ID (매핑되지 않으면 null)
 */
export function mapComponentToCategory(componentPath) {
  const path = componentPath.toLowerCase()

  // 규칙을 순서대로 검사 (더 구체적인 규칙이 먼저 매칭되도록)
  for (const rule of PATH_MAPPING_RULES) {
    if (rule.pattern.test(path)) {
      return rule.categoryId
    }
  }

  return null
}

/**
 * 모든 카테고리와 하위 카테고리를 평면 배열로 반환
 * @param {Array} categories - 카테고리 배열 (기본값: 빌드된 구조)
 * @returns {Array} 모든 카테고리 (하위 포함)
 */
export function getAllCategoriesFlat(categories = null) {
  const cats = categories || buildCategoryStructure()
  const flat = []
  for (const category of cats) {
    flat.push(category)
    if (category.subcategories) {
      for (const subcategory of category.subcategories) {
        flat.push(subcategory)
      }
    }
  }
  return flat
}

/**
 * 카테고리 이름으로 카테고리 찾기 (하위 포함)
 * @param {string} categoryName - 카테고리 이름
 * @param {Array} categories - 카테고리 배열 (기본값: 빌드된 구조)
 * @returns {object|null} 카테고리 객체
 */
export function findCategoryByName(categoryName, categories = null) {
  const cats = categories || buildCategoryStructure()
  for (const category of cats) {
    if (category.name === categoryName) {
      return category
    }
    if (category.subcategories) {
      for (const subcategory of category.subcategories) {
        if (subcategory.name === categoryName) {
          return subcategory
        }
      }
    }
  }
  return null
}

/**
 * 카테고리 타입으로 카테고리 찾기
 * @param {object} categoryType - CATEGORY_TYPES의 항목
 * @param {Array} categories - 카테고리 배열 (기본값: 빌드된 구조)
 * @returns {object|null} 카테고리 객체
 */
export function findCategoryByType(categoryType, categories = null) {
  return findCategoryByName(categoryType.id, categories)
}

// ============================================================================
// 6. 기본 export (하위 호환성 유지)
// ============================================================================

/**
 * 기본 카테고리 배열 (하위 호환성)
 * @deprecated buildCategoryStructure() 사용 권장
 */
export const componentCategories = buildCategoryStructure()
