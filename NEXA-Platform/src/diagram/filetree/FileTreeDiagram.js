/**
 * FileTreeDiagram.js
 * 파일 구조 트리 다이어그램 렌더러
 * D3.js force-directed graph를 사용하여 파일 구조 시각화 (의존성 분석과 동일한 구조)
 */

import * as d3 from 'd3'
import { createZoom, fitToScreen } from '../utils/diagramZoom.js'
import { loadDiagramSettings } from '../config/diagramSettings.js'
import { diagramTypes } from '../config/diagramMetadata.js'

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
 * 트리 구조를 packages와 dependencies로 변환
 * @param {Object} root - 트리 루트 노드
 * @returns {Object} { packages, dependencies }
 */
function treeToPackagesAndDependencies(root) {
  const packages = []
  const dependencies = []
  const nodeMap = new Map()

  // 재귀적으로 노드를 순회하여 packages와 dependencies 생성
  function traverse(node, parentPath = '') {
    const nodePath = node.path || `${parentPath}/${node.name}`.replace(/^\/+/, '')
    const nodeId = nodePath || 'root'

    // packages에 추가
    if (nodePath) {
      // root 노드는 제외
      packages.push({
        id: nodeId,
        name: node.name,
        path: nodePath,
        type: node.type || 'folder',
        color: getFileTypeColor(nodePath),
        radius: node.type === 'folder' ? 30 : 25,
      })
      nodeMap.set(nodeId, node)
    }

    // 자식 노드와의 의존성 관계 생성
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        const childPath = child.path || `${nodePath}/${child.name}`.replace(/^\/+/, '')
        const childId = childPath

        // dependencies에 추가 (부모 -> 자식)
        if (nodePath && childPath) {
          dependencies.push({
            from: nodeId,
            to: childId,
            label: '',
          })
        }

        // 재귀적으로 자식 노드 처리
        traverse(child, nodePath)
      })
    }
  }

  traverse(root)

  return { packages, dependencies }
}

/**
 * 파일 구조 트리 다이어그램 렌더링 (의존성 분석과 동일한 구조)
 * @param {HTMLElement} container - 다이어그램 컨테이너 DOM 요소
 * @param {Object} data - 다이어그램 데이터
 * @param {Array} data.files - 파일 목록 (경로 배열 또는 객체 배열)
 * @param {Object} options - 렌더링 옵션
 * @param {String} options.selectedNode - 선택된 노드 경로
 * @param {Function} options.onNodeClick - 노드 클릭 핸들러
 * @param {Function} options.onNodeHover - 노드 호버 핸들러
 * @param {Function} options.onNodeDrag - 노드 드래그 핸들러
 * @returns {Promise<Object>} 렌더링 결과 (svg, svgGroup, zoom, simulation)
 */
export async function renderFileTree(container, data, options = {}) {
  const { files = [] } = data

  const { selectedNode = null, onNodeClick = null, onNodeHover = null, onNodeDrag = null } = options

  // 설정 로드 (network 타입 설정 사용 - 의존성 분석과 동일)
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

  // 파일이 없으면 에러
  if (files.length === 0) {
    console.warn('[FileTreeDiagram] 파일 데이터가 없습니다.')
    throw new Error('파일 데이터가 없습니다.')
  }

  // 트리 구조 생성
  const root = buildTreeFromPaths(files)
  console.log('[FileTreeDiagram] 트리 구조 생성 완료:', root)

  // 트리를 packages와 dependencies로 변환
  const { packages, dependencies } = treeToPackagesAndDependencies(root)
  console.log('[FileTreeDiagram] packages와 dependencies 변환 완료:', { packagesCount: packages.length, dependenciesCount: dependencies.length })

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
        console.warn('[FileTreeDiagram] 엣지의 패키지를 찾을 수 없음:', { sourceId, targetId })
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
        console.warn('[FileTreeDiagram] 링크의 노드를 찾을 수 없음:', link)
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
    pkg.radius = pkg.radius || nodeRadius
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
      if (selectedNode === (d.id || d.name || d.path)) classes.push('node-selected')
      return classes.join(' ')
    })
    .attr('data-node-id', (d) => d.id || d.name)
    .style('cursor', 'pointer')

  // 노드 원 그리기
  node
    .append('circle')
    .attr('r', (d) => d.radius || nodeRadius)
    .attr('fill', (d) => {
      if (selectedNode === (d.id || d.name || d.path)) {
        return 'var(--nexa-primary)'
      }
      return d.color || 'var(--nexa-surface)'
    })
    .attr('stroke', (d) => {
      if (selectedNode === (d.id || d.name || d.path)) {
        return 'var(--nexa-primary)'
      }
      return 'var(--nexa-border-color)'
    })
    .attr('stroke-width', (d) => (selectedNode === (d.id || d.name || d.path) ? '3px' : '2px'))

  // 노드 라벨
  node
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', '12px')
    .attr('font-weight', '600')
    .attr('fill', (d) => {
      if (selectedNode === (d.id || d.name || d.path)) {
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
      const nodeId = d.id || d.name || d.path

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

  // 노드 호버 이벤트
  if (onNodeHover) {
    node
      .on('mouseenter', function (event, d) {
        const nodeId = d.id || d.name || d.path
        d3.select(this).classed('node-hover', true)

        // 선택된 노드가 아니면 임시 강조
        if (currentSelectedNode !== nodeId) {
          highlightConnectedEdges(nodeId, true)
          highlightConnectedNodes(nodeId, true)
        }

        onNodeHover(nodeId, d, true)
      })
      .on('mouseleave', function (event, d) {
        const nodeId = d.id || d.name || d.path
        d3.select(this).classed('node-hover', false)

        // 선택된 노드가 아니면 강조 해제
        if (currentSelectedNode !== nodeId) {
          highlightConnectedEdges(nodeId, false)
          highlightConnectedNodes(nodeId, false)
        }

        onNodeHover(nodeId, d, false)
      })
  }

  // 노드 드래그 이벤트
  const dragStarted = (event, d) => {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
    if (onNodeDrag) {
      onNodeDrag(d.id || d.name || d.path, d, 'start')
    }
  }

  const dragged = (event, d) => {
    d.fx = event.x
    d.fy = event.y
    if (onNodeDrag) {
      onNodeDrag(d.id || d.name || d.path, d, 'drag')
    }
  }

  const dragEnded = (event, d) => {
    if (!event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
    if (onNodeDrag) {
      onNodeDrag(d.id || d.name || d.path, d, 'end')
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

  // 줌/팬 설정
  const zoom = createZoom((event) => {
    svgGroup.attr('transform', event.transform)
  })

  svg.call(zoom)

  // 초기 줌 설정 (공통 유틸리티 사용, Force 시뮬레이션 완료 대기)
  fitToScreen(svg, svgGroup, containerWidth, containerHeight, zoom, {
    margin: 0.9,
    delay: 500, // 시뮬레이션이 어느 정도 진행된 후 줌 설정
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
 * @param {Object} renderResult - renderFileTree의 반환값
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
