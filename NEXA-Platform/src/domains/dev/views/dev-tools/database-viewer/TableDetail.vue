<!-- TableDetail.vue
  테이블 상세 정보 컴포넌트
  컬럼, 인덱스, 제약조건 정보 표시
-->

<template>
  <!-- 로딩 상태 -->
  <div v-if="isLoading" class="table-detail-loading text-center">
    <q-spinner color="primary" size="3em" />
    <div class="q-mt-md text-caption">테이블 정보를 불러오는 중...</div>
  </div>

  <!-- 에러 상태 -->
  <div v-else-if="error" class="table-detail-error text-center">
    <q-icon name="error_outline" size="48px" color="negative" class="q-mb-md" />
    <div class="text-body2 text-negative q-mb-sm">{{ error }}</div>
    <q-btn flat dense label="다시 시도" icon="refresh" @click="loadTableStructure" />
  </div>

  <!-- 테이블 정보 -->
  <div v-else-if="tableStructure" class="table-detail-content">
    <!-- 테이블 메타데이터 -->
    <div class="table-detail-metadata q-mb-md">
      <div class="table-detail-title q-mb-sm">
        <q-icon name="table_view" size="24px" class="q-mr-sm" />
        <span class="text-h6">{{ tableStructure.tableName }}</span>
      </div>
      <div v-if="tableStructure.metadata" class="table-detail-meta-info text-caption">
        <span v-if="tableStructure.metadata.rowCount !== null"> 행: {{ formatNumber(tableStructure.metadata.rowCount) }}개 </span>
        <span v-if="tableStructure.metadata.comment" class="q-ml-sm"> 코멘트: {{ tableStructure.metadata.comment }} </span>
      </div>
    </div>

    <q-separator class="q-mb-md" />

    <!-- 컬럼 정보 -->
    <div class="table-detail-section q-mb-md">
      <div class="table-detail-section-header q-mb-sm">
        <q-icon name="view_column" size="18px" class="q-mr-sm" />
        <span class="text-weight-bold">컬럼 정보</span>
        <q-badge v-if="tableStructure.columns" :label="tableStructure.columns.length" color="primary" class="q-ml-sm" />
      </div>
      <q-table v-if="tableStructure.columns && tableStructure.columns.length > 0" :rows="tableStructure.columns" :columns="columnColumns" row-key="name" flat dense class="table-detail-table">
        <template v-slot:body-cell-dataType="props">
          <q-td :props="props">
            <span class="table-detail-data-type">{{ props.value }}</span>
          </q-td>
        </template>
        <template v-slot:body-cell-isNullable="props">
          <q-td :props="props">
            <q-badge v-if="props.value === 'YES'" color="grey-7" label="NULL" />
            <q-badge v-else color="negative" label="NOT NULL" />
          </q-td>
        </template>
        <template v-slot:body-cell-columnKey="props">
          <q-td :props="props">
            <q-badge v-if="props.value === 'PRI'" color="primary" label="PK" />
            <q-badge v-else-if="props.value === 'UNI'" color="positive" label="UNIQUE" />
            <q-badge v-else-if="props.value === 'MUL'" color="info" label="INDEX" />
          </q-td>
        </template>
        <template v-slot:body-cell-extra="props">
          <q-td :props="props">
            <q-badge v-if="props.value && props.value.includes('auto_increment')" color="warning" label="AUTO_INCREMENT" />
          </q-td>
        </template>
      </q-table>
      <div v-else class="table-detail-empty text-center">
        <q-icon name="info" size="32px" color="grey-7" class="q-mb-sm" />
        <div class="text-caption text-grey-7">컬럼 정보가 없습니다.</div>
      </div>
    </div>

    <q-separator class="q-mb-md" />

    <!-- 인덱스 정보 -->
    <div class="table-detail-section q-mb-md">
      <div class="table-detail-section-header q-mb-sm">
        <q-icon name="storage" size="18px" class="q-mr-sm" />
        <span class="text-weight-bold">인덱스 정보</span>
        <q-badge v-if="indexCount > 0" :label="indexCount" color="primary" class="q-ml-sm" />
      </div>
      <q-list v-if="indexCount > 0" separator>
        <q-item v-for="(index, indexKey) in groupedIndexes" :key="indexKey" class="table-detail-index-item">
          <q-item-section>
            <q-item-label class="table-detail-index-name">
              <q-icon name="storage" size="16px" class="q-mr-xs" />
              {{ index.name }}
              <q-badge v-if="!index.nonUnique" color="positive" label="UNIQUE" class="q-ml-sm" />
              <q-badge v-if="index.name === 'PRIMARY'" color="primary" label="PRIMARY" class="q-ml-sm" />
            </q-item-label>
            <q-item-label caption class="table-detail-index-columns">
              컬럼: {{ index.columns.map((c) => c.columnName).join(', ') }}
              <span v-if="index.type" class="q-ml-sm">({{ index.type }})</span>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <div v-else class="table-detail-empty text-center">
        <q-icon name="info" size="32px" color="grey-7" class="q-mb-sm" />
        <div class="text-caption text-grey-7">인덱스가 없습니다.</div>
      </div>
    </div>

    <q-separator class="q-mb-md" />

    <!-- 제약조건 정보 -->
    <div class="table-detail-section">
      <div class="table-detail-section-header q-mb-sm">
        <q-icon name="lock" size="18px" class="q-mr-sm" />
        <span class="text-weight-bold">제약조건</span>
        <q-badge v-if="constraintCount > 0" :label="constraintCount" color="primary" class="q-ml-sm" />
      </div>
      <q-list v-if="constraintCount > 0" separator>
        <q-item v-for="(constraint, constraintKey) in groupedConstraints" :key="constraintKey" class="table-detail-constraint-item">
          <q-item-section>
            <q-item-label class="table-detail-constraint-name">
              <q-icon :name="getConstraintIcon(constraint.type)" size="16px" class="q-mr-xs" />
              {{ constraint.name }}
              <q-badge :color="getConstraintColor(constraint.type)" :label="constraint.type" class="q-ml-sm" />
            </q-item-label>
            <q-item-label caption class="table-detail-constraint-columns"> 컬럼: {{ constraint.columns.join(', ') }} </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <div v-else class="table-detail-empty text-center">
        <q-icon name="info" size="32px" color="grey-7" class="q-mb-sm" />
        <div class="text-caption text-grey-7">제약조건이 없습니다.</div>
      </div>
    </div>
  </div>

  <!-- 테이블 미선택 상태 -->
  <div v-else class="table-detail-empty text-center">
    <q-icon name="table_view" size="64px" color="grey-7" class="q-mb-md" />
    <div class="text-body2 text-grey-7">테이블을 선택하세요</div>
    <div class="text-caption text-grey-7 q-mt-sm">왼쪽 사이드바에서 테이블을 선택하면 상세 정보가 표시됩니다.</div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getApiBaseUrl } from '@system/utils/apiBaseUrl.js'

const props = defineProps({
  tableName: {
    type: String,
    default: null,
  },
})

const apiBaseUrl = getApiBaseUrl()

// 상태
const isLoading = ref(false)
const error = ref(null)
const tableStructure = ref(null)

// 컬럼 테이블 컬럼 정의
const columnColumns = [
  {
    name: 'name',
    label: '컬럼명',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'dataType',
    label: '데이터 타입',
    field: 'dataType',
    align: 'left',
    sortable: true,
  },
  {
    name: 'isNullable',
    label: 'NULL',
    field: 'isNullable',
    align: 'center',
  },
  {
    name: 'defaultValue',
    label: '기본값',
    field: 'defaultValue',
    align: 'left',
  },
  {
    name: 'columnKey',
    label: '키',
    field: 'columnKey',
    align: 'center',
  },
  {
    name: 'extra',
    label: '추가',
    field: 'extra',
    align: 'center',
  },
  {
    name: 'comment',
    label: '코멘트',
    field: 'comment',
    align: 'left',
  },
]

// 인덱스 그룹화
const groupedIndexes = computed(() => {
  if (!tableStructure.value?.indexes) return []
  const grouped = {}
  tableStructure.value.indexes.forEach((index) => {
    if (!grouped[index.name]) {
      grouped[index.name] = {
        name: index.name,
        nonUnique: index.nonUnique,
        type: index.type,
        columns: [],
      }
    }
    grouped[index.name].columns.push({
      columnName: index.columnName,
      seqInIndex: index.seqInIndex,
    })
  })
  return grouped
})

// 인덱스 개수
const indexCount = computed(() => {
  return Object.keys(groupedIndexes.value).length
})

// 제약조건 그룹화
const groupedConstraints = computed(() => {
  if (!tableStructure.value?.constraints) return []
  const grouped = {}
  tableStructure.value.constraints.forEach((constraint) => {
    if (!grouped[constraint.name]) {
      grouped[constraint.name] = {
        name: constraint.name,
        type: constraint.type,
        columns: [],
      }
    }
    if (constraint.columnName) {
      grouped[constraint.name].columns.push(constraint.columnName)
    }
  })
  return grouped
})

// 제약조건 개수
const constraintCount = computed(() => {
  return Object.keys(groupedConstraints.value).length
})

// 테이블 구조 조회
async function loadTableStructure() {
  if (!props.tableName) {
    tableStructure.value = null
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const response = await fetch(`${apiBaseUrl}/db/tables/${encodeURIComponent(props.tableName)}/structure`)

    const data = await response.json()

    if (!response.ok) {
      // 503 에러는 데이터베이스 연결 문제
      if (response.status === 503) {
        throw new Error(data.message || '데이터베이스 연결이 없습니다.')
      }
      // 500 에러는 서버 내부 오류
      if (response.status === 500) {
        const errorMsg = data.message || data.error || '테이블 구조를 불러오는데 실패했습니다.'
        console.error('[TableDetail] 서버 에러 상세:', data)
        throw new Error(`${errorMsg} (테이블: ${props.tableName})`)
      }
      throw new Error(data.error || '테이블 구조를 불러오는데 실패했습니다.')
    }

    if (data.success && data.data) {
      tableStructure.value = data.data
    } else {
      throw new Error('응답 데이터 형식이 올바르지 않습니다.')
    }
  } catch (err) {
    // ERR_CONNECTION_REFUSED 등 네트워크 에러 처리
    if (err.name === 'TypeError' && err.message?.includes('Failed to fetch')) {
      error.value = '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.'
      console.warn('[TableDetail] 서버 연결 실패:', err.message)
    } else {
      console.error('[TableDetail] 테이블 구조 조회 실패:', err)
      error.value = err.message || '테이블 구조를 불러오는데 실패했습니다.'
    }
  } finally {
    isLoading.value = false
  }
}

// 숫자 포맷팅
function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('ko-KR').format(num)
}

// 제약조건 아이콘
function getConstraintIcon(type) {
  switch (type) {
    case 'PRIMARY KEY':
      return 'vpn_key'
    case 'FOREIGN KEY':
      return 'link'
    case 'UNIQUE':
      return 'verified'
    default:
      return 'lock'
  }
}

// 제약조건 색상
function getConstraintColor(type) {
  switch (type) {
    case 'PRIMARY KEY':
      return 'primary'
    case 'FOREIGN KEY':
      return 'info'
    case 'UNIQUE':
      return 'positive'
    default:
      return 'grey-7'
  }
}

// tableName 변경 감지
watch(
  () => props.tableName,
  (newTableName) => {
    if (newTableName) {
      loadTableStructure()
    } else {
      tableStructure.value = null
      error.value = null
    }
  },
  { immediate: true },
)

// 전역 이벤트 리스너 (사이드바에서 테이블 선택 시)
onMounted(() => {
  function handleTableSelected(event) {
    const tableName = event.detail.tableName
    if (tableName) {
      // props가 업데이트되면 watch가 자동으로 처리
    }
  }
  window.addEventListener('database-table-selected', handleTableSelected)
})
</script>

<style lang="scss" scoped>
.table-detail {
  width: 100%;
  overflow: hidden; // 샘플 섹션과 동일한 패턴
  min-width: 0; // 샘플 섹션과 동일한 패턴
  display: flex;
  flex-direction: column;
  box-sizing: border-box; // 샘플 섹션과 동일한 패턴
}

.table-detail-loading,
.table-detail-error {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px; // section-content 패딩 대신 직접 패딩 적용
}

.table-detail-empty {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px; // section-content 패딩 대신 직접 패딩 적용
}

.table-detail-content {
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-sizing: border-box;
  overflow-x: hidden; // 가로 스크롤 방지
}

.table-detail-metadata {
  background-color: var(--nexa-surface);
  border-radius: 4px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 12px 16px; // section-content 패딩 대신 직접 패딩 적용
}

.table-detail-title {
  display: flex;
  align-items: center;
  color: var(--nexa-text-primary);
}

.table-detail-meta-info {
  color: var(--nexa-text-secondary);
  margin-top: 4px;
}

.table-detail-section {
  margin-bottom: 16px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

// 섹션 내부 요소들이 부모 너비를 넘지 않도록
.table-detail-section > * {
  max-width: 100%;
  box-sizing: border-box;
}

.table-detail-section-header {
  display: flex;
  align-items: center;
  color: var(--nexa-text-primary);
  font-size: 0.95rem;
}

.table-detail-table {
  background-color: var(--nexa-surface);
  border-radius: 4px;
  overflow: hidden; // 테이블이 부모 영역을 넘지 않도록
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

// 테이블 내부 요소들이 오른쪽 패딩을 고려하도록
.table-detail-table :deep(.q-table__container) {
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.table-detail-table :deep(.q-table__top),
.table-detail-table :deep(.q-table__bottom),
.table-detail-table :deep(.q-table__middle) {
  max-width: 100%;
  box-sizing: border-box;
}

.table-detail-table :deep(table) {
  width: 100%;
  max-width: 100%;
  table-layout: auto;
  box-sizing: border-box;
}

// 테이블 셀이 오른쪽을 넘지 않도록
.table-detail-table :deep(td),
.table-detail-table :deep(th) {
  max-width: 100%;
  box-sizing: border-box;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.table-detail-data-type {
  font-family: 'Courier New', monospace;
  color: var(--nexa-primary);
  font-weight: 500;
}

.table-detail-index-item,
.table-detail-constraint-item {
  padding: 8px 0; // 좌우 패딩 제거 (section-content의 패딩 사용)
  border-radius: 0; // q-list의 border-radius 사용
  margin-bottom: 4px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

// q-list의 separator 제거 (아이템 간격은 margin으로 처리)
.table-detail-section :deep(.q-list--separator > .q-item) {
  border-bottom: none;
}

// q-list 전체 스타일
.table-detail-section :deep(.q-list) {
  border-radius: 4px;
  overflow: hidden;
  background-color: var(--nexa-surface);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

// q-item-section이 너비를 넘지 않도록
.table-detail-section :deep(.q-item__section) {
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
}

// q-item-label이 너비를 넘지 않도록
.table-detail-section :deep(.q-item__label) {
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.table-detail-index-name,
.table-detail-constraint-name {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: var(--nexa-text-primary);
}

.table-detail-index-columns,
.table-detail-constraint-columns {
  color: var(--nexa-text-secondary);
  margin-top: 4px;
}
</style>
