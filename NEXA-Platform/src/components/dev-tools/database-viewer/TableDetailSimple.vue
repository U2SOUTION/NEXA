<!-- TableDetailSimple.vue
  테이블 상세 정보 컴포넌트 (단순 버전)
  최소한의 DOM 구조로 구성
-->
<template>
  <div class="table-detail-simple">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="text-center q-pa-md">
      <q-spinner color="primary" size="2em" />
      <div class="q-mt-sm text-caption">로딩 중...</div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="text-center q-pa-md">
      <div class="text-negative q-mb-sm">{{ error }}</div>
      <q-btn flat dense label="다시 시도" @click="loadTableStructure" />
    </div>

    <!-- 테이블 정보 -->
    <div v-else-if="tableStructure" class="q-pa-md">
      <!-- 테이블 메타데이터 -->
      <div class="q-mb-md">
        <div class="text-h6 q-mb-sm">{{ tableStructure.tableName }}</div>
        <div class="text-caption text-grey-7">
          <span v-if="tableStructure.metadata?.rowCount !== null">행: {{ formatNumber(tableStructure.metadata.rowCount) }}개</span>
          <span v-if="tableStructure.metadata?.comment" class="q-ml-sm">코멘트: {{ tableStructure.metadata.comment }}</span>
        </div>
      </div>

      <q-separator class="q-my-md" />

      <!-- 컬럼 정보 -->
      <div class="q-mb-md">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-weight-bold">컬럼 정보 ({{ tableStructure.columns?.length || 0 }}개)</div>
          <q-btn flat dense size="sm" :icon="columnShowAll ? 'unfold_less' : 'unfold_more'" :label="columnShowAll ? '페이징 적용' : '모두 펼치기'" @click="columnShowAll = !columnShowAll" v-if="tableStructure.columns && tableStructure.columns.length > rowsPerPage" />
        </div>
        <table class="column-table">
          <thead>
            <tr>
              <th>컬럼명</th>
              <th>데이터 타입</th>
              <th>NULL</th>
              <th>키</th>
              <th>기본값</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="column in paginatedColumns" :key="column.name">
              <td>{{ column.name }}</td>
              <td>{{ column.dataType }}</td>
              <td>{{ column.isNullable === 'YES' ? 'NULL' : 'NOT NULL' }}</td>
              <td>
                <span v-if="column.columnKey === 'PRI'">PK</span>
                <span v-else-if="column.columnKey === 'UNI'">UNIQUE</span>
                <span v-else-if="column.columnKey === 'MUL'">INDEX</span>
                <span v-else>-</span>
              </td>
              <td>{{ column.defaultValue || '-' }}</td>
            </tr>
          </tbody>
        </table>
        <!-- 컬럼 페이징 -->
        <div v-if="!columnShowAll && columnPages > 1" class="q-mt-sm row items-center justify-between">
          <div class="text-caption text-grey-7">{{ (columnPage - 1) * rowsPerPage + 1 }}-{{ Math.min(columnPage * rowsPerPage, tableStructure.columns?.length || 0) }} / {{ tableStructure.columns?.length || 0 }}</div>
          <div class="row items-center q-gutter-xs">
            <q-btn flat dense icon="first_page" size="sm" :disable="columnPage === 1" @click="columnPage = 1" />
            <q-btn flat dense icon="chevron_left" size="sm" :disable="columnPage === 1" @click="columnPage--" />
            <span class="text-caption">{{ columnPage }} / {{ columnPages }}</span>
            <q-btn flat dense icon="chevron_right" size="sm" :disable="columnPage === columnPages" @click="columnPage++" />
            <q-btn flat dense icon="last_page" size="sm" :disable="columnPage === columnPages" @click="columnPage = columnPages" />
          </div>
        </div>
      </div>

      <q-separator class="q-my-md" />

      <!-- 인덱스 정보 -->
      <div class="q-mb-md">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-weight-bold">인덱스 정보 ({{ indexCount }}개)</div>
          <q-btn flat dense size="sm" :icon="indexShowAll ? 'unfold_less' : 'unfold_more'" :label="indexShowAll ? '페이징 적용' : '모두 펼치기'" @click="indexShowAll = !indexShowAll" v-if="indexCount > rowsPerPage" />
        </div>
        <table v-if="indexCount > 0" class="index-table">
          <thead>
            <tr>
              <th>인덱스명</th>
              <th>타입</th>
              <th>컬럼</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(index, indexKey) in paginatedIndexes" :key="indexKey">
              <td>{{ index.name }}</td>
              <td>
                <span v-if="index.name === 'PRIMARY'">PRIMARY</span>
                <span v-else-if="!index.nonUnique">UNIQUE</span>
                <span v-else>INDEX</span>
              </td>
              <td>{{ index.columns.map((c) => c.columnName).join(', ') }}</td>
            </tr>
          </tbody>
        </table>
        <!-- 인덱스 페이징 -->
        <div v-if="!indexShowAll && indexPages > 1" class="q-mt-sm row items-center justify-between">
          <div class="text-caption text-grey-7">{{ (indexPage - 1) * rowsPerPage + 1 }}-{{ Math.min(indexPage * rowsPerPage, indexCount) }} / {{ indexCount }}</div>
          <div class="row items-center q-gutter-xs">
            <q-btn flat dense icon="first_page" size="sm" :disable="indexPage === 1" @click="indexPage = 1" />
            <q-btn flat dense icon="chevron_left" size="sm" :disable="indexPage === 1" @click="indexPage--" />
            <span class="text-caption">{{ indexPage }} / {{ indexPages }}</span>
            <q-btn flat dense icon="chevron_right" size="sm" :disable="indexPage === indexPages" @click="indexPage++" />
            <q-btn flat dense icon="last_page" size="sm" :disable="indexPage === indexPages" @click="indexPage = indexPages" />
          </div>
        </div>
        <div v-else class="text-caption text-grey-7">인덱스가 없습니다.</div>
      </div>

      <q-separator class="q-my-md" />

      <!-- 제약조건 정보 -->
      <div>
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-weight-bold">제약조건 ({{ constraintCount }}개)</div>
          <q-btn flat dense size="sm" :icon="constraintShowAll ? 'unfold_less' : 'unfold_more'" :label="constraintShowAll ? '페이징 적용' : '모두 펼치기'" @click="constraintShowAll = !constraintShowAll" v-if="constraintCount > rowsPerPage" />
        </div>
        <table v-if="constraintCount > 0" class="constraint-table">
          <thead>
            <tr>
              <th>제약조건명</th>
              <th>타입</th>
              <th>컬럼</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(constraint, constraintKey) in paginatedConstraints" :key="constraintKey">
              <td>{{ constraint.name }}</td>
              <td>{{ constraint.type }}</td>
              <td>{{ constraint.columns.join(', ') }}</td>
            </tr>
          </tbody>
        </table>
        <!-- 제약조건 페이징 -->
        <div v-if="!constraintShowAll && constraintPages > 1" class="q-mt-sm row items-center justify-between">
          <div class="text-caption text-grey-7">{{ (constraintPage - 1) * rowsPerPage + 1 }}-{{ Math.min(constraintPage * rowsPerPage, constraintCount) }} / {{ constraintCount }}</div>
          <div class="row items-center q-gutter-xs">
            <q-btn flat dense icon="first_page" size="sm" :disable="constraintPage === 1" @click="constraintPage = 1" />
            <q-btn flat dense icon="chevron_left" size="sm" :disable="constraintPage === 1" @click="constraintPage--" />
            <span class="text-caption">{{ constraintPage }} / {{ constraintPages }}</span>
            <q-btn flat dense icon="chevron_right" size="sm" :disable="constraintPage === constraintPages" @click="constraintPage++" />
            <q-btn flat dense icon="last_page" size="sm" :disable="constraintPage === constraintPages" @click="constraintPage = constraintPages" />
          </div>
        </div>
        <div v-else class="text-caption text-grey-7">제약조건이 없습니다.</div>
      </div>
    </div>

    <!-- 테이블 미선택 상태 -->
    <div v-else class="text-center q-pa-lg">
      <div class="text-body2 text-grey-7">테이블을 선택하세요</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  tableName: {
    type: String,
    default: null,
  },
})

const isLoading = ref(false)
const error = ref(null)
const tableStructure = ref(null)

// 페이징 설정
const rowsPerPage = ref(10)
const columnPage = ref(1)
const indexPage = ref(1)
const constraintPage = ref(1)

// 모든 데이터 펼치기 토글
const columnShowAll = ref(false)
const indexShowAll = ref(false)
const constraintShowAll = ref(false)

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

// 페이징된 데이터 (모든 데이터 펼치기 토글 반영)
const paginatedColumns = computed(() => {
  if (!tableStructure.value?.columns) return []
  if (columnShowAll.value) return tableStructure.value.columns
  const start = (columnPage.value - 1) * rowsPerPage.value
  const end = start + rowsPerPage.value
  return tableStructure.value.columns.slice(start, end)
})

const paginatedIndexes = computed(() => {
  const indexes = Object.values(groupedIndexes.value)
  if (indexShowAll.value) return indexes
  const start = (indexPage.value - 1) * rowsPerPage.value
  const end = start + rowsPerPage.value
  return indexes.slice(start, end)
})

const paginatedConstraints = computed(() => {
  const constraints = Object.values(groupedConstraints.value)
  if (constraintShowAll.value) return constraints
  const start = (constraintPage.value - 1) * rowsPerPage.value
  const end = start + rowsPerPage.value
  return constraints.slice(start, end)
})

// 페이지 수 계산
const columnPages = computed(() => {
  if (!tableStructure.value?.columns) return 0
  return Math.ceil(tableStructure.value.columns.length / rowsPerPage.value)
})

const indexPages = computed(() => {
  return Math.ceil(indexCount.value / rowsPerPage.value)
})

const constraintPages = computed(() => {
  return Math.ceil(constraintCount.value / rowsPerPage.value)
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
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
    const response = await fetch(`${apiBaseUrl}/db/tables/${encodeURIComponent(props.tableName)}/structure`)

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 503) {
        throw new Error(data.message || '데이터베이스 연결이 없습니다.')
      }
      if (response.status === 500) {
        const errorMsg = data.message || data.error || '테이블 구조를 불러오는데 실패했습니다.'
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
    if (err.name === 'TypeError' && err.message?.includes('Failed to fetch')) {
      error.value = '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.'
    } else {
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

// tableName 변경 감지
watch(
  () => props.tableName,
  (newTableName) => {
    if (newTableName) {
      loadTableStructure()
      // 페이지 초기화
      columnPage.value = 1
      indexPage.value = 1
      constraintPage.value = 1
      // 모든 데이터 펼치기 초기화
      columnShowAll.value = false
      indexShowAll.value = false
      constraintShowAll.value = false
    } else {
      tableStructure.value = null
      error.value = null
    }
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
// 타이틀 구분
.text-weight-bold {
  font-weight: 600;
  margin-bottom: 8px;
}

// 아이템 구분
.q-mb-xs {
  padding-left: 8px;
  color: var(--nexa-text-secondary);
}

// 컬럼 정보 테이블 스타일 (NEXA 테이블 CSS 따름)
.column-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 0.875rem;

  th,
  td {
    padding: 8px;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--nexa-text-secondary) !important;
  }

  thead th {
    border-bottom: 1px solid var(--nexa-table-border);
    background-color: var(--nexa-table-header-bg);
    color: var(--nexa-table-header-text);
    font-weight: 600;
  }

  tbody {
    tr {
      background-color: var(--nexa-table-bg);

      &:hover {
        background-color: var(--nexa-table-row-hover-bg);
      }
    }

    td {
      background-color: inherit;
      border-bottom: 1px solid var(--nexa-table-border);
      color: var(--nexa-table-text);
    }
  }

  // 컬럼별 폭 조정
  th:nth-child(1),
  td:nth-child(1) {
    width: 25%; // 컬럼명
    font-size: 0.9rem;
  }

  th:nth-child(2),
  td:nth-child(2) {
    width: 15%; // 데이터 타입
  }

  th:nth-child(3),
  td:nth-child(3) {
    width: 10%; // NULL
    font-size: 0.75rem;
  }

  th:nth-child(4),
  td:nth-child(4) {
    width: 10%; // 키
  }

  th:nth-child(5),
  td:nth-child(5) {
    width: 20%; // 기본값
    font-size: 0.75rem;
  }
}

// 인덱스 정보 테이블 스타일 (NEXA 테이블 CSS 따름)
.index-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 0.875rem;

  th,
  td {
    padding: 8px;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--nexa-text-secondary) !important;
  }

  thead th {
    border-bottom: 1px solid var(--nexa-table-border);
    background-color: var(--nexa-table-header-bg);
    color: var(--nexa-table-header-text);
    font-weight: 600;
  }

  tbody {
    tr {
      background-color: var(--nexa-table-bg);

      &:hover {
        background-color: var(--nexa-table-row-hover-bg);
      }
    }

    td {
      background-color: inherit;
      border-bottom: 1px solid var(--nexa-table-border);
      color: var(--nexa-table-text);
    }
  }

  // 컬럼별 폭 조정
  th:nth-child(1),
  td:nth-child(1) {
    width: 30%; // 인덱스명
    font-size: 0.9rem;
  }

  th:nth-child(2),
  td:nth-child(2) {
    width: 20%; // 타입
  }

  th:nth-child(3),
  td:nth-child(3) {
    width: 50%; // 컬럼
  }
}

// 제약조건 정보 테이블 스타일 (NEXA 테이블 CSS 따름)
.constraint-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 0.875rem;

  th,
  td {
    padding: 8px;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--nexa-text-secondary) !important;
  }

  thead th {
    border-bottom: 1px solid var(--nexa-table-border);
    background-color: var(--nexa-table-header-bg);
    color: var(--nexa-table-header-text);
    font-weight: 600;
  }

  tbody {
    tr {
      background-color: var(--nexa-table-bg);

      &:hover {
        background-color: var(--nexa-table-row-hover-bg);
      }
    }

    td {
      background-color: inherit;
      border-bottom: 1px solid var(--nexa-table-border);
      color: var(--nexa-table-text);
    }
  }

  // 컬럼별 폭 조정
  th:nth-child(1),
  td:nth-child(1) {
    width: 30%; // 제약조건명
    font-size: 0.9rem;
  }

  th:nth-child(2),
  td:nth-child(2) {
    width: 25%; // 타입
  }

  th:nth-child(3),
  td:nth-child(3) {
    width: 45%; // 컬럼
  }
}
</style>
