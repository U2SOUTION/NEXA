<!-- NexaNodeSidebar.vue
  넥사노드 페이지 왼쪽 사이드바
  노드 에디터 및 자동화 네비게이션
-->

<template>
  <div class="nexa-node-sidebar">
    <q-list>
      <!-- 헤더 -->
      <div class="sidebar-header q-pa-md">
        <div class="text-h4 text-primary q-mb-xs text-bold">NEXA NODE</div>
        <div class="text-caption text-grey-7">자동화 규칙 구상 및 검증</div>
      </div>

      <q-separator />

      <!-- 메뉴 -->
      <div class="q-pa-sm">
        <q-btn flat dense @click="selectTab('basic')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'basic' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="lightbulb" class="q-mr-sm" />
              <span>기본 개념</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('node-types')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'node-types' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="category" class="q-mr-sm" />
              <span>노드 타입</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('global-modules')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'global-modules' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="extension" class="q-mr-sm" />
              <span>전역 모듈</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('workflow')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'workflow' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="work" class="q-mr-sm" />
              <span>작업 관리 시스템</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('goals')" :class="['btn-nexa-primary text-bold full-width q-py-xs', { 'active-menu': activeTab === 'goals' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="flag" class="q-mr-sm" />
              <span>목표 및 효과</span>
            </div>
          </template>
        </q-btn>
      </div>

      <q-separator />

      <!-- 워크플로우 정보 -->
      <div class="q-pa-sm">
        <div class="text-subtitle2 text-bold q-mb-sm q-px-sm">워크플로우</div>
        <div class="workflow-info q-pa-sm">
          <div class="text-caption text-grey-6 q-mb-xs">
            <q-icon name="info" size="14px" class="q-mr-xs" />
            트리거 → 처리 → 액션
          </div>
          <div class="workflow-steps">
            <div class="workflow-step">트리거</div>
            <q-icon name="arrow_forward" size="16px" />
            <div class="workflow-step">처리</div>
            <q-icon name="arrow_forward" size="16px" />
            <div class="workflow-step">액션</div>
          </div>
        </div>
      </div>
    </q-list>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('basic')

function selectTab(tab) {
  activeTab.value = tab
  // 페이지의 탭도 변경 (emit 또는 store 사용)
  // 현재는 로컬 상태만 관리
}
</script>

<style lang="scss" scoped>
.nexa-node-sidebar {
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
      align-items: center;
      justify-content: center;
      gap: 8px;
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

