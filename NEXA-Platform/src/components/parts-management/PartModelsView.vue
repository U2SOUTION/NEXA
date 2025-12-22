<!-- PartModelsView.vue
  부품 유형 관리 화면
-->
<template>
  <div class="part-models-view">
    <div class="q-pa-md">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5 text-primary">부품 유형 관리</div>
      </div>

      <!-- 검색 및 필터 -->
      <div class="row q-gutter-md q-mb-md">
        <q-input v-model="searchText" placeholder="유형명 검색..." outlined dense clearable class="col-12 col-md-4">
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-select v-model="selectedClassId" :options="classOptions" option-label="name" option-value="id" emit-value map-options placeholder="부품 분류 필터" outlined dense clearable class="col-12 col-md-3" />
      </div>

      <!-- 데이터 테이블 -->
      <q-table :rows="filteredModels" :columns="columns" row-key="id" :loading="loading" v-model:pagination="pagination" class="parts-table" :rows-per-page-options="[10, 25, 50, 100]" flat bordered>
        <template v-slot:body-cell-id="props">
          <q-td :props="props">
            {{ (pagination.page - 1) * pagination.rowsPerPage + props.rowIndex + 1 }}
          </q-td>
        </template>
        <template v-slot:body-cell-model_name="props">
          <q-td :props="props">
            <q-btn flat dense :label="props.value" color="primary" @click="openSpecsModal(props.row)" class="text-left" />
          </q-td>
        </template>
        <template v-slot:body-cell-description="props">
          <q-td :props="props">
            <div class="text-caption text-grey-6" style="max-width: 300px">
              {{ props.value }}
            </div>
          </q-td>
        </template>
        <template v-slot:body-cell-tags="props">
          <q-td :props="props">
            <div class="text-caption text-grey-6" style="max-width: 200px">
              {{ props.value }}
            </div>
          </q-td>
        </template>
      </q-table>

      <!-- 빈 상태 -->
      <div v-if="!loading && filteredModels.length === 0" class="text-center q-pa-xl">
        <q-icon name="inventory" size="64px" color="grey-5" class="q-mb-md" />
        <div class="text-h6 text-grey-6 q-mb-sm">데이터가 없습니다</div>
        <div class="text-caption text-grey-6">CSV 파일을 임포트하거나 데이터베이스에 직접 입력하세요.</div>
      </div>
    </div>

    <!-- 개별 부품 관리 모달 -->
    <q-dialog v-model="showSpecsModal" maximized>
      <q-card class="specs-modal-card">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ selectedModel ? `${selectedModel.part_class_name} - ${selectedModel.model_name}` : '' }} 개별 부품 관리</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="col q-pt-md">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1 text-grey-7">총 {{ modelSpecs.length }}개의 개별 부품</div>
            <q-btn color="primary" icon="add" label="개별 부품 추가" @click="showAddSpecDialog = true" />
          </div>

          <!-- 개별 부품 테이블 -->
          <q-table :rows="modelSpecs" :columns="specColumns" row-key="id" :loading="specsLoading" v-model:pagination="specsPagination" class="parts-table" :rows-per-page-options="[10, 25, 50, 100]" flat bordered>
            <template v-slot:body-cell-id="props">
              <q-td :props="props">
                {{ (specsPagination.page - 1) * specsPagination.rowsPerPage + props.rowIndex + 1 }}
              </q-td>
            </template>
            <template v-slot:body-cell-main_specs="props">
              <q-td :props="props">
                <div class="text-caption text-grey-6" style="max-width: 300px">
                  {{ props.value }}
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn flat dense round icon="edit" color="primary" @click="editSpec(props.row)" class="q-mr-xs" />
                <q-btn flat dense round icon="delete" color="negative" @click="deleteSpec(props.row)" />
              </q-td>
            </template>
          </q-table>

          <!-- 빈 상태 -->
          <div v-if="!specsLoading && modelSpecs.length === 0" class="text-center q-pa-xl">
            <q-icon name="description" size="64px" color="grey-5" class="q-mb-md" />
            <div class="text-h6 text-grey-6 q-mb-sm">개별 부품이 없습니다</div>
            <div class="text-caption text-grey-6">"개별 부품 추가" 버튼을 클릭하여 개별 부품을 추가하세요.</div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 개별 부품 추가/수정 다이얼로그 -->
      <q-dialog v-model="showAddSpecDialog">
        <q-card style="min-width: 700px; max-width: 1000px">
          <q-card-section>
            <div class="text-h6">{{ editingSpec ? '개별 부품 수정' : '개별 부품 추가' }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-scroll-area style="height: 600px">
              <div class="q-pa-sm">
                <q-input v-model="specFormData.manufacturer_part_number" label="제조사 품번 *" outlined dense class="q-mb-md" />
                <q-input v-model="specFormData.value_str" label="값" outlined dense class="q-mb-md" />
                <q-input v-model="specFormData.tolerance" label="허용 오차" outlined dense class="q-mb-md" />
                <q-input v-model="specFormData.voltage_rating" label="전압 등급" outlined dense class="q-mb-md" />
                <q-input v-model="specFormData.package_type" label="패키지 타입" outlined dense class="q-mb-md" />
                <q-input v-model="specFormData.manufacturer" label="제조사" outlined dense class="q-mb-md" />
                <q-input v-model="specFormData.unit" label="단위" outlined dense class="q-mb-md" />
                <q-input v-model="specFormData.purchase_vendor" label="구매벤더" outlined dense class="q-mb-md" />
                <q-input v-model="specFormData.purchase_status" label="구매상태" outlined dense class="q-mb-md" />
                <q-input v-model="specFormData.main_specs" label="주요 스펙" outlined dense type="textarea" rows="3" class="q-mb-md" />
                <q-input v-model="specFormData.additional_info2" label="추가정보2" outlined dense type="textarea" rows="2" class="q-mb-md" />
                <div class="row q-gutter-md q-mb-md">
                  <q-input v-model.number="specFormData.safety_stock" label="안전재고" outlined dense type="number" class="col" />
                  <q-input v-model.number="specFormData.stock_quantity" label="재고수량" outlined dense type="number" class="col" />
                  <q-input v-model.number="specFormData.stock_value" label="재고가치" outlined dense type="number" step="0.01" class="col" />
                </div>
                <q-checkbox v-model="specFormData.stock_alert" label="재고알림" class="q-mb-md" />
              </div>
            </q-scroll-area>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="취소" color="primary" v-close-popup />
            <q-btn flat label="저장" color="primary" @click="saveSpec" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { usePartsDataStore } from 'src/stores/partsDataStore'
import { useSkeletonLoader } from 'src/composables/useSkeletonLoader'

const $q = useQuasar()
const partsDataStore = usePartsDataStore()
const { showSkeleton, hideSkeleton } = useSkeletonLoader()

// 상태
const loading = ref(false)
const searchText = ref('')
const selectedClassId = ref(null)

// 개별 부품 모달 관련 상태
const showSpecsModal = ref(false)
const selectedModel = ref(null)
const specsLoading = ref(false)
const showAddSpecDialog = ref(false)
const editingSpec = ref(null)

// 개별 부품 폼 데이터
const specFormData = ref({
  manufacturer_part_number: '',
  value_str: '',
  tolerance: '',
  voltage_rating: '',
  package_type: '',
  manufacturer: '',
  unit: '',
  purchase_vendor: '',
  purchase_status: '',
  main_specs: '',
  additional_info2: '',
  additional_info3: '',
  safety_stock: 0,
  stock_quantity: 0,
  stock_value: 0,
  stock_alert: false,
})

// 개별 부품 테이블 컬럼
const specColumns = [
  {
    name: 'id',
    label: '번호',
    field: 'id',
    align: 'left',
    sortable: false,
    style: 'width: 80px',
  },
  {
    name: 'manufacturer_part_number',
    label: '제조사 품번',
    field: 'manufacturer_part_number',
    align: 'left',
    sortable: true,
  },
  {
    name: 'value_str',
    label: '값',
    field: 'value_str',
    align: 'left',
    sortable: true,
  },
  {
    name: 'manufacturer',
    label: '제조사',
    field: 'manufacturer',
    align: 'left',
    sortable: true,
  },
  {
    name: 'package_type',
    label: '패키지',
    field: 'package_type',
    align: 'left',
    sortable: true,
  },
  {
    name: 'main_specs',
    label: '주요 스펙',
    field: 'main_specs',
    align: 'left',
  },
  {
    name: 'stock_quantity',
    label: '재고수량',
    field: 'stock_quantity',
    align: 'right',
    sortable: true,
    style: 'width: 100px',
  },
  {
    name: 'actions',
    label: '작업',
    align: 'center',
    style: 'width: 100px',
  },
]

// 개별 부품 페이지네이션
const specsPagination = ref({
  sortBy: null,
  descending: false,
  page: 1,
  rowsPerPage: 25,
})

// 개별 부품 목록
const partSpecs = computed(() => partsDataStore.partSpecs)

// 선택된 모델의 개별 부품 목록
const modelSpecs = computed(() => {
  if (!selectedModel.value) return []
  return partSpecs.value.filter((spec) => spec.part_model_id === selectedModel.value.id)
})

// 테이블 컬럼 정의
const columns = [
  {
    name: 'id',
    label: '번호',
    field: 'id',
    align: 'left',
    sortable: false,
    style: 'width: 80px',
  },
  {
    name: 'part_class_name',
    label: '부품 분류',
    field: 'part_class_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'model_name',
    label: '유형명',
    field: 'model_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'tags',
    label: '태그',
    field: 'tags',
    align: 'left',
  },
  {
    name: 'description',
    label: '설명',
    field: 'description',
    align: 'left',
  },
  {
    name: 'category',
    label: '대분류',
    field: 'category',
    align: 'left',
    sortable: true,
  },
]

// 페이지네이션
const pagination = ref({
  sortBy: null,
  descending: false,
  page: 1,
  rowsPerPage: 25,
})

// 부품 유형 목록 (store에서 가져오기)
const partModels = computed(() => partsDataStore.partModels)

// 부품 클래스 목록 (필터용)
const partClasses = computed(() => partsDataStore.partClasses)

// 클래스 옵션
const classOptions = computed(() => {
  return partClasses.value.map((c) => ({
    id: c.id,
    name: c.name,
  }))
})

// 필터링된 목록
const filteredModels = computed(() => {
  let filtered = partModels.value

  // 검색 필터
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter((item) => item.model_name?.toLowerCase().includes(search) || item.part_class_name?.toLowerCase().includes(search) || item.tags?.toLowerCase().includes(search) || item.description?.toLowerCase().includes(search))
  }

  // 클래스 필터
  if (selectedClassId.value) {
    filtered = filtered.filter((item) => item.part_class_id === selectedClassId.value)
  }

  return filtered
})

// 데이터 로드
async function loadData() {
  // 전역 스켈레톤 로더 표시 (심플 라인)
  showSkeleton({
    type: 'simple',
    message: '부품 유형을 불러오는 중...',
  })

  loading.value = true
  try {
    // 부품 클래스도 함께 로드 (필터용)
    await partsDataStore.fetchPartClasses()
    await partsDataStore.fetchPartModels()
    // 개별 부품도 미리 로드 (모달에서 사용)
    await partsDataStore.fetchPartSpecs()
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
watch(filteredModels, () => {
  // 현재 페이지가 유효한 범위를 벗어나면 첫 페이지로 이동
  const maxPage = Math.ceil(filteredModels.value.length / pagination.value.rowsPerPage) || 1
  if (pagination.value.page > maxPage) {
    pagination.value.page = 1
  }
})

// 개별 부품 모달 열기
async function openSpecsModal(model) {
  selectedModel.value = model
  showSpecsModal.value = true
  specsLoading.value = true
  try {
    // 해당 모델의 개별 부품만 로드
    await partsDataStore.fetchPartSpecs(model.id)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '개별 부품 데이터를 불러오는데 실패했습니다.',
      caption: error.message,
    })
  } finally {
    specsLoading.value = false
  }
}

// 개별 부품 편집
function editSpec(spec) {
  editingSpec.value = spec
  specFormData.value = {
    manufacturer_part_number: spec.manufacturer_part_number || '',
    value_str: spec.value_str || '',
    tolerance: spec.tolerance || '',
    voltage_rating: spec.voltage_rating || '',
    package_type: spec.package_type || '',
    manufacturer: spec.manufacturer || '',
    unit: spec.unit || '',
    purchase_vendor: spec.purchase_vendor || '',
    purchase_status: spec.purchase_status || '',
    main_specs: spec.main_specs || '',
    additional_info2: spec.additional_info2 || '',
    additional_info3: spec.additional_info3 || '',
    safety_stock: spec.safety_stock || 0,
    stock_quantity: spec.stock_quantity || 0,
    stock_value: spec.stock_value || 0,
    stock_alert: spec.stock_alert || false,
  }
  showAddSpecDialog.value = true
}

// 개별 부품 삭제
async function deleteSpec(spec) {
  $q.dialog({
    title: '삭제 확인',
    message: `"${spec.manufacturer_part_number}" 개별 부품을 삭제하시겠습니까?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await partsDataStore.deletePartSpec(spec.id)
      $q.notify({
        type: 'positive',
        message: '삭제되었습니다.',
      })
      // 개별 부품 목록 다시 로드
      if (selectedModel.value) {
        await partsDataStore.fetchPartSpecs(selectedModel.value.id)
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: '삭제에 실패했습니다.',
        caption: error.message,
      })
    }
  })
}

// 개별 부품 저장
async function saveSpec() {
  if (!specFormData.value.manufacturer_part_number) {
    $q.notify({
      type: 'warning',
      message: '제조사 품번을 입력하세요.',
    })
    return
  }

  if (!selectedModel.value) {
    $q.notify({
      type: 'warning',
      message: '모델이 선택되지 않았습니다.',
    })
    return
  }

  try {
    const dataToSave = {
      ...specFormData.value,
      part_model_id: selectedModel.value.id,
    }

    if (editingSpec.value) {
      await partsDataStore.updatePartSpec(editingSpec.value.id, dataToSave)
      $q.notify({
        type: 'positive',
        message: '수정되었습니다.',
      })
    } else {
      await partsDataStore.createPartSpec(dataToSave)
      $q.notify({
        type: 'positive',
        message: '추가되었습니다.',
      })
    }
    showAddSpecDialog.value = false
    resetSpecForm()
    // 스펙 목록 다시 로드
    if (selectedModel.value) {
      await partsDataStore.fetchPartSpecs(selectedModel.value.id)
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '저장에 실패했습니다.',
      caption: error.message,
    })
  }
}

// 개별 부품 폼 초기화
function resetSpecForm() {
  editingSpec.value = null
  specFormData.value = {
    manufacturer_part_number: '',
    value_str: '',
    tolerance: '',
    voltage_rating: '',
    package_type: '',
    manufacturer: '',
    unit: '',
    purchase_vendor: '',
    purchase_status: '',
    main_specs: '',
    additional_info2: '',
    additional_info3: '',
    safety_stock: 0,
    stock_quantity: 0,
    stock_value: 0,
    stock_alert: false,
  }
}

// 모달 닫을 때 초기화
watch(showSpecsModal, (val) => {
  if (!val) {
    selectedModel.value = null
    resetSpecForm()
  }
})

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.part-models-view {
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

  // ===== 입력 폼 스타일 =====
  // 전역 스타일로 이동됨 (nexa-system/_form.scss)
  // 보더, placeholder, 아이콘, 셀렉트 색상은 전역 스타일에서 관리
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

// 모달 내부 스타일
.specs-modal-card {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;

  .q-card__section.col {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
}
</style>
