<!-- ComponentNaming.vue
  컴포넌트 네이밍 컨벤션 샘플
  개발 가이드용 샘플 파일
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">컴포넌트 네이밍 컨벤션</h3>
    <p class="sample-description">Vue 컴포넌트 파일명 및 클래스 네이밍 규칙</p>
  </div>
  <div class="sample-container">
      <div class="rules-list">
        <div class="rule-item">
          <q-icon name="check_circle" class="rule-icon" />
          <div class="rule-content">
            <div class="rule-title">파일명: PascalCase</div>
            <div class="rule-example">예: MyComponent.vue, UserProfile.vue</div>
          </div>
        </div>
        <div class="rule-item">
          <q-icon name="check_circle" class="rule-icon" />
          <div class="rule-content">
            <div class="rule-title">컴포넌트명: PascalCase</div>
            <div class="rule-example">예: MyComponent, UserProfile</div>
          </div>
        </div>
        <div class="rule-item">
          <q-icon name="check_circle" class="rule-icon" />
          <div class="rule-content">
            <div class="rule-title">Props: camelCase</div>
            <div class="rule-example">예: userName, isActive, itemList</div>
          </div>
        </div>
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
    .rules-list {
      .rule-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 16px;
        padding: 12px;
        background-color: var(--nexa-background);
        border-radius: 4px;

        .rule-icon {
          color: var(--nexa-success);
          margin-right: 12px;
          margin-top: 2px;
        }

        .rule-content {
          flex: 1;

          .rule-title {
            color: var(--nexa-text-primary);
            font-weight: 600;
            margin-bottom: 4px;
          }

          .rule-example {
            color: var(--nexa-text-secondary);
            font-size: 0.875rem;
            font-family: 'Courier New', monospace;
          }
        }
      }
    }
}
</style>

