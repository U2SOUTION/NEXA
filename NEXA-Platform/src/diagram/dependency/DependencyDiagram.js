/**
 * DependencyDiagram.js
 * 의존성 그래프 다이어그램 렌더러
 * D3.js + dagre-d3-es를 사용하여 파일 간 의존성 관계 시각화
 */

import * as d3 from 'd3'
import { getLayoutOptions, layoutTypes } from '../utils/diagramLayout.js'
import { createZoom, fitToScreen } from '../utils/diagramZoom.js'
import { loadDiagramSettings } from '../config/diagramSettings.js'
import { diagramTypes } from '../config/diagramMetadata.js'

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
    const dagreD3Module = await import('dagre-d3-es')
    graphlib = dagreD3Module.graphlib
    render = dagreD3Module.render

    const dagreModule = await import('dagre')
    dagre = dagreModule.default || dagreModule

    return { dagre, graphlib, render }
  } catch (importError) {
    console.error('[DependencyDiagram] dagre/dagre-d3-es 임포트 실패:', importError)
    throw new Error('dagre 또는 dagre-d3-es 라이브러리를 찾을 수 없습니다. npm install dagre dagre-d3-es를 실행하세요.')
  }
}

/**
 * 파일 타입별 색상 가져오기
 * @param {String} filePath - 파일 경로
 * @returns {String} 색상 (CSS 변수 또는 hex)
 */
function getFileTypeColor(filePath) {
  if (!filePath) return 'var(--nexa-surface)'

  const ext = filePath.split('.').pop()?.toLowerCase()
  const colorMap = {
    vue: 'var(--nexa-primary)',
    js: 'var(--nexa-success)',
    ts: 'var(--nexa-info)',
    scss: 'var(--nexa-warning)',
    css: 'var(--nexa-warning)',
    json: 'var(--nexa-accent)',
  }

  return colorMap[ext] || 'var(--nexa-surface)'
}

/**
 * 엣지 경로 생성 (스타일에 따라)
 * 향후 엣지 스타일 커스터마이징 시 사용 예정
 * @param {String} edgeStyle - 엣지 스타일 (straight, curved, bezier)
 * @param {Object} source - 소스 노드 위치
 * @param {Object} target - 타겟 노드 위치
 * @returns {String} SVG 경로 문자열
 */
// function createEdgePath(edgeStyle, source, target) {
//   const dx = target.x - source.x
//   const dy = target.y - source.y
//
//   if (edgeStyle === 'straight') {
//     return `M ${source.x} ${source.y} L ${target.x} ${target.y}`
//   } else if (edgeStyle === 'curved') {
//     const midX = (source.x + target.x) / 2
//     const midY = (source.y + target.y) / 2
//     const curvature = 20
//     const controlX = midX + (dy > 0 ? curvature : -curvature)
//     const controlY = midY - (dx > 0 ? curvature : -curvature)
//     return `M ${source.x} ${source.y} Q ${controlX} ${controlY} ${target.x} ${target.y}`
//   } else if (edgeStyle === 'bezier') {
//     const controlX1 = source.x + dx * 0.5
//     const controlY1 = source.y
//     const controlX2 = target.x - dx * 0.5
//     const controlY2 = target.y
//     return `M ${source.x} ${source.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${target.x} ${target.y}`
//   }
//
//   return `M ${source.x} ${source.y} L ${target.x} ${target.y}`
// }

/**
 * 의존성 그래프 다이어그램 렌더링
 * @param {HTMLElement} container - 다이어그램 컨테이너 DOM 요소
 * @param {Object} data - 다이어그램 데이터
 * @param {Array} data.files - 파일 목록
 * @param {Array} data.dependencies - 의존성 관계 목록
 * @param {Object} options - 렌더링 옵션
 * @param {String} options.selectedNode - 선택된 노드 ID
 * @param {String} options.layoutType - 레이아웃 타입
 * @param {Object} options.layoutOptions - 레이아웃 옵션
 * @param {Function} options.onNodeClick - 노드 클릭 핸들러
 * @param {Function} options.onNodeHover - 노드 호버 핸들러
 * @returns {Promise<Object>} 렌더링 결과 (svg, svgGroup, zoom, graph)
 */
export async function renderDependency(container, data, options = {}) {
  const { files = [], dependencies = [] } = data

  const { selectedNode = null, layoutType = layoutTypes.HIERARCHICAL, layoutOptions = {}, onNodeClick = null, onNodeHover = null } = options

  // 설정 로드
  const settings = loadDiagramSettings(diagramTypes.DEPENDENCY)

  // dagre 라이브러리 로드
  const libraries = await loadDagreLibraries()
  dagre = libraries.dagre
  graphlib = libraries.graphlib
  render = libraries.render

  // 기존 SVG 제거
  d3.select(container).selectAll('*').remove()

  // 컨테이너 크기 확인 (최적화: 가로폭 100%, 높이는 브라우저 크기 기반)
  const containerWidth = container.clientWidth || 800
  let containerHeight = container.clientHeight
  if (!containerHeight || containerHeight === 0) {
    containerHeight = window.innerHeight * 0.8
  }

  if (containerWidth === 0 || containerHeight === 0) {
    throw new Error('컨테이너 크기가 0입니다.')
  }

  // SVG 생성
  const svg = d3.select(container).append('svg').attr('width', '100%').attr('height', '100%').attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)

  const svgGroup = svg.append('g')

  // Dagre 그래프 생성
  const layoutOpts = getLayoutOptions(layoutType, { ...settings.layout, ...layoutOptions })
  const graph = new graphlib.Graph()
    .setGraph({
      rankdir: layoutOpts.rankdir || settings.layout.rankdir,
      nodesep: layoutOpts.nodesep || settings.layout.nodesep,
      ranksep: layoutOpts.ranksep || settings.layout.ranksep,
      marginx: layoutOpts.marginx || settings.layout.marginx,
      marginy: layoutOpts.marginy || settings.layout.marginy,
    })
    .setDefaultEdgeLabel(() => ({}))

  // 노드 크기 설정
  const nodeWidth = settings.nodeSize?.width || 120
  const nodeHeight = settings.nodeSize?.height || 40

  // 노드 추가 (파일)
  files.forEach((file) => {
    if (!file || !file.path) {
      console.warn('[DependencyDiagram] 잘못된 파일 데이터:', file)
      return
    }

    const isSelected = selectedNode === file.path
    const fileName = file.path.split('/').pop() || file.path

    graph.setNode(file.path, {
      label: settings.showLabels !== false ? fileName : '',
      shape: 'rect',
      style: '',
      labelStyle: '',
      width: nodeWidth,
      height: nodeHeight,
      class: isSelected ? 'node-selected' : '',
      // 파일 타입별 색상 정보 저장
      fileType: file.path.split('.').pop()?.toLowerCase(),
      filePath: file.path,
    })
  })

  // 엣지 추가 (의존성 관계)
  dependencies.forEach((dep) => {
    if (!dep.from || !dep.to) {
      console.warn('[DependencyDiagram] 잘못된 의존성 데이터:', dep)
      return
    }

    // 노드가 존재하는지 확인
    if (!graph.hasNode(dep.from)) {
      console.warn('[DependencyDiagram] 엣지의 from 노드가 존재하지 않음:', dep.from)
      return
    }
    if (!graph.hasNode(dep.to)) {
      console.warn('[DependencyDiagram] 엣지의 to 노드가 존재하지 않음:', dep.to)
      return
    }

    graph.setEdge(dep.from, dep.to, {
      label: dep.label || '',
      arrowhead: 'vee',
      style: '',
      labelStyle: '',
    })
  })

  // 노드가 없으면 에러
  const nodeCount = graph.nodes().length
  if (nodeCount === 0) {
    throw new Error('그래프에 노드가 없습니다.')
  }

  // Dagre 레이아웃 계산
  if (dagre && typeof dagre.layout === 'function') {
    dagre.layout(graph)
    console.log('[DependencyDiagram] 레이아웃 계산 완료, 노드 개수:', nodeCount, '엣지 개수:', graph.edges().length)
  } else {
    throw new Error('dagre layout 함수를 찾을 수 없습니다.')
  }

  // D3.js로 렌더링
  if (render) {
    // renderer 생성 및 호출
    const renderer = new render()

    // graph 객체 유효성 확인
    if (!graph || typeof graph !== 'object') {
      throw new Error('graph 객체가 유효하지 않습니다.')
    }

    try {
      renderer(svgGroup, graph)
      console.log('[DependencyDiagram] D3.js 렌더링 완료')
    } catch (renderError) {
      console.error('[DependencyDiagram] 렌더링 중 오류:', renderError)
      console.error('[DependencyDiagram] Graph 상태:', {
        nodes: graph.nodes(),
        edges: graph.edges(),
        nodeCount: graph.nodes().length,
        edgeCount: graph.edges().length,
        graphType: typeof graph,
        graphConstructor: graph.constructor?.name,
      })
      throw renderError
    }

    // 노드에 data-node-id 속성 추가 및 파일 타입별 색상 적용
    svgGroup.selectAll('.node').each(function (d) {
      const node = d3.select(this)
      const graphNode = graph.node(d)
      const nodeId = graphNode?.filePath || graphNode?.label || d

      node.attr('data-node-id', nodeId)

      // 선택 상태 확인
      const isSelected = selectedNode === nodeId
      if (isSelected) {
        node.classed('node-selected', true)
      }

      // 파일 타입별 색상 적용
      const fileType = graphNode?.fileType
      const rect = node.select('rect')
      if (rect.node() && fileType) {
        const color = getFileTypeColor(nodeId)
        rect.attr('fill', color)
      }
    })
  } else {
    throw new Error('render를 찾을 수 없습니다.')
  }

  // 노드 라벨 중앙 정렬
  svgGroup.selectAll('.node').each(function () {
    const node = d3.select(this)
    const rect = node.select('rect')
    const text = node.select('text')

    if (!rect.node() || !text.node()) return

    const bbox = rect.node().getBBox()
    const centerX = bbox.x + bbox.width / 2
    const centerY = bbox.y + bbox.height / 2

    text.selectAll('tspan').attr('x', 0)
    text.select('tspan').attr('dy', 0)
    text.attr('x', centerX).attr('y', centerY).attr('dy', 0).attr('text-anchor', 'middle')
  })

  // 엣지 렌더링 확인
  const edgePathCount = svgGroup.selectAll('.edgePath').size()
  const edgeLabelCount = svgGroup.selectAll('.edgeLabel').size()
  console.log('[DependencyDiagram] 엣지 렌더링 확인:', { edgePathCount, edgeLabelCount, expectedEdges: graph.edges().length })

  // 엣지 스타일 적용 (설정에서 edgeStyle 사용)
  const edgeStyle = settings.edgeStyle || 'curved'
  if (edgeStyle !== 'straight') {
    svgGroup.selectAll('.edgePath').each(function () {
      const edgePath = d3.select(this)
      const path = edgePath.select('path')

      if (!path.node()) return

      // 경로 데이터 가져오기
      const pathData = path.attr('d')
      if (!pathData || pathData.startsWith('M')) {
        // 이미 경로가 있으면 스킵
        return
      }

      // dagre가 생성한 경로를 사용하되, 스타일에 따라 재생성할 수도 있음
      // 현재는 dagre의 기본 경로를 사용
    })
  }

  // 엣지 색상 및 스타일 명시적 설정
  svgGroup.selectAll('.edgePath path').attr('stroke', 'var(--nexa-primary)').attr('stroke-width', '2px').attr('fill', 'none')

  // 엣지 라벨 배치
  const edgePaths = svgGroup.selectAll('.edgePath').nodes()
  const edgeLabels = svgGroup.selectAll('.edgeLabel').nodes()

  edgePaths.forEach((edgePathNode, index) => {
    const edgePath = d3.select(edgePathNode)
    const path = edgePath.select('path')

    if (!path.node() || !edgeLabels[index]) return

    const pathLength = path.node().getTotalLength()
    const midPoint = path.node().getPointAtLength(pathLength / 2)

    const beforePoint = path.node().getPointAtLength(Math.max(0, pathLength / 2 - 5))
    const afterPoint = path.node().getPointAtLength(Math.min(pathLength, pathLength / 2 + 5))
    const angle = Math.atan2(afterPoint.y - beforePoint.y, afterPoint.x - beforePoint.x) * (180 / Math.PI)

    const offsetDistance = -10
    const perpendicularAngle = angle + 90
    const offsetX = offsetDistance * Math.cos((perpendicularAngle * Math.PI) / 180)
    const offsetY = offsetDistance * Math.sin((perpendicularAngle * Math.PI) / 180)

    const edgeLabelGroup = d3.select(edgeLabels[index])
    const labelGroup = edgeLabelGroup.select('.label')
    const textElement = edgeLabelGroup.select('text')

    if (textElement.node()) {
      edgeLabelGroup.attr('transform', `translate(${midPoint.x + offsetX}, ${midPoint.y + offsetY}) rotate(${angle})`)
      if (labelGroup.node()) {
        labelGroup.attr('transform', 'translate(0, 0)')
      }
      textElement.attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('x', 0).attr('y', 0)
      textElement.selectAll('tspan').attr('x', 0).attr('text-anchor', 'middle').attr('dy', 0)
    }
  })

  // 노드 클릭 이벤트
  if (onNodeClick) {
    svgGroup.selectAll('.node').on('click', function (event, d) {
      event.stopPropagation()
      const nodeElement = d3.select(this)
      let nodeId = nodeElement.attr('data-node-id')

      if (!nodeId) {
        const graphNode = graph.node(d)
        nodeId = graphNode?.filePath || graphNode?.label || d
      }

      const normalizedNodeId = nodeId?.toString().trim()
      const nodeData = files.find((f) => f.path === normalizedNodeId)

      if (nodeData) {
        onNodeClick(normalizedNodeId, nodeData)
      }
    })
  }

  // 노드 호버 이벤트
  if (onNodeHover) {
    svgGroup
      .selectAll('.node')
      .style('pointer-events', 'all')
      .on('mouseenter', function (event, d) {
        const nodeElement = d3.select(this)
        let nodeId = nodeElement.attr('data-node-id')

        if (!nodeId) {
          const graphNode = graph.node(d)
          nodeId = graphNode?.filePath || graphNode?.label || d
        }

        const nodeData = files.find((f) => f.path === nodeId)
        onNodeHover(nodeId, nodeData, true)
      })
      .on('mouseleave', function (event, d) {
        const nodeElement = d3.select(this)
        let nodeId = nodeElement.attr('data-node-id')

        if (!nodeId) {
          const graphNode = graph.node(d)
          nodeId = graphNode?.filePath || graphNode?.label || d
        }

        const nodeData = files.find((f) => f.path === nodeId)
        onNodeHover(nodeId, nodeData, false)
      })
  }

  // 줌/팬 설정
  const zoom = createZoom((event) => {
    svgGroup.attr('transform', event.transform)
  })

  svg.call(zoom)

  // 초기 줌 설정 (최적화: 가로폭 100%, 스크롤 없이)
  // 렌더링 완료 후 실행되도록 setTimeout 사용
  setTimeout(() => {
    try {
      const bounds = svgGroup.node().getBBox()
      const graphWidth = bounds.width
      const graphHeight = bounds.height

      console.log('[DependencyDiagram] 초기 줌 설정 - 그래프 크기:', { graphWidth, graphHeight, bounds })

      if (graphWidth > 0 && graphHeight > 0) {
        // 최적 스케일 계산 (가로폭 100% 활용, 스크롤 없이)
        const scaleX = containerWidth / graphWidth
        const scaleY = containerHeight / graphHeight
        const optimalScale = Math.min(scaleX, scaleY) * 0.95 // 5% 여유 공간

        const midX = bounds.x + graphWidth / 2
        const midY = bounds.y + graphHeight / 2
        const translate = [containerWidth / 2 - optimalScale * midX, containerHeight / 2 - optimalScale * midY]

        console.log('[DependencyDiagram] 초기 줌 설정 - 변환:', { optimalScale, translate, midX, midY })

        svg.call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(optimalScale))
      } else {
        console.warn('[DependencyDiagram] 그래프 크기가 0입니다.')
      }
    } catch (err) {
      console.warn('[DependencyDiagram] 초기 줌 설정 실패:', err)
      // 기본 fitToScreen 사용
      fitToScreen(svg, svgGroup, containerWidth, containerHeight, zoom)
    }
  }, 100) // 렌더링 완료 후 실행

  return {
    svg,
    svgGroup,
    zoom,
    graph,
  }
}

/**
 * 노드 크기 업데이트 (부분 업데이트)
 * @param {Object} renderResult - renderDependency의 반환값
 */
export function updateDependencyNodeSizes(renderResult) {
  if (!renderResult || !renderResult.svgGroup) return

  const { svgGroup } = renderResult
  const settings = loadDiagramSettings(diagramTypes.DEPENDENCY)
  const nodeWidth = settings.nodeSize?.width || 120
  const nodeHeight = settings.nodeSize?.height || 40

  // 모든 노드 크기 업데이트
  svgGroup.selectAll('.node').each(function () {
    const node = d3.select(this)
    const rect = node.select('rect')

    if (rect.node()) {
      const currentX = parseFloat(rect.attr('x')) || 0
      const currentY = parseFloat(rect.attr('y')) || 0
      const currentWidth = parseFloat(rect.attr('width')) || nodeWidth
      const currentHeight = parseFloat(rect.attr('height')) || nodeHeight

      // 크기 변경에 따른 위치 조정 (중앙 기준)
      const deltaX = (nodeWidth - currentWidth) / 2
      const deltaY = (nodeHeight - currentHeight) / 2

      rect
        .attr('width', nodeWidth)
        .attr('height', nodeHeight)
        .attr('x', currentX - deltaX)
        .attr('y', currentY - deltaY)

      // 라벨 중앙 정렬 재조정
      const text = node.select('text')
      if (text.node()) {
        const centerX = currentX - deltaX + nodeWidth / 2
        const centerY = currentY - deltaY + nodeHeight / 2
        text.attr('x', centerX).attr('y', centerY)
      }
    }
  })
}
