/**
 * 전역 파일 선택 계약 (도메인 무관)
 * 탐색기 등에서 선택한 파일을 공유하고, 구독할 수 있는 인터페이스.
 * @see 기획서: Phase 2 선택 계약, @select 페이로드는 API 파일 객체와 동일 필드
 *
 * 선택 파일 페이로드: id, url, original_name, category, domain, file_path, file_type, file_size, source?, edge_sid?, created_at?
 */

import { ref } from 'vue'

const selectedFile = ref(null)
const selectionListeners = new Set()

export function useFileSelection() {
  function setSelectedFile(file) {
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
   * @param {(file: object | null) => void} callback
   * @returns {() => void} unsubscribe
   */
  function onSelected(callback) {
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

/**
 * API 파일 객체와 동일한 형태로 정규화 (필수 필드만 보장).
 * @param {object} file
 * @returns {object}
 */
function normalizeFilePayload(file) {
  if (!file || typeof file !== 'object') return null
  return {
    id: file.id,
    url: file.url ?? null,
    original_name: file.original_name ?? '',
    category: file.category ?? null,
    domain: file.domain ?? null,
    file_path: file.file_path ?? null,
    file_type: file.file_type ?? null,
    file_size: file.file_size ?? null,
    source: file.source ?? null,
    edge_sid: file.edge_sid ?? null,
    created_at: file.created_at ?? null,
  }
}
