/**
 * 미리보기용 컴포넌트 파서
 * 헤더 제거, 섹션 분석, 설명글 감지 등의 기능 제공
 */

/**
 * 주석줄 제거 (DOM 기반)
 * JavaScript/TypeScript 스타일 주석 제거: // 주석, 블록 주석
 * @param {HTMLElement} container - 렌더링된 컴포넌트 컨테이너
 */
export function removeComments(container: HTMLElement | null) {
  if (!container) return

  // 1. HTML 주석 노드 제거
  const commentWalker = document.createTreeWalker(container, NodeFilter.SHOW_COMMENT)

  const htmlComments = []
  let commentNode
  while ((commentNode = commentWalker.nextNode())) {
    htmlComments.push(commentNode)
  }

  htmlComments.forEach((comment) => {
    (comment as Comment).remove()
  })

  // 2. 텍스트 노드에서 JavaScript/TypeScript 주석 패턴 제거
  const textWalker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)

  const textNodes = []
  let textNode
  while ((textNode = textWalker.nextNode())) {
    textNodes.push(textNode)
  }

  textNodes.forEach((node) => {
    let text = (node as Text).textContent ?? ''

    // 한 줄 주석 제거: // 주석 내용
    // 줄 시작부터 주석까지 또는 공백 후 주석
    text = text.replace(/^\s*\/\/.*$/gm, '')
    text = text.replace(/\s+\/\/.*$/gm, '')

    // 블록 주석 제거: /* 주석 내용 */
    text = text.replace(/\/\*[\s\S]*?\*\//g, '')

    if (text !== (node as Text).textContent) {
      (node as Text).textContent = text
    }
  })

  // 3. 코드 블록 내의 주석 라인 제거
  const codeBlocks = container.querySelectorAll('pre, code, .code-block, [class*="code"]')
  codeBlocks.forEach((codeBlock: Element) => {
    let codeText = codeBlock.textContent

    // 한 줄 주석 제거 (줄 단위)
    codeText = codeText.replace(/^\s*\/\/.*$/gm, '')

    // 블록 주석 제거
    codeText = codeText.replace(/\/\*[\s\S]*?\*\//g, '')

    // 빈 줄 정리 (연속된 빈 줄을 하나로)
    codeText = codeText.replace(/\n\s*\n\s*\n/g, '\n\n')

    if (codeText !== codeBlock.textContent) {
      codeBlock.textContent = codeText.trim()
    }
  })
}

/**
 * 타이틀만 제거 (DOM 기반)
 * 설명글은 유지하고 타이틀만 제거
 * @param {HTMLElement} container - 렌더링된 컴포넌트 컨테이너
 */
export function removeTitles(container: HTMLElement | null) {
  if (!container) return

  // 제거할 타이틀 클래스/태그 패턴 (타이틀만)
  const titleSelectors = [
    '.sample-title',
    'h1.sample-title',
    'h2.sample-title',
    'h3.sample-title',
    'h4.section-title',
    'h1, h2, h3, h4, h5, h6', // 모든 제목 태그 (sample-header 내부에 있는 경우만)
  ]

  titleSelectors.forEach((selector: string) => {
    const elements = container.querySelectorAll(selector)
    elements.forEach((el: Element) => {
      // sample-header 내부에 있는 타이틀만 제거
      const sampleHeader = el.closest('.sample-header')
      if (sampleHeader) {
        // sample-header 내부의 타이틀만 제거 (설명글은 유지)
        if (el.classList.contains('sample-title') || el.tagName.match(/^H[1-6]$/)) {
          el.remove()
        }
      } else if (el.classList.contains('sample-title') || el.classList.contains('section-title')) {
        // sample-header 외부에 있지만 타이틀 클래스를 가진 경우 제거
        el.remove()
      }
    })
  })
}

/**
 * 섹션 분석
 * @param {HTMLElement} container - 렌더링된 컴포넌트 컨테이너
 * @returns {Array} - 섹션 정보 배열
 */
export function analyzeSections(container: HTMLElement | null) {
  if (!container) return []

  const sections = container.querySelectorAll('.sample-section')

  return Array.from(sections).map((section: Element) => {
    const header = section.querySelector('.section-header')
    const content = section.querySelector('.section-content')

    return {
      element: section,
      hasHeader: !!header,
      hasContent: !!content,
      contentElement: content || section,
      // 섹션의 스타일 정보 추출
      styles: {
        border: getComputedStyle(section).border,
        padding: getComputedStyle(section).padding,
        borderRadius: getComputedStyle(section).borderRadius,
      },
    }
  })
}

/**
 * 설명글만 있는지 확인 (느슨한 판단)
 * 설명글도 유용하므로 거의 항상 false 반환하여 표시되도록 함
 * @param {HTMLElement} container - 렌더링된 컴포넌트 컨테이너
 * @returns {boolean} - 설명글만 있는 경우 true (하지만 거의 사용하지 않음)
 */
export function isDescriptionOnly(container: HTMLElement | null) {
  if (!container) return false

  // 설명글도 유용하므로 거의 항상 표시하도록 함
  // 완전히 비어있는 경우만 true 반환
  const hasContent = container.textContent.trim().length > 0 || container.children.length > 0

  // 완전히 비어있지 않으면 표시
  return !hasContent
}

/**
 * 컴포넌트에서 미리보기용 콘텐츠만 추출
 * @param {HTMLElement} container - 렌더링된 컴포넌트 컨테이너
 * @returns {Object} - 파싱 결과
 */
export function parseComponentForPreview(container: HTMLElement | null) {
  if (!container) {
    return {
      hasContent: false,
      isDescriptionOnly: true,
      sections: [],
    }
  }

  // 1. HTML 주석 제거
  removeComments(container)

  // 2. 설명글만 있는지 확인
  const descriptionOnly = isDescriptionOnly(container)

  if (descriptionOnly) {
    return {
      hasContent: false,
      isDescriptionOnly: true,
      sections: [],
    }
  }

  // 3. 타이틀만 제거 (설명글은 유지)
  removeTitles(container)

  // 3. 섹션 분석
  const sections = analyzeSections(container)

  return {
    hasContent: true,
    isDescriptionOnly: false,
    sections,
  }
}
