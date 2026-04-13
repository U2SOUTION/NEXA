<!--
  NEXA 플랫폼 v2 표준 레이아웃 (MainLayout)
  - 3단 슬롯 구조: Left Sidebar, Content, Right Sidebar
  - 중앙 관제형 설계를 위해 로직을 최소화하고 슬롯 위주로 구성
-->
<template>
  <q-layout view="HHH Lpr fFf">
    <!-- 헤더 영역 -->
    <q-header v-if="!isIframeMode" ref="headerRef">
      <q-toolbar class="main-header-toolbar" dense>
        <!-- 왼쪽 헤더: 로고 및 메인 메뉴 -->
        <GlobalNavbarLeft ref="mainMenuTabsRef" :menu-tabs="mainMenuTabs" :current-menu="currentMenu" :show-labels="showLabels" :show-tab-icons="showTabIcons" :is-overflowing="isMainMenuOverflowing" :hidden-tabs="hiddenTabs" :hidden-tab-names="hiddenTabNames" @tab-click="handleTabClick" />

        <q-space />

        <!-- 오른쪽 헤더: 도메인별 컨텍스트 액션 및 시스템 버튼 -->
        <GlobalNavbarRight
          :left-sidebar-open="dashboardLayoutStore.mainNavigationOpen"
          :right-sidebar-open="userSettings.settings.drawer.rightOpen"
          :is-dark-mode="userSettings.settings.theme.isDarkMode"
          :show-labels="showLabels"
          @toggle-left="dashboardLayoutStore.toggleMainNavigation()"
          @toggle-right="togglePropertyPanel"
          @toggle-theme="userSettings.toggleTheme"
        >
          <!-- 도메인별 컨텍스트 액션 (현제 보드에만 적용, 차후 각 도메인에서 액션 버튼 또는 메세지 주입)-->
          <template #context-actions>
            <component v-if="headerActionsComponent" :is="headerActionsComponent" :show-labels="showLabels" :can-add-panel="!!dashboardLayoutStore.selectedPaneId" @add-panel="dashboardLayoutStore.triggerGenericAddPanel()" @open-window-preset="showWindowPresetModal = true" />
          </template>
        </GlobalNavbarRight>
      </q-toolbar>
    </q-header>

    <!-- 왼쪽 사이드바 -->
    <q-drawer v-if="!isIframeMode" v-model="dashboardLayoutStore.mainNavigationOpen" show-if-above bordered :width="userSettings.settings.drawer.leftWidth" :style="editModeDrawerStyles" class="drawer-border">
      <div class="resize-handle-right" @mousedown="startMainNavigationResize" :class="{ resizing: isMainNavigationResizing }">
        <div class="resize-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
      <component v-if="leftSidebarComponent" :is="leftSidebarComponent" :highlighted-node-id="highlightedNodeId" />
    </q-drawer>

    <q-page-container :class="{ 'iframe-mode': isIframeMode }" @dblclick="handleMainContentDoubleClick">
      <router-view />
    </q-page-container>

    <!-- 오른쪽 사이드바 -->
    <q-drawer v-if="!isIframeMode" v-model="userSettings.settings.drawer.rightOpen" side="right" bordered :width="userSettings.settings.drawer.rightWidth" :overlay="userSettings.settings.drawer.rightMode === 'overlay'" :style="rightDrawerStyles" class="drawer-border">
      <div class="resize-handle" @mousedown="startResize" :class="{ resizing: isResizing }">
        <div class="resize-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
      <component v-if="rightSidebarComponent" :is="rightSidebarComponent" />
    </q-drawer>

    <!-- 토글 버튼 -->
    <div v-if="!isIframeMode" ref="leftToggleButtonRef" class="sidebar-toggle-button sidebar-toggle-button--left" :class="{ 'is-drawer-open': dashboardLayoutStore.mainNavigationOpen, 'is-resizing': isMainNavigationResizing }" :style="leftButtonStyle" @mousedown="handleLeftToggleMouseDown">
      <q-icon name="double_arrow" :style="{ transform: `rotate(${leftIconRotation})` }" />
      <span class="toggle-label">LEFT NAV</span>
    </div>

    <div
      v-if="!isIframeMode"
      ref="rightToggleButtonRef"
      class="sidebar-toggle-button sidebar-toggle-button--right"
      :class="{ 'is-drawer-open': userSettings.settings.drawer.rightOpen, 'is-overlay-mode': userSettings.settings.drawer.rightMode === 'overlay', 'is-resizing': isResizing }"
      :style="rightButtonStyle"
      @mousedown="handleRightToggleMouseDown"
    >
      <q-icon name="double_arrow" :style="{ transform: `rotate(${rightIconRotation})` }" />
      <span class="toggle-label">RIGHT NEXET</span>
    </div>

    <!-- 푸터 -->
    <q-footer v-if="!isIframeMode" class="main-footer">
      <q-toolbar dense>
        <div class="row items-center full-width justify-between">
          <div class="row items-center q-gutter-md">
            <div class="text-caption footer-nexa-logo">NEXA</div>
            <div class="footer-system-features">
              <div>Modular Architecture</div>
              <div>Real-time Processing</div>
              <div>Scalable Design</div>
            </div>
          </div>
          <div class="text-caption">© 2024 U2 SOLUTION. All rights reserved.</div>
          <div class="text-caption">NEXA Platform v2.0</div>
        </div>
      </q-toolbar>
    </q-footer>

    <!-- 온라인 NIXIE: 뷰포트 고정 오버레이 · 드래그로 자유 이동 (푸터와 독립) -->
    <NixieOnlineCharacter v-if="!isIframeMode" />

    <WindowPresetEditModal v-model="showWindowPresetModal" />
  </q-layout>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

// System Layer Stores
import { useDashboardLayoutStore } from '@system/store/dashboardLayoutStore'
import { useUserSettingsStore } from '@system/store/userSettingsStore'

// Frame Layer Components & Registry
import GlobalNavbarLeft from './components/GlobalNavbarLeft.vue'
import GlobalNavbarRight from './components/GlobalNavbarRight.vue'
import NixieOnlineCharacter from '@system/nixie/components/NixieOnlineCharacter.vue'
import { getLeftSidebarComponent, getRightSidebarComponent, getHeaderActionsComponent } from '@frame/registry/domainRegistry'

// Composables & Utils
import WindowPresetEditModal from '@domains/board/components/window/WindowPresetEditModal.vue'
import { useSidebarGesture } from '@system/composables/useSidebarGesture'
const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const dashboardLayoutStore = useDashboardLayoutStore()
const userSettings = useUserSettingsStore()

// --- State ---
const showWindowPresetModal = ref(false)
const headerRef = ref(null)
const leftToggleButtonRef = ref(null)
const rightToggleButtonRef = ref(null)
const highlightedNodeId = ref(null)

// 메인 메뉴 오버플로우 관리를 위한 Ref들
const mainMenuTabsRef = ref(null)
const isMainMenuOverflowing = ref(false)
const hiddenTabs = ref([])
const tabSizes = ref([])
const moreButtonWidth = ref(60)
const isMeasuringTabs = ref(false)

// 메인 메뉴 영역 높이 계산 (헤더 전체의 실제 높이를 직접 측정)
const menuAreaHeight = computed(() => {
  if (headerRef.value && headerRef.value.$el) {
    const actualHeight = headerRef.value.$el.offsetHeight || 0
    if (actualHeight > 0) return actualHeight
  }
  return 42 // Fallback: --header-height 기본값
})

const leftSidebarComponent = shallowRef(null)
const rightSidebarComponent = shallowRef(null)
const headerActionsComponent = shallowRef(null)

// --- Computed ---
const isIframeMode = computed(() => {
  if (typeof window === 'undefined') return false
  if (route.query.mode === 'popup' || route.query.mode === 'sidepanel') return true
  try {
    return window.self !== window.top
  } catch {
    return true
  }
})
const showLabels = computed(() => $q.screen.gt.lg)
const showTabIcons = computed(() => $q.screen.gt.md)

const currentMenu = computed(() => {
  const path = route.path
  if (path === '/' || path === '') return 'home'

  const menuMap = {
    '/nexa-board': 'nexa-board',
    '/nexet': 'nexet',
    '/nexa-node': 'automation',
    '/nexa-archive': 'nexa-archive',
    '/nexa-trace': 'nexa-trace',
    '/nexa-nexion': 'nexion',
    '/nexa-ai': 'nexa-ai',
    '/erp': 'nexa-erp',
    '/erp/parts': 'erp-parts', // ERP 하위 부품관리 서브도메인
    '/infra': 'infra',
    '/network': 'network',
    '/portfolio': 'portfolio',
    '/solutions': 'solutions',
    '/extension': 'extension',
    '/dev': 'dev',
    '/help': 'help',
    '/my': 'my',
    '/nexa-admin': 'nexa-admin',
  }

  const found = Object.entries(menuMap).find(([key]) => path.startsWith(key))
  return found ? found[1] : 'home'
})

// ***************************************************
// * mainMenuTabs 탭 메뉴 구성 설명
// ***************************************************
// name: 도메인 식별자 키 (nexa-archive)로 레지스트리/라우터에서 참조.
// label: 헤더/탭 등에 풀 라벨로 노출되는 텍스트.
// displayLabel: 공간 절약용 짧은 표시 텍스트.
// icon: 탭에 사용할 Quasar/Material 아이콘 이름.
// route: 탭 클릭 시 이동할 라우트 경로 (/nexa-archive). 중요! 이 경로는 레지스트리/라우터에서 참조되므로 반드시 동일해야 함.
// exact: 경로 일치 여부 (false이면 /nexa-archive로 시작하기만 해도 활성화됨. 예: /nexa-archive, /nexa-archive/detail/123 모두 매칭됨).
// nexaPrefix: NEXA 점두어 사용 여부 (true: 사용, false: 사용하지 않음).

const mainMenuTabs = [
  { name: 'home', label: 'HOME', displayLabel: 'HOME', icon: 'home', route: '/', exact: false, nexaPrefix: false },
  { name: 'nexa-board', label: 'NEXA BOARD', displayLabel: 'BOARD', icon: 'dashboard', route: '/nexa-board', exact: false, nexaPrefix: true },
  { name: 'nexet', label: 'NEXET', displayLabel: 'NEXET', icon: 'widgets', route: '/nexet', exact: false, nexaPrefix: true },
  { name: 'automation', label: 'NEXA NODE', displayLabel: 'NODE', icon: 'hub', route: '/nexa-node', exact: false, nexaPrefix: true },
  { name: 'nexa-trace', label: 'NEXA TRACE', displayLabel: 'TRACE', icon: 'analytics', route: '/nexa-trace', exact: false, nexaPrefix: true },
  { name: 'nexion', label: 'NEXA NEXION', displayLabel: 'NEXION', icon: 'account_tree', route: '/nexa-nexion', exact: false, nexaPrefix: true },
  { name: 'nexa-archive', label: 'NEXA ARCHIVE', displayLabel: 'ARCHIVE', icon: 'article', route: '/nexa-archive', exact: false, nexaPrefix: true },
  { name: 'nexa-ai', label: 'NEXA AI', displayLabel: 'AI', icon: 'smart_toy', route: '/nexa-ai', exact: false, nexaPrefix: true },
  { name: 'nexa-erp', label: 'NEXA ERP', displayLabel: 'ERP', icon: 'business', route: '/erp', exact: false, nexaPrefix: true },
  { name: 'portfolio', label: 'PORTFOLIO', displayLabel: 'PORTFOLIO', icon: 'folder', route: '/portfolio', exact: false, nexaPrefix: false },
  { name: 'infra', label: 'INFRA', displayLabel: 'INFRA', icon: 'settings', route: '/infra', exact: false, nexaPrefix: false },
  { name: 'network', label: 'NETWORK', displayLabel: 'NETWORK', icon: 'router', route: '/network', exact: false, nexaPrefix: false },
  { name: 'solutions', label: 'SOLUTIONS', displayLabel: 'SOLUTIONS', icon: 'lightbulb', route: '/solutions', exact: false, nexaPrefix: false },
  { name: 'extension', label: 'EXTENSION', displayLabel: 'EXTENSION', icon: 'extension', route: '/extension', exact: false, nexaPrefix: false },
  { name: 'dev', label: 'DEV', displayLabel: 'DEV', icon: 'code', route: '/dev', exact: false, nexaPrefix: false },
  { name: 'help', label: 'HELP', displayLabel: 'HELP', icon: 'help_outline', route: '/help', exact: false, nexaPrefix: false },
  { name: 'nexa-admin', label: 'NEXA ADMIN', displayLabel: 'ADMIN', icon: 'admin_panel_settings', route: '/nexa-admin', exact: false, nexaPrefix: true },
]

const hiddenTabNames = computed(() => new Set(hiddenTabs.value.map((t) => t.name)))

// --- Handlers ---
const handleTabClick = (tab) => {
  if (tab.onClick) tab.onClick()
  router.push(tab.route)
}

// --- 오버플로우 감지 로직 (V1 복구) ---
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

let mainMenuResizeObserver = null
const checkMainMenuOverflow = debounce(() => {
  if (isMeasuringTabs.value || !mainMenuTabsRef.value) return
  isMeasuringTabs.value = true

  nextTick(() => {
    const tabsContainer = mainMenuTabsRef.value.$el
    if (!tabsContainer) {
      isMeasuringTabs.value = false
      return
    }

    const viewportWidth = window.innerWidth
    const tabElements = tabsContainer.querySelectorAll('.q-tab')

    // 측정 모드 (일시적으로 모든 탭 표시)
    const originalVisibilities = Array.from(tabElements).map((el) => {
      const original = el.style.visibility
      if (el.style.display === 'none') {
        el.style.display = 'flex'
        el.style.visibility = 'hidden'
      } else {
        el.style.visibility = 'visible'
      }
      return original
    })

    requestAnimationFrame(() => {
      // 탭 크기 측정
      tabSizes.value = Array.from(tabElements).map((el, index) => ({
        name: mainMenuTabs[index]?.name || '',
        width: el.getBoundingClientRect().width,
        index,
      }))

      // 더보기 및 우측 아이콘 영역 너비 계산
      const moreButton = document.querySelector('.main-menu-more-button')
      moreButtonWidth.value = moreButton ? moreButton.getBoundingClientRect().width + 16 : 60

      const rightArea = document.querySelector('.row.items-center.no-wrap.header-icon-group') // GlobalNavbarRight 내부
      const rightIconWidth = rightArea ? rightArea.getBoundingClientRect().width + 40 : 250

      // 표시 가능 탭 계산
      const reservedWidth = moreButtonWidth.value + rightIconWidth + 100
      const availableWidth = viewportWidth - reservedWidth

      let totalWidth = 0
      let visibleCount = 0
      for (let i = 0; i < tabSizes.value.length; i++) {
        if (totalWidth + tabSizes.value[i].width <= availableWidth) {
          totalWidth += tabSizes.value[i].width
          visibleCount++
        } else break
      }

      const hiddenTabsList = mainMenuTabs.slice(visibleCount)
      isMainMenuOverflowing.value = hiddenTabsList.length > 0
      hiddenTabs.value = hiddenTabsList

      // 상태 복원
      tabElements.forEach((el, index) => {
        el.style.visibility = originalVisibilities[index] || ''
      })
      isMeasuringTabs.value = false
    })
  })
}, 150)

const togglePropertyPanel = () => {
  userSettings.setRightDrawerOpen(!userSettings.settings.drawer.rightOpen)
}

// --- Dynamic Component Watcher ---
watch(
  currentMenu,
  async (newMenu) => {
    leftSidebarComponent.value = await getLeftSidebarComponent(newMenu)
    rightSidebarComponent.value = await getRightSidebarComponent(newMenu)
    headerActionsComponent.value = await getHeaderActionsComponent(newMenu)
  },
  { immediate: true },
)

// --- Resize Logic (Ported from original) ---
const isMainNavigationResizing = ref(false)
const startMainNavigationX = ref(0)
const startMainNavigationWidth = ref(0)

const startMainNavigationResize = (event) => {
  isMainNavigationResizing.value = true
  startMainNavigationX.value = event.type === 'mousedown' ? event.clientX : event.touches[0].clientX
  startMainNavigationWidth.value = userSettings.settings.drawer.leftWidth

  document.body.style.cursor = 'ew-resize'
  document.body.style.userSelect = 'none'
  document.body.style.webkitUserSelect = 'none'
  document.body.style.mozUserSelect = 'none'
  document.body.style.msUserSelect = 'none'
  document.addEventListener('mousemove', handleMainNavigationResize)
  document.addEventListener('touchmove', handleMainNavigationResize, { passive: true })
  document.addEventListener('mouseup', stopMainNavigationResize)
  document.addEventListener('touchend', stopMainNavigationResize, { passive: true })
}

const handleMainNavigationResize = (event) => {
  if (!isMainNavigationResizing.value) return

  const currentX = event.type === 'mousemove' ? event.clientX : event.touches[0].clientX
  const diff = currentX - startMainNavigationX.value

  const maxWidth = Math.min(600, Math.floor(window.innerWidth * 0.6))
  const newWidth = Math.max(0, Math.min(startMainNavigationWidth.value + diff, maxWidth))

  if (newWidth <= 50) {
    userSettings.settings.drawer.leftWidth = 0
    if (dashboardLayoutStore.mainNavigationOpen) {
      dashboardLayoutStore.toggleMainNavigation()
    }
  } else {
    userSettings.settings.drawer.leftWidth = newWidth
  }
}

const stopMainNavigationResize = () => {
  if (!isMainNavigationResizing.value) return

  isMainNavigationResizing.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  document.body.style.webkitUserSelect = ''
  document.body.style.mozUserSelect = ''
  document.body.style.msUserSelect = ''

  userSettings.saveSettings()

  document.removeEventListener('mousemove', handleMainNavigationResize)
  document.removeEventListener('touchmove', handleMainNavigationResize)
  document.removeEventListener('mouseup', stopMainNavigationResize)
  document.removeEventListener('touchend', stopMainNavigationResize)
}

const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)

const startResize = (event) => {
  isResizing.value = true
  startX.value = event.type === 'mousedown' ? event.clientX : event.touches[0].clientX
  /** 열린 상태인데 저장 너비가 50 미만이면 복원 — 그렇지 않으면 첫 드래그에서 newWidth<=50 으로 바로 닫힘 */
  let rw = userSettings.settings.drawer.rightWidth
  if (userSettings.settings.drawer.rightOpen && rw < 50) {
    rw = calculateRestoreWidth(rw, 800, 300)
    userSettings.settings.drawer.rightWidth = rw
  }
  startWidth.value = rw

  document.body.style.cursor = 'ew-resize'
  document.body.style.userSelect = 'none'
  document.body.style.webkitUserSelect = 'none'
  document.body.style.mozUserSelect = 'none'
  document.body.style.msUserSelect = 'none'
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('touchmove', handleResize, { passive: true })
  document.addEventListener('mouseup', stopResize)
  document.addEventListener('touchend', stopResize, { passive: true })
}

const handleResize = (event) => {
  if (!isResizing.value) return

  const currentX = event.type === 'mousemove' ? event.clientX : event.touches[0].clientX
  const diff = startX.value - currentX

  const maxWidth = Math.min(800, Math.floor(window.innerWidth * 0.6))
  const newWidth = Math.max(0, Math.min(startWidth.value + diff, maxWidth))

  if (newWidth <= 50) {
    userSettings.settings.drawer.rightWidth = 0
    if (userSettings.settings.drawer.rightOpen) {
      togglePropertyPanel()
    }
  } else {
    userSettings.settings.drawer.rightWidth = newWidth
  }
}

const stopResize = () => {
  if (!isResizing.value) return

  isResizing.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  document.body.style.webkitUserSelect = ''
  document.body.style.mozUserSelect = ''
  document.body.style.msUserSelect = ''

  userSettings.saveSettings()

  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('touchmove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('touchend', stopResize)
}

// --- 사이드바 버튼 로직 ---
const buttonY = ref(window.innerHeight / 2)
const BUTTON_HEIGHT = 120 // 사이드바 버튼 높이
const mouseY = ref(0) // 마우스 Y좌표
let autoMoveTimer = null // 자동 이동 타이머

// 사이드바 버튼 위치를 마우스 위치로 따라 다니는 함수 (handleMouseMove 에서 호출됨)
const updateButtonPosition = () => {
  const buttonHalfHeight = BUTTON_HEIGHT / 2
  const buttonTop = buttonY.value - buttonHalfHeight // 버튼 상단
  const buttonBottom = buttonY.value + buttonHalfHeight // 버튼 하단
  const currentMouseY = mouseY.value

  // 마우스가 버튼의 상단이나 하단을 벗어났을 때만 버튼 위치 업데이트
  if (currentMouseY < buttonTop || currentMouseY > buttonBottom) {
    // 마우스 Y좌표를 화면 경계 내로 제한하여 버튼 위치 업데이트
    // minY/maxY 양쪽에 100px 여백을 추가하여 버튼이 상단/하단 끝까지 가지 못하도록 제한
    const minY = (headerRef.value?.$el?.offsetHeight || 42) + buttonHalfHeight + 100
    const maxY = window.innerHeight - buttonHalfHeight - 100
    buttonY.value = Math.max(minY, Math.min(maxY, currentMouseY))
  }
}

// 마우스 이동 후 autoMoveTimer 밀리 초 뒤에 사이드바 버튼 위치 업데이트 이벤트 처리
const handleMouseMove = (event) => {
  mouseY.value = event.clientY
  if (autoMoveTimer) clearTimeout(autoMoveTimer)
  autoMoveTimer = setTimeout(updateButtonPosition, 200)
}
// 왼쪽 사이드바 버튼 스타일
const leftButtonStyle = computed(() => ({
  top: `${buttonY.value - BUTTON_HEIGHT / 2}px`,
  left: dashboardLayoutStore.mainNavigationOpen ? `${userSettings.settings.drawer.leftWidth}px` : '0',
  transform: 'translateY(0)',
}))
// 오른쪽 사이드바 버튼 스타일
const rightButtonStyle = computed(() => ({
  top: `${buttonY.value - BUTTON_HEIGHT / 2}px`,
  right: userSettings.settings.drawer.rightOpen ? `${userSettings.settings.drawer.rightWidth}px` : '0',
  transform: 'translateY(0)',
}))

const leftIconRotation = computed(() => (dashboardLayoutStore.mainNavigationOpen ? '0deg' : '180deg'))
const rightIconRotation = computed(() => (userSettings.settings.drawer.rightOpen ? '180deg' : '0deg'))

// 왼쪽 사이드바 드래그 시작
const leftToggleDragState = { isDragging: false, startX: 0, startY: 0, startWidth: 0, hasMoved: false, wasClosed: false }
function handleLeftToggleMouseDown(event) {
  event.preventDefault()
  event.stopPropagation()

  leftToggleDragState.isDragging = false
  leftToggleDragState.startX = event.type === 'mousedown' ? event.clientX : event.touches[0].clientX
  leftToggleDragState.startY = event.type === 'mousedown' ? event.clientY : event.touches[0].clientY
  leftToggleDragState.startWidth = userSettings.settings.drawer.leftWidth
  leftToggleDragState.hasMoved = false
  leftToggleDragState.wasClosed = !dashboardLayoutStore.mainNavigationOpen

  if (!leftToggleDragState.wasClosed) {
    startMainNavigationWidth.value = leftToggleDragState.startWidth
  }

  document.addEventListener('mousemove', handleLeftToggleMouseMove)
  document.addEventListener('mouseup', handleLeftToggleMouseUp)
  document.addEventListener('touchmove', handleLeftToggleMouseMove, { passive: true })
  document.addEventListener('touchend', handleLeftToggleMouseUp, { passive: true })
}

// 왼쪽 사이드바 드래그 이동
function handleLeftToggleMouseMove(event) {
  const currentX = event.type === 'mousemove' ? event.clientX : event.touches[0].clientX
  const currentY = event.type === 'mousemove' ? event.clientY : event.touches[0].clientY
  const deltaX = Math.abs(currentX - leftToggleDragState.startX)
  const deltaY = Math.abs(currentY - leftToggleDragState.startY)

  if (deltaX > 5 || deltaY > 5) {
    leftToggleDragState.hasMoved = true
    leftToggleDragState.isDragging = true

    if (leftToggleDragState.wasClosed && !dashboardLayoutStore.mainNavigationOpen) {
      const maxWidth = Math.min(600, Math.floor(window.innerWidth * 0.6))
      const initialWidth = Math.max(0, Math.min(currentX, maxWidth))
      userSettings.settings.drawer.leftWidth = initialWidth
      dashboardLayoutStore.toggleMainNavigation()
      leftToggleDragState.startWidth = initialWidth
      startMainNavigationWidth.value = initialWidth
      startMainNavigationX.value = currentX
    }

    if (!isMainNavigationResizing.value) {
      isMainNavigationResizing.value = true
      if (!leftToggleDragState.wasClosed || dashboardLayoutStore.mainNavigationOpen) {
        startMainNavigationX.value = leftToggleDragState.startX
      }

      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
      document.body.style.webkitUserSelect = 'none'
      document.body.style.mozUserSelect = 'none'
      document.body.style.msUserSelect = 'none'
    }

    const diff = currentX - startMainNavigationX.value
    const maxWidth = Math.min(600, Math.floor(window.innerWidth * 0.6))
    const newWidth = Math.max(0, Math.min(startMainNavigationWidth.value + diff, maxWidth))

    // 드래그 중에는 Y 위치도 실시간 업데이트 (지연 없이)
    const buttonHalfHeight = BUTTON_HEIGHT / 2
    const minY = menuAreaHeight.value + buttonHalfHeight
    const maxY = window.innerHeight - buttonHalfHeight
    buttonY.value = Math.max(minY, Math.min(maxY, currentY))

    if (newWidth <= 50) {
      userSettings.settings.drawer.leftWidth = 0
      if (dashboardLayoutStore.mainNavigationOpen) {
        dashboardLayoutStore.toggleMainNavigation()
      }
    } else {
      userSettings.settings.drawer.leftWidth = newWidth
    }
  }
}

// 왼쪽 사이드바 드래그 종료
function handleLeftToggleMouseUp() {
  const wasDragging = leftToggleDragState.isDragging

  document.removeEventListener('mousemove', handleLeftToggleMouseMove)
  document.removeEventListener('mouseup', handleLeftToggleMouseUp)
  document.removeEventListener('touchmove', handleLeftToggleMouseMove)
  document.removeEventListener('touchend', handleLeftToggleMouseUp)

  if (wasDragging) {
    stopMainNavigationResize()
  } else if (!leftToggleDragState.hasMoved) {
    if (leftToggleDragState.wasClosed) {
      const savedWidth = leftToggleDragState.startWidth
      const restoreWidth = savedWidth > 50 ? savedWidth : 250
      userSettings.settings.drawer.leftWidth = restoreWidth
      dashboardLayoutStore.toggleMainNavigation()
      userSettings.saveSettings()
    } else {
      dashboardLayoutStore.toggleMainNavigation()
    }
  }

  leftToggleDragState.isDragging = false
  leftToggleDragState.hasMoved = false
}

const rightToggleDragState = { isDragging: false, startX: 0, startY: 0, startWidth: 0, hasMoved: false, wasClosed: false }
function handleRightToggleMouseDown(event) {
  event.preventDefault()
  event.stopPropagation()

  rightToggleDragState.isDragging = false
  rightToggleDragState.startX = event.type === 'mousedown' ? event.clientX : event.touches[0].clientX
  rightToggleDragState.startY = event.type === 'mousedown' ? event.clientY : event.touches[0].clientY
  rightToggleDragState.startWidth = userSettings.settings.drawer.rightWidth
  rightToggleDragState.hasMoved = false
  rightToggleDragState.wasClosed = !userSettings.settings.drawer.rightOpen

  if (!rightToggleDragState.wasClosed) {
    startWidth.value = rightToggleDragState.startWidth
  }

  document.addEventListener('mousemove', handleRightToggleMouseMove)
  document.addEventListener('mouseup', handleRightToggleMouseUp)
  document.addEventListener('touchmove', handleRightToggleMouseMove, { passive: true })
  document.addEventListener('touchend', handleRightToggleMouseUp, { passive: true })
}

// 오른쪽 사이드바 드래그 이동
function handleRightToggleMouseMove(event) {
  const currentX = event.type === 'mousemove' ? event.clientX : event.touches[0].clientX
  const currentY = event.type === 'mousemove' ? event.clientY : event.touches[0].clientY
  const deltaX = Math.abs(currentX - rightToggleDragState.startX)
  const deltaY = Math.abs(currentY - rightToggleDragState.startY)

  if (deltaX > 5 || deltaY > 5) {
    rightToggleDragState.hasMoved = true
    rightToggleDragState.isDragging = true

    if (rightToggleDragState.wasClosed && !userSettings.settings.drawer.rightOpen) {
      const maxWidth = Math.min(800, Math.floor(window.innerWidth * 0.6))
      const initialWidth = Math.max(0, Math.min(window.innerWidth - currentX, maxWidth))
      userSettings.settings.drawer.rightWidth = initialWidth
      togglePropertyPanel()
      rightToggleDragState.startWidth = initialWidth
      startWidth.value = initialWidth
      startX.value = currentX
    }

    if (!isResizing.value) {
      isResizing.value = true
      if (!rightToggleDragState.wasClosed || userSettings.settings.drawer.rightOpen) {
        startX.value = rightToggleDragState.startX
      }

      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
      document.body.style.webkitUserSelect = 'none'
      document.body.style.mozUserSelect = 'none'
      document.body.style.msUserSelect = 'none'
    }

    const diff = startX.value - currentX
    const maxWidth = Math.min(800, Math.floor(window.innerWidth * 0.6))
    const newWidth = Math.max(0, Math.min(startWidth.value + diff, maxWidth))

    // 드래그 중에는 Y 위치도 실시간 업데이트 (지연 없이)
    const buttonHalfHeight = BUTTON_HEIGHT / 2
    const minY = menuAreaHeight.value + buttonHalfHeight
    const maxY = window.innerHeight - buttonHalfHeight
    buttonY.value = Math.max(minY, Math.min(maxY, currentY))

    if (newWidth <= 50) {
      userSettings.settings.drawer.rightWidth = 0
      if (userSettings.settings.drawer.rightOpen) {
        togglePropertyPanel()
      }
    } else {
      userSettings.settings.drawer.rightWidth = newWidth
    }
  }
}

// 오른쪽 사이드바 드래그 종료
function handleRightToggleMouseUp() {
  const wasDragging = rightToggleDragState.isDragging

  document.removeEventListener('mousemove', handleRightToggleMouseMove)
  document.removeEventListener('mouseup', handleRightToggleMouseUp)
  document.removeEventListener('touchmove', handleRightToggleMouseMove)
  document.removeEventListener('touchend', handleRightToggleMouseUp)

  if (wasDragging) {
    stopResize()
  } else if (!rightToggleDragState.hasMoved) {
    if (rightToggleDragState.wasClosed) {
      const savedWidth = rightToggleDragState.startWidth
      const restoreWidth = savedWidth > 50 ? savedWidth : 300
      userSettings.settings.drawer.rightWidth = restoreWidth
      togglePropertyPanel()
      userSettings.saveSettings()
    } else {
      togglePropertyPanel()
    }
  }

  rightToggleDragState.isDragging = false
  rightToggleDragState.hasMoved = false
}

// ============================================
// 더블클릭으로 사이드바 제어
// ============================================

// 헬퍼 함수: 사이드바 너비 계산 및 복원
function calculateRestoreWidth(savedWidth, maxWidthLimit, defaultWidth) {
  const maxWidth = Math.min(maxWidthLimit, Math.floor(window.innerWidth * 0.6))
  return savedWidth > 50 ? Math.min(savedWidth, maxWidth) : defaultWidth
}

// 헬퍼 함수: 왼쪽 사이드바 열기
function openLeftSidebar() {
  const restoreWidth = calculateRestoreWidth(
    userSettings.settings.drawer.leftWidth,
    600, // maxWidthLimit
    250, // defaultWidth
  )
  userSettings.settings.drawer.leftWidth = restoreWidth
  dashboardLayoutStore.toggleMainNavigation()
}

function closeLeftSidebar() {
  if (dashboardLayoutStore.mainNavigationOpen) {
    dashboardLayoutStore.toggleMainNavigation()
  }
}

// 헬퍼 함수: 오른쪽 사이드바 열기
function openRightSidebar() {
  const restoreWidth = calculateRestoreWidth(
    userSettings.settings.drawer.rightWidth,
    800, // maxWidthLimit
    300, // defaultWidth
  )
  userSettings.settings.drawer.rightWidth = restoreWidth
  togglePropertyPanel()
}

function closeRightSidebar() {
  if (userSettings.settings.drawer.rightOpen) {
    togglePropertyPanel()
  }
}

// 헬퍼 함수: 마지막으로 연 사이드바 기록
function setLastOpenedSidebar(side) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem('last-opened-sidebar', side)
}

// function getLastOpenedSidebar() {
//   if (typeof localStorage === 'undefined') return 'right'
//   return localStorage.getItem('last-opened-sidebar') || 'right'
// }

// 더블클릭 핸들러 (메인 콘텐츠 영역)
// 더블클릭 핸들러 (메인 콘텐츠 영역)
function handleMainContentDoubleClick(event) {
  // 사이드바, 토글 버튼, 입력 필드 등은 제외
  const target = event.target
  if (target.closest('.q-drawer') || target.closest('.sidebar-toggle-button') || target.closest('input') || target.closest('textarea') || target.closest('[contenteditable="true"]') || target.closest('button') || target.closest('a') || target.closest('.q-btn')) {
    return
  }

  // Vue Flow(Nexion 등): 더블클릭으로 노드 추가·줌 등 도메인이 처리하도록 그대로 둠 (preventDefault 금지)
  if (target.closest('.vue-flow') || target.closest('.nexion-vue-flow')) {
    return
  }

  // 텍스트 선택 방지
  event.preventDefault()

  // 이미 선택된 텍스트 해제
  if (window.getSelection) {
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
      selection.removeAllRanges()
    }
  }

  // -----------------------------
  // 🔥 더블클릭 위치 판별 로직 추가
  // -----------------------------
  const container = event.currentTarget
  if (!(container instanceof HTMLElement)) return

  const rect = container.getBoundingClientRect()
  const x = event.clientX - rect.left
  const ratio = x / rect.width

  const isLeftZone = ratio < 0.4
  const isRightZone = ratio > 0.6

  // 중앙 영역은 무시 (의도 없는 더블클릭 방지)
  if (!isLeftZone && !isRightZone) return

  const isLeftOpen = dashboardLayoutStore.mainNavigationOpen
  const isRightOpen = userSettings.settings.drawer.rightOpen

  // -----------------------------
  // Shift + 더블클릭: 둘 다 열기
  // -----------------------------
  if (event.shiftKey) {
    if (!isLeftOpen) openLeftSidebar()
    if (!isRightOpen) openRightSidebar()

    if (!isLeftOpen && !isRightOpen) {
      setLastOpenedSidebar('right')
    } else if (!isLeftOpen) {
      setLastOpenedSidebar('left')
    } else if (!isRightOpen) {
      setLastOpenedSidebar('right')
    }

    userSettings.saveSettings()
    return
  }

  // -----------------------------
  // 좌측 영역 더블클릭
  // -----------------------------
  if (isLeftZone) {
    if (isLeftOpen) {
      setLastOpenedSidebar('left')
      dashboardLayoutStore.toggleMainNavigation()
    } else {
      openLeftSidebar()
      setLastOpenedSidebar('left')
    }
    userSettings.saveSettings()
    return
  }

  // -----------------------------
  // 우측 영역 더블클릭
  // -----------------------------
  if (isRightZone) {
    if (isRightOpen) {
      setLastOpenedSidebar('right')
      togglePropertyPanel()
    } else {
      openRightSidebar()
      setLastOpenedSidebar('right')
    }
    userSettings.saveSettings()
    return
  }
}

// ============================================
// 사이드바 드래그 제어
// ============================================
// 사이드바 드래그 제어 Edge/Swipe Gesture: Sidebar Control PC & Mobile (문제는 PC에서 잘 작동을 안함 특히 오른쪽 사이드바는 잘 작동하지 않음)---
// 모바일 오작동 방지 코드 TODO: 모바일 오작동 방지 코드 수정 필요
// body {
//   overscroll-behavior-x: contain;
// }

// 사파리 오작동 방지 코드 TODO: 사파리 오작동 방지 코드 수정 필요
// window.addEventListener('touchmove', e => {
//   if (e.target.closest('.sidebar')) return
// }, { passive: true })

useSidebarGesture({
  openLeft: openLeftSidebar,
  closeLeft: closeLeftSidebar,
  openRight: openRightSidebar,
  closeRight: closeRightSidebar,
})

// ============================================
// 라이프사이클
// ============================================
// --- Lifecycle ---
onMounted(() => {
  userSettings.initializeTheme()

  // 초기 버튼 Y좌표 설정
  nextTick(() => {
    const buttonHalfHeight = BUTTON_HEIGHT / 2
    const initialY = window.innerHeight / 2
    const minY = (headerRef.value?.$el?.offsetHeight || 42) + buttonHalfHeight
    const maxY = window.innerHeight - buttonHalfHeight
    const initialButtonY = Math.max(minY, Math.min(maxY, initialY))
    buttonY.value = initialButtonY
    mouseY.value = initialButtonY
  })

  window.addEventListener('mousemove', handleMouseMove)

  // 메인 메뉴 오버플로우 감지 시작
  nextTick(() => {
    checkMainMenuOverflow()
    if (mainMenuTabsRef.value && mainMenuTabsRef.value.$el) {
      mainMenuResizeObserver = new ResizeObserver(checkMainMenuOverflow)
      mainMenuResizeObserver.observe(mainMenuTabsRef.value.$el)
    }
  })
  window.addEventListener('resize', checkMainMenuOverflow)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('resize', checkMainMenuOverflow)
  if (mainMenuResizeObserver) {
    mainMenuResizeObserver.disconnect()
  }
})

const editModeDrawerStyles = computed(() => ({ borderRight: 'none' }))
const rightDrawerStyles = computed(() =>
  userSettings.settings.drawer.rightMode === 'overlay'
    ? {
        overflow: 'visible',
        boxShadow: '-9px 0 8px var(--nexa-shadow-1)',
      }
    : {},
)
</script>

<style lang="scss">
@import '@system/css/app.scss';

/* 레이아웃 및 사이드바 영역 고정 */
.q-drawer {
  .q-drawer__content {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* 드로어 자체 스크롤 방지 (내부 q-scroll-area가 담당하도록) */
  }

  // 오른쪽 드로어에만 4px 패딩 추가
  &.q-drawer--right {
    .q-drawer__content {
      padding: 4px;
      box-sizing: border-box;
    }
  }
}

.q-page-container {
  height: 100vh; // ⚠️ 제거금지!!! 제거시 부품관리 컨테이너 높이 계산 로직과 충돌(페이징)
  box-sizing: border-box;
  overflow: hidden; /* 컨테이너 스크롤 방지 */
  display: flex;
  flex-direction: column;

  /* 실제 컨텐츠 영역만 독립 스크롤 */
  .q-page {
    flex: 1;
    min-height: 0; /* Quasar 기본 min-height 무력화 */
    overflow-y: auto; /* 세로 스크롤 활성화 */
    overflow-x: hidden;
    scroll-behavior: smooth;
  }
}

.main-header-toolbar {
  background: var(--nexa-surface);
  color: var(--nexa-text-primary);
}

.main-header-action {
  color: var(--nexa-primary);
}

.main-footer {
  background: var(--nexa-surface);
  color: var(--nexa-text-secondary);
}

/* 퀘이사 드로어 기본 보더 오버라이드 */
.q-drawer--bordered {
  border: 1px solid var(--nexa-border-color-darker) !important;
  transition: border-color 0.3s ease;

  // 리사이징 핸들 호버 또는 드래그 시 보더 강조 (넥사 메인 컬러)
  &:has(.resize-handle:hover),
  &:has(.resize-handle-right:hover),
  &:has(.resize-handle.resizing),
  &:has(.resize-handle-right.resizing) {
    border-color: var(--nexa-primary) !important;
  }
}

.resize-handle,
.resize-handle-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: ew-resize;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  .resize-dots {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .dot {
    width: 4px;
    height: 4px;
    background: var(--nexa-primary);
    border-radius: 50%;
    opacity: 0.3;
  }
  &:hover .dot {
    opacity: 0.8;
  }
}
.resize-handle-right {
  right: 0;
}
.resize-handle {
  left: 0;
}
.sidebar-toggle-button {
  position: fixed;
  width: 22px;
  height: 120px;
  background: var(--nexa-background-darker);
  border: 1px solid var(--nexa-border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2001;
  cursor: pointer;
  transition:
    top 0.5s ease-out,
    left 0.3s ease-in-out,
    right 0.3s ease-in-out,
    background-color 0.3s ease;

  &.is-resizing {
    transition: none !important;
  }
  .q-icon {
    font-size: 14px;
    color: var(--nexa-primary);
    transition: transform 0.3s;
  }
  .toggle-label {
    writing-mode: vertical-rl;
    font-size: 10px;
    color: var(--nexa-text-secondary);
    margin-top: 4px;
  }
  &:hover {
    background: var(--nexa-surface);
    .q-icon {
      color: var(--nexa-accent);
    }
  }
}
.sidebar-toggle-button--left {
  left: 0;
  border-radius: 0 8px 8px 0;
  border-left: none;
}
.sidebar-toggle-button--right {
  right: 0;
  border-radius: 8px 0 0 8px;
  border-right: none;
}
.footer-nexa-logo {
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 5px;
  color: var(--nexa-primary);
}
.footer-system-features {
  font-size: 8px;
  line-height: 1;
}
</style>
