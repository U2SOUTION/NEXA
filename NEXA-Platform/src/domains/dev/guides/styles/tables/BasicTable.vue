<!-- BasicTable.vue
  기본 테이블 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">기본 테이블 샘플</h3>
    <p class="sample-description">기본 테이블 레이아웃 예시</p>
  </div>
  <div class="sample-container">
      <div class="table-examples">
        <q-table :rows="rows" :columns="columns" row-key="id" />
      </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const columns = [
  { name: 'name', label: '이름', field: 'name', align: 'left' },
  { name: 'age', label: '나이', field: 'age', align: 'center' },
  { name: 'email', label: '이메일', field: 'email', align: 'left' },
]

const rows = ref([
  { id: 1, name: '홍길동', age: 25, email: 'hong@example.com' },
  { id: 2, name: '김철수', age: 30, email: 'kim@example.com' },
  { id: 3, name: '이영희', age: 28, email: 'lee@example.com' },
])
</script>

<style lang="scss" scoped>
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
  .table-examples {
    background-color: var(--nexa-background);
  }
}
</style>

