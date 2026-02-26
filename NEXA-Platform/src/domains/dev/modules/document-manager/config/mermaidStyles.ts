/**
 * Mermaid 다이어그램 스타일 중앙 관리 모듈
 * 테마별 기본 색상 및 스타일 정의
 */

export interface MermaidThemeStyle {
  nodeBg: string
  nodeBorder: string
  lineColor: string
  nodeText: string
  edgeText: string
  nodeBorderWidth: number
  lineWidth: number
  textSize: number
  edgeLabelSize: number
  lineStyle: string
  textWeight: string
  edgeLabelWeight: string
  textAlign: string
  nodeBorderRadius: number
  nodeOpacity: number
  lineOpacity: number
  nodeShadow: boolean
  nodeShadowBlur: number
  nodeShadowOffsetX: number
  nodeShadowOffsetY: number
  nodeShadowColor: string
}

export type MermaidThemeKey = 'dark' | 'light'

export const MERMAID_DEFAULT_STYLES: Record<MermaidThemeKey, MermaidThemeStyle> = {
  dark: {
    nodeBg: '#25b416',
    nodeBorder: '#444444',
    lineColor: '#0e0e0e',
    nodeText: '#e8e7ea',
    edgeText: '#90f109',
    nodeBorderWidth: 2,
    lineWidth: 2,
    textSize: 14,
    edgeLabelSize: 14,
    lineStyle: 'solid',
    textWeight: 'normal',
    edgeLabelWeight: 'normal',
    textAlign: 'center',
    nodeBorderRadius: 0,
    nodeOpacity: 1.0,
    lineOpacity: 1.0,
    nodeShadow: false,
    nodeShadowBlur: 4,
    nodeShadowOffsetX: 2,
    nodeShadowOffsetY: 2,
    nodeShadowColor: '#000000',
  },
  light: {
    nodeBg: '#2196f3',
    nodeBorder: '#1976d2',
    lineColor: '#1976d2',
    nodeText: '#000000',
    edgeText: '#000000',
    nodeBorderWidth: 2,
    lineWidth: 2,
    textSize: 14,
    edgeLabelSize: 14,
    lineStyle: 'solid',
    textWeight: 'normal',
    edgeLabelWeight: 'normal',
    textAlign: 'center',
    nodeBorderRadius: 0,
    nodeOpacity: 1.0,
    lineOpacity: 1.0,
    nodeShadow: false,
    nodeShadowBlur: 4,
    nodeShadowOffsetX: 2,
    nodeShadowOffsetY: 2,
    nodeShadowColor: '#000000',
  },
}

export function getCurrentMermaidStyles(): MermaidThemeStyle {
  const isDark = document.body.classList.contains('dark')
  return MERMAID_DEFAULT_STYLES[isDark ? 'dark' : 'light']
}

export function getMermaidStylesByTheme(theme: MermaidThemeKey): MermaidThemeStyle {
  return MERMAID_DEFAULT_STYLES[theme] || MERMAID_DEFAULT_STYLES.light
}

export interface MermaidColors {
  nodeBg: string
  nodeBorder: string
  lineColor: string
  nodeText: string
  edgeText: string
}

/** @deprecated getCurrentMermaidStyles() 사용 권장 */
export function getCurrentMermaidColors(): MermaidColors {
  const styles = getCurrentMermaidStyles()
  return {
    nodeBg: styles.nodeBg,
    nodeBorder: styles.nodeBorder,
    lineColor: styles.lineColor,
    nodeText: styles.nodeText,
    edgeText: styles.edgeText,
  }
}

/** @deprecated getMermaidStylesByTheme() 사용 권장 */
export function getMermaidColorsByTheme(theme: MermaidThemeKey): MermaidColors {
  const styles = getMermaidStylesByTheme(theme)
  return {
    nodeBg: styles.nodeBg,
    nodeBorder: styles.nodeBorder,
    lineColor: styles.lineColor,
    nodeText: styles.nodeText,
    edgeText: styles.edgeText,
  }
}
