<!-- ComponentLibraryList.vue
  컴포넌트 라이브러리 목록 컴포넌트
  탭에 따라 다른 목록 표시 (카테고리, 컴포넌트, 부류체계)
-->

<template>
  <q-scroll-area class="component-library-list-scroll-area">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-section q-pa-lg text-center">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-caption">목록을 불러오는 중...</div>
    </div>

    <!-- 카테고리 탭 -->
    <q-list v-else-if="activeTab === 'categories'" separator>
      <template v-for="category in filteredCategories" :key="category.name">
        <q-item clickable :active="selectedCategory === category.name" active-class="category-item-active" @click="handleCategoryToggle(category.name)">
          <q-item-section avatar>
            <q-icon name="folder" :color="selectedCategory === category.name ? 'primary' : 'grey-7'" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="category-name">{{ category.displayName }}</q-item-label>
            <q-item-label caption class="category-meta">
              <span v-if="category.components">{{ category.components.length }}개 컴포넌트</span>
              <span v-if="category.subcategories && category.subcategories.length > 0" class="q-ml-sm">{{ category.subcategories.length }}개 하위 카테고리</span>
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-icon v-if="hasCategoryChildren(category)" :name="expandedCategories[category.name] ? 'expand_less' : 'expand_more'" color="grey-7" @click.stop="handleCategoryToggle(category.name)" />
            <q-icon v-else name="chevron_right" color="grey-7" />
          </q-item-section>
        </q-item>

        <!-- 하위 카테고리 및 컴포넌트 (확장 시 표시) -->
        <q-slide-transition>
          <div v-show="expandedCategories[category.name] && hasCategoryChildren(category)" class="category-children">
            <!-- 하위 카테고리 -->
            <q-item v-for="subcategory in category.subcategories" :key="subcategory.name" clickable :active="selectedCategory === subcategory.name" active-class="category-item-active subcategory-item" @click="handleCategorySelect(subcategory.name)" class="subcategory-item">
              <q-item-section avatar>
                <q-icon name="folder_open" :color="selectedCategory === subcategory.name ? 'primary' : 'grey-7'" size="18px" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="category-name">{{ subcategory.displayName || subcategory.name }}</q-item-label>
                <q-item-label caption class="category-meta">
                  <span v-if="subcategory.components">{{ subcategory.components.length }}개 컴포넌트</span>
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-icon name="chevron_right" color="grey-7" />
              </q-item-section>
            </q-item>

            <!-- 컴포넌트 목록 -->
            <q-item v-for="component in category.components" :key="component.name" clickable :active="selectedComponent && selectedComponent.name === component.name" active-class="component-item-active" @click="handleComponentSelect(component)" class="component-item">
              <q-item-section avatar>
                <q-icon v-if="component.icon" :name="component.icon" :color="selectedComponent && selectedComponent.name === component.name ? 'primary' : 'grey-7'" size="18px" />
                <q-icon v-else name="widgets" :color="selectedComponent && selectedComponent.name === component.name ? 'primary' : 'grey-7'" size="18px" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="component-name">{{ component.displayName || component.name }}</q-item-label>
                <q-item-label caption class="component-meta">
                  <span class="component-path">{{ component.path }}</span>
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-icon name="chevron_right" color="grey-7" />
              </q-item-section>
            </q-item>
          </div>
        </q-slide-transition>
      </template>

      <div v-if="filteredCategories.length === 0" class="empty-section q-pa-lg text-center">
        <q-icon name="folder" size="48px" color="grey-7" class="q-mb-md" />
        <div class="text-body2 text-grey-7">
          <span v-if="searchQuery">검색 결과가 없습니다.</span>
          <span v-else>카테고리가 없습니다.</span>
        </div>
      </div>
    </q-list>

    <!-- 컴포넌트 탭 -->
    <q-list v-else-if="activeTab === 'components'" separator>
      <q-item v-for="component in filteredComponents" :key="component.name" clickable :active="selectedComponent && selectedComponent.name === component.name" active-class="component-item-active" @click="handleComponentSelect(component)">
        <q-item-section avatar>
          <q-icon v-if="component.icon" :name="component.icon" :color="selectedComponent && selectedComponent.name === component.name ? 'primary' : 'grey-7'" />
          <q-icon v-else name="widgets" :color="selectedComponent && selectedComponent.name === component.name ? 'primary' : 'grey-7'" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="component-name">{{ component.displayName || component.name }}</q-item-label>
          <q-item-label caption class="component-meta">
            <span class="component-path">{{ component.path }}</span>
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-icon name="chevron_right" color="grey-7" />
        </q-item-section>
      </q-item>

      <div v-if="filteredComponents.length === 0" class="empty-section q-pa-lg text-center">
        <q-icon name="widgets" size="48px" color="grey-7" class="q-mb-md" />
        <div class="text-body2 text-grey-7">
          <span v-if="searchQuery">검색 결과가 없습니다.</span>
          <span v-else>컴포넌트가 없습니다.</span>
        </div>
      </div>
    </q-list>

    <!-- 부류체계 탭 -->
    <q-list v-else-if="activeTab === 'taxonomy'" separator>
      <div class="empty-section q-pa-lg text-center">
        <q-icon name="account_tree" size="48px" color="grey-7" class="q-mb-md" />
        <div class="text-body2 text-grey-7">부류체계는 추후 구현 예정입니다.</div>
      </div>
    </q-list>
  </q-scroll-area>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  activeTab: {
    type: String,
    default: 'categories',
  },
  categories: {
    type: Array,
    default: () => [],
  },
  components: {
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
  searchQuery: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['category-selected', 'component-selected'])

// 상태
const isLoading = ref(false)
const expandedCategories = ref({})

// 카테고리에 하위 항목이 있는지 확인
function hasCategoryChildren(category) {
  return (category.subcategories && category.subcategories.length > 0) || (category.components && category.components.length > 0)
}

// 카테고리 토글 (확장/축소)
function handleCategoryToggle(categoryName) {
  const category = props.categories.find((cat) => cat.name === categoryName)
  if (!category || !hasCategoryChildren(category)) {
    // 하위 항목이 없으면 선택만 처리
    handleCategorySelect(categoryName)
    return
  }

  // 확장/축소 토글
  expandedCategories.value[categoryName] = !expandedCategories.value[categoryName]
}

// 필터링된 목록
const filteredCategories = computed(() => {
  if (!props.searchQuery) {
    return props.categories
  }
  const query = props.searchQuery.toLowerCase()
  return props.categories.filter((category) => {
    const name = (category.displayName || category.name).toLowerCase()
    return name.includes(query)
  })
})

const filteredComponents = computed(() => {
  if (!props.searchQuery) {
    return props.components
  }
  const query = props.searchQuery.toLowerCase()
  return props.components.filter((component) => {
    const name = (component.displayName || component.name).toLowerCase()
    const path = (component.path || '').toLowerCase()
    return name.includes(query) || path.includes(query)
  })
})

// 카테고리 선택
function handleCategorySelect(categoryName) {
  emit('category-selected', categoryName)
}

// 컴포넌트 선택
function handleComponentSelect(component) {
  emit('component-selected', component)
}
</script>

<style lang="scss" scoped>
.component-library-list-scroll-area {
  height: 100%;
}

.loading-section,
.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.category-name,
.component-name {
  font-weight: 500;
  color: var(--nexa-text-primary);
}

.category-meta,
.component-meta {
  color: var(--nexa-text-secondary);
  font-size: 0.75rem;
}

.component-path {
  font-family: monospace;
  font-size: 0.7rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-item-active,
.component-item-active {
  background-color: var(--nexa-surface-hover);
}

.category-children {
  padding-left: 1rem;
  background-color: var(--nexa-background);
}

.subcategory-item {
  padding-left: 0.5rem;
}

.component-item {
  padding-left: 0.5rem;
}
</style>
