<!-- MySidebar.vue
  마이페이지 왼쪽 사이드바
  프로필, 디바이스, 장비, 설정 네비게이션
-->

<template>
  <div class="my-sidebar">
    <q-list>
      <!-- 헤더 -->
      <div class="sidebar-header q-pa-md">
        <div class="text-h4 text-primary q-mb-xs text-bold">MY</div>
        <div class="text-caption text-grey-7">내 정보 및 기기 관리</div>
      </div>

      <q-separator />

      <!-- 메뉴 -->
      <div class="q-pa-sm">
        <q-btn flat dense @click="selectTab('profile')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'profile' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="account_circle" class="q-mr-sm" />
              <span>내 정보</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('devices')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'devices' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="devices_other" class="q-mr-sm" />
              <span>등록한 디바이스</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('equipment')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'equipment' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="precision_manufacturing" class="q-mr-sm" />
              <span>등록한 제작 장비</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('settings')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'settings' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="settings" class="q-mr-sm" />
              <span>내 기기 설정</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('logout')" :class="['btn-nexa-primary text-bold full-width q-py-xs', { 'active-menu': activeTab === 'logout' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="logout" class="q-mr-sm" />
              <span>로그아웃</span>
            </div>
          </template>
        </q-btn>
      </div>

      <q-separator />

      <!-- 계정 정보 -->
      <div class="q-pa-sm">
        <div class="text-subtitle2 text-bold q-mb-sm q-px-sm">계정 정보</div>
        <div class="account-info q-pa-sm">
          <div class="text-caption text-grey-6 q-mb-xs">사용자</div>
          <div class="text-body2 text-primary">-</div>
        </div>
      </div>
    </q-list>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('profile')

function selectTab(tab) {
  activeTab.value = tab
  // 페이지의 탭도 변경 (emit 또는 store 사용)
  // 현재는 로컬 상태만 관리
}
</script>

<style lang="scss" scoped>
.my-sidebar {
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

  .account-info {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 4px;
  }
}
</style>

