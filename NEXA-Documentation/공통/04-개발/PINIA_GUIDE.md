# Pinia 상태 관리 가이드

## 목차

1. [Pinia란?](#pinia란)
2. [핵심 개념](#핵심-개념)
3. [기본 사용법](#기본-사용법)
4. [현재 프로젝트 적용 현황](#현재-프로젝트-적용-현황)
5. [활용 방안 및 베스트 프랙티스](#활용-방안-및-베스트-프랙티스)
6. [참고 자료](#참고-자료)

---

## Pinia란?

**Pinia**는 Vue 3의 공식 상태 관리 라이브러리입니다. Vuex의 후속 버전으로, 더 간단한 API와 향상된 TypeScript 지원을 제공합니다.

### 주요 특징

- ✅ **Vue 3 공식 지원**: Vue 3와 완벽하게 통합
- ✅ **TypeScript 친화적**: 타입 추론이 우수하여 개발 경험이 향상됨
- ✅ **간단한 API**: Vuex보다 직관적이고 배우기 쉬운 API
- ✅ **DevTools 지원**: Vue DevTools와 완벽하게 통합
- ✅ **모듈화**: Store를 자동으로 모듈화하여 코드 분할 용이
- ✅ **Hot Module Replacement**: 개발 중 코드 변경 시 상태 유지

### Vuex와의 차이점

| 특징        | Vuex             | Pinia                |
| ----------- | ---------------- | -------------------- |
| Vue 3 지원  | 제한적           | 완벽 지원            |
| TypeScript  | 추가 설정 필요   | 기본 지원            |
| API 복잡도  | 상대적으로 복잡  | 간단하고 직관적      |
| 모듈화      | 수동 설정        | 자동 모듈화          |
| 코드 스타일 | Options API 중심 | Composition API 중심 |

---

## 핵심 개념

### 1. Store (스토어)

Store는 애플리케이션의 상태를 관리하는 컨테이너입니다. 여러 컴포넌트에서 공유되는 데이터와 로직을 담습니다.

```javascript
import { defineStore } from 'pinia'

export const useMyStore = defineStore('myStore', () => {
  // 상태, 액션, 게터를 여기에 정의
})
```

### 2. State (상태)

애플리케이션의 데이터를 저장하는 반응형 상태입니다.

```javascript
const count = ref(0)
const user = ref({ name: 'John', age: 30 })
```

### 3. Getters (게터)

상태에서 파생된 값을 계산하는 읽기 전용 속성입니다. Vue의 `computed`와 유사합니다.

```javascript
const doubleCount = computed(() => count.value * 2)
```

### 4. Actions (액션)

상태를 변경하는 메서드입니다. 비동기 작업도 포함할 수 있습니다.

```javascript
function increment() {
  count.value++
}

async function fetchUser() {
  const response = await fetch('/api/user')
  user.value = await response.json()
}
```

---

## 기본 사용법

### Store 생성 (Composition API 스타일)

현재 프로젝트에서 사용하는 스타일입니다:

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0)
  const name = ref('NEXA')

  // Getters
  const doubleCount = computed(() => count.value * 2)
  const greeting = computed(() => `Hello, ${name.value}!`)

  // Actions
  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = 0
  }

  // Store에서 반환해야 컴포넌트에서 사용 가능
  return {
    // State
    count,
    name,
    // Getters
    doubleCount,
    greeting,
    // Actions
    increment,
    decrement,
    reset,
  }
})
```

### 컴포넌트에서 사용

```vue
<template>
  <div>
    <p>Count: {{ counterStore.count }}</p>
    <p>Double: {{ counterStore.doubleCount }}</p>
    <button @click="counterStore.increment">+</button>
    <button @click="counterStore.decrement">-</button>
  </div>
</template>

<script setup>
import { useCounterStore } from 'src/stores/counterStore'

const counterStore = useCounterStore()
</script>
```

### Store 간 상호작용

한 Store에서 다른 Store를 사용할 수 있습니다:

```javascript
import { defineStore } from 'pinia'
import { useCounterStore } from './counterStore'

export const useUserStore = defineStore('user', () => {
  const counterStore = useCounterStore()

  const userCount = computed(() => {
    return `User has ${counterStore.count} items`
  })

  return { userCount }
})
```

---

## 현재 프로젝트 적용 현황

### Store 목록

현재 프로젝트에는 **8개의 Store**가 있습니다:

| Store 파일                | 용도                   | 주요 상태/기능                     |
| ------------------------- | ---------------------- | ---------------------------------- |
| `dashboardLayoutStore.js` | 대시보드 레이아웃 관리 | 패널 구성, 프리셋, 창 분할         |
| `projectTreeStore.js`     | 프로젝트 트리 구조     | 노드 관리, 그룹/프로젝트 계층      |
| `partsDataStore.js`       | 부품 데이터 관리       | 부품 클래스, 모델, 스펙 데이터     |
| `partsManagementStore.js` | 부품 관리 UI 상태      | 사이드바 모드, 선택 상태           |
| `userSettingsStore.js`    | 사용자 설정            | 테마, 언어, 개인 설정              |
| `projectEditorStore.js`   | 프로젝트 편집 상태     | 편집 모드, 프로젝트 설정           |
| `modalSystemStore.js`     | 모달 시스템 관리       | 모달 열림/닫힘 상태                |
| `layout.js`               | 레이아웃 전역 상태     | (레거시, 점진적 마이그레이션 예정) |

### 실제 사용 예시

#### 1. 대시보드 레이아웃 Store

```javascript
// src/stores/dashboardLayoutStore.js
export const useDashboardLayoutStore = defineStore('dashboardLayout', () => {
  const panes = ref({}) // 창별 패널 정보
  const activePreset = ref('single') // 현재 레이아웃 프리셋

  function setActivePreset(presetName) {
    activePreset.value = presetName
    // 프리셋에 따라 창 구성 초기화
  }

  function addPanel(paneId, panelData) {
    // 특정 창에 패널 추가
  }

  return { panes, activePreset, setActivePreset, addPanel }
})
```

**사용 예시:**

```vue
<script setup>
import { useDashboardLayoutStore } from 'src/stores/dashboardLayoutStore'

const dashboardStore = useDashboardLayoutStore()

// 현재 프리셋 확인
console.log(dashboardStore.activePreset) // 'single'

// 프리셋 변경
dashboardStore.setActivePreset('split-lr')
</script>
```

#### 2. 프로젝트 트리 Store

```javascript
// src/stores/projectTreeStore.js
export const useProjectTreeStore = defineStore('projectTree', () => {
  const nodes = ref([]) // 모든 노드 정보

  function addNode(nodeData) {
    // 새 노드 추가
  }

  function updateNode(nodeId, updates) {
    // 노드 정보 업데이트
  }

  // localStorage에 자동 저장
  watch(
    nodes,
    () => {
      localStorage.setItem('projectTreeDataNexa', JSON.stringify(nodes.value))
    },
    { deep: true },
  )

  return { nodes, addNode, updateNode }
})
```

**특징:**

- localStorage와 자동 동기화
- 트리 구조의 계층적 데이터 관리
- 그룹과 프로젝트 노드 구분

#### 3. 부품 데이터 Store

```javascript
// src/stores/partsDataStore.js
export const usePartsDataStore = defineStore('partsData', () => {
  const partClasses = ref([])
  const partModels = ref([])
  const selectedPartClass = ref(null)

  async function fetchPartClasses() {
    // API에서 부품 클래스 데이터 가져오기
    const response = await fetch(`${API_BASE_URL}/part-classes`)
    partClasses.value = await response.json()
  }

  return { partClasses, partModels, selectedPartClass, fetchPartClasses }
})
```

**특징:**

- API 호출을 통한 데이터 페칭
- 선택된 항목 상태 관리
- 비동기 작업 처리

### Store 간 의존성

현재 프로젝트에서 Store 간 상호작용 예시:

```javascript
// dashboardLayoutStore.js에서 projectTreeStore 사용
import { useProjectTreeStore } from './projectTreeStore'

export const useDashboardLayoutStore = defineStore('dashboardLayout', () => {
  const projectTreeStore = useProjectTreeStore()

  function setActivePreset(presetName, projectNode) {
    // 프로젝트 노드 정보를 사용하여 레이아웃 설정
    if (projectNode?.dashboardPanesConfig) {
      // 프로젝트별 저장된 레이아웃 복원
    }
  }

  return { setActivePreset }
})
```

---

## 활용 방안 및 베스트 프랙티스

### 1. Store 분리 원칙

**현재 프로젝트의 좋은 예시:**

✅ **도메인별 분리**: `partsDataStore`, `projectTreeStore` 등 기능별로 명확히 분리
✅ **책임 분리**: UI 상태(`partsManagementStore`)와 데이터 상태(`partsDataStore`) 분리
✅ **재사용성**: 여러 컴포넌트에서 공유되는 상태만 Store에 저장

**권장 사항:**

```javascript
// ✅ 좋은 예: 여러 컴포넌트에서 공유되는 데이터
export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null) // 여러 페이지에서 사용
  return { currentUser }
})

// ❌ 나쁜 예: 단일 컴포넌트에서만 사용하는 로컬 상태
// 이런 경우는 컴포넌트 내부의 ref()로 충분
```

### 2. 상태 구조화

**현재 프로젝트 패턴:**

```javascript
// ✅ 좋은 예: 관련된 상태를 그룹화
const dashboardState = ref({
  activePreset: 'single',
  panes: {},
  selectedPane: null,
})

// 또는 개별 ref로 분리 (현재 프로젝트 스타일)
const activePreset = ref('single')
const panes = ref({})
const selectedPane = ref(null)
```

**선택 기준:**

- **객체로 그룹화**: 함께 변경되는 상태들
- **개별 ref**: 독립적으로 변경되는 상태들

### 3. 비동기 작업 처리

**현재 프로젝트 패턴:**

```javascript
// ✅ 좋은 예: Actions에서 비동기 처리
async function fetchPartClasses() {
  try {
    const response = await fetch(`${API_BASE_URL}/part-classes`)
    if (!response.ok) throw new Error('Failed to fetch')
    partClasses.value = await response.json()
  } catch (error) {
    console.error('Failed to fetch part classes:', error)
    partClasses.value = [] // 에러 시 빈 배열로 초기화
    throw error
  }
}
```

**베스트 프랙티스:**

- ✅ 에러 처리 포함
- ✅ 로딩 상태 관리 (필요시)
- ✅ 실패 시 안전한 기본값 설정

### 4. localStorage 동기화

**현재 프로젝트 패턴:**

```javascript
// projectTreeStore.js에서 사용 중
const LOCAL_STORAGE_KEY = 'projectTreeDataNexa'

// 저장
function _saveToLocalStorage() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nodes.value))
}

// 로드
function _loadFromLocalStorage() {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (stored) {
    nodes.value = JSON.parse(stored)
  }
}

// watch로 자동 동기화
watch(nodes, _saveToLocalStorage, { deep: true })
```

**권장 사항:**

- ✅ 중요한 사용자 데이터는 localStorage에 저장
- ✅ 앱 시작 시 자동 로드
- ✅ 변경 시 자동 저장 (watch 사용)

### 5. Store 네이밍 컨벤션

**현재 프로젝트 컨벤션:**

```javascript
// ✅ Store 파일명: camelCase + Store 접미사
// dashboardLayoutStore.js
export const useDashboardLayoutStore = defineStore('dashboardLayout', () => {
  // 'dashboardLayout' = kebab-case
})

// ✅ 사용 시: use + PascalCase + Store
const dashboardStore = useDashboardLayoutStore()
```

**규칙:**

- 파일명: `{domain}Store.js` (예: `partsDataStore.js`)
- Store ID: kebab-case (예: `'parts-data'`)
- 함수명: `use{PascalCase}Store` (예: `usePartsDataStore`)
- 변수명: `{domain}Store` (예: `partsDataStore`)

### 6. Computed 활용

**현재 프로젝트 예시:**

```javascript
// dashboardLayoutStore.js
const getCurrentPaneIds = computed(() => {
  const config = presetPaneConfigurations[activePreset.value]
  if (!config) return []
  // 복잡한 계산 로직
  return ids
})
```

**베스트 프랙티스:**

- ✅ 파생된 값은 computed로 계산
- ✅ 복잡한 필터링/정렬 로직을 getter로 분리
- ✅ 성능 최적화 (캐싱)

### 7. Store 초기화

**현재 프로젝트 패턴:**

```javascript
// 앱 시작 시 localStorage에서 데이터 로드
export const useProjectTreeStore = defineStore('projectTree', () => {
  const nodes = ref([])

  // Store 생성 시 자동 실행
  _loadFromLocalStorage()

  return { nodes }
})
```

**권장 사항:**

- ✅ Store 생성 시 초기 데이터 로드
- ✅ localStorage, API 등에서 데이터 복원
- ✅ 기본값 설정

### 8. 타입 안정성 (향후 TypeScript 전환 시)

**TypeScript 사용 시:**

```typescript
interface PartClass {
  id: number
  name: string
  c_code: string
}

export const usePartsDataStore = defineStore('partsData', () => {
  const partClasses = ref<PartClass[]>([])

  return { partClasses }
})
```

---

## 활용 방안

### 1. 새로운 Store 추가 시 고려사항

**질문 체크리스트:**

1. ✅ 여러 컴포넌트에서 공유되는가?
2. ✅ 컴포넌트 간 통신이 필요한가?
3. ✅ 페이지 새로고침 후에도 유지되어야 하는가?
4. ✅ 복잡한 상태 로직이 있는가?

**모두 "예"라면 Store로 관리하는 것이 적합합니다.**

### 2. 현재 프로젝트에서 추가 고려 가능한 Store

**제안:**

- `deviceStore.js`: ESP32 디바이스 상태 관리 (연결 상태, 데이터 등)
- `notificationStore.js`: 알림 시스템 통합 관리
- `themeStore.js`: 테마 설정 전용 (현재 `userSettingsStore`에 포함되어 있음)
- `apiStore.js`: API 호출 공통 로직 (인터셉터, 에러 처리 등)

### 3. Store 리팩토링 제안

**현재 상태:**

- `layout.js`와 `dashboardLayoutStore.js`가 중복 기능을 가질 수 있음
- 점진적으로 `layout.js`를 `dashboardLayoutStore.js`로 통합 고려

**권장 사항:**

- 레거시 Store는 점진적으로 마이그레이션
- 새로운 기능은 새로운 Store에 추가
- 중복 기능 통합 계획 수립

---

## 참고 자료

### 공식 문서

- [Pinia 공식 문서](https://pinia.vuejs.org/)
- [Pinia GitHub](https://github.com/vuejs/pinia)

### 현재 프로젝트 관련

- `src/boot/pinia.js`: Pinia 초기화 설정
- `src/stores/`: 모든 Store 파일 위치
- `quasar.config.js`: Boot 파일 등록

### 학습 자료

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Vue 3 Reactivity](https://vuejs.org/guide/extras/reactivity-in-depth.html)

---

## 요약

### 핵심 포인트

1. **Pinia는 Vue 3의 공식 상태 관리 라이브러리**로, 현재 프로젝트의 핵심 인프라입니다.

2. **현재 8개의 Store**가 각각 명확한 책임을 가지고 도메인별로 분리되어 있습니다.

3. **Composition API 스타일**을 사용하여 Vue 3의 반응성 시스템을 최대한 활용합니다.

4. **Store 간 상호작용**이 잘 구조화되어 있어 복잡한 상태 관리가 가능합니다.

5. **localStorage 동기화**를 통해 사용자 데이터를 안전하게 보존합니다.

### 다음 단계

- ✅ 현재 Store 구조 이해
- ✅ 새로운 기능 추가 시 Store 활용
- ✅ 필요시 Store 리팩토링 계획 수립
- 🔄 향후 TypeScript 전환 시 타입 안정성 강화

---

**작성일**: 2024년
**프로젝트**: NEXA Platform
**버전**: Vue 3.4.18 + Pinia 3.0.2
