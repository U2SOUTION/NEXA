<!-- SettingsManagerSidebar.vue
  설정 관리 왼쪽 사이드바 통합 컴포넌트
  탭 구조: 셋팅관리, 환경변수, 패키지
  헤더 + 목록
-->

<template>
  <div class="settings-manager-sidebar">
    <!-- 탭 메뉴 -->
    <div class="sidebar-tabs q-pa-sm">
      <q-tabs v-model="activeTab" dense class="text-grey" active-color="primary" indicator-color="primary" align="left">
        <q-tab name="settings" label="셋팅관리" icon="settings" />
        <q-tab name="environment-variables" label="환경변수" icon="tune" />
        <q-tab name="package-manager" label="패키지" icon="inventory_2" />
      </q-tabs>
    </div>

    <!-- 셋팅관리 탭 -->
    <template v-if="activeTab === 'settings'">
      <SettingsHeader
        :header-hovered="props.headerHovered"
        :search-query="props.settingsSearchQuery"
        :filter-category="props.settingsFilterCategory"
        :filter-type="props.settingsFilterType"
        :categories="props.settingsCategories"
        :types="props.settingsTypes"
        :is-loading="props.settingsIsLoading"
        @search-change="handleSettingsSearchChange"
        @category-filter-change="handleSettingsCategoryFilterChange"
        @type-filter-change="handleSettingsTypeFilterChange"
        @refresh="handleSettingsRefresh"
        @settings="handleSettingsSettings"
      />
      <SettingsList
        :filtered-settings="props.settingsFilteredSettings"
        :selected-setting="props.settingsSelectedSetting"
        :is-loading="props.settingsIsLoading"
        @setting-selected="handleSettingsSettingSelected"
      />
    </template>

    <!-- 환경변수 탭 -->
    <template v-else-if="activeTab === 'environment-variables'">
      <EnvironmentVariablesHeader
        @refresh="handleEnvironmentVariablesRefresh"
        @search-change="handleEnvironmentVariablesSearchChange"
        @settings="handleEnvironmentVariablesSettings"
      />
      <EnvironmentVariablesList
        :variables="props.environmentVariables"
        :selected-variable="props.environmentVariablesSelectedVariable"
        :is-loading="props.environmentVariablesIsLoading"
        @variable-selected="handleEnvironmentVariableSelected"
      />
    </template>

    <!-- 패키지 탭 -->
    <template v-else-if="activeTab === 'package-manager'">
      <PackageManagerHeader
        @refresh="handlePackageManagerRefresh"
        @search-change="handlePackageManagerSearchChange"
        @settings="handlePackageManagerSettings"
      />
      <PackageManagerList
        :packages="props.packages"
        :selected-package="props.packagesSelectedPackage"
        :is-loading="props.packagesIsLoading"
        @package-selected="handlePackageSelected"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import SettingsHeader from './SettingsHeader.vue'
import SettingsList from './SettingsList.vue'
import EnvironmentVariablesHeader from './EnvironmentVariablesHeader.vue'
import EnvironmentVariablesList from './EnvironmentVariablesList.vue'
import PackageManagerHeader from './PackageManagerHeader.vue'
import PackageManagerList from './PackageManagerList.vue'

// 활성 탭
const activeTab = ref('settings')

// Props
const props = defineProps({
  // 헤더 호버 상태
  headerHovered: {
    type: Boolean,
    default: false,
  },
  // 셋팅관리 관련
  settingsSearchQuery: {
    type: String,
    default: '',
  },
  settingsFilterCategory: {
    type: String,
    default: '',
  },
  settingsFilterType: {
    type: String,
    default: '',
  },
  settingsCategories: {
    type: Array,
    default: () => [],
  },
  settingsTypes: {
    type: Array,
    default: () => [],
  },
  settingsFilteredSettings: {
    type: Array,
    default: () => [],
  },
  settingsSelectedSetting: {
    type: Object,
    default: null,
  },
  settingsIsLoading: {
    type: Boolean,
    default: false,
  },
  // 환경변수 관련
  environmentVariables: {
    type: Array,
    default: () => [],
  },
  environmentVariablesSelectedVariable: {
    type: Object,
    default: null,
  },
  environmentVariablesIsLoading: {
    type: Boolean,
    default: false,
  },
  // 패키지 관련
  packages: {
    type: Array,
    default: () => [],
  },
  packagesSelectedPackage: {
    type: Object,
    default: null,
  },
  packagesIsLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  // 셋팅관리
  'settings-search-change',
  'settings-category-filter-change',
  'settings-type-filter-change',
  'settings-refresh',
  'settings-settings',
  'settings-setting-selected',
  // 환경변수
  'environment-variables-refresh',
  'environment-variables-search-change',
  'environment-variables-settings',
  'environment-variable-selected',
  // 패키지
  'package-manager-refresh',
  'package-manager-search-change',
  'package-manager-settings',
  'package-selected',
  // 탭 변경
  'tab-change',
])

// 셋팅관리 핸들러
function handleSettingsSearchChange(value) {
  emit('settings-search-change', value)
}

function handleSettingsCategoryFilterChange(category) {
  emit('settings-category-filter-change', category)
}

function handleSettingsTypeFilterChange(type) {
  emit('settings-type-filter-change', type)
}

function handleSettingsRefresh() {
  emit('settings-refresh')
}

function handleSettingsSettings() {
  emit('settings-settings')
}

function handleSettingsSettingSelected(setting) {
  emit('settings-setting-selected', setting)
}

// 환경변수 핸들러
function handleEnvironmentVariablesRefresh() {
  emit('environment-variables-refresh')
}

function handleEnvironmentVariablesSearchChange(value) {
  emit('environment-variables-search-change', value)
}

function handleEnvironmentVariablesSettings() {
  emit('environment-variables-settings')
}

function handleEnvironmentVariableSelected(variable) {
  emit('environment-variable-selected', variable)
}

// 패키지 핸들러
function handlePackageManagerRefresh() {
  emit('package-manager-refresh')
}

function handlePackageManagerSearchChange(value) {
  emit('package-manager-search-change', value)
}

function handlePackageManagerSettings() {
  emit('package-manager-settings')
}

function handlePackageSelected(packageItem) {
  emit('package-selected', packageItem)
}

// 탭 변경 감지
watch(activeTab, (newTab) => {
  emit('tab-change', newTab)
})
</script>

<style lang="scss" scoped>
.settings-manager-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-surface);

  // Container Query 활성화 (사이드바 너비 기준)
  container-type: inline-size;
  container-name: settings-manager-sidebar;
}

.sidebar-tabs {
  background: var(--nexa-background-darker);
  border-bottom: 1px solid var(--nexa-border-color);
}
</style>
