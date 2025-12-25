# NEXA 사이드바 시스템 가이드

**작성일**: 2024년 12월  
**목적**: 왼쪽/오른쪽 사이드바와 중앙 컨텐츠 간 통신 구조화, 사이드바 등록 및 관리, 오픈 전략 시스템 통합 가이드  
**버전**: 2.0

---

## 📋 개요

NEXA Platform의 사이드바 시스템은 **왼쪽 사이드바**, **중앙 컨텐츠**, **오른쪽 사이드바**로 구성되어 있으며, 각 모듈을 재사용 가능하도록 만들고 적절한 성격에 맞춰 좌측/우측에 배치합니다. 또한 세 영역 간 통신이 원활하게 이루어지도록 구조화되어 있습니다.

### 핵심 목표

1. **모듈 재사용성**: 각종 모듈을 재사용 가능하도록 구조화
2. **적절한 배치**: 모듈의 성격에 맞춰 좌측/우측에 배치
3. **원활한 통신**: 왼쪽 사이드바 ↔ 중앙 컨텐츠 ↔ 오른쪽 사이드바 간 통신 구조화
4. **관리 용이성**: 관리가 쉬운 파일 구조 정립
5. **지능형 오픈 전략**: 컨텐츠와 상황에 따른 자동 오픈 및 알림 시스템

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

-   **역할**: 네비게이션, 목록, 필터 등
-   **통신 방식**:
    -   Store (Pinia)를 통한 상태 공유
    -   전역 커스텀 이벤트 (`window.dispatchEvent`)
    -   Props/Emits (직접 통신)

#### 2. 중앙 컨텐츠 ↔ 오른쪽 사이드바

-   **역할**: 도구, 속성, 설정 등
-   **통신 방식**:
    -   Store (Pinia)를 통한 상태 공유
    -   전역 커스텀 이벤트 (`window.dispatchEvent`)
    -   Props/Emits (직접 통신)

#### 3. 왼쪽 사이드바 ↔ 오른쪽 사이드바

-   **역할**: 간접 통신 (중앙 컨텐츠를 통한 통신)
-   **통신 방식**:
    -   Store (Pinia)를 통한 간접 통신
    -   중앙 컨텐츠를 통한 이벤트 전달

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
│       │   └── DevSidebar.vue
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
│   ├── sidebarOpenStrategyStore.js  # 오픈 전략 관리
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
import { defineStore } from "pinia";

export const useSidebarStore = defineStore("sidebar", {
    state: () => ({
        leftOpen: true,
        rightOpen: false,
        activeLeftMenu: null,
        activeRightMenu: null,
    }),

    actions: {
        toggleLeft() {
            this.leftOpen = !this.leftOpen;
        },
        toggleRight() {
            this.rightOpen = !this.rightOpen;
        },
    },
});
```

#### 모듈별 Store

```javascript
// src/stores/partsManagementStore.js
import { defineStore } from "pinia";

export const usePartsManagementStore = defineStore("partsManagement", {
    state: () => ({
        selectedPart: null,
        filterOptions: {},
        viewMode: "list",
    }),

    actions: {
        selectPart(part) {
            this.selectedPart = part;
            // 중앙 컨텐츠와 오른쪽 사이드바에 자동 반영
        },
    },
});
```

### 2. 전역 이벤트 기반 통신

```javascript
// 전역 커스텀 이벤트 사용 (권장)
// 왼쪽 사이드바에서 이벤트 발생
window.dispatchEvent(
    new CustomEvent("part-selected", {
        detail: { partData },
    })
);

// 중앙 컨텐츠에서 이벤트 수신
window.addEventListener("part-selected", (event) => {
    const { partData } = event.detail;
    // 컨텐츠 업데이트
});
```

### 3. Props/Emits 직접 통신

```vue
<!-- MainLayout.vue -->
<template>
    <LeftSidebar :selected-item="selectedItem" @item-selected="handleItemSelected" />
    <CenterContent :selected-item="selectedItem" @content-updated="handleContentUpdated" />
    <RightSidebar :selected-item="selectedItem" :content-data="contentData" />
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
import { usePortfolioStore } from "src/stores/portfolioStore";

const portfolioStore = usePortfolioStore();

// Store를 통한 통신
const handleItemClick = (item) => {
    portfolioStore.selectItem(item);
};
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
import { computed } from "vue";
import { usePortfolioStore } from "src/stores/portfolioStore";

const portfolioStore = usePortfolioStore();

// Store를 통한 통신
const selectedItem = computed(() => portfolioStore.selectedItem);
</script>
```

### 2단계: sidebarRegistry.js에 등록 (프리셋 패턴 사용)

**⚠️ 중요**: 현재 시스템은 **프리셋 패턴**을 사용합니다. 이 방식은 확장성과 유지보수성을 높이며, 관리자 설정 지원도 가능합니다.

```javascript
// src/config/sidebarRegistry.js

const leftSidebarConfigs = {
    // 기존 등록...
    "nexa-board": {
        component: () => import("src/components/sidebars/left/NexaBoardSidebar.vue"),
        preset: "leftDefault",
        overrides: {},
    },

    // 새 사이드바 추가 - 기본 프리셋 사용
    portfolio: {
        component: () => import("src/components/sidebars/left/PortfolioSidebar.vue"),
        preset: "leftDefault", // 기본 프리셋
        overrides: {}, // 추가 오버라이드 없음
    },

    // 권장 자동 오픈 프리셋 사용
    dev: {
        component: () => import("src/components/sidebars/left/DevSidebar.vue"),
        preset: "autoOpenRecommended", // 권장 자동 오픈 프리셋
        overrides: {
            message: "문서를 선택하거나 새로 만드세요.", // 프리셋에 추가 오버라이드
        },
    },
};

const rightSidebarConfigs = {
    // 기존 등록...
    "nexa-board": {
        component: () => import("src/components/sidebars/right/NexaBoardToolsPanel.vue"),
        preset: "rightDefault",
        overrides: {},
    },

    // 새 사이드바 추가
    portfolio: {
        component: () => import("src/components/sidebars/right/PortfolioToolsPanel.vue"),
        preset: "rightDefault", // 오른쪽 사이드바 기본 프리셋
        overrides: {},
    },

    // 기본 패널 (등록되지 않은 메뉴용)
    default: {
        component: () => import("src/components/sidebars/right/DefaultRightPanel.vue"),
        preset: "rightDefault",
        overrides: {},
    },
};
```

### 3단계: Store 생성 (필요 시)

```javascript
// src/stores/portfolioStore.js
import { defineStore } from "pinia";

export const usePortfolioStore = defineStore("portfolio", {
    state: () => ({
        selectedItem: null,
        items: [],
    }),

    actions: {
        selectItem(item) {
            this.selectedItem = item;
        },
    },
});
```

---

## ⚙️ 사이드바 레지스트리 시스템

### 프리셋 패턴

사이드바 레지스트리는 **하이브리드 접근 방식**을 사용하여 확장성과 유지보수성을 높였습니다:

1. **기본값/프리셋 패턴**: 자주 사용되는 설정 조합을 프리셋으로 정의
2. **관리자 설정 지원**: 관리자 페이지에서 동적으로 설정 관리 가능
3. **우선순위 병합**: 관리자 설정 > 프리셋 > 기본값 > 코드 오버라이드

### 프리셋 정의

```javascript
// src/config/sidebarRegistry.js

const BEHAVIOR_PRESETS = {
    // 왼쪽 사이드바 기본 프리셋
    leftDefault: {
        autoOpen: false,
        autoOpenPriority: "recommended",
        showMessage: false,
        respectMobileHidden: true,
        defaultOpen: true,
        saveState: true,
        message: null,
        notificationOnAutoOpen: true,
        notificationPriority: "recommended",
    },

    // 오른쪽 사이드바 기본 프리셋
    rightDefault: {
        autoOpen: false,
        autoOpenPriority: "recommended",
        showMessage: false,
        respectMobileHidden: true,
        defaultOpen: false, // 오른쪽은 기본 닫힘
        saveState: true,
        message: null,
        notificationOnAutoOpen: true,
        notificationPriority: "recommended",
    },

    // 권장 자동 오픈 프리셋
    autoOpenRecommended: {
        autoOpen: true,
        autoOpenPriority: "recommended",
        showMessage: true,
        respectMobileHidden: true,
        defaultOpen: true,
        saveState: true,
        message: null,
        notificationOnAutoOpen: true,
        notificationPriority: "recommended",
    },

    // 필수 자동 오픈 프리셋
    autoOpenRequired: {
        autoOpen: true,
        autoOpenPriority: "required",
        showMessage: false,
        respectMobileHidden: true,
        defaultOpen: true,
        saveState: true,
        message: null,
        notificationOnAutoOpen: true,
        notificationPriority: "required",
    },
};
```

### 설정 옵션 (`SidebarBehaviorConfig`)

각 사이드바는 다음 설정을 가질 수 있습니다:

```typescript
{
  // 기본 설정
  autoOpen: boolean,                    // 컨텐츠에 따라 자동으로 열지 여부
  autoOpenPriority: 'required' | 'recommended', // 자동 오픈 우선순위
  showMessage: boolean,                 // 안내 메시지만 보여줄지 여부 (autoOpen이 false일 때)
  respectMobileHidden: boolean,         // 모바일에서 숨김 상태를 유지할지 여부
  defaultOpen: boolean,                 // 기본 열림 상태 (최초 진입 시)
  saveState: boolean,                   // 열림/닫힘 상태를 저장할지 여부
  message: string | null,               // 안내 메시지 (showMessage가 true일 때 표시)

  // 오픈 전략 관련
  notificationOnAutoOpen: boolean,      // 오픈 실패 시 알림 사용 여부
  notificationPriority: 'required' | 'recommended', // 알림 우선순위
}
```

### 사용 예시

#### 예시 1: 기본 사이드바 (상태 저장)

```javascript
'parts-management': {
  component: () => import('src/components/sidebars/left/PartsManagementSidebar.vue'),
  preset: 'leftDefault', // 기본 프리셋
  overrides: {}, // 추가 오버라이드 없음
}
```

#### 예시 2: 권장 자동 오픈 (새 문서 생성 시)

```javascript
dev: {
  component: () => import('src/components/sidebars/left/DevSidebar.vue'),
  preset: 'autoOpenRecommended', // 권장 자동 오픈 프리셋
  overrides: {
    message: '문서를 선택하거나 새로 만드세요.', // 프리셋에 추가 오버라이드
  },
}
```

#### 예시 3: 필수 자동 오픈 (중요한 액션 필요 시)

```javascript
'critical-action': {
  component: () => import('src/components/sidebars/right/CriticalActionPanel.vue'),
  preset: 'autoOpenRequired', // 필수 자동 오픈 프리셋
  overrides: {},
}
```

**참고**: `behavior`는 `getLeftSidebarBehavior()` / `getRightSidebarBehavior()` 호출 시 동적으로 생성되며, 최신 관리자 설정이 자동으로 반영됩니다.

---

## 🎯 오픈 전략 시스템

사이드바 오픈 전략 시스템은 좌측/우측 사이드바를 컨텐츠와 상황에 따라 자동으로 열거나, 자동 오픈이 실패하거나 불가능한 경우 중요성에 따라 사용자에게 알림을 제공하는 통합 시스템입니다.

### 핵심 목표

1. **자동 오픈 우선**: 자동 오픈이 주요 기능
2. **알림은 보조**: 자동 오픈 실패 시 또는 자동 오픈 없이 알림 제공
3. **우선순위 기반**: 중요성에 따라 다른 오픈/알림 전략 적용
4. **사용자 제어**: 설정을 통해 오픈 전략 및 알림 동작 커스터마이징

### 오픈 전략 분류

#### 1. 자동 오픈 (Auto-Open)

자동 오픈은 **필수(required)** 또는 **권장(recommended)**로 구분됩니다.

##### 1.1 필수 자동 오픈 (Required Auto-Open)

**특징**:

-   하드코딩으로 구현 (개발자가 `sidebarRegistry.js`에서 지정)
-   사용자가 해당 페이지의 UI에서 "더 이상 필수 오픈을 막는" 설정 가능
-   사용자가 필수 오픈을 막았다면 → 알림은 사이드바를 열 때까지 지속적 블링크

**시나리오 예시**:

-   중요한 에러 발생 시
-   사용자 확인이 반드시 필요한 경우
-   저장 실패 등 중요한 액션 필요 시

##### 1.2 권장 자동 오픈 (Recommended Auto-Open)

**특징**:

-   하드코딩으로 디폴트 작성
-   **초보자 기간 동안 자동 오픈**: 사용자가 시스템을 이해할 정도의 기간 동안 자동 오픈
-   **초보자 기간 설정**: 전역 설정에서 날짜 또는 사용 횟수로 지정 (예: 7일, 10회 사용)
-   **초보자 모드 해제**: 사용자가 설정에서 "초보자 아님"을 체크 해제하면 이후 사용자 히스토리 기반으로 동작
-   **사용자 히스토리 기반**: 초보자 기간 이후에는 사용자의 과거 행동 패턴을 분석하여 자동 오픈 여부 결정
-   초보자 기간 동안 자동 오픈 실패 시 → 블링크로 전환
-   블링크는 일정 횟수만 깜박임 (기본 5회, 사용자 설정 가능)

**시나리오 예시**:

-   새 문서 생성 시
-   새 알림 도착 시
-   일반적인 정보 제공 시

#### 2. 알림만 (Notification-Only)

**특징**:

-   자동 오픈 없이 사이드바 알림으로만 보조
-   필수 또는 권장 알림 제공

**시나리오 예시**:

-   중요하지 않은 알림
-   사용자가 직접 확인할 수 있는 메시지

### 이벤트 시스템

#### 전역 이벤트 타입

-   `sidebar-open-strategy:trigger` - 오픈 전략 트리거
-   `sidebar-open-strategy:stop` - 알림 중지
-   `sidebar-open-strategy:clear` - 오픈 전략 상태 초기화
-   `sidebar-open-strategy:disable-required` - 사용자가 필수 오픈을 막음

#### 이벤트 데이터 구조

```javascript
{
  side: 'left' | 'right',
  priority: 'required' | 'recommended', // 자동 오픈 우선순위 또는 알림 우선순위
  triggerType: 'new-content' | 'action-required' | 'notification' | 'auto-open-suggested' | 'interaction-needed',
  metadata: {} // 추가 정보 (선택)
}
```

### 사용 예시

#### 1. 필수 자동 오픈 (저장 실패 시)

```javascript
window.dispatchEvent(
    new CustomEvent("sidebar-open-strategy:trigger", {
        detail: {
            side: "right",
            priority: "required", // 필수 자동 오픈
            triggerType: "action-required",
            metadata: { error: "Save failed" },
        },
    })
);
```

**동작**:

-   사용자가 필수 오픈을 막지 않았으면 → 자동 오픈
-   사용자가 필수 오픈을 막았으면 → 지속적 블링크 (사이드바 열 때까지)

#### 2. 권장 자동 오픈 (새 문서 생성 시)

```javascript
window.dispatchEvent(
    new CustomEvent("sidebar-open-strategy:trigger", {
        detail: {
            side: "left",
            priority: "recommended", // 권장 자동 오픈
            triggerType: "new-content",
            metadata: { documentName: "new-doc.md" },
        },
    })
);
```

**동작**:

-   초보자 기간 확인
-   초보자면 → 자동 오픈
-   초보자가 아니면 → 사용자 히스토리 기반 판단
-   오픈 실패 시 → 블링크 시작 (기본 5회)
-   5회 후 또는 타임아웃 후 알림 중지

#### 3. 알림만 제공 (일반 알림)

```javascript
window.dispatchEvent(
    new CustomEvent("sidebar-open-strategy:trigger", {
        detail: {
            side: "right",
            priority: "recommended", // 권장 알림
            triggerType: "notification",
            metadata: { notification },
        },
    })
);
```

**동작**:

-   자동 오픈 없이 알림만 제공
-   제한적 블링크 (설정된 횟수만큼)

### 동작 흐름

#### 필수 자동 오픈 성공 흐름

```
1. 이벤트 발생 → 2. 필수 자동 오픈 시도
   ↓
3. 사용자가 필수 오픈을 막지 않음 → 4. 사이드바 열림 → 5. 완료
```

#### 필수 자동 오픈 실패 흐름

```
1. 이벤트 발생 → 2. 필수 자동 오픈 시도
   ↓
3. 사용자가 필수 오픈을 막음 → 4. 지속적 블링크 시작
   ↓
5. 사용자가 클릭 또는 사이드바 열기 → 6. 알림 중지
```

#### 권장 자동 오픈 흐름

```
1. 이벤트 발생 → 2. 권장 자동 오픈 시도
   ↓
3. 초보자 기간 확인
   ↓
4-1. 초보자면 → 5-1. 자동 오픈 → 6-1. 오픈 실패 시 블링크
4-2. 초보자가 아니면 → 5-2. 사용자 히스토리 기반 판단 → 6-2. 판단 결과에 따라 오픈 또는 블링크
   ↓
7. 블링크 시작 (일정 횟수만)
   ↓
8. 횟수 도달 또는 타임아웃 → 9. 알림 중지
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

-   네비게이션 메뉴
-   목록/리스트
-   필터/검색
-   카테고리/분류
-   트리 구조

#### 오른쪽 사이드바에 배치할 모듈

-   속성 편집기
-   도구 패널
-   설정 패널
-   액션 버튼
-   미리보기

---

## 📝 등록 전략

### 등록 수 추정

#### 최소 시나리오 (현재)

-   메인 메뉴: 12개
-   등록 수: **12개**

#### 중간 시나리오

-   메인 메뉴: 12개
-   서브 메뉴 평균 2개: 12 × 2 = 24개
-   등록 수: **24~30개**

#### 최대 시나리오

-   메인 메뉴: 20개
-   서브 메뉴 평균 3개: 20 × 3 = 60개
-   라우트 파라미터 조합: +20개
-   등록 수: **80~100개**

### 등록 전략

#### 1단계: 메인 메뉴만 등록 (권장 시작점)

**특징**:

-   메뉴당 1개 등록
-   서브 컨텍스트는 컴포넌트 내부에서 처리
-   등록 수: 10~20개

**예시**:

```javascript
const leftSidebarConfigs = {
    "parts-management": {
        component: () => import("..."),
        preset: "leftDefault",
        overrides: {},
    },
    dev: {
        component: () => import("..."),
        preset: "autoOpenRecommended",
        overrides: {},
    },
};
```

#### 2단계: 서브 메뉴/컨텍스트별 등록 (필요 시)

**특징**:

-   메뉴:서브메뉴 형태의 키 사용
-   컨텍스트별 다른 사이드바 등록
-   등록 수: 20~50개

**예시**:

```javascript
const leftSidebarConfigs = {
    "parts-management": {
        component: () => import("..."), // 기본
        preset: "leftDefault",
        overrides: {},
    },
    "parts-management:physical": {
        component: () => import("..."), // 물리 공간 전용
        preset: "leftDefault",
        overrides: {},
    },
    "dev:editor": {
        component: () => import("..."), // 편집 모드 전용
        preset: "autoOpenRecommended",
        overrides: {},
    },
};
```

---

## 🎯 베스트 프랙티스

### 1. 통신 방식 선택

-   **Store 사용**: 상태 공유가 필요한 경우
-   **전역 이벤트**: 느슨한 결합이 필요한 경우 (권장)
-   **Props/Emits**: 직접적인 부모-자식 관계인 경우

### 2. 모듈 재사용

-   공통 컴포넌트는 `shared/` 폴더에 배치
-   모듈별 컴포넌트는 모듈 폴더 내 `components/`에 배치
-   성격에 맞는 위치에 배치 (왼쪽/오른쪽)

### 3. 파일 구조

-   명확한 폴더 구조 유지
-   모듈별로 독립적인 구조
-   공통 컴포넌트는 별도 관리

### 4. 설정 관리

-   `sidebarRegistry.js`에서 중앙 관리
-   **프리셋 패턴 사용** (직접 behavior 객체 정의 지양)
-   관리자 설정 지원으로 유연성 확보
-   모바일 대응 고려 (`respectMobileHidden: true`)

### 5. 오픈 전략 활용

-   필수 자동 오픈은 신중하게 사용 (중요한 경우만)
-   권장 자동 오픈은 사용자 경험 향상을 위해 적극 활용
-   알림은 사용자 경험을 해치지 않도록 적절히 조절

---

## 📋 체크리스트

새 사이드바 추가 시:

-   [ ] 사이드바 컴포넌트 생성 (`sidebars/left/` 또는 `sidebars/right/`)
-   [ ] `sidebarRegistry.js`에 등록 (프리셋 패턴 사용)
-   [ ] 적절한 프리셋 선택 (`leftDefault`, `rightDefault`, `autoOpenRecommended`, `autoOpenRequired`)
-   [ ] 필요한 경우 `overrides`로 추가 설정
-   [ ] Store 생성 (필요 시)
-   [ ] 통신 구조 설계 (Store/전역 이벤트/Props)
-   [ ] 오픈 전략 설정 (필요 시)
-   [ ] 모바일 대응 확인
-   [ ] 테스트

---

## 🔄 마이그레이션 가이드

기존 사이드바를 새 구조로 마이그레이션:

1. `leftSidebarComponents` → `leftSidebarConfigs`로 변경
2. `component` 속성 추가
3. **프리셋 패턴으로 변경** (직접 behavior 객체 정의 지양)
4. Store 통신 구조로 변경 (필요 시)

```javascript
// Before (구식)
'parts-management': () => import('...'),

// After (프리셋 패턴 사용)
'parts-management': {
  component: () => import('...'),
  preset: 'leftDefault',
  overrides: {},
}
```

---

## 📚 관련 문서

-   [NEXA-UI*샘플*개발\_가이드.md](../04-개발/NEXA-UI_샘플_개발_가이드.md) - UI 개발 가이드
-   [NEXA-컴포넌트*표준*계약.md](../04-개발/NEXA-컴포넌트_표준_계약.md) - 컴포넌트 표준 계약
-   [사이드바*지능화*시스템\_설계서.md](./사이드바_지능화_시스템_설계서.md) - 사이드바 지능화 시스템 (향후)

---

**마지막 업데이트**: 2024년 12월  
**작성자**: AI Assistant  
**상태**: 통합 완료 (v2.0)
