/**
 * 에러 분석 문서 인덱스 관리
 * 성능 최적화를 위한 인덱스 시스템
 */

import { parseErrorAnalysisFrontmatter } from './errorAnalysisParser.js'
import { quietFetch } from './quietFetch.js'
import { getDocsBaseUrl } from '../apiBaseUrl.js'

const docsBaseUrl = getDocsBaseUrl()

/**
 * 에러 분석 문서 인덱스 관리 클래스
 */
export class ErrorAnalysisIndex {
  constructor(project = 'Platform') {
    this.project = project
    this.indexPath = `Error/${project}/.error-analysis-index.json`
    this.cache = null
    this.lastModified = null
    this.lastError = null // 마지막 에러 정보 저장
  }

  /**
   * 인덱스 파일 로드
   * @returns {Promise<Object>} 인덱스 객체
   */
  async loadIndex() {
    try {
      // 캐시가 있으면 캐시 반환
      if (this.cache) {
        return this.cache
      }

      // 메타데이터 API로 인덱스 파일 존재 여부 먼저 확인 (400 에러 방지)
      const metadataResponse = await quietFetch(`${docsBaseUrl}/metadata`)
      if (metadataResponse && metadataResponse.ok) {
        const metadata = await metadataResponse.json()
        const files = metadata.files || []
        const indexFile = files.find(f => {
          const filePath = f.relativePath || f.fileName || ''
          return filePath === this.indexPath
        })
        
        // 인덱스 파일이 없으면 바로 빈 인덱스 반환 (요청하지 않음)
        if (!indexFile) {
          this.lastError = {
            type: 'index_not_found',
            message: `인덱스 파일을 찾을 수 없습니다: ${this.indexPath}`,
            url: `${docsBaseUrl}/${encodeURIComponent(this.indexPath)}`,
            status: null,
            statusText: 'Not Found (checked via metadata)',
          }
          return this.createEmptyIndex()
        }
      }

      // 인덱스 파일이 존재하는 경우에만 실제 파일 요청
      const url = `${docsBaseUrl}/${encodeURIComponent(this.indexPath)}`
      const response = await quietFetch(url)
      
      if (!response) {
        // 네트워크 에러는 조용히 처리
        this.lastError = {
          type: 'index_not_found',
          message: `인덱스 파일을 찾을 수 없습니다: ${this.indexPath}`,
          url,
          status: null,
          statusText: 'Network Error',
        }
        return this.createEmptyIndex()
      }

      if (!response.ok) {
        // 인덱스 파일이 없으면 에러 정보 저장 (400/404는 예상된 에러)
        this.lastError = {
          type: 'index_not_found',
          message: `인덱스 파일을 찾을 수 없습니다: ${this.indexPath}`,
          url,
          status: response.status,
          statusText: response.statusText,
        }
        // 인덱스 파일이 없으면 빈 인덱스 생성
        return this.createEmptyIndex()
      }

      const content = await response.text()
      const index = JSON.parse(content)

      this.cache = index
      this.lastError = null // 성공 시 에러 정보 초기화
      return index
    } catch {
      this.lastError = {
        type: 'index_load_error',
        message: `인덱스 파일 로드 실패: ${this.indexPath}`,
        path: this.indexPath,
      }
      return this.createEmptyIndex()
    }
  }

  /**
   * 마지막 에러 정보 가져오기
   * @returns {Object|null} 에러 정보 또는 null
   */
  getLastError() {
    return this.lastError
  }

  /**
   * 빈 인덱스 생성
   * @returns {Object} 빈 인덱스 객체
   */
  createEmptyIndex() {
    return {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      index: {},
      fileMap: {},
    }
  }

  /**
   * 에러 ID로 문서 검색 (인덱스 사용)
   * @param {string} errorId - 에러 ID
   * @returns {Promise<Array>} 문서 메타데이터 배열
   */
  async findDocumentsByErrorId(errorId) {
    if (!errorId) {
      return []
    }

    const index = await this.loadIndex()
    return index.index[errorId] || []
  }

  /**
   * 문서 추가/업데이트 시 인덱스 업데이트
   * @param {string} documentPath - 문서 경로
   * @param {Object} metadata - 문서 메타데이터
   * @returns {Promise<void>}
   */
  async updateIndex(documentPath, metadata) {
    const index = await this.loadIndex()
    const errorId = metadata.errorId

    if (!errorId) {
      // 에러 ID가 없으면 조용히 반환 (콘솔 로그 출력 안 함)
      return
    }

    // 기존 항목 제거 (같은 파일이면)
    if (index.fileMap[documentPath]) {
      const oldErrorId = index.fileMap[documentPath]
      if (index.index[oldErrorId]) {
        index.index[oldErrorId] = index.index[oldErrorId].filter((doc) => doc.path !== documentPath)
        if (index.index[oldErrorId].length === 0) {
          delete index.index[oldErrorId]
        }
      }
    }

    // 새 항목 추가
    if (!index.index[errorId]) {
      index.index[errorId] = []
    }

    const docEntry = {
      path: documentPath,
      fileName: metadata.fileName || documentPath.split('/').pop(),
      title: metadata.title || metadata.fileName || '제목 없음',
      createdAt: metadata.createdAt || new Date().toISOString(),
      updatedAt: metadata.updatedAt || new Date().toISOString(),
      tags: metadata.tags || [],
      errorMessage: metadata.errorMessage || null,
    }

    // 중복 체크
    const existingIndex = index.index[errorId].findIndex((doc) => doc.path === documentPath)
    if (existingIndex >= 0) {
      index.index[errorId][existingIndex] = docEntry
    } else {
      index.index[errorId].push(docEntry)
    }

    // 파일 맵 업데이트
    index.fileMap[documentPath] = errorId
    index.lastUpdated = new Date().toISOString()

    // 인덱스 파일 저장
    await this.saveIndex(index)
  }

  /**
   * 문서 삭제 시 인덱스 업데이트
   * @param {string} documentPath - 문서 경로
   * @returns {Promise<void>}
   */
  async removeFromIndex(documentPath) {
    const index = await this.loadIndex()
    const errorId = index.fileMap[documentPath]

    if (errorId && index.index[errorId]) {
      index.index[errorId] = index.index[errorId].filter((doc) => doc.path !== documentPath)
      if (index.index[errorId].length === 0) {
        delete index.index[errorId]
      }
    }

    delete index.fileMap[documentPath]
    index.lastUpdated = new Date().toISOString()

    await this.saveIndex(index)
  }

  /**
   * 인덱스 파일 저장
   * @param {Object} index - 인덱스 객체
   * @returns {Promise<void>}
   */
  async saveIndex(index) {
    const content = JSON.stringify(index, null, 2)
    const url = `${docsBaseUrl}/${encodeURIComponent(this.indexPath)}`
    const response = await quietFetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: content,
    })

    if (!response || !response.ok) {
      throw new Error(`인덱스 저장 실패: ${response?.statusText || 'Unknown error'}`)
    }

    this.cache = index
  }

  /**
   * 인덱스 재구성 (모든 문서 스캔)
   * @returns {Promise<Object>} 재구성된 인덱스
   */
  async rebuildIndex() {
    const index = this.createEmptyIndex()

    try {
      // 에러 분석 폴더의 모든 파일 가져오기 (조용한 fetch 사용)
      const response = await quietFetch(`${docsBaseUrl}/Error/${this.project}`)
      if (!response || !response.ok) {
        return index
      }

      const files = await response.json()

      for (const file of files) {
        // 인덱스 파일 자체는 제외
        if (file.name === '.error-analysis-index.json') continue

        try {
          const contentResponse = await quietFetch(
            `${docsBaseUrl}/${encodeURIComponent(file.path)}`
          )
          if (!contentResponse || !contentResponse.ok) {
            continue
          }

          const content = await contentResponse.text()
          const frontmatter = parseErrorAnalysisFrontmatter(content)

          if (frontmatter?.errorId) {
            // 인덱스에 직접 추가 (재귀 호출 방지)
            const errorId = frontmatter.errorId
            if (!index.index[errorId]) {
              index.index[errorId] = []
            }

            const docEntry = {
              path: file.path,
              fileName: file.name,
              title: frontmatter.title || file.name.replace('.md', ''),
              createdAt: frontmatter.createdAt || new Date().toISOString(),
              updatedAt: frontmatter.updatedAt || new Date().toISOString(),
              tags: frontmatter.tags || [],
              errorMessage: frontmatter.errorMessage || null,
            }

            index.index[errorId].push(docEntry)
            index.fileMap[file.path] = errorId
          }
        } catch {
          // 문서 처리 실패는 조용히 처리 (콘솔 로그 출력 안 함)
        }
      }

      index.lastUpdated = new Date().toISOString()

      // 재구성된 인덱스 저장
      await this.saveIndex(index)

      return index
    } catch {
      // 에러는 조용히 처리 (콘솔 로그 출력 안 함)
      return index
    }
  }

  /**
   * 캐시 초기화
   */
  clearCache() {
    this.cache = null
    this.lastModified = null
  }
}

// 프로젝트별 인스턴스 (기본은 Platform)
export const errorAnalysisIndex = new ErrorAnalysisIndex('Platform')

// 다른 프로젝트용 인스턴스 생성 함수
export function createErrorAnalysisIndex(project) {
  return new ErrorAnalysisIndex(project)
}

