/**
 * Excel 내보내기 유틸리티
 */

import * as XLSX from 'xlsx'
import { formatDataArray } from './exportFormatter'
import type { ColumnDef } from './exportTypes'
import type { FormattingOptions, ExportExcelOptions } from './exportTypes'

export function exportToExcel(
  data: Record<string, unknown>[],
  columns: string[],
  columnDefinitions: ColumnDef[] = [],
  options: ExportExcelOptions = {},
  formattingOptions: FormattingOptions = {}
): Blob {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('내보낼 데이터가 없습니다.')
  }

  // 데이터 포맷팅
  const formattedData = formatDataArray(data, columns, formattingOptions)

  // 워크북 생성
  const workbook = XLSX.utils.book_new()

  const sheetSplit = (options.sheetSplit ?? 'none') as string

  if (sheetSplit === 'none') {
    const worksheet = createWorksheet(formattedData, columns, columnDefinitions, options)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  } else {
    const groupedData = groupDataByField(data, formattedData, sheetSplit, columns)
    const groupRecord = groupedData as Record<string, Record<string, string>[]>
    Object.keys(groupRecord).forEach((groupName: string) => {
      const groupData = groupRecord[groupName]
      const worksheet = createWorksheet(groupData, columns, columnDefinitions, options)
      // 시트 이름은 31자 제한
      const sheetName = groupName.length > 31 ? groupName.substring(0, 31) : groupName
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    })
  }

  // Excel 파일 생성
  const excelBuffer = XLSX.write(workbook, {
    type: 'array',
    bookType: 'xlsx',
    cellStyles: true,
  })

  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

/**
 * 워크시트 생성
 * @param {Array<Object>} formattedData - 포맷팅된 데이터
 * @param {Array<string>} columns - 열 이름 배열
 * @param {Array<Object>} columnDefinitions - 열 정의 배열
 * @param {Object} options - Excel 옵션
 * @returns {Object} XLSX 워크시트 객체
 */
function createWorksheet(
  formattedData: Record<string, string>[],
  columns: string[],
  columnDefinitions: ColumnDef[],
  options: ExportExcelOptions
): XLSX.WorkSheet {
  const getColumnLabel = (colName: string): string => {
    const colDef = columnDefinitions.find((col: ColumnDef) => col.name === colName)
    return colDef?.label ?? colName
  }

  const headers = columns.map((colName: string) => getColumnLabel(colName))

  const rows = formattedData.map((row: Record<string, string>) => {
    return columns.map((colName: string) => row[colName] ?? '')
  })

  // 워크시트 데이터 생성
  const worksheetData = [headers, ...rows]

  // 워크시트 생성
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

  const styling = options.styling as { autoWidth?: boolean } | undefined
  if (styling?.autoWidth !== false) {
    const colWidths = columns.map((colName: string) => {
      const headerLength = getColumnLabel(colName).length
      const maxDataLength = Math.max(
        ...formattedData.map((row: Record<string, string>) => String(row[colName] ?? '').length),
        10
      )
      return { wch: Math.max(headerLength, maxDataLength, 10) }
    })
    ;(worksheet as XLSX.WorkSheet & { '!cols'?: unknown[] })['!cols'] = colWidths
  }

  // 스타일링 옵션 (XLSX는 기본 스타일링만 지원, 고급 스타일링은 exceljs 필요)
  // 현재는 기본 스타일링만 적용

  return worksheet
}

/**
 * 데이터 그룹화
 * @param {Array<Object>} originalData - 원본 데이터
 * @param {Array<Object>} formattedData - 포맷팅된 데이터
 * @param {string} splitType - 'category' | 'status'
 * @param {Array<string>} columns - 선택된 열 이름 배열
 * @returns {Object} 그룹화된 데이터 { groupName: [data] }
 */
function groupDataByField(
  originalData: Record<string, unknown>[],
  formattedData: Record<string, string>[],
  splitType: string,
  columns: string[]
): Record<string, Record<string, string>[]> {
  const grouped: Record<string, Record<string, string>[]> = {}

  let groupField: string | null = null
  if (splitType === 'category') {
    groupField = 'category' // 부품 분류의 경우 'category' 필드 사용
  } else if (splitType === 'status') {
    // 상태 필드는 테이블마다 다를 수 있으므로 'is_active' 또는 다른 필드 사용
    groupField = 'is_active'
  }

  if (!groupField || !columns.includes(groupField)) {
    return { 전체: formattedData }
  }

  // 그룹화
  formattedData.forEach((row: Record<string, string>, index: number) => {
    const groupValue = (originalData[index] as Record<string, unknown>)?.[groupField]
    let groupName = '기타'

    if (groupField === 'category') {
      groupName = groupValue != null && typeof groupValue === 'string' ? groupValue : '기타'
    } else if (groupField === 'is_active') {
      groupName = groupValue === 1 || groupValue === true ? '활성' : '비활성'
    } else {
      groupName = groupValue != null && typeof groupValue === 'string' ? groupValue : '기타'
    }

    if (!grouped[groupName]) {
      grouped[groupName] = []
    }
    grouped[groupName]!.push(row)
  })

  return grouped
}

/**
 * Excel 다운로드
 * @param {Blob} blob - Excel Blob 객체
 * @param {string} fileName - 파일명
 */
export function downloadExcel(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

