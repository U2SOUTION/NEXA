<template>
  <div
    class="column items-center full-width q-mb-lg"
    style="width: 100%; max-width: 700px; margin: 0 auto"
  >
    <div
      class="step-header row items-center q-mb-xxl"
      style="max-width: 700px; margin: 0 auto; min-height: 40px"
    >
      <div class="col text-center">
        <div
          class="step-number bg-primary text-white q-mr-lg"
          style="display: inline-flex; vertical-align: middle"
        >
          3
        </div>
        <span class="text-h4 text-weight-bold text-grey-4" style="vertical-align: middle">{{
          isEditing ? '그룹 정보 수정' : '그룹 정보 입력'
        }}</span>
      </div>
    </div>
    <div
      style="
        position: relative;
        width: 100%;
        max-width: 700px;
        margin: 0 auto;
        min-height: 36px;
        margin-bottom: 8px;
      "
    >
      <div class="text-grey-6 q-mb-xs text-center" style="width: 100%">
        필수 항목을 모두 입력한 후 저장을 눌러주세요.<br />
        입력하신 정보는 저장 후에도 수정할 수 있습니다.
      </div>
      <q-btn
        icon="arrow_back"
        label="이전"
        flat
        color="grey-6"
        style="position: absolute; right: 0; top: 50%; transform: translateY(-50%)"
        @click="goToPrevStep"
      />
    </div>

    <q-form @submit.prevent="submitForm" class="q-gutter-md" style="width: 100%">
      <q-input
        filled
        v-model="formData.name"
        label="그룹 이름"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || '그룹 이름을 입력해주세요']"
        class="full-width"
      />
      <q-input
        filled
        v-model="formData.description"
        label="설명 (선택 사항)"
        type="textarea"
        autogrow
        class="full-width"
      />
      <div style="display: flex; width: 100%; gap: 8px; margin: 24px 0 0 0; padding: 0">
        <q-btn
          label="취소"
          type="button"
          color="flat"
          @click="cancelForm"
          class="text-subtitle1"
          style="width: 50%"
        />
        <q-btn
          :label="saveButtonLabel"
          type="submit"
          color="primary"
          class="text-subtitle1"
          style="width: 50%"
        />
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  parentNode: {
    type: Object,
    default: null,
  },
  // 기존 데이터 수정을 위한 initialData prop (선택적)
  initialData: {
    type: Object,
    default: null,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
})

// 개발 모드에서만 실행되도록 하여 빌드 시에는 포함되지 않도록 함
if (import.meta.env.DEV) {
  console.log('AddGroupForm parentNode prop:', props.parentNode)
}

const emit = defineEmits(['save', 'cancel', 'go-prev-step'])

const formData = ref({
  name: '',
  description: '',
})

// isEditing과 initialData를 감시하여 formData 업데이트
watch(
  () => [props.isEditing, props.initialData],
  ([editing, data]) => {
    if (editing && data) {
      formData.value.name = data.name || ''
      formData.value.description = data.description || ''
    } else {
      formData.value.name = ''
      formData.value.description = ''
    }
  },
  { immediate: true, deep: true },
)

// 저장 버튼 텍스트를 위한 computed 속성
const saveButtonLabel = computed(() => {
  return props.isEditing ? '수정' : '저장'
})

function submitForm() {
  if (formData.value.name.trim()) {
    emit('save', { ...formData.value })
  }
}

function cancelForm() {
  emit('cancel')
  // 폼 초기화 (선택적)
  // formData.value.name = '';
  // formData.value.description = '';
}

function goToPrevStep() {
  emit('go-prev-step')
}
</script>

<style scoped>
.full-width {
  width: 100%;
}
.step-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}
.step-number {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  background: var(--nexa-primary);
  color: #fff;
  margin-right: 16px;
}
</style>
