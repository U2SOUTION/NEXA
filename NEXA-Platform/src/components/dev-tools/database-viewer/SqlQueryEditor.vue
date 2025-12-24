<!-- SqlQueryEditor.vue
  SQL 쿼리 편집기 컴포넌트
  SQL 쿼리 작성 및 실행 기능 제공
-->

<template>
  <div class="sql-query-editor">
    <!-- 툴바 -->
    <div class="sql-editor-toolbar q-mr-xs row items-center justify-between">
      <div class="row items-center sql-toolbar-left">
        <q-btn color="primary" icon="play_arrow" label="실행" @click="handleExecute" :loading="isExecuting" />
        <q-btn-dropdown flat icon="description" label="샘플 쿼리" @click="handleLoadSample" dense>
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
      <div class="row items-center sql-toolbar-right">
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
        <q-btn flat icon="clear" label="초기화" @click="handleClear" dense />
        <q-btn flat icon="save" label="쿼리저장" @click="handleSave" dense />
        <q-btn flat icon="bookmark" label="저장쿼리" @click="handleShowSavedQueries" dense />
        <q-btn flat icon="history" label="히스토리" @click="handleShowHistory" dense />
      </div>
    </div>

    <!-- 쿼리 편집 영역 -->
    <div class="sql-query-section">
      <div class="sql-query-header q-pa-sm">
        <q-icon name="code" size="16px" class="q-mr-xs" />
        <span>SQL 쿼리</span>
      </div>
      <q-input v-model="query" type="textarea" placeholder="SQL 쿼리를 입력하세요..." :rows="4" autogrow outlined class="sql-textarea q-mr-xs" />
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
        <!-- 실행 정보 -->
        <pre v-if="executionTime" class="execution-info">{{ getExecutionInfo() }}</pre>
      </div>

      <!-- 빈 상태 -->
      <div v-else class="empty-state q-pa-lg">
        <div v-if="executionTime" class="text-center q-mb-md">
          <pre class="execution-info">{{ getExecutionInfo() }}</pre>
        </div>
        <div v-else class="text-center">
          <q-icon name="code" size="48px" color="grey-7" class="q-mb-md" />
          <div class="text-body2 text-grey-7">쿼리를 실행하면 결과가 여기에 표시됩니다.</div>
        </div>
      </div>
    </div>

    <!-- 저장된 쿼리 다이얼로그 -->
    <q-dialog v-model="showSavedQueriesDialog">
      <q-card style="min-width: 500px; max-width: 700px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">저장된 쿼리</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="savedQueries.length === 0" class="text-center q-pa-lg">
          <q-icon name="inbox" size="48px" color="grey-7" class="q-mb-md" />
          <div class="text-body2 text-grey-7">저장된 쿼리가 없습니다.</div>
        </q-card-section>

        <q-card-section v-else class="q-pa-none">
          <q-list separator>
            <q-item v-for="savedQuery in savedQueries" :key="savedQuery.id" clickable v-ripple @click="loadSavedQuery(savedQuery)">
              <q-item-section>
                <q-item-label>{{ savedQuery.name }}</q-item-label>
                <q-item-label caption>
                  {{ new Date(savedQuery.updatedAt).toLocaleString('ko-KR') }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round dense icon="delete" color="negative" @click.stop="confirmDeleteQuery(savedQuery)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 쿼리 실행 히스토리 다이얼로그 -->
    <q-dialog v-model="showHistoryDialog">
      <q-card style="min-width: 500px; max-width: 700px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">쿼리 실행 히스토리</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="queryHistory.length === 0" class="text-center q-pa-lg">
          <q-icon name="history" size="48px" color="grey-7" class="q-mb-md" />
          <div class="text-body2 text-grey-7">실행한 쿼리가 없습니다.</div>
        </q-card-section>

        <q-card-section v-else class="q-pa-none">
          <q-list separator>
            <q-item v-for="(historyItem, index) in queryHistory" :key="historyItem.id" clickable v-ripple @click="loadHistoryQuery(historyItem)">
              <q-item-section>
                <q-item-label class="text-caption text-grey-7">쿼리 {{ queryHistory.length - index }}</q-item-label>
                <q-item-label caption class="text-body2" style="white-space: pre-wrap; word-break: break-all"> {{ historyItem.query.substring(0, 100) }}{{ historyItem.query.length > 100 ? '...' : '' }} </q-item-label>
                <q-item-label caption>
                  {{ new Date(historyItem.executedAt).toLocaleString('ko-KR') }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 추가 가능한 기능 목록 -->
    <div class="q-pa-md">
      <pre class="feature-list">
추가 가능한 기능
1. 쿼리 결과 관련
  결과 내보내기: CSV, JSON, Excel
  결과 복사: 클립보드 복사
  결과 페이징: 대용량 결과 처리
  결과 필터링/정렬: 클라이언트 측 필터링
  결과 차트: 그래프/차트 시각화
2. 쿼리 편집 기능
  SQL 문법 하이라이팅: 코드 색상 구분
  자동 완성: 테이블/컬럼명 자동완성
  쿼리 포맷팅: 자동 정렬
  쿼리 검증: 실행 전 문법 검사
  다중 쿼리 실행: 세미콜론으로 구분된 여러 쿼리 실행
3. 성능/분석 기능
  실행 시간 표시: 쿼리 실행 시간 측정
  실행 계획: EXPLAIN 결과 표시
  느린 쿼리 감지: 실행 시간 경고
  쿼리 최적화 제안: 인덱스 사용 제안 등
4. 편의 기능
  즐겨찾기: 자주 사용하는 쿼리 즐겨찾기
  카테고리/태그: 저장된 쿼리 분류
  검색: 저장된 쿼리 검색
  쿼리 비교: 두 쿼리 결과 비교
  변수 바인딩: 파라미터화된 쿼리 지원
5. 보안/안전 기능
  위험 쿼리 경고: DROP, DELETE 등 경고
  실행 전 확인: DDL/DML 쿼리 확인 다이얼로그
  롤백 시뮬레이션: 트랜잭션 미리보기
  쿼리 로깅: 실행 이력 상세 기록
6. 협업 기능
  쿼리 공유: 팀원과 쿼리 공유
  주석/설명: 쿼리에 설명 추가
  버전 관리: 쿼리 버전 추적
7. 고급 기능
  스케줄링: 정기 실행
  알림: 쿼리 완료 알림
  백업/복원: 쿼리 백업
  템플릿 라이브러리: 재사용 가능한 템플릿

우선순위 제안
결과 내보내기 (CSV/JSON)
SQL 문법 하이라이팅
실행 시간 표시
쿼리 포맷팅
결과 복사 기능</pre
      >
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
const showSavedQueriesDialog = ref(false)
const savedQueries = ref([])
const showHistoryDialog = ref(false)
const queryHistory = ref([])
const executionTime = ref(null)
const affectedRows = ref(null)

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
  executionTime.value = null
  affectedRows.value = null

  const startTime = performance.now()

  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
    const response = await fetch(`${apiBaseUrl}/db/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: query.value }),
    })

    const endTime = performance.now()
    executionTime.value = ((endTime - startTime) / 1000).toFixed(3)

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || '쿼리 실행에 실패했습니다.')
    }

    if (data.success) {
      // 결과가 있으면 표시
      result.value = data.data || []
      affectedRows.value = data.affectedRows || null

      // 쿼리 실행 히스토리에 추가
      addToHistory(query.value)

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

// 로컬 스토리지에서 저장된 쿼리 목록 가져오기
function getSavedQueries() {
  try {
    const saved = localStorage.getItem('saved-sql-queries')
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error('[SqlQueryEditor] 저장된 쿼리 불러오기 실패:', error)
    return []
  }
}

// 로컬 스토리지에 쿼리 목록 저장
function saveQueriesToStorage(queries) {
  try {
    localStorage.setItem('saved-sql-queries', JSON.stringify(queries))
  } catch (error) {
    console.error('[SqlQueryEditor] 쿼리 저장 실패:', error)
    throw error
  }
}

// 저장
function handleSave() {
  if (!query.value.trim()) {
    $q.notify({
      type: 'warning',
      message: '저장할 쿼리를 입력하세요.',
    })
    return
  }

  $q.dialog({
    title: '쿼리 저장',
    message: '저장할 쿼리의 이름을 입력하세요.',
    prompt: {
      model: '',
      type: 'text',
      placeholder: '예: 월별 매출 조회',
      isValid: (val) => val && val.trim().length > 0,
      attrs: {
        maxlength: 100,
      },
    },
    cancel: true,
    persistent: true,
  }).onOk((queryName) => {
    try {
      const savedQueries = getSavedQueries()
      const trimmedName = queryName.trim()

      // 중복 이름 확인
      const existingIndex = savedQueries.findIndex((q) => q.name === trimmedName)
      const now = new Date().toISOString()

      if (existingIndex >= 0) {
        // 기존 쿼리 업데이트
        savedQueries[existingIndex].query = query.value
        savedQueries[existingIndex].updatedAt = now
        $q.notify({
          type: 'info',
          message: `"${trimmedName}" 쿼리가 업데이트되었습니다.`,
        })
      } else {
        // 새 쿼리 추가
        const newQuery = {
          id: `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: trimmedName,
          query: query.value,
          createdAt: now,
          updatedAt: now,
        }
        savedQueries.push(newQuery)
        $q.notify({
          type: 'positive',
          message: `"${trimmedName}" 쿼리가 저장되었습니다.`,
        })
      }

      // 생성일 기준 내림차순 정렬 (최신순)
      savedQueries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      saveQueriesToStorage(savedQueries)

      // 다이얼로그의 목록 새로고침
      if (showSavedQueriesDialog.value) {
        savedQueries.value = getSavedQueries()
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: `쿼리 저장 실패: ${error.message}`,
      })
    }
  })
}

// 저장된 쿼리 목록 표시
function handleShowSavedQueries() {
  savedQueries.value = getSavedQueries()
  showSavedQueriesDialog.value = true
}

// 저장된 쿼리 불러오기
function loadSavedQuery(savedQuery) {
  query.value = savedQuery.query
  showSavedQueriesDialog.value = false
  $q.notify({
    type: 'positive',
    message: `"${savedQuery.name}" 쿼리를 불러왔습니다.`,
  })
}

// 히스토리 관련 함수들
// 로컬 스토리지에서 쿼리 히스토리 가져오기
function getQueryHistory() {
  try {
    const history = localStorage.getItem('sql-query-history')
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error('[SqlQueryEditor] 히스토리 불러오기 실패:', error)
    return []
  }
}

// 로컬 스토리지에 쿼리 히스토리 저장
function saveQueryHistoryToStorage(history) {
  try {
    localStorage.setItem('sql-query-history', JSON.stringify(history))
  } catch (error) {
    console.error('[SqlQueryEditor] 히스토리 저장 실패:', error)
    throw error
  }
}

// 히스토리에 쿼리 추가
function addToHistory(queryText) {
  try {
    const history = getQueryHistory()
    const now = new Date().toISOString()

    // 중복 제거: 동일한 쿼리가 최근에 실행되었으면 제거
    const trimmedQuery = queryText.trim()
    const existingIndex = history.findIndex((h) => h.query.trim() === trimmedQuery)
    if (existingIndex >= 0) {
      history.splice(existingIndex, 1)
    }

    // 새 히스토리 항목 추가
    const newHistoryItem = {
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      query: queryText,
      executedAt: now,
    }

    history.unshift(newHistoryItem)

    // 최대 100개까지만 저장
    if (history.length > 100) {
      history.splice(100)
    }

    saveQueryHistoryToStorage(history)
    queryHistory.value = history
  } catch (error) {
    console.error('[SqlQueryEditor] 히스토리 추가 실패:', error)
  }
}

// 히스토리 표시
function handleShowHistory() {
  queryHistory.value = getQueryHistory()
  showHistoryDialog.value = true
}

// 히스토리에서 쿼리 불러오기
function loadHistoryQuery(historyItem) {
  query.value = historyItem.query
  showHistoryDialog.value = false
  $q.notify({
    type: 'positive',
    message: '쿼리를 불러왔습니다.',
  })
}

// 쿼리 삭제 확인
function confirmDeleteQuery(savedQuery) {
  $q.dialog({
    title: '쿼리 삭제',
    message: `"${savedQuery.name}" 쿼리를 삭제하시겠습니까?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    if (deleteSavedQuery(savedQuery.id)) {
      savedQueries.value = getSavedQueries()
      $q.notify({
        type: 'positive',
        message: `"${savedQuery.name}" 쿼리가 삭제되었습니다.`,
      })
    } else {
      $q.notify({
        type: 'negative',
        message: '쿼리 삭제에 실패했습니다.',
      })
    }
  })
}

// 저장된 쿼리 삭제
function deleteSavedQuery(queryId) {
  try {
    const savedQueries = getSavedQueries()
    const filtered = savedQueries.filter((q) => q.id !== queryId)
    saveQueriesToStorage(filtered)
    return true
  } catch (error) {
    console.error('[SqlQueryEditor] 쿼리 삭제 실패:', error)
    return false
  }
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

// 실행 정보 포맷팅
function getExecutionInfo() {
  let info = `실행 시간: ${executionTime.value}초`
  if (result.value && result.value.length > 0) {
    info += `\n반환된 행 수: ${formatNumber(result.value.length)}개`
  }
  if (affectedRows.value !== null && affectedRows.value !== undefined) {
    info += `\n영향받은 행 수: ${formatNumber(affectedRows.value)}개`
  }
  return info
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

  // 히스토리 불러오기
  queryHistory.value = getQueryHistory()

  // 마운트 시 현재 선택된 테이블 확인
  // 약간의 지연을 두어 다른 컴포넌트가 먼저 마운트되도록 함
  setTimeout(() => {
    // 선택된 테이블이 없으면 DatabaseViewerList에 요청
    if (!selectedTable.value) {
      window.dispatchEvent(new CustomEvent('database-viewer-request-selected-table'))
    }
  }, 200)
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
  flex-wrap: nowrap;
  gap: 4px;
}

.sql-toolbar-left,
.sql-toolbar-right {
  gap: 4px;
  flex-wrap: nowrap;
}

.sql-query-section {
  flex: 0 0 auto;
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
  flex: 0 0 auto;
  overflow: visible;
  min-height: 100px;
  max-height: 40vh;
  border: 1px solid var(--nexa-primary);
  border-radius: 10px;

  :deep(.q-field__control) {
    min-height: 100px;
    max-height: 40vh;
    border-color: var(--nexa-primary) !important;
    overflow: hidden;
  }

  // :deep(.q-field--focused .q-field__control) {
  //   color: var(--nexa-text-primary) !important;
  // }

  // :deep(.q-field__native) {
  //   min-height: 100px;
  //   max-height: 40vh;
  //   overflow: hidden;
  // }

  :deep(textarea) {
    //font-family: 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.3;
    min-height: 100px;
    max-height: 40vh;
    resize: none;
    overflow-y: auto;
    color: var(--nexa-text-primary) !important;
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

.execution-info {
  margin-top: 16px;
  padding: 12px;
  background-color: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: var(--nexa-text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
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

.feature-list {
  padding: 26px;
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: var(--nexa-text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
  overflow-x: auto;
}
</style>
