<template>
  <div class="component-library-content">
    <!-- 메인 컨텐츠: 탭에 따라 다른 컴포넌트 표시 -->
    <div class="component-library-main">
      <!-- 카테고리 상세 -->
      <CategoryDetail v-if="activeTab === 'categories'" />

      <!-- 컴포넌트 상세 -->
      <ComponentDetail v-else-if="activeTab === 'components'" />

      <!-- 부류체계 상세 -->
      <TaxonomyDetail v-else-if="activeTab === 'taxonomy'" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import CategoryDetail from './CategoryDetail.vue'
import ComponentDetail from './ComponentDetail.vue'
import TaxonomyDetail from './TaxonomyDetail.vue'

// 탭 상태
const activeTab = ref('categories')

// 탭 변경 이벤트 리스너
function handleTabChanged(event) {
  activeTab.value = event.detail.tab || 'categories'
}

onMounted(() => {
  window.addEventListener('component-library-tab-changed', handleTabChanged)
})

onUnmounted(() => {
  window.removeEventListener('component-library-tab-changed', handleTabChanged)
})
</script>

<style lang="scss" scoped>
.component-library-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-background);
}

.component-library-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
