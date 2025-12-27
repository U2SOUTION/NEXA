<!-- DevGuideStatistics.vue
  개발 가이드 통계 패널
  통계 분석 기능 제공
-->
<template>
  <div class="dev-guide-statistics">
    <div class="statistics-actions q-pa-md">
      <q-btn outlined dense icon="analytics" label="전체 통계 분석" class="statistics-action-btn q-mb-sm" @click="handleStatisticsAction('full-analysis')" />
      <q-btn outlined dense icon="trending_up" label="인기 샘플" class="statistics-action-btn q-mb-sm" @click="handleStatisticsAction('popular')" />
      <q-btn outlined dense icon="delete_outline" label="미사용 샘플" class="statistics-action-btn q-mb-sm" @click="handleStatisticsAction('unused')" />
      <q-btn outlined dense icon="category" label="카테고리별 통계" class="statistics-action-btn q-mb-sm" @click="handleStatisticsAction('by-category')" />
      <q-btn outlined dense icon="schedule" label="사용 빈도 통계" class="statistics-action-btn" @click="handleStatisticsAction('by-usage')" />
    </div>
  </div>
</template>

<script setup>
// 통계 액션 핸들러
function handleStatisticsAction(actionType) {
  // TODO: 통계 분석 로직 구현
  console.log('[DevGuideStatistics] 통계 액션:', actionType)
}
</script>

<style lang="scss" scoped>
.dev-guide-statistics {
  .statistics-actions {
    .statistics-action-btn {
      width: 100%;
    }
  }
}
</style>

