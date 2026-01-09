<!-- SettingsManagerSidebar.vue
  설정 관리 왼쪽 사이드바 컴포넌트
  애플리케이션 내부 설정만 관리 (환경변수, 패키지는 DevOps로 이동)
-->

<template>
  <div class="settings-manager-sidebar">
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
  </div>
</template>

<script setup>
import SettingsHeader from './SettingsHeader.vue'
import SettingsList from './SettingsList.vue'

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
})

const emit = defineEmits([
  // 셋팅관리
  'settings-search-change',
  'settings-category-filter-change',
  'settings-type-filter-change',
  'settings-refresh',
  'settings-settings',
  'settings-setting-selected',
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
