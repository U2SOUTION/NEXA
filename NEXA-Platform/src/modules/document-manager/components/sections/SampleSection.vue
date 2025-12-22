<!-- SampleSection.vue
  샘플 기능 섹션
  아코디언 화살표 및 타이틀 테스트용
  각 샘플은 samples/ 폴더의 별도 컴포넌트로 분리됨
-->
<template>
  <div class="sample-section">
    <div class="sample-content q-pa-md">
      <div class="text-h6 q-mb-md">샘플 기능</div>
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

<style lang="scss">
// 부모 컨테이너 폭 제약 (구체적인 선택자로 제한)
.section-content:has(.sample-section),
.q-expansion-item__content:has(.sample-section) {
  width: 100% !important;
  min-width: 0 !important;
  overflow-x: visible !important; // 잘림 방지
  box-sizing: border-box !important; // 패딩 포함하여 계산
}
</style>
