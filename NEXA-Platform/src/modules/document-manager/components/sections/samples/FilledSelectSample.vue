<!-- FilledSelectSample.vue
  Filled 스타일 q-select 샘플
  아코디언 화살표 가려짐 테스트용
-->
<template>
  <div class="filled-select-sample">
    <form @submit.prevent>
      <div class="form-group">
        <div class="text-subtitle2 q-mb-sm">Filled 스타일 선택 필드 (q-select)</div>

        <!-- 기본 단일 선택 -->
        <q-select v-model="formData.selectSingle" :options="selectOptions" label="단일 선택" filled dense emit-value map-options class="q-mb-sm" />

        <!-- 긴 라벨 선택 -->
        <q-select v-model="formData.selectLongLabel" :options="selectOptions" label="매우 긴 라벨 텍스트: 이 라벨은 가로로 매우 길게 확장될 수 있어서 아코디언 화살표를 가릴 수 있습니다" filled dense emit-value map-options class="q-mb-sm" />

        <!-- 다중 선택 -->
        <q-select v-model="formData.selectMultiple" :options="selectOptions" label="다중 선택" multiple filled dense emit-value map-options class="q-mb-sm" />

        <!-- 칩 표시 다중 선택 -->
        <q-select v-model="formData.selectChips" :options="selectOptions" label="칩 표시 다중 선택" multiple use-chips filled dense emit-value map-options class="q-mb-sm" />

        <!-- 검색 가능한 선택 -->
        <q-select v-model="formData.selectSearchable" :options="selectOptions" label="검색 가능한 선택" use-input filled dense emit-value map-options class="q-mb-sm">
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-select>

        <!-- 긴 옵션 텍스트 선택 -->
        <q-select v-model="formData.selectLongOptions" :options="longOptions" label="긴 옵션 텍스트 선택" filled dense emit-value map-options class="q-mb-sm" />

        <!-- 설명 포함 옵션 -->
        <q-select v-model="formData.selectWithCaption" :options="optionsWithCaption" label="설명 포함 옵션 선택" filled dense emit-value map-options class="q-mb-sm" />

        <!-- 커스텀 옵션 템플릿 -->
        <q-select v-model="formData.selectCustomTemplate" :options="customTemplateOptions" label="커스텀 옵션 템플릿 선택" filled dense emit-value map-options class="q-mb-sm">
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <q-icon :name="scope.opt.icon" :color="scope.opt.color" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption>{{ scope.opt.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({
  selectSingle: null,
  selectLongLabel: null,
  selectMultiple: [],
  selectChips: [],
  selectSearchable: null,
  selectLongOptions: null,
  selectWithCaption: null,
  selectCustomTemplate: null,
})

const selectOptions = [
  { label: '옵션 1', value: 'option1' },
  { label: '옵션 2', value: 'option2' },
  { label: '옵션 3', value: 'option3' },
  { label: '옵션 4', value: 'option4' },
  { label: '옵션 5', value: 'option5' },
]

const longOptions = [
  { label: '매우 긴 옵션 텍스트 1: 이 옵션은 가로로 매우 길게 확장될 수 있어서 아코디언 화살표를 가릴 수 있습니다', value: 'long1' },
  { label: '매우 긴 옵션 텍스트 2: 이것도 마찬가지로 매우 긴 텍스트입니다. 가로 확장 문제를 테스트하기 위한 샘플입니다', value: 'long2' },
  { label: '매우 긴 옵션 텍스트 3: 세 번째 긴 옵션 텍스트입니다. 아코디언 화살표가 가려지는지 확인할 수 있습니다', value: 'long3' },
]

const optionsWithCaption = [
  { label: '옵션 A', value: 'optionA', caption: '이것은 옵션 A에 대한 설명입니다' },
  { label: '옵션 B', value: 'optionB', caption: '이것은 옵션 B에 대한 설명입니다' },
  { label: '옵션 C', value: 'optionC', caption: '이것은 옵션 C에 대한 설명입니다' },
]

const customTemplateOptions = [
  { label: '프로젝트', value: 'project', icon: 'folder', color: 'primary', description: '프로젝트 관련 옵션' },
  { label: '문서', value: 'document', icon: 'description', color: 'secondary', description: '문서 관련 옵션' },
  { label: '설정', value: 'settings', icon: 'settings', color: 'accent', description: '설정 관련 옵션' },
]
</script>

<style lang="scss" scoped>
.filled-select-sample {
  width: 100%;
  overflow: hidden;
  min-width: 0;

  .form-group {
    width: 100%;
    overflow: hidden;
    min-width: 0;
  }

  :deep(.q-field) {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    min-width: 0;
  }

  :deep(.q-field__label) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: calc(100% - 40px);
  }
}
</style>

