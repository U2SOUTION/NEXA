<template>
  <!-- 확장 프로그램이 선택된 경우 (U2BEE UI 등) -->
  <template v-if="selectedExtension === 'u2bee'">
    <!--U2BEE Injected 모드: 세 방향 탭 레이아웃 -->
    <template v-if="currentMode === 'injected'">
      <div class="u2bee-container injected-layout">
        <InjectedFloatingTabs :active-tab="u2beeActiveTab" :is-injected-mode="true" :panel-props="{ pageInfo: currentPageInfo }" @update:active-tab="u2beeActiveTab = $event">
          <template #rating>
            <ContentRating :page-info="currentPageInfo" />
          </template>
          <template #list>
            <ContentList />
          </template>
          <template #playbox>
            <PlayBox />
          </template>
          <template #history>
            <ContentHistory />
          </template>
          <template #statistics>
            <Statistics />
          </template>
          <template #data>
            <DataManagement />
          </template>
          <template #config>
            <Settings />
          </template>
          <template #about>
            <HelpPage />
          </template>
        </InjectedFloatingTabs>
      </div>
    </template>

    <!-- 일반 모드 (팝업/사이드 패널): 기존 레이아웃 -->
    <template v-else>
      <div class="u2bee-container">
        <!-- 상단 헤더: 로고 + 액션 버튼 -->
        <div class="header-section">
          <div class="logo">
            <span class="logo-text logo-red">U2BEE</span>
            <span class="logo-text logo-green">NEXA SYSTEM</span>
            <span class="logo-text logo-red">U2SOLUTION</span>
          </div>
          <div class="header-actions">
            <!-- 사이드 패널로 전환 버튼 (팝업 모드일 때만 표시) -->
            <!-- 주의: Chrome Extension API에서 사이드 패널을 프로그래밍 방식으로 닫는 공식 API가 없으므로, -->
            <!-- 사이드 패널에서 팝업으로 전환하는 버튼은 제공하지 않습니다. -->
            <!-- 사용자는 확장 프로그램 아이콘을 클릭하여 팝업을 열 수 있습니다. -->
            <q-btn v-if="isIframeMode && currentMode === 'popup'" flat dense label="사이드 패널로" icon="view_sidebar" size="sm" @click="toggleExtensionMode" class="mode-toggle-btn" />
            <span class="theme-label">THEME</span>
            <q-btn-toggle v-model="selectedTheme" :options="themeOptions" dense size="sm" />
            <q-btn flat dense label="설정" size="sm" />
            <q-btn flat dense label="로그인" size="sm" />
          </div>
        </div>

        <!-- 탭 영역 (꽉 차도록 배치) -->
        <q-tabs v-model="u2beeActiveTab" dense class="u2bee-tabs">
          <q-tab v-for="tab in visibleTabs" :key="tab.name" :name="tab.name" :label="tab.label" :icon="tab.icon" />
        </q-tabs>

        <q-tab-panels v-model="u2beeActiveTab" class="u2bee-panels">
          <q-tab-panel name="rating">
            <ContentRating :page-info="currentPageInfo" />
          </q-tab-panel>
          <q-tab-panel name="list">
            <ContentList />
          </q-tab-panel>
          <q-tab-panel name="playbox">
            <PlayBox />
          </q-tab-panel>
          <q-tab-panel name="history">
            <ContentHistory />
          </q-tab-panel>
          <q-tab-panel name="statistics">
            <Statistics />
          </q-tab-panel>
          <q-tab-panel name="data">
            <DataManagement />
          </q-tab-panel>
          <q-tab-panel name="config">
            <Settings />
          </q-tab-panel>
          <q-tab-panel name="about">
            <HelpPage />
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </template>
  </template>

  <!-- 확장 프로그램이 선택되지 않은 경우 (메인 페이지) -->
  <template v-else>
    <div class="q-pa-lg">
      <div class="page-header q-mb-lg">
        <h1 class="text-h4 text-primary q-mb-sm">Extension</h1>
        <p class="text-body1 text-grey-7">NEXA Platform 확장 프로그램 관리</p>
      </div>

      <q-tabs v-model="activeTab" class="q-mb-none">
        <q-tab name="chrome" label="크롬 확장 프로그램" />
        <q-tab name="desktop" label="NEXA Desktop" />
        <q-tab name="others" label="기타 확장 프로그램" />
      </q-tabs>

      <q-tab-panels v-model="activeTab" animated>
        <!-- 크롬 확장 프로그램 -->
        <q-tab-panel name="chrome" class="extension-category-panel">
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6 col-lg-4 extension-item">
              <div class="text-h6 q-mb-sm">U2BEE</div>
              <ul class="text-body2 text-grey-7">
                <li>콘텐츠 수집 및 관리 확장 프로그램</li>
                <li>YouTube, TikTok 등 플랫폼 지원</li>
                <li>실시간 정보 추출 및 분석</li>
              </ul>
            </div>
          </div>
        </q-tab-panel>

        <!-- NEXA Desktop -->
        <q-tab-panel name="desktop" class="extension-category-panel">
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6 col-lg-4 extension-item">
              <div class="text-h6 q-mb-sm">NEXA Desktop Client</div>
              <ul class="text-body2 text-grey-7">
                <li>Python 기반 데스크톱 애플리케이션</li>
                <li>플랫폼 통합 데스크톱 클라이언트</li>
                <li>웹뷰 기반 UI 구성</li>
              </ul>
            </div>
          </div>
        </q-tab-panel>

        <!-- 기타 확장 프로그램 -->
        <q-tab-panel name="others" class="extension-category-panel">
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6 col-lg-4 extension-item">
              <div class="text-h6 q-mb-sm">ScreenDraw</div>
              <ul class="text-body2 text-grey-7">
                <li>화면 그리기 및 주석 도구</li>
                <li>실시간 화면 캡처 및 편집</li>
              </ul>
            </div>

            <div class="col-12 col-md-6 col-lg-4 extension-item">
              <div class="text-h6 q-mb-sm">MEXA Break</div>
              <ul class="text-body2 text-grey-7">
                <li>작업 효율화 타이머</li>
                <li>쾌적한 작업 환경 유지</li>
              </ul>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </template>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ContentRating from 'src/components/extension/u2bee/ContentRating.vue'
import ContentList from 'src/components/extension/u2bee/ContentList.vue'
import PlayBox from 'src/components/extension/u2bee/PlayBox.vue'
import ContentHistory from 'src/components/extension/u2bee/ContentHistory.vue'
import Statistics from 'src/components/extension/u2bee/Statistics.vue'
import DataManagement from 'src/components/extension/u2bee/DataManagement.vue'
import Settings from 'src/components/extension/u2bee/Settings.vue'
import HelpPage from 'src/components/extension/u2bee/HelpPage.vue'
import InjectedFloatingTabs from 'src/components/extension/u2bee/InjectedFloatingTabs.vue'
import { useTabConfig } from 'src/system/composables/extension/u2bee/useTabConfig'

const route = useRoute()
const router = useRouter()

// URL query parameter에서 activeTab 및 extension 초기화
const activeTab = ref(route.query.tab || 'chrome')
const selectedExtension = computed(() => route.query.extension || null)
const isIframeMode = computed(() => route.query.mode === 'popup' || route.query.mode === 'sidepanel' || route.query.mode === 'injected' || window.self !== window.top)
const currentMode = computed(() => {
  // URL query parameter에서 모드 확인
  if (route.query.mode === 'popup') return 'popup'
  if (route.query.mode === 'sidepanel') return 'sidepanel'
  if (route.query.mode === 'injected') return 'injected'
  // window.self !== window.top으로 iframe 감지 (fallback)
  if (window.self !== window.top) {
    // 기본적으로 popup으로 간주 (사이드 패널로 전환 가능)
    return 'popup'
  }
  return null
})

// 팝업/사이드 패널 전환
const toggleExtensionMode = () => {
  if (!isIframeMode.value) return

  // 부모 창(popup.html 또는 sidepanel.html)에 메시지 전송
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(
      {
        type: 'TOGGLE_EXTENSION_MODE',
        currentMode: currentMode.value,
      },
      '*', // 보안을 위해 실제 배포 시에는 특정 origin으로 제한
    )
  }
}

// U2BEE 탭 관리
const { visibleTabs } = useTabConfig()
const u2beeActiveTab = ref('rating')

// 테마 선택
const selectedTheme = ref('gray')
const themeOptions = [
  { label: 'Gray', value: 'gray' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
]

// URL query parameter 변경 감지
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && ['chrome', 'desktop', 'others'].includes(newTab)) {
      activeTab.value = newTab
    } else if (!newTab) {
      activeTab.value = 'chrome'
    }
  },
  { immediate: true },
)

// 탭 변경 시 URL query parameter 업데이트 (extension이 없을 때만)
watch(activeTab, (newTab) => {
  if (!selectedExtension.value && route.query.tab !== newTab) {
    router.push({
      path: '/extension',
      query: { tab: newTab },
    })
  }
})

// visibleTabs 변경 시 첫 번째 탭으로 초기화
watch(
  visibleTabs,
  (tabs) => {
    if (tabs.length > 0 && !tabs.find((tab) => tab.name === u2beeActiveTab.value)) {
      u2beeActiveTab.value = tabs[0].name
    }
  },
  { immediate: true },
)

// currentMode 변경 시 body 클래스 업데이트
watch(
  currentMode,
  (mode) => {
    // 기존 모드 클래스 제거
    document.body.classList.remove('injected-mode', 'sidepanel-mode')

    // 새 모드에 따른 클래스 추가
    if (mode === 'injected') {
      document.body.classList.add('injected-mode')
    } else if (mode === 'sidepanel') {
      document.body.classList.add('sidepanel-mode')
    }
  },
  { immediate: true },
)

// 현재 페이지 정보 (Extension에서 수신)
const currentPageInfo = ref({
  url: '',
  title: '',
  timestamp: null,
  pageType: null,
  // YouTube/Shorts 공통
  videoId: null,
  channelName: null,
  channelId: null,
  thumbnail: null,
  description: null,
  viewCount: null,
  likeCount: null,
  publishedAt: null,
  duration: null,
  // Website 전용
  publisher: null,
  image: null,
  author: null,
})

// 중복 메시지 필터링을 위한 마지막 업데이트 정보
let lastUpdateInfo = {
  url: '',
  title: '',
  timestamp: null,
}

// Extension에서 오는 메시지 수신 핸들러
function handleExtensionMessage(event) {
  // 보안: localhost, 127.0.0.1, chrome-extension, 또는 빈 origin 허용 (file:// 또는 같은 origin)
  const allowedOrigins = ['localhost', '127.0.0.1', 'chrome-extension', 'null']
  const isAllowedOrigin = !event.origin || allowedOrigins.some((allowed) => event.origin.includes(allowed))

  if (!isAllowedOrigin) {
    return
  }

  if (event.data && event.data.type === 'EXTENSION_MESSAGE') {
    const messageData = event.data.data

    if (messageData && messageData.type === 'PAGE_INFO_UPDATE') {
      const pageData = messageData.data || messageData

      // 중복 메시지 필터링: 같은 URL, 타이틀, timestamp면 무시
      if (lastUpdateInfo.url === pageData.url && lastUpdateInfo.title === pageData.title && lastUpdateInfo.timestamp === pageData.timestamp) {
        return
      }

      // 업데이트 정보 저장
      lastUpdateInfo = {
        url: pageData.url || '',
        title: pageData.title || '',
        timestamp: pageData.timestamp || null,
      }

      // 모든 페이지 정보 업데이트
      currentPageInfo.value = {
        url: pageData.url || '',
        title: pageData.title || '',
        timestamp: pageData.timestamp || null,
        pageType: pageData.pageType || null,
        // YouTube/Shorts 공통
        videoId: pageData.videoId || null,
        channelName: pageData.channelName || null,
        channelId: pageData.channelId || null,
        thumbnail: pageData.thumbnail || null,
        description: pageData.description || null,
        viewCount: pageData.viewCount || null,
        likeCount: pageData.likeCount || null,
        publishedAt: pageData.publishedAt || null,
        duration: pageData.duration || null,
        // Website 전용
        publisher: pageData.publisher || null,
        image: pageData.image || null,
        author: pageData.author || null,
      }
    } else if (messageData && messageData.type === 'SWITCH_TAB') {
      // 탭 전환 메시지 처리
      const tabName = messageData.tabName
      if (tabName && ['rating', 'list', 'playbox', 'history', 'statistics', 'data', 'config', 'about'].includes(tabName)) {
        u2beeActiveTab.value = tabName
      }
    }
  }
}

// iframe 모드일 때만 메시지 리스너 등록
onMounted(() => {
  // Injected 모드일 때 body에 클래스 추가
  if (currentMode.value === 'injected') {
    document.body.classList.add('injected-mode')
  }
  // 사이드 패널 모드일 때 body에 클래스 추가
  if (currentMode.value === 'sidepanel') {
    document.body.classList.add('sidepanel-mode')
  }

  if (isIframeMode.value) {
    // 즉시 리스너 등록
    window.addEventListener('message', handleExtensionMessage)

    // 부모 창에 준비 완료 메시지 전송
    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage(
          {
            type: 'IFRAME_READY',
            origin: window.location.origin,
          },
          '*',
        )
      } catch (error) {
        console.error('[ExtensionPage] 부모 창 메시지 전송 실패:', error)
      }
    }
  }
})

onUnmounted(() => {
  // Injected 모드 클래스 제거
  document.body.classList.remove('injected-mode')
  // 사이드 패널 모드 클래스 제거
  document.body.classList.remove('sidepanel-mode')

  if (isIframeMode.value) {
    window.removeEventListener('message', handleExtensionMessage)
  }
})
</script>

<style lang="scss">
// ============================================
// U2BEE 관련 스타일
// ============================================

@import 'src/system/css/extension/u2bee-layout.scss'; // U2BEE 관련 스타일은 u2bee-layout.scss에서 통합 관리

// ============================================
// Extension 메인 페이지 스타일 (넥사 플렛폼 확장 프로그램 관리 페이지)
// ============================================
.extension-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 40px;
  overflow-y: visible;
}

//메인페이지 카테고리별 패널 스타일 (크롬 확장 프로그램, NEXA Desktop, 기타)
.extension-category-panel {
  border-radius: 4px;
  padding: 16px 35px;
}
</style>
