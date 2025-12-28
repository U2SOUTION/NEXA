<!-- ButtonGroup.vue
  버튼 그룹 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<!--
  @tags: styles 버튼, 버튼 그룹
  @category: buttons
  @description: Button Group 샘플 컴포넌트
-->
<template>
  <div class="button-group-sample">
    <div class="sample-header">
      <h3 class="sample-title">버튼 그룹 샘플</h3>
      <p class="sample-description">여러 버튼을 그룹으로 묶은 예시</p>
    </div>
    <div class="sample-container">
      <div class="button-examples">
        <div class="button-group">
          <q-btn label="저장" color="primary" />
          <q-btn label="취소" outline />
          <q-btn label="삭제" flat color="negative" />
        </div>
        <div class="button-group">
          <q-btn icon="add" label="추가" />
          <q-btn icon="edit" label="수정" />
          <q-btn icon="delete" label="삭제" />
        </div>
        <div class="button-group-vertical">
          <q-btn label="상단" />
          <q-btn label="중간" />
          <q-btn label="하단" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 샘플 컴포넌트 - 실제 구현은 참고용
</script>

<style lang="scss" scoped>
.button-group-sample {
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
    .button-examples {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .button-group {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .button-group-vertical {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-width: 200px;
      }
    }
  }
}
</style>

