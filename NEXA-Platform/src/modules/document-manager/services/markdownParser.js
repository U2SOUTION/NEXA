/**
 * 마크다운 파서
 * 마크다운 텍스트를 HTML로 변환하는 함수들
 */

/**
 * HTML 이스케이프 (순수 JavaScript, 브라우저/Node.js 모두 지원)
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') return text
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

/**
 * 정규식 특수 문자 이스케이프
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 마크다운 테이블 셀 파싱 (첫/마지막 빈 문자열 제거)
 */
function parseTableCells(line) {
  return line
    .split('|')
    .map((cell) => cell.trim())
    .filter((cell, index, array) => {
      // 첫 번째와 마지막 빈 문자열은 제거 (|로 시작/끝나기 때문)
      if (cell === '' && (index === 0 || index === array.length - 1)) {
        return false
      }
      return true
    })
}

/**
 * 테이블 HTML 생성
 */
function buildTableHtml(headerCells, dataLines) {
  // 스트라이프 적용 여부 결정 (로우가 10개 이상일 때만)
  const shouldShowStriped = dataLines.length >= 10
  const tableClass = shouldShowStriped ? 'q-table q-table--flat q-table--bordered q-mb-md markdown-table table-striped' : 'q-table q-table--flat q-table--bordered q-mb-md markdown-table'

  let tableHtml = `<table class="${tableClass}" style="width: 100%; border-collapse: collapse;">`

  // 헤더 행
  tableHtml += '<thead><tr>'
  headerCells.forEach((cell) => {
    const processedCell = escapeHtml(cell || '')
    tableHtml += `<th class="markdown-table-header">${processedCell}</th>`
  })
  tableHtml += '</tr></thead>'

  // 데이터 행
  if (dataLines.length > 0) {
    tableHtml += '<tbody>'
    dataLines.forEach((dataLine) => {
      // 데이터 셀 파싱
      const dataCells = parseTableCells(dataLine)

      // 빈 셀도 포함하여 헤더와 셀 개수 맞추기
      while (dataCells.length < headerCells.length) {
        dataCells.push('')
      }
      if (dataCells.length > headerCells.length) {
        dataCells.splice(headerCells.length)
      }

      // striped 클래스는 CSS에서 처리 (로우 개수에 따라)
      tableHtml += '<tr>'
      dataCells.forEach((cell) => {
        // 별점 등 이모지 보존을 위해 escapeHtml 사용
        const processedCell = escapeHtml(cell || '')
        tableHtml += `<td class="markdown-table-cell">${processedCell}</td>`
      })
      tableHtml += '</tr>'
    })
    tableHtml += '</tbody>'
  }

  tableHtml += '</table>'

  // 테이블 HTML 내부의 강조 표시 처리 (**텍스트** -> <strong>텍스트</strong>)
  tableHtml = tableHtml.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  return tableHtml
}

/**
 * 마크다운 파싱 (최적화된 파서)
 * @param {string} content - 마크다운 원본 내용
 * @param {string} fileKey - 파일 키 (파일명)
 * @param {Object} fileCheckboxStates - 파일별 체크박스 상태
 * @returns {string} 파싱된 HTML
 */
export function parseMarkdown(content, fileKey = '', fileCheckboxStates = {}) {
  if (!content) return ''

  // Windows 줄바꿈(\r\n) 처리: \r 제거
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalizedContent.split('\n')
  const processedLines = new Array(lines.length)

  // 블록 레벨 요소 컬렉션
  const codeBlocks = []
  const mermaidBlocks = []
  const checkboxPlaceholders = []
  const tableMarkers = []

  // 상태 변수
  let inCodeBlock = false
  let currentCodeBlock = null
  let codeBlockStartIndex = -1
  let inTable = false
  let tableLines = []
  let tableStartIndex = -1
  let headingIndex = 0
  let checkboxIndex = 0

  // 리스트 상태 (단순화: 리스트는 나중에 별도 처리)
  // 여기서는 리스트 항목을 플레이스홀더로 표시만 함

  // 단일 라인 처리 루프 (모든 블록 레벨 요소 처리)
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    // Windows 줄바꿈 처리: \r 제거
    line = line.replace(/\r$/, '')
    const trimmedLine = line.trim()

    // 1. 코드 블록 처리
    if (trimmedLine.startsWith('```')) {
      if (!inCodeBlock) {
        // 코드 블록 시작
        inCodeBlock = true
        codeBlockStartIndex = i
        const langMatch = trimmedLine.match(/^```(\w+)?/)
        const lang = langMatch ? langMatch[1] || '' : ''
        currentCodeBlock = { lang, lines: [], startIndex: i }
        processedLines[i] = ''
      } else {
        // 코드 블록 끝
        inCodeBlock = false
        if (currentCodeBlock) {
          const codeContent = currentCodeBlock.lines.join('\n')
          const langLower = (currentCodeBlock.lang || '').toLowerCase()

          if (langLower === 'mermaid') {
            const placeholder = `__MERMAID_BLOCK_${mermaidBlocks.length}__`
            const mermaidCode = codeContent && codeContent.trim() && codeContent.trim().length > 2 ? codeContent.trim() : ''
            if (!mermaidCode) {
              const placeholder2 = `__CODE_BLOCK_${codeBlocks.length}__`
              codeBlocks.push({ placeholder: placeholder2, lang: currentCodeBlock.lang || '', code: '' })
              processedLines[codeBlockStartIndex] = placeholder2
            } else {
              mermaidBlocks.push({ placeholder, code: mermaidCode })
              processedLines[codeBlockStartIndex] = placeholder
            }
            for (let j = codeBlockStartIndex + 1; j <= i; j++) {
              processedLines[j] = ''
            }
          } else {
            const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`
            const escapedCode = codeContent ? escapeHtml(codeContent) : ''
            codeBlocks.push({ placeholder, lang: currentCodeBlock.lang || '', code: escapedCode })
            processedLines[codeBlockStartIndex] = placeholder
            for (let j = codeBlockStartIndex + 1; j <= i; j++) {
              processedLines[j] = ''
            }
          }
          currentCodeBlock = null
        }
      }
      continue
    }

    if (inCodeBlock && currentCodeBlock) {
      currentCodeBlock.lines.push(line)
      processedLines[i] = ''
      continue
    }

    // 2. 제목 처리 (라인 기반, 즉시 변환)
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const text = headingMatch[2]
      const id = `heading-${headingIndex++}`
      let headingHtml = ''

      switch (level) {
        case 1:
          headingHtml = `<h1 id="${id}" class="text-h4 q-mt-xl q-mb-md text-primary">${text}</h1>`
          break
        case 2:
          headingHtml = `<h2 id="${id}" class="text-h5 q-mt-xl q-mb-md text-primary">${text}</h2>`
          break
        case 3:
          headingHtml = `<h3 id="${id}" class="text-h6 q-mt-lg q-mb-md">${text}</h3>`
          break
        case 4:
          headingHtml = `<h4 id="${id}" class="text-subtitle1 q-mt-lg q-mb-md">${text}</h4>`
          break
        case 5:
          headingHtml = `<h5 id="${id}" class="text-subtitle2 q-mt-md q-mb-sm">${text}</h5>`
          break
        case 6:
          headingHtml = `<h6 id="${id}" class="text-caption q-mt-md q-mb-sm">${text}</h6>`
          break
      }

      if (inTable) {
        inTable = false
        tableLines = []
      }
      processedLines[i] = headingHtml
      continue
    }

    // 3. 수평선 처리
    if (/^[-*_]{3,}$/.test(trimmedLine)) {
      if (inTable) {
        inTable = false
        tableLines = []
      }
      processedLines[i] = '<hr>'
      continue
    }

    // 4. 테이블 처리
    if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
      if (!inTable) {
        inTable = true
        tableStartIndex = i
        tableLines = [line]
      } else {
        tableLines.push(line)
      }
      processedLines[i] = ''
      continue
    } else if (inTable) {
      // 테이블 종료 처리
      if (tableLines.length >= 2) {
        const headerLine = tableLines[0]
        const separatorLine = tableLines[1]
        const dataLines = tableLines.slice(2)
        const isSeparator = /^\|[\s:\-|]+\|$/.test(separatorLine.trim())

        if (isSeparator && headerLine) {
          const headerCells = parseTableCells(headerLine.trim())
          if (headerCells.length > 0) {
            const tableHtml = buildTableHtml(headerCells, dataLines)
            const marker = `__TABLE_MARKER_${tableMarkers.length}__`
            tableMarkers.push({ marker, html: tableHtml, startIndex: tableStartIndex, endIndex: i - 1 })
            processedLines[tableStartIndex] = marker
          }
        }
      }
      inTable = false
      tableLines = []
    }

    // 5. 체크박스 처리 (리스트 처리보다 먼저 처리하여 일반 리스트로 변환되지 않도록)
    // 체크리스트 패턴: - [ ] 또는 - [x] 또는 - [X] (대소문자 모두 지원)
    // 정규식: 앞의 공백(들여쓰기) + 하이픈 + 공백(1개 이상) + 대괄호 + 공백/x/X + 대괄호 + 공백(0개 이상) + 텍스트(1개 이상)
    // 주의: 대괄호 안의 공백은 문자 클래스 [ xX]로 매칭 (공백 또는 x 또는 X)
    // 대괄호 뒤 공백은 선택적(\s*)이지만 텍스트는 필수(.+)
    // 하이픈 뒤 공백은 1개 이상 허용 (\s+ 또는 +) - 여러 공백도 허용
    // 코드 블록이나 테이블 내부가 아닐 때만 체크박스 처리
    if (!inCodeBlock && !inTable) {
      const checkboxMatch = line.match(/^(\s*)- +\[([ xX])\]\s*(.+)$/)
      if (checkboxMatch && checkboxMatch[3] && checkboxMatch[3].trim()) {
        const indent = checkboxMatch[1]
        const checked = checkboxMatch[2]
        const text = checkboxMatch[3].trim()
        const lineKey = `line-${i}`
        const isChecked = fileCheckboxStates[lineKey] !== undefined ? fileCheckboxStates[lineKey] : /[xX]/.test(checked)
        const checkboxId = `checkbox-${fileKey}-${checkboxIndex++}`
        const escapedText = escapeHtml(text)
        const placeholder = `__CHECKBOX_${checkboxPlaceholders.length}__`

        checkboxPlaceholders.push({
          placeholder,
          html: `${indent}<div class="checkbox-item q-mb-xs" data-checkbox-id="${checkboxId}" data-file-key="${fileKey}" data-line-key="${lineKey}">
      <input type="checkbox" ${isChecked ? 'checked' : ''} class="dev-checkbox-input" id="${checkboxId}" />
      <label for="${checkboxId}" class="dev-checkbox-label">${escapedText}</label>
    </div>`,
        })

        processedLines[i] = placeholder
        continue
      }
    }

    // 6. 리스트는 나중에 처리 (일단 원본 유지)
    // 리스트 항목인지 확인만 하고 나중에 처리
    // 체크리스트는 제외 (체크박스 처리 단계에서 이미 처리되어야 함)
    // 체크박스 정규식과 동일한 패턴 사용 (하이픈 뒤 공백 1개 이상 허용)
    const isChecklist = line.match(/^(\s*)- +\[([ xX])\]\s*(.+)$/)
    if (isChecklist) {
      // 체크리스트인데 체크박스 정규식이 매칭되지 않았다면 원본 유지 (나중에 리스트 처리에서 제외됨)
      processedLines[i] = line
      continue
    }

    const unorderedMatch = trimmedLine.match(/^[-*+]\s+(.+)$/)
    const orderedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/)

    if (unorderedMatch || orderedMatch) {
      // 리스트는 나중에 처리
      processedLines[i] = line
      continue
    }

    // 7. 일반 텍스트 라인
    if (inTable) {
      inTable = false
      tableLines = []
    }
    processedLines[i] = line
  }

  // 마지막 처리
  if (inCodeBlock && currentCodeBlock) {
    for (let j = codeBlockStartIndex; j < lines.length; j++) {
      if (processedLines[j] === '' || processedLines[j] === undefined) {
        processedLines[j] = lines[j]
      }
    }
  }

  if (inTable && tableLines.length >= 2) {
    const headerLine = tableLines[0]
    const separatorLine = tableLines[1]
    const dataLines = tableLines.slice(2)
    const isSeparator = /^\|[\s:\-|]+\|$/.test(separatorLine.trim())

    if (isSeparator && headerLine) {
      const headerCells = parseTableCells(headerLine.trim())
      if (headerCells.length > 0) {
        const tableHtml = buildTableHtml(headerCells, dataLines)
        const marker = `__TABLE_MARKER_${tableMarkers.length}__`
        tableMarkers.push({ marker, html: tableHtml, startIndex: tableStartIndex, endIndex: lines.length - 1 })
        processedLines[tableStartIndex] = marker
      }
    }
  }

  // 모든 라인이 처리되었는지 확인
  for (let i = 0; i < lines.length; i++) {
    if (processedLines[i] === undefined) {
      processedLines[i] = lines[i]
    }
  }

  // 빈 라인 필터링 (플레이스홀더는 보존)
  let html = processedLines
    .filter((line) => {
      if (line && (line.includes('__CODE_BLOCK_') || line.includes('__CHECKBOX_') || line.includes('__TABLE_MARKER_') || line.includes('__MERMAID_BLOCK_'))) {
        return true
      }
      return line !== '' && line !== undefined
    })
    .join('\n')

  // 체크박스 플레이스홀더를 실제 HTML로 변환
  checkboxPlaceholders.forEach(({ placeholder, html: checkboxHtml }) => {
    html = html.replace(new RegExp(escapeRegex(placeholder), 'g'), checkboxHtml)
  })

  // 테이블 마커를 실제 HTML로 변환 (단락 처리 전에)
  tableMarkers.forEach(({ marker, html: tableHtml }) => {
    html = html.replace(new RegExp(escapeRegex(marker), 'g'), tableHtml)
  })

  // 리스트 파싱 (순서 없는 리스트: -, *, + / 순서 있는 리스트: 1., 2., ...)
  // 체크박스 HTML을 먼저 보호 (여러 줄일 수 있음)
  const checkboxHtmlMarkers = []
  html = html.replace(/<div class="checkbox-item[^>]*>[\s\S]*?<\/div>/g, (match) => {
    const marker = `__CHECKBOX_HTML_${checkboxHtmlMarkers.length}__`
    checkboxHtmlMarkers.push({ marker, html: match })
    return marker
  })

  const listLines = html.split('\n')
  const listProcessedLines = []
  let listStack = []

  const closeAllLists = () => {
    while (listStack.length > 0) {
      const { type } = listStack.pop()
      listProcessedLines.push(`</${type}>`)
    }
  }

  const processListItem = (text, listType, indentLevel) => {
    const safe = escapeHtml(text)

    // 현재 인덴트 레벨보다 깊은 리스트만 닫기 (같은 레벨의 리스트는 유지)
    while (listStack.length > 0 && listStack[listStack.length - 1].level > indentLevel) {
      const { type } = listStack.pop()
      listProcessedLines.push(`</${type}>`)
    }

    // 현재 스택의 마지막 항목 확인
    const currentStackItem = listStack.length > 0 ? listStack[listStack.length - 1] : null

    // 같은 레벨에 같은 타입의 리스트가 이미 있는지 확인
    // 위에서 listStack.length > indentLevel인 리스트를 닫았으므로,
    // 이제 listStack.length <= indentLevel입니다.
    // currentStackItem이 있고 currentStackItem.level === indentLevel이면 같은 레벨입니다.
    const hasSameTypeAtLevel = currentStackItem && currentStackItem.level === indentLevel && currentStackItem.type === listType

    if (hasSameTypeAtLevel) {
      // 같은 타입의 리스트가 같은 레벨에 있으면 새 리스트 생성하지 않고 항목만 추가
      listProcessedLines.push(`<li>${safe}</li>`)
    } else {
      // 새 리스트가 필요한 경우
      // 먼저 같은 레벨에 다른 타입의 리스트가 있으면 닫기
      if (currentStackItem && currentStackItem.level === indentLevel && currentStackItem.type !== listType) {
        listProcessedLines.push(`</${currentStackItem.type}>`)
        listStack.pop()
      }

      // 새 리스트 시작
      listProcessedLines.push(`<${listType}>`)
      listStack.push({ type: listType, level: indentLevel })

      // 리스트 항목 추가
      listProcessedLines.push(`<li>${safe}</li>`)
    }
  }

  const isPlaceholder = (line) => {
    return line.includes('__CODE_BLOCK_') || line.includes('__MERMAID_BLOCK_') || line.includes('__CHECKBOX_') || line.includes('__TABLE_MARKER_') || line.includes('__CHECKBOX_HTML_') || line.startsWith('<h') || line.startsWith('<hr>') || line.includes('<div class="checkbox-item')
  }

  for (let i = 0; i < listLines.length; i++) {
    const line = listLines[i]
    const trimmedLine = line.trim()

    // 빈 줄은 리스트를 닫지 않고 그대로 전달 (리스트 항목 사이의 빈 줄 허용)
    if (trimmedLine === '') {
      listProcessedLines.push(line)
      continue
    }

    if (isPlaceholder(trimmedLine)) {
      closeAllLists()
      listProcessedLines.push(line)
      continue
    }

    // 체크리스트는 제외 (이미 체크박스로 처리되어야 함, 하지만 체크박스 정규식이 매칭되지 않았을 수 있음)
    // 체크리스트 패턴: - [ ] 또는 - [x] 또는 - [X] (하이픈 뒤 공백 1개 이상 허용)
    if (trimmedLine.match(/^-\s+\[([ xX])\]/)) {
      closeAllLists()
      listProcessedLines.push(line)
      continue
    }

    const indentMatch = line.match(/^(\s*)/)
    const indentLevel = Math.floor((indentMatch?.[1] || '').length / 2)
    // 일반 리스트는 체크리스트가 아닌 것만 처리 (체크리스트는 위에서 이미 제외됨)
    // 빈 리스트 항목도 인식할 수 있도록 .+ 대신 .* 사용
    const unorderedMatch = trimmedLine.match(/^[-*+]\s+(.*)$/)
    const orderedMatch = trimmedLine.match(/^\d+\.\s+(.*)$/)

    if (unorderedMatch) {
      processListItem(unorderedMatch[1], 'ul', indentLevel)
    } else if (orderedMatch) {
      processListItem(orderedMatch[1], 'ol', indentLevel)
    } else {
      closeAllLists()
      listProcessedLines.push(line)
    }
  }

  closeAllLists()
  html = listProcessedLines.join('\n')

  // 체크박스 HTML 마커 복원
  checkboxHtmlMarkers.forEach(({ marker, html: checkboxHtml }) => {
    html = html.replace(new RegExp(escapeRegex(marker), 'g'), checkboxHtml)
  })

  // 인라인 코드 블록 처리 (`코드` -> <code>코드</code>)
  // 체크박스 HTML도 보호 (플레이스홀더는 이미 HTML로 변환됨)
  const inlineCodeMarkers = []
  html = html.replace(/(__CODE_BLOCK_\d+__|__CHECKBOX_\d+__|__CHECKBOX_HTML_\d+__|__TABLE_MARKER_\d+__|__MERMAID_BLOCK_\d+__|<div class="checkbox-item[^>]*>[\s\S]*?<\/div>)/g, (match) => {
    const markerId = `__INLINE_CODE_PROTECT_${inlineCodeMarkers.length}__`
    inlineCodeMarkers.push({ markerId, original: match })
    return markerId
  })

  html = html.replace(/`([^`]+)`/g, (match, code) => {
    const escapedCode = escapeHtml(code)
    return `<code class="code-inline">${escapedCode}</code>`
  })

  inlineCodeMarkers.forEach(({ markerId, original }) => {
    html = html.replace(new RegExp(escapeRegex(markerId), 'g'), original)
  })

  // 강조 표시 처리 (**텍스트** -> <strong>텍스트</strong>)
  // 체크박스 HTML도 보호 (플레이스홀더는 이미 HTML로 변환됨)
  const protectedMarkers = []
  html = html.replace(/(__CODE_BLOCK_\d+__|__CHECKBOX_\d+__|__CHECKBOX_HTML_\d+__|__TABLE_MARKER_\d+__|__MERMAID_BLOCK_\d+__|<div class="checkbox-item[^>]*>[\s\S]*?<\/div>)/g, (match) => {
    const markerId = `__PROTECTED_${protectedMarkers.length}__`
    protectedMarkers.push({ markerId, original: match })
    return markerId
  })

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  protectedMarkers.forEach(({ markerId, original }) => {
    html = html.replace(new RegExp(escapeRegex(markerId), 'g'), original)
  })

  // 코드 블록과 Mermaid 블록 복원
  mermaidBlocks.forEach(({ placeholder, code }, index) => {
    const mermaidId = `mermaid-${Date.now()}-${index}`
    html = html.replace(placeholder, `<div class="mermaid-block" data-mermaid-id="${mermaidId}" data-mermaid-code="${escapeHtml(code)}"></div>`)
  })

  codeBlocks.forEach(({ placeholder, lang, code }) => {
    const langClass = lang ? `language-${lang}` : ''
    html = html.replace(placeholder, `<pre class="code-block ${langClass}"><code>${code}</code></pre>`)
  })

  // 단락 처리 (블록 레벨 요소 보호) - 모든 블록 요소를 __BLOCK_MARKER_로 통일
  const blockMarkers = []

  // 블록 레벨 요소를 마커로 치환하는 공통 함수
  const addBlockMarker = (pattern, html) => {
    html = html.replace(pattern, (match) => {
      const marker = `__BLOCK_MARKER_${blockMarkers.length}__`
      blockMarkers.push({ marker, html: match })
      return marker
    })
    return html
  }

  html = addBlockMarker(/<div class="checkbox-item[^>]*>[\s\S]*?<\/div>/g, html)
  html = addBlockMarker(/<hr>/g, html)
  html = addBlockMarker(/<ul>[\s\S]*?<\/ul>/g, html)
  html = addBlockMarker(/<ol>[\s\S]*?<\/ol>/g, html)
  html = addBlockMarker(/<pre class="code-block[^>]*>[\s\S]*?<\/pre>/g, html)
  html = addBlockMarker(/<div class="mermaid-block[^>]*>[\s\S]*?<\/div>/g, html)
  html = addBlockMarker(/<table[^>]*>[\s\S]*?<\/table>/g, html)
  html = addBlockMarker(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/g, html)

  // 단락 처리
  html = html.replace(/\n\n+/g, '</p><p class="q-mb-md">')
  html = '<p class="q-mb-md">' + html + '</p>'
  html = html.replace(/<p class="q-mb-md"><\/p>/g, '')

  // 블록 마커 복원 및 <p> 태그 밖으로 이동 (모든 블록 요소 통합 처리)
  // 역순으로 복원하여 중첩된 블록 요소가 올바르게 복원되도록 함
  for (let i = blockMarkers.length - 1; i >= 0; i--) {
    const { marker, html: blockHtml } = blockMarkers[i]

    // 1단계: <p> 태그 안에 있는 마커를 찾아서 복원하고 <p> 태그 밖으로 이동
    // 마커 앞뒤에 다른 태그가 있을 수 있으므로 더 유연한 정규식 사용
    const pTagRegex = new RegExp(`<p class="q-mb-md">([\\s\\S]*?)${escapeRegex(marker)}([\\s\\S]*?)</p>`, 'g')
    html = html.replace(pTagRegex, (match, before, after) => {
      let result = ''
      // before 부분 처리: 태그가 있으면 그대로, 텍스트만 있으면 <p> 태그로 감싸기
      if (before && before.trim()) {
        // HTML 태그가 포함되어 있는지 확인
        if (/<[^>]+>/.test(before)) {
          // 태그가 있으면 그대로 사용 (이미 포맷팅된 HTML)
          result += before
        } else {
          // 텍스트만 있으면 <p> 태그로 감싸기
          result += `<p class="q-mb-md">${before}</p>`
        }
      }
      // 블록 요소 복원 (<p> 태그 밖으로)
      result += blockHtml
      // after 부분 처리
      if (after && after.trim()) {
        if (/<[^>]+>/.test(after)) {
          result += after
        } else {
          result += `<p class="q-mb-md">${after}</p>`
        }
      }
      return result || blockHtml
    })

    // 2단계: 리스트 내부에 있는 마커 복원 (<li> 태그 안에 있을 수 있음)
    const liTagRegex = new RegExp(`(<li[^>]*>)([\\s\\S]*?)${escapeRegex(marker)}([\\s\\S]*?)(</li>)`, 'g')
    html = html.replace(liTagRegex, (match, liOpen, before, after, liClose) => {
      // 리스트 항목 내부의 블록 요소는 그대로 복원 (리스트 항목 안에 유지)
      return `${liOpen}${before}${blockHtml}${after}${liClose}`
    })

    // 3단계: 남은 마커 모두 복원 (<p> 태그 밖에 있거나 위에서 처리되지 않은 경우)
    html = html.replace(new RegExp(escapeRegex(marker), 'g'), blockHtml)
  }

  return html
}
