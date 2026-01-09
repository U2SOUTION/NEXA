/**
 * diagramTheme.js
 * 다이어그램 테마 관리
 */

/**
 * 노드 스타일 기본값
 */
export const defaultNodeStyle = {
  fill: 'var(--nexa-surface)',
  stroke: 'var(--nexa-border-color)',
  strokeWidth: '2px',
  rx: '4px',
  ry: '4px',
}

/**
 * 선택된 노드 스타일
 */
export const selectedNodeStyle = {
  fill: 'var(--nexa-primary)',
  stroke: 'var(--nexa-primary)',
  strokeWidth: '4px',
  filter: 'drop-shadow(0 4px 8px rgba(0, 118, 253, 0.5))',
  opacity: '1',
}

/**
 * 엣지 스타일 기본값
 */
export const defaultEdgeStyle = {
  stroke: 'var(--nexa-primary)',
  strokeWidth: '2px',
  fill: 'none',
}

/**
 * 노드 라벨 스타일 기본값
 */
export const defaultLabelStyle = {
  fill: 'var(--nexa-text-primary)',
  fontSize: '14px',
  fontWeight: '600',
}

/**
 * 선택된 노드 라벨 스타일
 */
export const selectedLabelStyle = {
  fill: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
}

/**
 * 노드 스타일 생성
 * @param {Boolean} isSelected - 선택 여부
 * @param {Object} customStyle - 사용자 정의 스타일
 * @returns {String} CSS 스타일 문자열
 */
export function createNodeStyle(isSelected = false, customStyle = {}) {
  const baseStyle = isSelected ? selectedNodeStyle : defaultNodeStyle
  const style = { ...baseStyle, ...customStyle }
  
  return Object.entries(style)
    .map(([key, value]) => {
      // camelCase를 kebab-case로 변환
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `${kebabKey}: ${value};`
    })
    .join(' ')
}

/**
 * 엣지 스타일 생성
 * @param {Object} customStyle - 사용자 정의 스타일
 * @returns {String} CSS 스타일 문자열
 */
export function createEdgeStyle(customStyle = {}) {
  const style = { ...defaultEdgeStyle, ...customStyle }
  
  return Object.entries(style)
    .map(([key, value]) => {
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `${kebabKey}: ${value};`
    })
    .join(' ')
}

/**
 * 라벨 스타일 생성
 * @param {Boolean} isSelected - 선택 여부
 * @param {Object} customStyle - 사용자 정의 스타일
 * @returns {String} CSS 스타일 문자열
 */
export function createLabelStyle(isSelected = false, customStyle = {}) {
  const baseStyle = isSelected ? selectedLabelStyle : defaultLabelStyle
  const style = { ...baseStyle, ...customStyle }
  
  return Object.entries(style)
    .map(([key, value]) => {
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `${kebabKey}: ${value};`
    })
    .join(' ')
}
