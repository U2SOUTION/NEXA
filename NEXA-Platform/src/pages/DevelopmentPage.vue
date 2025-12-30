<template>
  <q-page class="development-page">
    <!-- activeMenu가 없을 때: DevelopmentPage 기본 뷰 -->
    <div v-if="!activeMenu" class="development-page-default q-pa-lg">
      <div class="default-content">
        <q-icon name="code" size="80px" color="grey-7" class="q-mb-md" />
        <h2 class="default-title">개발 도구</h2>
        <p class="default-description">왼쪽 사이드바에서 개발 도구를 선택하세요.</p>
      </div>
    </div>

    <!-- activeMenu가 있을 때: 각 도구 컨텐츠 -->
    <div v-else class="q-pa-lg">
      <!-- 문서 관리 컨텐츠 -->
      <DocumentManagerContent v-if="activeMenu === 'document-manager'" />

      <!-- 테마 관리 컨텐츠 -->
      <div v-else-if="activeMenu === 'theme-manager'" class="theme-manager-content-wrapper">
        <ThemeManagerContent :sort-option="themeSortOption" :search-query="themeSearchQuery" :category-filter="themeCategoryFilter" />
      </div>

      <!-- 그래프독 -->
      <GraphDocContent v-else-if="activeMenu === 'document-generator'" />

      <!-- 성능 모니터 -->
      <PerformanceMonitorContent v-else-if="activeMenu === 'performance-monitor'" />

      <!-- 로그 뷰어 -->
      <LogViewerContent v-else-if="activeMenu === 'log-viewer'" />


      <!-- 데이터베이스 -->
      <DatabaseViewerContent v-else-if="activeMenu === 'database-viewer'" />

      <!-- 설정 관리 -->
      <SettingsManagerContent v-else-if="activeMenu === 'settings-manager'" :selected-setting="settingsManagerSelectedSetting" :statistics="settingsManagerStatistics" />

      <!-- 개발 가이드 -->
      <DevGuideContent v-else-if="activeMenu === 'dev-guide'" ref="devGuideContentRef" />

      <!-- 빌드 도구 -->
      <BuildToolsContent v-else-if="activeMenu === 'build-tools'" />

      <!-- 패키지 관리 -->
      <PackageManagerContent v-else-if="activeMenu === 'package-manager'" />

      <!-- 환경 변수 -->
      <EnvironmentVariablesContent v-else-if="activeMenu === 'environment-variables'" />

      <!-- 네트워크 모니터 -->
      <NetworkMonitorContent v-else-if="activeMenu === 'network-monitor'" />

      <!-- 에러 트래킹 -->
      <ErrorTrackingContent v-else-if="activeMenu === 'error-tracking'" />

      <!-- 배포 관리 -->
      <DeploymentManagerContent v-else-if="activeMenu === 'deployment-manager'" />
    </div>

    <!-- 컴포넌트 라이브러리 (q-pa-lg 밖으로 분리하여 높이 문제 해결) -->
    <ComponentLibraryContent v-if="activeMenu === 'component-library'" />
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import DocumentManagerContent from 'src/components/dev-tools/document-manager/DocumentManagerContent.vue'
import ThemeManagerContent from 'src/components/dev-tools/theme-manager/ThemeManagerContent.vue'
import GraphDocContent from 'src/components/dev-tools/graph-doc/GraphDocContent.vue'
import PerformanceMonitorContent from 'src/components/dev-tools/performance-monitor/PerformanceMonitorContent.vue'
import LogViewerContent from 'src/components/dev-tools/log-viewer/LogViewerContent.vue'
import DatabaseViewerContent from 'src/components/dev-tools/database-viewer/DatabaseViewerContent.vue'
import SettingsManagerContent from 'src/components/dev-tools/settings-manager/SettingsManagerContent.vue'
import ComponentLibraryContent from 'src/components/dev-tools/component-library/ComponentLibraryContent.vue'
import DevGuideContent from 'src/components/dev-tools/dev-guide/DevGuideContent.vue'
import BuildToolsContent from 'src/components/dev-tools/build-tools/BuildToolsContent.vue'
import PackageManagerContent from 'src/components/dev-tools/package-manager/PackageManagerContent.vue'
import EnvironmentVariablesContent from 'src/components/dev-tools/environment-variables/EnvironmentVariablesContent.vue'
import NetworkMonitorContent from 'src/components/dev-tools/network-monitor/NetworkMonitorContent.vue'
import ErrorTrackingContent from 'src/components/dev-tools/error-tracking/ErrorTrackingContent.vue'
import DeploymentManagerContent from 'src/components/dev-tools/deployment-manager/DeploymentManagerContent.vue'

// Active menu 상태 (설정에 따라 이전 메뉴 복원 또는 null로 시작)
function getInitialActiveMenu() {
  try {
    // 이전 메뉴 복원 옵션 확인
    const restoreOption = localStorage.getItem('dev-restore-last-menu')
    const shouldRestore = restoreOption === null || restoreOption === 'true' // 기본값: true

    if (shouldRestore) {
      const saved = localStorage.getItem('dev-active-menu')
      if (saved) {
        // 유효한 메뉴 ID인지 확인 (DevMenuSlider.vue의 순서와 동일하게 유지)
        const validMenus = [
          'document-manager',
          'theme-manager',
          'dev-guide',
          'component-library',
          'database-viewer',
          'log-viewer',
          'performance-monitor',
          'error-tracking',
          'settings-manager',
          'build-tools',
          'network-monitor',
          'environment-variables',
          'package-manager',
          'document-generator',
          'deployment-manager',
        ]
        if (validMenus.includes(saved)) {
          return saved
        }
      }
    }
  } catch (error) {
    console.error('[DevelopmentPage] 초기 메뉴 로드 실패:', error)
  }
  return null // 기본값: DevelopmentPage 자체를 보여줌
}

const activeMenu = ref(getInitialActiveMenu())

// 테마 관리 상태 (DevSidebar와 동기화)
const themeSearchQuery = ref('')
const themeCategoryFilter = ref(null)
const themeSortOption = ref('category')

// 설정 관리 상태 (DevSidebar와 동기화)
const settingsManagerSelectedSetting = ref(null)
const settingsManagerStatistics = ref(null)

// 테마 관리 상태 변경 이벤트 핸들러
function handleThemeSearchChange(event) {
  themeSearchQuery.value = event.detail.query || ''
}

function handleThemeCategoryFilterChange(event) {
  themeCategoryFilter.value = event.detail.category || null
}

function handleThemeSortChange(event) {
  themeSortOption.value = event.detail.option || 'category'
}

// 설정 관리 상태 변경 이벤트 핸들러
function handleSettingsManagerSettingSelected(event) {
  settingsManagerSelectedSetting.value = event.detail.setting || null
}

function handleSettingsManagerStatisticsUpdated(event) {
  settingsManagerStatistics.value = event.detail.statistics || null
}

// 설정 업데이트 핸들러
function handleSettingsManagerSettingUpdated() {
  // 설정이 업데이트되면 DevSidebar에 알림하여 스캔 새로고침
  window.dispatchEvent(new CustomEvent('settings-manager-refresh-request'))
}

// 설정 삭제 핸들러
function handleSettingsManagerSettingDeleted() {
  // 설정이 삭제되면 선택 해제 및 DevSidebar에 알림하여 스캔 새로고침
  settingsManagerSelectedSetting.value = null
  window.dispatchEvent(new CustomEvent('settings-manager-refresh-request'))
}

// 메뉴 메인 페이지로 이동 핸들러
function handleMenuMainPage(event) {
  const menuId = event.detail.menuId
  if (menuId === activeMenu.value) {
    // 현재 메뉴의 메인 페이지로 이동
    if (menuId === 'settings-manager') {
      settingsManagerSelectedSetting.value = null
    } else if (menuId === 'dev-guide') {
      // DevGuideContent의 메인 페이지로 이동
      window.dispatchEvent(new CustomEvent('dev-guide-main-page'))
    } else if (menuId === 'error-tracking') {
      // ErrorTrackingContent의 메인 페이지로 이동
      window.dispatchEvent(new CustomEvent('error-tracking-main-page'))
    } else if (menuId === 'performance-monitor') {
      // PerformanceMonitorContent의 메인 페이지로 이동
      window.dispatchEvent(new CustomEvent('performance-monitor-main-page'))
    }
    // 기타 메뉴는 이미 메인 페이지 구조를 가지고 있음
  }
}

// Active menu 변경 이벤트 리스너
function handleActiveMenuChange(event) {
  const newMenu = event.detail.activeMenu
  if (activeMenu.value !== newMenu) {
    activeMenu.value = newMenu
    // localStorage에 저장하여 다음 접속 시 복원
    try {
      localStorage.setItem('dev-active-menu', newMenu)
    } catch (error) {
      console.error('[DevelopmentPage] 메뉴 상태 저장 실패:', error)
    }
  }
}

onMounted(async () => {
  // Active menu 변경 이벤트 리스너 등록
  window.addEventListener('dev-menu-changed', handleActiveMenuChange)
  window.addEventListener('dev-menu-main-page', handleMenuMainPage)
  window.addEventListener('theme-manager-search-changed', handleThemeSearchChange)
  window.addEventListener('theme-manager-filter-changed', handleThemeCategoryFilterChange)
  window.addEventListener('theme-manager-sort-changed', handleThemeSortChange)
  window.addEventListener('settings-manager-setting-selected', handleSettingsManagerSettingSelected)
  window.addEventListener('settings-manager-statistics-updated', handleSettingsManagerStatisticsUpdated)
  window.addEventListener('settings-manager-setting-updated', handleSettingsManagerSettingUpdated)
  window.addEventListener('settings-manager-setting-deleted', handleSettingsManagerSettingDeleted)

  // 모든 컴포넌트가 마운트된 후에 초기 메뉴를 사이드바에 전파
  await nextTick()
  // 추가 대기 시간을 두어 DevSidebar와 DevMenuSlider가 완전히 마운트되도록 함
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('dev-menu-changed', { detail: { activeMenu: activeMenu.value } }))
  }, 100)
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  window.removeEventListener('dev-menu-changed', handleActiveMenuChange)
  window.removeEventListener('dev-menu-main-page', handleMenuMainPage)
  window.removeEventListener('theme-manager-search-changed', handleThemeSearchChange)
  window.removeEventListener('theme-manager-filter-changed', handleThemeCategoryFilterChange)
  window.removeEventListener('theme-manager-sort-changed', handleThemeSortChange)
})
</script>

<style lang="scss" scoped>
.development-page {
  background: var(--nexa-background);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  // 문서 관리자에서 스크롤은 DocumentManagerContent 내부에서 처리
  // overflow: hidden; // 필요시 활성화

  .development-page-default {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;

    .default-content {
      text-align: center;
      padding: 2rem;

      .default-title {
        color: var(--nexa-text-primary);
        font-size: 2rem;
        font-weight: 900;
        margin: 1rem 0;
      }

      .default-description {
        color: var(--nexa-text-secondary);
        font-size: 1rem;
        margin: 0;
      }
    }
  }
}

.stats-summary-section {
  background: var(--nexa-background-lower);
  border-bottom: 1px solid var(--nexa-border-color);

  .stats-number-item {
    padding: 4px 0;
  }
}
</style>
