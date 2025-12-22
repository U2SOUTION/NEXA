# NEXA Platform 아키텍처 문서

## 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [전체 구조](#전체-구조)
3. [UI 구조](#ui-구조)
4. [라우팅 구조](#라우팅-구조)
5. [상태 관리 구조](#상태-관리-구조)
6. [컴포넌트 구조](#컴포넌트-구조)
7. [모듈 구조](#모듈-구조)
8. [향후 확장 계획](#향후-확장-계획)

## 관련 문서

- **[부품 관리 시스템 설계 문서](./PARTS_MANAGEMENT.md)**: 부품 관리 모듈 상세 설계
- **[뷰 모드 리팩토링 계획](./[삭제금지]view-mode-refactoring-plan.md)**: 뷰모드 리팩토링 중간 정리 작업
- **[뷰 모드 컴포넌트 문서화](./view-mode-components-documentation.md)**: 뷰모드 컴포넌트 위치, 역할, 의존성

---

## 프로젝트 개요

**NEXA Platform**은 ESP32 기반 IoT 디바이스를 관리하고 시각화하는 스마트 IoT 플랫폼입니다.

### 기술 스택

- **프레임워크**: Quasar Framework 2.16.0 (Vue 3.4.18 기반)
- **상태 관리**: Pinia 3.0.2
- **라우팅**: Vue Router 4.0.0
- **빌드 도구**: Vite (Quasar CLI)
- **그리드 레이아웃**: vue3-grid-layout-next 1.0.7
- **패널 분할**: splitpanes 4.0.3

### 핵심 기능

- ESP32 디바이스 등록 및 관리
- 프로젝트/그룹 기반 대시보드 구성
- 넥사패널(위젯) 시스템을 통한 데이터 시각화 및 제어
- 실시간 모니터링 및 제어

---

## 전체 구조

### 디렉토리 구조

```
NEXA-Platform/
├── public/                    # 정적 파일
│   ├── favicon.ico
│   └── icons/                # 파비콘 아이콘들
│
├── src/
│   ├── App.vue               # 루트 컴포넌트
│   │
│   ├── boot/                 # 부트스트랩 파일
│   │   └── pinia.js         # Pinia 초기화
│   │
│   ├── layouts/              # 레이아웃 컴포넌트
│   │   └── MainLayout.vue   # 메인 레이아웃 (헤더, 사이드바, 콘텐츠)
│   │
│   ├── pages/                # 페이지 컴포넌트
│   │   ├── NexaBoardPage.vue        # 넥사보드 메인 페이지
│   │   ├── IndexBoardPage.vue        # 인덱스 보드 (레거시)
│   │   ├── ProjectAdminPage.vue      # 프로젝트 관리 페이지
│   │   ├── SettingsPage.vue          # 설정 페이지
│   │   ├── HomePage.vue              # 홈 페이지 (계획)
│   │   └── PartsManagementPage.vue   # 부품관리 페이지 (계획)
│   │
│   ├── components/           # 재사용 컴포넌트
│   │   ├── DashboardRenderer.vue     # 대시보드 렌더러
│   │   ├── NexaBoardSetup.vue        # 넥사보드 설정
│   │   ├── ProjectConfigEditor.vue    # 프로젝트 설정 에디터
│   │   ├── AddNexaPanelDialog.vue     # 넥사패널 추가 다이얼로그
│   │   ├── TreeNavItem.vue            # 트리 네비게이션 아이템
│   │   │
│   │   ├── form/                      # 폼 컴포넌트
│   │   │   ├── AddDeviceForm.vue
│   │   │   ├── AddGroupForm.vue
│   │   │   └── AddProjectForm.vue
│   │   │
│   │   ├── side-panel/                # 사이드 패널
│   │   │   ├── SidePanel.vue
│   │   │   └── sections/
│   │   │       ├── DeviceSection.vue
│   │   │       ├── HistorySection.vue
│   │   │       ├── LayoutSection.vue
│   │   │       ├── NexaPanelSection.vue
│   │   │       └── NotificationSection.vue
│   │   │
│   │   ├── sidebar/                   # 사이드바 컴포넌트 (계획)
│   │   │   ├── SidebarContainer.vue   # 동적 사이드바 컨테이너
│   │   │   ├── HomeSidebar.vue        # 홈 사이드바
│   │   │   ├── NexaBoardSidebar.vue   # 넥사보드 사이드바
│   │   │   └── PartsManagementSidebar.vue  # 부품관리 사이드바
│   │   │
│   │   └── settings/                  # 설정 컴포넌트
│   │       ├── IotSettings.vue
│   │       ├── LayoutSettings.vue
│   │       ├── SystemSettings.vue
│   │       └── ThemeSettings.vue
│   │
│   ├── modules/               # 기능 모듈 (계획)
│   │   └── parts-management/  # 부품관리 모듈
│   │       ├── stores/
│   │       │   └── partsStore.js
│   │       ├── services/
│   │       │   └── partsService.js
│   │       ├── components/
│   │       │   ├── PartsListView.vue
│   │       │   ├── PartsThumbnailView.vue
│   │       │   └── PartsInOutView.vue
│   │       └── panels/                # 넥사패널용 컴포넌트
│   │           ├── PartsSummaryPanel.vue
│   │           ├── PartsRecentPanel.vue
│   │           └── PartsSearchPanel.vue
│   │
│   ├── stores/                # Pinia 스토어
│   │   ├── dashboardLayoutStore.js   # 대시보드 레이아웃 상태
│   │   ├── projectTreeStore.js       # 프로젝트 트리 상태
│   │   ├── projectEditorStore.js     # 프로젝트 에디터 상태
│   │   ├── userSettingsStore.js      # 사용자 설정 상태
│   │   ├── layout.js                 # 레이아웃 스토어 (레거시)
│   │   └── navigationStore.js        # 네비게이션 상태 (계획)
│   │
│   ├── router/                # 라우팅 설정
│   │   ├── index.js          # 라우터 초기화
│   │   └── routes.js          # 라우트 정의
│   │
│   ├── config/                # 설정 파일
│   │   └── nexaPanelTypes.js # 넥사패널 타입 정의
│   │
│   ├── settings/              # 설정 모듈
│   │   ├── iot.js
│   │   ├── layout.js
│   │   ├── system.js
│   │   └── theme.js
│   │
│   └── css/                   # 스타일시트
│       ├── app.scss
│       ├── quasar.variables.scss
│       └── themes/
│           ├── dark.scss
│           └── light.scss
│
└── quasar.config.js          # Quasar 설정
```

---

## UI 구조

### 레이아웃 구성

```
┌─────────────────────────────────────────────────────────────────┐
│                         헤더 (고정)                             │
│  [☰] NEXA Platform │ [HOME] │ [NEXA BOARD] │ [부품관리] │ ... │
├──────┬──────────────────────────────────────────────┬──────────┤
│      │                                              │          │
│ 사이드│            메인 콘텐츠 영역                  │ 우측     │
│ 바    │            (동적 변경)                      │ 패널     │
│ (동적)│                                              │ (옵션)   │
│      │                                              │          │
└──────┴──────────────────────────────────────────────┴──────────┘
```

### 헤더 구조

**왼쪽 영역:**

- 햄버거 메뉴 버튼 (사이드바 토글)
- 플랫폼 로고/이름: "NEXA Platform"

**중앙 영역: 메인 메뉴 탭**

- **HOME**: 전체 개요 대시보드
- **NEXA BOARD**: 프로젝트별 대시보드 (현재 구조)
- **부품관리**: 부품 관리 페이지
- 향후 추가될 메뉴들...

**오른쪽 영역: 컨텍스트 기능 버튼**

- **NEXA BOARD 선택 시**:
  - 넥사패널 추가
  - 보드창 선택 (레이아웃 프리셋)
  - 사이드패널 토글
- **부품관리 선택 시**:
  - 새 부품 추가
  - 필터/검색
  - 내보내기
- **공통 버튼**:
  - 테마 전환
  - 설정

### 사이드바 구조 (동적 변경)

#### 공통 상단

```
┌─────────────────────┐
│   U2 SOLUTION        │
│   NEXA PLATFORM     │
└─────────────────────┘
```

#### HOME 선택 시

```
┌─ 빠른 접근 ─────────┐
│ 📊 대시보드 요약     │
│ ⭐ 즐겨찾기         │
│ 📁 최근 프로젝트     │
│ 🔔 최근 알림         │
└────────────────────┘
```

#### NEXA BOARD 선택 시 (현재 구조)

```
┌─ 프로젝트 트리 ─────┐
│ 📁 테스트 그룹       │
│   📊 프로젝트 1      │
│   📊 프로젝트 2      │
└────────────────────┘
┌─ 빠른 작업 ─────────┐
│ [➕ ADD DEVICE]     │
│ [✏️ PROJECT EDIT]   │
└────────────────────┘
```

#### 부품관리 선택 시

```
┌─ 부품 카테고리 ─────┐
│ 📦 전체 부품         │
│ ⚡ 전자부품          │
│ 🔧 기계부품          │
│ 📄 소모품            │
└────────────────────┘
┌─ 빠른 필터 ─────────┐
│ ⚠️ 재고 부족         │
│ 📥 최근 입출고       │
│ 🔍 검색             │
└────────────────────┘
```

### 우측 사이드 패널

**기능:**

- 레이아웃 설정
- 넥사패널 관리
- 디바이스 정보
- 히스토리
- 알림

**모드:**

- Overlay: 오버레이 방식
- Push: 콘텐츠를 밀어내는 방식

---

## 라우팅 구조

### 현재 라우팅

```javascript
/                           → NexaBoardPage (홈/대시보드)
/nexa-board                 → NexaBoardPage
/add-device                 → AddDeviceForm
/project-admin              → ProjectAdminPage
/settings                   → SettingsPage
```

### 계획된 라우팅 구조

```javascript
/                           → HomePage (전체 개요)
/nexa-board                 → NexaBoardPage (프로젝트별 대시보드)
/nexa-board/:projectId      → NexaBoardPage (특정 프로젝트)
/parts-management           → PartsManagementPage (부품관리)
/parts-management/:id       → PartsManagementPage (부품 상세)
/devices                    → DevicesPage (디바이스 관리) - 향후
/projects                   → ProjectsPage (프로젝트 관리) - 향후
/settings                   → SettingsPage
```

---

## 상태 관리 구조

### Pinia 스토어

#### 1. `dashboardLayoutStore`

**역할**: 대시보드 레이아웃 및 넥사패널 관리

**주요 상태:**

- `presets`: 레이아웃 프리셋 목록
- `activePreset`: 현재 활성 프리셋
- `panes`: 각 창(pane)의 패널 목록
- `currentViewMode`: 현재 뷰 모드 ('dashboard' | 'projectManagement')
- `selectedNodeForDashboard`: 대시보드에 표시할 노드
- `mainNavigationOpen`: 메인 네비게이션 열림 상태

**주요 액션:**

- `setActivePreset()`: 프리셋 변경
- `addPanelToPane()`: 패널 추가
- `removePanelFromPane()`: 패널 제거
- `triggerGenericAddPanel()`: 패널 추가 트리거

#### 2. `projectTreeStore`

**역할**: 프로젝트/그룹 트리 구조 관리

**주요 상태:**

- `nodes`: 모든 노드(그룹 및 프로젝트) 배열

**주요 액션:**

- `addNode()`: 노드 추가
- `updateNode()`: 노드 업데이트
- `deleteNode()`: 노드 삭제
- `getRootNodes`: 루트 노드 조회

#### 3. `projectEditorStore`

**역할**: 프로젝트 에디터 상태 관리

**주요 상태:**

- `selectedNodeId`: 선택된 노드 ID
- `nodeToExpandAndHighlight`: 확장 및 하이라이트할 노드

#### 4. `userSettingsStore`

**역할**: 사용자 설정 관리

**주요 상태:**

- `settings.theme`: 테마 설정
- `settings.drawer`: 사이드바 설정 (왼쪽/오른쪽 너비, 모드)

**주요 액션:**

- `toggleTheme()`: 테마 전환
- `setDrawerWidth()`: 사이드바 너비 설정

#### 5. `navigationStore` (계획)

**역할**: 네비게이션 상태 관리

**주요 상태:**

- `currentMenu`: 현재 선택된 메인 메뉴
- `sidebarComponent`: 현재 표시할 사이드바 컴포넌트

**주요 액션:**

- `setCurrentMenu()`: 메뉴 변경
- `getSidebarComponent()`: 사이드바 컴포넌트 조회

---

## 컴포넌트 구조

### 페이지 컴포넌트

#### `NexaBoardPage.vue`

- 프로젝트별 대시보드 페이지
- 프로젝트 선택 시 대시보드 렌더링
- 넥사보드 설정 및 렌더링

#### `HomePage.vue` (계획)

- 전체 플랫폼 개요
- 빠른 접근 링크
- 최근 활동 요약

#### `PartsManagementPage.vue` (계획)

- 부품 관리 메인 페이지
- 리스트/썸네일/입출고 뷰 전환
- 부품 CRUD 기능

### 레이아웃 컴포넌트

#### `MainLayout.vue`

- 전체 레이아웃 구조
- 헤더, 사이드바, 콘텐츠 영역 관리
- 동적 사이드바 전환

### 대시보드 컴포넌트

#### `DashboardRenderer.vue`

- 대시보드 렌더링
- splitpanes를 사용한 창 분할
- 넥사패널 그리드 레이아웃

#### `NexaBoardSetup.vue`

- 넥사보드 초기 설정
- 레이아웃 프리셋 선택
- 디바이스 및 패널 구성

### 넥사패널 시스템

#### 넥사패널 타입 (현재 15가지)

1. 텍스트 노트
2. 이미지 뷰어
3. 샘플 차트
4. 디바이스 상태
5. 텍스트 디스플레이
6. 게이지
7. 상태 표시기
8. 로그 뷰어
9. 버튼 제어
10. 스위치 제어
11. 슬라이더 제어
12. 명령어 입력
13. 색상 선택
14. 자동화 규칙
15. 알림 센터

#### 넥사패널 추가 (계획)

- 부품 현황 요약 패널
- 최근 입출고 패널
- 부품 검색 패널
- 재고 알림 패널

---

## 모듈 구조

### 모듈 설계 원칙

**하이브리드 접근법**: 독립 페이지 + 넥사패널 위젯

각 모듈은 다음 구조를 가집니다:

```
modules/{module-name}/
├── stores/              # 모듈 전용 스토어
├── services/            # 비즈니스 로직
├── components/          # 독립 페이지용 컴포넌트
└── panels/              # 넥사패널용 컴포넌트
```

### 부품관리 모듈 예시

```
modules/parts-management/
├── stores/
│   ├── partsManagementStore.js  # 부품 관리 상태 (물리 공간, 뷰 모드 등)
│   └── partsDataStore.js        # 부품 데이터 상태 (part_classes, part_models 등)
│
├── services/
│   └── partsService.js         # 부품 비즈니스 로직
│       - getParts()             # 부품 조회
│       - addPart()              # 부품 추가
│       - updatePart()           # 부품 수정
│       - deletePart()           # 부품 삭제
│       - recordInOut()          # 입출고 기록
│
├── components/
│   ├── PartClassesView.vue      # 부품 분류 뷰 (뷰 모드 지원)
│   ├── PartModelsView.vue       # 부품 모델 뷰
│   ├── PartSpecsView.vue        # 부품 스펙 뷰
│   ├── PartFilesView.vue        # 부품 파일 뷰
│   │
│   ├── ViewModeSelector.vue     # 뷰 모드 선택 컴포넌트 (재사용 가능)
│   ├── PartClassesActionsBar.vue # 액션 바 컴포넌트 (뷰별 특화)
│   │
│   ├── item-action-modules/     # 액션 모듈 (재사용 가능)
│   │   ├── BasicActionsModule.vue
│   │   ├── StatusManagementModule.vue
│   │   ├── ViewModule.vue
│   │   └── PrintExportModule.vue
│   │
│   ├── view-settings/           # 뷰 모드별 설정 컴포넌트
│   │   ├── TableViewSettings.vue
│   │   ├── CardViewSettings.vue
│   │   └── ListViewSettings.vue
│   │
│   └── config/                  # 설정 파일
│       ├── viewModeSettings.js  # 뷰 모드 설정 및 유틸리티
│       └── partClassesMenuConfig.js # 메뉴 설정
│
└── panels/                      # 넥사패널 컴포넌트
    ├── PartsSummaryPanel.vue    # 요약 패널
    ├── PartsRecentPanel.vue     # 최근 입출고 패널
    └── PartsSearchPanel.vue     # 검색 패널
```

**사용 방식:**

1. **독립 페이지**: `PartsManagementPage.vue`에서 `components/`의 컴포넌트 사용
2. **넥사패널**: `panels/`의 컴포넌트를 넥사패널 타입으로 등록하여 대시보드에서 사용

### 뷰 모드 시스템

부품 관리 모듈은 다양한 뷰 모드를 지원합니다:

**지원 뷰 모드:**

- **테이블 뷰**: 전통적인 테이블 형태 (컬럼 표시/숨김, 순서 변경, 너비 조정)
- **카드 뷰**: 카드 형태의 그리드 레이아웃
- **리스트 뷰**: 리스트 형태 (아코디언, 확장 모드)
- **갤러리 뷰**: 이미지 중심의 갤러리 형태
- **타임라인 뷰**: 시간 기반 이벤트 표시
- **차트 뷰**: 데이터 분석 및 시각화 (계획)
- **레이아웃 뷰**: 커스텀 레이아웃 (계획)

**아키텍처 특징:**

- **재사용 가능한 컴포넌트**: `ViewModeSelector`, 렌더러 컴포넌트 등
- **뷰별 특화 컴포넌트**: 각 뷰마다 전용 ActionsBar 생성
- **설정 관리**: 뷰 모드별 설정을 localStorage에 저장/로드
- **확장성**: 새로운 뷰 모드 추가 용이

**자세한 내용:**

- [뷰 모드 컴포넌트 문서화](./view-mode-components-documentation.md)
- [뷰 모드 설정 파일 문서화](./view-mode-config-files-documentation.md)

---

## 향후 확장 계획

### 단기 계획

1. **상위 메뉴 시스템 구현**

   - 헤더 탭 메뉴 추가
   - 동적 사이드바 시스템
   - 네비게이션 스토어 생성

2. **HOME 페이지 구현**

   - 전체 개요 대시보드
   - 빠른 접근 링크
   - 최근 활동 표시

3. **부품관리 모듈 개발**
   - 모듈 구조 설계
   - 독립 페이지 구현
   - 넥사패널 위젯 구현

### 중기 계획

1. **디바이스 관리 개선**

   - 독립 페이지로 확장
   - 디바이스 모니터링 패널 추가

2. **프로젝트 관리 개선**

   - 독립 페이지로 확장
   - 프로젝트 요약 패널 추가

3. **커뮤니티 기능** (넥사보드 형태 아님)

   - 독립 페이지로 구현
   - 게시판, 댓글 기능

4. **제품/기능 홍보** (넥사보드 형태 아님)
   - 독립 페이지로 구현
   - 랜딩 페이지, 마케팅 콘텐츠

### 장기 계획

1. **모듈 시스템 확장**

   - 플러그인 시스템
   - 커스텀 넥사패널 개발 도구
   - 모듈 마켓플레이스

2. **멀티테넌시 지원**

   - 사용자/팀 관리
   - 권한 시스템

3. **클라우드 연동**
   - 데이터 동기화
   - 원격 접근

---

## 아키텍처 원칙

### 1. 모듈화

- 기능별로 독립적인 모듈로 구성
- 재사용 가능한 컴포넌트 설계

### 2. 확장성

- 새로운 기능 추가 시 기존 코드 영향 최소화
- 플러그인 시스템 고려

### 3. 일관성

- UI/UX 일관성 유지
- 네이밍 컨벤션 준수

### 4. 성능

- 코드 스플리팅
- 지연 로딩 (Lazy Loading)
- 상태 관리 최적화

### 5. 유지보수성

- 명확한 코드 구조
- 문서화
- 테스트 가능한 구조

---

## 참고 사항

### 개발 환경

- Node.js: ^20 || ^18
- npm: >= 6.13.4
- 개발 서버: `npm run dev` (포트: 9000 기본)

### 주요 설정 파일

- `quasar.config.js`: Quasar 프레임워크 설정
- `package.json`: 프로젝트 의존성 및 스크립트
- `src/config/nexaPanelTypes.js`: 넥사패널 타입 정의

### 데이터 저장

- 현재: LocalStorage 사용
- 향후: 백엔드 API 연동 계획

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024년  
**작성자**: NEXA Platform 개발팀
