# sidebarRegistry.js 변경사항 반영 검토 결과

**작성일**: 2024년 12월  
**목적**: `sidebarRegistry.js`의 프리셋 패턴 변경사항이 현재 사용 중인 페이지 파일에 적절하게 반영되었는지 검토

---

## ✅ 검토 결과 요약

### 1. sidebarRegistry.js 구조 변경사항

**변경 전**:
```javascript
const leftSidebarConfigs = {
  'dev': {
    component: () => import('...'),
    behavior: {
      autoOpen: true,
      autoOpenPriority: 'recommended',
      // ... 직접 정의
    }
  }
}
```

**변경 후**:
```javascript
const leftSidebarConfigs = {
  'dev': {
    component: () => import('...'),
    preset: 'autoOpenRecommended',  // 프리셋 사용
    overrides: {
      message: '문서를 선택하거나 새로 만드세요.',  // 추가 오버라이드
    }
  }
}
```

### 2. 주요 변경사항

1. **프리셋 시스템 도입**
   - `DEFAULT_BEHAVIOR`: 모든 사이드바의 기본값
   - `BEHAVIOR_PRESETS`: 재사용 가능한 설정 조합
     - `leftDefault`: 왼쪽 사이드바 기본값
     - `rightDefault`: 오른쪽 사이드바 기본값
     - `autoOpenRecommended`: 권장 자동 오픈
     - `autoOpenRequired`: 필수 자동 오픈

2. **동적 Behavior 생성**
   - `createBehavior()`: 우선순위 기반 병합
     - 우선순위: `overrides` > `adminBehavior` > `base` (프리셋/기본값)
   - `getLeftSidebarBehavior()` / `getRightSidebarBehavior()`: 최신 관리자 설정 반영

3. **하위 호환성 유지**
   - `getLeftSidebarConfig()` / `getRightSidebarConfig()`에 `behavior` getter 추가
   - 기존 코드에서 `config.behavior` 접근 시 자동으로 동적 생성

---

## 📋 현재 사용 현황

### MainLayout.vue

**사용 중인 함수**:
- `getLeftSidebarComponent(menuName)`: 왼쪽 사이드바 컴포넌트 로드
- `getRightSidebarComponent(menuName)`: 오른쪽 사이드바 컴포넌트 로드

**사용 위치**:
```javascript
// NEXA-Platform/src/layouts/MainLayout.vue (569-580줄)
watch(
  currentMenu,
  async (newMenu) => {
    const leftComponent = await getLeftSidebarComponent(newMenu)
    leftSidebarComponent.value = leftComponent

    const rightComponent = await getRightSidebarComponent(newMenu)
    rightSidebarComponent.value = rightComponent
  },
  { immediate: true },
)
```

**결론**: ✅ **문제없음**
- 컴포넌트만 로드하고 있어서 구조 변경의 영향을 받지 않음
- behavior 설정은 아직 사용하지 않음 (오픈 전략 시스템 미구현)

---

## 🔍 상세 검토

### 1. sidebarRegistry.js 내부 구조

**✅ 올바르게 변경됨**:

```javascript
// leftSidebarConfigs 예시
const leftSidebarConfigs = {
  'nexa-board': {
    component: () => import('...'),
    preset: 'leftDefault',      // ✅ 프리셋 사용
    overrides: {},               // ✅ 오버라이드 빈 객체
  },
  'dev': {
    component: () => import('...'),
    preset: 'autoOpenRecommended',  // ✅ 권장 자동 오픈 프리셋
    overrides: {
      message: '문서를 선택하거나 새로 만드세요.',  // ✅ 추가 오버라이드
    },
  },
}
```

### 2. 함수 동작 확인

**✅ getLeftSidebarBehavior / getRightSidebarBehavior**:
- 동적으로 `createBehavior()` 호출
- 최신 관리자 설정 반영
- 프리셋과 오버라이드 올바르게 병합

**✅ getLeftSidebarConfig / getRightSidebarConfig**:
- 하위 호환성을 위한 `behavior` getter 제공
- 기존 코드에서 `config.behavior` 접근 시 자동으로 동적 생성

### 3. 실제 사용 파일 검색 결과

**검색된 사용처**:
- `MainLayout.vue`: `getLeftSidebarComponent`, `getRightSidebarComponent`만 사용 ✅
- 다른 파일에서 `getLeftSidebarBehavior` / `getRightSidebarBehavior` 직접 사용 없음
- 다른 파일에서 `config.behavior` 직접 접근 없음

---

## 🎯 결론

### ✅ 모든 변경사항이 올바르게 반영됨

1. **sidebarRegistry.js**: 프리셋 패턴으로 성공적으로 리팩토링됨
2. **MainLayout.vue**: 컴포넌트 로드만 하므로 영향 없음
3. **하위 호환성**: 기존 코드와의 호환성 유지됨

### 📝 향후 작업

**오픈 전략 시스템 구현 시**:
- `getLeftSidebarBehavior(menuName)` / `getRightSidebarBehavior(menuName)` 사용
- `MainLayout.vue`에서 behavior 설정 기반으로 자동 오픈 로직 구현
- `sidebarOpenStrategyStore.js`에서 behavior 설정 참조

**예시**:
```javascript
// MainLayout.vue에서 오픈 전략 시스템 구현 시
import { getLeftSidebarBehavior, getRightSidebarBehavior } from 'src/config/sidebarRegistry.js'

watch(
  currentMenu,
  async (newMenu) => {
    // 컴포넌트 로드
    const leftComponent = await getLeftSidebarComponent(newMenu)
    leftSidebarComponent.value = leftComponent

    // behavior 설정 가져오기 (오픈 전략 시스템용)
    const leftBehavior = getLeftSidebarBehavior(newMenu)
    if (leftBehavior?.autoOpen) {
      // 자동 오픈 로직
    }
  },
  { immediate: true },
)
```

---

## 📊 검토 체크리스트

- [x] sidebarRegistry.js의 preset/overrides 구조 확인
- [x] getLeftSidebarBehavior/getRightSidebarBehavior 동적 생성 확인
- [x] 하위 호환성 (config.behavior getter) 확인
- [x] MainLayout.vue에서 사용 중인 함수 확인
- [x] 다른 파일에서의 사용 여부 확인
- [x] 실제 동작 테스트 (컴포넌트 로드)

---

**최종 업데이트**: 2024년 12월

