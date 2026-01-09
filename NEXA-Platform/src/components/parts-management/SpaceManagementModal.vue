<!-- SpaceManagementModal.vue
  부품함 배치 공간 관리 모달
  공간 추가, 수정, 삭제 기능 제공
-->

<template>
  <q-dialog v-model="dialogModel" persistent>
    <q-card style="min-width: 800px; max-width: 1000px" class="modal-card">
      <q-card-section class="modal-header">
        <div class="row items-start justify-between">
          <div class="modal-title">부품함 배치 공간 관리</div>
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
        <!-- 공간 목록 -->
        <div class="spaces-section">
          <div class="section-header">
            <div class="section-title">공간 목록</div>
            <q-btn
              flat
              dense
              label="새 공간 추가"
              color="primary"
              icon="add"
              @click="handleAddNew"
              class="add-btn"
            />
          </div>

          <div v-if="rootSpaces.length === 0" class="empty-state">
            <q-icon name="warehouse" size="64px" color="grey-6" />
            <div class="text-caption text-grey-6 q-mt-sm">등록된 공간이 없습니다</div>
          </div>

          <q-list v-else bordered separator>
            <q-item
              v-for="space in rootSpaces"
              :key="space.id"
              class="space-item"
              :class="{
                'is-editing': editingSpaceId === space.id,
              }"
            >
              <q-item-section>
                <div v-if="editingSpaceId !== space.id" class="space-info">
                  <div class="space-content">
                    <div class="space-name">{{ space.name }}</div>
                    <div class="space-details text-caption text-grey-6">
                      <span v-if="space.sku">SKU: {{ space.sku }} | </span>
                      하위 구조: {{ getSpaceSummary(space) }}
                    </div>
                    <div
                      v-if="space.description"
                      class="space-description text-caption text-grey-6 q-mt-xs"
                    >
                      {{ space.description }}
                    </div>
                  </div>
                </div>
                <div v-else class="space-edit-form">
                  <q-input
                    v-model="editFormData.name"
                    label="공간 이름 *"
                    dense
                    class="q-mb-sm"
                    :rules="[(val) => !!val || '이름을 입력하세요']"
                  />
                  <q-input v-model="editFormData.sku" label="SKU 코드" dense class="q-mb-sm" />
                  <q-input
                    v-model="editFormData.description"
                    label="설명"
                    dense
                    type="textarea"
                    rows="2"
                    class="q-mt-sm q-mb-sm"
                  />
                  <div class="space-edit-actions">
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
                <div v-if="editingSpaceId !== space.id" class="space-actions">
                  <q-btn flat round dense icon="edit" @click="handleEdit(space)" class="q-mr-xs" />
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    color="negative"
                    @click="handleDelete(space.id, space.name)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- 새 공간 추가 폼 -->
        <div v-if="showAddForm" class="add-form-section q-mt-lg">
          <div class="section-title q-mb-md">공간 추가 항목</div>
          <q-input
            v-model="newSpaceForm.name"
            label="공간 이름 *"
            class="modal-input q-mb-md"
            :rules="[(val) => !!val || '이름을 입력하세요']"
            autofocus
          />
          <q-input v-model="newSpaceForm.sku" label="SKU 코드" class="modal-input q-mb-md" />
          <q-input v-model="newSpaceForm.description" label="설명" class="modal-input q-mb-md" />
        </div>
      </q-card-section>

      <q-card-actions align="center" class="modal-actions">
        <template v-if="showAddForm">
          <q-btn
            flat
            label="추가하기"
            color="primary"
            @click="handleAddSpace"
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
            정말로 <strong>{{ deleteTargetName }}</strong> 공간을 삭제하시겠습니까?
          </div>
          <div class="delete-confirm-warning text-caption">
            이 작업은 되돌릴 수 없습니다.
            <br />
            하위의 모든 스토리지 블록, 층, 그리고 배치된 부품함 정보도 함께 삭제됩니다.
          </div>
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
import { usePartsManagementStore } from 'src/system/store/partsManagementStore'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const partsStore = usePartsManagementStore()
const $q = useQuasar()

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 최상단 공간 목록만 (base_space 타입만)
const rootSpaces = computed(() => {
  return (partsStore.getRootNodes || []).filter((node) => node.type === 'base_space')
})

// 공간의 하위 구조 요약 정보
function getSpaceSummary(space) {
  if (!space.children || space.children.length === 0) {
    return '하위 항목 없음'
  }

  const blocks = space.children.filter((child) => child.type === 'storage_block')
  const blockCount = blocks.length

  if (blockCount === 0) {
    return '하위 항목 없음'
  }

  // 각 블록의 행 수 계산
  let totalRows = 0
  blocks.forEach((block) => {
    if (block.children) {
      totalRows += block.children.filter((child) => child.type === 'storage_row').length
    }
  })

  const parts = []
  if (blockCount > 0) {
    parts.push(`스토리지 블록 ${blockCount}개`)
  }
  if (totalRows > 0) {
    parts.push(`층 ${totalRows}개`)
  }

  return parts.join(', ')
}

// 새 공간 추가 폼 표시 여부
const showAddForm = ref(false)

// 새 공간 폼 데이터
const newSpaceForm = ref({
  name: '',
  sku: '',
  description: '',
})

// 수정 중인 공간 ID
const editingSpaceId = ref(null)

// 삭제 확인 모달 관련 상태
const showDeleteConfirm = ref(false)
const deleteTargetId = ref(null)
const deleteTargetName = ref('')

// 수정 폼 데이터
const editFormData = ref({
  name: '',
  sku: '',
  description: '',
})

// 새 공간 폼 유효성 검사
const isNewFormValid = computed(() => {
  return !!newSpaceForm.value.name
})

// 다이얼로그가 열릴 때마다 초기화
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      showAddForm.value = false
      editingSpaceId.value = null
      showDeleteConfirm.value = false
      deleteTargetId.value = null
      deleteTargetName.value = ''
      resetNewForm()
    }
  },
)

function resetNewForm() {
  newSpaceForm.value = {
    name: '',
    sku: '',
    description: '',
  }
}

function handleAddNew() {
  showAddForm.value = true
  editingSpaceId.value = null
  resetNewForm()
}

function handleCancelAdd() {
  showAddForm.value = false
  resetNewForm()
}

function handleAddSpace() {
  if (!isNewFormValid.value) return

  try {
    partsStore.addSpace({
      name: newSpaceForm.value.name,
      sku: newSpaceForm.value.sku || '',
      description: newSpaceForm.value.description || '',
      expanded: false,
    })

    showAddForm.value = false
    resetNewForm()
    $q.notify({
      type: 'positive',
      message: '공간이 추가되었습니다',
      position: 'top',
    })
  } catch (error) {
    console.error('공간 추가 실패:', error)
    $q.notify({
      type: 'negative',
      message: '공간 추가에 실패했습니다',
      position: 'top',
    })
  }
}

function handleEdit(space) {
  editingSpaceId.value = space.id
  editFormData.value = {
    name: space.name,
    sku: space.sku || '',
    description: space.description || '',
  }
  showAddForm.value = false
}

function handleCancelEdit() {
  editingSpaceId.value = null
  editFormData.value = {
    name: '',
    sku: '',
    description: '',
  }
}

function handleSave() {
  if (!editFormData.value.name) return

  try {
    partsStore.updateNode(editingSpaceId.value, {
      name: editFormData.value.name,
      sku: editFormData.value.sku || '',
      description: editFormData.value.description || '',
    })

    editingSpaceId.value = null
    $q.notify({
      type: 'positive',
      message: '공간이 수정되었습니다',
      position: 'top',
    })
  } catch (error) {
    console.error('공간 수정 실패:', error)
    $q.notify({
      type: 'negative',
      message: '공간 수정에 실패했습니다',
      position: 'top',
    })
  }
}

function handleDelete(spaceId, spaceName) {
  deleteTargetId.value = spaceId
  deleteTargetName.value = spaceName
  showDeleteConfirm.value = true
}

function confirmDelete() {
  if (deleteTargetId.value === null) return

  try {
    partsStore.removeNode(deleteTargetId.value)
    showDeleteConfirm.value = false
    deleteTargetId.value = null
    deleteTargetName.value = ''
    $q.notify({
      type: 'positive',
      message: '공간이 삭제되었습니다',
      position: 'top',
    })
  } catch (error) {
    console.error('공간 삭제 실패:', error)
    $q.notify({
      type: 'negative',
      message: '공간 삭제에 실패했습니다',
      position: 'top',
    })
  }
}

function handleClose() {
  showAddForm.value = false
  editingSpaceId.value = null
  resetNewForm()
  emit('update:modelValue', false)
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

.space-item {
  padding: 16px;
  transition: background-color 0.2s;
  border-color: rgba(0, 0, 0, 0.585) !important;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  &.is-editing {
    background-color: rgba(33, 150, 243, 0.02);
  }
}

.spaces-section :deep(.q-list) {
  border-color: rgba(0, 0, 0, 0.427) !important;
}

.spaces-section :deep(.q-item) {
  border-color: rgba(0, 0, 0, 0.535) !important;
}

.space-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;

  .space-content {
    flex: 1;
    min-width: 0;
  }

  .space-name {
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 2px;
    color: rgba(57, 207, 30, 0.6);
  }

  .space-details {
    font-size: 0.875rem;
  }

  .space-description {
    font-size: 0.8rem;
  }
}

.space-edit-form {
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

  > .q-input:first-child {
    :deep(.q-field__native) {
      color: rgba(57, 207, 30, 0.6);
      font-weight: 600;
      font-size: 1rem;
    }
  }
}

.space-actions {
  display: flex;
  align-items: center;
}

.space-edit-actions {
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
</style>

<style lang="scss">
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
