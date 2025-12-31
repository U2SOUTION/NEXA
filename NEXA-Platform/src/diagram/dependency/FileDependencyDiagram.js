/**
 * FileDependencyDiagram.js
 * 파일 의존성 그래프 다이어그램 렌더러
 * D3.js + dagre-d3-es를 사용하여 파일 간 의존성 관계 시각화
 *
 * 근본적인 폰트 크기 문제 해결:
 * - 텍스트를 별도 그룹으로 분리하여 transform의 영향을 받지 않도록 함
 * - 줌 이벤트에서 텍스트 위치를 수동으로 업데이트
 */

import * as d3 from 'd3'
import { getLayoutOptions, layoutTypes } from '../utils/diagramLayout.js'
import { createZoom, fitToScreen } from '../utils/diagramZoom.js'
import { loadDiagramSettings } from '../config/diagramSettings.js'
import { diagramTypes } from '../config/diagramMetadata.js'
import { createNodeHoverHandlers } from '../utils/diagramEvents.js'

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
    console.error('[FileDependencyDiagram] dagre/dagre-d3-es 임포트 실패:', importError)
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
    vue: '#42b883',
    js: '#f7df1e',
    ts: '#007acc',
    scss: '#c6538c',
    css: '#563d7c',
    json: '#f39c12',
    md: '#08c',
    html: '#e34c26',
  }
  return colorMap[ext] || 'var(--nexa-surface)'
}

/**
 * 파일 의존성 그래프 다이어그램 렌더링
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

  // 컨테이너 크기 확인
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

  // 그래프 요소 그룹 (줌/팬 transform 적용)
  const svgGroup = svg.append('g').attr('class', 'graph-group')

  // 텍스트 전용 그룹 (transform 영향 없음, 별도 관리)
  const textGroup = svg.append('g').attr('class', 'text-group')

  // 폰트 크기 상수
  const FONT_SIZE = 12

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
      console.warn('[FileDependencyDiagram] 잘못된 파일 데이터:', file)
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
      fileType: file.path.split('.').pop()?.toLowerCase(),
      filePath: file.path,
    })
  })

  // 엣지 추가 (의존성 관계)
  dependencies.forEach((dep) => {
    if (!dep.from || !dep.to) {
      console.warn('[FileDependencyDiagram] 잘못된 의존성 데이터:', dep)
      return
    }

    if (!graph.hasNode(dep.from) || !graph.hasNode(dep.to)) {
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
  if (graph.nodes().length === 0) {
    throw new Error('그래프에 노드가 없습니다.')
  }

  // Dagre 레이아웃 계산
  if (dagre && typeof dagre.layout === 'function') {
    dagre.layout(graph)
  } else {
    throw new Error('dagre layout 함수를 찾을 수 없습니다.')
  }

  // D3.js로 렌더링
  if (render) {
    const renderer = new render()
    renderer(svgGroup, graph)

    // 노드에 data-node-id 속성 추가 및 파일 타입별 색상 적용
    svgGroup.selectAll('.node').each(function (d) {
      const node = d3.select(this)
      const graphNode = graph.node(d)
      const nodeId = graphNode?.filePath || graphNode?.label || d

      node.attr('data-node-id', nodeId)

      if (selectedNode === nodeId) {
        node.classed('node-selected', true)
      }

      const fileType = graphNode?.fileType
      const rect = node.select('rect')
      if (rect.node() && fileType) {
        rect.attr('fill', getFileTypeColor(nodeId))
      }
    })
  } else {
    throw new Error('render를 찾을 수 없습니다.')
  }

  // 텍스트를 textGroup으로 이동하고 원본은 숨김
  const textElements = new Map() // 노드 ID -> 텍스트 요소 매핑

  svgGroup.selectAll('.node').each(function (d) {
    const node = d3.select(this)
    const rect = node.select('rect')
    const originalText = node.select('text')

    if (!rect.node() || !originalText.node()) return

    // 원본 텍스트 숨김
    originalText.style('display', 'none')

    // textGroup에 새 텍스트 생성
    const graphNode = graph.node(d)
    const nodeId = graphNode?.filePath || graphNode?.label || d
    const label = graphNode?.label || ''

    const bbox = rect.node().getBBox()
    const centerX = bbox.x + bbox.width / 2
    const centerY = bbox.y + bbox.height / 2

    const newText = textGroup.append('text').attr('class', 'node-label').attr('data-node-id', nodeId).attr('x', centerX).attr('y', centerY).attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('font-size', `${FONT_SIZE}px`).style('font-size', `${FONT_SIZE}px`).text(label)

    textElements.set(nodeId, { element: newText, node: d, graphNode })
  })

  // 엣지 라벨도 textGroup으로 이동
  const edgeTextElements = new Map()

  svgGroup.selectAll('.edgeLabel').each(function (d, i) {
    const edgeLabel = d3.select(this)
    const originalText = edgeLabel.select('text')

    if (!originalText.node()) return

    // 원본 텍스트 숨김
    originalText.style('display', 'none')

    // textGroup에 새 텍스트 생성
    const label = originalText.text() || ''
    const edgeBbox = edgeLabel.node().getBBox()
    const centerX = edgeBbox.x + edgeBbox.width / 2
    const centerY = edgeBbox.y + edgeBbox.height / 2

    const newText = textGroup.append('text').attr('class', 'edge-label').attr('x', centerX).attr('y', centerY).attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('font-size', `${FONT_SIZE}px`).style('font-size', `${FONT_SIZE}px`).text(label)

    edgeTextElements.set(i, { element: newText, edgeLabel })
  })

  // 텍스트 위치 업데이트 함수
  function updateTextPositions(transform) {
    // 노드 라벨 위치 업데이트
    textElements.forEach(({ element, node: d, graphNode }) => {
      const nodeElement = svgGroup.select(`.node[data-node-id="${graphNode?.filePath || graphNode?.label || d}"]`)
      const rect = nodeElement.select('rect')

      if (rect.node()) {
        const bbox = rect.node().getBBox()
        const centerX = transform.applyX(bbox.x + bbox.width / 2)
        const centerY = transform.applyY(bbox.y + bbox.height / 2)

        element.attr('x', centerX).attr('y', centerY)
      }
    })

    // 엣지 라벨 위치 업데이트
    edgeTextElements.forEach(({ element, edgeLabel }) => {
      if (edgeLabel.node()) {
        const currentBbox = edgeLabel.node().getBBox()
        const centerX = transform.applyX(currentBbox.x + currentBbox.width / 2)
        const centerY = transform.applyY(currentBbox.y + currentBbox.height / 2)

        element.attr('x', centerX).attr('y', centerY)
      }
    })
  }

  // 엣지 색상 설정
  svgGroup.selectAll('.edgePath path').attr('stroke', 'var(--nexa-primary)').attr('stroke-width', '2px').attr('fill', 'none')

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

  // 노드 호버 이벤트 (공통 유틸리티 사용 + 라벨 처리)
  if (onNodeHover) {
    const { onMouseenter, onMouseleave } = createNodeHoverHandlers({
      onNodeHover,
      getNodeId: (event, d, nodeElement) => {
        let nodeId = nodeElement.attr('data-node-id')
        if (!nodeId) {
          const graphNode = graph.node(d)
          nodeId = graphNode?.filePath || graphNode?.label || d
        }
        return nodeId
      },
      getNodeData: (nodeId) => files.find((f) => f.path === nodeId),
      // 라벨 요소 가져오기 함수 (FileDependencyDiagram은 textGroup에 별도 관리)
      getLabelElement: (nodeId, textGroup) => {
        if (textGroup) {
          return textGroup.select(`text.node-label[data-node-id="${nodeId}"]`)
        }
        return null
      },
      textGroup: textGroup, // textGroup 전달
    })

    if (onMouseenter && onMouseleave) {
      svgGroup.selectAll('.node').style('pointer-events', 'all').on('mouseenter', onMouseenter).on('mouseleave', onMouseleave)
    }
  }

  // 줌/팬 설정
  const zoom = createZoom((event) => {
    svgGroup.attr('transform', event.transform)
    // 텍스트 위치 업데이트 (transform 적용)
    updateTextPositions(event.transform)
  })

  svg.call(zoom)

  // 초기 줌 설정 (공통 유틸리티 사용)
  fitToScreen(svg, svgGroup, containerWidth, containerHeight, zoom, {
    margin: 0.95, // 5% 여유 공간
    delay: 100,
    onComplete: (transform) => {
      // 텍스트 위치 업데이트
      updateTextPositions(transform)
    },
  })

  return {
    svg,
    svgGroup,
    textGroup,
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

  svgGroup.selectAll('.node').each(function () {
    const node = d3.select(this)
    const rect = node.select('rect')

    if (rect.node()) {
      const currentX = parseFloat(rect.attr('x')) || 0
      const currentY = parseFloat(rect.attr('y')) || 0
      const currentWidth = parseFloat(rect.attr('width')) || nodeWidth
      const currentHeight = parseFloat(rect.attr('height')) || nodeHeight

      const deltaX = (nodeWidth - currentWidth) / 2
      const deltaY = (nodeHeight - currentHeight) / 2

      rect
        .attr('width', nodeWidth)
        .attr('height', nodeHeight)
        .attr('x', currentX - deltaX)
        .attr('y', currentY - deltaY)
    }
  })
}
