<!-- NetworkSidebar.vue
  네트워크 페이지 왼쪽 사이드바
  네트워크 프로토콜별 네비게이션
-->

<template>
  <div class="network-sidebar">
    <q-list>
      <!-- 헤더 -->
      <div class="sidebar-header q-pa-md">
        <div class="text-h4 text-primary q-mb-xs text-bold">NETWORK</div>
        <div class="text-caption text-grey-7">네트워크 구성 및 관리</div>
      </div>

      <q-separator />

      <!-- 네트워크 프로토콜 메뉴 -->
      <div class="q-pa-sm">
        <q-btn flat dense @click="selectTab('wifi')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'wifi' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="wifi" class="q-mr-sm" />
              <span>WiFi 네트워크</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('bus')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'bus' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="router" class="q-mr-sm" />
              <span>켄통신 (BUS)</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('socket')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'socket' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="link" class="q-mr-sm" />
              <span>Socket 연결</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('mqtt')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'mqtt' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="hub" class="q-mr-sm" />
              <span>MQTT 관리</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('monitoring')" :class="['btn-nexa-primary text-bold full-width q-py-xs', { 'active-menu': activeTab === 'monitoring' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="analytics" class="q-mr-sm" />
              <span>네트워크 모니터링</span>
            </div>
          </template>
        </q-btn>
      </div>

      <q-separator />

      <!-- 네트워크 상태 요약 -->
      <div class="q-pa-sm">
        <div class="text-subtitle2 text-bold q-mb-sm q-px-sm">네트워크 상태</div>
        <div class="network-status q-pa-sm">
          <div class="status-item q-mb-xs">
            <div class="status-label text-caption text-grey-6">활성 연결</div>
            <div class="status-value text-h6 text-primary">-</div>
          </div>
          <div class="status-item">
            <div class="status-label text-caption text-grey-6">전체 트래픽</div>
            <div class="status-value text-h6 text-primary">-</div>
          </div>
        </div>
      </div>
    </q-list>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('wifi')

function selectTab(tab) {
  activeTab.value = tab
  // 페이지의 탭도 변경 (emit 또는 store 사용)
  // 현재는 로컬 상태만 관리
}
</script>

<style lang="scss" scoped>
.network-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;

  .sidebar-header {
    background: var(--nexa-surface-header-bg);
    border-bottom: 1px solid var(--nexa-border-color);
  }

  .q-list {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .active-menu {
    background-color: rgba(65, 170, 223, 0.15) !important;
    border-left: 3px solid var(--nexa-button-primary-bg);
  }

  .network-status {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 4px;

    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;

      .status-label {
        opacity: 0.7;
      }

      .status-value {
        font-weight: 600;
      }
    }
  }
}
</style>

