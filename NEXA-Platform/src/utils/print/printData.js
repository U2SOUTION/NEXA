/**
 * 데이터 인쇄 유틸리티
 * 브라우저 인쇄 API를 사용하여 데이터를 인쇄
 */

import { formatDataArray } from '../export/exportFormatter.js'

/**
 * 인쇄용 HTML 생성
 * @param {Object} params - 인쇄 파라미터
 * @param {Array<Object>} params.data - 인쇄할 데이터
 * @param {Array<Object>} params.columns - 열 정의 (name, label 포함)
 * @param {Array<string>} params.selectedColumns - 선택된 열 이름 배열
 * @param {Object} params.options - 인쇄 옵션
 * @param {Object} params.formattingOptions - 포맷팅 옵션
 * @returns {string} 인쇄용 HTML 문자열
 */
export function generatePrintHTML({
  data,
  columns,
  selectedColumns,
  options = {},
  formattingOptions = {},
}) {
  // 선택된 열만 필터링
  const visibleColumns = columns.filter((col) => selectedColumns.includes(col.name))

  // 데이터 포맷팅
  const formattedData = formatDataArray(data, selectedColumns, formattingOptions)

  // 헤더 HTML
  let headerHTML = ''
  if (options.header?.show) {
    const title = options.header.title || '부품 분류 목록'
    const date = options.header.showDate ? new Date().toLocaleDateString('ko-KR') : ''
    headerHTML = `
      <div class="print-header-section">
        <div class="print-header-title">${title}</div>
        ${date ? `<div class="print-header-date">${date}</div>` : ''}
      </div>
    `
  }

  // 테이블 HTML
  const tableRows = formattedData
    .map((row) => {
      const cells = visibleColumns
        .map((col) => {
          const value = row[col.name] || ''
          return `<td>${escapeHtml(String(value))}</td>`
        })
        .join('')
      return `<tr>${cells}</tr>`
    })
    .join('')

  const tableHeaders = visibleColumns
    .map((col) => `<th>${escapeHtml(col.label || col.name)}</th>`)
    .join('')

  // 푸터 HTML
  let footerHTML = ''
  if (options.footer?.show) {
    const pageNumber = options.footer.pageNumber
      ? '<span class="print-footer-page">페이지 <span class="page-number"></span></span>'
      : ''
    const date = options.footer.showDate
      ? `<span class="print-footer-date">${new Date().toLocaleDateString('ko-KR')}</span>`
      : ''
    footerHTML = `
      <div class="print-footer-section">
        ${pageNumber}
        ${date}
      </div>
    `
  }

  // Vue 반응형 객체를 문자열로 변환하는 헬퍼 함수
  const toPlainString = (value, defaultValue) => {
    if (typeof value === 'string') {
      return value
    } else if (value && typeof value === 'object') {
      // Vue 반응형 객체인 경우 실제 값 추출
      return value.value || String(value) || defaultValue
    } else {
      return value || defaultValue
    }
  }

  // 폰트 크기 설정
  const fontSizeMap = {
    small: '10px',
    medium: '12px',
    large: '14px',
    xlarge: '16px',
  }
  const fontSizeValue = String(toPlainString(options.style?.fontSize, 'medium'))
  const fontSize = fontSizeMap[fontSizeValue] || '12px'

  // 보더 두께 설정
  const borderWidthMap = {
    thin: '1px',
    medium: '2px',
    thick: '3px',
  }
  const borderWidthValue = String(toPlainString(options.style?.borderWidth, 'thin'))
  const borderWidth = borderWidthMap[borderWidthValue] || '1px'

  // 셀 간격 설정
  const cellPaddingMap = {
    small: '4px',
    medium: '8px',
    large: '12px',
  }
  const cellPaddingValue = String(toPlainString(options.style?.cellPadding, 'medium'))
  const cellPadding = cellPaddingMap[cellPaddingValue] || '8px'

  // 텍스트 정렬 설정
  const textAlign = options.style?.textAlign || 'left'

  // 워터마크 설정
  const watermarkText =
    options.watermark?.text === 'custom'
      ? options.watermark?.customText || ''
      : options.watermark?.text === 'confidential'
        ? '비밀'
        : '초안'
  const watermarkPosition = options.watermark?.position || 'center'
  const watermarkOpacity = options.watermark?.opacity || 30

  // 전체 HTML 생성 (변수들을 명시적으로 사용)
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>인쇄</title>
  <style>
    @page {
      size: ${options.paperSize === 'a3' ? 'A3' : options.paperSize === 'letter' ? 'Letter' : 'A4'} ${options.orientation || 'portrait'};
      margin: 20mm;
      counter-increment: page;
    }

    @page:first {
      counter-reset: page 1;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Noto Sans KR', 'Malgun Gothic', sans-serif;
      font-size: ${fontSize};
      color: #000;
      background: #fff;
      line-height: 1.5;
    }

    .print-header-section {
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #000;
    }

    .print-header-title {
      font-size: ${parseInt(fontSize) + 4}px;
      font-weight: ${options.style?.headerBold ? '700' : '600'};
      margin-bottom: 8px;
    }

    .print-header-date {
      font-size: ${parseInt(fontSize) - 2}px;
      color: #666;
    }

    .print-table-container {
      width: 100%;
      overflow: visible;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: ${fontSize};
    }

    th {
      background-color: ${options.style?.alternateRows ? '#f0f0f0' : '#fff'};
      color: #000;
      font-weight: ${options.style?.headerBold ? '700' : '600'};
      font-size: ${fontSize};
      padding: ${cellPadding};
      text-align: ${textAlign};
      ${options.style?.showBorders !== false ? `border: ${borderWidth} solid #000;` : 'border: none;'}
    }

    td {
      font-size: ${fontSize};
      padding: ${cellPadding};
      text-align: ${textAlign};
      ${options.style?.showBorders !== false ? `border: ${borderWidth} solid #ccc;` : 'border: none;'}
    }

    tbody tr:nth-child(even) {
      background-color: ${options.style?.alternateRows ? '#f5f5f5' : 'transparent'};
    }

    .print-footer-section {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #ccc;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: ${parseInt(fontSize) - 4}px;
      color: #666;
    }

    .print-footer-page {
      flex: 1;
      text-align: center;
    }

    .print-footer-date {
      flex: 1;
      text-align: right;
    }

    .page-number::after {
      content: counter(page);
    }

    ${
      options.watermark?.show
        ? `
    .print-watermark {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 72px;
      font-weight: bold;
      color: rgba(0, 0, 0, ${watermarkOpacity / 100});
      opacity: ${watermarkOpacity / 100};
      transform: rotate(-45deg);
    }

    .print-watermark.top-left {
      align-items: flex-start;
      justify-content: flex-start;
      padding: 50px;
    }

    .print-watermark.top-right {
      align-items: flex-start;
      justify-content: flex-end;
      padding: 50px;
    }

    .print-watermark.bottom-left {
      align-items: flex-end;
      justify-content: flex-start;
      padding: 50px;
    }

    .print-watermark.bottom-right {
      align-items: flex-end;
      justify-content: flex-end;
      padding: 50px;
    }
    `
        : ''
    }

    @media print {
      body {
        ${
          options.color === 'grayscale'
            ? 'filter: grayscale(100%); -webkit-filter: grayscale(100%);'
            : '-webkit-print-color-adjust: exact; print-color-adjust: exact;'
        }
      }

      ${
        options.color === 'grayscale'
          ? `
      * {
        filter: grayscale(100%) !important;
        -webkit-filter: grayscale(100%) !important;
      }
      `
          : ''
      }

      .no-print {
        display: none !important;
      }

      @page {
        margin: 20mm;
        counter-increment: page;
      }

      @page:first {
        counter-reset: page 1;
      }

      table {
        page-break-inside: auto;
      }

      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }

      thead {
        display: table-header-group;
      }

      tfoot {
        display: table-footer-group;
      }
    }
  </style>
</head>
<body>
  ${options.watermark?.show ? `<div class="print-watermark ${watermarkPosition}">${escapeHtml(watermarkText)}</div>` : ''}
  ${headerHTML}
  <div class="print-table-container">
    <table>
      <thead>
        <tr>${tableHeaders}</tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  </div>
  ${footerHTML}
</body>
</html>
  `

  return html
}

/**
 * HTML 특수 문자 이스케이프
 * @param {string} text - 이스케이프할 텍스트
 * @returns {string} 이스케이프된 텍스트
 */
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * 데이터 인쇄 실행
 * @param {Object} params - 인쇄 파라미터
 * @param {Array<Object>} params.data - 인쇄할 데이터
 * @param {Array<Object>} params.columnDefinitions - 열 정의 배열
 * @param {Array<string>} params.columns - 선택된 열 이름 배열
 * @param {Object} params.options - 인쇄 옵션
 * @param {Object} params.formattingOptions - 포맷팅 옵션
 * @param {Function} params.onWindowOpen - 인쇄 창이 열릴 때 호출될 콜백 함수
 * @param {Function} params.onClose - 인쇄 창이 닫힐 때 호출될 콜백 함수
 */
export function printData({
  data,
  columnDefinitions,
  columns,
  options = {},
  formattingOptions = {},
  onWindowOpen,
  onClose,
}) {
  try {
    if (!data || data.length === 0) {
      console.warn('인쇄할 데이터가 없습니다.')
      if (onClose) {
        onClose()
      }
      return
    }

    // 인쇄용 HTML 생성
    const html = generatePrintHTML({
      data,
      columns: columnDefinitions,
      selectedColumns: columns,
      options,
      formattingOptions,
    })

    // 새 창 열기 (더 큰 크기로 설정)
    const printWindow = window.open(
      '',
      '_blank',
      'width=1200,height=900,scrollbars=yes,resizable=yes',
    )

    if (!printWindow) {
      console.error('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.')
      if (onClose) {
        onClose()
      }
      return
    }

    // HTML 작성
    printWindow.document.write(html)
    printWindow.document.close()

    // 인쇄 창이 열렸음을 알림
    if (onWindowOpen) {
      onWindowOpen()
    }

    // 인쇄 대화상자 열기 (약간의 지연 후)
    printWindow.onload = () => {
      setTimeout(() => {
        try {
          printWindow.print()
        } catch (error) {
          console.error('인쇄 대화상자 열기 오류:', error)
          if (onClose) {
            onClose()
          }
        }
      }, 250)
    }

    // 인쇄 창이 닫힐 때 감지하여 콜백 호출
    const checkClosed = setInterval(() => {
      if (printWindow.closed) {
        clearInterval(checkClosed)
        if (onClose) {
          onClose()
        }
      }
    }, 100)

    // 인쇄 대화상자가 닫힌 후에도 창이 열려있을 수 있으므로
    // beforeunload 이벤트로도 감지
    printWindow.addEventListener('beforeunload', () => {
      clearInterval(checkClosed)
      if (onClose) {
        onClose()
      }
    })

    // 에러 발생 시 처리
    printWindow.addEventListener('error', () => {
      clearInterval(checkClosed)
      if (onClose) {
        onClose()
      }
    })
  } catch (error) {
    console.error('인쇄 처리 오류:', error)
    if (onClose) {
      onClose()
    }
  }
}
