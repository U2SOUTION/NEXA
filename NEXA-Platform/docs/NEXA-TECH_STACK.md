# 기술 스택 및 라이브러리

## 현재 사용 중인 라이브러리

### 1. **Vue 3** (v3.4.18)

- 프레임워크
- Composition API 사용
- 반응형 상태 관리

### 2. **Quasar** (v2.16.0)

- UI 프레임워크
- 사용 컴포넌트:
  - `q-card`: 카드 컨테이너
  - `q-icon`: 아이콘
  - `q-btn`: 버튼
  - `q-checkbox`: 체크박스
  - `q-img`: 이미지
  - `q-skeleton`: 스켈레톤 로더
  - `q-table`: 테이블
  - `q-list`: 리스트
  - `q-item`: 리스트 아이템
  - `q-dialog`: 모달
  - `q-tabs`: 탭
  - 기타 Quasar 컴포넌트

### 3. **vue3-grid-layout-next** (v1.0.7)

- 그리드 레이아웃 라이브러리
- 사용 컴포넌트:
  - `<grid-layout>`: 그리드 레이아웃 컨테이너
  - `<grid-item>`: 개별 그리드 아이템 (카드)
- 주요 기능:
  - 드래그 앤 드롭 (`is-draggable`)
  - 반응형 레이아웃 (`responsive`)
  - CSS 변환 사용 (`use-css-transforms`)
  - 수직 압축 (`vertical-compact`)

### 4. **Pinia** (v3.0.2)

- 상태 관리
- Vue 3 공식 상태 관리 라이브러리

### 5. **Vue Router** (v4.0.0)

- 라우팅
- SPA 네비게이션 관리

## 주요 컴포넌트에서 사용하는 라이브러리

### DataCardView.vue

```javascript
// Vue 3 핵심 기능
import { ref, computed, watch, nextTick, onMounted, onUnmounted, onUpdated } from 'vue'

// 그리드 레이아웃 라이브러리
import { GridLayout, GridItem } from 'vue3-grid-layout-next'
import 'vue3-grid-layout-next/dist/style.css'
```

**주요 기능:**

- `vue3-grid-layout-next`: 카드 배치 및 드래그 앤 드롭
- `Quasar`: 카드 UI 컴포넌트
- Vue 3 Composition API: 반응형 상태 관리

## 개발 도구

### 빌드 도구

- **Quasar CLI**: Vue 3 + Vite 기반 빌드 시스템
- **Vite**: 빠른 개발 서버 및 빌드 도구

### 코드 품질

- **ESLint**: 코드 린팅
- **Prettier**: 코드 포맷팅 (추정)

### 스타일링

- **SCSS**: CSS 전처리기
- **Quasar CSS**: Quasar 프레임워크 스타일

## 패키지 관리

- **npm** 또는 **yarn** 사용 가능
