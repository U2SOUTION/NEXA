<!-- PortfolioSidebar.vue
  포트폴리오 페이지 왼쪽 사이드바
  카테고리 필터 및 제품 검색
-->

<template>
  <div class="portfolio-sidebar">
    <q-list>
      <!-- 헤더 -->
      <div class="sidebar-header q-pa-md">
        <div class="text-h4 text-primary q-mb-xs text-bold">PORTFOLIO</div>
        <div class="text-caption text-grey-7">제품 카탈로그</div>
      </div>

      <q-separator />

      <!-- 검색 -->
      <div class="q-pa-sm">
        <q-input v-model="searchQuery" placeholder="제품명, 설명으로 검색..." outlined dense clearable class="q-mb-sm">
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <q-separator />

      <!-- 카테고리 필터 -->
      <div class="q-pa-sm">
        <div class="text-subtitle2 text-bold q-mb-sm q-px-sm">카테고리</div>
        <q-list>
          <q-item clickable v-ripple @click="selectCategory('industrial')" :active="selectedCategory === 'industrial'">
            <q-item-section avatar>
              <q-icon name="precision_manufacturing" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Industrial Systems</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="selectCategory('living')" :active="selectedCategory === 'living'">
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Living Solutions</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="selectCategory('media')" :active="selectedCategory === 'media'">
            <q-item-section avatar>
              <q-icon name="videocam" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Media & Interaction</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="selectCategory('art')" :active="selectedCategory === 'art'">
            <q-item-section avatar>
              <q-icon name="palette" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Media Art</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <q-separator />

      <!-- 빠른 링크 -->
      <div class="q-pa-sm">
        <div class="text-subtitle2 text-bold q-mb-sm q-px-sm">빠른 링크</div>
        <q-btn flat dense @click="goToGallery" class="btn-nexa-primary q-mb-xs text-bold full-width q-py-xs">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="photo_library" class="q-mr-sm" />
              <span>제품 갤러리</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="goToStories" class="btn-nexa-primary q-mb-xs text-bold full-width q-py-xs">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="history" class="q-mr-sm" />
              <span>제작 스토리</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="goToCases" class="btn-nexa-primary text-bold full-width q-py-xs">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="rate_review" class="q-mr-sm" />
              <span>제작 사례</span>
            </div>
          </template>
        </q-btn>
      </div>
    </q-list>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const searchQuery = ref('')
const selectedCategory = ref('industrial')

function selectCategory(category) {
  selectedCategory.value = category
  // 페이지의 탭도 변경 (emit 또는 store 사용)
  // 현재는 로컬 상태만 관리
}

function goToGallery() {
  // 갤러리 페이지로 이동 (향후 구현)
}

function goToStories() {
  // 스토리 페이지로 이동 (향후 구현)
}

function goToCases() {
  // 사례 페이지로 이동 (향후 구현)
}

// 검색어 변경 시 페이지에 전달 (향후 구현)
watch(searchQuery, () => {
  // 페이지 컴포넌트에 검색어 전달
})
</script>

<style lang="scss" scoped>
.portfolio-sidebar {
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

  .q-item--active {
    background-color: rgba(65, 170, 223, 0.15) !important;
    border-left: 3px solid var(--nexa-button-primary-bg);
  }
}
</style>

