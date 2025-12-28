<!-- EditableTable.vue
  편집 가능한 테이블 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<!--
  @tags: styles 테이블, 편집 테이블
  @category: tables
  @description: Editable Table 샘플 컴포넌트
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">편집 가능한 테이블 샘플</h3>
    <p class="sample-description">인라인 편집이 가능한 테이블 예시</p>
  </div>
  <div class="sample-container">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
      >
        <template v-slot:body-cell-name="props">
          <q-td :props="props">
            <q-input
              v-if="props.row.editing"
              v-model="props.row.name"
              dense
              outlined
              @blur="saveRow(props.row)"
            />
            <span v-else @dblclick="editRow(props.row)">{{ props.row.name }}</span>
          </q-td>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              v-if="!props.row.editing"
              flat
              dense
              icon="edit"
              @click="editRow(props.row)"
            />
            <q-btn
              v-else
              flat
              dense
              icon="check"
              color="positive"
              @click="saveRow(props.row)"
            />
            <q-btn
              flat
              dense
              icon="delete"
              color="negative"
              @click="deleteRow(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </div>
</template>

<script setup>
import { ref } from 'vue'

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
    name: 'actions',
    label: '액션',
    align: 'center',
    field: 'actions',
  },
]

const rows = ref([
  { id: 1, name: '샘플 1', category: '스타일', editing: false },
  { id: 2, name: '샘플 2', category: '패턴', editing: false },
  { id: 3, name: '샘플 3', category: '컨벤션', editing: false },
])

function editRow(row) {
  row.editing = true
}

function saveRow(row) {
  row.editing = false
  console.log('저장:', row)
}

function deleteRow(row) {
  const index = rows.value.findIndex(r => r.id === row.id)
  if (index > -1) {
    rows.value.splice(index, 1)
  }
}
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
  // 테이블 스타일은 Quasar 기본 스타일 사용
}
</style>

