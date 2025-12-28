<!-- PaginationTable.vue
  페이지네이션 테이블 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<!--
  @tags: styles 테이블, 페이지네이션 테이블
  @category: tables
  @description: Pagination Table 샘플 컴포넌트
-->
<template>
  <div class="pagination-table-sample">
    <div class="sample-header">
      <h3 class="sample-title">페이지네이션 테이블 샘플</h3>
      <p class="sample-description">페이지네이션이 있는 테이블 예시</p>
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
          <div class="text-h6">페이지네이션 테이블</div>
          <q-space />
          <q-input
            v-model="filter"
            placeholder="검색"
            dense
            outlined
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const filter = ref('')

const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 5,
  rowsNumber: 20,
})

const columns = [
  {
    name: 'name',
    required: true,
    label: '이름',
    align: 'left',
    field: 'name',
  },
  {
    name: 'category',
    label: '카테고리',
    align: 'left',
    field: 'category',
  },
  {
    name: 'status',
    label: '상태',
    align: 'left',
    field: 'status',
  },
]

const allRows = ref([
  { id: 1, name: '샘플 1', category: '스타일', status: '활성' },
  { id: 2, name: '샘플 2', category: '패턴', status: '활성' },
  { id: 3, name: '샘플 3', category: '컨벤션', status: '비활성' },
  { id: 4, name: '샘플 4', category: '스타일', status: '활성' },
  { id: 5, name: '샘플 5', category: '패턴', status: '활성' },
  { id: 6, name: '샘플 6', category: '컨벤션', status: '비활성' },
  { id: 7, name: '샘플 7', category: '스타일', status: '활성' },
  { id: 8, name: '샘플 8', category: '패턴', status: '활성' },
  { id: 9, name: '샘플 9', category: '컨벤션', status: '활성' },
  { id: 10, name: '샘플 10', category: '스타일', status: '비활성' },
])

const rows = computed(() => {
  if (!filter.value) return allRows.value
  return allRows.value.filter(row =>
    row.name.toLowerCase().includes(filter.value.toLowerCase()) ||
    row.category.toLowerCase().includes(filter.value.toLowerCase())
  )
})

function onRequest(props) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
}
</script>

<style lang="scss" scoped>
.pagination-table-sample {
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

