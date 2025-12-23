<!-- SqlQueryEditor.vue
  SQL 쿼리 편집기 컴포넌트
  SQL 쿼리 작성 및 실행 기능 제공
-->

<template>
  <div class="sql-query-editor">
    <!-- 툴바 -->
    <div class="sql-editor-toolbar q-pa-md row items-center justify-between">
      <div class="row items-center q-gutter-sm">
        <q-btn
          color="primary"
          icon="play_arrow"
          label="실행"
          @click="handleExecute"
          :loading="isExecuting"
        />
        <q-btn
          flat
          icon="clear"
          label="초기화"
          @click="handleClear"
        />
      </div>
      <div class="row items-center q-gutter-sm">
        <q-btn-dropdown flat icon="description" label="샘플 쿼리" @click="handleLoadSample">
          <q-list>
            <q-item clickable v-close-popup @click="loadSampleQuery('select')">
              <q-item-section avatar>
                <q-icon name="search" />
              </q-item-section>
              <q-item-section>
                <q-item-label>SELECT - 테이블 조회</q-item-label>
                <q-item-label caption>모든 데이터 조회</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="loadSampleQuery('insert')">
              <q-item-section avatar>
                <q-icon name="add" />
              </q-item-section>
              <q-item-section>
                <q-item-label>INSERT - 데이터 삽입</q-item-label>
                <q-item-label caption>새 레코드 추가</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="loadSampleQuery('update')">
              <q-item-section avatar>
                <q-icon name="edit" />
              </q-item-section>
              <q-item-section>
                <q-item-label>UPDATE - 데이터 수정</q-item-label>
                <q-item-label caption>레코드 업데이트</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="loadSampleQuery('delete')">
              <q-item-section avatar>
                <q-icon name="delete" />
              </q-item-section>
              <q-item-section>
                <q-item-label>DELETE - 데이터 삭제</q-item-label>
                <q-item-label caption>레코드 삭제</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="loadSampleQuery('create_table')">
              <q-item-section avatar>
                <q-icon name="table_chart" />
              </q-item-section>
              <q-item-section>
                <q-item-label>CREATE TABLE - 테이블 생성</q-item-label>
                <q-item-label caption>새 테이블 만들기</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="loadSampleQuery('alter_table')">
              <q-item-section avatar>
                <q-icon name="tune" />
              </q-item-section>
              <q-item-section>
                <q-item-label>ALTER TABLE - 테이블 수정</q-item-label>
                <q-item-label caption>테이블 구조 변경</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="loadSampleQuery('show_tables')">
              <q-item-section avatar>
                <q-icon name="list" />
              </q-item-section>
              <q-item-section>
                <q-item-label>SHOW TABLES - 테이블 목록</q-item-label>
                <q-item-label caption>모든 테이블 보기</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn flat icon="save" label="저장" @click="handleSave" />
        <q-btn flat icon="history" label="히스토리" @click="handleShowHistory" />
      </div>
    </div>

    <!-- 쿼리 편집 영역 -->
    <div class="sql-editor-splitter">
      <!-- 왼쪽: 쿼리 편집기 -->
      <div class="sql-editor-panel">
        <div class="sql-editor-header q-pa-sm">
          <q-icon name="code" size="16px" class="q-mr-xs" />
          <span>SQL 쿼리</span>
        </div>
        <q-input
          v-model="query"
          type="textarea"
          placeholder="SQL 쿼리를 입력하세요..."
          :rows="20"
          outlined
          class="sql-textarea q-pa-md"
        />
      </div>

      <!-- 오른쪽: 결과 영역 -->
      <div class="sql-result-panel">
        <div class="sql-result-header q-pa-sm row items-center justify-between">
          <div class="row items-center">
            <q-icon name="table_chart" size="16px" class="q-mr-xs" />
            <span>결과</span>
            <q-badge v-if="resultRowCount > 0" color="primary" class="q-ml-sm">
              {{ formatNumber(resultRowCount) }}개 행
            </q-badge>
          </div>
          <q-btn
            flat
            dense
            icon="download"
            label="내보내기"
            size="sm"
            @click="handleExport"
            v-if="resultRowCount > 0"
          />
        </div>
        <!-- 에러 메시지 -->
        <div v-if="error" class="error-message q-pa-md">
          <q-icon name="error_outline" size="24px" color="negative" class="q-mb-sm" />
          <div class="text-negative">{{ error }}</div>
        </div>

        <!-- 결과 테이블 -->
        <div v-else-if="result && result.length > 0" class="result-table-container q-pa-md">
          <table class="result-table">
            <thead>
              <tr>
                <th v-for="column in resultColumns" :key="column">{{ column }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in result" :key="index">
                <td v-for="column in resultColumns" :key="column">
                  {{ row[column] !== null && row[column] !== undefined ? row[column] : 'NULL' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 빈 상태 -->
        <div v-else class="empty-state text-center q-pa-lg">
          <q-icon name="code" size="48px" color="grey-7" class="q-mb-md" />
          <div class="text-body2 text-grey-7">쿼리를 실행하면 결과가 여기에 표시됩니다.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// 상태
const query = ref('')
const isExecuting = ref(false)
const result = ref(null)
const error = ref(null)

// 결과 컬럼 추출
const resultColumns = computed(() => {
  if (!result.value || result.value.length === 0) return []
  return Object.keys(result.value[0])
})

// 결과 행 수
const resultRowCount = computed(() => {
  return result.value ? result.value.length : 0
})

// 쿼리 실행
async function handleExecute() {
  if (!query.value.trim()) {
    $q.notify({
      type: 'warning',
      message: '쿼리를 입력하세요.',
    })
    return
  }

  isExecuting.value = true
  error.value = null
  result.value = null

  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
    const response = await fetch(`${apiBaseUrl}/db/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: query.value }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || '쿼리 실행에 실패했습니다.')
    }

    if (data.success && data.data) {
      result.value = data.data
    } else {
      result.value = []
    }
  } catch (err) {
    error.value = err.message || '쿼리 실행 중 오류가 발생했습니다.'
    console.error('[SqlQueryEditor] 쿼리 실행 실패:', err)
  } finally {
    isExecuting.value = false
  }
}

// 초기화
function handleClear() {
  query.value = ''
  result.value = null
  error.value = null
}

// 저장
function handleSave() {
  // TODO: 쿼리 저장 기능 구현
  $q.notify({
    type: 'info',
    message: '쿼리 저장 기능은 곧 구현될 예정입니다.',
  })
}

// 히스토리
function handleShowHistory() {
  // TODO: 쿼리 히스토리 기능 구현
  $q.notify({
    type: 'info',
    message: '쿼리 히스토리 기능은 곧 구현될 예정입니다.',
  })
}

// 내보내기
function handleExport() {
  // TODO: 결과 내보내기 기능 구현
  $q.notify({
    type: 'info',
    message: '결과 내보내기 기능은 곧 구현될 예정입니다.',
  })
}

// 샘플 쿼리 로드
function loadSampleQuery(type) {
  const sampleQueries = {
    select: `-- 모든 데이터 조회
SELECT * FROM 테이블명
LIMIT 100;`,

    insert: `-- 데이터 삽입
INSERT INTO 테이블명 (컬럼1, 컬럼2, 컬럼3)
VALUES ('값1', '값2', '값3');`,

    update: `-- 데이터 수정
UPDATE 테이블명
SET 컬럼1 = '새값1', 컬럼2 = '새값2'
WHERE id = 1;`,

    delete: `-- 데이터 삭제
DELETE FROM 테이블명
WHERE id = 1;`,

    create_table: `-- 테이블 생성
CREATE TABLE 테이블명 (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    alter_table: `-- 테이블 수정 (컬럼 추가)
ALTER TABLE 테이블명
ADD COLUMN 새컬럼명 VARCHAR(255) AFTER 기존컬럼명;

-- 컬럼 수정
ALTER TABLE 테이블명
MODIFY COLUMN 컬럼명 VARCHAR(500);

-- 컬럼 삭제
ALTER TABLE 테이블명
DROP COLUMN 컬럼명;`,

    show_tables: `-- 테이블 목록 조회
SHOW TABLES;

-- 또는
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE();`,
  }

  query.value = sampleQueries[type] || ''
}

// 샘플 쿼리 로드 (빈 함수, 드롭다운이 자동으로 열림)
function handleLoadSample() {
  // 드롭다운이 자동으로 열리므로 별도 처리 불필요
}

// 숫자 포맷팅
function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('ko-KR').format(num)
}
</script>

<style lang="scss" scoped>
.sql-query-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-background);
}

.sql-editor-toolbar {
  border-bottom: 1px solid var(--nexa-border-color);
  background-color: var(--nexa-surface);
  flex-shrink: 0;
}

.sql-editor-splitter {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sql-editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--nexa-border-color);
  background-color: var(--nexa-surface);
}

.sql-editor-header {
  border-bottom: 1px solid var(--nexa-border-color);
  background-color: var(--nexa-surface);
  font-weight: 600;
  color: var(--nexa-text-primary);
  flex-shrink: 0;
}

.sql-textarea {
  flex: 1;
  overflow: auto;

  :deep(.q-field__control) {
    height: 100%;
  }

  :deep(textarea) {
    font-family: 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.5;
  }
}

.sql-result-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-surface);
}

.sql-result-header {
  border-bottom: 1px solid var(--nexa-border-color);
  background-color: var(--nexa-surface);
  font-weight: 600;
  color: var(--nexa-text-primary);
  flex-shrink: 0;
}

.sql-result-panel {
  flex: 1;
  overflow: auto;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.result-table-container {
  overflow-x: auto;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;

  th,
  td {
    padding: 8px 12px;
    text-align: left;
    border: 1px solid var(--nexa-border-color);
  }

  thead th {
    background-color: var(--nexa-table-header-bg);
    color: var(--nexa-table-header-text);
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tbody {
    tr {
      background-color: var(--nexa-table-bg);

      &:hover {
        background-color: var(--nexa-table-row-hover-bg);
      }
    }

    td {
      color: var(--nexa-table-text);
    }
  }
}
</style>

