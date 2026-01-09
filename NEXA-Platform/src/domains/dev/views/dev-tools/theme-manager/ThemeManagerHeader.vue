<!-- ThemeManagerHeader.vue
  테마 관리 헤더 컴포넌트
  검색, 필터, 통계 분석 버튼 등 포함
-->
<template>
  <div class="theme-manager-header">
    <div class="header-section q-px-sm q-pt-sm q-pb-none">
      <!-- 테마 선택 토글 -->
      <div class="row items-center justify-between q-gutter-sm q-mb-sm">
        <q-btn-toggle
          v-model="selectedTheme"
          :options="[
            { label: '라이트', value: 'light', icon: 'light_mode' },
            { label: '다크', value: 'dark', icon: 'dark_mode' },
          ]"
          toggle-color="primary"
          dense
          @update:model-value="handleThemeChange"
        />
        <q-checkbox v-model="removeDashOnCopy" label="Strip" dense @update:model-value="handleRemoveDashChange" />
      </div>

      <!-- 검색 및 필터 -->
      <div class="row items-center q-gutter-sm q-mb-sm">
        <q-input v-model="searchQuery" placeholder="색상 검색..." dense outlined clearable class="search-input">
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <!-- 필터 및 정렬 -->
      <div class="row q-gutter-sm q-mb-sm">
        <!-- 필터 드롭다운 -->
        <div class="col">
          <q-select
            v-model="selectedCategory"
            :options="categoryOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            dense
            outlined
            clearable
            placeholder="카테고리 필터"
            class="filter-select"
            @update:model-value="handleCategoryFilterChange"
          >
            <template v-slot:prepend>
              <q-icon name="filter_alt" />
            </template>
          </q-select>
        </div>
        <!-- 정렬 드롭다운 -->
        <div class="col">
          <q-select
            v-model="sortOption"
            :options="sortOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            dense
            outlined
            class="sort-select"
            @update:model-value="handleSortChange"
          >
            <template v-slot:prepend>
              <q-icon name="sort" />
            </template>
          </q-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['themeChange', 'searchChange', 'removeDashChange', 'filter', 'sort', 'statistics-action'])

const selectedTheme = ref($q.dark.isActive ? 'dark' : 'light')
const searchQuery = ref('')
const selectedCategory = ref(null)
const sortOption = ref('category')

// 정렬 옵션
const sortOptions = [
  { label: '카테고리별', value: 'category' },
  { label: '변수명 알파벳 순', value: 'name' },
  { label: '색상 값별', value: 'value' },
]

// 카테고리 옵션 (props에서 받아서 computed로 변환)
const categoryOptions = computed(() => {
  if (!props.categories || props.categories.length === 0) {
    return []
  }
  return props.categories.map((cat) => ({
    label: cat.categoryDisplay || cat.category,
    value: cat.category,
  }))
})

// "-- 제거 복사" 설정 (localStorage에서 로드)
const REMOVE_DASH_STORAGE_KEY = 'theme-manager-remove-dash-on-copy'
function getInitialRemoveDashValue() {
  try {
    const stored = localStorage.getItem(REMOVE_DASH_STORAGE_KEY)
    return stored === 'true'
  } catch {
    return false
  }
}
const removeDashOnCopy = ref(getInitialRemoveDashValue())

// "-- 제거 복사" 설정 변경 핸들러
function handleRemoveDashChange(value) {
  try {
    localStorage.setItem(REMOVE_DASH_STORAGE_KEY, value.toString())
    // 전역 이벤트로 알림
    window.dispatchEvent(
      new CustomEvent('theme-manager-remove-dash-changed', {
        detail: { removeDash: value },
      }),
    )
  } catch (error) {
    console.error('[ThemeManagerHeader] 설정 저장 실패:', error)
  }
}

// Quasar 다크 모드 변경 감시 (다른 곳에서 테마 변경 시 동기화)
watch(
  () => $q.dark.isActive,
  () => {
    const newTheme = $q.dark.isActive ? 'dark' : 'light'
    if (selectedTheme.value !== newTheme) {
      selectedTheme.value = newTheme
    }
  },
)

// 전역 테마 변경 이벤트 리스너 (ThemeManagerContent에서 테마 변경 시 동기화)
function handleGlobalThemeChange(event) {
  const themeValue = event.detail.theme
  if (selectedTheme.value !== themeValue) {
    selectedTheme.value = themeValue
  }
}

function handleThemeChange(value) {
  selectedTheme.value = value
  emit('themeChange', value)
}

// 검색어 변경 핸들러
watch(searchQuery, (newValue) => {
  emit('searchChange', newValue)
})

// 카테고리 필터 변경 핸들러
function handleCategoryFilterChange(value) {
  selectedCategory.value = value
  emit('filter', value)
}

// 정렬 옵션 변경 핸들러
function handleSortChange(value) {
  sortOption.value = value
  emit('sort', value)
}

// 컴포넌트 마운트 시 전역 이벤트 리스너 등록
onMounted(() => {
  window.addEventListener('theme-manager-theme-changed', handleGlobalThemeChange)
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onBeforeUnmount(() => {
  window.removeEventListener('theme-manager-theme-changed', handleGlobalThemeChange)
})
</script>

<style lang="scss" scoped>
.theme-manager-header {
  .header-section {
    width: 100%;
  }

  .search-input {
    flex: 1;
  }

  .filter-select,
  .sort-select {
    width: 100%;
  }
}
</style>
