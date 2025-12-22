# D3.js 상세 가이드

## 📊 D3.js (Data-Driven Documents) 완전 분석

NEXA Platform의 차트 뷰 구현을 위한 D3.js 상세 가이드입니다.

---

## 🎯 D3.js란?

**D3.js**는 데이터 기반 문서 조작을 위한 JavaScript 라이브러리입니다. SVG, Canvas, HTML을 사용하여 데이터를 시각화합니다.

**핵심 철학:**

- 데이터와 DOM을 바인딩
- 데이터 기반으로 DOM 조작
- 완전한 커스터마이징 가능
- 웹 표준 기반 (SVG, CSS, HTML)

---

## ✅ 1. 디자인 커스터마이징 가능성

### 완전한 디자인 제어 가능

**답변: 네, 완전히 가능합니다.**

D3.js는 **완전한 디자인 제어**를 제공합니다. 다른 차트 라이브러리를 참고하여 원하는 디자인을 직접 구현할 수 있습니다.

### 디자인 커스터마이징 방법

#### 1. SVG/CSS 직접 제어

```javascript
// 예시: 차트 스타일 완전 제어
const svg = d3
  .select('#chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .style('background', '#1e1e1e') // 배경색 직접 설정
  .style('border-radius', '8px') // 둥근 모서리

// 선 스타일
const line =
  d3
    .line()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.value))
    .curve(d3.curveMonotoneX) // 곡선 스타일
    .stroke('#00d4ff').stroke - // 선 색상
  width(3).stroke - // 선 두께
  linecap('round') // 선 끝 모양

// 점 스타일
svg.selectAll('circle').data(data).enter().append('circle').attr('r', 5).attr('fill', '#00d4ff').attr('stroke', '#ffffff').attr('stroke-width', 2).style('filter', 'drop-shadow(0 0 4px rgba(0, 212, 255, 0.5))') // 그림자 효과
```

#### 2. 다른 차트 라이브러리 디자인 참고 가능

**ApexCharts 스타일 구현 예시:**

```javascript
// ApexCharts의 세련된 그라데이션 스타일 구현
const gradient = svg.append('defs').append('linearGradient').attr('id', 'areaGradient').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%')

gradient.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(0, 212, 255, 0.8)')

gradient.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(0, 212, 255, 0.1)')

// 영역 차트에 그라데이션 적용
const area = d3
  .area()
  .x((d) => xScale(d.date))
  .y0(height)
  .y1((d) => yScale(d.value))
  .curve(d3.curveMonotoneX)

svg.append('path').datum(data).attr('fill', 'url(#areaGradient)').attr('d', area)
```

**Chart.js 스타일 구현 예시:**

```javascript
// Chart.js의 깔끔한 그리드 스타일 구현
const gridLines = svg.append('g').attr('class', 'grid')

gridLines
  .selectAll('line.horizontal')
  .data(yScale.ticks())
  .enter()
  .append('line')
  .attr('class', 'horizontal')
  .attr('x1', 0)
  .attr('x2', width)
  .attr('y1', (d) => yScale(d))
  .attr('y2', (d) => yScale(d))
  .attr('stroke', '#2a2a2a')
  .attr('stroke-width', 1)
  .attr('stroke-dasharray', '3,3')
  .style('opacity', 0.5)
```

#### 3. NEXA BOARD 스타일 통합

```javascript
// NEXA BOARD의 다크 테마와 통합
const nexaTheme = {
  background: '#1e1e1e',
  primary: '#00d4ff',
  secondary: '#7b68ee',
  text: '#ffffff',
  grid: '#2a2a2a',
  accent: '#ff6b6b',
}

// 차트에 NEXA 테마 적용
svg.style('background', nexaTheme.background).style('border-radius', '8px').style('padding', '16px')

// 축 스타일
const xAxis = d3.axisBottom(xScale).tickSize(0).tickPadding(10).tickFormat(d3.timeFormat('%Y-%m-%d'))

svg.append('g').attr('class', 'x-axis').attr('transform', `translate(0, ${height})`).call(xAxis).selectAll('text').style('fill', nexaTheme.text).style('font-size', '12px').style('font-family', 'Roboto, sans-serif')
```

### 디자인 제어의 장점

✅ **완전한 자유도**: 픽셀 단위로 제어 가능  
✅ **브랜드 통합**: NEXA 디자인 시스템과 완벽 통합  
✅ **고유한 디자인**: 다른 라이브러리와 차별화된 디자인  
✅ **애니메이션 제어**: 모든 애니메이션을 직접 제어  
✅ **반응형 디자인**: 화면 크기에 따른 완전한 제어

---

## ⚙️ 2. Vue 통합 난이도

### Vue 3 통합 방법

**난이도: 중간~높음** (하지만 패턴을 익히면 쉬워짐)

#### 방법 1: Composition API + 직접 통합 (권장)

**장점:**

- Vue의 반응성 시스템 활용
- 컴포넌트 생명주기와 자연스럽게 통합
- TypeScript 지원 용이

**코드 예시:**

```vue
<template>
  <div ref="chartContainer" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  chartType: {
    type: String,
    default: 'line',
  },
})

const chartContainer = ref(null)
let svg = null
let chart = null

// 차트 초기화
function initChart() {
  if (!chartContainer.value) return

  // 기존 차트 제거
  d3.select(chartContainer.value).selectAll('*').remove()

  // SVG 생성
  svg = d3.select(chartContainer.value).append('svg').attr('width', 800).attr('height', 400)

  // 차트 그리기
  drawChart()
}

// 차트 그리기
function drawChart() {
  if (!svg || !props.data.length) return

  const margin = { top: 20, right: 20, bottom: 40, left: 50 }
  const width = 800 - margin.left - margin.right
  const height = 400 - margin.top - margin.bottom

  // 스케일 설정
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(props.data, (d) => d.date))
    .range([0, width])

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(props.data, (d) => d.value)])
    .range([height, 0])

  // 축 그리기
  svg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${height + margin.top})`)
    .call(d3.axisBottom(xScale))

  svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`).call(d3.axisLeft(yScale))

  // 데이터에 따라 차트 타입 선택
  if (props.chartType === 'line') {
    drawLineChart(xScale, yScale, margin)
  } else if (props.chartType === 'bar') {
    drawBarChart(xScale, yScale, margin)
  }
}

// 라인 차트 그리기
function drawLineChart(xScale, yScale, margin) {
  const line = d3
    .line()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.value))
    .curve(d3.curveMonotoneX)

  svg.append('path').datum(props.data).attr('transform', `translate(${margin.left}, ${margin.top})`).attr('fill', 'none').attr('stroke', '#00d4ff').attr('stroke-width', 2).attr('d', line)
}

// 바 차트 그리기
function drawBarChart(xScale, yScale, margin) {
  svg
    .selectAll('rect')
    .data(props.data)
    .enter()
    .append('rect')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('x', (d) => xScale(d.date))
    .attr('y', (d) => yScale(d.value))
    .attr('width', xScale.bandwidth ? xScale.bandwidth() : 20)
    .attr('height', (d) => height - yScale(d.value))
    .attr('fill', '#00d4ff')
}

// 데이터 변경 감지
watch(
  () => props.data,
  () => {
    if (chartContainer.value) {
      drawChart()
    }
  },
  { deep: true },
)

watch(
  () => props.chartType,
  () => {
    initChart()
  },
)

// 생명주기
onMounted(() => {
  initChart()
})

onUnmounted(() => {
  // 정리
  if (svg) {
    svg.remove()
  }
})
</script>
```

#### 방법 2: Vue 컴포넌트 래퍼 패턴

**장점:**

- 재사용 가능한 컴포넌트
- Props/Events로 제어
- 다른 Vue 컴포넌트와 동일한 사용법

**코드 예시:**

```vue
<!-- D3Chart.vue -->
<template>
  <div ref="container" class="d3-chart-container"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  data: Array,
  type: String,
  options: Object,
})

const emit = defineEmits(['click', 'hover', 'select'])

const container = ref(null)
let chartInstance = null

// 차트 인스턴스 생성
function createChart() {
  if (!container.value) return

  // D3 차트 로직
  chartInstance = new D3Chart(container.value, {
    data: props.data,
    type: props.type,
    ...props.options,
  })

  // 이벤트 전달
  chartInstance.on('click', (data) => emit('click', data))
  chartInstance.on('hover', (data) => emit('hover', data))
}

onMounted(() => {
  createChart()
})

watch(
  () => props.data,
  () => {
    if (chartInstance) {
      chartInstance.update(props.data)
    }
  },
  { deep: true },
)
</script>
```

### Quasar와의 통합

**Quasar는 필수는 아니지만 유용합니다:**

#### Quasar 사용 시 장점:

- ✅ Quasar의 스타일 시스템 활용
- ✅ Quasar 컴포넌트와 통합 (예: q-card로 차트 감싸기)
- ✅ Quasar의 반응형 유틸리티 활용

#### Quasar 없이도 가능:

- ✅ D3.js는 독립적으로 작동
- ✅ CSS로 스타일링 가능
- ✅ Vue의 반응성만으로도 충분

**Quasar 통합 예시:**

```vue
<template>
  <q-card class="chart-card">
    <q-card-section>
      <div class="text-h6">차트 제목</div>
    </q-card-section>
    <q-card-section>
      <div ref="chartContainer" class="chart-container"></div>
    </q-card-section>
    <q-card-actions>
      <q-btn flat label="설정" @click="openSettings" />
    </q-card-actions>
  </q-card>
</template>
```

### Vue 통합 난이도 요약

| 항목            | 난이도             | 설명                                 |
| --------------- | ------------------ | ------------------------------------ |
| **기본 통합**   | ⭐⭐ (중간)        | ref, onMounted 사용 패턴 익히면 쉬움 |
| **반응성 통합** | ⭐⭐⭐ (중간~높음) | watch, computed 활용 필요            |
| **이벤트 처리** | ⭐⭐ (중간)        | Vue 이벤트 시스템과 D3 이벤트 연결   |
| **성능 최적화** | ⭐⭐⭐⭐ (높음)    | 대용량 데이터 처리 시 최적화 필요    |
| **TypeScript**  | ⭐⭐⭐ (중간~높음) | 타입 정의 필요                       |

---

## 📚 3. 학습 곡선 구체적 설명

### 학습 단계별 난이도

#### 단계 1: 기본 개념 이해 (1-2일)

**학습 내용:**

- D3의 선택(Selection) 개념
- 데이터 바인딩 (Data Binding)
- 스케일 (Scale)
- 축 (Axis)

**난이도:** ⭐⭐ (중간)

**예시:**

```javascript
// 선택: DOM 요소 선택
const svg = d3.select('#chart')

// 데이터 바인딩: 데이터와 DOM 연결
svg
  .selectAll('circle')
  .data([1, 2, 3, 4, 5])
  .enter()
  .append('circle')
  .attr('r', (d) => d * 10) // 데이터 기반 속성 설정

// 스케일: 데이터를 픽셀 좌표로 변환
const scale = d3
  .scaleLinear()
  .domain([0, 100]) // 데이터 범위
  .range([0, 500]) // 픽셀 범위

scale(50) // 250 반환
```

#### 단계 2: 기본 차트 구현 (3-5일)

**학습 내용:**

- Line Chart
- Bar Chart
- Pie Chart

**난이도:** ⭐⭐⭐ (중간~높음)

**예시: Line Chart**

```javascript
// 1. 데이터 준비
const data = [
  { date: new Date('2024-01-01'), value: 10 },
  { date: new Date('2024-01-02'), value: 20 },
  { date: new Date('2024-01-03'), value: 15 },
]

// 2. 스케일 설정
const xScale = d3
  .scaleTime()
  .domain(d3.extent(data, (d) => d.date))
  .range([0, width])

const yScale = d3
  .scaleLinear()
  .domain([0, d3.max(data, (d) => d.value)])
  .range([height, 0])

// 3. 라인 생성기
const line = d3
  .line()
  .x((d) => xScale(d.date))
  .y((d) => yScale(d.value))
  .curve(d3.curveMonotoneX)

// 4. 라인 그리기
svg.append('path').datum(data).attr('d', line).attr('fill', 'none').attr('stroke', 'blue')
```

**주요 개념:**

- `d3.line()`: 라인 생성기
- `d3.scaleTime()`: 시간 스케일
- `d3.extent()`: 최소/최대값 구하기
- `curve()`: 곡선 스타일

#### 단계 3: 인터랙티브 기능 (5-7일)

**학습 내용:**

- 이벤트 리스너
- 툴팁
- 줌/팬
- 브러시

**난이도:** ⭐⭐⭐⭐ (높음)

**예시: 툴팁**

```javascript
// 툴팁 div 생성
const tooltip = d3.select('body').append('div').style('position', 'absolute').style('opacity', 0).style('background', 'rgba(0, 0, 0, 0.8)').style('color', 'white').style('padding', '8px').style('border-radius', '4px').style('pointer-events', 'none')

// 마우스 오버 이벤트
svg
  .selectAll('circle')
  .on('mouseover', function (event, d) {
    tooltip.transition().duration(200).style('opacity', 1)

    tooltip
      .html(`값: ${d.value}`)
      .style('left', event.pageX + 10 + 'px')
      .style('top', event.pageY - 10 + 'px')
  })
  .on('mouseout', function () {
    tooltip.transition().duration(200).style('opacity', 0)
  })
```

#### 단계 4: 고급 기능 (1-2주)

**학습 내용:**

- 애니메이션
- 전환 (Transition)
- 레이아웃 (Layout)
- 포스 시뮬레이션

**난이도:** ⭐⭐⭐⭐⭐ (매우 높음)

**예시: 애니메이션**

```javascript
// 데이터 업데이트 시 애니메이션
svg
  .selectAll('circle')
  .data(newData)
  .transition()
  .duration(1000)
  .attr('cx', (d) => xScale(d.x))
  .attr('cy', (d) => yScale(d.y))
  .attr('r', (d) => d.size)
```

### 학습 곡선 그래프

```
난이도
  ↑
  │                    ╱─────────────── (고급 기능)
  │              ╱─────╱
  │        ╱────╱ (인터랙티브)
  │  ╱────╱ (기본 차트)
  │╱──── (기본 개념)
  └────────────────────────────────→ 시간
  1일  3일  1주  2주  1개월
```

### 학습 리소스

**공식 문서:**

- [D3.js 공식 문서](https://d3js.org/)
- [D3.js 갤러리](https://observablehq.com/@d3/gallery)

**추천 학습 순서:**

1. D3.js 공식 튜토리얼 (1주)
2. Observable 예제 따라하기 (1주)
3. 간단한 차트 구현 (1주)
4. 인터랙티브 기능 추가 (1주)
5. 프로젝트에 적용

---

## 🎮 4. 인터랙티브 기능 예시

### 구현 가능한 인터랙티브 기능

#### 1. 툴팁 (Tooltip)

**기능:**

- 데이터 포인트에 마우스 오버 시 상세 정보 표시
- 위치 자동 조정
- 애니메이션 효과

**예시:**

```javascript
const tooltip = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0)

svg
  .selectAll('circle')
  .on('mouseover', function (event, d) {
    tooltip.transition().duration(200).style('opacity', 0.9)

    tooltip
      .html(
        `
      <div>날짜: ${d.date}</div>
      <div>값: ${d.value}</div>
      <div>카테고리: ${d.category}</div>
    `,
      )
      .style('left', event.pageX + 10 + 'px')
      .style('top', event.pageY - 10 + 'px')
  })
  .on('mouseout', function () {
    tooltip.transition().duration(200).style('opacity', 0)
  })
```

#### 2. 줌 & 팬 (Zoom & Pan)

**기능:**

- 마우스 휠로 확대/축소
- 드래그로 이동
- 더블클릭으로 리셋

**예시:**

```javascript
const zoom = d3
  .zoom()
  .scaleExtent([0.5, 10]) // 최소/최대 확대 비율
  .on('zoom', function (event) {
    const { transform } = event

    // 스케일 업데이트
    xScale.domain(transform.rescaleX(xScaleOriginal).domain())

    // 축 업데이트
    svg.select('.x-axis').call(xAxis)

    // 차트 다시 그리기
    updateChart()
  })

svg.call(zoom)
```

#### 3. 브러시 (Brush) - 범위 선택

**기능:**

- 마우스로 영역 선택
- 선택된 범위의 데이터만 표시
- 다른 차트와 연동

**예시:**

```javascript
const brush = d3
  .brushX()
  .extent([
    [0, 0],
    [width, height],
  ])
  .on('brush', function (event) {
    const selection = event.selection

    if (selection) {
      const [x0, x1] = selection.map(xScale.invert)

      // 선택된 범위의 데이터만 필터링
      const filteredData = data.filter((d) => d.date >= x0 && d.date <= x1)

      // 필터링된 데이터로 차트 업데이트
      updateChart(filteredData)
    }
  })

svg.append('g').attr('class', 'brush').call(brush)
```

#### 4. 데이터 포인트 선택

**기능:**

- 클릭으로 데이터 포인트 선택
- 다중 선택
- 선택된 데이터 하이라이트

**예시:**

```javascript
let selectedPoints = []

svg.selectAll('circle').on('click', function (event, d) {
  const index = selectedPoints.indexOf(d)

  if (index > -1) {
    // 이미 선택됨 → 선택 해제
    selectedPoints.splice(index, 1)
    d3.select(this).attr('fill', '#00d4ff').attr('r', 5)
  } else {
    // 선택
    selectedPoints.push(d)
    d3.select(this).attr('fill', '#ff6b6b').attr('r', 8)
  }

  // 선택된 데이터를 부모 컴포넌트에 전달
  emit('select', selectedPoints)
})
```

#### 5. 드래그 가능한 데이터 포인트

**기능:**

- 데이터 포인트를 드래그하여 값 변경
- 실시간 업데이트

**예시:**

```javascript
const drag = d3.drag().on('drag', function (event, d) {
  // 드래그 위치를 데이터 값으로 변환
  const newY = yScale.invert(event.y)

  // 데이터 업데이트
  d.value = Math.max(0, Math.min(100, newY))

  // 차트 다시 그리기
  updateChart()

  // 변경사항을 부모 컴포넌트에 전달
  emit('update', d)
})

svg.selectAll('circle').call(drag)
```

#### 6. 실시간 데이터 업데이트

**기능:**

- 새로운 데이터가 추가되면 애니메이션으로 표시
- 오래된 데이터 제거

**예시:**

```javascript
function updateChart(newData) {
  // 기존 요소 선택
  const circles = svg.selectAll('circle').data(newData, (d) => d.id) // 키 함수로 데이터 식별

  // 새 요소 추가
  circles
    .enter()
    .append('circle')
    .attr('r', 0)
    .attr('fill', '#00d4ff')
    .merge(circles)
    .transition()
    .duration(500)
    .attr('cx', (d) => xScale(d.x))
    .attr('cy', (d) => yScale(d.y))
    .attr('r', 5)

  // 제거된 요소 애니메이션 후 제거
  circles.exit().transition().duration(500).attr('r', 0).remove()
}
```

#### 7. 차트 간 연동 (Linked Charts)

**기능:**

- 여러 차트가 같은 데이터를 공유
- 한 차트에서 선택하면 다른 차트도 업데이트

**예시:**

```javascript
// 차트 1에서 선택
function onChart1Select(selectedData) {
  // 차트 2 업데이트
  chart2.highlight(selectedData)

  // 차트 3 업데이트
  chart3.filter(selectedData)
}
```

#### 8. 커스텀 인터랙션

**기능:**

- 원하는 모든 인터랙션 구현 가능
- 제스처 인식
- 키보드 단축키

**예시: 키보드 단축키**

```javascript
d3.select(window).on('keydown', function (event) {
  if (event.key === 'ArrowLeft') {
    // 왼쪽 화살표: 이전 데이터
    navigateData(-1)
  } else if (event.key === 'ArrowRight') {
    // 오른쪽 화살표: 다음 데이터
    navigateData(1)
  } else if (event.key === 'r' || event.key === 'R') {
    // R 키: 리셋
    resetZoom()
  }
})
```

---

## 🚀 5. NEXA BOARD와의 통합

### NEXA BOARD 스타일 적용

```javascript
// NEXA 테마 정의
const nexaTheme = {
  colors: {
    primary: '#00d4ff',
    secondary: '#7b68ee',
    accent: '#ff6b6b',
    background: '#1e1e1e',
    surface: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#b0b0b0',
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
  borderRadius: 8,
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.3)',
    large: '0 8px 16px rgba(0, 0, 0, 0.3)',
  },
}

// 차트에 NEXA 테마 적용
function applyNexaTheme(svg) {
  svg.style('background', nexaTheme.colors.background).style('border-radius', `${nexaTheme.borderRadius}px`).style('padding', `${nexaTheme.spacing.medium}px`).style('box-shadow', nexaTheme.shadows.medium)

  // 축 스타일
  svg.selectAll('.axis').style('color', nexaTheme.colors.textSecondary).style('font-family', 'Roboto, sans-serif')

  // 그리드 스타일
  svg.selectAll('.grid line').style('stroke', nexaTheme.colors.surface).style('stroke-width', 1).style('opacity', 0.5)
}
```

### NEXA BOARD 위젯과 통합

```vue
<!-- NEXA BOARD 위젯으로 사용 -->
<template>
  <nexa-panel :title="chartTitle">
    <div ref="chartContainer" class="nexa-chart-container"></div>
    <template #actions>
      <q-btn flat icon="settings" @click="openSettings" />
      <q-btn flat icon="fullscreen" @click="toggleFullscreen" />
    </template>
  </nexa-panel>
</template>
```

---

## 📊 6. 실제 사용 예시: 완전한 차트 컴포넌트

```vue
<template>
  <div class="d3-chart-wrapper">
    <!-- 차트 컨트롤 -->
    <div class="chart-controls q-pa-md">
      <q-select v-model="selectedChartType" :options="chartTypes" label="차트 타입" dense class="q-mr-md" />
      <q-select v-model="selectedXField" :options="availableFields" label="X축" dense class="q-mr-md" />
      <q-select v-model="selectedYField" :options="availableFields" label="Y축" dense />
    </div>

    <!-- 차트 컨테이너 -->
    <div ref="chartContainer" class="chart-container"></div>

    <!-- 범례 -->
    <div class="chart-legend q-pa-md">
      <div v-for="(item, index) in legendItems" :key="index" class="legend-item" @click="toggleLegendItem(item)">
        <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
        <span>{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  fields: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['point-click', 'point-hover', 'selection-change'])

const chartContainer = ref(null)
let svg = null
let chart = null

const selectedChartType = ref('line')
const selectedXField = ref(null)
const selectedYField = ref(null)

const chartTypes = [
  { label: '선 그래프', value: 'line' },
  { label: '막대 그래프', value: 'bar' },
  { label: '산점도', value: 'scatter' },
  { label: '영역 그래프', value: 'area' },
  { label: '원형 그래프', value: 'pie' },
]

const availableFields = computed(() => {
  return props.fields.map((f) => ({
    label: f.label,
    value: f.name,
  }))
})

// 차트 초기화
function initChart() {
  if (!chartContainer.value) return

  const width = chartContainer.value.clientWidth
  const height = 400
  const margin = { top: 20, right: 20, bottom: 40, left: 50 }

  // SVG 생성
  svg = d3.select(chartContainer.value).append('svg').attr('width', width).attr('height', height).style('background', '#1e1e1e').style('border-radius', '8px')

  // 차트 그리기
  drawChart()
}

// 차트 그리기
function drawChart() {
  if (!svg || !props.data.length || !selectedXField.value || !selectedYField.value) {
    return
  }

  // 기존 차트 제거
  svg.selectAll('*').remove()

  const width = +svg.attr('width')
  const height = +svg.attr('height')
  const margin = { top: 20, right: 20, bottom: 40, left: 50 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // 데이터 변환
  const processedData = props.data.map((d) => ({
    x: d[selectedXField.value],
    y: d[selectedYField.value],
    original: d,
  }))

  // 스케일 설정
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(processedData, (d) => d.x))
    .range([0, innerWidth])
    .nice()

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(processedData, (d) => d.y)])
    .range([innerHeight, 0])
    .nice()

  // 그리드
  const gridLines = svg.append('g').attr('class', 'grid').attr('transform', `translate(${margin.left}, ${margin.top})`)

  gridLines
    .selectAll('line.horizontal')
    .data(yScale.ticks())
    .enter()
    .append('line')
    .attr('class', 'horizontal')
    .attr('x1', 0)
    .attr('x2', innerWidth)
    .attr('y1', (d) => yScale(d))
    .attr('y2', (d) => yScale(d))
    .attr('stroke', '#2a2a2a')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '3,3')
    .style('opacity', 0.5)

  // 축
  const xAxis = d3.axisBottom(xScale).tickSize(0).tickPadding(10)

  const yAxis = d3.axisLeft(yScale).tickSize(0).tickPadding(10)

  svg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(${margin.left}, ${height - margin.bottom})`)
    .call(xAxis)
    .selectAll('text')
    .style('fill', '#b0b0b0')
    .style('font-size', '12px')

  svg.append('g').attr('class', 'y-axis').attr('transform', `translate(${margin.left}, ${margin.top})`).call(yAxis).selectAll('text').style('fill', '#b0b0b0').style('font-size', '12px')

  // 차트 타입에 따라 그리기
  const chartGroup = svg.append('g').attr('class', 'chart-content').attr('transform', `translate(${margin.left}, ${margin.top})`)

  if (selectedChartType.value === 'line') {
    drawLineChart(chartGroup, processedData, xScale, yScale)
  } else if (selectedChartType.value === 'bar') {
    drawBarChart(chartGroup, processedData, xScale, yScale, innerWidth, innerHeight)
  } else if (selectedChartType.value === 'scatter') {
    drawScatterChart(chartGroup, processedData, xScale, yScale)
  }
}

// 라인 차트
function drawLineChart(group, data, xScale, yScale) {
  const line = d3
    .line()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y))
    .curve(d3.curveMonotoneX)

  // 영역 (그라데이션)
  const area = d3
    .area()
    .x((d) => xScale(d.x))
    .y0(yScale(0))
    .y1((d) => yScale(d.y))
    .curve(d3.curveMonotoneX)

  // 그라데이션 정의
  const gradient = svg.append('defs').append('linearGradient').attr('id', 'areaGradient').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%')

  gradient.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(0, 212, 255, 0.3)')

  gradient.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(0, 212, 255, 0.05)')

  // 영역
  group.append('path').datum(data).attr('fill', 'url(#areaGradient)').attr('d', area)

  // 라인
  group.append('path').datum(data).attr('fill', 'none').attr('stroke', '#00d4ff').attr('stroke-width', 2).attr('d', line)

  // 포인트
  const points = group
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', (d) => xScale(d.x))
    .attr('cy', (d) => yScale(d.y))
    .attr('r', 4)
    .attr('fill', '#00d4ff')
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .on('mouseover', function (event, d) {
      d3.select(this).transition().duration(200).attr('r', 6)

      showTooltip(event, d)
    })
    .on('mouseout', function () {
      d3.select(this).transition().duration(200).attr('r', 4)

      hideTooltip()
    })
    .on('click', function (event, d) {
      emit('point-click', d.original)
    })
}

// 바 차트
function drawBarChart(group, data, xScale, yScale, width, height) {
  const barWidth = (width / data.length) * 0.8

  group
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', (d, i) => xScale(d.x) - barWidth / 2)
    .attr('y', (d) => yScale(d.y))
    .attr('width', barWidth)
    .attr('height', (d) => height - yScale(d.y))
    .attr('fill', '#00d4ff')
    .style('cursor', 'pointer')
    .on('mouseover', function (event, d) {
      d3.select(this).transition().duration(200).attr('fill', '#7b68ee')

      showTooltip(event, d)
    })
    .on('mouseout', function () {
      d3.select(this).transition().duration(200).attr('fill', '#00d4ff')

      hideTooltip()
    })
    .on('click', function (event, d) {
      emit('point-click', d.original)
    })
}

// 산점도
function drawScatterChart(group, data, xScale, yScale) {
  group
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', (d) => xScale(d.x))
    .attr('cy', (d) => yScale(d.y))
    .attr('r', 5)
    .attr('fill', '#00d4ff')
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .on('mouseover', function (event, d) {
      d3.select(this).transition().duration(200).attr('r', 8)

      showTooltip(event, d)
    })
    .on('mouseout', function () {
      d3.select(this).transition().duration(200).attr('r', 5)

      hideTooltip()
    })
    .on('click', function (event, d) {
      emit('point-click', d.original)
    })
}

// 툴팁
let tooltip = null

function showTooltip(event, data) {
  if (!tooltip) {
    tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('opacity', 0)
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('color', '#ffffff')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('z-index', 1000)
  }

  tooltip.transition().duration(200).style('opacity', 1)

  tooltip
    .html(
      `
    <div><strong>X:</strong> ${data.x}</div>
    <div><strong>Y:</strong> ${data.y}</div>
  `,
    )
    .style('left', event.pageX + 10 + 'px')
    .style('top', event.pageY - 10 + 'px')
}

function hideTooltip() {
  if (tooltip) {
    tooltip.transition().duration(200).style('opacity', 0)
  }
}

// 범례
const legendItems = computed(() => {
  // 범례 항목 생성 로직
  return []
})

function toggleLegendItem(item) {
  // 범례 항목 토글 로직
}

// 감시자
watch(
  () => props.data,
  () => {
    drawChart()
  },
  { deep: true },
)

watch([selectedChartType, selectedXField, selectedYField], () => {
  drawChart()
})

// 생명주기
onMounted(() => {
  initChart()

  // 창 크기 변경 감지
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (svg) {
    svg.remove()
  }
  if (tooltip) {
    tooltip.remove()
  }
  window.removeEventListener('resize', handleResize)
})

function handleResize() {
  if (chartContainer.value) {
    drawChart()
  }
}
</script>

<style scoped>
.d3-chart-wrapper {
  width: 100%;
  height: 100%;
}

.chart-container {
  width: 100%;
  height: 400px;
}

.chart-controls {
  display: flex;
  align-items: center;
  background: #2a2a2a;
  border-radius: 8px 8px 0 0;
}

.chart-legend {
  display: flex;
  gap: 16px;
  background: #2a2a2a;
  border-radius: 0 0 8px 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.legend-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}
</style>
```

---

## 💡 7. D3.js 선택 시 고려사항

### 장점

✅ **완전한 제어**: 모든 것을 원하는 대로 구현 가능  
✅ **확장성**: 나중에 어떤 기능도 추가 가능  
✅ **성능**: 필요한 것만 구현하여 최적화 가능  
✅ **브랜드 통합**: NEXA 디자인과 완벽 통합  
✅ **학습 가치**: D3.js는 매우 강력한 스킬

### 단점

⚠️ **초기 개발 시간**: 다른 라이브러리보다 오래 걸림  
⚠️ **유지보수**: 직접 구현한 코드는 유지보수 필요  
⚠️ **버그 가능성**: 직접 구현하다 보면 버그 발생 가능  
⚠️ **문서화**: 내부 문서화 필요

### 리팩토링 가능성

**다른 라이브러리로 전환 시:**

- ✅ **데이터 구조**: 대부분의 라이브러리가 비슷한 데이터 형식 사용
- ✅ **컴포넌트 구조**: Vue 컴포넌트는 그대로 유지 가능
- ✅ **설정 시스템**: 차트 설정은 독립적으로 관리 가능

**전환 난이도:** ⭐⭐⭐ (중간)

- 데이터 처리 로직은 재사용 가능
- 렌더링 부분만 교체하면 됨

---

## 🎯 8. 최종 추천

### D3.js를 선택해야 하는 경우

✅ **완전한 디자인 제어가 필요한 경우**  
✅ **고유한 인터랙티브 기능이 필요한 경우**  
✅ **NEXA BOARD와 완벽한 통합이 필요한 경우**  
✅ **초기 어려움을 감수할 수 있는 경우**  
✅ **장기적으로 확장 가능한 솔루션이 필요한 경우**

### D3.js를 피해야 하는 경우

❌ **빠른 프로토타이핑이 필요한 경우**  
❌ **표준 차트만 필요한 경우**  
❌ **개발 시간이 제한적인 경우**  
❌ **차트 전문가가 없는 경우**

---

## 📝 9. 다음 단계

D3.js를 선택한다면:

1. **D3.js 설치**

   ```bash
   npm install d3
   ```

2. **기본 차트 컴포넌트 생성**

   - `DataChartRenderer.vue` 생성
   - 기본 Line Chart 구현

3. **점진적 기능 추가**

   - Bar Chart
   - Pie Chart
   - 인터랙티브 기능

4. **설정 시스템 통합**
   - X/Y축 필드 선택
   - 집계 기능
   - 차트 설정 저장/로드

---

**작성일:** 차트 뷰 구현 전  
**목적:** D3.js 상세 가이드 및 의사결정 지원
