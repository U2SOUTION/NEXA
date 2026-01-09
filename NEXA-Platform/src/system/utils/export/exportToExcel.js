/**
 * Excel 내보내기 유틸리티
 */

import * as XLSX from 'xlsx'
import { formatDataArray } from './exportFormatter.js'

/**
 * Excel 내보내기
 * @param {Array<Object>} data - 내보낼 데이터 배열
 * @param {Array<string>} columns - 선택된 열 이름 배열
 * @param {Array<Object>} columnDefinitions - 열 정의 배열 (label 포함)
 * @param {Object} options - Excel 옵션
 * @param {Object} formattingOptions - 포맷팅 옵션
 * @returns {Blob} Excel Blob 객체
 */
export function exportToExcel(data, columns, columnDefinitions = [], options = {}, formattingOptions = {}) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('내보낼 데이터가 없습니다.')
  }

  // 데이터 포맷팅
  const formattedData = formatDataArray(data, columns, formattingOptions)

  // 워크북 생성
  const workbook = XLSX.utils.book_new()

  // 시트 분리 옵션 처리
  const sheetSplit = options.sheetSplit || 'none'

  if (sheetSplit === 'none') {
    // 단일 시트
    const worksheet = createWorksheet(formattedData, columns, columnDefinitions, options)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  } else {
    // 시트 분리 (카테고리별 또는 상태별)
    const groupedData = groupDataByField(data, formattedData, sheetSplit)
    Object.keys(groupedData).forEach((groupName) => {
      const groupData = groupedData[groupName]
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
function createWorksheet(formattedData, columns, columnDefinitions, options) {
  // 열 정의에서 라벨 가져오기
  const getColumnLabel = (colName) => {
    const colDef = columnDefinitions.find((col) => col.name === colName)
    return colDef?.label || colName
  }

  // 헤더 행 생성
  const headers = columns.map((colName) => getColumnLabel(colName))

  // 데이터 행 생성 (열 순서대로)
  const rows = formattedData.map((row) => {
    return columns.map((colName) => row[colName] || '')
  })

  // 워크시트 데이터 생성
  const worksheetData = [headers, ...rows]

  // 워크시트 생성
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

  // 열 너비 자동 조정
  if (options.styling?.autoWidth !== false) {
    const colWidths = columns.map((colName) => {
      const headerLength = getColumnLabel(colName).length
      const maxDataLength = Math.max(
        ...formattedData.map((row) => String(row[colName] || '').length),
        10, // 최소 너비
      )
      return { wch: Math.max(headerLength, maxDataLength, 10) }
    })
    worksheet['!cols'] = colWidths
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
function groupDataByField(originalData, formattedData, splitType, columns) {
  const grouped = {}

  // 그룹 필드 결정
  let groupField = null
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
  formattedData.forEach((row, index) => {
    const groupValue = originalData[index]?.[groupField]
    let groupName = '기타'

    if (groupField === 'category') {
      groupName = groupValue || '기타'
    } else if (groupField === 'is_active') {
      groupName = groupValue === 1 || groupValue === true ? '활성' : '비활성'
    } else {
      groupName = groupValue || '기타'
    }

    if (!grouped[groupName]) {
      grouped[groupName] = []
    }
    grouped[groupName].push(row)
  })

  return grouped
}

/**
 * Excel 다운로드
 * @param {Blob} blob - Excel Blob 객체
 * @param {string} fileName - 파일명
 */
export function downloadExcel(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

