/**
 * 데이터 포맷팅 유틸리티
 * 내보내기 시 데이터를 형식에 맞게 변환
 */

export function formatDate(date: Date | string | null | undefined, format: 'iso' | 'local' | 'excel' = 'iso'): string {
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
export function formatNumber(value: number | string | null | undefined, options: { useThousandSeparator?: boolean; decimalPlaces?: number } = {}): string {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return String(value ?? '')

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
 * @param {unknown} value - 값
 * @param {string} nullValue - 'empty' | 'na' | 'dash'
 * @returns {string} 처리된 값
 */
export function formatNullValue(value: unknown, nullValue: 'empty' | 'na' | 'dash' = 'empty'): string {
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
export function removeHtmlTags(html: string | null | undefined): string {
  if (!html || typeof html !== 'string') return ''
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

import type { FormattingOptions } from './exportTypes'

export function formatDataRow(row: Record<string, unknown>, columns: string[], formattingOptions: FormattingOptions = {}): Record<string, string> {
  const formatted: Record<string, string> = {}
  const {
    dateFormat = 'iso',
    numberFormat = { useThousandSeparator: true, decimalPlaces: 2 },
    nullValue = 'empty',
    removeHtmlTags: shouldRemoveHtmlTags = false,
  } = formattingOptions

  columns.forEach((colName: string) => {
    let value: unknown = row[colName]

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
        formatted[colName] = formatDate(dateValue, (dateFormat as 'local' | 'iso' | 'excel') || 'iso')
        return
      }
    }

    if (typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)) && isFinite(parseFloat(value)))) {
      formatted[colName] = formatNumber(typeof value === 'number' ? value : parseFloat(value as string), numberFormat)
      return
    }

    // 기본값
    formatted[colName] = String(value)
  })

  return formatted
}

export function formatDataArray(data: Record<string, unknown>[], columns: string[], formattingOptions: FormattingOptions = {}): Record<string, string>[] {
  if (!Array.isArray(data)) return []
  return data.map((row: Record<string, unknown>) => formatDataRow(row, columns, formattingOptions))
}

