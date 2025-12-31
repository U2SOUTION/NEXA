/**
 * FileTreeDiagram.js
 * 파일 구조 트리 다이어그램 렌더러
 * D3.js + dagre-d3-es를 사용하여 Hierarchical Layout으로 파일 구조 시각화
 */

import * as d3 from 'd3'
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
    // dagre-d3-es는 graphlib, render를 named export로 제공
    const dagreD3Module = await import('dagre-d3-es')
    graphlib = dagreD3Module.graphlib
    render = dagreD3Module.render

    // dagre는 별도 패키지에서 임포트 (레이아웃 계산용)
    const dagreModule = await import('dagre')
    dagre = dagreModule.default || dagreModule

    return { dagre, graphlib, render }
  } catch (importError) {
    console.error('[FileTreeDiagram] dagre/dagre-d3-es 임포트 실패:', importError)
    throw new Error('dagre 또는 dagre-d3-es 라이브러리를 찾을 수 없습니다. npm install dagre dagre-d3-es를 실행하세요.')
  }
}

/**
 * 파일 경로를 트리 구조로 변환
 * @param {Array} files - 파일 경로 배열
 * @returns {Object} 루트 노드
 */
function buildTreeFromPaths(files) {
  const root = { name: 'root', children: [], path: '', type: 'folder' }

  files.forEach((file) => {
    const path = file.path || file
    const parts = path.split('/').filter((p) => p)
    let current = root

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1
      let child = current.children.find((c) => c.name === part)

      if (!child) {
        child = {
          name: part,
          children: [],
          path: parts.slice(0, index + 1).join('/'),
          type: isLast && file.type ? file.type : 'folder',
          file: isLast ? file : null,
        }
        current.children.push(child)
      }

      current = child
    })
  })

  return root
}

/**
 * 파일 타입별 색상 가져오기
 * @param {String} path - 파일 경로
 * @returns {String} 색상
 */
function getFileTypeColor(path) {
  if (!path) return 'var(--nexa-surface)'
  const ext = path.split('.').pop()?.toLowerCase()
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
 * 파일 구조 트리 다이어그램 렌더링 (Hierarchical Layout)
 * @param {HTMLElement} container - 다이어그램 컨테이너 DOM 요소
 * @param {Object} data - 다이어그램 데이터
 * @param {Array} data.files - 파일 목록 (경로 배열 또는 객체 배열)
 * @param {Object} options - 렌더링 옵션
 * @param {String} options.selectedNode - 선택된 노드 경로
 * @param {Function} options.onNodeClick - 노드 클릭 핸들러
 * @param {Function} options.onNodeHover - 노드 호버 핸들러
 * @param {Function} options.onNodeDrag - 노드 드래그 핸들러 (dagre에서는 위치 고정이 의미 없으므로 무시)
 * @returns {Promise<Object>} 렌더링 결과 (svg, svgGroup, zoom, graph)
 */
export async function renderFileTree(container, data, options = {}) {
  const { files = [] } = data

  const { selectedNode = null, onNodeClick = null, onNodeHover = null } = options

  // 설정 로드 (orientation에 따른 nodesep, ranksep 기본값은 loadDiagramSettings에서 자동 처리됨)
  const settings = loadDiagramSettings(diagramTypes.FILETREE || 'filetree')
  const currentOrientation = settings.layout?.orientation || 'horizontal'

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

  // 파일이 없으면 에러
  if (files.length === 0) {
    console.warn('[FileTreeDiagram] 파일 데이터가 없습니다.')
    throw new Error('파일 데이터가 없습니다.')
  }

  // 트리 구조 생성
  const root = buildTreeFromPaths(files)
  console.log('[FileTreeDiagram] 트리 구조 생성 완료:', root)

  // SVG 생성
  const svg = d3.select(container).append('svg').attr('width', '100%').attr('height', '100%').attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)

  // 그래프 요소 그룹 (줌/팬 transform 적용)
  const svgGroup = svg.append('g').attr('class', 'graph-group')

  // filetree 설정의 orientation에 따라 rankdir 결정
  const rankdir = currentOrientation === 'horizontal' ? 'LR' : 'TB'

  const graph = new graphlib.Graph()
    .setGraph({
      rankdir: rankdir, // 방향: LR(좌→우), TB(상→하), RL(우→좌), BT(하→상)
      nodesep: settings.layout?.nodesep,
      ranksep: settings.layout?.ranksep,
      marginx: settings.layout?.marginx,
      marginy: settings.layout?.marginy,
    })
    .setDefaultEdgeLabel(() => ({}))

  // 노드 크기 설정
  // nodeWidth: 각 노드의 너비 (px)
  // 값이 클수록 노드가 더 넓어지고, 전체 그래프 너비도 증가
  const nodeWidth = settings.nodeSize?.width || 120
  // nodeHeight: 각 노드의 높이 (px)
  // 값이 클수록 노드가 더 높아지고, 전체 그래프 높이도 증가
  const nodeHeight = settings.nodeSize?.height || 30

  // 노드와 엣지를 dagre graph에 추가 (트리 구조 순회)
  const nodeMap = new Map() // path -> node data

  function addNodeToGraph(node, parentPath = null) {
    if (!node.path) return // root 노드는 제외

    const nodeId = node.path
    const isSelected = selectedNode === nodeId
    const isFolder = node.type === 'folder'

    // 노드 데이터 저장
    nodeMap.set(nodeId, node)

    // dagre graph에 노드 추가
    graph.setNode(nodeId, {
      label: node.name,
      shape: 'rect',
      style: '',
      labelStyle: '',
      width: nodeWidth,
      height: nodeHeight,
      class: isSelected ? 'node-selected' : isFolder ? 'node-folder' : 'node-file',
      fileType: node.type,
      filePath: node.path,
    })

    // 부모-자식 관계 엣지 추가
    if (parentPath) {
      graph.setEdge(parentPath, nodeId, {
        label: '',
        arrowhead: 'vee',
        style: '',
        labelStyle: '',
      })
    }

    // 자식 노드 재귀적으로 추가
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        addNodeToGraph(child, nodeId)
      })
    }
  }

  // root의 자식들부터 시작 (root는 제외)
  if (root.children && root.children.length > 0) {
    root.children.forEach((child) => {
      addNodeToGraph(child, null)
    })
  }

  console.log('[FileTreeDiagram] dagre graph 생성 완료:', { nodesCount: graph.nodes().length, edgesCount: graph.edges().length })

  // 노드가 없으면 에러
  if (graph.nodes().length === 0) {
    throw new Error('노드 데이터가 없습니다.')
  }

  // Dagre 레이아웃 계산
  if (dagre && typeof dagre.layout === 'function') {
    dagre.layout(graph)
    console.log('[FileTreeDiagram] 레이아웃 계산 완료, 노드 개수:', graph.nodes().length)
  } else {
    throw new Error('dagre layout 함수를 찾을 수 없습니다.')
  }

  // D3.js로 렌더링
  if (render) {
    const renderer = new render()
    renderer(svgGroup, graph)
    console.log('[FileTreeDiagram] D3.js 렌더링 완료')

    // 노드에 data-node-id 속성 추가 및 선택 상태 클래스 추가
    svgGroup.selectAll('.node').each(function (d) {
      const node = d3.select(this)
      const graphNode = graph.node(d)
      let nodeId = graphNode?.filePath || graphNode?.label || d

      // nodeId 정규화
      if (nodeId) {
        nodeId = nodeId.toString().trim()
      }

      // data 속성에 노드 ID 저장
      node.attr('data-node-id', nodeId)

      // 선택 상태 확인
      const normalizedNodeId = nodeId?.toLowerCase()
      const normalizedSelectedNode = selectedNode?.toString().trim().toLowerCase()
      const isSelected = normalizedNodeId === normalizedSelectedNode

      if (isSelected) {
        node.classed('node-selected', true)
      }

      // 파일 타입별 색상 적용 (circle 또는 rect에)
      const fileType = graphNode?.fileType
      if (fileType && fileType !== 'folder') {
        const color = getFileTypeColor(graphNode?.filePath || nodeId)
        node.select('rect').attr('fill', color)
      }
    })
  } else {
    throw new Error('render를 찾을 수 없습니다.')
  }

  // 노드 라벨 중앙 정렬 설정
  svgGroup.selectAll('.node').each(function () {
    const node = d3.select(this)
    const rect = node.select('rect')
    const text = node.select('text')

    if (!rect.node() || !text.node()) return

    // 노드 중심 좌표 계산
    const bbox = rect.node().getBBox()
    const centerX = bbox.x + bbox.width / 2
    const centerY = bbox.y + bbox.height / 2

    // 모든 tspan의 x를 0으로 설정 (중앙 정렬)
    text.selectAll('tspan').attr('x', 0)
    // 첫 번째 tspan의 dy만 0으로 설정
    text.select('tspan').attr('dy', 0)

    // text 중앙 정렬
    text.attr('x', centerX).attr('y', centerY).attr('dy', 0).attr('text-anchor', 'middle')
  })

  // 노드 클릭 이벤트
  if (onNodeClick) {
    svgGroup.selectAll('.node').on('click', function (event, d) {
      event.stopPropagation()
      const nodeElement = d3.select(this)
      let nodeId = nodeElement.attr('data-node-id')

      // data 속성이 없으면 graph에서 가져오기
      if (!nodeId && graph) {
        const graphNode = graph.node(d)
        nodeId = graphNode?.filePath || graphNode?.label || d
      }

      if (!nodeId) {
        nodeId = d
      }

      const normalizedNodeId = nodeId?.toString().trim()
      const nodeData = nodeMap.get(normalizedNodeId) || files.find((f) => (f.path || f.id || f.name) === normalizedNodeId)

      console.log('[FileTreeDiagram] 노드 클릭:', { nodeId: normalizedNodeId, nodeData })

      if (nodeData) {
        onNodeClick(normalizedNodeId, nodeData)
      }
    })
  }

  // 노드 호버 이벤트 (공통 유틸리티 사용)
  if (onNodeHover) {
    const { onMouseenter, onMouseleave } = createNodeHoverHandlers({
      onNodeHover,
      getNodeId: (event, d, nodeElement) => {
        let nodeId = nodeElement.attr('data-node-id')
        if (!nodeId && graph) {
          const graphNode = graph.node(d)
          nodeId = graphNode?.filePath || graphNode?.label || d
        }
        return nodeId?.toString().trim() || d
      },
      getNodeData: (nodeId) => {
        return nodeMap.get(nodeId) || files.find((f) => (f.path || f.id || f.name) === nodeId)
      },
    })

    if (onMouseenter && onMouseleave) {
      svgGroup.selectAll('.node').on('mouseenter', onMouseenter).on('mouseleave', onMouseleave)
    }
  }

  // 줌/팬 설정
  const zoom = createZoom((event) => {
    svgGroup.attr('transform', event.transform)
  })

  svg.call(zoom)

  // 초기 줌 설정 (공통 유틸리티 사용)
  // dagre 렌더링 완료 후 getBBox()가 정확한 값을 반환하도록 충분한 delay 설정
  fitToScreen(svg, svgGroup, containerWidth, containerHeight, zoom, {
    margin: 0.95, // 5% 여유 공간
    delay: 300, // dagre 렌더링 완료 대기 (getBBox() 정확성 보장)
    onComplete: (transform) => {
      // 렌더링 완료 후 디버깅 정보 출력 (캔버스 크기 최적화 문제 분석용)
      try {
        const bounds = svgGroup.node().getBBox()
        const currentOrientation = settings.layout?.orientation || 'horizontal'
        console.log('[FileTreeDiagram] fitToScreen 완료:', {
          bounds: { width: bounds.width, height: bounds.height, x: bounds.x, y: bounds.y },
          container: { width: containerWidth, height: containerHeight },
          transform: { scale: transform.k, translate: [transform.x, transform.y] },
          orientation: currentOrientation,
          layoutSettings: {
            nodesep: settings.layout?.nodesep,
            ranksep: settings.layout?.ranksep,
            marginx: settings.layout?.marginx,
            marginy: settings.layout?.marginy,
          },
        })
      } catch (err) {
        console.warn('[FileTreeDiagram] fitToScreen 디버깅 정보 추출 실패:', err)
      }
    },
  })

  // 고정 노드 기능은 dagre에서는 지원하지 않으므로 빈 함수 반환
  const unfixNodes = () => {
    console.warn('[FileTreeDiagram] unfixNodes는 Hierarchical Layout에서는 지원하지 않습니다.')
  }

  const getFixedNodeIds = () => {
    return []
  }

  return {
    svg,
    svgGroup,
    zoom,
    graph,
    unfixNodes,
    getFixedNodeIds,
  }
}
