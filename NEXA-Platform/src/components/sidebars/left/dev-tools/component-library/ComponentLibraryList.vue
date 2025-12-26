<!-- ComponentLibraryList.vue
  컴포넌트 라이브러리 컴포넌트 목록 컴포넌트
  선택된 카테고리의 컴포넌트 목록 표시
-->

<template>
  <div v-if="selectedCategory" class="component-library-list">
    <div class="section-header">
      <q-icon name="widgets" size="20px" />
      <h4 class="section-title">컴포넌트</h4>
    </div>
    <q-list dense>
      <q-item
        v-for="component in currentCategoryComponents"
        :key="component.name"
        clickable
        :active="selectedComponent && selectedComponent.name === component.name"
        @click="handleComponentClick(component)"
        class="component-item"
      >
        <q-item-section avatar>
          <q-icon :name="component.icon || 'widgets'" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ component.displayName || component.name }}</q-item-label>
          <q-item-label caption class="component-path">{{ component.path }}</q-item-label>
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
  selectedComponent: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['component-selected'])

// 현재 선택된 카테고리의 컴포넌트 목록
const currentCategoryComponents = computed(() => {
  if (!props.selectedCategory) return []
  const category = props.categories.find((cat) => cat.name === props.selectedCategory)
  return category ? category.components : []
})

// 컴포넌트 클릭
function handleComponentClick(component) {
  emit('component-selected', component)
}
</script>

<style lang="scss" scoped>
.component-library-list {
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

.component-item {
  border-radius: 4px;
  margin-bottom: 0.25rem;

  &.q-item--active {
    background-color: var(--nexa-surface-hover);
  }

  .component-path {
    font-family: monospace;
    font-size: 0.7rem;
    opacity: 0.7;
  }
}
</style>

