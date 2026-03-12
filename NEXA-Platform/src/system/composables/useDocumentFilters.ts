/**
 * 문서 필터 관리 Composable
 * 
 * 문서 관리의 필터 토글 기능을 담당합니다.
 */

import type { Ref } from 'vue'

interface DocumentStoreLike {
  hideCompleted: boolean
  autoHighlightOnScroll: boolean
}

interface ContentRefLike {
  value: { isTrashView?: boolean } | null
}

/**
 * 문서 필터 관리 Composable
 * @param documentStore - 문서 관리 스토어
 * @param contentRef - DocumentManagerList 컴포넌트 참조
 * @param saveSettings - 설정 저장 함수
 * @param excludedFiles - 제외된 파일 표시 여부 ref
 * @returns 필터 토글 함수들
 */
export function useDocumentFilters(
  documentStore: DocumentStoreLike,
  contentRef: ContentRefLike,
  saveSettings: () => void,
  excludedFiles: Ref<boolean>
) {
  /**
   * 제외된 파일 표시 토글
   */
  function toggleExcludedFiles() {
    excludedFiles.value = !excludedFiles.value
    saveSettings()
  }

  /**
   * 완료된 항목 숨기기 토글
   */
  function toggleHideCompleted() {
    documentStore.hideCompleted = !documentStore.hideCompleted
    saveSettings()
  }

  /**
   * 자동 하이라이트 토글
   */
  function toggleHighlight() {
    documentStore.autoHighlightOnScroll = !documentStore.autoHighlightOnScroll
    saveSettings()
  }

  /**
   * 휴지통 보기 토글
   */
  function toggleTrashView() {
    if (contentRef.value && contentRef.value.isTrashView !== undefined) {
      contentRef.value.isTrashView = !contentRef.value.isTrashView
    }
  }

  return {
    toggleExcludedFiles,
    toggleHideCompleted,
    toggleHighlight,
    toggleTrashView,
  }
}

