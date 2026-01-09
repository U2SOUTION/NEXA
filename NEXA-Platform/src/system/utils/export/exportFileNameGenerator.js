/**
 * 파일명 생성 유틸리티
 */

/**
 * 파일명 생성
 * @param {string} format - 'csv' | 'excel' | 'pdf'
 * @param {string} type - 'selected' | 'filtered' | 'all'
 * @param {number} count - 데이터 개수
 * @param {string} tableName - 테이블 이름 (선택사항)
 * @returns {string} 생성된 파일명
 */
export function generateFileName(format = 'csv', type = 'all', count = 0, tableName = '') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5) // YYYY-MM-DDTHH-MM-SS

  // 형식 확장자
  const extensions = {
    csv: 'csv',
    excel: 'xlsx',
    pdf: 'pdf',
  }
  const extension = extensions[format] || 'csv'

  // 타입 라벨
  const typeLabels = {
    selected: '선택항목',
    filtered: '필터결과',
    all: '전체',
  }
  const typeLabel = typeLabels[type] || '전체'

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
export function sanitizeFileName(fileName) {
  // Windows/Unix에서 문제가 되는 문자 제거
  return fileName.replace(/[<>:"/\\|?*]/g, '_')
}


