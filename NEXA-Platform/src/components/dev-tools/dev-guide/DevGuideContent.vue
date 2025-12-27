<!-- DevGuideContent.vue
  개발 가이드 메인 컨텐츠 컴포넌트
  샘플 라이브러리 및 상세 뷰 관리
-->
<template>
  <div class="dev-guide-content">
    <!-- 샘플이 선택되지 않았을 때: 샘플 라이브러리 -->
    <div v-if="!selectedSample" class="sample-library-view">
      <div class="library-header">
        <h2 class="library-title">개발 가이드 샘플 라이브러리</h2>
        <p class="library-description">NEXA 시스템의 디자인 샘플을 탐색하고 참고하세요.</p>
      </div>

      <!-- 샘플 그리드 -->
      <div v-if="filteredSamples.length > 0" class="sample-grid">
        <div v-for="sample in filteredSamples" :key="sample.id" class="sample-card" @click="handleSampleSelect(sample)">
          <div class="sample-card-header">
            <q-icon :name="sample.icon || 'style'" class="sample-card-icon" />
            <div class="sample-card-title">{{ sample.displayName || sample.name }}</div>
          </div>
          <div class="sample-card-body">
            <div class="sample-card-category">{{ sample.category }}</div>
            <div class="sample-card-description">{{ sample.description || '설명 없음' }}</div>
            <div v-if="sample.tags && sample.tags.length > 0" class="sample-card-tags">
              <q-chip v-for="tag in sample.tags.slice(0, 3)" :key="tag" dense size="sm">
                {{ tag }}
              </q-chip>
            </div>
          </div>
        </div>
      </div>

      <!-- 샘플이 없을 때 -->
      <div v-else class="no-samples q-pa-lg text-center">
        <q-icon name="style" size="64px" color="grey-5" class="q-mb-md" />
        <p class="no-samples-message">검색 결과가 없습니다.</p>
        <p class="no-samples-hint">샘플을 등록하면 여기에 표시됩니다.</p>
      </div>
    </div>

    <!-- 샘플이 선택되었을 때: 샘플 상세 뷰 -->
    <div v-else class="sample-detail-view">
      <div class="detail-header">
        <q-btn flat icon="arrow_back" @click="handleBack" />
        <h2 class="detail-title">{{ selectedSample.displayName || selectedSample.name }}</h2>
      </div>

      <div class="detail-content">
        <!-- 샘플 미리보기 -->
        <div class="detail-section">
          <h3 class="section-title">미리보기</h3>
          <div class="sample-preview">
            <div class="preview-placeholder">
              <q-icon name="image" size="48px" color="grey-5" />
              <p class="preview-text">미리보기 영역</p>
              <p class="preview-note">컴포넌트: {{ selectedSample.componentPath || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <!-- 코드 스니펫 -->
        <div v-if="selectedSample.codeSnippet" class="detail-section">
          <h3 class="section-title">코드 스니펫</h3>
          <div class="code-snippet">
            <pre><code>{{ selectedSample.codeSnippet }}</code></pre>
            <q-btn flat dense icon="content_copy" @click="handleCopyCode" />
          </div>
        </div>

        <!-- 디자인 결정 요소 -->
        <div v-if="selectedSample.designDecisions" class="detail-section">
          <h3 class="section-title">디자인 결정 요소</h3>
          <div class="design-decisions">
            <div v-for="(value, key) in selectedSample.designDecisions" :key="key" class="decision-item">
              <div class="decision-key">{{ key }}:</div>
              <div class="decision-value">{{ value }}</div>
            </div>
          </div>
        </div>

        <!-- AI 참조 키워드 -->
        <div class="detail-section">
          <h3 class="section-title">AI 참조 키워드</h3>
          <div class="ai-reference">
            <q-input :model-value="`@${selectedSample.name}`" readonly outlined dense>
              <template v-slot:append>
                <q-btn flat dense icon="content_copy" @click="handleCopyKeyword" />
              </template>
            </q-input>
            <p class="ai-reference-note">AI에게 "{{ `@${selectedSample.name}` }} 샘플 참고"라고 말하면 됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useDevGuide } from 'src/composables/dev-tools/useDevGuide'
import { copyTextToClipboard } from 'src/utils/clipboard'

const { selectedSample, filteredSamples, handleSampleSelect } = useDevGuide()

// 뒤로 가기 핸들러
function handleBack() {
  selectedSample.value = null
  window.dispatchEvent(new CustomEvent('dev-guide-sample-deselected'))
}

// 코드 복사 핸들러
async function handleCopyCode() {
  if (selectedSample.value?.codeSnippet) {
    await copyTextToClipboard(selectedSample.value.codeSnippet)
  }
}

// 키워드 복사 핸들러
async function handleCopyKeyword() {
  if (selectedSample.value?.name) {
    await copyTextToClipboard(`@${selectedSample.value.name}`)
  }
}

// 샘플 선택 이벤트 리스너
function handleSampleSelected() {
  // selectedSample은 useDevGuide에서 관리되므로 자동으로 업데이트됨
}

onMounted(() => {
  window.addEventListener('dev-guide-sample-selected', handleSampleSelected)
})

onBeforeUnmount(() => {
  window.removeEventListener('dev-guide-sample-selected', handleSampleSelected)
})
</script>

<style lang="scss" scoped>
.dev-guide-content {
  height: 100%;
  padding: 24px;

  .sample-library-view {
    .library-header {
      margin-bottom: 24px;

      .library-title {
        color: var(--nexa-text-primary);
        font-size: 2rem;
        font-weight: 900;
        margin-bottom: 8px;
      }

      .library-description {
        color: var(--nexa-text-secondary);
        font-size: 1rem;
      }
    }

    .sample-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .sample-card {
      background-color: var(--nexa-surface);
      border: 1px solid var(--nexa-border-color);
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background-color: var(--nexa-surface-hover);
        border-color: var(--nexa-border-hover);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .sample-card-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;

        .sample-card-icon {
          margin-right: 8px;
          color: var(--nexa-text-secondary);
        }

        .sample-card-title {
          color: var(--nexa-text-primary);
          font-size: 1.1rem;
          font-weight: 600;
        }
      }

      .sample-card-body {
        .sample-card-category {
          color: var(--nexa-text-secondary);
          font-size: 0.875rem;
          margin-bottom: 8px;
        }

        .sample-card-description {
          color: var(--nexa-text-secondary);
          font-size: 0.875rem;
          margin-bottom: 8px;
        }

        .sample-card-tags {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
      }
    }

    .no-samples {
      .no-samples-message {
        color: var(--nexa-text-primary);
        font-size: 1.1rem;
        font-weight: 500;
        margin-bottom: 4px;
      }

      .no-samples-hint {
        color: var(--nexa-text-secondary);
        font-size: 0.875rem;
      }
    }
  }

  .sample-detail-view {
    .detail-header {
      display: flex;
      align-items: center;
      margin-bottom: 24px;

      .detail-title {
        color: var(--nexa-text-primary);
        font-size: 1.75rem;
        font-weight: 900;
        margin-left: 8px;
      }
    }

    .detail-content {
      .detail-section {
        margin-bottom: 32px;

        .section-title {
          color: var(--nexa-text-primary);
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .sample-preview {
          background-color: var(--nexa-surface);
          border: 1px solid var(--nexa-border-color);
          border-radius: 8px;
          padding: 32px;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;

          .preview-placeholder {
            text-align: center;
            color: var(--nexa-text-secondary);

            .preview-text {
              margin: 8px 0 4px;
              font-weight: 500;
            }

            .preview-note {
              font-size: 0.875rem;
              color: var(--nexa-text-disabled);
            }
          }
        }

        .code-snippet {
          background-color: var(--nexa-surface);
          border: 1px solid var(--nexa-border-color);
          border-radius: 8px;
          padding: 16px;
          position: relative;

          pre {
            margin: 0;
            overflow-x: auto;

            code {
              font-family: 'Courier New', monospace;
              font-size: 0.875rem;
              color: var(--nexa-text-primary);
            }
          }

          .q-btn {
            position: absolute;
            top: 8px;
            right: 8px;
          }
        }

        .design-decisions {
          .decision-item {
            display: flex;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--nexa-border-color);

            &:last-child {
              border-bottom: none;
            }

            .decision-key {
              color: var(--nexa-text-secondary);
              font-weight: 500;
              min-width: 120px;
            }

            .decision-value {
              color: var(--nexa-text-primary);
              flex: 1;
            }
          }
        }

        .ai-reference {
          .ai-reference-note {
            color: var(--nexa-text-secondary);
            font-size: 0.875rem;
            margin-top: 8px;
          }
        }
      }
    }
  }
}
</style>

