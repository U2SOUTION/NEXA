# 핵심 컴포넌트 (Core Components)

## 📋 폴더 목적

**코어 컴포넌트를 사용하는 응용 가이드 (학습/참고용)**

이 폴더에는 NEXA 플랫폼의 핵심 컴포넌트(Node, Board, Chart, Block, Panel, Teach, Diagram)를 사용하는 방법을 보여주는 예제 파일들이 포함됩니다.

## 🎯 특징

- 📚 **학습용**: 코어 컴포넌트의 사용법을 학습하기 위한 예제
- 🔍 **참고용**: 실제 프로젝트에서 코어 컴포넌트를 사용할 때 참고
- 🎨 **응용 예제**: 코어 컴포넌트를 다양한 방식으로 활용하는 예제
- 📖 **가이드**: 코어 컴포넌트의 기능과 옵션을 설명

## 📁 폴더 구조

```
cores/
├── charts/          # NexaChart 사용 예제
│   ├── bar/        # 막대 차트 예제
│   ├── line/       # 선 차트 예제
│   └── pie/        # 파이 차트 예제
├── diagrams/       # NexaDiagram 사용 예제
│   ├── erd/        # ERD 다이어그램 예제
│   ├── flow/       # 플로우 다이어그램 예제
│   └── network/    # 네트워크 다이어그램 예제
├── boards/         # NexaBoard 사용 예제
│   ├── dashboard/  # 대시보드 보드 예제
│   └── split-layout/ # 분할 레이아웃 보드 예제
├── blocks/         # NexaBlock 사용 예제
│   ├── chart/      # 차트 블록 예제
│   ├── time/       # 시간 블록 예제
│   └── weather/    # 날씨 블록 예제
└── panels/         # NexaPanel 사용 예제
    ├── card/       # 카드 넥셋 예제
    └── gauge/      # 게이지 넥셋 예제
```

## 💡 사용 예시

```vue
<!-- cores/charts/bar/NexaChartBarSample.vue -->
<template>
  <div class="nexa-chart-bar-sample">
    <h4>막대 그래프 기본 사용법</h4>
    <NexaChart type="bar" :data="exampleData" :options="exampleOptions" />

    <h4>고급 옵션 사용법</h4>
    <NexaChart type="bar" :data="advancedData" :options="advancedOptions" />
  </div>
</template>

<script setup>
// 코어 컴포넌트 import
import NexaChart from 'src/charts/NexaChart.vue'

// 예제 데이터 (학습용)
const exampleData = {
  labels: ['1월', '2월', '3월'],
  datasets: [
    {
      label: '매출',
      data: [100, 200, 150],
    },
  ],
}

const exampleOptions = {
  // 기본 옵션 설명
}
</script>
```

## 🔄 Library와의 차이

| 구분     | cores                   | Library                           |
| -------- | ----------------------- | --------------------------------- |
| **목적** | 코어 컴포넌트 사용 예제 | 바로 사용할 수 있는 완성 컴포넌트 |
| **성격** | 코어 컴포넌트 응용      | 독립적, 완성된 컴포넌트           |
| **사용** | 학습/참고용             | 프로젝트에 직접 복사/사용         |

## 📚 핵심 컴포넌트 목록

NEXA 플랫폼의 핵심 컴포넌트는 다음과 같습니다:

1. **Node** (`src/node/`) - 노드 컴포넌트
2. **Board** (`src/board/`) - 보드 컴포넌트
3. **Chart** (`src/charts/`) - 차트 컴포넌트
4. **Block** (`src/block/`) - 블록 컴포넌트
5. **Panel** (`src/panel/`) - 넥셋 컴포넌트
6. **Teach** (`src/teach/`) - 티치 컴포넌트
7. **Diagram** (`src/diagram/`) - 다이어그램 컴포넌트

## 🔗 관련 문서

- [NEXA 컴포넌트 표준 계약](../../NEXA-Documentation/Platform/04-개발/NEXA-컴포넌트_표준_계약.md)
- [NEXA 번역기 시스템](../../NEXA-Documentation/Platform/02-아키텍처/NEXA-번역기_시스템.md)
- [핵심 컴포넌트 개발 가이드 통합 방안](../../NEXA-Documentation/Platform/04-개발/핵심_컴포넌트_개발_가이드_통합_방안.md)

---

**마지막 업데이트**: 2024년 12월
