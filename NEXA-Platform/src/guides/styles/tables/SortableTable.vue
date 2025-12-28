<!-- SortableTable.vue
  정렬 가능한 테이블 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<!--
  @tags: styles 테이블, 정렬 테이블
  @category: tables
  @description: Sortable Table 샘플 컴포넌트
-->
<template>
  <div class="sortable-table-sample">
    <div class="sample-header">
      <h3 class="sample-title">정렬 가능한 테이블 샘플</h3>
      <p class="sample-description">컬럼별 정렬이 가능한 테이블 예시</p>
    </div>
    <div class="sample-container">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        :pagination="pagination"
        @request="onRequest"
      >
        <template v-slot:top>
          <div class="text-h6">정렬 가능한 테이블</div>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 10,
})

const columns = [
  {
    name: 'name',
    required: true,
    label: '이름',
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'category',
    label: '카테고리',
    align: 'left',
    field: 'category',
    sortable: true,
  },
  {
    name: 'date',
    label: '날짜',
    align: 'left',
    field: 'date',
    sortable: true,
  },
]

const rows = ref([
  { id: 1, name: '샘플 1', category: '스타일', date: '2024-01-01' },
  { id: 2, name: '샘플 2', category: '패턴', date: '2024-01-02' },
  { id: 3, name: '샘플 3', category: '컨벤션', date: '2024-01-03' },
])

function onRequest(props) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
}
</script>

<style lang="scss" scoped>
.sortable-table-sample {
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
    // 테이블 스타일은 Quasar 기본 스타일 사용
  }
}
</style>

