/**
 * 내보내기 유틸리티 통합
 */

import { exportToCSV, downloadCSV } from './exportToCSV.js'
import { exportToExcel, downloadExcel } from './exportToExcel.js'
import { exportToPDF, downloadPDF } from './exportToPDF.js'
import { generateFileName, sanitizeFileName } from './exportFileNameGenerator.js'

/**
 * 통합 내보내기 함수
 * @param {Object} params - 내보내기 파라미터
 * @param {Array<Object>} params.data - 내보낼 데이터 배열
 * @param {Array<string>} params.columns - 선택된 열 이름 배열
 * @param {Array<Object>} params.columnDefinitions - 열 정의 배열 (label 포함)
 * @param {string} params.format - 'csv' | 'excel' | 'pdf'
 * @param {string} params.type - 'selected' | 'filtered' | 'all'
 * @param {number} params.count - 데이터 개수
 * @param {string} params.tableName - 테이블 이름 (선택사항)
 * @param {Object} params.options - 형식별 옵션 (csv, excel, pdf)
 * @param {Object} params.formattingOptions - 포맷팅 옵션
 * @param {Function} params.onProgress - 진행률 콜백 (선택사항)
 * @returns {Promise<void>}
 */
export async function exportData({
  data,
  columns,
  columnDefinitions = [],
  format = 'csv',
  type = 'all',
  count = 0,
  tableName = '',
  options = {},
  formattingOptions = {},
  onProgress = null,
}) {
  try {
    // 진행률 업데이트
    if (onProgress) {
      onProgress({ current: 0, total: 100, message: '데이터 준비 중...' })
    }

    // 파일명 생성
    const fileName = sanitizeFileName(generateFileName(format, type, count, tableName))

    // 진행률 업데이트
    if (onProgress) {
      onProgress({ current: 20, total: 100, message: '데이터 포맷팅 중...' })
    }

    let blob

    // 형식별 내보내기
    switch (format) {
      case 'csv':
        if (onProgress) {
          onProgress({ current: 40, total: 100, message: 'CSV 파일 생성 중...' })
        }
        blob = exportToCSV(data, columns, columnDefinitions, options.csv || {}, formattingOptions)
        if (onProgress) {
          onProgress({ current: 80, total: 100, message: 'CSV 파일 다운로드 중...' })
        }
        downloadCSV(blob, fileName)
        break

      case 'excel':
        if (onProgress) {
          onProgress({ current: 40, total: 100, message: 'Excel 파일 생성 중...' })
        }
        blob = exportToExcel(data, columns, columnDefinitions, options.excel || {}, formattingOptions)
        if (onProgress) {
          onProgress({ current: 80, total: 100, message: 'Excel 파일 다운로드 중...' })
        }
        downloadExcel(blob, fileName)
        break

      case 'pdf':
        if (onProgress) {
          onProgress({ current: 40, total: 100, message: 'PDF 파일 생성 중...' })
        }
        blob = await exportToPDF(data, columns, columnDefinitions, options.pdf || {}, formattingOptions)
        if (onProgress) {
          onProgress({ current: 80, total: 100, message: 'PDF 파일 다운로드 중...' })
        }
        downloadPDF(blob, fileName)
        break

      default:
        throw new Error(`지원하지 않는 형식입니다: ${format}`)
    }

    // 완료
    if (onProgress) {
      onProgress({ current: 100, total: 100, message: '완료' })
    }

    return { success: true, fileName }
  } catch (error) {
    console.error('내보내기 오류:', error)
    throw error
  }
}

// 개별 함수 export
export { exportToCSV, downloadCSV } from './exportToCSV.js'
export { exportToExcel, downloadExcel } from './exportToExcel.js'
export { exportToPDF, downloadPDF } from './exportToPDF.js'
export { generateFileName, sanitizeFileName } from './exportFileNameGenerator.js'
export * from './exportFormatter.js'

