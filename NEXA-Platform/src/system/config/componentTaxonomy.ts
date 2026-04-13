/**
 * 컴포넌트 분류 체계 (Component Taxonomy)
 *
 * 컴포넌트를 6가지 차원으로 분류하는 중앙화된 정의 파일
 * - 메뉴 생성에 사용
 * - 규칙 검사 시스템에 사용
 * - 컴포넌트 자동 분류에 사용
 *
 * 단일 진실의 원천 (Single Source of Truth)
 * 변경 시 한 곳만 수정하면 모든 곳에 반영됨
 */

export const componentTaxonomy = {
  // 메타데이터
  version: '1.0.0',
  lastUpdated: '2024-12-XX',
  description: '컴포넌트를 6가지 차원으로 분류하는 체계',

  // 분류 차원 정의
  dimensions: [
    {
      id: 'functional-role',
      name: '기능별',
      description: '컴포넌트가 수행하는 기능적 역할',
      icon: 'category',
      categories: [
        {
          id: 'data-display',
          name: '데이터 표시',
          description: '데이터를 시각화하거나 표시',
          icon: 'table_view',
          examples: ['NexaChart.vue', 'DataTableRenderer.vue', 'DataListRenderer.vue', 'DataCardRenderer.vue'],
          typicalLocations: ['charts/', 'renderers/'],
        },
        {
          id: 'data-input',
          name: '데이터 입력',
          description: '사용자 입력을 받는 폼',
          icon: 'edit',
          examples: ['AddDeviceForm.vue', 'AddSpaceForm.vue', 'AddBoardForm.vue'],
          typicalLocations: ['components/form/'],
        },
        {
          id: 'navigation',
          name: '네비게이션',
          description: '페이지/섹션 간 이동',
          icon: 'navigation',
          examples: ['LeftSidebar.vue', 'RightSidebar.vue', 'DataPageNavigation.vue'],
          typicalLocations: ['components/sidebars/'],
        },
        {
          id: 'layout',
          name: '레이아웃',
          description: '화면 구조 및 배치',
          icon: 'view_quilt',
          examples: ['MainLayout.vue', 'NexaPanel.vue', 'NexaBlock.vue'],
          typicalLocations: ['layouts/', 'panel/', 'block/'],
        },
        {
          id: 'overlay',
          name: '오버레이',
          description: '모달, 다이얼로그, 드로어',
          icon: 'layers',
          examples: ['BaseModal.vue', 'DocumentSettingsModal.vue', 'BoardManagerDrawer.vue'],
          typicalLocations: ['components/modals/', 'components/drawer/'],
        },
        {
          id: 'settings',
          name: '설정/관리',
          description: '설정 및 관리 기능',
          icon: 'settings',
          examples: ['IotSettings.vue', 'ThemeSettings.vue', 'PartClassesView.vue'],
          typicalLocations: ['components/settings/', 'components/parts/'],
        },
        {
          id: 'dev-tools',
          name: '개발 도구',
          description: '개발/디버깅 도구',
          icon: 'build',
          examples: ['DocumentManagerContent.vue', 'DatabaseViewerContent.vue', 'ComponentLibraryContent.vue'],
          typicalLocations: ['components/dev-tools/'],
        },
        {
          id: 'utility-ui',
          name: '유틸리티 UI',
          description: '보조 UI 요소',
          icon: 'widgets',
          examples: ['TableFilterBar.vue', 'TableEmptyState.vue', 'GlobalSkeletonLoader.vue'],
          typicalLocations: ['components/ui/'],
        },
        {
          id: 'context-menu',
          name: '컨텍스트 메뉴',
          description: '우클릭 메뉴',
          icon: 'menu',
          examples: ['ContextMenu.vue'],
          typicalLocations: ['components/ui/'],
        },
        {
          id: 'diagram',
          name: '다이어그램',
          description: '관계도, 플로우차트',
          icon: 'account_tree',
          examples: ['NexaDiagram.vue', 'SchemaDiagram.vue'],
          typicalLocations: ['diagram/'],
        },
        {
          id: 'board',
          name: '보드 시스템',
          description: '대시보드/보드',
          icon: 'dashboard',
          examples: ['NexaDashboardRenderer.vue', 'NexaBoardSetup.vue'],
          typicalLocations: ['board/'],
        },
      ],
    },
    {
      id: 'layout-position',
      name: '위치별',
      description: '화면에서의 물리적 위치',
      icon: 'place',
      categories: [
        {
          id: 'top',
          name: '상단',
          description: '헤더, 툴바 영역',
          icon: 'vertical_align_top',
          examples: ['RightSidebarHeader.vue', 'PartClassesActionsBar.vue'],
          characteristics: ['고정 또는 스크롤 가능'],
        },
        {
          id: 'left',
          name: '좌측',
          description: '왼쪽 사이드바',
          icon: 'chevron_left',
          examples: ['LeftSidebar.vue', 'PartsManagementSidebar.vue', 'NexaBoardSidebar.vue'],
          characteristics: ['네비게이션', '메뉴'],
        },
        {
          id: 'right',
          name: '우측',
          description: '오른쪽 사이드바/넥셋',
          icon: 'chevron_right',
          examples: ['RightSidebar.vue', 'DevToolsPanel.vue', 'NexaBoardToolsPanel.vue'],
          characteristics: ['도구', '설정', '정보'],
        },
        {
          id: 'center',
          name: '중앙',
          description: '메인 컨텐츠 영역',
          icon: 'center_focus_strong',
          examples: ['PartClassesView.vue', 'DocumentManagerContent.vue', 'NexaDashboardRenderer.vue'],
          characteristics: ['주요 컨텐츠'],
        },
        {
          id: 'bottom',
          name: '하단',
          description: '푸터 영역',
          icon: 'vertical_align_bottom',
          examples: [],
          characteristics: ['정보', '링크'],
        },
        {
          id: 'overlay',
          name: '오버레이',
          description: '모달, 다이얼로그',
          icon: 'layers',
          examples: ['BaseModal.vue', 'DocumentSettingsModal.vue'],
          characteristics: ['최상위 레이어'],
        },
        {
          id: 'floating',
          name: '플로팅',
          description: '드래그 가능한 요소',
          icon: 'open_with',
          examples: ['BoardManagerDrawer.vue'],
          characteristics: ['위치 변경 가능'],
        },
        {
          id: 'embedded',
          name: '임베디드',
          description: '다른 컴포넌트 내부',
          icon: 'view_in_ar',
          examples: ['TimeBlock.vue', 'ChartBlock.vue'],
          characteristics: ['블록', '넥셋 내부'],
        },
      ],
    },
    {
      id: 'purpose',
      name: '용도별',
      description: '컴포넌트의 사용 목적 및 범위',
      icon: 'track_changes',
      categories: [
        {
          id: 'independent-system',
          name: '독립 시스템',
          description: '프로젝트 전역 사용, 사용자 제어 가능, 대규모 확장',
          icon: 'extension',
          examples: ['NexaBlock.vue', 'NexaChart.vue', 'NexaPanel.vue', 'NexaDiagram.vue'],
          typicalLocations: ['block/', 'charts/', 'panel/', 'diagram/'],
        },
        {
          id: 'context-dependent',
          name: '컨텍스트 의존',
          description: '특정 페이지/모듈/기능에 종속',
          icon: 'link',
          examples: ['PartClassesView.vue', 'AddDeviceForm.vue', 'IotSettings.vue'],
          typicalLocations: ['components/parts/', 'components/form/', 'components/settings/'],
        },
        {
          id: 'generic-ui',
          name: '범용 UI',
          description: '여러 곳에서 재사용되는 UI 요소',
          icon: 'widgets',
          examples: ['BaseModal.vue', 'ContextMenu.vue', 'TableFilterBar.vue'],
          typicalLocations: ['components/ui/'],
        },
        {
          id: 'page',
          name: '페이지',
          description: '라우트와 연결된 전체 페이지',
          icon: 'description',
          examples: ['PartsManagementPage.vue', 'SettingsPage.vue', 'NexaBoardPage.vue'],
          typicalLocations: ['pages/'],
        },
        {
          id: 'layout',
          name: '레이아웃',
          description: '전체 페이지 구조',
          icon: 'view_quilt',
          examples: ['MainLayout.vue'],
          typicalLocations: ['layouts/'],
        },
        {
          id: 'renderer',
          name: '렌더러',
          description: '데이터를 특정 형식으로 렌더링',
          icon: 'image',
          examples: ['DataTableRenderer.vue', 'DataChartRenderer.vue', 'DataListRenderer.vue'],
          typicalLocations: ['renderers/'],
        },
        {
          id: 'dev-tools',
          name: '개발 도구',
          description: '개발/디버깅 전용',
          icon: 'build',
          examples: ['DocumentManagerContent.vue', 'DatabaseViewerContent.vue'],
          typicalLocations: ['components/dev-tools/'],
        },
      ],
    },
    {
      id: 'dependency',
      name: '관계별',
      description: '컴포넌트 간 의존성 관계',
      icon: 'account_tree',
      categories: [
        {
          id: 'independent',
          name: '독립적',
          description: '외부 의존성 없음, 자체 완결',
          icon: 'block',
          examples: ['TimeBlock.vue', 'WeatherBlock.vue'],
          characteristics: ['Store 미사용', 'Router 미사용'],
        },
        {
          id: 'dependent',
          name: '의존적',
          description: 'Store, Router, 특정 모듈에 의존',
          icon: 'link',
          examples: ['PartClassesView.vue', 'PartsManagementDashboard.vue'],
          characteristics: ['Pinia store 사용'],
        },
        {
          id: 'container',
          name: '컨테이너',
          description: '자식 컴포넌트를 포함하는 컨테이너',
          icon: 'folder',
          examples: ['NexaBlock.vue', 'NexaPanel.vue', 'MainLayout.vue'],
          characteristics: ['children을 렌더링'],
        },
        {
          id: 'presentation',
          name: '프레젠테이션',
          description: '데이터 표시만 담당',
          icon: 'image',
          examples: ['DataTableRenderer.vue', 'DataCardRenderer.vue'],
          characteristics: ['props로 데이터 받음'],
        },
        {
          id: 'container-presentation',
          name: '컨테이너-프레젠테이션',
          description: '데이터와 로직 모두 포함',
          icon: 'view_module',
          examples: ['PartClassesView.vue'],
          characteristics: ['Store + 렌더링'],
        },
      ],
    },
    {
      id: 'scope',
      name: '범위별',
      description: '컴포넌트의 재사용 범위',
      icon: 'public',
      categories: [
        {
          id: 'global',
          name: '전역',
          description: '프로젝트 어디서든 사용',
          icon: 'public',
          examples: ['NexaBlock.vue', 'NexaChart.vue', 'BaseModal.vue'],
          typicalLocations: ['독립 디렉토리 또는 components/ui/'],
        },
        {
          id: 'module',
          name: '모듈',
          description: '특정 모듈 내에서만 사용',
          icon: 'folder',
          examples: ['PartClassesView.vue', 'PartModelsView.vue'],
          typicalLocations: ['components/parts/'],
        },
        {
          id: 'page',
          name: '페이지',
          description: '특정 페이지 전용',
          icon: 'description',
          examples: ['PartsManagementPage.vue', 'SettingsPage.vue'],
          typicalLocations: ['pages/'],
        },
        {
          id: 'local',
          name: '로컬',
          description: '부모 컴포넌트 내부에서만 사용',
          icon: 'lock',
          examples: ['SpaceTreeNavItem.vue', 'ViewModeSelector.vue'],
          characteristics: ['부모와 강하게 결합'],
        },
        {
          id: 'context',
          name: '컨텍스트',
          description: '특정 컨텍스트에서만 의미 있음',
          icon: 'link',
          examples: ['TableFilterBar.vue'],
          characteristics: ['컨텍스트 의존적'],
        },
      ],
    },
    {
      id: 'hierarchy',
      name: '계층별',
      description: '컴포넌트의 구조적 계층',
      icon: 'account_tree',
      categories: [
        {
          id: 'base',
          name: '베이스',
          description: '타입 선택 및 라우팅 담당',
          icon: 'category',
          examples: ['NexaBlock.vue', 'NexaChart.vue', 'NexaPanel.vue'],
          characteristics: ['동적 타입 선택'],
        },
        {
          id: 'type-specific',
          name: '타입별',
          description: '특정 타입의 구현',
          icon: 'extension',
          examples: ['TimeBlock.vue', 'LineChart.vue', 'WeatherBlock.vue'],
          characteristics: ['베이스 컴포넌트의 하위'],
        },
        {
          id: 'instance',
          name: '인스턴스',
          description: '실제 사용되는 컴포넌트',
          icon: 'widgets',
          examples: ['페이지/뷰에서 사용되는 컴포넌트'],
          characteristics: ['최종 사용 단계'],
        },
        {
          id: 'utility',
          name: '유틸리티',
          description: '보조 기능 제공',
          icon: 'build',
          examples: ['chartAxes.js', 'chartTheme.js'],
          characteristics: ['직접 렌더링 안 함'],
        },
      ],
    },
  ],

  // 분류 규칙 (규칙 검사 시스템에서 사용)
  classificationRules: {
    // 컴포넌트 이름 기반 자동 분류 규칙
    namePatterns: {
      'data-display': ['Chart', 'Table', 'List', 'Card', 'Renderer', 'Viewer'],
      'data-input': ['Form', 'Input', 'Editor'],
      navigation: ['Nav', 'Sidebar', 'Menu', 'Breadcrumb'],
      layout: ['Layout', 'Panel', 'Block', 'Container'],
      overlay: ['Modal', 'Dialog', 'Drawer', 'Popover'],
      settings: ['Settings', 'Config', 'Management'],
      'dev-tools': ['DevTools', 'Debug', 'Analyzer'],
      'utility-ui': ['Filter', 'Empty', 'Skeleton', 'Loader'],
      'context-menu': ['ContextMenu', 'Menu'],
      diagram: ['Diagram', 'Graph', 'Flow'],
      board: ['Board', 'Dashboard'],
    },

    // 경로 기반 자동 분류 규칙
    pathPatterns: {
      'independent-system': ['/block/', '/charts/', '/nexet/', '/diagram/'],
      'context-dependent': ['/parts-management/', '/form/', '/settings/'],
      'generic-ui': ['/ui/'],
      page: ['/pages/'],
      layout: ['/layouts/'],
      renderer: ['/renderers/'],
      'dev-tools': ['/dev-tools/'],
    },

    // 계층별 분류 규칙
    hierarchyPatterns: {
      base: ['Nexa'],
      'type-specific': ['Block', 'Chart', 'Panel'],
      instance: [],
      utility: [],
    },
  },

  // 유틸리티 함수들
  utils: {
    /**
     * 차원 ID로 차원 정보 가져오기
     * @param {string} dimensionId - 차원 ID
     * @returns {Object|null} 차원 정보
     */
    getDimension(dimensionId: string) {
      return componentTaxonomy.dimensions.find((dim) => dim.id === dimensionId) || null
    },

    /**
     * 카테고리 ID로 카테고리 정보 가져오기
     * @param {string} dimensionId - 차원 ID
     * @param {string} categoryId - 카테고리 ID
     * @returns {Object|null} 카테고리 정보
     */
    getCategory(dimensionId: string, categoryId: string) {
      const dimension = this.getDimension(dimensionId)
      if (!dimension) return null
      return dimension.categories.find((cat) => cat.id === categoryId) || null
    },

    /**
     * 모든 차원의 모든 카테고리 목록 가져오기
     * @returns {Array} 카테고리 목록
     */
    getAllCategories() {
      return componentTaxonomy.dimensions.flatMap((dim) =>
        dim.categories.map((cat) => ({
          ...cat,
          dimensionId: dim.id,
          dimensionName: dim.name,
        })),
      )
    },

    /**
     * 컴포넌트 이름 기반 기능별 분류 추론
     * @param {string} componentName - 컴포넌트 이름
     * @returns {string|null} 기능별 카테고리 ID
     */
    inferFunctionalRole(componentName: string) {
      const patterns = componentTaxonomy.classificationRules.namePatterns
      for (const [categoryId, keywords] of Object.entries(patterns)) {
        if (keywords.some((keyword) => componentName.includes(keyword))) {
          return categoryId
        }
      }
      return null
    },

    /**
     * 컴포넌트 경로 기반 용도별 분류 추론
     * @param {string} componentPath - 컴포넌트 경로
     * @returns {string|null} 용도별 카테고리 ID
     */
    inferPurpose(componentPath: string) {
      const patterns = componentTaxonomy.classificationRules.pathPatterns
      for (const [categoryId, paths] of Object.entries(patterns)) {
        if (paths.some((path) => componentPath.includes(path))) {
          return categoryId
        }
      }
      return null
    },

    /**
     * 컴포넌트 이름 기반 계층별 분류 추론
     * @param {string} componentName - 컴포넌트 이름
     * @returns {string|null} 계층별 카테고리 ID
     */
    inferHierarchy(componentName: string) {
      const patterns = componentTaxonomy.classificationRules.hierarchyPatterns

      // 베이스 컴포넌트 (Nexa 접두어)
      if (patterns.base.some((prefix) => componentName.startsWith(prefix))) {
        return 'base'
      }

      // 타입별 컴포넌트
      if (patterns['type-specific'].some((keyword) => componentName.includes(keyword))) {
        return 'type-specific'
      }

      // 기본값: 인스턴스
      return 'instance'
    },
  },
}

// 기본 export
export default componentTaxonomy
