<!-- ActionCard.vue
  액션 카드 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<!--
  @tags: styles 카드, 액션 카드
  @category: cards
  @description: Action Card 샘플 컴포넌트
-->
<template>
  <div class="action-card-sample">
    <div class="sample-header">
      <h3 class="sample-title">액션 카드 샘플</h3>
      <p class="sample-description">클릭 가능한 액션 카드 예시</p>
    </div>
    <div class="sample-container">
      <div class="card-examples">
        <q-card class="action-card" @click="handleCardClick">
          <q-card-section>
            <div class="text-h6">클릭 가능한 카드</div>
            <div class="text-subtitle2">카드를 클릭하면 액션이 실행됩니다</div>
          </q-card-section>
        </q-card>
        <q-card class="action-card" @click="handleCardClick">
          <q-card-section>
            <q-icon name="add" size="48px" />
            <div class="text-h6">아이콘 액션 카드</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
function handleCardClick() {
  console.log('카드 클릭됨')
}
</script>

<style lang="scss" scoped>
.action-card-sample {
  padding: 16px;
  background-color: var(--nexa-surface);
  border-radius: 8px;

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

      .action-card {
        min-width: 200px;
        cursor: pointer;
        background-color: var(--nexa-background);
        transition: all 0.2s;

        &:hover {
          background-color: var(--nexa-surface-hover);
          transform: translateY(-2px);
        }
      }
    }
  }
}
</style>

