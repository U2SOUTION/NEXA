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
  <div class="sample-header">
    <h3 class="sample-title">이미지 카드 샘플</h3>
    <p class="sample-description">이미지가 포함된 카드 예시</p>
  </div>
  <div class="sample-container">
    <div class="card-examples">
      <q-card class="image-card">
        <q-img :src="placeholderImage" />
        <q-card-section>
          <div class="text-h6">이미지 카드 제목</div>
          <div class="text-subtitle2">서브 타이틀</div>
        </q-card-section>
        <q-card-section> 이미지 카드의 설명 내용이 여기에 표시됩니다. </q-card-section>
      </q-card>
      <q-card class="image-card">
        <q-img :src="placeholderImage" />
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
</template>

<script setup>
// 샘플 컴포넌트 - 실제 구현은 참고용

// 로컬 placeholder 이미지 (SVG data URI)
// 외부 이미지 의존성 제거를 위해 사용
// 배경 없음, "IMAGE" 텍스트, X 선, 사각 박스, 크기 정보 포함
const placeholderImage =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iMCIgeTE9IjAiIHgyPSIzMDAiIHkyPSIyMDAiIHN0cm9rZT0iIzk5OSIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjMwMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMjAwIiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNDUlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0iIzk5OSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4cHgiIGZvbnQtd2VpZ2h0PSJib2xkIj5JTUFHRTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjU4JSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4Ij4zMDB4MjAwPC90ZXh0Pjwvc3ZnPg=='
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

    .image-card {
      max-width: 300px;
      background-color: var(--nexa-background);
    }
  }
}
</style>
