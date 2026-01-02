<!--전체적인 레이아웃 구성-->
<template>
  <q-layout view="hHh Lpr fFf">
    <q-header ref="headerRef">
      <q-toolbar class="bg-grey-10" dense>
        <div class="row items-center no-wrap q-mr-md">
          <q-btn flat dense class="nexa-logo-btn" style="padding: 5px">
            <img src="/LOGO.svg" alt="NEXA" class="nexa-logo" style="width: 90px; height: 26px; display: block" />
            <q-menu>
              <q-list>
                <q-item v-for="tab in mainMenuTabs" :key="tab.name" clickable v-close-popup @click="handleTabClick(tab)">
                  <q-item-section avatar v-if="tab.icon">
                    <q-icon :name="tab.icon" />
                  </q-item-section>
                  <q-item-section>
                    <div class="nexa-menu-content" :class="{ 'has-nexa-prefix': tab.nexaPrefix }">
                      <span v-if="tab.nexaPrefix" class="nexa-prefix">NEXA</span>
                      <span class="nexa-menu-label">{{ tab.displayLabel || tab.label }}</span>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>

        <!-- 메인 메뉴 탭 -->
        <q-tabs ref="mainMenuTabsRef" v-model="currentMenu" dense class="text-primary main-menu-tabs" active-color="primary" indicator-color="primary" align="left">
          <q-route-tab v-for="tab in mainMenuTabs" :key="tab.name" ref="tabRefs" :to="tab.route" :name="tab.name" :icon="showTabIcons ? tab.icon : undefined" :exact="tab.exact" :style="{ display: hiddenTabNames.has(tab.name) ? 'none' : 'flex' }" @click="tab.onClick ? tab.onClick() : undefined">
            <div class="nexa-tab-content" :class="{ 'has-nexa-prefix': tab.nexaPrefix }">
              <span v-if="tab.nexaPrefix" class="nexa-prefix">NEXA</span>
              <span class="nexa-tab-label">{{ tab.displayLabel || tab.label }}</span>
            </div>
          </q-route-tab>
        </q-tabs>

        <!-- 메인 메뉴 더보기 (일부 탭이 가려질 때) - 오른쪽 배치 -->
        <div v-if="isMainMenuOverflowing && hiddenTabs.length > 0" class="row items-center q-ml-sm main-menu-more-button">
          <q-btn flat dense icon="more_horiz" :label="showLabels ? '더보기' : undefined" aria-label="More" class="text-primary">
            <q-tooltip>더보기 ({{ hiddenTabs.length }})</q-tooltip>
            <q-menu>
              <q-list>
                <q-item v-for="tab in hiddenTabs" :key="tab.name" clickable v-close-popup @click="handleTabClick(tab)">
                  <q-item-section avatar v-if="tab.icon">
                    <q-icon :name="tab.icon" />
                  </q-item-section>
                  <q-item-section>
                    <div class="nexa-menu-content" :class="{ 'has-nexa-prefix': tab.nexaPrefix }">
                      <span v-if="tab.nexaPrefix" class="nexa-prefix">NEXA</span>
                      <span class="nexa-menu-label">{{ tab.displayLabel || tab.label }}</span>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>

        <q-space />

        <!-- 오른쪽 아이콘 영역 (전체 래퍼) -->
        <div ref="rightIconAreaRef" class="row items-center no-wrap">
          <!-- 컨텍스트 기능 버튼 (NEXA BOARD에서만 표시) -->
          <div v-if="isNexaBoardMenu" ref="contextIconGroupRef" class="row items-center no-wrap header-icon-group">
            <q-btn flat dense icon="add_box" :label="showLabels ? '넥사패널 추가' : undefined" aria-label="Add Panel" @click="dashboardLayoutStore.triggerGenericAddPanel" :disable="!dashboardLayoutStore.selectedPaneId" class="text-primary">
              <q-tooltip>선택된 창에 넥사패널 추가 (창을 먼저 선택하세요)</q-tooltip>
            </q-btn>

            <q-btn flat dense icon="view_quilt" :label="showLabels ? '보드창 선택' : undefined" aria-label="Window Presets" class="text-primary" @click="showWindowPresetModal = true">
              <q-tooltip>창 변경</q-tooltip>
            </q-btn>
          </div>

          <!-- 공통 기능 버튼 (항상 표시) -->
          <div ref="headerIconGroupRef" class="row items-center no-wrap header-icon-group">
            <q-btn flat dense :icon="dashboardLayoutStore.mainNavigationOpen ? 'left_panel_close' : 'left_panel_open'" :label="showLabels ? '왼쪽 사이드바' : undefined" aria-label="Toggle Left Sidebar" class="text-primary" @click="dashboardLayoutStore.toggleMainNavigation()">
              <q-tooltip>왼쪽 사이드바 {{ dashboardLayoutStore.mainNavigationOpen ? '닫기' : '열기' }} (Ctrl+B)</q-tooltip>
            </q-btn>
            <q-btn flat dense :icon="userSettings.settings.drawer.rightOpen ? 'right_panel_close' : 'right_panel_open'" :label="showLabels ? '사이드패널' : undefined" aria-label="Side Panel" class="text-primary" @click="togglePropertyPanel">
              <q-tooltip>오른쪽 사이드 패널 {{ userSettings.settings.drawer.rightOpen ? '닫기' : '열기' }} (Ctrl+])</q-tooltip>
            </q-btn>
            <q-btn flat dense :icon="userSettings.settings.theme.isDarkMode ? 'light_mode' : 'dark_mode'" :label="showLabels ? '테마전환' : undefined" aria-label="Toggle Theme" class="text-primary" @click="userSettings.toggleTheme">
              <q-tooltip>{{ userSettings.settings.theme.isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환' }}</q-tooltip>
            </q-btn>

            <q-btn flat dense icon="account_circle" :label="showLabels ? 'MY' : undefined" aria-label="My" class="text-primary" @click="$router.push('/my')">
              <q-tooltip>MY</q-tooltip>
            </q-btn>

            <q-btn flat dense icon="settings" :label="showLabels ? '설정' : undefined" aria-label="Settings" class="text-primary" @click="$router.push('/settings')">
              <q-tooltip>설정</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="dashboardLayoutStore.mainNavigationOpen" show-if-above bordered :width="userSettings.settings.drawer.leftWidth" :style="editModeDrawerStyles" @click.self="handleDrawerEmptySpaceClick" class="drawer-border">
      <!-- 리사이즈 핸들 -->
      <div class="resize-handle-right" @mousedown="startMainNavigationResize" :class="{ resizing: isMainNavigationResizing }">
        <div class="resize-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>

      <!-- 동적 사이드바: 메뉴에 따라 다른 내용 표시 -->
      <!-- 동적 왼쪽 사이드바 컴포넌트 -->
      <component v-if="leftSidebarComponent" :is="leftSidebarComponent" :highlighted-node-id="highlightedNodeId" />
    </q-drawer>

    <q-page-container :class="{ 'parts-management-container': currentMenu === 'parts-management' }" @dblclick="handleMainContentDoubleClick">
      <router-view />
    </q-page-container>

    <!-- 우측 드로어 추가 -->
    <q-drawer
      v-model="userSettings.settings.drawer.rightOpen"
      side="right"
      bordered
      :width="userSettings.settings.drawer.rightWidth"
      :overlay="userSettings.settings.drawer.rightMode === 'overlay'"
      behavior="default"
      :style="rightDrawerStyles"
      :class="{
        'drawer-overlay': userSettings.settings.drawer.rightMode === 'overlay',
        'drawer-push': userSettings.settings.drawer.rightMode === 'push',
        'drawer-border': true,
      }"
    >
      <!-- 리사이즈 핸들 -->
      <div class="resize-handle" @mousedown="startResize" :class="{ resizing: isResizing }">
        <div class="resize-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>

      <!-- 동적 오른쪽 사이드바: 페이지별 패널이 있으면 사용, 없으면 기본 SidePanel -->
      <component v-if="rightSidebarComponent" :is="rightSidebarComponent" />
    </q-drawer>

    <!-- 왼쪽 사이드바 토글 버튼 (항상 표시) -->
    <div
      class="sidebar-toggle-button sidebar-toggle-button--left"
      :class="{ 'is-drawer-open': dashboardLayoutStore.mainNavigationOpen }"
      :style="{
        ...leftButtonStyle,
        '--icon-rotation': leftIconRotation,
        '--hover-rotation': leftHoverRotation,
      }"
      @mousedown="handleLeftToggleMouseDown"
      @touchstart="handleLeftToggleMouseDown"
    >
      <q-icon name="double_arrow" />
      <span class="toggle-label">LEFT NAV</span>
    </div>

    <!-- 오른쪽 사이드바 토글 버튼 (항상 표시) -->
    <div
      class="sidebar-toggle-button sidebar-toggle-button--right"
      :class="{
        'is-drawer-open': userSettings.settings.drawer.rightOpen,
        'is-overlay-mode': userSettings.settings.drawer.rightMode === 'overlay',
      }"
      :style="{
        ...rightButtonStyle,
        '--icon-rotation': rightIconRotation,
        '--hover-rotation': rightHoverRotation,
      }"
      @mousedown="handleRightToggleMouseDown"
      @touchstart="handleRightToggleMouseDown"
    >
      <q-icon name="double_arrow" />
      <span class="toggle-label">RIGHT PANEL</span>
    </div>

    <!-- Footer -->
    <q-footer class="bg-grey-10 text-grey-6">
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
          <div class="text-caption">NEXA Platform v0.0.1</div>
        </div>
      </q-toolbar>
    </q-footer>

    <!-- Add Board Dialog 컴포넌트 추가 -->
    <!-- <add-board-dialog v-model:show="showAddBoardDialog" /> -->

    <!-- Add Device Dialog 컴포넌트 제거 -->
    <!-- <add-device-dialog v-model:show="showAddDeviceDialog" /> -->

    <!-- 보드창 프리셋 선택 모달 -->
    <WindowPresetEditModal v-model="showWindowPresetModal" />
  </q-layout>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { useDashboardLayoutStore } from 'src/stores/dashboardLayoutStore'
import { useBoardMenuStore } from 'src/stores/boardMenuStore'
import { useRouter } from 'vue-router'
import { useBoardEditorStore } from 'src/stores/boardEditorStore'
import { useUserSettingsStore } from 'src/stores/userSettingsStore'
import { usePartsManagementStore } from 'src/stores/partsManagementStore'
import { useClearURLState } from 'src/composables/url-state'
import { useQuasar } from 'quasar'
import WindowPresetEditModal from 'src/board/window/WindowPresetEditModal.vue'
import { getLeftSidebarComponent, getRightSidebarComponent } from 'src/config/sidebarRegistry.js'
import { useGlobalShortcuts, getDefaultShortcuts } from 'src/composables/useGlobalShortcuts'

const $q = useQuasar()
const dashboardLayoutStore = useDashboardLayoutStore()
const boardMenuStore = useBoardMenuStore()
const boardEditorStore = useBoardEditorStore()
const userSettings = useUserSettingsStore()
const partsManagementStore = usePartsManagementStore()
const router = useRouter()

// 전역 단축키 관리
const { registerShortcuts, setupGlobalShortcuts, cleanupGlobalShortcuts } = useGlobalShortcuts()

// 기본 단축키 정의 (handler는 여기서 주입)
const defaultShortcuts = getDefaultShortcuts({
  goToHome: () => {
    router.push('/')
  },
  goToSettings: () => {
    router.push('/settings')
  },
  goToDev: () => {
    router.push('/dev')
  },
  goToSettingsTheme: () => {
    router.push('/settings?tab=theme')
  },
  toggleTheme: () => {
    userSettings.toggleTheme()
  },
  refreshPage: () => {
    window.location.reload()
  },
  hardRefresh: () => {
    // 캐시를 무시하고 페이지 새로고침
    // 방법 1: location.reload(true) - 일부 브라우저에서 작동하지 않을 수 있음
    try {
      window.location.reload(true)
    } catch {
      // 방법 2: 현재 URL에 타임스탬프 추가하여 강제 리로드
      const url = new URL(window.location.href)
      url.searchParams.set('_reload', Date.now().toString())
      window.location.href = url.toString()
    }
  },
  clearConsole: () => {
    // 콘솔 클리어 (개발자 도구가 열려있을 때만 작동)
    // console.clear()는 콘솔을 클리어하지만, 개발자 도구가 열려있어야 효과가 보임
    if (console.clear) {
      console.clear()
      // 추가로 콘솔에 메시지 표시
      console.log('%c콘솔이 클리어되었습니다', 'color: #37ff00; font-size: 14px; font-weight: bold;')
    }
  },
  goBack: () => {
    window.history.back()
  },
  goForward: () => {
    window.history.forward()
  },
  toggleLeftSidebarCtrlLeft: () => {
    dashboardLayoutStore.toggleMainNavigation()
  },
  toggleRightSidebarCtrlRight: () => {
    togglePropertyPanel()
  },
  toggleRightSidebarMode: () => {
    const currentMode = userSettings.settings.drawer.rightMode
    const newMode = currentMode === 'push' ? 'overlay' : 'push'
    userSettings.setRightDrawerMode(newMode)
  },
  openRightSidebarPush: () => {
    const isOpen = userSettings.settings.drawer.rightOpen
    const currentMode = userSettings.settings.drawer.rightMode

    // 이미 열려있고 Push 모드이면 닫기
    if (isOpen && currentMode === 'push') {
      userSettings.setRightDrawerOpen(false)
    } else {
      // Push 모드로 설정하고 열기
      userSettings.setRightDrawerMode('push')
      userSettings.setRightDrawerOpen(true)
    }
  },
  openRightSidebarOverlay: () => {
    const isOpen = userSettings.settings.drawer.rightOpen
    const currentMode = userSettings.settings.drawer.rightMode

    // 이미 열려있고 Overlay 모드이면 닫기
    if (isOpen && currentMode === 'overlay') {
      userSettings.setRightDrawerOpen(false)
    } else {
      // Overlay 모드로 설정하고 열기
      userSettings.setRightDrawerMode('overlay')
      userSettings.setRightDrawerOpen(true)
    }
  },
})

// 반응형: 큰 화면에서만 라벨 표시 (1440px 이상)
const showLabels = computed(() => $q.screen.gt.lg)

// 반응형: 큰 화면에서만 탭 아이콘 표시 (1024px 이상)
const showTabIcons = computed(() => $q.screen.gt.md)

const highlightedNodeId = ref(null)
const showWindowPresetModal = ref(false)
const headerRef = ref(null) // 헤더 ref (실제 높이 측정용)
const headerIconGroupRef = ref(null)
const contextIconGroupRef = ref(null)
const rightIconAreaRef = ref(null) // 오른쪽 아이콘 영역 전체
const mainMenuTabsRef = ref(null)
const isMainMenuOverflowing = ref(false) // 메인 메뉴 탭이 가려지는지 여부
const hiddenTabs = ref([]) // 가려진 탭 목록
const tabSizes = ref([]) // 각 탭의 실제 너비 저장
const currentViewportWidth = ref(0) // 현재 뷰포트 너비
const moreButtonWidth = ref(60) // 더보기 버튼 예상 너비 (기본값)
const rightIconAreaWidth = ref(0) // 오른쪽 아이콘 영역 너비 (고정값)
const isMeasuringTabs = ref(false) // 탭 측정 중 플래그 (무한 루프 방지)

// 부품관리 탭 클릭 핸들러 (같은 라우트에서도 동작하도록)
function handlePartsManagementTabClick() {
  // 부품관리 탭 클릭 시 항상 대시보드로 초기화
  partsManagementStore.setSidebarMode(null)
  partsManagementStore.clearSelectedPartsDataView()

  // 공유 URL 필터 제거 (nextTick으로 State 변경으로 인한 URL 업데이트 이후에 실행)
  clearURLStateInLayout() // 기본 공유 파라미터 제거
}

// 메인 메뉴 탭 정의
const mainMenuTabs = [
  { name: 'home', label: 'HOME', displayLabel: 'HOME', icon: 'home', route: '/', exact: false, nexaPrefix: false },
  { name: 'nexa-board', label: 'NEXA BOARD', displayLabel: 'BOARD', icon: 'dashboard', route: '/nexa-board', exact: false, nexaPrefix: true },
  { name: 'nexa-pannel', label: 'NEXA PANNEL', displayLabel: 'PANNEL', icon: 'widgets', route: '/nexa-pannel', exact: false, nexaPrefix: true },
  { name: 'automation', label: 'NEXA NODE', displayLabel: 'NODE', icon: 'hub', route: '/nexa-node', exact: false, nexaPrefix: true },
  { name: 'nexa-teach', label: 'NEXA TEACH', displayLabel: 'TEACH', icon: 'school', route: '/nexa-teach', exact: false, nexaPrefix: true },
  { name: 'erp', label: 'NEXA ERP', displayLabel: 'ERP', icon: 'business', route: '/erp', exact: false, nexaPrefix: true },
  { name: 'parts-management', label: '부품관리', displayLabel: '부품관리', icon: 'inventory_2', route: '/parts-management', exact: false, onClick: handlePartsManagementTabClick, nexaPrefix: false },
  { name: 'portfolio', label: 'PORTFOLIO', displayLabel: 'PORTFOLIO', icon: 'folder', route: '/portfolio', exact: false, nexaPrefix: false },
  { name: 'system', label: 'SYSTEM', displayLabel: 'SYSTEM', icon: 'settings', route: '/system', exact: false, nexaPrefix: false },
  { name: 'network', label: 'NETWORK', displayLabel: 'NETWORK', icon: 'router', route: '/network', exact: false, nexaPrefix: false },
  { name: 'solutions', label: 'SOLUTIONS', displayLabel: 'SOLUTIONS', icon: 'lightbulb', route: '/solutions', exact: false, nexaPrefix: false },
  { name: 'help', label: 'HELP', displayLabel: 'HELP', icon: 'help_outline', route: '/help', exact: false, nexaPrefix: false },
  { name: 'dev', label: 'DEV', displayLabel: 'DEV', icon: 'code', route: '/dev', exact: false, nexaPrefix: false },
]

// 가려진 탭 이름 집합
const hiddenTabNames = computed(() => {
  if (!isMainMenuOverflowing.value) {
    return new Set()
  }
  return new Set(hiddenTabs.value.map((t) => t.name))
})

// 탭 클릭 핸들러
const handleTabClick = (tab) => {
  if (tab.onClick) {
    tab.onClick()
  }
  router.push(tab.route)
}

// 디바운싱 함수
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

// 메인 메뉴 탭 오버플로우 감지 및 계산 (하이브리드 방식 - 통합 함수)
let mainMenuResizeObserver = null
const checkMainMenuOverflow = debounce(() => {
  // 무한 루프 방지: 이미 측정 중이면 리턴
  if (isMeasuringTabs.value || !mainMenuTabsRef.value) return

  isMeasuringTabs.value = true

  nextTick(() => {
    const tabsContainer = mainMenuTabsRef.value.$el
    if (!tabsContainer) {
      isMeasuringTabs.value = false
      return
    }

    const viewportWidth = window.innerWidth
    currentViewportWidth.value = viewportWidth

    // 측정을 위해 일시적으로 모든 탭을 보여줌 (visibility 사용하여 레이아웃 유지)
    const tabElements = tabsContainer.querySelectorAll('.q-tab')
    const originalVisibilities = Array.from(tabElements).map((el) => {
      const original = el.style.visibility
      // 숨겨진 탭도 레이아웃에 포함되도록 visibility만 조정
      if (el.style.display === 'none') {
        el.style.display = 'flex'
        el.style.visibility = 'hidden'
      } else {
        el.style.visibility = 'visible'
      }
      return original
    })

    // 오른쪽 아이콘 영역도 측정을 위해 보이도록 설정 (아이콘은 항상 표시되므로 visibility만 조정)
    const originalHeaderVisibility = headerIconGroupRef.value?.style.visibility || ''
    const originalContextVisibility = contextIconGroupRef.value?.style.visibility || ''

    if (headerIconGroupRef.value) {
      headerIconGroupRef.value.style.visibility = 'visible'
    }
    if (contextIconGroupRef.value) {
      contextIconGroupRef.value.style.visibility = 'visible'
    }

    // 다음 프레임에서 측정 및 계산 (레이아웃 업데이트 대기)
    requestAnimationFrame(() => {
      // 탭 크기 측정
      tabSizes.value = Array.from(tabElements).map((el, index) => {
        const rect = el.getBoundingClientRect()
        return {
          name: mainMenuTabs[index]?.name || '',
          width: rect.width,
          index,
        }
      })

      // 더보기 버튼 너비 측정 (표시되어 있을 때만)
      const moreButton = document.querySelector('.main-menu-more-button')
      if (moreButton) {
        moreButtonWidth.value = moreButton.getBoundingClientRect().width + 16 // 여유 공간 포함
      } else {
        moreButtonWidth.value = 60 // 기본값
      }

      // 오른쪽 아이콘 영역 너비 측정 (항상 표시되므로 고정값 사용)
      let rightIconWidth = 0
      if (rightIconAreaRef.value) {
        // 아이콘 영역이 항상 표시되므로 실제 크기 측정
        rightIconAreaWidth.value = rightIconAreaRef.value.getBoundingClientRect().width + 20
        rightIconWidth = rightIconAreaWidth.value
      } else {
        // 아이콘 영역이 없을 때: 기본값 사용
        rightIconWidth = 200 // 기본값
      }

      // 표시할 탭 수 계산
      if (tabSizes.value.length > 0) {
        // 더보기 버튼 + 오른쪽 아이콘 영역 + 여유 공간
        const reservedWidth = moreButtonWidth.value + rightIconWidth + 50
        const availableWidth = viewportWidth - reservedWidth

        let totalWidth = 0
        let visibleCount = 0

        // 왼쪽부터 탭을 더해가며 표시 가능한 탭 수 계산
        for (let i = 0; i < tabSizes.value.length; i++) {
          const tabSize = tabSizes.value[i]

          if (totalWidth + tabSize.width <= availableWidth) {
            totalWidth += tabSize.width
            visibleCount++
          } else {
            break
          }
        }

        // 오른쪽부터 가려진 탭 목록 생성 (원래 인덱스 순서 유지)
        const hiddenTabsList = []
        for (let i = visibleCount; i < mainMenuTabs.length; i++) {
          hiddenTabsList.push(mainMenuTabs[i])
        }

        // 상태 업데이트 (한 번에)
        isMainMenuOverflowing.value = hiddenTabsList.length > 0
        hiddenTabs.value = hiddenTabsList
      } else {
        isMainMenuOverflowing.value = false
        hiddenTabs.value = []
      }

      // 원래 상태 복원 (계산 완료 후)
      tabElements.forEach((el, index) => {
        const originalVisibility = originalVisibilities[index]
        if (originalVisibility) {
          el.style.visibility = originalVisibility
        } else {
          el.style.visibility = ''
        }
        // display는 hiddenTabNames에 따라 결정되므로 여기서는 조정하지 않음
      })

      // 오른쪽 아이콘 영역 원래 상태 복원 (아이콘은 항상 표시되므로 visibility만 복원)
      if (headerIconGroupRef.value) {
        if (originalHeaderVisibility) {
          headerIconGroupRef.value.style.visibility = originalHeaderVisibility
        } else {
          headerIconGroupRef.value.style.visibility = ''
        }
      }
      if (contextIconGroupRef.value) {
        if (originalContextVisibility) {
          contextIconGroupRef.value.style.visibility = originalContextVisibility
        } else {
          contextIconGroupRef.value.style.visibility = ''
        }
      }

      // 측정 완료
      isMeasuringTabs.value = false
    })
  })
}, 150)

// 아이콘 오버플로우 감지 함수 제거 (아이콘 메뉴는 항상 표시)
let resizeObserver = null

// 현재 메뉴 감지 (라우트 기반)
const currentMenu = computed({
  get: () => {
    const path = router.currentRoute.value.path
    if (path === '/' || path === '') return 'home'
    if (path.startsWith('/nexa-board') || path.startsWith('/add-device') || path.startsWith('/board-admin')) return 'nexa-board'
    if (path.startsWith('/parts-management')) return 'parts-management'
    if (path.startsWith('/nexa-pannel')) return 'nexa-pannel'
    if (path.startsWith('/nexa-node')) return 'automation'
    if (path.startsWith('/portfolio')) return 'portfolio'
    if (path.startsWith('/erp')) return 'erp'
    if (path.startsWith('/system')) return 'system'
    if (path.startsWith('/network')) return 'network'
    if (path.startsWith('/solutions')) return 'solutions'
    if (path.startsWith('/help')) return 'help'
    if (path.startsWith('/dev')) return 'dev'
    return 'home'
  },
  set: () => {
    // 탭 클릭 시 라우터가 자동으로 처리하므로 여기서는 빈 함수
  },
})

// 동적 왼쪽 사이드바 컴포넌트
const leftSidebarComponent = shallowRef(null)

// 동적 오른쪽 사이드바 컴포넌트
const rightSidebarComponent = shallowRef(null)

// currentMenu 변경 시 왼쪽 사이드바 컴포넌트 로드
watch(
  currentMenu,
  async (newMenu) => {
    const leftComponent = await getLeftSidebarComponent(newMenu)
    leftSidebarComponent.value = leftComponent

    // 오른쪽 사이드바도 로드 (페이지별 패널이 있으면 사용, 없으면 기본 SidePanel)
    const rightComponent = await getRightSidebarComponent(newMenu)
    rightSidebarComponent.value = rightComponent
  },
  { immediate: true },
)

// NEXA BOARD 메뉴인지 확인
const isNexaBoardMenu = computed(() => currentMenu.value === 'nexa-board')

// URL 상태 제거 (useClearURLState 사용)
const { clearURLState: clearURLStateInLayout } = useClearURLState({
  useNextTick: true, // State 변경으로 인한 URL 업데이트 이후에 실행
})

// 부품관리 메뉴로 변경될 때 store 초기화 (다른 메뉴에서 부품관리로 올 때)
watch(
  () => currentMenu.value,
  (newMenu, oldMenu) => {
    if (newMenu === 'parts-management' && oldMenu !== 'parts-management') {
      // 다른 메뉴에서 부품관리로 진입 시 대시보드로 초기화
      partsManagementStore.setSidebarMode(null)
      partsManagementStore.clearSelectedPartsDataView()
    }
  },
)

const currentViewMode = computed(() => dashboardLayoutStore.currentViewMode)
const isEditMode = computed(() => currentViewMode.value === 'boardManagement')
const editModeDrawerStyles = computed(() => {
  if (isEditMode.value) {
    return {
      'border-right-width': '0',
      'border-right-style': 'none',
      'border-right-color': 'transparent',
      'box-shadow': '0 0 15px rgba(33, 150, 243, 0.08)',
    }
  }
  return {
    'border-right-width': '0',
    'border-right-style': 'none',
    'border-right-color': 'transparent',
  }
})
// rootBoardNodes와 hasBoards는 이제 NexaBoardSidebar에서 관리

watch(
  () => boardEditorStore.nodeToExpandAndHighlight,
  async (nodeInfo) => {
    if (nodeInfo && nodeInfo.nodeId) {
      await nextTick()

      if (nodeInfo.parentId) {
        try {
          const parentNode = boardMenuStore.getNodeById(nodeInfo.parentId)
          if (parentNode && !parentNode.expanded) {
            await boardMenuStore.updateNode(nodeInfo.parentId, { expanded: true })
            await nextTick()
          }
        } catch (error) {
          console.error(`[MainLayout] Error expanding parent node ${nodeInfo.parentId}:`, error)
        }
      }

      highlightedNodeId.value = nodeInfo.nodeId

      boardEditorStore.clearNodeToExpandAndHighlight()
      setTimeout(() => {
        if (highlightedNodeId.value === nodeInfo.nodeId) {
          highlightedNodeId.value = null
        }
      }, 5000)
    }
  },
  { deep: true },
)

function handleDrawerEmptySpaceClick(event) {
  const clickedItem = event.target.closest('.q-item')
  const clickedButton = event.target.closest('.q-btn')

  if (!clickedItem && !clickedButton && isEditMode.value) {
    boardEditorStore.setDrawerEmptySpaceSelectionForAdmin()
    if (router.currentRoute.value.path !== '/board-admin') {
      router.push('/board-admin')
    }
  }
}

// 도구 패널 토글 함수
const togglePropertyPanel = () => {
  userSettings.setRightDrawerOpen(!userSettings.settings.drawer.rightOpen)
}

// 리사이즈 관련 상태
const isMainNavigationResizing = ref(false)
const startMainNavigationX = ref(0)
const startMainNavigationWidth = ref(0)

// 메인 네비게이션 리사이즈 시작
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

// 메인 네비게이션 리사이즈 처리
const handleMainNavigationResize = (event) => {
  if (!isMainNavigationResizing.value) return

  const currentX = event.type === 'mousemove' ? event.clientX : event.touches[0].clientX
  const diff = currentX - startMainNavigationX.value

  // 화면 크기에 따라 최대 너비 동적 계산 (화면의 60% 또는 600px 중 작은 값)
  const maxWidth = Math.min(600, Math.floor(window.innerWidth * 0.6))
  const newWidth = Math.max(0, Math.min(startMainNavigationWidth.value + diff, maxWidth))

  // 일정 폭 이하(50px)로 줄어들면 자동으로 닫기
  if (newWidth <= 50) {
    userSettings.settings.drawer.leftWidth = 0
    if (dashboardLayoutStore.mainNavigationOpen) {
      dashboardLayoutStore.toggleMainNavigation()
    }
  } else {
    // 리사이즈 중에는 저장하지 않고 값만 업데이트
    userSettings.settings.drawer.leftWidth = newWidth
  }
}

// 메인 네비게이션 리사이즈 종료
const stopMainNavigationResize = () => {
  if (!isMainNavigationResizing.value) return

  isMainNavigationResizing.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  document.body.style.webkitUserSelect = ''
  document.body.style.mozUserSelect = ''
  document.body.style.msUserSelect = ''

  // 리사이즈 종료 시에만 저장
  userSettings.saveSettings()

  document.removeEventListener('mousemove', handleMainNavigationResize)
  document.removeEventListener('touchmove', handleMainNavigationResize)
  document.removeEventListener('mouseup', stopMainNavigationResize)
  document.removeEventListener('touchend', stopMainNavigationResize)
}

// 오른쪽 도구 패널 리사이즈 관련 상태
const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)

// 오른쪽 도구 패널 리사이즈 시작
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

// 오른쪽 도구 패널 리사이즈 처리
const handleResize = (event) => {
  if (!isResizing.value) return

  const currentX = event.type === 'mousemove' ? event.clientX : event.touches[0].clientX
  const diff = startX.value - currentX

  // 화면 크기에 따라 최대 너비 동적 계산 (화면의 60% 또는 800px 중 작은 값)
  const maxWidth = Math.min(800, Math.floor(window.innerWidth * 0.6))
  const newWidth = Math.max(0, Math.min(startWidth.value + diff, maxWidth))

  // 일정 폭 이하(50px)로 줄어들면 자동으로 닫기
  if (newWidth <= 50) {
    userSettings.settings.drawer.rightWidth = 0
    if (userSettings.settings.drawer.rightOpen) {
      togglePropertyPanel()
    }
  } else {
    // 리사이즈 중에는 저장하지 않고 값만 업데이트
    userSettings.settings.drawer.rightWidth = newWidth
  }
}

// 오른쪽 도구 패널 리사이즈 종료
const stopResize = () => {
  if (!isResizing.value) return

  isResizing.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  document.body.style.webkitUserSelect = ''
  document.body.style.mozUserSelect = ''
  document.body.style.msUserSelect = ''

  // 리사이즈 종료 시에만 저장
  userSettings.saveSettings()

  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('touchmove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('touchend', stopResize)
}

// ============================================
// 토글 버튼 드래그 기능
// ============================================

// 왼쪽 토글 버튼 드래그 상태
const leftToggleDragState = {
  isDragging: false,
  startX: 0,
  startY: 0,
  startWidth: 0,
  hasMoved: false,
  wasClosed: false, // mousedown 시점의 상태 저장
}

// 왼쪽 토글 버튼 mousedown
function handleLeftToggleMouseDown(event) {
  event.preventDefault()
  event.stopPropagation()

  leftToggleDragState.isDragging = false
  leftToggleDragState.startX = event.type === 'mousedown' ? event.clientX : event.touches[0].clientX
  leftToggleDragState.startY = event.type === 'mousedown' ? event.clientY : event.touches[0].clientY
  leftToggleDragState.startWidth = userSettings.settings.drawer.leftWidth
  leftToggleDragState.hasMoved = false
  leftToggleDragState.wasClosed = !dashboardLayoutStore.mainNavigationOpen // 상태 저장

  // 닫힌 상태에서는 mousedown에서 열지 않음 (mouseup 또는 mousemove에서 처리)
  if (!leftToggleDragState.wasClosed) {
    startMainNavigationWidth.value = leftToggleDragState.startWidth
  }

  document.addEventListener('mousemove', handleLeftToggleMouseMove)
  document.addEventListener('mouseup', handleLeftToggleMouseUp)
  document.addEventListener('touchmove', handleLeftToggleMouseMove, { passive: true })
  document.addEventListener('touchend', handleLeftToggleMouseUp, { passive: true })
}

// 왼쪽 토글 버튼 mousemove
function handleLeftToggleMouseMove(event) {
  const currentX = event.type === 'mousemove' ? event.clientX : event.touches[0].clientX
  const currentY = event.type === 'mousemove' ? event.clientY : event.touches[0].clientY
  const deltaX = Math.abs(currentX - leftToggleDragState.startX)
  const deltaY = Math.abs(currentY - leftToggleDragState.startY)

  // 일정 거리 이상 이동하면 드래그로 간주 (5px)
  if (deltaX > 5 || deltaY > 5) {
    leftToggleDragState.hasMoved = true
    leftToggleDragState.isDragging = true

    // 닫힌 상태에서 드래그 시작 시 열기 (마우스 위치에 맞춰 열기)
    if (leftToggleDragState.wasClosed && !dashboardLayoutStore.mainNavigationOpen) {
      // 마우스의 현재 X 좌표를 직접 너비로 사용 (마우스 커서와 핸들 동기화, 최소 폭 제한 없음)
      const maxWidth = Math.min(600, Math.floor(window.innerWidth * 0.6))
      const initialWidth = Math.max(0, Math.min(currentX, maxWidth))
      userSettings.settings.drawer.leftWidth = initialWidth
      dashboardLayoutStore.toggleMainNavigation()
      leftToggleDragState.startWidth = initialWidth
      startMainNavigationWidth.value = initialWidth
      // 드래그가 감지된 시점의 마우스 위치를 시작점으로 설정
      startMainNavigationX.value = currentX
    }

    // 기존 리사이즈 로직 사용
    if (!isMainNavigationResizing.value) {
      isMainNavigationResizing.value = true
      // 닫힌 상태에서 열었으면 이미 위에서 설정했으므로, 열린 상태에서만 mousedown 시점 사용
      if (!leftToggleDragState.wasClosed || dashboardLayoutStore.mainNavigationOpen) {
        startMainNavigationX.value = leftToggleDragState.startX
      }

      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
      document.body.style.webkitUserSelect = 'none'
      document.body.style.mozUserSelect = 'none'
      document.body.style.msUserSelect = 'none'
    }

    // 리사이즈 처리 (최소 폭 제한 없음, 일정 폭 이하면 자동으로 닫기)
    const diff = currentX - startMainNavigationX.value
    const maxWidth = Math.min(600, Math.floor(window.innerWidth * 0.6))
    const newWidth = Math.max(0, Math.min(startMainNavigationWidth.value + diff, maxWidth))

    // 일정 폭 이하(50px)로 줄어들면 자동으로 닫기
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

// 왼쪽 토글 버튼 mouseup
// eslint-disable-next-line no-unused-vars
function handleLeftToggleMouseUp(event) {
  const wasDragging = leftToggleDragState.isDragging

  document.removeEventListener('mousemove', handleLeftToggleMouseMove)
  document.removeEventListener('mouseup', handleLeftToggleMouseUp)
  document.removeEventListener('touchmove', handleLeftToggleMouseMove)
  document.removeEventListener('touchend', handleLeftToggleMouseUp)

  if (wasDragging) {
    // 드래그였으면 리사이즈 종료
    stopMainNavigationResize()
  } else if (!leftToggleDragState.hasMoved) {
    // 이동이 없었으면 클릭으로 간주
    if (leftToggleDragState.wasClosed) {
      // 닫힌 상태에서 클릭만 했으면 이전 크기로 열기 (저장된 값 사용)
      // 너비가 0이거나 50px 이하면 기본값(250px) 사용
      const savedWidth = leftToggleDragState.startWidth
      const restoreWidth = savedWidth > 50 ? savedWidth : 250
      userSettings.settings.drawer.leftWidth = restoreWidth
      dashboardLayoutStore.toggleMainNavigation()
      userSettings.saveSettings()
    } else {
      // 열린 상태에서 클릭만 했으면 토글 (닫기)
      dashboardLayoutStore.toggleMainNavigation()
    }
  }

  // 상태 초기화
  leftToggleDragState.isDragging = false
  leftToggleDragState.hasMoved = false
}

// 오른쪽 토글 버튼 드래그 상태
const rightToggleDragState = {
  isDragging: false,
  startX: 0,
  startY: 0,
  startWidth: 0,
  hasMoved: false,
  wasClosed: false, // mousedown 시점의 상태 저장
}

// 오른쪽 토글 버튼 mousedown
function handleRightToggleMouseDown(event) {
  event.preventDefault()
  event.stopPropagation()

  rightToggleDragState.isDragging = false
  rightToggleDragState.startX = event.type === 'mousedown' ? event.clientX : event.touches[0].clientX
  rightToggleDragState.startY = event.type === 'mousedown' ? event.clientY : event.touches[0].clientY
  rightToggleDragState.startWidth = userSettings.settings.drawer.rightWidth
  rightToggleDragState.hasMoved = false
  rightToggleDragState.wasClosed = !userSettings.settings.drawer.rightOpen // 상태 저장

  // 닫힌 상태에서는 mousedown에서 열지 않음 (mouseup 또는 mousemove에서 처리)
  if (!rightToggleDragState.wasClosed) {
    startWidth.value = rightToggleDragState.startWidth
  }

  document.addEventListener('mousemove', handleRightToggleMouseMove)
  document.addEventListener('mouseup', handleRightToggleMouseUp)
  document.addEventListener('touchmove', handleRightToggleMouseMove, { passive: true })
  document.addEventListener('touchend', handleRightToggleMouseUp, { passive: true })
}

// 오른쪽 토글 버튼 mousemove
function handleRightToggleMouseMove(event) {
  const currentX = event.type === 'mousemove' ? event.clientX : event.touches[0].clientX
  const currentY = event.type === 'mousemove' ? event.clientY : event.touches[0].clientY
  const deltaX = Math.abs(currentX - rightToggleDragState.startX)
  const deltaY = Math.abs(currentY - rightToggleDragState.startY)

  // 일정 거리 이상 이동하면 드래그로 간주 (5px)
  if (deltaX > 5 || deltaY > 5) {
    rightToggleDragState.hasMoved = true
    rightToggleDragState.isDragging = true

    // 닫힌 상태에서 드래그 시작 시 열기 (마우스 위치에 맞춰 열기)
    if (rightToggleDragState.wasClosed && !userSettings.settings.drawer.rightOpen) {
      // 오른쪽 사이드바는 화면 오른쪽에서 왼쪽으로 열리므로, 화면 너비에서 마우스 X 좌표를 뺀 값이 너비 (최소 폭 제한 없음)
      const maxWidth = Math.min(800, Math.floor(window.innerWidth * 0.6))
      const initialWidth = Math.max(0, Math.min(window.innerWidth - currentX, maxWidth))
      userSettings.settings.drawer.rightWidth = initialWidth
      togglePropertyPanel()
      rightToggleDragState.startWidth = initialWidth
      startWidth.value = initialWidth
      // 드래그가 감지된 시점의 마우스 위치를 시작점으로 설정
      startX.value = currentX
    }

    // 기존 리사이즈 로직 사용
    if (!isResizing.value) {
      isResizing.value = true
      // 닫힌 상태에서 열었으면 이미 위에서 설정했으므로, 열린 상태에서만 mousedown 시점 사용
      if (!rightToggleDragState.wasClosed || userSettings.settings.drawer.rightOpen) {
        startX.value = rightToggleDragState.startX
      }

      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
      document.body.style.webkitUserSelect = 'none'
      document.body.style.mozUserSelect = 'none'
      document.body.style.msUserSelect = 'none'
    }

    // 리사이즈 처리 (오른쪽은 반대 방향, 최소 폭 제한 없음, 일정 폭 이하면 자동으로 닫기)
    const diff = startX.value - currentX
    const maxWidth = Math.min(800, Math.floor(window.innerWidth * 0.6))
    const newWidth = Math.max(0, Math.min(startWidth.value + diff, maxWidth))

    // 일정 폭 이하(50px)로 줄어들면 자동으로 닫기
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

// 오른쪽 토글 버튼 mouseup
// eslint-disable-next-line no-unused-vars
function handleRightToggleMouseUp(event) {
  const wasDragging = rightToggleDragState.isDragging

  document.removeEventListener('mousemove', handleRightToggleMouseMove)
  document.removeEventListener('mouseup', handleRightToggleMouseUp)
  document.removeEventListener('touchmove', handleRightToggleMouseMove)
  document.removeEventListener('touchend', handleRightToggleMouseUp)

  if (wasDragging) {
    // 드래그였으면 리사이즈 종료
    stopResize()
  } else if (!rightToggleDragState.hasMoved) {
    // 이동이 없었으면 클릭으로 간주
    if (rightToggleDragState.wasClosed) {
      // 닫힌 상태에서 클릭만 했으면 이전 크기로 열기 (저장된 값 사용)
      // 너비가 0이거나 50px 이하면 기본값(300px) 사용
      const savedWidth = rightToggleDragState.startWidth
      const restoreWidth = savedWidth > 50 ? savedWidth : 300
      userSettings.settings.drawer.rightWidth = restoreWidth
      togglePropertyPanel()
      userSettings.saveSettings()
    } else {
      // 열린 상태에서 클릭만 했으면 토글 (닫기)
      togglePropertyPanel()
    }
  }

  // 상태 초기화
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

const rightDrawerStyles = computed(() => {
  // 우측 사이드바 오버레이 모드일 때 그림자와 overflow 적용 (Vue 동적 스타일이 CSS보다 우선순위 높음)
  if (userSettings.settings.drawer.rightMode === 'overlay') {
    // 테마 변수를 직접 사용 (인라인 스타일에서 CSS 변수 사용 가능)
    // 테마 변경 시 자동으로 업데이트됨
    void userSettings.settings.theme.isDarkMode // 테마 변경 감지를 위한 의존성

    return {
      overflow: 'visible',
      'box-shadow': '-9px 0 8px var(--nexa-shadow-1), -10px 0 16px var(--nexa-shadow-2), -19px 0 24px var(--nexa-shadow-3)',
    }
  }

  // 푸시 모드일 때는 CSS에서 보더가 적용되므로 스타일 반환 불필요
  return {}
})

// 버튼의 현재 Y 위치 추적 (버튼 중앙 기준)
const buttonY = ref(0)
const BUTTON_HEIGHT = 120 // 버튼 높이

// 마우스 위치 추적
const mouseY = ref(0)

// 대기 시간 설정 (밀리초 단위, 쉽게 조정 가능)
const getAutoMoveDelay = () => 300

// 타이머 ref
let autoMoveTimer = null

// 메인 메뉴 영역 높이 계산 (헤더 전체의 실제 높이를 직접 측정)
const menuAreaHeight = computed(() => {
  // q-header 요소의 실제 높이를 직접 측정 (가장 정확함)
  if (headerRef.value && headerRef.value.$el) {
    const headerElement = headerRef.value.$el
    const actualHeight = headerElement.offsetHeight || 0
    if (actualHeight > 0) {
      return actualHeight
    }
  }

  // fallback: 메뉴 탭 높이만 계산 (헤더가 아직 마운트되지 않은 경우)
  let menuTabsHeight = 0
  if (mainMenuTabsRef.value) {
    const tabsElement = mainMenuTabsRef.value.$el
    if (tabsElement) {
      menuTabsHeight = tabsElement.offsetHeight || 0
    }
  }

  // CSS 변수는 참고용으로만 사용 (실제 높이와 다를 수 있음)
  const fallbackHeaderHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 42
  return fallbackHeaderHeight + menuTabsHeight
})

// 메뉴 영역 높이 변경 감지 (리사이즈, 메뉴 추가/제거 등)
const menuAreaHeightRef = ref(menuAreaHeight.value)
watch(
  menuAreaHeight,
  (newHeight) => {
    menuAreaHeightRef.value = newHeight
    // 버튼 위치가 메뉴 영역 아래에 있는지 확인하고 필요시 조정
    const buttonHalfHeight = BUTTON_HEIGHT / 2
    const minY = newHeight + buttonHalfHeight
    if (buttonY.value < minY) {
      buttonY.value = minY
    }
  },
  { immediate: true },
)

// 버튼 위치를 마우스 위치로 업데이트하는 함수
const updateButtonPosition = () => {
  const buttonHalfHeight = BUTTON_HEIGHT / 2
  const buttonTop = buttonY.value - buttonHalfHeight // 버튼 상단
  const buttonBottom = buttonY.value + buttonHalfHeight // 버튼 하단
  const currentMouseY = mouseY.value

  // 마우스가 버튼의 상단이나 하단을 벗어났을 때만 버튼 위치 업데이트
  if (currentMouseY < buttonTop || currentMouseY > buttonBottom) {
    // 메뉴 영역 아래에 버튼이 위치하도록 minY 계산
    const minY = menuAreaHeight.value + buttonHalfHeight
    const maxY = window.innerHeight - buttonHalfHeight // 버튼이 화면 하단을 벗어나지 않도록

    // 마우스 Y좌표를 화면 경계 내로 제한하여 버튼 위치 업데이트
    buttonY.value = Math.max(minY, Math.min(maxY, currentMouseY))
  }
}

// 마우스 이동 이벤트 핸들러 (대기 시간 후 자동 이동)
const handleMouseMove = (event) => {
  // 마우스 위치 업데이트
  mouseY.value = event.clientY

  // 기존 타이머가 있으면 취소
  if (autoMoveTimer) {
    clearTimeout(autoMoveTimer)
    autoMoveTimer = null
  }

  // 대기 시간 후 버튼 위치 업데이트
  autoMoveTimer = setTimeout(() => {
    updateButtonPosition()
    autoMoveTimer = null
  }, getAutoMoveDelay())
}

// 왼쪽 버튼 스타일 (drawer 열림 상태에 따라 위치 조정, 버튼 Y좌표 추적)
const leftButtonStyle = computed(() => {
  const baseStyle = {
    top: `${buttonY.value - BUTTON_HEIGHT / 2}px`,
    transform: 'translateY(0)',
  }

  if (dashboardLayoutStore.mainNavigationOpen) {
    return {
      ...baseStyle,
      left: `${userSettings.settings.drawer.leftWidth}px`,
    }
  }
  return {
    ...baseStyle,
    left: '0',
  }
})

// 오른쪽 버튼 스타일 (drawer 열림 상태 및 모드에 따라 위치 조정, 버튼 Y좌표 추적)
const rightButtonStyle = computed(() => {
  const baseStyle = {
    top: `${buttonY.value - BUTTON_HEIGHT / 2}px`,
    transform: 'translateY(0)',
  }

  const isOpen = userSettings.settings.drawer.rightOpen
  const drawerWidth = userSettings.settings.drawer.rightWidth

  // Drawer가 열려있으면 drawer의 왼쪽 가장자리 (리사이즈 핸들 위치)
  if (isOpen) {
    // 화면 너비에서 drawer 너비를 뺀 위치 = drawer의 왼쪽 가장자리
    return {
      ...baseStyle,
      right: `${drawerWidth}px`,
    }
  }

  // Drawer가 닫혀있으면 화면 가장 우측
  return {
    ...baseStyle,
    right: '0',
  }
})

// 왼쪽 아이콘 회전 각도 (열려있으면 >> 오른쪽 방향 0deg, 닫혀있으면 << 왼쪽 방향 180deg)
const leftIconRotation = computed(() => {
  return dashboardLayoutStore.mainNavigationOpen ? '0deg' : '180deg'
})

// 왼쪽 호버 시 회전 각도 (반대로 회전하여 강조)
const leftHoverRotation = computed(() => {
  return dashboardLayoutStore.mainNavigationOpen ? '180deg' : '0deg'
})

// 오른쪽 아이콘 회전 각도 (열려있으면 << 180deg, 닫혀있으면 >> 0deg)
const rightIconRotation = computed(() => {
  return userSettings.settings.drawer.rightOpen ? '180deg' : '0deg'
})

// 오른쪽 호버 시 회전 각도 (반대로 회전하여 강조)
const rightHoverRotation = computed(() => {
  return userSettings.settings.drawer.rightOpen ? '0deg' : '180deg'
})

onMounted(() => {
  // 테마 초기화
  userSettings.initializeTheme()

  // 초기 버튼 Y좌표 설정 (화면 중앙, 경계 체크 포함)
  // nextTick을 사용하여 메뉴 영역 높이가 계산된 후 설정
  nextTick(() => {
    const buttonHalfHeight = BUTTON_HEIGHT / 2
    const initialY = window.innerHeight / 2
    // 메뉴 영역 아래에 버튼이 위치하도록 minY 계산
    const minY = menuAreaHeight.value + buttonHalfHeight
    const maxY = window.innerHeight - buttonHalfHeight
    const initialButtonY = Math.max(minY, Math.min(maxY, initialY))
    buttonY.value = initialButtonY

    // 초기 마우스 위치를 버튼 위치와 동기화
    mouseY.value = initialButtonY
  })

  // 마우스 이동 이벤트 리스너 등록
  window.addEventListener('mousemove', handleMouseMove)

  // 초기 로드 시 화면 크기에 따라 사이드바 최대 크기 제한 적용
  const adjustDrawerWidths = () => {
    // 왼쪽 사이드바: 화면의 60% 또는 600px 중 작은 값
    const leftMaxWidth = Math.min(600, Math.floor(window.innerWidth * 0.6))
    if (userSettings.settings.drawer.leftWidth > leftMaxWidth) {
      userSettings.settings.drawer.leftWidth = leftMaxWidth
      userSettings.saveSettings()
    }

    // 오른쪽 사이드바: 화면의 60% 또는 800px 중 작은 값
    const rightMaxWidth = Math.min(800, Math.floor(window.innerWidth * 0.6))
    if (userSettings.settings.drawer.rightWidth > rightMaxWidth) {
      userSettings.settings.drawer.rightWidth = rightMaxWidth
      userSettings.saveSettings()
    }
  }

  // 초기 조정
  adjustDrawerWidths()

  // 화면 크기 변경 시에도 조정 (cleanup을 위해 저장)
  window._adjustDrawerWidths = adjustDrawerWidths
  window.addEventListener('resize', adjustDrawerWidths)

  // 전역 단축키 설정
  setupGlobalShortcuts()

  // 기본 단축키 일괄 등록 (배열 형식)
  registerShortcuts(defaultShortcuts)

  const mainNavigationHandle = document.querySelector('.resize-handle-right')
  if (mainNavigationHandle) {
    mainNavigationHandle.addEventListener('touchstart', startMainNavigationResize, {
      passive: true,
    })
  }

  const handle = document.querySelector('.resize-handle')
  if (handle) {
    handle.addEventListener('touchstart', startResize, { passive: true })
  }

  // 초기 오버플로우 감지 (아이콘은 항상 표시되므로 메인 메뉴만 확인)
  nextTick(() => {
    checkMainMenuOverflow()
  })

  // ResizeObserver로 창 크기 변경 감지
  resizeObserver = new ResizeObserver(() => {
    checkMainMenuOverflow()
  })

  // window resize 이벤트도 감지
  const handleResize = () => {
    checkMainMenuOverflow()
  }
  window.addEventListener('resize', handleResize)

  // 헤더 아이콘 그룹 관찰 제거 (아이콘은 항상 표시되므로 관찰 불필요)

  // 메인 메뉴 탭 관찰 시작
  nextTick(() => {
    if (mainMenuTabsRef.value && mainMenuTabsRef.value.$el) {
      mainMenuResizeObserver = new ResizeObserver(() => {
        checkMainMenuOverflow()
      })
      mainMenuResizeObserver.observe(mainMenuTabsRef.value.$el)
    }
  })

  // showLabels 변경 시에도 확인
  watch(showLabels, () => {
    nextTick(() => {
      checkMainMenuOverflow()
    })
  })

  // showTabIcons 변경 시에도 확인
  watch(showTabIcons, () => {
    nextTick(() => {
      checkMainMenuOverflow()
    })
  })

  // currentMenu 변경 시에도 확인
  watch(currentMenu, () => {
    nextTick(() => {
      checkMainMenuOverflow()
    })
  })

  // isNexaBoardMenu 변경 시에도 확인 (컨텍스트 메뉴 표시/숨김)
  watch(isNexaBoardMenu, () => {
    nextTick(() => {
      checkMainMenuOverflow()
    })
  })

  // cleanup을 위해 handleResize 저장
  window._handleResize = handleResize
})

onBeforeUnmount(() => {
  // 전역 단축키 정리
  cleanupGlobalShortcuts()

  // 마우스 이동 이벤트 리스너 제거
  window.removeEventListener('mousemove', handleMouseMove)

  // 타이머 정리
  if (autoMoveTimer) {
    clearTimeout(autoMoveTimer)
    autoMoveTimer = null
  }

  const mainNavigationHandle = document.querySelector('.resize-handle-right')
  if (mainNavigationHandle) {
    mainNavigationHandle.removeEventListener('touchstart', startMainNavigationResize)
  }

  const handle = document.querySelector('.resize-handle')
  if (handle) {
    handle.removeEventListener('touchstart', startResize)
  }

  // ResizeObserver 정리
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if (mainMenuResizeObserver) {
    mainMenuResizeObserver.disconnect()
  }
  if (window._handleResize) {
    window.removeEventListener('resize', window._handleResize)
    delete window._handleResize
  }

  // 사이드바 크기 조정 리스너 제거
  if (window._adjustDrawerWidths) {
    window.removeEventListener('resize', window._adjustDrawerWidths)
    delete window._adjustDrawerWidths
  }
})
</script>

<style lang="scss">
/* 전역 변수 */
:root {
  /* 레이아웃 높이 */
  --header-height: 42px;
  --footer-height: 48px;

  /* 리사이즈 핸들 */
  --resize-handle-border-width: 2px;
  --resize-handle-width: 3px;
  --resize-handle-right-position: 0; /* 왼쪽 드로어의 오른쪽 핸들 위치 (right 값) */
  --resize-handle-left-position: 0; /* 오른쪽 드로어의 왼쪽 핸들 위치 (left 값) */
  --resize-handle-border-right-position: 0; /* 왼쪽 드로어의 border 위치 (right 값) */
  --resize-handle-border-left-position: 0; /* 오른쪽 드로어의 border 위치 (left 값) */
  --resize-handle-dot-size: 4px;
  --resize-handle-dot-gap: 5px;
  --resize-handle-dot-opacity-default: 0.3;
  --resize-handle-dot-opacity-hover: 0.7;
  --resize-handle-dot-opacity-resizing: 0.9;
  --resize-handle-dot-scale: 1.2;
  --resize-handle-z-index: 1001;

  /* z-index */
  --z-index-header: 2000;
  --z-index-footer: 2000;

  /* 공통 스타일 */
  --border-radius: 4px;
  --transition-duration: 0.2s;

  /* 푸터 border */
  --footer-border-width: 1px;
}

/* 레이아웃 */
.q-layout {
  height: 100vh;
  overflow: hidden;
}

/* 헤더 */
.q-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-index-header);
  background: var(--nexa-header-bg);
}

.q-header .q-toolbar {
  min-height: 40px;
  height: var(--header-height);
  margin-bottom: 0;
  padding-bottom: 0;
}

/* NEXA svg logo 크기 조절*/
.nexa-logo {
  display: block;
  object-fit: contain;
  object-position: left center;
  transform: scaleX(3.5);
  transform-origin: left center;
  transition: filter var(--transition-duration) ease;
  filter: brightness(1);
}

/* NEXA 로고 */
.nexa-logo-btn {
  cursor: pointer;
  transition: all var(--transition-duration) ease;
  padding: 0;
  margin: 0;
  background: transparent !important;
}

// 호버 시 SVG 밝기만 두 배로 변경
.nexa-logo-btn:hover .nexa-logo {
  filter: brightness(3);
}

/* 메인 메뉴 탭 */
.main-menu-tabs.q-tabs {
  min-height: auto;
  height: auto;
}

.main-menu-tabs .q-tabs__content {
  gap: 0;
  flex-wrap: nowrap;
}

.main-menu-tabs .q-tabs__container {
  height: auto;
  flex-wrap: nowrap;
}
/* 메뉴 탭 스타일 */
.main-menu-tabs .q-tab {
  padding-left: clamp(2px, 0.6vw, 12px); //동적으로 조절
  padding-right: clamp(2px, 0.6vw, 12px); //동적으로 조절
  padding-top: 7px !important;
  padding-bottom: 7px !important;
  margin: 1px;
  white-space: nowrap;
  flex-wrap: nowrap;
  flex-shrink: 0;
  min-height: auto !important;
  height: auto !important;
  align-items: center !important;

  border-radius: var(--border-radius);
  background-color: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
  color: var(--nexa-text-primary);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: clamp(0px, 0.15vw, 0.3px);
  text-align: center;
  box-shadow: 0 0 1px 1px var(--nexa-shadow-3);
  transition: all var(--transition-duration) ease;

  &:focus {
    background-color: var(--nexa-surface-focus);
    color: var(--nexa-text-primary-focus);
  }

  // 활성 탭 스타일 (클릭된 메뉴)
  &.q-tab--active {
    font-weight: 700;
    color: var(--nexa-text-primary-focus);
    opacity: 1;
    animation: blinkBackground 3s ease-in-out infinite; // 3초마다 배경색 변경
  }

  &.q-tab--active .q-tab__label {
    font-weight: 700;
    color: var(--nexa-text-primary-focus);
    opacity: 1;
  }

  &.q-tab--active .q-tab__icon {
    opacity: 1;
    color: var(--nexa-text-primary-focus);
  }
}

// 깜박거리는 애니메이션 (배경만) - duration으로 속도 조절
@keyframes blinkBackground {
  0%,
  100% {
    background-color: var(--nexa-surface);
  }
  50% {
    background-color: var(--nexa-background-darker);
  }
}

.main-menu-tabs .q-tab:first-child {
  margin-left: 0;
}

.main-menu-tabs .q-tab:last-child {
  margin-right: 0;
}

.main-menu-tabs .q-tab__content {
  padding: 0;
  margin: 0;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  flex-wrap: nowrap;
  height: auto;
  min-height: auto;
}

/* NEXA 접두어 배지 스타일 */
.nexa-tab-content {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  line-height: 1;
  min-height: auto;
  gap: 0;
}

.nexa-prefix {
  font-size: 7px;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  opacity: 1;
  align-self: flex-start;
  padding-top: 1px;
  margin-right: 1px;
}

.nexa-tab-label {
  line-height: 1;
  white-space: nowrap;
  font-size: 14px;
  align-self: flex-start;
}

/* 로고 메뉴 및 더보기 메뉴용 NEXA 접두어 스타일 */
.nexa-menu-content {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  line-height: 1;
  gap: 0;
}

.nexa-menu-content .nexa-prefix {
  margin-right: 1px;
}

.nexa-menu-label {
  line-height: 1;
  white-space: nowrap;
}

// 아이콘이 왼쪽에 오도록 보장
.main-menu-tabs .q-tab__icon {
  flex-shrink: 0;
  line-height: 1;
  vertical-align: middle;
  font-size: 18px;
  width: 18px;
  height: 18px;
}

.main-menu-tabs .q-tab__label {
  order: 1;
  white-space: nowrap;
  flex-shrink: 0;
}

/* NEXA 접두어가 있는 탭의 레이아웃 조정 */
.main-menu-tabs .q-tab.has-nexa-prefix .q-tab__content {
  gap: 4px;
}

/* 아이콘 메뉴 라벨 줄바꿈 방지 */
.header-icon-group {
  flex-wrap: nowrap;
}

.header-icon-group .q-btn {
  white-space: nowrap;
  flex-shrink: 0;
}

.header-icon-group .q-btn__content {
  white-space: nowrap;
  flex-wrap: nowrap;
}

.header-icon-group .q-btn__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 더보기 버튼 라벨 줄바꿈 방지 */
.main-menu-more-button {
  flex-wrap: nowrap;
}

.main-menu-more-button .q-btn {
  white-space: nowrap;
  flex-shrink: 0;
}

.main-menu-more-button .q-btn__content {
  white-space: nowrap;
  flex-wrap: nowrap;
}

.main-menu-more-button .q-btn__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 드롭다운 메뉴 아이템 활성화 스타일 */
.q-menu .q-list .q-item--active,
.q-menu .q-list .q-item.active {
  font-weight: 700 !important;
  color: var(--q-primary) !important;
  opacity: 1 !important;
  animation: blinkBackground 3s ease-in-out infinite;
}

.q-menu .q-list .q-item--active:hover,
.q-menu .q-list .q-item.active:hover {
  animation: blinkBackground 1s ease-in-out infinite; // 호버 시 1초로 빠르게
}

.q-menu .q-list .q-item--active .q-item__section,
.q-menu .q-list .q-item.active .q-item__section {
  font-weight: 700 !important;
  color: var(--q-primary) !important;
  opacity: 1 !important;
}

.q-menu .q-list .q-item--active .q-icon,
.q-menu .q-list .q-item.active .q-icon {
  opacity: 1 !important;
  color: var(--q-primary) !important;
}

/* 왼쪽 사이드바 */
.q-drawer:not(.q-drawer--right) {
  top: var(--header-height) !important;
  height: calc(100vh - var(--header-height) - var(--footer-height)) !important;
  background-color: var(--nexa-drawer-bg) !important;
  color: var(--nexa-drawer-text) !important;
  border-right: 1px solid var(--nexa-drawer-border) !important;
  z-index: 1999; /* 토글 버튼(2001)보다 낮게 설정하여 버튼이 항상 위에 오도록 */

  /* Quasar bordered prop 오버라이드 */
  &.q-drawer--bordered {
    border-right: 1px solid var(--nexa-drawer-border) !important;
  }
}

.q-drawer__content {
  margin-top: 0 !important;

  /* 오버레이 모드일 때 왼쪽 그림자를 위해 overflow-x 조정 */
  &.drawer-overlay {
    overflow-x: visible !important;
  }
}

.drawer-title {
  background: var(--nexa-drawer-header-bg);
  font-size: 2.5rem;
  font-weight: 500;
  font-family: 'Anton', Impact, 'Arial Black', 'Arial Bold', sans-serif;
  text-align: center;
  line-height: 1;
  width: 100%;
  text-transform: uppercase;
  letter-spacing: -0.5px;
  box-sizing: border-box;
  padding-top: 20px;
  padding-bottom: 10px;
  margin-bottom: 4px;

  .drawer-subtitle {
    font-size: 0.7rem;
    line-height: 0.9;
    margin-top: 0.25rem;
    opacity: 0.8;
    font-family: 'Roboto', sans-serif;
    font-weight: 300;
    letter-spacing: 0.5px;
  }
}

.btn-nexa-primary {
  background-color: var(--nexa-button-primary-bg);
  color: var(--nexa-button-primary-text);
  border-radius: var(--border-radius);
}

.btn-nexa-secondary {
  background-color: var(--nexa-button-secondary-bg);
  color: var(--nexa-button-secondary-text);
  border-radius: var(--border-radius);
}

/* 리사이즈 핸들 공통 스타일 */
.resize-handle,
.resize-handle-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: var(--resize-handle-width);
  cursor: ew-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  transition: all var(--transition-duration) ease;
  z-index: var(--resize-handle-z-index);

  .resize-dots {
    display: flex;
    flex-direction: column;
    gap: var(--resize-handle-dot-gap);
    padding: var(--resize-handle-dot-gap) 0;
  }

  .dot {
    width: var(--resize-handle-dot-size);
    height: var(--resize-handle-dot-size);
    background-color: var(--nexa-accent);
    opacity: var(--resize-handle-dot-opacity-default);
    border-radius: 50%;
    transition: all var(--transition-duration) ease;
  }

  &:hover .dot {
    opacity: var(--resize-handle-dot-opacity-hover);
    transform: scale(var(--resize-handle-dot-scale));
  }

  &.resizing .dot {
    opacity: var(--resize-handle-dot-opacity-resizing);
    transform: scale(var(--resize-handle-dot-scale));
  }
}

.resize-handle-right {
  right: var(--resize-handle-right-position);
  background: transparent !important;

  /* border를 별도 pseudo-element로 분리 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    right: var(--resize-handle-border-right-position);
    width: var(--resize-handle-border-width);
    background: var(--nexa-background-darker);
    pointer-events: none;
    transition: background var(--transition-duration) ease;
  }

  /* 호버 시 브랜드 색상으로 변경 */
  &:hover::before {
    background: var(--nexa-primary);
  }
}

/* 페이지 컨테이너 */
.q-page-container {
  padding-top: var(--header-height);
  /* padding-bottom 제거: Quasar 레이아웃이 자동으로 푸터 공간을 확보하므로 중복됨 */
  /* height 계산 수정: 푸터가 fixed이므로 높이에서 제외하지 않음 */
  height: calc(100vh - var(--header-height));
  max-height: calc(100vh - var(--header-height));
  overflow: hidden;
  box-sizing: border-box;
}

.q-page-container.parts-management-container {
  padding-bottom: 0;
  height: calc(100vh - var(--header-height));
  max-height: calc(100vh - var(--header-height));
}

.q-page-container .q-page {
  height: 100%;
  max-height: calc(100vh - var(--header-height) - var(--footer-height));
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  padding-bottom: var(--footer-height);
  box-sizing: border-box;
}

/* 오른쪽 사이드바 */
.q-drawer--right {
  top: var(--header-height);
  height: calc(100vh - var(--header-height) - var(--footer-height));
  max-height: calc(100vh - var(--header-height) - var(--footer-height));
  background-color: var(--nexa-drawer-bg);
  color: var(--nexa-drawer-text);
  border-left: 1px solid var(--nexa-drawer-border) !important;

  /* Quasar bordered prop 오버라이드 */
  &.q-drawer--bordered {
    border-left: 1px solid var(--nexa-drawer-border) !important;
  }

  /* 오버레이 모드일 때는 보더 제거 (그림자 사용) */
  &.drawer-overlay {
    border-left: none !important;
  }
}

.q-drawer--right .side-panel {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.q-drawer--right .side-panel .q-scroll-area {
  flex: 1;
  min-height: 0;
  max-height: calc(100% - 60px);
}

.resize-handle {
  left: var(--resize-handle-left-position);
  background: transparent !important;

  /* border를 별도 pseudo-element로 분리 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: var(--resize-handle-border-left-position);
    width: var(--resize-handle-border-width);
    background: var(--nexa-background-darker);
    pointer-events: none;
    transition: background var(--transition-duration) ease;
  }

  /* 호버 시 브랜드 색상으로 변경 */
  &:hover::before {
    background: var(--nexa-primary);
  }
}

/* 사이드바 토글 버튼 (항상 표시) */
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
  gap: 4px;
  cursor: pointer;
  z-index: 2001; /* header(2000)보다 높게 설정하여 항상 클릭 가능하도록 */
  pointer-events: auto; /* 마우스 이벤트 명시적으로 활성화 */
  transition:
    top 0.5s ease-out,
    background-color 2s ease;

  /* 라벨 스타일 (세로 방향) */
  .toggle-label {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    font-size: 10px;
    font-weight: 600;
    color: var(--nexa-text-secondary);
    letter-spacing: 1px;
    white-space: nowrap;
    transition: color 0.2s ease;
  }

  /* 아이콘 스타일 */
  .q-icon {
    font-size: 12px;
    color: var(--nexa-primary);
    font-weight: 900;
    transform: rotate(var(--icon-rotation, 0deg));
    transition:
      transform 0.3s ease,
      color 0.2s ease;
  }

  /* 호버 효과 */
  &:hover {
    width: 30px;
    background: var(--nexa-surface);
    transition:
      width 0.3s ease,
      background-color 2s ease;

    .toggle-label {
      color: var(--nexa-accent);
    }

    .q-icon {
      color: var(--nexa-accent);
      filter: drop-shadow(0 0 6px var(--nexa-accent));
    }
  }
}

/* 왼쪽 사이드바 토글 버튼 */
.sidebar-toggle-button--left {
  left: 0;
  border-radius: 0 8px 8px 0; /* 오른쪽 상단, 오른쪽 하단만 라운드 */
  border-left: none;
  pointer-events: auto; /* 마우스 이벤트 명시적으로 활성화 */

  &.is-drawer-open {
    border-left: 1px solid var(--nexa-border-color);
    /* drawer가 열려있을 때도 버튼이 위에 오도록 z-index 유지 */
    z-index: 2001;
  }

  &:hover {
    .q-icon {
      animation: shake-left-toggle 0.6s ease-in-out forwards;
    }
  }

  /* 자식 요소도 pointer-events 활성화 */
  * {
    pointer-events: auto;
  }
}

/* 오른쪽 사이드바 토글 버튼 */
.sidebar-toggle-button--right {
  right: 0;
  border-radius: 8px 0 0 8px; /* 왼쪽 상단, 왼쪽 하단만 라운드 */
  border-right: none;
  pointer-events: auto; /* 마우스 이벤트 명시적으로 활성화 */

  /* Drawer가 열려있을 때: 리사이즈 핸들 위치 (drawer 왼쪽 가장자리) */
  &.is-drawer-open {
    /* 리사이즈 핸들 위치에 배치되므로 border-left 추가 */
    border-left: 1px solid var(--nexa-border-color);
    border-right: none;
    border-radius: 8px 0 0 8px; /* drawer 열림 시 왼쪽 상단, 왼쪽 하단만 라운드 (유지) */
    /* drawer가 열려있을 때도 버튼이 위에 오도록 z-index 유지 */
    z-index: 2001;
  }

  /* 오버레이 모드일 때는 drawer보다 위에 표시되도록 z-index 높임 */
  &.is-overlay-mode {
    z-index: 3001; /* Quasar drawer overlay z-index (3000)보다 높게 설정 */
    /* 사이드바와 동일한 그림자 적용 (왼쪽으로 그림자) */
    box-shadow:
      -9px 0 8px var(--nexa-shadow-1),
      -10px 0 16px var(--nexa-shadow-2),
      -19px 0 24px var(--nexa-shadow-3);
  }

  &:hover {
    .q-icon {
      animation: shake-right-toggle 0.6s ease-in-out forwards;
    }
  }

  /* 자식 요소도 pointer-events 활성화 */
  * {
    pointer-events: auto;
  }
}

/* 왼쪽 토글 버튼 아이콘 좌우 흔들림 애니메이션 (왼쪽으로 이동하는 느낌) */
@keyframes shake-left-toggle {
  0% {
    transform: translateX(0) rotate(var(--hover-rotation));
  }
  15% {
    transform: translateX(-4px) rotate(var(--hover-rotation));
  }
  30% {
    transform: translateX(3px) rotate(var(--hover-rotation));
  }
  45% {
    transform: translateX(-3px) rotate(var(--hover-rotation));
  }
  60% {
    transform: translateX(2px) rotate(var(--hover-rotation));
  }
  75% {
    transform: translateX(-2px) rotate(var(--hover-rotation));
  }
  90%,
  100% {
    transform: translateX(0) rotate(var(--hover-rotation));
  }
}

/* 오른쪽 토글 버튼 아이콘 좌우 흔들림 애니메이션 (오른쪽으로 이동하는 느낌) */
@keyframes shake-right-toggle {
  0% {
    transform: translateX(0) rotate(var(--hover-rotation));
  }
  15% {
    transform: translateX(4px) rotate(var(--hover-rotation));
  }
  30% {
    transform: translateX(-3px) rotate(var(--hover-rotation));
  }
  45% {
    transform: translateX(3px) rotate(var(--hover-rotation));
  }
  60% {
    transform: translateX(-2px) rotate(var(--hover-rotation));
  }
  75% {
    transform: translateX(2px) rotate(var(--hover-rotation));
  }
  90%,
  100% {
    transform: translateX(0) rotate(var(--hover-rotation));
  }
}

/* 푸터 */
.q-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-index-footer);
  height: var(--footer-height);
  border-top: none;
  border-top: 1px solid var(--nexa-border-active) !important;
  border-bottom: 1px solid var(--nexa-border-active) !important;
  background: var(--nexa-background-darker);
  color: var(--nexa-text-hint) !important;

  .footer-nexa-logo {
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 10px;
    color: var(--nexa-primary);
  }

  .footer-system-features {
    display: flex;
    flex-direction: column;
    font-size: 6px;
    line-height: 0.6;
    color: var(--nexa-text-primary);
    font-weight: 100;
    margin-left: 0;
  }
}
</style>
