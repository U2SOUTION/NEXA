/**
 * PackageDependencyDiagram.js
 * 패키지 의존성 그래프 다이어그램 렌더러
 * D3.js force-directed graph를 사용하여 패키지 의존성 관계 시각화
 */

import * as d3 from 'd3'
import { createZoom, fitToScreen } from '../utils/diagramZoom.js'
import { loadDiagramSettings } from '../config/diagramSettings.js'
import { diagramTypes } from '../config/diagramMetadata.js'
import { createNodeHoverHandlers } from '../utils/diagramEvents.js'

/**
 * 패키지 의존성 그래프 다이어그램 렌더링
 * @param {HTMLElement} container - 다이어그램 컨테이너 DOM 요소
 * @param {Object} data - 다이어그램 데이터
 * @param {Array} data.packages - 패키지 목록
 * @param {Array} data.dependencies - 패키지 간 의존성 관계
 * @param {Object} options - 렌더링 옵션
 * @param {String} options.selectedNode - 선택된 노드 ID
 * @param {Function} options.onNodeClick - 노드 클릭 핸들러
 * @param {Function} options.onNodeHover - 노드 호버 핸들러
 * @param {Function} options.onNodeDrag - 노드 드래그 핸들러
 * @returns {Promise<Object>} 렌더링 결과 (svg, svgGroup, zoom, simulation)
 */
export async function renderDependencyAnalysis(container, data, options = {}) {
  const { packages = [], dependencies = [] } = data

  const { selectedNode = null, onNodeClick = null, onNodeHover = null, onNodeDrag = null } = options

  // 설정 로드 (network 타입 설정 사용)
  const settings = loadDiagramSettings(diagramTypes.NETWORK)

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

  // 패키지가 없으면 에러
  if (packages.length === 0) {
    throw new Error('패키지 데이터가 없습니다.')
  }

  // 패키지 ID 매핑 생성 (id 또는 name으로 접근 가능하도록)
  const packageIdMap = new Map()
  packages.forEach((pkg) => {
    const id = pkg.id || pkg.name
    if (id) {
      packageIdMap.set(id, pkg)
    }
  })

  // dependencies를 D3 forceLink 형식으로 변환 ({ from, to } -> { source, target })
  const links = dependencies
    .map((dep) => {
      const sourceId = dep.from || dep.source
      const targetId = dep.to || dep.target

      // 패키지가 존재하는지 확인
      if (!packageIdMap.has(sourceId) || !packageIdMap.has(targetId)) {
        console.warn('[PackageDependencyDiagram] 엣지의 패키지를 찾을 수 없음:', { sourceId, targetId })
        return null
      }

      return {
        source: sourceId,
        target: targetId,
        label: dep.label || '',
      }
    })
    .filter((link) => link !== null)

  // SVG 생성
  const svg = d3.select(container).append('svg').attr('width', '100%').attr('height', '100%').attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)

  const svgGroup = svg.append('g')

  // links의 source와 target을 패키지 객체로 변환
  const linksWithNodes = links
    .map((link) => {
      const sourceNode = packageIdMap.get(link.source)
      const targetNode = packageIdMap.get(link.target)
      if (!sourceNode || !targetNode) {
        console.warn('[PackageDependencyDiagram] 링크의 노드를 찾을 수 없음:', link)
        return null
      }
      return {
        source: sourceNode,
        target: targetNode,
        label: link.label,
      }
    })
    .filter((link) => link !== null)

  // Force 시뮬레이션 설정
  const forceSettings = settings.layout?.force || {}
  const charge = forceSettings.charge || -300
  const linkDistance = forceSettings.linkDistance || 100
  const linkStrength = forceSettings.linkStrength || 0.5

  // Force 시뮬레이션 생성
  // linksWithNodes는 이미 노드 객체를 포함하므로 id 함수 불필요
  const simulation = d3
    .forceSimulation(packages)
    .force('link', d3.forceLink(linksWithNodes).distance(linkDistance).strength(linkStrength))
    .force('charge', d3.forceManyBody().strength(charge))
    .force('center', d3.forceCenter(containerWidth / 2, containerHeight / 2))
    .force(
      'collision',
      d3.forceCollide().radius((d) => (d.radius || 40) + 5),
    )

  // 노드 크기 설정
  const nodeSize = settings.nodeSize || { width: 80, height: 80 }
  const nodeRadius = Math.min(nodeSize.width, nodeSize.height) / 2

  // 노드에 초기 위치 설정
  packages.forEach((pkg, i) => {
    const angle = (i / packages.length) * 2 * Math.PI
    const radius = Math.min(containerWidth, containerHeight) * 0.3
    pkg.x = containerWidth / 2 + radius * Math.cos(angle)
    pkg.y = containerHeight / 2 + radius * Math.sin(angle)
    pkg.radius = nodeRadius
  })

  // 링크 그리기
  const link = svgGroup
    .append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(linksWithNodes)
    .enter()
    .append('line')
    .attr('class', 'link')
    .attr('stroke', 'var(--nexa-primary)')
    .attr('stroke-width', 2)
    .attr('stroke-opacity', 0.6)
    .attr('data-source-id', (d) => d.source.id || d.source.name)
    .attr('data-target-id', (d) => d.target.id || d.target.name)

  // 노드 그리기
  const node = svgGroup
    .append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(packages)
    .enter()
    .append('g')
    .attr('class', (d) => {
      const classes = ['node']
      if (selectedNode === (d.id || d.name)) classes.push('node-selected')
      return classes.join(' ')
    })
    .attr('data-node-id', (d) => d.id || d.name)
    .style('cursor', 'pointer')

  // 노드 원 그리기
  node
    .append('circle')
    .attr('r', (d) => d.radius || nodeRadius)
    .attr('fill', (d) => {
      if (selectedNode === (d.id || d.name)) {
        return 'var(--nexa-primary)'
      }
      return d.color || 'var(--nexa-surface)'
    })
    .attr('stroke', (d) => {
      if (selectedNode === (d.id || d.name)) {
        return 'var(--nexa-primary)'
      }
      return 'var(--nexa-border-color)'
    })
    .attr('stroke-width', (d) => (selectedNode === (d.id || d.name) ? '3px' : '2px'))

  // 노드 라벨
  node
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', '12px')
    .attr('font-weight', '600')
    .attr('fill', (d) => {
      if (selectedNode === (d.id || d.name)) {
        return '#ffffff'
      }
      return 'var(--nexa-text-primary)'
    })
    .text((d) => d.name || d.id)

  // 선택된 노드 상태 추적
  let currentSelectedNode = selectedNode

  // 연결된 엣지 강조 함수
  function highlightConnectedEdges(nodeId, highlight) {
    svgGroup.selectAll('.link').attr('stroke-opacity', function (d) {
      const sourceId = d.source.id || d.source.name
      const targetId = d.target.id || d.target.name
      const isConnected = sourceId === nodeId || targetId === nodeId

      if (highlight && isConnected) {
        // 연결된 엣지: 강조
        d3.select(this).classed('link-highlighted', true).attr('stroke', 'var(--nexa-primary)').attr('stroke-width', 3).attr('stroke-opacity', 1)
        return 1
      } else if (highlight && !isConnected) {
        // 연결되지 않은 엣지: 흐리게
        d3.select(this).classed('link-highlighted', false).attr('stroke-opacity', 0.1)
        return 0.1
      } else {
        // 강조 해제: 원래 상태
        d3.select(this).classed('link-highlighted', false).attr('stroke', 'var(--nexa-primary)').attr('stroke-width', 2).attr('stroke-opacity', 0.6)
        return 0.6
      }
    })
  }

  // 연결된 노드 강조 함수
  function highlightConnectedNodes(nodeId, highlight) {
    svgGroup
      .selectAll('.node')
      .filter(function (d) {
        const currentNodeId = d.id || d.name
        if (currentNodeId === nodeId) return false // 자기 자신 제외

        // 연결된 노드인지 확인
        const isConnected = linksWithNodes.some((link) => {
          const sourceId = link.source.id || link.source.name
          const targetId = link.target.id || link.target.name
          return (sourceId === nodeId && targetId === currentNodeId) || (targetId === nodeId && sourceId === currentNodeId)
        })

        return isConnected
      })
      .classed('node-connected', highlight)
      .select('circle')
      .attr('opacity', highlight ? 0.8 : 1)
      .attr('stroke-width', highlight ? '3px' : '2px')
  }

  // 노드 클릭 이벤트
  if (onNodeClick) {
    node.on('click', function (event, d) {
      event.stopPropagation()
      const nodeId = d.id || d.name

      // 이전 선택 해제
      if (currentSelectedNode && currentSelectedNode !== nodeId) {
        highlightConnectedEdges(currentSelectedNode, false)
        highlightConnectedNodes(currentSelectedNode, false)
      }

      // 새 선택
      currentSelectedNode = nodeId
      highlightConnectedEdges(nodeId, true)
      highlightConnectedNodes(nodeId, true)

      onNodeClick(nodeId, d)
    })
  }

  // 노드 호버 이벤트 (공통 유틸리티 사용)
  if (onNodeHover) {
    const { onMouseenter, onMouseleave } = createNodeHoverHandlers({
      onNodeHover: (nodeId, nodeData, isEntering) => {
        // 선택된 노드가 아니면 임시 강조/해제
        if (!isEntering && currentSelectedNode !== nodeId) {
          highlightConnectedEdges(nodeId, false)
          highlightConnectedNodes(nodeId, false)
        } else if (isEntering && currentSelectedNode !== nodeId) {
          highlightConnectedEdges(nodeId, true)
          highlightConnectedNodes(nodeId, true)
        }

        // 콜백 호출
        onNodeHover(nodeId, nodeData, isEntering)
      },
      getNodeId: (event, d) => d.id || d.name,
      getNodeData: (nodeId) => packages.find((p) => (p.id || p.name) === nodeId),
    })

    if (onMouseenter && onMouseleave) {
      node.on('mouseenter', onMouseenter).on('mouseleave', onMouseleave)
    }
  }

  // 노드 드래그 이벤트
  const dragStarted = (event, d) => {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
    if (onNodeDrag) {
      onNodeDrag(d.id || d.name, d, 'start')
    }
  }

  const dragged = (event, d) => {
    d.fx = event.x
    d.fy = event.y
    if (onNodeDrag) {
      onNodeDrag(d.id || d.name, d, 'drag')
    }
  }

  const dragEnded = (event, d) => {
    if (!event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
    if (onNodeDrag) {
      onNodeDrag(d.id || d.name, d, 'end')
    }
  }

  const drag = d3.drag().on('start', dragStarted).on('drag', dragged).on('end', dragEnded)
  node.call(drag)

  // Force 시뮬레이션 틱 이벤트
  simulation.on('tick', () => {
    link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)

    node.attr('transform', (d) => `translate(${d.x},${d.y})`)
  })

  // 폰트 크기 제한 상수
  const MAX_FONT_SIZE = 18
  const BASE_FONT_SIZE = 12

  // 노드 라벨 폰트 크기 제한 적용
  node.selectAll('text').attr('font-size', `${BASE_FONT_SIZE}px`).style('font-size', `${BASE_FONT_SIZE}px`)

  // 줌/팬 설정 (폰트 크기 제한 포함)
  const zoom = createZoom((event) => {
    svgGroup.attr('transform', event.transform)

    // 줌 레벨에 관계없이 폰트 크기 제한 (역스케일링)
    const currentScale = event.transform.k
    const inverseScale = 1 / currentScale
    const fixedFontSize = Math.max(8, Math.min(MAX_FONT_SIZE, BASE_FONT_SIZE * inverseScale))

    // 모든 노드 라벨의 폰트 크기 제한
    svgGroup.selectAll('.node text').attr('font-size', `${fixedFontSize}px`).style('font-size', `${fixedFontSize}px`)
  })

  svg.call(zoom)

  // 초기 줌 설정 (공통 유틸리티 사용, Force 시뮬레이션 완료 대기)
  fitToScreen(svg, svgGroup, containerWidth, containerHeight, zoom, {
    margin: 0.9,
    delay: 500, // 시뮬레이션이 어느 정도 진행된 후 줌 설정
    onComplete: (transform) => {
      // 초기 줌 후 폰트 크기 제한 적용
      const inverseScale = 1 / transform.k
      const fixedFontSize = Math.max(8, Math.min(MAX_FONT_SIZE, BASE_FONT_SIZE * inverseScale))
      svgGroup.selectAll('.node text').attr('font-size', `${fixedFontSize}px`).style('font-size', `${fixedFontSize}px`)
    },
  })

  return {
    svg,
    svgGroup,
    zoom,
    simulation,
  }
}

/**
 * Force 시뮬레이션 파라미터 업데이트
 * @param {Object} renderResult - renderDependencyAnalysis의 반환값
 */
export function updateForceParameters(renderResult) {
  if (!renderResult || !renderResult.simulation) return

  const { simulation } = renderResult
  const settings = loadDiagramSettings(diagramTypes.NETWORK)
  const forceSettings = settings.layout?.force || {}

  // Force 업데이트
  simulation
    .force('link')
    .distance(forceSettings.linkDistance || 100)
    .strength(forceSettings.linkStrength || 0.5)

  simulation.force('charge').strength(forceSettings.charge || -300)

  // 시뮬레이션 재시작
  simulation.alpha(1).restart()
}
