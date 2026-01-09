<!-- ComponentLibraryList.vue
  컴포넌트 라이브러리 목록 컴포넌트
  탭에 따라 다른 목록 표시 (전체, 시스템, 디렉토리, 체계분석)
-->

<template>
  <q-scroll-area class="component-library-list-scroll-area">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-section q-pa-lg text-center">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-caption">목록을 불러오는 중...</div>
    </div>

    <!-- 시스템 탭 (NEXA 시스템 기준 수동 분류) -->
    <q-list v-else-if="activeTab === 'systems'" separator>
      <template v-for="category in filteredManualCategories" :key="category.name">
        <q-item clickable :active="selectedCategory === category.name" active-class="category-item-active" @click="handleCategoryClick(category)">
          <q-item-section avatar>
            <q-icon :name="category.icon || 'folder'" :color="selectedCategory === category.name ? 'primary' : 'grey-7'" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="category-name">{{ category.displayName || category.name }}</q-item-label>
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
                <q-icon :name="subcategory.icon || 'folder_open'" :color="selectedCategory === subcategory.name ? 'primary' : 'grey-7'" size="18px" />
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

      <div v-if="filteredManualCategories.length === 0" class="empty-section q-pa-lg text-center">
        <q-icon name="category" size="48px" color="grey-7" class="q-mb-md" />
        <div class="text-body2 text-grey-7">
          <span v-if="searchQuery">검색 결과가 없습니다.</span>
          <span v-else>카테고리가 없습니다.</span>
        </div>
      </div>
    </q-list>

    <!-- 디렉토리 탭 (디렉토리 기반 자동 분류) -->
    <q-list v-else-if="activeTab === 'directory'" separator>
      <template v-for="category in filteredCategories" :key="category.name">
        <q-item clickable :active="selectedCategory === category.name" active-class="category-item-active" @click="handleCategoryClick(category)">
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

    <!-- 전체 탭 -->
    <q-list v-else-if="activeTab === 'all'" separator>
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

    <!-- 체계분석 탭 (다차원 분류 + 적합성 평가) -->
    <q-list v-else-if="activeTab === 'analysis'" separator>
      <template v-for="dimension in taxonomyDimensions" :key="dimension.id">
        <q-item clickable :active="selectedDimensionId === dimension.id" active-class="category-item-active" @click="handleDimensionClick(dimension.id)" class="category-item">
          <q-item-section avatar>
            <q-icon :name="dimension.icon" :color="selectedDimensionId === dimension.id ? 'primary' : 'grey-7'" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="category-name">{{ dimension.name }}</q-item-label>
            <q-item-label caption class="category-meta">{{ dimension.description }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-icon v-if="dimension.categories && dimension.categories.length > 0" :name="expandedDimensions[dimension.id] ? 'expand_less' : 'expand_more'" color="grey-7" @click.stop="handleDimensionToggle(dimension.id, !expandedDimensions[dimension.id])" />
            <q-icon v-else name="chevron_right" color="grey-7" />
          </q-item-section>
        </q-item>

        <!-- 차원 내부 카테고리 목록 (확장 시 표시) -->
        <q-slide-transition>
          <div v-show="expandedDimensions[dimension.id] && dimension.categories && dimension.categories.length > 0" class="category-children">
            <q-item v-for="category in dimension.categories" :key="category.id" clickable :active="selectedCategoryId === category.id" active-class="category-item-active subcategory-item" @click="handleTaxonomyCategoryClick(category, dimension.id)" class="subcategory-item">
              <q-item-section avatar>
                <q-icon :name="category.icon" :color="selectedCategoryId === category.id ? 'primary' : 'grey-7'" size="18px" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="category-name">{{ category.name }}</q-item-label>
                <q-item-label caption class="category-meta">{{ category.description }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-icon name="chevron_right" color="grey-7" />
              </q-item-section>
            </q-item>
          </div>
        </q-slide-transition>
      </template>

      <div v-if="taxonomyDimensions.length === 0" class="empty-section q-pa-lg text-center">
        <q-icon name="account_tree" size="48px" color="grey-7" class="q-mb-md" />
        <div class="text-body2 text-grey-7">부류체계 정보가 없습니다.</div>
      </div>
    </q-list>
  </q-scroll-area>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import componentTaxonomy from '@system/config/componentTaxonomy.js'

const props = defineProps({
  activeTab: {
    type: String,
    default: 'all',
  },
  categories: {
    type: Array,
    default: () => [],
  },
  manualCategories: {
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

const emit = defineEmits(['category-selected', 'component-selected', 'dimension-selected', 'taxonomy-category-selected'])

// 상태
const isLoading = ref(false)
const expandedCategories = ref({})

// 부류체계 관련 상태
const selectedDimensionId = ref(null)
const selectedCategoryId = ref(null)
const expandedDimensions = ref({})
const taxonomyDimensions = computed(() => componentTaxonomy.dimensions || [])

// 카테고리에 하위 항목이 있는지 확인
function hasCategoryChildren(category) {
  return (category.subcategories && category.subcategories.length > 0) || (category.components && category.components.length > 0)
}

// 카테고리 클릭 (선택 + 확장/축소)
function handleCategoryClick(category) {
  // 항상 선택 이벤트 발생
  handleCategorySelect(category.name)

  // 하위 항목이 있으면 확장/축소도 처리
  if (hasCategoryChildren(category)) {
    expandedCategories.value[category.name] = !expandedCategories.value[category.name]
  }
}

// 카테고리 토글 (확장/축소만, 아이콘 클릭 시 사용)
function handleCategoryToggle(categoryName) {
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

// 하드코딩된 카테고리 필터링
const filteredManualCategories = computed(() => {
  if (!props.searchQuery) {
    return props.manualCategories
  }
  const query = props.searchQuery.toLowerCase()
  return props.manualCategories.filter((category) => {
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

// 차원 클릭 (부류체계) - 선택 + 확장/축소
function handleDimensionClick(dimensionId) {
  // 항상 선택 이벤트 발생
  selectedDimensionId.value = dimensionId
  emit('dimension-selected', dimensionId)

  // 하위 카테고리가 있으면 확장/축소도 처리
  const dimension = taxonomyDimensions.value.find((dim) => dim.id === dimensionId)
  if (dimension && dimension.categories && dimension.categories.length > 0) {
    expandedDimensions.value[dimensionId] = !expandedDimensions.value[dimensionId]
  }
}

// 차원 토글 (부류체계) - 확장/축소만 (화살표 클릭 시)
function handleDimensionToggle(dimensionId, isExpanded) {
  expandedDimensions.value[dimensionId] = isExpanded
}

// 부류체계 카테고리 클릭
function handleTaxonomyCategoryClick(category, dimensionId) {
  selectedCategoryId.value = category.id
  selectedDimensionId.value = dimensionId
  // 차원 선택 이벤트도 발생 (중간 영역 업데이트용)
  emit('dimension-selected', dimensionId)
  // 카테고리 선택 이벤트 발생 (중간 영역에 상세 정보 표시용)
  emit('taxonomy-category-selected', { category, dimensionId })
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
.component-name,
.dimension-name {
  font-weight: 500;
  color: var(--nexa-text-primary);
}

.dimension-description {
  color: var(--nexa-text-secondary);
  font-size: 0.75rem;
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
.component-item-active,
.dimension-item-active {
  background-color: var(--nexa-surface-hover);
}

.dimension-item {
  border-radius: 4px;
  margin-bottom: 4px;

  &:hover {
    background-color: var(--nexa-surface-hover);
  }
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
