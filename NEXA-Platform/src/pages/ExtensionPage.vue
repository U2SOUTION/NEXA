<template>
  <q-page :class="['extension-page', { 'iframe-mode': isIframeMode }]">
    <!-- 확장 프로그램이 선택된 경우 (U2BEE UI 등) -->
    <template v-if="selectedExtension === 'u2bee'">
      <div class="u2bee-container">
        <!-- 상단 헤더: 로고 + 액션 버튼 -->
        <div class="header-section">
          <div class="logo">
            <span class="logo-text logo-red">U2BEE</span>
            <span class="logo-text logo-green">NEXA SYSTEM</span>
            <span class="logo-text logo-red">U2SOLUTION</span>
          </div>
          <div class="header-actions">
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
            <ContentRating />
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
  </q-page>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ContentRating from 'src/components/extension/u2bee/ContentRating.vue'
import ContentList from 'src/components/extension/u2bee/ContentList.vue'
import PlayBox from 'src/components/extension/u2bee/PlayBox.vue'
import ContentHistory from 'src/components/extension/u2bee/ContentHistory.vue'
import Statistics from 'src/components/extension/u2bee/Statistics.vue'
import DataManagement from 'src/components/extension/u2bee/DataManagement.vue'
import Settings from 'src/components/extension/u2bee/Settings.vue'
import HelpPage from 'src/components/extension/u2bee/HelpPage.vue'
import { useTabConfig } from 'src/composables/extension/u2bee/useTabConfig'

const route = useRoute()
const router = useRouter()

// URL query parameter에서 activeTab 및 extension 초기화
const activeTab = ref(route.query.tab || 'chrome')
const selectedExtension = computed(() => route.query.extension || null)
const isIframeMode = computed(() => route.query.mode === 'popup' || route.query.mode === 'sidepanel' || window.self !== window.top)

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
</script>

<style lang="scss">
.extension-page {
  background: var(--nexa-background);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 40px;
  overflow-y: visible; // MainLayout의 q-page 기본 overflow-y: auto 오버라이드

  // iframe 모드일 때 패딩 제거 및 스크롤 방지
  &.iframe-mode {
    padding: 0 !important;
    margin: 0 !important;
    min-height: 100vh !important;
    max-height: 100vh !important;
    height: 100vh !important;
    overflow: hidden !important;
    overflow-x: hidden !important;
    overflow-y: hidden !important;
    // MainLayout의 q-page 기본 overflow-y: auto 오버라이드
    overflow-y: hidden !important;
  }
}

// U2BEE 컨테이너 (사이드바 없이 메인 콘텐츠만)
.u2bee-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  max-height: 100%;
  overflow: hidden;

  // iframe 모드일 때 추가 스크롤 방지
  .extension-page.iframe-mode & {
    height: 100vh;
    max-height: 100vh;
    overflow: hidden;
  }
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid var(--nexa-border-color);
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  font-size: 14px;
}

.logo-text {
  white-space: nowrap;
}

.logo-red {
  color: #ff4444;
}

.logo-green {
  color: #44ff44;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-label {
  font-size: 12px;
  color: var(--nexa-text-secondary);
  margin-right: 4px;
}

.u2bee-tabs {
  flex-shrink: 0;
  border-bottom: 1px solid var(--nexa-border-color);
  background: var(--nexa-background);
  width: 100%;
  display: flex;
}

.u2bee-tabs .q-tabs__content {
  width: 100%;
  display: flex;
}

.u2bee-tabs .q-tab {
  flex: 1;
  min-width: 0;
  max-width: none;
  padding: 0 !important;
}

.u2bee-tabs .q-tab__content {
  flex-direction: row !important;
  align-items: center;
  gap: 4px;
  padding: 0 !important;
}

.u2bee-tabs .q-tab__label {
  font-size: clamp(12px, 1.2vw, 14px); //동적으로 조절
  letter-spacing: clamp(-0.7px, -0.06vw, -0.3px); //동적으로 조절
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.u2bee-tabs .q-tab__icon {
  font-size: 18px;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

//텝 패널 컨텐츠 스타일
.u2bee-panels {
  flex: 1;
  padding: 0;
  overflow: hidden;
  min-height: 0;
  max-height: 100%;

  // iframe 모드일 때 추가 스크롤 방지
  .extension-page.iframe-mode & {
    overflow: hidden;
    overflow-x: hidden;
    overflow-y: hidden;
    max-height: calc(100vh - var(--header-height, 48px) - var(--tabs-height, 48px));
  }
}

.u2bee-panels .q-tab-panels {
  overflow: hidden;
  height: 100%;
  max-height: 100%;

  // iframe 모드일 때 추가 스크롤 방지
  .extension-page.iframe-mode & {
    overflow: hidden;
    overflow-x: hidden;
    overflow-y: hidden;
  }
}

.u2bee-panels .q-tab-panel {
  overflow: visible;
  height: auto;

  // iframe 모드일 때 스크롤 방지 (내부 콘텐츠는 필요시 스크롤 가능)
  .extension-page.iframe-mode & {
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 100%;
    height: 100%;
  }
}

// 기존 스타일 (메인 페이지용)
.extension-category-panel {
  border-radius: 4px;
  padding: 16px 35px;
}

.extension-page .q-tab-panels {
  background: transparent;
}

.extension-page .q-tab-panel {
  padding: 0;
}

.extension-item {
  cursor: pointer;
  padding: 1rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: var(--nexa-surface-hover);
  }
}
</style>
