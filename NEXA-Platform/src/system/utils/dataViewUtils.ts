/**
 * 데이터 뷰 관련 유틸리티 함수
 * 모든 뷰 모드(테이블, 카드, 리스트 등)에서 공통으로 사용하는 유틸리티 함수
 */

/**
 * 행 번호 계산 함수 (동적 페이징 대응)
 * 주의: Quasar 테이블의 props.rowIndex는 전체 데이터 배열에서의 인덱스(0-based)이므로,
 * 페이지 내 인덱스가 아닌 rowIndex + 1을 사용해야 함
 *
 * @param {number} rowIndex - 전체 데이터 배열에서의 인덱스 (0-based)
 * @returns {number} 행 번호 (1-based)
 */
export function getRowNumber(rowIndex: number): number {
  return rowIndex + 1
}

/**
 * 페이징을 고려한 행 번호 계산 함수
 * 모든 뷰 모드(테이블, 카드, 리스트 등)에서 공통 사용
 *
 * @param {number} pageIndex - 현재 페이지 내 인덱스 (0-based)
 * @param {Object|null} pagination - 페이징 정보 { page: number, rowsPerPage: number }
 * @returns {string} 전체 데이터 기준 행 번호 (1-based) + "No." 접두사
 *
 * @example
 * // 페이지 2, 페이지당 10개, 페이지 내 3번째 항목 (인덱스 2)
 * getRowNumberWithPagination(2, { page: 2, rowsPerPage: 10 }) // "No. 13"
 *
 * // 페이징 없을 때
 * getRowNumberWithPagination(2, null) // "No. 3"
 */
export function getRowNumberWithPagination(pageIndex: number, pagination: { page: number; rowsPerPage: number } | null): string {
  let rowNumber
  if (!pagination || typeof pagination.page !== 'number' || typeof pagination.rowsPerPage !== 'number') {
    // 페이징 정보가 없으면 단순 인덱스 + 1
    rowNumber = pageIndex + 1
  } else {
    // 페이징 고려: (페이지 - 1) * 페이지당 행 수 + 페이지 내 인덱스 + 1
    rowNumber = (pagination.page - 1) * pagination.rowsPerPage + pageIndex + 1
  }
  return `No. ${rowNumber}`
}

/**
 * 날짜 시간 포맷팅
 *
 * @param {string} dateTimeString - ISO 날짜 시간 문자열
 * @returns {string} 포맷된 날짜 시간 문자열 (YYYY-MM-DD HH:mm:ss)
 */
export function formatDateTime(dateTimeString: string): string {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

