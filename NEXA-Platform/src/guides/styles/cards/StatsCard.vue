<!-- StatsCard.vue
  통계 카드 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<!--
  @tags: styles 카드, 통계 카드
  @category: cards
  @description: Stats Card 샘플 컴포넌트
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">통계 카드 샘플</h3>
    <p class="sample-description">통계 정보를 표시하는 카드 예시</p>
  </div>
  <div class="sample-container">
    <div class="card-examples">
      <q-card class="stats-card">
        <q-card-section>
          <div class="stats-header">
            <q-icon name="people" size="32px" />
            <div class="stats-value">1,234</div>
          </div>
          <div class="stats-label">총 사용자</div>
        </q-card-section>
      </q-card>
      <q-card class="stats-card">
        <q-card-section>
          <div class="stats-header">
            <q-icon name="trending_up" size="32px" />
            <div class="stats-value">+12.5%</div>
          </div>
          <div class="stats-label">증가율</div>
        </q-card-section>
      </q-card>
      <q-card class="stats-card">
        <q-card-section>
          <div class="stats-header">
            <q-icon name="check_circle" size="32px" />
            <div class="stats-value">98%</div>
          </div>
          <div class="stats-label">완료율</div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
// 샘플 컴포넌트 - 실제 구현은 참고용
</script>

<style lang="scss" scoped>
.sample-header {
  margin-bottom: 16px;

  .sample-title {
    color: var(--nexa-text-primary);
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .sample-description {
    color: var(--nexa-text-secondary);
    font-size: 0.875rem;
  }
}

.sample-container {
  .card-examples {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;

    .stats-card {
      min-width: 200px;
      background-color: var(--nexa-background);

      .stats-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .stats-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--nexa-text-primary);
        }
      }

      .stats-label {
        color: var(--nexa-text-secondary);
        font-size: 0.875rem;
      }
    }
  }
}
</style>
