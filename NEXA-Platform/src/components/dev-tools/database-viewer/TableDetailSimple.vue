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
      <!-- 테이블 메타데이터 + 통합 검색 및 필터 (한 줄) -->
      <div class="row items-center justify-between q-gutter-sm q-mb-md" style="flex-wrap: nowrap; overflow: hidden">
        <div class="col-auto" style="min-width: 0; flex-shrink: 0">
          <div class="text-h6" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ tableStructure.tableName }}</div>
          <div class="text-caption text-grey-7" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
            <span v-if="tableStructure.metadata?.rowCount !== null">행: {{ formatNumber(tableStructure.metadata.rowCount) }}개</span>
            <span v-if="tableStructure.metadata?.comment" class="q-ml-sm" style="display: inline">코멘트: {{ tableStructure.metadata.comment }}</span>
          </div>
        </div>
        <div class="row items-center q-gutter-sm" style="flex-shrink: 0">
          <q-input v-model="globalSearchQuery" placeholder="전체 검색..." outlined dense clearable style="min-width: 120px; max-width: 250px; width: 200px">
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-select
            v-model="columnFilterType"
            :options="[
              { label: '전체', value: 'all' },
              { label: 'PK만', value: 'PRI' },
              { label: 'UNIQUE만', value: 'UNI' },
              { label: 'INDEX만', value: 'MUL' },
              { label: '키 없음', value: 'none' },
            ]"
            outlined
            dense
            emit-value
            map-options
            style="min-width: 90px; max-width: 110px; width: 100px"
            label="컬럼 필터"
          />
        </div>
      </div>

      <q-separator class="q-my-md" />

      <!-- 컬럼 정보 -->
      <div class="q-mb-md">
        <div class="row items-center justify-between">
          <div class="table-detail-section-title">
            컬럼 정보
            <span v-if="filteredColumnCount !== tableStructure.columns?.length"> ({{ filteredColumnCount }} / {{ tableStructure.columns?.length || 0 }}개) </span>
            <span v-else>({{ tableStructure.columns?.length || 0 }}개)</span>
          </div>
          <div class="row items-center q-gutter-xs">
            <q-btn flat dense size="sm" :icon="columnShowAll ? 'unfold_less' : 'unfold_more'" :label="columnShowAll ? '페이징 적용' : '모두 펼치기'" @click="columnShowAll = !columnShowAll" v-if="filteredColumnCount > rowsPerPage" />
          </div>
        </div>

        <table class="column-table">
          <thead>
            <tr>
              <th class="sticky-column-left">
                <div class="row items-center q-gutter-xs">
                  <span>컬럼명</span>
                  <q-btn flat dense size="xs" :icon="columnSortBy === 'name' && columnSortOrder === 'asc' ? 'arrow_upward' : columnSortBy === 'name' && columnSortOrder === 'desc' ? 'arrow_downward' : 'unfold_more'" @click="handleColumnSort('name')" />
                </div>
              </th>
              <th>
                <div class="row items-center q-gutter-xs">
                  <span>데이터 타입</span>
                  <q-btn flat dense size="xs" :icon="columnSortBy === 'dataType' && columnSortOrder === 'asc' ? 'arrow_upward' : columnSortBy === 'dataType' && columnSortOrder === 'desc' ? 'arrow_downward' : 'unfold_more'" @click="handleColumnSort('dataType')" />
                </div>
              </th>
              <th>
                <div class="row items-center q-gutter-xs">
                  <span>NULL</span>
                  <q-btn flat dense size="xs" :icon="columnSortBy === 'isNullable' && columnSortOrder === 'asc' ? 'arrow_upward' : columnSortBy === 'isNullable' && columnSortOrder === 'desc' ? 'arrow_downward' : 'unfold_more'" @click="handleColumnSort('isNullable')" />
                </div>
              </th>
              <th>
                <div class="row items-center q-gutter-xs">
                  <span>키</span>
                  <q-btn flat dense size="xs" :icon="columnSortBy === 'columnKey' && columnSortOrder === 'asc' ? 'arrow_upward' : columnSortBy === 'columnKey' && columnSortOrder === 'desc' ? 'arrow_downward' : 'unfold_more'" @click="handleColumnSort('columnKey')" />
                </div>
              </th>
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
          <tfoot v-if="!columnShowAll && columnPages > 1">
            <tr>
              <td colspan="5" class="table-pagination">
                <div class="row items-center justify-between">
                  <div class="text-caption text-grey-7">{{ (columnPage - 1) * rowsPerPage + 1 }}-{{ Math.min(columnPage * rowsPerPage, tableStructure.columns?.length || 0) }} / {{ tableStructure.columns?.length || 0 }}</div>
                  <div class="row items-center q-gutter-xs">
                    <q-btn flat dense icon="first_page" size="sm" :disable="columnPage === 1" @click="columnPage = 1" />
                    <q-btn flat dense icon="chevron_left" size="sm" :disable="columnPage === 1" @click="columnPage--" />
                    <span class="text-caption">{{ columnPage }} / {{ columnPages }}</span>
                    <q-btn flat dense icon="chevron_right" size="sm" :disable="columnPage === columnPages" @click="columnPage++" />
                    <q-btn flat dense icon="last_page" size="sm" :disable="columnPage === columnPages" @click="columnPage = columnPages" />
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <q-separator class="q-my-md" />

      <!-- 인덱스 정보 -->
      <div class="q-mb-md">
        <div class="row items-center justify-between">
          <div class="table-detail-section-title">
            인덱스 정보
            <span v-if="filteredIndexes.length !== Object.keys(groupedIndexes).length"> ({{ indexCount }} / {{ Object.keys(groupedIndexes).length }}개) </span>
            <span v-else>({{ indexCount }}개)</span>
          </div>
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
          <tfoot v-if="!indexShowAll && indexPages > 1">
            <tr>
              <td colspan="3" class="table-pagination">
                <div class="row items-center justify-between">
                  <div class="text-caption text-grey-7">{{ (indexPage - 1) * rowsPerPage + 1 }}-{{ Math.min(indexPage * rowsPerPage, indexCount) }} / {{ indexCount }}</div>
                  <div class="row items-center q-gutter-xs">
                    <q-btn flat dense icon="first_page" size="sm" :disable="indexPage === 1" @click="indexPage = 1" />
                    <q-btn flat dense icon="chevron_left" size="sm" :disable="indexPage === 1" @click="indexPage--" />
                    <span class="text-caption">{{ indexPage }} / {{ indexPages }}</span>
                    <q-btn flat dense icon="chevron_right" size="sm" :disable="indexPage === indexPages" @click="indexPage++" />
                    <q-btn flat dense icon="last_page" size="sm" :disable="indexPage === indexPages" @click="indexPage = indexPages" />
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
        <div v-else class="text-caption text-grey-7">인덱스가 없습니다.</div>
      </div>

      <q-separator class="q-my-md" />

      <!-- 제약조건 정보 -->
      <div>
        <div class="row items-center justify-between">
          <div class="table-detail-section-title">
            제약조건
            <span v-if="filteredConstraints.length !== Object.keys(groupedConstraints).length"> ({{ constraintCount }} / {{ Object.keys(groupedConstraints).length }}개) </span>
            <span v-else>({{ constraintCount }}개)</span>
          </div>
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
          <tfoot v-if="!constraintShowAll && constraintPages > 1">
            <tr>
              <td colspan="3" class="table-pagination">
                <div class="row items-center justify-between">
                  <div class="text-caption text-grey-7">{{ (constraintPage - 1) * rowsPerPage + 1 }}-{{ Math.min(constraintPage * rowsPerPage, constraintCount) }} / {{ constraintCount }}</div>
                  <div class="row items-center q-gutter-xs">
                    <q-btn flat dense icon="first_page" size="sm" :disable="constraintPage === 1" @click="constraintPage = 1" />
                    <q-btn flat dense icon="chevron_left" size="sm" :disable="constraintPage === 1" @click="constraintPage--" />
                    <span class="text-caption">{{ constraintPage }} / {{ constraintPages }}</span>
                    <q-btn flat dense icon="chevron_right" size="sm" :disable="constraintPage === constraintPages" @click="constraintPage++" />
                    <q-btn flat dense icon="last_page" size="sm" :disable="constraintPage === constraintPages" @click="constraintPage = constraintPages" />
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
        <div v-else class="text-caption text-grey-7">제약조건이 없습니다.</div>
      </div>

      <q-separator class="q-my-md" />

      <!-- 외래키 관계 정보 -->
      <div>
        <div class="row items-center justify-between q-mb-sm">
          <div class="table-detail-section-title">
            외래키 관계
            <span v-if="relationships.outgoing.length > 0 || relationships.incoming.length > 0"> ({{ relationships.outgoing.length + relationships.incoming.length }}개) </span>
          </div>
        </div>

        <!-- 이 테이블이 참조하는 테이블 (Outgoing) -->
        <div v-if="relationships.outgoing.length > 0" class="q-mb-md">
          <div class="text-subtitle2 q-mb-xs" style="color: var(--nexa-text-secondary)">
            <q-icon name="arrow_forward" size="16px" class="q-mr-xs" />
            이 테이블이 참조하는 테이블
          </div>
          <table class="relationship-table">
            <thead>
              <tr>
                <th>참조 테이블</th>
                <th>참조 컬럼</th>
                <th>로컬 컬럼</th>
                <th>제약조건</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(rel, idx) in relationships.outgoing" :key="idx">
                <td>
                  <span class="relationship-table-name" @click="handleTableClick(rel.toTable)">{{ rel.toTable }}</span>
                </td>
                <td>{{ rel.toColumn }}</td>
                <td>{{ rel.fromColumn }}</td>
                <td>
                  <q-badge class="constraint-badge" :label="rel.constraintName" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 이 테이블을 참조하는 테이블 (Incoming) -->
        <div v-if="relationships.incoming.length > 0" class="q-mb-md">
          <div class="text-subtitle2 q-mb-xs" style="color: var(--nexa-text-secondary)">
            <q-icon name="arrow_back" size="16px" class="q-mr-xs" />
            이 테이블을 참조하는 테이블
          </div>
          <table class="relationship-table">
            <thead>
              <tr>
                <th>참조하는 테이블</th>
                <th>참조 컬럼</th>
                <th>로컬 컬럼</th>
                <th>제약조건</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(rel, idx) in relationships.incoming" :key="idx">
                <td>
                  <span class="relationship-table-name" @click="handleTableClick(rel.fromTable)">{{ rel.fromTable }}</span>
                </td>
                <td>{{ rel.fromColumn }}</td>
                <td>{{ rel.toColumn }}</td>
                <td>
                  <q-badge class="constraint-badge" :label="rel.constraintName" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 관계가 없을 때 -->
        <div v-if="relationships.outgoing.length === 0 && relationships.incoming.length === 0" class="text-center q-py-md">
          <q-icon name="link_off" size="32px" color="grey-7" class="q-mb-sm" />
          <div class="text-caption text-grey-7">외래키 관계가 없습니다.</div>
        </div>
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
const relationships = ref({
  outgoing: [], // 이 테이블이 참조하는 테이블
  incoming: [], // 이 테이블을 참조하는 테이블
})

// 페이징 설정
const rowsPerPage = ref(10)
const columnPage = ref(1)
const indexPage = ref(1)
const constraintPage = ref(1)

// 모든 데이터 펼치기 토글
const columnShowAll = ref(false)
const indexShowAll = ref(false)
const constraintShowAll = ref(false)

// 통합 검색 (3개 테이블 모두에 적용)
const globalSearchQuery = ref('')

// 컬럼 필터링 및 정렬
const columnSortBy = ref('name') // 'name', 'dataType', 'isNullable', 'columnKey'
const columnSortOrder = ref('asc') // 'asc', 'desc'
const columnFilterType = ref('all') // 'all', 'PRI', 'UNI', 'MUL', 'none'

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

// 인덱스 개수 (필터링된 결과 기준)
const indexCount = computed(() => {
  return filteredIndexes.value.length
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

// 제약조건 개수 (필터링된 결과 기준)
const constraintCount = computed(() => {
  return filteredConstraints.value.length
})

// 필터링 및 정렬된 컬럼 데이터
const filteredAndSortedColumns = computed(() => {
  if (!tableStructure.value?.columns) return []

  let result = [...tableStructure.value.columns]

  // 통합 검색 필터
  if (globalSearchQuery.value) {
    const query = globalSearchQuery.value.toLowerCase()
    result = result.filter((col) => {
      return col.name.toLowerCase().includes(query) || col.dataType.toLowerCase().includes(query) || (col.defaultValue && col.defaultValue.toLowerCase().includes(query)) || (col.comment && col.comment.toLowerCase().includes(query))
    })
  }

  // 타입 필터 (키 타입)
  if (columnFilterType.value !== 'all') {
    if (columnFilterType.value === 'none') {
      result = result.filter((col) => !col.columnKey)
    } else {
      result = result.filter((col) => col.columnKey === columnFilterType.value)
    }
  }

  // 정렬
  result.sort((a, b) => {
    let aVal, bVal

    switch (columnSortBy.value) {
      case 'name':
        aVal = a.name.toLowerCase()
        bVal = b.name.toLowerCase()
        break
      case 'dataType':
        aVal = a.dataType.toLowerCase()
        bVal = b.dataType.toLowerCase()
        break
      case 'isNullable':
        aVal = a.isNullable === 'YES' ? 0 : 1
        bVal = b.isNullable === 'YES' ? 0 : 1
        break
      case 'columnKey':
        aVal = a.columnKey || 'zzz'
        bVal = b.columnKey || 'zzz'
        break
      default:
        aVal = a.name.toLowerCase()
        bVal = b.name.toLowerCase()
    }

    if (aVal < bVal) return columnSortOrder.value === 'asc' ? -1 : 1
    if (aVal > bVal) return columnSortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return result
})

// 페이징된 데이터 (모든 데이터 펼치기 토글 반영)
const paginatedColumns = computed(() => {
  const columns = filteredAndSortedColumns.value
  if (columnShowAll.value) return columns
  const start = (columnPage.value - 1) * rowsPerPage.value
  const end = start + rowsPerPage.value
  return columns.slice(start, end)
})

// 필터링된 인덱스 데이터
const filteredIndexes = computed(() => {
  const indexes = Object.values(groupedIndexes.value)

  // 통합 검색 필터
  if (globalSearchQuery.value) {
    const query = globalSearchQuery.value.toLowerCase()
    return indexes.filter((index) => {
      return index.name.toLowerCase().includes(query) || index.columns.some((c) => c.columnName.toLowerCase().includes(query)) || (index.type && index.type.toLowerCase().includes(query))
    })
  }

  return indexes
})

const paginatedIndexes = computed(() => {
  const indexes = filteredIndexes.value
  if (indexShowAll.value) return indexes
  const start = (indexPage.value - 1) * rowsPerPage.value
  const end = start + rowsPerPage.value
  return indexes.slice(start, end)
})

// 필터링된 제약조건 데이터
const filteredConstraints = computed(() => {
  const constraints = Object.values(groupedConstraints.value)

  // 통합 검색 필터
  if (globalSearchQuery.value) {
    const query = globalSearchQuery.value.toLowerCase()
    return constraints.filter((constraint) => {
      return constraint.name.toLowerCase().includes(query) || constraint.type.toLowerCase().includes(query) || constraint.columns.some((col) => col.toLowerCase().includes(query))
    })
  }

  return constraints
})

const paginatedConstraints = computed(() => {
  const constraints = filteredConstraints.value
  if (constraintShowAll.value) return constraints
  const start = (constraintPage.value - 1) * rowsPerPage.value
  const end = start + rowsPerPage.value
  return constraints.slice(start, end)
})

// 페이지 수 계산 (필터링된 데이터 기준)
const columnPages = computed(() => {
  const total = filteredAndSortedColumns.value.length
  return Math.ceil(total / rowsPerPage.value)
})

const indexPages = computed(() => {
  return Math.ceil(filteredIndexes.value.length / rowsPerPage.value)
})

const constraintPages = computed(() => {
  return Math.ceil(filteredConstraints.value.length / rowsPerPage.value)
})

// 필터링된 컬럼 개수
const filteredColumnCount = computed(() => {
  return filteredAndSortedColumns.value.length
})

// 테이블 구조 조회
async function loadTableStructure() {
  if (!props.tableName) {
    tableStructure.value = null
    relationships.value = { outgoing: [], incoming: [] }
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
    const [structureResponse, relationshipsResponse] = await Promise.all([fetch(`${apiBaseUrl}/db/tables/${encodeURIComponent(props.tableName)}/structure`), fetch(`${apiBaseUrl}/db/relationships/${encodeURIComponent(props.tableName)}`)])

    const structureData = await structureResponse.json()
    const relationshipsData = await relationshipsResponse.json()

    if (!structureResponse.ok) {
      if (structureResponse.status === 503) {
        throw new Error(structureData.message || '데이터베이스 연결이 없습니다.')
      }
      if (structureResponse.status === 500) {
        const errorMsg = structureData.message || structureData.error || '테이블 구조를 불러오는데 실패했습니다.'
        throw new Error(`${errorMsg} (테이블: ${props.tableName})`)
      }
      throw new Error(structureData.error || '테이블 구조를 불러오는데 실패했습니다.')
    }

    if (structureData.success && structureData.data) {
      tableStructure.value = structureData.data
    } else {
      throw new Error('응답 데이터 형식이 올바르지 않습니다.')
    }

    // 외래키 관계 처리
    if (relationshipsData.success && relationshipsData.data) {
      const allRelationships = relationshipsData.data
      relationships.value = {
        outgoing: allRelationships.filter((rel) => rel.fromTable === props.tableName),
        incoming: allRelationships.filter((rel) => rel.toTable === props.tableName),
      }
    } else {
      relationships.value = { outgoing: [], incoming: [] }
    }
  } catch (err) {
    if (err.name === 'TypeError' && err.message?.includes('Failed to fetch')) {
      error.value = '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.'
    } else {
      error.value = err.message || '테이블 구조를 불러오는데 실패했습니다.'
    }
    relationships.value = { outgoing: [], incoming: [] }
  } finally {
    isLoading.value = false
  }
}

// 테이블 클릭 핸들러 (관련 테이블로 이동)
function handleTableClick(tableName) {
  // Custom event를 사용하여 테이블 선택 이벤트 발생
  window.dispatchEvent(new CustomEvent('database-table-selected', { detail: { tableName } }))
}

// 숫자 포맷팅
function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('ko-KR').format(num)
}

// 컬럼 정렬 핸들러
function handleColumnSort(sortBy) {
  if (columnSortBy.value === sortBy) {
    columnSortOrder.value = columnSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    columnSortBy.value = sortBy
    columnSortOrder.value = 'asc'
  }
  // 정렬 변경 시 첫 페이지로 이동
  columnPage.value = 1
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
      // 필터 및 정렬 초기화
      globalSearchQuery.value = ''
      columnFilterType.value = 'all'
      columnSortBy.value = 'name'
      columnSortOrder.value = 'asc'
    } else {
      tableStructure.value = null
      error.value = null
    }
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
// 섹션 타이틀
.table-detail-section-title {
  font-weight: 600;
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
    padding: 4px 8px;
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

  // 고정 컬럼 (컬럼명)
  .sticky-column-left {
    position: sticky;
    left: 0;
    z-index: 2;
    background-color: var(--nexa-table-header-bg);
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  }

  tbody tr td:nth-child(1) {
    position: sticky;
    left: 0;
    z-index: 1;
    background-color: inherit;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  }

  tbody tr:hover td:nth-child(1) {
    background-color: var(--nexa-table-row-hover-bg);
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

  // 페이징 푸터 스타일
  tfoot {
    tr {
      background-color: var(--nexa-table-bg);
      border-top: 1px solid var(--nexa-table-border);
    }

    // td {
    //   padding: 2px 4px;
    //   background-color: var(--nexa-table-bg);
    // }
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
    padding: 3px 16px;
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

  // 페이징 푸터 스타일
  tfoot {
    tr {
      background-color: var(--nexa-table-bg);
      border-top: 1px solid var(--nexa-table-border);
    }
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
    padding: 3px 16px;
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

  // 페이징 푸터 스타일
  tfoot {
    tr {
      background-color: var(--nexa-table-bg);
      border-top: 1px solid var(--nexa-table-border);
    }

    // td {
    //   padding: 2px 4px;
    //   background-color: var(--nexa-table-bg);
    // }
  }
}

// 외래키 관계 테이블 스타일
.relationship-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 0.875rem;
  border: 1px solid var(--nexa-table-border);

  thead {
    background-color: var(--nexa-table-header-bg);
    th {
      border-bottom: 1px solid var(--nexa-table-border);
      background-color: var(--nexa-table-header-bg);
      color: var(--nexa-table-header-text);
      font-weight: 600;
      padding: 4px 8px;
      text-align: left;
    }
  }

  tbody {
    tr {
      background-color: var(--nexa-table-bg);
      color: var(--nexa-table-text);

      &:hover {
        background-color: var(--nexa-table-row-hover-bg);
      }
    }

    td {
      background-color: inherit;
      border-bottom: 1px solid var(--nexa-table-border);
      color: var(--nexa-table-text);
      padding: 4px 8px;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  // 컬럼별 폭 조정
  th:nth-child(1),
  td:nth-child(1) {
    width: 20%; // 테이블명
  }

  th:nth-child(2),
  td:nth-child(2) {
    width: 20%; // 참조 컬럼
  }

  th:nth-child(3),
  td:nth-child(3) {
    width: 20%; // 로컬 컬럼
  }

  th:nth-child(4),
  td:nth-child(4) {
    width: 20%; // 제약조건
  }
}

// 관계 테이블명 클릭 가능 스타일
.relationship-table-name {
  color: var(--nexa-primary);
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: var(--nexa-primary);
  text-underline-offset: 2px;

  &:hover {
    color: var(--nexa-button-primary-bg);
    text-decoration-color: var(--nexa-button-primary-bg);
  }
}

// 제약조건 칩 스타일 (블랙 배경)
.constraint-badge {
  background-color: var(--nexa-background) !important;
  padding: 3px 8px 6px 8px !important;
}

// 페이징 컨트롤 공통 스타일
.table-pagination {
  padding: 2px 8px !important;
}
</style>
