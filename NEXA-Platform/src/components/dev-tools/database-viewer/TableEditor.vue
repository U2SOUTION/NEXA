<!-- TableEditor.vue
  테이블 편집기 컴포넌트
  테이블 생성, 수정, 삭제 기능 제공
-->

<template>
  <div class="table-editor">
    <!-- 툴바 -->
    <div class="table-editor-toolbar q-pa-md row items-center justify-between">
      <div class="row items-center q-gutter-sm">
        <q-btn color="primary" icon="add" label="새 테이블" @click="handleCreateTable" />
        <q-btn v-if="selectedTable && !isCreating" :flat="!isEditing" :color="isEditing ? 'negative' : 'primary'" icon="edit" :label="isEditing ? '편집취소' : '편집'" @click="handleEditToggle" />
      </div>
      <div class="row items-center q-gutter-sm">
        <q-btn v-if="isCreating || isEditing" flat icon="add" label="컬럼 추가" color="primary" @click="handleAddColumn" />
        <q-btn v-if="isCreating || isEditing" flat color="primary" label="저장" @click="handleSave" :loading="isSaving" />
        <q-btn v-if="selectedTable" flat icon="delete" label="삭제" color="negative" @click="handleDeleteTable" />
      </div>
    </div>

    <!-- 편집 폼 -->
    <div class="table-editor-content q-pa-md">
      <!-- 안내 메시지 (테이블 미선택 및 편집 모드 아님) -->
      <div v-if="!selectedTable && !isCreating && !isEditing" class="empty-state">
        <div class="empty-state-header text-center q-mb-xl">
          <q-icon name="storage" size="64px" color="primary" class="q-mb-md" />
          <div class="text-h5 q-mb-sm" style="font-weight: 600">왼쪽에서 테이블을 선택하세요</div>
          <div class="text-body1 text-grey-7">데이터베이스 테이블을 선택하여 구조를 확인하고 편집할 수 있습니다.</div>
        </div>

        <q-separator class="q-mb-xl" />

        <div class="empty-state-content">
          <div class="text-h6 q-mb-md">데이터베이스 관리 기능</div>
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6">
              <q-card flat bordered class="info-card">
                <q-card-section>
                  <div class="row items-center q-mb-sm">
                    <q-icon name="add_circle" size="24px" color="primary" class="q-mr-sm" />
                    <div class="text-subtitle1" style="font-weight: 600">새 테이블 생성</div>
                  </div>
                  <div class="text-body2 text-grey-7">"새 테이블" 버튼을 클릭하여 새로운 데이터베이스 테이블을 생성할 수 있습니다. 컬럼, 데이터 타입, 제약조건 등을 정의할 수 있습니다.</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-6">
              <q-card flat bordered class="info-card">
                <q-card-section>
                  <div class="row items-center q-mb-sm">
                    <q-icon name="edit" size="24px" color="primary" class="q-mr-sm" />
                    <div class="text-subtitle1" style="font-weight: 600">테이블 편집</div>
                  </div>
                  <div class="text-body2 text-grey-7">왼쪽 사이드바에서 테이블을 선택한 후 "편집" 버튼을 클릭하면 테이블 구조를 수정할 수 있습니다. 컬럼 추가, 수정, 삭제가 가능합니다.</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-6">
              <q-card flat bordered class="info-card">
                <q-card-section>
                  <div class="row items-center q-mb-sm">
                    <q-icon name="delete" size="24px" color="primary" class="q-mr-sm" />
                    <div class="text-subtitle1" style="font-weight: 600">테이블 삭제</div>
                  </div>
                  <div class="text-body2 text-grey-7">테이블을 선택한 후 "삭제" 버튼을 클릭하면 테이블을 삭제할 수 있습니다. 주의: 이 작업은 되돌릴 수 없습니다.</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-6">
              <q-card flat bordered class="info-card">
                <q-card-section>
                  <div class="row items-center q-mb-sm">
                    <q-icon name="account_tree" size="24px" color="primary" class="q-mr-sm" />
                    <div class="text-subtitle1" style="font-weight: 600">ERD 다이어그램</div>
                  </div>
                  <div class="text-body2 text-grey-7">ERD 탭에서 데이터베이스의 전체 구조와 테이블 간의 관계를 시각적으로 확인할 수 있습니다.</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>

      <!-- 로딩 상태 (상세 정보 로드 중) -->
      <div v-else-if="selectedTable && !isCreating && !isEditing && (isLoadingTableStructure || !tableStructure)" class="text-center q-pa-lg">
        <q-spinner color="primary" size="3em" />
        <div class="q-mt-md text-caption">테이블 구조를 불러오는 중...</div>
      </div>

      <!-- 테이블 상세 정보 (읽기 모드) -->
      <div v-else-if="selectedTable && !isCreating && !isEditing && tableStructure" class="table-detail-view">
        <!-- 헤더 -->
        <div class="row items-center q-mb-md">
          <div>
            <div class="text-h6">{{ tableStructure.tableName }}</div>
            <div class="text-caption text-grey-7">
              <span v-if="tableStructure.metadata?.rowCount !== null">행: {{ formatNumber(tableStructure.metadata.rowCount) }}개</span>
              <span v-if="tableStructure.metadata?.comment" class="q-ml-sm">코멘트: {{ tableStructure.metadata.comment }}</span>
            </div>
          </div>
        </div>

        <q-separator class="q-mb-md" />

        <!-- 컬럼 정보 -->
        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm">컬럼 ({{ tableStructure.columns?.length || 0 }}개)</div>
          <table class="simple-table">
            <thead>
              <tr>
                <th>컬럼명</th>
                <th>데이터 타입</th>
                <th>NULL</th>
                <th>키</th>
                <th>기본값</th>
                <th>코멘트</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="column in tableStructure.columns" :key="column.name">
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
                <td>{{ column.comment || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 편집 폼 (생성/수정) -->
      <template v-else>
        <!-- 로딩 상태 -->
        <div v-if="isLoadingTableStructure" class="text-center q-pa-lg">
          <q-spinner color="primary" size="3em" />
          <div class="q-mt-md text-caption">테이블 구조를 불러오는 중...</div>
        </div>

        <!-- 편집 폼 -->
        <div v-else-if="tableStructure || isCreating" class="table-editor-form">
          <!-- 컬럼 정보 (편집 가능) -->
          <div class="q-mb-md">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle2">컬럼 ({{ columns.length }}개)</div>
              <q-btn v-if="isCreating || isEditing" flat dense icon="add" label="컬럼 추가" color="primary" size="sm" @click="handleAddColumn" />
            </div>
            <table class="simple-table">
              <thead>
                <tr>
                  <th>컬럼명</th>
                  <th>데이터 타입</th>
                  <th>NULL</th>
                  <th>키</th>
                  <th>기본값</th>
                  <th>코멘트</th>
                  <th v-if="isCreating || isEditing" style="width: 80px">액션</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(column, index) in columns" :key="index">
                  <td>
                    <q-input v-model="column.name" outlined dense placeholder="컬럼명" class="table-form-input" />
                  </td>
                  <td>
                    <q-select v-model="column.dataType" :options="dataTypeOptions" outlined dense emit-value map-options use-input input-debounce="0" placeholder="데이터 타입" @filter="filterDataTypes" class="table-form-select" />
                  </td>
                  <td>
                    <q-checkbox v-model="column.isNullable" :disable="false" class="table-form-checkbox" />
                  </td>
                  <td>
                    <q-select
                      v-model="column.columnKey"
                      :options="[
                        { label: '-', value: '' },
                        { label: 'PK', value: 'PRI' },
                        { label: 'UNIQUE', value: 'UNI' },
                        { label: 'INDEX', value: 'MUL' },
                      ]"
                      outlined
                      dense
                      emit-value
                      map-options
                      placeholder="키"
                      class="table-form-select"
                    />
                  </td>
                  <td>
                    <q-select v-model="column.defaultValue" :options="defaultValueOptions" outlined dense use-input input-debounce="0" placeholder="기본값" @filter="filterDefaultValues" @new-value="createDefaultValue" class="table-form-select" />
                  </td>
                  <td>
                    <q-input v-model="column.comment" outlined dense placeholder="코멘트" class="table-form-input" />
                  </td>
                  <td v-if="isCreating || isEditing" class="text-center">
                    <q-btn flat dense icon="delete" size="sm" color="negative" @click="handleRemoveColumn(index)" />
                  </td>
                </tr>
              </tbody>
            </table>
            <!-- 테이블 하단 버튼 -->
            <div v-if="isCreating || isEditing" class="table-bottom-actions row items-center justify-end q-gutter-sm q-mt-md">
              <q-btn class="table-bottom-btn" icon="add" label="컬럼 추가" color="primary" @click="handleAddColumn" />
              <q-btn class="table-bottom-btn" color="primary" label="저장" @click="handleSave" :loading="isSaving" />
            </div>
          </div>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="error" class="text-center q-pa-lg">
          <q-icon name="error_outline" size="48px" color="negative" class="q-mb-md" />
          <div class="text-body2 text-negative">{{ error }}</div>
          <q-btn flat label="다시 시도" @click="loadTableStructure" class="q-mt-md" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// 상태
const isLoadingTableStructure = ref(false)
const isSaving = ref(false)
const selectedTable = ref(null)
const isEditing = ref(false)
const isCreating = ref(false)
const error = ref(null)

// 테이블 편집 데이터
const tableName = ref('')
const tableComment = ref('')
const tableStructure = ref(null)
const columns = ref([])

// 데이터 타입 옵션
const allDataTypeOptions = [
  // 문자열 타입
  { label: 'VARCHAR(255)', value: 'VARCHAR(255)' },
  { label: 'VARCHAR(100)', value: 'VARCHAR(100)' },
  { label: 'VARCHAR(50)', value: 'VARCHAR(50)' },
  { label: 'CHAR(255)', value: 'CHAR(255)' },
  { label: 'TEXT', value: 'TEXT' },
  { label: 'TINYTEXT', value: 'TINYTEXT' },
  { label: 'MEDIUMTEXT', value: 'MEDIUMTEXT' },
  { label: 'LONGTEXT', value: 'LONGTEXT' },
  // 숫자 타입
  { label: 'INT', value: 'INT' },
  { label: 'TINYINT', value: 'TINYINT' },
  { label: 'SMALLINT', value: 'SMALLINT' },
  { label: 'MEDIUMINT', value: 'MEDIUMINT' },
  { label: 'BIGINT', value: 'BIGINT' },
  { label: 'DECIMAL(10,2)', value: 'DECIMAL(10,2)' },
  { label: 'FLOAT', value: 'FLOAT' },
  { label: 'DOUBLE', value: 'DOUBLE' },
  // 날짜/시간 타입
  { label: 'DATE', value: 'DATE' },
  { label: 'TIME', value: 'TIME' },
  { label: 'DATETIME', value: 'DATETIME' },
  { label: 'TIMESTAMP', value: 'TIMESTAMP' },
  { label: 'YEAR', value: 'YEAR' },
  // 바이너리 타입
  { label: 'BLOB', value: 'BLOB' },
  { label: 'TINYBLOB', value: 'TINYBLOB' },
  { label: 'MEDIUMBLOB', value: 'MEDIUMBLOB' },
  { label: 'LONGBLOB', value: 'LONGBLOB' },
  // 기타
  { label: 'JSON', value: 'JSON' },
  { label: 'ENUM', value: 'ENUM' },
  { label: 'SET', value: 'SET' },
]

const dataTypeOptions = ref([...allDataTypeOptions])

// 데이터 타입 필터링
function filterDataTypes(val, update) {
  if (val === '') {
    update(() => {
      dataTypeOptions.value = allDataTypeOptions
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    dataTypeOptions.value = allDataTypeOptions.filter((v) => v.label.toLowerCase().indexOf(needle) > -1)
  })
}

// 기본값 옵션
const allDefaultValueOptions = [
  // NULL 관련
  { label: 'NULL', value: 'NULL' },
  // 숫자 기본값
  { label: '0', value: '0' },
  { label: '1', value: '1' },
  { label: '-1', value: '-1' },
  // 문자열 기본값
  { label: "'' (빈 문자열)", value: "''" },
  { label: "'N'", value: "'N'" },
  { label: "'Y'", value: "'Y'" },
  // 날짜/시간 기본값
  { label: 'CURRENT_TIMESTAMP', value: 'CURRENT_TIMESTAMP' },
  { label: 'NOW()', value: 'NOW()' },
  { label: 'CURRENT_DATE', value: 'CURRENT_DATE' },
  { label: 'CURRENT_TIME', value: 'CURRENT_TIME' },
  // 자동 증가
  { label: 'AUTO_INCREMENT', value: 'AUTO_INCREMENT' },
]

const defaultValueOptions = ref([...allDefaultValueOptions])

// 기본값 필터링
function filterDefaultValues(val, update) {
  if (val === '') {
    update(() => {
      defaultValueOptions.value = allDefaultValueOptions
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    defaultValueOptions.value = allDefaultValueOptions.filter((v) => v.label.toLowerCase().indexOf(needle) > -1 || v.value.toLowerCase().indexOf(needle) > -1)
  })
}

// 기본값 직접 입력 생성
function createDefaultValue(val, done) {
  if (val.length > 0) {
    // 이미 존재하는 값이 아니면 추가
    if (!allDefaultValueOptions.find((opt) => opt.value === val)) {
      allDefaultValueOptions.push({ label: val, value: val })
    }
    done(val, 'add')
  }
}

// 왼쪽 사이드바에서 테이블 선택 이벤트 리스너
function handleTableSelected(event) {
  const tableName = event.detail?.tableName
  if (tableName) {
    selectedTable.value = tableName
    isCreating.value = false
    isEditing.value = false
    // 테이블 상세 정보 자동 로드
    loadTableStructure()
  }
}

// 새 테이블 생성
function handleCreateTable() {
  isCreating.value = true
  isEditing.value = false
  selectedTable.value = null
  tableStructure.value = null
  tableName.value = ''
  tableComment.value = ''
  columns.value = []
  error.value = null
}

// 컬럼 추가
function handleAddColumn() {
  columns.value.push({
    name: '',
    dataType: 'VARCHAR(255)',
    isNullable: true,
    defaultValue: '',
    comment: '',
    columnKey: '',
    editing: true,
  })
}

// 컬럼 제거
function handleRemoveColumn(index) {
  columns.value.splice(index, 1)
}

// 저장
async function handleSave() {
  if (isCreating.value) {
    // 새 테이블 생성
    if (!tableName.value.trim()) {
      $q.notify({
        type: 'warning',
        message: '테이블명을 입력하세요.',
      })
      return
    }
    if (columns.value.length === 0) {
      $q.notify({
        type: 'warning',
        message: '최소 1개 이상의 컬럼이 필요합니다.',
      })
      return
    }

    // 컬럼 유효성 검사
    const invalidColumns = columns.value.filter((col) => !col.name || !col.name.trim())
    if (invalidColumns.length > 0) {
      $q.notify({
        type: 'warning',
        message: '모든 컬럼의 이름을 입력하세요.',
      })
      return
    }

    isSaving.value = true
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
      const response = await fetch(`${apiBaseUrl}/db/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName: tableName.value.trim(),
          columns: columns.value.map((col) => ({
            name: col.name.trim(),
            dataType: col.dataType || 'VARCHAR(255)',
            isNullable: col.isNullable !== false,
            defaultValue: col.defaultValue || null,
            comment: col.comment || null,
          })),
          comment: tableComment.value.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || '테이블 생성에 실패했습니다.')
      }

      if (data.success) {
        $q.notify({
          type: 'positive',
          message: data.message || '테이블이 생성되었습니다.',
        })

        // 성공 후 초기화
        isCreating.value = false
        tableName.value = ''
        tableComment.value = ''
        columns.value = []

        // 왼쪽 사이드바 새로고침
        window.dispatchEvent(new CustomEvent('database-viewer-refresh'))
      } else {
        throw new Error(data.error || '테이블 생성에 실패했습니다.')
      }
    } catch (err) {
      console.error('[TableEditor] 테이블 생성 실패:', err)
      $q.notify({
        type: 'negative',
        message: err.message || '테이블 생성 중 오류가 발생했습니다.',
      })
    } finally {
      isSaving.value = false
    }
  } else {
    // 테이블 수정
    isSaving.value = true
    try {
      // TODO: 테이블 수정 API 호출
      $q.notify({
        type: 'info',
        message: '테이블 수정 기능은 곧 구현될 예정입니다.',
      })
    } finally {
      isSaving.value = false
    }
  }
}

// 테이블 구조 로드
async function loadTableStructure() {
  if (!selectedTable.value) {
    tableStructure.value = null
    columns.value = []
    return
  }

  isLoadingTableStructure.value = true
  error.value = null

  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
    const response = await fetch(`${apiBaseUrl}/db/tables/${encodeURIComponent(selectedTable.value)}/structure`)
    const data = await response.json()

    if (!response.ok) {
      if (response.status === 503) {
        throw new Error(data.message || '데이터베이스 연결이 없습니다.')
      }
      throw new Error(data.error || '테이블 구조를 불러오는데 실패했습니다.')
    }

    if (data.success && data.data) {
      tableStructure.value = data.data
      tableName.value = selectedTable.value
      tableComment.value = data.data.metadata?.comment || ''

      // 컬럼 데이터 변환 (편집 모드용)
      columns.value = (data.data.columns || []).map((col) => ({
        name: col.name,
        dataType: col.dataType,
        isNullable: col.isNullable === 'YES',
        defaultValue: col.defaultValue || '',
        comment: col.comment || '',
        columnKey: col.columnKey || '',
        editing: false,
      }))
    } else {
      throw new Error('응답 데이터 형식이 올바르지 않습니다.')
    }
  } catch (err) {
    if (err.name === 'TypeError' && err.message?.includes('Failed to fetch')) {
      error.value = '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.'
    } else {
      error.value = err.message || '테이블 구조를 불러오는데 실패했습니다.'
    }
    console.error('[TableEditor] 테이블 구조 로드 실패:', err)
  } finally {
    isLoadingTableStructure.value = false
  }
}

// 숫자 포맷팅
function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('ko-KR').format(num)
}

// 편집 토글 (편집/편집취소)
function handleEditToggle() {
  if (!selectedTable.value) return
  if (isEditing.value) {
    handleCancel()
  } else {
    handleEditTable()
  }
}

// 테이블 수정
function handleEditTable() {
  if (!selectedTable.value) return
  isEditing.value = true
  isCreating.value = false
  loadTableStructure()
}

// 테이블 삭제
function handleDeleteTable() {
  if (!selectedTable.value) return

  $q.dialog({
    title: '테이블 삭제',
    message: `"${selectedTable.value}" 테이블을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // TODO: 테이블 삭제 API 호출
    $q.notify({
      type: 'info',
      message: '테이블 삭제 기능은 곧 구현될 예정입니다.',
    })
  })
}

// 취소
function handleCancel() {
  if (isCreating.value) {
    // 새 테이블 생성 모드 취소
    isCreating.value = false
    tableName.value = ''
    tableComment.value = ''
    columns.value = []
    selectedTable.value = null
  } else if (isEditing.value) {
    // 편집 모드 취소 - 읽기 모드로 돌아가기
    isEditing.value = false
    // 테이블 구조를 다시 로드하여 원래 상태로 복원
    if (selectedTable.value) {
      loadTableStructure()
    }
  }
  error.value = null
  // 선택된 테이블은 유지 (왼쪽 사이드바에서 선택한 상태 유지)
}

// 이벤트 리스너 등록/해제
onMounted(() => {
  window.addEventListener('database-table-selected', handleTableSelected)
  // 마운트 시 selectedTable이 이미 설정되어 있으면 로드
  if (selectedTable.value && !tableStructure.value) {
    loadTableStructure()
  }
})

onUnmounted(() => {
  window.removeEventListener('database-table-selected', handleTableSelected)
})
</script>

<style lang="scss" scoped>
.table-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-background);
}

.table-editor-toolbar {
  border-bottom: 1px solid var(--nexa-border-color);
  background-color: var(--nexa-surface);
  flex-shrink: 0;
}

.table-editor-content {
  flex: 1;
  overflow: auto;
  width: 100%;
}

.empty-state {
  padding: 48px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.empty-state-header {
  padding: 24px 0;
}

.empty-state-content {
  padding: 24px 0;
}

.info-card {
  height: 100%;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.table-editor-form {
  width: 100%;
}

// 테이블 하단 버튼 배경
.table-bottom-btn {
  background-color: var(--nexa-surface) !important;
  border-radius: 4px;
}

.table-detail-view {
  width: 100%;

  // 읽기 모드 테이블 본문 텍스트 secondary 컬러 적용
  .simple-table tbody td {
    color: var(--nexa-text-secondary) !important;
  }
}

.simple-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  table-layout: fixed;

  th,
  td {
    padding: 4px 8px;
    text-align: left;
    border-bottom: 1px solid var(--nexa-border-color);
    vertical-align: middle;
    overflow: hidden;
    min-height: 40px;
    height: 40px;
  }
}

// 테이블 정보 테이블 스타일 (테이블명 텍스트, 코멘트 넓게)
.table-info-table {
  table-layout: auto; // auto로 변경하여 코멘트 필드가 남은 공간을 차지하도록

  th,
  td {
    padding: 4px 8px;
    text-align: left;
    border-bottom: 1px solid var(--nexa-border-color);
    vertical-align: middle;
    min-height: 40px;
    height: 40px;
  }

  // 테이블명 라벨
  td:nth-child(1) {
    width: 100px;
  }

  // 테이블명 값 (텍스트)
  .table-name-cell {
    width: 200px;
    white-space: nowrap;
  }

  // 코멘트 라벨
  td:nth-child(3) {
    width: 100px;
  }

  // 코멘트 필드 (나머지 영역 최대한 차지)
  .table-comment-cell {
    width: 100%; // 나머지 공간 모두 차지
    min-width: 300px; // 최소 너비 보장
  }

  thead th {
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
      color: var(--nexa-table-text);
    }
  }

  // 컬럼 폭 조정
  th:nth-child(1),
  td:nth-child(1) {
    width: 15%; // 컬럼명
  }

  th:nth-child(2),
  td:nth-child(2) {
    width: 15%; // 데이터 타입 (셀렉트)
  }

  th:nth-child(3),
  td:nth-child(3) {
    width: 6%; // NULL (체크박스)
    text-align: center;
  }

  th:nth-child(4),
  td:nth-child(4) {
    width: 15%; // 키 (셀렉트)
  }

  th:nth-child(5),
  td:nth-child(5) {
    width: 15%; // 기본값 (셀렉트)
  }

  th:nth-child(6),
  td:nth-child(6) {
    width: 35%; // 코멘트 (입력) - 가장 넓게
  }

  th:nth-child(7),
  td:nth-child(7) {
    width: 8%; // 액션 (버튼)
    text-align: center;
  }
}

// 테이블 내 폼 필드 스타일 (보더 투명, 마진 0)
.table-form-input {
  margin: 0;
  width: 100%;

  :deep(.q-field__control) {
    border: none;
    background: transparent;
    box-shadow: none;
    min-height: 32px;
    height: 32px;
  }

  :deep(.q-field__native) {
    padding: 0;
    min-height: 32px;
    height: 32px;
    line-height: 32px;
  }

  :deep(.q-field__marginal) {
    display: none;
  }

  :deep(.q-field__label) {
    display: none !important;
  }

  :deep(.q-field__messages) {
    display: none;
  }

  :deep(input) {
    min-height: 32px;
    height: 32px;
    line-height: 32px;
  }
}

.table-form-select {
  margin: 0;
  width: 100%;

  :deep(.q-field__control) {
    border: none;
    background: transparent;
    box-shadow: none;
    min-height: 32px;
    height: 32px;
  }

  :deep(.q-field__native) {
    padding: 0;
    min-height: 32px;
    height: 32px;
    line-height: 32px;
    position: relative;
  }

  // 값이 있을 때 (span.ellipsis가 있을 때) input.q-placeholder 숨기기
  :deep(input.q-field__input.q-placeholder) {
    display: none !important;
  }

  // 더 직접적인 방법: q-placeholder 클래스가 있는 input의 placeholder 텍스트 숨기기
  :deep(.q-field__input.q-placeholder::placeholder) {
    color: transparent !important;
    opacity: 0 !important;
  }

  :deep(.q-field__marginal) {
    display: none;
  }

  :deep(.q-field__label) {
    display: none !important;
  }

  :deep(.q-field__messages) {
    display: none;
  }

  // q-field__input 스타일
  :deep(.q-field__input) {
    min-height: 32px;
    height: 32px;
    line-height: 32px;
    padding: 0;
  }
}

.table-form-checkbox {
  margin: 0;
}

.column-list {
  margin-top: 8px;
}

.column-item {
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
  background-color: var(--nexa-surface);
}

.column-item-editing {
  border-color: var(--nexa-primary);
  background-color: var(--nexa-surface-hover);
}
</style>
