/**
 * 데이터 포맷팅 유틸리티
 * 내보내기 시 데이터를 형식에 맞게 변환
 */

/**
 * 날짜 형식 변환
 * @param {Date|string} date - 날짜 값
 * @param {string} format - 'iso' | 'local' | 'excel'
 * @returns {string} 포맷팅된 날짜 문자열
 */
export function formatDate(date, format = 'iso') {
  if (!date) return ''

  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return String(date || '')

  switch (format) {
    case 'iso':
      return dateObj.toISOString().split('T')[0] // YYYY-MM-DD
    case 'local':
      return dateObj.toLocaleDateString('ko-KR')
    case 'excel': {
      // Excel 날짜 형식: YYYY-MM-DD HH:MM:SS
      const year = dateObj.getFullYear()
      const month = String(dateObj.getMonth() + 1).padStart(2, '0')
      const day = String(dateObj.getDate()).padStart(2, '0')
      const hours = String(dateObj.getHours()).padStart(2, '0')
      const minutes = String(dateObj.getMinutes()).padStart(2, '0')
      const seconds = String(dateObj.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
    default:
      return dateObj.toISOString().split('T')[0]
  }
}

/**
 * 숫자 형식 변환
 * @param {number} value - 숫자 값
 * @param {Object} options - { useThousandSeparator: boolean, decimalPlaces: number }
 * @returns {string} 포맷팅된 숫자 문자열
 */
export function formatNumber(value, options = {}) {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return String(value || '')

  const { useThousandSeparator = true, decimalPlaces = 2 } = options

  let formatted = num.toFixed(decimalPlaces)

  if (useThousandSeparator) {
    const parts = formatted.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    formatted = parts.join('.')
  }

  return formatted
}

/**
 * NULL/빈 값 처리
 * @param {any} value - 값
 * @param {string} nullValue - 'empty' | 'na' | 'dash'
 * @returns {string} 처리된 값
 */
export function formatNullValue(value, nullValue = 'empty') {
  if (value === null || value === undefined || value === '') {
    switch (nullValue) {
      case 'na':
        return 'N/A'
      case 'dash':
        return '-'
      case 'empty':
      default:
        return ''
    }
  }
  return String(value)
}

/**
 * HTML 태그 제거
 * @param {string} html - HTML 문자열
 * @returns {string} 태그가 제거된 텍스트
 */
export function removeHtmlTags(html) {
  if (!html || typeof html !== 'string') return ''
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

/**
 * 데이터 행 포맷팅
 * @param {Object} row - 원본 데이터 행
 * @param {Array<string>} columns - 선택된 열 이름 배열
 * @param {Object} formattingOptions - 포맷팅 옵션
 * @returns {Object} 포맷팅된 데이터 행
 */
export function formatDataRow(row, columns, formattingOptions = {}) {
  const formatted = {}
  const {
    dateFormat = 'iso',
    numberFormat = { useThousandSeparator: true, decimalPlaces: 2 },
    nullValue = 'empty',
    removeHtmlTags: shouldRemoveHtmlTags = false,
  } = formattingOptions

  columns.forEach((colName) => {
    let value = row[colName]

    // NULL 처리
    if (value === null || value === undefined || value === '') {
      formatted[colName] = formatNullValue(value, nullValue)
      return
    }

    // HTML 태그 제거
    if (shouldRemoveHtmlTags && typeof value === 'string' && value.includes('<')) {
      value = removeHtmlTags(value)
    }

    // 날짜 형식 변환 (날짜로 보이는 값만)
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      const dateValue = new Date(value)
      if (!isNaN(dateValue.getTime())) {
        formatted[colName] = formatDate(dateValue, dateFormat)
        return
      }
    }

    // 숫자 형식 변환 (숫자로 보이는 값만)
    if (typeof value === 'number' || (!isNaN(parseFloat(value)) && isFinite(value))) {
      formatted[colName] = formatNumber(parseFloat(value), numberFormat)
      return
    }

    // 기본값
    formatted[colName] = String(value)
  })

  return formatted
}

/**
 * 데이터 배열 포맷팅
 * @param {Array<Object>} data - 원본 데이터 배열
 * @param {Array<string>} columns - 선택된 열 이름 배열
 * @param {Object} formattingOptions - 포맷팅 옵션
 * @returns {Array<Object>} 포맷팅된 데이터 배열
 */
export function formatDataArray(data, columns, formattingOptions = {}) {
  if (!Array.isArray(data)) return []
  return data.map((row) => formatDataRow(row, columns, formattingOptions))
}

