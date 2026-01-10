# TypeScript 표준 계약 적용 가이드

**작성일**: 2024년  
**목적**: TypeScript를 사용하여 표준 계약을 강제하고 코딩 실수를 줄이는 방법  
**버전**: 1.0

---

## 개요

TypeScript를 사용하면 표준 계약을 **컴파일 타임에 강제**할 수 있어, 실행 전에 오류를 발견하고 코딩 실수를 줄일 수 있습니다.

### TypeScript의 이점

1. **컴파일 타임 타입 체크**: 실행 전에 오류 발견
2. **인터페이스로 표준 강제**: 필수 필드 누락 시 컴파일 오류
3. **IDE 자동완성**: 개발 편의성 향상
4. **리팩토링 안전성**: 타입 변경 시 영향 범위 파악

---

## JavaScript vs TypeScript 비교

### JavaScript (실수 가능)

```javascript
// 실수: id 누락, type 오타
const board = {
  type: "bord",  // 오타! "board"여야 함
  // id 누락!
  preset: "single"
}
// 실행 시까지 오류를 발견하지 못함
```

### TypeScript (실수 방지)

```typescript
import { BoardComponent } from '@system/schemas'

// 컴파일 시점에 오류 발견!
const board: BoardComponent = {
  type: "bord",  // ❌ 오류: "board" | "node" | "chart" | "block" | "panel" 중 하나여야 함
  // ❌ 오류: id 필수 필드 누락
  preset: "single"
}
```

---

## 표준 계약 인터페이스 정의

### 위치

`src/system/schemas/common/component-contract.ts`

### 주요 인터페이스

1. **`ComponentContract`**: 모든 컴포넌트의 기본 계약
2. **`BoardComponent`**: 보드 컴포넌트 확장
3. **`NodeComponent`**: 노드 컴포넌트 확장
4. **`ChartComponent`**: 차트 컴포넌트 확장
5. **`BlockComponent`**: 블록 컴포넌트 확장
6. **`PanelComponent`**: 패널 컴포넌트 확장

---

## 사용 예시

### 1. 보드 컴포넌트 생성

```typescript
import { BoardComponent } from '@system/schemas'

// ✅ 올바른 사용
const board: BoardComponent = {
  id: "board-001",
  type: "board",
  version: "1.0",
  metadata: {
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    author: "user-123"
  },
  preset: "split-lr",
  panes: [],
  devices: [],
  toJSON() {
    return { ...this }
  }
}

// ❌ 오류: 필수 필드 누락
const invalidBoard: BoardComponent = {
  type: "board",
  // id 누락!
  preset: "single"
}
```

### 2. 컴포넌트 타입 가드 사용

```typescript
import { isBoardComponent, isNodeComponent } from '@system/schemas'
import type { AnyComponent } from '@system/schemas'

function processComponent(component: AnyComponent) {
  if (isBoardComponent(component)) {
    // TypeScript가 자동으로 BoardComponent로 타입 좁히기
    console.log(component.preset)  // ✅ 타입 안전
    console.log(component.panes)   // ✅ 타입 안전
  } else if (isNodeComponent(component)) {
    // TypeScript가 자동으로 NodeComponent로 타입 좁히기
    console.log(component.nodes)   // ✅ 타입 안전
    console.log(component.connections)  // ✅ 타입 안전
  }
}
```

### 3. 번역기에서 사용

```typescript
import type { BoardComponent, ComponentContract } from '@system/schemas'

class BoardTranslator {
  toDocument(board: BoardComponent): ComponentContract {
    // TypeScript가 board의 모든 필드를 자동완성으로 제공
    return {
      id: board.id,
      type: board.type,
      version: board.version,
      metadata: board.metadata,
      // ...
    }
  }
}
```

---

## 점진적 마이그레이션 전략

### Phase 1: 타입 정의만 추가

1. `src/system/schemas/common/component-contract.ts` 파일 생성
2. 기존 JavaScript 코드는 그대로 유지
3. 새로운 코드부터 TypeScript 사용

### Phase 2: 핵심 모듈부터 마이그레이션

1. 번역기 모듈부터 TypeScript로 변환
2. 표준 계약을 사용하는 새로운 컴포넌트부터 TypeScript 사용

### Phase 3: 전체 마이그레이션

1. 기존 JavaScript 파일을 점진적으로 TypeScript로 변환
2. `.js` → `.ts` 파일 확장자 변경
3. 타입 에러 수정

---

## TypeScript 설정

### 1. TypeScript 설치

```bash
npm install --save-dev typescript @types/node
```

### 2. tsconfig.json 생성

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. Vue 파일에서 TypeScript 사용

```vue
<script setup lang="ts">
import type { BoardComponent } from '@system/schemas'

const board: BoardComponent = {
  // ...
}
</script>
```

---

## 실수 방지 예시

### 예시 1: 필수 필드 누락 방지

```typescript
// ❌ JavaScript: 실행 시까지 오류를 발견하지 못함
const board = {
  type: "board",
  preset: "single"
  // id 누락!
}

// ✅ TypeScript: 컴파일 시점에 오류 발견
const board: BoardComponent = {
  type: "board",
  preset: "single"
  // ❌ 오류: Property 'id' is missing
}
```

### 예시 2: 타입 오타 방지

```typescript
// ❌ JavaScript: 오타를 발견하지 못함
const board = {
  id: "board-001",
  type: "bord",  // 오타!
  preset: "single"
}

// ✅ TypeScript: 컴파일 시점에 오류 발견
const board: BoardComponent = {
  id: "board-001",
  type: "bord",  // ❌ 오류: Type '"bord"' is not assignable to type '"board"'
  preset: "single"
}
```

### 예시 3: 잘못된 필드 사용 방지

```typescript
// ❌ JavaScript: 실행 시까지 오류를 발견하지 못함
const board = {
  id: "board-001",
  type: "board",
  preset: "single",
  nodes: []  // 보드에는 nodes가 없음!
}

// ✅ TypeScript: 컴파일 시점에 오류 발견
const board: BoardComponent = {
  id: "board-001",
  type: "board",
  preset: "single",
  nodes: []  // ❌ 오류: Property 'nodes' does not exist on type 'BoardComponent'
}
```

---

## IDE 자동완성

TypeScript를 사용하면 IDE가 자동완성을 제공합니다:

```typescript
const board: BoardComponent = {
  // IDE가 자동으로 다음을 제안:
  // - id: string
  // - type: "board"
  // - version: string
  // - metadata: MetadataContract
  // - preset: "single" | "split-lr" | "l-shape" | "split-tb"
  // - panes: Array<...>
  // - devices: string[]
}
```

---

## 주의사항

### 1. 점진적 마이그레이션

전체 코드를 한 번에 TypeScript로 변환하지 말고, 점진적으로 마이그레이션하세요.

### 2. 타입 단언 최소화

타입 단언(`as`)을 남용하지 말고, 가능한 한 타입을 정확히 정의하세요.

### 3. any 타입 피하기

`any` 타입을 사용하면 TypeScript의 이점을 잃게 됩니다. 가능한 한 구체적인 타입을 사용하세요.

---

## 참고 문서

- [NEXA-컴포넌트_표준_계약.md](./NEXA-컴포넌트_표준_계약.md): 표준 계약 정의
- [NEXA-인터랙션_표준_안내.md](./NEXA-인터랙션_표준_안내.md): 인터랙션 표준 상세 규격
- [NEXA-번역기_시스템.md](./NEXA-번역기_시스템.md): 번역기 시스템 설계

