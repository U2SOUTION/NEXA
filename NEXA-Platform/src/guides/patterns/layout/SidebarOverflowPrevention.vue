<!-- SidebarOverflowPrevention.vue
  사이드바 패널 오버플로우 방지 패턴
  개발 가이드용 샘플 파일
-->
<!--
  @tags: 레이아웃, 사이드바, 오버플로우, 반응형, CSS
  @category: layout
  @description: 사이드바 폭이 줄어들 때 텍스트 오버플로우를 방지하는 CSS 패턴
-->
<template>
  <div class="sidebar-overflow-sample">
    <div class="sample-header">
      <h3 class="sample-title">사이드바 오버플로우 방지 패턴</h3>
      <p class="sample-description">사이드바 폭이 줄어들 때 긴 텍스트나 요소가 우측으로 밀려나가는 문제를 방지하는 CSS 패턴입니다.</p>
    </div>

    <div class="sample-container">
      <!-- 문제 상황 설명 -->
      <div class="problem-section">
        <h4 class="section-title">❌ 문제 상황</h4>
        <div class="code-block">
          <pre><code>.info-value {
  color: var(--nexa-text-primary);
  flex: 1;
  /* min-width가 없으면 flex 아이템이 줄어들지 않음 */
  /* word-break가 없으면 긴 텍스트가 줄바꿈되지 않음 */
}</code></pre>
        </div>
        <p class="problem-note">사이드바 폭이 줄어들면 긴 컴포넌트 경로나 텍스트가 우측으로 밀려나가 아코디언 블록 전체가 잘립니다.</p>
      </div>

      <!-- 해결 방법 -->
      <div class="solution-section">
        <h4 class="section-title">✅ 해결 방법</h4>
        <div class="code-block">
          <pre><code>// 1. 패널 전체 오버플로우 방지
.dev-guide-panel {
  width: 100%;
  min-width: 0; // flex 컨테이너가 줄어들 수 있도록
  overflow: hidden; // 내용이 넘치지 않도록

  .panel-section {
    width: 100%;
    min-width: 0;
    overflow: hidden;
  }
}

// 2. 정보 값 텍스트 줄바꿈
.info-list {
  .info-item {
    display: flex;
    min-width: 0; // flex 아이템이 줄어들 수 있도록

    .info-label {
      min-width: 80px;
      flex-shrink: 0; // 레이블은 줄어들지 않도록
    }

    .info-value {
      flex: 1;
      min-width: 0; // flex 아이템이 줄어들 수 있도록
      word-break: break-word; // 단어 단위로 줄바꿈
      overflow-wrap: break-word; // 긴 단어도 줄바꿈
      hyphens: auto; // 하이픈으로 단어 분리 (선택사항)
    }
  }
}</code></pre>
        </div>
      </div>

      <!-- 핵심 포인트 -->
      <div class="key-points-section">
        <h4 class="section-title">🔑 핵심 포인트</h4>
        <ul class="points-list">
          <li><strong>min-width: 0</strong>: Flex 아이템이 기본적으로 `min-width: auto`를 가지므로, 명시적으로 `min-width: 0`을 설정해야 줄어들 수 있습니다.</li>
          <li><strong>word-break: break-word</strong>: 긴 단어나 URL, 경로 등을 강제로 줄바꿈합니다.</li>
          <li><strong>overflow-wrap: break-word</strong>: `word-break`와 함께 사용하여 더 안전하게 줄바꿈합니다.</li>
          <li><strong>overflow: hidden</strong>: 컨테이너 레벨에서 넘치는 내용을 숨깁니다.</li>
          <li><strong>flex-shrink: 0</strong>: 레이블 등 고정 크기가 필요한 요소는 줄어들지 않도록 합니다.</li>
        </ul>
      </div>

      <!-- 실제 적용 예시 -->
      <div class="example-section">
        <h4 class="section-title">📝 실제 적용 예시</h4>
        <div class="code-block">
          <pre><code>// DevGuidePanel.vue
&lt;div class="info-item"&gt;
  &lt;span class="info-label"&gt;컴포넌트:&lt;/span&gt;
  &lt;span class="info-value"&gt;{{ selectedSample.componentPath }}&lt;/span&gt;
&lt;/div&gt;

// CSS
.info-item {
  display: flex;
  min-width: 0; // 중요!

  .info-label {
    flex-shrink: 0; // 레이블 고정
    min-width: 80px;
  }

  .info-value {
    flex: 1;
    min-width: 0; // 중요!
    word-break: break-word;
    overflow-wrap: break-word;
  }
}</code></pre>
        </div>
      </div>

      <!-- 주의사항 -->
      <div class="warning-section">
        <h4 class="section-title">⚠️ 주의사항</h4>
        <ul class="points-list">
          <li>복잡한 중첩 구조에서는 모든 레벨에 `min-width: 0`을 적용해야 할 수 있습니다.</li>
          <li>`word-break: break-all`은 단어 중간에서도 줄바꿈하므로 가독성이 떨어질 수 있습니다. `break-word`를 권장합니다.</li>
          <li>테이블이나 그리드 레이아웃에서는 `min-width: 0` 대신 `min-width: min-content`를 고려해볼 수 있습니다.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
// 샘플 컴포넌트 - 실제 구현은 참고용
</script>

<style lang="scss" scoped>
.sidebar-overflow-sample {
  padding: 16px;
  background-color: var(--nexa-surface);
  border-radius: 8px;

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

    .problem-note {
      color: var(--nexa-warning);
      font-size: 0.875rem;
      padding: 8px;
      background-color: rgba(237, 178, 15, 0.1);
      border-left: 3px solid var(--nexa-warning);
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .points-list {
      color: var(--nexa-text-primary);
      font-size: 0.875rem;
      line-height: 1.8;
      padding-left: 20px;
      margin-bottom: 16px;

      li {
        margin-bottom: 8px;

        strong {
          color: var(--nexa-primary);
          font-weight: 600;
        }
      }
    }
  }
}
</style>
