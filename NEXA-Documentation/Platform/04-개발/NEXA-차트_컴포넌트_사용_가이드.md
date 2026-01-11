# NEXA-차트 컴포넌트 사용 가이드

> **문서 목적**: NexaChart 컴포넌트의 사용법을 명확히 정의하고, 업데이트 시 지속적으로 관리하여 사용법에 혼선이 없도록 하는 기준 문서입니다.
>
> **최종 업데이트**: 2024년 12월
>
> **관리 원칙**: NexaChart 컴포넌트가 업데이트될 때마다 이 문서도 함께 업데이트되어야 합니다.

---

## 📋 목차

1. [개요](#개요)
2. [기본 사용법](#기본-사용법)
3. [Props 상세 설명](#props-상세-설명)
4. [이벤트](#이벤트)
5. [Slot 사용법](#slot-사용법)
6. [새로고침 기능](#새로고침-기능)
7. [데이터 형식](#데이터-형식)
8. [차트 타입별 특징](#차트-타입별-특징)
9. [스타일링](#스타일링)
10. [멀티 차트 기능](#멀티-차트-기능)
11. [고급 사용법](#고급-사용법)
12. [주의사항](#주의사항)
13. [업데이트 이력](#업데이트-이력)

---

## 개요

`NexaChart`는 NEXA 플랫폼의 재사용 가능한 차트 컴포넌트입니다. D3.js를 기반으로 구현되었으며, 다양한 차트 타입을 지원합니다.

### 주요 특징

-   **5가지 차트 타입 지원**: bar, line, area, pie, scatter
-   **반응형 크기 조정**: 컨테이너 크기에 자동으로 맞춤
-   **애니메이션 지원**: 기본 애니메이션 제공
-   **인터랙티브**: 데이터 클릭, 호버 이벤트 지원
-   **헤더 기능**: 타이틀, 아이콘, 보조 정보 및 액션 버튼 지원
-   **새로고침 기능**: 기본 제공되는 새로고침 기능

### 파일 위치

```
NEXA-Platform/src/charts/NexaChart.vue
```

---

## 기본 사용법

### 최소 구성

```vue
<template>
    <NexaChart type="line" :data="chartData" />
</template>

<script setup>
import NexaChart from "src/engines/charts/NexaChart.vue";

const chartData = [
    { x: "2024-01", y: 100 },
    { x: "2024-02", y: 150 },
    { x: "2024-03", y: 200 },
];
</script>
```

### 타이틀과 아이콘 포함

```vue
<template>
    <NexaChart type="line" :data="chartData" title="매출 추이" title-icon="trending_up" />
</template>
```

### 보조 정보 및 액션 버튼 포함

```vue
<template>
    <NexaChart type="line" :data="chartData" title="매출 추이" title-icon="trending_up" :on-refresh="handleRefresh">
        <template #title-right="{ isRefreshing, handleRefresh }">
            <q-chip size="sm" color="primary" text-color="white">
                {{ chartData.length }}일간
                <q-tooltip>최근 7일간 데이터</q-tooltip>
            </q-chip>
            <q-btn flat dense icon="refresh" size="sm" :loading="isRefreshing" @click="handleRefresh" />
        </template>
    </NexaChart>
</template>

<script setup>
function handleRefresh() {
    // 데이터 새로고침 로직
    console.log("차트 데이터 새로고침");
}
</script>
```

---

## Props 상세 설명

### 필수 Props

| Prop   | 타입     | 설명                                                          | 예시                         |
| ------ | -------- | ------------------------------------------------------------- | ---------------------------- |
| `type` | `String` | 차트 타입 (`'bar'`, `'line'`, `'area'`, `'pie'`, `'scatter'`) | `"line"`                     |
| `data` | `Array`  | 차트 데이터 배열                                              | `[{ x: '2024-01', y: 100 }]` |

### 선택적 Props

#### 기본 설정

| Prop         | 타입      | 기본값                                  | 설명                                                 |
| ------------ | --------- | --------------------------------------- | ---------------------------------------------------- |
| `width`      | `Number`  | `null`                                  | 차트 너비 (픽셀). `null`이면 컨테이너 크기 자동 사용 |
| `height`     | `Number`  | `null`                                  | 차트 높이 (픽셀). `null`이면 컨테이너 크기 자동 사용 |
| `options`    | `Object`  | `{ animation: true, showLabels: true }` | 차트 옵션                                            |
| `showLabels` | `Boolean` | `true`                                  | 데이터 라벨 표시 여부                                |

#### 헤더 설정

| Prop        | 타입       | 기본값 | 설명                               |
| ----------- | ---------- | ------ | ---------------------------------- |
| `title`     | `String`   | `null` | 차트 타이틀                        |
| `titleIcon` | `String`   | `null` | 타이틀 아이콘 (Quasar 아이콘 이름) |
| `onRefresh` | `Function` | `null` | 새로고침 콜백 함수                 |

#### 데이터 필드 설정

| Prop                 | 타입     | 기본값    | 설명              |
| -------------------- | -------- | --------- | ----------------- |
| `xField`             | `String` | `'x'`     | X축 데이터 필드명 |
| `yField`             | `String` | `'y'`     | Y축 데이터 필드명 |
| `columns`            | `Array`  | `[]`      | 컬럼 정보 배열    |
| `aggregation`        | `String` | `'count'` | 집계 방식         |
| `aggregationOptions` | `Array`  | `[]`      | 집계 옵션 배열    |

#### 레이아웃 설정

| Prop          | 타입     | 기본값                                          | 설명                                 |
| ------------- | -------- | ----------------------------------------------- | ------------------------------------ |
| `margin`      | `Object` | `{ top: 50, right: 40, bottom: 120, left: 40 }` | 차트 마진 (픽셀)                     |
| `style`       | `Object` | `{}`                                            | 스타일 효과 (예: `{ opacity: 0.8 }`) |
| `interaction` | `Object` | `{}`                                            | 인터랙션 설정                        |

### margin 기본값 상세

타이틀이 있는 경우와 없는 경우에 따라 `margin.top`이 자동으로 조정됩니다:

-   **타이틀 없음**: `top: 50px`
-   **타이틀 있음**: `top: 14px` (타이틀 높이 고려)

---

## 이벤트

### `data-click`

데이터 포인트 클릭 시 발생합니다.

```vue
<template>
    <NexaChart type="line" :data="chartData" @data-click="handleDataClick" />
</template>

<script setup>
function handleDataClick(data) {
    console.log("클릭된 데이터:", data);
    // data 형식: { x: '2024-01', y: 100, count: 1, originalRows: [...] }
}
</script>
```

### `data-hover`

데이터 포인트에 마우스를 올렸을 때 발생합니다.

```vue
<template>
    <NexaChart type="line" :data="chartData" @data-hover="handleDataHover" />
</template>

<script setup>
function handleDataHover(data) {
    console.log("호버된 데이터:", data);
}
</script>
```

---

## Slot 사용법

### `title-right` Slot

헤더 우측에 보조 정보 및 액션 버튼을 배치할 수 있습니다.

#### Slot Props

| Prop            | 타입       | 설명                  |
| --------------- | ---------- | --------------------- |
| `isRefreshing`  | `Boolean`  | 새로고침 진행 중 여부 |
| `handleRefresh` | `Function` | 새로고침 함수 호출    |

#### 사용 예시

```vue
<template>
    <NexaChart type="line" :data="chartData" title="매출 추이" :on-refresh="handleRefresh">
        <template #title-right="{ isRefreshing, handleRefresh }">
            <!-- 보조 정보 -->
            <q-chip size="sm" color="primary" text-color="white">
                {{ chartData.length }}일간
                <q-tooltip>최근 7일간 데이터</q-tooltip>
            </q-chip>

            <!-- 새로고침 버튼 -->
            <q-btn flat dense icon="refresh" size="sm" :loading="isRefreshing" @click="handleRefresh" />

            <!-- 추가 액션 버튼 예시 -->
            <q-btn flat dense icon="download" size="sm" @click="handleExport" />
        </template>
    </NexaChart>
</template>

<script setup>
function handleRefresh() {
    // 데이터 새로고침 로직
    console.log("차트 데이터 새로고침");
}

function handleExport() {
    // 데이터 내보내기 로직
    console.log("차트 데이터 내보내기");
}
</script>
```

---

## 새로고침 기능

NexaChart는 기본적으로 새로고침 기능을 제공합니다.

### 동작 방식

1. `onRefresh` prop에 함수를 전달합니다.
2. `title-right` slot에서 `handleRefresh` 함수를 호출합니다.
3. 차트가 자동으로 재렌더링되어 애니메이션이 재생됩니다.
4. 버튼에 로딩 스피너가 0.6초 동안 표시됩니다.

### 구현 예시

```vue
<template>
    <NexaChart type="line" :data="chartData" title="매출 추이" :on-refresh="handleRefresh">
        <template #title-right="{ isRefreshing, handleRefresh }">
            <q-btn flat dense icon="refresh" size="sm" :loading="isRefreshing" @click="handleRefresh" />
        </template>
    </NexaChart>
</template>

<script setup>
import { ref } from "vue";

const chartData = ref([
    { x: "2024-01", y: 100 },
    { x: "2024-02", y: 150 },
]);

function handleRefresh() {
    // 데이터 새로고침
    // 예: API 호출, 전역 이벤트 발생 등
    window.dispatchEvent(new CustomEvent("chart-refresh-request"));

    // 또는 직접 데이터 업데이트
    // fetchData().then(data => { chartData.value = data })
}
</script>
```

### 주의사항

-   `onRefresh` prop이 없으면 새로고침 기능이 작동하지 않습니다.
-   새로고침 중에는 중복 호출이 방지됩니다.
-   차트 재렌더링은 데이터 업데이트 후 자동으로 수행됩니다.

---

## 데이터 형식

### 기본 데이터 형식

```javascript
const chartData = [
    { x: "2024-01", y: 100 },
    { x: "2024-02", y: 150 },
    { x: "2024-03", y: 200 },
];
```

### 확장 데이터 형식

```javascript
const chartData = [
    {
        x: "2024-01",
        y: 100,
        count: 5,
        originalRows: [
            { date: "2024-01-01", value: 20 },
            { date: "2024-01-02", value: 30 },
            // ...
        ],
    },
    // ...
];
```

### 데이터 필드 커스터마이징

`xField`와 `yField` prop을 사용하여 데이터 필드명을 변경할 수 있습니다.

```vue
<template>
    <NexaChart type="line" :data="chartData" x-field="date" y-field="value" />
</template>

<script setup>
const chartData = [
    { date: "2024-01", value: 100 },
    { date: "2024-02", value: 150 },
];
</script>
```

---

## 차트 타입별 특징

### 1. Bar Chart (`type="bar"`)

막대 차트입니다.

```vue
<NexaChart type="bar" :data="chartData" />
```

**특징:**

-   수직 막대 차트
-   카테고리별 비교에 적합
-   데이터 라벨 표시 가능

### 2. Line Chart (`type="line"`)

선 차트입니다.

```vue
<NexaChart type="line" :data="chartData" />
```

**특징:**

-   시계열 데이터에 적합
-   추이 분석에 유용
-   애니메이션 지원

### 3. Area Chart (`type="area"`)

영역 차트입니다.

```vue
<NexaChart type="area" :data="chartData" />
```

**특징:**

-   선 차트의 영역 버전
-   누적 데이터 표현에 적합
-   면적 강조

### 4. Pie Chart (`type="pie"`)

파이 차트입니다.

```vue
<NexaChart type="pie" :data="chartData" />
```

**특징:**

-   비율 표현에 적합
-   전체 대비 부분 비교
-   마진 설정 권장 (작은 마진 사용)

**마진 설정 예시:**

```vue
<NexaChart type="pie" :data="chartData" :margin="{ top: 0, right: 10, bottom: 10, left: 10 }" />
```

### 5. Scatter Chart (`type="scatter"`)

산점도 차트입니다.

```vue
<NexaChart type="scatter" :data="chartData" />
```

**특징:**

-   두 변수 간 관계 분석
-   상관관계 파악에 유용
-   데이터 포인트 분포 시각화

---

## 스타일링

### CSS 변수 사용

NexaChart는 NEXA 테마 CSS 변수를 사용합니다.

```scss
// 차트 색상은 CSS 변수로 관리됩니다
// NEXA-Platform/src/css/nexa-system/_chart.scss 참고
```

### 스타일 효과 적용

`style` prop을 사용하여 차트에 스타일 효과를 적용할 수 있습니다.

#### 단일 차트 스타일 효과

```vue
<template>
    <NexaChart type="line" :data="chartData" :style="{ opacity: 0.8 }" />
</template>
```

**지원하는 스타일 옵션:**

| 옵션        | 타입      | 범위/값          | 설명                       | 예시                       |
| ----------- | --------- | ---------------- | -------------------------- | -------------------------- |
| `opacity`   | `Number`  | 0.0 - 1.0        | 차트 투명도 (1.0 = 불투명) | `{ opacity: 0.7 }`         |
| `blur`      | `Number`  | 0 - 10           | 흐리기 효과 (픽셀 단위)    | `{ blur: 2 }`              |
| `neon`      | `Boolean` | `true` / `false` | 네온 효과 활성화           | `{ neon: true }`           |
| `neonColor` | `String`  | 색상 코드        | 네온 효과 색상             | `{ neonColor: '#00ff00' }` |

**사용 예시:**

```vue
<template>
    <!-- 투명도 적용 -->
    <NexaChart type="line" :data="chartData" :style="{ opacity: 0.7 }" />

    <!-- 흐리기 효과 적용 -->
    <NexaChart type="bar" :data="chartData" :style="{ blur: 2 }" />

    <!-- 네온 효과 적용 -->
    <NexaChart type="line" :data="chartData" :style="{ neon: true, neonColor: '#00ff00' }" />
</template>
```

> **참고**: 현재 NexaChart는 단일 차트용으로 `opacity`만 직접 지원합니다. `blur`, `neon` 등 고급 효과는 멀티 차트 모드에서 사용할 수 있습니다. 자세한 내용은 [멀티 차트 기능](#멀티-차트-기능) 섹션을 참고하세요.

### 컨테이너 스타일링

차트 컨테이너는 `.chart-wrapper` 클래스를 사용합니다.

```vue
<template>
    <div class="my-chart-container">
        <NexaChart type="line" :data="chartData" />
    </div>
</template>

<style lang="scss" scoped>
.my-chart-container {
    width: 100%;
    height: 400px;
    background: var(--nexa-background);
    border: 1px solid var(--nexa-border-color);
    border-radius: 4px;
    padding: 16px;
}
</style>
```

---

## 멀티 차트 기능

NEXA 플랫폼은 여러 차트를 겹쳐서 표시할 수 있는 **멀티 차트 레이어 기능**을 제공합니다. 이 기능을 통해 여러 차트를 동일한 축에 겹쳐서 표시하고, 각 차트에 개별적인 스타일 효과를 적용할 수 있습니다.

### 개요

멀티 차트 기능은 `MultiChartContainer` 컴포넌트를 통해 제공됩니다. 이 컴포넌트는 다음과 같은 특징을 가집니다:

-   **공유 축**: 여러 차트가 동일한 축을 공유하며 겹쳐서 표시
-   **레이어 z-index**: 각 차트 레이어의 순서 지정 가능
-   **개별 스타일링**: 각 차트별로 투명도, 흐리기, 네온 효과 등 자유롭게 지정
-   **데이터 라벨 제어**: 각 차트별로 라벨 표시 여부 결정
-   **개별 인터랙션**: 각 차트 타입마다 다른 인터랙션 기능 지정
-   **독립 데이터**: 동일/다른 타입이든 각각 다른 데이터 주입

### 파일 위치

```
NEXA-Platform/src/charts/MultiChartContainer.vue
```

### 기본 사용법

```vue
<template>
    <MultiChartContainer :layers="chartLayers" :width="800" :height="400" :shared-axes="true" />
</template>

<script setup>
import MultiChartContainer from "src/charts/MultiChartContainer.vue";

const chartLayers = [
    {
        id: "sales",
        type: "bar",
        data: [
            { x: "2024-01", y: 100 },
            { x: "2024-02", y: 150 },
            { x: "2024-03", y: 200 },
        ],
        layerIndex: 0, // z-index (낮을수록 아래)
        style: {
            opacity: 0.7,
            blur: 1,
        },
        showLabels: true,
        interaction: {
            tooltip: true,
            click: true,
            hover: true,
        },
    },
    {
        id: "profit",
        type: "line",
        data: [
            { x: "2024-01", y: 50 },
            { x: "2024-02", y: 80 },
            { x: "2024-03", y: 120 },
        ],
        layerIndex: 1,
        style: {
            opacity: 1,
            neon: true,
            neonColor: "#00ff00",
        },
        showLabels: false,
        interaction: {
            tooltip: true,
            hover: true,
        },
    },
];
</script>
```

### 레이어 설정

각 레이어는 다음과 같은 설정을 가질 수 있습니다:

#### 레이어 기본 설정

| 속성         | 타입     | 필수 | 설명                                                          |
| ------------ | -------- | ---- | ------------------------------------------------------------- |
| `id`         | `String` | 필수 | 레이어 고유 식별자                                            |
| `type`       | `String` | 필수 | 차트 타입 (`'bar'`, `'line'`, `'area'`, `'pie'`, `'scatter'`) |
| `data`       | `Array`  | 필수 | 차트 데이터 배열                                              |
| `layerIndex` | `Number` | 필수 | 레이어 순서 (낮을수록 아래, z-index)                          |

#### 스타일 설정

| 속성            | 타입      | 기본값      | 설명                            |
| --------------- | --------- | ----------- | ------------------------------- |
| `opacity`       | `Number`  | `1.0`       | 투명도 (0.0 - 1.0)              |
| `blur`          | `Number`  | `0`         | 흐리기 효과 (0 - 10, 픽셀 단위) |
| `neon`          | `Boolean` | `false`     | 네온 효과 활성화                |
| `neonColor`     | `String`  | `"#00ff00"` | 네온 효과 색상                  |
| `glow`          | `Boolean` | `false`     | 글로우 효과 활성화              |
| `glowColor`     | `String`  | `"#ffffff"` | 글로우 효과 색상                |
| `glowIntensity` | `Number`  | `5`         | 글로우 강도                     |

#### 인터랙션 설정

| 속성      | 타입      | 기본값 | 설명                    |
| --------- | --------- | ------ | ----------------------- |
| `tooltip` | `Boolean` | `true` | 툴팁 표시 여부          |
| `click`   | `Boolean` | `true` | 클릭 이벤트 활성화 여부 |
| `hover`   | `Boolean` | `true` | 호버 이벤트 활성화 여부 |

### 스타일 효과 상세

#### 투명도 (Opacity)

차트의 투명도를 조절하여 여러 차트를 겹쳐서 표시할 때 배경 차트를 보이게 할 수 있습니다.

```javascript
{
    style: {
        opacity: 0.7, // 70% 불투명 (30% 투명)
    },
}
```

**사용 예시:**

```vue
<template>
    <MultiChartContainer :layers="chartLayers" />
</template>

<script setup>
const chartLayers = [
    {
        id: "background",
        type: "bar",
        data: barData,
        layerIndex: 0,
        style: {
            opacity: 0.5, // 배경 차트를 반투명하게
        },
    },
    {
        id: "foreground",
        type: "line",
        data: lineData,
        layerIndex: 1,
        style: {
            opacity: 1.0, // 전경 차트를 불투명하게
        },
    },
];
</script>
```

#### 흐리기 효과 (Blur)

차트에 흐리기 효과를 적용하여 배경 차트를 강조할 수 있습니다.

```javascript
{
    style: {
        blur: 2, // 2픽셀 흐리기
    },
}
```

**사용 예시:**

```vue
<script setup>
const chartLayers = [
    {
        id: "blurred",
        type: "area",
        data: areaData,
        layerIndex: 0,
        style: {
            opacity: 0.6,
            blur: 3, // 3픽셀 흐리기
        },
    },
    {
        id: "sharp",
        type: "line",
        data: lineData,
        layerIndex: 1,
        style: {
            opacity: 1.0,
            blur: 0, // 흐리기 없음
        },
    },
];
</script>
```

#### 네온 효과 (Neon)

차트에 네온 효과를 적용하여 강조할 수 있습니다.

```javascript
{
    style: {
        neon: true,
        neonColor: "#00ff00", // 녹색 네온
    },
}
```

**사용 예시:**

```vue
<script setup>
const chartLayers = [
    {
        id: "normal",
        type: "bar",
        data: barData,
        layerIndex: 0,
        style: {
            opacity: 0.7,
        },
    },
    {
        id: "highlighted",
        type: "line",
        data: lineData,
        layerIndex: 1,
        style: {
            opacity: 1.0,
            neon: true,
            neonColor: "#00ff00", // 녹색 네온 효과
        },
    },
];
</script>
```

#### 글로우 효과 (Glow)

차트에 글로우 효과를 적용하여 빛나는 효과를 줄 수 있습니다.

```javascript
{
    style: {
        glow: true,
        glowColor: "#ffffff",
        glowIntensity: 5,
    },
}
```

### 복합 스타일 효과

여러 스타일 효과를 조합하여 사용할 수 있습니다.

```javascript
const chartLayers = [
    {
        id: "background-layer",
        type: "bar",
        data: backgroundData,
        layerIndex: 0,
        style: {
            opacity: 0.5, // 반투명
            blur: 2, // 약간 흐림
        },
        showLabels: false,
    },
    {
        id: "highlight-layer",
        type: "line",
        data: highlightData,
        layerIndex: 1,
        style: {
            opacity: 1.0, // 불투명
            neon: true, // 네온 효과
            neonColor: "#00ff00", // 녹색 네온
        },
        showLabels: true,
    },
];
```

### DataChartRenderer를 통한 사용

`DataChartRenderer`를 사용하면 멀티 차트 모드를 쉽게 사용할 수 있습니다.

```vue
<template>
    <DataChartRenderer :rows="dataRows" :layers="chartLayers" />
</template>

<script setup>
import DataChartRenderer from "src/renderers/DataChartRenderer.vue";

const chartLayers = [
    {
        id: "layer-1",
        type: "bar",
        data: barData,
        layerIndex: 0,
        style: {
            opacity: 0.7,
        },
    },
    {
        id: "layer-2",
        type: "line",
        data: lineData,
        layerIndex: 1,
        style: {
            opacity: 1.0,
            neon: true,
        },
    },
];
</script>
```

### 배경 이미지 지원

멀티 차트는 배경 이미지를 지원합니다. (향후 구현 예정)

```vue
<template>
    <MultiChartContainer
        :layers="chartLayers"
        :background="{
            image: '/images/chart-background.jpg',
            opacity: 0.3,
            style: {
                blur: 3,
                brightness: 0.8,
                contrast: 1.2,
            },
        }"
    />
</template>
```

### 주의사항

1. **레이어 순서**: `layerIndex`가 낮을수록 아래에 렌더링됩니다.
2. **성능**: 여러 레이어와 복잡한 스타일 효과는 성능에 영향을 줄 수 있습니다.
3. **스타일 효과**: `blur` 효과는 가장 비용이 크므로 적절히 사용하세요.
4. **데이터 형식**: 각 레이어의 데이터는 동일한 형식이어야 합니다 (X축 기준).

### 참고 자료

-   **아키텍처 문서**: `NEXA-Documentation/Platform/02-아키텍처/NEXA-멀티_차트_레이어_아키텍처.md`
-   **컴포넌트 파일**: `NEXA-Platform/src/charts/MultiChartContainer.vue`
-   **렌더러 파일**: `NEXA-Platform/src/renderers/DataChartRenderer.vue`

---

## 고급 사용법

### 반응형 크기 조정

차트는 컨테이너 크기에 자동으로 맞춰집니다.

```vue
<template>
    <div class="chart-container">
        <NexaChart type="line" :data="chartData" />
    </div>
</template>

<style lang="scss" scoped>
.chart-container {
    width: 100%;
    height: 400px;
    min-height: 300px;
}
</style>
```

### 동적 데이터 업데이트

데이터가 변경되면 차트가 자동으로 재렌더링됩니다.

```vue
<template>
    <NexaChart type="line" :data="chartData" />
</template>

<script setup>
import { ref } from "vue";

const chartData = ref([
    { x: "2024-01", y: 100 },
    { x: "2024-02", y: 150 },
]);

// 데이터 업데이트 시 자동 재렌더링
setTimeout(() => {
    chartData.value.push({ x: "2024-03", y: 200 });
}, 2000);
</script>
```

### 여러 차트 배치

CSS Grid를 사용하여 여러 차트를 배치할 수 있습니다.

```vue
<template>
    <div class="charts-grid">
        <div class="chart-card">
            <NexaChart type="line" :data="lineData" title="라인 차트" />
        </div>
        <div class="chart-card">
            <NexaChart type="pie" :data="pieData" title="파이 차트" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 16px;
}

.chart-card {
    width: 100%;
    height: 400px;
    background: var(--nexa-surface);
    border-radius: 4px;
    padding: 16px;
}
</style>
```

---

## 주의사항

### 1. 데이터 형식

-   데이터는 반드시 배열이어야 합니다.
-   각 데이터 항목은 `x`와 `y` 필드를 포함해야 합니다 (또는 `xField`/`yField`로 지정된 필드).

### 2. 크기 설정

-   `width`와 `height`를 `null`로 두면 컨테이너 크기에 자동으로 맞춰집니다.
-   명시적으로 크기를 지정하면 해당 크기로 고정됩니다.

### 3. 마진 설정

-   타이틀이 있으면 `margin.top`이 자동으로 조정됩니다.
-   파이 차트는 작은 마진을 사용하는 것이 좋습니다.

### 4. 새로고침 기능

-   `onRefresh` prop이 없으면 새로고침 기능이 작동하지 않습니다.
-   새로고침 중에는 중복 호출이 방지됩니다.

### 5. 애니메이션

-   기본적으로 애니메이션이 활성화되어 있습니다.
-   `options.animation`을 `false`로 설정하여 비활성화할 수 있습니다.

---

## 업데이트 이력

### 2024년 12월

#### 초기 버전

-   5가지 차트 타입 지원 (bar, line, area, pie, scatter)
-   반응형 크기 조정 기능
-   헤더 기능 (타이틀, 아이콘, 보조 정보 및 액션)
-   새로고침 기능 기본 제공
-   Slot Props를 통한 확장 가능한 구조

#### 주요 기능

-   `title-right` slot을 통한 보조 정보 및 액션 버튼 배치
-   `onRefresh` prop을 통한 새로고침 기능
-   자동 차트 재렌더링 및 애니메이션 재생
-   타이틀 유무에 따른 자동 마진 조정

#### 멀티 차트 기능 추가

-   멀티 차트 레이어 기능 문서화
-   여러 차트를 겹쳐서 표시하는 방법 추가
-   스타일 효과 (투명도, 흐리기, 네온, 글로우) 상세 설명 추가
-   `MultiChartContainer` 컴포넌트 사용법 추가
-   레이어별 개별 스타일링 및 인터랙션 설정 방법 추가

---

## 참고 자료

### 단일 차트

-   **컴포넌트 파일**: `NEXA-Platform/src/charts/NexaChart.vue`
-   **스타일 파일**: `NEXA-Platform/src/css/nexa-system/_chart.scss`
-   **차트 렌더러**: `NEXA-Platform/src/charts/{type}/` (bar, line, area, pie, scatter)

### 멀티 차트

-   **컴포넌트 파일**: `NEXA-Platform/src/charts/MultiChartContainer.vue`
-   **렌더러 파일**: `NEXA-Platform/src/renderers/DataChartRenderer.vue`
-   **아키텍처 문서**: `NEXA-Documentation/Platform/02-아키텍처/NEXA-멀티_차트_레이어_아키텍처.md`

---

## 문의 및 피드백

이 문서는 NexaChart 컴포넌트의 사용법을 명확히 하기 위해 작성되었습니다.
컴포넌트가 업데이트될 때마다 이 문서도 함께 업데이트되어야 합니다.

**문서 업데이트 원칙:**

1. Props가 추가/변경/제거되면 즉시 반영
2. 새로운 기능이 추가되면 사용법 추가
3. 주의사항이 발견되면 즉시 추가
4. 업데이트 이력에 변경 사항 기록

---

**마지막 업데이트**: 2024년 12월
