/**
 * 문서 관리 멀티 셀렉션 작업 Composable
 * 
 * 문서의 일괄 작업(휴지통 이동, 복원, 영구 삭제)을 처리합니다.
 */

import { useQuasar } from 'quasar'
import { moveToTrash, restoreFromTrash, permanentlyDeleteFromTrash } from 'src/modules/document-manager/services/documentStorage.js'

/**
 * 문서 멀티 셀렉션 작업 Composable
 * @param {Object} documentStore - 문서 관리 스토어
 * @param {Object} contentRef - DocumentManagerList 컴포넌트 참조
 * @returns {Object} 멀티 셀렉션 작업 함수들
 */
export function useDocumentMultiSelection(documentStore, contentRef) {
  const $q = useQuasar()

  /**
   * 선택된 파일들을 휴지통으로 이동
   * @param {Array} selectedFiles - 선택된 파일 배열
   */
  async function moveSelectedToTrash(selectedFiles) {
    if (!selectedFiles || selectedFiles.length === 0) return

    const count = selectedFiles.length
    const confirmed = await $q.dialog({
      title: '휴지통 이동',
      message: `선택한 ${count}개 문서를 휴지통으로 이동하시겠습니까?`,
      persistent: true,
      ok: {
        label: '이동',
        color: 'negative',
        flat: false,
      },
      cancel: {
        label: '취소',
        flat: true,
      },
    })

    if (confirmed) {
      try {
        for (const file of selectedFiles) {
          moveToTrash(file.name, documentStore)
        }
        if (contentRef.value) {
          contentRef.value.clearSelection()
        }

        // 현재 선택된 파일이 이동된 파일 중 하나면 선택 해제
        if (documentStore.selectedFile && selectedFiles.some((f) => f.name === documentStore.selectedFile.name)) {
          documentStore.selectedFile = null
        }

        $q.notify({
          type: 'positive',
          message: `${count}개 문서를 휴지통으로 이동했습니다`,
          position: 'top',
          timeout: 2000,
        })
      } catch (error) {
        console.error('[useDocumentMultiSelection] 휴지통 이동 실패:', error)
        $q.notify({
          type: 'negative',
          message: `휴지통 이동 실패: ${error.message || '알 수 없는 오류'}`,
          position: 'top',
          timeout: 3000,
        })
      }
    }
  }

  /**
   * 선택된 파일들을 복원
   * @param {Array} selectedFiles - 선택된 파일 배열
   */
  async function restoreSelected(selectedFiles) {
    if (!selectedFiles || selectedFiles.length === 0) return

    const count = selectedFiles.length
    const confirmed = await $q.dialog({
      title: '복원',
      message: `선택한 ${count}개 문서를 복원하시겠습니까?`,
      persistent: true,
      ok: {
        label: '복원',
        color: 'primary',
        flat: false,
      },
      cancel: {
        label: '취소',
        flat: true,
      },
    })

    if (confirmed) {
      try {
        for (const file of selectedFiles) {
          restoreFromTrash(file.name, documentStore)
        }
        if (contentRef.value) {
          contentRef.value.clearSelection()
        }

        // 현재 선택된 파일이 복원된 파일 중 하나면 선택 해제
        if (documentStore.selectedFile && selectedFiles.some((f) => f.name === documentStore.selectedFile.name)) {
          documentStore.selectedFile = null
        }

        $q.notify({
          type: 'positive',
          message: `${count}개 문서를 복원했습니다`,
          position: 'top',
          timeout: 2000,
        })
      } catch (error) {
        console.error('[useDocumentMultiSelection] 복원 실패:', error)
        $q.notify({
          type: 'negative',
          message: `복원 실패: ${error.message || '알 수 없는 오류'}`,
          position: 'top',
          timeout: 3000,
        })
      }
    }
  }

  /**
   * 선택된 파일들을 영구 삭제
   * @param {Array} selectedFiles - 선택된 파일 배열
   */
  async function permanentlyDeleteSelected(selectedFiles) {
    if (!selectedFiles || selectedFiles.length === 0) return

    const count = selectedFiles.length
    const confirmed = await $q.dialog({
      title: '영구 삭제',
      message: `선택한 ${count}개 문서를 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      persistent: true,
      ok: {
        label: '삭제',
        color: 'negative',
        flat: false,
      },
      cancel: {
        label: '취소',
        flat: true,
      },
    })

    if (confirmed) {
      try {
        let successCount = 0
        let failedFiles = []

        for (const file of selectedFiles) {
          try {
            // relativePath를 우선 사용, 없으면 name 사용
            const filePath = file.relativePath || file.path || file.name
            await permanentlyDeleteFromTrash(filePath, documentStore)
            successCount++
          } catch (error) {
            const filePath = file.relativePath || file.path || file.name
            console.error(`[useDocumentMultiSelection] 파일 영구 삭제 실패: ${filePath}`, error)
            failedFiles.push(filePath)
          }
        }

        if (contentRef.value) {
          contentRef.value.clearSelection()
        }

        // 현재 선택된 파일이 삭제된 파일 중 하나면 선택 해제
        if (documentStore.selectedFile && selectedFiles.some((f) => f.name === documentStore.selectedFile.name)) {
          documentStore.selectedFile = null
        }

        if (failedFiles.length > 0) {
          $q.notify({
            type: 'warning',
            message: `${successCount}개 파일 삭제 성공, ${failedFiles.length}개 파일 삭제 실패`,
            position: 'top',
            timeout: 3000,
          })
        } else {
          $q.notify({
            type: 'positive',
            message: `${successCount}개 문서를 영구적으로 삭제했습니다`,
            position: 'top',
            timeout: 2000,
          })
        }
      } catch (error) {
        console.error('[useDocumentMultiSelection] 영구 삭제 실패:', error)
        $q.notify({
          type: 'negative',
          message: `영구 삭제 실패: ${error.message || '알 수 없는 오류'}`,
          position: 'top',
          timeout: 3000,
        })
      }
    }
  }

  return {
    moveSelectedToTrash,
    restoreSelected,
    permanentlyDeleteSelected,
  }
}

