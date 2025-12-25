# NEXA 사이드바 오픈 전략 시스템

**작성일**: 2024년 12월  
**목적**: 사이드바(좌측/우측)의 자동 오픈 전략 및 오픈 실패 시 알림 시스템  
**버전**: 2.0

---

## 📋 개요

사이드바 오픈 전략 시스템은 좌측/우측 사이드바를 컨텐츠와 상황에 따라 자동으로 열거나, 자동 오픈이 실패하거나 불가능한 경우 중요성에 따라 사용자에게 알림을 제공하는 통합 시스템입니다.

### 핵심 목표

1. **자동 오픈 우선**: 자동 오픈이 주요 기능
2. **알림은 보조**: 자동 오픈 실패 시 또는 자동 오픈 없이 알림 제공
3. **통합 관리**: 좌측/우측 사이드바를 하나의 시스템으로 통합 관리
4. **우선순위 기반**: 중요성에 따라 다른 오픈/알림 전략 적용
5. **사용자 제어**: 설정을 통해 오픈 전략 및 알림 동작 커스터마이징

---

## 🏗️ 아키텍처

### 시스템 구조

```
이벤트 발생 → 오픈 전략 판단 → 자동 오픈 시도 → 실패/시간 경과 시 알림 → UI 반영
```

### 주요 컴포넌트

-   **오픈 전략 관리**: `useSidebarOpenStrategyStore` (Pinia)
-   **이벤트 시스템**: 전역 커스텀 이벤트 (`window.dispatchEvent`)
-   **UI 반영**: `MainLayout.vue`의 토글 버튼에 알림 클래스 추가
-   **설정 통합**: `userSettingsStore`에 오픈 전략 및 알림 설정 추가

---

## 📁 파일 구조

```
NEXA-Platform/src/
├── stores/
│   ├── sidebarOpenStrategyStore.js    [신규 생성]
│   └── userSettingsStore.js            [수정: 오픈 전략 및 알림 설정 추가]
├── layouts/
│   └── MainLayout.vue                  [수정: 오픈 전략 및 알림 상태 연동]
└── config/
    └── sidebarRegistry.js              [수정: 프리셋 패턴 및 관리자 설정 지원]
```

---

## 🎯 오픈 전략 분류

### 1. 자동 오픈 (Auto-Open)

자동 오픈은 **필수(required)** 또는 **권장(recommended)**로 구분됩니다.

#### 1.1 필수 자동 오픈 (Required Auto-Open)

**특징**:

-   하드코딩으로 구현 (개발자가 `sidebarRegistry.js`에서 지정)
-   사용자가 해당 페이지의 UI에서 "더 이상 필수 오픈을 막는" 설정 가능
-   사용자가 필수 오픈을 막았다면 → 알림은 사이드바를 열 때까지 지속적 블링크

**시나리오 예시**:

-   중요한 에러 발생 시
-   사용자 확인이 반드시 필요한 경우
-   저장 실패 등 중요한 액션 필요 시

#### 1.2 권장 자동 오픈 (Recommended Auto-Open)

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

**참고**: 시간 기반 자동 닫힘 기능(일정 시간 후 자동 닫힘)은 차후 기능으로 분류됨

### 2. 알림만 (Notification-Only)

**특징**:

-   자동 오픈 없이 사이드바 알림으로만 보조
-   필수 또는 권장 알림 제공

**시나리오 예시**:

-   중요하지 않은 알림
-   사용자가 직접 확인할 수 있는 메시지

---

## 💾 데이터 구조

### 오픈 전략 상태 구조

```javascript
{
  left: {
    isOpen: false, // 현재 열림 상태
    autoOpenPriority: null, // 'required' | 'recommended' | null
    userDisabledRequired: false, // 사용자가 필수 오픈을 막았는지 여부
    isBeginner: true, // 초보자 모드 여부
    beginnerStartDate: null, // 초보자 기간 시작 날짜
    usageCount: 0, // 사용 횟수
    notificationCount: 0, // 권장 알림일 때만 사용
    maxNotificationCount: 5, // 권장 알림일 때 최대 알림 횟수
    timeoutId: null, // 권장 알림 타임아웃 ID
    triggerType: null, // 트리거 이벤트 타입
  },
  right: { ... } // 동일한 구조
}
```

### 사용자 설정 구조

```javascript
sidebarOpenStrategy: {
  // 필수 오픈 설정
  requiredAutoOpenEnabled: true, // 필수 자동 오픈 활성화 여부

  // 권장 오픈 설정
  recommendedAutoOpenEnabled: true, // 권장 자동 오픈 활성화 여부
  isBeginner: true, // 초보자 모드 여부
  beginnerPeriodDays: 7, // 초보자 기간 (일)
  beginnerPeriodUsage: 10, // 초보자 기간 (사용 횟수)

  // 알림 설정
  notificationEnabled: true, // 알림 기능 활성화 여부
  recommendedNotificationMaxCount: 5, // 권장 알림 최대 횟수
  recommendedNotificationTimeout: 30000, // 권장 알림 타임아웃 (ms, 30초)
  requiredNotificationEnabled: true, // 필수 알림 활성화 여부
  recommendedNotificationEnabled: true, // 권장 알림 활성화 여부
}
```

---

## 🔧 구현 상세

### 1. Store 생성

**파일**: `NEXA-Platform/src/stores/sidebarOpenStrategyStore.js`

**주요 기능**:

-   `triggerOpen(side, priority, triggerType)`: 오픈 전략 실행
-   `tryAutoOpen(side, priority, triggerType)`: 자동 오픈 시도
-   `handleRecommendedAutoOpen(side)`: 권장 자동 오픈 처리 (초보자 기간 기반)
-   `checkBeginnerStatus(side)`: 초보자 기간 확인 (날짜/사용 횟수)
-   `updateUsageCount(side)`: 사용 횟수 업데이트
-   `triggerNotification(side, priority, triggerType)`: 알림 시작 (오픈 실패 시)
-   `stopNotification(side)`: 알림 중지
-   `clearStrategy(side)`: 오픈 전략 상태 초기화
-   `disableRequiredAutoOpen(side)`: 사용자가 필수 오픈을 막음
-   전역 이벤트 리스너 등록/해제
-   사이드바 열림 감시 (알림 자동 중지)

**핵심 로직**:

1. 오픈 전략 판단: 자동 오픈 (필수/권장) → 알림만
2. 필수 자동 오픈: 사용자가 막지 않았으면 자동 오픈, 막았으면 지속적 알림
3. 권장 자동 오픈: 초보자 기간 확인 → 초보자면 자동 오픈, 아니면 사용자 히스토리 기반 판단
4. 초보자 기간 확인: 날짜 또는 사용 횟수 기준으로 판단
5. 사용자 히스토리 기반: 과거 행동 패턴 분석하여 자동 오픈 여부 결정
6. 오픈 실패 시: 중요성에 따라 알림 제공
7. 우선순위 처리: 필수 > 권장
8. 권장 알림: 횟수 제한 또는 타임아웃으로 자동 중지
9. 필수 알림: 사용자가 클릭하거나 사이드바를 열 때까지 지속

### 2. 사용자 설정 통합

**파일**: `NEXA-Platform/src/stores/userSettingsStore.js`

**추가 설정**:

-   `sidebarOpenStrategy.requiredAutoOpenEnabled`: 필수 자동 오픈 기능 활성화
-   `sidebarOpenStrategy.recommendedAutoOpenEnabled`: 권장 자동 오픈 기능 활성화
-   `sidebarOpenStrategy.isBeginner`: 초보자 모드 여부
-   `sidebarOpenStrategy.beginnerPeriodDays`: 초보자 기간 (일)
-   `sidebarOpenStrategy.beginnerPeriodUsage`: 초보자 기간 (사용 횟수)
-   `sidebarOpenStrategy.notificationEnabled`: 알림 기능 활성화
-   `sidebarOpenStrategy.recommendedNotificationMaxCount`: 권장 알림 최대 횟수
-   `sidebarOpenStrategy.recommendedNotificationTimeout`: 권장 알림 타임아웃
-   `sidebarOpenStrategy.requiredNotificationEnabled`: 필수 알림 활성화
-   `sidebarOpenStrategy.recommendedNotificationEnabled`: 권장 알림 활성화

### 3. MainLayout.vue 연동

**파일**: `NEXA-Platform/src/layouts/MainLayout.vue`

**변경 사항**:

1. `useSidebarOpenStrategyStore` import 및 사용
2. 토글 버튼에 알림 클래스 동적 추가:
    ```vue
    :class="{ 'is-drawer-open': ..., 'is-notifying': openStrategyStore.openStrategyState.left.autoOpenPriority !== null, 'notification-required': openStrategyStore.openStrategyState.left.autoOpenPriority === 'required', 'notification-recommended':
    openStrategyStore.openStrategyState.left.autoOpenPriority === 'recommended', }"
    ```
3. 사이드바 열림/클릭 시 알림 중지 로직 추가
4. 알림 애니메이션 CSS 추가

### 4. CSS 애니메이션

**파일**: `NEXA-Platform/src/layouts/MainLayout.vue` (style 섹션)

**애니메이션**:

-   **필수**: 지속적 블링크 (사용자가 클릭하거나 사이드바를 열 때까지)
-   **권장**: 제한적 블링크 (설정된 횟수만큼 또는 타임아웃)

---

## 📡 이벤트 시스템

### 전역 이벤트 타입

-   `sidebar-open-strategy:trigger` - 오픈 전략 트리거
-   `sidebar-open-strategy:stop` - 알림 중지
-   `sidebar-open-strategy:clear` - 오픈 전략 상태 초기화
-   `sidebar-open-strategy:disable-required` - 사용자가 필수 오픈을 막음

### 이벤트 데이터 구조

```javascript
{
  side: 'left' | 'right',
  priority: 'required' | 'recommended', // 자동 오픈 우선순위 또는 알림 우선순위
  triggerType: 'new-content' | 'action-required' | 'notification' | 'auto-open-suggested' | 'interaction-needed',
  metadata: {} // 추가 정보 (선택)
}
```

---

## 💡 사용 예시

### 1. 필수 자동 오픈 (저장 실패 시)

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

### 2. 권장 자동 오픈 (새 문서 생성 시)

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

### 3. 알림만 제공 (일반 알림)

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

### 4. 사용자가 필수 오픈을 막음

```javascript
window.dispatchEvent(
    new CustomEvent("sidebar-open-strategy:disable-required", {
        detail: { side: "left" },
    })
);
```

### 5. 알림 수동 중지

```javascript
window.dispatchEvent(
    new CustomEvent("sidebar-open-strategy:stop", {
        detail: { side: "left" },
    })
);
```

---

## ⚙️ 사이드바 레지스트리 확장

**파일**: `NEXA-Platform/src/config/sidebarRegistry.js`

### 기본 구조

사이드바 레지스트리는 **하이브리드 접근 방식**을 사용하여 확장성과 유지보수성을 높였습니다:

1. **기본값/프리셋 패턴**: 자주 사용되는 설정 조합을 프리셋으로 정의
2. **관리자 설정 지원**: 관리자 페이지에서 동적으로 설정 관리 가능
3. **우선순위 병합**: 관리자 설정 > 프리셋 > 기본값 > 코드 오버라이드

### 프리셋 정의

```javascript
const BEHAVIOR_PRESETS = {
    leftDefault: {
        /* 왼쪽 사이드바 기본값 */
    },
    rightDefault: {
        /* 오른쪽 사이드바 기본값 */
    },
    autoOpenRecommended: {
        /* 권장 자동 오픈 */
    },
    autoOpenRequired: {
        /* 필수 자동 오픈 */
    },
};
```

### 사용 예시

```javascript
// 기본 프리셋 사용
const leftSidebarConfigs = {
    "nexa-board": {
        component: () => import("src/components/sidebars/left/NexaBoardSidebar.vue"),
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
```

**참고**: `behavior`는 `getLeftSidebarBehavior()` / `getRightSidebarBehavior()` 호출 시 동적으로 생성되며, 최신 관리자 설정이 자동으로 반영됩니다.

### 관리자 설정 구조

관리자 페이지에서 설정할 수 있는 구조:

```javascript
{
  left: {
    'nexa-board': { /* 특정 메뉴 설정 */ },
    '*': { /* 왼쪽 사이드바 전역 기본값 */ },
  },
  right: {
    'nexa-board': { /* 특정 메뉴 설정 */ },
    '*': { /* 오른쪽 사이드바 전역 기본값 */ },
  },
  global: { /* 모든 사이드바 전역 설정 */ },
}
```

### 추가 설정 항목

```javascript
behavior: {
  // 기존 설정...
  autoOpen: true, // 자동 오픈 여부
  autoOpenPriority: 'recommended', // 'required' | 'recommended'
  notificationOnAutoOpen: true, // 오픈 실패 시 알림 사용 여부
  notificationPriority: 'recommended', // 알림 우선순위
}
```

---

## 🔄 동작 흐름

### 필수 자동 오픈 성공 흐름

```
1. 이벤트 발생 → 2. 필수 자동 오픈 시도
   ↓
3. 사용자가 필수 오픈을 막지 않음 → 4. 사이드바 열림 → 5. 완료
```

### 필수 자동 오픈 실패 흐름

```
1. 이벤트 발생 → 2. 필수 자동 오픈 시도
   ↓
3. 사용자가 필수 오픈을 막음 → 4. 지속적 블링크 시작
   ↓
5. 사용자가 클릭 또는 사이드바 열기 → 6. 알림 중지
```

### 권장 자동 오픈 흐름

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

**참고**: 시간 기반 자동 닫힘 기능(일정 시간 후 자동 닫힘)은 차후 기능으로 분류됨

### 알림만 흐름

```
1. 이벤트 발생 → 2. 알림 시작 → 3. 제한적/지속적 블링크
   ↓
4. 사용자가 클릭 또는 사이드바 열기 → 5. 알림 중지
```

---

## 🎨 UI/UX 고려사항

1. **오픈 전략 시각화**

    - 자동 오픈: 부드러운 슬라이드 애니메이션
    - 알림: 우선순위에 따라 다른 블링크 효과

2. **우선순위 시각화**

    - 필수: 더 강한 블링크 효과 (primary 색상, 더 빠른 주기)
    - 권장: 부드러운 블링크 효과 (accent 색상, 느린 주기)

3. **접근성**

    - `prefers-reduced-motion` 설정 고려
    - 키보드 접근성 유지

4. **성능**
    - 애니메이션이 성능에 영향을 주지 않도록 최적화
    - 불필요한 리렌더링 방지

---

## 📝 구현 체크리스트

-   [ ] `sidebarOpenStrategyStore.js` 생성
-   [ ] `userSettingsStore.js`에 오픈 전략 및 알림 설정 추가
-   [ ] `MainLayout.vue`에 오픈 전략 및 알림 상태 연동
-   [ ] 알림 애니메이션 CSS 추가
-   [ ] 전역 이벤트 리스너 등록
-   [ ] 사이드바 열림 감시 로직 추가
-   [ ] 권장 자동 오픈의 초보자 기간 확인 로직 구현
-   [ ] 사용자 히스토리 기반 판단 로직 구현
-   [ ] 사용 횟수 추적 로직 구현
-   [ ] (차후) 시간 기반 자동 닫힘 로직 구현
-   [ ] 사용자가 필수 오픈을 막는 UI 및 로직 구현
-   [ ] 사이드바 레지스트리 확장
-   [ ] 설정 UI 추가 (선택)

---

## 🔮 차후 기능 (기획 중)

### IOT 장비 메시지 기반 사이드바 패널 자동 오픈

**개요**: 등록된 IOT 장비에서 특정 메시지가 도착하면 사이드바에 특정 정보 패널을 위치시키고 자동 오픈 또는 오픈 요청 메시지를 표시하는 기능입니다.

**기능 요구사항**:

1. **IOT 장비 메시지 수신**

    - 등록된 IOT 장비에서 특정 메시지 도착 감지
    - 메시지 타입 및 우선순위 파싱

2. **동적 사이드바 패널 생성**

    - 메시지 타입에 따라 적절한 정보 패널 컴포넌트 선택
    - 사이드바에 동적으로 패널 위치 지정 (좌측 또는 우측)

3. **자동 오픈 또는 오픈 요청**

    - 메시지 우선순위에 따라 자동 오픈 또는 오픈 요청 메시지 표시
    - 필수 메시지: 자동 오픈 (필수 자동 오픈)
    - 권장 메시지: 오픈 요청 메시지 + 블링크 (권장 자동 오픈)

4. **오픈 액션 버튼 및 메시지 표시**
    - 사이드바 토글 버튼에 블링크 효과
    - 메시지 내용을 툴팁 또는 알림으로 표시
    - 사용자가 클릭하면 해당 패널로 이동

**구현 예시**:

```javascript
// IOT 장비 메시지 수신 시
window.dispatchEvent(
    new CustomEvent("sidebar-open-strategy:trigger", {
        detail: {
            side: "right", // 또는 'left'
            priority: "required", // 또는 'recommended'
            triggerType: "iot-message",
            metadata: {
                deviceId: "sensor-001",
                messageType: "alert",
                message: "온도가 임계값을 초과했습니다.",
                panelComponent: "IOTAlertPanel", // 동적으로 로드할 패널 컴포넌트
                panelProps: {
                    deviceId: "sensor-001",
                    alertLevel: "high",
                },
            },
        },
    })
);
```

**동작 흐름**:

```
1. IOT 장비 메시지 도착
   ↓
2. 메시지 타입 및 우선순위 파싱
   ↓
3. 적절한 정보 패널 컴포넌트 선택
   ↓
4. 사이드바에 패널 동적 위치 지정
   ↓
5. 우선순위에 따라 자동 오픈 또는 오픈 요청
   ↓
6. 오픈 요청 시: 블링크 + 메시지 표시
   ↓
7. 사용자가 클릭하면 해당 패널로 이동
```

**고려사항**:

-   IOT 장비 등록 및 메시지 라우팅 시스템 필요
-   동적 패널 컴포넌트 로딩 메커니즘 필요
-   메시지 큐 관리 (여러 메시지 동시 도착 시)
-   패널 우선순위 및 표시 순서 관리

---

## 🚨 주의사항

1. **오픈 전략 우선**: 자동 오픈이 성공하면 알림은 트리거하지 않음
2. **우선순위 처리**: 필수 알림이 이미 있으면 권장 알림은 무시됨
3. **상태 확인**: 사이드바가 이미 열려있으면 오픈 시도 및 알림 트리거하지 않음
4. **메모리 관리**: 타임아웃 ID는 반드시 정리해야 함
5. **사용자 경험**: 과도한 자동 오픈 및 알림은 사용자 경험을 해칠 수 있으므로 적절히 조절
6. **필수 오픈 막기**: 사용자가 필수 오픈을 막는 것은 사용자 책임이며, 이 경우 지속적 알림이 제공됨

---

**최종 업데이트**: 2024년 12월
