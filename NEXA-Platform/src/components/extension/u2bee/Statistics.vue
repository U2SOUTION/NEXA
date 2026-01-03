<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="u2bee-statistics">
    <div class="stats-header q-mb-md">
      <div class="text-h6">통계</div>
      <div class="text-body2 text-grey-7">콘텐츠 및 평가 통계를 확인합니다</div>
    </div>

    <!-- 전체 통계 (목업) -->
    <div class="row q-gutter-md q-mb-md">
      <q-card class="col-12 col-sm-6 col-md-3">
        <q-card-section>
          <div class="text-body2 text-grey-7">전체 콘텐츠</div>
          <div class="text-h4">{{ mockStats.totalContents }}</div>
        </q-card-section>
      </q-card>

      <q-card class="col-12 col-sm-6 col-md-3">
        <q-card-section>
          <div class="text-body2 text-grey-7">좋아요</div>
          <div class="text-h4 text-positive">{{ mockStats.totalLikes }}</div>
        </q-card-section>
      </q-card>

      <q-card class="col-12 col-sm-6 col-md-3">
        <q-card-section>
          <div class="text-body2 text-grey-7">싫어요</div>
          <div class="text-h4 text-negative">{{ mockStats.totalDislikes }}</div>
        </q-card-section>
      </q-card>

      <q-card class="col-12 col-sm-6 col-md-3">
        <q-card-section>
          <div class="text-body2 text-grey-7">플레이박스</div>
          <div class="text-h4">{{ mockStats.totalPlayboxes }}</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 플랫폼별 통계 (목업) -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">플랫폼별 통계</div>
        <q-list bordered separator>
          <q-item v-for="platform in mockPlatformStats" :key="platform.name">
            <q-item-section>
              <q-item-label>{{ platform.name }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ platform.count }}개</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- 카테고리별 통계 (목업) -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">카테고리별 통계</div>
        <q-list bordered separator>
          <q-item v-for="category in mockCategoryStats" :key="category.name">
            <q-item-section>
              <q-item-label>{{ category.name }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ category.count }}개</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 목업 데이터
const mockStats = ref({
  totalContents: 150,
  totalLikes: 120,
  totalDislikes: 30,
  totalPlayboxes: 5,
})

const mockPlatformStats = ref([
  { name: 'YouTube', count: 100 },
  { name: 'TikTok', count: 30 },
  { name: 'Instagram', count: 20 },
])

const mockCategoryStats = ref([
  { name: '교육', count: 50 },
  { name: '엔터테인먼트', count: 40 },
  { name: '음악', count: 30 },
  { name: '기술', count: 30 },
])
</script>

<style lang="scss" scoped>
.u2bee-statistics {
  padding: 16px;

  .stats-header {
    margin-bottom: 16px;
  }
}
</style>
