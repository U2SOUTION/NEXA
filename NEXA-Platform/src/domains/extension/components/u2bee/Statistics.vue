<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- Breadcrumb 및 액션 버튼 -->
  <div class="breadcrumb-section">
    <div class="breadcrumb">
      <span class="breadcrumb-item">:: U2BEE</span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item active">통계</span>
    </div>
    <div class="action-buttons">
      <q-btn flat dense label="새로고침" size="sm" />
      <q-btn flat dense label="내보내기" size="sm" />
    </div>
  </div>

  <!-- 전체 통계 -->
  <div class="stats-section">
    <div class="row q-gutter-sm">
      <div class="col stat-card">
        <div class="stat-label">전체 콘텐츠</div>
        <div class="stat-value">{{ mockStats.totalContents }}</div>
      </div>
      <div class="col stat-card">
        <div class="stat-label">좋아요</div>
        <div class="stat-value stat-positive">{{ mockStats.totalLikes }}</div>
      </div>
      <div class="col stat-card">
        <div class="stat-label">싫어요</div>
        <div class="stat-value stat-negative">{{ mockStats.totalDislikes }}</div>
      </div>
      <div class="col stat-card">
        <div class="stat-label">플레이박스</div>
        <div class="stat-value">{{ mockStats.totalPlayboxes }}</div>
      </div>
    </div>
  </div>

  <!-- 플랫폼별 통계 -->
  <div class="list-section">
    <div class="section-label">플랫폼별 통계</div>
    <q-list>
      <q-item v-for="platform in mockPlatformStats" :key="platform.name" class="stat-item">
        <q-item-section>
          <q-item-label class="stat-item-label">{{ platform.name }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-item-label class="stat-item-value">{{ platform.count }}개</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>

  <!-- 카테고리별 통계 -->
  <div class="list-section">
    <div class="section-label">카테고리별 통계</div>
    <q-list>
      <q-item v-for="category in mockCategoryStats" :key="category.name" class="stat-item">
        <q-item-section>
          <q-item-label class="stat-item-label">{{ category.name }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-item-label class="stat-item-value">{{ category.count }}개</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
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
.breadcrumb-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.breadcrumb-item {
  color: var(--nexa-text-secondary);

  &.active {
    color: var(--nexa-text-primary);
    font-weight: 600;
  }
}

.breadcrumb-separator {
  color: var(--nexa-text-disabled);
}

.action-buttons {
  color: var(--nexa-text-secondary);
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.stats-section {
  margin-bottom: 5px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--nexa-border-color); // 임시 확인용
}

.stat-card {
  padding: 12px;
  background: transparent;
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--nexa-text-secondary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--nexa-text-primary);
}

.stat-positive {
  color: var(--nexa-success);
}

.stat-negative {
  color: var(--nexa-error);
}

.list-section {
  margin-bottom: 5px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--nexa-border-color); // 임시 확인용

  &:last-child {
    margin-bottom: 0;
  }
}

.section-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--nexa-text-primary);
  padding: 12px 0 8px 0;
  border-bottom: 1px solid var(--nexa-border-color);
  margin-bottom: 8px;
}

.stat-item {
  padding: 8px 0;
}

.stat-item-label {
  font-size: 14px;
  color: var(--nexa-text-primary);
}

.stat-item-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--nexa-text-primary);
}
</style>
