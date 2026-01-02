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

      <!-- 데이터베이스 -->
      <DatabaseViewerContent v-else-if="activeMenu === 'database-viewer'" />

      <!-- 설정 관리 -->
      <SettingsManagerContent v-else-if="activeMenu === 'settings-manager'" :selected-setting="settingsManagerSelectedSetting" :statistics="settingsManagerStatistics" />

      <!-- 개발 가이드 -->
      <DevGuideContent v-else-if="activeMenu === 'dev-guide'" ref="devGuideContentRef" />

      <!-- DevOps -->
      <DevOpsContent v-else-if="activeMenu === 'devops'" />
    </div>

    <!-- 컴포넌트 라이브러리 (q-pa-lg 밖으로 분리하여 높이 문제 해결) -->
    <ComponentLibraryContent v-if="activeMenu === 'component-library'" />
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import DocumentManagerContent from 'src/components/dev-tools/document-manager/DocumentManagerContent.vue'
import ThemeManagerContent from 'src/components/dev-tools/theme-manager/ThemeManagerContent.vue'
import GraphDocContent from 'src/components/dev-tools/graph-doc/GraphDocContent.vue'
import PerformanceMonitorContent from 'src/components/dev-tools/performance-monitor/PerformanceMonitorContent.vue'
import DatabaseViewerContent from 'src/components/dev-tools/database-viewer/DatabaseViewerContent.vue'
import SettingsManagerContent from 'src/components/dev-tools/settings-manager/SettingsManagerContent.vue'
import ComponentLibraryContent from 'src/components/dev-tools/component-library/ComponentLibraryContent.vue'
import DevGuideContent from 'src/components/dev-tools/dev-guide/DevGuideContent.vue'
import DevOpsContent from 'src/components/dev-tools/devops/DevOpsContent.vue'

// Active menu 상태 (DevSidebar가 완전히 관리, 여기서는 이벤트로만 동기화)
const activeMenu = ref(null)

// 테마 관리 상태 (DevSidebar와 동기화)
const themeSearchQuery = ref('')
const themeCategoryFilter = ref(null)
const themeSortOption = ref('category')

// 설정 관리 상태 (DevSidebar와 동기화)
const settingsManagerSelectedSetting = ref(null)
const settingsManagerStatistics = ref(null)

// DevOps 상태
const devOpsActiveTab = ref('build')
const devOpsSelectedBuild = ref(null)
const devOpsSelectedDeployment = ref(null)
const devOpsSelectedEnvironmentVariable = ref(null)
const devOpsSelectedPackage = ref(null)

// 테마 관리 상태 변경 이벤트 핸들러
function handleThemeSearchChange(event) {
  themeSearchQuery.value = event.detail.query || ''
  // 상태 저장 (DevSidebar에 저장 요청)
  if (activeMenu.value === 'theme-manager') {
    window.dispatchEvent(
      new CustomEvent('dev-menu-state-save', {
        detail: {
          menuId: 'theme-manager',
          state: {
            searchQuery: themeSearchQuery.value,
            categoryFilter: themeCategoryFilter.value,
            sortOption: themeSortOption.value,
          },
        },
      }),
    )
  }
}

function handleThemeCategoryFilterChange(event) {
  themeCategoryFilter.value = event.detail.category || null
  // 상태 저장
  if (activeMenu.value === 'theme-manager') {
    window.dispatchEvent(
      new CustomEvent('dev-menu-state-save', {
        detail: {
          menuId: 'theme-manager',
          state: {
            searchQuery: themeSearchQuery.value,
            categoryFilter: themeCategoryFilter.value,
            sortOption: themeSortOption.value,
          },
        },
      }),
    )
  }
}

function handleThemeSortChange(event) {
  themeSortOption.value = event.detail.option || 'category'
  // 상태 저장
  if (activeMenu.value === 'theme-manager') {
    window.dispatchEvent(
      new CustomEvent('dev-menu-state-save', {
        detail: {
          menuId: 'theme-manager',
          state: {
            searchQuery: themeSearchQuery.value,
            categoryFilter: themeCategoryFilter.value,
            sortOption: themeSortOption.value,
          },
        },
      }),
    )
  }
}

// 설정 관리 상태 변경 이벤트 핸들러
function handleSettingsManagerSettingSelected(event) {
  settingsManagerSelectedSetting.value = event.detail.setting || null
  // 상태 저장
  if (activeMenu.value === 'settings-manager') {
    window.dispatchEvent(
      new CustomEvent('dev-menu-state-save', {
        detail: {
          menuId: 'settings-manager',
          state: {
            selectedSetting: settingsManagerSelectedSetting.value,
            statistics: settingsManagerStatistics.value,
          },
        },
      }),
    )
  }
}

function handleSettingsManagerStatisticsUpdated(event) {
  settingsManagerStatistics.value = event.detail.statistics || null
  // 상태 저장
  if (activeMenu.value === 'settings-manager') {
    window.dispatchEvent(
      new CustomEvent('dev-menu-state-save', {
        detail: {
          menuId: 'settings-manager',
          state: {
            selectedSetting: settingsManagerSelectedSetting.value,
            statistics: settingsManagerStatistics.value,
          },
        },
      }),
    )
  }
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

// DevOps 상태 저장 헬퍼 함수
function saveDevOpsState() {
  if (activeMenu.value === 'devops') {
    window.dispatchEvent(
      new CustomEvent('dev-menu-state-save', {
        detail: {
          menuId: 'devops',
          state: {
            activeTab: devOpsActiveTab.value,
            selectedBuild: devOpsSelectedBuild.value,
            selectedDeployment: devOpsSelectedDeployment.value,
            selectedEnvironmentVariable: devOpsSelectedEnvironmentVariable.value,
            selectedPackage: devOpsSelectedPackage.value,
          },
        },
      }),
    )
  }
}

// DevOps 핸들러
function handleDevOpsTabChange(event) {
  const { tab } = event.detail
  devOpsActiveTab.value = tab
  // 탭 변경 시 선택 항목 초기화
  devOpsSelectedBuild.value = null
  devOpsSelectedDeployment.value = null
  devOpsSelectedEnvironmentVariable.value = null
  devOpsSelectedPackage.value = null
  // 상태 저장
  saveDevOpsState()
}

function handleDevOpsBuildSelected(event) {
  const { build } = event.detail
  devOpsSelectedBuild.value = build
  // 상태 저장
  saveDevOpsState()
}

function handleDevOpsDeploymentSelected(event) {
  const { deployment } = event.detail
  devOpsSelectedDeployment.value = deployment
  // 상태 저장
  saveDevOpsState()
}

function handleDevOpsEnvironmentVariableSelected(event) {
  const { variable } = event.detail
  devOpsSelectedEnvironmentVariable.value = variable
  // 상태 저장
  saveDevOpsState()
}

function handleDevOpsPackageSelected(event) {
  const { package: packageItem } = event.detail
  devOpsSelectedPackage.value = packageItem
  // 상태 저장
  saveDevOpsState()
}

// 메뉴 메인 페이지로 이동 핸들러
function handleMenuMainPage(event) {
  const menuId = event.detail.menuId
  if (menuId === activeMenu.value) {
    // 현재 메뉴의 메인 페이지로 이동
    if (menuId === 'settings-manager') {
      settingsManagerSelectedSetting.value = null
    } else if (menuId === 'devops') {
      devOpsSelectedBuild.value = null
      devOpsSelectedDeployment.value = null
      devOpsSelectedEnvironmentVariable.value = null
      devOpsSelectedPackage.value = null
      devOpsActiveTab.value = 'build'
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
// 메뉴 상태 복원 함수
function restoreMenuState(menuId, state) {
  if (!state) return

  switch (menuId) {
    case 'settings-manager':
      if (state.selectedSetting) {
        settingsManagerSelectedSetting.value = state.selectedSetting
      }
      if (state.statistics) {
        settingsManagerStatistics.value = state.statistics
      }
      break
    case 'devops':
      if (state.activeTab) {
        devOpsActiveTab.value = state.activeTab
      }
      if (state.selectedBuild) {
        devOpsSelectedBuild.value = state.selectedBuild
      }
      if (state.selectedDeployment) {
        devOpsSelectedDeployment.value = state.selectedDeployment
      }
      if (state.selectedEnvironmentVariable) {
        devOpsSelectedEnvironmentVariable.value = state.selectedEnvironmentVariable
      }
      if (state.selectedPackage) {
        devOpsSelectedPackage.value = state.selectedPackage
      }
      break
    case 'theme-manager':
      if (state.searchQuery !== undefined) {
        themeSearchQuery.value = state.searchQuery
      }
      if (state.categoryFilter !== undefined) {
        themeCategoryFilter.value = state.categoryFilter
      }
      if (state.sortOption) {
        themeSortOption.value = state.sortOption
      }
      break
    // 다른 메뉴들의 상태 복원은 필요시 추가
  }
}

// Active menu 변경 이벤트 리스너
// DevSidebar가 메뉴 상태를 관리하므로, 여기서는 동기화만 수행
function handleActiveMenuChange(event) {
  const newMenu = event.detail.activeMenu
  const restoreState = event.detail.restoreState

  if (activeMenu.value !== newMenu) {
    activeMenu.value = newMenu

    // 메뉴 상태 복원
    if (newMenu && restoreState) {
      restoreMenuState(newMenu, restoreState)
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
  window.addEventListener('devops-tab-change', handleDevOpsTabChange)
  window.addEventListener('devops-build-selected', handleDevOpsBuildSelected)
  window.addEventListener('devops-deployment-selected', handleDevOpsDeploymentSelected)
  window.addEventListener('devops-environment-variable-selected', handleDevOpsEnvironmentVariableSelected)
  window.addEventListener('devops-package-selected', handleDevOpsPackageSelected)

  // DevSidebar가 메뉴 상태를 완전히 관리하므로, 여기서는 이벤트만 수신
  // 초기 메뉴는 DevSidebar에서 dev-menu-changed 이벤트로 전달됨
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  window.removeEventListener('dev-menu-changed', handleActiveMenuChange)
  window.removeEventListener('dev-menu-main-page', handleMenuMainPage)
  window.removeEventListener('theme-manager-search-changed', handleThemeSearchChange)
  window.removeEventListener('theme-manager-filter-changed', handleThemeCategoryFilterChange)
  window.removeEventListener('theme-manager-sort-changed', handleThemeSortChange)
  window.removeEventListener('settings-manager-setting-selected', handleSettingsManagerSettingSelected)
  window.removeEventListener('settings-manager-statistics-updated', handleSettingsManagerStatisticsUpdated)
  window.removeEventListener('settings-manager-setting-updated', handleSettingsManagerSettingUpdated)
  window.removeEventListener('settings-manager-setting-deleted', handleSettingsManagerSettingDeleted)
  window.removeEventListener('devops-tab-change', handleDevOpsTabChange)
  window.removeEventListener('devops-build-selected', handleDevOpsBuildSelected)
  window.removeEventListener('devops-deployment-selected', handleDevOpsDeploymentSelected)
  window.removeEventListener('devops-environment-variable-selected', handleDevOpsEnvironmentVariableSelected)
  window.removeEventListener('devops-package-selected', handleDevOpsPackageSelected)
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
