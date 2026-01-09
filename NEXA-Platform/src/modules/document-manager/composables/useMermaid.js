/**
 * Mermaid 차트 렌더링 Composable
 * Mermaid 코드를 SVG로 렌더링하는 로직 담당
 */

import { getDefaultMermaidCss, loadMermaidStyle, loadMermaidBlockStyle } from '@modules/document-manager/services/mermaidStyleStorage.js'
import { getCurrentMermaidStyles } from '@modules/document-manager/config/mermaidStyles.js'

/**
 * DOM이 준비될 때까지 대기
 * @param {NodeList} mermaidBlocks - Mermaid 블록 요소들
 * @returns {Promise<void>}
 */
function waitForDOMReady(mermaidBlocks) {
  return new Promise((resolve) => {
    const hasBlocks = mermaidBlocks.length > 0

    if (hasBlocks) {
      // 모든 블록이 DOM에 있고 표시되는지 확인
      let checks = 0
      const maxChecks = 10

      const checkBlocks = () => {
        checks++
        let readyCount = 0

        for (const block of mermaidBlocks) {
          const rect = block.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0) {
            readyCount++
          } else {
            // 최소 크기 설정
            block.style.minHeight = '300px'
            block.style.minWidth = '100%'
            block.style.display = 'block'
          }
        }

        if (readyCount === mermaidBlocks.length || checks >= maxChecks) {
          // 추가 안정화 대기 (더 긴 대기 시간)
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setTimeout(() => {
                requestAnimationFrame(() => {
                  setTimeout(resolve, 300) // 더 긴 대기로 레이아웃 안정화
                })
              }, 100)
            })
          })
        } else if (checks < maxChecks) {
          setTimeout(checkBlocks, 100)
        } else {
          // 최대 시도 횟수 도달 시에도 진행
          setTimeout(resolve, 150)
        }
      }

      checkBlocks()
    } else {
      // 블록이 없으면 일반 대기
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 200)
        })
      })
    }
  })
}

// Pie 차트 관련 함수 제거됨 (Pie 차트 미지원)

/**
 * HTML 엔티티 디코딩
 * @param {string} encodedCode - 인코딩된 코드
 * @returns {string} 디코딩된 코드
 */
function decodeHtmlEntities(encodedCode) {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = encodedCode
  return tempDiv.textContent || tempDiv.innerText || encodedCode
}

/**
 * Mermaid 차트 렌더링 Composable
 * @param {import('vue').Ref<HTMLElement|null>} containerRef - 마크다운 컨테이너 ref
 * @param {import('vue').Ref<string>|() => string|null} filePathGetter - 현재 파일 경로를 반환하는 함수 또는 ref
 * @returns {{ renderMermaid: () => Promise<void> }}
 */
export function useMermaid(containerRef, filePathGetter = null) {
  let mutationObserver = null
  let renderTimeout = null
  let debounceTimer = null
  let isRendering = false
  let lastRenderTime = 0
  const styleCache = new Map() // 스타일 캐시 (블록 ID -> CSS)
  let currentFilePath = null // 현재 파일 경로 추적

  /**
   * 현재 파일 경로 가져오기
   * @returns {string|null} 파일 경로
   */
  function getCurrentFilePath() {
    if (!filePathGetter) return null

    if (typeof filePathGetter === 'function') {
      return filePathGetter()
    }

    // ref인 경우
    if (filePathGetter && typeof filePathGetter === 'object' && 'value' in filePathGetter) {
      return filePathGetter.value
    }

    return null
  }

  /**
   * CSS를 <style> 태그로 주입
   * @param {string} mermaidId - Mermaid 블록 ID
   * @param {string} css - CSS 문자열
   */
  function injectMermaidCss(mermaidId, css) {
    if (!css || !mermaidId) return

    // 기존 스타일 태그 제거 (같은 ID의)
    const existingStyle = document.getElementById(`mermaid-style-${mermaidId}`)
    if (existingStyle) {
      existingStyle.remove()
    }

    // 새 스타일 태그 생성 및 추가
    const styleTag = document.createElement('style')
    styleTag.id = `mermaid-style-${mermaidId}`
    styleTag.textContent = css
    document.head.appendChild(styleTag)

    // 캐시 업데이트
    styleCache.set(mermaidId, css)
  }

  /**
   * Mermaid 블록에 스타일 주입
   * @param {string} mermaidId - Mermaid 블록 ID
   */
  async function injectMermaidStyles(mermaidId) {
    if (!mermaidId) return

    // 현재 파일 경로 가져오기
    const filePath = getCurrentFilePath()

    // 파일 경로가 변경되었으면 스타일 캐시 초기화
    if (currentFilePath !== filePath) {
      styleCache.clear()
      currentFilePath = filePath
    }

    // 이미 스타일이 주입되었는지 확인 (중복 주입 방지)
    // 같은 파일의 같은 블록인지 확인
    const cached = styleCache.get(mermaidId)
    if (cached && cached.filePath === filePath) {
      return
    }

    // 파일 경로가 없으면 기본 스타일만 적용
    if (!filePath) {
      const defaultCss = getDefaultMermaidCss()
      injectMermaidCss(mermaidId, defaultCss)
      return
    }

    try {
      // 파일 경로가 여전히 유효한지 확인 (localStorage는 동기적이지만 안전을 위해 확인)
      const currentPath = getCurrentFilePath()
      if (currentPath !== filePath) {
        // 파일 경로가 변경되었으면 스타일 주입하지 않음
        return
      }

      // 1. 파일 레벨 스타일 로드 시도 (localStorage만 사용, 네트워크 요청 없음)
      let fileStyle = await loadMermaidStyle(filePath)

      // 파일 경로가 여전히 유효한지 다시 확인
      const currentPathAfterLoad = getCurrentFilePath()
      if (currentPathAfterLoad !== filePath) {
        // 파일 경로가 변경되었으면 스타일 주입하지 않음
        return
      }

      // 2. 블록 레벨 스타일 로드 시도
      let blockStyle = filePath ? await loadMermaidBlockStyle(filePath, mermaidId) : null

      // 파일 경로가 여전히 유효한지 다시 확인
      const currentPathAfterBlockStyle = getCurrentFilePath()
      if (currentPathAfterBlockStyle !== filePath) {
        // 파일 경로가 변경되었으면 스타일 주입하지 않음
        return
      }

      // 3. 스타일이 없으면 기본 스타일 적용
      if (!fileStyle && !blockStyle) {
        fileStyle = getDefaultMermaidCss()
      } else {
        // 커스텀 스타일이 있으면 기본 스타일과 병합 (기본 스타일이 기본값 역할)
        const defaultStyle = getDefaultMermaidCss()
        if (fileStyle) {
          fileStyle = defaultStyle + '\n' + fileStyle
        } else {
          fileStyle = defaultStyle
        }
      }

      // 3. CSS 주입 (파일 경로가 변경되지 않았는지 최종 확인)
      const currentPathFinal = getCurrentFilePath()
      if (currentPathFinal === filePath) {
        const finalCss = fileStyle + (blockStyle ? '\n' + blockStyle : '')
        injectMermaidCss(mermaidId, finalCss)
        // 스타일 캐시에 저장 (파일 경로와 함께)
        styleCache.set(mermaidId, { css: finalCss, filePath })
      }
      // 파일 경로가 변경되었으면 스타일 주입하지 않음 (다음 렌더링에서 처리)
    } catch {
      // 스타일 로드 실패 시 기본 스타일만 적용 (파일 경로 확인)
      const currentPath = getCurrentFilePath()
      if (currentPath === filePath) {
        const defaultCss = getDefaultMermaidCss()
        injectMermaidCss(mermaidId, defaultCss)
        styleCache.set(mermaidId, { css: defaultCss, filePath })
      }
    }
  }

  /**
   * Mermaid 렌더링 함수 (재시도 로직 포함)
   * @param {number} retryCount - 재시도 횟수
   * @param {number} maxRetries - 최대 재시도 횟수
   * @param {boolean} force - 강제 실행 (디바운싱 무시)
   */
  async function renderMermaid(retryCount = 0, maxRetries = 3, force = false) {
    // 이미 렌더링 중이면 무시 (재시도는 제외)
    if (isRendering && retryCount === 0 && !force) {
      return
    }

    // 디바운싱: 300ms 이내 중복 호출 무시 (재시도와 강제 실행은 제외)
    const now = Date.now()
    if (now - lastRenderTime < 300 && retryCount === 0 && !force) {
      return
    }

    if (retryCount === 0) {
      lastRenderTime = now
      isRendering = true
    }
    if (!containerRef.value) {
      // 컨테이너가 없으면 재시도
      if (retryCount < maxRetries) {
        setTimeout(() => renderMermaid(retryCount + 1, maxRetries), 200)
      }
      return
    }

    // Mermaid 블록 찾기 (렌더링되지 않은 블록)
    const mermaidBlocks = containerRef.value.querySelectorAll('.mermaid-block:not([data-mermaid-rendered])')

    if (mermaidBlocks.length === 0) {
      // 렌더링할 블록이 없으면 재시도하지 않음
      if (retryCount === 0) {
        isRendering = false
      }
      return
    }

    // 렌더링할 블록이 있음 - 계속 진행

    // DOM 준비 대기
    await waitForDOMReady(mermaidBlocks)

    try {
      // Mermaid 동적 import (Vite 캐시 문제 방지)
      if (!window.mermaidModule) {
        window.mermaidModule = await import('mermaid')
      }
      const mermaid = window.mermaidModule.default

      // Mermaid 초기화 및 테마 변수 설정 (테마 변경 시 재설정 가능)
      // 테마 변수 가져오기 (중앙 스타일 관리 모듈에서)
      const styles = getCurrentMermaidStyles()
      const primaryColor = styles.nodeBg
      const primaryBorderColor = styles.nodeBorder
      const lineColorValue = styles.lineColor
      const primaryTextColor = styles.nodeText
      const edgeLabelBackground = 'transparent' // 엣지 라벨 배경 제거 (공식 API 사용)

      // 초기화 또는 테마 변수만 업데이트
      if (!window.mermaidInitialized) {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base', // base 테마만 themeVariables 지원
          securityLevel: 'loose',
          themeVariables: {
            primaryColor: primaryColor,
            primaryBorderColor: primaryBorderColor,
            primaryTextColor: primaryTextColor,
            lineColor: lineColorValue,
            edgeLabelBackground: edgeLabelBackground, // 엣지 라벨 배경 제거
          },
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            wrap: true,
          },
          // Pie 차트는 미지원
        })
        window.mermaidInitialized = true
      } else {
        // 이미 초기화된 경우 themeVariables만 업데이트
        // (Mermaid는 재초기화 지원 안 하므로, 새로 렌더링될 때 적용됨)
        if (mermaid.initialize) {
          mermaid.initialize({
            theme: 'base',
            themeVariables: {
              primaryColor: primaryColor,
              primaryBorderColor: primaryBorderColor,
              primaryTextColor: primaryTextColor,
              lineColor: lineColorValue,
              edgeLabelBackground: edgeLabelBackground,
            },
          })
        }
      }

      // 각 Mermaid 블록 렌더링 (병렬 처리 대신 순차 처리)
      for (const block of mermaidBlocks) {
        // 이미 렌더링되었는지 다시 확인 (race condition 방지)
        if (block.hasAttribute('data-mermaid-rendered')) continue

        const mermaidCode = block.getAttribute('data-mermaid-code')
        if (!mermaidCode || mermaidCode.trim().length < 3) {
          // 빈 코드나 너무 짧은 코드는 조용히 건너뛰기
          block.style.display = 'none'
          block.setAttribute('data-mermaid-rendered', 'true')
          continue
        }

        try {
          // 컨테이너가 표시되는지 최종 확인
          const rect = block.getBoundingClientRect()
          if (rect.width === 0 || rect.height === 0) {
            block.style.minHeight = '300px'
            block.style.minWidth = '100%'
            block.style.display = 'block'
            // 추가 대기
            await new Promise((resolve) => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  setTimeout(resolve, 150)
                })
              })
            })
          }

          // HTML 엔티티 디코딩
          const decodedCode = decodeHtmlEntities(mermaidCode)

          // 유효성 검사: 빈 코드나 너무 짧은 코드는 건너뛰기
          const trimmedCode = decodedCode.trim()
          if (!trimmedCode || trimmedCode.length < 3) {
            // 조용히 건너뛰기 (에러 메시지 표시하지 않음)
            block.style.display = 'none'
            block.setAttribute('data-mermaid-rendered', 'true')
            continue
          }

          // 차트 타입 확인 (Pie 차트는 지원하지 않음)
          const chartType = trimmedCode.split('\n')[0].toLowerCase().trim()
          if (!chartType || chartType.includes('pie')) {
            if (chartType?.includes('pie')) {
              // Pie 차트는 현재 지원하지 않음
              block.innerHTML = `<div class="mermaid-error text-negative q-pa-md">Pie 차트는 현재 지원하지 않습니다. 다른 차트 타입을 사용해주세요.</div>`
            } else {
              // 차트 타입을 감지할 수 없음 - 조용히 건너뛰기
              block.style.display = 'none'
            }
            block.setAttribute('data-mermaid-rendered', 'true')
            continue
          }

          // Mermaid 렌더링
          const { svg } = await mermaid.render(block.getAttribute('data-mermaid-id'), trimmedCode)
          block.innerHTML = svg
          block.setAttribute('data-mermaid-rendered', 'true')
          block.classList.add('mermaid-rendered')

          // CSS 스타일 주입 (렌더링 후, 약간의 지연으로 SVG DOM이 완전히 준비되도록)
          await new Promise((resolve) => setTimeout(resolve, 100))
          await injectMermaidStyles(block.getAttribute('data-mermaid-id'))

          // SVG 내부 인라인 스타일도 강제로 제거하고 CSS로 대체
          forceApplyThemeStyles(block)

          // 추가 지연 후 다시 적용 (Mermaid의 비동기 스타일 적용 대비)
          setTimeout(() => {
            forceApplyThemeStyles(block)
          }, 200)

          // 더 긴 지연 후 한 번 더 적용 (엣지 라벨이 늦게 렌더링되는 경우 대비)
          setTimeout(() => {
            forceApplyThemeStyles(block)
          }, 500)
        } catch (error) {
          // 유효하지 않은 코드나 타입 감지 실패 시 조용히 건너뛰기
          const errorMsg = error.message || '알 수 없는 오류'
          if (errorMsg.includes('No diagram type detected') || errorMsg.includes('Parse error') || errorMsg.includes('UnknownDiagramError')) {
            // 유효하지 않은 코드는 표시하지 않음
            block.style.display = 'none'
          } else {
            // 다른 에러는 메시지 표시
            block.innerHTML = `<div class="mermaid-error text-negative q-pa-md">Mermaid 차트 렌더링 오류: ${errorMsg}</div>`
          }
          block.setAttribute('data-mermaid-rendered', 'true')
          // 에러가 있어도 다음 차트 계속 렌더링
        }
      }
    } catch {
      // Mermaid 초기화 오류는 조용히 처리
    } finally {
      // 렌더링 완료
      if (retryCount === 0) {
        isRendering = false
      }
    }
  }

  /**
   * SVG 내부 인라인 스타일을 강제로 제거하고 테마 스타일 적용
   * 특정 다이어그램에서 인라인 스타일이 우선 적용되는 문제 해결
   * @param {HTMLElement} blockElement - Mermaid 블록 요소
   */
  function forceApplyThemeStyles(blockElement) {
    if (!blockElement) return

    const svg = blockElement.querySelector('svg')
    if (!svg) return

    // SVG 내부의 모든 도형 요소에서 인라인 fill/stroke 속성 제거
    // 인라인 속성이 CSS보다 우선순위가 높기 때문에 JavaScript로 직접 처리
    const allShapes = svg.querySelectorAll('rect, circle, ellipse, polygon, path[fill]')
    allShapes.forEach((shape) => {
      const tagName = shape.tagName.toLowerCase()

      // 모든 도형 요소 확인
      if (tagName === 'rect' || tagName === 'circle' || tagName === 'ellipse' || tagName === 'polygon') {
        const currentFill = shape.getAttribute('fill')
        // 기본 팔레트 색상(노란색, 보라색 등)이면 제거하여 CSS 적용
        if (currentFill) {
          const fillLower = currentFill.toLowerCase()
          // Mermaid 기본 색상 팔레트 감지
          const isDefaultPalette =
            fillLower.includes('yellow') ||
            fillLower.includes('#ffff') || // 노란색 계열
            fillLower.includes('#ff00ff') || // 보라색
            fillLower.includes('purple') ||
            fillLower.includes('magenta') ||
            fillLower.includes('#ff80') || // 분홍 계열
            fillLower.includes('#80ff') || // 시안 계열
            (fillLower.match(/^#[0-9a-f]{6}$/i) &&
              !fillLower.includes('#2196f3') && // 테마 색상 제외
              !fillLower.includes('#191919')) // 테마 색상 제외

          if (isDefaultPalette) {
            // 인라인 fill 제거하여 CSS가 적용되도록 함
            shape.removeAttribute('fill')
            // stroke도 기본 팔레트 색상이면 제거
            const currentStroke = shape.getAttribute('stroke')
            if (currentStroke) {
              const strokeLower = currentStroke.toLowerCase()
              if (strokeLower.includes('yellow') || strokeLower.includes('purple') || strokeLower.includes('magenta') || strokeLower.includes('#ffff') || strokeLower.includes('#ff00ff')) {
                shape.removeAttribute('stroke')
              }
            }
          }
        }
      }

      // path 요소 중 연결선인 경우 (data-edge="true" 또는 .edgePaths 내부)
      if (tagName === 'path') {
        const isEdge = shape.getAttribute('data-edge') === 'true' || shape.closest('.edgePaths') !== null || shape.classList.contains('edge') || shape.closest('.edgePath') !== null

        if (isEdge) {
          // 연결선은 fill을 반드시 none으로 설정하고 stroke만 사용
          const currentFill = shape.getAttribute('fill')
          if (currentFill && currentFill !== 'none' && currentFill !== 'transparent') {
            shape.setAttribute('fill', 'none')
          }

          // stroke가 기본 팔레트 색상이면 제거하여 CSS 적용
          const currentStroke = shape.getAttribute('stroke')
          if (currentStroke) {
            const strokeLower = currentStroke.toLowerCase()
            const isDefaultPalette =
              strokeLower.includes('yellow') ||
              strokeLower.includes('#ffff') ||
              strokeLower.includes('#ff00ff') ||
              strokeLower.includes('purple') ||
              strokeLower.includes('magenta') ||
              (strokeLower.match(/^#[0-9a-f]{6}$/i) &&
                !strokeLower.includes('#00e235') && // 테마 라인 색상 제외
                !strokeLower.includes('#1976d2'))

            if (isDefaultPalette) {
              shape.removeAttribute('stroke')
            }
          }
        }
      }
    })

    // 모든 텍스트 요소에 테마 색상 강제 적용
    // 중앙 스타일 관리 모듈에서 기본 스타일 가져오기
    const styles = getCurrentMermaidStyles()
    let edgeLabelColor = styles.edgeText
    let textColor = styles.nodeText
    let lineColor = styles.lineColor

    // 사용자 정의 스타일이 있으면 localStorage에서 가져오기 (파일 레벨)
    const currentFilePath = getCurrentFilePath()
    if (currentFilePath) {
      try {
        // 파일 경로를 CSS 경로로 변환: example.md -> example.mermaid.css
        const cssPath = currentFilePath.replace(/\.md$/, '.mermaid.css')
        const localStorageKey = `mermaid-style:${cssPath}`
        const savedCss = localStorage.getItem(localStorageKey)

        if (savedCss) {
          // CSS에서 엣지 라벨 텍스트 색상 추출
          // 주의: text:not(.edgeLabel text) 패턴은 노드 텍스트이므로 제외
          let extractedEdgeTextColor = null

          // 1. .edgeText 패턴 (가장 명확함)
          const edgeTextMatch = savedCss.match(/\.edgeText[^}]*fill:\s*([^!;]+)/i)
          if (edgeTextMatch) {
            extractedEdgeTextColor = edgeTextMatch[1].trim()
          }

          // 2. .edgeLabel text 패턴 (text:not이 아닌 경우만)
          if (!extractedEdgeTextColor) {
            const edgeLabelTextMatch = savedCss.match(/\.edgeLabel[^}]*\s+text[^}]*fill:\s*([^!;]+)/i)
            if (edgeLabelTextMatch) {
              const matchContext = edgeLabelTextMatch[0]
              const matchIndex = savedCss.indexOf(matchContext)
              const beforeText = savedCss.substring(Math.max(0, matchIndex - 50), matchIndex)

              // text:not(.edgeLabel text) 패턴이 아닌지 확인
              if (!beforeText.includes('text:not') || !beforeText.trim().endsWith('text:not(')) {
                extractedEdgeTextColor = edgeLabelTextMatch[1].trim()
              }
            }
          }

          // 3. .edgeLabel 패턴 (단독, text 없이)
          if (!extractedEdgeTextColor) {
            const edgeLabelMatch = savedCss.match(/\.edgeLabel[^}]*\{[^}]*fill:\s*([^!;]+)/i)
            if (edgeLabelMatch) {
              const matchContext = edgeLabelMatch[0]
              const matchIndex = savedCss.indexOf(matchContext)
              const beforeText = savedCss.substring(Math.max(0, matchIndex - 50), matchIndex)

              // text:not(.edgeLabel) 패턴이 아닌지 확인
              if (!beforeText.includes('text:not') || !beforeText.trim().endsWith('text:not(')) {
                extractedEdgeTextColor = edgeLabelMatch[1].trim()
              }
            }
          }

          if (extractedEdgeTextColor && !extractedEdgeTextColor.includes('none') && !extractedEdgeTextColor.includes('transparent')) {
            edgeLabelColor = extractedEdgeTextColor
            if (import.meta.env.DEV) {
              console.log('[useMermaid] localStorage에서 엣지 라벨 색상 로드:', edgeLabelColor)
            }
          }

          // CSS에서 노드 텍스트 색상 추출
          // 우선순위: text:not(.messageText) 패턴 > .nodeLabel 패턴
          let textColorValue = null

          // 1. text:not(.messageText) 패턴 (가장 정확)
          const textNotMessageMatch = savedCss.match(/text:not\([^}]*messageText[^}]*\)[^}]*fill:\s*([^!;]+)/i)
          if (textNotMessageMatch) {
            textColorValue = textNotMessageMatch[1].trim()
          }

          // 2. .nodeLabel 패턴
          if (!textColorValue) {
            const nodeLabelMatch = savedCss.match(/\.nodeLabel[^}]*text[^}]*fill:\s*([^!;]+)/i) || savedCss.match(/\.nodeLabel[^}]*fill:\s*([^!;]+)/i)
            if (nodeLabelMatch) {
              textColorValue = nodeLabelMatch[1].trim()
            }
          }

          // 3. 일반 text 패턴 (마지막 수단)
          if (!textColorValue) {
            const generalTextMatch = savedCss.match(/text[^}]*fill:\s*([^!;]+)/i)
            if (generalTextMatch) {
              const matchContext = generalTextMatch[0]
              // .messageText나 .edgeLabel이 아닌 경우만 사용
              if (!matchContext.includes('messageText') && !matchContext.includes('.edgeLabel') && !matchContext.includes('edgeLabel')) {
                textColorValue = generalTextMatch[1].trim()
              }
            }
          }

          if (textColorValue && !textColorValue.includes('none') && !textColorValue.includes('transparent')) {
            textColor = textColorValue
            if (import.meta.env.DEV) {
              console.log('[useMermaid] localStorage에서 노드 텍스트 색상 로드:', textColor)
            }
          }

          // CSS에서 라인 색상 추출
          const lineColorMatch = savedCss.match(/\.edge[^}]*path[^}]*stroke:\s*([^!;]+)/i) || savedCss.match(/\.messageLine[^}]*stroke:\s*([^!;]+)/i)
          if (lineColorMatch) {
            const extractedColor = lineColorMatch[1].trim()
            if (extractedColor && !extractedColor.includes('none') && !extractedColor.includes('transparent')) {
              lineColor = extractedColor
            }
          }
        }
      } catch (error) {
        // localStorage 읽기 실패는 무시 (기본값 사용)
        if (import.meta.env.DEV) {
          console.warn('[useMermaid] localStorage에서 스타일 로드 실패:', error)
        }
      }
    }

    // 디버깅: DOM 구조 분석 (개발 모드에서만)
    // URL 파라미터로 제어: ?mermaidDebug=true 또는 localStorage에 'mermaidDebug=true' 저장
    const urlParams = new URLSearchParams(window.location.search)
    const debugFromUrl = urlParams.get('mermaidDebug') === 'true'
    const debugFromStorage = localStorage.getItem('mermaidDebug') === 'true'
    const debugMode = debugFromUrl || debugFromStorage || false // true로 직접 변경하거나 URL 파라미터/저장소로 제어
    if (debugMode) {
      console.group('🔍 Mermaid DOM 구조 분석')
      const allTexts = svg.querySelectorAll('text, tspan')
      console.log(`총 텍스트 요소: ${allTexts.length}개`)
      allTexts.forEach((textEl, idx) => {
        if (!textEl.textContent || textEl.textContent.trim() === '') return
        const parent = textEl.parentElement
        const classes = String(textEl.className?.baseVal || textEl.className || '')
        const parentClasses = String(parent?.className?.baseVal || parent?.className || '')
        console.log(`텍스트 ${idx + 1}: "${textEl.textContent.trim()}"`, {
          tagName: textEl.tagName,
          classes,
          parentTag: parent?.tagName,
          parentClasses,
          fill: textEl.getAttribute('fill'),
          styleFill: textEl.style.fill,
          closestEdgeLabel: textEl.closest('.edgeLabel') !== null,
          closestNodeLabel: textEl.closest('.nodeLabel') !== null,
          hasEdgeInClass: classes.includes('edge') || parentClasses.includes('edge'),
        })
      })
      console.groupEnd()
    }

    // 전략: 모든 텍스트 요소를 수집 후 체계적으로 분류 및 적용
    // 실행 순서: 1. 엣지 라벨 → 2. 노드 텍스트
    // 참고: messageText는 CSS에서 처리됨 (mermaidStyleStorage.js)
    const allTextElements = Array.from(svg.querySelectorAll('text, tspan')).filter((el) => el.textContent && el.textContent.trim() !== '')

    // 1. 엣지 라벨 처리 - 더 포괄적인 검색
    // 2-1. edgeLabel 클래스 기반 검색
    const edgeLabelGroups = svg.querySelectorAll('.edgeLabel, .edgeLabels, [class*="edgeLabel"], g[class*="edgeLabel"]')
    if (debugMode) console.log(`엣지 라벨 그룹 찾음: ${edgeLabelGroups.length}개`)

    edgeLabelGroups.forEach((group, idx) => {
      if (debugMode) {
        const groupClasses = String(group.className?.baseVal || group.className || '')
        console.log(`  그룹 ${idx + 1}: tagName=${group.tagName}, classes=${groupClasses}`)
      }

      // group 내부의 모든 텍스트 찾기 (더 포괄적으로)
      const texts = group.querySelectorAll('text, tspan')
      let foundTexts = 0

      // SPAN 요소는 foreignObject 내부에 있을 수 있음 (또는 HTML 요소)
      if (group.tagName === 'SPAN' || group.tagName === 'span') {
        // SPAN 자체에 텍스트가 있으면 처리
        if (group.textContent && group.textContent.trim() !== '') {
          group.style.setProperty('color', edgeLabelColor, 'important')
          group.style.color = edgeLabelColor
          foundTexts++
          if (debugMode) console.log(`  엣지 라벨 (SPAN 자체) 적용: "${group.textContent.trim()}" -> ${edgeLabelColor}`)
        }
        // SPAN 내부의 모든 HTML 요소 (P, DIV, SPAN 등) 처리
        const spanAllElements = group.querySelectorAll('*')
        spanAllElements.forEach((el) => {
          if (el.textContent && el.textContent.trim() !== '') {
            // SVG 요소인 경우
            if (el.tagName === 'text' || el.tagName === 'tspan') {
              el.removeAttribute('fill')
              el.style.setProperty('fill', edgeLabelColor, 'important')
              el.style.fill = edgeLabelColor
              el.setAttribute('fill', edgeLabelColor)
              foundTexts++
              if (debugMode) console.log(`  엣지 라벨 (SPAN 내부 SVG) 적용: "${el.textContent.trim()}" -> ${edgeLabelColor}`)
            }
            // HTML 요소인 경우 (P, DIV, SPAN 등)
            else if (el.tagName === 'P' || el.tagName === 'p' || el.tagName === 'DIV' || el.tagName === 'div' || el.tagName === 'SPAN' || el.tagName === 'span') {
              el.style.setProperty('color', edgeLabelColor, 'important')
              el.style.color = edgeLabelColor
              foundTexts++
              if (debugMode) console.log(`  엣지 라벨 (SPAN 내부 ${el.tagName}) 적용: "${el.textContent.trim()}" -> ${edgeLabelColor}`)
            }
          }
        })
      }

      // SVG text/tspan 요소 처리
      texts.forEach((textEl) => {
        if (textEl.textContent && textEl.textContent.trim() !== '') {
          textEl.removeAttribute('fill')
          textEl.style.setProperty('fill', edgeLabelColor, 'important')
          textEl.style.setProperty('color', edgeLabelColor, 'important')
          textEl.style.fill = edgeLabelColor
          textEl.setAttribute('fill', edgeLabelColor)
          foundTexts++
          if (debugMode) console.log(`  엣지 라벨 적용: "${textEl.textContent.trim()}" -> ${edgeLabelColor}`)
        }
      })

      // group 자체가 text/tspan인 경우
      if ((group.tagName === 'text' || group.tagName === 'tspan') && group.textContent && group.textContent.trim() !== '') {
        group.removeAttribute('fill')
        group.style.setProperty('fill', edgeLabelColor, 'important')
        group.style.fill = edgeLabelColor
        group.setAttribute('fill', edgeLabelColor)
        foundTexts++
        if (debugMode) console.log(`  엣지 라벨 (그룹 자체) 적용: "${group.textContent.trim()}" -> ${edgeLabelColor}`)
      }

      // 그룹 내부 자식 요소를 재귀적으로 탐색 (foreignObject, g 등)
      if (foundTexts === 0) {
        const allDescendants = group.querySelectorAll('*')
        allDescendants.forEach((child) => {
          if (!child.textContent || child.textContent.trim() === '') return

          // SVG text/tspan 요소
          if (child.tagName === 'text' || child.tagName === 'tspan') {
            child.removeAttribute('fill')
            child.style.setProperty('fill', edgeLabelColor, 'important')
            child.style.fill = edgeLabelColor
            child.setAttribute('fill', edgeLabelColor)
            foundTexts++
            if (debugMode) console.log(`  엣지 라벨 (재귀 SVG) 적용: "${child.textContent.trim()}" -> ${edgeLabelColor}`)
          }
          // HTML 요소 (SPAN, P, DIV 등) - foreignObject 내부에 있을 수 있음
          else if (child.tagName === 'SPAN' || child.tagName === 'span' || child.tagName === 'P' || child.tagName === 'p' || child.tagName === 'DIV' || child.tagName === 'div') {
            child.style.setProperty('color', edgeLabelColor, 'important')
            child.style.color = edgeLabelColor
            foundTexts++
            if (debugMode) console.log(`  엣지 라벨 (재귀 HTML ${child.tagName}) 적용: "${child.textContent.trim()}" -> ${edgeLabelColor}`)
          }
        })
      }

      // 텍스트를 찾지 못했지만 그룹이 있으면, SVG 전체에서 찾기
      if (foundTexts === 0) {
        // SVG 전체에서 그룹과 관련된 텍스트 찾기 (SVG + HTML 요소 모두)
        const allSvgTexts = svg.querySelectorAll('text, tspan, span, p, div')
        allSvgTexts.forEach((textEl) => {
          if (!textEl.textContent || textEl.textContent.trim() === '') return

          // 그룹이 텍스트를 포함하는지 확인
          if (group.contains(textEl)) {
            // SVG 요소
            if (textEl.tagName === 'text' || textEl.tagName === 'tspan') {
              textEl.removeAttribute('fill')
              textEl.style.setProperty('fill', edgeLabelColor, 'important')
              textEl.style.fill = edgeLabelColor
              textEl.setAttribute('fill', edgeLabelColor)
              foundTexts++
              if (debugMode) console.log(`  엣지 라벨 (포함 SVG) 적용: "${textEl.textContent.trim()}" -> ${edgeLabelColor}`)
            }
            // HTML 요소
            else {
              textEl.style.setProperty('color', edgeLabelColor, 'important')
              textEl.style.color = edgeLabelColor
              foundTexts++
              if (debugMode) console.log(`  엣지 라벨 (포함 HTML ${textEl.tagName}) 적용: "${textEl.textContent.trim()}" -> ${edgeLabelColor}`)
            }
          }
        })
      }

      if (debugMode && foundTexts === 0) {
        console.log(`  ⚠️ 그룹 ${idx + 1}에서 텍스트를 찾지 못했습니다`, {
          groupTag: group.tagName,
          groupClasses: String(group.className?.baseVal || group.className || ''),
          children: Array.from(group.children).map((c) => ({
            tag: c.tagName,
            classes: String(c.className?.baseVal || c.className || ''),
            textContent: c.textContent?.trim().substring(0, 20),
            hasChildren: c.children.length > 0,
            children: Array.from(c.children)
              .slice(0, 5)
              .map((gc) => ({
                tag: gc.tagName,
                classes: String(gc.className?.baseVal || gc.className || ''),
                textContent: gc.textContent?.trim().substring(0, 20),
              })),
          })),
        })

        // 실제 텍스트 노드 탐색 (더 깊이)
        console.log(`  🔍 그룹 ${idx + 1} 깊이 탐색:`)
        const allDescendants = group.querySelectorAll('*')
        const textNodes = []
        allDescendants.forEach((el) => {
          if (el.textContent && el.textContent.trim() !== '') {
            // 직접 텍스트 노드가 있는지 확인
            const directTextNodes = Array.from(el.childNodes).filter((n) => n.nodeType === 3 && n.textContent.trim() !== '')
            if (directTextNodes.length > 0 || el.tagName === 'text' || el.tagName === 'tspan' || el.tagName === 'SPAN' || el.tagName === 'span') {
              textNodes.push({
                tag: el.tagName,
                classes: String(el.className?.baseVal || el.className || ''),
                text: el.textContent.trim(),
                parent: el.parentElement
                  ? {
                      tag: el.parentElement.tagName,
                      classes: String(el.parentElement.className?.baseVal || el.parentElement.className || ''),
                    }
                  : null,
              })
            }
          }
        })
        if (textNodes.length > 0) {
          console.log(`  ✅ 발견된 텍스트 노드:`, textNodes)
        } else {
          console.log(`  ❌ 텍스트 노드를 찾지 못했습니다.`)
        }
      }
    })

    // 2-2. 모든 텍스트 요소 중 엣지 관련 클래스 가진 것 찾기
    allTextElements.forEach((textEl) => {
      if (textEl.closest('.edgeLabel') || textEl.closest('.edgeLabels')) return // 이미 처리됨

      const classes = String(textEl.className?.baseVal || textEl.className || '')
      const parent = textEl.parentElement
      const parentClasses = String(parent?.className?.baseVal || parent?.className || '')

      // 엣지 관련 키워드가 있는지 확인
      const hasEdgeKeyword = (classes.includes('edge') && !classes.includes('edgeLabel') === false) || (parentClasses.includes('edge') && !parentClasses.includes('edgeLabel') === false) || classes.toLowerCase().includes('edge-label') || parentClasses.toLowerCase().includes('edge-label')

      // 플로우차트의 엣지 라벨은 보통 특정 패턴을 가짐
      const isEdgeText = hasEdgeKeyword || (parent && parent.tagName === 'g' && parentClasses.includes('edge'))

      if (isEdgeText && !textEl.closest('.nodeLabel') && !textEl.closest('.node')) {
        textEl.removeAttribute('fill')
        textEl.style.setProperty('fill', edgeLabelColor, 'important')
        textEl.style.fill = edgeLabelColor
        textEl.setAttribute('fill', edgeLabelColor)
        if (debugMode) console.log(`엣지 라벨 (키워드) 적용: "${textEl.textContent.trim()}" -> ${edgeLabelColor}`)
      }
    })

    // 2-3. 연결선(path) 근처 텍스트를 엣지 라벨로 간주 (플로우차트, ER 등)
    // 단, 특수 차트는 제외
    const isSequenceChart = svg.querySelector('.messageText') !== null

    if (!isSequenceChart) {
      const edgePaths = svg.querySelectorAll('path[stroke]:not([stroke="none"]), .edgePath path, path.edge, .edge path')
      if (debugMode) console.log(`연결선 찾음: ${edgePaths.length}개`)

      edgePaths.forEach((path) => {
        try {
          const pathBBox = path.getBBox()
          const pathCenterX = pathBBox.x + pathBBox.width / 2
          const pathCenterY = pathBBox.y + pathBBox.height / 2

          allTextElements.forEach((textEl) => {
            // 이미 처리된 요소는 건너뛰기
            if (textEl.closest('.nodeLabel') || textEl.closest('.node')) return
            if (textEl.closest('.edgeLabel') || textEl.closest('.edgeLabels')) return

            // 특수 클래스 제외 (간트 차트 등)
            const classes = String(textEl.className?.baseVal || textEl.className || '')
            const parentClasses = String(textEl.parentElement?.className?.baseVal || textEl.parentElement?.className || '')
            if (classes.includes('tick') || classes.includes('taskText') || classes.includes('sectionTitle') || classes.includes('titleText') || parentClasses.includes('tick')) return

            try {
              const textBBox = textEl.getBBox()
              const textCenterX = textBBox.x + textBBox.width / 2
              const textCenterY = textBBox.y + textBBox.height / 2

              // SVG 좌표계에서 거리 계산 (더 정확함)
              const distance = Math.sqrt(Math.pow(pathCenterX - textCenterX, 2) + Math.pow(pathCenterY - textCenterY, 2))
              // 거리 임계값을 더 작게 설정 (30px 이내)
              const threshold = 30

              // path의 경로상에 매우 가까운 텍스트만 엣지 라벨로 간주
              if (distance < threshold) {
                textEl.removeAttribute('fill')
                textEl.style.setProperty('fill', edgeLabelColor, 'important')
                textEl.style.fill = edgeLabelColor
                textEl.setAttribute('fill', edgeLabelColor)
                if (debugMode) console.log(`엣지 라벨 (거리) 적용: "${textEl.textContent.trim()}" -> ${edgeLabelColor} (거리: ${distance.toFixed(2)})`)
              }
            } catch {
              // getBBox 실패 시 무시
            }
          })
        } catch {
          // getBBox 실패 시 무시
        }
      })
    }

    // 3. 노드 텍스트 처리 - SVG text/tspan 요소
    let nodeTextCount = 0
    allTextElements.forEach((textEl) => {
      // 이미 처리된 요소는 건너뛰기
      // 참고: messageText는 CSS에서 처리됨 (mermaidStyleStorage.js)
      const currentFill = textEl.style.fill || textEl.getAttribute('fill')
      if (currentFill === edgeLabelColor || currentFill === lineColor) return
      if (textEl.closest('.edgeLabel') || textEl.closest('.edgeLabels')) return

      const parentClasses = String(textEl.parentElement?.className?.baseVal || textEl.parentElement?.className || '')
      const classes = String(textEl.className?.baseVal || textEl.className || '')

      // 노드 내부인지 확인
      const isNodeText =
        textEl.closest('.nodeLabel') !== null ||
        textEl.closest('.node') !== null ||
        textEl.closest('.flowchart-label') !== null ||
        textEl.closest('.actor') !== null ||
        textEl.closest('.participant') !== null ||
        textEl.closest('.classText') !== null ||
        textEl.closest('.labelText') !== null ||
        textEl.closest('.stateLabel') !== null ||
        textEl.closest('.entity') !== null ||
        textEl.closest('.classBox') !== null ||
        textEl.closest('.state') !== null ||
        classes.includes('nodeLabel') ||
        classes.includes('node') ||
        parentClasses.includes('node') ||
        parentClasses.includes('nodeLabel')

      // 노드 텍스트이거나 아무것도 아닌 경우 (기본값은 노드 텍스트로)
      // 엣지와 관련 없는 텍스트는 모두 노드 텍스트로 간주
      if (isNodeText || (!classes.includes('edge') && !parentClasses.includes('edge'))) {
        textEl.removeAttribute('fill')
        textEl.style.setProperty('fill', textColor, 'important')
        textEl.style.fill = textColor
        textEl.setAttribute('fill', textColor)
        nodeTextCount++
        if (debugMode) console.log(`노드 텍스트 적용: "${textEl.textContent.trim()}" -> ${textColor}`)
      }
    })

    // 3-1. 노드 텍스트 처리 - HTML 요소 (foreignObject 내부)
    const allHtmlElements = svg.querySelectorAll('span, p, div')
    let nodeHtmlCount = 0
    allHtmlElements.forEach((htmlEl) => {
      if (!htmlEl.textContent || htmlEl.textContent.trim() === '') return

      // 엣지 라벨은 제외
      // 참고: messageText는 CSS에서 처리됨 (mermaidStyleStorage.js)
      if (htmlEl.closest('.edgeLabel') !== null || htmlEl.closest('.edgeLabels') !== null || htmlEl.classList.contains('edgeLabel')) {
        return
      }

      // 노드 내부인지 확인
      const isNodeText =
        htmlEl.closest('.nodeLabel') !== null || htmlEl.closest('.node') !== null || htmlEl.closest('.flowchart-label') !== null || htmlEl.closest('.actor') !== null || htmlEl.closest('.participant') !== null || htmlEl.classList.contains('nodeLabel') || htmlEl.classList.contains('node')

      // 노드 텍스트인 경우 색상 적용
      if (isNodeText || !htmlEl.closest('.edgeLabel')) {
        htmlEl.style.setProperty('color', textColor, 'important')
        htmlEl.style.color = textColor
        // 내부의 모든 텍스트 요소도 처리
        const innerTexts = htmlEl.querySelectorAll('span, p, div, text, tspan')
        innerTexts.forEach((inner) => {
          if (inner.textContent && inner.textContent.trim() !== '') {
            if (inner.tagName === 'text' || inner.tagName === 'tspan') {
              inner.removeAttribute('fill')
              inner.style.setProperty('fill', textColor, 'important')
              inner.style.fill = textColor
              inner.setAttribute('fill', textColor)
            } else {
              inner.style.setProperty('color', textColor, 'important')
              inner.style.color = textColor
            }
          }
        })
        nodeHtmlCount++
        if (debugMode) console.log(`노드 텍스트 (HTML ${htmlEl.tagName}) 적용: "${htmlEl.textContent.trim()}" -> ${textColor}`)
      }
    })

    if (debugMode) {
      console.log(`노드 텍스트 적용 완료: SVG=${nodeTextCount}개, HTML=${nodeHtmlCount}개`)
      console.log(`색상 설정: edgeLabel=${edgeLabelColor}, text=${textColor}, line=${lineColor}`)
    }

    // 4. span 및 HTML 요소 처리 - 엣지 라벨만 추가로 확인 (노드 텍스트는 위에서 처리됨)
    // 위에서 처리되지 않은 엣지 라벨 HTML 요소 찾기
    // 참고: messageText는 CSS에서 처리됨 (mermaidStyleStorage.js)
    const edgeLabelHtmlElements = svg.querySelectorAll('.edgeLabel span, .edgeLabel p, .edgeLabel div, .edgeLabels span, .edgeLabels p, .edgeLabels div')
    edgeLabelHtmlElements.forEach((htmlEl) => {
      if (!htmlEl.textContent || htmlEl.textContent.trim() === '') return

      htmlEl.style.setProperty('color', edgeLabelColor, 'important')
      htmlEl.style.color = edgeLabelColor
      // HTML 요소 내부의 모든 텍스트 요소도 처리
      const innerElements = htmlEl.querySelectorAll('span, p, div')
      innerElements.forEach((inner) => {
        if (inner.textContent && inner.textContent.trim() !== '') {
          inner.style.setProperty('color', edgeLabelColor, 'important')
          inner.style.color = edgeLabelColor
          if (debugMode) console.log(`  엣지 라벨 (HTML 내부 ${inner.tagName}) 적용: "${inner.textContent.trim()}" -> ${edgeLabelColor}`)
        }
      })
      if (debugMode) console.log(`  엣지 라벨 (HTML ${htmlEl.tagName}) 적용: "${htmlEl.textContent.trim()}" -> ${edgeLabelColor}`)
    })

    // 스타일을 다시 주입하여 최신 테마 색상 적용
    const mermaidId = blockElement.getAttribute('data-mermaid-id')
    if (mermaidId) {
      styleCache.delete(mermaidId)
      // 약간의 지연 후 주입하여 DOM 업데이트 보장
      setTimeout(() => {
        injectMermaidStyles(mermaidId)
      }, 50)
    }
  }

  /**
   * 테마 변경 시 모든 Mermaid 블록의 스타일 재적용
   * 외부에서 호출할 수 있도록 함수로 노출
   */
  function reapplyMermaidStyles() {
    if (containerRef.value) {
      const mermaidBlocks = containerRef.value.querySelectorAll('.mermaid-block[data-mermaid-rendered="true"]')
      mermaidBlocks.forEach((block) => {
        const mermaidId = block.getAttribute('data-mermaid-id')
        if (mermaidId) {
          // 스타일 캐시 초기화 후 재적용
          styleCache.delete(mermaidId)
          injectMermaidStyles(mermaidId)
          // SVG 내부 스타일도 강제 적용
          forceApplyThemeStyles(block)
        }
      })
    }
  }

  /**
   * MutationObserver를 사용하여 DOM 변경 감지 및 자동 렌더링
   */
  function setupMutationObserver() {
    if (!containerRef.value || mutationObserver) return

    mutationObserver = new MutationObserver(() => {
      // 변경사항이 있으면 렌더링 시도 (디바운싱)
      if (renderTimeout) {
        clearTimeout(renderTimeout)
      }

      renderTimeout = setTimeout(() => {
        const hasNewBlocks = containerRef.value?.querySelectorAll('.mermaid-block:not([data-mermaid-rendered])').length > 0
        if (hasNewBlocks) {
          renderMermaid(0, 3, true) // 강제 실행 (force=true)
        }
      }, 200)
    })

    // 컨테이너의 변경사항 감지 시작
    if (containerRef.value) {
      mutationObserver.observe(containerRef.value, {
        childList: true,
        subtree: true,
        attributes: false,
      })
    }
  }

  /**
   * MutationObserver 정리
   */
  function cleanupMutationObserver() {
    if (mutationObserver) {
      mutationObserver.disconnect()
      mutationObserver = null
    }
    if (renderTimeout) {
      clearTimeout(renderTimeout)
      renderTimeout = null
    }
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    isRendering = false
  }

  // 컨테이너가 준비되면 Observer 설정
  const checkAndSetupObserver = () => {
    if (containerRef.value && !mutationObserver) {
      setupMutationObserver()
      // 초기 렌더링도 시도
      setTimeout(() => renderMermaid(), 100)
    }
  }

  // Vue의 watchEffect나 watch를 사용할 수 없으므로, renderMermaid 호출 시마다 체크
  // 디바운싱이 적용된 래퍼 함수
  const renderMermaidWithObserver = async () => {
    checkAndSetupObserver()

    // 디바운싱 적용
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(async () => {
      await renderMermaid()
    }, 100)
  }

  return {
    renderMermaid: renderMermaidWithObserver,
    reapplyMermaidStyles, // 테마 변경 시 호출할 함수
    cleanup: cleanupMutationObserver,
  }
}
