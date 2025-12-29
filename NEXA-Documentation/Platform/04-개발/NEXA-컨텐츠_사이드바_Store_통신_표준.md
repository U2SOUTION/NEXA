# NEXA 컨텐츠-사이드바 Store 통신 표준

## 📋 개요

이 문서는 NEXA Platform에서 **컨텐츠 영역**과 **양쪽 사이드바** 간의 상태 공유 및 통신을 위한 표준 패턴을 정의합니다.

### 적용 범위

-   **왼쪽 사이드바** ↔ **컨텐츠 영역** ↔ **오른쪽 사이드바**
-   여러 컴포넌트 간 공유 상태 관리
-   복잡한 상태 로직이 필요한 경우
-   지속성(localStorage)이 필요한 상태

### 핵심 원칙

1. **Store 우선**: 공유 상태는 Pinia Store로 관리
2. **자동 반응성**: 전역 이벤트 대신 Store의 반응성을 활용
3. **타입 안정성**: Store 액션을 통한 타입 체크
4. **일관성**: 프로젝트 전반에 걸친 일관된 패턴

---

## 🏗️ 아키텍처

### 구조

```
┌─────────────────┐
│  왼쪽 사이드바   │
│  (DevGuideList) │
└────────┬────────┘
         │
         │ Store 액션 호출
         │ (selectSample, setFilterCategory 등)
         │
         ▼
┌─────────────────────────────────┐
│      Pinia Store                │
│  (devGuideStore)                │
│                                 │
│  - selectedSample               │
│  - samples                      │
│  - filterCategory               │
│  - previewStates                │
│  - ...                          │
└────────┬────────────────────────┘
         │
         │ 자동 반응성
         │ (storeToRefs, computed)
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────────┐
│ 컨텐츠   │ │ 오른쪽 사이드바│
│(Content) │ │ (Panel/Stats)│
└─────────┘ └──────────────┘
```

### 통신 흐름

1. **상태 변경**: 컴포넌트에서 Store 액션 호출
2. **자동 반응**: Store 상태 변경 시 모든 구독 컴포넌트 자동 업데이트
3. **전역 이벤트 불필요**: Store의 반응성으로 충분

---

## 📦 Store 구조

### 파일 위치

```
NEXA-Platform/src/stores/devGuideStore.js
```

### 명명 규칙

-   **파일명**: `{기능명}Store.js` (예: `devGuideStore.js`)
-   **Store ID**: `{기능명}` (camelCase, 예: `devGuide`)
-   **Export 함수**: `use{기능명}Store` (예: `useDevGuideStore`)

### Store 정의 예시

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDevGuideStore = defineStore('devGuide', () => {
  // ============================================
  // 상태 (State)
  // ============================================
  const selectedSample = ref(null)
  const samples = ref([])
  const filterCategory = ref(null)

  // ============================================
  // Getters (계산된 속성)
  // ============================================
  const filteredSamples = computed(() => {
    // 필터링 로직
    return samples.value.filter(...)
  })

  // ============================================
  // Actions (액션)
  // ============================================
  function selectSample(sample) {
    selectedSample.value = sample
    // 추가 로직 (localStorage 저장 등)
  }

  return {
    // 상태
    selectedSample,
    samples,
    filterCategory,
    // Getters
    filteredSamples,
    // Actions
    selectSample,
  }
})
```

---

## 🔌 컴포넌트에서 Store 사용

### 기본 사용법

```vue
<script setup>
import { storeToRefs } from "pinia";
import { useDevGuideStore } from "src/stores/devGuideStore";

// Store 인스턴스
const store = useDevGuideStore();

// 반응성 유지: storeToRefs 사용
const { selectedSample, samples, filteredSamples } = storeToRefs(store);

// 액션 호출: 직접 호출
function handleSampleClick(sample) {
    store.selectSample(sample);
}
</script>

<template>
    <div v-for="sample in filteredSamples" :key="sample.id">
        <button @click="handleSampleClick(sample)">
            {{ sample.name }}
        </button>
    </div>
</template>
```

### 상태 읽기

```javascript
// ✅ 좋은 예: storeToRefs 사용 (반응성 유지)
const { selectedSample, samples } = storeToRefs(store);

// ❌ 나쁜 예: 직접 접근 (반응성 손실)
const selectedSample = store.selectedSample;
```

### 상태 변경

```javascript
// ✅ 좋은 예: Store 액션 사용
store.selectSample(sample);
store.setFilterCategory(category);

// ❌ 나쁜 예: 직접 변경 (비권장, 필요시에만)
store.selectedSample = sample;
```

### Computed 속성 사용

```javascript
// Store의 computed getter 사용
const { filteredSamples, cacheStats } = storeToRefs(store);

// 또는 로컬 computed와 조합
const displaySamples = computed(() => {
    return filteredSamples.value.slice(0, 10);
});
```

---

## 📊 실제 사용 예시

### 예시 1: 왼쪽 사이드바 (DevGuideList)

```vue
<script setup>
import { storeToRefs } from "pinia";
import { useDevGuideStore } from "src/stores/devGuideStore";

const store = useDevGuideStore();
const { samples, selectedSample, filteredSamples } = storeToRefs(store);

function handleSampleClick(sample) {
    // Store 액션 호출
    store.selectSample(sample);
}
</script>

<template>
    <div v-for="sample in filteredSamples" :key="sample.id" :class="{ active: selectedSample?.id === sample.id }" @click="handleSampleClick(sample)">
        {{ sample.name }}
    </div>
</template>
```

### 예시 2: 컨텐츠 영역 (DevGuideContent)

```vue
<script setup>
import { watch } from "vue";
import { storeToRefs } from "pinia";
import { useDevGuideStore } from "src/stores/devGuideStore";

const store = useDevGuideStore();
const { selectedSample, previewStates } = storeToRefs(store);

// selectedSample 변경 감지
watch(
    () => selectedSample.value?.componentPath,
    (newPath) => {
        if (newPath) {
            loadSampleComponent(newPath);
        }
    }
);

// 캐시 관리
function addPreview(sampleId, component) {
    store.addLoadedPreview(sampleId, component);
}
</script>

<template>
    <div v-if="selectedSample">
        <h1>{{ selectedSample.name }}</h1>
        <!-- 컨텐츠 표시 -->
    </div>
</template>
```

### 예시 3: 오른쪽 사이드바 (DevGuidePanel, DevGuideStatistics)

```vue
<script setup>
import { storeToRefs } from "pinia";
import { useDevGuideStore } from "src/stores/devGuideStore";

const store = useDevGuideStore();
const { selectedSample, cacheStats } = storeToRefs(store);

// 캐시 정리 버튼
function handleCleanup() {
    store.cleanupOldCache();
}
</script>

<template>
    <div v-if="selectedSample">
        <h2>{{ selectedSample.name }}</h2>
        <p>{{ selectedSample.description }}</p>
    </div>

    <div class="cache-stats">
        <p>로드된 컴포넌트: {{ cacheStats.loadedPreviews }}</p>
        <p>보이는 샘플: {{ cacheStats.visibleSamples }}</p>
        <button @click="handleCleanup">캐시 정리</button>
    </div>
</template>
```

---

## ✅ Store 사용 기준

### Store를 사용해야 하는 경우

-   [x] **2개 이상의 컴포넌트에서 상태 공유**
-   [x] **복잡한 상태 로직** (필터링, 계산 등)
-   [x] **지속성 필요** (localStorage 연동)
-   [x] **전역 설정/설정**

### Store를 사용하지 않아도 되는 경우

-   [ ] 단일 컴포넌트 내부 상태
-   [ ] 부모-자식 간 단순 props/emit
-   [ ] 일회성 계산/유틸리티
-   [ ] 단순한 로컬 UI 상태 (isHovered, isLoading 등)

---

## 🚫 금지 사항

### 1. 전역 이벤트 사용 금지

```javascript
// ❌ 나쁜 예: 전역 이벤트 사용
window.dispatchEvent(new CustomEvent("sample-selected", { detail: { sample } }));
window.addEventListener("sample-selected", handler);

// ✅ 좋은 예: Store 사용
store.selectSample(sample);
const { selectedSample } = storeToRefs(store);
```

### 2. 직접 상태 변경 지양

```javascript
// ❌ 나쁜 예: 직접 변경 (비권장)
store.selectedSample = sample;

// ✅ 좋은 예: Store 액션 사용
store.selectSample(sample);
```

### 3. 반응성 손실 주의

```javascript
// ❌ 나쁜 예: 반응성 손실
const selectedSample = store.selectedSample;

// ✅ 좋은 예: storeToRefs 사용
const { selectedSample } = storeToRefs(store);
```

---

## 🔄 마이그레이션 가이드

### 기존 Composable → Store

#### Before (Composable 싱글톤)

```javascript
// useDevGuide.js
const selectedSample = ref(null);

export function useDevGuide() {
    function handleSampleSelect(sample) {
        selectedSample.value = sample;
        window.dispatchEvent(new CustomEvent("dev-guide-sample-selected"));
    }

    return { selectedSample, handleSampleSelect };
}
```

#### After (Store)

```javascript
// stores/devGuideStore.js
export const useDevGuideStore = defineStore("devGuide", () => {
    const selectedSample = ref(null);

    function selectSample(sample) {
        selectedSample.value = sample;
        // 전역 이벤트 불필요 - 자동 반응성
    }

    return { selectedSample, selectSample };
});
```

### 기존 전역 이벤트 → Store

#### Before (전역 이벤트)

```javascript
// 컴포넌트 A
window.dispatchEvent(new CustomEvent("cache-updated", { detail: { cache } }));

// 컴포넌트 B
onMounted(() => {
    window.addEventListener("cache-updated", (event) => {
        cache.value = event.detail.cache;
    });
});
```

#### After (Store)

```javascript
// stores/devGuideStore.js
const previewStates = {
    loadedPreviews: ref(new Map()),
    // ...
};

// 컴포넌트 A
store.addLoadedPreview(sampleId, component);

// 컴포넌트 B
const { previewStates } = storeToRefs(store);
// 자동 반응성으로 업데이트됨
```

---

## 📝 체크리스트

### Store 생성 시

-   [ ] 파일명이 `{기능명}Store.js` 형식인가?
-   [ ] Store ID가 camelCase인가?
-   [ ] Export 함수가 `use{기능명}Store` 형식인가?
-   [ ] 상태, Getters, Actions가 명확히 구분되어 있는가?
-   [ ] localStorage 연동이 필요한 상태는 저장/로드 함수가 있는가?

### 컴포넌트에서 Store 사용 시

-   [ ] `storeToRefs`를 사용하여 반응성을 유지하는가?
-   [ ] 상태 변경 시 Store 액션을 사용하는가?
-   [ ] 전역 이벤트를 사용하지 않는가?
-   [ ] 직접 상태 변경을 피하는가?

---

## 🎯 장점 요약

### 1. 일관성

-   프로젝트 전반에 걸친 일관된 패턴
-   다른 Store들과 동일한 구조

### 2. 자동 반응성

-   전역 이벤트 리스너 관리 불필요
-   Vue의 반응성 시스템 활용

### 3. 타입 안정성

-   Store 액션을 통한 타입 체크
-   TypeScript 지원 용이

### 4. 디버깅 용이

-   Vue DevTools에서 상태 추적
-   상태 변경 히스토리 확인

### 5. 테스트 용이성

-   Store를 독립적으로 테스트 가능
-   Mock 객체 생성 용이

---

## 📚 참고 문서

-   [NEXA-컨텐츠*사이드바*전역*이벤트*통신\_패턴.md](./NEXA-컨텐츠_사이드바_전역_이벤트_통신_패턴.md) - 기존 전역 이벤트 패턴 (레거시)
-   [NEXA-컨텐츠*사이드바\_Pinia_Store*최적화\_샘플.md](./NEXA-컨텐츠_사이드바_Pinia_Store_최적화_샘플.md) - Pinia Store 최적화 샘플
-   [NEXA-Stores*현황*분석*및*명명\_규칙.md](./NEXA-Stores_현황_분석_및_명명_규칙.md) - Store 명명 규칙

---

**마지막 업데이트**: 2024년 12월
