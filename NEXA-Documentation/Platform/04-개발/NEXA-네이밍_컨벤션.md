# NEXA 네이밍 컨벤션

**작성일**: 2025-01-27  
**목적**: NEXA Platform 프로젝트 전반에 적용되는 네이밍 규칙 통합 가이드  
**버전**: 1.0

---

## 📋 목차

1. [localStorage 키 네이밍](#1-localstorage-키-네이밍)
2. [파일명 규칙](#2-파일명-규칙)
3. [변수명/함수명 규칙](#3-변수명함수명-규칙)
4. [컴포넌트 네이밍](#4-컴포넌트-네이밍)
5. [타입/인터페이스 네이밍](#5-타입인터페이스-네이밍)
6. [참고 문서](#참고-문서)

---

## 1. localStorage 키 네이밍

### 규칙

**localStorage 키는 의미 있는 이름을 사용하며, 접두어는 불필요합니다.**

### 형식

```
{기능명 또는 모듈명}-{데이터 타입}
```

**가독성을 위해 첫 글자만 대문자 사용 가능:**

```
{기능명 또는 모듈명}-{데이터 타입}  (kebab-case, 권장)
{기능명 또는 모듈명}-{데이터 타입}  (첫 글자 대문자, 허용)
```

### 예시

```javascript
// ✅ 올바른 예시 (kebab-case, 권장)
const HISTORY_KEY = 'part-classes-search-history'
const FIELDS_KEY = 'part-classes-search-fields'
const SETTINGS_KEY = 'user-settings'
const PREFERENCES_KEY = 'dashboard-preferences'
const BOARD_MENU_KEY = 'board-menu-nodes'
const MERMAID_STYLE_KEY = 'mermaid-style:'

// ✅ 올바른 예시 (첫 글자 대문자, 가독성 향상)
const HISTORY_KEY = 'Part-classes-search-history'
const SETTINGS_KEY = 'User-settings'
const BOARD_MENU_KEY = 'Board-menu-nodes'

// ❌ 잘못된 예시
const HISTORY_KEY = 'NEXA-part-classes-search-history' // 불필요한 접두어
const FIELDS_KEY = 'searchFields' // camelCase는 localStorage 키에 부적합
const OLD_KEY = 'boardMenuDataNexa' // camelCase, 일관성 없음
```

### 이유

1. **간결성**: 불필요한 접두어 제거로 키 이름 간결화
2. **가독성**: 의미 있는 이름만으로도 용도 파악 가능
3. **일관성**: 프로젝트 내에서 일관된 네이밍 패턴 유지
4. **충돌 가능성 낮음**: 단일 도메인 애플리케이션에서는 다른 웹사이트와의 충돌 가능성이 낮음

### 사용 패턴

#### 검색 히스토리

```javascript
// TableFilterBar 컴포넌트 사용 시
<TableFilterBar
  :history-storage-key="'part-classes-search-history'"
  :search-fields-storage-key="'part-classes-search-fields'"
  ...
/>
```

#### 사용자 설정

```javascript
// 사용자 설정 저장
localStorage.setItem('user-settings', JSON.stringify(settings))
const settings = JSON.parse(localStorage.getItem('user-settings'))
```

#### 테이블별 데이터

```javascript
// 각 테이블은 고유한 키 사용
const PARTS_HISTORY_KEY = 'parts-search-history'
const INVENTORY_HISTORY_KEY = 'inventory-search-history'
const ORDERS_HISTORY_KEY = 'orders-search-history'
```

### 네이밍 규칙

- **kebab-case 사용** (권장): 모든 키는 소문자와 하이픈으로 구성
- **첫 글자 대문자 허용**: 가독성을 위해 첫 글자만 대문자 사용 가능 (예: `User-settings`)
- **명확한 의미**: 키 이름만 봐도 용도를 알 수 있어야 함
- **일관성 유지**: 프로젝트 전체에서 동일한 네이밍 패턴 사용
- **접두어 불필요**: `NEXA-` 같은 접두어는 사용하지 않음

### 마이그레이션

기존에 `NEXA-` 접두어가 있는 키가 있다면, 마이그레이션 스크립트를 작성하여 접두어를 제거해야 합니다.

```javascript
// 마이그레이션 예시: NEXA- 접두어 제거
function migrateLocalStorageKeys() {
  const keysToMigrate = [
    'NEXA-part-classes-search-history',
    'NEXA-part-classes-search-fields',
    'NEXA-user-settings',
    'NEXA-board-menu-nodes',
    // ... 기타 키들
  ]

  keysToMigrate.forEach((oldKey) => {
    const value = localStorage.getItem(oldKey)
    if (value) {
      // NEXA- 접두어 제거
      const newKey = oldKey.replace(/^NEXA-/, '')
      localStorage.setItem(newKey, value)
      localStorage.removeItem(oldKey)
    }
  })
}
```

### 데이터 관리 가이드라인

- **최대 개수 제한**: 배열 데이터는 적절한 최대 개수 제한을 설정 (예: 검색 히스토리 30개)
- **오래된 데이터 삭제**: 최신 항목 우선 유지, 오래된 항목 자동 삭제
- **에러 처리**: localStorage 저장/로드 시 try-catch로 에러 처리 필수

---

## 2. 파일명 규칙

### 2.1 Vue 컴포넌트 파일명

#### 상위 레벨 (베이스 컴포넌트)

**NEXA 시스템의 주요 베이스 컴포넌트 파일명에는 `Nexa` 접두어 사용**

- ✅ `NexaPanel.vue`
- ✅ `NexaBlock.vue`
- ✅ `NexaChart.vue`
- ✅ `NexaBoard.vue`

**목적:**

- 구조 파악: 파일명만으로 NEXA 시스템임을 즉시 인지
- 탐색기 사용성: `Nexa`로 검색 시 NEXA 시스템 파일만 필터링
- NEXA 고유 시스템 인지: 다른 라이브러리 컴포넌트와 구분
- 관리 편의성: IDE에서 `Nexa*` 패턴으로 일괄 검색/변경 가능

#### 하위 디렉토리 (타입별 컴포넌트)

**하위 디렉토리의 타입별 컴포넌트는 `Nexa` 접두어 제거**

- ✅ `TimeBlock.vue` (위치: `block/time/`)
- ✅ `WeatherBlock.vue` (위치: `block/weather/`)
- ✅ `ChartBlock.vue` (위치: `block/chart/`)

**이유:**

- 디렉토리 구조(`block/time/`)가 이미 NEXA 시스템임을 나타냄
- 중복성 제거: `block/time/NexaTimeBlock.vue`에서 `block`과 `Nexa` 중복
- 간결성: 더 읽기 쉽고 타이핑 부담 감소
- 계층적 명확성: 상위 레벨과 하위 디렉토리 구분

#### 일반 컴포넌트

**일반 컴포넌트는 PascalCase 사용**

- ✅ `PartClassesView.vue`
- ✅ `TableFilterBar.vue`
- ✅ `DataTableRenderer.vue`

### 2.2 SCSS 파일명 규칙

#### 언더바(\_) 사용 규칙

**언더바로 시작하는 파일 (`_filename.scss`):**

- **Sass/SCSS Partial 파일**: 언더바로 시작하는 파일은 "partial"로 인식됨
- **직접 컴파일되지 않음**: Sass 컴파일러가 이 파일을 별도로 CSS로 변환하지 않음
- **@import 전용**: 다른 파일에서 `@import`로만 사용됨
- **모듈화**: 재사용 가능한 스타일을 모듈화할 때 사용

**언더바 없이 시작하는 파일 (`filename.scss`):**

- **메인 파일**: 직접 컴파일되어 CSS로 변환됨
- **진입점**: `quasar.config.js`에서 직접 import하는 파일
- **독립 실행**: 단독으로 사용되는 스타일 파일

**예시:**

```scss
// ✅ Partial 파일 (언더바 사용)
// _variables.scss - 다른 파일에서 import만 함
@import 'variables'; // 언더바와 확장자 생략 가능

// ✅ 메인 파일 (언더바 없음)
// app.scss - quasar.config.js에서 직접 import
```

#### SCSS 파일명 네이밍 컨벤션

**권장 규칙:**

1. **소문자 + 하이픈** (일반적 관례, 레벨 1-5)

   - ✅ `quasar.variables.scss`
   - ✅ `nexa-system.scss`
   - ✅ `table-filter-bar.scss`

2. **대문자 시작** (Vue 컴포넌트명과 일치, 레벨 6)

   - ✅ `PartClassesView.scss` (Vue 컴포넌트명과 일치)
   - ✅ `TableFilterBar.scss` (Vue 컴포넌트명과 일치)
   - ⚠️ 프로젝트 전체에서 일관성 유지 필요

3. **언더바 사용** (Partial 파일만)
   - ✅ `_variables.scss` (Partial)
   - ✅ `_mixins.scss` (Partial)
   - ✅ `_item.scss` (Partial)
   - ❌ `variables.scss` (Partial이 아닌 경우 언더바 불필요)

#### 레벨별 파일명 규칙

| 레벨       | 파일명 패턴                                        | 예시                                           | 설명                                         |
| ---------- | -------------------------------------------------- | ---------------------------------------------- | -------------------------------------------- |
| **레벨 1** | `quasar.variables.scss`                            | `quasar.variables.scss`                        | Quasar 변수 파일, 직접 import                |
| **레벨 2** | `_filename.scss`                                   | `_mixins.scss`, `_functions.scss`              | Partial 파일, import 전용                    |
| **레벨 3** | `app.scss`                                         | `app.scss`                                     | 메인 전역 파일, 직접 import                  |
| **레벨 4** | `theme-name.scss` 또는 `_variables.scss`           | `dark.scss`, `light.scss`, `_variables.scss`   | 테마 파일은 직접 import, 공통 변수는 partial |
| **레벨 5** | `nexa-system.scss` (메인), `_filename.scss` (부분) | `nexa-system.scss`, `_item.scss`, `_card.scss` | 메인은 직접 import, 부분은 partial           |
| **레벨 6** | `ComponentName.scss` 또는 `component-name.scss`    | `PartClassesView.scss`, `TableFilterBar.scss`  | Vue 컴포넌트명과 일치 권장                   |

**권장 접근법:**

- **레벨 1-5**: 소문자 + 하이픈 사용 (일반 관례)
- **레벨 6**: Vue 컴포넌트명과 일치시키기 위해 대문자 시작 허용
  - 예: `PartClassesView.vue` → `PartClassesView.scss`
  - 예: `TableFilterBar.vue` → `TableFilterBar.scss`

### 2.3 Store 파일명 규칙

**Pinia Store 파일명 규칙:**

- **파일명**: `{domain}Store.js` (camelCase + Store 접미사)
  - ✅ `partsDataStore.js`
  - ✅ `dashboardLayoutStore.js`
  - ✅ `projectTreeStore.js`

**예시:**

```javascript
// ✅ Store 파일명: camelCase + Store 접미사
// dashboardLayoutStore.js
export const useDashboardLayoutStore = defineStore('dashboardLayout', () => {
  // 'dashboardLayout' = kebab-case (Store ID)
})
```

---

## 3. 변수명/함수명 규칙

### 3.1 일반 변수명/함수명

#### camelCase 사용

**일반 변수와 함수는 camelCase 사용**

```javascript
// ✅ 올바른 예시
const userName = 'John'
const itemCount = 10
const searchHistory = []

function getUserData() { ... }
function calculateTotal() { ... }
function handleClick() { ... }
```

#### 상수는 UPPER_SNAKE_CASE 사용

```javascript
// ✅ 상수는 대문자 + 언더바
const MAX_ITEMS = 100
const API_BASE_URL = 'https://api.example.com'
const DEFAULT_TIMEOUT = 5000
```

### 3.2 Store 관련 네이밍

**Pinia Store 네이밍 규칙:**

| 항목     | 규칙                   | 예시                  |
| -------- | ---------------------- | --------------------- |
| 파일명   | `{domain}Store.js`     | `partsDataStore.js`   |
| Store ID | kebab-case             | `'parts-data'`        |
| 함수명   | `use{PascalCase}Store` | `usePartsDataStore()` |
| 변수명   | `{domain}Store`        | `partsDataStore`      |

**예시:**

```javascript
// ✅ Store 파일: partsDataStore.js
export const usePartsDataStore = defineStore('parts-data', () => {
  const parts = ref([])
  const loading = ref(false)

  function fetchParts() { ... }

  return { parts, loading, fetchParts }
})

// ✅ 사용 시
const partsDataStore = usePartsDataStore()
```

### 3.3 컴포넌트 내부 네이밍

**Vue 컴포넌트 내부 변수/함수:**

```javascript
// ✅ ref 변수
const formData = ref({})
const isLoading = ref(false)

// ✅ computed
const filteredItems = computed(() => { ... })

// ✅ 함수
function handleSubmit() { ... }
function onRowClick() { ... }
```

---

## 4. 컴포넌트 네이밍

### 4.1 Vue 컴포넌트명

**PascalCase 사용**

- ✅ `PartClassesView.vue`
- ✅ `TableFilterBar.vue`
- ✅ `DataTableRenderer.vue`
- ✅ `NexaPanel.vue` (베이스 컴포넌트)

### 4.2 컴포넌트 클래스명

**컴포넌트 내부 클래스명은 kebab-case 사용**

```vue
<template>
  <div class="part-classes-view">
    <div class="table-filter-bar">
      <!-- ... -->
    </div>
  </div>
</template>

<style scoped>
.part-classes-view {
  /* ... */
}
</style>
```

---

## 5. 타입/인터페이스 네이밍

### 5.1 TypeScript 타입/인터페이스

**PascalCase 사용, 접두어로 타입 구분**

```typescript
// ✅ 인터페이스
interface ComponentContract { ... }
interface BoardComponent { ... }
interface NodeComponent { ... }

// ✅ 타입 별칭
type BoardType = 'single' | 'split-lr' | 'l-shape'
type ComponentType = 'board' | 'node' | 'chart'

// ✅ 제네릭 타입
interface Store<T> { ... }
```

### 5.2 열거형(Enum)

**PascalCase 사용**

```typescript
// ✅ Enum
enum ViewMode {
  Card = 'card',
  Table = 'table',
  List = 'list',
}

enum ComponentType {
  Board = 'board',
  Node = 'node',
  Chart = 'chart',
}
```

---

## 6. 네이밍 규칙 요약

### 케이스별 사용 가이드

| 항목                  | 케이스                                | 예시                                               |
| --------------------- | ------------------------------------- | -------------------------------------------------- |
| localStorage 키       | kebab-case (권장) 또는 첫 글자 대문자 | `part-classes-history` 또는 `Part-classes-history` |
| 파일명 (Vue)          | PascalCase                            | `PartClassesView.vue`                              |
| 파일명 (SCSS 메인)    | kebab-case                            | `nexa-system.scss`                                 |
| 파일명 (SCSS Partial) | `_` + kebab-case                      | `_variables.scss`                                  |
| 파일명 (Store)        | camelCase                             | `partsDataStore.js`                                |
| 변수명                | camelCase                             | `userName`, `itemCount`                            |
| 함수명                | camelCase                             | `getUserData()`, `handleClick()`                   |
| 상수                  | UPPER_SNAKE_CASE                      | `MAX_ITEMS`, `API_BASE_URL`                        |
| 컴포넌트명            | PascalCase                            | `PartClassesView`                                  |
| 클래스명 (CSS)        | kebab-case                            | `.part-classes-view`                               |
| 타입/인터페이스       | PascalCase                            | `ComponentContract`                                |
| Store 함수            | `use` + PascalCase                    | `usePartsDataStore()`                              |

---

## 참고 문서

- **[NEXA-SCSS_ARCHITECTURE.md](./NEXA-SCSS_ARCHITECTURE.md)**: SCSS 파일명 규칙 상세 가이드
- **[PINIA_GUIDE.md](./PINIA_GUIDE.md)**: Store 네이밍 및 사용 가이드
- **[CORE/[STRUCTURE] 컴포넌트ㅡ 조직화 가이드.md](./CORE/[STRUCTURE]%20컴포넌트ㅡ%20조직화%20가이드%20.md)**: 컴포넌트 파일명 규칙 상세
- **[TERMINOLOGY_GUIDE.md](./TERMINOLOGY_GUIDE.md)**: 용어 정리 및 네이밍 변경 가이드

---

**마지막 업데이트**: 2025-01-27  
**작성자**: NEXA Platform Development Team
