# D3.js 차트 구현 지침서

NEXA Platform에서 D3.js를 사용한 차트 구현 시 따라야 할 핵심 패턴과 주의사항입니다.

---

## 📐 차트 중앙 정렬 핵심 패턴

차트가 컨테이너에 정확히 중앙에 위치하고 잘리지 않게 하기 위한 필수 패턴입니다.

### 1. 반응형 Margin 설정

화면 크기에 따라 마진을 동적으로 조정하는 것이 중요합니다. 큰 화면에서는 충분한 마진이 필요하지만, 작은 화면에서는 마진이 너무 크면 차트 영역이 줄어듭니다.

```javascript
// 동적 margin 계산을 위한 기본값
const titleHeight = 30 // 차트 제목 높이
const xAxisTickLabelHeight = 60 // X축 틱 라벨 회전 시 필요한 공간 (45도 회전)
const xAxisLabelHeight = 120 // X축 필드명 라벨 높이 (충분한 공간 확보 필수!)
const yAxisLabelWidth = 80 // Y축 라벨 너비 (회전된 텍스트)
const yAxisTickLabelWidth = 50 // Y축 틱 라벨 최대 너비

// 반응형 margin 계산 함수 (화면 크기에 따라 조정)
const getResponsiveMargin = (width) => {
  // 기본 마진 값
  let rightMargin = 120
  let leftMargin = yAxisTickLabelWidth + yAxisLabelWidth + 10
  let bottomMargin = xAxisTickLabelHeight + xAxisLabelHeight + 15
  const topMargin = titleHeight + 10

  // 화면 크기별 마진 조정
  if (width < 600) {
    // 작은 화면 (< 600px) - 모바일
    rightMargin = Math.max(20, width * 0.05) // 화면 너비의 5% 또는 최소 20px
    leftMargin = Math.max(60, width * 0.1) // 화면 너비의 10% 또는 최소 60px
    bottomMargin = xAxisTickLabelHeight + Math.max(80, xAxisLabelHeight * 0.7) + 10
  } else if (width < 1024) {
    // 중간 화면 (600px ~ 1024px) - 태블릿
    rightMargin = Math.max(60, width * 0.08) // 화면 너비의 8% 또는 최소 60px
    leftMargin = Math.max(70, width * 0.12) // 화면 너비의 12% 또는 최소 70px
  } else if (width < 1440) {
    // 큰 화면 (1024px ~ 1440px) - 작은 데스크톱
    rightMargin = 100
    leftMargin = yAxisTickLabelWidth + yAxisLabelWidth + 10
  }
  // 매우 큰 화면 (≥ 1440px) - 데스크톱
  // 기본값 유지 (rightMargin: 120)

  return {
    top: topMargin,
    right: Math.round(rightMargin),
    bottom: Math.round(bottomMargin),
    left: Math.round(leftMargin),
  }
}

// 반응형 margin 계산
const margin = getResponsiveMargin(containerWidth)
```

**핵심 포인트:**

- **반응형 알고리즘**: 화면 크기에 따라 마진을 동적으로 조정
- **작은 화면 (< 600px)**: 마진을 화면 너비의 비율로 축소 (최소값 보장)
- **중간 화면 (600px ~ 1024px)**: 적절한 마진 유지
- **큰 화면 (1024px ~ 1440px)**: 충분한 마진
- **매우 큰 화면 (≥ 1440px)**: 최대 마진 유지 (120px)
- **최소값 보장**: `Math.max()`를 사용하여 최소한의 마진 보장
- 모든 margin 값은 실제 라벨/요소 크기를 고려하여 설정

**Breakpoint 기준:**

- 작은 화면: `< 600px` (모바일)
- 중간 화면: `600px ~ 1024px` (태블릿)
- 큰 화면: `1024px ~ 1440px` (작은 데스크톱)
- 매우 큰 화면: `≥ 1440px` (데스크톱)

### 2. SVG 크기 = 컨테이너 크기 (표준 패턴)

```javascript
// 컨테이너 크기
const containerWidth = container.clientWidth || 800
const containerHeight = container.clientHeight || 400

// SVG 크기 = 컨테이너 크기 (표준 패턴)
const svgWidth = containerWidth
const svgHeight = containerHeight

// SVG 생성
svg = d3
  .select(chartSvgRef.value)
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight)
  .style('overflow', 'visible') // 차트가 잘리지 않도록
  .style('display', 'block')
```

### 3. 차트 영역 크기 계산

```javascript
// 차트 그리기 영역 크기 = SVG 크기 - margin
const chartWidth = Math.max(0, svgWidth - margin.left - margin.right)
const chartHeight = Math.max(0, svgHeight - margin.top - margin.bottom)

// 차트 그룹 생성 (margin.left, margin.top으로 이동)
chartGroup = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)
```

### 4. CSS Padding 제거

```scss
.chart-container {
  padding: 0; // 명시적으로 0으로 설정
  box-sizing: border-box;

  // 모든 여백은 D3.js margin으로 관리
  // CSS padding과 D3.js margin이 충돌하면 크기 계산 오류 발생
}
```

---

## 🎨 D3.js Axis 활용 가이드

### 눈금만 표시하고 경계선은 제거

```javascript
// Y축 눈금 생성
const yAxis = d3.axisLeft(yScale).tickSize(5) // 눈금 길이 설정
const yAxisGroup = chartGroup.append('g').attr('class', 'y-axis').call(yAxis)

// path 제거 (도메인 경계선), line(눈금)은 유지
yAxisGroup.select('path').remove()
// line 요소는 자동으로 눈금을 그려줌 - 제거하지 않음!
```

**핵심:**

- D3.js axis는 자동으로 `path`(경계선)와 `line`(눈금)을 생성
- 경계선만 제거하고 눈금은 유지하려면 `path`만 제거
- `tickSize()`로 눈금 길이 조절 가능

### X축과 Y축 스타일 분리

```scss
// X축: 눈금 숨김 (막대 차트의 경우)
:deep(.x-axis) {
  line {
    display: none;
  }

  text {
    fill: $chart-axis-color;
  }
}

// Y축: 눈금 표시
:deep(.y-axis) {
  line {
    stroke: $chart-axis-color;
    stroke-width: 1px;
  }

  text {
    fill: $chart-axis-color;
  }
}
```

---

## 🎯 스타일 관리 패턴

### CSS 변수화로 일괄 관리

```scss
<style lang="scss" scoped>
// 차트 축 및 보더 색상 변수 (블랙톤 - 강조되지 않게)
$chart-axis-color: #666666; // 한 곳에서 색상 통제

// 모든 축 요소에 변수 적용
:deep(.x-axis),
:deep(.y-axis) {
  text {
    fill: $chart-axis-color;
  }
}

:deep(.y-axis) {
  line {
    stroke: $chart-axis-color;
  }
}

:deep(.chart-border) {
  stroke: $chart-axis-color;
}
</style>
```

**장점:**

- 한 곳에서 색상 변경 시 전체 적용
- 일관성 유지 용이
- 테마 변경 시 편리

### 인라인 스타일 제거

```javascript
// ❌ 나쁜 예: 인라인 스타일 사용
.attr('fill', '#333')
.attr('stroke', '#000')

// ✅ 좋은 예: CSS 클래스로 관리
.attr('class', 'axis-label')
// CSS에서 스타일 정의
```

---

## ⚠️ 자주 발생하는 실수와 해결

### 1. Margin 부족으로 인한 잘림

**문제:**

```javascript
margin.right: 20  // 너무 작음
xAxisLabelHeight: 20  // 너무 작음
```

**결과:** 차트가 오른쪽/하단으로 잘림

**해결:**

```javascript
margin.right: 120  // 충분한 여유 공간
xAxisLabelHeight: 120  // 라벨 길이 고려
```

### 2. CSS Padding과 D3.js Margin 충돌

**문제:**

```scss
.chart-container {
  padding: 20px; // CSS padding
}
```

**결과:** D3.js의 `clientWidth/clientHeight`가 패딩을 포함하지 않아 크기 계산 오류

**해결:**

```scss
.chart-container {
  padding: 0; // padding 제거
  // 모든 여백은 D3.js margin으로 관리
}
```

### 3. 복잡한 접근으로 인한 불필요한 작업

**문제:**

- path의 `d` 속성을 직접 수정
- `axisRight()`로 오른쪽 라인 그리기 시도
- `line` 요소 직접 생성

**해결:**

```javascript
// 간단하고 명확한 방법
const yAxis = d3.axisLeft(yScale).tickSize(5)
yAxisGroup.select('path').remove() // 경계선만 제거
// line(눈금)은 자동으로 유지됨
```

### 4. 라이브러리 기본 동작 미확인

**문제:** D3.js axis의 기본 동작을 확인하지 않고 복잡하게 접근

**해결:**

- 라이브러리 문서 먼저 확인
- 간단한 방법부터 시도
- 기본 제공 기능 우선 활용

---

## 📋 체크리스트

새로운 차트를 구현할 때 다음을 확인하세요:

### 크기 및 위치

- [ ] **반응형 margin 알고리즘**이 구현되었는가?
- [ ] 작은 화면에서 마진이 적절히 축소되는가?
- [ ] 큰 화면에서 충분한 마진이 유지되는가?
- [ ] `margin.right`가 충분히 크게 설정되었는가? (큰 화면: 120px 이상)
- [ ] `xAxisLabelHeight`가 실제 라벨 길이를 고려했는가?
- [ ] CSS `padding`이 0으로 설정되었는가?
- [ ] SVG 크기가 컨테이너와 동일하게 설정되었는가?
- [ ] `overflow: visible`이 설정되었는가?

### Axis 설정

- [ ] 경계선만 제거하려면 `path`만 제거하는가?
- [ ] 눈금은 `line` 요소로 자동 생성되므로 제거하지 않는가?
- [ ] `tickSize()`로 눈금 길이를 적절히 설정했는가?

### 스타일 관리

- [ ] 색상이 SCSS 변수로 관리되고 있는가?
- [ ] 인라인 스타일이 최소화되었는가?
- [ ] CSS 클래스로 스타일을 통제하고 있는가?

### 차트 개발 구조

- [ ] 데이터 가공이 별도로 분리되어 있는가? (computed property)
- [ ] SVG 구조 생성과 스타일이 분리되어 있는가?
- [ ] CSS와 JavaScript 역할 분담이 명확한가?
- [ ] 고정 스타일은 CSS로, 동적 스타일은 JavaScript로 구현했는가?

### UX/인터랙티브 요소

- [ ] 기본 시각 효과는 CSS로 처리했는가? (`transition`, `:hover`)
- [ ] 복잡한 인터랙션은 JavaScript로 처리했는가? (툴팁, 클릭)
- [ ] 데이터 기반 동적 변경은 JavaScript로 처리했는가?
- [ ] CSS와 JavaScript 중복이 최소화되었는가?

### 디버깅

- [ ] 보더를 임시로 추가하여 영역을 확인했는가?
- [ ] 브라우저 개발자 도구로 요소 크기를 확인했는가?

---

## 🔧 실전 예제

### 기본 막대 차트 구조

```javascript
function renderBarChart(chartWidth, chartHeight) {
  // 1. 스케일 설정
  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => String(d.x)))
    .range([0, chartWidth])
    .padding(0.2)

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.y) * 1.1])
    .range([chartHeight, 0])

  // 2. 막대 그리기
  chartGroup
    .selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d) => xScale(String(d.x)))
    .attr('y', (d) => yScale(d.y))
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => chartHeight - yScale(d.y))

  // 3. X축 (눈금 제거)
  const xAxis = d3.axisBottom(xScale)
  const xAxisGroup = chartGroup.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${chartHeight})`).call(xAxis)
  xAxisGroup.select('path').remove()
  xAxisGroup.selectAll('line').remove()

  // 4. Y축 (눈금 표시)
  const yAxis = d3.axisLeft(yScale).tickSize(5)
  const yAxisGroup = chartGroup.append('g').attr('class', 'y-axis').call(yAxis)
  yAxisGroup.select('path').remove() // 경계선만 제거
  // line(눈금)은 자동으로 유지됨
}
```

---

## 🏗️ 차트 개발 구조 및 역할 분담

차트를 구현할 때는 **데이터 가공 → SVG 구조 → CSS 스타일 → 인터랙티브 기능** 순서로 접근하며, 각 부분의 역할을 명확히 분리해야 합니다.

### 1. 데이터 가공 (JavaScript) - 가장 먼저

**역할:**

- 원본 데이터를 차트에 적합한 형태로 변환
- 필터링, 그룹화, 집계(SUM, AVG, COUNT 등)
- 형식 변환 (날짜, 숫자 등)

**위치:** Vue `computed` property 또는 함수

```javascript
// 예시: 데이터 집계
const processedData = computed(() => {
  if (!props.data || props.data.length === 0) return []

  // 그룹화 및 집계
  const grouped = d3.group(props.data, (d) => d[xField.value])
  return Array.from(grouped, ([key, values]) => ({
    x: key,
    y: d3.sum(values, (d) => d[yField.value]),
    count: values.length,
    originalRows: values,
  }))
})
```

**핵심:** 데이터가 준비되지 않으면 차트 렌더링 불가

---

### 2. SVG 구조 생성 (JavaScript/D3.js)

**역할:**

- SVG 요소 생성: `rect`, `circle`, `path`, `text` 등
- 위치/크기 계산: `x`, `y`, `width`, `height`, `cx`, `cy`, `r`, `d`
- 스케일 계산: `xScale`, `yScale`, `colorScale`
- 레이아웃 구성: 그룹화, 변환

**위치:** `renderChart()` 또는 차트별 렌더링 함수

```javascript
// 예시: 막대 차트 구조
function renderBarChart(chartWidth, chartHeight) {
  // 1. 스케일 설정
  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => String(d.x)))
    .range([0, chartWidth])

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.y)])
    .range([chartHeight, 0])

  // 2. SVG 요소 생성
  chartGroup
    .selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar') // ✅ CSS 제어용 클래스 지정
    .attr('x', (d) => xScale(String(d.x))) // 동적 위치
    .attr('y', (d) => yScale(d.y)) // 동적 위치
    .attr('width', xScale.bandwidth()) // 동적 크기
    .attr('height', (d) => chartHeight - yScale(d.y)) // 동적 크기
}
```

**핵심:** SVG 구조는 JavaScript로 생성하되, 스타일은 CSS 클래스로 연결

---

### 3. 시각적 스타일 (CSS/SCSS)

**역할:**

- 색상, 폰트, 기본 스타일 정의
- 기본 opacity, cursor 설정
- 간단한 전환 효과 (`transition`)
- 테마 및 색상 변수 관리

**위치:** 별도 SCSS 파일 또는 `<style>` 블록

```scss
// DataChartRenderer.scss

// 색상 변수 정의
$chart-bar-color: #2196f3;
$chart-text-color: #333;
$chart-axis-color: #666666;

// 막대 차트 스타일
:deep(.bar) {
  fill: $chart-bar-color;
  opacity: 0.8;
  cursor: pointer;
  transition:
    opacity 0.2s,
    stroke-width 0.2s;
}

// 호버 기본 효과 (간단한 경우)
:deep(.bar:hover) {
  opacity: 1;
}

// 축 라벨 스타일
:deep(.x-axis text),
:deep(.y-axis text) {
  fill: $chart-axis-color;
  font-size: 11px;
}
```

**핵심:** 고정된 스타일은 CSS로, 동적 계산이 필요한 스타일은 JavaScript로

---

### 4. 인터랙티브 기능 (JavaScript 이벤트)

**역할:**

- 호버 효과 (opacity, stroke 변경)
- 툴팁 표시 및 위치 조정
- 클릭 이벤트 처리
- 복잡한 애니메이션
- 데이터 기반 동적 변경

**위치:** D3.js 이벤트 핸들러 (`.on()`)

```javascript
// 예시: 인터랙티브 기능
bars
  .on('mouseenter', function (event, d) {
    // 호버 효과 (동적 변경 필요)
    d3.select(this).attr('opacity', 1).attr('stroke', '#000').attr('stroke-width', 2)

    // 툴팁 표시 (위치 계산 필요)
    tooltip
      .html(`값: ${d.y}`)
      .style('display', 'block')
      .style('opacity', 1)
      .style('left', event.clientX + 10 + 'px')
      .style('top', event.clientY - 10 + 'px')
  })
  .on('mouseleave', function () {
    d3.select(this).attr('opacity', 0.8).attr('stroke', 'none')
    tooltip.style('opacity', 0).style('display', 'none')
  })
  .on('click', function (event, d) {
    // 이벤트 전달
    emit('data-click', d)
  })
```

**핵심:** 데이터 기반 변경이나 복잡한 로직은 JavaScript로 처리

---

## 🎨 UX/인터랙티브 요소 구현 가이드

멋진 UX를 위한 디자인과 인터랙티브 요소를 구현할 때, **어떤 기능을 어디에 구현해야 할지** 명확히 구분해야 합니다.

### CSS로 처리해야 할 것

#### ✅ 기본 시각 효과

- 색상 (고정값)
- 폰트 (size, weight, family)
- 기본 opacity
- cursor
- 기본 stroke-width
- 간단한 호버 효과

```scss
// ✅ 좋은 예: CSS로 처리
:deep(.bar) {
  fill: $chart-bar-color;
  opacity: 0.8;
  cursor: pointer;
  transition: opacity 0.2s;
}

:deep(.bar:hover) {
  opacity: 1;
  stroke-width: 2px;
}
```

**장점:**

- 성능이 좋음 (브라우저 최적화)
- 코드가 간결함
- 테마 변경에 유리

---

### JavaScript로 처리해야 할 것

#### ✅ 데이터 기반 동적 변경

- 데이터 값에 따른 색상 변경
- 조건부 스타일
- 동적 위치/크기 계산

```javascript
// ✅ JavaScript로 처리 (데이터 기반)
.attr('fill', d => colorScale(d.x))  // 데이터 값에 따라 색상 변경
.attr('opacity', d => d.y > threshold ? 1 : 0.5)  // 조건부 스타일
.attr('x', d => xScale(d.x))  // 동적 위치
```

#### ✅ 복잡한 인터랙션

- 툴팁 (위치 계산, 내용 동적 생성)
- 클릭 액션 (이벤트 전달)
- 다른 요소 강조 (필터링 등)

```javascript
// ✅ JavaScript로 처리 (복잡한 인터랙션)
.on('mouseenter', function(event, d) {
  // 툴팁 내용 동적 생성
  tooltip.html(`
    <div>${xField}: ${d.x}</div>
    <div>${yField}: ${d.y}</div>
  `)
  // 위치 계산 (마우스 위치 기반)
  .style('left', event.clientX + 10 + 'px')
  .style('top', event.clientY - 10 + 'px')
})

.on('click', function(event, d) {
  // 이벤트 전달
  emit('data-click', d)
})
```

#### ✅ 복잡한 애니메이션

- 데이터 변경 시 애니메이션
- 순차적 애니메이션
- 사용자 인터랙션 기반 애니메이션

```javascript
// ✅ JavaScript로 처리 (복잡한 애니메이션)
bars
  .transition()
  .duration(800)
  .ease(d3.easeCubicOut)
  .attr('y', (d) => yScale(d.y))
  .attr('height', (d) => chartHeight - yScale(d.y))
```

**장점:**

- 데이터 기반 처리 가능
- 복잡한 로직 구현 가능
- 동적 위치/크기 계산 가능

---

### 권장 구현 패턴

#### 패턴 1: 기본 스타일 + 간단한 호버 → CSS

```javascript
// JavaScript: SVG 구조 생성
bars
  .append('rect')
  .attr('class', 'bar') // ✅ CSS 제어용 클래스
  .attr('x', (d) => xScale(d.x))
  .attr('y', (d) => yScale(d.y))
```

```scss
// CSS: 기본 스타일 + 호버
:deep(.bar) {
  fill: $chart-bar-color;
  opacity: 0.8;
  cursor: pointer;
  transition: opacity 0.2s;
}

:deep(.bar:hover) {
  opacity: 1;
}
```

#### 패턴 2: 동적 색상 → JavaScript

```javascript
// JavaScript: 데이터 기반 색상
bars
  .append('rect')
  .attr('class', 'bar')
  .attr('fill', (d) => colorScale(d.x)) // ✅ 데이터 기반
  .attr('x', (d) => xScale(d.x))
```

```scss
// CSS: 기본 스타일만 (색상은 JavaScript에서)
:deep(.bar) {
  opacity: 0.8;
  cursor: pointer;
}
```

#### 패턴 3: 복잡한 인터랙션 → JavaScript

```javascript
// JavaScript: 툴팁 + 복잡한 호버 효과
bars
  .on('mouseenter', function (event, d) {
    // 호버 효과
    d3.select(this).attr('opacity', 1).attr('stroke', '#000')

    // 툴팁 표시 (위치 계산)
    tooltip
      .html(`값: ${d.y}`)
      .style('left', event.clientX + 10 + 'px')
      .style('top', event.clientY - 10 + 'px')
  })
  .on('mouseleave', function () {
    d3.select(this).attr('opacity', 0.8)
    tooltip.style('opacity', 0)
  })
```

```scss
// CSS: 기본 스타일만
:deep(.bar) {
  cursor: pointer;
}
```

---

### 구현 위치 결정 가이드

| 기능              | CSS | JavaScript | 이유                 |
| ----------------- | --- | ---------- | -------------------- |
| 고정 색상         | ✅  | ❌         | CSS 변수로 관리 용이 |
| 데이터 기반 색상  | ❌  | ✅         | 계산 필요            |
| 기본 opacity      | ✅  | ❌         | 고정값               |
| 호버 opacity 변경 | ✅  | ❌         | 간단한 효과          |
| 툴팁 표시         | ❌  | ✅         | 위치 계산 필요       |
| 클릭 이벤트       | ❌  | ✅         | 로직 처리 필요       |
| 간단한 transition | ✅  | ❌         | CSS 성능 좋음        |
| 복잡한 애니메이션 | ❌  | ✅         | 데이터 기반 계산     |
| cursor 변경       | ✅  | ❌         | 고정값               |
| 동적 위치/크기    | ❌  | ✅         | 계산 필요            |

---

### 실전 예제: 막대 차트 인터랙티브 구현

```javascript
// 1. SVG 구조 생성 (JavaScript)
const bars = chartGroup
  .selectAll('.bar')
  .data(data)
  .enter()
  .append('rect')
  .attr('class', 'bar') // ✅ CSS 제어용 클래스
  .attr('x', (d) => xScale(d.x))
  .attr('y', (d) => yScale(d.y))
  .attr('width', xScale.bandwidth())
  .attr('height', (d) => chartHeight - yScale(d.y))
  // 동적 색상은 JavaScript에서
  .attr('fill', (d) => colorScale(d.x))

// 2. 인터랙티브 기능 (JavaScript)
bars
  .on('mouseenter', function (event, d) {
    // 호버 효과
    d3.select(this).attr('opacity', 1).attr('stroke', '#000').attr('stroke-width', 2)

    // 툴팁 표시
    tooltip
      .html(`값: ${d.y}`)
      .style('display', 'block')
      .style('opacity', 1)
      .style('left', event.clientX + 10 + 'px')
      .style('top', event.clientY - 10 + 'px')
  })
  .on('mouseleave', function () {
    d3.select(this).attr('opacity', 0.8).attr('stroke', 'none')
    tooltip.style('opacity', 0)
  })
  .on('click', function (event, d) {
    emit('data-click', d)
  })
```

```scss
// 3. 기본 스타일 (CSS)
:deep(.bar) {
  opacity: 0.8;
  cursor: pointer;
  transition:
    opacity 0.2s,
    stroke-width 0.2s;
}

// 호버 효과는 JavaScript에서 처리하므로
// CSS 호버는 선택적 (중복되어도 괜찮음)
```

---

## 💡 핵심 교훈

1. **반응형 Margin 설정이 가장 중요하다**

   - 화면 크기에 따라 마진을 동적으로 조정
   - 작은 화면: 마진 축소 (비율 기반, 최소값 보장)
   - 큰 화면: 충분한 마진 유지
   - 실제 요소 크기를 고려하여 설정

2. **CSS와 D3.js Margin을 분리하라**

   - CSS padding은 0으로 설정
   - 모든 여백은 D3.js margin으로 관리

3. **라이브러리 기본 동작을 먼저 이해하라**

   - D3.js axis의 path와 line 구분
   - 간단한 방법부터 시도

4. **스타일은 CSS로 통제하라**

   - SCSS 변수로 일괄 관리
   - 인라인 스타일 최소화

5. **디버깅 도구를 활용하라**

   - 보더로 영역 확인
   - 개발자 도구로 크기 검증
   - 다양한 화면 크기에서 테스트

6. **역할 분담을 명확히 하라**

   - 데이터 가공 → JavaScript (computed)
   - SVG 구조 → JavaScript (D3.js)
   - 시각적 스타일 → CSS/SCSS
   - 인터랙티브 기능 → JavaScript (이벤트 핸들러)
   - 데이터 기반 동적 변경은 JavaScript로, 고정 스타일은 CSS로

7. **UX/인터랙티브 요소는 적절한 위치에 구현하라**

   - 기본 시각 효과 → CSS (`transition`, `:hover`)
   - 복잡한 인터랙션 → JavaScript (툴팁, 애니메이션, 이벤트)
   - 데이터 기반 동적 변경 → JavaScript (색상, 위치, 크기)

---

## ⚡ 실시간 데이터 시각화

### IoT 기기 데이터 실시간 시각화

#### 가능 여부: ✅ **완전히 가능**

D3.js는 IoT 기기에서 측정되는 센서 데이터를 실시간으로 시각화하는 데 매우 적합합니다.

**적합성 평가:**

| 항목            | 평가       | 설명                                                     |
| --------------- | ---------- | -------------------------------------------------------- |
| **성능**        | ⭐⭐⭐⭐   | 최적화 시 60fps 유지 가능 (데이터 포인트 수에 따라 다름) |
| **실시간 처리** | ⭐⭐⭐⭐⭐ | WebSocket과 결합 시 매우 우수                            |
| **확장성**      | ⭐⭐⭐⭐   | 데이터 버퍼링 및 샘플링으로 대용량 처리 가능             |
| **유연성**      | ⭐⭐⭐⭐⭐ | 다양한 차트 타입 지원 (라인, 바, 스캐터 등)              |
| **인터랙티브**  | ⭐⭐⭐⭐⭐ | 줌, 팬, 필터링 등 고급 기능 구현 가능                    |

**구현 방법:**

```javascript
// 1. WebSocket 연결 (부모 컴포넌트에서)
import { ref, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'

const socket = ref(null)
const realTimeData = ref([])
const maxDataPoints = 100 // 최대 표시할 데이터 포인트 수

onMounted(() => {
  socket.value = io('ws://iot-device-server:3000')

  socket.value.on('sensor-data', (data) => {
    // 새 데이터 추가
    realTimeData.value.push({
      timestamp: Date.now(),
      temperature: data.temperature,
      humidity: data.humidity,
      pressure: data.pressure,
    })

    // 최대 포인트 수 제한 (슬라이딩 윈도우)
    if (realTimeData.value.length > maxDataPoints) {
      realTimeData.value.shift() // 오래된 데이터 제거
    }
  })
})

onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect()
  }
})
```

```javascript
// 2. D3.js 실시간 차트 업데이트 (DataChartRenderer.vue 내부)
function updateRealTimeChart(newData) {
  // 기존 요소 선택 (키 함수로 데이터 식별)
  const circles = chartGroup.selectAll('.data-point').data(newData, (d) => d.timestamp) // 타임스탬프로 식별

  // 새 요소 추가
  circles
    .enter()
    .append('circle')
    .attr('class', 'data-point')
    .attr('r', 0)
    .attr('fill', '#00ff00')
    .merge(circles) // 기존 + 새 요소 병합
    .transition()
    .duration(100) // 빠른 전환
    .ease(d3.easeLinear)
    .attr('cx', (d) => xScale(d.timestamp))
    .attr('cy', (d) => yScale(d.temperature))
    .attr('r', 4)

  // 오래된 요소 제거
  circles.exit().transition().duration(100).attr('r', 0).remove()

  // 라인 업데이트
  const line = d3
    .line()
    .x((d) => xScale(d.timestamp))
    .y((d) => yScale(d.temperature))
    .curve(d3.curveMonotoneX)

  chartGroup.select('.real-time-line').datum(newData).attr('d', line)
}

// 3. 데이터 변경 감지 및 차트 업데이트
watch(
  () => props.rows, // realTimeData를 props로 전달
  (newData) => {
    if (newData.length > 0) {
      updateRealTimeChart(newData)
    }
  },
  { deep: true },
)
```

**성능 최적화 전략:**

```javascript
// 1. RequestAnimationFrame 사용 (60fps 제한)
let animationFrameId = null
let pendingUpdate = false

function scheduleUpdate() {
  if (!pendingUpdate) {
    pendingUpdate = true
    animationFrameId = requestAnimationFrame(() => {
      updateRealTimeChart(realTimeData.value)
      pendingUpdate = false
    })
  }
}

// 2. 데이터 샘플링 (고주파 데이터의 경우)
function sampleData(data, maxPoints = 100) {
  if (data.length <= maxPoints) return data

  const step = Math.ceil(data.length / maxPoints)
  return data.filter((d, i) => i % step === 0)
}

// 3. 디바운싱 (너무 빠른 업데이트 방지)
let updateTimer = null
function debouncedUpdate(data) {
  clearTimeout(updateTimer)
  updateTimer = setTimeout(() => {
    updateRealTimeChart(data)
  }, 16) // ~60fps
}
```

---

### 사운드 DSP 데이터 실시간 시각화

#### 가능 여부: ✅ **가능하지만 주의사항 있음**

사운드 DSP 데이터(주파수 스펙트럼, 파형 등)를 실시간으로 시각화하는 것도 가능하지만, **고주파 데이터 특성상 성능 최적화가 중요**합니다.

**적합성 평가:**

| 항목            | 평가       | 설명                                                           |
| --------------- | ---------- | -------------------------------------------------------------- |
| **성능**        | ⭐⭐⭐     | 고주파 데이터는 최적화 필수 (FFT 결과는 보통 1024-4096 포인트) |
| **실시간 처리** | ⭐⭐⭐⭐   | Web Audio API와 결합 시 우수                                   |
| **확장성**      | ⭐⭐⭐     | 데이터 샘플링 및 다운샘플링 필요                               |
| **유연성**      | ⭐⭐⭐⭐⭐ | 스펙트럼, 파형, 워터폴 등 다양한 시각화 가능                   |
| **인터랙티브**  | ⭐⭐⭐⭐   | 주파수 필터링, 줌 등 구현 가능                                 |

**구현 방법:**

```javascript
// 1. Web Audio API로 오디오 분석 (부모 컴포넌트)
import { ref, onMounted } from 'vue'

const audioContext = ref(null)
const analyser = ref(null)
const frequencyData = ref(new Uint8Array(1024)) // FFT 크기
const waveformData = ref(new Uint8Array(1024))

onMounted(async () => {
  // 오디오 컨텍스트 생성
  audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
  analyser.value = audioContext.value.createAnalyser()
  analyser.value.fftSize = 2048 // FFT 크기 설정

  // 마이크 입력 (또는 오디오 소스)
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    const source = audioContext.value.createMediaStreamSource(stream)
    source.connect(analyser.value)

    // 실시간 분석 루프
    updateAudioData()
  })
})

function updateAudioData() {
  if (!analyser.value) return

  // 주파수 데이터 업데이트
  const freqData = new Uint8Array(analyser.value.frequencyBinCount)
  analyser.value.getByteFrequencyData(freqData)
  frequencyData.value = Array.from(freqData)

  // 파형 데이터 업데이트
  const waveData = new Uint8Array(analyser.value.frequencyBinCount)
  analyser.value.getByteTimeDomainData(waveData)
  waveformData.value = Array.from(waveData)

  // 다음 프레임 요청
  requestAnimationFrame(updateAudioData)
}
```

```javascript
// 2. D3.js로 스펙트럼 시각화 (DataChartRenderer.vue)
function renderSpectrumChart(frequencyData) {
  const data = frequencyData.map((value, index) => ({
    frequency: index,
    amplitude: value,
  }))

  // X축: 주파수 (0 ~ Nyquist frequency)
  const xScale = d3.scaleLinear().domain([0, frequencyData.length]).range([0, chartWidth])

  // Y축: 진폭 (0 ~ 255)
  const yScale = d3.scaleLinear().domain([0, 255]).range([chartHeight, 0])

  // 막대 업데이트 (실시간)
  const bars = chartGroup.selectAll('.spectrum-bar').data(data)

  bars
    .enter()
    .append('rect')
    .attr('class', 'spectrum-bar')
    .attr('x', (d) => xScale(d.frequency))
    .attr('width', chartWidth / frequencyData.length)
    .merge(bars)
    .transition()
    .duration(50) // 빠른 업데이트
    .ease(d3.easeLinear)
    .attr('y', (d) => yScale(d.amplitude))
    .attr('height', (d) => chartHeight - yScale(d.amplitude))
    .attr('fill', (d) => {
      // 진폭에 따른 색상 (네온 효과)
      const intensity = d.amplitude / 255
      return d3.interpolateViridis(intensity)
    })

  bars.exit().remove()
}

// 3. 파형 시각화
function renderWaveformChart(waveformData) {
  const data = waveformData.map((value, index) => ({
    sample: index,
    amplitude: (value - 128) / 128, // -1 ~ 1로 정규화
  }))

  const xScale = d3.scaleLinear().domain([0, waveformData.length]).range([0, chartWidth])

  const yScale = d3.scaleLinear().domain([-1, 1]).range([chartHeight, 0])

  const line = d3
    .line()
    .x((d) => xScale(d.sample))
    .y((d) => yScale(d.amplitude))
    .curve(d3.curveLinear)

  chartGroup.select('.waveform-line').datum(data).attr('d', line).attr('stroke', '#00ff00').attr('stroke-width', 2).attr('fill', 'none')
}
```

**성능 최적화 (사운드 데이터):**

```javascript
// 1. 다운샘플링 (고주파 데이터 축소)
function downsampleFrequencyData(data, targetSize = 256) {
  if (data.length <= targetSize) return data

  const step = Math.ceil(data.length / targetSize)
  const downsampled = []

  for (let i = 0; i < targetSize; i++) {
    const start = i * step
    const end = Math.min(start + step, data.length)
    // 구간 평균 계산
    const avg = data.slice(start, end).reduce((a, b) => a + b, 0) / (end - start)
    downsampled.push(avg)
  }

  return downsampled
}

// 2. 프레임 스킵 (60fps 유지)
let frameCount = 0
function updateSpectrumWithFrameSkip(frequencyData) {
  frameCount++
  if (frameCount % 2 === 0) return // 30fps로 제한

  renderSpectrumChart(frequencyData)
}

// 3. Canvas 사용 (SVG보다 빠름, 대량 데이터)
function renderSpectrumWithCanvas(frequencyData) {
  const canvas = d3.select('#spectrum-canvas').node()
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#00ff00'

  const barWidth = width / frequencyData.length

  frequencyData.forEach((value, i) => {
    const barHeight = (value / 255) * height
    ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight)
  })
}
```

---

### 실시간 시각화 최적화 체크리스트

#### 데이터 처리

- [ ] **데이터 버퍼링**: 최대 포인트 수 제한 (슬라이딩 윈도우)
- [ ] **샘플링**: 고주파 데이터는 다운샘플링 적용
- [ ] **디바운싱**: 너무 빠른 업데이트 방지

#### 렌더링 최적화

- [ ] **RequestAnimationFrame**: 60fps 제한
- [ ] **데이터 키 함수**: 효율적인 업데이트 (enter/update/exit)
- [ ] **전환 최소화**: 실시간 데이터는 transition 제거 또는 최소화
- [ ] **Canvas 고려**: 대량 데이터는 SVG 대신 Canvas 사용

#### 메모리 관리

- [ ] **오래된 데이터 제거**: exit().remove() 사용
- [ ] **이벤트 리스너 정리**: onUnmounted에서 제거
- [ ] **WebSocket 연결 관리**: 적절한 연결/해제

#### 사용자 경험

- [ ] **로딩 인디케이터**: 초기 데이터 로딩 시 표시
- [ ] **일시정지 기능**: 사용자가 일시정지 가능
- [ ] **시간 범위 선택**: 특정 시간대만 표시

---

### 실시간 데이터 시각화 패턴

```javascript
// 표준 실시간 차트 업데이트 패턴
class RealTimeChart {
  constructor(container, options = {}) {
    this.container = container
    this.maxDataPoints = options.maxDataPoints || 100
    this.updateInterval = options.updateInterval || 100 // ms
    this.data = []
    this.isPaused = false

    this.initChart()
  }

  initChart() {
    // SVG 초기화
    this.svg = d3.select(this.container).append('svg').attr('width', this.width).attr('height', this.height)

    this.chartGroup = this.svg.append('g').attr('transform', `translate(${this.margin.left},${this.margin.top})`)

    // 스케일 초기화
    this.xScale = d3.scaleTime()
    this.yScale = d3.scaleLinear()
  }

  addDataPoint(newData) {
    if (this.isPaused) return

    this.data.push({
      ...newData,
      timestamp: Date.now(),
    })

    // 최대 포인트 수 제한
    if (this.data.length > this.maxDataPoints) {
      this.data.shift()
    }

    this.updateChart()
  }

  updateChart() {
    // 스케일 업데이트
    this.xScale.domain(d3.extent(this.data, (d) => d.timestamp)).range([0, this.chartWidth])

    this.yScale.domain([0, d3.max(this.data, (d) => d.value)]).range([this.chartHeight, 0])

    // 데이터 바인딩
    const circles = this.chartGroup.selectAll('.data-point').data(this.data, (d) => d.timestamp)

    // Enter
    circles
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('r', 4)
      .merge(circles)
      .attr('cx', (d) => this.xScale(d.timestamp))
      .attr('cy', (d) => this.yScale(d.value))

    // Exit
    circles.exit().remove()

    // 라인 업데이트
    const line = d3
      .line()
      .x((d) => this.xScale(d.timestamp))
      .y((d) => this.yScale(d.value))
      .curve(d3.curveMonotoneX)

    this.chartGroup.select('.data-line').datum(this.data).attr('d', line)
  }

  pause() {
    this.isPaused = true
  }

  resume() {
    this.isPaused = false
  }

  clear() {
    this.data = []
    this.updateChart()
  }
}
```

---

## 🎨 SVG vs Canvas 렌더링 비교

현재 `DataChartRenderer`는 **SVG**를 사용하고 있습니다. 사운드 DSP 등 대량의 실시간 데이터를 처리할 때는 **Canvas**를 고려할 수 있습니다.

### SVG vs Canvas 비교표

| 항목                   | **SVG (현재 구현)**    | **Canvas**           | 설명                                                  |
| ---------------------- | ---------------------- | -------------------- | ----------------------------------------------------- |
| **렌더링 방식**        | 벡터 그래픽 (DOM 요소) | 래스터 그래픽 (픽셀) | SVG는 각 요소가 DOM 노드, Canvas는 비트맵 이미지      |
| **성능 (소량 데이터)** | ⭐⭐⭐⭐⭐             | ⭐⭐⭐⭐             | 소량 데이터(< 100 포인트)에서는 SVG가 우수            |
| **성능 (대량 데이터)** | ⭐⭐⭐                 | ⭐⭐⭐⭐⭐           | 대량 데이터(> 1000 포인트)에서는 Canvas가 압도적      |
| **실시간 업데이트**    | ⭐⭐⭐                 | ⭐⭐⭐⭐⭐           | Canvas는 전체 재그리기가 더 빠름 (특히 고주파 데이터) |
| **CSS 스타일링**       | ✅ 가능                | ❌ 불가능            | SVG는 CSS로 스타일 제어 가능, Canvas는 JavaScript만   |
| **인터랙션**           | ✅ 쉽다                | ⭐ 어렵다            | SVG는 DOM 이벤트 사용, Canvas는 좌표 계산 필요        |
| **요소 선택**          | ✅ 쉬움                | ⭐ 어려움            | SVG는 `.select()` 사용, Canvas는 hit detection 필요   |
| **확장성**             | ✅ 무한 확대           | ⭐ 해상도 제한       | SVG는 벡터라 무한 확대, Canvas는 해상도 의존          |
| **메모리 사용**        | ⭐⭐⭐                 | ⭐⭐⭐⭐             | 많은 DOM 요소는 메모리 부담, Canvas는 더 효율적       |
| **애니메이션**         | ✅ D3 transition       | ⭐ 수동 구현         | SVG는 D3 transition, Canvas는 requestAnimationFrame   |
| **텍스트 렌더링**      | ✅ 우수                | ⭐ 보통              | SVG는 선택/복사 가능, Canvas는 비트맵 텍스트          |
| **접근성**             | ✅ 우수                | ⭐ 제한적            | SVG는 스크린 리더 지원, Canvas는 제한적               |
| **복잡한 그래픽**      | ✅ 적합                | ⭐ 부적합            | SVG는 복잡한 경로/필터 적합, Canvas는 단순 도형 위주  |
| **이미지 내보내기**    | ⭐ 보통                | ✅ 우수              | Canvas는 toDataURL()로 쉽게 이미지 추출               |
| **데이터 바인딩**      | ✅ D3 패턴             | ⭐ 수동 관리         | SVG는 enter/update/exit, Canvas는 수동 구현           |
| **디버깅**             | ✅ DevTools 지원       | ⭐ 어려움            | SVG는 DOM 트리에서 확인 가능, Canvas는 어려움         |

---

### 사용 시나리오별 권장사항

#### ✅ SVG를 사용해야 할 때

- **데이터 포인트가 적을 때** (< 500개)
- **CSS로 스타일을 제어하고 싶을 때**
- **복잡한 인터랙션이 필요할 때** (드래그, 호버, 클릭)
- **접근성이 중요할 때** (스크린 리더 지원)
- **텍스트 선택이 필요할 때**
- **벡터 확대가 필요할 때**
- **D3.js의 전환(transition)을 활용하고 싶을 때**

**현재 구현 (DataChartRenderer)이 이 범주에 해당**

#### ✅ Canvas를 사용해야 할 때

- **대량의 데이터 포인트** (> 1000개)
- **고주파 실시간 데이터** (사운드 스펙트럼, IoT 센서 스트림)
- **60fps 이상의 부드러운 애니메이션**
- **게임/시뮬레이션** 같은 고성능 시각화
- **이미지 내보내기가 중요한 경우**
- **단순한 그래픽만 필요할 때**

---

### 실제 구현 비교

#### SVG 구현 (현재 방식)

```javascript
// SVG로 막대 차트 그리기
function renderBarChartSVG(data) {
  const bars = chartGroup.selectAll('.bar').data(data)

  bars
    .enter()
    .append('rect')
    .attr('class', 'bar') // ✅ CSS로 제어 가능
    .attr('x', (d) => xScale(d.x))
    .attr('y', (d) => yScale(d.y))
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => chartHeight - yScale(d.y))

  // ✅ CSS로 스타일 제어
  // .bar { fill: #2196f3; transition: height 0.3s; }

  // ✅ 쉬운 인터랙션
  bars.on('mouseenter', function (event, d) {
    d3.select(this).attr('opacity', 1) // ✅ DOM 직접 조작
  })
}
```

**장점:**

- CSS 스타일 제어 가능
- 이벤트 핸들링 간단
- D3.js 패턴 그대로 사용

**단점:**

- 대량 데이터에서 성능 저하
- 많은 DOM 요소 생성

---

#### Canvas 구현

```javascript
// Canvas로 막대 차트 그리기
function renderBarChartCanvas(data) {
  const canvas = d3.select('#chart-canvas').node()
  const ctx = canvas.getContext('2d')

  // ✅ 전체 영역 지우기 (효율적)
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // ❌ 매번 수동으로 그리기 (반복문)
  data.forEach((d) => {
    const x = xScale(d.x)
    const y = yScale(d.y)
    const width = xScale.bandwidth()
    const height = chartHeight - yScale(d.y)

    ctx.fillStyle = '#2196f3' // ❌ CSS 사용 불가
    ctx.fillRect(x, y, width, height)
  })

  // ❌ 인터랙션 처리 어려움 (hit detection 필요)
  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // ❌ 수동으로 어떤 막대인지 계산 필요
    const clickedBar = data.find((d) => {
      const barX = xScale(d.x)
      const barY = yScale(d.y)
      return x >= barX && x <= barX + xScale.bandwidth() && y >= barY && y <= barY + (chartHeight - barY)
    })

    if (clickedBar) {
      // 상호작용 처리
    }
  })
}
```

**장점:**

- 대량 데이터에서 매우 빠름
- 메모리 효율적
- 60fps 이상 유지 가능

**단점:**

- CSS 스타일 불가
- 인터랙션 구현 복잡
- 데이터 바인딩 수동 관리

---

### 하이브리드 접근법

**최적의 전략: SVG + Canvas 혼합**

```javascript
// 대량 데이터는 Canvas, 인터랙션 요소는 SVG
function renderHybridChart(data) {
  // 1. 배경 데이터는 Canvas로 (성능)
  renderBackgroundWithCanvas(data)

  // 2. 인터랙션 요소는 SVG로 (용이성)
  renderInteractionWithSVG(data)
}

function renderBackgroundWithCanvas(data) {
  const canvas = d3.select('#background-canvas').node()
  const ctx = canvas.getContext('2d')

  // 대량 데이터 빠르게 그리기
  data.forEach((d) => {
    ctx.fillRect(x, y, width, height)
  })
}

function renderInteractionWithSVG(data) {
  // 선택 가능한 마커만 SVG로
  chartGroup.selectAll('.marker').data(data).enter().append('circle').attr('class', 'marker').on('click', handleClick) // ✅ 쉬운 이벤트
}
```

---

### 성능 벤치마크 (참고)

| 데이터 포인트 | SVG 렌더링 시간 | Canvas 렌더링 시간 | 차이             |
| ------------- | --------------- | ------------------ | ---------------- |
| 100개         | ~5ms            | ~3ms               | 비슷함           |
| 500개         | ~25ms           | ~5ms               | Canvas 5배 빠름  |
| 1,000개       | ~60ms           | ~10ms              | Canvas 6배 빠름  |
| 5,000개       | ~300ms          | ~25ms              | Canvas 12배 빠름 |
| 10,000개      | ~800ms          | ~40ms              | Canvas 20배 빠름 |

**결론:** 데이터가 적을 때는 차이가 크지 않지만, **1,000개 이상부터는 Canvas가 압도적으로 빠릅니다.**

---

### 현재 구현에서 Canvas로 전환할 때

**현재 `DataChartRenderer.vue`는 SVG 기반입니다.**

Canvas로 전환하려면:

1. **SVG → Canvas 변경**

```javascript
// 기존: SVG
svg = d3.select(chartSvgRef.value).append('svg').attr('width', svgWidth).attr('height', svgHeight)

// 변경: Canvas
const canvas = d3.select(chartSvgRef.value).append('canvas').attr('width', chartWidth).attr('height', chartHeight).node()

const ctx = canvas.getContext('2d')
```

2. **렌더링 로직 변경**

```javascript
// 기존: D3 enter/update/exit 패턴
bars.enter().append('rect')...

// 변경: 수동 그리기
function drawBars(data) {
  ctx.clearRect(0, 0, width, height)
  data.forEach(d => {
    ctx.fillRect(x, y, width, height)
  })
}
```

3. **이벤트 처리 추가**

```javascript
// 기존: DOM 이벤트
bars.on('click', handler)

// 변경: Canvas 좌표 계산
canvas.addEventListener('click', (event) => {
  const x = event.offsetX
  const y = event.offsetY
  // hit detection 로직
})
```

**주의:** Canvas 전환 시 **CSS 스타일 제어 불가**하므로 모든 스타일을 JavaScript로 처리해야 합니다.

---

## 📚 참고 자료

- [D3.js 공식 문서](https://d3js.org/)
- [D3.js Axis API](https://github.com/d3/d3-axis)
- [SVG 좌표 시스템 이해하기](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Positions)

---

---

## 🚀 구현 로드맵

### 단계별 구현 계획

#### ✅ 단계 1: 기본기 확립 (완료)

- [x] 차트 중앙 정렬 패턴 확립
- [x] 반응형 margin 알고리즘 구현
- [x] D3.js Axis 활용 가이드 정립
- [x] CSS/SCSS 스타일 관리 패턴 확립
- [x] 기본 차트 타입 구현 (막대, 선, 영역, 파이, 산점도)

#### 🔄 단계 2: 복합 차트 구현 (진행 예정)

- [ ] 바 + 라인 복합 차트 타입 추가
- [ ] 여러 데이터 시리즈 동시 렌더링
- [ ] 복합 차트용 스케일 조정
- [ ] 범례(Legend) 구현
- [ ] 데이터 계열별 색상 관리

**구현 예시:**

```javascript
function renderCombinedChart(chartWidth, chartHeight) {
  // 1. 막대 차트 먼저 렌더링
  renderBarSeries(chartWidth, chartHeight)

  // 2. 선 차트 오버레이 렌더링
  renderLineSeries(chartWidth, chartHeight)

  // 3. 공통 축 렌더링
  renderCommonAxes(chartWidth, chartHeight)

  // 4. 범례 렌더링
  renderLegend()
}
```

#### 🎨 단계 3: 효과 추가 (예정)

- [ ] SVG 필터를 사용한 발광(Glow) 효과
- [ ] 다크 테마 스타일
- [ ] 네온 색상 팔레트 적용
- [ ] 그라데이션 강화
- [ ] 애니메이션 효과 고도화

**발광 효과 구현:**

```javascript
// SVG 필터 생성
function createGlowFilter(svg, filterId, color, blurRadius = 4) {
  const defs = svg.append('defs')
  const filter = defs.append('filter').attr('id', filterId).attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%')

  // 블러 효과
  filter.append('feGaussianBlur').attr('stdDeviation', blurRadius).attr('result', 'coloredBlur')

  // 색상 강조
  const feMerge = filter.append('feMerge')
  feMerge.append('feMergeNode').attr('in', 'coloredBlur')
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

  return filter
}

// 사용
const glowFilter = createGlowFilter(svg, 'glow-neon-green', '#00ff00', 4)
bars.attr('filter', 'url(#glow-neon-green)')
```

#### 🎮 단계 4: 인터랙티브 기능 구현 (예정)

##### 4.1 드래그 가능한 데이터 포인트

**기능:**

- 차트의 데이터 포인트를 드래그하여 값 직접 수정
- 드래그 중 실시간 미리보기
- 드래그 완료 시 원본 데이터 업데이트
- 부모 컴포넌트에 변경사항 전달

**구현 방법:**

```javascript
// 드래그 핸들러 설정
function enableDragInteractions(selection, xScale, yScale, chartHeight) {
  const drag = d3
    .drag()
    .on('start', function (event, d) {
      // 드래그 시작 시 시각적 피드백
      d3.select(this).attr('opacity', 0.7).attr('stroke-width', 3)
    })
    .on('drag', function (event, d) {
      // 드래그 위치를 데이터 값으로 변환
      const newY = yScale.invert(event.y)

      // 최소/최대 값 제한
      const minY = 0
      const maxY = yScale.domain()[1]
      const clampedY = Math.max(minY, Math.min(maxY, newY))

      // 데이터 업데이트 (임시)
      d.draggedY = clampedY

      // 요소 위치 업데이트
      d3.select(this).attr('y', yScale(clampedY) - 5) // 요소 중앙 조정

      // 연관 요소 업데이트 (막대, 라인 등)
      updateRelatedElements(d)
    })
    .on('end', function (event, d) {
      // 드래그 종료 시
      d3.select(this).attr('opacity', 1).attr('stroke-width', 2)

      if (d.draggedY !== undefined) {
        // 원본 데이터에 반영
        const originalRow = d.originalRows ? d.originalRows[0] : d.originalRow
        if (originalRow) {
          // Y 필드 값 업데이트
          const yField = localYAxisField.value
          originalRow[yField] = d.draggedY

          // 변경사항을 부모 컴포넌트에 전달
          emit('data-update', {
            row: originalRow,
            field: yField,
            oldValue: d.y,
            newValue: d.draggedY,
            dataPoint: d,
          })
        }

        // 차트 다시 렌더링
        renderChart()
      }
    })

  // 드래그 적용
  selection.call(drag)
}

// 막대 차트에 드래그 적용
bars.call(enableDragInteractions.bind(null, bars, xScale, yScale, chartHeight))
```

**주의사항:**

- 드래그는 Y축(수직) 방향만 허용
- 데이터 타입 검증 (숫자만 허용)
- 원본 데이터 구조 보존
- 변경사항 emit으로 부모 컴포넌트 통지

##### 4.2 제어 설정 업데이트 연동

**기능:**

- 차트에서 데이터 변경 시 차트 설정도 연동 업데이트
- X축/Y축 필드 변경 자동 반영
- 집계 방식 변경 시 재계산

**구현 방법:**

```javascript
// 데이터 업데이트 시 설정 동기화
watch(
  () => props.rows,
  (newRows) => {
    // 데이터 변경 시 차트 재렌더링
    renderChart()
  },
  { deep: true },
)

// 설정 변경 시 데이터 재처리
watch([localXAxisField, localYAxisField, localAggregation], () => {
  // processedData가 자동으로 재계산됨 (computed)
  nextTick(() => {
    renderChart()
  })
})

// 드래그 완료 시 설정 업데이트 제안
function handleDataUpdate(updateInfo) {
  emit('data-update', updateInfo)

  // 설정 변경 제안 (선택적)
  if (updateInfo.needsRecalculation) {
    emit('settings-change', {
      suggestion: 'aggregation-update',
      reason: '데이터 변경으로 인한 재집계 필요',
    })
  }
}
```

##### 4.3 추가 인터랙티브 기능

- [ ] 줌(Zoom) 및 팬(Pan)
- [ ] 브러시(Brush) - 범위 선택
- [ ] 데이터 포인트 다중 선택
- [ ] 클릭으로 필터링
- [ ] 키보드 단축키 지원
- [ ] 툴팁 개선 (더 상세한 정보)
- [ ] 데이터 내보내기 기능

---

**작성일:** 2024년
**작성자:** NEXA Platform 개발팀
**최종 업데이트:** 구현 로드맵 및 드래그 인터랙티브 기능 가이드 추가
