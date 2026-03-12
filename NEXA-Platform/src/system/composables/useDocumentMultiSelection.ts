/**
 * 문서 관리 멀티 셀렉션 작업 Composable
 *
 * 문서의 일괄 작업(휴지통 이동, 복원, 영구 삭제)을 처리합니다.
 */

import type { Ref } from 'vue'
import { useQuasar } from 'quasar'
import {
  moveToTrash,
  restoreFromTrash,
  permanentlyDeleteFromTrash,
  type DocumentManagerStoreLike,
} from '@domains/dev/modules/document-manager/services/documentStorage'

export interface DocumentFileLike {
  name: string
  path?: string
  relativePath?: string
}

export interface ContentRefLike {
  clearSelection?: () => void
}

/**
 * 문서 멀티 셀렉션 작업 Composable
 */
export function useDocumentMultiSelection(
  documentStore: DocumentManagerStoreLike,
  contentRef: Ref<ContentRefLike | null>
) {
  const $q = useQuasar()

  async function moveSelectedToTrash(selectedFiles: DocumentFileLike[]) {
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
        const content = contentRef.value
        if (content?.clearSelection) {
          content.clearSelection()
        }

        if (documentStore.selectedFile && selectedFiles.some((f: DocumentFileLike) => f.name === documentStore.selectedFile!.name)) {
          documentStore.selectedFile = undefined
        }

        $q.notify({
          type: 'positive',
          message: `${count}개 문서를 휴지통으로 이동했습니다`,
          position: 'top',
          timeout: 2000,
        })
      } catch (err: unknown) {
        console.error('[useDocumentMultiSelection] 휴지통 이동 실패:', err)
        $q.notify({
          type: 'negative',
          message: `휴지통 이동 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
          position: 'top',
          timeout: 3000,
        })
      }
    }
  }

  async function restoreSelected(selectedFiles: DocumentFileLike[]) {
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
        const content = contentRef.value
        if (content?.clearSelection) {
          content.clearSelection()
        }

        if (documentStore.selectedFile && selectedFiles.some((f: DocumentFileLike) => f.name === documentStore.selectedFile!.name)) {
          documentStore.selectedFile = undefined
        }

        $q.notify({
          type: 'positive',
          message: `${count}개 문서를 복원했습니다`,
          position: 'top',
          timeout: 2000,
        })
      } catch (err: unknown) {
        console.error('[useDocumentMultiSelection] 복원 실패:', err)
        $q.notify({
          type: 'negative',
          message: `복원 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
          position: 'top',
          timeout: 3000,
        })
      }
    }
  }

  async function permanentlyDeleteSelected(selectedFiles: DocumentFileLike[]) {
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
        const failedFiles: string[] = []

        for (const file of selectedFiles) {
          try {
            // relativePath를 우선 사용, 없으면 name 사용
            const filePath = file.relativePath || file.path || file.name
            await permanentlyDeleteFromTrash(filePath, documentStore)
            successCount++
          } catch (err: unknown) {
            const filePath = file.relativePath ?? file.path ?? file.name
            console.error(`[useDocumentMultiSelection] 파일 영구 삭제 실패: ${filePath}`, err)
            failedFiles.push(filePath)
          }
        }

        const content = contentRef.value
        if (content?.clearSelection) {
          content.clearSelection()
        }

        if (documentStore.selectedFile && selectedFiles.some((f: DocumentFileLike) => f.name === documentStore.selectedFile!.name)) {
          documentStore.selectedFile = undefined
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
      } catch (err: unknown) {
        console.error('[useDocumentMultiSelection] 영구 삭제 실패:', err)
        $q.notify({
          type: 'negative',
          message: `영구 삭제 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
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

