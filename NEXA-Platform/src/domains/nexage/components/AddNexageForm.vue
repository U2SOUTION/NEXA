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
          isEditing ? '보드 정보 수정' : '보드 정보 입력'
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
        full-width
        v-model="formData.boardName"
        label="보드 이름 *"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || '보드 이름을 입력하세요']"
      />

      <q-select
        filled
        full-width
        v-model="formData.windowType"
        :options="windowTypeOptions"
        label="넥사보드 창 유형 선택 *"
        emit-value
        map-options
      />

      <q-select
        filled
        full-width
        v-model="formData.deviceCategory"
        :options="deviceCategoryOptions"
        label="디바이스 분류 (시스템에서 제공) *"
        emit-value
        map-options
      />

      <q-select
        filled
        full-width
        v-model="formData.deviceSelection"
        :options="deviceOptions"
        label="디바이스 선택 (자신이 등록한 디바이스 선택) *"
        emit-value
        map-options
      />

      <q-select
        filled
        full-width
        v-model="formData.nexaPanelList"
        multiple
        :options="nexaPanelOptions"
        use-chips
        stack-label
        label="넥사패널 리스트 (선택 사항)"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-select>

      <q-input
        filled
        full-width
        v-model="formData.description"
        label="보드 설명 (선택 사항)"
        type="textarea"
        autogrow
      />

      <q-input filled full-width v-model="formData.installRegion" label="설치 지역 (선택 사항)" />
      <q-input filled full-width v-model="formData.installLocation" label="설치 장소 (선택 사항)" />
      <q-input
        filled
        full-width
        v-model="formData.adminEmail"
        label="관리자 이메일 (선택 사항)"
        type="email"
      />
      <q-input
        filled
        full-width
        v-model="formData.adminPhone"
        label="관리자 전화번호 (선택 사항)"
        type="tel"
      />

      <q-item dense>
        <q-item-section>
          <q-item-label caption class="text-grey-7">
            로봇 등록 방지 (CAPTCHA 기능은 여기에 통합됩니다)
          </q-item-label>
        </q-item-section>
      </q-item>

      <div class="row no-wrap q-mt-md">
        <q-btn
          label="취소"
          type="button"
          color="flat"
          @click="cancelForm"
          class="q-mr-sm text-subtitle1"
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
  initialData: {
    type: Object,
    default: null,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
})

if (import.meta.env.DEV) {
  console.log('AddBoardForm parentNode prop:', props.parentNode)
  if (props.isEditing) {
    console.log(
      '[AddBoardForm] Props received - isEditing:',
      props.isEditing,
      'initialData:',
      JSON.parse(JSON.stringify(props.initialData || {})),
    )
  }
}

const emit = defineEmits(['save', 'cancel', 'go-prev-step'])

const initialFormData = {
  boardName: '',
  windowType: 'single',
  deviceCategory: null,
  deviceSelection: null,
  macAddress: '',
  nexaPanelList: [],
  installRegion: '',
  installLocation: '',
  adminEmail: '',
  adminPhone: '',
  description: '',
}

const formData = ref({ ...initialFormData })

watch(
  () => [props.isEditing, props.initialData],
  ([editing, data]) => {
    if (import.meta.env.DEV) {
      console.log(
        '[AddBoardForm Watch] Triggered. Editing:',
        editing,
        'Raw Data:',
        JSON.parse(JSON.stringify(data || {})),
      )
    }
    if (editing && data) {
      if (import.meta.env.DEV) {
        console.log(
          '[AddBoardForm Watch] Assigning data. name (for boardName):',
          data.name,
          'windowType:',
          data.windowType,
        )
      }
      formData.value.boardName = data.name || ''
      formData.value.windowType = data.windowType || 'single'
      formData.value.deviceCategory = data.deviceCategory || null
      formData.value.deviceSelection = data.deviceSelection || null
      formData.value.macAddress = data.macAddress || ''
      formData.value.nexaPanelList = Array.isArray(data.nexaPanelList)
        ? [...data.nexaPanelList]
        : []
      formData.value.installRegion = data.installRegion || ''
      formData.value.installLocation = data.installLocation || ''
      formData.value.adminEmail = data.adminEmail || ''
      formData.value.adminPhone = data.adminPhone || ''
      formData.value.description = data.description || ''
      if (import.meta.env.DEV) {
        console.log(
          '[AddBoardForm Watch] formData after assignment:',
          JSON.parse(JSON.stringify(formData.value)),
        )
      }
    } else {
      Object.assign(formData.value, initialFormData)
    }
  },
  { immediate: true, deep: true },
)

const saveButtonLabel = computed(() => {
  return props.isEditing ? '수정' : '저장'
})

const windowTypeOptions = [
  { label: '단일 창', value: 'single' },
  { label: '좌우 분할', value: 'split-lr' },
  { label: 'L자형 분할', value: 'l-shape' },
  { label: '상하 분할', value: 'split-tb' },
]
const deviceCategoryOptions = [
  { label: '센서', value: 'sensor' },
  { label: '카메라', value: 'camera' },
  { label: '제어기', value: 'controller' },
]
const deviceOptions = [
  { label: '온도 센서 A (Sensor)', value: 'temp-a' },
  { label: 'IP 카메라 1 (Camera)', value: 'cam-1' },
  { label: '조명 제어기 X (Controller)', value: 'light-x' },
]
const nexaPanelOptions = ['온도 현황', '카메라 뷰', '조명 제어', '전력 사용량']

function submitForm() {
  if (formData.value.boardName && formData.value.boardName.trim()) {
    emit('save', { ...formData.value })
  } else {
    console.warn('보드 이름을 입력해주세요.')
  }
}

function cancelForm() {
  emit('cancel')
}

function goToPrevStep() {
  emit('go-prev-step')
}
</script>

<style scoped>
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
