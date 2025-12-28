<!-- ImageCard.vue
  이미지 카드 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<!--
  @tags: styles 카드, 이미지 카드
  @category: cards
  @description: Image Card 샘플 컴포넌트
-->
<template>
  <div class="image-card-sample">
    <div class="sample-header">
      <h3 class="sample-title">이미지 카드 샘플</h3>
      <p class="sample-description">이미지가 포함된 카드 예시</p>
    </div>
    <div class="sample-container">
      <div class="card-examples">
        <q-card class="image-card">
          <q-img src="https://via.placeholder.com/300x200" />
          <q-card-section>
            <div class="text-h6">이미지 카드 제목</div>
            <div class="text-subtitle2">서브 타이틀</div>
          </q-card-section>
          <q-card-section>
            이미지 카드의 설명 내용이 여기에 표시됩니다.
          </q-card-section>
        </q-card>
        <q-card class="image-card">
          <q-img src="https://via.placeholder.com/300x200" />
          <q-card-section>
            <div class="text-h6">액션 버튼 포함</div>
          </q-card-section>
          <q-card-actions>
            <q-btn flat label="액션 1" />
            <q-btn flat label="액션 2" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
// 샘플 컴포넌트 - 실제 구현은 참고용
</script>

<style lang="scss" scoped>
.image-card-sample {
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

      .image-card {
        max-width: 300px;
        background-color: var(--nexa-background);
      }
    }
  }
}
</style>

