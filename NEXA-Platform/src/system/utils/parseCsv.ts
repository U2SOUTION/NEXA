/**
 * CSV 파싱 유틸리티
 * UniversalViewer와 Tiptap CSV 삽입에서 공통 사용
 * - 레코드 수 제한: MAX_CSV_DISPLAY_ROWS (큰 파일은 뷰어에서 virtual-scroll 사용)
 */

export const MAX_CSV_DISPLAY_ROWS = 3000

/**
 * CSV 한 줄 파싱 (쌍따옴표, 이스케이프 처리)
 */
export function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      inQuotes = !inQuotes
    } else if (c === ',' && !inQuotes) {
      result.push(current.replace(/^"|"$/g, '').replace(/""/g, '"').trim())
      current = ''
    } else {
      current += c
    }
  }
  result.push(current.replace(/^"|"$/g, '').replace(/""/g, '"').trim())
  return result
}

/**
 * CSV 텍스트 전체 파싱 → 2차원 배열
 * @param raw CSV 원문
 * @param maxRows 최대 행 수 (기본 MAX_CSV_DISPLAY_ROWS), 0이면 제한 없음
 */
export function parseCsv(raw: string, maxRows = MAX_CSV_DISPLAY_ROWS): string[][] {
  if (!raw || !raw.trim()) return []
  const lines = raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((l) => l.trim())
  if (lines.length === 0) return []
  const all = lines.map((line) => parseCsvLine(line))
  return maxRows > 0 ? all.slice(0, maxRows) : all
}

/**
 * CSV 전체 행 수 (파싱 제한 없이)
 */
export function countCsvRows(raw: string): number {
  if (!raw || !raw.trim()) return 0
  const lines = raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((l) => l.trim())
  return lines.length
}
