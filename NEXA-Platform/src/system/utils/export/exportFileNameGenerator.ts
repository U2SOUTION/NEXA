/**
 * 파일명 생성 유틸리티
 */

export type ExportFormat = 'csv' | 'excel' | 'pdf'
export type ExportScope = 'selected' | 'filtered' | 'all'

const EXTENSIONS: Record<ExportFormat, string> = {
  csv: 'csv',
  excel: 'xlsx',
  pdf: 'pdf',
}

const TYPE_LABELS: Record<ExportScope, string> = {
  selected: '선택항목',
  filtered: '필터결과',
  all: '전체',
}

export function generateFileName(format: ExportFormat = 'csv', type: ExportScope = 'all', count = 0, tableName = ''): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)

  const extension = EXTENSIONS[format] ?? 'csv'
  const typeLabel = TYPE_LABELS[type] ?? '전체'

  // 테이블 이름 (있는 경우)
  const tableLabel = tableName ? `${tableName}_` : ''

  // 파일명 구성: 테이블명_타입_개수_타임스탬프.확장자
  const fileName = `${tableLabel}${typeLabel}_${count}개_${timestamp}.${extension}`

  return fileName
}

/**
 * 안전한 파일명 생성 (특수문자 제거)
 * @param {string} fileName - 원본 파일명
 * @returns {string} 안전한 파일명
 */
export function sanitizeFileName(fileName: string): string {
  // Windows/Unix에서 문제가 되는 문자 제거
  return fileName.replace(/[<>:"/\\|?*]/g, '_')
}


