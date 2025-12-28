<!-- ConfirmModal.vue
  확인 모달 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">확인 모달 샘플</h3>
    <p class="sample-description">확인/취소 다이얼로그 예시</p>
  </div>
  <div class="sample-container">
      <div class="modal-placeholder">
        <q-icon name="help_outline" size="64px" color="grey-5" />
        <p class="placeholder-text">모달 미리보기 영역</p>
        <p class="placeholder-note">실제 모달은 q-dialog 컴포넌트로 구현됩니다</p>
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
    .modal-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      background-color: var(--nexa-background);
      border: 1px dashed var(--nexa-border-color);
      border-radius: 4px;
      text-align: center;

      .placeholder-text {
        margin-top: 8px;
        color: var(--nexa-text-secondary);
        font-size: 0.875rem;
        font-weight: 500;
      }

      .placeholder-note {
        margin-top: 4px;
        color: var(--nexa-text-disabled);
        font-size: 0.75rem;
      }
    }
}
</style>

