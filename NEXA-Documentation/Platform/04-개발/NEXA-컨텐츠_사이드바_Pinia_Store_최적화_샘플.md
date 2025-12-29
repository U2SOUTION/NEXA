# 컨텐츠-사이드바 Pinia Store 최적화 샘플

## 개요

전역 이벤트 버스 대신 Pinia Store를 사용하여 컨텐츠와 사이드바 간 통신을 최적화한 실제 구현 샘플입니다.

## 파일 구조

```
src/
├── stores/
│   └── componentCacheStore.js          # 컴포넌트 캐시 상태 관리 Store (전역 사용)
├── components/
│   ├── dev-tools/dev-guide/
│   │   └── DevGuideContent.vue        # 컨텐츠 컴포넌트 (Store 사용)
│   └── sidebars/right/dev-tools/
│       └── DevGuideStatistics.vue      # 통계 패널 (Store 사용)
```

## 1. Pinia Store 생성

```javascript
// stores/componentCacheStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 컴포넌트 캐시 상태 관리 Store
 * DevGuideContent와 DevGuideStatistics 간 상태 공유
 * 
 * 명명 규칙:
 * - 파일명: {기능명}Store.js (기능 중심 명명)
 * - Store ID: {기능명} (camelCase)
 * - Export 함수: use{기능명}Store
 * 
 * 왜 "componentCache"인가?
 * - 실제 기능은 "컴포넌트 캐시" 관리
 * - 현재는 미리보기용이지만 다른 컴포넌트 캐시로도 확장 가능
 * - "preview" 제거로 전역 재사용 가능함을 명확히 함
 * - 전역에서 재사용 가능하도록 기능 중심으로 명명
 */
export const useComponentCacheStore = defineStore('componentCache', () => {
  // ============================================
  // State (상태)
  // ============================================
  
  // 로드된 컴포넌트 캐시 (Map<componentId, Component>)
  const loadedComponents = ref(new Map())
  
  // 로딩 중인 컴포넌트 ID (Set<componentId>)
  const loadingComponents = ref(new Set())
  
  // 에러 상태 (Map<componentId, Error>)
  const componentErrors = ref(new Map())
  
  // 파싱 정보 (Map<componentId, ComponentInfo>)
  const componentInfo = ref(new Map())
  
  // 뷰포트에 보이는 컴포넌트 ID (Set<componentId>)
  const visibleComponents = ref(new Set())
  
  // 캐시 접근 시간 추적 (LRU 정리를 위해) (Map<componentId, timestamp>)
  const cacheAccessTime = ref(new Map())

  // 캐시 최적화 설정
  const CACHE_CONFIG = {
    // 최대 캐시 크기 (컴포넌트 개수)
    MAX_CACHE_SIZE: 50,
    // 오래된 캐시 정리 임계값 (밀리초, 5분)
    CACHE_CLEANUP_THRESHOLD: 5 * 60 * 1000,
    // 캐시 정리 간격 (밀리초, 1분)
    CLEANUP_INTERVAL: 60 * 1000,
  }

  // ============================================
  // Getters (계산된 속성)
  // ============================================
  
  const loadedComponentsSize = computed(() => loadedComponents.value.size)
  const visibleComponentsSize = computed(() => visibleComponents.value.size)
  const loadingComponentsSize = computed(() => loadingComponents.value.size)
  const componentErrorsSize = computed(() => componentErrors.value.size)
  
  const cacheUsageRate = computed(() => {
    const loaded = loadedComponentsSize.value
    const max = CACHE_CONFIG.MAX_CACHE_SIZE
    if (max === 0) return 0
    return Math.round((loaded / max) * 100)
  })
  
  const cleanupThresholdMinutes = computed(() => {
    return Math.round(CACHE_CONFIG.CACHE_CLEANUP_THRESHOLD / 1000 / 60)
  })

  // ============================================
  // Actions (액션)
  // ============================================
  
  /**
   * 로드된 컴포넌트 추가
   */
  function addLoadedComponent(componentId, component) {
    loadedComponents.value.set(componentId, component)
    cacheAccessTime.value.set(componentId, Date.now())
  }

  /**
   * 로드된 컴포넌트 제거
   */
  function removeLoadedComponent(componentId) {
    loadedComponents.value.delete(componentId)
    cacheAccessTime.value.delete(componentId)
    componentInfo.value.delete(componentId)
  }

  /**
   * 로딩 중인 컴포넌트 추가
   */
  function addLoadingComponent(componentId) {
    loadingComponents.value.add(componentId)
  }

  /**
   * 로딩 중인 컴포넌트 제거
   */
  function removeLoadingComponent(componentId) {
    loadingComponents.value.delete(componentId)
  }

  /**
   * 에러 상태 설정
   */
  function setComponentError(componentId, error) {
    componentErrors.value.set(componentId, error)
    removeLoadingComponent(componentId)
  }

  /**
   * 에러 상태 제거
   */
  function clearComponentError(componentId) {
    componentErrors.value.delete(componentId)
  }

  /**
   * 컴포넌트 정보 설정
   */
  function setComponentInfo(componentId, info) {
    componentInfo.value.set(componentId, info)
  }

  /**
   * 컴포넌트 정보 가져오기
   */
  function getComponentInfo(componentId) {
    return componentInfo.value.get(componentId)
  }

  /**
   * 보이는 컴포넌트 추가
   */
  function addVisibleComponent(componentId) {
    visibleComponents.value.add(componentId)
    // 접근 시간 업데이트
    if (loadedComponents.value.has(componentId)) {
      cacheAccessTime.value.set(componentId, Date.now())
    }
  }

  /**
   * 보이는 컴포넌트 제거
   */
  function removeVisibleComponent(componentId) {
    visibleComponents.value.delete(componentId)
  }

  /**
   * 캐시 접근 시간 업데이트
   */
  function updateCacheAccessTime(componentId) {
    if (loadedComponents.value.has(componentId)) {
      cacheAccessTime.value.set(componentId, Date.now())
    }
  }

  /**
   * 오래된 캐시 정리 (LRU 방식)
   * visibleComponents에 없는 컴포넌트 중 오래된 것부터 제거
   */
  function cleanupOldCache() {
    const now = Date.now()
    
    // 캐시 크기가 임계값을 넘지 않으면 정리하지 않음
    if (loadedComponents.value.size <= CACHE_CONFIG.MAX_CACHE_SIZE) {
      return
    }

    // visibleComponents에 없는 컴포넌트만 정리 대상
    const candidatesToRemove = []
    for (const [componentId] of loadedComponents.value.entries()) {
      // 현재 보이는 컴포넌트는 유지
      if (visibleComponents.value.has(componentId)) {
        continue
      }

      const accessTime = cacheAccessTime.value.get(componentId) || 0
      const age = now - accessTime

      // 임계값을 넘은 오래된 캐시만 정리 대상
      if (age > CACHE_CONFIG.CACHE_CLEANUP_THRESHOLD) {
        candidatesToRemove.push({ componentId, accessTime })
      }
    }

    // 접근 시간 순으로 정렬 (오래된 것부터)
    candidatesToRemove.sort((a, b) => a.accessTime - b.accessTime)

    // 필요한 만큼만 제거
    const targetSize = CACHE_CONFIG.MAX_CACHE_SIZE
    const toRemove = candidatesToRemove.slice(0, loadedComponents.value.size - targetSize)

    toRemove.forEach(({ componentId }) => {
      removeLoadedComponent(componentId)
    })

    if (import.meta.env.DEV && toRemove.length > 0) {
      console.log(`[ComponentCacheStore] 오래된 캐시 정리: ${toRemove.length}개 제거`)
    }
  }

  /**
   * 모든 캐시 초기화
   */
  function clearAllCache() {
    const removedCount = loadedComponents.value.size
    loadedComponents.value.clear()
    cacheAccessTime.value.clear()
    componentInfo.value.clear()
    loadingComponents.value.clear()
    // visibleComponents와 componentErrors는 유지 (UI 상태 유지)

    if (import.meta.env.DEV) {
      console.log(`[ComponentCacheStore] 모든 캐시 초기화: ${removedCount}개 컴포넌트 제거`)
    }
  }

  /**
   * 특정 컴포넌트의 캐시 가져오기
   */
  function getLoadedComponent(componentId) {
    return loadedComponents.value.get(componentId)
  }

  /**
   * 특정 컴포넌트가 캐시되어 있는지 확인
   */
  function hasLoadedComponent(componentId) {
    return loadedComponents.value.has(componentId)
  }

  /**
   * 특정 컴포넌트가 로딩 중인지 확인
   */
  function isLoadingComponent(componentId) {
    return loadingComponents.value.has(componentId)
  }

  /**
   * 특정 컴포넌트에 에러가 있는지 확인
   */
  function hasComponentError(componentId) {
    return componentErrors.value.has(componentId)
  }

  /**
   * 특정 컴포넌트의 에러 메시지 가져오기
   */
  function getComponentError(componentId) {
    return componentErrors.value.get(componentId)
  }

  return {
    // State
    loadedComponents,
    visibleComponents,
    loadingComponents,
    componentErrors,
    componentInfo,
    cacheAccessTime,
    CACHE_CONFIG,

    // Getters
    loadedComponentsSize,
    visibleComponentsSize,
    loadingComponentsSize,
    componentErrorsSize,
    cacheUsageRate,
    cleanupThresholdMinutes,

    // Actions
    addLoadedComponent,
    removeLoadedComponent,
    addLoadingComponent,
    removeLoadingComponent,
    setComponentError,
    clearComponentError,
    setComponentInfo,
    getComponentInfo,
    addVisibleComponent,
    removeVisibleComponent,
    updateCacheAccessTime,
    cleanupOldCache,
    clearAllCache,
    getLoadedComponent,
    hasLoadedComponent,
    isLoadingComponent,
    hasComponentError,
    getComponentError,
  }
})
```

## 2. 컨텐츠 컴포넌트 (DevGuideContent.vue)

```vue
<!-- DevGuideContent.vue -->
<template>
  <div class="dev-guide-content">
    <!-- 컨텐츠 영역 -->
    <div ref="sampleGridRef" class="sample-grid">
      <div
        v-for="sample in filteredSamples"
        :key="sample.id"
        :data-sample-id="sample.id"
        class="sample-card"
      >
        <!-- 샘플 카드 내용 -->
        <template v-if="cacheStore.visibleComponents.has(sample.id)">
          <!-- 미리보기 표시 -->
          <component
            v-if="cacheStore.hasLoadedComponent(sample.id)"
            :is="cacheStore.getLoadedComponent(sample.id)"
          />
          <div v-else-if="cacheStore.isLoadingComponent(sample.id)">
            로딩 중...
          </div>
          <div v-else-if="cacheStore.hasComponentError(sample.id)" class="preview-error">
            <p>로드 실패: {{ cacheStore.getComponentError(sample.id)?.message }}</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useComponentCacheStore } from 'src/stores/componentCacheStore'

const cacheStore = useComponentCacheStore()
const sampleGridRef = ref(null)
let intersectionObserver = null

// Intersection Observer 설정
function setupIntersectionObserver() {
  if (!sampleGridRef.value) return

  // 기존 Observer 정리
  if (intersectionObserver) {
    intersectionObserver.disconnect()
  }

  const options = {
    root: null,
    rootMargin: '100px',
    threshold: 0.1,
  }

  const callback = (entries) => {
    entries.forEach((entry) => {
      const sampleId = entry.target.getAttribute('data-sample-id')
      if (!sampleId) return

      if (entry.isIntersecting) {
        // 뷰포트에 보이면 Store에 추가
        cacheStore.addVisibleComponent(sampleId)

        // 컴포넌트 로드
        const sample = filteredSamples.value.find((s) => s.id === sampleId)
        if (sample && sample.componentPath && !cacheStore.hasLoadedComponent(sampleId)) {
          loadPreviewComponent(sample)
        }
      } else {
        // 뷰포트에서 벗어나면 제거
        cacheStore.removeVisibleComponent(sampleId)
      }
    })
  }

  intersectionObserver = new IntersectionObserver(callback, options)

  nextTick(() => {
    if (sampleGridRef.value) {
      const cards = sampleGridRef.value.querySelectorAll('.sample-card[data-sample-id]')
      cards.forEach((card) => {
        intersectionObserver.observe(card)
      })
    }
  })
}

// 컴포넌트 로드
async function loadPreviewComponent(sample) {
  if (cacheStore.hasLoadedComponent(sample.id) || cacheStore.isLoadingComponent(sample.id)) {
    return
  }

  cacheStore.addLoadingComponent(sample.id)

  try {
    // 컴포넌트 동적 로드
    const component = await import(`src/guides/${sample.componentPath}`)
    
    // Store에 저장
    cacheStore.addLoadedComponent(sample.id, component.default)
    cacheStore.setComponentInfo(sample.id, { /* 파싱 정보 */ })
    cacheStore.clearComponentError(sample.id)
  } catch (error) {
    cacheStore.setComponentError(sample.id, error)
    console.error(`[DevGuideContent] 컴포넌트 로드 실패:`, error)
  } finally {
    cacheStore.removeLoadingComponent(sample.id)
  }
}

// 주기적 캐시 정리
let cacheCleanupInterval = null

function startCacheCleanupInterval() {
  if (cacheCleanupInterval) return

  cacheCleanupInterval = setInterval(() => {
    cacheStore.cleanupOldCache()
  }, cacheStore.CACHE_CONFIG.CLEANUP_INTERVAL)
}

function stopCacheCleanupInterval() {
  if (cacheCleanupInterval) {
    clearInterval(cacheCleanupInterval)
    cacheCleanupInterval = null
  }
}

onMounted(() => {
  setupIntersectionObserver()
  startCacheCleanupInterval()
})

onBeforeUnmount(() => {
  if (intersectionObserver) {
    intersectionObserver.disconnect()
  }
  stopCacheCleanupInterval()
})
</script>
```

## 3. 통계 패널 컴포넌트 (DevGuideStatistics.vue)

```vue
<!-- DevGuideStatistics.vue -->
<template>
  <div class="dev-guide-statistics">
    <div class="statistics-actions q-pa-md">
      <!-- 캐시 최적화 정보 -->
      <div class="cache-info-section">
        <div class="cache-info-header q-mb-sm">
          <q-icon name="memory" class="cache-info-icon" />
          <span class="cache-info-title">캐시 최적화 정보</span>
        </div>
        <div class="cache-info-content">
          <div class="cache-info-grid">
            <div class="cache-info-item">
              <div class="cache-info-label">캐시된 컴포넌트</div>
              <div class="cache-info-value">
                {{ cacheStore.loadedComponentsSize }} / {{ cacheStore.CACHE_CONFIG.MAX_CACHE_SIZE }}
              </div>
            </div>
            <div class="cache-info-item">
              <div class="cache-info-label">현재 보이는 컴포넌트</div>
              <div class="cache-info-value">{{ cacheStore.visibleComponentsSize }}</div>
            </div>
            <div class="cache-info-item">
              <div class="cache-info-label">로딩 중</div>
              <div class="cache-info-value">{{ cacheStore.loadingComponentsSize }}</div>
            </div>
            <div class="cache-info-item">
              <div class="cache-info-label">에러</div>
              <div class="cache-info-value">{{ cacheStore.componentErrorsSize }}</div>
            </div>
            <div class="cache-info-item">
              <div class="cache-info-label">캐시 사용률</div>
              <div class="cache-info-value">{{ cacheStore.cacheUsageRate }}%</div>
            </div>
            <div class="cache-info-item">
              <div class="cache-info-label">정리 임계값</div>
              <div class="cache-info-value">{{ cacheStore.cleanupThresholdMinutes }}분</div>
            </div>
          </div>
          <div class="cache-info-actions q-mt-md">
            <q-btn
              flat
              dense
              label="캐시 정리"
              icon="cleaning_services"
              @click="cacheStore.cleanupOldCache"
            />
            <q-btn
              flat
              dense
              label="캐시 초기화"
              icon="refresh"
              @click="cacheStore.clearAllCache"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useComponentCacheStore } from 'src/stores/componentCacheStore'

// Store 사용 - 자동으로 반응형으로 업데이트됨
const cacheStore = useComponentCacheStore()

// 별도의 이벤트 리스너나 수동 동기화 불필요!
// Store의 상태가 변경되면 자동으로 UI가 업데이트됨
</script>

<style lang="scss" scoped>
.dev-guide-statistics {
  .statistics-actions {
    .cache-info-section {
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--nexa-border-color);

      .cache-info-header {
        display: flex;
        align-items: center;
        gap: 8px;

        .cache-info-icon {
          color: var(--nexa-text-secondary);
          font-size: 1.2rem;
        }

        .cache-info-title {
          color: var(--nexa-text-primary);
          font-weight: 600;
          font-size: 0.875rem;
        }
      }

      .cache-info-content {
        margin-top: 12px;

        .cache-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 12px;

          .cache-info-item {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .cache-info-label {
              font-size: 0.75rem;
              color: var(--nexa-text-secondary);
            }

            .cache-info-value {
              font-size: 0.875rem;
              font-weight: 600;
              color: var(--nexa-text-primary);
            }
          }
        }

        .cache-info-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-start;
        }
      }
    }
  }
}
</style>
```

## 주요 개선 사항

### 1. 반응성 문제 해결

**이전 (전역 이벤트 버스):**
```javascript
// ❌ 중첩된 ref 구조로 인해 수동 값 추출 필요
const loadedComponentsSize = ref(0)
function handleCacheStateUpdate(event) {
  loadedComponentsSize.value = event.detail.previewStates.loadedPreviews?.value?.size ?? 0
}
```

**개선 (Pinia Store):**
```javascript
// ✅ 자동 반응성 - computed로 자동 계산
const cacheStore = useComponentCacheStore()
// 템플릿에서 직접 사용 가능
{{ cacheStore.loadedComponentsSize }}
```

### 2. 상태 동기화 자동화

**이전:**
- 상태 변경 시마다 수동으로 이벤트 발생
- 수신 측에서 수동으로 값 추출 및 업데이트

**개선:**
- Store의 상태가 변경되면 자동으로 모든 컴포넌트에 반영
- 수동 동기화 불필요

### 3. 코드 간소화

**이전:**
```javascript
// DevGuideContent.vue
function handleCacheStateRequest() {
  window.dispatchEvent(new CustomEvent('dev-guide-cache-state-updated', {
    detail: { previewStates, CACHE_CONFIG, ... }
  }))
}

watch([...], () => {
  handleCacheStateRequest()
})

// DevGuideStatistics.vue
function handleCacheStateUpdate(event) {
  // 수동 값 추출
  loadedComponentsSize.value = event.detail.previewStates.loadedPreviews?.value?.size ?? 0
}

onMounted(() => {
  window.addEventListener('dev-guide-cache-state-updated', handleCacheStateUpdate)
  requestCacheState()
})
```

**개선:**
```javascript
// DevGuideContent.vue
const cacheStore = useComponentCacheStore()
cacheStore.addLoadedComponent(componentId, component) // 끝!

// DevGuideStatistics.vue
const cacheStore = useComponentCacheStore()
// 템플릿에서 직접 사용 - 자동 반응성
```

### 4. 타입 안정성

- Store의 타입이 명확함
- IDE 자동완성 지원
- 런타임 에러 감소

### 5. 메모리 관리

- 이벤트 리스너 정리 불필요
- Store가 자동으로 관리

## 마이그레이션 체크리스트

- [ ] Store 생성 (`componentCacheStore.js`)
- [ ] `DevGuideContent.vue`에서 Store 사용
  - [ ] 전역 이벤트 관련 코드 제거
  - [ ] Store의 actions 사용
- [ ] `DevGuideStatistics.vue`에서 Store 사용
  - [ ] 전역 이벤트 리스너 제거
  - [ ] Store의 getters 사용
- [ ] 테스트
  - [ ] 상태 동기화 확인
  - [ ] 반응성 확인
  - [ ] 메모리 누수 확인

## 참고

- [NEXA-컨텐츠_사이드바_전역_이벤트_통신_패턴.md](./NEXA-컨텐츠_사이드바_전역_이벤트_통신_패턴.md) - 이전 방법 (비교용)
- [Pinia 공식 문서](https://pinia.vuejs.org/)
- [Vue 3 반응성 시스템](https://vuejs.org/guide/extras/reactivity-in-depth.html)

---

**작성일**: 2024년 12월  
**상태**: 최적화 완료 - 프로덕션 사용 가능  
**적용 사례**: DevGuideContent ↔ DevGuideStatistics 통신
