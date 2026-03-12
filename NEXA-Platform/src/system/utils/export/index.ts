/**
 * 내보내기 유틸리티 통합
 */

import { exportToCSV, downloadCSV } from './exportToCSV'
import { exportToExcel, downloadExcel } from './exportToExcel'
import { exportToPDF, downloadPDF } from './exportToPDF'
import { generateFileName, sanitizeFileName, type ExportFormat, type ExportScope } from './exportFileNameGenerator'
import type { FormattingOptions, ExportCsvOptions, ExportExcelOptions, ExportPdfOptions } from './exportTypes'

export interface ExportDataParams {
  data: Record<string, unknown>[]
  columns: string[]
  columnDefinitions?: import('./exportTypes').ColumnDef[]
  format?: ExportFormat
  type?: ExportScope
  count?: number
  tableName?: string
  options?: { csv?: ExportCsvOptions; excel?: ExportExcelOptions; pdf?: ExportPdfOptions }
  formattingOptions?: FormattingOptions
  onProgress?: ((progress: { current: number; total: number; message: string }) => void) | null
}

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
}: ExportDataParams): Promise<{ success: boolean; fileName: string }> {
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

    let blob: Blob
    const opts = options ?? {}
    switch (format) {
      case 'csv':
        if (onProgress) onProgress({ current: 40, total: 100, message: 'CSV 파일 생성 중...' })
        blob = exportToCSV(data, columns, columnDefinitions, opts.csv ?? {}, formattingOptions ?? {})
        if (onProgress) {
          onProgress({ current: 80, total: 100, message: 'CSV 파일 다운로드 중...' })
        }
        downloadCSV(blob, fileName)
        break

      case 'excel':
        if (onProgress) onProgress({ current: 40, total: 100, message: 'Excel 파일 생성 중...' })
        blob = exportToExcel(data, columns, columnDefinitions, opts.excel ?? {}, formattingOptions ?? {})
        if (onProgress) {
          onProgress({ current: 80, total: 100, message: 'Excel 파일 다운로드 중...' })
        }
        downloadExcel(blob, fileName)
        break

      case 'pdf':
        if (onProgress) onProgress({ current: 40, total: 100, message: 'PDF 파일 생성 중...' })
        blob = await exportToPDF(data, columns, columnDefinitions, opts.pdf ?? {}, formattingOptions ?? {})
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
export { exportToCSV, downloadCSV } from './exportToCSV'
export { exportToExcel, downloadExcel } from './exportToExcel'
export { exportToPDF, downloadPDF } from './exportToPDF'
export { generateFileName, sanitizeFileName } from './exportFileNameGenerator'
export * from './exportFormatter'

