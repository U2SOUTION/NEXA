<!-- DevMenuSlider.vue
  개발 도구 가로 스크롤 메뉴 슬라이더
  사이드바 크기 변화에 대응하고 스크롤 스냅 기능 제공
-->
<template>
  <div class="dev-menu-slider-wrapper" ref="wrapperRef" :style="{ '--menu-item-gap': `${MENU_ITEM_GAP}px` }" @mouseenter="isMenuHovered = true" @mouseleave="isMenuHovered = false">
    <!-- 상단 인디케이터 영역 (점 + 화살표) -->
    <div class="indicator-area">
      <!-- 왼쪽 영역 (화살표) -->
      <div class="indicator-left">
        <q-btn flat dense round icon="chevron_left" class="nav-arrow nav-arrow-left" :class="{ 'nav-arrow-visible': showArrows }" @click="scrollToPrevious" />
      </div>
      <!-- 중앙 영역 (점 인디케이터) -->
      <div class="indicator-center" @click="handleIndicatorClick">
        <div class="dot-indicators">
          <div v-for="(menu, index) in devMenus" :key="menu.id" :class="{ 'dot-active': activeDotIndex === index }" class="dot-indicator" :data-index="index"></div>
        </div>
      </div>
      <!-- 오른쪽 영역 (화살표 + Step 버튼) -->
      <div class="indicator-right">
        <q-btn flat dense round icon="chevron_right" class="nav-arrow nav-arrow-right" :class="{ 'nav-arrow-visible': showArrows }" @click="scrollToNext" />
        <button class="step-button" @click="handleStepButtonClick">Step {{ wheelScrollStep }}</button>
      </div>
    </div>
    <!-- 가로 스크롤 메뉴 -->
    <div class="dev-menu-slider" ref="sliderRef">
      <div class="dev-menu-container" ref="containerRef">
        <!-- 무한 스크롤을 위한 복제: 끝 부분 복제 (앞에 배치) -->
        <q-btn v-for="(menu, index) in devMenus" :key="`clone-end-${menu.id}`" :class="{ 'menu-active': activeMenu === menu.id && activeMenu !== null }" :style="menuItemStyle" flat dense no-caps class="menu-item" @click="handleMenuItemClick(index)">
          <div class="menu-item-content">
            <div class="menu-item-number">{{ index + 1 }}</div>
            <q-icon :name="menu.icon" class="q-mr-xs menu-icon" />
            <span class="menu-label">{{ menu.label }}</span>
          </div>
        </q-btn>
        <!-- 원본 메뉴 항목 -->
                <q-btn v-for="(menu, index) in devMenus" :key="menu.id" :class="{ 'menu-active': activeMenu === menu.id && activeMenu !== null }" :style="menuItemStyle" flat dense no-caps class="menu-item" @click="handleMenuItemClick(index)">
          <div class="menu-item-content">
            <div class="menu-item-number">{{ index + 1 }}</div>
            <q-icon :name="menu.icon" class="q-mr-xs menu-icon" />
            <span class="menu-label">{{ menu.label }}</span>
          </div>
        </q-btn>
        <!-- 무한 스크롤을 위한 복제: 처음 부분 복제 (뒤에 배치) -->
                <q-btn v-for="(menu, index) in devMenus" :key="`clone-start-${menu.id}`" :class="{ 'menu-active': activeMenu === menu.id && activeMenu !== null }" :style="menuItemStyle" flat dense no-caps class="menu-item" @click="handleMenuItemClick(index)">
          <div class="menu-item-content">
            <div class="menu-item-number">{{ index + 1 }}</div>
            <q-icon :name="menu.icon" class="q-mr-xs menu-icon" />
            <span class="menu-label">{{ menu.label }}</span>
          </div>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  headerHovered: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['openSettings', 'update:activeMenu'])

const $q = useQuasar()

// 메뉴 항목 정의 (18개)
// 중요도 순서: 문서관리/테마관리(최우선) → 구현된 도구 → 개발/디버깅 도구 → 관리/유틸리티 도구
const devMenus = [
  // 최우선: 핵심 관리 도구
  { id: 'dev-guide', label: '개발 가이드', icon: 'style' },
  { id: 'document-manager', label: '문서 관리', icon: 'description' },
  { id: 'theme-manager', label: '테마 관리', icon: 'palette' },
  // 구현된 개발 도구 (높은 중요도)
  { id: 'component-library', label: '컴포넌트', icon: 'widgets' },
  { id: 'database-viewer', label: '데이터베이스', icon: 'storage' },
  // 개발/테스트 도구 (중요도 높음)
  { id: 'performance-monitor', label: '성능 모니터', icon: 'speed' },
  // 시스템 관리 도구
  { id: 'settings-manager', label: '설정 관리', icon: 'settings' },
  // 문서/분석 도구
  { id: 'document-generator', label: '그래프독', icon: 'account_tree' },
  // DevOps 도구
  { id: 'devops', label: 'DevOps', icon: 'build' },
]

// 초기 activeMenu 로드 함수 (DevelopmentPage와 동일한 로직)
function getInitialActiveMenu() {
  try {
    // 이전 메뉴 복원 옵션 확인
    const restoreOption = localStorage.getItem('dev-restore-last-menu')
    const shouldRestore = restoreOption === null || restoreOption === 'true' // 기본값: true

    if (shouldRestore) {
      const saved = localStorage.getItem('dev-active-menu')
      if (saved) {
        // 유효한 메뉴 ID인지 확인
        const validMenus = devMenus.map((menu) => menu.id)
        if (validMenus.includes(saved)) {
          return saved
        }
      }
    }
  } catch (error) {
    console.error('[DevMenuSlider] 초기 메뉴 로드 실패:', error)
  }
  return null
}

// 현재 선택된 메뉴 (기본값: null - DevelopmentPage와 동기화)
const initialActiveMenu = getInitialActiveMenu()
const activeMenu = ref(initialActiveMenu)

// 슬라이더 참조
const sliderRef = ref(null)
const containerRef = ref(null)
const wrapperRef = ref(null)

// 활성화된 점 인덱스 (초기 activeMenu에 맞게 설정)
const initialActiveDotIndex = initialActiveMenu
  ? devMenus.findIndex((menu) => menu.id === initialActiveMenu)
  : 0
const activeDotIndex = ref(initialActiveDotIndex >= 0 ? initialActiveDotIndex : 0)

// 메뉴 컨테이너 호버 상태
const isMenuHovered = ref(false)

// 애니메이션 활성화 여부 (디버깅용)
const enableAnimation = ref(true) // false로 설정하면 애니메이션 비활성화

// 휠 스크롤 스텝 수
const wheelScrollStep = ref(1)

// 점프 중 플래그 (점프 발생 시 추가 스크롤 방지)
const isJumping = ref(false)

// 초기화 중 플래그 (초기화 완료 전에는 updateActiveDotIndex가 업데이트하지 않도록)
const isInitializing = ref(true)

// 현재 실행 중인 애니메이션 취소 함수
let cancelCurrentAnimation = null

// 화살표 표시 여부 (헤더 또는 메뉴 컨테이너 호버 상태)
const showArrows = computed(() => props.headerHovered || isMenuHovered.value)

// 모바일 여부
const isMobile = computed(() => $q.screen.width < 768)

// 항목 폭 (모바일/PC 구분만)
const itemWidth = computed(() => (isMobile.value ? 60 : 70))

// 메뉴 아이템 간격 (CSS gap과 동일한 값 유지 필수)
const MENU_ITEM_GAP = 6

// 메뉴 항목 스타일 (단순화: 고정 크기)
const menuItemStyle = computed(() => {
  const width = itemWidth.value

  return {
    width: `${width}px`,
    minWidth: `${width}px`,
    maxWidth: `${width}px`,
  }
})

// 무한 스크롤 전환 체크 (실시간으로 실행)
function checkInfiniteScroll() {
  if (!sliderRef.value || !containerRef.value || cachedSectionWidth === null) return false

  const { scrollLeft, scrollWidth, clientWidth } = sliderRef.value
  const sectionWidth = cachedSectionWidth
  const maxScroll = scrollWidth - clientWidth
  const buffer = 5 // 물리적 끝에 닿기 전 여유값

  // 1. 오른쪽으로 가다가 복제본 섹션(3번 섹션)에 진입하거나 물리적 끝에 도달했을 때
  if (scrollLeft >= sectionWidth * 2 - buffer || scrollLeft >= maxScroll - buffer) {
    // 현재 실행 중인 애니메이션이 있으면 완전히 취소
    if (cancelCurrentAnimation) {
      cancelCurrentAnimation()
      cancelCurrentAnimation = null
    }

    // 현재 위치에서 정확히 한 섹션만큼 왼쪽(원본)으로 좌표 이동
    const newScrollLeft = scrollLeft - sectionWidth
    isJumping.value = true // 점프 플래그 설정
    sliderRef.value.scrollLeft = newScrollLeft
    updateActiveDotIndex()
    // 점프 후 약간의 지연을 두고 플래그 해제 (인덱스 업데이트가 완료된 후)
    setTimeout(() => {
      isJumping.value = false
    }, 100)
    return true
  }

  // 2. 왼쪽으로 가다가 복제본 섹션(1번 섹션)에 진입하거나 0에 도달했을 때
  if (scrollLeft <= buffer) {
    // 현재 실행 중인 애니메이션이 있으면 완전히 취소
    if (cancelCurrentAnimation) {
      cancelCurrentAnimation()
      cancelCurrentAnimation = null
    }

    // 현재 위치에서 정확히 한 섹션만큼 오른쪽(원본)으로 좌표 이동
    const newScrollLeft = scrollLeft + sectionWidth
    isJumping.value = true // 점프 플래그 설정
    sliderRef.value.scrollLeft = newScrollLeft
    updateActiveDotIndex()
    // 점프 후 약간의 지연을 두고 플래그 해제 (인덱스 업데이트가 완료된 후)
    setTimeout(() => {
      isJumping.value = false
    }, 100)
    return true
  }

  return false
}

// 부드러운 스크롤 애니메이션 함수 (수평 스크롤용)
function smoothScrollToLeft(element, targetScrollLeft, duration = 300) {
  if (!element || cachedSectionWidth === null) return Promise.resolve()

  const startScrollLeft = element.scrollLeft

  // ✨ 상대 좌표 기반으로 전달받은 targetScrollLeft를 그대로 사용
  // 정규화 로직은 제거하고, 애니메이션 완료 후 checkInfiniteScroll에서 처리
  const distance = targetScrollLeft - startScrollLeft
  const startTime = performance.now()

  // 애니메이션 비활성화 시 즉시 이동
  if (!enableAnimation.value) {
    element.scrollLeft = targetScrollLeft
    checkInfiniteScroll()
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    let animationFrameId = null
    let isCancelled = false

    function animate(currentTime) {
      // 취소되었거나 점프 중이면 더 이상 진행하지 않음
      if (isCancelled || isJumping.value) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
        }
        cancelCurrentAnimation = null
        resolve()
        return
      }

      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // easeInOutCubic 이징 함수
      const easeInOutCubic = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2

      // 현재 위치에서 목표까지 이동 (상대 좌표 기준)
      const currentScrollLeft = startScrollLeft + distance * easeInOutCubic
      element.scrollLeft = currentScrollLeft

      // 애니메이션 중에도 무한 스크롤 체크 (중요!)
      // 점프가 발생하면 애니메이션을 완전히 중단
      if (checkInfiniteScroll()) {
        // 점프 발생 시 애니메이션 완전히 취소
        isCancelled = true
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
        }
        cancelCurrentAnimation = null
        resolve()
        return
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        // ✨ 애니메이션 완료 후 스냅 처리 로직
        // checkInfiniteScroll에서 복제 영역을 원본 영역으로 좌표를 옮겨줌
        checkInfiniteScroll()
        cancelCurrentAnimation = null
        resolve()
      }
    }

    // 취소 함수 등록
    cancelCurrentAnimation = () => {
      isCancelled = true
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      cancelCurrentAnimation = null
    }

    animationFrameId = requestAnimationFrame(animate)
  })
}

// Step 버튼 클릭 핸들러
function handleStepButtonClick() {
  emit('openSettings')
}

// 메뉴 아이템 클릭 핸들러
function handleMenuItemClick(index) {
  scrollToIndex(index)
  // activeMenu 업데이트 및 이벤트 emit (항상 업데이트하여 재클릭 가능하도록)
  const menuId = devMenus[index].id
  activeMenu.value = menuId
  emit('update:activeMenu', menuId)
}

// localStorage에서 휠 스크롤 스텝 설정 불러오기
function loadWheelScrollStep() {
  try {
    const saved = localStorage.getItem('dev-menu-wheel-scroll-step')
    if (saved) {
      const parsedValue = parseInt(saved, 10)
      if (!isNaN(parsedValue) && parsedValue >= 1 && parsedValue <= 10) {
        wheelScrollStep.value = parsedValue
      }
    }
  } catch (error) {
    console.error('휠 스크롤 스텝 설정 불러오기 실패:', error)
  }
}

// localStorage에서 애니메이션 설정 불러오기
function loadMenuAnimation() {
  try {
    const saved = localStorage.getItem('dev-menu-animation-enabled')
    if (saved !== null) {
      enableAnimation.value = saved === 'true'
    }
  } catch (error) {
    console.error('애니메이션 설정 불러오기 실패:', error)
  }
}

// storage 이벤트로 다른 탭과 동기화
function handleStorageChange(event) {
  if (event.key === 'dev-menu-wheel-scroll-step') {
    loadWheelScrollStep()
  } else if (event.key === 'dev-menu-animation-enabled') {
    loadMenuAnimation()
  }
}

// 인디케이터 클릭 핸들러 (가장 가까운 점 찾기)
function handleIndicatorClick(event) {
  const indicatorCenter = event.currentTarget
  const dots = indicatorCenter.querySelectorAll('.dot-indicator')
  if (dots.length === 0) return

  // 마우스 클릭 위치
  const clickX = event.clientX
  let closestDot = null
  let closestDistance = Infinity

  // 각 점의 중앙 위치와 비교하여 가장 가까운 점 찾기
  dots.forEach((dot) => {
    const rect = dot.getBoundingClientRect()
    const dotCenterX = rect.left + rect.width / 2
    const distance = Math.abs(clickX - dotCenterX)

    if (distance < closestDistance) {
      closestDistance = distance
      closestDot = dot
    }
  })

  // 가장 가까운 점의 인덱스 가져오기
  if (closestDot) {
    const index = parseInt(closestDot.getAttribute('data-index'), 10)
    scrollToIndex(index)
    // 인디케이터 클릭 시에도 메뉴 변경 (의도적인 클릭이므로, 항상 업데이트)
    const menuId = devMenus[index].id
    activeMenu.value = menuId
    emit('update:activeMenu', menuId)
  }
}

// 특정 인덱스로 스크롤 이동
function scrollToIndex(targetIndex) {
  if (!sliderRef.value || !containerRef.value) return

  // 점프 중이면 추가 스크롤 방지
  if (isJumping.value) {
    return
  }

  // 인덱스 범위 체크
  const clampedIndex = Math.max(0, Math.min(targetIndex, devMenus.length - 1))

  // 캐시된 값이 없으면 초기화
  if (cachedItemWidth === null || cachedSectionWidth === null) {
    const firstItem = containerRef.value.querySelector('.menu-item')
    if (!firstItem) return

    const itemWidth = firstItem.offsetWidth
    const gap = MENU_ITEM_GAP
    const itemTotalWidth = itemWidth + gap
    cachedItemWidth = itemTotalWidth
    cachedSectionWidth = itemTotalWidth * devMenus.length
  }

  const itemTotalWidth = cachedItemWidth
  const sectionWidth = cachedSectionWidth
  const { clientWidth } = sliderRef.value

  // 원본 섹션 기준 목표 위치 계산 (화면 중앙에 아이템이 오도록)
  const targetItemCenter = sectionWidth + clampedIndex * itemTotalWidth + itemTotalWidth / 2
  const targetScrollLeft = targetItemCenter - clientWidth / 2

  // 부드럽게 스크롤 (직접 구현한 애니메이션 사용)
  smoothScrollToLeft(sliderRef.value, targetScrollLeft, 500)
}

// 현재 인덱스에서 N개 이동 (양수: 다음, 음수: 이전)
function scrollByItems(step) {
  // 점프 중이면 추가 스크롤 방지
  if (isJumping.value) {
    return
  }

  const targetIndex = activeDotIndex.value + step

  // 순환 처리
  let clampedIndex = targetIndex
  if (targetIndex < 0) {
    clampedIndex = devMenus.length + targetIndex // 음수면 뒤에서부터
  } else if (targetIndex >= devMenus.length) {
    clampedIndex = targetIndex - devMenus.length
  }

  scrollToIndex(clampedIndex)
  // 화살표 버튼 클릭 시에도 메뉴 변경 (의도적인 클릭이므로, 항상 업데이트)
  const menuId = devMenus[clampedIndex].id
  activeMenu.value = menuId
  emit('update:activeMenu', menuId)
}

// 휠 스크롤용 빠른 애니메이션으로 이동
function scrollByItemsWithFastAnimation(step) {
  // 점프 중이면 추가 스크롤 방지
  if (isJumping.value) {
    return
  }

  // wheelScrollStep 값 사용
  const actualStep = step * wheelScrollStep.value
  const targetIndex = activeDotIndex.value + actualStep

  // 순환 처리
  let clampedIndex = targetIndex
  if (targetIndex < 0) {
    clampedIndex = devMenus.length + targetIndex
  } else if (targetIndex >= devMenus.length) {
    clampedIndex = targetIndex - devMenus.length
  }

  scrollToIndexWithFastAnimation(clampedIndex)
}

// 빠른 애니메이션으로 특정 인덱스로 스크롤 이동 (휠 스크롤용)
function scrollToIndexWithFastAnimation(targetIndex) {
  if (!sliderRef.value || !containerRef.value) return

  // 점프 중이면 추가 스크롤 방지
  if (isJumping.value) {
    return
  }

  // 인덱스 범위 체크
  const clampedIndex = Math.max(0, Math.min(targetIndex, devMenus.length - 1))

  // 캐시된 값이 없으면 초기화
  if (cachedItemWidth === null || cachedSectionWidth === null) {
    const firstItem = containerRef.value.querySelector('.menu-item')
    if (!firstItem) return

    const itemWidth = firstItem.offsetWidth
    const gap = MENU_ITEM_GAP
    const itemTotalWidth = itemWidth + gap
    cachedItemWidth = itemTotalWidth
    cachedSectionWidth = itemTotalWidth * devMenus.length
  }

  const itemTotalWidth = cachedItemWidth
  const { scrollLeft } = sliderRef.value
  const currentIndex = activeDotIndex.value

  // ✨ 최단 거리 이동을 위한 방향 판단 로직
  // 기본 이동 거리 계산: 목표 인덱스 - 현재 인덱스
  let relativeStep = clampedIndex - currentIndex

  // 회전 보정: 전체 아이템 개수의 절반보다 큰 거리면 반대 방향으로 이동
  const halfLength = devMenus.length / 2
  if (relativeStep > halfLength) {
    // 오른쪽으로 가는 것보다 왼쪽으로 가는 것이 더 가까움
    relativeStep = relativeStep - devMenus.length
  } else if (relativeStep < -halfLength) {
    // 왼쪽으로 가는 것보다 오른쪽으로 가는 것이 더 가까움
    relativeStep = relativeStep + devMenus.length
  }

  // ✨ 상대 좌표 기반의 목표 설정
  // 추가 이동 거리: 최종 이동 거리 * 아이템당 너비
  const additionalDistance = relativeStep * itemTotalWidth
  // 목표 스크롤 위치: 현재 스크롤 위치 + 추가 이동 거리
  const targetScrollLeft = scrollLeft + additionalDistance

  // 빠른 애니메이션(200ms)으로 스크롤
  smoothScrollToLeft(sliderRef.value, targetScrollLeft, 200)
}

// 이전 아이템으로 스크롤 (1개씩)
function scrollToPrevious() {
  scrollByItems(-1)
}

// 다음 아이템으로 스크롤 (1개씩)
function scrollToNext() {
  scrollByItems(1)
}

// 활성화된 점 인덱스 업데이트 (최적화: DOM 쿼리 캐싱)
let cachedItemWidth = null
let cachedSectionWidth = null

function updateActiveDotIndex() {
  if (!sliderRef.value || !containerRef.value) return

  // 초기화 중에는 업데이트하지 않음 (초기화가 명시적으로 설정하도록)
  if (isInitializing.value) return

  const { scrollLeft, clientWidth } = sliderRef.value

  // DOM 쿼리 결과 캐싱 (크기가 변경되지 않는 한 재사용)
  if (cachedItemWidth === null || cachedSectionWidth === null) {
    const firstItem = containerRef.value.querySelector('.menu-item')
    if (!firstItem) return

    const itemWidth = firstItem.offsetWidth
    const gap = MENU_ITEM_GAP
    const itemTotalWidth = itemWidth + gap
    cachedItemWidth = itemTotalWidth
    cachedSectionWidth = itemTotalWidth * devMenus.length
  }

  const itemTotalWidth = cachedItemWidth
  const sectionWidth = cachedSectionWidth

  // 화면 중앙 기준으로 계산
  const centerX = scrollLeft + clientWidth / 2

  // 원본 섹션 기준으로 정규화 (복제 섹션을 원본 섹션으로 변환)
  let normalizedScrollLeft = centerX
  if (centerX < sectionWidth) {
    // 복제된 끝 섹션 → 원본 섹션으로 변환
    normalizedScrollLeft = centerX + sectionWidth
  } else if (centerX >= sectionWidth * 2) {
    // 복제된 시작 섹션 → 원본 섹션으로 변환
    normalizedScrollLeft = centerX - sectionWidth
  }

  // 원본 섹션 기준 상대 위치
  const relativeScrollLeft = normalizedScrollLeft - sectionWidth
  const index = Math.floor(relativeScrollLeft / itemTotalWidth)
  const clampedIndex = Math.max(0, Math.min(index, devMenus.length - 1))

  // 인덱스를 0 ~ devMenus.length - 1 범위로 정규화
  // 주의: activeDotIndex만 업데이트 (인디케이터 표시용)
  // activeMenu는 handleMenuItemClick에서만 업데이트 (클릭 시에만 메뉴 변경)
  if (activeDotIndex.value !== clampedIndex) {
    activeDotIndex.value = clampedIndex
    // activeMenu 자동 업데이트 제거 - 클릭 시에만 변경되도록 수정
    // const menuId = devMenus[clampedIndex].id
    // if (activeMenu.value !== menuId) {
    //   activeMenu.value = menuId
    //   emit('update:activeMenu', menuId)
    // }
  }
}

// 스크롤 이벤트 핸들러 (requestAnimationFrame으로 스로틀링, 최적화)
let rafId = null

const handleScroll = () => {
  // requestAnimationFrame으로 스로틀링 (프레임당 한 번만 실행)
  if (rafId === null) {
    rafId = requestAnimationFrame(() => {
      updateActiveDotIndex() // 인디케이터는 실시간 업데이트
      checkInfiniteScroll() // 무한 스크롤 체크도 즉시 수행 (Jump는 즉시 일어나야 함)
      rafId = null
    })
  }
}

// 휠 이벤트 핸들러 (좌우 스크롤)
let wheelRafId = null
let lastWheelTime = 0
const WHEEL_THROTTLE_NORMAL = 100 // 일반 스크롤 스로틀링 (100ms)

function handleWheel(event) {
  // 수평 스크롤 감지
  // 일반 마우스 휠은 deltaY만 있으므로, deltaY를 수평 스크롤로 사용
  // deltaX가 있으면 우선 사용, 없으면 deltaY 사용
  let deltaX = event.deltaX

  // deltaX가 0이거나 거의 0이면 deltaY를 사용 (일반 마우스 휠)
  if (Math.abs(deltaX) < 1) {
    deltaX = event.deltaY
  }

  // 수평 스크롤이 아니면 무시 (기본 동작 허용)
  if (Math.abs(deltaX) < 1) {
    return
  }

  // 기본 동작 차단 (수평 스크롤만)
  event.preventDefault()
  event.stopPropagation()

  // 시간 기반 스로틀링: 마지막 처리 시간부터 충분한 시간이 지났는지 확인
  const now = Date.now()
  const timeSinceLastWheel = now - lastWheelTime

  // 스로틀링 체크: 아직 충분한 시간이 지나지 않았으면 무시
  if (timeSinceLastWheel < WHEEL_THROTTLE_NORMAL) {
    return
  }

  // requestAnimationFrame으로 프레임 최적화
  if (wheelRafId !== null) {
    cancelAnimationFrame(wheelRafId)
  }

  // deltaX 값을 클로저로 캡처
  const capturedDeltaX = deltaX

  wheelRafId = requestAnimationFrame(() => {
    lastWheelTime = Date.now()

    // 휠 스크롤 시 빠른 애니메이션(200ms)으로 이동
    // 일반 휠: 1개씩 이동
    if (capturedDeltaX > 0) {
      scrollByItemsWithFastAnimation(1)
    } else {
      scrollByItemsWithFastAnimation(-1)
    }

    wheelRafId = null
  })
}

onMounted(() => {
  // 디버깅용: 콘솔에서 애니메이션 토글 가능하도록 전역 변수로 노출
  if (typeof window !== 'undefined') {
    window.__devMenuSliderDisableAnimation = () => {
      enableAnimation.value = false
    }
    window.__devMenuSliderEnableAnimation = () => {
      enableAnimation.value = true
    }
    window.__devMenuSliderToggleAnimation = () => {
      enableAnimation.value = !enableAnimation.value
    }
  }

  if (sliderRef.value) {
    // 스크롤 이벤트 리스너 (passive로 성능 최적화, requestAnimationFrame으로 스로틀링)
    sliderRef.value.addEventListener('scroll', handleScroll, { passive: true })

    // 휠 이벤트 리스너 (passive: false로 preventDefault 사용 가능)
    // wrapper에 등록하여 더 넓은 영역에서 감지
    if (wrapperRef.value) {
      wrapperRef.value.addEventListener('wheel', handleWheel, { passive: false })
    } else if (sliderRef.value) {
      // 폴백: sliderRef에 직접 등록
      sliderRef.value.addEventListener('wheel', handleWheel, { passive: false })
    }

    // 초기 스크롤 위치를 원본 섹션의 시작으로 설정 및 캐시 즉시 초기화
    const initScroll = () => {
      const items = containerRef.value?.querySelectorAll('.menu-item')
      if (items && items.length >= devMenus.length * 2) {
        // 1번째 아이템(복제 끝 섹션의 첫 번째)과 원본 섹션의 첫 번째 아이템 사이의 거리로 정확한 섹션 너비 계산
        const firstItemRect = items[0].getBoundingClientRect()
        const originalFirstItemRect = items[devMenus.length].getBoundingClientRect()
        const preciseSectionWidth = originalFirstItemRect.left - firstItemRect.left

        // 아이템 너비도 정확하게 계산
        const itemWidth = firstItemRect.width
        const gap = MENU_ITEM_GAP
        const itemTotalWidth = itemWidth + gap

        // 캐시 초기화 (정확한 값 사용)
        cachedItemWidth = itemTotalWidth
        cachedSectionWidth = preciseSectionWidth

        // 초기 위치를 원본 섹션의 시작으로 설정 (첫 번째 메뉴 위치)
        sliderRef.value.scrollLeft = preciseSectionWidth

        // 무한 스크롤 체크 (위치는 이미 올바르게 설정됨)
        checkInfiniteScroll()

        // 초기화 완료 플래그 설정 (이제부터 updateActiveDotIndex가 정상 작동)
        // DevelopmentPage에서 초기 메뉴 이벤트를 보낼 때까지 대기
        setTimeout(() => {
          isInitializing.value = false
          // DevelopmentPage에서 초기 메뉴가 설정될 때까지 대기하지 않고
          // 이벤트 리스너를 통해 동기화됨
        }, 0)
      } else {
        // DOM이 준비되지 않았으면 재시도
        setTimeout(initScroll, 50)
      }
    }

    // 즉시 초기화 시도
    initScroll()

    // 휠 스크롤 스텝 설정 로드
    loadWheelScrollStep()

    // 애니메이션 설정 로드
    loadMenuAnimation()

    // storage 이벤트 리스너 등록 (다른 탭과 동기화)
    window.addEventListener('storage', handleStorageChange)

    // 같은 탭에서 localStorage 변경 감지 (CustomEvent 사용)
    // 모달에서 저장할 때 dispatchEvent로 알림
    window.addEventListener('wheel-scroll-step-changed', loadWheelScrollStep)
    window.addEventListener('menu-animation-changed', loadMenuAnimation)

    // DevelopmentPage에서 초기 메뉴를 받아서 동기화
    function handleMenuChanged(event) {
      const menuId = event.detail.activeMenu
      // 항상 동기화 (초기 로드 시에도 처리)
      // menuId가 null이면 (메인 페이지로 리셋) activeMenu도 null로 설정
      if (menuId === null) {
        activeMenu.value = null
        activeDotIndex.value = 0 // 기본 인덱스로 리셋
        return
      }
      
      const menuIndex = devMenus.findIndex((menu) => menu.id === menuId)
      if (menuIndex !== -1) {
        activeMenu.value = menuId
        activeDotIndex.value = menuIndex
        // 초기화가 완료되었으면 해당 위치로 스크롤
        if (!isInitializing.value && sliderRef.value) {
          scrollToIndex(menuIndex)
        } else {
          // 초기화 중이면 초기화 완료 후 스크롤하도록 플래그 설정
          // initializeSlider 완료 후 스크롤하도록 nextTick 사용
          nextTick(() => {
            if (sliderRef.value && !isInitializing.value) {
              scrollToIndex(menuIndex)
            }
          })
        }
      }
    }

    // 초기 메뉴 이벤트 리스너 (초기화 완료 후에도 계속 유지)
    window.addEventListener('dev-menu-changed', handleMenuChanged)

    // 컴포넌트 언마운트 시 이벤트 리스너 제거를 위해 참조 저장
    window.__devMenuSliderMenuChangedHandler = handleMenuChanged
  }
})

onBeforeUnmount(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  if (wheelRafId !== null) {
    cancelAnimationFrame(wheelRafId)
    wheelRafId = null
  }
  if (wrapperRef.value) {
    wrapperRef.value.removeEventListener('wheel', handleWheel)
  }
  if (sliderRef.value) {
    sliderRef.value.removeEventListener('scroll', handleScroll)
    sliderRef.value.removeEventListener('wheel', handleWheel)
  }
  // storage 이벤트 리스너 제거
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('wheel-scroll-step-changed', loadWheelScrollStep)
  window.removeEventListener('menu-animation-changed', loadMenuAnimation)
  // dev-menu-changed 이벤트 리스너 제거
  if (window.__devMenuSliderMenuChangedHandler) {
    window.removeEventListener('dev-menu-changed', window.__devMenuSliderMenuChangedHandler)
    delete window.__devMenuSliderMenuChangedHandler
  }
  // 캐시 초기화
  cachedItemWidth = null
  cachedSectionWidth = null
})
</script>

<style lang="scss" scoped>
.dev-menu-slider-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 56px; // 최소 높이 고정으로 인디케이터 위치 안정화
  padding-bottom: 2px;
  border-bottom: 2px solid var(--nexa-border-color);
}

// 상단 인디케이터 영역 (오버레이)
.indicator-area {
  position: absolute;
  top: -25px;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 20;
  display: flex;
  align-items: center;
  padding: 2px 0;
  pointer-events: none;
  transform: translateZ(0); // GPU 가속으로 위치 고정
  will-change: transform; // 브라우저 최적화 힌트

  // 화살표 버튼은 클릭 가능하도록 (나중에 기능 추가 시)
  .nav-arrow {
    pointer-events: auto;
  }

  // 왼쪽 영역
  .indicator-left {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .nav-arrow-left {
      margin-left: 10px !important;
    }
  }

  // 중앙 영역 (인디케이터)
  .indicator-center {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  // 오른쪽 영역
  .indicator-right {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;

    .nav-arrow-right {
      margin-right: 10px;
    }
  }
}

// 상단 점 인디케이터
.dot-indicators {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0; // gap 제거하여 겹치게 함
  pointer-events: none;

  .dot-indicator {
    width: 4px;
    height: 4px;
    margin: 0 -8px; // 음수 마진으로 겹치게 하되, 실제 점 크기는 유지
    padding: 10px; // 호버 영역 확대 (겹치게)
    border-radius: 50%;
    background: transparent; // 배경 투명 (실제 점은 ::after로 표시)
    cursor: default;
    pointer-events: auto;
    position: relative;
    box-sizing: content-box; // padding이 크기에 포함되지 않도록
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;

    // 실제 점 (padding 영역 안에서 중앙에 배치)
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--nexa-text-secondary);
      opacity: 0.4;
      transition:
        background-color 0.2s ease,
        opacity 0.2s ease,
        transform 0.2s ease;
    }

    &:hover {
      &::after {
        background: var(--nexa-accent);
        opacity: 0.8;
        transform: translate(-50%, -50%) scale(3.5);
      }
    }

    &.dot-active {
      &::after {
        background: var(--nexa-primary);
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.5);
      }
    }
  }
}

.dev-menu-slider {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch; // iOS 부드러운 스크롤
  scrollbar-width: none; // Firefox 스크롤바 숨김
  -ms-overflow-style: none; // IE/Edge 스크롤바 숨김
  // scroll-behavior: smooth 제거 - 무한 스크롤 전환 시 즉시 이동해야 함
  position: relative;
  padding-top: 0; // 상단 패딩 제거로 인디케이터 위치 고정
  height: 56px; // 높이 고정으로 레이아웃 시프트 방지
  min-height: 56px; // 최소 높이 고정

  // Webkit 브라우저 스크롤바 숨김
  &::-webkit-scrollbar {
    display: none;
  }

  .dev-menu-container {
    display: flex;
    // ⚠️ 주의: gap 값은 JavaScript의 MENU_ITEM_GAP 상수와 동기화됨
    // 템플릿에서 :style="{ '--menu-item-gap': `${MENU_ITEM_GAP}px` }"로 전달됨
    // MENU_ITEM_GAP 값을 변경하면 CSS와 스크립트 모두에 자동 반영됨
    gap: var(--menu-item-gap);
    padding: 8px;
    padding-top: 8px; // 상단 패딩 고정
    min-width: max-content;
    height: 100%; // 컨테이너 높이 고정
    align-items: center; // 수직 중앙 정렬

    .menu-item {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      box-sizing: border-box; // 패딩 포함 크기 계산
      height: 54px; // 높이 고정 (hover 시에도 변경되지 않음)
      min-height: 50px; // 최소 높이 고정
      max-height: 56px; // 최대 높이 고정
      transition:
        background-color 0.2s ease,
        color 0.2s ease,
        border-color 0.2s ease;
      background: var(--nexa-background-darker);
      color: var(--nexa-text-secondary);
      border: 3px solid var(--nexa-border-color);
      position: relative;

      .menu-item-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        position: relative;
      }

      .menu-item-number {
        position: absolute;
        top: 2px;
        right: -6px;
        font-size: 10px;
        font-weight: 700;
        color: var(--nexa-text-hint);
        padding: 0 2px;
        line-height: 1;
        z-index: 1;
      }

      .menu-icon {
        font-size: 34px !important;
        width: 34px !important;
        height: 34px !important;
        color: var(--nexa-secondary);
        margin-bottom: 2px;
      }

      .menu-label {
        font-size: 10px;
        font-weight: 500;
        white-space: nowrap;
        color: var(--nexa-primary);
        line-height: 1;
        margin-top: -2px;
      }

      &:hover {
        background: var(--nexa-surface);
        border-color: var(--nexa-border-hover);

        .menu-icon,
        .menu-label {
          color: var(--nexa-text-primary);
        }
      }

      &.menu-active {
        background: var(--nexa-item-selected-bg);
        border-color: var(--nexa-border-active);
        border-bottom: 2px solid var(--nexa-primary);

        .menu-icon,
        .menu-label {
          color: var(--nexa-primary);
        }
      }
    }
  }
}

// Step 버튼 스타일
.step-button {
  background: transparent;
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 10px;
  color: var(--nexa-primary);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
  pointer-events: auto;
  margin-right: 10px;

  &:hover {
    background: var(--nexa-surface);
    color: var(--nexa-text-primary);
    border-color: var(--nexa-border-hover);
  }

  &:active {
    background: var(--nexa-surface-hover);
  }
}

// 네비게이션 화살표
.nav-arrow {
  position: relative;
  background: transparent;
  color: var(--nexa-text-secondary);
  border: 1px solid transparent;
  border-radius: 50%;
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
  min-height: 24px !important;
  max-width: 24px !important;
  max-height: 24px !important;
  padding: 0 !important;
  margin: 0 !important;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    opacity 0.2s ease,
    visibility 0.2s ease;

  // 표시될 때
  &.nav-arrow-visible {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  // 마우스 오버 시
  &:hover {
    color: var(--nexa-primary);
    border-color: var(--nexa-border-active);
  }

  :deep(.q-icon) {
    font-size: 16px;
    width: 16px;
    height: 16px;
  }
}

// 모바일 최적화
@media (max-width: 768px) {
  .dev-menu-slider {
    .dev-menu-container {
      padding: 6px 12px;
      padding-left: 10px; // 왼쪽 인디케이터(3px)를 위한 여유 공간
      gap: 6px;

      .menu-item {
        padding: 6px 8px;

        .menu-icon {
          font-size: 20px !important;
          width: 20px !important;
          height: 20px !important;
        }

        .menu-label {
          font-size: 9px;
        }

        .menu-item-number {
          font-size: 9px;
        }
      }
    }
  }
}
</style>
