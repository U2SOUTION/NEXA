<!-- TaxonomyDetail.vue
  부류체계 상세 정보 컴포넌트
  componentTaxonomy.js를 기반으로 6가지 차원의 분류 체계 표시
-->

<template>
  <div class="taxonomy-detail">
    <!-- 탭 정보 (차원이 선택되지 않은 경우) -->
    <TabInfo v-if="!selectedDimension" tab-name="analysis" :statistics="statistics" />

    <!-- 차원이 선택된 경우 기존 상세 정보 표시 -->

    <!-- 선택된 차원의 카테고리 목록 -->
    <div v-else class="taxonomy-content-wrapper">
      <!-- 헤더 -->
      <div class="taxonomy-header q-pa-md">
        <div class="row items-center q-gutter-sm">
          <q-icon :name="selectedDimension.icon" size="24px" color="primary" />
          <div class="col">
            <div class="text-h6">{{ selectedDimension.name }}</div>
            <div class="text-caption text-grey-7">{{ selectedDimension.description }}</div>
          </div>
        </div>
      </div>

      <!-- 카테고리 카드 그리드 또는 선택된 카테고리 상세 -->
      <q-scroll-area class="taxonomy-content">
        <div class="dimension-content q-pa-md">
          <!-- 선택된 카테고리 상세 정보 -->
          <div v-if="selectedCategory" class="selected-category-detail">
            <div class="category-detail-header q-mb-md">
              <div class="row items-center q-gutter-sm">
                <q-icon :name="selectedCategory.icon" size="24px" color="primary" />
                <div class="col">
                  <div class="text-h5">{{ selectedCategory.name }}</div>
                  <div class="text-body2 text-grey-7 q-mt-xs">{{ selectedCategory.description }}</div>
                </div>
                <q-btn flat dense icon="close" @click="selectedCategoryId = null" />
              </div>
            </div>

            <!-- 예시 컴포넌트 -->
            <div v-if="selectedCategory.examples && selectedCategory.examples.length > 0" class="info-section q-mb-md">
              <div class="section-title q-mb-sm">
                <q-icon name="code" size="18px" class="q-mr-xs" />
                예시 컴포넌트
              </div>
              <div class="examples-list">
                <q-chip v-for="(example, index) in selectedCategory.examples" :key="index" dense color="primary" text-color="white" size="sm" class="q-mr-xs q-mb-xs">
                  {{ example }}
                </q-chip>
              </div>
            </div>

            <!-- 일반적인 위치 -->
            <div v-if="selectedCategory.typicalLocations && selectedCategory.typicalLocations.length > 0" class="info-section q-mb-md">
              <div class="section-title q-mb-sm">
                <q-icon name="folder" size="18px" class="q-mr-xs" />
                일반적인 위치
              </div>
              <div class="locations-list">
                <q-chip v-for="(location, index) in selectedCategory.typicalLocations" :key="index" dense color="grey-7" text-color="white" size="sm" class="q-mr-xs q-mb-xs">
                  {{ location }}
                </q-chip>
              </div>
            </div>

            <!-- 특징 -->
            <div v-if="selectedCategory.characteristics && selectedCategory.characteristics.length > 0" class="info-section">
              <div class="section-title q-mb-sm">
                <q-icon name="info" size="18px" class="q-mr-xs" />
                특징
              </div>
              <ul class="characteristics-list">
                <li v-for="(characteristic, index) in selectedCategory.characteristics" :key="index" class="text-body2">
                  {{ characteristic }}
                </li>
              </ul>
            </div>
          </div>

          <!-- 카테고리 카드 그리드 (카테고리 미선택 시) -->
          <div v-else class="category-cards-grid">
            <q-card v-for="category in selectedDimension.categories" :key="category.id" clickable :class="['category-card', { 'category-card-active': selectedCategoryId === category.id }]" @click="handleCategoryClick(category)">
              <q-card-section class="category-card-header">
                <div class="row items-center q-gutter-sm">
                  <q-icon :name="category.icon" size="32px" :color="selectedCategoryId === category.id ? 'primary' : 'grey-7'" />
                  <div class="col">
                    <div class="text-h6 category-card-title">{{ category.name }}</div>
                    <div class="text-caption text-grey-7 category-card-description">{{ category.description }}</div>
                  </div>
                </div>
              </q-card-section>

              <q-card-section v-if="category.examples && category.examples.length > 0" class="category-card-examples">
                <div class="text-caption text-grey-7 q-mb-xs">예시:</div>
                <div class="examples-chips">
                  <q-chip v-for="(example, index) in category.examples.slice(0, 3)" :key="index" dense size="sm" color="primary" text-color="white" class="q-mr-xs q-mb-xs">
                    {{ example }}
                  </q-chip>
                  <q-chip v-if="category.examples.length > 3" dense size="sm" color="grey-7" text-color="white" class="q-mr-xs q-mb-xs"> +{{ category.examples.length - 3 }} </q-chip>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- 선택된 카테고리 상세 정보 -->
          <div v-if="selectedCategory" class="category-detail-section q-mt-lg">
            <q-separator class="q-mb-md" />
            <div class="category-detail-header q-mb-md">
              <div class="row items-center q-gutter-sm">
                <q-icon :name="selectedCategory.icon" size="20px" color="primary" />
                <div class="text-h6">{{ selectedCategory.name }}</div>
              </div>
              <div class="text-body2 text-grey-7 q-mt-xs">{{ selectedCategory.description }}</div>
            </div>

            <!-- 예시 컴포넌트 -->
            <div v-if="selectedCategory.examples && selectedCategory.examples.length > 0" class="info-section q-mb-md">
              <div class="section-title q-mb-sm">
                <q-icon name="code" size="16px" class="q-mr-xs" />
                예시 컴포넌트
              </div>
              <div class="examples-list">
                <q-chip v-for="(example, index) in selectedCategory.examples" :key="index" dense color="primary" text-color="white" size="sm" class="q-mr-xs q-mb-xs">
                  {{ example }}
                </q-chip>
              </div>
            </div>

            <!-- 일반적인 위치 -->
            <div v-if="selectedCategory.typicalLocations && selectedCategory.typicalLocations.length > 0" class="info-section q-mb-md">
              <div class="section-title q-mb-sm">
                <q-icon name="folder" size="16px" class="q-mr-xs" />
                일반적인 위치
              </div>
              <div class="locations-list">
                <q-chip v-for="(location, index) in selectedCategory.typicalLocations" :key="index" dense color="grey-7" text-color="white" size="sm" class="q-mr-xs q-mb-xs">
                  {{ location }}
                </q-chip>
              </div>
            </div>

            <!-- 특징 -->
            <div v-if="selectedCategory.characteristics && selectedCategory.characteristics.length > 0" class="info-section">
              <div class="section-title q-mb-sm">
                <q-icon name="info" size="16px" class="q-mr-xs" />
                특징
              </div>
              <ul class="characteristics-list">
                <li v-for="(characteristic, index) in selectedCategory.characteristics" :key="index" class="text-body2">
                  {{ characteristic }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </q-scroll-area>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import componentTaxonomy from 'src/config/componentTaxonomy.js'
import TabInfo from './TabInfo.vue'

const taxonomy = componentTaxonomy

// 선택된 차원 ID (왼쪽 사이드바에서 선택)
const selectedDimensionId = ref(null)

// 통계 데이터 (임시)
const statistics = computed(() => {
  // TODO: 실제 통계 데이터로 교체
  return {
    totalDimensions: { label: '분류 차원', value: '6', description: '6가지 분류 차원' },
    totalCategories: { label: '카테고리 수', value: '0', description: '전체 분류 카테고리' },
    evaluatedComponents: { label: '평가된 컴포넌트', value: '0', description: '적합성 평가 완료' },
  }
})

// 선택된 카테고리 ID
const selectedCategoryId = ref(null)

// 선택된 차원 정보
const selectedDimension = computed(() => {
  return taxonomy.dimensions.find((dim) => dim.id === selectedDimensionId.value) || null
})

// 선택된 카테고리 정보
const selectedCategory = computed(() => {
  if (!selectedDimension.value || !selectedCategoryId.value) return null
  return selectedDimension.value.categories.find((cat) => cat.id === selectedCategoryId.value) || null
})

// 차원 선택 이벤트 리스너
function handleDimensionSelected(event) {
  selectedDimensionId.value = event.detail.dimensionId || null
  selectedCategoryId.value = null // 차원 변경 시 카테고리 선택 초기화
}

// 카테고리 선택 이벤트 리스너 (부류체계에서 카테고리 클릭 시)
function handleTaxonomyCategorySelected(event) {
  const { category, dimensionId } = event.detail || {}
  if (category && dimensionId) {
    selectedDimensionId.value = dimensionId
    selectedCategoryId.value = category.id
  }
}

onMounted(() => {
  window.addEventListener('component-library-dimension-selected', handleDimensionSelected)
  window.addEventListener('component-library-taxonomy-category-selected', handleTaxonomyCategorySelected)
})

onUnmounted(() => {
  window.removeEventListener('component-library-dimension-selected', handleDimensionSelected)
  window.removeEventListener('component-library-taxonomy-category-selected', handleTaxonomyCategorySelected)
})

// 카테고리 클릭 핸들러
function handleCategoryClick(category) {
  if (selectedCategoryId.value === category.id) {
    // 같은 카테고리 클릭 시 선택 해제
    selectedCategoryId.value = null
  } else {
    selectedCategoryId.value = category.id
  }
}
</script>

<style lang="scss" scoped>
.taxonomy-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-background);
}

.taxonomy-content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.taxonomy-header {
  border-bottom: 1px solid var(--nexa-border-color);
  background-color: var(--nexa-surface);
  flex-shrink: 0;
}

.taxonomy-content {
  flex: 1;
  overflow: hidden;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.dimension-content {
  max-width: 1400px;
  margin: 0 auto;
}

.category-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.category-card {
  transition: all 0.2s ease;
  border: 1px solid var(--nexa-border-color);
  background-color: var(--nexa-surface);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--nexa-border-hover);
  }

  &.category-card-active {
    border-color: var(--nexa-button-primary-bg);
    background-color: var(--nexa-surface-hover);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.category-card-header {
  padding-bottom: 0.5rem;
}

.category-card-title {
  font-weight: 600;
  color: var(--nexa-text-primary);
  margin-bottom: 0.25rem;
}

.category-card-description {
  color: var(--nexa-text-secondary);
  font-size: 0.85rem;
  line-height: 1.4;
}

.category-card-examples {
  padding-top: 0.5rem;
  border-top: 1px solid var(--nexa-border-color);
}

.examples-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.category-detail-section {
  padding: 1rem;
  background-color: var(--nexa-surface);
  border-radius: 4px;
  border: 1px solid var(--nexa-border-color);
}

.category-detail-header {
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--nexa-border-color);
}

.info-section {
  padding: 0.75rem;
  background-color: var(--nexa-background);
  border-radius: 4px;
  border: 1px solid var(--nexa-border-color);
}

.section-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--nexa-text-primary);
  font-size: 0.9rem;
}

.examples-list,
.locations-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.characteristics-list {
  margin: 0;
  padding-left: 1.5rem;
  color: var(--nexa-text-secondary);

  li {
    margin-bottom: 0.25rem;
  }
}
</style>
