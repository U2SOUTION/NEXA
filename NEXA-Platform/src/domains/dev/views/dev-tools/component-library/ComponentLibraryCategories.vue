<!-- ComponentLibraryCategories.vue
  컴포넌트 라이브러리 카테고리 목록 컴포넌트
-->

<template>
  <div class="component-library-categories">
    <div class="section-header">
      <q-icon name="folder" size="20px" />
      <h4 class="section-title">카테고리</h4>
    </div>
    <q-list dense>
      <q-item
        v-for="category in filteredCategories"
        :key="category.name"
        clickable
        :active="selectedCategory === category.name"
        @click="handleCategoryClick(category.name)"
        class="category-item"
      >
        <q-item-section avatar>
          <q-icon name="folder" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ category.displayName }}</q-item-label>
          <q-item-label caption>{{ category.components.length }}개</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
  selectedCategory: {
    type: String,
    default: null,
  },
  searchQuery: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['category-selected'])

// 필터링된 카테고리 목록
const filteredCategories = computed(() => {
  if (!props.searchQuery) {
    return props.categories
  }
  const query = props.searchQuery.toLowerCase()
  return props.categories.filter((category) => {
    const name = category.displayName.toLowerCase()
    return name.includes(query) || category.components.some((comp) => comp.name.toLowerCase().includes(query))
  })
})

// 카테고리 클릭
function handleCategoryClick(categoryName) {
  emit('category-selected', categoryName)
}
</script>

<style lang="scss" scoped>
.component-library-categories {
  padding: 1rem;
  border-bottom: 1px solid var(--nexa-border-color);

  .section-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;

    .section-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--nexa-text-primary);
      margin: 0;
      flex: 1;
    }
  }
}

.category-item {
  border-radius: 4px;
  margin-bottom: 0.25rem;

  &.q-item--active {
    background-color: var(--nexa-surface-hover);
  }
}
</style>

