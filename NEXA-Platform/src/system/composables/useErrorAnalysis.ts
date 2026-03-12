/**
 * 에러 분석 문서 검색 Composable
 *
 * 에러 분석 문서를 검색하고 로드하는 기능을 제공합니다.
 */

import { ref, computed } from 'vue'
import { errorAnalysisIndex } from '@system/utils/error-tracking/errorAnalysisIndex'
import { extractDocumentMetadata, parseErrorAnalysisFrontmatter } from '@system/utils/error-tracking/errorAnalysisParser'
import type { ErrorAnalysisFrontmatter } from '@system/utils/error-tracking/errorAnalysisParser'
import { quietFetch } from '@system/utils/error-tracking/quietFetch'
import { getDocsBaseUrl, getDocFileUrl } from '@system/utils/apiBaseUrl'

const docsBaseUrl = getDocsBaseUrl()

interface FileMeta {
  relativePath?: string
  fileName?: string
}

export interface ErrorAnalysisDocument {
  path: string
  fileName: string | undefined
  title: string
  createdAt: string
  updatedAt: string
  tags: string[]
  errorMessage: string | null
  body?: string
  frontmatter?: Record<string, unknown>
  rawContent?: string
}

interface IndexError {
  type?: string
  message?: string
  url?: string
  path?: string
  status?: number | null
  statusText?: string
}

/**
 * 메타데이터 API를 활용하여 Error/Platform 폴더의 문서 검색
 */
async function searchKnownDocumentPaths(errorId: string): Promise<Array<{ path: string; fileName: string; title: string; createdAt: string; updatedAt: string; tags: string[]; errorMessage: string | null }>> {
  const project = 'Platform'
  const matchingDocs: Array<{ path: string; fileName: string; title: string; createdAt: string; updatedAt: string; tags: string[]; errorMessage: string | null }> = []

  try {
    const metadataResponse = await quietFetch(`${docsBaseUrl}/metadata`)
    if (!metadataResponse || !metadataResponse.ok) {
      return []
    }

    const metadata = (await metadataResponse.json()) as { files?: FileMeta[] }
    const files = metadata.files ?? []

    const errorPlatformFiles = files.filter((fileMeta: FileMeta) => {
      const relativePath = fileMeta.relativePath ?? fileMeta.fileName ?? ''
      return relativePath.includes(`Error/${project}/`) && relativePath.endsWith('.md')
    })

    for (const fileMeta of errorPlatformFiles) {
      const filePath = fileMeta.relativePath ?? fileMeta.fileName
      if (!filePath) continue

      try {
        const contentResponse = await quietFetch(getDocFileUrl(filePath))
        if (!contentResponse || !contentResponse.ok) continue

        const content = await contentResponse.text()
        const frontmatter = parseErrorAnalysisFrontmatter(content)

        if (frontmatter?.errorId === errorId) {
          const fileName = filePath.split('/').pop() ?? ''
          matchingDocs.push({
            path: filePath,
            fileName,
            title: (frontmatter as ErrorAnalysisFrontmatter).title ?? fileName.replace('.md', ''),
            createdAt: (frontmatter as ErrorAnalysisFrontmatter).createdAt ?? new Date().toISOString(),
            updatedAt: (frontmatter as ErrorAnalysisFrontmatter).updatedAt ?? new Date().toISOString(),
            tags: Array.isArray((frontmatter as ErrorAnalysisFrontmatter).tags) ? (frontmatter as ErrorAnalysisFrontmatter).tags! : [],
            errorMessage: (frontmatter as ErrorAnalysisFrontmatter).errorMessage ?? null,
          })
        }
      } catch {
        // 조용히 처리
      }
    }
  } catch {
    // 조용히 처리
  }

  return matchingDocs
}

/**
 * 에러 분석 문서 검색 Composable
 * @returns {Object} 에러 분석 문서 관련 상태 및 함수
 */
export function useErrorAnalysis() {
  const documents = ref<ErrorAnalysisDocument[]>([])
  const isLoading = ref(false)
  const error = ref<unknown>(null)
  const selectedDocument = ref<ErrorAnalysisDocument | null>(null)

  // ============================================
  // Computed
  // ============================================

  /**
   * 문서 개수
   */
  const documentCount = computed(() => documents.value.length)

  /**
   * 문서가 1개인지 확인
   */
  const hasSingleDocument = computed(() => documentCount.value === 1)

  /**
   * 문서가 여러 개인지 확인
   */
  const hasMultipleDocuments = computed(() => documentCount.value > 1)

  /**
   * 문서가 없는지 확인
   */
  const hasNoDocuments = computed(() => documentCount.value === 0)

  // ============================================
  // 함수
  // ============================================

  /**
   * 에러 ID로 분석 문서 검색
   */
  async function findAnalysisDocuments(errorId: string): Promise<ErrorAnalysisDocument[]> {
    if (!errorId) {
      documents.value = []
      error.value = null
      return []
    }

    isLoading.value = true
    error.value = null

    try {
      // 인덱스에서 문서 메타데이터 가져오기
      let indexEntries = await errorAnalysisIndex.findDocumentsByErrorId(errorId)

      // 인덱스가 없거나 비어있으면 메타데이터 API로 직접 검색
      const indexError = errorAnalysisIndex.getLastError()
      if (indexError && indexError.type === 'index_not_found') {
        // 인덱스 파일이 없으면 바로 메타데이터 API로 검색 (폴더 스캔은 시도하지 않음)
        indexEntries = await searchKnownDocumentPaths(errorId)
      }

      if (indexEntries.length === 0) {
        documents.value = []
        const finalError = errorAnalysisIndex.getLastError() as IndexError | null
        if (finalError) {
          error.value = {
            type: 'index_error',
            message: finalError.message || '인덱스 파일을 로드할 수 없습니다. 문서가 없거나 API 경로 문제일 수 있습니다.',
            details: {
              ...finalError,
              suggestion: '문서 뷰어에서 Error/Platform 폴더를 확인하거나, 인덱스를 수동으로 재구성해주세요.',
            },
            errorId, // 검색한 에러 ID도 포함
          }
        }
        return []
      }

      const loadedDocuments: ErrorAnalysisDocument[] = []

      for (const entry of indexEntries) {
        try {
          const response = await quietFetch(`${docsBaseUrl}/${encodeURIComponent(entry.path)}`)

          if (!response || !response.ok) {
            continue
          }

          const content = await response.text()
          const metadata = extractDocumentMetadata(content) as { updatedAt?: string | null; title?: string | null; createdAt?: string | null; tags?: string[]; errorMessage?: string | null; body: string }

          loadedDocuments.push({
            path: entry.path,
            fileName: entry.fileName,
            title: metadata.title ?? entry.title ?? '',
            createdAt: metadata.createdAt ?? entry.createdAt ?? new Date().toISOString(),
            updatedAt: metadata.updatedAt ?? (entry as { updatedAt?: string }).updatedAt ?? new Date().toISOString(),
            tags: metadata.tags ?? (entry as { tags?: string[] }).tags ?? [],
            errorMessage: metadata.errorMessage ?? (entry as { errorMessage?: string | null }).errorMessage ?? null,
            body: metadata.body,
            frontmatter: metadata,
            rawContent: content,
          })
        } catch {
          // 문서 처리 실패는 조용히 처리 (콘솔 로그 출력 안 함)
        }
      }

      documents.value = loadedDocuments

      // 문서가 1개면 자동 선택
      if (loadedDocuments.length === 1) {
        selectedDocument.value = loadedDocuments[0]
      } else {
        selectedDocument.value = null
      }

      return loadedDocuments
    } catch (err: unknown) {
      error.value = err
      documents.value = []
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 문서 선택
   */
  function selectDocument(document: ErrorAnalysisDocument | null): void {
    selectedDocument.value = document
  }

  /**
   * 문서 내용 새로고침
   */
  async function refresh(errorId?: string): Promise<void> {
    if (errorId) {
      await findAnalysisDocuments(errorId)
    }
  }

  /**
   * 상태 초기화
   */
  function clear() {
    documents.value = []
    selectedDocument.value = null
    error.value = null
    isLoading.value = false
  }

  // ============================================
  // 반환
  // ============================================
  return {
    // 상태
    documents,
    isLoading,
    error,
    selectedDocument,

    // Computed
    documentCount,
    hasSingleDocument,
    hasMultipleDocuments,
    hasNoDocuments,

    // 함수
    findAnalysisDocuments,
    selectDocument,
    refresh,
    clear,
  }
}
