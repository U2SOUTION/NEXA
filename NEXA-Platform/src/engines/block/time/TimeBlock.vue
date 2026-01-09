<template>
  <div class="time-block" :class="[`variant-${variant}`]">
    <div class="current-time" :style="{ color: timeColor }">
      {{ currentTime }}
    </div>
    <div class="current-date">
      {{ currentDate }}
    </div>
    <div class="detailed-time-info">
      {{ detailedTimeString }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => {
      return ['default', 'main', 'sidebar', 'compact'].includes(value)
    },
  },
  showDetailed: {
    type: Boolean,
    default: true,
  },
})

// 우주 나이 계산 (약 13,800,000,000년, 빅뱅 이후)
const COSMIC_AGE_YEARS = 13_800_000_000
// 지구 나이 계산 (약 4,543,000,000년)
const EARTH_AGE_YEARS = 4_543_000_000

const currentTime = ref('')
const currentDate = ref('')
const detailedTimeString = ref('')
let timeInterval = null

function updateDateTime() {
  const now = new Date()

  let hours = now.getHours()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${ampm} ${String(hours).padStart(2, '0')}:${minutes}:${seconds}`

  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const date = now.getDate()
  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
  currentDate.value = `${year}년 ${month}월 ${date}일 ${weekdays[now.getDay()]}`

  // 세밀한 시간 정보 (라벨, 단위, 콤마 제거, 시간 단위 약어를 접두어로 사용)
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  const ms = String(now.getMilliseconds()).padStart(3, '0')

  detailedTimeString.value = `CA${COSMIC_AGE_YEARS}EA${EARTH_AGE_YEARS}Y${year}M${month}D${date}H${h}MIN${m}S${s}MS${ms}`
}

// 요일에 따른 색상 계산
const timeColor = computed(() => {
  const now = new Date()
  const day = now.getDay()
  const colors = [
    '#FF8C00', // 일요일 - 빨강
    '#B0C4DE', // 월요일 - 은은한 달빛
    '#FF4500', // 화요일 - 활활 타는 불꽃
    '#1E90FF', // 수요일 - 맑고 깊은 물
    '#228B22', // 목요일 - 푸르른 나무
    '#FFD700', // 금요일 - 빛나는 황금
    '#8B4513', // 토요일 - 견고한 흙
  ]
  return colors[day] || 'var(--nexa-accent, #1976d2)'
})

onMounted(() => {
  updateDateTime()
  // 밀리초 단위 업데이트를 위해 10ms 간격으로 업데이트
  timeInterval = setInterval(updateDateTime, 10)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
    timeInterval = null
  }
})
</script>

<style lang="scss" scoped>
.time-block {
  text-align: left;

  &.variant-main {
    .current-time {
      font-size: clamp(3rem, 12vw, 20rem);
    }
    .current-date {
      font-size: clamp(1rem, 4vw, 6.67rem);
    }
    .detailed-time-info {
      font-size: clamp(0.5rem, 1.2vw, 1.2rem);
    }
  }

  &.variant-sidebar {
    .current-time {
      font-size: clamp(1.5rem, 3vw, 4rem);
    }
    .current-date {
      font-size: clamp(0.8rem, 2vw, 2rem);
    }
    .detailed-time-info {
      font-size: clamp(0.4rem, 1vw, 0.8rem);
    }
  }

  &.variant-compact {
    .current-time {
      font-size: clamp(1rem, 2vw, 2.5rem);
    }
    .current-date {
      font-size: clamp(0.6rem, 1.5vw, 1.5rem);
    }
    .detailed-time-info {
      display: none;
    }
  }
}

.current-time {
  font-size: clamp(3rem, 12vw, 20rem);
  font-weight: 900;
  font-family: 'Impact', 'Arial Black', 'Roboto Black', sans-serif;
  letter-spacing: clamp(2px, 0.5vw, 4px);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

.current-date {
  font-size: clamp(1rem, 4vw, 6.67rem);
  font-weight: 500;
  color: #b3ff0091;
  font-family: 'Impact', 'Arial Black', 'Roboto Black', sans-serif;
  letter-spacing: clamp(2px, 0.5vw, 4px);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

.detailed-time-info {
  margin-top: -2px;
  letter-spacing: clamp(0.1em, 0.5vw, 1.5em);
  color: #fb01019a;
  font-variant-numeric: tabular-nums;
}
</style>
