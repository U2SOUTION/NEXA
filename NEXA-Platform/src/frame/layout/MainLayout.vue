<!--
  NEXA 플랫폼 v2 표준 레이아웃 (MainLayout)
  - 3단 슬롯 구조: Left Sidebar, Content, Right Sidebar
  - 중앙 관제형 설계를 위해 로직을 최소화하고 슬롯 위주로 구성
-->
<template>
  <q-layout view="HHH Lpr fFf">
    <!-- 헤더 영역 -->
    <q-header v-if="!isIframeMode" ref="headerRef">
      <q-toolbar class="bg-grey-10" dense>
        <!-- 왼쪽 헤더: 로고 및 메인 메뉴 -->
        <GlobalNavbarLeft :menu-tabs="mainMenuTabs" :current-menu="currentMenu" :show-labels="showLabels" :show-tab-icons="showTabIcons" :is-overflowing="isMainMenuOverflowing" :hidden-tabs="hiddenTabs" :hidden-tab-names="hiddenTabNames" @tab-click="handleTabClick" />

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
          <template #context-actions>
            <template v-if="isNexaBoardMenu">
              <q-btn flat dense icon="add_box" :label="showLabels ? '넥사패널 추가' : undefined" @click="dashboardLayoutStore.triggerGenericAddPanel" :disable="!dashboardLayoutStore.selectedPaneId" class="text-primary">
                <q-tooltip>선택된 창에 넥사패널 추가</q-tooltip>
              </q-btn>
              <q-btn flat dense icon="view_quilt" :label="showLabels ? '보드창 선택' : undefined" class="text-primary" @click="showWindowPresetModal = true">
                <q-tooltip>창 변경</q-tooltip>
              </q-btn>
            </template>
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

    <q-page-container :class="{ 'parts-management-container': currentMenu === 'parts-management', 'iframe-mode': isIframeMode }" @dblclick="handleMainContentDoubleClick">
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
      <span class="toggle-label">RIGHT PANEL</span>
    </div>

    <!-- 푸터 -->
    <q-footer v-if="!isIframeMode" class="bg-grey-10 text-grey-6">
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
import { getLeftSidebarComponent, getRightSidebarComponent } from '@frame/registry/domainRegistry'

// Composables & Utils
import WindowPresetEditModal from '@domains/board/components/window/WindowPresetEditModal.vue'

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

// 메인 메뉴 영역 높이 계산 (헤더 전체의 실제 높이를 직접 측정)
const menuAreaHeight = computed(() => {
  if (headerRef.value && headerRef.value.$el) {
    const actualHeight = headerRef.value.$el.offsetHeight || 0
    if (actualHeight > 0) return actualHeight
  }
  return 42 // Fallback: --header-height 기본값
})

const isMainMenuOverflowing = ref(false)
const hiddenTabs = ref([])

const leftSidebarComponent = shallowRef(null)
const rightSidebarComponent = shallowRef(null)

// --- Computed ---
const isIframeMode = computed(() => route.query.mode === 'popup' || route.query.mode === 'sidepanel' || window.self !== window.top)
const showLabels = computed(() => $q.screen.gt.lg)
const showTabIcons = computed(() => $q.screen.gt.md)

const currentMenu = computed(() => {
  const path = route.path
  if (path === '/' || path === '') return 'home'

  const menuMap = {
    '/nexa-board': 'nexa-board',
    '/parts-management': 'parts-management',
    '/nexa-pannel': 'nexa-pannel',
    '/nexa-node': 'automation',
    '/nexa-trace': 'nexa-trace',
    '/erp': 'nexa-erp',
    '/infra': 'infra',
    '/network': 'network',
    '/portfolio': 'portfolio',
    '/solutions': 'solutions',
    '/extension': 'extension',
    '/dev': 'dev',
    '/help': 'help',
    '/my': 'my',
  }

  const found = Object.entries(menuMap).find(([key]) => path.startsWith(key))
  return found ? found[1] : 'home'
})

const isNexaBoardMenu = computed(() => currentMenu.value === 'nexa-board')

const mainMenuTabs = [
  { name: 'home', label: 'HOME', icon: 'home', route: '/' },
  { name: 'nexa-board', label: 'BOARD', icon: 'dashboard', route: '/nexa-board', nexaPrefix: true },
  { name: 'nexa-pannel', label: 'PANNEL', icon: 'widgets', route: '/nexa-pannel', nexaPrefix: true },
  { name: 'automation', label: 'NODE', icon: 'hub', route: '/nexa-node', nexaPrefix: true },
  { name: 'nexa-trace', label: 'TRACE', icon: 'analytics', route: '/nexa-trace', nexaPrefix: true },
  { name: 'nexa-erp', label: 'ERP', icon: 'business', route: '/erp', nexaPrefix: true },
  { name: 'parts-management', label: '부품관리', icon: 'inventory_2', route: '/parts-management' },
  { name: 'infra', label: 'INFRA', icon: 'settings', route: '/infra' },
  { name: 'network', label: 'NETWORK', icon: 'lan', route: '/network' },
  { name: 'portfolio', label: 'PORTFOLIO', icon: 'portrait', route: '/portfolio' },
  { name: 'solutions', label: 'SOLUTIONS', icon: 'lightbulb', route: '/solutions' },
  { name: 'extension', label: 'EXTENSION', icon: 'extension', route: '/extension' },
  { name: 'dev', label: 'DEV', icon: 'code', route: '/dev' },
  { name: 'help', label: 'HELP', icon: 'help_outline', route: '/help' },
]

const hiddenTabNames = computed(() => new Set(hiddenTabs.value.map((t) => t.name)))

// --- Handlers ---
const handleTabClick = (tab) => {
  if (tab.onClick) tab.onClick()
  router.push(tab.route)
}

const togglePropertyPanel = () => {
  userSettings.setRightDrawerOpen(!userSettings.settings.drawer.rightOpen)
}

// --- Dynamic Sidebar Watcher ---
watch(
  currentMenu,
  async (newMenu) => {
    leftSidebarComponent.value = await getLeftSidebarComponent(newMenu)
    rightSidebarComponent.value = await getRightSidebarComponent(newMenu)
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
  startWidth.value = userSettings.settings.drawer.rightWidth

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

// --- Floating Toggle Buttons Logic ---
const buttonY = ref(window.innerHeight / 2)
const BUTTON_HEIGHT = 120
const mouseY = ref(0)
let autoMoveTimer = null

// 버튼 위치를 마우스 위치로 업데이트하는 함수
const updateButtonPosition = () => {
  const buttonHalfHeight = BUTTON_HEIGHT / 2
  const buttonTop = buttonY.value - buttonHalfHeight // 버튼 상단
  const buttonBottom = buttonY.value + buttonHalfHeight // 버튼 하단
  const currentMouseY = mouseY.value

  // 마우스가 버튼의 상단이나 하단을 벗어났을 때만 버튼 위치 업데이트
  if (currentMouseY < buttonTop || currentMouseY > buttonBottom) {
    const minY = (headerRef.value?.$el?.offsetHeight || 42) + buttonHalfHeight
    const maxY = window.innerHeight - buttonHalfHeight

    // 마우스 Y좌표를 화면 경계 내로 제한하여 버튼 위치 업데이트
    buttonY.value = Math.max(minY, Math.min(maxY, currentMouseY))
  }
}

const handleMouseMove = (event) => {
  mouseY.value = event.clientY
  if (autoMoveTimer) clearTimeout(autoMoveTimer)
  autoMoveTimer = setTimeout(updateButtonPosition, 300)
}

const leftButtonStyle = computed(() => ({
  top: `${buttonY.value - BUTTON_HEIGHT / 2}px`,
  left: dashboardLayoutStore.mainNavigationOpen ? `${userSettings.settings.drawer.leftWidth}px` : '0',
  transform: 'translateY(0)',
}))

const rightButtonStyle = computed(() => ({
  top: `${buttonY.value - BUTTON_HEIGHT / 2}px`,
  right: userSettings.settings.drawer.rightOpen ? `${userSettings.settings.drawer.rightWidth}px` : '0',
  transform: 'translateY(0)',
}))

const leftIconRotation = computed(() => (dashboardLayoutStore.mainNavigationOpen ? '0deg' : '180deg'))
const rightIconRotation = computed(() => (userSettings.settings.drawer.rightOpen ? '180deg' : '0deg'))

// Dragging for toggle buttons
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

// 헬퍼 함수: 마지막으로 연 사이드바 기록
function setLastOpenedSidebar(side) {
  localStorage.setItem('last-opened-sidebar', side)
}

// 더블클릭 핸들러 (메인 콘텐츠 영역)
function handleMainContentDoubleClick(event) {
  // 사이드바, 토글 버튼, 입력 필드 등은 제외
  const target = event.target
  if (target.closest('.q-drawer') || target.closest('.sidebar-toggle-button') || target.closest('input') || target.closest('textarea') || target.closest('[contenteditable="true"]') || target.closest('button') || target.closest('a') || target.closest('.q-btn')) {
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

  const isLeftOpen = dashboardLayoutStore.mainNavigationOpen
  const isRightOpen = userSettings.settings.drawer.rightOpen

  // Shift + 더블클릭: 둘 다 열기 (상태와 관계없이)
  if (event.shiftKey) {
    if (!isLeftOpen) openLeftSidebar()
    if (!isRightOpen) openRightSidebar()

    // 마지막으로 연 사이드바 기록
    if (!isLeftOpen && !isRightOpen) {
      setLastOpenedSidebar('right') // 둘 다 닫혀있었으면 오른쪽 기록 (다음 번갈아가며 열 때 왼쪽이 열리도록)
    } else if (!isLeftOpen) {
      setLastOpenedSidebar('left')
    } else if (!isRightOpen) {
      setLastOpenedSidebar('right')
    }

    userSettings.saveSettings()
    return
  }

  // 케이스 1: 둘 다 닫혀 있음 → 마지막에 열었던 쪽과 반대 쪽 열기 (번갈아가며 열기)
  if (!isLeftOpen && !isRightOpen) {
    const lastOpenedSidebar = localStorage.getItem('last-opened-sidebar') || 'right' // 기본값 'right'면 첫 번째는 왼쪽이 열림

    if (lastOpenedSidebar === 'right') {
      openLeftSidebar()
      setLastOpenedSidebar('left')
    } else {
      openRightSidebar()
      setLastOpenedSidebar('right')
    }

    userSettings.saveSettings()
    return
  }

  // 케이스 2: 둘 다 열려 있음 → 둘 다 닫기
  if (isLeftOpen && isRightOpen) {
    dashboardLayoutStore.toggleMainNavigation()
    // nextTick으로 Vue 반응성 시스템과 동기화하여 상태 변경 충돌 방지
    nextTick(() => {
      togglePropertyPanel()
    })
    return
  }

  // 케이스 3: 왼쪽만 열려 있음 → 왼쪽 닫기
  if (isLeftOpen && !isRightOpen) {
    setLastOpenedSidebar('left')
    dashboardLayoutStore.toggleMainNavigation()
    return
  }

  // 케이스 4: 오른쪽만 열려 있음 → 오른쪽 닫기
  if (!isLeftOpen && isRightOpen) {
    setLastOpenedSidebar('right')
    togglePropertyPanel()
    return
  }
}

// --- Lifecycle ---
onMounted(() => {
  userSettings.initializeTheme()

  // 초기 버튼 Y좌표 설정 (화면 중앙, 경계 체크 포함)
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
  // ... more initializations ...
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
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
}

.q-page-container {
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden; /* 컨테이너 스크롤 방지 */
  display: flex;
  flex-direction: column;

  &.iframe-mode {
    height: 100vh;
  }

  /* 실제 컨텐츠 영역만 독립 스크롤 */
  .q-page {
    flex: 1;
    height: 100%;
    min-height: 0 !important; /* Quasar 기본 min-height 무력화 */
    overflow-y: auto !important; /* 세로 스크롤 활성화 */
    overflow-x: hidden;
    scroll-behavior: smooth;
  }
}

/* 사이드바 보더 */
.drawer-border {
  border-color: var(--nexa-border-color);
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
