<!-- SqlQueryEditor.vue
  SQL 쿼리 편집기 컴포넌트
  SQL 쿼리 작성 및 실행 기능 제공
-->

<template>
  <div class="sql-query-editor">
    <!-- 툴바 -->
    <div class="sql-editor-toolbar q-mr-xs row items-center justify-between">
      <div class="row items-center q-gutter-sm">
        <q-btn color="primary" icon="play_arrow" label="실행" @click="handleExecute" :loading="isExecuting" />
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
      </div>
      <div class="row items-center q-gutter-sm">
        <!-- 선택된 테이블 빠른 액션 -->
        <q-btn-dropdown v-if="selectedTable" flat dense :label="selectedTable" icon="table_chart" color="primary">
          <q-list>
            <q-item clickable v-close-popup @click="loadTableCopyQuery">
              <q-item-section avatar>
                <q-icon name="content_copy" />
              </q-item-section>
              <q-item-section>
                <q-item-label>테이블 복사 쿼리</q-item-label>
                <q-item-label caption>구조 및 데이터 복사</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="loadTableDescribeQuery">
              <q-item-section avatar>
                <q-icon name="info" />
              </q-item-section>
              <q-item-section>
                <q-item-label>구조 조회</q-item-label>
                <q-item-label caption>DESCRIBE / SHOW CREATE TABLE</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="loadTableSelectQuery">
              <q-item-section avatar>
                <q-icon name="search" />
              </q-item-section>
              <q-item-section>
                <q-item-label>데이터 조회</q-item-label>
                <q-item-label caption>SELECT * FROM ... LIMIT 100</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="loadTableCountQuery">
              <q-item-section avatar>
                <q-icon name="filter_list" />
              </q-item-section>
              <q-item-section>
                <q-item-label>행 수 조회</q-item-label>
                <q-item-label caption>SELECT COUNT(*) FROM ...</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="loadTableStatsQuery">
              <q-item-section avatar>
                <q-icon name="bar_chart" />
              </q-item-section>
              <q-item-section>
                <q-item-label>통계 조회</q-item-label>
                <q-item-label caption>테이블 메타데이터 및 통계</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="loadTableIndexQuery">
              <q-item-section avatar>
                <q-icon name="view_list" />
              </q-item-section>
              <q-item-section>
                <q-item-label>인덱스 조회</q-item-label>
                <q-item-label caption>SHOW INDEX FROM ...</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="loadTableForeignKeyQuery">
              <q-item-section avatar>
                <q-icon name="link" />
              </q-item-section>
              <q-item-section>
                <q-item-label>외래키 조회</q-item-label>
                <q-item-label caption>FOREIGN KEY 관계 확인</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="loadTableInsertTemplate">
              <q-item-section avatar>
                <q-icon name="add" />
              </q-item-section>
              <q-item-section>
                <q-item-label>INSERT 템플릿</q-item-label>
                <q-item-label caption>데이터 삽입 쿼리</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="loadTableUpdateTemplate">
              <q-item-section avatar>
                <q-icon name="edit" />
              </q-item-section>
              <q-item-section>
                <q-item-label>UPDATE 템플릿</q-item-label>
                <q-item-label caption>데이터 수정 쿼리</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="loadTableDeleteTemplate">
              <q-item-section avatar>
                <q-icon name="delete" />
              </q-item-section>
              <q-item-section>
                <q-item-label>DELETE 템플릿</q-item-label>
                <q-item-label caption>데이터 삭제 쿼리</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="loadTableTruncateQuery">
              <q-item-section avatar>
                <q-icon name="clear_all" />
              </q-item-section>
              <q-item-section>
                <q-item-label>TRUNCATE</q-item-label>
                <q-item-label caption>테이블 데이터 전체 삭제</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="loadTableDropQuery">
              <q-item-section avatar>
                <q-icon name="delete_forever" />
              </q-item-section>
              <q-item-section>
                <q-item-label>DROP TABLE</q-item-label>
                <q-item-label caption>테이블 삭제 (주의!)</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn flat icon="clear" label="초기화" @click="handleClear" />
        <q-btn flat icon="save" label="저장" @click="handleSave" />
        <q-btn flat icon="history" label="히스토리" @click="handleShowHistory" />
      </div>
    </div>

    <!-- 쿼리 편집 영역 -->
    <div class="sql-query-section">
      <div class="sql-query-header q-pa-sm">
        <q-icon name="code" size="16px" class="q-mr-xs" />
        <span>SQL 쿼리</span>
      </div>
      <q-input v-model="query" type="textarea" placeholder="SQL 쿼리를 입력하세요..." :rows="15" outlined class="sql-textarea q-mr-xs" />
    </div>

    <!-- 결과 영역 -->
    <div class="sql-result-section">
      <div class="sql-result-header q-pa-sm row items-center justify-between">
        <div class="row items-center">
          <q-icon name="table_chart" size="16px" class="q-mr-xs" />
          <span>결과</span>
          <q-badge v-if="resultRowCount > 0" color="primary" class="q-ml-sm"> {{ formatNumber(resultRowCount) }}개 행 </q-badge>
        </div>
        <q-btn flat dense icon="download" label="내보내기" size="sm" @click="handleExport" v-if="resultRowCount > 0" />
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
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// 상태
const query = ref('')
const isExecuting = ref(false)
const result = ref(null)
const error = ref(null)
const selectedTable = ref(null)

// 결과 컬럼 추출
const resultColumns = computed(() => {
  if (!result.value || result.value.length === 0) return []
  return Object.keys(result.value[0])
})

// 결과 행 수
const resultRowCount = computed(() => {
  return result.value ? result.value.length : 0
})

// 쿼리에서 테이블명 추출 (CREATE TABLE, DROP TABLE 등)
function extractTableNameFromQuery(queryText) {
  // CREATE TABLE 테이블명 추출
  const createMatch = queryText.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"]?)(\w+)\1/i)
  if (createMatch) {
    return createMatch[2]
  }

  // DROP TABLE 테이블명 추출
  const dropMatch = queryText.match(/DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?([`"]?)(\w+)\1/i)
  if (dropMatch) {
    return dropMatch[2]
  }

  // CREATE TABLE ... LIKE 테이블명 추출 (복사 쿼리)
  const createLikeMatch = queryText.match(/CREATE\s+TABLE\s+([`"]?)(\w+)\1\s+LIKE/i)
  if (createLikeMatch) {
    return createLikeMatch[2]
  }

  return null
}

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

    if (data.success) {
      // 결과가 있으면 표시
      result.value = data.data || []

      // DDL 쿼리(CREATE TABLE, DROP TABLE 등)인 경우 테이블 목록 새로고침
      // 주석과 공백을 제거한 순수 쿼리 추출
      let cleanQuery = query.value
        .split('\n') // 라인별로 분리
        .map((line) => line.replace(/--.*$/, '').trim()) // 각 라인에서 주석 제거 및 공백 제거
        .filter((line) => line.length > 0) // 빈 라인 제거
        .join(' ') // 다시 공백으로 연결
        .replace(/\/\*[\s\S]*?\*\//g, '') // 블록 주석 제거
        .trim()
        .replace(/\s+/g, ' ') // 여러 공백을 하나로

      console.log('[SqlQueryEditor] 원본 쿼리:', query.value.substring(0, 100))
      console.log('[SqlQueryEditor] 정리된 쿼리:', cleanQuery.substring(0, 100))

      const isDDLQuery = /^\s*CREATE\s+TABLE/i.test(cleanQuery) || /^\s*DROP\s+TABLE/i.test(cleanQuery) || /^\s*ALTER\s+TABLE/i.test(cleanQuery) || /^\s*TRUNCATE\s+TABLE/i.test(cleanQuery)

      console.log('[SqlQueryEditor] 쿼리 실행 성공, DDL 쿼리 여부:', isDDLQuery)

      if (isDDLQuery) {
        console.log('[SqlQueryEditor] DDL 쿼리 감지, 새로고침 이벤트 발생')

        // 테이블 목록 새로고침 (두 가지 방법 모두 사용)
        // 1. DevSidebar를 통한 새로고침 (헤더 정보 업데이트)
        window.dispatchEvent(new CustomEvent('database-viewer-refresh'))
        console.log('[SqlQueryEditor] database-viewer-refresh 이벤트 발생')

        // 2. DatabaseViewerList에 직접 새로고침 이벤트 (즉시 반영)
        window.dispatchEvent(new CustomEvent('database-viewer-list-refresh'))
        console.log('[SqlQueryEditor] database-viewer-list-refresh 이벤트 발생')

        // CREATE TABLE인 경우 생성된 테이블 자동 선택
        const createdTableName = extractTableNameFromQuery(cleanQuery)
        console.log('[SqlQueryEditor] 추출된 테이블명:', createdTableName)

        if (createdTableName && /^\s*CREATE\s+TABLE/i.test(cleanQuery)) {
          console.log('[SqlQueryEditor] 생성된 테이블 자동 선택 예약:', createdTableName)
          // 약간의 지연 후 테이블 선택 (목록 새로고침 완료 대기)
          setTimeout(() => {
            console.log('[SqlQueryEditor] 테이블 선택 이벤트 발생:', createdTableName)
            window.dispatchEvent(
              new CustomEvent('database-table-selected', {
                detail: {
                  tableName: createdTableName,
                },
              }),
            )
          }, 500) // 지연 시간을 500ms로 증가 (새로고침 완료 대기)
        }
      }
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

// 테이블 선택 이벤트 핸들러
function handleTableSelected(event) {
  selectedTable.value = event.detail.tableName
}

// 테이블 복사 쿼리 생성
function loadTableCopyQuery() {
  if (!selectedTable.value) return
  const newTableName = `${selectedTable.value}_copy`
  query.value = `-- 테이블 구조 복사
CREATE TABLE ${newTableName} LIKE ${selectedTable.value};

-- 데이터도 복사하려면 위 쿼리 실행 후 아래 쿼리를 별도로 실행하세요
-- INSERT INTO ${newTableName} SELECT * FROM ${selectedTable.value};`
}

// 테이블 구조 조회 쿼리 생성
function loadTableDescribeQuery() {
  if (!selectedTable.value) return
  query.value = `-- 테이블 구조 조회
DESCRIBE ${selectedTable.value};

-- 또는 상세 구조 조회
-- SHOW CREATE TABLE ${selectedTable.value};

-- 컬럼 정보 조회
-- SHOW COLUMNS FROM ${selectedTable.value};`
}

// 테이블 데이터 조회 쿼리 생성
function loadTableSelectQuery() {
  if (!selectedTable.value) return
  query.value = `-- 테이블 데이터 조회
SELECT * FROM ${selectedTable.value}
LIMIT 100;`
}

// 테이블 행 수 조회 쿼리 생성
function loadTableCountQuery() {
  if (!selectedTable.value) return
  query.value = `-- 테이블 행 수 조회
SELECT COUNT(*) as total_rows FROM ${selectedTable.value};`
}

// 테이블 통계 쿼리 생성
function loadTableStatsQuery() {
  if (!selectedTable.value) return
  query.value = `-- 테이블 통계 조회
SELECT
  TABLE_NAME,
  TABLE_ROWS,
  ROUND(DATA_LENGTH / 1024 / 1024, 2) AS DATA_SIZE_MB,
  ROUND(INDEX_LENGTH / 1024 / 1024, 2) AS INDEX_SIZE_MB,
  ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS TOTAL_SIZE_MB,
  ENGINE,
  TABLE_COLLATION
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = '${selectedTable.value}';`
}

// 테이블 인덱스 조회 쿼리 생성
function loadTableIndexQuery() {
  if (!selectedTable.value) return
  query.value = `-- 테이블 인덱스 조회
SHOW INDEX FROM ${selectedTable.value};

-- 또는 상세 정보
-- SELECT
--   INDEX_NAME,
--   COLUMN_NAME,
--   SEQ_IN_INDEX,
--   NON_UNIQUE,
--   INDEX_TYPE
-- FROM INFORMATION_SCHEMA.STATISTICS
-- WHERE TABLE_SCHEMA = DATABASE()
--   AND TABLE_NAME = '${selectedTable.value}'
-- ORDER BY INDEX_NAME, SEQ_IN_INDEX;`
}

// 테이블 외래키 조회 쿼리 생성
function loadTableForeignKeyQuery() {
  if (!selectedTable.value) return
  query.value = `-- 테이블 외래키 조회
SELECT
  CONSTRAINT_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = '${selectedTable.value}'
  AND REFERENCED_TABLE_NAME IS NOT NULL;`
}

// INSERT 템플릿 생성
function loadTableInsertTemplate() {
  if (!selectedTable.value) return
  query.value = `-- 데이터 삽입
INSERT INTO ${selectedTable.value} (컬럼1, 컬럼2, 컬럼3)
VALUES ('값1', '값2', '값3');

-- 여러 행 삽입
-- INSERT INTO ${selectedTable.value} (컬럼1, 컬럼2, 컬럼3)
-- VALUES
--   ('값1', '값2', '값3'),
--   ('값4', '값5', '값6');`
}

// UPDATE 템플릿 생성
function loadTableUpdateTemplate() {
  if (!selectedTable.value) return
  query.value = `-- 데이터 수정
UPDATE ${selectedTable.value}
SET 컬럼1 = '새값1', 컬럼2 = '새값2'
WHERE 조건컬럼 = '조건값';

-- 주의: WHERE 절을 반드시 포함하세요!
-- WHERE 절 없이 실행하면 모든 행이 수정됩니다.`
}

// DELETE 템플릿 생성
function loadTableDeleteTemplate() {
  if (!selectedTable.value) return
  query.value = `-- 데이터 삭제
DELETE FROM ${selectedTable.value}
WHERE 조건컬럼 = '조건값';

-- 주의: WHERE 절을 반드시 포함하세요!
-- WHERE 절 없이 실행하면 모든 행이 삭제됩니다.`
}

// TRUNCATE 쿼리 생성
function loadTableTruncateQuery() {
  if (!selectedTable.value) return
  $q.dialog({
    title: '테이블 데이터 전체 삭제',
    message: `"${selectedTable.value}" 테이블의 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    query.value = `-- 테이블 데이터 전체 삭제 (주의!)
TRUNCATE TABLE ${selectedTable.value};

-- 또는 DELETE 사용 (더 느리지만 트랜잭션 로그 기록)
-- DELETE FROM ${selectedTable.value};`
  })
}

// DROP TABLE 쿼리 생성
function loadTableDropQuery() {
  if (!selectedTable.value) return
  $q.dialog({
    title: '테이블 삭제',
    message: `"${selectedTable.value}" 테이블을 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    query.value = `-- 테이블 삭제 (주의! 되돌릴 수 없습니다!)
DROP TABLE ${selectedTable.value};

-- 외래키 제약조건이 있는 경우
-- DROP TABLE IF EXISTS ${selectedTable.value} CASCADE;`
  })
}

// 컴포넌트 마운트 시 이벤트 리스너 등록
onMounted(() => {
  window.addEventListener('database-table-selected', handleTableSelected)
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  window.removeEventListener('database-table-selected', handleTableSelected)
})
</script>

<style lang="scss" scoped>
.sql-query-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sql-editor-toolbar {
  border-bottom: 1px solid var(--nexa-border-color);
  flex-shrink: 0;
  margin-top: 8px;
  margin-bottom: 8px;
  padding-bottom: 8px;
}

.sql-query-section {
  flex: 0 0 50%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.sql-query-header {
  font-weight: 600;
  color: var(--nexa-text-primary);
  flex-shrink: 0;
}

.sql-textarea {
  flex: 1;
  overflow: auto;
  min-height: 0;

  :deep(.q-field__control) {
    height: 100%;
  }

  :deep(textarea) {
    font-family: 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.5;
  }
}

.sql-result-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin-top: 8px;
}

.sql-result-header {
  font-weight: 600;
  color: var(--nexa-text-primary);
  flex-shrink: 0;
}

.error-message {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

.result-table-container {
  flex: 1;
  overflow: auto;
  ////border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
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
    background-color: var(--nexa-surface);
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tbody {
    tr {
      &:hover {
        background-color: var(--nexa-surface-hover);
      }
    }

    td {
      color: var(--nexa-text-secondary);
    }
  }
}
</style>
