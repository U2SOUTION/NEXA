# 날씨 정보 위젯 명세서 -

## 📋 개요

날씨 정보를 표시하는 재사용 가능한 위젯 컴포넌트입니다. 기상청 API 허브를 연동하여 현재 날씨, 예보 정보를 표시하며, 다양한 위치에서 사용할 수 있습니다.

**작성일:** 2024년  
**위젯 위치:** `src/components/widgets/WeatherWidget.vue`  
**상태:** 설계 단계

---

## 🎯 사용처 분류

위젯은 다음 3가지 사용처에서 활용됩니다:

### 1. 메인 요약 페이지 (Main Summary Page)

**위치:** 컨텐츠 진입 전 메인 페이지  
**예시:** `PartsManagementPage.vue`  
**특징:**

- 현재 날씨 상태 강조 표시
- 아이콘과 차트로 시각적 표현
- 지역 선택 및 시간대 선택 가능

**권장 설정:**

```vue
<WeatherWidget variant="main" :auto-detect-location="true" time-range="current" weather-display-mode="both" />
```

### 2. 사이드바 (Sidebar)

**위치:** 사이드바 영역  
**예시:** `MainLayout.vue` 사이드바  
**특징:**

- 작은 크기로 컴팩트하게 표시
- 아이콘만 표시 (차트 생략)
- 공간 절약을 위한 동적 숨김 활성화

**권장 설정:**

```vue
<WeatherWidget variant="sidebar" :auto-detect-location="true" time-range="current" weather-display-mode="icon" :auto-hide="true" :collapse-threshold="200" />
```

### 3. 넥사 위젯 (Nexa Widget)

**위치:** 넥사 보드 (향후 구현)  
**예시:** `NexaBoardPage.vue` 위젯 시스템  
**특징:**

- 사용자가 선택하여 배치 가능
- 위젯 크기에 따라 자동 조정
- 사용자 설정으로 표시 항목 선택 가능
- 드래그 앤 드롭으로 위치 변경

**권장 설정:**

```vue
<NexaWidget type="weather" :settings="widgetSettings">
  <WeatherWidget variant="widget" :auto-detect-location="widgetSettings.autoDetectLocation" :time-range="widgetSettings.timeRange" :weather-display-mode="widgetSettings.displayMode" size="auto" />
</NexaWidget>
```

---

## 🎯 핵심 요구사항

### 1. 위젯화

- 재사용 가능한 독립 위젯 컴포넌트
- 프로젝트 전역에서 사용 가능
- Props를 통한 유연한 설정

### 2. 지역 관리

- 자동으로 자신의 지역 선택 (Geolocation API)
- 타 지역 선택 가능
- 지역 저장 및 다음 로딩 시 저장된 지역 우선 표시

### 3. 시간대별 구분

- 현재: 실시간 현재 날씨
- 초단기: 6시간 이내 상세 예보
- 단기: 3일간 날씨 예보
- 오늘: 오늘 하루 날씨
- 주간: 7일간 날씨 예보
- 월간: 월 단위 날씨 예보

### 4. 표시 방식

- 아이콘 약식 표현: 날씨 상태별 이모지/아이콘
- 차트 표현: 시간별/일별 데이터 시각화
- 아이콘 + 차트 동시 표시

### 5. 반응형 크기 조정

- 부모 영역에 자동으로 맞춤
- `clamp()` 함수를 사용한 반응형 크기
- 컨테이너 크기에 따라 자동 조정

### 6. 동적 숨김/펼침

- 공간이 부족할 때 자동으로 숨김
- `ResizeObserver`를 사용한 동적 감지
- 사용자 설정으로 수동 제어 가능

---

## 📐 컴포넌트 구조

### Props

```typescript
interface WeatherWidgetProps {
  // 지역 설정
  autoDetectLocation?: boolean // 자동 위치 감지 (기본값: true)
  defaultLocation?: Location // 기본 지역
  allowLocationChange?: boolean // 지역 변경 허용 (기본값: true)

  // 시간대 선택
  timeRange?: 'current' | 'ultraShort' | 'short' | 'today' | 'week' | 'month' // 기본값: 'current'
  allowTimeRangeChange?: boolean // 시간대 변경 허용 (기본값: true)

  // 표시 방식
  size?: 'small' | 'medium' | 'large' | 'auto' // 기본값: 'auto'
  variant?: 'main' | 'sidebar' | 'widget' // 사용처별 프리셋 (기본값: 'main')
  weatherDisplayMode?: 'icon' | 'chart' | 'both' // 표시 방식 (기본값: 'both')
  showIcon?: boolean // 아이콘 표시 (기본값: true)
  showChart?: boolean // 차트 표시 (기본값: true)

  // 저장 기능
  saveLocation?: boolean // 지역 저장 (기본값: true)
  saveTimeRange?: boolean // 시간대 저장 (기본값: true)

  // 동적 숨김/펼침
  autoHide?: boolean // 공간 부족 시 자동 숨김 (기본값: true)
  collapseThreshold?: number // 숨김 임계값 (px, 기본값: 300)

  // API 설정
  apiKey?: string // 기상청 API 키 (환경 변수에서 가져올 수도 있음)
}
```

**variant 프리셋:**

- `main`: 메인 페이지용 (큰 크기, 아이콘 + 차트)
- `sidebar`: 사이드바용 (작은 크기, 아이콘만)
- `widget`: 위젯용 (자동 크기, 사용자 설정 반영)

### Events

```typescript
interface WeatherWidgetEvents {
  'location-change': (location: Location) => void // 지역 변경 시
  'time-range-change': (timeRange: string) => void // 시간대 변경 시
  'weather-update': (weather: WeatherInfo) => void // 날씨 정보 업데이트 시
  error: (error: Error) => void // 에러 발생 시
}
```

### Slots

```vue
<template>
  <!-- 지역 선택 영역 -->
  <slot name="location-selector" :location="selectedLocation" :on-change="onLocationChange">
    <!-- 기본 지역 선택 UI -->
  </slot>

  <!-- 시간대 선택 영역 -->
  <slot name="time-range-selector" :time-range="selectedTimeRange" :on-change="onTimeRangeChange">
    <!-- 기본 시간대 선택 UI -->
  </slot>

  <!-- 날씨 아이콘 영역 -->
  <slot name="weather-icon" :weather="weatherInfo">
    <!-- 기본 날씨 아이콘 -->
  </slot>

  <!-- 날씨 차트 영역 -->
  <slot name="weather-chart" :data="chartData">
    <!-- 기본 날씨 차트 -->
  </slot>

  <!-- 날씨 상세 정보 영역 -->
  <slot name="weather-details" :info="weatherInfo">
    <!-- 기본 날씨 상세 정보 -->
  </slot>
</template>
```

---

## 🔧 기능 상세

### 1. 지역 선택 기능

```javascript
// 자동 지역 감지 (Geolocation API 사용)
async function detectUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        // 위도/경도를 기상청 격자 좌표로 변환
        const { nx, ny } = convertToGridCoordinates(latitude, longitude)
        resolve({ nx, ny, latitude, longitude })
      },
      (error) => {
        // 기본 지역으로 폴백 (예: 서울)
        resolve({ nx: 60, ny: 127, latitude: 37.5665, longitude: 126.978 })
      },
    )
  })
}

// 지역 저장 (localStorage)
function saveSelectedLocation(location) {
  localStorage.setItem(
    'weather-location',
    JSON.stringify({
      nx: location.nx,
      ny: location.ny,
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: Date.now(),
    }),
  )
}

// 저장된 지역 불러오기
function loadSavedLocation() {
  const saved = localStorage.getItem('weather-location')
  if (saved) {
    const location = JSON.parse(saved)
    // 24시간 이내 저장된 지역이면 우선 사용
    if (Date.now() - location.timestamp < 24 * 60 * 60 * 1000) {
      return location
    }
  }
  return null
}

// 지역 선택 우선순위
// 1. 저장된 지역 (24시간 이내)
// 2. 자동 감지된 현재 위치
// 3. 기본 지역 (서울)
```

### 2. 시간대별 구분

```javascript
const timeRangeOptions = {
  current: {
    label: '현재',
    apiType: 'current',
    description: '실시간 현재 날씨',
  },
  ultraShort: {
    label: '초단기',
    apiType: 'ultraShort',
    description: '6시간 이내 상세 예보',
    hours: 6,
  },
  short: {
    label: '단기',
    apiType: 'short',
    description: '3일간 날씨 예보',
    days: 3,
  },
  today: {
    label: '오늘',
    apiType: 'today',
    description: '오늘 하루 날씨',
    hours: 24,
  },
  week: {
    label: '주간',
    apiType: 'week',
    description: '7일간 날씨 예보',
    days: 7,
  },
  month: {
    label: '월간',
    apiType: 'month',
    description: '월 단위 날씨 예보',
    days: 30,
  },
}

// 선택된 시간대에 따라 API 호출
async function fetchWeatherData(location, timeRange) {
  const { apiType } = timeRangeOptions[timeRange]

  switch (apiType) {
    case 'current':
      return await getCurrentWeather(location.nx, location.ny)
    case 'ultraShort':
      return await getUltraShortForecast(location.nx, location.ny)
    case 'short':
      return await getShortForecast(location.nx, location.ny)
    case 'today':
      return await getTodayForecast(location.nx, location.ny)
    case 'week':
      return await getWeekForecast(location.nx, location.ny)
    case 'month':
      return await getMonthForecast(location.nx, location.ny)
  }
}
```

### 3. 표시 방식

```javascript
// 아이콘 약식 표현
const weatherIcons = {
  맑음: '☀️',
  구름많음: '⛅',
  흐림: '☁️',
  비: '🌧️',
  눈: '❄️',
  소나기: '🌦️',
  천둥번개: '⛈️',
}

// 차트 표현 (시간별/일별 데이터)
const chartData = computed(() => {
  if (selectedTimeRange.value === 'current') {
    return null // 차트 불필요
  }

  return weatherData.value.map((item) => ({
    time: item.time,
    temperature: item.temperature,
    humidity: item.humidity,
    precipitation: item.precipitation,
  }))
})
```

### 4. 위도/경도 → 격자 좌표 변환

```javascript
// 기상청 격자 좌표 변환 함수
function convertToGridCoordinates(lat, lon) {
  const RE = 6371.00877 // 지구 반경(km)
  const GRID = 5.0 // 격자 간격(km)
  const SLAT1 = 30.0 // 투영 위도1(degree)
  const SLAT2 = 60.0 // 투영 위도2(degree)
  const OLON = 126.0 // 기준점 경도(degree)
  const OLAT = 38.0 // 기준점 위도(degree)
  const XO = 43 // 기준점 X좌표(GRID)
  const YO = 136 // 기준점 Y좌표(GRID)

  const DEGRAD = Math.PI / 180.0
  const RADDEG = 180.0 / Math.PI

  const re = RE / GRID
  const slat1 = SLAT1 * DEGRAD
  const slat2 = SLAT2 * DEGRAD
  const olon = OLON * DEGRAD
  const olat = OLAT * DEGRAD

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5)
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn)
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5)
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5)
  ro = (re * sf) / Math.pow(ro, sn)

  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5)
  ra = (re * sf) / Math.pow(ra, sn)
  let theta = lon * DEGRAD - olon
  if (theta > Math.PI) theta -= 2.0 * Math.PI
  if (theta < -Math.PI) theta += 2.0 * Math.PI
  theta *= sn

  const nx = Math.floor(ra * Math.sin(theta) + XO + 0.5)
  const ny = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5)

  return { nx, ny }
}
```

### 5. 기상청 API 연동

```javascript
// 기상청 API 기본 설정
const API_KEY = import.meta.env.VITE_KMA_API_KEY || props.apiKey
const BASE_URL = 'https://apihub.kma.go.kr/api'

// 현재 날씨 조회
async function getCurrentWeather(nx, ny) {
  const now = new Date()
  const baseDate = now.toISOString().slice(0, 10).replace(/-/g, '')
  const baseTime = String(now.getHours()).padStart(2, '0') + '00'

  const url = `${BASE_URL}/typ01/url/kma_sfctm2.php?tm=${baseDate}${baseTime}&stn=${nx}&authKey=${API_KEY}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    const data = await response.json()
    return parseWeatherData(data)
  } catch (error) {
    console.error('날씨 API 호출 실패:', error)
    emit('error', error)
    throw error
  }
}

// 초단기 예보 조회
async function getUltraShortForecast(nx, ny) {
  // 초단기 예보 API 호출 로직
  // ...
}

// 단기 예보 조회
async function getShortForecast(nx, ny) {
  // 단기 예보 API 호출 로직
  // ...
}
```

---

## 📦 사용 예시

### 1. 메인 요약 페이지 사용

```vue
<template>
  <!-- PartsManagementPage.vue -->
  <div class="api-data-area">
    <WeatherWidget variant="main" :auto-detect-location="true" time-range="current" weather-display-mode="both" />
  </div>
</template>

<script setup>
import WeatherWidget from 'src/components/widgets/WeatherWidget.vue'
</script>
```

### 2. 사이드바 사용

```vue
<template>
  <!-- MainLayout.vue 사이드바 -->
  <div class="sidebar-weather-info">
    <WeatherWidget variant="sidebar" :auto-detect-location="true" time-range="current" weather-display-mode="icon" />
  </div>
</template>

<script setup>
import WeatherWidget from 'src/components/widgets/WeatherWidget.vue'
</script>
```

### 3. 넥사 위젯 사용 (향후)

```vue
<template>
  <!-- NexaBoardPage.vue 위젯 시스템 -->
  <NexaWidget type="weather" :settings="widgetSettings">
    <WeatherWidget variant="widget" :auto-detect-location="widgetSettings.autoDetectLocation" :time-range="widgetSettings.timeRange" :weather-display-mode="widgetSettings.displayMode" size="auto" />
  </NexaWidget>
</template>

<script setup>
import WeatherWidget from 'src/components/widgets/WeatherWidget.vue'

const widgetSettings = ref({
  autoDetectLocation: true,
  timeRange: 'current',
  displayMode: 'both',
  saveLocation: true,
  saveTimeRange: true,
})
</script>
```

### 4. 지역 선택 UI

```vue
<template>
  <div class="weather-widget">
    <!-- 지역 선택 -->
    <div class="location-selector" v-if="allowLocationChange">
      <q-select v-model="selectedLocation" :options="locationOptions" label="지역 선택" @update:model-value="onLocationChange" />
      <q-btn icon="my_location" @click="detectCurrentLocation" label="현재 위치" />
    </div>

    <!-- 시간대 선택 -->
    <div class="time-range-selector" v-if="allowTimeRangeChange">
      <q-btn-toggle v-model="selectedTimeRange" :options="timeRangeOptions" @update:model-value="onTimeRangeChange" />
    </div>

    <!-- 날씨 표시 -->
    <div class="weather-display">
      <!-- 아이콘 표시 -->
      <div v-if="showIcon" class="weather-icon">
        {{ weatherIcon }}
      </div>

      <!-- 차트 표시 -->
      <div v-if="showChart && chartData" class="weather-chart">
        <ChartComponent type="line" :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>
```

---

## 🚀 향후 확장 계획

### 1. 추가 날씨 정보

- 일출/일몰 시간
- 자외선 지수
- 대기질 정보
- 강수 확률 상세

### 2. 애니메이션 효과

- 날씨 아이콘 전환 애니메이션
- 차트 데이터 업데이트 애니메이션
- 로딩 스켈레톤

### 3. 알림 기능

- 날씨 경보 알림
- 특정 조건 알림 (비 예보, 폭염 등)

---

## 📝 구현 체크리스트

### Phase 1: 기본 구조

- [ ] 위젯 파일 생성 (`WeatherWidget.vue`)
- [ ] Props 정의
- [ ] 기본 날씨 정보 표시
- [ ] 반응형 크기 조정

### Phase 2: 지역 관리

- [ ] Geolocation API 연동
- [ ] 자동 위치 감지
- [ ] 지역 선택 UI
- [ ] 지역 저장/불러오기 (localStorage)
- [ ] 위도/경도 → 격자 좌표 변환 함수

### Phase 3: 시간대별 구분

- [ ] 시간대 선택 UI
- [ ] 시간대별 API 호출
- [ ] 시간대 저장/불러오기

### Phase 4: 표시 방식

- [ ] 아이콘 약식 표현
- [ ] 차트 표현 (시간별/일별)
- [ ] 아이콘 + 차트 동시 표시

### Phase 5: 기상청 API 연동

- [ ] 기상청 API 연동
- [ ] 현재 날씨 조회
- [ ] 초단기 예보 조회
- [ ] 단기 예보 조회
- [ ] 오늘/주간/월간 예보 조회
- [ ] 에러 처리

---

## 🔗 관련 파일

- **위젯 위치:** `src/components/widgets/WeatherWidget.vue`
- **스타일 파일:** `src/components/widgets/WeatherWidget.scss` (또는 컴포넌트 내부)
- **API 서비스:** `src/services/weatherService.js`
- **유틸리티:** `src/utils/coordinateConverter.js` (좌표 변환)
- **타입 정의:** `src/types/weatherWidget.ts` (선택사항)
- **사용 예시:**
  - 메인 페이지: `src/pages/PartsManagementPage.vue`
  - 사이드바: `src/layouts/MainLayout.vue`
  - 넥사 위젯: `src/components/NexaWidget.vue` (향후 구현)

---

## 📌 참고사항

1. **API 키 관리**

   - 환경 변수로 관리 (`VITE_KMA_API_KEY`)
   - Props로도 전달 가능
   - 보안을 위해 클라이언트에 노출되지 않도록 주의

2. **성능 최적화**

   - API 호출 캐싱 (일정 시간 동안 재사용)
   - 불필요한 API 호출 방지
   - ResizeObserver는 적절히 cleanup

3. **에러 처리**

   - API 호출 실패 시 사용자에게 알림
   - 기본값 또는 캐시된 데이터 표시
   - 재시도 로직 구현

4. **접근성**

   - ARIA 레이블 추가
   - 키보드 네비게이션 지원
   - 스크린 리더 지원

5. **테마 호환성**

   - CSS 변수 사용으로 테마 자동 적용
   - 다크 모드 지원

---

**작성자:** AI Assistant  
**최종 수정일:** 2024년
