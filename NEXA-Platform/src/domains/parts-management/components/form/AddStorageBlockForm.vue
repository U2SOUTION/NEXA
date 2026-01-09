<!-- AddStorageBlockForm.vue
  스토리지 블록(storage_block) 생성 폼
  선반/랙 타입에 따라 다른 입력 필드 표시
-->

<template>
  <q-dialog v-model="dialogModel" persistent>
    <q-card style="min-width: 600px" class="modal-card">
      <q-card-section class="modal-header">
        <div class="row items-start justify-between">
          <div class="modal-title">ADD STORAGE BLOCK</div>
          <q-btn icon="close" flat round dense v-close-popup class="modal-close-btn" />
        </div>
      </q-card-section>

      <q-card-section class="modal-content">
        <!-- 부모 공간 표시 -->
        <q-input v-model="parentSpaceName" label="부모 공간" readonly class="q-mb-md modal-input" />

        <!-- 스토리지 타입 선택 -->
        <q-select
          v-model="formData.storage_type"
          :options="storageTypeOptions"
          label="스토리지 타입 *"
          emit-value
          map-options
          :rules="[(val) => !!val || '타입을 선택하세요']"
          class="q-mb-md modal-input"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <q-icon :name="scope.opt.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption>{{ scope.opt.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <!-- 이름 입력 -->
        <q-input
          v-model="formData.name"
          label="블록 이름 *"
          hint="예: RACK-01, CABINET-01"
          :rules="[(val) => !!val || '이름을 입력하세요']"
          class="q-mb-md modal-input"
        />

        <!-- SKU 입력 -->
        <q-input
          v-model="formData.sku"
          label="SKU 코드"
          hint="자동 생성되거나 수동 입력 가능"
          class="q-mb-md modal-input"
        />

        <!-- 선반인 경우: 층 수만 입력 -->
        <div v-if="formData.storage_type === 'SHELF_UNIT'">
          <q-input
            v-model.number="formData.row_count"
            type="number"
            label="층 수 *"
            hint="선반의 층 수를 입력하세요"
            :rules="[(val) => (val > 0 && val <= 20) || '1~20 사이의 숫자를 입력하세요']"
            min="1"
            max="20"
            class="q-mb-md modal-input"
          />
        </div>

        <!-- 랙인 경우: 층 수 + 좌우 칸 수 입력 -->
        <div v-if="formData.storage_type === 'RACK'">
          <q-input
            v-model.number="formData.row_count"
            type="number"
            label="층 수 *"
            hint="랙의 층 수를 입력하세요"
            :rules="[(val) => (val > 0 && val <= 20) || '1~20 사이의 숫자를 입력하세요']"
            min="1"
            max="20"
            class="q-mb-md modal-input"
          />
          <q-input
            v-model.number="formData.column_count"
            type="number"
            label="좌우 칸 수 *"
            hint="각 층의 좌우 칸 수를 입력하세요"
            :rules="[(val) => (val > 0 && val <= 50) || '1~50 사이의 숫자를 입력하세요']"
            min="1"
            max="50"
            class="q-mb-md modal-input"
          />
        </div>

        <!-- 캐비닛인 경우: 층 수만 입력 (선반과 동일) -->
        <div v-if="formData.storage_type === 'CABINET'">
          <q-input
            v-model.number="formData.row_count"
            type="number"
            label="층 수 *"
            hint="캐비닛의 층 수를 입력하세요"
            :rules="[(val) => (val > 0 && val <= 20) || '1~20 사이의 숫자를 입력하세요']"
            min="1"
            max="20"
            class="q-mb-md modal-input"
          />
        </div>
      </q-card-section>

      <q-card-actions align="center" class="modal-actions">
        <q-btn flat label="CANCEL" color="grey" v-close-popup class="modal-btn" />
        <q-btn
          flat
          label="CREATE"
          color="primary"
          @click="handleSubmit"
          :disable="!isFormValid"
          class="modal-btn"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePartsManagementStore } from '@system/store/partsManagementStore.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  parentSpaceId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'created'])

const partsStore = usePartsManagementStore()

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const storageTypeOptions = [
  {
    label: '선반',
    value: 'SHELF_UNIT',
    icon: 'view_quilt',
    description: '단순 선반 구조',
  },
  {
    label: '랙',
    value: 'RACK',
    icon: 'inventory_2',
    description: '층과 칸이 있는 랙 구조',
  },
  {
    label: '캐비닛',
    value: 'CABINET',
    icon: 'kitchen',
    description: '캐비닛 구조',
  },
]

const formData = ref({
  storage_type: null,
  name: '',
  sku: '',
  row_count: null,
  column_count: null, // 랙인 경우만 사용
})

const parentSpaceName = computed(() => {
  const space = partsStore.getNodeById(props.parentSpaceId)
  return space ? space.name : ''
})

const isFormValid = computed(() => {
  if (!formData.value.storage_type || !formData.value.name) return false
  if (!formData.value.row_count || formData.value.row_count < 1) return false
  if (formData.value.storage_type === 'RACK') {
    if (!formData.value.column_count || formData.value.column_count < 1) return false
  }
  return true
})

// 다이얼로그가 열릴 때마다 폼 초기화
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      formData.value = {
        storage_type: null,
        name: '',
        sku: '',
        row_count: null,
        column_count: null,
      }
    }
  },
)

function handleSubmit() {
  if (!isFormValid.value) return

  // SKU 자동 생성 (없으면)
  if (!formData.value.sku) {
    const parentSpace = partsStore.getNodeById(props.parentSpaceId)
    const typePrefix =
      formData.value.storage_type === 'RACK'
        ? 'RACK'
        : formData.value.storage_type === 'CABINET'
          ? 'CAB'
          : 'SHELF'
    formData.value.sku = `${parentSpace?.sku || 'SPACE'}-${typePrefix}-01`
  }

  // storage_rows 생성
  const rows = []
  for (let i = 1; i <= formData.value.row_count; i++) {
    if (formData.value.storage_type === 'RACK') {
      // 랙인 경우: 각 층마다 여러 칸 생성 (나중에 구현)
      // 지금은 일단 층만 생성
      rows.push({
        id: Date.now() + i,
        type: 'storage_row',
        name: `${formData.value.name} - ${i}층`,
        sku: `${formData.value.sku}-${i}`,
        row_identifier: String(i),
        parentId: null, // 나중에 설정
        expanded: false,
      })
    } else {
      // 선반/캐비닛인 경우: 층만 생성
      rows.push({
        id: Date.now() + i,
        type: 'storage_row',
        name: `${formData.value.name} - ${i}층`,
        sku: `${formData.value.sku}-${i}`,
        row_identifier: String(i),
        parentId: null, // 나중에 설정
        expanded: false,
      })
    }
  }

  // Store를 통해 스토리지 블록 추가
  const blockId = Date.now()
  const newBlock = partsStore.addStorageBlock({
    id: blockId,
    name: formData.value.name,
    sku: formData.value.sku,
    storage_type: formData.value.storage_type,
    column_count: formData.value.storage_type === 'RACK' ? formData.value.column_count : null,
    parentId: props.parentSpaceId,
    expanded: false,
  })

  if (!newBlock) {
    console.error('[AddStorageBlockForm] Failed to create storage block')
    return
  }

  // 스토리지 행들 추가
  rows.forEach((row) => {
    partsStore.addStorageRow({
      id: row.id,
      name: row.name,
      sku: row.sku,
      row_identifier: row.row_identifier,
      parentId: blockId,
    })
  })

  emit('created', newBlock)
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
  line-height: 1.2; /* 줄간격 줄이기 */
  flex: 1; /* 남은 공간 차지 */
  margin-right: 16px; /* 닫기 버튼과 간격 */
}

.modal-close-btn {
  flex-shrink: 0; /* 크기 고정 */
  margin-top: 5px; /* 상단 정렬 */
  color: rgba(147, 147, 147, 0.5);
}

.modal-content {
  padding: 24px 0;
}

/* 모달 입력 필드 공통 스타일 */
.modal-input {
  /* 입력 필드 라벨 색상 설정 */
  :deep(.q-field__label) {
    color: rgba(125, 125, 125, 0.5);
  }

  /* 입력 필드 하단 힌트/에러 메시지 색상 설정 */
  :deep(.q-field__bottom) {
    color: rgba(62, 102, 87, 0.5);
  }

  /* Quasar의 기본 라인 완전히 제거 */
  :deep(.q-field__control::after),
  :deep(.q-field__control::before) {
    display: none !important;
    border: none !important;
  }

  /* Quasar의 모든 기본 border 제거 */
  :deep(.q-field__control) {
    border: none !important;
    border-bottom: none !important;
    /* 우리가 지정한 라인만 사용 */
    border-bottom: 2px solid rgba(0, 0, 0, 0.338) !important;
  }

  :deep(.q-field--highlighted .q-field__control) {
    border-bottom: 2px solid var(--q-primary) !important;
  }

  /* Quasar의 다른 라인 관련 스타일도 제거 */
  :deep(.q-field__native),
  :deep(.q-field__marginal) {
    border-bottom: none !important;
  }
}

.modal-actions {
  padding-top: 24px;
  gap: 24px; /* 버튼 간격 */
}

.modal-btn {
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
