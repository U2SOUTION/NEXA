/**
 * Mermaid 다이어그램 스타일 중앙 관리 모듈
 * 테마별 기본 색상 및 스타일 정의
 * 사용자가 설정한 값은 별도 CSS 파일로 저장됨
 */

/**
 * 다크/라이트 테마별 기본 스타일 설정
 */
export const MERMAID_DEFAULT_STYLES = {
  dark: {
    // 색상 (Color)
    nodeBg: '#25b416', // 노드 배경색 (녹색 - Green) - #25b416
    nodeBorder: '#444444', // 노드 테두리 색상 (회색 - Gray) - #444444
    lineColor: '#0e0e0e', // 라인 색상 (거의 검정 - Almost Black) - #0e0e0e
    nodeText: '#e8e7ea', // 노드 내부 텍스트 색상 (밝은 회색 - Light Gray) - #e8e7ea
    edgeText: '#90f109', // 연결선 라벨 텍스트 색상 (라임 그린 - Lime Green) - #90f109

    // 크기/두께 (Size/Width)
    nodeBorderWidth: 2, // 노드 테두리 두께 (px)
    lineWidth: 2, // 라인 두께 (px)
    textSize: 14, // 노드 텍스트 크기 (px)
    edgeLabelSize: 14, // 엣지 라벨 텍스트 크기 (px)

    // 라인 스타일 (Line Style)
    lineStyle: 'solid', // 라인 스타일: 'solid', 'dashed', 'dotted'

    // 텍스트 스타일 (Text Style)
    textWeight: 'normal', // 텍스트 굵기: 'normal', 'bold'
    edgeLabelWeight: 'normal', // 엣지 라벨 텍스트 굵기: 'normal', 'bold'
    textAlign: 'center', // 텍스트 정렬: 'left', 'center', 'right'

    // 도형 스타일 (Shape Style)
    nodeBorderRadius: 0, // 노드 모서리 반경 (px) - 사각형 노드에만 적용
    nodeOpacity: 1.0, // 노드 투명도: 0.0-1.0
    lineOpacity: 1.0, // 라인 투명도: 0.0-1.0

    // 그림자 효과 (Shadow) - 향후 구현
    nodeShadow: false, // 노드 그림자 활성화 여부
    nodeShadowBlur: 4, // 그림자 블러 (px)
    nodeShadowOffsetX: 2, // 그림자 오프셋 X (px)
    nodeShadowOffsetY: 2, // 그림자 오프셋 Y (px)
    nodeShadowColor: '#000000', // 그림자 색상
  },
  light: {
    // 색상 (Color)
    nodeBg: '#2196f3', // 노드 배경색 (파란색 - Blue) - #2196f3
    nodeBorder: '#1976d2', // 노드 테두리 색상 (진한 파란색 - Dark Blue) - #1976d2
    lineColor: '#1976d2', // 라인 색상 (진한 파란색 - Dark Blue) - #1976d2
    nodeText: '#000000', // 노드 내부 텍스트 색상 (검정 - Black) - #000000
    edgeText: '#000000', // 연결선 라벨 텍스트 색상 (검정 - Black) - #000000

    // 크기/두께 (Size/Width)
    nodeBorderWidth: 2, // 노드 테두리 두께 (px)
    lineWidth: 2, // 라인 두께 (px)
    textSize: 14, // 노드 텍스트 크기 (px)
    edgeLabelSize: 14, // 엣지 라벨 텍스트 크기 (px)

    // 라인 스타일 (Line Style)
    lineStyle: 'solid', // 라인 스타일: 'solid', 'dashed', 'dotted'

    // 텍스트 스타일 (Text Style)
    textWeight: 'normal', // 텍스트 굵기: 'normal', 'bold'
    edgeLabelWeight: 'normal', // 엣지 라벨 텍스트 굵기: 'normal', 'bold'
    textAlign: 'center', // 텍스트 정렬: 'left', 'center', 'right'

    // 도형 스타일 (Shape Style)
    nodeBorderRadius: 0, // 노드 모서리 반경 (px) - 사각형 노드에만 적용
    nodeOpacity: 1.0, // 노드 투명도: 0.0-1.0
    lineOpacity: 1.0, // 라인 투명도: 0.0-1.0

    // 그림자 효과 (Shadow) - 향후 구현
    nodeShadow: false, // 노드 그림자 활성화 여부
    nodeShadowBlur: 4, // 그림자 블러 (px)
    nodeShadowOffsetX: 2, // 그림자 오프셋 X (px)
    nodeShadowOffsetY: 2, // 그림자 오프셋 Y (px)
    nodeShadowColor: '#000000', // 그림자 색상
  },
}

/**
 * 현재 적용된 테마에 따른 Mermaid 스타일 반환
 * @returns {Object} 현재 테마의 스타일 객체
 */
export function getCurrentMermaidStyles() {
  const isDark = document.body.classList.contains('dark')
  return MERMAID_DEFAULT_STYLES[isDark ? 'dark' : 'light']
}

/**
 * 특정 테마의 Mermaid 스타일 반환
 * @param {string} theme - 'dark' 또는 'light'
 * @returns {Object} 해당 테마의 스타일 객체
 */
export function getMermaidStylesByTheme(theme) {
  return MERMAID_DEFAULT_STYLES[theme] || MERMAID_DEFAULT_STYLES.light
}

/**
 * 현재 적용된 테마에 따른 Mermaid 색상만 반환 (하위 호환성 유지)
 * @deprecated getCurrentMermaidStyles() 사용 권장
 * @returns {Object} 현재 테마의 색상 객체
 */
export function getCurrentMermaidColors() {
  const styles = getCurrentMermaidStyles()
  return {
    nodeBg: styles.nodeBg,
    nodeBorder: styles.nodeBorder,
    lineColor: styles.lineColor,
    nodeText: styles.nodeText,
    edgeText: styles.edgeText,
  }
}

/**
 * 특정 테마의 Mermaid 색상만 반환 (하위 호환성 유지)
 * @deprecated getMermaidStylesByTheme() 사용 권장
 * @param {string} theme - 'dark' 또는 'light'
 * @returns {Object} 해당 테마의 색상 객체
 */
export function getMermaidColorsByTheme(theme) {
  const styles = getMermaidStylesByTheme(theme)
  return {
    nodeBg: styles.nodeBg,
    nodeBorder: styles.nodeBorder,
    lineColor: styles.lineColor,
    nodeText: styles.nodeText,
    edgeText: styles.edgeText,
  }
}
