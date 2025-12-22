# 컴포넌트 재사용 가이드 (Component Reusability Guide)

**작성일**: 2024년  
**목적**: 표준 계약을 준수하는 컴포넌트를 다양한 컨텍스트에서 재사용하는 방법 가이드  
**버전**: 1.0

---

## 개요

이 가이드는 표준 계약을 준수하는 컴포넌트(노드, 보드, 차트, 블록, 패널)를 다양한 컨텍스트에서 재사용하는 방법을 설명합니다.

### 핵심 원칙

1. **표준 계약 준수**: 모든 컴포넌트는 표준 계약을 따라야 함
2. **번역기 활용**: 번역기를 통해 다른 컨텍스트로 변환
3. **단계적 구현**: 쉬운 것부터 시작하여 점진적으로 확장

---

## 재사용 시나리오

### 시나리오 1: 보드를 ERP 문서에 삽입

**목적**: 보드를 ERP 문서 도구에 임베드하여 문서 내에서 보드 내용을 표시

**단계**:

1. 보드 데이터 로드
2. `BoardTranslator.toDocument()` 호출
3. 문서 형식으로 변환된 데이터를 문서 에디터에 삽입

**예시 코드**:

```javascript
import { BoardTranslator } from '@/translators/BoardTranslator.js'

// 보드 데이터 로드
const board = await loadBoard('board-001')

// 문서 형식으로 변환 (읽기 전용)
const documentEmbed = BoardTranslator.toDocument(board, {
  readonly: true,
  removeInteractions: true,
})

// 문서 에디터에 삽입
documentEditor.insertEmbed(documentEmbed)
```

**제한사항**:

- 읽기 전용 (인터랙션 제거)
- 드래그앤드롭 불가
- 리사이즈 불가

**인터랙션 포함 버전**:

```javascript
// 인터랙션 포함 (어려움)
const documentEmbed = BoardTranslator.toDocumentInteractive(board, {
  preserveInteractions: true,
  context: 'document',
})
```

---

### 시나리오 2: 노드를 보드 패널로 변환

**목적**: 자동화 노드를 보드 내 패널로 시각화

**단계**:

1. 노드 데이터 로드
2. `NodeTranslator.toBoard()` 호출
3. 변환된 패널을 보드에 추가

**예시 코드**:

```javascript
import { NodeTranslator } from '@/translators/NodeTranslator.js'

// 노드 데이터 로드
const node = await loadNode('node-001')

// 보드 패널 형식으로 변환
const panel = NodeTranslator.toBoard(node, {
  grid: { x: 0, y: 0, w: 6, h: 4 },
})

// 보드에 패널 추가
board.addPanel(panel)
```

**특징**:

- 노드 그래프를 패널 레이아웃으로 변환
- 노드 실행 로직을 패널 인터랙션으로 변환
- `actions` 배열로 인터랙션 기능 유지

---

### 시나리오 3: 차트를 블록으로 변환

**목적**: 차트를 독립적인 블록으로 사용

**단계**:

1. 차트 데이터 로드
2. `ChartTranslator.toBlock()` 호출
3. 변환된 블록을 사용

**예시 코드**:

```javascript
import { ChartTranslator } from '@/translators/ChartTranslator.js'

// 차트 데이터 로드
const chart = await loadChart('chart-001')

// 블록 형식으로 변환
const block = ChartTranslator.toBlock(chart)

// 블록 사용
<BlockComponent :block="block" />
```

**특징**:

- 데이터만 변환 (쉬움)
- `dataSource` 표준으로 데이터 소스 정보 유지
- 인터랙션 기능 유지 (줌, 필터 등)

---

### 시나리오 4: 블록을 문서에 삽입

**목적**: 블록을 문서 에디터에 삽입

**단계**:

1. 블록 데이터 로드
2. `BlockTranslator.toDocument()` 호출
3. 문서 형식으로 변환된 블록을 문서에 삽입

**예시 코드**:

```javascript
import { BlockTranslator } from '@/translators/BlockTranslator.js'

// 블록 데이터 로드
const block = await loadBlock('block-001')

// 문서 형식으로 변환 (읽기 전용)
const documentBlock = BlockTranslator.toDocument(block, {
  readonly: true,
})

// 문서 에디터에 삽입
documentEditor.insertBlock(documentBlock)
```

**특징**:

- 읽기 전용 변환 (인터랙션 제거)
- 데이터는 유지
- 문서 컨텍스트에 맞게 스타일 조정

---

### 시나리오 5: 보드를 템플릿으로 저장

**목적**: 보드를 재사용 가능한 템플릿으로 변환

**단계**:

1. 보드 데이터 로드
2. `BoardTranslator.toTemplate()` 호출
3. 템플릿으로 저장

**예시 코드**:

```javascript
import { BoardTranslator } from '@/translators/BoardTranslator.js'

// 보드 데이터 로드
const board = await loadBoard('board-001')

// 템플릿 형식으로 변환
const template = BoardTranslator.toTemplate(board, {
  removeUserSpecificData: true,
  removeDevices: true,
})

// 템플릿 저장
await saveTemplate(template)
```

**특징**:

- 사용자별 설정 제거
- 특정 디바이스 제거 (범용적 템플릿)
- 레이아웃과 패널 구성은 유지

---

## 재사용 패턴

### 패턴 1: 읽기 전용 변환

**용도**: 문서, 리포트, 프레젠테이션 등 읽기 전용 컨텍스트

**특징**:

- 인터랙션 기능 제거
- 데이터는 유지
- 난이도: 쉬움 ~ 중간

**예시**:

```javascript
// 보드 → 문서 (읽기 전용)
const documentEmbed = BoardTranslator.toDocument(board, {
  readonly: true,
  removeInteractions: true,
})
```

---

### 패턴 2: 인터랙션 포함 변환

**용도**: 인터랙션이 필요한 컨텍스트

**특징**:

- 인터랙션 기능 유지
- `actions` 배열로 인터랙션 변환
- 난이도: 어려움

**예시**:

```javascript
// 보드 → 문서 (인터랙션 포함)
const documentEmbed = BoardTranslator.toDocumentInteractive(board, {
  preserveInteractions: true,
  context: 'document',
})
```

---

### 패턴 3: 데이터만 변환

**용도**: 데이터 시각화, 리포트 등

**특징**:

- 데이터만 변환
- 인터랙션 없음
- 난이도: 쉬움

**예시**:

```javascript
// 차트 → 블록
const block = ChartTranslator.toBlock(chart)
```

---

### 패턴 4: 구조 변환

**용도**: 레이아웃이나 구조를 변경해야 하는 경우

**특징**:

- 레이아웃 변환 필요
- 인터랙션 제거 또는 단순화
- 난이도: 중간

**예시**:

```javascript
// 노드 → 보드
const panel = NodeTranslator.toBoard(node, {
  grid: { x: 0, y: 0, w: 6, h: 4 },
})
```

---

## 재사용 시 주의사항

### 1. 데이터 손실 가능성

일부 변환 과정에서 데이터가 손실될 수 있습니다.

**예시**:

- 보드 → 문서 변환 시 드래그앤드롭 기능 제거
- 노드 → 보드 변환 시 일부 노드 로직 단순화

**대응 방법**:

- 원본 데이터 보존
- 변환 결과에 원본 정보 포함 (`metadata.source`)

---

### 2. 성능 고려

번역 과정에서 성능 오버헤드가 발생할 수 있습니다.

**대응 방법**:

- 번역 결과 캐싱
- 지연 로딩 (Lazy Loading)
- 배치 처리

---

### 3. 버전 호환성

컴포넌트 버전이 다를 경우 변환이 실패할 수 있습니다.

**대응 방법**:

- `version` 필드 확인
- 버전별 변환 규칙 적용
- 호환성 체크

---

### 4. 컨텍스트 제약

일부 컨텍스트에서는 특정 기능이 제한될 수 있습니다.

**예시**:

- 문서에서는 드래그앤드롭 불가
- 모바일에서는 일부 인터랙션 제한

**대응 방법**:

- 컨텍스트별 변환 옵션 제공
- 기능 제한 명시

---

## 재사용 체크리스트

컴포넌트를 재사용하기 전에 확인해야 할 사항:

- [ ] 표준 계약 준수 확인 (`id`, `type`, `version`, `metadata`)
- [ ] `toJSON()` 메서드 구현 확인
- [ ] 인터랙션 기능 확인 (`actions` 배열)
- [ ] 데이터 소스 확인 (`dataSource` 객체)
- [ ] 버전 호환성 확인
- [ ] 변환 대상 컨텍스트 확인
- [ ] 데이터 손실 가능성 확인
- [ ] 성능 영향 확인

---

## 재사용 예시 코드

### Vue 컴포넌트에서 사용

```vue
<template>
  <div>
    <!-- 보드를 문서에 임베드 -->
    <DocumentEmbed :embed="documentEmbed" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { BoardTranslator } from '@/translators/BoardTranslator.js'

const documentEmbed = ref(null)

onMounted(async () => {
  // 보드 데이터 로드
  const board = await loadBoard('board-001')

  // 문서 형식으로 변환
  documentEmbed.value = BoardTranslator.toDocument(board, {
    readonly: true,
  })
})
</script>
```

### React 컴포넌트에서 사용

```jsx
import { useState, useEffect } from 'react'
import { ChartTranslator } from '@/translators/ChartTranslator.js'

function ChartBlock({ chartId }) {
  const [block, setBlock] = useState(null)

  useEffect(() => {
    async function loadChart() {
      const chart = await loadChart(chartId)
      const block = ChartTranslator.toBlock(chart)
      setBlock(block)
    }
    loadChart()
  }, [chartId])

  if (!block) return <div>Loading...</div>

  return <BlockComponent block={block} />
}
```

---

## 재사용 시나리오 확장

### 향후 확장 가능한 시나리오

1. **보드 → 모바일 앱**: 보드를 모바일 앱 형식으로 변환
2. **노드 → API**: 노드를 REST API로 변환
3. **차트 → PDF**: 차트를 PDF 형식으로 변환
4. **블록 → 이메일**: 블록을 이메일 템플릿으로 변환
5. **패널 → 위젯**: 패널을 웹 위젯으로 변환

---

## 참고 문서

- [NEXA-컴포넌트*표준*계약.md](./NEXA-컴포넌트_표준_계약.md): 표준 계약 정의
- [NEXA-인터랙션_표준_안내.md](./NEXA-인터랙션_표준_안내.md): 인터랙션 표준 상세 규격
- [NEXA-번역기\_시스템.md](./NEXA-번역기_시스템.md): 번역기 시스템 설계
