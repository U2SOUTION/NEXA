<!-- SampleSection.vue
  샘플 기능 섹션
  아코디언 화살표 및 타이틀 테스트용
  각 샘플은 samples/ 폴더의 별도 컴포넌트로 분리됨
-->
<template>
  <div class="sample-section">
    <div class="sample-content q-pa-md">
      <div class="text-h6 q-mb-md">샘플 아코디언 화살표 가려짐 테스트</div>
      <div class="text-body2 text-grey-7 q-mb-sm">이 섹션은 아코디언 화살표와 타이틀 표시 문제를 테스트하기 위한 샘플입니다. 가로로 긴 텍스트가 화살표를 가리는지 확인할 수 있습니다.</div>

      <q-separator class="q-my-md" />

      <!-- 긴 텍스트 샘플 -->
      <LongTextSample />

      <q-separator class="q-my-md" />

      <!-- 표 테스트 -->
      <div class="text-body2 q-mb-md">
        <TableSample />
      </div>

      <q-separator class="q-my-md" />

      <!-- 막대 그래프 테스트 (임시 주석 처리) -->
      <!-- <div class="text-body2 q-mb-md">
        <ChartSample />
      </div>

      <q-separator class="q-my-md" /> -->

      <!-- 폼 요소 테스트 -->
      <div class="text-body2 q-mb-md">
        <FormSample />
      </div>
    </div>
  </div>
</template>

<script setup>
// 샘플 컴포넌트 import
import LongTextSample from './samples/LongTextSample.vue'
import TableSample from './samples/TableSample.vue'
// import ChartSample from './samples/ChartSample.vue' // 임시 주석 처리
import FormSample from './samples/FormSample.vue'
</script>

<style lang="scss" scoped>
.sample-section {
  width: 100%;
  overflow: hidden;
  min-width: 0;
}
</style>
