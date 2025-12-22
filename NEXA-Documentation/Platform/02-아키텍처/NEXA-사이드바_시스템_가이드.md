# NEXA 사이드바 시스템 가이드

**작성일**: 2024년  
**목적**: 왼쪽/오른쪽 사이드바와 중앙 컨텐츠 간 통신 구조화 및 관리 가능한 파일 구조 정립  
**버전**: 1.0

---

## 📋 개요

NEXA Platform의 사이드바 시스템은 **왼쪽 사이드바**, **중앙 컨텐츠**, **오른쪽 사이드바**로 구성되어 있으며, 각 모듈을 재사용 가능하도록 만들고 적절한 성격에 맞춰 좌측/우측에 배치합니다. 또한 세 영역 간 통신이 원활하게 이루어지도록 구조화되어 있습니다.

### 핵심 목표

1. **모듈 재사용성**: 각종 모듈을 재사용 가능하도록 구조화
2. **적절한 배치**: 모듈의 성격에 맞춰 좌측/우측에 배치
3. **원활한 통신**: 왼쪽 사이드바 ↔ 중앙 컨텐츠 ↔ 오른쪽 사이드바 간 통신 구조화
4. **관리 용이성**: 관리가 쉬운 파일 구조 정립

---

## 🏗️ 아키텍처

### 전체 구조

```
┌─────────────────────────────────────────────────────────┐
│                    MainLayout.vue                        │
├──────────────┬──────────────────────┬───────────────────┤
│              │                      │                   │
│ 왼쪽 사이드바 │    중앙 컨텐츠       │  오른쪽 사이드바   │
│              │                      │                   │
│ (Left)       │    (Center)          │  (Right)          │
│              │                      │                   │
└──────────────┴──────────────────────┴───────────────────┘
       ↕                ↕                    ↕
   통신 구조         통신 구조            통신 구조
```

### 통신 구조

#### 1. 왼쪽 사이드바 ↔ 중앙 컨텐츠

- **역할**: 네비게이션, 목록, 필터 등
- **통신 방식**: 
  - Store (Pinia)를 통한 상태 공유
  - 이벤트 버스 (필요 시)
  - Props/Emits (직접 통신)

#### 2. 중앙 컨텐츠 ↔ 오른쪽 사이드바

- **역할**: 도구, 속성, 설정 등
- **통신 방식**:
  - Store (Pinia)를 통한 상태 공유
  - 이벤트 버스 (필요 시)
  - Props/Emits (직접 통신)

#### 3. 왼쪽 사이드바 ↔ 오른쪽 사이드바

- **역할**: 간접 통신 (중앙 컨텐츠를 통한 통신)
- **통신 방식**:
  - Store (Pinia)를 통한 간접 통신
  - 중앙 컨텐츠를 통한 이벤트 전달

---

## 📁 파일 구조

### 권장 파일 구조

```
src/
├── components/
│   └── sidebars/
│       ├── left/                    # 왼쪽 사이드바
│       │   ├── NexaBoardSidebar.vue
│       │   ├── PartsManagementSidebar.vue
│       │   └── DocumentListSidebar.vue
│       └── right/                   # 오른쪽 사이드바
│           ├── NexaBoardToolsPanel.vue
│           ├── DevToolsPanel.vue
│           └── DefaultRightPanel.vue
│
├── config/
│   └── sidebarRegistry.js          # 사이드바 등록 및 설정
│
├── stores/                          # 상태 관리
│   ├── sidebarStore.js              # 사이드바 공통 상태
│   └── [module]Store.js             # 모듈별 상태
│
└── layouts/
    └── MainLayout.vue               # 메인 레이아웃
```

### 모듈별 구조 (재사용 가능한 모듈)

```
src/components/sidebars/
├── left/
│   └── [module]/
│       ├── [Module]Sidebar.vue      # 메인 사이드바
│       └── components/              # 재사용 가능한 하위 컴포넌트
│           ├── FilterPanel.vue
│           ├── NavigationList.vue
│           └── SearchBar.vue
└── right/
    └── [module]/
        ├── [Module]ToolsPanel.vue   # 메인 도구 패널
        └── components/               # 재사용 가능한 하위 컴포넌트
            ├── PropertyEditor.vue
            ├── ActionButtons.vue
            └── SettingsPanel.vue
```

---

## 🔄 통신 구조 상세

### 1. Store 기반 통신 (권장)

#### 사이드바 공통 Store

```javascript
// src/stores/sidebarStore.js
import { defineStore } from 'pinia'

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    leftOpen: true,
    rightOpen: false,
    activeLeftMenu: null,
    activeRightMenu: null,
  }),
  
  actions: {
    toggleLeft() {
      this.leftOpen = !this.leftOpen
    },
    toggleRight() {
      this.rightOpen = !this.rightOpen
    },
  },
})
```

#### 모듈별 Store

```javascript
// src/stores/partsManagementStore.js
import { defineStore } from 'pinia'

export const usePartsManagementStore = defineStore('partsManagement', {
  state: () => ({
    selectedPart: null,
    filterOptions: {},
    viewMode: 'list',
  }),
  
  actions: {
    selectPart(part) {
      this.selectedPart = part
      // 중앙 컨텐츠와 오른쪽 사이드바에 자동 반영
    },
  },
})
```

### 2. 이벤트 기반 통신

```javascript
// 이벤트 버스 사용 (필요 시)
import { EventBus } from 'src/utils/eventBus'

// 왼쪽 사이드바에서 이벤트 발생
EventBus.emit('part-selected', partData)

// 중앙 컨텐츠에서 이벤트 수신
EventBus.on('part-selected', (partData) => {
  // 컨텐츠 업데이트
})
```

### 3. Props/Emits 직접 통신

```vue
<!-- MainLayout.vue -->
<template>
  <LeftSidebar 
    :selected-item="selectedItem"
    @item-selected="handleItemSelected"
  />
  <CenterContent 
    :selected-item="selectedItem"
    @content-updated="handleContentUpdated"
  />
  <RightSidebar 
    :selected-item="selectedItem"
    :content-data="contentData"
  />
</template>
```

---

## ➕ 사이드바 추가 방법

### 1단계: 사이드바 컴포넌트 생성

#### 왼쪽 사이드바 예시

```bash
# 파일 생성
src/components/sidebars/left/PortfolioSidebar.vue
```

```vue
<!-- PortfolioSidebar.vue -->
<template>
  <div class="portfolio-sidebar">
    <q-list>
      <q-item>
        <q-item-section>
          <q-item-label>포트폴리오 사이드바</q-item-label>
        </q-item-section>
      </q-item>
      <!-- 사이드바 내용 -->
    </q-list>
  </div>
</template>

<script setup>
import { usePortfolioStore } from 'src/stores/portfolioStore'

const portfolioStore = usePortfolioStore()

// Store를 통한 통신
const handleItemClick = (item) => {
  portfolioStore.selectItem(item)
}
</script>

<style lang="scss" scoped>
.portfolio-sidebar {
  height: 100%;
}
</style>
```

#### 오른쪽 사이드바 예시

```bash
# 파일 생성
src/components/sidebars/right/PortfolioToolsPanel.vue
```

```vue
<!-- PortfolioToolsPanel.vue -->
<template>
  <div class="portfolio-tools-panel">
    <div class="q-pa-md">
      <div class="text-h6">포트폴리오 도구</div>
      <!-- 도구 패널 내용 -->
    </div>
  </div>
</template>

<script setup>
import { usePortfolioStore } from 'src/stores/portfolioStore'

const portfolioStore = usePortfolioStore()

// Store를 통한 통신
const selectedItem = computed(() => portfolioStore.selectedItem)
</script>
```

### 2단계: sidebarRegistry.js에 등록

```javascript
// src/config/sidebarRegistry.js

const leftSidebarConfigs = {
  // 기존 등록...
  'nexa-board': { ... },
  'parts-management': { ... },
  
  // 새 사이드바 추가
  'portfolio': {
    component: () => import('src/components/sidebars/left/PortfolioSidebar.vue'),
    behavior: {
      autoOpen: false,
      showMessage: false,
      respectMobileHidden: true,
      defaultOpen: true,
      saveState: true,
      message: null,
    },
  },
}

const rightSidebarConfigs = {
  // 기존 등록...
  'nexa-board': { ... },
  
  // 새 사이드바 추가
  'portfolio': {
    component: () => import('src/components/sidebars/right/PortfolioToolsPanel.vue'),
    behavior: {
      autoOpen: false,
      showMessage: false,
      respectMobileHidden: true,
      defaultOpen: false,
      saveState: true,
      message: null,
    },
  },
  
  // 기본 패널 (등록되지 않은 메뉴용)
  default: { ... },
}
```

### 3단계: Store 생성 (필요 시)

```javascript
// src/stores/portfolioStore.js
import { defineStore } from 'pinia'

export const usePortfolioStore = defineStore('portfolio', {
  state: () => ({
    selectedItem: null,
    items: [],
  }),
  
  actions: {
    selectItem(item) {
      this.selectedItem = item
    },
  },
})
```

---

## ⚙️ 설정 옵션

### `SidebarBehaviorConfig`

각 사이드바는 다음 설정을 가질 수 있습니다:

```typescript
{
  autoOpen: boolean,           // 컨텐츠에 따라 자동으로 열지 여부
  showMessage: boolean,        // 안내 메시지만 보여줄지 여부
  respectMobileHidden: boolean, // 모바일에서 숨김 상태를 유지할지 여부
  defaultOpen: boolean,        // 기본 열림 상태 (최초 진입 시)
  saveState: boolean,         // 열림/닫힘 상태를 저장할지 여부
  message: string | null,      // 안내 메시지 (showMessage가 true일 때)
}
```

### 설정 예시

#### 예시 1: 기본 사이드바 (상태 저장)

```javascript
'parts-management': {
  component: () => import('src/components/sidebars/left/PartsManagementSidebar.vue'),
  behavior: {
    autoOpen: false,
    showMessage: false,
    respectMobileHidden: true,
    defaultOpen: true,
    saveState: true,
    message: null,
  },
}
```

#### 예시 2: 자동 열기 + 안내 메시지

```javascript
'dev': {
  component: () => import('src/components/sidebars/left/DocumentListSidebar.vue'),
  behavior: {
    autoOpen: true,
    showMessage: true,
    respectMobileHidden: true,
    defaultOpen: true,
    saveState: true,
    message: '문서를 선택하거나 새로 만드세요.',
  },
}
```

---

## 🔄 모듈 재사용 전략

### 1. 공통 컴포넌트 추출

재사용 가능한 컴포넌트를 별도로 관리:

```
src/components/sidebars/
├── shared/                        # 공통 컴포넌트
│   ├── FilterPanel.vue
│   ├── SearchBar.vue
│   ├── NavigationList.vue
│   └── PropertyEditor.vue
├── left/
│   └── [module]/
│       └── [Module]Sidebar.vue
└── right/
    └── [module]/
        └── [Module]ToolsPanel.vue
```

### 2. 모듈별 컴포넌트 구조

모듈 내에서 재사용 가능한 컴포넌트:

```
src/components/sidebars/
├── left/
│   └── parts-management/
│       ├── PartsManagementSidebar.vue
│       └── components/
│           ├── PhysicalSpaceList.vue
│           ├── PartsDataList.vue
│           └── FilterPanel.vue
```

### 3. 성격에 따른 배치 기준

#### 왼쪽 사이드바에 배치할 모듈

- 네비게이션 메뉴
- 목록/리스트
- 필터/검색
- 카테고리/분류
- 트리 구조

#### 오른쪽 사이드바에 배치할 모듈

- 속성 편집기
- 도구 패널
- 설정 패널
- 액션 버튼
- 미리보기

---

## 📝 등록 전략

### 등록 수 추정

#### 최소 시나리오 (현재)
- 메인 메뉴: 12개
- 등록 수: **12개**

#### 중간 시나리오
- 메인 메뉴: 12개
- 서브 메뉴 평균 2개: 12 × 2 = 24개
- 등록 수: **24~30개**

#### 최대 시나리오
- 메인 메뉴: 20개
- 서브 메뉴 평균 3개: 20 × 3 = 60개
- 라우트 파라미터 조합: +20개
- 등록 수: **80~100개**

### 등록 전략

#### 1단계: 메인 메뉴만 등록 (권장 시작점)

**특징:**
- 메뉴당 1개 등록
- 서브 컨텍스트는 컴포넌트 내부에서 처리
- 등록 수: 10~20개

**예시:**
```javascript
const leftSidebarConfigs = {
  'parts-management': {
    component: () => import('...'),
    behavior: { ... },
  },
  'dev': {
    component: () => import('...'),
    behavior: { ... },
  },
}
```

#### 2단계: 서브 메뉴/컨텍스트별 등록 (필요 시)

**특징:**
- 메뉴:서브메뉴 형태의 키 사용
- 컨텍스트별 다른 사이드바 등록
- 등록 수: 20~50개

**예시:**
```javascript
const leftSidebarConfigs = {
  'parts-management': {
    component: () => import('...'), // 기본
    behavior: { ... },
  },
  'parts-management:physical': {
    component: () => import('...'), // 물리 공간 전용
    behavior: { ... },
  },
  'dev:editor': {
    component: () => import('...'), // 편집 모드 전용
    behavior: { ... },
  },
}
```

---

## 🎯 베스트 프랙티스

### 1. 통신 방식 선택

- **Store 사용**: 상태 공유가 필요한 경우
- **Props/Emits**: 직접적인 부모-자식 관계인 경우
- **이벤트 버스**: 느슨한 결합이 필요한 경우

### 2. 모듈 재사용

- 공통 컴포넌트는 `shared/` 폴더에 배치
- 모듈별 컴포넌트는 모듈 폴더 내 `components/`에 배치
- 성격에 맞는 위치에 배치 (왼쪽/오른쪽)

### 3. 파일 구조

- 명확한 폴더 구조 유지
- 모듈별로 독립적인 구조
- 공통 컴포넌트는 별도 관리

### 4. 설정 관리

- `sidebarRegistry.js`에서 중앙 관리
- 동작 설정은 `behavior` 객체로 관리
- 모바일 대응 고려 (`respectMobileHidden: true`)

---

## 📋 체크리스트

새 사이드바 추가 시:

- [ ] 사이드바 컴포넌트 생성 (`sidebars/left/` 또는 `sidebars/right/`)
- [ ] `sidebarRegistry.js`에 등록
- [ ] `behavior` 설정 추가
- [ ] Store 생성 (필요 시)
- [ ] 통신 구조 설계 (Store/Props/이벤트)
- [ ] 모바일 대응 확인
- [ ] 테스트

---

## 🔄 마이그레이션 가이드

기존 사이드바를 새 구조로 마이그레이션:

1. `leftSidebarComponents` → `leftSidebarConfigs`로 변경
2. `component` 속성 추가
3. `behavior` 객체 추가 (기본값 사용 가능)
4. Store 통신 구조로 변경 (필요 시)

```javascript
// Before
'parts-management': () => import('...'),

// After
'parts-management': {
  component: () => import('...'),
  behavior: {
    autoOpen: false,
    showMessage: false,
    respectMobileHidden: true,
    defaultOpen: true,
    saveState: true,
    message: null,
  },
}
```

---

## 📚 관련 문서

- [NEXA-UI_샘플_개발_가이드.md](../04-개발/NEXA-UI_샘플_개발_가이드.md) - UI 개발 가이드
- [NEXA-컴포넌트_표준_계약.md](../04-개발/NEXA-컴포넌트_표준_계약.md) - 컴포넌트 표준 계약

---

**마지막 업데이트**: 2024년  
**작성자**: AI Assistant  
**상태**: 진행 중

