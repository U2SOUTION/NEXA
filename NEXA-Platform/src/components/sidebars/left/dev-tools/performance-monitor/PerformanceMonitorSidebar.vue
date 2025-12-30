<!-- PerformanceMonitorSidebar.vue
  성능 모니터 왼쪽 사이드바 통합 컴포넌트
  탭 구조: MONITOR, API, NETWORK, ERROR
  헤더 + 목록
-->

<template>
  <div class="performance-monitor-sidebar">
    <!-- 탭 메뉴 -->
    <div class="sidebar-tabs q-pa-sm">
      <q-tabs v-model="activeTab" dense class="text-grey" active-color="primary" indicator-color="primary" align="left">
        <q-tab name="performance" label="MONITOR" icon="speed" />
        <q-tab name="api-tester" label="API" icon="api" />
        <q-tab name="network" label="NETWORK" icon="network_check" />
        <q-tab name="error-tracking" label="ERROR" icon="bug_report" />
      </q-tabs>
    </div>

    <!-- 성능 MONITOR 탭 -->
    <template v-if="activeTab === 'performance'">
      <PerformanceMonitorHeader
        :is-monitoring="isMonitoring"
        @refresh="handleRefresh"
        @monitoring-toggle="handleMonitoringToggle"
        @settings="handleSettings"
      />
      <PerformanceMonitorList
        :metrics="performanceMetrics"
        :is-loading="isLoading"
        @metric-selected="handleMetricSelected"
      />
    </template>

    <!-- API TESTER 탭 -->
    <template v-else-if="activeTab === 'api-tester'">
      <ApiTesterHeader
        @refresh="handleApiTesterRefresh"
        @search-change="handleApiTesterSearchChange"
        @settings="handleApiTesterSettings"
      />
      <ApiTesterList
        :requests="apiRequests"
        :selected-request="selectedApiRequest"
        :is-loading="isLoading"
        @request-selected="handleApiRequestSelected"
      />
    </template>

    <!-- NETWORK 탭 -->
    <template v-else-if="activeTab === 'network'">
      <NetworkHeader
        :total-requests="networkStatistics.total"
        :active-requests="networkStatistics.active"
        @refresh="handleNetworkRefresh"
        @search-change="handleNetworkSearchChange"
        @filter-change="handleNetworkFilterChange"
        @settings="handleNetworkSettings"
      />
      <NetworkList
        :requests="networkRequests"
        :selected-request="selectedNetworkRequest"
        :is-loading="isLoading"
        @request-selected="handleNetworkRequestSelected"
      />
    </template>

    <!-- ERROR TRACKING 탭 -->
    <template v-else-if="activeTab === 'error-tracking'">
      <ErrorTrackingSidebar
        :errors="errors"
        :filtered-errors="filteredErrors"
        :selected-error="selectedError"
        :search-query="searchQuery"
        :is-collecting="isCollecting"
        :is-loading="errorTrackingIsLoading"
        :statistics="statistics"
        @refresh="handleErrorTrackingRefresh"
        @search-change="handleErrorTrackingSearchChange"
        @settings="handleErrorTrackingSettings"
        @filter-change="handleErrorTrackingFilterChange"
        @sort-change="handleErrorTrackingSortChange"
        @collecting-toggle="handleErrorTrackingCollectingToggle"
        @error-selected="handleErrorTrackingErrorSelected"
        @tab-change="handleErrorTrackingTabChange"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import PerformanceMonitorHeader from './PerformanceMonitorHeader.vue'
import PerformanceMonitorList from './PerformanceMonitorList.vue'
import ApiTesterHeader from './ApiTesterHeader.vue'
import ApiTesterList from './ApiTesterList.vue'
import NetworkHeader from './NetworkHeader.vue'
import NetworkList from './NetworkList.vue'
import ErrorTrackingSidebar from '../error-tracking/ErrorTrackingSidebar.vue'

// 활성 탭
const activeTab = ref('performance')

// Props
defineProps({
  // 성능 모니터 관련
  isMonitoring: {
    type: Boolean,
    default: false,
  },
  performanceMetrics: {
    type: Array,
    default: () => [],
  },
  // API 테스터 관련
  apiRequests: {
    type: Array,
    default: () => [],
  },
  selectedApiRequest: {
    type: Object,
    default: null,
  },
  // 네트워크 관련
  networkRequests: {
    type: Array,
    default: () => [],
  },
  selectedNetworkRequest: {
    type: Object,
    default: null,
  },
  networkStatistics: {
    type: Object,
    default: () => ({
      total: 0,
      active: 0,
    }),
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  // 에러 트래킹 관련
  errors: {
    type: Array,
    default: () => [],
  },
  filteredErrors: {
    type: Array,
    default: () => [],
  },
  selectedError: {
    type: Object,
    default: null,
  },
  searchQuery: {
    type: String,
    default: '',
  },
  isCollecting: {
    type: Boolean,
    default: true,
  },
  statistics: {
    type: Object,
    default: () => ({
      total: 0,
      new: 0,
      resolved: 0,
      ignored: 0,
      today: 0,
    }),
  },
  // 에러 트래킹 isLoading (ErrorTrackingSidebar에서 사용)
  errorTrackingIsLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  // 성능 모니터
  'refresh',
  'monitoring-toggle',
  'settings',
  'metric-selected',
  // API 테스터
  'api-tester-refresh',
  'api-tester-search-change',
  'api-tester-settings',
  'api-request-selected',
  // 네트워크
  'network-refresh',
  'network-search-change',
  'network-filter-change',
  'network-settings',
  'network-request-selected',
  // 에러 트래킹
  'error-tracking-refresh',
  'error-tracking-search-change',
  'error-tracking-settings',
  'error-tracking-filter-change',
  'error-tracking-sort-change',
  'error-tracking-collecting-toggle',
  'error-tracking-error-selected',
  'error-tracking-tab-change',
  // 탭 변경
  'tab-change',
])

// 성능 모니터 핸들러
function handleRefresh() {
  emit('refresh')
}

function handleMonitoringToggle(enabled) {
  emit('monitoring-toggle', enabled)
}

function handleSettings() {
  emit('settings')
}

function handleMetricSelected(metric) {
  emit('metric-selected', metric)
}

// API 테스터 핸들러
function handleApiTesterRefresh() {
  emit('api-tester-refresh')
}

function handleApiTesterSearchChange(value) {
  emit('api-tester-search-change', value)
}

function handleApiTesterSettings() {
  emit('api-tester-settings')
}

function handleApiRequestSelected(request) {
  emit('api-request-selected', request)
}

// 네트워크 핸들러
function handleNetworkRefresh() {
  emit('network-refresh')
}

function handleNetworkSearchChange(value) {
  emit('network-search-change', value)
}

function handleNetworkFilterChange(filters) {
  emit('network-filter-change', filters)
}

function handleNetworkSettings() {
  emit('network-settings')
}

function handleNetworkRequestSelected(request) {
  emit('network-request-selected', request)
}

// 에러 트래킹 핸들러
function handleErrorTrackingRefresh() {
  emit('error-tracking-refresh')
}

function handleErrorTrackingSearchChange(value) {
  emit('error-tracking-search-change', value)
}

function handleErrorTrackingSettings() {
  emit('error-tracking-settings')
}

function handleErrorTrackingFilterChange(filters) {
  emit('error-tracking-filter-change', filters)
}

function handleErrorTrackingSortChange(option) {
  emit('error-tracking-sort-change', option)
}

function handleErrorTrackingCollectingToggle(enabled) {
  emit('error-tracking-collecting-toggle', enabled)
}

function handleErrorTrackingErrorSelected(error) {
  emit('error-tracking-error-selected', error)
}

function handleErrorTrackingTabChange(tab) {
  emit('error-tracking-tab-change', tab)
}

// 탭 변경 감지
watch(activeTab, (newTab) => {
  emit('tab-change', newTab)
})
</script>

<style lang="scss" scoped>
.performance-monitor-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-surface);

  // Container Query 활성화 (사이드바 너비 기준)
  container-type: inline-size;
  container-name: performance-monitor-sidebar;
}

.sidebar-tabs {
  background: var(--nexa-background-darker);
  border-bottom: 1px solid var(--nexa-border-color);
}
</style>
