<!-- ErpSidebar.vue
  ERP 페이지 왼쪽 사이드바
  프로젝트, 작업 문서, 일정 등 네비게이션
-->

<template>
  <div class="erp-sidebar">
    <q-list>
      <!-- 헤더 -->
      <div class="sidebar-header q-pa-md">
        <div class="text-h4 text-primary q-mb-xs text-bold">ERP</div>
        <div class="text-caption text-grey-7">프로젝트 및 업무 관리</div>
      </div>

      <q-separator />

      <!-- 메뉴 -->
      <div class="q-pa-sm">
        <q-btn flat dense @click="selectTab('project')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': erpStore.activeSubMenu === 'project' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="folder" class="q-mr-sm" />
              <span>프로젝트</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('work-document')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': erpStore.activeSubMenu === 'work-document' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="description" class="q-mr-sm" />
              <span>작업 문서</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('schedule')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': erpStore.activeSubMenu === 'schedule' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="event" class="q-mr-sm" />
              <span>일정 관리</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('collaboration')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': erpStore.activeSubMenu === 'collaboration' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="chat" class="q-mr-sm" />
              <span>실시간 협업</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('reference')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': erpStore.activeSubMenu === 'reference' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="attach_file" class="q-mr-sm" />
              <span>참고자료</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('logbook')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': erpStore.activeSubMenu === 'logbook' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="book" class="q-mr-sm" />
              <span>로그북</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('parts')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': erpStore.activeSubMenu === 'parts' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="inventory_2" class="q-mr-sm" />
              <span>부품관리</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('finance')" :class="['btn-nexa-primary text-bold full-width q-py-xs', { 'active-menu': erpStore.activeSubMenu === 'finance' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="account_balance" class="q-mr-sm" />
              <span>재무 관리</span>
            </div>
          </template>
        </q-btn>
      </div>

      <q-separator />

      <!-- 프로젝트 요약 -->
      <div class="q-pa-sm">
        <div class="text-subtitle2 text-bold q-mb-sm q-px-sm">프로젝트 요약</div>
        <div class="project-summary q-pa-sm">
          <div class="summary-item q-mb-xs">
            <div class="summary-label text-caption text-grey-6">진행 중</div>
            <div class="summary-value text-h6 text-primary">-</div>
          </div>
          <div class="summary-item">
            <div class="summary-label text-caption text-grey-6">완료</div>
            <div class="summary-value text-h6 text-primary">-</div>
          </div>
        </div>
      </div>
    </q-list>
  </div>
</template>

<script setup>
import { useErpStore } from '@domains/erp/store/erpStore'

const erpStore = useErpStore()

function selectTab(tab) {
  erpStore.setActiveSubMenu(tab)
}
</script>

<style lang="scss" scoped>
.erp-sidebar {
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

  .project-summary {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 4px;

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;

      .summary-label {
        opacity: 0.7;
      }

      .summary-value {
        font-weight: 600;
      }
    }
  }
}
</style>

