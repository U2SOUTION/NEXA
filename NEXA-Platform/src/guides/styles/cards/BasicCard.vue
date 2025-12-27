<!-- BasicCard.vue
  기본 카드 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<template>
  <div class="basic-card-sample">
    <div class="sample-header">
      <h3 class="sample-title">기본 카드 샘플</h3>
      <p class="sample-description">기본 카드 레이아웃 예시</p>
    </div>
    <div class="sample-container">
      <div class="card-examples">
        <q-card class="sample-card">
          <q-card-section>
            <div class="text-h6">카드 제목</div>
            <div class="text-subtitle2">카드 부제목</div>
          </q-card-section>
          <q-card-section>
            카드 내용이 여기에 표시됩니다.
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
// 샘플 컴포넌트 - 실제 구현은 참고용
</script>

<style lang="scss" scoped>
.basic-card-sample {
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
      .sample-card {
        background-color: var(--nexa-background);
        border: 1px solid var(--nexa-border-color);
      }
    }
  }
}
</style>

