<!-- SelectionComponentsSample.vue
  선택 관련 폼 요소 샘플 (체크박스, 라디오, 토글)
  아코디언 화살표 가려짐 테스트용
-->
<template>
  <div>
    <form @submit.prevent>
      <!-- 체크박스 (q-checkbox) -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">체크박스 (q-checkbox)</div>

        <!-- 단일 샘플들 -->
        <div class="row q-gutter-sm q-mb-sm">
          <q-checkbox v-model="formData.checkboxSingle" label="단일 체크박스" />
          <q-checkbox v-model="formData.checkboxIndeterminate" label="Indeterminate 상태" indeterminate-value="indeterminate" />
          <q-checkbox v-model="formData.checkboxDisabled" label="비활성화 상태" disable />
        </div>

        <!-- 라벨 포함 체크박스 -->
        <q-checkbox v-model="formData.checkboxWithLabel" label="매우 긴 라벨 텍스트: 이 라벨은 가로로 매우 길게 확장될 수 있어서 아코디언 화살표를 가릴 수 있습니다" class="q-mb-sm" />

        <!-- 체크박스 그룹 (수직) -->
        <div class="q-mb-sm">
          <div class="text-caption q-mb-xs">체크박스 그룹 (수직)</div>
          <q-checkbox v-model="formData.checkboxGroup" val="option1" label="수직 그룹 항목 1" class="block q-mb-xs" />
          <q-checkbox v-model="formData.checkboxGroup" val="option2" label="수직 그룹 항목 2" class="block q-mb-xs" />
          <q-checkbox v-model="formData.checkboxGroup" val="option3" label="수직 그룹 항목 3" class="block q-mb-xs" />
        </div>

        <!-- 체크박스 그룹 (수평) -->
        <div class="q-mb-sm">
          <div class="text-caption q-mb-xs">체크박스 그룹 (수평)</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6 col-md-4">
              <q-checkbox v-model="formData.checkboxGroupHorizontal" val="option1" label="수평 그룹 항목 1" />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-checkbox v-model="formData.checkboxGroupHorizontal" val="option2" label="수평 그룹 항목 2" />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-checkbox v-model="formData.checkboxGroupHorizontal" val="option3" label="수평 그룹 항목 3" />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-checkbox v-model="formData.checkboxGroupHorizontal" val="checkbox4" label="수평 그룹 항목 4" />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-checkbox v-model="formData.checkboxGroupHorizontal" val="checkbox5" label="수평 그룹 항목 5" />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-checkbox v-model="formData.checkboxGroupHorizontal" val="checkbox6" label="수평 그룹 항목 6" />
            </div>
          </div>
        </div>

        <!-- q-option-group 사용 -->
        <div class="q-mb-sm">
          <div class="text-caption q-mb-xs">체크박스 그룹 (q-option-group)</div>
          <q-option-group v-model="formData.checkboxOptionGroup" :options="checkboxOptions" type="checkbox" />
        </div>
      </div>

      <q-separator class="q-my-md" />

      <!-- 라디오 버튼 (q-radio) -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">라디오 버튼 (q-radio)</div>

        <!-- 단일 샘플들 -->
        <div class="row q-gutter-sm q-mb-sm">
          <q-radio :model-value="formData.radioSingle" val="option1" label="단일 라디오 버튼" color="primary" @click="handleRadioSingleClick" />
          <q-radio v-model="formData.radioDisabled" val="option1" label="비활성화 상태" color="primary" disable />
        </div>

        <!-- 라벨 포함 라디오 (선택 해제 가능) -->
        <q-radio :model-value="formData.radioWithLabel" val="option1" label="매우 긴 라벨 텍스트: 이 라벨은 가로로 매우 길게 확장될 수 있어서 아코디언 화살표를 가릴 수 있습니다" @click="handleRadioWithLabelClick" class="q-mb-sm" />

        <!-- 라디오 그룹 (수직) -->
        <div class="q-mb-sm">
          <div class="text-caption q-mb-xs">라디오 그룹 (수직)</div>
          <q-radio v-model="formData.radioGroup" val="option1" label="수직 그룹 선택 1" color="primary" class="block q-mb-xs" />
          <q-radio v-model="formData.radioGroup" val="option2" label="수직 그룹 선택 2" color="primary" class="block q-mb-xs" />
          <q-radio v-model="formData.radioGroup" val="option3" label="수직 그룹 선택 3" color="primary" class="block q-mb-xs" />
        </div>

        <!-- 라디오 그룹 (수평) -->
        <div class="q-mb-sm">
          <div class="text-caption q-mb-xs">라디오 그룹 (수평)</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6 col-md-4">
              <q-radio v-model="formData.radioGroupHorizontal" val="option1" label="수평 그룹 선택 1" color="primary" />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-radio v-model="formData.radioGroupHorizontal" val="option2" label="수평 그룹 선택 2" color="primary" />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-radio v-model="formData.radioGroupHorizontal" val="option3" label="수평 그룹 선택 3" color="primary" />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-radio v-model="formData.radioGroupHorizontal" val="radio4" label="수평 그룹 선택 4" color="primary" />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-radio v-model="formData.radioGroupHorizontal" val="radio5" label="수평 그룹 선택 5" color="primary" />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-radio v-model="formData.radioGroupHorizontal" val="radio6" label="수평 그룹 선택 6" color="primary" />
            </div>
          </div>
        </div>

        <!-- q-option-group 사용 -->
        <div class="q-mb-sm">
          <div class="text-caption q-mb-xs">라디오 그룹 (q-option-group)</div>
          <q-option-group v-model="formData.radioOptionGroup" :options="radioOptions" type="radio" inline />
        </div>
      </div>

      <q-separator class="q-my-md" />

      <!-- 토글 스위치 (q-toggle) -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">토글 스위치 (q-toggle)</div>

        <!-- 단일 샘플들 -->
        <div class="row q-gutter-sm q-mb-sm">
          <q-toggle v-model="formData.toggleSingle" label="단일 토글" />
          <q-toggle v-model="formData.toggleWithIcon" label="아이콘 포함 토글" icon="notifications" />
          <q-toggle v-model="formData.toggleColor" label="Primary 색상 토글" color="primary" />
          <q-toggle v-model="formData.toggleSize" label="XS 크기 토글" size="xs" />
          <q-toggle v-model="formData.toggleLabelLeft" label="라벨 왼쪽 토글" label-left />
          <q-toggle v-model="formData.toggleCustomIcon" label="커스텀 아이콘 토글" checked-icon="check" unchecked-icon="close" />
          <q-toggle v-model="formData.toggleDense" label="Dense 스타일 토글" dense />
          <q-toggle v-model="formData.toggleKeepColor" label="Keep Color 토글" color="primary" keep-color />
          <q-toggle v-model="formData.toggleDisabled" label="비활성화 상태" disable />
        </div>

        <!-- 라벨 포함 토글 -->
        <q-toggle v-model="formData.toggleWithLabel" label="매우 긴 라벨 텍스트: 이 라벨은 가로로 매우 길게 확장될 수 있어서 아코디언 화살표를 가릴 수 있습니다" class="q-mb-sm" />

        <!-- 토글 그룹 (수직) -->
        <div class="q-mb-sm">
          <div class="text-caption q-mb-xs">토글 그룹 (수직)</div>
          <q-toggle v-model="formData.toggleGroup" val="option1" label="수직 그룹 설정 1" class="block q-mb-xs" />
          <q-toggle v-model="formData.toggleGroup" val="option2" label="수직 그룹 설정 2" class="block q-mb-xs" />
          <q-toggle v-model="formData.toggleGroup" val="option3" label="수직 그룹 설정 3" class="block q-mb-xs" />
        </div>

        <!-- 토글 그룹 (수평) -->
        <div class="q-mb-sm">
          <div class="text-caption q-mb-xs">토글 그룹 (수평)</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-toggle v-model="formData.toggleGroupHorizontal" val="option1" label="수평 그룹 설정 1" />
            </div>
            <div class="col-12 col-sm-6">
              <q-toggle v-model="formData.toggleGroupHorizontal" val="option2" label="수평 그룹 설정 2" />
            </div>
          </div>
        </div>

        <!-- q-option-group 사용 -->
        <div class="q-mb-sm">
          <div class="text-caption q-mb-xs">토글 그룹 (q-option-group)</div>
          <q-option-group v-model="formData.toggleOptionGroup" :options="toggleOptions" type="toggle" />
        </div>
      </div>

      <q-separator class="q-my-md" />

      <!-- 버튼 토글 (q-btn-toggle) -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">버튼 토글 (q-btn-toggle)</div>

        <!-- Spread 버튼 토글 (전체 너비) -->
        <div class="q-mb-sm">
          <div class="text-caption q-mb-xs">Spread 버튼 토글 (전체 너비)</div>
          <q-btn-toggle v-model="formData.btnToggleSpread" :options="btnToggleSpreadOptions" spread toggle-color="primary" class="q-mb-xs" />
        </div>
      </div>

      <q-separator class="q-my-md" />

      <!-- 칩 (q-chip) -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">칩 (q-chip)</div>

        <div class="row q-gutter-sm">
          <!-- 기본 칩 -->
          <q-chip label="기본 칩" />

          <!-- 클릭 가능한 칩 -->
          <q-chip v-model="formData.chipClickable" label="클릭 가능한 칩" clickable color="primary" text-color="white" />

          <!-- 제거 가능한 칩 -->
          <q-chip v-if="formData.chipRemovable" removable label="제거 가능한 칩" color="secondary" text-color="white" @remove="formData.chipRemovable = false" />

          <!-- 아이콘 포함 칩 -->
          <q-chip icon="bookmark" label="아이콘 포함 칩" color="accent" text-color="white" />
        </div>
      </div>

      <q-separator class="q-my-md" />

      <!-- 평점 (q-rating) -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">평점 (q-rating)</div>

        <div class="row q-gutter-md items-center">
          <!-- 기본 평점 -->
          <q-rating v-model="formData.ratingBasic" />

          <!-- 최대값 설정 -->
          <q-rating v-model="formData.ratingMax" :max="10" />

          <!-- 아이콘 변경 -->
          <q-rating v-model="formData.ratingIcon" icon="favorite" />

          <!-- 읽기 전용 -->
          <q-rating :model-value="4" readonly />
        </div>
      </div>

      <q-separator class="q-my-md" />

      <!-- 노브 (q-knob) -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">노브 (q-knob)</div>

        <div class="row q-gutter-md items-center">
          <!-- 기본 노브 -->
          <q-knob v-model="formData.knobBasic" size="72px" color="primary" />

          <!-- 최소/최대값 설정 -->
          <q-knob v-model="formData.knobRange" :min="0" :max="100" size="72px" color="secondary" />

          <!-- 단계 설정 -->
          <q-knob v-model="formData.knobStep" :min="0" :max="100" :step="10" size="72px" color="accent" />

          <!-- 값 표시 -->
          <q-knob v-model="formData.knobShowValue" size="72px" color="primary" show-value />
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({
  // 체크박스
  checkboxSingle: false,
  checkboxWithLabel: false,
  checkboxGroup: [],
  checkboxGroupHorizontal: [],
  checkboxOptionGroup: [],
  checkboxIndeterminate: 'indeterminate',
  checkboxDisabled: false,

  // 라디오
  radioSingle: 'option1', // 기본 선택
  radioWithLabel: 'option1', // 기본 선택
  radioGroup: 'option1', // 기본 선택
  radioGroupHorizontal: 'option1', // 기본 선택
  radioOptionGroup: 'radio4', // 기본 선택 (radioOptions의 첫 번째 값)
  radioDisabled: null,

  // 토글
  toggleSingle: false,
  toggleWithLabel: false,
  toggleGroup: [],
  toggleGroupHorizontal: [],
  toggleOptionGroup: [],
  toggleWithIcon: false,
  toggleColor: false,
  toggleSize: false,
  toggleLabelLeft: false,
  toggleCustomIcon: false,
  toggleDense: false,
  toggleKeepColor: false,
  toggleDisabled: false,

  // 버튼 토글
  btnToggleSpread: null,

  // 칩
  chipClickable: false,
  chipRemovable: true,

  // 평점
  ratingBasic: 3,
  ratingMax: 5,
  ratingIcon: 4,

  // 노브
  knobBasic: 50,
  knobRange: 75,
  knobStep: 50,
  knobShowValue: 60,
})

const checkboxOptions = [
  { label: '배열 데이터로 생성된 항목 1', value: 'checkbox4' },
  { label: '배열 데이터로 생성된 항목 2', value: 'checkbox5' },
  { label: '배열 데이터로 생성된 항목 3', value: 'checkbox6' },
]

const radioOptions = [
  { label: '배열 데이터로 생성된 선택 1', value: 'radio4' },
  { label: '배열 데이터로 생성된 선택 2', value: 'radio5' },
  { label: '배열 데이터로 생성된 선택 3', value: 'radio6' },
]

const toggleOptions = [
  { label: '배열 데이터로 생성된 설정 1', value: 'toggle3' },
  { label: '배열 데이터로 생성된 설정 2', value: 'toggle4' },
  { label: '배열 데이터로 생성된 설정 3', value: 'toggle5' },
]

const btnToggleSpreadOptions = [
  { label: 'Push', value: 'push', icon: 'double_arrow' },
  { label: 'Overlay', value: 'overlay', icon: 'layers' },
]

// 단일 라디오 버튼 선택 해제 핸들러
function handleRadioSingleClick(event) {
  // 이미 선택된 상태에서 다시 클릭하면 해제
  if (formData.value.radioSingle === 'option1') {
    event.preventDefault()
    formData.value.radioSingle = null
  } else {
    formData.value.radioSingle = 'option1'
  }
}

// 라벨 포함 라디오 버튼 선택 해제 핸들러
function handleRadioWithLabelClick(event) {
  // 이미 선택된 상태에서 다시 클릭하면 해제
  if (formData.value.radioWithLabel === 'option1') {
    event.preventDefault()
    formData.value.radioWithLabel = null
  } else {
    formData.value.radioWithLabel = 'option1'
  }
}
</script>
