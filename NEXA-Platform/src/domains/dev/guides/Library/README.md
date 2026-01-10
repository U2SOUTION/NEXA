# 라이브러리 (Library)

## 📋 폴더 목적

**바로 사용할 수 있는 완성된 재사용 컴포넌트 라이브러리**

이 폴더에는 실제 프로젝트에서 바로 사용할 수 있는 완성된 컴포넌트 샘플들이 포함됩니다.

## 🎯 특징

- ✅ **완성된 컴포넌트**: 실제 프로젝트에서 바로 사용 가능한 독립적인 컴포넌트
- ✅ **재사용 가능**: 여러 곳에서 재사용할 수 있는 범용 컴포넌트
- ✅ **독립적**: 외부 의존성 없이 자체 완결된 컴포넌트
- ✅ **실제 구현**: 플레이스홀더가 아닌 실제 동작하는 컴포넌트

## 📁 폴더 구조

```
Library/
├── charts/          # 완성된 차트 컴포넌트
├── panels/          # 완성된 패널 컴포넌트
├── diagrams/        # 완성된 다이어그램 컴포넌트
├── layouts/         # 완성된 레이아웃 컴포넌트
└── widgets/         # 완성된 위젯 컴포넌트
```

## 💡 사용 예시

```vue
<!-- Library/charts/SalesChart.vue -->
<template>
  <div class="sales-chart">
    <NexaChart
      type="bar"
      :data="salesData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup>
import NexaChart from 'src/charts/NexaChart.vue'
import { ref, computed } from 'vue'

// 완성된 컴포넌트 - props로 데이터 받음
const props = defineProps({
  salesData: Array,
  period: String
})

// 내부 로직 포함
const chartOptions = computed(() => ({
  // 완성된 옵션
}))
</script>
```

## 🔄 cores와의 차이

| 구분 | Library | cores |
|------|---------|------|
| **목적** | 바로 사용할 수 있는 완성 컴포넌트 | 코어 컴포넌트 사용 예제 |
| **성격** | 독립적, 완성된 컴포넌트 | 코어 컴포넌트 응용 |
| **사용** | 프로젝트에 직접 복사/사용 | 학습/참고용 |

---

**마지막 업데이트**: 2024년 12월
