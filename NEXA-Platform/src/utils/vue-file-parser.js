/**
 * Vue 파일 파싱 유틸리티
 * Vue 파일을 template, script, style로 분리하고 다시 합치는 기능 제공
 */

/**
 * Vue 파일 내용을 template, script, style로 분리
 * @param {string} content - Vue 파일 전체 내용
 * @returns {Object} 파싱된 객체 { template, script, style, beforeTemplate, afterStyle }
 */
export function parseVueFile(content) {
  // template 섹션 찾기 (최상위 template 태그만 매칭)
  // depth를 계산하여 중첩된 template 태그를 올바르게 처리
  let templateMatch = null
  const templateStartRegex = /<template[^>]*>/
  const templateStartMatch = content.match(templateStartRegex)

  if (templateStartMatch) {
    const startIndex = templateStartMatch.index
    const startTag = templateStartMatch[0]
    let depth = 1
    let currentIndex = startIndex + startTag.length

    // 최상위 template 태그의 닫는 태그 찾기
    while (depth > 0 && currentIndex < content.length) {
      const nextOpen = content.indexOf('<template', currentIndex)
      const nextClose = content.indexOf('</template>', currentIndex)

      if (nextClose === -1) break

      if (nextOpen !== -1 && nextOpen < nextClose) {
        // 중첩된 template 태그 발견
        depth++
        currentIndex = nextOpen + '<template'.length
      } else {
        // 닫는 태그 발견
        depth--
        if (depth === 0) {
          // 최상위 template 태그의 닫는 태그
          const templateContent = content.substring(startIndex + startTag.length, nextClose)
          const fullTemplate = content.substring(startIndex, nextClose + '</template>'.length)
          templateMatch = [fullTemplate, templateContent]
          break
        }
        currentIndex = nextClose + '</template>'.length
      }
    }
  }
  // script 섹션 찾기 (setup, lang 등 속성 고려)
  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  // style 섹션 찾기 (scoped, lang 등 속성 고려)
  const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/)

  // 각 섹션의 시작 위치와 전체 태그 정보 저장
  const result = {
    template: '',
    script: '',
    style: '',
    templateAttrs: '',
    scriptAttrs: '',
    styleAttrs: '',
    beforeTemplate: '',
    betweenTemplateScript: '',
    betweenScriptStyle: '',
    afterStyle: '',
  }

  // template 처리
  if (templateMatch) {
    const fullTemplate = templateMatch[0]
    const templateStart = content.indexOf(fullTemplate)
    // .trim() 대신 앞뒤 줄바꿈만 제거하여 들여쓰기 유지
    let templateContent = templateMatch[1]

    // 앞의 줄바꿈만 제거 (들여쓰기는 유지)
    templateContent = templateContent.replace(/^\n+/, '')
    // 뒤의 줄바꿈만 제거
    templateContent = templateContent.replace(/\n+$/, '')

    // 첫 번째 비어있지 않은 줄의 들여쓰기 찾기
    const lines = templateContent.split('\n')
    let firstNonEmptyLineIndent = ''

    for (const line of lines) {
      const trimmed = line.trimLeft()
      if (trimmed.length > 0) {
        // 첫 번째 비어있지 않은 줄의 들여쓰기 추출
        firstNonEmptyLineIndent = line.substring(0, line.length - trimmed.length)
        break
      }
    }

    // 첫 줄의 들여쓰기를 기준으로 정규화 (있는 경우에만)
    if (firstNonEmptyLineIndent.length > 0) {
      const normalizedLines = lines.map((line) => {
        // 빈 줄은 그대로
        if (line.trim().length === 0) return line
        // 첫 줄의 들여쓰기만큼 제거
        if (line.startsWith(firstNonEmptyLineIndent)) {
          return line.substring(firstNonEmptyLineIndent.length)
        }
        return line
      })
      templateContent = normalizedLines.join('\n')
    }

    result.template = templateContent
    // template 태그의 속성 추출
    const templateTagMatch = fullTemplate.match(/<template([^>]*)>/)
    result.templateAttrs = templateTagMatch ? templateTagMatch[1].trim() : ''
    result.beforeTemplate = content.substring(0, templateStart)
  } else {
    result.beforeTemplate = content
  }

  // script 처리
  if (scriptMatch) {
    const fullScript = scriptMatch[0]
    const scriptStart = content.indexOf(fullScript)
    // .trim() 대신 앞뒤 줄바꿈만 제거하여 들여쓰기 유지
    let scriptContent = scriptMatch[1]
    scriptContent = scriptContent.replace(/^\n+/, '')
    scriptContent = scriptContent.replace(/\n+$/, '')
    result.script = scriptContent
    // script 태그의 속성 추출
    const scriptTagMatch = fullScript.match(/<script([^>]*)>/)
    result.scriptAttrs = scriptTagMatch ? scriptTagMatch[1].trim() : ''

    // template과 script 사이의 내용
    if (templateMatch) {
      const templateEnd = content.indexOf('</template>') + '</template>'.length
      result.betweenTemplateScript = content.substring(templateEnd, scriptStart)
    }
  }

  // style 처리
  if (styleMatch) {
    const fullStyle = styleMatch[0]
    const styleStart = content.indexOf(fullStyle)
    // .trim() 대신 앞뒤 줄바꿈만 제거하여 들여쓰기 유지
    let styleContent = styleMatch[1]
    styleContent = styleContent.replace(/^\n+/, '')
    styleContent = styleContent.replace(/\n+$/, '')
    result.style = styleContent
    // style 태그의 속성 추출
    const styleTagMatch = fullStyle.match(/<style([^>]*)>/)
    result.styleAttrs = styleTagMatch ? styleTagMatch[1].trim() : ''

    // script와 style 사이의 내용
    if (scriptMatch) {
      const scriptEnd = content.indexOf('</script>', scriptMatch.index) + '</script>'.length
      result.betweenScriptStyle = content.substring(scriptEnd, styleStart)
    }

    // style 이후의 내용
    const styleEnd = content.indexOf('</style>', styleMatch.index) + '</style>'.length
    result.afterStyle = content.substring(styleEnd)
  } else if (scriptMatch) {
    // style이 없으면 script 이후의 내용
    const scriptEnd = content.indexOf('</script>', scriptMatch.index) + '</script>'.length
    result.afterStyle = content.substring(scriptEnd)
  }

  return result
}

/**
 * 파싱된 Vue 파일 섹션을 다시 합치기
 * @param {Object} parsed - parseVueFile의 결과 객체
 * @returns {string} 합쳐진 Vue 파일 내용
 */
export function combineVueFile(parsed) {
  let content = parsed.beforeTemplate || ''

  // template 추가
  if (parsed.template !== undefined) {
    const templateAttrs = parsed.templateAttrs ? ` ${parsed.templateAttrs}` : ''
    content += `<template${templateAttrs}>\n${parsed.template}\n</template>\n`
  }

  // template과 script 사이의 내용
  if (parsed.betweenTemplateScript) {
    content += parsed.betweenTemplateScript
  }

  // script 추가
  if (parsed.script !== undefined) {
    const scriptAttrs = parsed.scriptAttrs ? ` ${parsed.scriptAttrs}` : ''
    content += `<script${scriptAttrs}>\n${parsed.script}\n</script>\n`
  }

  // script와 style 사이의 내용
  if (parsed.betweenScriptStyle) {
    content += parsed.betweenScriptStyle
  }

  // style 추가
  if (parsed.style !== undefined) {
    const styleAttrs = parsed.styleAttrs ? ` ${parsed.styleAttrs}` : ''
    content += `<style${styleAttrs}>\n${parsed.style}\n</style>\n`
  }

  // style 이후의 내용
  if (parsed.afterStyle) {
    content += parsed.afterStyle
  }

  return content
}
