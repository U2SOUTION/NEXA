<!-- FormSample.vue
  폼 요소 샘플
  아코디언 화살표 가려짐 테스트용
  스타일별로 분리된 샘플 컴포넌트들을 통합하여 표시
-->
<template>
  <div class="form-sample">
    <!-- ============================================ -->
    <!-- 1. 입력 필드 그룹 (텍스트 입력, 선택 입력) -->
    <!-- ============================================ -->
    <!-- q-input 샘플 (outlined 스타일) -->
    <OutlinedInputSample />

    <!-- q-select 스타일별 샘플 -->
    <q-separator class="q-my-md" />
    <OutlinedSelectSample />
    <q-separator class="q-my-md" />
    <FilledSelectSample />

    <!-- 날짜/시간 선택 -->
    <q-separator class="q-my-md" />
    <DateTimeSample />

    <!-- 파일 선택 -->
    <q-separator class="q-my-md" />
    <FileSample />

    <!-- ============================================ -->
    <!-- 2. 선택 요소 그룹 (체크박스, 라디오, 토글, 슬라이더) -->
    <!-- ============================================ -->
    <q-separator class="q-my-md" />
    <SelectionComponentsSample />

    <!-- 슬라이더 -->
    <q-separator class="q-my-md" />
    <SliderSample />
  </div>
</template>

<script setup>
import OutlinedInputSample from './OutlinedInputSample.vue'
import OutlinedSelectSample from './OutlinedSelectSample.vue'
import FilledSelectSample from './FilledSelectSample.vue'
import SelectionComponentsSample from './SelectionComponentsSample.vue'
import SliderSample from './SliderSample.vue'
import DateTimeSample from './DateTimeSample.vue'
import FileSample from './FileSample.vue'
</script>

<style lang="scss" scoped>
.form-sample {
  width: 100%;
  overflow: hidden;
  min-width: 0;
  box-sizing: border-box;
}
</style>
