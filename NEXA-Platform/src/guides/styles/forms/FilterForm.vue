<!-- FilterForm.vue
  필터 폼 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<!--
  @tags: styles 폼, 필터 폼
  @category: forms
  @description: Filter Form 샘플 컴포넌트
-->
<template>
  <div class="filter-form-sample">
    <div class="sample-header">
      <h3 class="sample-title">필터 폼 샘플</h3>
      <p class="sample-description">다양한 필터 옵션을 제공하는 폼 예시</p>
    </div>
    <div class="sample-container">
      <q-form class="filter-form">
        <div class="filter-section">
          <div class="filter-label">카테고리</div>
          <q-checkbox v-model="filters.categories" val="styles" label="스타일" />
          <q-checkbox v-model="filters.categories" val="patterns" label="패턴" />
          <q-checkbox v-model="filters.categories" val="conventions" label="컨벤션" />
        </div>
        <div class="filter-section">
          <div class="filter-label">태그</div>
          <q-chip
            v-for="tag in selectedTags"
            :key="tag"
            removable
            @remove="removeTag(tag)"
          >
            {{ tag }}
          </q-chip>
          <q-input
            v-model="newTag"
            label="태그 추가"
            dense
            outlined
            @keyup.enter="addTag"
          />
        </div>
        <div class="filter-actions">
          <q-btn label="적용" color="primary" @click="applyFilters" />
          <q-btn label="초기화" outline @click="resetFilters" />
        </div>
      </q-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const filters = ref({
  categories: ['styles'],
})

const selectedTags = ref(['버튼', '입력'])
const newTag = ref('')

function addTag() {
  if (newTag.value && !selectedTags.value.includes(newTag.value)) {
    selectedTags.value.push(newTag.value)
    newTag.value = ''
  }
}

function removeTag(tag) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  }
}

function applyFilters() {
  console.log('필터 적용:', filters.value, selectedTags.value)
}

function resetFilters() {
  filters.value = { categories: [] }
  selectedTags.value = []
}
</script>

<style lang="scss" scoped>
.filter-form-sample {
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
    .filter-form {
      .filter-section {
        margin-bottom: 16px;
        padding: 12px;
        background-color: var(--nexa-background);
        border-radius: 4px;

        .filter-label {
          color: var(--nexa-text-primary);
          font-weight: 600;
          margin-bottom: 8px;
        }
      }

      .filter-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
}
</style>

