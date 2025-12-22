<!-- TableSample.vue
  표 샘플
  아코디언 화살표 가려짐 테스트용
-->
<template>
  <div class="table-sample">
    <div class="text-subtitle2 q-mb-sm">표 테스트 (가로 확장 방지)</div>
    <table class="sample-table">
      <thead>
        <tr>
          <th>번호</th>
          <th>이름</th>
          <th>설명</th>
          <th>매우 긴 컬럼 헤더: 이 컬럼은 가로로 매우 길게 확장될 수 있습니다</th>
          <th>상태</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="n in 5" :key="n">
          <td>{{ n }}</td>
          <td>항목 {{ n }}</td>
          <td>이것은 매우 긴 설명 텍스트입니다. 가로로 확장되어도 화살표를 밀어내지 않아야 합니다.</td>
          <td>매우 긴 데이터: 이것은 가로로 매우 길게 확장될 수 있는 긴 텍스트 데이터입니다. 이 데이터가 화살표를 가리는지 테스트합니다.</td>
          <td>활성</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
// 표 샘플은 현재 정적 데이터 사용
// 나중에 동적 컬럼 지원 시 데이터 구조화 예정
</script>

<style lang="scss" scoped>
.table-sample {
  width: 100%;
  overflow: hidden;
  min-width: 0;

  // 표 테스트 스타일
  .sample-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed; // 표 폭 고정
    font-size: 0.875rem;

    th,
    td {
      padding: 8px;
      border: 1px solid var(--nexa-table-cell-border);
      text-align: left;
      overflow: hidden;
      // 방식 1: ellipsis (말줄임표 ... 표시, 사용자에게 잘림을 명확히 알림)
      text-overflow: ellipsis;
      // 방식 2: clip (말줄임표 없이 잘림, 공간 절약)
      // text-overflow: clip;
      white-space: nowrap;
    }

    // 컬럼별 폭 조정: map과 루프로 간소화
    $column-widths: (
      1: 8%,
      // 번호: 최소 폭
      2: 12%,
      // 이름: 작은 폭
      3: 25%,
      // 설명: 중간 폭
      4: 45%,
      // 매우 긴 컬럼: 큰 폭 (잘리는 텍스트 최소화)
      5: 10%, // 상태: 작은 폭
    );

    @each $index, $width in $column-widths {
      th:nth-child(#{$index}),
      td:nth-child(#{$index}) {
        width: $width;
      }
    }

    th {
      background-color: var(--nexa-table-header-bg);
      color: var(--nexa-table-header-text);
      font-weight: 600;
    }

    tbody tr {
      background-color: var(--nexa-table-bg);

      &:nth-child(even) {
        background-color: var(--nexa-table-row-striped-bg);
      }

      &:hover {
        background-color: var(--nexa-table-row-hover-bg);
      }
    }
  }
}
</style>
