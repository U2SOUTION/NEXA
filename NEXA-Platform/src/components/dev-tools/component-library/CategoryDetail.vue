<!-- CategoryDetail.vue
  카테고리 상세 정보 컴포넌트
-->

<template>
  <div class="category-detail">
    <div v-if="!selectedCategory" class="empty-state q-pa-xl text-center">
      <q-icon name="folder" size="64px" class="q-mb-md" />
      <div class="text-h6">왼쪽에서 카테고리를 선택하세요</div>
    </div>
    <div v-else class="category-detail-content q-pa-md">
      <div class="text-h6 q-mb-md">{{ selectedCategory.displayName }}</div>
      <div class="text-body2">카테고리 상세 정보는 추후 구현 예정입니다.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const selectedCategory = ref(null)

function handleCategorySelected(event) {
  selectedCategory.value = event.detail.category
}

onMounted(() => {
  window.addEventListener('component-library-category-selected', handleCategorySelected)
})

onUnmounted(() => {
  window.removeEventListener('component-library-category-selected', handleCategorySelected)
})
</script>

<style lang="scss" scoped>
.category-detail {
  height: 100%;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--nexa-text-secondary);
}
</style>

