<!-- SearchForm.vue
  검색 폼 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<!--
  @tags: styles 폼, 검색 폼
  @category: forms
  @description: Search Form 샘플 컴포넌트
-->
<template>
  <div class="search-form-sample">
    <div class="sample-header">
      <h3 class="sample-title">검색 폼 샘플</h3>
      <p class="sample-description">검색 기능을 위한 폼 예시</p>
    </div>
    <div class="sample-container">
      <q-form @submit="handleSearch" class="search-form">
        <div class="form-row">
          <q-input
            v-model="searchQuery"
            label="검색어"
            outlined
            clearable
            class="col"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn type="submit" label="검색" color="primary" />
        </div>
        <div class="form-filters">
          <q-select
            v-model="category"
            :options="categoryOptions"
            label="카테고리"
            outlined
            dense
            clearable
          />
          <q-select
            v-model="sortBy"
            :options="sortOptions"
            label="정렬"
            outlined
            dense
          />
        </div>
      </q-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const searchQuery = ref('')
const category = ref(null)
const sortBy = ref('recent')

const categoryOptions = ['전체', '스타일', '패턴', '컨벤션', '베스트 프랙티스']
const sortOptions = [
  { label: '최신순', value: 'recent' },
  { label: '이름순', value: 'name' },
  { label: '인기순', value: 'popular' },
]

function handleSearch() {
  console.log('검색:', { searchQuery: searchQuery.value, category: category.value, sortBy: sortBy.value })
}
</script>

<style lang="scss" scoped>
.search-form-sample {
  padding: 16px;
  background-color: var(--nexa-surface);
  border-radius: 8px;

  .sample-header {
    margin-bottom: 16px;

    .sample-title {
      color: var(--nexa-text-primary);
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .sample-description {
      color: var(--nexa-text-secondary);
      font-size: 0.875rem;
    }
  }

  .sample-container {
    .search-form {
      .form-row {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }

      .form-filters {
        display: flex;
        gap: 8px;
      }
    }
  }
}
</style>

