<!--
  @tags: 레이아웃, 사이드바, 오버플로우, 반응형, CSS, 사이드바 밀어내지 않기, 동정 데이터 오버플로우
  @category: layout
  @description: 사이드바 폭이 줄어들 때 텍스트 오버플로우를 방지하는 CSS 패턴
-->
<template>
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
}

// 3. 한 줄 레이아웃에서 태그 오버플로우 방지 (핵심!)
// ⚠️ 핵심은 단 2줄만 필요!
.sample-info {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
  overflow: hidden; // ⚠️ 핵심 1: 넘치는 내용을 가림
  width: 0; // ⚠️ 핵심 2: flex 아이템이 부모 크기를 초과하지 않도록

  // 나머지는 선택사항 (기본 스타일만 유지)
  .sample-name {
    font-size: 0.9rem;
    white-space: nowrap;
  }

  .sample-category {
    font-size: 0.75rem;
    color: var(--nexa-text-secondary);
    white-space: nowrap;
  }

  .sample-tags {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
  }
}</code></pre>
      </div>
    </div>

    <!-- 핵심 포인트 -->
    <div class="key-points-section">
      <h4 class="section-title">🔑 핵심 포인트</h4>
      <div class="problem-note" style="background-color: rgba(76, 175, 80, 0.1); border-left-color: var(--nexa-success);">
        <p><strong>⚠️ 핵심 해결책은 단 2줄만 필요합니다:</strong></p>
        <ul style="margin-top: 8px; padding-left: 20px;">
          <li><code>overflow: hidden</code> - 넘치는 내용을 가립니다</li>
          <li><code>width: 0</code> - flex 아이템이 부모 크기를 초과하지 않도록 합니다</li>
        </ul>
        <p style="margin-top: 12px;">나머지 스타일(`flex-shrink`, `text-overflow`, `max-width` 등)은 선택사항이며, 실제로는 필요하지 않았습니다.</p>
      </div>
      <ul class="points-list">
        <li><strong>width: 0</strong>: ⚠️ <strong>가장 중요!</strong> `flex: 1`을 가진 아이템이 여러 개일 때, `min-width: 0`만으로는 부족할 수 있습니다. `width: 0`을 명시하면 flex 아이템이 부모 크기를 초과하지 않고 제대로 줄어듭니다.</li>
        <li><strong>overflow: hidden</strong>: 컨테이너 레벨에서 넘치는 내용을 숨깁니다. `width: 0`과 함께 사용하면 완벽하게 작동합니다.</li>
        <li><strong>min-width: 0</strong>: Flex 아이템이 기본적으로 `min-width: auto`를 가지므로, 명시적으로 `min-width: 0`을 설정해야 줄어들 수 있습니다. (기본 설정)</li>
        <li><strong>word-break: break-word</strong>: 여러 줄 텍스트가 필요한 경우에만 사용합니다. 한 줄 레이아웃에서는 불필요합니다.</li>
      </ul>
    </div>

    <!-- 실제 적용 예시 -->
    <div class="example-section">
      <h4 class="section-title">📝 실제 적용 예시</h4>
      
      <!-- 예시 1: 텍스트 줄바꿈 -->
      <div class="example-subsection">
        <h5 class="subsection-title">예시 1: 텍스트 줄바꿈 (여러 줄 허용)</h5>
        <div class="code-block">
          <pre><code>// DevGuidePanel.vue
&lt;div class="info-item"&gt;
  &lt;span class="info-label"&gt;컴포넌트:&lt;/span&gt;
  &lt;span class="info-value"&gt;{{ '{' + '{' }} selectedSample.componentPath {{ '}' + '}' }}&lt;/span&gt;
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

      <!-- 예시 2: 한 줄 레이아웃 (태그 포함) -->
      <div class="example-subsection">
        <h5 class="subsection-title">예시 2: 한 줄 레이아웃 (태그 오버플로우 방지) - ⚠️ 핵심!</h5>
        <div class="code-block">
          <pre><code>// DevGuideList.vue - 최근 탭의 샘플 아이템
&lt;div class="sample-item-content"&gt;
  &lt;div class="sample-icon"&gt;...&lt;/div&gt;
  &lt;div class="sample-info"&gt;
    &lt;div class="sample-name"&gt;{{ '{' + '{' }} sample.name {{ '}' + '}' }}&lt;/div&gt;
    &lt;div class="sample-category"&gt;{{ '{' + '{' }} sample.category {{ '}' + '}' }}&lt;/div&gt;
    &lt;div class="sample-tags"&gt;
      &lt;q-chip v-for="tag in sample.tags" :key="tag"&gt;{{ '{' + '{' }} tag {{ '}' + '}' }}&lt;/q-chip&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;

// CSS - ⚠️ 핵심은 단 2줄만!
.sample-info {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
  overflow: hidden; // ⚠️ 핵심 1: 넘치는 내용을 가림
  width: 0; // ⚠️ 핵심 2: flex 아이템이 부모 크기를 초과하지 않도록

  // 나머지는 기본 스타일만 (선택사항)
  .sample-name {
    font-size: 0.9rem;
    white-space: nowrap;
  }

  .sample-category {
    font-size: 0.75rem;
    color: var(--nexa-text-secondary);
    white-space: nowrap;
  }

  .sample-tags {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
  }
}</code></pre>
        </div>
        <p class="problem-note" style="background-color: rgba(76, 175, 80, 0.1); border-left-color: var(--nexa-success); margin-top: 8px;">
          <strong>✅ 실제 적용 결과:</strong> `overflow: hidden`과 `width: 0` 두 줄만으로 문제가 완벽하게 해결되었습니다. 
          나머지 스타일(`flex-shrink`, `text-overflow`, `max-width` 등)은 모두 주석 처리했지만 정상 작동합니다.
        </p>
      </div>
    </div>

    <!-- 주의사항 -->
    <div class="warning-section">
      <h4 class="section-title">⚠️ 주의사항</h4>
      <ul class="points-list">
        <li>복잡한 중첩 구조에서는 모든 레벨에 `min-width: 0`을 적용해야 할 수 있습니다.</li>
        <li><strong>한 줄 레이아웃에서 태그가 부모를 밀어내는 경우</strong>: `min-width: 0`만으로는 부족할 수 있습니다. `width: 0`을 추가하면 flex 아이템이 부모 크기를 초과하지 않습니다.</li>
        <li>`word-break: break-all`은 단어 중간에서도 줄바꿈하므로 가독성이 떨어질 수 있습니다. `break-word`를 권장합니다.</li>
        <li>테이블이나 그리드 레이아웃에서는 `min-width: 0` 대신 `min-width: min-content`를 고려해볼 수 있습니다.</li>
      </ul>
    </div>

    <!-- 왜 이번에 시간이 걸렸는지 -->
    <div class="lesson-learned-section">
      <h4 class="section-title">💡 교훈: 왜 이번에 시간이 걸렸는가?</h4>
      <div class="problem-note" style="background-color: rgba(237, 178, 15, 0.1); border-left-color: var(--nexa-warning);">
        <p><strong>문제 상황:</strong></p>
        <ul style="margin-top: 8px; padding-left: 20px;">
          <li>기존 샘플에는 `min-width: 0`과 `overflow: hidden`만 있었음</li>
          <li>하지만 한 줄 레이아웃에서 태그가 여러 개일 때 여전히 부모를 밀어냄</li>
          <li>아코디언 화살표와 탭 메뉴까지 밀려나가는 문제 발생</li>
        </ul>
        <p style="margin-top: 12px;"><strong>해결 과정:</strong></p>
        <ul style="margin-top: 8px; padding-left: 20px;">
          <li>처음에는 `flex-shrink`, `max-width` 등으로 시도했지만 실패</li>
          <li>여러 번 시도 후 `width: 0`을 추가하니 해결됨</li>
          <li>Flexbox의 기본 동작: `flex: 1`을 가진 아이템이 여러 개일 때, `min-width: 0`만으로는 부족</li>
          <li>`width: 0`을 명시하면 flex 아이템이 부모 크기를 초과하지 않고 제대로 줄어듦</li>
        </ul>
        <p style="margin-top: 12px;"><strong>핵심 교훈:</strong></p>
        <ul style="margin-top: 8px; padding-left: 20px;">
          <li><strong>해결책은 단 2줄만 필요:</strong> <code>overflow: hidden</code>과 <code>width: 0</code></li>
          <li><code>min-width: 0</code>만으로는 부족한 경우가 있음</li>
          <li>한 줄 레이아웃에서 여러 flex 아이템이 있을 때는 <code>width: 0</code>이 필수</li>
          <li>나머지 스타일(<code>flex-shrink</code>, <code>text-overflow</code>, <code>max-width</code> 등)은 선택사항</li>
          <li>특히 태그나 칩 같은 동적 요소가 포함된 경우 더욱 중요</li>
        </ul>
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

  .example-subsection {
    margin-bottom: 24px;

    .subsection-title {
      color: var(--nexa-text-primary);
      font-size: 0.9375rem;
      font-weight: 600;
      margin-bottom: 8px;
      margin-top: 16px;
    }
  }

  .lesson-learned-section {
    margin-top: 32px;
  }
}
</style>
