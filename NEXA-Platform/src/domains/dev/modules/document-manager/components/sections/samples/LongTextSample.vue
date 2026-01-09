<!-- LongTextSample.vue
  긴 텍스트 샘플
  아코디언 화살표 가려짐 테스트용
-->
<template>
  <div class="long-text-sample">
    <!-- 기본 텍스트 샘플 -->
    <div class="text-body2">
      <div v-for="n in basicTextSampleCount" :key="n" class="q-mb-sm long-text-item">
        <span class="long-text-content">• 샘플 항목 {{ n }}: 아코디언 화살표가 가려지는지 테스트하기 위한 매우 긴 텍스트 내용입니다. 이 텍스트는 가로로 길게 확장되어도 화살표를 밀어내지 않아야 합니다.</span>
      </div>
    </div>

    <q-separator class="q-my-md" />

    <!-- 추가 긴 텍스트 샘플 -->
    <div class="text-body2 text-grey-7">
      <div v-for="(text, index) in longTextSamples" :key="index" class="q-mb-sm long-text-item">
        <span class="long-text-content">{{ text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
// ============================================
// 샘플 데이터 설정
// ============================================
// 새로운 샘플을 추가하려면 아래 배열에 항목을 추가하세요

// 긴 텍스트 샘플 데이터
const longTextSamples = [
  '추가 테스트 항목: 이것은 매우 긴 텍스트입니다. 아코디언 화살표가 가려지는지 테스트하기 위한 긴 내용입니다. 가로로 길게 확장되어 화살표 영역을 침범할 수 있습니다.',
  '또 다른 긴 텍스트: 화살표와 타이틀 표시 문제를 정확히 테스트하기 위해 의도적으로 매우 긴 텍스트를 작성했습니다. 이 텍스트가 화살표를 가리는지 확인할 수 있습니다.',
  // 새로운 샘플을 추가하려면 여기에 항목을 추가하세요
  // 예: '새로운 테스트 항목: ...',
]

// 기본 텍스트 샘플 개수
const basicTextSampleCount = 3
</script>

<style lang="scss" scoped>
.long-text-sample {
  width: 100%;
  overflow: hidden;
  min-width: 0;

  // 긴 텍스트 항목: table-layout을 사용한 ellipsis 처리
  .long-text-item {
    display: table;
    table-layout: fixed;
    width: 100%;

    .long-text-content {
      display: table-cell;
      overflow: hidden;
      // 방식 1: ellipsis (말줄임표 ... 표시, 사용자에게 잘림을 명확히 알림)
      text-overflow: ellipsis;
      // 방식 2: clip (말줄임표 없이 잘림, 공간 절약)
      // text-overflow: clip;
      white-space: nowrap;
    }
  }
}
</style>
