<!-- BinModelManagementModal.vue
  부품함 모델 관리 모달
  부품함 모델 추가, 수정, 삭제 기능 제공
-->

<template>
  <q-dialog v-model="dialogModel" persistent>
    <q-card style="min-width: 800px; max-width: 1000px" class="modal-card">
      <q-card-section class="modal-header">
        <div class="row items-start justify-between">
          <div class="modal-title">부품함 모델 관리</div>
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
            class="modal-close-btn"
            @click="handleClose"
          />
        </div>
      </q-card-section>

      <q-card-section class="modal-content">
        <!-- 모델 목록 -->
        <div class="models-section">
          <div class="section-header">
            <div class="section-title">모델 목록</div>
            <q-btn
              flat
              dense
              label="새 모델 추가"
              color="primary"
              icon="add"
              @click="handleAddNew"
              class="add-btn"
            />
          </div>

          <div v-if="binModels.length === 0" class="empty-state">
            <q-icon name="inventory_2" size="64px" color="grey-6" />
            <div class="text-caption text-grey-6 q-mt-sm">등록된 모델이 없습니다</div>
          </div>

          <q-list v-else bordered separator>
            <q-item
              v-for="(model, index) in binModels"
              :key="model.id"
              class="model-item"
              :class="{
                'is-editing': editingModelId === model.id,
                'is-dragging': draggedIndex === index,
                'drag-over': dragOverIndex === index,
              }"
              draggable="true"
              @dragstart="handleDragStart(index, $event)"
              @dragend="handleDragEnd"
              @dragover.prevent="handleDragOver(index, $event)"
              @dragenter.prevent="handleDragEnter(index)"
              @dragleave="handleDragLeave"
              @drop.prevent="handleDrop(index, $event)"
            >
              <q-item-section>
                <div v-if="editingModelId !== model.id" class="model-info">
                  <div class="drag-handle">
                    <q-icon name="drag_handle" size="20px" class="drag-icon" />
                  </div>
                  <div class="model-content">
                    <div class="model-name">{{ model.name }}</div>
                    <div class="model-details text-caption text-grey-6">
                      SKU: {{ model.sku }} | 크기: {{ model.width_mm }}mm × {{ model.height_mm }}mm
                      × {{ model.depth_mm }}mm
                      <span v-if="model.material"> | 재질: {{ model.material }}</span>
                      <span v-if="model.color"> | 색상: {{ model.color }}</span>
                    </div>
                  </div>
                </div>
                <div v-else class="model-edit-form">
                  <q-input
                    v-model="editFormData.name"
                    label="수정 모델 이름 *"
                    dense
                    class="q-mb-sm"
                    :rules="[(val) => !!val || '이름을 입력하세요']"
                  />
                  <q-input
                    v-model="editFormData.sku"
                    label="SKU 코드 *"
                    dense
                    class="q-mb-sm"
                    :rules="[(val) => !!val || 'SKU를 입력하세요']"
                  />
                  <div class="row q-gutter-sm q-mb-sm">
                    <q-input
                      v-model.number="editFormData.width_mm"
                      label="너비 (mm) *"
                      type="number"
                      dense
                      class="col"
                      :rules="[(val) => val > 0 || '0보다 큰 값을 입력하세요']"
                    />
                    <q-input
                      v-model.number="editFormData.height_mm"
                      label="높이 (mm) *"
                      type="number"
                      dense
                      class="col"
                      :rules="[(val) => val > 0 || '0보다 큰 값을 입력하세요']"
                    />
                    <q-input
                      v-model.number="editFormData.depth_mm"
                      label="깊이 (mm) *"
                      type="number"
                      dense
                      class="col"
                      :rules="[(val) => val > 0 || '0보다 큰 값을 입력하세요']"
                    />
                  </div>
                  <div class="row q-gutter-sm">
                    <q-input
                      v-model="editFormData.material"
                      label="재질 (선택)"
                      dense
                      class="col"
                    />
                    <q-input v-model="editFormData.color" label="색상 (선택)" dense class="col" />
                  </div>
                  <q-input
                    v-model="editFormData.description"
                    label="설명 (선택)"
                    dense
                    type="textarea"
                    rows="2"
                    class="q-mt-sm q-mb-sm"
                  />
                  <div class="model-edit-actions">
                    <q-btn
                      flat
                      dense
                      label="저장"
                      color="primary"
                      @click="handleSave"
                      class="q-mr-xs"
                    />
                    <q-btn flat dense label="취소" @click="handleCancelEdit" />
                  </div>
                </div>
              </q-item-section>
              <q-item-section side>
                <div v-if="editingModelId !== model.id" class="model-actions">
                  <q-btn flat round dense icon="edit" @click="handleEdit(model)" class="q-mr-xs" />
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    color="negative"
                    @click="handleDelete(model.id)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- 새 모델 추가 폼 -->
        <div v-if="showAddForm" class="add-form-section q-mt-lg">
          <div class="section-title q-mb-md">부품함 모델 추가 항목</div>
          <q-input
            v-model="newModelForm.name"
            label="추가 모델 이름 *"
            class="modal-input q-mb-md"
            :rules="[(val) => !!val || '이름을 입력하세요']"
            autofocus
          />
          <q-input
            v-model="newModelForm.sku"
            label="SKU 코드 *"
            class="modal-input q-mb-md"
            :rules="[(val) => !!val || 'SKU를 입력하세요']"
          />
          <div class="row q-gutter-md q-mb-md">
            <q-input
              v-model.number="newModelForm.width_mm"
              label="너비 (mm) *"
              type="number"
              class="modal-input col"
              :rules="[(val) => val > 0 || '0보다 큰 값을 입력하세요']"
            />
            <q-input
              v-model.number="newModelForm.height_mm"
              label="높이 (mm) *"
              type="number"
              class="modal-input col"
              :rules="[(val) => val > 0 || '0보다 큰 값을 입력하세요']"
            />
            <q-input
              v-model.number="newModelForm.depth_mm"
              label="깊이 (mm) *"
              type="number"
              class="modal-input col"
              :rules="[(val) => val > 0 || '0보다 큰 값을 입력하세요']"
            />
          </div>
          <div class="row q-gutter-md q-mb-md">
            <q-input v-model="newModelForm.material" label="재질 (선택)" class="modal-input col" />
            <q-input v-model="newModelForm.color" label="색상 (선택)" class="modal-input col" />
          </div>
          <q-input
            v-model="newModelForm.description"
            label="설명 (선택)"
            class="modal-input q-mb-md"
          />
        </div>
      </q-card-section>

      <q-card-actions align="center" class="modal-actions">
        <template v-if="showAddForm">
          <q-btn
            flat
            label="추가하기"
            color="primary"
            @click="handleAddModel"
            :disable="!isNewFormValid"
            class="modal-btn"
          />
          <q-btn flat label="취소" @click="handleCancelAdd" class="modal-btn" />
        </template>
        <q-btn
          v-else
          flat
          label="닫기"
          color="grey"
          v-close-popup
          class="modal-btn"
          @click="handleClose"
        />
      </q-card-actions>
    </q-card>

    <!-- 삭제 확인 모달 -->
    <q-dialog v-model="showDeleteConfirm" persistent>
      <q-card style="min-width: 500px; max-width: 600px" class="delete-confirm-card">
        <q-card-section class="delete-confirm-header">
          <div class="delete-confirm-title">CONFIRM DELETE</div>
        </q-card-section>

        <q-card-section class="delete-confirm-content">
          <div class="delete-confirm-message">
            <q-icon name="warning" size="30px" color="warning" class="q-mr-sm" />
            정말로 <strong>{{ deleteTargetName }}</strong> 모델을 삭제하시겠습니까?
          </div>
          <div class="delete-confirm-warning text-caption">이 작업은 되돌릴 수 없습니다.</div>
        </q-card-section>

        <q-card-actions align="center" class="delete-confirm-actions">
          <q-btn flat label="취소" @click="showDeleteConfirm = false" class="delete-confirm-btn" />
          <q-btn
            flat
            label="삭제"
            color="negative"
            @click="confirmDelete"
            class="delete-confirm-btn"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePartsManagementStore } from 'src/stores/partsManagementStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const partsStore = usePartsManagementStore()

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 빈 모델 목록
const binModels = computed(() => partsStore.binModels || [])

// 새 모델 추가 폼 표시 여부
const showAddForm = ref(false)

// 새 모델 폼 데이터
const newModelForm = ref({
  name: '',
  sku: '',
  width_mm: null,
  depth_mm: null,
  height_mm: null,
  material: '',
  color: '',
  description: '',
})

// 수정 중인 모델 ID
const editingModelId = ref(null)

// 드래그 앤 드롭 관련 상태
const draggedIndex = ref(null)
const dragOverIndex = ref(null)

// 삭제 확인 모달 관련 상태
const showDeleteConfirm = ref(false)
const deleteTargetId = ref(null)
const deleteTargetName = ref('')

// 수정 폼 데이터
const editFormData = ref({
  name: '',
  sku: '',
  width_mm: null,
  depth_mm: null,
  height_mm: null,
  material: '',
  color: '',
  description: '',
})

// 새 모델 폼 유효성 검사
const isNewFormValid = computed(() => {
  return (
    newModelForm.value.name &&
    newModelForm.value.sku &&
    newModelForm.value.width_mm > 0 &&
    newModelForm.value.depth_mm > 0 &&
    newModelForm.value.height_mm > 0
  )
})

// 다이얼로그가 열릴 때마다 초기화
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      showAddForm.value = false
      editingModelId.value = null
      showDeleteConfirm.value = false
      deleteTargetId.value = null
      deleteTargetName.value = ''
      resetNewForm()
    }
  },
)

function resetNewForm() {
  newModelForm.value = {
    name: '',
    sku: '',
    width_mm: null,
    depth_mm: null,
    height_mm: null,
    material: '',
    color: '',
    description: '',
  }
}

function handleAddNew() {
  showAddForm.value = true
  editingModelId.value = null
  resetNewForm()
}

function handleCancelAdd() {
  showAddForm.value = false
  resetNewForm()
}

function handleAddModel() {
  if (!isNewFormValid.value) return

  const result = partsStore.addBinModel({
    name: newModelForm.value.name,
    sku: newModelForm.value.sku,
    width_mm: newModelForm.value.width_mm,
    depth_mm: newModelForm.value.depth_mm,
    height_mm: newModelForm.value.height_mm,
    material: newModelForm.value.material || null,
    color: newModelForm.value.color || null,
    description: newModelForm.value.description || null,
  })

  if (result.success) {
    showAddForm.value = false
    resetNewForm()
  } else {
    // TODO: 에러 메시지 표시
    console.error('모델 추가 실패:', result.message)
  }
}

function handleEdit(model) {
  editingModelId.value = model.id
  editFormData.value = {
    name: model.name,
    sku: model.sku,
    width_mm: model.width_mm,
    depth_mm: model.depth_mm,
    height_mm: model.height_mm,
    material: model.material || '',
    color: model.color || '',
    description: model.description || '',
  }
  showAddForm.value = false
}

function handleCancelEdit() {
  editingModelId.value = null
  editFormData.value = {
    name: '',
    sku: '',
    width_mm: null,
    depth_mm: null,
    height_mm: null,
    material: '',
    color: '',
    description: '',
  }
}

function handleSave() {
  if (!editFormData.value.name || !editFormData.value.sku) return
  if (
    !editFormData.value.width_mm ||
    !editFormData.value.depth_mm ||
    !editFormData.value.height_mm ||
    editFormData.value.width_mm <= 0 ||
    editFormData.value.depth_mm <= 0 ||
    editFormData.value.height_mm <= 0
  ) {
    return
  }

  const result = partsStore.updateBinModel(editingModelId.value, {
    name: editFormData.value.name,
    sku: editFormData.value.sku,
    width_mm: editFormData.value.width_mm,
    depth_mm: editFormData.value.depth_mm,
    height_mm: editFormData.value.height_mm,
    material: editFormData.value.material || null,
    color: editFormData.value.color || null,
    description: editFormData.value.description || null,
  })

  if (result.success) {
    editingModelId.value = null
  } else {
    // TODO: 에러 메시지 표시
    console.error('모델 수정 실패:', result.message)
  }
}

function handleDelete(modelId) {
  const model = binModels.value.find((m) => m.id === modelId)
  if (model) {
    deleteTargetId.value = modelId
    deleteTargetName.value = model.name
    showDeleteConfirm.value = true
  }
}

function confirmDelete() {
  if (deleteTargetId.value === null) return

  const result = partsStore.deleteBinModel(deleteTargetId.value)
  if (result.success) {
    showDeleteConfirm.value = false
    deleteTargetId.value = null
    deleteTargetName.value = ''
  } else {
    // TODO: 에러 메시지 표시
    console.error('모델 삭제 실패:', result.message)
  }
}

function handleClose() {
  showAddForm.value = false
  editingModelId.value = null
  resetNewForm()
  emit('update:modelValue', false)
}

// 드래그 앤 드롭 핸들러
function handleDragStart(index, event) {
  if (editingModelId.value !== null) {
    event.preventDefault()
    return
  }
  draggedIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/html', index)
  event.target.style.opacity = '0.5'
}

function handleDragEnd(event) {
  event.target.style.opacity = ''
  draggedIndex.value = null
  dragOverIndex.value = null
}

function handleDragOver(index, event) {
  if (draggedIndex.value === null || draggedIndex.value === index) return
  event.dataTransfer.dropEffect = 'move'
  dragOverIndex.value = index
}

function handleDragEnter(index) {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    dragOverIndex.value = index
  }
}

function handleDragLeave() {
  // 드래그가 다른 요소로 이동할 때만 제거
  // 실제로는 handleDragOver에서 관리
}

function handleDrop(toIndex, event) {
  event.preventDefault()
  const fromIndex = draggedIndex.value

  if (fromIndex === null || fromIndex === toIndex) {
    dragOverIndex.value = null
    return
  }

  const result = partsStore.reorderBinModels(fromIndex, toIndex)
  if (!result.success) {
    console.error('순서 변경 실패:', result.message)
  }

  draggedIndex.value = null
  dragOverIndex.value = null
}
</script>

<style lang="scss" scoped>
.modal-card {
  padding: 100px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 0;
  box-shadow: none;
}

.modal-header {
  padding-bottom: 24px;
}

.modal-title {
  font-size: 2rem;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.5);
  text-transform: uppercase;
  letter-spacing: 2px;
  line-height: 1.2;
  flex: 1;
  margin-right: 16px;
}

.modal-close-btn {
  flex-shrink: 0;
  margin-top: 5px;
  color: rgba(147, 147, 147, 0.5);
}

.modal-content {
  padding: 12px 0;
  max-height: 60vh;
  overflow-y: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.7);
}

.add-btn {
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
}

.model-item {
  padding: 16px;
  transition:
    background-color 0.2s,
    opacity 0.2s;
  border-color: rgba(0, 0, 0, 0.585) !important;
  cursor: grab;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  &.is-editing {
    background-color: rgba(33, 150, 243, 0.02);
    cursor: default;
  }

  &.is-dragging {
    opacity: 0.5;
    cursor: grabbing;
  }

  &.drag-over {
    background-color: rgba(33, 150, 243, 0.1);
    border-top: 2px solid rgba(33, 150, 243, 0.5);
  }
}

// q-list의 보더 색상도 어두운 톤으로 변경
.models-section :deep(.q-list) {
  border-color: rgba(0, 0, 0, 0.427) !important;
}

.models-section :deep(.q-item) {
  border-color: rgba(0, 0, 0, 0.535) !important;
}

.model-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;

  .drag-handle {
    display: flex;
    align-items: center;
    cursor: grab;
    padding: 4px;
    margin-top: 2px;
    color: rgba(0, 0, 0, 0.4);
    transition: color 0.2s;
    flex-shrink: 0;

    &:hover {
      color: rgba(0, 0, 0, 0.7);
    }

    &:active {
      cursor: grabbing;
    }

    .drag-icon {
      user-select: none;
    }
  }

  .model-content {
    flex: 1;
    min-width: 0;
  }

  .model-name {
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 2px;
    color: rgba(57, 207, 30, 0.6);
  }

  .model-details {
    font-size: 0.875rem;
  }
}

.model-edit-form {
  width: 100%;

  :deep(.q-field__label) {
    text-align: left !important;
    justify-content: flex-start !important;
  }

  :deep(.q-field__label .q-field__label-container) {
    text-align: left !important;
    justify-content: flex-start !important;
  }

  :deep(.q-field__control::after),
  :deep(.q-field__control::before) {
    display: none !important;
    border: none !important;
  }

  :deep(.q-field__control) {
    border: none !important;
    border-bottom: none !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.446) !important;
  }

  :deep(.q-field--highlighted .q-field__control) {
    border-bottom: 2px solid var(--q-primary) !important;
  }

  // 첫 번째 입력 필드(모델 이름)만 리스트 아이템과 동일한 색상 적용
  > .q-input:first-child {
    :deep(.q-field__native) {
      color: rgba(57, 207, 30, 0.6);
      font-weight: 600;
      font-size: 1rem;
    }
  }
}

.model-actions {
  display: flex;
  align-items: center;
}

.model-edit-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;

  :deep(.q-btn) {
    border: 1px solid rgba(0, 0, 0, 0.446);
    padding-left: 20px;
    padding-right: 20px;
  }
}

.add-form-section {
  padding-top: 24px;
}

.add-form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* 모달 입력 필드 공통 스타일 */
.modal-input {
  position: relative;

  :deep(.q-field__label) {
    color: rgba(80, 80, 80, 0.76);
    text-align: left !important;
    justify-content: flex-start !important;
  }

  :deep(.q-field__label .q-field__label-container) {
    text-align: left !important;
    justify-content: flex-start !important;
  }

  :deep(.q-field__bottom) {
    color: rgba(49, 115, 74, 0.5);
    font-size: 0.75rem;
    line-height: 1;
  }

  :deep(.q-field__control::after),
  :deep(.q-field__control::before) {
    display: none !important;
    border: none !important;
  }

  :deep(.q-field__control) {
    border: none !important;
    border-bottom: none !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.446) !important;
  }

  :deep(.q-field--highlighted .q-field__control) {
    border-bottom: 2px solid var(--q-primary) !important;
  }

  :deep(.q-field__native),
  :deep(.q-field__marginal) {
    border-bottom: none !important;
  }
}

.modal-actions {
  padding-top: 24px;
  gap: 24px;
}

.modal-btn {
  min-width: 120px;
  min-height: 48px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: 1px solid rgba(0, 0, 0, 0.446);
  padding: 12px 34px;
}

/* 삭제 확인 모달 스타일 */
.delete-confirm-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 5px;
  box-shadow: none;
  padding: 32px;
}

.delete-confirm-header {
  padding: 24px 32px;
  text-align: center;
}

.delete-confirm-title {
  font-size: 2.1rem;
  font-weight: 700;
  color: rgba(212, 184, 0, 0.928);
}

.delete-confirm-content {
  padding: 32px;
  text-align: center;
}

.delete-confirm-message {
  font-size: 1.1rem;
  color: rgba(2, 168, 168, 0.7);
  margin-bottom: 16px;
  line-height: 1.6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;

  strong {
    color: rgba(11, 241, 3, 0.9);
    font-weight: 600;
  }
}

.delete-confirm-warning {
  color: rgba(244, 67, 54, 0.7);
  margin-top: 12px;
  text-align: center;
}

.delete-confirm-actions {
  padding: 24px 32px;
  gap: 16px;
}

.delete-confirm-btn {
  min-width: 120px;
  min-height: 48px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: 1px solid rgba(0, 0, 0, 0.446);
  padding: 12px 24px;
}
</style>
