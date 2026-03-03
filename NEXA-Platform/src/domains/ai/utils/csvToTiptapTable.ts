/**
 * CSV → Tiptap Table HTML 변환
 * [NEXA-AI-07] Phase 2: UniversalViewer의 parseCsv 활용, 행 제한 3000
 */

import { parseCsv, countCsvRows, MAX_CSV_DISPLAY_ROWS } from '@system/utils/parseCsv'

function escapeCell(text: string): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * CSV 원문 → Tiptap Table HTML
 * @param raw CSV 텍스트
 * @returns { html, totalRows, displayRows } - totalRows > MAX 이면 caption에 표시
 */
export function csvToTiptapTableHtml(raw: string): {
  html: string
  totalRows: number
  displayRows: number
} {
  const totalRows = countCsvRows(raw)
  const rows = parseCsv(raw, MAX_CSV_DISPLAY_ROWS)
  const displayRows = rows.length

  if (rows.length === 0) {
    return {
      html: '<p>데이터가 없습니다.</p>',
      totalRows,
      displayRows: 0,
    }
  }

  const maxCols = Math.max(...rows.map((r) => r.length), rows[0].length)
  const header = rows[0]
  let table = '<table><thead><tr>'
  for (let j = 0; j < maxCols; j++) {
    const cell = escapeCell(header[j] ?? '')
    table += `<th><p>${cell}</p></th>`
  }
  table += '</tr></thead><tbody>'

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    table += '<tr>'
    for (let j = 0; j < maxCols; j++) {
      const cell = escapeCell(row[j] ?? '')
      table += `<td><p>${cell}</p></td>`
    }
    table += '</tr>'
  }

  table += '</tbody></table>'

  if (totalRows > displayRows) {
    table += `<p class="media-filename" style="text-align:center">표시 제한: ${displayRows}행 (전체 ${totalRows}행)</p>`
  }

  return { html: table, totalRows, displayRows }
}
