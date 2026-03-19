/**
 * Mermaid 스타일 관리 Composable
 * 스타일 상태 관리 및 CSS 생성 로직 담당
 */

import { ref, computed, watch } from 'vue'
import { saveMermaidStyle, loadMermaidStyle } from '@domains/dev/modules/document-manager/services/mermaidStyleStorage'
import { getCurrentMermaidStyles } from '@domains/dev/modules/document-manager/config/mermaidStyles'

// 중앙 스타일 관리 모듈에서 기본 스타일 가져오기
function getDefaultStyles() {
  const styles = getCurrentMermaidStyles()
  // 디버깅: 현재 적용된 스타일 값 확인
  console.log('[useMermaidStyle] 중앙 모듈에서 가져온 스타일:', {
    nodeBg: styles.nodeBg,
    nodeBorder: styles.nodeBorder,
    nodeBorderWidth: styles.nodeBorderWidth,
    lineColor: styles.lineColor,
    lineWidth: styles.lineWidth,
    nodeText: styles.nodeText,
    edgeText: styles.edgeText,
    textSize: styles.textSize,
    edgeLabelSize: styles.edgeLabelSize,
    nodeShadow: styles.nodeShadow,
  })
  return {
    node: {
      bg: styles.nodeBg, // 노드 배경색 (중앙 모듈: mermaidStyles.js 참조)
      border: styles.nodeBorder, // 노드 테두리 색상 (중앙 모듈: mermaidStyles.js 참조)
      borderWidth: styles.nodeBorderWidth, // 노드 테두리 두께 (중앙 모듈: mermaidStyles.js 참조)
      borderRadius: styles.nodeBorderRadius, // 노드 모서리 반경 (중앙 모듈: mermaidStyles.js 참조)
      opacity: styles.nodeOpacity, // 노드 투명도 (중앙 모듈: mermaidStyles.js 참조)
    },
    line: {
      color: styles.lineColor, // 라인 색상 (중앙 모듈: mermaidStyles.js 참조)
      width: styles.lineWidth, // 라인 두께 (중앙 모듈: mermaidStyles.js 참조)
      style: styles.lineStyle, // 라인 스타일 (중앙 모듈: mermaidStyles.js 참조)
      opacity: styles.lineOpacity, // 라인 투명도 (중앙 모듈: mermaidStyles.js 참조)
    },
    text: {
      color: styles.nodeText, // 노드 텍스트 색상 (중앙 모듈: mermaidStyles.js 참조)
      size: styles.textSize, // 텍스트 크기 (중앙 모듈: mermaidStyles.js 참조)
      weight: styles.textWeight, // 텍스트 굵기 (중앙 모듈: mermaidStyles.js 참조)
      align: styles.textAlign, // 텍스트 정렬 (중앙 모듈: mermaidStyles.js 참조)
    },
    edgeLabel: {
      color: styles.edgeText, // 엣지 라벨 텍스트 색상 (중앙 모듈: mermaidStyles.js 참조)
      size: styles.edgeLabelSize, // 엣지 라벨 텍스트 크기 (중앙 모듈: mermaidStyles.js 참조)
      weight: styles.edgeLabelWeight, // 엣지 라벨 텍스트 굵기 (중앙 모듈: mermaidStyles.js 참조)
    },
    // 그림자 효과 (직접 접근)
    nodeShadow: styles.nodeShadow,
    nodeShadowBlur: styles.nodeShadowBlur,
    nodeShadowOffsetX: styles.nodeShadowOffsetX,
    nodeShadowOffsetY: styles.nodeShadowOffsetY,
    nodeShadowColor: styles.nodeShadowColor,
  }
}

/**
 * Mermaid 스타일 관리 Composable
 * @param {import('vue').Ref<string>|string} filePath - 현재 파일 경로
 * @returns {Object} 스타일 관리 함수 및 상태
 */
import type { Ref } from 'vue'

export function useMermaidStyle(filePath: Ref<string> | string) {
  // 중앙 색상 관리 모듈에서 기본 스타일 가져오기
  const defaultStyles = getDefaultStyles()

  // 스타일 상태 (테마 기본값으로 초기화)
  // 디버깅: 실제 적용된 스타일 값은 콘솔에서 확인 가능 (getDefaultStyles 내부 console.log 참고)
  // 모든 스타일 값은 mermaidStyles.js에서 관리 (단일 진실의 원천)
  const nodeBg = ref(defaultStyles.node.bg) // 노드 배경색
  const nodeBorder = ref(defaultStyles.node.border) // 노드 테두리 색상
  const nodeBorderWidth = ref(defaultStyles.node.borderWidth) // 노드 테두리 두께
  const nodeBorderRadius = ref(defaultStyles.node.borderRadius || 0) // 노드 모서리 반경
  const nodeOpacity = ref(defaultStyles.node.opacity || 1.0) // 노드 투명도
  const lineColor = ref(defaultStyles.line.color) // 라인 색상
  const lineWidth = ref(defaultStyles.line.width) // 라인 두께
  const lineStyle = ref(defaultStyles.line.style) // 라인 스타일
  const lineOpacity = ref(defaultStyles.line.opacity || 1.0) // 라인 투명도
  const textColor = ref(defaultStyles.text.color) // 노드 텍스트 색상
  const textSize = ref(defaultStyles.text.size) // 노드 텍스트 크기
  const textWeight = ref(defaultStyles.text.weight || 'normal') // 노드 텍스트 굵기
  const textAlign = ref(defaultStyles.text.align || 'center') // 노드 텍스트 정렬
  const edgeText = ref(defaultStyles.edgeLabel.color) // 엣지 라벨 텍스트 색상
  const edgeLabelSize = ref(defaultStyles.edgeLabel.size) // 엣지 라벨 텍스트 크기
  const edgeLabelWeight = ref(defaultStyles.edgeLabel.weight || 'normal') // 엣지 라벨 텍스트 굵기
  // 그림자 효과
  const nodeShadow = ref(defaultStyles.nodeShadow !== undefined ? defaultStyles.nodeShadow : false) // 노드 그림자 활성화
  const nodeShadowBlur = ref(defaultStyles.nodeShadowBlur || 4) // 그림자 블러 (px)
  const nodeShadowOffsetX = ref(defaultStyles.nodeShadowOffsetX || 2) // 그림자 오프셋 X (px)
  const nodeShadowOffsetY = ref(defaultStyles.nodeShadowOffsetY || 2) // 그림자 오프셋 Y (px)
  const nodeShadowColor = ref(defaultStyles.nodeShadowColor || '#000000') // 그림자 색상

  // 파일 경로가 ref면 unwrap, 아니면 그대로 사용
  const currentFilePath = computed(() => {
    if (typeof filePath === 'string') return filePath
    return filePath?.value || ''
  })

  // 초기 로드: 파일 경로가 있으면 설정 파일에서 스타일 로드
  // (파일 경로가 변경될 때마다 자동으로 로드됨)
  watch(
    currentFilePath,
    async (newPath) => {
      if (newPath) {
        await loadFileStyle()
      } else {
        // 파일이 없으면 기본값으로 리셋
        resetToDefault()
      }
    },
    { immediate: true }, // 즉시 실행 (초기 로드)
  )

  /**
   * 스타일을 기본값으로 리셋 (테마 기본값으로)
   */
  function resetToDefault() {
    const defaultStyles = getDefaultStyles()
    nodeBg.value = defaultStyles.node.bg
    nodeBorder.value = defaultStyles.node.border
    nodeBorderWidth.value = defaultStyles.node.borderWidth
    nodeBorderRadius.value = defaultStyles.node.borderRadius || 0
    nodeOpacity.value = defaultStyles.node.opacity || 1.0
    lineColor.value = defaultStyles.line.color
    lineWidth.value = defaultStyles.line.width
    lineStyle.value = defaultStyles.line.style
    lineOpacity.value = defaultStyles.line.opacity || 1.0
    textColor.value = defaultStyles.text.color
    textSize.value = defaultStyles.text.size
    textWeight.value = defaultStyles.text.weight || 'normal'
    textAlign.value = defaultStyles.text.align || 'center'
    edgeText.value = defaultStyles.edgeLabel.color
    edgeLabelSize.value = defaultStyles.edgeLabel.size
    edgeLabelWeight.value = defaultStyles.edgeLabel.weight || 'normal'
    // 그림자 효과 리셋
    nodeShadow.value = defaultStyles.nodeShadow !== undefined ? defaultStyles.nodeShadow : false
    nodeShadowBlur.value = defaultStyles.nodeShadowBlur || 4
    nodeShadowOffsetX.value = defaultStyles.nodeShadowOffsetX || 2
    nodeShadowOffsetY.value = defaultStyles.nodeShadowOffsetY || 2
    nodeShadowColor.value = defaultStyles.nodeShadowColor || '#000000'
  }

  /**
   * 현재 스타일 설정을 CSS 문자열로 생성 (파일 레벨)
   * getDefaultMermaidCss()와 동일한 구조와 선택자 사용 (높은 특이성 보장)
   * @returns {string} CSS 문자열
   */
  function generateFileLevelCss() {
    // 그림자 효과 CSS 생성
    const shadowFilter = nodeShadow.value ? `filter: drop-shadow(${nodeShadowOffsetX.value}px ${nodeShadowOffsetY.value}px ${nodeShadowBlur.value}px ${nodeShadowColor.value}) !important;` : ''
    const strokeDashArray = lineStyle.value === 'dashed' ? '5,5' : lineStyle.value === 'dotted' ? '2,2' : 'none'

    return `
/* ============================================
   범용 노드 스타일 (모든 다이어그램 타입)
   ============================================ */
/* 기본 도형 요소들 */
.mermaid-block svg rect,
.mermaid-block svg circle,
.mermaid-block svg ellipse,
.mermaid-block svg polygon,
.mermaid-block svg path[fill] {
  fill: ${nodeBg.value} !important;
  stroke: ${nodeBorder.value} !important;
  stroke-width: ${nodeBorderWidth.value}px !important;
  ${shadowFilter}
}

/* 클래스/노드 영역 */
.mermaid-block svg .node rect,
.mermaid-block svg .node circle,
.mermaid-block svg .node ellipse,
.mermaid-block svg .node polygon,
.mermaid-block svg .flowchart-label .nodeLabel rect,
.mermaid-block svg .classGroup rect,
.mermaid-block svg .classBox rect {
  fill: ${nodeBg.value} !important;
  stroke: ${nodeBorder.value} !important;
  stroke-width: ${nodeBorderWidth.value}px !important;
  ${shadowFilter}
}

/* ============================================
   Flowchart subgraph(cluster) 스타일
   subgraph 배경은 투명 유지
   ============================================ */
.mermaid-block svg .cluster rect {
  fill: transparent !important;
  fill-opacity: 0 !important;
  stroke: ${nodeBorder.value} !important;
  stroke-width: ${nodeBorderWidth.value}px !important;
}

/* ============================================
   시퀀스 다이어그램 (Sequence Diagram) 특화
   ============================================ */
.mermaid-block svg .actor rect,
.mermaid-block svg .actor circle,
.mermaid-block svg .participant rect,
.mermaid-block svg .participant circle,
.mermaid-block svg .box rect,
.mermaid-block svg .loopLine rect,
.mermaid-block svg .activation rect {
  fill: ${nodeBg.value} !important;
  stroke: ${nodeBorder.value} !important;
  stroke-width: ${nodeBorderWidth.value}px !important;
  ${shadowFilter}
}

/* ============================================
   클래스 다이어그램 (Class Diagram) 특화
   ============================================ */
.mermaid-block svg .class rect,
.mermaid-block svg .classBox rect,
.mermaid-block svg .classLabelBox rect,
.mermaid-block svg .relation rect {
  fill: ${nodeBg.value} !important;
  stroke: ${nodeBorder.value} !important;
  stroke-width: ${nodeBorderWidth.value}px !important;
  ${shadowFilter}
}

/* ============================================
   상태 다이어그램 (State Diagram) 특화
   ============================================ */
.mermaid-block svg .state rect,
.mermaid-block svg .state circle,
.mermaid-block svg .state ellipse,
.mermaid-block svg .stateLabel rect {
  fill: ${nodeBg.value} !important;
  stroke: ${nodeBorder.value} !important;
  stroke-width: ${nodeBorderWidth.value}px !important;
  ${shadowFilter}
}

/* ============================================
   엔티티 관계도 (ER Diagram) 특화
   ============================================ */
.mermaid-block svg .entity rect,
.mermaid-block svg .entityBox rect,
.mermaid-block svg .attributeBox rect {
  fill: ${nodeBg.value} !important;
  stroke: ${nodeBorder.value} !important;
  stroke-width: ${nodeBorderWidth.value}px !important;
  ${shadowFilter}
}

/* ============================================
   연결선/엣지 스타일 (모든 다이어그램)
   ============================================ */
/* 경로 기반 연결선 */
.mermaid-block svg .edge path,
.mermaid-block svg .edgePath path,
.mermaid-block svg .edgePaths path,
.mermaid-block svg path[data-edge="true"],
.mermaid-block svg path.edge,
.mermaid-block svg .flowchart-link,
.mermaid-block svg .flowchart-arrow,
.mermaid-block svg path.arrowheadPath,
.mermaid-block svg path[stroke]:not([fill]),
.mermaid-block svg .path {
  stroke: ${lineColor.value} !important;
  stroke-width: ${lineWidth.value}px !important;
  stroke-dasharray: ${strokeDashArray} !important;
  fill: none !important;
}

/* 선형 연결선 */
.mermaid-block svg line:not([stroke="none"]),
.mermaid-block svg polyline {
  stroke: ${lineColor.value} !important;
  stroke-width: ${lineWidth.value}px !important;
  stroke-dasharray: ${strokeDashArray} !important;
  fill: none !important;
}

/* 시퀀스 다이어그램 메시지선 */
.mermaid-block svg .messageLine0,
.mermaid-block svg .messageLine1 {
  stroke: ${lineColor.value} !important;
  stroke-width: ${lineWidth.value}px !important;
  stroke-dasharray: ${strokeDashArray} !important;
}

/* 시퀀스 다이어그램 메시지 텍스트 - 라인 색상 사용 */
.mermaid-block svg .messageText {
  fill: ${lineColor.value} !important;
  color: ${lineColor.value} !important;
  stroke: none !important;
  stroke-width: 0 !important;
  font-weight: normal !important;
}

/* 엣지 마커(화살표) 스타일 */
.mermaid-block svg .edge marker path,
.mermaid-block svg marker path,
.mermaid-block svg .marker path,
.mermaid-block svg marker[fill] path {
  fill: ${lineColor.value} !important;
  stroke: ${lineColor.value} !important;
}

/* ============================================
   텍스트 스타일 (모든 다이어그램)
   ============================================ */
/* 노드 라벨 텍스트 - 모든 다이어그램 타입 커버 */
.mermaid-block svg .nodeLabel,
.mermaid-block svg .nodeLabel text,
.mermaid-block svg .flowchart-label text,
.mermaid-block svg .label text,
.mermaid-block svg .labelText,
.mermaid-block svg .classText,
.mermaid-block svg .nodeText,
/* 시퀀스 다이어그램 특화 (messageText는 제외 - line-color 사용) */
.mermaid-block svg .actor text,
.mermaid-block svg .participant text,
/* 클래스 다이어그램 */
.mermaid-block svg .classTitle text,
.mermaid-block svg .classText text,
/* 상태 다이어그램 */
.mermaid-block svg .stateLabel text,
.mermaid-block svg .state-note text,
/* 노드 내부 텍스트 (엣지 라벨 제외) */
.mermaid-block svg text:not(.edgeLabel text):not(.edgeLabel span):not(.messageText) {
  fill: ${textColor.value} !important;
  color: ${textColor.value} !important;
  font-size: ${textSize.value}px !important;
}

/* 엣지 라벨 텍스트 (별도 색상 적용) */
.mermaid-block svg .edgeLabel,
.mermaid-block svg .edgeLabel text,
.mermaid-block svg .edgeLabel span,
.mermaid-block svg .edgeText {
  fill: ${edgeText.value} !important;
  color: ${edgeText.value} !important;
  font-size: ${edgeLabelSize.value}px !important;
}

/* ============================================
   엣지 라벨 배경 제거 (단순 접근)
   ============================================ */
.mermaid-block svg .edgeLabel .labelBkg {
  background: none !important;
  background-color: transparent !important;
}
`.trim()
  }

  /**
   * 블록 레벨 CSS 생성
   * @param {string} mermaidId - Mermaid 블록 ID
   * @returns {string} 블록별 CSS 문자열
   */
  function generateBlockLevelCss(mermaidId: string) {
    // 그림자 효과 CSS 생성
    const shadowFilter = nodeShadow.value ? `filter: drop-shadow(${nodeShadowOffsetX.value}px ${nodeShadowOffsetY.value}px ${nodeShadowBlur.value}px ${nodeShadowColor.value}) !important;` : ''

    return `
/* Mermaid 블록별 스타일: ${mermaidId} */
#${mermaidId} .node rect {
  fill: ${nodeBg.value};
  stroke: ${nodeBorder.value};
  stroke-width: ${nodeBorderWidth.value}px;
  ${shadowFilter}
}

#${mermaidId} .edge path {
  stroke: ${lineColor.value};
  stroke-width: ${lineWidth.value}px;
  stroke-dasharray: ${lineStyle.value === 'dashed' ? '5,5' : lineStyle.value === 'dotted' ? '2,2' : 'none'};
}

#${mermaidId} .edge marker {
  fill: ${lineColor.value};
}

#${mermaidId} .nodeLabel {
  color: ${textColor.value};
  font-size: ${textSize.value}px;
}

#${mermaidId} .edgeLabel {
  color: ${textColor.value};
  font-size: ${textSize.value}px;
}
`.trim()
  }

  /**
   * 파일 레벨 스타일 저장
   * @returns {Promise<boolean>} 성공 여부
   */
  async function saveFileStyle() {
    if (!currentFilePath.value) {
      console.warn('[useMermaidStyle] 파일 경로가 없습니다.')
      return false
    }

    const css = generateFileLevelCss()
    return await saveMermaidStyle(currentFilePath.value, css)
  }

  // 커스텀 스타일 파일 존재 여부
  const hasCustomStyle = ref(false)

  /**
   * 파일 레벨 스타일 로드
   * @returns {Promise<boolean>} 성공 여부 (스타일이 있었는지)
   */
  async function loadFileStyle() {
    if (!currentFilePath.value) {
      hasCustomStyle.value = false
      resetToDefault()
      return false
    }

    try {
      const css = await loadMermaidStyle(currentFilePath.value)

      if (!css) {
        // 스타일이 없으면 기본값 사용
        hasCustomStyle.value = false
        resetToDefault()
        return false
      }

      // 커스텀 스타일 파일 존재
      hasCustomStyle.value = true

      // CSS에서 값 추출하여 상태 업데이트 (실제 CSS 구조에 맞게 파싱)
      // 실제 CSS 구조: .mermaid-block svg rect { fill: #color !important; stroke: #color !important; stroke-width: 2px !important; }

      // 노드 배경색 (rect나 circle에서 fill 추출)
      const nodeBgMatch = css.match(/\.mermaid-block[^}]*rect[^}]*fill:\s*([^!;]+)/i) || css.match(/\.mermaid-block[^}]*circle[^}]*fill:\s*([^!;]+)/i)
      if (nodeBgMatch) {
        const value = nodeBgMatch[1].trim()
        if (value && !value.includes('none') && !value.includes('transparent')) {
          nodeBg.value = value
        }
      }

      // 노드 테두리 색상 (rect나 circle에서 stroke 추출)
      const nodeBorderMatch = css.match(/\.mermaid-block[^}]*rect[^}]*stroke:\s*([^!;]+)/i) || css.match(/\.mermaid-block[^}]*circle[^}]*stroke:\s*([^!;]+)/i)
      if (nodeBorderMatch) {
        const value = nodeBorderMatch[1].trim()
        if (value && !value.includes('none')) {
          nodeBorder.value = value
        }
      }

      // 노드 테두리 두께 (rect나 circle에서 stroke-width 추출)
      const nodeBorderWidthMatch = css.match(/\.mermaid-block[^}]*rect[^}]*stroke-width:\s*(\d+)px/i) || css.match(/\.mermaid-block[^}]*circle[^}]*stroke-width:\s*(\d+)px/i)
      if (nodeBorderWidthMatch) {
        const width = parseInt(nodeBorderWidthMatch[1], 10)
        if (!isNaN(width) && width > 0) {
          nodeBorderWidth.value = width
        }
      }

      // 라인 색상 (path나 line에서 stroke 추출, .edge path 등)
      // 주의: .messageText의 fill은 라인 색상이지만, 여기서는 stroke만 추출
      // 실제 CSS: .mermaid-block svg .edge path { stroke: #color !important; }
      // 우선순위: .messageLine > .edge path > 일반 path (fill: none인 경우)
      let lineColorValue = null

      // 1. .messageLine 패턴 (가장 정확)
      const messageLineMatch = css.match(/\.messageLine[^}]*stroke:\s*([^!;]+)/i)
      if (messageLineMatch) {
        lineColorValue = messageLineMatch[1].trim()
      }

      // 2. .edge path 패턴
      if (!lineColorValue) {
        const edgePathMatch = css.match(/\.edge[^}]*path[^}]*stroke:\s*([^!;]+)/i) || css.match(/\.edgePath[^}]*path[^}]*stroke:\s*([^!;]+)/i) || css.match(/path\[data-edge[^}]*stroke:\s*([^!;]+)/i) || css.match(/path\.edge[^}]*stroke:\s*([^!;]+)/i)
        if (edgePathMatch) {
          lineColorValue = edgePathMatch[1].trim()
        }
      }

      // 3. flowchart-link 패턴
      if (!lineColorValue) {
        const flowchartLinkMatch = css.match(/\.flowchart-link[^}]*stroke:\s*([^!;]+)/i)
        if (flowchartLinkMatch) {
          lineColorValue = flowchartLinkMatch[1].trim()
        }
      }

      // 4. 일반 path에서 stroke 추출 (fill이 none인 경우만, 노드가 아닌 경우)
      if (!lineColorValue) {
        const generalPathMatch = css.match(/path[^}]*fill:\s*none[^}]*stroke:\s*([^!;]+)/i)
        if (generalPathMatch) {
          const matchContext = generalPathMatch[0]
          // rect, circle 등 노드 관련이 아닌 경우만
          if (!matchContext.includes('rect') && !matchContext.includes('circle') && !matchContext.includes('ellipse') && !matchContext.includes('polygon')) {
            lineColorValue = generalPathMatch[1].trim()
          }
        }
      }

      if (lineColorValue && !lineColorValue.includes('none') && !lineColorValue.includes('transparent')) {
        lineColor.value = lineColorValue
        if (import.meta.env.DEV) {
          console.log('[useMermaidStyle] 라인 색상 로드:', lineColorValue)
        }
      }

      // 라인 두께 (path나 line에서 stroke-width 추출)
      const lineWidthMatch = css.match(/\.mermaid-block[^}]*path[^}]*stroke-width:\s*(\d+)px/i) || css.match(/\.mermaid-block[^}]*line[^}]*stroke-width:\s*(\d+)px/i) || css.match(/\.edge[^}]*path[^}]*stroke-width:\s*(\d+)px/i)
      if (lineWidthMatch) {
        const width = parseInt(lineWidthMatch[1], 10)
        if (!isNaN(width) && width > 0) {
          lineWidth.value = width
        }
      }

      // 라인 스타일 (stroke-dasharray)
      const lineStyleMatch = css.match(/stroke-dasharray:\s*([^!;]+)/i)
      if (lineStyleMatch) {
        const value = lineStyleMatch[1].trim()
        if (value === '5,5' || value === '5 5') {
          lineStyle.value = 'dashed'
        } else if (value === '2,2' || value === '2 2') {
          lineStyle.value = 'dotted'
        } else if (value === 'none' || !value) {
          lineStyle.value = 'solid'
        }
      }

      // 텍스트 색상 (text에서 fill 또는 color 추출)
      // 주의: .messageText는 라인 색상을 사용하므로 제외해야 함
      // 실제 CSS: .mermaid-block svg text:not(.edgeLabel text):not(.edgeLabel span):not(.messageText) { fill: #color !important; }
      // 또는: .mermaid-block svg .nodeLabel text { fill: #color !important; }
      // 우선순위: text:not(.messageText) > .nodeLabel text > 기타
      let textColorValue = null

      // 1. text:not(.messageText) 패턴 (가장 정확)
      // 주의: text:not(.edgeLabel text) 패턴은 노드 텍스트를 의미
      const textNotMessageMatch = css.match(/text:not\([^)]*messageText[^)]*\)[^}]*fill:\s*([^!;]+)/i)
      if (textNotMessageMatch) {
        const matchContext = textNotMessageMatch[0]
        // .edgeLabel이 명시적으로 제외된 패턴인지 확인 (노드 텍스트)
        // text:not(.edgeLabel text) 또는 text:not(.edgeLabel span) 패턴은 노드 텍스트
        if (matchContext.includes('.edgeLabel') || matchContext.includes('edgeLabel')) {
          // text:not(.edgeLabel ...) 패턴은 노드 텍스트 (엣지 라벨 제외)
          textColorValue = textNotMessageMatch[1].trim()
        } else if (!matchContext.includes('.edgeLabel') && !matchContext.includes('edgeLabel')) {
          // .edgeLabel이 전혀 언급되지 않은 경우도 노드 텍스트
          textColorValue = textNotMessageMatch[1].trim()
        }
      }

      // 2. .nodeLabel text 패턴
      if (!textColorValue) {
        const nodeLabelTextMatch = css.match(/\.nodeLabel[^}]*text[^}]*fill:\s*([^!;]+)/i) || css.match(/\.nodeLabel[^}]*fill:\s*([^!;]+)/i)
        if (nodeLabelTextMatch) {
          textColorValue = nodeLabelTextMatch[1].trim()
        }
      }

      // 3. 기타 노드 텍스트 패턴
      if (!textColorValue) {
        const otherNodeTextMatch =
          css.match(/\.label[^}]*text[^}]*fill:\s*([^!;]+)/i) || css.match(/\.classText[^}]*fill:\s*([^!;]+)/i) || css.match(/\.stateLabel[^}]*text[^}]*fill:\s*([^!;]+)/i) || css.match(/\.actor[^}]*text[^}]*fill:\s*([^!;]+)/i) || css.match(/\.participant[^}]*text[^}]*fill:\s*([^!;]+)/i)
        if (otherNodeTextMatch) {
          textColorValue = otherNodeTextMatch[1].trim()
        }
      }

      if (textColorValue && !textColorValue.includes('none') && !textColorValue.includes('transparent')) {
        textColor.value = textColorValue
        if (import.meta.env.DEV) {
          console.log('[useMermaidStyle] 노드 텍스트 색상 로드:', textColorValue)
        }
      }

      // 텍스트 크기 (text에서 font-size 추출)
      const textSizeMatch = css.match(/\.mermaid-block[^}]*text[^}]*font-size:\s*(\d+)px/i) || css.match(/\.nodeLabel[^}]*font-size:\s*(\d+)px/i)
      if (textSizeMatch) {
        const size = parseInt(textSizeMatch[1], 10)
        if (!isNaN(size) && size > 0) {
          textSize.value = size
        }
      }

      // 엣지 라벨 텍스트 색상 (edgeLabel에서 fill 추출)
      // 실제 CSS 구조:
      // .mermaid-block svg .edgeLabel,
      // .mermaid-block svg .edgeLabel text,
      // .mermaid-block svg .edgeLabel span,
      // .mermaid-block svg .edgeText {
      //   fill: ${edgeText.value} !important;
      // }
      // 주의: text:not(.edgeLabel text) 패턴은 노드 텍스트이므로 제외해야 함
      let edgeTextValue = null

      // 1. .edgeText 패턴 (가장 명확함 - 엣지 텍스트 전용 클래스)
      const edgeTextMatch = css.match(/\.edgeText[^}]*fill:\s*([^!;]+)/i)
      if (edgeTextMatch) {
        edgeTextValue = edgeTextMatch[1].trim()
        if (import.meta.env.DEV) {
          console.log('[useMermaidStyle] 엣지 라벨 텍스트 색상 파싱 (.edgeText):', edgeTextValue)
        }
      }

      // 2. .edgeLabel text 패턴 (text:not이 아닌 경우만)
      if (!edgeTextValue) {
        // .edgeLabel text 패턴을 찾되, text:not(.edgeLabel text)는 제외
        // 패턴: .edgeLabel 다음에 공백이나 쉼표가 있고, 그 다음에 text가 오되, text:not이 아닌 경우
        const edgeLabelTextPattern = /\.edgeLabel[^}]*\s+text[^}]*fill:\s*([^!;]+)/i
        const edgeLabelTextMatch = css.match(edgeLabelTextPattern)
        if (edgeLabelTextMatch) {
          const matchContext = edgeLabelTextMatch[0]
          // text:not(.edgeLabel text) 패턴이 아닌지 확인
          // 즉, .edgeLabel 앞에 text:not(이 없어야 함
          const beforeMatch = css.substring(0, css.indexOf(matchContext))
          if (!beforeMatch.includes('text:not') || !beforeMatch.endsWith('text:not(')) {
            edgeTextValue = edgeLabelTextMatch[1].trim()
            if (import.meta.env.DEV) {
              console.log('[useMermaidStyle] 엣지 라벨 텍스트 색상 파싱 (.edgeLabel text):', edgeTextValue)
            }
          }
        }
      }

      // 3. .edgeLabel 패턴 (단독, text 없이) - 가장 마지막 수단
      if (!edgeTextValue) {
        // .edgeLabel로 시작하는 블록을 찾되, text:not(.edgeLabel) 패턴은 제외
        // CSS 블록 전체를 분석하여 .edgeLabel { ... } 패턴 찾기
        const edgeLabelBlockRegex = /\.edgeLabel[^}]*\{[^}]*fill:\s*([^!;]+)/gi
        const edgeLabelBlocks = [...css.matchAll(edgeLabelBlockRegex)]

        for (const match of edgeLabelBlocks) {
          const fullMatch = match[0]
          const fillValue = match[1]?.trim()

          // 이 블록 앞의 텍스트를 확인하여 text:not(.edgeLabel) 패턴인지 확인
          const matchIndex = css.indexOf(fullMatch)
          const beforeText = css.substring(Math.max(0, matchIndex - 50), matchIndex)

          // text:not(.edgeLabel) 패턴이 아닌지 확인
          if (!beforeText.includes('text:not') || !beforeText.trim().endsWith('text:not(')) {
            if (fillValue && !fillValue.includes('none') && !fillValue.includes('transparent')) {
              edgeTextValue = fillValue
              if (import.meta.env.DEV) {
                console.log('[useMermaidStyle] 엣지 라벨 텍스트 색상 파싱 (.edgeLabel 단독):', edgeTextValue)
              }
              break
            }
          }
        }
      }

      if (edgeTextValue && !edgeTextValue.includes('none') && !edgeTextValue.includes('transparent')) {
        edgeText.value = edgeTextValue
        if (import.meta.env.DEV) {
          console.log('[useMermaidStyle] 엣지 라벨 텍스트 색상 최종 로드:', edgeTextValue)
        }
      } else {
        if (import.meta.env.DEV) {
          console.warn('[useMermaidStyle] 엣지 라벨 텍스트 색상을 찾을 수 없습니다.')
          console.warn('[useMermaidStyle] CSS 샘플:', css.substring(0, 1000))
        }
      }

      // 엣지 라벨 텍스트 크기 (edgeLabel에서 font-size 추출)
      const edgeLabelSizeMatch = css.match(/\.edgeLabel[^}]*font-size:\s*(\d+)px/i) || css.match(/\.edgeText[^}]*font-size:\s*(\d+)px/i)
      if (edgeLabelSizeMatch) {
        const size = parseInt(edgeLabelSizeMatch[1], 10)
        if (!isNaN(size) && size > 0) {
          edgeLabelSize.value = size
        }
      }

      // 그림자 효과
      const shadowFilterMatches = css.matchAll(/filter:\s*drop-shadow\(([^)]+)\)/gi)
      for (const match of shadowFilterMatches) {
        if (match[1]) {
          nodeShadow.value = true
          // drop-shadow(x y blur color) 파싱
          const shadowParts = match[1].trim().split(/\s+/)
          if (shadowParts.length >= 3) {
            const offsetX = parseInt(shadowParts[0].replace('px', ''), 10)
            const offsetY = parseInt(shadowParts[1].replace('px', ''), 10)
            const blur = parseInt(shadowParts[2].replace('px', ''), 10)
            const color = shadowParts[3] || shadowParts[shadowParts.length - 1]

            if (!isNaN(offsetX)) nodeShadowOffsetX.value = offsetX
            if (!isNaN(offsetY)) nodeShadowOffsetY.value = offsetY
            if (!isNaN(blur)) nodeShadowBlur.value = blur
            if (color) nodeShadowColor.value = color
          }
          break // 첫 번째 매치만 사용
        }
      }
      // 그림자가 없으면 false
      if (!css.includes('drop-shadow')) {
        nodeShadow.value = false
      }

      return true
    } catch (error) {
      console.error('[useMermaidStyle] 스타일 로드 실패:', error)
      hasCustomStyle.value = false
      resetToDefault()
      return false
    }
  }

  return {
    // 상태 - 색상
    nodeBg,
    nodeBorder,
    lineColor,
    textColor,
    edgeText,
    // 상태 - 크기/두께
    nodeBorderWidth,
    lineWidth,
    textSize,
    edgeLabelSize,
    // 상태 - 스타일
    lineStyle,
    textWeight,
    textAlign,
    edgeLabelWeight,
    nodeBorderRadius,
    nodeOpacity,
    lineOpacity,
    // 상태 - 그림자 효과
    nodeShadow,
    nodeShadowBlur,
    nodeShadowOffsetX,
    nodeShadowOffsetY,
    nodeShadowColor,
    // 상태 - 기타
    hasCustomStyle, // 커스텀 스타일 파일 존재 여부

    // 함수
    resetToDefault,
    generateFileLevelCss,
    generateBlockLevelCss,
    saveFileStyle,
    loadFileStyle,
  }
}
