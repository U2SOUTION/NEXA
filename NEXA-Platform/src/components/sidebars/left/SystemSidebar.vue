<!-- SystemSidebar.vue
  시스템 페이지 왼쪽 사이드바
  디바이스 등록, 시스템 상태, AGW, 모니터링 네비게이션
-->

<template>
  <div class="system-sidebar">
    <q-list>
      <!-- 헤더 -->
      <div class="sidebar-header q-pa-md">
        <div class="text-h4 text-primary q-mb-xs text-bold">SYSTEM</div>
        <div class="text-caption text-grey-7">디바이스 및 시스템 관리</div>
      </div>

      <q-separator />

      <!-- 메뉴 -->
      <div class="q-pa-sm">
        <q-btn flat dense @click="selectTab('device')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'device' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="devices_other" class="q-mr-sm" />
              <span>디바이스 등록</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('status')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'status' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="monitor_heart" class="q-mr-sm" />
              <span>시스템 상태</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('agw')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'agw' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="dns" class="q-mr-sm" />
              <span>AGW System</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('monitoring')" :class="['btn-nexa-primary text-bold full-width q-py-xs', { 'active-menu': activeTab === 'monitoring' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="timeline" class="q-mr-sm" />
              <span>실시간 모니터링</span>
            </div>
          </template>
        </q-btn>
      </div>

      <q-separator />

      <!-- 워크플로우 안내 -->
      <div class="q-pa-sm">
        <div class="text-subtitle2 text-bold q-mb-sm q-px-sm">워크플로우</div>
        <div class="workflow-info q-pa-sm">
          <div class="text-caption text-grey-6 q-mb-xs">
            <q-icon name="info" size="14px" class="q-mr-xs" />
            자동화 기반
          </div>
          <div class="workflow-steps">
            <div class="workflow-step">SYSTEM</div>
            <q-icon name="arrow_downward" size="16px" />
            <div class="workflow-step">ERP</div>
            <q-icon name="arrow_downward" size="16px" />
            <div class="workflow-step">NODE</div>
            <q-icon name="arrow_downward" size="16px" />
            <div class="workflow-step">BOARD</div>
          </div>
        </div>
      </div>
    </q-list>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('device')

function selectTab(tab) {
  activeTab.value = tab
  // 페이지의 탭도 변경 (emit 또는 store 사용)
  // 현재는 로컬 상태만 관리
}
</script>

<style lang="scss" scoped>
.system-sidebar {
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

  .workflow-info {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 4px;

    .workflow-steps {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      margin-top: 8px;

      .workflow-step {
        font-size: 11px;
        padding: 4px 8px;
        background: rgba(65, 170, 223, 0.2);
        border-radius: 4px;
        color: var(--q-primary);
      }
    }
  }
}
</style>

