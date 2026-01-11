<!-- DetailedDescriptionViewer.vue
  Tiptap 에디터로 입력한 HTML 콘텐츠를 요약하여 표시하는 컴포넌트
  - 태그 제거하여 텍스트만 추출
  - 이미지는 가로 100%로 표시
  - 내용이 길면 일부만 보여주고 전체보기 버튼 제공
-->
<template>
  <div class="detailed-description-viewer">
    <!-- 상세설명 제목 -->
    <div class="detailed-description-label q-mb-sm">상세설명</div>

    <!-- 텍스트 요약 (이미지는 별도 섹션에서 표시되므로 여기서는 제외) -->
    <div v-if="summaryText" class="summary-text">
      <div class="summary-content" :class="{ 'is-truncated': isTruncated }">
        {{ summaryText }}
      </div>
      <!-- 전체보기 버튼 -->
      <div v-if="isTruncated" class="view-full-btn-wrapper q-mt-sm">
        <q-btn
          flat
          dense
          size="sm"
          color="primary"
          icon="fullscreen"
          label="전체보기"
          @click="showFullModal = true"
          class="view-full-btn"
        />
      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-if="!summaryText" class="empty-state text-caption text-grey-6">상세설명이 없습니다.</div>

    <!-- 전체보기 모달 -->
    <q-dialog v-model="showFullModal" maximized>
      <q-card class="full-content-modal">
        <q-card-section class="modal-header">
          <div class="row items-center justify-between">
            <div class="text-h6 text-primary">상세설명 전체보기</div>
            <q-btn flat round dense icon="close" @click="showFullModal = false" class="close-btn" />
          </div>
        </q-card-section>

        <q-card-section class="modal-content">
          <div class="full-content" v-html="sanitizedHtml"></div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  htmlContent: {
    type: String,
    default: '',
  },
  maxTextLength: {
    type: Number,
    default: 200, // 기본 최대 텍스트 길이
  },
})

const showFullModal = ref(false)

// HTML 파싱 및 텍스트 추출
const summaryText = computed(() => {
  if (!props.htmlContent) return ''

  try {
    // DOMParser를 사용하여 HTML 파싱
    const parser = new DOMParser()
    const doc = parser.parseFromString(props.htmlContent, 'text/html')

    // 모든 텍스트 추출 (태그 제거)
    const textContent = doc.body.textContent || doc.body.innerText || ''

    // 공백 정리 (여러 공백을 하나로, 줄바꿈 정리)
    const cleanedText = textContent
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim()

    // 최대 길이 제한
    if (cleanedText.length <= props.maxTextLength) {
      return cleanedText
    }

    // 길이 제한 시 말줄임표 추가
    return cleanedText.substring(0, props.maxTextLength) + '...'
  } catch (error) {
    // 개발 모드에서만 에러 로그 출력
    if (import.meta.env.DEV) {
      console.error('HTML 파싱 오류:', error)
    }
    return ''
  }
})

// 텍스트가 잘렸는지 확인
const isTruncated = computed(() => {
  if (!props.htmlContent) return false
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(props.htmlContent, 'text/html')
    const textContent = doc.body.textContent || doc.body.innerText || ''
    const cleanedText = textContent.replace(/\s+/g, ' ').trim()
    return cleanedText.length > props.maxTextLength
  } catch {
    return false
  }
})

// 전체 내용 표시용 HTML (XSS 방지를 위한 기본 sanitization)
// 이미지는 별도 섹션에서 표시되므로 여기서는 제거
const sanitizedHtml = computed(() => {
  if (!props.htmlContent) return ''

  // 기본적인 XSS 방지 (실제 프로덕션에서는 DOMPurify 같은 라이브러리 사용 권장)
  // 여기서는 기본적인 태그만 허용
  let sanitized = props.htmlContent

  // 위험한 태그 제거
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'style']
  dangerousTags.forEach((tag) => {
    const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gis')
    sanitized = sanitized.replace(regex, '')
  })

  // 이미지 태그 제거 (이미지는 별도 섹션에서 표시되므로 중복 방지)
  sanitized = sanitized.replace(/<img[^>]*>/gi, '')

  return sanitized
})
</script>

<style lang="scss" scoped>
.detailed-description-viewer {
  .detailed-description-label {
    font-size: 0.75rem;
    color: var(--nexa-text-primary);
    opacity: 0.6;
    text-transform: uppercase;
    font-weight: 500;
  }

  .extracted-images {
    .extracted-image-item {
      width: 100%;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid var(--nexa-border-color, rgba(255, 255, 255, 0.1));
      background-color: var(--nexa-bg-secondary, rgba(0, 0, 0, 0.05));

      .extracted-image {
        width: 100%;
        height: auto;
        display: block;
        object-fit: contain;
        max-height: 400px; // 최대 높이 제한
      }

      .image-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100px;
        gap: 8px;
      }
    }
  }

  .summary-text {
    .summary-content {
      font-size: 0.85rem;
      color: var(--nexa-text-primary);
      opacity: 0.7;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .view-full-btn-wrapper {
      display: flex;
      justify-content: flex-start;

      .view-full-btn {
        font-size: 14px;
        font-weight: 500;
        padding: 4px 12px;
      }
    }
  }

  .empty-state {
    font-style: italic;
    padding: 8px 0;
  }
}

// 모달 스타일
:deep(.full-content-modal) {
  background-color: var(--nexa-bg, #1e1e1e);

  .modal-header {
    border-bottom: 1px solid var(--nexa-border-color, rgba(255, 255, 255, 0.1));
    padding: 16px 24px;

    .text-h6 {
      font-weight: 600;
    }

    .close-btn {
      color: var(--nexa-text-primary);
      opacity: 0.7;

      &:hover {
        opacity: 1;
      }
    }
  }

  .modal-content {
    padding: 24px;
    overflow-y: auto;
    max-height: calc(100vh - 80px);

    .full-content {
      color: var(--nexa-text-primary);
      line-height: 1.8;
      font-size: 0.95rem;

      // HTML 콘텐츠 스타일링
      :deep(p) {
        margin-bottom: 12px;
      }

      :deep(h1),
      :deep(h2),
      :deep(h3),
      :deep(h4),
      :deep(h5),
      :deep(h6) {
        margin-top: 24px;
        margin-bottom: 12px;
        font-weight: 600;
        color: var(--nexa-text-primary);
      }

      :deep(h1) {
        font-size: 1.8em;
      }

      :deep(h2) {
        font-size: 1.5em;
      }

      :deep(h3) {
        font-size: 1.3em;
      }

      :deep(ul),
      :deep(ol) {
        margin-left: 24px;
        margin-bottom: 12px;
      }

      :deep(li) {
        margin-bottom: 6px;
      }

      :deep(blockquote) {
        border-left: 4px solid var(--q-primary);
        padding-left: 16px;
        margin: 16px 0;
        font-style: italic;
        opacity: 0.8;
      }

      :deep(code) {
        background-color: rgba(0, 0, 0, 0.3);
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        font-size: 0.9em;
      }

      :deep(pre) {
        background-color: rgba(0, 0, 0, 0.3);
        padding: 16px;
        border-radius: 4px;
        overflow-x: auto;
        margin: 16px 0;

        code {
          background: none;
          padding: 0;
        }
      }

      :deep(table) {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
        border: 1px solid var(--nexa-border-color, rgba(255, 255, 255, 0.1));

        th,
        td {
          padding: 8px 12px;
          border: 1px solid var(--nexa-border-color, rgba(255, 255, 255, 0.1));
          text-align: left;
        }

        th {
          background-color: rgba(0, 0, 0, 0.2);
          font-weight: 600;
        }
      }

      :deep(img) {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        margin: 16px 0;
        display: block;
      }

      :deep(a) {
        color: var(--q-primary);
        text-decoration: underline;

        &:hover {
          opacity: 0.8;
        }
      }

      :deep(strong),
      :deep(b) {
        font-weight: 600;
      }

      :deep(em),
      :deep(i) {
        font-style: italic;
      }
    }
  }
}
</style>
