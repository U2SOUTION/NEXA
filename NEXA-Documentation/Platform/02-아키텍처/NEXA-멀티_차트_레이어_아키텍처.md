# 복수 차트 레이어 아키텍처 설계

## 요구사항 분석

### 핵심 요구사항

1. **공유 축**: 여러 차트가 동일한 축을 공유하며 겹쳐서 표시
2. **레이어 z-index**: 각 차트 레이어의 순서 지정 가능
3. **개별 스타일링**: 각 차트별로 흐리기, 네온효과 등 자유롭게 지정
4. **데이터 라벨 제어**: 각 차트별로 라벨 표시 여부 결정
5. **개별 인터랙션**: 각 차트 타입마다 다른 인터랙션 기능 지정
6. **독립 데이터**: 동일/다른 타입이든 각각 다른 데이터 주입

---

## 아키텍처 설계

### 1. 컴포넌트 구조

```
MultiChartContainer.vue (최상위 컨테이너)
  ├── 공유 SVG 생성
  ├── 공유 축 레이어 (한 번만 렌더링)
  └── ChartLayer.vue (각 차트 레이어)
      ├── type: 'bar' | 'line' | 'area' | 'pie' | 'scatter'
      ├── data: 독립 데이터
      ├── layerIndex: z-index
      ├── style: { opacity, blur, neon, ... }
      ├── showLabels: boolean
      └── interaction: { tooltip, click, hover, ... }
```

### 2. SVG 레이어 구조

```xml
<svg>
  <!-- 공유 축 레이어 (최하위) -->
  <g class="shared-axes-layer">
    <g class="x-axis">...</g>
    <g class="y-axis">...</g>
  </g>

  <!-- 차트 레이어들 (z-index 순서대로) -->
  <g class="chart-layer" data-layer-index="0" style="opacity: 0.7; filter: blur(2px);">
    <!-- 첫 번째 차트 (bar) -->
  </g>

  <g class="chart-layer" data-layer-index="1" style="opacity: 1; filter: drop-shadow(0 0 10px #00ff00);">
    <!-- 두 번째 차트 (line) -->
  </g>

  <g class="chart-layer" data-layer-index="2">
    <!-- 세 번째 차트 (area) -->
  </g>
</svg>
```

### 3. 데이터 구조

```javascript
const chartLayers = [
    {
        id: "layer-1",
        type: "bar",
        data: salesData,
        layerIndex: 0, // z-index (낮을수록 아래)
        style: {
            opacity: 0.7,
            blur: 2,
            neon: false,
        },
        showLabels: true,
        interaction: {
            tooltip: true,
            click: true,
            hover: true,
        },
    },
    {
        id: "layer-2",
        type: "line",
        data: profitData,
        layerIndex: 1,
        style: {
            opacity: 1,
            blur: 0,
            neon: true,
            neonColor: "#00ff00",
        },
        showLabels: false,
        interaction: {
            tooltip: true,
            click: false,
            hover: true,
        },
    },
];
```

---

## 구현 계획

### Phase 1: 공통 유틸리티 추출 (기존 제안)

**목적**: 코드 중복 제거, 유지보수성 향상

**파일 구조**:

```
src/components/charts/
├── Chart.vue (기존, 단일 차트용)
├── MultiChartContainer.vue (신규)
├── ChartLayer.vue (신규)
├── barChart.js
├── lineChart.js
└── utils/
    ├── chartAxes.js      # 축 그리기 공통화
    ├── chartEvents.js    # 이벤트 핸들러 공통화
    ├── chartScales.js    # 스케일 생성 공통화
    ├── chartTooltip.js   # 툴팁 공통화
    └── chartTheme.js     # 테마/디자인 시스템
```

### Phase 2: 레이어 기반 구조 구현

#### 2.1 MultiChartContainer.vue

**역할**:

-   공유 SVG 컨테이너 생성
-   공유 축 계산 및 렌더링 (모든 레이어 데이터 통합 분석)
-   레이어 순서 관리 (z-index)
-   리사이즈 관리

**Props**:

```javascript
{
  layers: Array<ChartLayerConfig>,  // 차트 레이어 설정 배열
  width: Number,
  height: Number,
  margin: Object,
  sharedAxes: Boolean,  // 축 공유 여부
}
```

**핵심 로직**:

```javascript
// 1. 모든 레이어 데이터 통합하여 공유 스케일 계산
const allData = layers.flatMap((layer) => layer.data);
const sharedXScale = calculateSharedXScale(allData);
const sharedYScale = calculateSharedYScale(allData);

// 2. 레이어를 z-index 순서로 정렬
const sortedLayers = [...layers].sort((a, b) => a.layerIndex - b.layerIndex);

// 3. 공유 축 렌더링 (한 번만)
if (sharedAxes) {
    renderSharedAxes(sharedXScale, sharedYScale);
}

// 4. 각 레이어 렌더링
sortedLayers.forEach((layer) => {
    renderChartLayer(layer, sharedXScale, sharedYScale);
});
```

#### 2.2 ChartLayer.vue

**역할**:

-   개별 차트 레이어 렌더링
-   레이어별 스타일 적용
-   레이어별 인터랙션 처리

**Props**:

```javascript
{
  type: String,
  data: Array,
  layerIndex: Number,
  style: {
    opacity: Number,
    blur: Number,
    neon: Boolean,
    neonColor: String,
    // ... 기타 스타일 옵션
  },
  showLabels: Boolean,
  interaction: {
    tooltip: Boolean,
    click: Boolean,
    hover: Boolean,
  },
  // 공유 스케일 (MultiChartContainer에서 주입)
  xScale: Function,
  yScale: Function,
}
```

**스타일 적용**:

```javascript
// SVG 필터 정의 (흐리기, 네온효과)
const filterId = `layer-filter-${layerIndex}`;

if (style.blur > 0) {
    svg.append("defs").append("filter").attr("id", filterId).append("feGaussianBlur").attr("stdDeviation", style.blur);
}

if (style.neon) {
    // 네온 효과 필터 추가
    svg.append("defs").append("filter").attr("id", `${filterId}-neon`).append("feGaussianBlur").attr("stdDeviation", 3).attr("result", "coloredBlur");
    // ... 추가 네온 효과
}

// 레이어 그룹에 스타일 적용
const layerGroup = svg
    .append("g")
    .attr("class", "chart-layer")
    .attr("data-layer-index", layerIndex)
    .style("opacity", style.opacity)
    .attr("filter", style.blur > 0 || style.neon ? `url(#${filterId})` : null);
```

#### 2.3 차트 렌더링 함수 수정

**기존 차트 함수 수정 사항**:

-   축 렌더링 제거 (공유 축 사용)
-   스케일을 파라미터로 받도록 변경
-   라벨 표시 옵션 추가
-   인터랙션 옵션 추가

```javascript
// 기존
export function renderBarChart({ data, chartWidth, chartHeight, ... }) {
  // 스케일 생성
  const xScale = d3.scaleBand()...
  const yScale = d3.scaleLinear()...

  // 축 렌더링
  renderAxes(...)

  // 차트 렌더링
  ...
}

// 수정 후
export function renderBarChart({
  data,
  xScale,  // 공유 스케일 사용
  yScale,  // 공유 스케일 사용
  chartGroup,
  showLabels = true,  // 라벨 표시 옵션
  interaction = {},   // 인터랙션 옵션
  style = {},         // 스타일 옵션
}) {
  // 축 렌더링 제거 (공유 축 사용)

  // 차트 렌더링
  const bars = chartGroup.selectAll('.bar')...

  // 라벨 표시 (조건부)
  if (showLabels) {
    renderLabels(...)
  }

  // 인터랙션 (조건부)
  if (interaction.hover) {
    bars.on('mouseenter', ...)
  }
  if (interaction.click) {
    bars.on('click', ...)
  }
}
```

### Phase 3: 스타일 시스템 확장

#### 3.1 필터 시스템

```javascript
// utils/chartFilters.js
export function createBlurFilter(svg, filterId, blurAmount) {
    const defs = svg.select("defs").empty() ? svg.append("defs") : svg.select("defs");

    return defs.append("filter").attr("id", filterId).append("feGaussianBlur").attr("stdDeviation", blurAmount);
}

export function createNeonFilter(svg, filterId, color, intensity = 3) {
    const defs = svg.select("defs").empty() ? svg.append("defs") : svg.select("defs");

    const filter = defs.append("filter").attr("id", filterId);

    // 네온 효과: 여러 단계의 블러 + 색상
    filter.append("feGaussianBlur").attr("stdDeviation", intensity).attr("result", "coloredBlur");

    filter.append("feMerge").append("feMergeNode").attr("in", "coloredBlur");

    return filter;
}
```

#### 3.2 스타일 옵션 확장

```javascript
const styleOptions = {
    // 기본 스타일
    opacity: 1,
    fill: "#2196F3",
    stroke: "#000",
    strokeWidth: 1,

    // 효과
    blur: 0, // 0-10
    neon: false,
    neonColor: "#00ff00",
    glow: false,
    glowColor: "#ffffff",
    glowIntensity: 5,

    // 변환
    transform: null, // CSS transform
    scale: 1,
    rotate: 0,

    // 애니메이션
    animation: {
        enabled: true,
        duration: 800,
        easing: "cubic-out",
    },
};
```

### Phase 4: 인터랙션 시스템 확장

```javascript
// utils/chartInteraction.js

export function setupLayerInteraction({ elements, interaction, tooltip, onDataClick }) {
    if (!interaction) return;

    // 호버
    if (interaction.hover) {
        elements
            .on("mouseenter", function (event, d) {
                if (interaction.hover.style) {
                    applyHoverStyle(this, interaction.hover.style);
                }
                if (interaction.tooltip && tooltip) {
                    showTooltip(tooltip, event, d);
                }
            })
            .on("mouseleave", function () {
                if (interaction.hover.style) {
                    removeHoverStyle(this);
                }
                if (tooltip) {
                    hideTooltip(tooltip);
                }
            });
    }

    // 클릭
    if (interaction.click) {
        elements.on("click", function (event, d) {
            if (onDataClick) {
                onDataClick(d, event);
            }
            if (interaction.click.style) {
                applyClickStyle(this, interaction.click.style);
            }
        });
    }

    // 드래그
    if (interaction.drag) {
        elements.call(d3.drag().on("start", interaction.drag.onStart).on("drag", interaction.drag.onDrag).on("end", interaction.drag.onEnd));
    }
}
```

---

## 사용 예시

### 기본 사용법

```vue
<template>
    <MultiChartContainer :layers="chartLayers" :width="800" :height="400" :shared-axes="true" />
</template>

<script setup>
const chartLayers = [
    {
        id: "sales",
        type: "bar",
        data: salesData,
        layerIndex: 0,
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
        data: profitData,
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

### DataChartRenderer 통합

```vue
<!-- DataChartRenderer.vue 수정 -->
<template>
    <div class="data-chart-renderer">
        <!-- 단일 차트 모드 -->
        <Chart v-if="!multiLayerMode" :type="localChartType" :data="processedData" ... />

        <!-- 복수 차트 레이어 모드 -->
        <MultiChartContainer v-else :layers="chartLayers" :width="chartWidth" :height="chartHeight" :shared-axes="true" />
    </div>
</template>
```

---

## 개선 사항 적용 검증

### ✅ 요구사항 충족도

| 요구사항         | 구현 방법                        | 충족도       |
| ---------------- | -------------------------------- | ------------ |
| 축 공유          | 공유 스케일 계산, 한 번만 렌더링 | ✅ 완전 충족 |
| z-index 레이어   | layerIndex로 정렬, SVG DOM 순서  | ✅ 완전 충족 |
| 개별 스타일링    | style prop으로 필터/효과 적용    | ✅ 완전 충족 |
| 데이터 라벨 제어 | showLabels prop                  | ✅ 완전 충족 |
| 개별 인터랙션    | interaction prop                 | ✅ 완전 충족 |
| 독립 데이터      | 각 레이어별 data prop            | ✅ 완전 충족 |

### 추가 개선 사항

1. **성능 최적화**

    - 레이어별 가상화 (보이는 영역만 렌더링)
    - 스케일 캐싱
    - 애니메이션 최적화

2. **확장성**

    - 플러그인 방식 차트 추가
    - 커스텀 필터/효과 추가
    - 커스텀 인터랙션 추가

3. **개발자 경험**
    - TypeScript 타입 정의
    - 설정 프리셋 제공
    - 디버깅 도구

---

## 결론

제안한 개선 사항을 적용하면 **모든 요구사항을 완전히 충족**할 수 있습니다.

**핵심 설계 원칙**:

1. **레이어 기반 아키텍처**: 각 차트를 독립 레이어로 관리
2. **공유 리소스**: 축과 스케일은 공유하여 일관성 유지
3. **선택적 기능**: 스타일, 인터랙션, 라벨을 레이어별로 제어
4. **확장 가능**: 새로운 차트 타입, 효과, 인터랙션 쉽게 추가

이 구조로 구현하면 **복수 차트를 겹쳐서 표시하면서도 각각 독립적으로 제어**할 수 있습니다.

---

## 확장 기능: 배경 이미지

### 배경 이미지 추가 가능성

✅ **언제든지 추가 가능합니다!** 현재 레이어 기반 구조는 배경 이미지를 쉽게 통합할 수 있도록 설계되어 있습니다.

### 구현 방법

#### 1. SVG 레이어 구조 확장

```xml
<svg>
  <!-- 배경 이미지 레이어 (최하위) -->
  <g class="background-layer">
    <defs>
      <pattern id="background-pattern" x="0" y="0" width="100%" height="100%">
        <image href="/path/to/image.jpg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#background-pattern)" opacity="0.3" />
  </g>

  <!-- 공유 축 레이어 -->
  <g class="shared-axes-layer">...</g>

  <!-- 차트 레이어들 -->
  <g class="chart-layer" data-layer-index="0">...</g>
  <g class="chart-layer" data-layer-index="1">...</g>
</svg>
```

#### 2. MultiChartContainer에 배경 옵션 추가

```javascript
// Props 확장
{
  layers: Array<ChartLayerConfig>,
  width: Number,
  height: Number,
  margin: Object,
  sharedAxes: Boolean,
  // 배경 이미지 옵션 추가
  background: {
    image: String,        // 이미지 URL
    opacity: Number,       // 0-1 (기본값: 0.3)
    position: String,     // 'center' | 'cover' | 'contain' | 'repeat'
    size: String,         // 'cover' | 'contain' | 'auto' | '100% 100%'
    repeat: String,       // 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
    color: String,        // 배경색 (이미지 위 오버레이)
    blendMode: String,    // 'normal' | 'multiply' | 'screen' | 'overlay' 등
    // 스타일 효과 (이미지 특성에 맞게)
    style: {
      blur: Number,       // 0-10 (흐리기 효과)
      brightness: Number, // 0-2 (밝기 조절, 기본값: 1)
      contrast: Number,   // 0-2 (대비 조절, 기본값: 1)
      saturation: Number, // 0-2 (채도 조절, 기본값: 1)
      grayscale: Number,  // 0-1 (그레이스케일, 기본값: 0)
      sepia: Number,      // 0-1 (세피아 효과, 기본값: 0)
      hueRotate: Number,  // 0-360 (색상 회전, 기본값: 0)
    },
  },
}
```

#### 3. 배경 렌더링 함수

```javascript
// utils/chartBackground.js
import * as d3 from "d3";

export function renderBackground({ svg, chartGroup, chartWidth, chartHeight, background }) {
    if (!background || !background.image) return;

    // 배경 레이어 그룹 생성 (최하위)
    const bgGroup = svg
        .insert("g", ":first-child") // 첫 번째 요소로 삽입
        .attr("class", "background-layer");

    // 패턴 정의
    const defs = svg.select("defs").empty() ? svg.insert("defs", ":first-child") : svg.select("defs");

    const patternId = "background-pattern";
    const pattern = defs.append("pattern").attr("id", patternId).attr("x", 0).attr("y", 0).attr("width", 1).attr("height", 1).attr("patternUnits", "objectBoundingBox");

    // 이미지 추가
    const image = pattern.append("image").attr("href", background.image).attr("preserveAspectRatio", getPreserveAspectRatio(background.position)).attr("x", 0).attr("y", 0).attr("width", 1).attr("height", 1);

    // 스타일 효과 필터 생성 (이미지 특성에 맞게)
    const filterId = "background-filter";
    const style = background.style || {};
    let hasFilter = false;

    if (style.blur || style.brightness || style.contrast || style.saturation || style.grayscale || style.sepia || style.hueRotate) {
        hasFilter = true;
        const filter = defs.append("filter").attr("id", filterId);

        // 흐리기 효과
        if (style.blur && style.blur > 0) {
            filter.append("feGaussianBlur").attr("stdDeviation", style.blur);
        }

        // 색상 조절 효과들
        const colorMatrix = [];
        if (style.brightness !== undefined && style.brightness !== 1) {
            colorMatrix.push(`brightness(${style.brightness})`);
        }
        if (style.contrast !== undefined && style.contrast !== 1) {
            colorMatrix.push(`contrast(${style.contrast})`);
        }
        if (style.saturation !== undefined && style.saturation !== 1) {
            colorMatrix.push(`saturate(${style.saturation})`);
        }
        if (style.grayscale !== undefined && style.grayscale > 0) {
            colorMatrix.push(`grayscale(${style.grayscale})`);
        }
        if (style.sepia !== undefined && style.sepia > 0) {
            colorMatrix.push(`sepia(${style.sepia})`);
        }
        if (style.hueRotate !== undefined && style.hueRotate !== 0) {
            colorMatrix.push(`hue-rotate(${style.hueRotate}deg)`);
        }

        // CSS 필터를 SVG 필터로 변환 (복잡한 경우)
        // 간단한 경우: feColorMatrix 사용
        if (style.grayscale || style.sepia || style.brightness || style.contrast) {
            // feColorMatrix로 여러 효과 조합
            const colorMatrix = filter.append("feColorMatrix").attr("type", "matrix");

            // 그레이스케일
            if (style.grayscale) {
                const gray = style.grayscale;
                const r = 0.2126 + 0.7874 * (1 - gray);
                const g = 0.7152 + 0.2848 * (1 - gray);
                const b = 0.0722 + 0.9278 * (1 - gray);
                colorMatrix.attr("values", `${r} ${g} ${b} 0 0 ${r} ${g} ${b} 0 0 ${r} ${g} ${b} 0 0 0 0 0 1 0`);
            }
        }
    }

    // 배경 사각형 (차트 영역에 맞춤)
    const bgRect = bgGroup
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("fill", `url(#${patternId})`)
        .attr("opacity", background.opacity || 0.3);

    // 필터 적용
    if (hasFilter) {
        bgRect.attr("filter", `url(#${filterId})`);
    }

    // 배경색 오버레이 (선택적)
    if (background.color) {
        bgGroup
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("fill", background.color)
            .attr("opacity", background.colorOpacity || 0.2)
            .attr("mix-blend-mode", background.blendMode || "normal");
    }

    return bgGroup;
}

function getPreserveAspectRatio(position) {
    const map = {
        center: "xMidYMid slice",
        cover: "xMidYMid slice",
        contain: "xMidYMid meet",
        repeat: "none",
    };
    return map[position] || "xMidYMid slice";
}
```

#### 4. MultiChartContainer에 통합

```javascript
// MultiChartContainer.vue
function renderChart() {
    // ... 기존 코드 ...

    // 1. 배경 렌더링 (최우선)
    if (props.background?.image) {
        renderBackground({
            svg,
            chartGroup: mainGroup,
            chartWidth,
            chartHeight,
            background: props.background,
        });
    }

    // 2. 공유 축 렌더링
    if (sharedAxes) {
        renderSharedAxes(sharedXScale, sharedYScale);
    }

    // 3. 차트 레이어 렌더링
    sortedLayers.forEach((layer) => {
        renderChartLayer(layer, sharedXScale, sharedYScale);
    });
}
```

### 사용 예시

#### 기본 사용법

```vue
<template>
    <MultiChartContainer
        :layers="chartLayers"
        :width="800"
        :height="400"
        :shared-axes="true"
        :background="{
            image: '/images/chart-background.jpg',
            opacity: 0.3,
            position: 'center',
            size: 'cover',
        }"
    />
</template>
```

#### 스타일 효과 적용

```vue
<template>
    <MultiChartContainer
        :layers="chartLayers"
        :background="{
            image: '/images/chart-background.jpg',
            opacity: 0.5,
            position: 'center',
            // 이미지 스타일 효과
            style: {
                blur: 3, // 흐리기 (0-10)
                brightness: 0.8, // 밝기 조절 (0-2)
                contrast: 1.2, // 대비 조절 (0-2)
                saturation: 0.5, // 채도 조절 (0-2, 0=무채색)
                grayscale: 0.3, // 그레이스케일 (0-1)
                sepia: 0.2, // 세피아 효과 (0-1)
                hueRotate: 15, // 색상 회전 (0-360도)
            },
        }"
    />
</template>
```

#### 고급 옵션 (스타일 효과 포함)

```vue
<template>
    <MultiChartContainer
        :layers="chartLayers"
        :background="{
            image: '/images/grid-pattern.png',
            opacity: 0.2,
            position: 'repeat',
            repeat: 'repeat',
            color: '#000000',
            colorOpacity: 0.1,
            blendMode: 'multiply',
            // 이미지 스타일 효과
            style: {
                blur: 1,
                brightness: 0.9,
                contrast: 1.1,
                saturation: 0.8,
            },
        }"
    />
</template>
```

#### 동적 배경 변경 (스타일 포함)

```javascript
const backgroundConfig = ref({
    image: null,
    opacity: 0.3,
    style: {
        blur: 0,
        brightness: 1,
        contrast: 1,
        saturation: 1,
        grayscale: 0,
        sepia: 0,
        hueRotate: 0,
    },
});

// 사용자가 이미지 업로드
function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        backgroundConfig.value.image = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 배경 투명도 조절
function adjustBackgroundOpacity(value) {
    backgroundConfig.value.opacity = value;
}

// 흐리기 효과 조절
function adjustBlur(value) {
    backgroundConfig.value.style.blur = value;
}

// 밝기 조절
function adjustBrightness(value) {
    backgroundConfig.value.style.brightness = value;
}

// 그레이스케일 적용
function applyGrayscale(intensity) {
    backgroundConfig.value.style.grayscale = intensity;
}
```

### 레이어별 배경 (선택적 확장)

각 차트 레이어에 개별 배경을 추가할 수도 있습니다:

```javascript
const chartLayers = [
  {
    type: 'bar',
    data: salesData,
    layerIndex: 0,
    // 레이어별 배경
    background: {
      image: '/images/layer-bg-1.png',
      opacity: 0.1,
    },
    style: { ... },
  },
]
```

### 배경 이미지 스타일 효과 상세

#### 지원하는 스타일 효과

| 효과         | 범위  | 설명                               | 예시                          |
| ------------ | ----- | ---------------------------------- | ----------------------------- |
| `blur`       | 0-10  | 흐리기 정도 (픽셀 단위)            | `blur: 3` - 약간 흐림         |
| `brightness` | 0-2   | 밝기 조절 (1=기본값)               | `brightness: 0.8` - 어둡게    |
| `contrast`   | 0-2   | 대비 조절 (1=기본값)               | `contrast: 1.2` - 대비 증가   |
| `saturation` | 0-2   | 채도 조절 (1=기본값, 0=무채색)     | `saturation: 0.5` - 채도 감소 |
| `grayscale`  | 0-1   | 그레이스케일 (0=컬러, 1=완전 흑백) | `grayscale: 0.5` - 반흑백     |
| `sepia`      | 0-1   | 세피아 효과 (0=없음, 1=최대)       | `sepia: 0.3` - 약간의 세피아  |
| `hueRotate`  | 0-360 | 색상 회전 (도 단위)                | `hueRotate: 180` - 색상 반전  |

#### 스타일 효과 조합 예시

```javascript
// 부드러운 배경 (흐리기 + 채도 감소)
{
  image: '/images/bg.jpg',
  opacity: 0.4,
  style: {
    blur: 5,
    saturation: 0.3,
    brightness: 0.9,
  },
}

// 빈티지 느낌 (세피아 + 그레이스케일)
{
  image: '/images/bg.jpg',
  opacity: 0.5,
  style: {
    sepia: 0.4,
    grayscale: 0.2,
    contrast: 1.1,
  },
}

// 미니멀한 배경 (강한 흐리기 + 무채색)
{
  image: '/images/bg.jpg',
  opacity: 0.2,
  style: {
    blur: 8,
    grayscale: 1,
    brightness: 1.2,
  },
}

// 강조된 배경 (대비 증가 + 채도 증가)
{
  image: '/images/bg.jpg',
  opacity: 0.6,
  style: {
    contrast: 1.3,
    saturation: 1.2,
    brightness: 1.1,
  },
}
```

### 성능 고려사항

1. **이미지 최적화**

    - 적절한 해상도 사용 (차트 크기에 맞춤)
    - WebP 형식 권장
    - 이미지 캐싱 활용

2. **렌더링 최적화**

    - 배경은 한 번만 렌더링
    - 리사이즈 시에만 재렌더링
    - 이미지 로딩 완료 후 렌더링
    - 스타일 효과는 SVG 필터로 처리 (GPU 가속 가능)

3. **메모리 관리**

    ```javascript
    // 이미지 로드 완료 후 렌더링
    const img = new Image();
    img.onload = () => {
        renderChart(); // 이미지 로드 완료 후 차트 렌더링
    };
    img.src = background.image;
    ```

4. **스타일 효과 성능**
    - `blur` 효과는 가장 비용이 큼 (값이 클수록 느림)
    - 여러 효과 조합 시 성능 저하 가능
    - 실시간 조절 시 `requestAnimationFrame` 사용 권장

### 결론

✅ **배경 이미지 기능은 언제든지 추가 가능합니다!**

**이유**:

1. 레이어 기반 구조로 배경을 최하위 레이어로 쉽게 추가 가능
2. SVG `<pattern>`과 `<image>` 요소로 구현 간단
3. 기존 구조에 영향 없이 확장 가능
4. 배경 옵션을 props로 추가하면 즉시 사용 가능

**추가 시점**:

-   Phase 1 (공통 유틸리티) 이후 언제든지 추가 가능
-   또는 Phase 2 (레이어 구조) 구현 시 함께 추가 가능
-   필요할 때 점진적으로 추가해도 무방
