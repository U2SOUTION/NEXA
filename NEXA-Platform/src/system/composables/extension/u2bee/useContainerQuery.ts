// ============================================
// Container Queries 기반 Composable 함수
// ============================================
// Extension 환경별 레이아웃 감지를 위한 composable

import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

/**
 * Container Queries 기반 환경 감지 composable
 * @param containerRef - Container 요소 참조
 * @returns Container 크기 및 레이아웃 모드 정보
 */
export function useContainerQuery(containerRef: Ref<HTMLElement | null>) {
  const containerWidth = ref(0)
  const containerHeight = ref(0)

  const updateSize = () => {
    if (containerRef.value) {
      containerWidth.value = containerRef.value.offsetWidth
      containerHeight.value = containerRef.value.offsetHeight
    }
  }

  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    updateSize()

    // ResizeObserver로 Container 크기 감지
    if (containerRef.value && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateSize()
      })
      resizeObserver.observe(containerRef.value)
    }
  })

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
  })

  // Container Queries 기반 환경 감지
  const isPopup = computed(() => {
    return containerWidth.value <= 800 && containerHeight.value <= 600
  })

  const isSidePanel = computed(() => {
    return containerWidth.value <= 500 && containerHeight.value >= 600
  })

  const isDesktop = computed(() => {
    return containerWidth.value >= 1024
  })

  const isMobile = computed(() => {
    return containerWidth.value <= 640
  })

  const isTablet = computed(() => {
    return containerWidth.value > 640 && containerWidth.value < 1024
  })

  // 레이아웃 모드 결정
  const layoutMode = computed(() => {
    if (isPopup.value) return 'popup' // 가로 탭 메뉴
    if (isSidePanel.value) return 'sidepanel' // 세로 아코디언/탭 메뉴
    if (isMobile.value) return 'mobile' // 미디어 쿼리 기반
    if (isDesktop.value) return 'desktop' // 충분한 공간, 모든 메뉴
    return 'tablet'
  })

  return {
    containerWidth,
    containerHeight,
    isPopup,
    isSidePanel,
    isDesktop,
    isMobile,
    isTablet,
    layoutMode,
  }
}
