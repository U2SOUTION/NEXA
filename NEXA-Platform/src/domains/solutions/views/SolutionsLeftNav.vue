<!-- SolutionsSidebar.vue
  솔루션 페이지 왼쪽 사이드바
  솔루션 카테고리 네비게이션
-->

<template>
  <div class="solutions-sidebar">
    <q-list>
      <!-- 헤더 -->
      <div class="sidebar-header q-pa-md">
        <div class="text-h4 text-primary q-mb-xs text-bold">SOLUTIONS</div>
        <div class="text-caption text-grey-7">NEXA Platform 기반 솔루션</div>
      </div>

      <q-separator />

      <!-- 솔루션 카테고리 -->
      <div class="q-pa-sm">
        <q-btn flat dense @click="selectCategory('industrial')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': selectedCategory === 'industrial' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="precision_manufacturing" class="q-mr-sm" />
              <span>Industrial Systems</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectCategory('living')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': selectedCategory === 'living' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="home" class="q-mr-sm" />
              <span>Living Solutions</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectCategory('media')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': selectedCategory === 'media' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="videocam" class="q-mr-sm" />
              <span>Media & Interaction</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectCategory('art')" :class="['btn-nexa-primary text-bold full-width q-py-xs', { 'active-menu': selectedCategory === 'art' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="palette" class="q-mr-sm" />
              <span>Media Art</span>
            </div>
          </template>
        </q-btn>
      </div>

      <q-separator />

      <!-- 관련 링크 -->
      <div class="q-pa-sm">
        <div class="text-subtitle2 text-bold q-mb-sm q-px-sm">관련 링크</div>
        <q-btn flat dense @click="goToPortfolio" class="btn-nexa-primary q-mb-xs text-bold full-width q-py-xs">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="folder" class="q-mr-sm" />
              <span>포트폴리오</span>
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
const selectedCategory = ref('industrial')

function selectCategory(category) {
  selectedCategory.value = category
  // 페이지의 탭도 변경 (emit 또는 store 사용)
  // 현재는 로컬 상태만 관리
}

function goToPortfolio() {
  router.push('/portfolio')
}
</script>

<style lang="scss" scoped>
.solutions-sidebar {
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

