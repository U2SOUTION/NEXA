# 시간 정보 위젯 명세서 수정

## 📋 개요

시간 정보를 표시하는 재사용 가능한 위젯 컴포넌트입니다. 시간, 날짜, 상세 시간 정보를 표시하며, 다양한 위치에서 사용할 수 있습니다.

**작성일:** 2024년  
**위젯 위치:** `src/components/widgets/TimeWidget.vue`  
**상태:** 설계 단계

---

## 🎯 사용처 분류

위젯은 다음 3가지 사용처에서 활용됩니다:

### 1. 메인 요약 페이지 (Main Summary Page)

**위치:** 컨텐츠 진입 전 메인 페이지  
**예시:** `PartsManagementPage.vue`  
**특징:**

- 큰 크기로 강조 표시
- 모든 정보 표시 (시간, 날짜, 상세 정보)
- 요일별 색상 적용
- 호버 상세 정보 제공

**권장 설정:**

```vue
<TimeWidget :show-time="true" :show-date="true" :show-detailed="true" size="large" :enable-day-color="true" :show-hover-details="true" />
```

### 2. 사이드바 (Sidebar)

**위치:** 사이드바 영역  
**예시:** `MainLayout.vue` 사이드바  
**특징:**

- 작은 크기로 컴팩트하게 표시
- 필수 정보만 표시 (시간, 날짜)
- 상세 정보는 호버 시에만 표시
- 공간 절약을 위한 동적 숨김 활성화

**권장 설정:**

```vue
<TimeWidget :show-time="true" :show-date="true" :show-detailed="false" size="small" :auto-hide="true" :collapse-threshold="200" :show-hover-details="true" />
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
<NexaWidget type="time" :settings="widgetSettings">
  <TimeWidget variant="widget" :show-time="widgetSettings.showTime" :show-date="widgetSettings.showDate" :show-detailed="widgetSettings.showDetailed" size="auto" />
</NexaWidget>
```

---

## 🎯 핵심 요구사항

### 1. 위젯화

- 재사용 가능한 독립 위젯 컴포넌트
- 프로젝트 전역에서 사용 가능
- Props를 통한 유연한 설정

### 2. 반응형 크기 조정

- 부모 영역에 자동으로 맞춤
- `clamp()` 함수를 사용한 반응형 폰트 크기
- 컨테이너 크기에 따라 자동 조정

### 3. 선택적 항목 표시

- 시간 (AM/PM 형식)
- 날짜 (년월일 요일)
- 상세 시간 정보 (우주나이, 지구나이, 밀리초 단위)
- 각 항목을 Props로 제어 가능

### 4. 동적 숨김/펼침

- 공간이 부족할 때 자동으로 숨김
- `ResizeObserver`를 사용한 동적 감지
- 사용자 설정으로 수동 제어 가능

### 5. 마우스 호버 상세 정보

- 마우스 호버 시 상세 정보 표시
- 툴팁 또는 확장 영역으로 표시
- 애니메이션 효과 적용

---

## 📐 컴포넌트 구조

### Props

```typescript
interface TimeWidgetProps {
  // 표시할 항목 선택
  showTime?: boolean // 기본 시간 표시 (기본값: true)
  showDate?: boolean // 날짜 표시 (기본값: true)
  showDetailed?: boolean // 상세 시간 정보 표시 (기본값: true)

  // 크기 조정
  size?: 'small' | 'medium' | 'large' | 'auto' // 기본값: 'auto'
  variant?: 'main' | 'sidebar' | 'widget' // 사용처별 프리셋 (기본값: 'main')
  timeSize?: string // 시간 폰트 크기 (clamp 형식, variant가 'auto'일 때 사용)
  dateSize?: string // 날짜 폰트 크기 (clamp 형식, variant가 'auto'일 때 사용)

  // 동적 숨김/펼침
  autoHide?: boolean // 공간 부족 시 자동 숨김 (기본값: true)
  collapseThreshold?: number // 숨김 임계값 (px, 기본값: 300)

  // 호버 상세 정보
  showHoverDetails?: boolean // 호버 시 상세 정보 표시 (기본값: true)
  hoverDelay?: number // 호버 지연 시간 (ms, 기본값: 500)

  // 요일별 색상
  enableDayColor?: boolean // 요일별 색상 적용 (기본값: true)

  // 업데이트 주기
  updateInterval?: number // 업데이트 주기 (ms, 기본값: 10)
}
```

**variant 프리셋:**

- `main`: 메인 페이지용 (큰 크기, 모든 정보 표시)
- `sidebar`: 사이드바용 (작은 크기, 필수 정보만)
- `widget`: 위젯용 (자동 크기, 사용자 설정 반영)

### Events

```typescript
interface TimeWidgetEvents {
  'time-update': (time: TimeInfo) => void // 시간 업데이트 시
  'hover-enter': () => void // 호버 진입 시
  'hover-leave': () => void // 호버 나갈 시
}
```

### Slots

```vue
<template>
  <!-- 기본 시간 표시 영역 -->
  <slot name="time" :time="timeInfo">
    <!-- 기본 시간 표시 -->
  </slot>

  <!-- 날짜 표시 영역 -->
  <slot name="date" :date="dateInfo">
    <!-- 기본 날짜 표시 -->
  </slot>

  <!-- 상세 정보 표시 영역 -->
  <slot name="detailed" :detailed="detailedInfo">
    <!-- 기본 상세 정보 표시 -->
  </slot>

  <!-- 호버 상세 정보 영역 -->
  <slot name="hover-details" :info="allInfo">
    <!-- 기본 호버 상세 정보 -->
  </slot>
</template>
```

---

## 🎨 스타일링

### CSS 변수 사용

- 테마 색상 변수 활용 (`--nexa-accent`, `--nexa-text-primary` 등)
- 요일별 색상 정의
- 반응형 크기 조정

### 요일별 색상 (예시)

```scss
$day-colors: (
  'sunday': #ff6b6b,
  // 일요일: 빨간색
  'monday': #4ecdc4,
  // 월요일: 청록색
  'tuesday': #45b7d1,
  // 화요일: 하늘색
  'wednesday': #f9ca24,
  // 수요일: 노란색
  'thursday': #6c5ce7,
  // 목요일: 보라색
  'friday': #a29bfe,
  // 금요일: 연보라색
  'saturday': #fd79a8, // 토요일: 분홍색
);
```

### Variant별 스타일

#### 1. Main (메인 페이지)

```scss
.time-widget.variant-main {
  width: 100%;
  height: auto;

  .current-time {
    font-size: clamp(3rem, 12vw, 20rem);
    font-weight: 900;
  }

  .current-date {
    font-size: clamp(1rem, 4vw, 6.67rem);
    font-weight: 500;
  }

  .detailed-time-info {
    font-size: clamp(0.5rem, 1.2vw, 1.2rem);
  }
}
```

#### 2. Sidebar (사이드바)

```scss
.time-widget.variant-sidebar {
  width: 100%;
  padding: 8px;

  .current-time {
    font-size: clamp(1.2rem, 3vw, 2rem);
    font-weight: 700;
  }

  .current-date {
    font-size: clamp(0.7rem, 1.5vw, 1rem);
    font-weight: 400;
  }

  .detailed-time-info {
    display: none; // 기본 숨김, 호버 시에만 표시
  }

  &.collapsed {
    display: none;
  }
}
```

#### 3. Widget (넥사 위젯)

```scss
.time-widget.variant-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .current-time {
    font-size: clamp(1.5rem, 8vw, 8rem);
    font-weight: 800;
  }

  .current-date {
    font-size: clamp(0.8rem, 3vw, 2rem);
    font-weight: 500;
  }

  .detailed-time-info {
    font-size: clamp(0.4rem, 1vw, 0.8rem);
  }

  // 위젯 크기에 따라 동적 조정
  &.widget-small {
    .current-time {
      font-size: clamp(1rem, 5vw, 4rem);
    }
  }

  &.widget-large {
    .current-time {
      font-size: clamp(2rem, 10vw, 12rem);
    }
  }
}
```

---

## 🔧 기능 상세

### 1. 시간 정보 계산

```javascript
// 우주 나이 (약 13,800,000,000년, 빅뱅 이후)
const COSMIC_AGE_YEARS = 13_800_000_000

// 지구 나이 (약 4,543,000,000년)
const EARTH_AGE_YEARS = 4_543_000_000

function calculateTimeInfo() {
  const now = new Date()

  return {
    time: {
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
      milliseconds: now.getMilliseconds(),
      ampm: now.getHours() >= 12 ? 'PM' : 'AM',
    },
    date: {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      date: now.getDate(),
      weekday: now.getDay(),
      weekdayName: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][now.getDay()],
    },
    detailed: {
      cosmicAge: COSMIC_AGE_YEARS,
      earthAge: EARTH_AGE_YEARS,
      formatted: `CA${COSMIC_AGE_YEARS}EA${EARTH_AGE_YEARS}Y${year}M${month}D${date}H${h}MIN${m}S${s}MS${ms}`,
    },
  }
}
```

### 2. 동적 숨김/펼침

```javascript
const containerRef = ref(null)
const isCollapsed = ref(false)
let resizeObserver = null

function setupResizeObserver() {
  if (!containerRef.value) return

  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect

      // 임계값 이하일 때 숨김
      if (props.autoHide && (width < props.collapseThreshold || height < props.collapseThreshold)) {
        isCollapsed.value = true
      } else {
        isCollapsed.value = false
      }
    }
  })

  resizeObserver.observe(containerRef.value)
}
```

### 3. 호버 상세 정보

```javascript
const isHovered = ref(false)
let hoverTimer = null

function handleMouseEnter() {
  hoverTimer = setTimeout(() => {
    if (props.showHoverDetails) {
      isHovered.value = true
      emit('hover-enter')
    }
  }, props.hoverDelay)
}

function handleMouseLeave() {
  if (hoverTimer) {
    clearTimeout(hoverTimer)
    hoverTimer = null
  }
  isHovered.value = false
  emit('hover-leave')
}
```

### 4. 요일별 색상 적용

```javascript
const dayColor = computed(() => {
  if (!props.enableDayColor) {
    return 'var(--nexa-accent, #1976d2)'
  }

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const currentDay = dayNames[timeInfo.value.date.weekday]

  return `var(--time-day-${currentDay}, ${dayColors[currentDay]})`
})
```

---

## 📦 사용 예시

### 1. 메인 요약 페이지 사용

```vue
<template>
  <!-- PartsManagementPage.vue -->
  <div class="api-data-area">
    <TimeWidget variant="main" />
  </div>
</template>

<script setup>
import TimeWidget from 'src/components/widgets/TimeWidget.vue'
</script>
```

### 2. 사이드바 사용

```vue
<template>
  <!-- MainLayout.vue 사이드바 -->
  <div class="sidebar-time-info">
    <TimeWidget variant="sidebar" />
  </div>
</template>

<script setup>
import TimeWidget from 'src/components/widgets/TimeWidget.vue'
</script>
```

### 3. 넥사 위젯 사용 (향후)

```vue
<template>
  <!-- NexaBoardPage.vue 위젯 시스템 -->
  <NexaWidget type="time" :settings="widgetSettings">
    <TimeWidget variant="widget" :show-time="widgetSettings.showTime" :show-date="widgetSettings.showDate" :show-detailed="widgetSettings.showDetailed" size="auto" />
  </NexaWidget>
</template>

<script setup>
import TimeWidget from 'src/components/widgets/TimeWidget.vue'

const widgetSettings = ref({
  showTime: true,
  showDate: true,
  showDetailed: false,
  enableDayColor: true,
})
</script>
```

---

## 🚀 향후 확장 계획

### 1. 추가 시간 정보

- 타임존 정보
- 일출/일몰 시간
- 계절 정보
- 공휴일 정보

### 2. 애니메이션 효과

- 시간 업데이트 시 부드러운 전환
- 호버 시 확장 애니메이션
- 숫자 카운트업 효과

### 3. 설정 저장

- 사용자 설정 저장 (localStorage)
- 표시 항목 선택 저장
- 크기 설정 저장

---

## 📝 구현 체크리스트

### Phase 1: 기본 구조

- [ ] 위젯 파일 생성 (`TimeWidget.vue`)
- [ ] Props 정의
- [ ] 기본 시간/날짜 표시
- [ ] 반응형 크기 조정
- [ ] 요일별 색상 적용

### Phase 2: 동적 기능

- [ ] ResizeObserver 구현
- [ ] 동적 숨김/펼침 기능
- [ ] 호버 상세 정보 표시
- [ ] 이벤트 emit 구현

### Phase 3: 확장성

- [ ] 슬롯 구현
- [ ] 선택적 항목 표시
- [ ] 커스터마이징 옵션

---

## 🔗 관련 파일

- **위젯 위치:** `src/components/widgets/TimeWidget.vue`
- **스타일 파일:** `src/components/widgets/TimeWidget.scss` (또는 컴포넌트 내부)
- **타입 정의:** `src/types/timeWidget.ts` (선택사항)
- **사용 예시:**
  - 메인 페이지: `src/pages/PartsManagementPage.vue`
  - 사이드바: `src/layouts/MainLayout.vue`
  - 넥사 위젯: `src/components/NexaWidget.vue` (향후 구현)

---

## 📌 참고사항

1. **성능 최적화**

   - `updateInterval`을 적절히 설정 (기본 10ms는 밀리초 표시용)
   - ResizeObserver는 적절히 cleanup
   - 불필요한 리렌더링 방지

2. **접근성**

   - ARIA 레이블 추가
   - 키보드 네비게이션 지원
   - 스크린 리더 지원

3. **테마 호환성**

   - CSS 변수 사용으로 테마 자동 적용
   - 다크 모드 지원

4. **브라우저 호환성**
   - ResizeObserver 폴리필 고려
   - CSS clamp() 지원 확인

---

**작성자:** AI Assistant  
**최종 수정일:** 2024년
