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
  // template 섹션 찾기
  const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/)
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
    result.template = templateMatch[1].trim()
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
    result.script = scriptMatch[1].trim()
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
    result.style = styleMatch[1].trim()
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

