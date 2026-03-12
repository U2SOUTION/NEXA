/**
 * 사용 예제 코드 생성 유틸리티
 * Vue 컴파일러가 인식하지 않도록 별도 파일로 분리
 */

/**
 * 사용 예제 코드 생성
 * @param {string} componentName - 컴포넌트 이름
 * @param {string} importPath - Import 경로
 * @param {string} displayName - 표시 이름
 * @returns {string} 사용 예제 코드
 */
export function generateUsageExample(componentName: string, importPath: string, displayName: string): string {
  const parts: string[] = []
  parts.push('<')
  parts.push('template>')
  parts.push('\n')
  parts.push('  <div>\n')
  parts.push('    <h3>')
  parts.push(displayName)
  parts.push(' 사용 예제</h3>\n')
  parts.push('    <')
  parts.push(componentName)
  parts.push(' />\n')
  parts.push('  </div>\n')
  parts.push('</')
  parts.push('template>')
  parts.push('\n\n')
  parts.push('<')
  parts.push('script')
  parts.push(' ')
  parts.push('setup>')
  parts.push('\n')
  parts.push('import ')
  parts.push(componentName)
  parts.push(" from '")
  parts.push(importPath)
  parts.push("'\n")
  parts.push('</')
  parts.push('script>')

  return parts.join('')
}
