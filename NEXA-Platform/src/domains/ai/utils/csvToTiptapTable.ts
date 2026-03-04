/**
 * CSV → Tiptap Table HTML 변환
 * [NEXA-AI-07] Phase 2: UniversalViewer의 parseCsv 활용, 행 제한 3000
 *
 * ## CSV 뷰 전략 (Tiptap vs UniversalViewer)
 *
 * - **Tiptap**: HTML <table>로 삽입. 가상 스크롤 없음 → 행 수 많으면 DOM/렌더 부담.
 * - **UniversalViewer**: Quasar q-table + virtual-scroll → 수만 행도 가볍게 표시.
 *
 * 현재는 Tiptap 표시를 기본으로 유지. CSV는 특수 케이스라 대부분 행 수가 적어
 * Tiptap에서 무리 없이 동작할 것으로 예상.
 *
 * ## UniversalViewer로 전환하고 싶을 때
 *
 * 1. AiContent.vue injectCsvToEditor() 내부에서:
 *    - totalRows > MAX_CSV_DISPLAY_ROWS (또는 사용자 설정) 일 때
 *    - setSelectedFile(file) 후 showPanel('sense') 호출
 * 2. useFileSelection import 복원 필요
 *
 * ## 향후: 사용자 설정으로 선택
 *
 * - preferCsvView: 'tiptap' | 'viewer' | 'auto'
 *   - tiptap: 항상 에디터에 삽입
 *   - viewer: 항상 UniversalViewer (virtual-scroll)
 *   - auto: 행 수 기준으로 자동 선택 (예: 500행 이하 → Tiptap, 초과 → viewer)
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
  let table = '<table class="nexa-data-table"><thead><tr>'
  for (let j = 0; j < maxCols; j++) {
    const raw = String(header[j] ?? '')
    const cell = escapeCell(raw)
    table += `<th title="${cell}"><p>${cell}</p></th>`
  }
  table += '</tr></thead><tbody>'

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    table += '<tr>'
    for (let j = 0; j < maxCols; j++) {
      const raw = String(row[j] ?? '')
      const cell = escapeCell(raw)
      table += `<td title="${cell}"><p>${cell}</p></td>`
    }
    table += '</tr>'
  }

  table += '</tbody></table>'

  if (totalRows > displayRows) {
    table += `<p class="media-filename" style="text-align:center">표시 제한: ${displayRows}행 (전체 ${totalRows}행)</p>`
  }

  return { html: table, totalRows, displayRows }
}

/**
 * 2차원 배열(첫 행 헤더) → Tiptap Table HTML
 * Phase 4: xlsx 등에서 사용
 */
export function rowsToTiptapTableHtml(rows: string[][]): string {
  if (!rows?.length) return '<p>No data</p>'
  const maxCols = Math.max(...rows.map((r) => r.length), rows[0].length)
  const header = rows[0]
  let table = '<table class="nexa-data-table"><thead><tr>'
  for (let j = 0; j < maxCols; j++) {
    const raw = String(header[j] ?? '')
    const cell = escapeCell(raw)
    table += `<th title="${cell}"><p>${cell}</p></th>`
  }
  table += '</tr></thead><tbody>'
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    table += '<tr>'
    for (let j = 0; j < maxCols; j++) {
      const raw = String(row[j] ?? '')
      const cell = escapeCell(raw)
      table += `<td title="${cell}"><p>${cell}</p></td>`
    }
    table += '</tr>'
  }
  table += '</tbody></table>'
  return table
}
