/**
 * 테마 색상 변수 파서
 *
 * 활성 테마의 모든 CSS 색상 변수를 추출하고 카테고리별로 분류합니다.
 * 변수명 패턴 기반으로 자동 분류하며, 주석은 참고 자료로만 활용합니다.
 */

/**
 * CSS 변수 값이 색상인지 검증
 * @param {string} value - CSS 변수 값
 * @returns {boolean}
 */
function isColorValue(value: string): boolean {
  if (!value || typeof value !== 'string') return false

  const trimmed = value.trim()

  // hex 색상 (#rgb, #rrggbb, #rrggbbaa)
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(trimmed)) {
    return true
  }

  // rgb/rgba 색상
  if (/^rgba?\(/.test(trimmed)) {
    return true
  }

  // hsl/hsla 색상
  if (/^hsla?\(/.test(trimmed)) {
    return true
  }

  // named colors (기본 색상명)
  const namedColors = ['transparent', 'currentcolor', 'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta']
  if (namedColors.includes(trimmed.toLowerCase())) {
    return true
  }

  return false
}

/**
 * var() 참조를 실제 값으로 해석 (재귀적으로)
 * @param {string} value - CSS 변수 값
 * @param {Object} computedStyle - getComputedStyle 결과
 * @param {Set<string>} visited - 순환 참조 방지
 * @returns {string} 실제 색상 값
 */
function resolveVarReference(value: string, computedStyle: CSSStyleDeclaration, visited = new Set<string>()): string {
  if (!value || typeof value !== 'string') return value

  const trimmed = value.trim()

  // var() 패턴 매칭
  const varMatch = trimmed.match(/^var\((--[^)]+)\)/)
  if (!varMatch) {
    return trimmed
  }

  const varName = varMatch[1]

  // 순환 참조 방지
  if (visited.has(varName)) {
    return trimmed
  }

  visited.add(varName)

  // CSS 변수 값 가져오기
  const varValue = computedStyle.getPropertyValue(varName)?.trim()

  if (!varValue) {
    return trimmed
  }

  // 재귀적으로 var() 해석
  return resolveVarReference(varValue, computedStyle, visited)
}

/**
 * 변수명 패턴으로 카테고리 분류 (순수 변수명 기반 자동 분류)
 * @param {string} varName - CSS 변수명 (예: --nexa-primary)
 * @returns {string} 카테고리명 (영문)
 */
function classifyCategory(varName: string): string {
  // --nexa- 접두사 제거
  const name = varName.replace(/^--nexa-/, '')

  // 하이픈 개수 확인
  const hyphenCount = (name.match(/-/g) || []).length

  // 하이픈이 1개만 있으면 (--nexa-{단일단어}) → "nexa" 카테고리
  if (hyphenCount === 0) {
    return 'nexa'
  }

  // 하이픈이 2개 이상이면 첫 번째 단어를 카테고리로 사용
  const parts = name.split('-')
  return parts[0] || 'other'
}

/**
 * 카테고리명 포맷팅 (첫 글자 대문자)
 * @param {string} category - 카테고리명 (예: "text", "background", "nexa")
 * @returns {string} 포맷팅된 카테고리명 (예: "Text", "Background", "NEXA")
 */
function formatCategoryName(category: string): string {
  if (!category) return 'Other'

  // nexa는 특수 처리: NEXA로 표시
  if (category === 'nexa') {
    return 'NEXA'
  }

  // 첫 글자만 대문자로 변환
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
}

/**
 * document.styleSheets에서 CSS 변수 추출
 * @returns {Map<string, string>} 변수명 -> 원시 값 매핑
 */
function extractCssVariablesFromStylesheets() {
  const variables = new Map()

  try {
    // 모든 스타일시트 순회
    for (const stylesheet of Array.from(document.styleSheets)) {
      try {
        // cssRules 접근 가능 여부 확인 (CORS 체크)
        let cssRules = null
        try {
          cssRules = stylesheet.cssRules
        } catch {
          // CORS 오류: 이 스타일시트는 건너뛰기
          continue
        }

        // CSS 규칙 순회
        if (cssRules) {
          for (const rule of Array.from(cssRules)) {
            if (!('style' in rule)) continue
            const styleRule = rule as CSSStyleRule
            if (styleRule.style) {
              for (let i = 0; i < styleRule.style.length; i++) {
                const property = styleRule.style[i]
                if (property && property.startsWith('--nexa-')) {
                  const value = styleRule.style.getPropertyValue(property)?.trim()
                  if (value && !variables.has(property)) {
                    variables.set(property, value)
                  }
                }
              }
            }

            // CSS 텍스트에서 직접 파싱 (더 확실한 방법)
            if (rule.cssText) {
              // --nexa-로 시작하는 CSS 변수 찾기
              const varRegex = /--nexa-[a-zA-Z0-9-]+:\s*([^;]+);/g
              let match
              while ((match = varRegex.exec(rule.cssText)) !== null) {
                const fullMatch = match[0]
                const varNameMatch = fullMatch.match(/--nexa-[a-zA-Z0-9-]+/)
                if (varNameMatch) {
                  const varName = varNameMatch[0]
                  const varValue = match[1].trim()
                  if (!variables.has(varName)) {
                    variables.set(varName, varValue)
                  }
                }
              }
            }
          }
        }
      } catch {
        // 개별 스타일시트 오류는 조용히 무시 (정상적인 상황일 수 있음)
        // CORS 제한이나 다른 보안 정책으로 인한 접근 불가
      }
    }
  } catch {
    // 전체 순회 오류는 조용히 무시
  }

  return variables
}

/**
 * 활성 테마의 모든 색상 변수 추출 및 카테고리별 분류
 * @returns {Array<{category: string, colors: Array<{name: string, value: string}>}>}
 */
export function extractThemeColors() {
  // document.documentElement와 document.body 모두에서 시도
  // body.dark 선택자 안의 변수는 body에서 읽어야 할 수 있음
  const rootStyle = getComputedStyle(document.documentElement)
  const bodyStyle = getComputedStyle(document.body)
  const colorMap = new Map()

  // 방법 1: document.styleSheets에서 CSS 변수 추출
  const cssVariables = extractCssVariablesFromStylesheets()

  console.log('[extractThemeColors] 스타일시트에서 발견된 변수:', cssVariables.size)

  // getComputedStyle에서 직접 읽기 (활성화된 변수)
  // computed value는 이미 브라우저가 var() 참조를 해석한 값이므로 그대로 사용
  let processedCount = 0
  let colorCount = 0
  let skippedCount = 0
  let nexaVarCount = 0
  let emptyValueCount = 0

  // 디버깅: 처음 몇 개의 변수명 확인
  const sampleVars = Array.from(cssVariables.keys()).slice(0, 5)
  console.log('[extractThemeColors] 샘플 변수명:', sampleVars)

  for (const varName of cssVariables.keys()) {
    if (!varName.startsWith('--nexa-')) continue

    nexaVarCount++

    // document.documentElement에서 먼저 시도, 없으면 body에서 시도
    let computedValue = rootStyle.getPropertyValue(varName)?.trim()
    if (!computedValue) {
      computedValue = bodyStyle.getPropertyValue(varName)?.trim()
    }

    // 디버깅: 처음 몇 개의 nexa 변수 확인
    if (nexaVarCount <= 5) {
      const rootValue = rootStyle.getPropertyValue(varName)?.trim()
      const bodyValue = bodyStyle.getPropertyValue(varName)?.trim()
      console.log(`[extractThemeColors] 변수 확인: ${varName}`)
      console.log(`  - documentElement: "${rootValue || '(empty)'}"`)
      console.log(`  - body: "${bodyValue || '(empty)'}"`)
      console.log(`  - 최종 사용: "${computedValue || '(empty)'}"`)
    }

    if (!computedValue) {
      emptyValueCount++
      skippedCount++
      continue
    }

    processedCount++

    // computed value는 이미 var() 참조가 해석된 값이므로 그대로 사용
    // 다만 혹시 모를 중첩 참조가 있을 수 있으므로 한 번 더 해석 시도
    let resolvedValue = computedValue
    if (computedValue.startsWith('var(')) {
      // 아직 var() 참조가 남아있다면 해석 (bodyStyle 사용)
      resolvedValue = resolveVarReference(computedValue, bodyStyle)
    }

    // 색상 값인지 검증
    if (!isColorValue(resolvedValue)) {
      // 디버깅: 처음 몇 개의 비색상 값 로그
      if (skippedCount < 5) {
        console.log(`[extractThemeColors] 비색상 값 건너뜀: ${varName} = "${resolvedValue}"`)
      }
      skippedCount++
      continue
    }

    colorCount++
    const category = classifyCategory(varName)

    if (!colorMap.has(category)) {
      colorMap.set(category, [])
    }

    colorMap.get(category).push({
      name: varName,
      value: resolvedValue,
    })
  }

  console.log('[extractThemeColors] --nexa- 변수 개수:', nexaVarCount)
  console.log('[extractThemeColors] 빈 값 변수 개수:', emptyValueCount)
  console.log('[extractThemeColors] 처리된 변수:', processedCount)
  console.log('[extractThemeColors] 색상 변수:', colorCount)
  console.log('[extractThemeColors] 건너뛴 변수:', skippedCount)

  console.log('[extractThemeColors] 발견된 색상 변수 개수:', Array.from(colorMap.values()).flat().length)
  console.log('[extractThemeColors] 카테고리 개수:', colorMap.size)

  const result: Array<{ category: string; categoryDisplay: string; colors: Array<{ name: string; value: string }> }> = []

  for (const [category, colors] of colorMap.entries()) {
    result.push({
      category, // 영문 카테고리명
      categoryDisplay: formatCategoryName(category), // 표시용 (첫 글자 대문자)
      colors: colors.sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)),
    })
  }

  // 정렬: nexa는 맨 위, 나머지는 알파벳 순
  result.sort((a: { category: string }, b: { category: string }) => {
    if (a.category === 'nexa') return -1
    if (b.category === 'nexa') return 1
    return a.category.localeCompare(b.category)
  })

  return result
}
