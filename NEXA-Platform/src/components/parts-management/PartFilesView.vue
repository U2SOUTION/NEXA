<!-- PartFilesView.vue
  부품 파일 관리 화면
-->
<template>
  <div class="part-files-view">
    <div class="q-pa-md">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5 text-primary">부품 파일 관리</div>
        <q-btn color="primary" icon="add" label="추가" @click="showAddDialog = true" />
      </div>

      <!-- 검색 및 필터 -->
      <div class="row q-gutter-md q-mb-md">
        <q-input
          v-model="searchText"
          placeholder="파일명 검색..."
          outlined
          dense
          clearable
          class="col-12 col-md-4"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-select
          v-model="selectedSpecId"
          :options="specOptions"
          option-label="label"
          option-value="id"
          emit-value
          map-options
          placeholder="부품 스펙 필터"
          outlined
          dense
          clearable
          class="col-12 col-md-3"
        />
        <q-select
          v-model="selectedFileType"
          :options="fileTypeOptions"
          placeholder="파일 타입 필터"
          outlined
          dense
          clearable
          class="col-12 col-md-3"
        />
      </div>

      <!-- 데이터 테이블 -->
      <q-table
        :rows="filteredFiles"
        :columns="columns"
        row-key="id"
        :loading="loading"
        v-model:pagination="pagination"
        class="parts-table"
        :rows-per-page-options="[10, 25, 50, 100]"
        flat
        bordered
      >
        <template v-slot:body-cell-part_spec_info="props">
          <q-td :props="props">
            <div class="text-caption">
              {{ props.value }}
            </div>
          </q-td>
        </template>
        <template v-slot:body-cell-file_url="props">
          <q-td :props="props">
            <q-btn
              flat
              dense
              size="sm"
              icon="download"
              label="다운로드"
              color="primary"
              @click="downloadFile(props.row)"
              v-if="props.value"
            />
            <span v-else class="text-grey-6 text-caption">-</span>
          </q-td>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              dense
              round
              icon="edit"
              color="primary"
              @click="editFile(props.row)"
              class="q-mr-xs"
            />
            <q-btn flat dense round icon="delete" color="negative" @click="deleteFile(props.row)" />
          </q-td>
        </template>
      </q-table>

      <!-- 빈 상태 -->
      <div v-if="!loading && filteredFiles.length === 0" class="text-center q-pa-xl">
        <q-icon name="folder" size="64px" color="grey-5" class="q-mb-md" />
        <div class="text-h6 text-grey-6 q-mb-sm">데이터가 없습니다</div>
        <div class="text-caption text-grey-6">
          MySQL Workbench에서 데이터를 입력하거나 "추가" 버튼을 클릭하세요.
        </div>
      </div>
    </div>

    <!-- 추가/수정 다이얼로그 -->
    <q-dialog v-model="showAddDialog">
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">{{ editingFile ? '부품 파일 수정' : '부품 파일 추가' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            v-model="formData.part_spec_id"
            :options="specOptions"
            option-label="label"
            option-value="id"
            emit-value
            map-options
            label="부품 스펙 *"
            outlined
            dense
            class="q-mb-md"
            :disable="!!editingFile"
          />
          <q-select
            v-model="formData.file_type"
            :options="fileTypeOptions"
            label="파일 타입 *"
            outlined
            dense
            class="q-mb-md"
          />
          <q-input
            v-model="formData.filename"
            label="원본 파일명 *"
            outlined
            dense
            class="q-mb-md"
          />
          <q-input
            v-model="formData.file_url"
            label="파일 경로 (상대 경로) *"
            outlined
            dense
            class="q-mb-md"
            hint="예: /uploads/parts/datasheet.pdf"
          />
          <q-input
            v-model="formData.upload_date"
            label="업로드 날짜"
            outlined
            dense
            type="datetime-local"
            class="q-mb-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="취소" color="primary" v-close-popup />
          <q-btn flat label="저장" color="primary" @click="saveFile" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { usePartsDataStore } from 'src/system/store/partsDataStore'
import { useSkeletonLoader } from 'src/system/composables/useSkeletonLoader'

const $q = useQuasar()
const partsDataStore = usePartsDataStore()
const { showSkeleton, hideSkeleton } = useSkeletonLoader()

// 상태
const loading = ref(false)
const searchText = ref('')
const selectedSpecId = ref(null)
const selectedFileType = ref(null)
const showAddDialog = ref(false)
const editingFile = ref(null)

// 폼 데이터
const formData = ref({
  part_spec_id: null,
  file_type: '',
  filename: '',
  file_url: '',
  upload_date: '',
})

// 파일 타입 옵션
const fileTypeOptions = ['image', 'pdf', '3d_model', 'datasheet', 'other']

// 테이블 컬럼 정의
const columns = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    align: 'left',
    sortable: true,
    style: 'width: 80px',
  },
  {
    name: 'part_spec_info',
    label: '부품 스펙',
    field: 'part_spec_info',
    align: 'left',
    sortable: true,
  },
  {
    name: 'file_type',
    label: '파일 타입',
    field: 'file_type',
    align: 'left',
    sortable: true,
  },
  {
    name: 'filename',
    label: '파일명',
    field: 'filename',
    align: 'left',
    sortable: true,
  },
  {
    name: 'file_url',
    label: '다운로드',
    field: 'file_url',
    align: 'center',
    style: 'width: 120px',
  },
  {
    name: 'upload_date',
    label: '업로드 날짜',
    field: 'upload_date',
    align: 'left',
    sortable: true,
    format: (val) => {
      if (!val) return '-'
      const date = new Date(val)
      return date.toLocaleString('ko-KR')
    },
  },
  {
    name: 'actions',
    label: '작업',
    align: 'center',
    style: 'width: 100px',
  },
]

// 페이지네이션
const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 25,
})

// 부품 파일 목록 (store에서 가져오기)
const partFiles = computed(() => partsDataStore.partFiles)

// 부품 스펙 목록 (필터용)
const partSpecs = computed(() => partsDataStore.partSpecs)

// 스펙 옵션
const specOptions = computed(() => {
  return partSpecs.value.map((s) => ({
    id: s.id,
    label: `${s.part_class_name || ''} - ${s.part_model_name || ''} - ${s.manufacturer_part_number || ''}`.trim(),
  }))
})

// 필터링된 목록
const filteredFiles = computed(() => {
  let filtered = partFiles.value

  // 검색 필터
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(
      (item) =>
        item.filename?.toLowerCase().includes(search) ||
        item.file_url?.toLowerCase().includes(search) ||
        item.file_type?.toLowerCase().includes(search),
    )
  }

  // 스펙 필터
  if (selectedSpecId.value) {
    filtered = filtered.filter((item) => item.part_spec_id === selectedSpecId.value)
  }

  // 파일 타입 필터
  if (selectedFileType.value) {
    filtered = filtered.filter((item) => item.file_type === selectedFileType.value)
  }

  return filtered
})

// 데이터 로드
async function loadData() {
  // 전역 스켈레톤 로더 표시 (심플 라인)
  showSkeleton({
    type: 'simple',
    message: '부품 파일을 불러오는 중...',
  })

  loading.value = true
  try {
    // 부품 스펙도 함께 로드 (필터용)
    await partsDataStore.fetchPartSpecs()
    await partsDataStore.fetchPartFiles()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '데이터를 불러오는데 실패했습니다.',
      caption: error.message,
    })
  } finally {
    // 전역 스켈레톤 로더 숨기기
    hideSkeleton()
    loading.value = false
  }
}

// 필터링된 데이터 변경 시 페이지 조정
watch(filteredFiles, () => {
  // 현재 페이지가 유효한 범위를 벗어나면 첫 페이지로 이동
  const maxPage = Math.ceil(filteredFiles.value.length / pagination.value.rowsPerPage) || 1
  if (pagination.value.page > maxPage) {
    pagination.value.page = 1
  }
})

// 편집
function editFile(item) {
  editingFile.value = item
  formData.value = {
    part_spec_id: item.part_spec_id,
    file_type: item.file_type || '',
    filename: item.filename || '',
    file_url: item.file_url || '',
    upload_date: item.upload_date ? new Date(item.upload_date).toISOString().slice(0, 16) : '',
  }
  showAddDialog.value = true
}

// 삭제
async function deleteFile(item) {
  $q.dialog({
    title: '삭제 확인',
    message: `"${item.filename}" 파일을 삭제하시겠습니까?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await partsDataStore.deletePartFile(item.id)
      $q.notify({
        type: 'positive',
        message: '삭제되었습니다.',
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: '삭제에 실패했습니다.',
        caption: error.message,
      })
    }
  })
}

// 파일 다운로드
function downloadFile(item) {
  if (item.file_url) {
    // 절대 URL인 경우 그대로 사용, 상대 경로인 경우 API 서버 URL과 결합
    const url = item.file_url.startsWith('http') 
      ? item.file_url 
      : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${item.file_url}`
    
    window.open(url, '_blank')
  } else {
    $q.notify({
      type: 'warning',
      message: '파일 경로가 없습니다.',
    })
  }
}

// 저장
async function saveFile() {
  if (!formData.value.filename) {
    $q.notify({
      type: 'warning',
      message: '파일명을 입력하세요.',
    })
    return
  }

  if (!formData.value.file_type) {
    $q.notify({
      type: 'warning',
      message: '파일 타입을 선택하세요.',
    })
    return
  }

  if (!formData.value.file_url) {
    $q.notify({
      type: 'warning',
      message: '파일 경로를 입력하세요.',
    })
    return
  }

  if (!formData.value.part_spec_id) {
    $q.notify({
      type: 'warning',
      message: '부품 스펙을 선택하세요.',
    })
    return
  }

  try {
    const dataToSave = {
      ...formData.value,
      upload_date: formData.value.upload_date || new Date().toISOString(),
    }

    if (editingFile.value) {
      await partsDataStore.updatePartFile(editingFile.value.id, dataToSave)
      $q.notify({
        type: 'positive',
        message: '수정되었습니다.',
      })
    } else {
      await partsDataStore.createPartFile(dataToSave)
      $q.notify({
        type: 'positive',
        message: '추가되었습니다.',
      })
    }
    showAddDialog.value = false
    resetForm()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '저장에 실패했습니다.',
      caption: error.message,
    })
  }
}

// 폼 초기화
function resetForm() {
  editingFile.value = null
  formData.value = {
    part_spec_id: null,
    file_type: '',
    filename: '',
    file_url: '',
    upload_date: '',
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.part-files-view {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  > div {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }
}

.parts-table {
  flex: 1;
  min-height: 0;
  
  :deep(.q-table__top) {
    padding: 0;
  }
  
  :deep(.q-table__container) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  :deep(.q-table__middle) {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }
}
</style>

