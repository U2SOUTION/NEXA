<!--
  NEXA 플랫폼 v2 표준 레이아웃 (MainLayout)
  - 3단 슬롯 구조: Left Sidebar, Content, Right Sidebar
  - 중앙 관제형 설계를 위해 로직을 최소화하고 슬롯 위주로 구성
-->
<template>
  <q-layout view="hHh Lpr fFf">
    <!-- 헤더 영역 -->
    <q-header v-if="!isIframeMode" ref="headerRef">
      <q-toolbar class="bg-grey-10" dense>
        <!-- 왼쪽 헤더: 로고 및 메인 메뉴 -->
        <StandardLeftHeader 
          :menu-tabs="mainMenuTabs"
          :current-menu="currentMenu"
          :show-labels="showLabels"
          :show-tab-icons="showTabIcons"
          :is-overflowing="isMainMenuOverflowing"
          :hidden-tabs="hiddenTabs"
          :hidden-tab-names="hiddenTabNames"
          @tab-click="handleTabClick"
        />

        <q-space />

        <!-- 오른쪽 헤더: 도메인별 컨텍스트 액션 및 시스템 버튼 -->
        <StandardRightHeader
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
        </StandardRightHeader>
      </q-toolbar>
    </q-header>

    <!-- 왼쪽 사이드바 -->
    <q-drawer v-if="!isIframeMode" v-model="dashboardLayoutStore.mainNavigationOpen" show-if-above bordered :width="userSettings.settings.drawer.leftWidth" :style="editModeDrawerStyles" class="drawer-border">
      <div class="resize-handle-right" @mousedown="startMainNavigationResize" :class="{ resizing: isMainNavigationResizing }">
        <div class="resize-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
      </div>
      <component v-if="leftSidebarComponent" :is="leftSidebarComponent" :highlighted-node-id="highlightedNodeId" />
    </q-drawer>

    <q-page-container :class="{ 'parts-management-container': currentMenu === 'parts-management', 'iframe-mode': isIframeMode }" @dblclick="handleMainContentDoubleClick">
      <router-view />
    </q-page-container>

    <!-- 오른쪽 사이드바 -->
    <q-drawer
      v-if="!isIframeMode"
      v-model="userSettings.settings.drawer.rightOpen"
      side="right"
      bordered
      :width="userSettings.settings.drawer.rightWidth"
      :overlay="userSettings.settings.drawer.rightMode === 'overlay'"
      :style="rightDrawerStyles"
      :class="['drawer-border', userSettings.settings.drawer.rightMode === 'overlay' ? 'drawer-overlay' : 'drawer-push']"
    >
      <div class="resize-handle" @mousedown="startResize" :class="{ resizing: isResizing }">
        <div class="resize-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
      </div>
      <component v-if="rightSidebarComponent" :is="rightSidebarComponent" />
    </q-drawer>

    <!-- 토글 버튼 -->
    <div v-if="!isIframeMode" ref="leftToggleButtonRef" class="sidebar-toggle-button sidebar-toggle-button--left" :class="{ 'is-drawer-open': dashboardLayoutStore.mainNavigationOpen }" :style="leftButtonStyle" @mousedown="handleLeftToggleMouseDown">
      <q-icon name="double_arrow" :style="{ transform: `rotate(${leftIconRotation})` }" />
      <span class="toggle-label">LEFT NAV</span>
    </div>

    <div v-if="!isIframeMode" ref="rightToggleButtonRef" class="sidebar-toggle-button sidebar-toggle-button--right" :class="{ 'is-drawer-open': userSettings.settings.drawer.rightOpen, 'is-overlay-mode': userSettings.settings.drawer.rightMode === 'overlay' }" :style="rightButtonStyle" @mousedown="handleRightToggleMouseDown">
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
import StandardLeftHeader from './components/StandardLeftHeader.vue'
import StandardRightHeader from './components/StandardRightHeader.vue'
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
  if (path.startsWith('/nexa-board')) return 'nexa-board'
  if (path.startsWith('/parts-management')) return 'parts-management'
  if (path.startsWith('/nexa-pannel')) return 'nexa-pannel'
  if (path.startsWith('/nexa-node')) return 'automation'
  if (path.startsWith('/nexa-trace')) return 'nexa-trace'
  if (path.startsWith('/erp')) return 'erp'
  if (path.startsWith('/infra')) return 'infra'
  if (path.startsWith('/network')) return 'network'
  if (path.startsWith('/portfolio')) return 'portfolio'
  if (path.startsWith('/solutions')) return 'solutions'
  if (path.startsWith('/extension')) return 'extension'
  if (path.startsWith('/dev')) return 'dev'
  if (path.startsWith('/help')) return 'help'
  if (path.startsWith('/my')) return 'my'
  return 'home'
})

const isNexaBoardMenu = computed(() => currentMenu.value === 'nexa-board')

const mainMenuTabs = [
  { name: 'home', label: 'HOME', icon: 'home', route: '/' },
  { name: 'nexa-board', label: 'BOARD', icon: 'dashboard', route: '/nexa-board', nexaPrefix: true },
  { name: 'nexa-pannel', label: 'PANNEL', icon: 'widgets', route: '/nexa-pannel', nexaPrefix: true },
  { name: 'automation', label: 'NODE', icon: 'hub', route: '/nexa-node', nexaPrefix: true },
  { name: 'nexa-trace', label: 'TRACE', icon: 'analytics', route: '/nexa-trace', nexaPrefix: true },
  { name: 'erp', label: 'ERP', icon: 'business', route: '/erp', nexaPrefix: true },
  { name: 'parts-management', label: '부품관리', icon: 'inventory_2', route: '/parts-management' },
  { name: 'infra', label: 'INFRA', icon: 'settings', route: '/infra' },
  { name: 'network', label: 'NETWORK', icon: 'lan', route: '/network' },
  { name: 'portfolio', label: 'PORTFOLIO', icon: 'portrait', route: '/portfolio' },
  { name: 'solutions', label: 'SOLUTIONS', icon: 'lightbulb', route: '/solutions' },
  { name: 'extension', label: 'EXTENSION', icon: 'extension', route: '/extension' },
  { name: 'dev', label: 'DEV', icon: 'code', route: '/dev' },
  { name: 'help', label: 'HELP', icon: 'help_outline', route: '/help' },
]

const hiddenTabNames = computed(() => new Set(hiddenTabs.value.map(t => t.name)))

// --- Handlers ---
const handleTabClick = (tab) => {
  if (tab.onClick) tab.onClick()
  router.push(tab.route)
}

const togglePropertyPanel = () => {
  userSettings.setRightDrawerOpen(!userSettings.settings.drawer.rightOpen)
}

// --- Dynamic Sidebar Watcher ---
watch(currentMenu, async (newMenu) => {
  leftSidebarComponent.value = await getLeftSidebarComponent(newMenu)
  rightSidebarComponent.value = await getRightSidebarComponent(newMenu)
}, { immediate: true })

// --- Resize Logic (Ported from original) ---
const isMainNavigationResizing = ref(false)
const startMainNavigationX = ref(0)
const startMainNavigationWidth = ref(0)

const startMainNavigationResize = (event) => {
  isMainNavigationResizing.value = true
  startMainNavigationX.value = event.type === 'mousedown' ? event.clientX : event.touches[0].clientX
  startMainNavigationWidth.value = userSettings.settings.drawer.leftWidth
  document.body.style.cursor = 'ew-resize'
  document.addEventListener('mousemove', handleMainNavigationResize)
  document.addEventListener('mouseup', stopMainNavigationResize)
}

const handleMainNavigationResize = (event) => {
  if (!isMainNavigationResizing.value) return
  const currentX = event.type === 'mousemove' ? event.clientX : event.touches[0].clientX
  const diff = currentX - startMainNavigationX.value
  const maxWidth = Math.min(600, Math.floor(window.innerWidth * 0.6))
  const newWidth = Math.max(0, Math.min(startMainNavigationWidth.value + diff, maxWidth))
  userSettings.settings.drawer.leftWidth = newWidth
}

const stopMainNavigationResize = () => {
  isMainNavigationResizing.value = false
  document.body.style.cursor = ''
  userSettings.saveSettings()
  document.removeEventListener('mousemove', handleMainNavigationResize)
  document.removeEventListener('mouseup', stopMainNavigationResize)
}

const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)

const startResize = (event) => {
  isResizing.value = true
  startX.value = event.type === 'mousedown' ? event.clientX : event.touches[0].clientX
  startWidth.value = userSettings.settings.drawer.rightWidth
  document.body.style.cursor = 'ew-resize'
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const handleResize = (event) => {
  if (!isResizing.value) return
  const currentX = event.type === 'mousemove' ? event.clientX : event.touches[0].clientX
  const diff = startX.value - currentX
  const maxWidth = Math.min(800, Math.floor(window.innerWidth * 0.6))
  const newWidth = Math.max(0, Math.min(startWidth.value + diff, maxWidth))
  userSettings.settings.drawer.rightWidth = newWidth
}

const stopResize = () => {
  isResizing.value = false
  document.body.style.cursor = ''
  userSettings.saveSettings()
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// --- Floating Toggle Buttons Logic ---
const buttonY = ref(window.innerHeight / 2)
const BUTTON_HEIGHT = 120
const mouseY = ref(0)
let autoMoveTimer = null

const updateButtonPosition = () => {
  const minY = (headerRef.value?.$el?.offsetHeight || 42) + BUTTON_HEIGHT / 2
  const maxY = window.innerHeight - BUTTON_HEIGHT / 2
  buttonY.value = Math.max(minY, Math.min(maxY, mouseY.value))
}

const handleMouseMove = (event) => {
  mouseY.value = event.clientY
  if (autoMoveTimer) clearTimeout(autoMoveTimer)
  autoMoveTimer = setTimeout(updateButtonPosition, 300)
}

const leftButtonStyle = computed(() => ({
  top: `${buttonY.value - BUTTON_HEIGHT / 2}px`,
  left: dashboardLayoutStore.mainNavigationOpen ? `${userSettings.settings.drawer.leftWidth}px` : '0'
}))

const rightButtonStyle = computed(() => ({
  top: `${buttonY.value - BUTTON_HEIGHT / 2}px`,
  right: userSettings.settings.drawer.rightOpen ? `${userSettings.settings.drawer.rightWidth}px` : '0'
}))

const leftIconRotation = computed(() => dashboardLayoutStore.mainNavigationOpen ? '0deg' : '180deg')
const rightIconRotation = computed(() => userSettings.settings.drawer.rightOpen ? '180deg' : '0deg')

// Dragging for toggle buttons
const leftToggleDragState = { isDragging: false, startX: 0, startWidth: 0 }
function handleLeftToggleMouseDown(event) {
  leftToggleDragState.startX = event.clientX
  leftToggleDragState.startWidth = userSettings.settings.drawer.leftWidth
  document.addEventListener('mousemove', handleLeftToggleMouseMove)
  document.addEventListener('mouseup', handleLeftToggleMouseUp)
}
function handleLeftToggleMouseMove(event) {
  const diff = event.clientX - leftToggleDragState.startX
  if (Math.abs(diff) > 5) {
    leftToggleDragState.isDragging = true
    if (!dashboardLayoutStore.mainNavigationOpen) dashboardLayoutStore.toggleMainNavigation()
    userSettings.settings.drawer.leftWidth = Math.max(0, leftToggleDragState.startWidth + diff)
  }
}
function handleLeftToggleMouseUp() {
  if (!leftToggleDragState.isDragging) dashboardLayoutStore.toggleMainNavigation()
  leftToggleDragState.isDragging = false
  document.removeEventListener('mousemove', handleLeftToggleMouseMove)
  document.removeEventListener('mouseup', handleLeftToggleMouseUp)
}

const rightToggleDragState = { isDragging: false, startX: 0, startWidth: 0 }
function handleRightToggleMouseDown(event) {
  rightToggleDragState.startX = event.clientX
  rightToggleDragState.startWidth = userSettings.settings.drawer.rightWidth
  document.addEventListener('mousemove', handleRightToggleMouseMove)
  document.addEventListener('mouseup', handleRightToggleMouseUp)
}
function handleRightToggleMouseMove(event) {
  const diff = rightToggleDragState.startX - event.clientX
  if (Math.abs(diff) > 5) {
    rightToggleDragState.isDragging = true
    if (!userSettings.settings.drawer.rightOpen) togglePropertyPanel()
    userSettings.settings.drawer.rightWidth = Math.max(0, rightToggleDragState.startWidth + diff)
  }
}
function handleRightToggleMouseUp() {
  if (!rightToggleDragState.isDragging) togglePropertyPanel()
  rightToggleDragState.isDragging = false
  document.removeEventListener('mousemove', handleRightToggleMouseMove)
  document.removeEventListener('mouseup', handleRightToggleMouseUp)
}

// --- Double Click Handler ---
function handleMainContentDoubleClick(event) {
  if (event.target.closest('.q-drawer') || event.target.closest('.sidebar-toggle-button')) return
  const isLeftOpen = dashboardLayoutStore.mainNavigationOpen
  const isRightOpen = userSettings.settings.drawer.rightOpen
  if (isLeftOpen && isRightOpen) {
    dashboardLayoutStore.toggleMainNavigation()
    nextTick(togglePropertyPanel)
  } else if (!isLeftOpen && !isRightOpen) {
    dashboardLayoutStore.toggleMainNavigation()
  } else if (isLeftOpen) {
    dashboardLayoutStore.toggleMainNavigation()
  } else {
    togglePropertyPanel()
  }
}

// --- Lifecycle ---
onMounted(() => {
  userSettings.initializeTheme()
  window.addEventListener('mousemove', handleMouseMove)
  // ... more initializations ...
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})

const editModeDrawerStyles = computed(() => ({ borderRight: 'none' }))
const rightDrawerStyles = computed(() => userSettings.settings.drawer.rightMode === 'overlay' ? {
  overflow: 'visible',
  boxShadow: '-9px 0 8px var(--nexa-shadow-1)'
} : {})
</script>

<style lang="scss">
@import "@system/css/app.scss";
/* Styles from original MainLayout.vue */
.drawer-border { border-color: var(--nexa-border-color); }
.resize-handle, .resize-handle-right {
  position: absolute; top: 0; bottom: 0; width: 4px; cursor: ew-resize; z-index: 1001;
  display: flex; align-items: center; justify-content: center;
  .resize-dots { display: flex; flex-direction: column; gap: 4px; }
  .dot { width: 4px; height: 4px; background: var(--nexa-primary); border-radius: 50%; opacity: 0.3; }
  &:hover .dot { opacity: 0.8; }
}
.resize-handle-right { right: 0; }
.resize-handle { left: 0; }
.sidebar-toggle-button {
  position: fixed; width: 22px; height: 120px; background: var(--nexa-background-darker);
  border: 1px solid var(--nexa-border-color); display: flex; flex-direction: column;
  align-items: center; justify-content: center; z-index: 2001; cursor: pointer;
  .q-icon { font-size: 14px; color: var(--nexa-primary); transition: transform 0.3s; }
  .toggle-label { writing-mode: vertical-rl; font-size: 10px; color: var(--nexa-text-secondary); margin-top: 4px; }
  &:hover { background: var(--nexa-surface); .q-icon { color: var(--nexa-accent); } }
}
.sidebar-toggle-button--left { left: 0; border-radius: 0 8px 8px 0; border-left: none; }
.sidebar-toggle-button--right { right: 0; border-radius: 8px 0 0 8px; border-right: none; }
.footer-nexa-logo { font-size: 18px; font-weight: 900; letter-spacing: 5px; color: var(--nexa-primary); }
.footer-system-features { font-size: 8px; line-height: 1; }
</style>
