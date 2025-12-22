# 번역기 시스템 (Translator System)

**작성일**: 2024년  
**목적**: 각 컴포넌트의 고유 데이터 구조를 다른 컨텍스트에서 사용 가능한 형태로 변환하는 시스템 설계  
**버전**: 1.0

---

## 개요

번역기 시스템은 각 컴포넌트(노드, 보드, 차트, 블록, 패널)가 자신의 성격에 맞게 최적화된 구조를 가지되, 표준 계약을 준수하여 다른 컨텍스트에서 재사용할 수 있도록 변환하는 시스템입니다.

### 핵심 원칙

1. **표준 계약 기반**: 표준 계약을 준수하면 번역기 구현이 쉬워짐
2. **난이도별 분류**: 변환 난이도에 따라 단계적 구현
3. **예측 가능성**: 표준 필드를 통해 컴포넌트 구조를 예측 가능

---

## 번역기 아키텍처

```
컴포넌트 A (자신의 최적화된 구조 + 표준 계약)
    ↓
[Translator A → B]
    ↓ 표준 계약을 통해 예측 가능한 변환
컴포넌트 B 컨텍스트 (변환된 구조)
```

### 표준 계약의 이점

1. **예측 가능성**: 번역기가 표준 필드(`id`, `type`, `version`, `metadata`)를 통해 컴포넌트 구조를 예측 가능
2. **인터랙션 처리**: `actions` 배열로 제어/인터랙션 기능을 표준화하여 변환 용이
3. **데이터 소스 통일**: `dataSource` 표준으로 데이터 연결 정보 변환 용이
4. **버전 관리**: `version` 필드로 호환성 관리

---

## 번역기 난이도 분류

### 난이도: 쉬움 (읽기 전용, 데이터 시각화)

**특징**:

- 표준 필드만 사용
- 인터랙션 기능 없음
- 데이터만 변환

#### 1. Chart → Block Translator

**목적**: 차트를 블록으로 변환

**변환 과정**:

1. 표준 필드 추출 (`id`, `type`, `version`, `metadata`)
2. 차트 데이터를 블록 형식으로 변환
3. `dataSource` 표준으로 데이터 소스 정보 변환

**예시**:

```javascript
// 원본 (차트)
{
  id: "chart-001",
  type: "chart",
  version: "1.0",
  metadata: {...},
  chartType: "line",
  data: [...],
  options: {...},
  dataSource: {type: "db", connection: "mysql://...", query: {...}}
}

// 변환 (블록)
{
  id: "block-chart-001",
  type: "block",
  version: "1.0",
  metadata: {...},
  blockType: "chart",
  config: {
    chartType: "line",
    data: [...],
    options: {...}
  },
  dataSource: {type: "db", connection: "mysql://...", query: {...}}
}
```

#### 2. Block → Document Translator (읽기 전용)

**목적**: 블록을 문서에 삽입 (읽기 전용)

**변환 과정**:

1. 표준 필드 추출
2. 블록 내용을 문서 블록 형식으로 변환
3. 인터랙션 기능 제거 (읽기 전용)

**예시**:

```javascript
// 원본 (블록)
{
  id: "block-001",
  type: "block",
  version: "1.0",
  metadata: {...},
  blockType: "time",
  config: {...},
  actions: [{...}]  // 인터랙션 포함
}

// 변환 (문서 블록, 읽기 전용)
{
  id: "doc-block-001",
  type: "document-block",
  version: "1.0",
  metadata: {...},
  blockType: "time",
  config: {...},
  actions: []  // 인터랙션 제거
}
```

---

### 난이도: 중간 (단순 변환)

**특징**:

- 레이아웃 변환 필요
- 인터랙션 기능 제거 또는 단순화
- 데이터 구조 변환

#### 3. Board → Document Translator (읽기 전용)

**목적**: 보드를 ERP 문서에 삽입 (읽기 전용)

**변환 과정**:

1. 표준 필드 추출
2. 보드의 패널들을 문서 블록으로 변환
3. 레이아웃 정보를 문서 형식으로 변환
4. 인터랙션 기능 제거 (드래그앤드롭, 리사이즈 등)

**예시**:

```javascript
// 원본 (보드)
{
  id: "board-001",
  type: "board",
  version: "1.0",
  metadata: {...},
  preset: "split-lr",
  panes: [
    {id: "pane-1", panels: [{id: "panel-1", content: {...}}]},
    {id: "pane-2", panels: [{id: "panel-2", content: {...}}]}
  ],
  actions: [
    {type: "control", target: "panel-1", params: {action: "move", x: 100, y: 200}}
  ]
}

// 변환 (문서 임베드, 읽기 전용)
{
  id: "doc-board-001",
  type: "document-embed",
  version: "1.0",
  metadata: {...},
  layout: "two-column",
  blocks: [
    {id: "doc-panel-1", content: {...}, readonly: true},
    {id: "doc-panel-2", content: {...}, readonly: true}
  ],
  actions: []  // 인터랙션 제거
}
```

**제한사항**:

- 드래그앤드롭 기능 제거
- 리사이즈 기능 제거
- 레이아웃 변경 불가

#### 4. Board → Template Translator

**목적**: 보드를 템플릿으로 저장

**변환 과정**:

1. 표준 필드 추출
2. 보드 인스턴스 데이터를 템플릿 형식으로 변환
3. 사용자별 설정 제거 (템플릿은 범용적이어야 함)

**예시**:

```javascript
// 원본 (보드 인스턴스)
{
  id: "board-001",
  type: "board",
  version: "1.0",
  metadata: {author: "user-123", ...},
  preset: "split-lr",
  panes: [...],
  devices: ["device-001", "device-002"]  // 특정 디바이스
}

// 변환 (템플릿)
{
  id: "template-board-001",
  type: "template",
  version: "1.0",
  metadata: {author: "user-123", tags: ["template"], ...},
  preset: "split-lr",
  panes: [...],
  devices: []  // 디바이스 제거 (템플릿은 범용적)
}
```

---

### 난이도: 어려움 (제어/인터랙션 포함)

**특징**:

- 인터랙션 기능 변환 필요
- `actions` 배열 활용
- 컨텍스트에 맞게 인터랙션 재구성

#### 5. Node → Board Translator

**목적**: 노드를 보드 내 패널로 변환

**변환 과정**:

1. 표준 필드 추출
2. 노드 그래프를 패널 구성으로 변환
3. 노드 실행 로직을 보드 패널 인터랙션으로 변환
4. `actions` 배열로 인터랙션 기능 변환

**예시**:

```javascript
// 원본 (노드)
{
  id: "node-001",
  type: "node",
  version: "1.0",
  metadata: {...},
  nodes: [
    {id: "trigger-1", type: "trigger", ...},
    {id: "process-1", type: "process", ...},
    {id: "action-1", type: "action", ...}
  ],
  connections: [
    {from: "trigger-1", to: "process-1"},
    {from: "process-1", to: "action-1"}
  ],
  actions: [
    {type: "trigger", target: "node-001", params: {execute: true}}
  ]
}

// 변환 (보드 패널)
{
  id: "panel-node-001",
  type: "panel",
  version: "1.0",
  metadata: {...},
  panelType: "node-visualization",
  grid: {x: 0, y: 0, w: 6, h: 4},
  content: {
    nodes: [...],
    connections: [...]
  },
  actions: [
    {
      type: "trigger",
      target: "panel-node-001",
      params: {
        execute: true,
        source: "node-001"  // 원본 노드 정보 유지
      }
    }
  ]
}
```

**도전 과제**:

- 노드 실행 로직을 보드 패널 인터랙션으로 변환
- 그래프 구조를 패널 레이아웃으로 변환
- 데이터 흐름을 패널 데이터 소스로 변환

#### 6. Board → Document Translator (인터랙션 포함)

**목적**: 보드를 ERP 문서에 삽입 (인터랙션 포함)

**변환 과정**:

1. 표준 필드 추출
2. 보드 구조를 문서 임베드 형식으로 변환
3. 드래그앤드롭, 리사이즈를 문서 컨텍스트에 맞게 변환
4. `actions` 배열로 인터랙션 기능 변환

**예시**:

```javascript
// 원본 (보드)
{
  id: "board-001",
  type: "board",
  version: "1.0",
  metadata: {...},
  preset: "split-lr",
  panes: [...],
  actions: [
    {type: "control", target: "panel-1", params: {action: "move", x: 100, y: 200}},
    {type: "control", target: "panel-1", params: {action: "resize", width: 300, height: 200}}
  ]
}

// 변환 (문서 임베드, 인터랙션 포함)
{
  id: "doc-board-001",
  type: "document-embed",
  version: "1.0",
  metadata: {...},
  layout: "two-column",
  blocks: [...],
  actions: [
    {
      type: "control",
      target: "doc-panel-1",
      params: {
        action: "move",
        x: 100,
        y: 200,
        context: "document"  // 문서 컨텍스트 표시
      }
    },
    {
      type: "control",
      target: "doc-panel-1",
      params: {
        action: "resize",
        width: 300,
        height: 200,
        context: "document"
      }
    }
  ]
}
```

**도전 과제**:

- 드래그앤드롭을 문서 컨텍스트에 맞게 변환 (제한적)
- 리사이즈를 문서 레이아웃에 맞게 변환
- 실시간 업데이트를 문서 저장 방식으로 변환

**대안**: 인터랙션 기능은 제거하고 읽기 전용으로 변환 (난이도 낮춤)

---

## 번역기 구현 구조

### 디렉토리 구조

```
src/translators/
├── BaseTranslator.js          // 기본 번역기 클래스
├── ChartTranslator.js          // 차트 번역기
│   ├── toBlock()              // 차트 → 블록
│   └── toPanel()              // 차트 → 패널
├── BlockTranslator.js         // 블록 번역기
│   ├── toDocument()           // 블록 → 문서
│   └── toPanel()              // 블록 → 패널
├── BoardTranslator.js         // 보드 번역기
│   ├── toDocument()           // 보드 → 문서 (읽기 전용)
│   ├── toDocumentInteractive() // 보드 → 문서 (인터랙션 포함)
│   └── toTemplate()           // 보드 → 템플릿
├── NodeTranslator.js          // 노드 번역기
│   ├── toBoard()              // 노드 → 보드
│   ├── toBlock()              // 노드 → 블록
│   └── toPanel()              // 노드 → 패널
└── PanelTranslator.js         // 패널 번역기
    ├── toBlock()              // 패널 → 블록
    └── toDocument()           // 패널 → 문서
```

### 기본 번역기 클래스

```javascript
// src/translators/BaseTranslator.js
class BaseTranslator {
  /**
   * 표준 필드 추출
   */
  extractStandardFields(component) {
    return {
      id: component.id,
      type: component.type,
      version: component.version,
      metadata: component.metadata,
    }
  }

  /**
   * 인터랙션 변환 (기본 구현)
   */
  translateActions(actions, context) {
    if (!actions) return []

    return actions.map((action) => {
      // 컨텍스트에 맞게 액션 변환
      return {
        ...action,
        target: this.translateTarget(action.target, context),
        params: {
          ...action.params,
          context: context,
        },
      }
    })
  }

  /**
   * 데이터 소스 변환
   */
  translateDataSource(dataSource, context) {
    if (!dataSource) return null

    return {
      ...dataSource,
      context: context,
    }
  }
}
```

### 차트 → 블록 번역기 예시

```javascript
// src/translators/ChartTranslator.js
import { BaseTranslator } from './BaseTranslator.js'

class ChartTranslator extends BaseTranslator {
  /**
   * 차트를 블록으로 변환
   */
  toBlock(chart) {
    const standard = this.extractStandardFields(chart)

    return {
      ...standard,
      type: 'block',
      id: `block-${chart.id}`,
      blockType: 'chart',
      config: {
        chartType: chart.chartType,
        data: chart.data,
        options: chart.options,
      },
      dataSource: this.translateDataSource(chart.dataSource, 'block'),
    }
  }
}
```

---

## 번역 결과 캐싱

번역 결과를 캐싱하여 성능을 향상시킵니다.

### 캐시 키 생성

```javascript
function generateCacheKey(sourceComponent, targetType, options = {}) {
  return `${sourceComponent.id}-${sourceComponent.version}-${targetType}-${JSON.stringify(options)}`
}
```

### 캐시 사용 예시

```javascript
class BoardTranslator extends BaseTranslator {
  toDocument(board, options = {}) {
    const cacheKey = generateCacheKey(board, 'document', options)

    // 캐시 확인
    const cached = translationCache.get(cacheKey)
    if (cached && !options.forceRefresh) {
      return cached
    }

    // 번역 수행
    const translated = this.translate(board, 'document', options)

    // 캐시 저장
    translationCache.set(cacheKey, translated)

    return translated
  }
}
```

---

## 번역 규칙 매핑

번역 규칙을 매핑 테이블로 관리합니다.

### 규칙 매핑 예시

```javascript
const translationRules = {
  'board-to-document': {
    preset: {
      single: 'single-column',
      'split-lr': 'two-column',
      'l-shape': 'three-column',
      'split-tb': 'two-row',
    },
    actions: {
      control: {
        move: 'readonly', // 읽기 전용으로 변환
        resize: 'readonly',
      },
    },
  },
  'node-to-board': {
    nodeTypes: {
      trigger: 'panel-trigger',
      process: 'panel-process',
      action: 'panel-action',
    },
  },
}
```

---

## 에러 처리

번역 실패 시 적절한 에러를 반환합니다.

```javascript
class TranslationError extends Error {
  constructor(message, sourceComponent, targetType) {
    super(message)
    this.sourceComponent = sourceComponent
    this.targetType = targetType
  }
}

class BoardTranslator extends BaseTranslator {
  toDocument(board) {
    try {
      // 번역 로직
      return translated
    } catch (error) {
      throw new TranslationError(`Failed to translate board to document: ${error.message}`, board, 'document')
    }
  }
}
```

---

## 구현 우선순위

### Phase 1: 쉬운 번역기 (읽기 전용)

1. Chart → Block
2. Block → Document (읽기 전용)

### Phase 2: 중간 난이도 번역기

3. Board → Document (읽기 전용)
4. Board → Template

### Phase 3: 어려운 번역기 (인터랙션 포함)

5. Node → Board
6. Board → Document (인터랙션 포함)

---

## 참고 문서

- [NEXA-컴포넌트*표준*계약.md](./NEXA-컴포넌트_표준_계약.md): 표준 계약 정의
- [NEXA-인터랙션*표준*안내.md](./NEXA-인터랙션_표준_안내.md): 인터랙션 표준 상세 규격
- [NEXA-컴포넌트*재사용*가이드.md](./NEXA-컴포넌트_재사용_가이드.md): 컴포넌트 재사용 가이드
