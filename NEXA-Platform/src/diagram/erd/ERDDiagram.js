/**
 * ERDDiagram.js
 * ERD 다이어그램 렌더러
 * D3.js + dagre-d3-es를 사용하여 테이블 관계 시각화
 */

import * as d3 from 'd3'
import { createNodeStyle, createLabelStyle, createEdgeStyle } from '../utils/diagramTheme.js'
import { getLayoutOptions, layoutTypes } from '../utils/diagramLayout.js'
import { createZoom, fitToScreen } from '../utils/diagramZoom.js'

// dagre-d3-es는 동적 임포트
let dagre = null
let graphlib = null
let render = null

/**
 * dagre-d3-es 라이브러리 로드
 */
async function loadDagreLibraries() {
  if (dagre && graphlib && render) {
    return { dagre, graphlib, render }
  }

  try {
    // dagre-d3-es는 graphlib, render를 named export로 제공
    const dagreD3Module = await import('dagre-d3-es')
    graphlib = dagreD3Module.graphlib
    render = dagreD3Module.render

    // dagre는 별도 패키지에서 임포트 (레이아웃 계산용)
    const dagreModule = await import('dagre')
    dagre = dagreModule.default || dagreModule

    return { dagre, graphlib, render }
  } catch (importError) {
    console.error('[ERDDiagram] dagre/dagre-d3-es 임포트 실패:', importError)
    throw new Error('dagre 또는 dagre-d3-es 라이브러리를 찾을 수 없습니다. npm install dagre dagre-d3-es를 실행하세요.')
  }
}

/**
 * ERD 다이어그램 렌더링
 * @param {HTMLElement} container - 다이어그램 컨테이너 DOM 요소
 * @param {Object} data - 다이어그램 데이터
 * @param {Array} data.tables - 테이블 목록
 * @param {Array} data.relationships - 관계 목록
 * @param {Object} options - 렌더링 옵션
 * @param {String} options.selectedNode - 선택된 노드 ID
 * @param {String} options.layoutType - 레이아웃 타입
 * @param {Object} options.layoutOptions - 레이아웃 옵션
 * @param {Function} options.onNodeClick - 노드 클릭 핸들러
 * @param {Function} options.onNodeHover - 노드 호버 핸들러
 * @returns {Promise<Object>} 렌더링 결과 (svg, svgGroup, zoom, graph)
 */
export async function renderERD(container, data, options = {}) {
  const {
    tables = [],
    relationships = [],
  } = data

  const {
    selectedNode = null,
    layoutType = layoutTypes.HIERARCHICAL,
    layoutOptions = {},
    onNodeClick = null,
    onNodeHover = null,
  } = options

  // dagre 라이브러리 로드
  const libraries = await loadDagreLibraries()
  dagre = libraries.dagre
  graphlib = libraries.graphlib
  render = libraries.render

  // 기존 SVG 제거
  d3.select(container).selectAll('*').remove()

  // 컨테이너 크기 확인
  const containerWidth = container.clientWidth || 800
  const containerHeight = container.clientHeight || 600

  if (containerWidth === 0 || containerHeight === 0) {
    throw new Error('컨테이너 크기가 0입니다.')
  }

  // SVG 생성
  const svg = d3.select(container)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
    .style('background-color', 'var(--nexa-background)')

  const svgGroup = svg.append('g')

  // Dagre 그래프 생성
  const layoutOpts = getLayoutOptions(layoutType, layoutOptions)
  const graph = new graphlib.Graph()
    .setGraph({
      rankdir: layoutOpts.rankdir || 'LR',
      nodesep: layoutOpts.nodesep || 100, // 노드 간격 증가 (50 -> 100)
      ranksep: layoutOpts.ranksep || 120, // 레벨 간격 증가 (80 -> 120)
      marginx: layoutOpts.marginx || 50,
      marginy: layoutOpts.marginy || 50,
    })
    .setDefaultEdgeLabel(() => ({}))

  // 노드 추가 (테이블)
  tables.forEach((table) => {
    const isSelected = selectedNode === table.name
    const nodeWidth = isSelected ? 250 : 180 // 노드 크기 증가
    const nodeHeight = isSelected ? 100 : 70
    
    graph.setNode(table.name, {
      label: table.name,
      shape: 'rect',
      style: createNodeStyle(isSelected),
      labelStyle: createLabelStyle(isSelected),
      width: nodeWidth,
      height: nodeHeight,
    })
  })

  // 엣지 추가 (외래키 관계)
  relationships.forEach((rel) => {
    graph.setEdge(rel.fromTable, rel.toTable, {
      label: `${rel.fromColumn} → ${rel.toColumn}`,
      arrowhead: 'vee',
      style: createEdgeStyle(),
      labelStyle: 'fill: var(--nexa-text-secondary); font-size: 12px;',
    })
  })

  // Dagre 레이아웃 계산
  if (dagre && typeof dagre.layout === 'function') {
    dagre.layout(graph)
    console.log('[ERDDiagram] 레이아웃 계산 완료, 노드 개수:', graph.nodes().length)
  } else {
    throw new Error('dagre layout 함수를 찾을 수 없습니다.')
  }

  // D3.js로 렌더링
  if (render) {
    const renderer = new render()
    renderer(svgGroup, graph)
    console.log('[ERDDiagram] D3.js 렌더링 완료')
  } else {
    throw new Error('render를 찾을 수 없습니다.')
  }

  // 노드 클릭 이벤트 추가
  if (onNodeClick) {
    svgGroup.selectAll('.node')
      .on('click', function(event, d) {
        const nodeId = d
        const nodeData = tables.find(t => t.name === nodeId)
        onNodeClick(nodeId, nodeData)
      })
  }

  // 노드 호버 이벤트 추가
  if (onNodeHover) {
    svgGroup.selectAll('.node')
      .on('mouseenter', function(event, d) {
        const nodeId = d
        const nodeData = tables.find(t => t.name === nodeId)
        onNodeHover(nodeId, nodeData, true)
      })
      .on('mouseleave', function(event, d) {
        const nodeId = d
        const nodeData = tables.find(t => t.name === nodeId)
        onNodeHover(nodeId, nodeData, false)
      })
  }

  // 줌/팬 기능
  const zoom = createZoom((event) => {
    svgGroup.attr('transform', event.transform)
  })

  svg.call(zoom)

  // 초기 줌 설정 (렌더링이 완전히 끝난 후 실행)
  setTimeout(() => {
    try {
      fitToScreen(svg, svgGroup, containerWidth, containerHeight, zoom)
      console.log('[ERDDiagram] 초기 줌 설정 완료')
    } catch (err) {
      console.warn('[ERDDiagram] 초기 줌 설정 실패:', err)
    }
  }, 200) // 지연 시간 증가 (50ms -> 200ms)

  return {
    svg,
    svgGroup,
    zoom,
    graph,
  }
}

/**
 * ERD 다이어그램 업데이트 (선택된 노드 변경 등)
 * @param {Object} renderResult - renderERD의 반환값
 * @param {Object} data - 업데이트된 데이터
 * @param {Object} options - 업데이트 옵션
 */
export async function updateERD(renderResult, data, options = {}) {
  const { svgGroup, graph } = renderResult
  const { selectedNode = null } = options

  // 노드 스타일 업데이트
  if (graph && selectedNode !== null) {
    // 그래프의 모든 노드 순회하여 선택 상태 업데이트
    graph.nodes().forEach((nodeId) => {
      const isSelected = selectedNode === nodeId
      const node = graph.node(nodeId)
      if (node) {
        node.style = createNodeStyle(isSelected)
        node.labelStyle = createLabelStyle(isSelected)
        node.width = isSelected ? 200 : 150
        node.height = isSelected ? 80 : 60
      }
    })

    // 레이아웃 재계산
    if (dagre && typeof dagre.layout === 'function') {
      dagre.layout(graph)
    }

    // 다시 렌더링
    if (render) {
      svgGroup.selectAll('*').remove()
      const renderer = new render()
      renderer(svgGroup, graph)
    }
  }
}

