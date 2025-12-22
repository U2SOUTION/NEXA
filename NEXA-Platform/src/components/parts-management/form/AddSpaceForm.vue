<!-- AddSpaceForm.vue
  룸(base_space) 생성 폼
-->

<template>
  <q-dialog v-model="dialogModel" persistent>
    <q-card style="min-width: 600px" class="modal-card">
      <q-card-section class="modal-header">
        <div class="row items-start justify-between">
          <div class="modal-title">ADD SPACE</div>
          <q-btn icon="close" flat round dense v-close-popup class="modal-close-btn" />
        </div>
      </q-card-section>

      <q-card-section class="modal-content">
        <q-input
          v-model="formData.name"
          label="공간 이름 *"
          hint="예: Vision Room, Test Room"
          :rules="[(val) => !!val || '이름을 입력하세요']"
          autofocus
          class="modal-input"
        />
        <q-input
          v-model="formData.sku"
          label="SKU 코드"
          hint="자동 생성되거나 수동 입력 가능"
          class="q-mt-md modal-input"
        />
        <q-input v-model="formData.description" label="설명 (선택)" class="q-mt-md modal-input" />
      </q-card-section>

      <q-card-actions align="center" class="modal-actions">
        <q-btn flat label="CANCEL" color="grey" v-close-popup class="modal-btn" />
        <q-btn
          flat
          label="CREATE"
          color="primary"
          @click="handleSubmit"
          :disable="!formData.name"
          class="modal-btn"
        />
      </q-card-actions>
    </q-card>
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

const emit = defineEmits(['update:modelValue', 'created'])

const partsStore = usePartsManagementStore()

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const formData = ref({
  name: '',
  sku: '',
  description: '',
})

// 다이얼로그가 열릴 때마다 폼 초기화
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      formData.value = {
        name: '',
        sku: '',
        description: '',
      }
    }
  },
)

function handleSubmit() {
  if (!formData.value.name) return

  // SKU 자동 생성 (없으면)
  if (!formData.value.sku) {
    // 간단한 자동 생성 로직 (실제로는 더 정교하게)
    const initials = formData.value.name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
    formData.value.sku = initials
  }

  // Store를 통해 공간 추가
  const newSpace = partsStore.addSpace({
    id: Date.now(), // 임시 ID
    name: formData.value.name,
    sku: formData.value.sku,
    description: formData.value.description,
    expanded: false,
  })

  emit('created', newSpace)
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
    color: rgba(80, 80, 80, 0.5);
  }

  /* 입력 필드 하단 힌트/에러 메시지 색상 설정 */
  :deep(.q-field__bottom) {
    color: rgba(49, 115, 74, 0.5);
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
    border-bottom: 1px solid rgba(0, 0, 0, 0.3) !important;
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
