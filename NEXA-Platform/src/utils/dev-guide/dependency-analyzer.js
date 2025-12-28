/**
 * 개발 가이드용 의존성 분석 유틸리티
 * 샘플 파일의 import 문과 의존성을 분석
 */

/**
 * 파일 내용에서 import 문 추출
 * @param {string} content - 파일 내용
 * @returns {Array<Object>} import 정보 배열 { type, path, name, fullPath }
 */
export function extractImports(content) {
  const imports = []
  
  // script 섹션 추출
  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!scriptMatch) return imports
  
  const scriptContent = scriptMatch[1]
  
  // import 패턴들
  const patterns = [
    // import Component from './path/to/Component.vue'
    // import { func } from './utils'
    // import Component from '@/components/path'
    {
      pattern: /import\s+([\w\s,{}*]+)\s+from\s+['"]([^'"]+)['"]/g,
      type: 'module'
    },
    // import('./path/to/Component.vue')
    {
      pattern: /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      type: 'dynamic'
    },
    // defineAsyncComponent(() => import('./path/to/Component.vue'))
    {
      pattern: /defineAsyncComponent\s*\(\s*\(\)\s*=>\s*import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      type: 'async-component'
    }
  ]
  
  for (const { pattern, type } of patterns) {
    let match
    while ((match = pattern.exec(scriptContent)) !== null) {
      const importPath = type === 'module' ? match[2] : match[1]
      const importName = type === 'module' ? match[1].trim() : null
      
      // 외부 라이브러리 제외 (vue, quasar 등)
      if (importPath.startsWith('vue') || 
          importPath.startsWith('quasar') ||
          importPath.startsWith('pinia') ||
          importPath.startsWith('@quasar')) {
        continue
      }
      
      // import 이름에서 실제 컴포넌트명 추출
      let componentName = null
      if (importName) {
        // import Component from '...'
        const defaultMatch = importName.match(/^(\w+)(?:\s|,|$)/)
        if (defaultMatch) {
          componentName = defaultMatch[1]
        } else {
          // import { Component } from '...'
          const namedMatch = importName.match(/\{([^}]+)\}/)
          if (namedMatch) {
            componentName = namedMatch[1].split(',')[0].trim()
          }
        }
      }
      
      imports.push({
        type,
        path: importPath,
        name: componentName,
        fullPath: null // 나중에 resolveImportPath로 계산
      })
    }
  }
  
  return [...new Map(imports.map(imp => [imp.path, imp])).values()] // 중복 제거
}

/**
 * 상대 경로를 절대 경로로 변환
 * @param {string} importPath - import 경로
 * @param {string} basePath - 현재 파일 경로 (예: 'guides/styles/buttons/IconButton.vue')
 * @returns {string} 절대 경로
 */
export function resolveImportPath(importPath, basePath) {
  // 이미 절대 경로인 경우 (src/ 또는 @/로 시작)
  if (importPath.startsWith('src/') || importPath.startsWith('@/')) {
    return importPath.replace('@/', 'src/')
  }
  
  // 상대 경로인 경우
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    const baseDir = basePath.substring(0, basePath.lastIndexOf('/'))
    const pathParts = baseDir.split('/').filter(p => p)
    const importParts = importPath.split('/')
    
    for (const part of importParts) {
      if (part === '.') {
        continue
      } else if (part === '..') {
        pathParts.pop()
      } else {
        pathParts.push(part)
      }
    }
    
    return 'src/' + pathParts.join('/')
  }
  
  // 그 외의 경우 (node_modules 등)
  return importPath
}

/**
 * SCSS 변수 사용 여부 확인
 * @param {string} content - 파일 내용 (style 섹션 또는 전체)
 * @returns {Array<string>} 사용된 SCSS 변수 목록
 */
export function extractSCSSVariables(content) {
  const variables = []
  const varPattern = /var\(--nexa-[\w-]+\)/g
  
  let match
  while ((match = varPattern.exec(content)) !== null) {
    const varName = match[0]
    if (!variables.includes(varName)) {
      variables.push(varName)
    }
  }
  
  return variables
}

/**
 * 전역 SCSS 파일 의존성 확인
 * @param {string} content - 파일 내용
 * @returns {Object} SCSS 의존성 정보
 */
export function analyzeSCSSDependencies(content) {
  const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/)
  if (!styleMatch) {
    return {
      usesGlobalVariables: false,
      variables: [],
      globalFiles: []
    }
  }
  
  const styleContent = styleMatch[1]
  const variables = extractSCSSVariables(styleContent)
  
  // 전역 SCSS 파일 목록 (일반적으로 사용되는 파일들)
  const globalSCSSFiles = [
    'src/css/themes/dark.scss',
    'src/css/themes/light.scss',
    'src/css/nexa-system/nexa-system.scss',
    'src/css/app.scss'
  ]
  
  return {
    usesGlobalVariables: variables.length > 0,
    variables: variables,
    globalFiles: variables.length > 0 ? globalSCSSFiles : []
  }
}

/**
 * 샘플 파일의 전체 의존성 분석
 * @param {string} content - 파일 내용
 * @param {string} filePath - 파일 경로 (예: 'guides/styles/buttons/IconButton.vue')
 * @returns {Object} 의존성 정보
 */
export function analyzeSampleDependencies(content, filePath) {
  const imports = extractImports(content)
  const scssDeps = analyzeSCSSDependencies(content)
  
  // import 경로를 절대 경로로 변환
  const resolvedImports = imports.map(imp => ({
    ...imp,
    fullPath: resolveImportPath(imp.path, filePath)
  }))
  
  // 컴포넌트와 유틸리티 분류
  const components = resolvedImports.filter(imp => 
    imp.fullPath.endsWith('.vue') || 
    imp.fullPath.includes('/components/') ||
    imp.fullPath.includes('/guides/')
  )
  
  const utilities = resolvedImports.filter(imp => 
    imp.fullPath.includes('/utils/') ||
    imp.fullPath.includes('/composables/')
  )
  
  const styles = resolvedImports.filter(imp => 
    imp.fullPath.endsWith('.scss') ||
    imp.fullPath.endsWith('.css')
  )
  
  return {
    imports: resolvedImports,
    components,
    utilities,
    styles,
    scss: scssDeps
  }
}

