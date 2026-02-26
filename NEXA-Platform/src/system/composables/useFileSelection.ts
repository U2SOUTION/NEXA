/**
 * 전역 파일 선택 계약 (도메인 무관)
 * 탐색기 등에서 선택한 파일을 공유하고, 구독할 수 있는 인터페이스.
 * @see 기획서: Phase 2 선택 계약, @select 페이로드는 API 파일 객체와 동일 필드
 */

import { ref, type Ref } from 'vue'
import type { FileMeta } from '@system/types'

/** 선택 파일 페이로드 (API 파일 객체와 동일 필드 + 선택적 확장, url은 표시용으로 null 가능) */
export type FileSelectionPayload = Omit<FileMeta, 'url'> & {
  url?: string | null
  domain?: string | null
  source?: string | null
  edge_sid?: number | string | null
  created_at?: string | null
}

const selectedFile: Ref<FileSelectionPayload | null> = ref(null)
const selectionListeners = new Set<(file: FileSelectionPayload | null) => void>()

export function useFileSelection() {
  function setSelectedFile(file: FileSelectionPayload | Record<string, unknown> | null | undefined) {
    const prev = selectedFile.value
    selectedFile.value = file == null ? null : normalizeFilePayload(file)
    if (prev !== selectedFile.value) {
      selectionListeners.forEach((fn) => fn(selectedFile.value))
    }
  }

  function clearSelection() {
    setSelectedFile(null)
  }

  /**
   * 선택 변경 시 호출되는 콜백 등록. 구독 해제 함수 반환.
   */
  function onSelected(callback: (file: FileSelectionPayload | null) => void): () => void {
    if (typeof callback !== 'function') return () => {}
    selectionListeners.add(callback)
    return () => selectionListeners.delete(callback)
  }

  return {
    selectedFile,
    setSelectedFile,
    clearSelection,
    onSelected,
  }
}

function normalizeFilePayload(
  file: FileSelectionPayload | Record<string, unknown>,
): FileSelectionPayload | null {
  if (!file || typeof file !== 'object') return null
  const o = file as Record<string, unknown>
  return {
    id: (o.id as number) ?? 0,
    url: (o.url as string) ?? null,
    original_name: (o.original_name as string) ?? '',
    category: (o.category as FileSelectionPayload['category']) ?? null,
    domain: (o.domain as string | null) ?? null,
    file_path: (o.file_path as string) ?? null,
    file_type: (o.file_type as FileSelectionPayload['file_type']) ?? null,
    file_size: (o.file_size as number | null) ?? null,
    source: (o.source as string | null) ?? null,
    edge_sid: (o.edge_sid as number | string | null) ?? null,
    created_at: (o.created_at as string | null) ?? null,
  }
}
