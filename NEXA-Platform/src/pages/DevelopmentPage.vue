<template>
  <q-page class="development-page">
    <div class="q-pa-lg">
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

      <!-- API 테스터 -->
      <ApiTesterContent v-else-if="activeMenu === 'api-tester'" />

      <!-- 데이터베이스 -->
      <DatabaseViewerContent v-else-if="activeMenu === 'database-viewer'" />

      <!-- 설정 관리 -->
      <SettingsManagerContent v-else-if="activeMenu === 'settings-manager'" />

      <!-- 컴포넌트 -->
      <ComponentLibraryContent v-else-if="activeMenu === 'component-library'" />

      <!-- 스타일 가이드 -->
      <StyleGuideContent v-else-if="activeMenu === 'style-guide'" />

      <!-- 테스트 러너 -->
      <TestRunnerContent v-else-if="activeMenu === 'test-runner'" />

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
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import DocumentManagerContent from 'src/components/dev-tools/document-manager/DocumentManagerContent.vue'
import ThemeManagerContent from 'src/components/dev-tools/theme-manager/ThemeManagerContent.vue'
import GraphDocContent from 'src/components/dev-tools/graph-doc/GraphDocContent.vue'
import PerformanceMonitorContent from 'src/components/dev-tools/performance-monitor/PerformanceMonitorContent.vue'
import LogViewerContent from 'src/components/dev-tools/log-viewer/LogViewerContent.vue'
import ApiTesterContent from 'src/components/dev-tools/api-tester/ApiTesterContent.vue'
import DatabaseViewerContent from 'src/components/dev-tools/database-viewer/DatabaseViewerContent.vue'
import SettingsManagerContent from 'src/components/dev-tools/settings-manager/SettingsManagerContent.vue'
import ComponentLibraryContent from 'src/components/dev-tools/component-library/ComponentLibraryContent.vue'
import StyleGuideContent from 'src/components/dev-tools/style-guide/StyleGuideContent.vue'
import TestRunnerContent from 'src/components/dev-tools/test-runner/TestRunnerContent.vue'
import BuildToolsContent from 'src/components/dev-tools/build-tools/BuildToolsContent.vue'
import PackageManagerContent from 'src/components/dev-tools/package-manager/PackageManagerContent.vue'
import EnvironmentVariablesContent from 'src/components/dev-tools/environment-variables/EnvironmentVariablesContent.vue'
import NetworkMonitorContent from 'src/components/dev-tools/network-monitor/NetworkMonitorContent.vue'
import ErrorTrackingContent from 'src/components/dev-tools/error-tracking/ErrorTrackingContent.vue'
import DeploymentManagerContent from 'src/components/dev-tools/deployment-manager/DeploymentManagerContent.vue'

// Active menu 상태 (localStorage에서 마지막 선택한 메뉴 복원, 없으면 기본값 'document-manager')
function getInitialActiveMenu() {
  try {
    const saved = localStorage.getItem('dev-active-menu')
    if (saved) {
      // 유효한 메뉴 ID인지 확인
      const validMenus = [
        'document-manager',
        'theme-manager',
        'performance-monitor',
        'log-viewer',
        'api-tester',
        'database-viewer',
        'settings-manager',
        'component-library',
        'style-guide',
        'test-runner',
        'build-tools',
        'package-manager',
        'environment-variables',
        'network-monitor',
        'error-tracking',
        'document-generator',
        'deployment-manager',
      ]
      if (validMenus.includes(saved)) {
        return saved
      }
    }
  } catch (error) {
    console.error('[DevelopmentPage] 초기 메뉴 로드 실패:', error)
  }
  return 'document-manager' // 기본값
}

const activeMenu = ref(getInitialActiveMenu())

// 테마 관리 상태 (DevSidebar와 동기화)
const themeSearchQuery = ref('')
const themeCategoryFilter = ref(null)
const themeSortOption = ref('category')

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

onMounted(() => {
  // 초기 메뉴를 사이드바에 전파 (DevelopmentPage가 초기 상태의 주인)
  window.dispatchEvent(new CustomEvent('dev-menu-changed', { detail: { activeMenu: activeMenu.value } }))

  // Active menu 변경 이벤트 리스너 등록
  window.addEventListener('dev-menu-changed', handleActiveMenuChange)
  window.addEventListener('theme-manager-search-changed', handleThemeSearchChange)
  window.addEventListener('theme-manager-filter-changed', handleThemeCategoryFilterChange)
  window.addEventListener('theme-manager-sort-changed', handleThemeSortChange)
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  window.removeEventListener('dev-menu-changed', handleActiveMenuChange)
  window.removeEventListener('theme-manager-search-changed', handleThemeSearchChange)
  window.removeEventListener('theme-manager-filter-changed', handleThemeCategoryFilterChange)
  window.removeEventListener('theme-manager-sort-changed', handleThemeSortChange)
})
</script>

<style lang="scss" scoped>
.development-page {
  background: var(--nexa-background);
  min-height: 100vh;
}

.stats-summary-section {
  background: var(--nexa-background-lower);
  border-bottom: 1px solid var(--nexa-border-color);

  .stats-number-item {
    padding: 4px 0;
  }
}
</style>
