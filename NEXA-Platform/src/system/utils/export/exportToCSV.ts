/**
 * CSV 내보내기 유틸리티
 */

import { formatDataArray } from './exportFormatter'
import type { ColumnDef } from './exportTypes'
import type { FormattingOptions, ExportCsvOptions } from './exportTypes'

const DELIMITERS: Record<'comma' | 'semicolon' | 'tab', string> = {
  comma: ',',
  semicolon: ';',
  tab: '\t',
}

export function exportToCSV(
  data: Record<string, unknown>[],
  columns: string[],
  columnDefinitions: ColumnDef[] = [],
  options: ExportCsvOptions = {},
  formattingOptions: FormattingOptions = {}
): Blob {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('내보낼 데이터가 없습니다.')
  }

  // 데이터 포맷팅
  const formattedData = formatDataArray(data, columns, formattingOptions)

  // 구분자 설정
  const delimiter = (options.delimiter && DELIMITERS[options.delimiter]) || ','

  // 열 정의에서 라벨 가져오기
  const getColumnLabel = (colName: string): string => {
    const colDef = columnDefinitions.find((col) => col.name === colName)
    return colDef?.label || colName
  }

  // 헤더 행 생성
  const headers = columns.map((colName) => getColumnLabel(colName))
  const headerRow = headers.map((header) => escapeCSVValue(header)).join(delimiter)

  // 데이터 행 생성
  const dataRows = formattedData.map((row) => {
    return columns.map((colName) => escapeCSVValue(row[colName] || '')).join(delimiter)
  })

  // CSV 내용 생성
  const csvContent = [headerRow, ...dataRows].join('\n')

  // 인코딩 처리
  const encoding = options.encoding || 'utf8bom'
  let blob

  if (encoding === 'utf8bom') {
    // UTF-8 with BOM (Excel 호환)
    const BOM = '\uFEFF'
    blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  } else if (encoding === 'utf8') {
    blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  } else {
    // EUC-KR, CP949는 브라우저에서 직접 지원하지 않으므로 UTF-8로 처리
    // 서버 사이드 변환이 필요한 경우 별도 처리 필요
    blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  }

  return blob
}

/**
 * CSV 값 이스케이프 처리
 * @param {unknown} value - 값
 * @returns {string} 이스케이프된 CSV 값
 */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) return ''

  const str = String(value)

  // 줄바꿈 처리
  const processed = str.replace(/\r\n/g, ' ').replace(/\n/g, ' ').replace(/\r/g, ' ')

  // 쉼표, 따옴표가 있으면 따옴표로 감싸고 내부 따옴표는 두 개로
  if (processed.includes(',') || processed.includes('"') || processed.includes('\n')) {
    return `"${processed.replace(/"/g, '""')}"`
  }

  return processed
}

/**
 * CSV 다운로드
 * @param {Blob} blob - CSV Blob 객체
 * @param {string} fileName - 파일명
 */
export function downloadCSV(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}


