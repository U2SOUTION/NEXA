# Stores 현황 분석 및 명명 규칙

## 현재 Stores 현황

### 파일 목록

| 파일명                    | Store ID          | Export 함수               | 사용 범위 | 비고              |
| ------------------------- | ----------------- | ------------------------- | --------- | ----------------- |
| `documentManagerStore.js` | `documentManager` | `useDocumentManagerStore` | 전역      | 문서 관리         |
| `partsDataStore.js`       | `partsData`       | `usePartsDataStore`       | 전역      | 부품 데이터       |
| `partsManagementStore.js` | `partsManagement` | `usePartsManagementStore` | 전역      | 부품 관리         |
| `userSettingsStore.js`    | `userSettings`    | `useUserSettingsStore`    | 전역      | 사용자 설정       |
| `modalSystemStore.js`     | `modalSystem`     | `useModalSystemStore`     | 전역      | 모달 시스템       |
| `dashboardLayoutStore.js` | `dashboardLayout` | `useDashboardLayoutStore` | 전역      | 대시보드 레이아웃 |
| `layout.js`               | `layout`          | `useLayoutStore`          | 전역      | 레이아웃 (예외)   |
| `boardEditorStore.js`     | `boardEditor`     | `useBoardEditorStore`     | 전역      | 보드 에디터       |
| `boardMenuStore.js`       | `boardMenu`       | `useBoardMenuStore`       | 전역      | 보드 메뉴         |

### 새로 추가된 샘플

| 파일명                  | Store ID        | Export 함수             | 사용 범위                 | 비고             |
| ----------------------- | --------------- | ----------------------- | ------------------------- | ---------------- |
| `devGuideCacheStore.js` | `devGuideCache` | `useDevGuideCacheStore` | **개발 전용처럼 보임** ⚠️ | 개발 가이드 캐시 |

## 문제점 분석

### 1. 명명 규칙 불일치

**현재 패턴:**

-   대부분: `{기능}Store.js` → `use{기능}Store`
-   예외: `layout.js` → `useLayoutStore`

**샘플의 문제:**

-   `devGuideCacheStore.js` → `useDevGuideCacheStore`
-   "dev" 접두어로 인해 개발 전용처럼 보임
-   실제로는 전역에서 사용 가능해야 함

### 2. Store ID 명명 규칙

**현재 패턴:**

-   camelCase 사용: `documentManager`, `partsData`, `userSettings`
-   기능 중심 명명

**샘플의 문제:**

-   `devGuideCache` - "dev" 접두어로 인해 개발 전용처럼 보임

## 명명 규칙 제안

### 파일명 규칙

```
{기능명}Store.js
```

**규칙:**

-   기능 중심으로 명명
-   개발 전용이 아닌 경우 "dev" 접두어 사용 금지
-   복합 단어는 camelCase 사용

**예시:**

-   ✅ `componentCacheStore.js` - 컴포넌트 캐시 (가장 적절) ⭐
-   ✅ `componentPreviewCacheStore.js` - 컴포넌트 미리보기 캐시 (더 명확하지만 길음)
-   ⚠️ `previewCacheStore.js` - "preview"로 인해 미리보기 전용처럼 보임
-   ⚠️ `guideCacheStore.js` - "guide"로 인해 가이드 기능에만 국한된 것처럼 보임
-   ❌ `devGuideCacheStore.js` - "dev" 접두어로 인해 개발 전용처럼 보임

### Store ID 규칙

```javascript
defineStore("{기능명}", () => {
    // ...
});
```

**규칙:**

-   파일명과 동일한 camelCase 사용
-   전역 사용 가능한 기능은 접두어 없이 명명

**예시:**

-   ✅ `defineStore('componentCache', ...)` - 컴포넌트 캐시 (가장 적절) ⭐
-   ✅ `defineStore('componentPreviewCache', ...)` - 컴포넌트 미리보기 캐시 (더 명확하지만 길음)
-   ⚠️ `defineStore('previewCache', ...)` - "preview"로 인해 미리보기 전용처럼 보임
-   ⚠️ `defineStore('guideCache', ...)` - "guide"로 인해 가이드 기능에만 국한된 것처럼 보임
-   ❌ `defineStore('devGuideCache', ...)`

### Export 함수 규칙

```javascript
export const use{기능명}Store = defineStore('{기능명}', () => {
  // ...
})
```

**규칙:**

-   PascalCase로 변환
-   "use" 접두어 + 기능명 + "Store"

**예시:**

-   ✅ `useComponentCacheStore` - 컴포넌트 캐시 (가장 적절) ⭐
-   ✅ `useComponentPreviewCacheStore` - 컴포넌트 미리보기 캐시 (더 명확하지만 길음)
-   ⚠️ `usePreviewCacheStore` - "preview"로 인해 미리보기 전용처럼 보임
-   ⚠️ `useGuideCacheStore` - "guide"로 인해 가이드 기능에만 국한된 것처럼 보임
-   ❌ `useDevGuideCacheStore`

## 현재 Stores 상세 분석

### 1. documentManagerStore.js

**용도:** 문서 관리 (DevelopmentPage와 DocumentListSidebar 간 상태 공유)

**특징:**

-   전역 사용 가능
-   문서 목록, 선택된 파일, 목차 등 관리
-   localStorage 연동

**명명:** ✅ 적절함

### 2. partsDataStore.js

**용도:** 부품 데이터 관리

**특징:**

-   전역 사용 가능
-   부품 클래스, 모델, 스펙 등 관리
-   API 연동

**명명:** ✅ 적절함

### 3. userSettingsStore.js

**용도:** 사용자 설정 관리

**특징:**

-   전역 사용 가능
-   테마, 레이아웃 설정 등 관리
-   localStorage 연동

**명명:** ✅ 적절함

### 4. modalSystemStore.js

**용도:** 모달 시스템 관리

**특징:**

-   전역 사용 가능
-   모달 열기/닫기, 스택 관리

**명명:** ✅ 적절함

### 5. layout.js

**용도:** 레이아웃 관리

**특징:**

-   전역 사용 가능
-   예외: 파일명이 `layout.js` (Store 접미사 없음)

**명명:** ⚠️ 예외 케이스 (일관성 부족)

### 6. boardEditorStore.js

**용도:** 보드 에디터 상태 관리

**특징:**

-   전역 사용 가능
-   보드 편집 관련 상태

**명명:** ✅ 적절함

## 개선 방안

### 1. 새 샘플 파일명 수정

**현재:**

```javascript
// stores/devGuideCacheStore.js
export const useDevGuideCacheStore = defineStore("devGuideCache", () => {
    // ...
});
```

**개선안 분석:**

이 Store는 실제로 **컴포넌트를 캐시**하는 용도입니다. 현재는 미리보기용이지만 다른 컴포넌트 캐시로도 확장 가능합니다.

**개선안 1 (가장 적절) ⭐:**

```javascript
// stores/componentCacheStore.js
export const useComponentCacheStore = defineStore("componentCache", () => {
    // ...
});
```

**장점:**

-   기능 중심 명명 (컴포넌트 캐시)
-   "preview" 제거로 전역 사용 가능함을 명확히 함
-   간결하고 명확함
-   다른 Store들과 일관성 유지
-   확장 가능 (다른 컴포넌트 캐시도 추가 가능)

**개선안 2 (더 명확하지만 길음):**

```javascript
// stores/componentPreviewCacheStore.js
export const useComponentPreviewCacheStore = defineStore("componentPreviewCache", () => {
    // ...
});
```

**장점:**

-   컴포넌트 미리보기 캐시임을 명확히 함
-   더 구체적

**단점:**

-   파일명이 길어짐
-   "preview"로 인해 여전히 특정 기능에 국한된 것처럼 보임

**개선안 3 (비권장):**

```javascript
// stores/previewCacheStore.js
export const usePreviewCacheStore = defineStore("previewCache", () => {
    // ...
});
```

**문제점:**

-   "preview"로 인해 미리보기 전용처럼 보임
-   전역 재사용 시 혼란 가능

**개선안 4 (비권장):**

```javascript
// stores/guideCacheStore.js
export const useGuideCacheStore = defineStore("guideCache", () => {
    // ...
});
```

**문제점:**

-   "guide"가 포함되어 가이드 기능에만 국한된 것처럼 보임
-   실제로는 컴포넌트 캐시 기능이므로 "component"가 더 적절

**권장:** 개선안 1 (`componentCacheStore.js`) ⭐

-   기능 중심 명명 (컴포넌트 캐시)
-   "preview" 제거로 전역 사용 가능함을 명확히 함
-   간결하고 명확함
-   다른 Store들과 일관성 유지
-   확장 가능 (다른 컴포넌트 캐시도 추가 가능)

### 2. 명명 규칙 문서화

**규칙 요약:**

1. **파일명:** `{기능명}Store.js` (camelCase)
2. **Store ID:** `{기능명}` (camelCase, 파일명과 동일)
3. **Export 함수:** `use{기능명}Store` (PascalCase)
4. **전역 사용 가능:** 접두어 없이 기능 중심 명명
5. **개발 전용이 아닌 경우:** "dev" 접두어 사용 금지

### 3. 예외 케이스 처리

**layout.js:**

-   현재: `layout.js` → `useLayoutStore`
-   권장: `layoutStore.js`로 변경 (일관성 유지)
-   또는: 예외 케이스로 문서화

## 실제 적용 예시

### Before (샘플)

```javascript
// stores/devGuideCacheStore.js
export const useDevGuideCacheStore = defineStore("devGuideCache", () => {
    // ...
});
```

### After (개선) ⭐

```javascript
// stores/componentCacheStore.js
export const useComponentCacheStore = defineStore("componentCache", () => {
    // ...
});
```

### 사용 예시

```javascript
// Before
import { useDevGuideCacheStore } from "src/stores/devGuideCacheStore";
const cacheStore = useDevGuideCacheStore();

// After (권장)
import { useComponentCacheStore } from "src/stores/componentCacheStore";
const cacheStore = useComponentCacheStore();
```

### 왜 "componentCache"인가?

**문제점:**

1.  **"preview"의 한계**: "preview"가 포함되면 미리보기 전용처럼 보임
2.  **전역 재사용성 저하**: 다른 곳에서 컴포넌트 캐시가 필요할 때 사용하기 어려워 보임
3.  **확장성 제한**: 미리보기 외의 다른 컴포넌트 캐시로 확장하기 어려움

**해결:**

-   실제 기능 중심으로 명명: `componentCacheStore.js`
-   "preview" 제거로 전역 사용 가능함을 명확히 함
-   기능이 명확히 드러남 (컴포넌트 캐시)
-   확장 가능 (다른 컴포넌트 캐시도 추가 가능)

## 체크리스트

새로운 Store를 만들 때:

-   [ ] 파일명이 `{기능명}Store.js` 형식인가?
-   [ ] Store ID가 파일명과 동일한가?
-   [ ] Export 함수가 `use{기능명}Store` 형식인가?
-   [ ] 전역 사용 가능한 경우 "dev" 접두어를 사용하지 않았는가?
-   [ ] 기능 중심으로 명명되었는가?
-   [ ] 다른 Store들과 일관성이 있는가?

## 참고

-   [NEXA-컨텐츠*사이드바\_Pinia_Store*최적화\_샘플.md](./NEXA-컨텐츠_사이드바_Pinia_Store_최적화_샘플.md) - 실제 구현 샘플
-   [Pinia 공식 문서](https://pinia.vuejs.org/core-concepts/) - Store 정의 가이드

---

**작성일**: 2024년 12월  
**상태**: 분석 완료, 개선안 제시
