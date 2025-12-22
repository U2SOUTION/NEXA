# 컴포넌트 조직화 가이드라인

## 📋 문서 목적 및 취지

이 문서는 **NEXA Platform** 프로젝트의 컴포넌트 아키텍처와 조직화 원칙을 정의하는 핵심 가이드라인입니다.

### 목적

1. **일관된 구조 유지**: 프로젝트 전반에 걸쳐 일관된 컴포넌트 구조와 네이밍 규칙을 유지하여 코드베이스의 가독성과 유지보수성을 향상시킵니다.

2. **명확한 배치 기준**: 새로운 컴포넌트를 생성할 때 `src/components/`에 둘지, 독립 디렉토리(`src/block/`, `src/charts/`, `src/panel/` 등)에 둘지 결정하는 명확한 기준을 제공합니다.

3. **확장성 보장**: 넥사블록, 차트, 패널 등 수백 개로 확장될 예정인 시스템의 확장 가능한 구조를 정의합니다.

4. **개발 효율성 향상**: 개발자가 컴포넌트 위치를 빠르게 파악하고, 적절한 위치에 배치할 수 있도록 가이드를 제공합니다.

### 핵심 개념

- **컨텍스트 의존적 컴포넌트**: 특정 페이지, 모듈, 기능에 종속되어 사용되는 컴포넌트 → `src/components/`
- **독립적 시스템**: 프로젝트 전역에서 사용되고, 사용자가 직접 선택/배치/설정 가능하며, 대규모 확장 예정인 컴포넌트 → 독립 디렉토리 (`src/block/`, `src/charts/`, `src/panel/` 등)

### 문서 활용 방법

- **새 컴포넌트 생성 시**: 이 문서의 판단 플로우차트와 체크리스트를 참고하여 적절한 위치에 배치
- **리팩토링 시**: 마이그레이션 기준을 참고하여 기존 컴포넌트를 적절한 위치로 이동
- **코드 리뷰 시**: 이 가이드라인을 기준으로 컴포넌트 구조의 적절성을 검토

### 문서 정보

**작성일:** 2024년

#### 시스템 아키텍처와 컴포넌트 구조

**문서 파일명:** `[STRUCTURE] system-architecture-component-structure.md` (파일명은 프로젝트 구조 문서임을 나타내는 접두어 사용)

---

## 📋 개요

새로운 컴포넌트를 만들 때 `src/components/`에 둘지, 독립 디렉토리(`src/block/`, `src/charts/` 등)에 둘지 결정하는 기준을 정의합니다.

---

## 🎯 핵심 기준: 컨텍스트 의존성

### `src/components/`에 두는 경우

**"컨텍스트 의존적 컴포넌트"** - 특정 페이지, 모듈, 기능에 종속되어 사용되는 컴포넌트

#### 판단 기준

1. **특정 페이지/모듈에서만 사용**

   - 예: `PartClassesView.vue`는 부품 관리 페이지에서만 사용
   - 예: `AddDeviceForm.vue`는 디바이스 추가 기능에서만 사용

2. **부모 컴포넌트의 상태/데이터에 의존**

   - 부모의 props, store, route 등에 강하게 결합
   - 예: `TableFilterBar.vue`는 특정 테이블의 필터 상태에 의존

3. **재사용 범위가 제한적**

   - 다른 모듈에서 사용할 가능성이 낮음
   - 예: `PartClassesActionsBar.vue`는 부품 분류 뷰 전용

4. **UI 조각/부분 기능**
   - 전체 기능이 아닌 특정 기능의 일부
   - 예: `SpaceTreeNavItem.vue`는 공간 트리의 노드 하나

#### 예시

```javascript
// ✅ src/components/에 적합
src/components/
├── parts-management/
│   ├── PartClassesView.vue        // 부품 분류 뷰 전용
│   ├── PartClassesActionsBar.vue  // 부품 분류 액션 바
│   └── AddSpaceForm.vue           // 공간 추가 폼
├── form/
│   └── AddDeviceForm.vue          // 디바이스 추가 폼
└── ui/
    └── TableFilterBar.vue         // 테이블 필터 (특정 테이블용)
```

---

### 독립 디렉토리에 두는 경우

**"독립적 시스템/인프라"** - 프로젝트 전역에서 사용되고, 독립적으로 확장 가능한 컴포넌트

#### 판단 기준

1. **프로젝트 전역에서 사용 가능**

   - 여러 페이지, 모듈에서 공통으로 사용
   - 예: 차트는 어디서든 데이터 시각화에 사용

2. **사용자가 직접 선택/배치/설정 가능**

   - 사용자가 UI에서 직접 선택하여 사용
   - 예: 넥사블록은 넥사보드, 에디터 등에서 사용자가 선택하여 배치

3. **독립적인 생명주기와 확장 계획**

   - 수십~수백 개로 확장 예정
   - 자체적인 업데이트/버전 관리 필요
   - 예: 넥사블록 시스템, 차트 시스템

4. **데이터/상태와 약한 결합**

   - 어떤 데이터든 받아서 처리 가능
   - 컨텍스트에 의존하지 않음
   - 예: 차트는 데이터만 받으면 시각화

5. **하위 카테고리로 분류 가능**
   - 종류별로 폴더 분리 필요
   - 예: `block/time/`, `block/weather/`, `charts/line/`, `charts/bar/`

#### 예시

```javascript
// ✅ 독립 디렉토리에 적합
src/
├── charts/              # 차트 시스템 (수십 개 예정)
│   ├── core/
│   ├── line/
│   ├── bar/
│   └── pie/
├── block/               # 넥사블록 시스템 (수백 개 예정)
│   ├── time/
│   ├── weather/
│   └── data/
├── panel/               # 넥사패널 시스템 (넥사보드 전용)
│   └── ...
└── components/          # 컨텍스트 의존적 컴포넌트
```

---

## 📊 판단 플로우차트

```
새 컴포넌트 생성
    ↓
1. 넥사보드 전용 컨테이너인가? (그리드, 드래그앤드롭 등)
   YES → 독립 디렉토리 (panel/)
   NO  → 다음 질문
    ↓
2. 독립적인 콘텐츠 단위인가? (패널, 에디터, 메인 페이지 등에서 사용)
   YES → 독립 디렉토리 (block/)
   NO  → 다음 질문
    ↓
3. 프로젝트 전역에서 다양한 데이터로 사용 가능한가?
   YES → 독립 디렉토리 (charts/)
   NO  → 다음 질문
    ↓
4. 수십~수백 개로 확장 예정이고 종류별 분류가 필요한가?
   YES → 독립 디렉토리
   NO  → 다음 질문
    ↓
5. 특정 페이지/모듈/기능에 종속되어 있는가?
   YES → src/components/
   NO  → 다음 질문
    ↓
6. 범용 UI 컴포넌트인가? (버튼, 입력, 모달 등)
   YES → src/components/ui/
   NO  → src/components/
```

---

## 🔍 구체적 예시

### ✅ `src/components/`에 두는 경우

**1. 모듈별 뷰 컴포넌트**

```javascript
// 부품 관리 모듈 전용
src/components/parts-management/
├── PartClassesView.vue      // 부품 분류 뷰
├── PartModelsView.vue       // 부품 모델 뷰
└── StorageBlockGrid.vue      // 저장소 블록 그리드
```

**2. 특정 기능의 액션/도구**

```javascript
// 부품 분류 뷰 전용 액션 바
src/components/parts-management/
└── PartClassesActionsBar.vue
```

**3. 특정 폼/다이얼로그**

```javascript
// 공간 추가 폼 (부품 관리 전용)
src/components/parts-management/form/
└── AddSpaceForm.vue
```

**4. 컨텍스트 의존적 UI**

```javascript
// 특정 테이블의 필터 바
src/components/ui/
└── TableFilterBar.vue  // 특정 테이블 상태에 의존
```

**5. 사이드 패널/사이드바**

```javascript
// 특정 페이지/모듈의 사이드 패널
src/components/side-panel/
├── SidePanel.vue
└── sections/              // 페이지별 섹션
    ├── DeviceSection.vue
    └── NexaPanelSection.vue
```

**6. 설정 컴포넌트**

```javascript
// 설정 페이지 전용 컴포넌트
src/components/settings/
├── IotSettings.vue
├── LayoutSettings.vue
└── ThemeSettings.vue
```

**7. 프로젝트 관리 컴포넌트**

```javascript
// 프로젝트 관리 전용
src/components/
├── ProjectConfigEditor.vue    // 프로젝트 설정 에디터
├── ProjectGuide.vue           // 프로젝트 가이드
└── TreeNavItem.vue            // 프로젝트 트리 노드
```

**8. 폼 컴포넌트**

```javascript
// 특정 기능의 폼
src/components/form/
├── AddDeviceForm.vue      // 디바이스 추가
├── AddGroupForm.vue       // 그룹 추가
└── AddProjectForm.vue     // 프로젝트 추가
```

---

### ✅ 독립 디렉토리에 두는 경우

**1. 차트 시스템**

```javascript
// 이유: 프로젝트 전역 사용, 다양한 데이터 소스, 수십 개 확장 예정
src/charts/
├── NexaChart.vue       // 차트 베이스 컴포넌트 (동적 타입 선택용)
├── line/               // 라인 차트 카테고리
│   ├── LineChart.vue  // 기본 라인 차트
│   ├── AreaLineChart.vue // 영역 라인 차트
│   ├── StepLineChart.vue // 스텝 라인 차트
│   └── SmoothLineChart.vue // 부드러운 라인 차트
├── bar/                // 바 차트 카테고리
│   ├── BarChart.vue   // 기본 바 차트
│   ├── HorizontalBarChart.vue // 수평 바 차트
│   └── StackedBarChart.vue // 스택 바 차트
├── pie/                // 파이 차트 카테고리
│   ├── PieChart.vue   // 기본 파이 차트
│   └── DoughnutChart.vue // 도넛 차트
├── area/               // 영역 차트 카테고리
│   ├── AreaChart.vue  // 기본 영역 차트
│   └── StackedAreaChart.vue // 스택 영역 차트
├── scatter/            // 산점도 차트 카테고리
│   └── ScatterChart.vue // 산점도 차트
├── config/
│   └── chartTypes.js   // 차트 타입 정의
└── utils/              // 차트 유틸리티
    ├── dataTransform.js
    └── chartHelpers.js
```

**2. 넥사패널 시스템**

```javascript
// 이유: 넥사보드 전용 컨테이너, 그리드 레이아웃, 드래그앤드롭 등 넥사보드 전용 기능
// 현재: src/components/AddNexaPanelDialog.vue, src/config/nexaPanelTypes.js
// 예상: src/panel/
src/panel/
├── NexaPanel.vue          // 패널 컨테이너 (넥사보드에서 사용)
├── NexaPanelHeader.vue    // 패널 헤더 컴포넌트
├── NexaPanelMenu.vue      // 패널 메뉴 컴포넌트
├── NexaPanelDialog.vue    // 패널 추가 다이얼로그
├── components/            // 패널 내부 컴포넌트
│   ├── PanelResizeHandle.vue
│   └── PanelDragHandle.vue
└── config/
    └── panelTypes.js       // 패널 타입 정의
```

**3. 넥사블록 시스템**

```javascript
// 이유: 독립적인 콘텐츠 단위, 패널/에디터/메인 페이지 등에서 사용, 수백 개 확장 예정
// 예상: src/block/
src/block/
├── NexaBlock.vue          // 블록 베이스 컴포넌트 (동적 타입 선택용)
├── time/
│   └── TimeBlock.vue      // 시간 블록 (직접 사용 가능)
├── weather/
│   └── WeatherBlock.vue   // 날씨 블록 (직접 사용 가능)
├── chart/
│   └── ChartBlock.vue     // 차트 블록 (직접 사용 가능)
├── project/
│   ├── ScheduleBlock.vue  // 프로젝트 일정 블록
│   └── SpecBlock.vue      // 제원 블록
├── device/
│   └── ControlBlock.vue   // 장비 제어 블록
└── config/
    └── blockTypes.js      // 블록 타입 정의
```

**4. 넥사보드 시스템**

```javascript
// 이유: 대시보드 렌더링 인프라, 전역 사용, 독립적 확장
// 현재: src/components/DashboardRenderer.vue, NexaBoardSetup.vue
// 예상: src/board/ (또는 현재 위치 유지)
src/board/
├── NexaDashboardRenderer.vue  // 대시보드 렌더러
├── NexaBoardSetup.vue        // 보드 초기 설정
├── presets/                   // 레이아웃 프리셋
└── utils/
    └── layoutHelpers.js
```

**5. 데이터 렌더러 시스템**

```javascript
// 이유: 프로젝트 전역 사용, 다양한 데이터 소스 지원, 뷰 모드 시스템
// 현재: src/components/views/ (DataTableRenderer, DataCardRenderer 등)
// 예상: src/renderers/ (독립 디렉토리로 이동 권장)
src/renderers/
├── DataTableRenderer.vue      // 테이블 렌더러
├── DataCardRenderer.vue       // 카드 렌더러
├── DataListRenderer.vue       // 리스트 렌더러
├── DataChartRenderer.vue      // 차트 렌더러
├── config/
│   └── rendererTypes.js       // 렌더러 타입 정의
└── utils/                      // 렌더러 유틸리티
    ├── dataTransform.js
    └── rendererHelpers.js
```

**6. 범용 인프라 (향후)**

```javascript
// 예: 알림 시스템, 로깅 시스템 등
src/notifications/  // 전역 알림 시스템
src/logging/        // 로깅 시스템
```

---

## 🎯 경계 케이스 판단

### 케이스 1: 범용 UI 컴포넌트

**예:** `Button.vue`, `Input.vue`, `Modal.vue`

**판단:**

- 프로젝트 전역 사용 → `src/components/ui/`
- Quasar 등 라이브러리로 대체 가능 → 사용하지 않음

**이유:** 범용이지만 독립 시스템이 아니고, 기존 UI 라이브러리로 충분

---

### 케이스 2: 데이터 렌더러

**예:** `DataTableRenderer.vue`, `DataCardRenderer.vue`

**판단:**

- 여러 모듈에서 사용하지만 특정 데이터 구조에 의존 → `src/components/views/`
- 완전히 독립적이고 다양한 데이터 소스 지원 → 독립 디렉토리 고려

**현재:** `src/components/views/` (적절함)

**향후 고려:**

- 뷰 모드 시스템이 확장되고 다양한 데이터 소스를 지원하게 되면 → `src/renderers/`로 이동 고려

---

### 케이스 3: 모달/다이얼로그

**예:** `AddClassDialog.vue`, `DeleteModal.vue`

**판단:**

- 특정 기능 전용 → `src/components/모듈명/modals/`
- 범용 모달 시스템 → 독립 디렉토리 고려

**현재:** 모듈별로 분리 (적절함)

---

### 케이스 4: 넥사패널 vs 넥사블록

**넥사패널 (Panel):**

- **정의**: 넥사보드 전용 컨테이너/래퍼 컴포넌트
- **특징**:
  - 넥사보드에서만 사용
  - 그리드 레이아웃, 드래그앤드롭, 리사이즈, 창 분할 등 넥사보드 전용 기능 제공
  - 넥사블록을 감싸는 컨테이너 역할
  - 패널 헤더, 메뉴, 설정 UI 포함
- **위치**: `src/panel/`

**넥사블록 (Block):**

- **정의**: 독립적인 콘텐츠 단위 컴포넌트
- **특징**:
  - 독립적으로 동작하는 콘텐츠 단위
  - 넥사패널 안에서 사용 가능 (넥사보드)
  - Tiptap 에디터에서 삽입 가능 (일반 문서)
  - 메인 페이지, 사이드바 등 어디서든 사용 가능
  - 시간, 날씨, 차트, 데이터 표시, 프로젝트 일정, 제원, 장비 제어 등 다양한 타입
  - DB와 연결하여 동적 데이터 표시/제어
  - 프로젝트 일정, 제원, 장비와 연결하여 컨트롤 기능 제공
- **위치**: `src/block/`

**관계:**

```
넥사보드
  └─ 넥사패널 (컨테이너)
      └─ 넥사블록 (콘텐츠)

Tiptap 에디터
  └─ 넥사블록 (직접 삽입)

메인 페이지 / 사이드바
  └─ 넥사블록 (직접 사용)
```

- 넥사패널은 넥사보드 전용 컨테이너
- 넥사블록은 넥사패널 없이도 독립 사용 가능
- 넥사블록을 넥사패널로 감싸서 넥사보드에 배치
- 차트는 넥사블록에서 사용

---

### 케이스 5: 대시보드 렌더러

**예:** `NexaDashboardRenderer.vue`, `NexaBoardSetup.vue`

**판단:**

- 넥사보드 시스템의 핵심 인프라
- 전역적으로 사용되지만 넥사보드 컨텍스트에 종속
- 독립적인 확장 계획 (프리셋, 레이아웃 등)
- → `src/board/` (독립 디렉토리 고려)

**현재:** `src/components/` (마이그레이션 고려)

---

## 📝 체크리스트

새 컴포넌트를 만들 때 다음을 확인:

- [ ] 넥사보드 전용 컨테이너인가? (그리드, 드래그앤드롭 등) → `panel/`
- [ ] 독립적인 콘텐츠 단위인가? (패널/에디터/메인 페이지 등에서 사용) → `block/`
- [ ] 프로젝트 전역에서 다양한 데이터로 사용 가능한가? → `charts/` 또는 독립 디렉토리
- [ ] 수십~수백 개로 확장 예정인가? → 독립 디렉토리
- [ ] 특정 페이지/모듈에만 사용되는가? → `components/`
- [ ] 범용 UI 컴포넌트인가? → `components/ui/`
- [ ] 종류별로 폴더 분리가 필요한가? → 독립 디렉토리

---

## 🔄 마이그레이션 기준

기존 컴포넌트를 독립 디렉토리로 이동할 때:

1. **사용 빈도 증가**

   - 여러 모듈에서 사용하게 됨
   - 전역적으로 필요해짐

2. **확장 계획 수립**

   - 수십~수백 개로 확장 예정
   - 종류별 분류 필요

3. **독립적 생명주기**
   - 자체 업데이트/버전 관리 필요
   - 별도 문서화/테스트 필요

---

## 💡 핵심 원칙

**"컨텍스트 의존적" = 특정 페이지/모듈/기능에 종속되어 재사용 범위가 제한적**

**"독립적 시스템" = 프로젝트 전역 사용, 사용자 제어 가능, 대규모 확장 예정**

---

## 📝 네이밍 규칙

### 디렉토리명

- 넥사 시스템의 독립 디렉토리는 접두어 없이 간결하게 명명
- 예: `panel/`, `block/`, `charts/`, `board/`
- 디렉토리명 자체가 네임스페이스 역할

### 파일명

#### 상위 레벨 (베이스 컴포넌트)

- 넥사 시스템의 주요 베이스 컴포넌트 파일명에는 `Nexa` 접두어 사용
- 예: `NexaPanel.vue`, `NexaBlock.vue`, `NexaChart.vue`
- 목적:
  - 구조 파악: 파일명만으로 넥사 시스템임을 즉시 인지
  - 탐색기 사용성: `Nexa`로 검색 시 넥사 시스템 파일만 필터링
  - 넥사 고유 시스템 인지: 다른 라이브러리 컴포넌트와 구분
  - 관리 편의성: IDE에서 `Nexa*` 패턴으로 일괄 검색/변경 가능

#### 하위 디렉토리 (타입별 컴포넌트)

- 하위 디렉토리의 타입별 컴포넌트는 `Nexa` 접두어 제거
- 예: `TimeBlock.vue`, `WeatherBlock.vue`, `ChartBlock.vue`
- 이유:
  - 디렉토리 구조(`block/time/`)가 이미 넥사 시스템임을 나타냄
  - 중복성 제거: `block/time/NexaTimeBlock.vue`에서 `block`과 `Nexa` 중복
  - 간결성: 더 읽기 쉽고 타이핑 부담 감소
  - 계층적 명확성: 상위 레벨과 하위 디렉토리 구분

---

## 📦 현재 프로젝트 예상 구조

### 독립 디렉토리로 이동 예상

```javascript
src/
├── charts/              # 차트 시스템 (이동 예정)
│   ├── NexaChart.vue    # 차트 베이스 컴포넌트
│   ├── line/
│   │   └── LineChart.vue
│   ├── bar/
│   │   └── BarChart.vue
│   ├── pie/
│   │   └── PieChart.vue
│   └── (현재: src/components/charts/)
│
├── panel/               # 넥사패널 시스템 (넥사보드 전용 컨테이너)
│   ├── NexaPanel.vue
│   ├── NexaPanelHeader.vue
│   ├── NexaPanelMenu.vue
│   ├── NexaPanelDialog.vue
│   └── (현재: src/components/AddNexaPanelDialog.vue, src/config/nexaPanelTypes.js)
│
├── block/               # 넥사블록 시스템 (독립적인 콘텐츠 단위)
│   ├── NexaBlock.vue    # 베이스 컴포넌트 (동적 타입 선택용)
│   ├── time/
│   │   └── TimeBlock.vue
│   ├── weather/
│   │   └── WeatherBlock.vue
│   ├── chart/
│   │   └── ChartBlock.vue
│   ├── project/
│   │   ├── ScheduleBlock.vue
│   │   └── SpecBlock.vue
│   └── device/
│       └── ControlBlock.vue
│
├── board/               # 넥사보드 시스템 (이동 예정)
│   ├── NexaDashboardRenderer.vue
│   └── NexaBoardSetup.vue
│   └── (현재: src/components/DashboardRenderer.vue, NexaBoardSetup.vue)
│
└── renderers/           # 데이터 렌더러 (이동 고려)
    └── (현재: src/components/views/)
```

### `src/components/`에 유지

```javascript
src/components/
├── parts-management/   # 부품 관리 모듈 전용
├── form/               # 폼 컴포넌트
├── side-panel/         # 사이드 패널
├── settings/           # 설정 컴포넌트
├── ui/                 # 범용 UI 컴포넌트
├── ProjectConfigEditor.vue
└── TreeNavItem.vue
```

---

---

## 📊 차트 시스템 사용 가이드

### 사용 패턴

차트는 두 가지 방식으로 사용 가능합니다:

#### 패턴 1: 베이스 컴포넌트 사용 (NexaChart)

동적 타입 선택이 필요한 경우 사용:

```javascript
import NexaChart from 'charts/NexaChart.vue'

// 타입 prop으로 차트 선택
<NexaChart type="line" :data="chartData" :options="chartOptions" />
<NexaChart type="bar" :data="chartData" :options="chartOptions" />
<NexaChart type="pie" :data="chartData" :options="chartOptions" />
```

**사용 시나리오:**

- 사용자가 UI에서 차트 타입을 선택할 때
- 차트 타입이 런타임에 결정될 때
- 동일한 인터페이스로 여러 차트를 교체해야 할 때

#### 패턴 2: 타입별 차트 직접 사용

특정 차트를 명확히 사용할 때:

```javascript
import LineChart from 'charts/line/LineChart.vue'
import BarChart from 'charts/bar/BarChart.vue'

// 타입별 차트 직접 사용
<LineChart :data="lineData" :options="lineOptions" />
<BarChart :data="barData" :options="barOptions" />
```

**사용 시나리오:**

- 개발자가 특정 차트를 명확히 사용할 때
- 차트별 특화 옵션이 많을 때
- 타입 안정성이 중요할 때 (TypeScript 지원 시)

### 사용 시나리오

**1. 넥사블록에서 사용**

```javascript
// 넥사블록 내부에서 차트 사용
// 사용자가 차트 타입을 선택하므로 NexaChart 베이스 컴포넌트 사용
import NexaChart from 'charts/NexaChart.vue'

<NexaChart :type="selectedChartType" :data="blockData" />
```

**2. 데이터 렌더러에서 사용**

```javascript
// 데이터 렌더러에서 특정 차트를 명확히 사용
import LineChart from 'charts/line/LineChart.vue'

<LineChart :data="tableData" :options="{ responsive: true }" />
```

**3. 직접 사용**

```javascript
// 페이지에서 직접 차트 사용
import BarChart from 'charts/bar/BarChart.vue'

<BarChart :data="salesData" :options="chartConfig" />
```

### 디렉토리 구조 확장

각 차트 카테고리 디렉토리(`line/`, `bar/`, `pie/` 등)는 해당 타입의 여러 변형을 포함할 수 있습니다:

**예시: 라인 차트 확장**

```javascript
charts/line/
├── LineChart.vue        // 기본 라인 차트
├── AreaLineChart.vue     // 영역 라인 차트 (라인 아래 영역 채움)
├── StepLineChart.vue     // 스텝 라인 차트 (계단식)
├── SmoothLineChart.vue   // 부드러운 라인 차트 (곡선)
└── MultiLineChart.vue    // 다중 라인 차트
```

**예시: 바 차트 확장**

```javascript
charts/bar/
├── BarChart.vue          // 기본 바 차트
├── HorizontalBarChart.vue // 수평 바 차트
├── StackedBarChart.vue   // 스택 바 차트
└── GroupedBarChart.vue   // 그룹 바 차트
```

이렇게 하면:

- 각 카테고리별로 관련 차트들이 그룹화됨
- 새로운 변형 추가가 용이함
- 유지보수가 쉬움

### NexaChart 베이스 컴포넌트 구현 예시

```javascript
// charts/NexaChart.vue
<template>
  <component
    :is="chartComponent"
    v-bind="chartProps"
    v-if="chartComponent"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, required: true }, // 예: 'line', 'line-area', 'line-step' 등
  data: { type: Object, required: true },
  options: { type: Object, default: () => ({}) },
  // ... 기타 공통 props
})

const chartComponent = computed(() => {
  const chartMap = {
    // 기본 타입
    line: () => import('./line/LineChart.vue'),
    bar: () => import('./bar/BarChart.vue'),
    pie: () => import('./pie/PieChart.vue'),
    area: () => import('./area/AreaChart.vue'),
    scatter: () => import('./scatter/ScatterChart.vue'),

    // 라인 차트 변형
    'line-area': () => import('./line/AreaLineChart.vue'),
    'line-step': () => import('./line/StepLineChart.vue'),
    'line-smooth': () => import('./line/SmoothLineChart.vue'),

    // 바 차트 변형
    'bar-horizontal': () => import('./bar/HorizontalBarChart.vue'),
    'bar-stacked': () => import('./bar/StackedBarChart.vue'),

    // 파이 차트 변형
    'pie-doughnut': () => import('./pie/DoughnutChart.vue'),
  }
  return chartMap[props.type]?.()
})

const chartProps = computed(() => {
  // 공통 props와 타입별 props 병합
  return {
    data: props.data,
    options: props.options,
    ...props
  }
})
</script>
```

**사용 예시:**

```javascript
// 기본 라인 차트
<NexaChart type="line" :data="data" />

// 영역 라인 차트
<NexaChart type="line-area" :data="data" />

// 스텝 라인 차트
<NexaChart type="line-step" :data="data" />

// 또는 직접 import
import AreaLineChart from 'charts/line/AreaLineChart.vue'
<AreaLineChart :data="data" />
```

---

## 🎛️ 넥사패널 시스템 사용 가이드

### 사용 패턴

넥사패널은 넥사보드 전용 컨테이너이므로 주로 `NexaPanel` 베이스 컴포넌트를 사용합니다:

```javascript
import NexaPanel from 'panel/NexaPanel.vue'

// 넥사보드에서 패널 사용
<NexaPanel
  :panel-id="panelId"
  :draggable="true"
  :resizable="true"
  :grid-layout="true"
>
  <!-- 넥사블록을 패널 안에 배치 -->
  <NexaBlock type="time" />
</NexaPanel>
```

### 사용 시나리오

**1. 넥사보드에서 사용**

```javascript
// 넥사보드에서 패널을 생성하고 블록을 배치
import NexaPanel from 'panel/NexaPanel.vue'
import NexaBlock from 'block/NexaBlock.vue'

<NexaPanel
  :panel-id="panel.id"
  :x="panel.x"
  :y="panel.y"
  :w="panel.w"
  :h="panel.h"
  :draggable="true"
  :resizable="true"
>
  <NexaBlock :type="panel.blockType" :config="panel.config" />
</NexaPanel>
```

**2. 패널 추가 다이얼로그**

```javascript
// 사용자가 패널을 추가할 때
import NexaPanelDialog from 'panel/NexaPanelDialog.vue'

<NexaPanelDialog
  v-model="showDialog"
  @add-panel="handleAddPanel"
/>
```

**3. 패널 메뉴**

```javascript
// 패널 우클릭 메뉴
import NexaPanelMenu from 'panel/NexaPanelMenu.vue'

<NexaPanelMenu
  :panel-id="panelId"
  @edit="handleEdit"
  @delete="handleDelete"
  @duplicate="handleDuplicate"
/>
```

### NexaPanel 컴포넌트 구조

```javascript
// panel/NexaPanel.vue
<template>
  <div
    class="nexa-panel"
    :class="{ 'is-dragging': isDragging, 'is-resizing': isResizing }"
    :style="panelStyle"
  >
    <NexaPanelHeader
      :title="title"
      :panel-id="panelId"
      @menu-click="showMenu = true"
    />

    <div class="nexa-panel-content">
      <slot />
      <!-- 넥사블록이 여기에 배치됨 -->
    </div>

    <NexaPanelMenu
      v-if="showMenu"
      :panel-id="panelId"
      @close="showMenu = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import NexaPanelHeader from './NexaPanelHeader.vue'
import NexaPanelMenu from './NexaPanelMenu.vue'

const props = defineProps({
  panelId: { type: String, required: true },
  title: { type: String, default: '패널' },
  draggable: { type: Boolean, default: true },
  resizable: { type: Boolean, default: true },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  w: { type: Number, default: 4 },
  h: { type: Number, default: 5 },
})

const showMenu = ref(false)
const isDragging = ref(false)
const isResizing = ref(false)

const panelStyle = computed(() => ({
  gridColumn: `span ${props.w}`,
  gridRow: `span ${props.h}`,
}))
</script>
```

---

## 📋 데이터 렌더러 시스템 사용 가이드

### 분리의 장점 및 목적

`src/components/views/`에서 `src/renderers/`로 분리하는 주요 목적:

1. **개념적 명확성**

   - `components/` = 페이지/모듈 전용 컴포넌트
   - `renderers/` = 데이터 렌더링 전용 시스템
   - 역할이 명확히 구분되어 혼동 방지

2. **독립적 확장성**

   - 렌더러 시스템이 독립적으로 확장 가능
   - 수십 개의 렌더러 추가 시에도 구조가 명확
   - 렌더러 관련 설정/유틸리티를 `renderers/` 내에 집중 관리

3. **재사용성 향상**

   - 절대 경로로 간단하게 import (`renderers/DataTableRenderer.vue`)
   - 여러 모듈에서 동일한 렌더러 재사용 용이
   - 의존성 방향이 명확: `components/` → `renderers/` (단방향)

4. **성능 최적화**

   - 렌더러 시스템을 독립적으로 코드 스플리팅 가능
   - 필요한 렌더러만 동적으로 로드
   - 사용하지 않는 렌더러는 번들에서 제외

5. **테스트 및 문서화**
   - 렌더러 시스템 전용 테스트/문서 관리 가능
   - 독립적인 시스템으로 문서화 용이

### 사용 패턴

렌더러는 직접 import하여 사용합니다:

```javascript
import DataTableRenderer from 'renderers/DataTableRenderer.vue'
import DataCardRenderer from 'renderers/DataCardRenderer.vue'

// 렌더러 직접 사용
<DataTableRenderer
  :data="tableData"
  :columns="columns"
  :options="rendererOptions"
/>
<DataCardRenderer
  :data="cardData"
  :layout="cardLayout"
/>
```

**사용 시나리오:**

- 개발자가 특정 렌더러를 명확히 사용할 때
- 렌더러별 특화 옵션이 많을 때
- 타입 안정성이 중요할 때 (TypeScript 지원 시)

### 사용 시나리오

**1. 넥사블록에서 사용 (권장)**

```javascript
// 넥사블록 내부에서 렌더러 사용
// block/data/DataTableBlock.vue
<template>
  <DataTableRenderer
    :data="processedData"
    :columns="columns"
    :options="rendererOptions"
  />
</template>

<script setup>
import DataTableRenderer from 'renderers/DataTableRenderer.vue'

const props = defineProps({
  dataSource: { type: String, required: true },
  // ... 블록 설정
})

// 블록이 데이터를 가공하여 렌더러에 전달
const processedData = computed(() => {
  // 데이터 가공 로직
  return processData(props.dataSource)
})
</script>
```

**2. 넥사패널에서 직접 사용**

```javascript
// 넥사패널에서 직접 렌더러 사용 (특수한 경우)
// panel/NexaPanel.vue
<template>
  <div class="nexa-panel">
    <NexaPanelHeader />
    <div class="panel-content">
      <!-- 패널이 직접 렌더러 사용 -->
      <DataTableRenderer
        :data="panelSpecificData"
        :columns="panelSpecificColumns"
      />
    </div>
  </div>
</template>

<script setup>
import DataTableRenderer from 'renderers/DataTableRenderer.vue'
</script>
```

**3. 일반 컴포넌트에서 사용**

```javascript
// 부품 관리 모듈에서 렌더러 사용
// components/parts-management/PartClassesView.vue
<template>
  <div>
    <DataTableRenderer
      :data="partsData"
      :columns="partColumns"
      :options="tableOptions"
    />
  </div>
</template>

<script setup>
import DataTableRenderer from 'renderers/DataTableRenderer.vue'
</script>
```

### 구조 관계

렌더러는 넥사패널, 넥사블록, 일반 컴포넌트에서 모두 사용 가능합니다:

```
넥사보드
  └─ 넥사패널 (컨테이너)
      └─ 넥사블록 (콘텐츠)
          └─ 렌더러 (데이터 표시)

또는

넥사보드
  └─ 넥사패널 (컨테이너)
      └─ 렌더러 (직접 사용, 특수한 경우)

일반 페이지
  └─ 일반 컴포넌트
      └─ 렌더러 (데이터 표시)
```

**권장 구조:**

- 일반적인 경우: 패널 → 블록 → 렌더러 (간접 사용)
- 특수한 경우: 패널 → 렌더러 (직접 사용)

이렇게 하면:

- 블록이 렌더러 설정을 캡슐화하여 재사용성 향상
- 패널은 컨테이너 역할에 집중
- 렌더러는 독립적으로 관리되어 유지보수 용이

### DataTableRenderer 구현 예시

```javascript
// renderers/DataTableRenderer.vue
<template>
  <div class="data-table-renderer">
    <q-table
      :rows="rows"
      :columns="displayColumns"
      :loading="loading"
      v-model:pagination="localPagination"
      :row-key="rowKey"
      flat
      bordered
    >
      <!-- 테이블 슬롯 -->
      <template v-slot:header="props">
        <slot name="header" :props="props" />
      </template>

      <template v-slot:body="props">
        <slot name="body" :props="props" />
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  data: { type: Array, required: true },
  columns: { type: Array, required: true },
  options: { type: Object, default: () => ({}) },
  rowKey: { type: String, default: 'id' },
  loading: { type: Boolean, default: false },
})

const rows = computed(() => props.data)
const displayColumns = computed(() => props.columns)
const localPagination = ref({
  page: 1,
  rowsPerPage: props.options.rowsPerPage || 10,
})
</script>
```

---

## 🔗 넥사패널과 넥사블록의 관계

### 사용 패턴

넥사블록은 두 가지 방식으로 사용 가능합니다:

#### 패턴 1: 베이스 컴포넌트 사용 (NexaBlock)

동적 타입 선택이 필요한 경우 사용:

```javascript
import NexaBlock from 'block/NexaBlock.vue'

// 타입 prop으로 블록 선택
<NexaBlock type="time" :location="auto" />
<NexaBlock type="weather" :location="seoul" />
<NexaBlock type="chart" :data-source="db://parts" />
```

**사용 시나리오:**

- 사용자가 UI에서 블록 타입을 선택할 때 (넥사보드, 에디터)
- 블록 타입이 런타임에 결정될 때
- 동일한 인터페이스로 여러 블록을 교체해야 할 때

#### 패턴 2: 타입별 블록 직접 사용

특정 블록을 명확히 사용할 때:

```javascript
import TimeBlock from 'block/time/TimeBlock.vue'
import WeatherBlock from 'block/weather/WeatherBlock.vue'

// 타입별 블록 직접 사용
<TimeBlock :location="auto" :format="12h" />
<WeatherBlock :location="seoul" :show-chart="true" />
```

**사용 시나리오:**

- 개발자가 특정 블록을 명확히 사용할 때 (메인 페이지, 사이드바)
- 타입별 특화 props가 많을 때
- 타입 안정성이 중요할 때 (TypeScript 지원 시)

### 사용 시나리오

**1. 넥사보드에서 사용**

```javascript
// 넥사보드에서 넥사패널로 넥사블록을 감싸서 사용
// 사용자가 블록을 선택하므로 NexaBlock 베이스 컴포넌트 사용
<NexaPanel :panel-id="panelId" :draggable="true" :resizable="true">
  <NexaBlock :type="selectedBlockType" :config="blockConfig" />
</NexaPanel>
```

**2. Tiptap 에디터에서 사용**

```javascript
// 에디터에서 사용자가 블록을 선택하므로 NexaBlock 베이스 컴포넌트 사용
<Editor>
  <NexaBlock type="project-schedule" :project-id="123" />
  <NexaBlock type="chart" :data-source="db://parts" />
</Editor>

// 또는 개발자가 특정 블록을 명확히 사용할 때는 직접 import
import ScheduleBlock from 'block/project/ScheduleBlock.vue'
<ScheduleBlock :project-id="123" :show-details="true" />
```

**3. 메인 페이지에서 사용**

```javascript
// 메인 페이지는 고정된 블록을 사용하므로 타입별 블록 직접 사용 권장
import TimeBlock from 'block/time/TimeBlock.vue'
import WeatherBlock from 'block/weather/WeatherBlock.vue'

<TimeBlock :location="auto" :format="12h" />
<WeatherBlock :location="auto" :show-chart="true" />
```

**4. 사이드바에서 사용**

```javascript
// 사이드바도 고정된 블록을 사용하므로 타입별 블록 직접 사용 권장
import TimeBlock from 'block/time/TimeBlock.vue'

<TimeBlock :compact="true" :format="24h" />
```

### Tiptap 에디터 통합

- **DB 데이터 삽입**: 사용자가 에디터에서 "부품 삽입" → DB 조회 → `NexaBlock`으로 삽입
- **차트 삽입**: 사용자가 "차트 삽입" 선택 → `NexaBlock type="chart"` 또는 `ChartBlock` 직접 사용
- **프로젝트 일정 삽입**: `NexaBlock type="project-schedule"` 또는 `ScheduleBlock` 직접 사용
- **장비 제어 삽입**: `NexaBlock type="device-control"` 또는 `ControlBlock` 직접 사용

### NexaBlock 베이스 컴포넌트 구현 예시

```javascript
// block/NexaBlock.vue
<template>
  <component
    :is="blockComponent"
    v-bind="blockProps"
    v-if="blockComponent"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, required: true },
  // ... 기타 공통 props
})

const blockComponent = computed(() => {
  const blockMap = {
    time: () => import('./time/TimeBlock.vue'),
    weather: () => import('./weather/WeatherBlock.vue'),
    chart: () => import('./chart/ChartBlock.vue'),
    'project-schedule': () => import('./project/ScheduleBlock.vue'),
    'device-control': () => import('./device/ControlBlock.vue'),
  }
  return blockMap[props.type]?.()
})

const blockProps = computed(() => {
  // 공통 props와 타입별 props 병합
  return { ...props }
})
</script>
```

---

## 📌 문서 관리

**작성자:** AI Assistant  
**최종 수정일:** 2024년  
**문서 파일명:** `[STRUCTURE] system-architecture-component-structure.md`

> **참고**: 이 문서의 파일명은 프로젝트 구조 관련 문서임을 나타내는 `[STRUCTURE]` 접두어를 사용합니다. 파일명 변경 시 이 문서 내의 파일명 언급도 함께 업데이트해야 합니다.
