<!-- DatabaseViewerList.vue
  데이터베이스 뷰어 테이블 목록 컴포넌트
  테이블 목록 표시 및 선택 기능
-->

<template>
  <q-scroll-area class="database-viewer-list-scroll-area">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-section q-pa-lg text-center">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-caption">테이블 목록을 불러오는 중...</div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-section q-pa-lg text-center">
      <q-icon name="error_outline" size="48px" color="negative" class="q-mb-md" />
      <div class="text-body2 text-negative q-mb-sm">{{ error }}</div>
      <q-btn flat dense label="다시 시도" icon="refresh" @click="handleRetry" />
    </div>

    <!-- 테이블 목록 -->
    <q-list v-else separator>
      <q-item
        v-for="table in filteredTables"
        :key="table.name"
        clickable
        :active="selectedTable === table.name"
        active-class="table-item-active"
        @click="handleTableSelect(table.name)"
      >
        <q-item-section avatar>
          <q-icon name="table_view" :color="selectedTable === table.name ? 'primary' : 'grey-7'" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="table-name">{{ table.name }}</q-item-label>
          <q-item-label caption class="table-meta">
            <span v-if="table.columnCount > 0">{{ table.columnCount }}개 컬럼</span>
            <span v-if="table.rowCount !== null" class="q-ml-sm">{{ formatNumber(table.rowCount) }}개 행</span>
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-icon name="chevron_right" color="grey-7" />
        </q-item-section>
      </q-item>

      <!-- 테이블이 없을 때 -->
      <div v-if="filteredTables.length === 0" class="empty-section q-pa-lg text-center">
        <q-icon name="table_view" size="48px" color="grey-7" class="q-mb-md" />
        <div class="text-body2 text-grey-7">
          <span v-if="searchQuery">검색 결과가 없습니다.</span>
          <span v-else>테이블이 없습니다.</span>
        </div>
      </div>
    </q-list>
  </q-scroll-area>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, onMounted, watch } from 'vue'

const props = defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
  refreshTrigger: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['table-selected', 'refresh'])

// 상태
const isLoading = ref(false)
const error = ref(null)
const tables = ref([])
const selectedTable = ref(null)

// 필터링된 테이블 목록
const filteredTables = computed(() => {
  if (!props.searchQuery) {
    return tables.value
  }
  const query = props.searchQuery.toLowerCase()
  return tables.value.filter((table) => table.name.toLowerCase().includes(query))
})

// 테이블 목록 조회
async function loadTables() {
  isLoading.value = true
  error.value = null

  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
    const response = await fetch(`${apiBaseUrl}/db/tables`)
    
    const data = await response.json()

    if (!response.ok) {
      // 503 에러는 데이터베이스 연결 문제
      if (response.status === 503) {
        throw new Error(data.message || '데이터베이스 연결이 없습니다. 서버가 데이터베이스에 연결되지 않았습니다.')
      }
      throw new Error(data.error || '테이블 목록을 불러오는데 실패했습니다.')
    }

    if (data.success && data.data) {
      tables.value = data.data
    } else {
      throw new Error('응답 데이터 형식이 올바르지 않습니다.')
    }
  } catch (err) {
    // ERR_CONNECTION_REFUSED 등 네트워크 에러 처리
    if (err.name === 'TypeError' && err.message?.includes('Failed to fetch')) {
      error.value = '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.'
      console.warn('[DatabaseViewerList] 서버 연결 실패:', err.message)
    } else {
      console.error('[DatabaseViewerList] 테이블 목록 조회 실패:', err)
      error.value = err.message || '테이블 목록을 불러오는데 실패했습니다.'
    }
  } finally {
    isLoading.value = false
  }
}

// 테이블 선택
function handleTableSelect(tableName) {
  selectedTable.value = tableName
  emit('table-selected', tableName)
}

// 다시 시도
function handleRetry() {
  loadTables()
}

// 숫자 포맷팅
function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('ko-KR').format(num)
}

// 검색어 변경 감지
watch(
  () => props.searchQuery,
  () => {
    // 검색어 변경 시 자동으로 필터링됨 (computed)
  }
)

// 컴포넌트 마운트 시 테이블 목록 로드
onMounted(() => {
  loadTables()
})

// refresh 이벤트 리스너
watch(
  () => props.refreshTrigger,
  () => {
    if (props.refreshTrigger > 0) {
      loadTables()
    }
  }
)
</script>

<style lang="scss" scoped>
.database-viewer-list-scroll-area {
  height: 100%;
}

.table-item-active {
  background-color: var(--nexa-surface-hover);
  color: var(--nexa-text-primary);
}

.table-name {
  font-weight: 500;
  color: var(--nexa-text-primary);
}

.table-meta {
  color: var(--nexa-text-secondary);
}

.loading-section,
.error-section,
.empty-section {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>

