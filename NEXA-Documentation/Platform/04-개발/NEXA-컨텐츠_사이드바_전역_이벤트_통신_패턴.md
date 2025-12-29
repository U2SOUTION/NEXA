# 컨텐츠-사이드바 전역 이벤트 통신 패턴

## 개요

Vue 3에서 서로 다른 컴포넌트 트리에 있는 컴포넌트 간 통신이 필요할 때, `provide/inject`가 작동하지 않는 경우 전역 이벤트 버스를 사용하는 패턴입니다.

## 문제 상황

### 구조적 제약

```
MainLayout
├── q-page-container (router-view)
│   └── DevGuideContent.vue (컨텐츠 영역)
└── q-drawer (사이드바)
    └── DevGuideStatistics.vue (통계 패널)
```

-   `DevGuideContent`와 `DevGuideStatistics`는 직접적인 부모-자식 관계가 아님
-   `provide/inject`는 같은 컴포넌트 트리 내에서만 작동
-   서로 다른 트리에 있는 컴포넌트 간 통신 필요

### 요구사항

-   컨텐츠 컴포넌트의 상태를 사이드바 컴포넌트에 실시간으로 전달
-   상태 변경 시 자동 동기화
-   초기 마운트 시점 문제 해결

## 해결 방법: 전역 이벤트 버스

### 1. 컨텐츠 컴포넌트 (상태 제공자)

```vue
<!-- DevGuideContent.vue -->
<template>
    <div class="content">
        <!-- 컨텐츠 영역 -->
    </div>
</template>

<script setup>
import { ref, defineExpose, onMounted, onBeforeUnmount, watch } from "vue";

// 상태 정의
const previewStates = {
    loadedPreviews: ref(new Map()),
    visibleSamples: ref(new Set()),
    loadingPreviews: ref(new Set()),
    previewErrors: ref(new Map()),
};

const CACHE_CONFIG = {
    MAX_CACHE_SIZE: 50,
    CACHE_CLEANUP_THRESHOLD: 300000, // 5분
};

// 함수 정의
function cleanupOldCache() {
    // 캐시 정리 로직
}

function clearAllCache() {
    // 캐시 초기화 로직
}

// 부모 컴포넌트에서 접근 가능하도록 expose (선택사항)
defineExpose({
    previewStates,
    CACHE_CONFIG,
    cleanupOldCache,
    clearAllCache,
});

// 전역 이벤트로 상태 전달
function handleCacheStateRequest() {
    window.dispatchEvent(
        new CustomEvent("cache-state-updated", {
            detail: {
                previewStates,
                CACHE_CONFIG,
                cleanupOldCache,
                clearAllCache,
            },
        })
    );
}

onMounted(() => {
    // 이벤트 리스너 등록
    window.addEventListener("cache-state-request", handleCacheStateRequest);

    // 초기 상태 전달
    handleCacheStateRequest();

    // 상태 변경 시마다 이벤트 발생
    watch(
        [() => previewStates.loadedPreviews.value.size, () => previewStates.visibleSamples.value.size, () => previewStates.loadingPreviews.value.size, () => previewStates.previewErrors.value.size],
        () => {
            handleCacheStateRequest();
        },
        { deep: true }
    );
});

onBeforeUnmount(() => {
    // 이벤트 리스너 제거
    window.removeEventListener("cache-state-request", handleCacheStateRequest);
});
</script>
```

### 2. 사이드바 컴포넌트 (상태 수신자)

```vue
<!-- DevGuideStatistics.vue -->
<template>
    <div class="statistics">
        <div>캐시된 컴포넌트: {{ loadedPreviewsSize }} / {{ maxCacheSize }}</div>
        <div>현재 보이는 샘플: {{ visibleSamplesSize }}</div>
        <div>로딩 중: {{ loadingPreviewsSize }}</div>
        <div>에러: {{ previewErrorsSize }}</div>
        <div>캐시 사용률: {{ cacheUsageRate }}%</div>

        <button @click="handleCleanupCache" :disabled="!cleanupOldCache">캐시 정리</button>
        <button @click="handleClearCache" :disabled="!clearAllCache">캐시 초기화</button>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";

// 원본 객체 저장 (함수 호출용)
const previewStates = ref(null);
const CACHE_CONFIG = ref(null);
const cleanupOldCache = ref(null);
const clearAllCache = ref(null);

// ⚠️ 중요: 중첩된 ref 구조의 반응성 문제 해결
// computed 대신 직접 ref로 값을 추출하여 저장
const loadedPreviewsSize = ref(0);
const visibleSamplesSize = ref(0);
const loadingPreviewsSize = ref(0);
const previewErrorsSize = ref(0);
const maxCacheSize = ref(0);

// 캐시 사용률 계산
const cacheUsageRate = computed(() => {
    const loaded = loadedPreviewsSize.value;
    const max = maxCacheSize.value;
    if (max === 0) return 0;
    return Math.round((loaded / max) * 100);
});

// 전역 이벤트 리스너
function handleCacheStateUpdate(event) {
    const { previewStates: states, CACHE_CONFIG: config, cleanupOldCache: cleanup, clearAllCache: clear } = event.detail;

    // 원본 객체 저장 (함수 호출용)
    previewStates.value = states;
    CACHE_CONFIG.value = config;
    cleanupOldCache.value = cleanup;
    clearAllCache.value = clear;

    // ⚠️ 중요: 반응형 값 직접 업데이트
    // 중첩된 ref 구조의 반응성 문제를 해결하기 위해
    // 값을 직접 추출하여 로컬 ref에 저장
    if (states) {
        loadedPreviewsSize.value = states.loadedPreviews?.value?.size ?? 0;
        visibleSamplesSize.value = states.visibleSamples?.value?.size ?? 0;
        loadingPreviewsSize.value = states.loadingPreviews?.value?.size ?? 0;
        previewErrorsSize.value = states.previewErrors?.value?.size ?? 0;
    }

    if (config) {
        maxCacheSize.value = config.MAX_CACHE_SIZE ?? 0;
    }
}

// 상태 요청 함수 (재시도 로직 포함)
function requestCacheState(retryCount = 0) {
    window.dispatchEvent(new CustomEvent("cache-state-request"));

    // 컨텐츠 컴포넌트가 아직 준비되지 않았을 수 있으므로 재시도
    if (retryCount < 3 && (!previewStates.value || !CACHE_CONFIG.value)) {
        setTimeout(() => {
            requestCacheState(retryCount + 1);
        }, 200 * (retryCount + 1)); // 200ms, 400ms, 600ms 간격으로 재시도
    }
}

onMounted(() => {
    // 이벤트 리스너 등록
    window.addEventListener("cache-state-updated", handleCacheStateUpdate);

    // DOM이 준비된 후 상태 요청 (재시도 로직 포함)
    nextTick(() => {
        requestCacheState();
    });
});

onBeforeUnmount(() => {
    // 이벤트 리스너 제거
    window.removeEventListener("cache-state-updated", handleCacheStateUpdate);
});

// 함수 호출 핸들러
function handleCleanupCache() {
    if (cleanupOldCache.value) {
        cleanupOldCache.value();
    }
}

function handleClearCache() {
    if (clearAllCache.value) {
        clearAllCache.value();
    }
}
</script>
```

## 핵심 포인트

### 1. 중첩된 ref 구조의 반응성 문제

**문제:**

```javascript
// ❌ 작동하지 않음
const previewStates = ref(null);
const loadedPreviewsSize = computed(() => previewStates.value?.loadedPreviews?.value?.size ?? 0);

// previewStates.value에 객체를 할당해도
// 내부의 ref 변경은 감지되지 않음
```

**해결:**

```javascript
// ✅ 올바른 방법
const previewStates = ref(null);
const loadedPreviewsSize = ref(0);

// 이벤트 핸들러에서 값을 직접 추출하여 저장
function handleCacheStateUpdate(event) {
    const { previewStates: states } = event.detail;
    previewStates.value = states;

    // 값을 직접 추출하여 로컬 ref에 저장
    loadedPreviewsSize.value = states.loadedPreviews?.value?.size ?? 0;
}
```

### 2. 타이밍 문제 해결

**문제:**

-   사이드바가 먼저 마운트되면 컨텐츠가 아직 준비되지 않음
-   초기 상태 요청이 실패할 수 있음

**해결:**

```javascript
// 재시도 로직 포함
function requestCacheState(retryCount = 0) {
    window.dispatchEvent(new CustomEvent("cache-state-request"));

    if (retryCount < 3 && (!previewStates.value || !CACHE_CONFIG.value)) {
        setTimeout(() => {
            requestCacheState(retryCount + 1);
        }, 200 * (retryCount + 1));
    }
}

onMounted(() => {
    nextTick(() => {
        requestCacheState();
    });
});
```

### 3. 이벤트 네이밍 규칙

-   **요청 이벤트**: `{feature}-state-request` (예: `cache-state-request`)
-   **업데이트 이벤트**: `{feature}-state-updated` (예: `cache-state-updated`)

## 장단점

### 장점

-   ✅ 서로 다른 컴포넌트 트리 간 통신 가능
-   ✅ 느슨한 결합 (컴포넌트 간 직접 의존성 없음)
-   ✅ 여러 컴포넌트가 동시에 수신 가능
-   ✅ 간단한 구현

### 단점

-   ❌ **타입 안정성 부족** (TypeScript 사용 시)
-   ❌ **이벤트 이름 오타 시 디버깅 어려움**
-   ❌ **전역 네임스페이스 오염 가능성**
-   ❌ **이벤트 리스너 정리 필요** (메모리 누수 방지)
-   ❌ **반응성 문제**: 중첩된 ref 구조로 인해 값 추출 로직 필요
-   ❌ **타이밍 문제**: 재시도 로직으로 복잡도 증가
-   ❌ **상태 동기화 복잡**: 수동으로 이벤트 발생 및 수신 관리 필요
-   ❌ **디버깅 어려움**: 이벤트 흐름 추적이 어려움

## ⚠️ 현재 방법의 한계

현재 전역 이벤트 버스 방식은 **작동은 하지만 최적화된 구조는 아닙니다**. 다음과 같은 문제가 있습니다:

### 1. 반응성 문제

```javascript
// ❌ 문제: 중첩된 ref 구조로 인해 computed가 제대로 작동하지 않음
const previewStates = ref(null);
const loadedPreviewsSize = computed(() => previewStates.value?.loadedPreviews?.value?.size ?? 0);

// ✅ 해결: 수동으로 값을 추출해야 함
const loadedPreviewsSize = ref(0);
function handleCacheStateUpdate(event) {
    loadedPreviewsSize.value = event.detail.previewStates.loadedPreviews?.value?.size ?? 0;
}
```

### 2. 상태 동기화 복잡도

-   상태 변경 시마다 수동으로 이벤트 발생 필요
-   수신 측에서도 수동으로 값 추출 및 업데이트 필요
-   양방향 동기화가 복잡함

### 3. 타입 안정성 부족

-   이벤트 `detail`의 타입이 명확하지 않음
-   런타임 에러 가능성
-   IDE 자동완성 지원 부족

### 4. 메모리 관리

-   이벤트 리스너 누적 가능성
-   `onBeforeUnmount`에서 반드시 정리 필요
-   실수로 누락 시 메모리 누수

## 개선 방안

### 1. Pinia Store 사용 (권장) ⭐

**가장 권장되는 방법**입니다. Vue 3의 공식 상태 관리 라이브러리로, 반응성과 타입 안정성을 모두 제공합니다.

#### 장점

-   ✅ **자동 반응성**: Vue의 반응성 시스템과 완벽 통합
-   ✅ **타입 안정성**: TypeScript 지원 우수
-   ✅ **디버깅 용이**: Vue DevTools 지원
-   ✅ **상태 동기화 자동**: 수동 이벤트 발생 불필요
-   ✅ **메모리 관리 자동**: 리스너 정리 불필요

#### 구현 예제

```javascript
// stores/devGuideCacheStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useDevGuideCacheStore = defineStore("devGuideCache", () => {
    // 상태
    const loadedPreviews = ref(new Map());
    const visibleSamples = ref(new Set());
    const loadingPreviews = ref(new Set());
    const previewErrors = ref(new Map());

    const CACHE_CONFIG = {
        MAX_CACHE_SIZE: 50,
        CACHE_CLEANUP_THRESHOLD: 300000, // 5분
    };

    // Getters (computed)
    const loadedPreviewsSize = computed(() => loadedPreviews.value.size);
    const visibleSamplesSize = computed(() => visibleSamples.value.size);
    const loadingPreviewsSize = computed(() => loadingPreviews.value.size);
    const previewErrorsSize = computed(() => previewErrors.value.size);

    const cacheUsageRate = computed(() => {
        const loaded = loadedPreviewsSize.value;
        const max = CACHE_CONFIG.MAX_CACHE_SIZE;
        if (max === 0) return 0;
        return Math.round((loaded / max) * 100);
    });

    // Actions
    function addLoadedPreview(sampleId, component) {
        loadedPreviews.value.set(sampleId, component);
    }

    function removeLoadedPreview(sampleId) {
        loadedPreviews.value.delete(sampleId);
    }

    function addVisibleSample(sampleId) {
        visibleSamples.value.add(sampleId);
    }

    function removeVisibleSample(sampleId) {
        visibleSamples.value.delete(sampleId);
    }

    function cleanupOldCache() {
        // 캐시 정리 로직
        const now = Date.now();
        // ...
    }

    function clearAllCache() {
        loadedPreviews.value.clear();
        visibleSamples.value.clear();
        loadingPreviews.value.clear();
        previewErrors.value.clear();
    }

    return {
        // State
        loadedPreviews,
        visibleSamples,
        loadingPreviews,
        previewErrors,
        CACHE_CONFIG,

        // Getters
        loadedPreviewsSize,
        visibleSamplesSize,
        loadingPreviewsSize,
        previewErrorsSize,
        cacheUsageRate,

        // Actions
        addLoadedPreview,
        removeLoadedPreview,
        addVisibleSample,
        removeVisibleSample,
        cleanupOldCache,
        clearAllCache,
    };
});
```

#### 사용 예제

```vue
<!-- DevGuideContent.vue -->
<script setup>
import { useDevGuideCacheStore } from "src/stores/devGuideCacheStore";

const cacheStore = useDevGuideCacheStore();

// 상태 업데이트
function loadPreviewComponent(sample) {
    cacheStore.addVisibleSample(sample.id);
    // 컴포넌트 로드 후
    cacheStore.addLoadedPreview(sample.id, component);
}
</script>
```

```vue
<!-- DevGuideStatistics.vue -->
<script setup>
import { useDevGuideCacheStore } from "src/stores/devGuideCacheStore";

const cacheStore = useDevGuideCacheStore();

// 자동으로 반응형으로 업데이트됨
// 별도의 이벤트 리스너나 수동 동기화 불필요
</script>

<template>
    <div>
        <div>캐시된 컴포넌트: {{ cacheStore.loadedPreviewsSize }} / {{ cacheStore.CACHE_CONFIG.MAX_CACHE_SIZE }}</div>
        <div>현재 보이는 샘플: {{ cacheStore.visibleSamplesSize }}</div>
        <div>캐시 사용률: {{ cacheStore.cacheUsageRate }}%</div>
        <button @click="cacheStore.cleanupOldCache">캐시 정리</button>
        <button @click="cacheStore.clearAllCache">캐시 초기화</button>
    </div>
</template>
```

#### 마이그레이션 가이드

현재 전역 이벤트 방식을 Pinia Store로 마이그레이션하는 경우:

1. **Store 생성**: 위 예제와 같이 Store 생성
2. **상태 이동**: `DevGuideContent`의 상태를 Store로 이동
3. **이벤트 제거**: 전역 이벤트 관련 코드 제거
4. **Store 사용**: 컴포넌트에서 Store 직접 사용
5. **테스트**: 기능이 정상 작동하는지 확인

### 2. EventEmitter 패턴

전역 이벤트 버스를 사용하되, 더 구조화된 방식으로 관리:

```javascript
// utils/eventBus.js
class EventBus {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter((cb) => cb !== callback);
        }
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach((callback) => callback(data));
        }
    }

    once(event, callback) {
        const onceCallback = (data) => {
            callback(data);
            this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
    }
}

export const eventBus = new EventBus();
```

**장점:**

-   ✅ 이벤트 리스너 관리 용이
-   ✅ `once` 메서드로 일회성 이벤트 지원
-   ✅ 전역 네임스페이스 오염 감소

**단점:**

-   ❌ 여전히 반응성 문제 존재
-   ❌ 타입 안정성 부족

### 3. 컴포넌트 구조 재설계

가능하다면 컴포넌트 구조를 재설계하여 `provide/inject`를 사용:

```vue
<!-- DevelopmentPage.vue -->
<template>
    <div>
        <DevGuideContent />
        <DevGuideSidebar />
    </div>
</template>

<script setup>
import { provide, ref } from "vue";
import DevGuideContent from "./DevGuideContent.vue";
import DevGuideSidebar from "./DevGuideSidebar.vue";

const previewStates = ref({
    /* ... */
});

// 같은 트리 내에서 provide/inject 사용 가능
provide("previewStates", previewStates);
</script>
```

## 방법 선택 가이드

### 전역 이벤트 버스 사용 시기

-   ✅ 빠른 프로토타이핑
-   ✅ 간단한 일회성 통신
-   ✅ 컴포넌트 구조 변경이 어려운 경우
-   ✅ 임시 해결책이 필요한 경우

### Pinia Store 사용 시기 (권장) ⭐

-   ✅ 상태 관리가 복잡한 경우
-   ✅ 여러 컴포넌트에서 동일한 상태 공유
-   ✅ 상태 변경 이력 추적이 필요한 경우
-   ✅ 타입 안정성이 중요한 경우
-   ✅ 장기적으로 유지보수해야 하는 코드

### 컴포넌트 구조 재설계 시기

-   ✅ 프로젝트 초기 단계
-   ✅ 컴포넌트 구조 변경이 가능한 경우
-   ✅ `provide/inject`로 해결 가능한 경우

## 실제 사용 예제

### DevGuideContent.vue (실제 코드)

```javascript
// 캐시 상태 요청 이벤트 핸들러
function handleCacheStateRequest() {
    const event = new CustomEvent("dev-guide-cache-state-updated", {
        detail: {
            previewStates,
            CACHE_CONFIG,
            cleanupOldCache,
            clearAllCache,
            isDevMode,
            showPreview,
        },
    });

    if (import.meta.env.DEV) {
        console.log("[DevGuideContent] 캐시 상태 전달:", {
            loadedPreviews: previewStates.loadedPreviews.value.size,
            visibleSamples: previewStates.visibleSamples.value.size,
            // ...
        });
    }

    window.dispatchEvent(event);
}

onMounted(() => {
    window.addEventListener("dev-guide-cache-state-request", handleCacheStateRequest);
    handleCacheStateRequest();

    watch(
        [
            () => previewStates.loadedPreviews.value.size,
            () => previewStates.visibleSamples.value.size,
            // ...
        ],
        () => {
            handleCacheStateRequest();
        }
    );
});
```

### DevGuideStatistics.vue (실제 코드)

```javascript
function handleCacheStateUpdate(event) {
  const { previewStates: states, CACHE_CONFIG: config, ... } = event.detail

  previewStates.value = states
  CACHE_CONFIG.value = config

  // 반응형 값 직접 업데이트
  if (states) {
    loadedPreviewsSize.value = states.loadedPreviews?.value?.size ?? 0
    visibleSamplesSize.value = states.visibleSamples?.value?.size ?? 0
    // ...
  }
}

onMounted(() => {
  window.addEventListener('dev-guide-cache-state-updated', handleCacheStateUpdate)
  nextTick(() => {
    requestCacheState()
  })
})
```

## 주의사항

1. **이벤트 리스너 정리**: `onBeforeUnmount`에서 반드시 제거
2. **메모리 누수 방지**: 이벤트 리스너가 누적되지 않도록 주의
3. **타이밍 문제**: `nextTick`과 재시도 로직 사용
4. **반응성 문제**: 중첩된 ref 구조는 직접 값 추출 필요
5. **디버깅**: 개발 모드에서 로그 출력으로 상태 확인

## 참고

-   [Vue 3 Custom Events](https://vuejs.org/guide/components/events.html)
-   [Vue 3 provide/inject](https://vuejs.org/guide/components/provide-inject.html)
-   [NEXA-컴포넌트*표준*계약.md](./NEXA-컴포넌트_표준_계약.md)

## 결론

현재 전역 이벤트 버스 방식은 **작동은 하지만 최적화된 구조는 아닙니다**.

### 현재 상태

-   ✅ 기능적으로는 정상 작동
-   ❌ 반응성 문제로 인한 수동 값 추출 필요
-   ❌ 상태 동기화 복잡도 높음
-   ❌ 타입 안정성 부족
-   ❌ 메모리 관리 수동 처리 필요

### 권장 사항

**장기적으로는 Pinia Store로 마이그레이션하는 것을 강력히 권장합니다.**

1. **즉시 적용 가능**: 현재 프로젝트에 이미 Pinia가 설정되어 있음
2. **반응성 자동**: Vue의 반응성 시스템과 완벽 통합
3. **타입 안정성**: TypeScript 지원 우수
4. **유지보수성**: 코드가 더 간결하고 이해하기 쉬움
5. **디버깅 용이**: Vue DevTools 지원

### 마이그레이션 우선순위

1. **높음**: 새로운 기능 개발 시 Pinia Store 사용
2. **중간**: 기존 전역 이벤트 코드 리팩토링 시 Store로 변경
3. **낮음**: 현재 작동하는 코드는 유지 (점진적 마이그레이션)

---

**작성일**: 2024년 12월  
**적용 사례**: DevGuideContent ↔ DevGuideStatistics 통신  
**상태**: 작동하지만 최적화 필요 (Pinia Store 마이그레이션 권장)
