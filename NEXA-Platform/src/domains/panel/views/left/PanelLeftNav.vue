<!-- NexaPannelSidebar.vue
  넥사패널 페이지 왼쪽 사이드바
  패널 카테고리 네비게이션
-->

<template>
  <div class="nexa-pannel-sidebar">
    <q-list>
      <!-- 헤더 -->
      <div class="sidebar-header q-pa-md">
        <div class="text-h4 text-primary q-mb-xs text-bold">NEXA PANNEL</div>
        <div class="text-caption text-grey-7">패널 카탈로그 및 관리</div>
      </div>

      <q-separator />

      <!-- 패널 카테고리 -->
      <div class="q-pa-sm">
        <q-btn flat dense @click="selectTab('device')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'device' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="devices" class="q-mr-sm" />
              <span>디바이스 패널</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('project')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'project' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="folder" class="q-mr-sm" />
              <span>프로젝트 패널</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('parts')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'parts' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="inventory_2" class="q-mr-sm" />
              <span>부품 패널</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('other')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'other' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="extension" class="q-mr-sm" />
              <span>기타 패널</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('management')" :class="['btn-nexa-primary text-bold full-width q-py-xs', { 'active-menu': activeTab === 'management' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="settings" class="q-mr-sm" />
              <span>패널 관리</span>
            </div>
          </template>
        </q-btn>
      </div>

      <q-separator />

      <!-- 패널 통계 -->
      <div class="q-pa-sm">
        <div class="text-subtitle2 text-bold q-mb-sm q-px-sm">패널 통계</div>
        <div class="panel-stats q-pa-sm">
          <div class="stat-item q-mb-xs">
            <div class="stat-label text-caption text-grey-6">등록된 패널</div>
            <div class="stat-value text-h6 text-primary">-</div>
          </div>
          <div class="stat-item">
            <div class="stat-label text-caption text-grey-6">사용 중인 패널</div>
            <div class="stat-value text-h6 text-primary">-</div>
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
.nexa-pannel-sidebar {
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

  .panel-stats {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 4px;

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;

      .stat-label {
        opacity: 0.7;
      }

      .stat-value {
        font-weight: 600;
      }
    }
  }
}
</style>

