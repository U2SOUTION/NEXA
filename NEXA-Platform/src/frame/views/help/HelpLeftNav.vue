<!-- HelpSidebar.vue
  도움말 페이지 왼쪽 사이드바
  가이드, 튜토리얼, FAQ 등 네비게이션
-->

<template>
  <div class="help-sidebar">
    <q-list>
      <!-- 헤더 -->
      <div class="sidebar-header q-pa-md">
        <div class="text-h4 text-primary q-mb-xs text-bold">HELP</div>
        <div class="text-caption text-grey-7">사용 가이드 및 지원</div>
      </div>

      <q-separator />

      <!-- 도움말 메뉴 -->
      <div class="q-pa-sm">
        <q-btn flat dense @click="selectTab('guide')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'guide' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="menu_book" class="q-mr-sm" />
              <span>사용 가이드</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('tutorial')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'tutorial' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="school" class="q-mr-sm" />
              <span>튜토리얼</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('faq')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'faq' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="help_outline" class="q-mr-sm" />
              <span>FAQ</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('api')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'api' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="code" class="q-mr-sm" />
              <span>API 문서</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('feedback')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'feedback' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="feedback" class="q-mr-sm" />
              <span>피드백/문의</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('version')" :class="['btn-nexa-primary text-bold full-width q-py-xs', { 'active-menu': activeTab === 'version' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="info" class="q-mr-sm" />
              <span>버전 정보</span>
            </div>
          </template>
        </q-btn>
      </div>

      <q-separator />

      <!-- 빠른 링크 -->
      <div class="q-pa-sm">
        <div class="text-subtitle2 text-bold q-mb-sm q-px-sm">빠른 링크</div>
        <q-btn flat dense @click="goToSettings" class="btn-nexa-primary q-mb-xs text-bold full-width q-py-xs">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="settings" class="q-mr-sm" />
              <span>설정</span>
            </div>
          </template>
        </q-btn>
      </div>
    </q-list>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('guide')

function selectTab(tab) {
  activeTab.value = tab
  // 페이지의 탭도 변경 (emit 또는 store 사용)
  // 현재는 로컬 상태만 관리
}

function goToSettings() {
  router.push('/settings')
}
</script>

<style lang="scss" scoped>
.help-sidebar {
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
}
</style>

