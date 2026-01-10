<!--
  @tags: q-chip, 큐칩, chip
  @category: styles
  @description: Quasar q-chip의 prop(dense, size)이 인라인 스타일을 생성하여 CSS 클래스 스타일이 오버라이드되지 않는 문제 해결
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">q-chip 스타일 오버라이드 문제 해결</h3>
    <p class="sample-description">Quasar q-chip의 prop이 인라인 스타일을 생성하여 CSS 클래스 스타일이 적용되지 않는 문제와 해결 방법입니다.</p>
  </div>

  <div class="sample-container">
    <!-- 문제 상황 -->
    <div class="problem-section">
      <h4 class="section-title">❌ 문제</h4>
      <div class="code-block">
        <pre><code>&lt;q-chip dense size="sm" class="custom-chip"&gt;
  태그
&lt;/q-chip&gt;

&lt;style lang="scss" scoped&gt;
.custom-chip {
  padding: 2px 4px !important;
  font-size: 0.575rem !important;
}
&lt;/style&gt;</code></pre>
      </div>
      <p class="problem-note"><code>dense</code>와 <code>size="sm"</code> prop이 인라인 스타일을 생성하여 CSS 클래스가 적용되지 않습니다.</p>
    </div>

    <!-- 해결 방법 -->
    <div class="solution-section">
      <h4 class="section-title">✅ 해결</h4>
      <div class="code-block">
        <pre><code>&lt;q-chip class="custom-chip"&gt;
  태그
&lt;/q-chip&gt;

&lt;style lang="scss" scoped&gt;
.custom-chip {
  padding: 2px 4px !important;
  font-size: 0.575rem !important;
  color: var(--nexa-text-secondary);
}
&lt;/style&gt;</code></pre>
      </div>
      <p class="solution-note">prop을 제거하고 CSS 클래스로만 스타일을 제어합니다.</p>
    </div>

    <!-- 핵심 포인트 -->
    <div class="key-points-section">
      <h4 class="section-title">🔑 핵심</h4>
      <ul class="points-list">
        <li>인라인 스타일은 CSS 클래스보다 우선순위가 높습니다.</li>
        <li><code>!important</code>를 사용해도 인라인 스타일이 있으면 오버라이드되지 않습니다.</li>
        <li><code>dense</code>와 <code>size</code> prop은 내부적으로 인라인 스타일을 생성합니다.</li>
        <li>prop을 제거하고 CSS 클래스로만 제어하면 정상적으로 적용됩니다.</li>
      </ul>
    </div>

    <!-- 실제 적용 예시 -->
    <div class="example-section">
      <h4 class="section-title">📝 실제 예시</h4>
      <div class="code-block">
        <pre><code>&lt;template&gt;
  &lt;div class="sample-card-tags"&gt;
    &lt;q-chip
      v-for="tag in sample.tags.slice(0, 3)"
      :key="tag"
      class="sample-card-tag"
    &gt;
      &lbrace;&lbrace; tag &rbrace;&rbrace;
    &lt;/q-chip&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;style lang="scss" scoped&gt;
.sample-card-tag {
  padding: 2px 4px !important;
  font-size: 0.575rem !important;
  color: var(--nexa-text-secondary);
}
&lt;/style&gt;</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
// 샘플 컴포넌트 - 실제 구현은 참고용
</script>

<style lang="scss" scoped>
.sample-header {
  margin-bottom: 24px;

  .sample-title {
    color: var(--nexa-text-primary);
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .sample-description {
    color: var(--nexa-text-secondary);
    font-size: 0.875rem;
    line-height: 1.5;
  }
}

.sample-container {
  .section-title {
    color: var(--nexa-text-primary);
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 12px;
    margin-top: 24px;

    &:first-child {
      margin-top: 0;
    }
  }

  .code-block {
    background-color: var(--nexa-background);
    border: 1px solid var(--nexa-border-color);
    border-radius: 4px;
    padding: 12px;
    margin-bottom: 16px;
    overflow-x: auto;

    pre {
      margin: 0;
      color: var(--nexa-text-primary);
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
      line-height: 1.5;

      code {
        color: var(--nexa-text-primary);
      }
    }
  }

  .problem-note,
  .solution-note {
    color: var(--nexa-text-secondary);
    font-size: 0.875rem;
    padding: 8px;
    background-color: var(--nexa-surface);
    border-left: 3px solid var(--nexa-border-color);
    border-radius: 4px;
    margin-bottom: 16px;
    line-height: 1.6;

    code {
      background-color: var(--nexa-background);
      padding: 2px 4px;
      border-radius: 2px;
      font-family: 'Courier New', monospace;
      font-size: 0.8125rem;
    }
  }

  .problem-note {
    border-left-color: var(--nexa-warning);
    background-color: rgba(237, 178, 15, 0.1);
  }

  .solution-note {
    border-left-color: var(--nexa-primary);
    background-color: rgba(0, 255, 94, 0.1);
  }

  .points-list {
    color: var(--nexa-text-primary);
    font-size: 0.875rem;
    line-height: 1.8;
    padding-left: 20px;
    margin-bottom: 16px;

    li {
      margin-bottom: 8px;
    }
  }
}
</style>
