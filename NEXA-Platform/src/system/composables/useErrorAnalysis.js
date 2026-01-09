/**
 * 에러 분석 문서 검색 Composable
 *
 * 에러 분석 문서를 검색하고 로드하는 기능을 제공합니다.
 */

import { ref, computed } from 'vue'
import { errorAnalysisIndex } from '@system/utils/error-tracking/errorAnalysisIndex.js'
import { extractDocumentMetadata, parseErrorAnalysisFrontmatter } from '@system/utils/error-tracking/errorAnalysisParser.js'
import { quietFetch } from '@system/utils/error-tracking/quietFetch.js'


/**
 * 메타데이터 API를 활용하여 Error/Platform 폴더의 문서 검색
 * @param {string} errorId - 에러 ID
 * @returns {Promise<Array>} 문서 메타데이터 배열
 */
async function searchKnownDocumentPaths(errorId) {
  const project = 'Platform'
  const matchingDocs = []

  try {
    // 문서 뷰어의 메타데이터 API를 통해 파일 목록 가져오기 (조용한 fetch 사용)
    const metadataResponse = await quietFetch('http://localhost:3000/api/docs/metadata')
    if (!metadataResponse || !metadataResponse.ok) {
      return []
    }

    const metadata = await metadataResponse.json()
    
    // metadata.files 배열에서 Error/Platform 폴더의 파일만 필터링
    const files = metadata.files || []
    const errorPlatformFiles = files.filter((fileMeta) => {
      const relativePath = fileMeta.relativePath || fileMeta.fileName || ''
      return relativePath.startsWith(`Error/${project}/`) && relativePath.endsWith('.md')
    })

    // 각 파일의 내용 확인
    for (const fileMeta of errorPlatformFiles) {
      const filePath = fileMeta.relativePath || fileMeta.fileName
      if (!filePath) continue

      try {
        const contentResponse = await quietFetch(`http://localhost:3000/api/docs/${encodeURIComponent(filePath)}`)
        if (!contentResponse || !contentResponse.ok) continue

        const content = await contentResponse.text()
        const frontmatter = parseErrorAnalysisFrontmatter(content)

        if (frontmatter?.errorId === errorId) {
          const fileName = filePath.split('/').pop()
          matchingDocs.push({
            path: filePath,
            fileName: fileName,
            title: frontmatter.title || fileName.replace('.md', ''),
            createdAt: frontmatter.createdAt || new Date().toISOString(),
            updatedAt: frontmatter.updatedAt || new Date().toISOString(),
            tags: frontmatter.tags || [],
            errorMessage: frontmatter.errorMessage || null,
          })
        }
      } catch {
        // 조용히 처리 (에러 수집기에서 수집되지 않도록)
      }
    }
  } catch {
    // 조용히 처리 (에러 수집기에서 수집되지 않도록)
  }

  return matchingDocs
}

/**
 * 에러 분석 문서 검색 Composable
 * @returns {Object} 에러 분석 문서 관련 상태 및 함수
 */
export function useErrorAnalysis() {
  // ============================================
  // 상태 관리
  // ============================================
  const documents = ref([]) // 검색된 문서 목록
  const isLoading = ref(false) // 로딩 상태
  const error = ref(null) // 에러 상태
  const selectedDocument = ref(null) // 선택된 문서

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
   * @param {string} errorId - 에러 ID
   * @returns {Promise<Array>} 문서 배열
   */
  async function findAnalysisDocuments(errorId) {
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
        // 인덱스 로드 실패 및 직접 검색 실패 시 에러 정보 저장
        const finalError = errorAnalysisIndex.getLastError()
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

      // 각 문서의 전체 내용 로드
      const loadedDocuments = []

      for (const entry of indexEntries) {
        try {
          const response = await quietFetch(`http://localhost:3000/api/docs/${encodeURIComponent(entry.path)}`)

          if (!response || !response.ok) {
            continue
          }

          const content = await response.text()
          const metadata = extractDocumentMetadata(content)

          loadedDocuments.push({
            path: entry.path,
            fileName: entry.fileName,
            title: metadata.title || entry.title,
            createdAt: metadata.createdAt || entry.createdAt,
            updatedAt: metadata.updatedAt || entry.updatedAt,
            tags: metadata.tags || entry.tags || [],
            errorMessage: metadata.errorMessage || entry.errorMessage,
            body: metadata.body, // 프론트매터 제거된 본문
            frontmatter: metadata, // 전체 메타데이터
            rawContent: content, // 원본 내용 (문서 뷰어에서 사용)
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
    } catch (err) {
      // 에러는 조용히 처리하되, UI에 표시하기 위해 error 상태에 저장
      error.value = err
      documents.value = []
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 문서 선택
   * @param {Object} document - 선택할 문서
   */
  function selectDocument(document) {
    selectedDocument.value = document
  }

  /**
   * 문서 내용 새로고침
   * @param {string} errorId - 에러 ID
   */
  async function refresh(errorId) {
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
