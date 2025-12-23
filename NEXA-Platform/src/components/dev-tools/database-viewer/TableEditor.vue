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
        <q-btn v-if="selectedTable" flat icon="edit" label="수정" @click="handleEditTable" />
        <q-btn v-if="selectedTable" flat icon="delete" label="삭제" color="negative" @click="handleDeleteTable" />
      </div>
      <div class="row items-center q-gutter-sm">
        <q-btn flat icon="refresh" label="새로고침" @click="handleRefresh" :loading="isLoading" />
      </div>
    </div>

    <!-- 편집 폼 -->
    <div class="table-editor-content q-pa-md">
      <!-- 안내 메시지 (테이블 미선택 및 편집 모드 아님) -->
      <div v-if="!selectedTable && !isCreating && !isEditing" class="empty-state text-center q-pa-lg">
        <q-icon name="edit" size="48px" color="grey-7" class="q-mb-md" />
        <div class="text-h6 q-mb-sm">테이블 편집기</div>
        <div class="text-body2 text-grey-7 q-mb-md">왼쪽 사이드바에서 테이블을 선택하거나 "새 테이블" 버튼을 클릭하세요.</div>
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
          <div class="text-h6 q-mb-md">
            {{ isCreating ? '새 테이블 생성' : `테이블 수정: ${selectedTable}` }}
          </div>

          <!-- 테이블 기본 정보 -->
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle2 q-mb-sm">테이블 정보</div>
              <div class="row q-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="tableName"
                    label="테이블명"
                    outlined
                    dense
                    :readonly="!isCreating"
                    :disable="!isCreating"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="tableComment"
                    label="테이블 코멘트"
                    outlined
                    dense
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- 컬럼 목록 -->
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2">컬럼</div>
                <q-btn
                  v-if="isCreating"
                  flat
                  dense
                  icon="add"
                  label="컬럼 추가"
                  color="primary"
                  size="sm"
                  @click="handleAddColumn"
                />
              </div>

              <!-- 컬럼 목록 -->
              <div v-if="columns.length > 0" class="column-list">
                <div
                  v-for="(column, index) in columns"
                  :key="index"
                  class="column-item q-pa-sm q-mb-sm"
                  :class="{ 'column-item-editing': column.editing }"
                >
                  <div class="row items-center q-gutter-sm">
                    <div class="col-3">
                      <q-input
                        v-model="column.name"
                        label="컬럼명"
                        outlined
                        dense
                        :readonly="!isCreating && !column.editing"
                      />
                    </div>
                    <div class="col-2">
                      <q-input
                        v-model="column.dataType"
                        label="데이터 타입"
                        outlined
                        dense
                        :readonly="!isCreating && !column.editing"
                      />
                    </div>
                    <div class="col-1">
                      <q-checkbox
                        v-model="column.isNullable"
                        label="NULL"
                        :disable="!isCreating && !column.editing"
                      />
                    </div>
                    <div class="col-2">
                      <q-input
                        v-model="column.defaultValue"
                        label="기본값"
                        outlined
                        dense
                        :readonly="!isCreating && !column.editing"
                      />
                    </div>
                    <div class="col-2">
                      <q-input
                        v-model="column.comment"
                        label="코멘트"
                        outlined
                        dense
                        :readonly="!isCreating && !column.editing"
                      />
                    </div>
                    <div class="col-2 row items-center q-gutter-xs">
                      <q-btn
                        v-if="!isCreating && !column.editing"
                        flat
                        dense
                        icon="edit"
                        size="sm"
                        @click="column.editing = true"
                      />
                      <q-btn
                        v-if="isCreating || column.editing"
                        flat
                        dense
                        icon="delete"
                        size="sm"
                        color="negative"
                        @click="handleRemoveColumn(index)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 컬럼이 없을 때 -->
              <div v-else class="text-center q-pa-md text-grey-7">
                컬럼이 없습니다. "컬럼 추가" 버튼을 클릭하여 컬럼을 추가하세요.
              </div>
            </q-card-section>
          </q-card>

          <!-- 액션 버튼 -->
          <div class="row justify-end q-gutter-sm">
            <q-btn flat label="취소" @click="handleCancel" />
            <q-btn
              color="primary"
              label="저장"
              @click="handleSave"
              :loading="isSaving"
            />
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
const isLoading = ref(false)
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

// 왼쪽 사이드바에서 테이블 선택 이벤트 리스너
function handleTableSelected(event) {
  const tableName = event.detail?.tableName
  if (tableName) {
    selectedTable.value = tableName
    isCreating.value = false
    isEditing.value = false
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
      tableComment.value = data.data.comment || ''
      
      // 컬럼 데이터 변환
      columns.value = (data.data.columns || []).map((col) => ({
        name: col.name,
        dataType: col.dataType,
        isNullable: col.isNullable === 'YES',
        defaultValue: col.defaultValue || '',
        comment: col.comment || '',
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
  isCreating.value = false
  isEditing.value = false
  tableStructure.value = null
  columns.value = []
  tableName.value = ''
  tableComment.value = ''
  error.value = null
  // 선택된 테이블은 유지 (왼쪽 사이드바에서 선택한 상태 유지)
}

// 새로고침 (왼쪽 사이드바의 새로고침과 동일한 기능)
function handleRefresh() {
  // 왼쪽 사이드바의 새로고침 이벤트 발생
  window.dispatchEvent(new CustomEvent('database-viewer-refresh'))
}

// 이벤트 리스너 등록/해제
onMounted(() => {
  window.addEventListener('database-table-selected', handleTableSelected)
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
  max-width: 1200px;
  margin: 0 auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.table-editor-form {
  width: 100%;
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
