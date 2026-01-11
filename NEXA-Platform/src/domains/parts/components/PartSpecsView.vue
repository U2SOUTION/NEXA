<!-- PartSpecsView.vue
  개별 부품 관리 화면
-->
<template>
  <div class="part-specs-view">
    <div class="q-pa-md">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5 text-primary">개별 부품 관리</div>
        <q-btn color="primary" icon="add" label="추가" @click="showAddDialog = true" />
      </div>

      <!-- 검색 및 필터 -->
      <div class="row q-gutter-md q-mb-md">
        <q-input
          v-model="searchText"
          placeholder="제조사 품번, 제조사명 검색..."
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
          v-model="selectedModelId"
          :options="modelOptions"
          option-label="label"
          option-value="id"
          emit-value
          map-options
          placeholder="부품 유형 필터"
          outlined
          dense
          clearable
          class="col-12 col-md-3"
        />
        <q-select
          v-model="selectedManufacturer"
          :options="manufacturerOptions"
          placeholder="제조사 필터"
          outlined
          dense
          clearable
          class="col-12 col-md-3"
        />
      </div>

      <!-- 데이터 테이블 -->
      <q-table
        :rows="filteredSpecs"
        :columns="columns"
        row-key="id"
        :loading="loading"
        v-model:pagination="pagination"
        class="parts-table"
        :rows-per-page-options="[10, 25, 50, 100]"
        flat
        bordered
      >
        <template v-slot:body-cell-id="props">
          <q-td :props="props">
            {{ (pagination.page - 1) * pagination.rowsPerPage + props.rowIndex + 1 }}
          </q-td>
        </template>
        <template v-slot:body-cell-part_model_name="props">
          <q-td :props="props">
            <div class="text-caption">
              {{ props.value }}
            </div>
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
            <q-btn
              flat
              dense
              round
              icon="edit"
              color="primary"
              @click="editSpec(props.row)"
              class="q-mr-xs"
            />
            <q-btn flat dense round icon="delete" color="negative" @click="deleteSpec(props.row)" />
          </q-td>
        </template>
      </q-table>

      <!-- 빈 상태 -->
      <div v-if="!loading && filteredSpecs.length === 0" class="text-center q-pa-xl">
        <q-icon name="description" size="64px" color="grey-5" class="q-mb-md" />
        <div class="text-h6 text-grey-6 q-mb-sm">데이터가 없습니다</div>
        <div class="text-caption text-grey-6">
          MySQL Workbench에서 데이터를 입력하거나 "추가" 버튼을 클릭하세요.
        </div>
      </div>
    </div>

    <!-- 추가/수정 다이얼로그 -->
    <q-dialog v-model="showAddDialog">
      <q-card style="min-width: 700px; max-width: 1000px">
        <q-card-section>
          <div class="text-h6">{{ editingSpec ? '개별 부품 수정' : '개별 부품 추가' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-scroll-area style="height: 600px">
            <div class="q-pa-sm">
              <q-select
                v-model="formData.part_model_id"
                :options="modelOptions"
                option-label="label"
                option-value="id"
                emit-value
                map-options
                label="부품 유형 *"
                outlined
                dense
                class="q-mb-md"
                :disable="!!editingSpec"
              />
              <q-input
                v-model="formData.manufacturer_part_number"
                label="제조사 품번 *"
                outlined
                dense
                class="q-mb-md"
              />
              <q-input v-model="formData.value_str" label="값" outlined dense class="q-mb-md" />
              <q-input
                v-model="formData.tolerance"
                label="허용 오차"
                outlined
                dense
                class="q-mb-md"
              />
              <q-input
                v-model="formData.voltage_rating"
                label="전압 등급"
                outlined
                dense
                class="q-mb-md"
              />
              <q-input
                v-model="formData.package_type"
                label="패키지 타입"
                outlined
                dense
                class="q-mb-md"
              />
              <q-input
                v-model="formData.manufacturer"
                label="제조사"
                outlined
                dense
                class="q-mb-md"
              />
              <q-input v-model="formData.unit" label="단위" outlined dense class="q-mb-md" />
              <q-input
                v-model="formData.purchase_vendor"
                label="구매벤더"
                outlined
                dense
                class="q-mb-md"
              />
              <q-input
                v-model="formData.purchase_status"
                label="구매상태"
                outlined
                dense
                class="q-mb-md"
              />
              <q-input
                v-model="formData.main_specs"
                label="주요 스펙"
                outlined
                dense
                type="textarea"
                rows="3"
                class="q-mb-md"
              />
              <q-input
                v-model="formData.additional_info2"
                label="추가정보2"
                outlined
                dense
                type="textarea"
                rows="2"
                class="q-mb-md"
              />
              <div class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm">상세 정보</div>
                <TiptapEditor
                  v-model="formData.additional_info3"
                  placeholder="부품에 대한 상세 정보를 자유롭게 입력하세요..."
                />
              </div>
              <div class="row q-gutter-md q-mb-md">
                <q-input
                  v-model.number="formData.safety_stock"
                  label="안전재고"
                  outlined
                  dense
                  type="number"
                  class="col"
                />
                <q-input
                  v-model.number="formData.stock_quantity"
                  label="재고수량"
                  outlined
                  dense
                  type="number"
                  class="col"
                />
                <q-input
                  v-model.number="formData.stock_value"
                  label="재고가치"
                  outlined
                  dense
                  type="number"
                  step="0.01"
                  class="col"
                />
              </div>
              <q-checkbox v-model="formData.stock_alert" label="재고알림" class="q-mb-md" />
            </div>
          </q-scroll-area>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="취소" color="primary" v-close-popup />
          <q-btn flat label="저장" color="primary" @click="saveSpec" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { usePartsDataStore } from '@system/store/partsDataStore.js'
import { defineAsyncComponent } from 'vue'
import { useSkeletonLoader } from '@system/composables/useSkeletonLoader.js'

// TiptapEditor를 비동기 컴포넌트로 로드 (에러 방지)
const TiptapEditor = defineAsyncComponent({
  loader: () => import('./TiptapEditor.vue'),
  loadingComponent: {
    template: '<div class="q-pa-md text-center"><q-spinner color="primary" size="2em" /></div>',
  },
  errorComponent: {
    template: '<div class="q-pa-md text-grey-6">에디터를 로드할 수 없습니다.</div>',
  },
  delay: 200,
  timeout: 3000,
})

const $q = useQuasar()
const partsDataStore = usePartsDataStore()
const { showSkeleton, hideSkeleton } = useSkeletonLoader()

// 상태
const loading = ref(false)
const searchText = ref('')
const selectedModelId = ref(null)
const selectedManufacturer = ref(null)
const showAddDialog = ref(false)
const editingSpec = ref(null)

// 폼 데이터
const formData = ref({
  part_model_id: null,
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
    name: 'part_model_name',
    label: '부품 유형',
    field: 'part_model_name',
    align: 'left',
    sortable: true,
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

// 페이지네이션
const pagination = ref({
  sortBy: null,
  descending: false,
  page: 1,
  rowsPerPage: 25,
})

// 개별 부품 목록 (store에서 가져오기)
const partSpecs = computed(() => partsDataStore.partSpecs)

// 부품 유형 목록 (필터용)
const partModels = computed(() => partsDataStore.partModels)

// 모델 옵션
const modelOptions = computed(() => {
  return partModels.value.map((m) => ({
    id: m.id,
    label: `${m.part_class_name || ''} - ${m.model_name || ''}`.trim(),
  }))
})

// 제조사 옵션
const manufacturerOptions = computed(() => {
  const manufacturers = [...new Set(partSpecs.value.map((s) => s.manufacturer).filter(Boolean))]
  return manufacturers.sort()
})

// 필터링된 목록
const filteredSpecs = computed(() => {
  let filtered = partSpecs.value

  // 검색 필터
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(
      (item) =>
        item.manufacturer_part_number?.toLowerCase().includes(search) ||
        item.manufacturer?.toLowerCase().includes(search) ||
        item.value_str?.toLowerCase().includes(search) ||
        item.main_specs?.toLowerCase().includes(search),
    )
  }

  // 모델 필터
  if (selectedModelId.value) {
    filtered = filtered.filter((item) => item.part_model_id === selectedModelId.value)
  }

  // 제조사 필터
  if (selectedManufacturer.value) {
    filtered = filtered.filter((item) => item.manufacturer === selectedManufacturer.value)
  }

  return filtered
})

// 데이터 로드
async function loadData() {
  // 전역 스켈레톤 로더 표시 (심플 라인)
  showSkeleton({
    type: 'simple',
    message: '개별 부품을 불러오는 중...',
  })

  loading.value = true
  try {
    // 부품 유형도 함께 로드 (필터용)
    await partsDataStore.fetchPartModels()
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
watch(filteredSpecs, () => {
  // 현재 페이지가 유효한 범위를 벗어나면 첫 페이지로 이동
  const maxPage = Math.ceil(filteredSpecs.value.length / pagination.value.rowsPerPage) || 1
  if (pagination.value.page > maxPage) {
    pagination.value.page = 1
  }
})

// 편집
function editSpec(item) {
  editingSpec.value = item
  formData.value = {
    part_model_id: item.part_model_id,
    manufacturer_part_number: item.manufacturer_part_number || '',
    value_str: item.value_str || '',
    tolerance: item.tolerance || '',
    voltage_rating: item.voltage_rating || '',
    package_type: item.package_type || '',
    manufacturer: item.manufacturer || '',
    unit: item.unit || '',
    purchase_vendor: item.purchase_vendor || '',
    purchase_status: item.purchase_status || '',
    main_specs: item.main_specs || '',
    additional_info2: item.additional_info2 || '',
    additional_info3: item.additional_info3 || '',
    safety_stock: item.safety_stock || 0,
    stock_quantity: item.stock_quantity || 0,
    stock_value: item.stock_value || 0,
    stock_alert: item.stock_alert || false,
  }
  showAddDialog.value = true
}

// 삭제
async function deleteSpec(item) {
  $q.dialog({
    title: '삭제 확인',
      message: `"${item.manufacturer_part_number}" 개별 부품을 삭제하시겠습니까?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await partsDataStore.deletePartSpec(item.id)
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

// 저장
async function saveSpec() {
  if (!formData.value.manufacturer_part_number) {
    $q.notify({
      type: 'warning',
      message: '제조사 품번을 입력하세요.',
    })
    return
  }

  if (!formData.value.part_model_id) {
    $q.notify({
      type: 'warning',
      message: '부품 유형을 선택하세요.',
    })
    return
  }

  try {
    if (editingSpec.value) {
      await partsDataStore.updatePartSpec(editingSpec.value.id, formData.value)
      $q.notify({
        type: 'positive',
        message: '수정되었습니다.',
      })
    } else {
      await partsDataStore.createPartSpec(formData.value)
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
  editingSpec.value = null
  formData.value = {
    part_model_id: null,
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

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.part-specs-view {
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
