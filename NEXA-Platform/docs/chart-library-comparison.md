# 차트 라이브러리 비교

## 📊 Vue 3 + Quasar 환경용 차트 라이브러리 비교

차트 뷰 구현을 위한 차트 라이브러리 옵션 비교 문서입니다.

---

## 📋 라이브러리 비교 테이블

| 라이브러리                         | Vue 3 지원        | UI 스타일                                     | 특징                                                                      | 장점                                                                                                                    | 단점                                                                                               | 번들 크기        | 라이선스                                    |
| ---------------------------------- | ----------------- | --------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------- |
| **Chart.js**<br/>+ vue-chartjs     | ✅ 공식 지원      | 깔끔하고 모던한 디자인<br/>커스터마이징 가능  | 가장 인기 있는 차트 라이브러리<br/>Canvas 기반 렌더링<br/>애니메이션 지원 | • 문서화가 잘 되어 있음<br/>• 커뮤니티가 큼<br/>• 가볍고 빠름<br/>• 모든 기본 차트 타입 지원<br/>• 플러그인 생태계 풍부 | • 3D 차트는 별도 플러그인 필요<br/>• 복잡한 상호작용은 제한적                                      | ~200KB (gzipped) | MIT                                         |
| **ApexCharts**<br/>vue3-apexcharts | ✅ 공식 지원      | 매우 세련되고 현대적<br/>인터랙티브 UI        | SVG 기반 렌더링<br/>강력한 인터랙티브 기능<br/>반응형 디자인              | • 매우 예쁜 UI<br/>• 강력한 인터랙티브 기능<br/>• 터치 제스처 지원<br/>• 실시간 업데이트 지원<br/>• 다양한 차트 타입    | • 상업적 사용 시 유료 라이선스 필요<br/>• 번들 크기가 큼<br/>• 학습 곡선이 있음                    | ~400KB (gzipped) | MIT (개인/비상업적)<br/>Commercial (상업적) |
| **ECharts**<br/>vue-echarts        | ✅ 공식 지원      | 중국 스타일 (Baidu 개발)<br/>매우 다양한 옵션 | Canvas/SVG 하이브리드<br/>매우 강력한 기능<br/>3D 차트 지원               | • 매우 강력한 기능<br/>• 3D 차트 지원<br/>• 대용량 데이터 처리<br/>• 다양한 차트 타입<br/>• 무료 (Apache 2.0)           | • 문서가 주로 중국어<br/>• 번들 크기가 매우 큼<br/>• 복잡함<br/>• UI 스타일이 서구와 다를 수 있음  | ~700KB (gzipped) | Apache 2.0                                  |
| **Plotly.js**<br/>vue-plotly       | ✅ 지원           | 과학/엔지니어링 스타일<br/>전문적인 느낌      | WebGL 기반<br/>3D 차트 강력<br/>과학적 데이터 시각화                      | • 3D 차트 매우 강력<br/>• 과학적 데이터 처리<br/>• 대용량 데이터<br/>• 인터랙티브 기능 강력                             | • 번들 크기가 매우 큼<br/>• 일반 비즈니스 차트에는 과함<br/>• 학습 곡선이 있음                     | ~3MB (gzipped)   | MIT                                         |
| **D3.js**                          | ⚠️ 직접 통합 필요 | 완전 커스터마이징<br/>원하는 대로 디자인      | SVG 기반<br/>완전한 제어<br/>데이터 바인딩 강력                           | • 완전한 커스터마이징<br/>• 매우 유연함<br/>• 강력한 데이터 처리<br/>• 무료                                             | • 학습 곡선이 매우 가파름<br/>• 직접 구현 필요<br/>• 개발 시간이 많이 걸림<br/>• Vue 통합이 복잡함 | ~200KB (gzipped) | BSD-3-Clause                                |
| **Recharts**                       | ❌ React 전용     | 깔끔하고 모던                                 | React 컴포넌트 기반<br/>선언적 API                                        | • React 생태계에서 인기<br/>• 선언적 API                                                                                | • Vue 3 지원 없음<br/>• React 전용                                                                 | -                | MIT                                         |

---

## 🎯 추천 라이브러리 상세 비교

### 1. Chart.js + vue-chartjs ⭐⭐⭐⭐⭐ (최고 추천)

**설치:**

```bash
npm install chart.js vue-chartjs
```

**특징:**

- ✅ Vue 3 공식 지원 (`vue-chartjs@next`)
- ✅ 모든 기본 차트 타입 지원 (Line, Bar, Pie, Scatter, Area 등)
- ✅ 깔끔하고 모던한 UI
- ✅ 커스터마이징이 쉬움
- ✅ 가벼움 (번들 크기 작음)
- ✅ 문서화가 잘 되어 있음
- ✅ 커뮤니티가 큼

**UI 스타일:**

- 깔끔하고 모던한 디자인
- 애니메이션 지원
- 반응형 디자인
- 다크 모드 지원 가능

**코드 예시:**

```vue
<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)
</script>
```

**장점:**

- 가장 널리 사용되는 차트 라이브러리
- 학습 곡선이 낮음
- 플러그인 생태계가 풍부
- 무료 (MIT 라이선스)

**단점:**

- 3D 차트는 별도 플러그인 필요
- 복잡한 인터랙티브 기능은 제한적

---

### 2. ApexCharts (vue3-apexcharts) ⭐⭐⭐⭐ (UI 중시 시 추천)

**설치:**

```bash
npm install apexcharts vue3-apexcharts
```

**특징:**

- ✅ Vue 3 공식 지원
- ✅ 매우 세련된 UI
- ✅ 강력한 인터랙티브 기능
- ✅ 터치 제스처 지원
- ✅ 실시간 업데이트 지원
- ⚠️ 상업적 사용 시 유료 라이선스 필요

**UI 스타일:**

- 매우 현대적이고 세련된 디자인
- 부드러운 애니메이션
- 인터랙티브 툴팁
- 반응형 디자인

**코드 예시:**

```vue
<template>
  <apexchart type="line" :options="chartOptions" :series="series" />
</template>

<script setup>
import VueApexCharts from 'vue3-apexcharts'
</script>
```

**장점:**

- 가장 예쁜 UI
- 강력한 인터랙티브 기능
- 터치 제스처 지원
- 실시간 업데이트

**단점:**

- 상업적 사용 시 유료 (월 $99)
- 번들 크기가 큼
- 학습 곡선이 있음

---

### 3. ECharts (vue-echarts) ⭐⭐⭐ (강력한 기능 필요 시)

**설치:**

```bash
npm install echarts vue-echarts
```

**특징:**

- ✅ Vue 3 공식 지원
- ✅ 매우 강력한 기능
- ✅ 3D 차트 지원
- ✅ 대용량 데이터 처리
- ⚠️ 문서가 주로 중국어
- ⚠️ 번들 크기가 매우 큼

**UI 스타일:**

- 중국 스타일 (Baidu 개발)
- 매우 다양한 옵션
- 3D 차트 지원

**장점:**

- 매우 강력한 기능
- 3D 차트 지원
- 대용량 데이터 처리
- 무료 (Apache 2.0)

**단점:**

- 문서가 주로 중국어
- 번들 크기가 매우 큼 (~700KB)
- 복잡함
- UI 스타일이 서구와 다를 수 있음

---

### 4. Plotly.js ⭐⭐ (과학적 데이터 시각화 필요 시)

**설치:**

```bash
npm install plotly.js-dist-min vue-plotly
```

**특징:**

- ✅ Vue 3 지원
- ✅ 3D 차트 매우 강력
- ✅ 과학적 데이터 시각화
- ⚠️ 번들 크기가 매우 큼 (~3MB)
- ⚠️ 일반 비즈니스 차트에는 과함

**UI 스타일:**

- 과학/엔지니어링 스타일
- 전문적인 느낌
- 3D 시각화 강력

**장점:**

- 3D 차트 매우 강력
- 과학적 데이터 처리
- 대용량 데이터

**단점:**

- 번들 크기가 매우 큼
- 일반 비즈니스 차트에는 과함
- 학습 곡선이 있음

---

## 🎯 요구사항별 추천

### 현재 프로젝트 요구사항

- ✅ Line, Bar, Scatter, Area, Pie 차트
- ✅ X/Y축 필드 선택
- ✅ 집계 기능 (sum, count, avg, min, max)
- ✅ 그룹화 기능
- ✅ 차트 설정 저장/재사용
- ✅ Quasar 디자인 시스템과 통합

### 추천 순위

#### 1순위: Chart.js + vue-chartjs ⭐⭐⭐⭐⭐

**이유:**

- ✅ 모든 요구사항 충족
- ✅ 가볍고 빠름
- ✅ 문서화가 잘 되어 있음
- ✅ 커뮤니티가 큼
- ✅ 무료 (MIT)
- ✅ Quasar와 잘 어울림
- ✅ 학습 곡선이 낮음

**단점:**

- 3D 차트는 별도 플러그인 필요 (현재 요구사항에 없음)

#### 2순위: ApexCharts ⭐⭐⭐⭐

**이유:**

- ✅ 매우 예쁜 UI
- ✅ 강력한 인터랙티브 기능
- ✅ 모든 요구사항 충족

**단점:**

- ⚠️ 상업적 사용 시 유료 (월 $99)
- 번들 크기가 큼

#### 3순위: ECharts ⭐⭐⭐

**이유:**

- ✅ 매우 강력한 기능
- ✅ 무료

**단점:**

- ⚠️ 문서가 주로 중국어
- ⚠️ 번들 크기가 매우 큼
- ⚠️ 복잡함

---

## 💡 최종 추천

### Chart.js + vue-chartjs 추천

**이유:**

1. **요구사항 충족**: 모든 필요한 차트 타입 지원
2. **가벼움**: 번들 크기가 작아 성능에 유리
3. **문서화**: 한국어/영어 문서가 잘 되어 있음
4. **커뮤니티**: 문제 해결이 쉬움
5. **무료**: MIT 라이선스로 상업적 사용 가능
6. **통합**: Quasar와 잘 어울림
7. **학습 곡선**: 낮아 빠른 개발 가능

**설치 명령어:**

```bash
npm install chart.js vue-chartjs
```

**다음 단계:**

1. Chart.js 설치
2. `DataChartRenderer.vue` 컴포넌트 생성
3. 기본 차트 타입 구현 (Line, Bar)
4. X/Y축 필드 선택 기능
5. 집계 및 그룹화 기능
6. 차트 설정 저장/로드

---

## 📝 참고 자료

- [Chart.js 공식 문서](https://www.chartjs.org/)
- [vue-chartjs 문서](https://vue-chartjs.org/)
- [ApexCharts 문서](https://apexcharts.com/)
- [ECharts 문서](https://echarts.apache.org/)
- [D3.js 공식 문서](https://d3js.org/)
- [D3.js 상세 가이드](./d3js-detailed-guide.md) - D3.js 완전 분석

---

**작성일:** 차트 뷰 구현 전  
**목적:** 차트 라이브러리 선택 가이드  
**관련 문서:** `docs/d3js-detailed-guide.md` - D3.js 상세 가이드
