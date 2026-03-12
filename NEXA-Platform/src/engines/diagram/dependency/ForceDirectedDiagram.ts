// @ts-nocheck — strict 타입은 추후 엔진 재작성 시 적용
/**
 * ForceDirectedDiagram.js
 * Force-Directed Graph 다이어그램 렌더러 (범용)
 * D3.js force-directed graph를 사용하여 의존성 관계 시각화
 * 파일 의존성 그래프와 패키지 의존성 그래프 모두에서 사용
 */

import * as d3 from 'd3'
import { createZoom, fitToScreen, setOptimalZoom, getCurrentZoom } from '../utils/diagramZoom'
import { loadDiagramSettings } from '../config/diagramSettings'
import { diagramTypes } from '../config/diagramMetadata'
import { createNodeHoverHandlers } from '../utils/diagramEvents'
import { PERFORMANCE_THRESHOLDS } from '../config/diagramSettingsConfig'

/**
 * Force-Directed Graph 다이어그램 렌더링 (범용)
 * @param {HTMLElement} container - 다이어그램 컨테이너 DOM 요소
 * @param {Object} data - 다이어그램 데이터
 * @param {Array} data.packages - 노드 목록 (패키지 또는 파일)
 * @param {Array} data.dependencies - 노드 간 의존성 관계
 * @param {Object} options - 렌더링 옵션
 * @param {String} options.diagramType - 다이어그램 타입 ('dependency' 또는 'dependency-analysis')
 * @param {String} options.selectedNode - 선택된 노드 ID
 * @param {Function} options.onNodeClick - 노드 클릭 핸들러
 * @param {Function} options.onNodeHover - 노드 호버 핸들러
 * @param {Function} options.onNodeDrag - 노드 드래그 핸들러
 * @returns {Promise<Object>} 렌더링 결과 (svg, svgGroup, zoom, simulation)
 */
export async function renderForceDirected(container, data, options = {}) {
  const { packages = [], dependencies = [] } = data

  const { diagramType = diagramTypes.DEPENDENCY_ANALYSIS, selectedNode = null, onNodeClick = null, onNodeHover = null, onNodeDrag = null } = options

  // 고정된 노드 ID 목록 (Set으로 관리)
  const fixedNodeIds = new Set()

  // 설정 로드 (다이어그램 타입별로 분리된 설정 사용)
  const settings = loadDiagramSettings(diagramType)

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
        console.warn('[ForceDirectedDiagram] 엣지의 노드를 찾을 수 없음:', { sourceId, targetId })
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
        console.warn('[ForceDirectedDiagram] 링크의 노드를 찾을 수 없음:', link)
        return null
      }
      return {
        source: sourceNode,
        target: targetNode,
        label: link.label,
      }
    })
    .filter((link) => link !== null)

  // Force 시뮬레이션 설정 (다이어그램 타입별로 분리된 설정 사용)
  const forceSettings = settings.layout?.force || {}
  
  // 디버깅: 설정 로드 확인
  console.log('[ForceDirectedDiagram] 설정 로드:', {
    diagramType,
    forceSettings,
    fullSettings: settings,
  })
  
  // 기본값은 설정 파일의 기본값 사용 (하드코딩된 fallback 제거)
  const charge = forceSettings.charge ?? (diagramType === diagramTypes.DEPENDENCY_ANALYSIS ? -50 : -300)
  const linkDistance = forceSettings.linkDistance ?? (diagramType === diagramTypes.DEPENDENCY_ANALYSIS ? 10 : 100)
  const linkStrength = forceSettings.linkStrength ?? (diagramType === diagramTypes.DEPENDENCY_ANALYSIS ? 0.4 : 0.5)
  const collisionOffset = forceSettings.collision ?? 5
  
  console.log('[ForceDirectedDiagram] Force 파라미터:', { charge, linkDistance, linkStrength, collisionOffset })

  // Force 시뮬레이션 생성 (성능 최적화: alpha decay 조정)
  // linksWithNodes는 이미 노드 객체를 포함하므로 id 함수 불필요
  const simulation = d3
    .forceSimulation(packages)
    .alphaDecay(0.03) // 0.022 → 0.03으로 증가 (더 빠른 안정화, CPU 사용량 감소)
    .velocityDecay(0.4) // 기본값 0.4 유지 (드래그 반응성)
    .force('link', d3.forceLink(linksWithNodes).distance(linkDistance).strength(linkStrength))
    .force('charge', d3.forceManyBody().strength(charge))
    .force('center', d3.forceCenter(containerWidth / 2, containerHeight / 2))
    .force(
      'collision',
      d3.forceCollide().radius((d) => (d.radius || 40) + collisionOffset),
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

  // 성능 임계값 사용 (전역 상수)
  const AUTO_HIDE_LABELS_THRESHOLD = PERFORMANCE_THRESHOLDS.AUTO_HIDE_LABELS
  const REALTIME_LINK_UPDATE_THRESHOLD = PERFORMANCE_THRESHOLDS.REALTIME_LINK_UPDATE
  const PAUSE_SIMULATION_ON_DRAG_THRESHOLD = PERFORMANCE_THRESHOLDS.PAUSE_SIMULATION_ON_DRAG
  
  // 노드 수에 따른 최적화 모드 결정
  const nodeCount = packages.length
  const isNodeCountLowForLabels = nodeCount < AUTO_HIDE_LABELS_THRESHOLD
  const shouldUpdateLinksRealtime = nodeCount < REALTIME_LINK_UPDATE_THRESHOLD
  const shouldPauseSimulationOnDrag = nodeCount >= PAUSE_SIMULATION_ON_DRAG_THRESHOLD
  
  // 라벨 표시 여부 결정:
  // 1. 노드 수가 임계값 미만이면 항상 표시 (UX 향상)
  // 2. 노드 수가 임계값 이상이면 showLabels가 명시적으로 true일 때만 표시 (성능 최적화)
  const showLabelsValue = settings.showLabels !== undefined ? settings.showLabels : true
  const shouldShowLabels = isNodeCountLowForLabels ? true : (showLabelsValue === true)
  
  // 디버깅: 라벨 표시 여부 및 최적화 모드 확인
  console.log('[ForceDirectedDiagram] 성능 최적화 모드:', {
    nodeCount,
    shouldShowLabels,
    shouldUpdateLinksRealtime,
    shouldPauseSimulationOnDrag,
    labelsThreshold: AUTO_HIDE_LABELS_THRESHOLD,
    linksThreshold: REALTIME_LINK_UPDATE_THRESHOLD,
    pauseSimulationThreshold: PAUSE_SIMULATION_ON_DRAG_THRESHOLD,
    showLabels: settings.showLabels,
    showLabelsValue,
  })

  // 노드 라벨 (조건부 렌더링)
  // 라벨은 노드 그룹 내부에 추가되므로 노드의 transform과 함께 이동
  // 노드 중심 (0, 0)에 정확히 배치
  if (shouldShowLabels) {
    node
      .append('text')
      .attr('text-anchor', 'middle') // 수평 중앙 정렬
      .attr('dominant-baseline', 'middle') // 수직 중앙 정렬 (텍스트 중심이 y=0에 위치)
      .attr('x', 0) // 노드 중심 기준 x=0 (수평 중앙)
      .attr('y', 0) // 노드 중심 기준 y=0 (수직 중앙)
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', (d) => {
        if (selectedNode === (d.id || d.name)) {
          return '#ffffff'
        }
        return 'var(--nexa-text-primary)'
      })
      .text((d) => d.name || d.id)
  }

  // 툴팁 생성 (라벨이 숨겨진 경우 호버 시 표시)
  let tooltip = null
  if (!shouldShowLabels) {
    tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'force-diagram-tooltip')
      .style('position', 'absolute')
      .style('padding', '8px 12px')
      .style('background', 'var(--nexa-surface)')
      .style('border', '1px solid var(--nexa-border-color)')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('color', 'var(--nexa-text-primary)')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 10000)
      .style('box-shadow', '0 2px 8px rgba(0, 0, 0, 0.15)')
  }

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

  // 노드 호버 이벤트 (공통 유틸리티 사용 + 툴팁 표시)
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

        // 라벨이 숨겨진 경우 툴팁은 별도 이벤트 핸들러에서 처리

        // 콜백 호출
        onNodeHover(nodeId, nodeData, isEntering)
      },
      getNodeId: (event, d) => d.id || d.name,
      getNodeData: (nodeId) => packages.find((p) => (p.id || p.name) === nodeId),
    })

    if (onMouseenter && onMouseleave) {
      node.on('mouseenter', onMouseenter).on('mouseleave', onMouseleave)
      
      // 라벨이 숨겨진 경우 툴팁도 함께 표시 (성능 최적화: mousemove 스로틀링)
      if (!shouldShowLabels && tooltip) {
        let lastTooltipMoveTime = 0
        const TOOLTIP_THROTTLE = 32 // 32ms마다 한 번만 업데이트 (~30fps)
        
        node
          .on('mouseenter', function (event, d) {
            const nodeName = d.name || d.id
            tooltip
              .html(nodeName)
              .style('opacity', 1)
              .style('left', event.pageX + 10 + 'px')
              .style('top', event.pageY - 10 + 'px')
          })
          .on('mouseleave', function () {
            tooltip.style('opacity', 0)
          })
          .on('mousemove', function (event) {
            // 스로틀링: 32ms마다 한 번만 업데이트 (성능 향상)
            const now = performance.now()
            if (now - lastTooltipMoveTime < TOOLTIP_THROTTLE) {
              return
            }
            lastTooltipMoveTime = now
            tooltip.style('left', event.pageX + 10 + 'px').style('top', event.pageY - 10 + 'px')
          })
      }
    }
  } else if (!shouldShowLabels && tooltip) {
    // onNodeHover가 없어도 툴팁은 표시 (성능 최적화: mousemove 스로틀링)
    let lastTooltipMoveTime = 0
    const TOOLTIP_THROTTLE = 32 // 32ms마다 한 번만 업데이트 (~30fps)
    
    node
      .on('mouseenter', function (event, d) {
        const nodeName = d.name || d.id
        tooltip
          .html(nodeName)
          .style('opacity', 1)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px')
      })
      .on('mouseleave', function () {
        tooltip.style('opacity', 0)
      })
      .on('mousemove', function (event) {
        // 스로틀링: 32ms마다 한 번만 업데이트 (성능 향상)
        const now = performance.now()
        if (now - lastTooltipMoveTime < TOOLTIP_THROTTLE) {
          return
        }
        lastTooltipMoveTime = now
        tooltip.style('left', event.pageX + 10 + 'px').style('top', event.pageY - 10 + 'px')
      })
  }

  // 노드 드래그 이벤트 (성능 최적화: 노드 수에 따라 드래그 중 시뮬레이션 제어)
  const dragStarted = (event, d) => {
    isDragging = true // 드래그 중 플래그 설정 (tick 이벤트 최적화)
    stableTickCount = 0 // 안정화 카운터 리셋
    // 드래그 중인 노드 요소 캐싱 (성능 향상)
    draggedNodeElement = svgGroup.select(`.node[data-node-id="${d.id || d.name}"]`)
    
    // 대량 노드에서는 드래그 중 시뮬레이션 완전 정지 (성능 최적화, INP 개선)
    if (shouldPauseSimulationOnDrag) {
      simulation.stop() // 완전 정지하여 force 계산 부하 제거
    } else {
      // 소량 노드에서는 드래그 중에도 시뮬레이션 느리게 실행 (UX 향상)
      if (!event.active) {
        // alphaTarget을 낮춰서 시뮬레이션을 느리게 실행
        simulation.alphaTarget(0.1).restart()
      }
    }
    
    d.fx = d.x
    d.fy = d.y
    if (onNodeDrag) {
      onNodeDrag(d.id || d.name, d, 'start')
    }
  }

  // 성능 최적화: 드래그 이벤트 스로틀링
  let lastDragTime = 0
  let lastLinkUpdateTime = 0
  const DRAG_THROTTLE = 32 // ~30fps (32ms 간격)
  const LINK_UPDATE_THROTTLE = shouldUpdateLinksRealtime ? 16 : Infinity // 실시간 업데이트 시 16ms, 아니면 무한대 (스킵)
  
  // 성능 최적화: 드래그 중인 노드 요소 캐싱
  let draggedNodeElement = null
  
  // 성능 최적화: 드래그 중 노드 렌더링을 requestAnimationFrame으로 스로틀링
  let dragRafId = null
  let pendingDragPosition = null // 대량 노드에서 위치 업데이트를 requestAnimationFrame 내부로 지연
  
  const dragged = (event, d) => {
    // 대량 노드에서는 이벤트 핸들러를 최대한 가볍게 유지 (입력 지연 감소)
    // 위치 정보만 저장하고 실제 업데이트는 requestAnimationFrame 내부에서 수행
    if (shouldPauseSimulationOnDrag) {
      // 위치만 저장 (메인 스레드 부하 최소화)
      pendingDragPosition = { x: event.x, y: event.y, node: d }
      
      // requestAnimationFrame으로 스로틀링 (표시 지연 감소)
      if (dragRafId === null) {
        dragRafId = requestAnimationFrame(() => {
          if (pendingDragPosition) {
            const { x, y, node } = pendingDragPosition
            
            // 위치 업데이트 (requestAnimationFrame 내부에서 수행)
            node.fx = x
            node.fy = y
            
            // 드래그 중인 노드 요소 캐싱 (성능 향상)
            if (!draggedNodeElement) {
              draggedNodeElement = svgGroup.select(`.node[data-node-id="${node.id || node.name}"]`)
            }
            if (!draggedNodeElement.empty()) {
              // transform 직접 업데이트 (가장 빠른 방법, GPU 가속)
              const domNode = draggedNodeElement.node()
              if (domNode) {
                domNode.setAttribute('transform', `translate(${x},${y})`)
              }
            }
            
            pendingDragPosition = null
          }
          dragRafId = null
        })
      }
    } else {
      // 소량 노드에서는 기존 로직 유지 (즉시 업데이트)
      d.fx = event.x
      d.fy = event.y
      
      // 노드 렌더링을 requestAnimationFrame으로 스로틀링
      if (dragRafId !== null) {
        cancelAnimationFrame(dragRafId)
      }
      
      dragRafId = requestAnimationFrame(() => {
        if (!draggedNodeElement) {
          draggedNodeElement = svgGroup.select(`.node[data-node-id="${d.id || d.name}"]`)
        }
        if (!draggedNodeElement.empty()) {
          const node = draggedNodeElement.node()
          if (node) {
            node.setAttribute('transform', `translate(${event.x},${event.y})`)
          }
        }
        dragRafId = null
      })
      
      // 노드 수가 적으면 라인 실시간 업데이트 (UX 향상)
      if (shouldUpdateLinksRealtime) {
        const now = performance.now()
        if (now - lastLinkUpdateTime >= LINK_UPDATE_THROTTLE) {
          link
            .filter((l) => l.source === d || l.target === d)
            .attr('x1', (l) => l.source.x)
            .attr('y1', (l) => l.source.y)
            .attr('x2', (l) => l.target.x)
            .attr('y2', (l) => l.target.y)
          
          lastLinkUpdateTime = now
        }
      }
    }
    
    // 콜백 스로틀링: 32ms마다 한 번만 호출
    const now = performance.now()
    if (now - lastDragTime < DRAG_THROTTLE) {
      return // 콜백만 스킵
    }
    lastDragTime = now
    
    // 콜백은 스로틀링된 간격으로만 호출
    if (onNodeDrag) {
      onNodeDrag(d.id || d.name, d, 'drag')
    }
  }

  const dragEnded = (event, d) => {
    isDragging = false // 드래그 종료 플래그 해제
    // 드래그 종료 시 캐시 초기화
    draggedNodeElement = null
    
    // 대량 노드에서 pending 위치가 있으면 즉시 적용
    if (pendingDragPosition) {
      const { x, y, node } = pendingDragPosition
      node.fx = x
      node.fy = y
      pendingDragPosition = null
    }
    
    // requestAnimationFrame 취소 (드래그 종료 시 정리)
    if (dragRafId !== null) {
      cancelAnimationFrame(dragRafId)
      dragRafId = null
    }
    
    // 드래그 종료 후 링크 즉시 업데이트 (드래그 중 스킵된 링크 업데이트)
    link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)
    
    // 대량 노드에서는 드래그 종료 후 시뮬레이션 재시작
    // 소량 노드에서는 기존 로직 유지
    if (!event.active) {
      simulation.alphaTarget(0)
      // 드래그 종료 후 시뮬레이션 재시작 (다른 노드들이 안정화되도록)
      // 단, 안정화 카운터는 리셋하여 즉시 정지되지 않도록
      stableTickCount = 0
      simulation.alpha(0.1).restart()
    }
    
    // 노드를 놓은 위치에 고정 (fx, fy를 null로 해제하지 않음)
    const nodeId = d.id || d.name
    d.fx = event.x
    d.fy = event.y
    fixedNodeIds.add(nodeId) // 고정 목록에 추가

    // 고정 노드 클래스 추가
    const nodeElement = svgGroup.select(`.node[data-node-id="${nodeId}"]`)
    nodeElement.classed('node-fixed', true)

    if (onNodeDrag) {
      onNodeDrag(nodeId, d, 'end')
    }
  }

  const drag = d3.drag().on('start', dragStarted).on('drag', dragged).on('end', dragEnded)
  node.call(drag)

  // 폰트 크기 제한 상수
  const MAX_FONT_SIZE = 18
  const BASE_FONT_SIZE = 12

  // 노드 라벨 폰트 크기 제한 적용 (라벨이 있을 때만)
  if (shouldShowLabels) {
    node.selectAll('text').attr('font-size', `${BASE_FONT_SIZE}px`).style('font-size', `${BASE_FONT_SIZE}px`)
  }

  // 노드 텍스트 선택자 캐싱 (성능 최적화, 라벨이 있을 때만)
  let cachedNodeTexts = null
  const getNodeTexts = () => {
    if (!shouldShowLabels) return null
    if (!cachedNodeTexts) {
      cachedNodeTexts = svgGroup.selectAll('.node text')
    }
    return cachedNodeTexts
  }

  // 성능 최적화: requestAnimationFrame으로 렌더링 제한 및 시뮬레이션 안정화 감지
  let rafId = null
  let lastRenderTime = 0
  const TARGET_FPS = 30 // 30fps로 제한 (성능 향상)
  const FRAME_INTERVAL = 1000 / TARGET_FPS
  let stableTickCount = 0
  const STABLE_THRESHOLD = 3 // 연속 3틱 안정화되면 즉시 시뮬레이션 정지 (10 → 3으로 단축)
  let isDragging = false // 드래그 중 여부 (성능 최적화)

  // Force 시뮬레이션 틱 이벤트 (성능 최적화: 30fps로 제한 및 빠른 자동 정지)
  simulation.on('tick', () => {
    // 노드 수에 따라 드래그 중 렌더링 동적 조절
    // 노드 수가 많고 드래그 중이면 모든 렌더링 스킵 (성능 우선)
    // 노드 수가 적으면 드래그 중에도 다른 노드 업데이트 가능 (UX 향상)
    if (isDragging && !shouldUpdateLinksRealtime) {
      // 노드 수가 많으면 드래그 중 모든 렌더링 스킵
      // 드래그 중인 노드는 dragged 핸들러에서 이미 즉시 렌더링됨
      // 링크는 드래그 종료 후에 업데이트
      return
    }
    // 노드 수가 적으면 드래그 중에도 링크는 실시간 업데이트되므로 tick 이벤트 계속 실행

    // requestAnimationFrame으로 렌더링 제한 (30fps 목표)
    const now = performance.now()
    if (now - lastRenderTime < FRAME_INTERVAL) {
      return // 프레임 스킵
    }
    lastRenderTime = now

    // 시뮬레이션 안정화 감지 (alpha가 매우 낮으면 안정화된 것으로 간주)
    // 더 빠른 안정화 감지로 CPU 사용량 감소
    if (simulation.alpha() < 0.01) {
      stableTickCount++
      // 안정화되면 즉시 시뮬레이션 정지 (성능 향상)
      if (stableTickCount >= STABLE_THRESHOLD && !simulation.alphaTarget()) {
        simulation.stop()
        return
      }
    } else {
      stableTickCount = 0
    }

    // 기존 requestAnimationFrame 취소
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
    }

    // 다음 프레임에 렌더링
    rafId = requestAnimationFrame(() => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)

      // 노드 그룹에 transform 적용 (원과 텍스트가 함께 이동)
      // 라벨은 노드 그룹 내부에 있으므로 별도 업데이트 불필요
      node.attr('transform', (d) => `translate(${d.x},${d.y})`)

      rafId = null
    })
  })

  // 줌/팬 설정 (폰트 크기 제한 포함, 성능 최적화)
  const zoom = createZoom(
    (event) => {
      svgGroup.attr('transform', event.transform)

      // 라벨이 없거나 관성 애니메이션 중이면 폰트 업데이트 스킵 (성능 최적화)
      if (!shouldShowLabels || event.skipFontUpdate) {
        return
      }

      // 줌 레벨에 관계없이 폰트 크기 제한 (역스케일링)
      const currentScale = event.transform.k
      const inverseScale = 1 / currentScale
      const fixedFontSize = Math.max(8, Math.min(MAX_FONT_SIZE, BASE_FONT_SIZE * inverseScale))

      // 캐싱된 노드 텍스트 선택자 사용 (성능 최적화)
      const nodeTexts = getNodeTexts()
      if (nodeTexts) {
        nodeTexts.attr('font-size', `${fixedFontSize}px`).style('font-size', `${fixedFontSize}px`)
      }
    },
    {
      // 관성 애니메이션 시작/종료 콜백 (Force 시뮬레이션 제어)
      onInertiaStart: () => {
        // 관성 애니메이션 시작 시 Force 시뮬레이션 일시정지 (성능 최적화)
        simulation.stop()
      },
      onInertiaEnd: () => {
        // 관성 애니메이션 종료 시 Force 시뮬레이션이 안정화되지 않았으면 재시작
        // alpha 값이 충분히 낮으면 재시작하지 않음 (이미 안정화됨)
        if (simulation.alpha() > 0.01) {
          simulation.restart()
        }
      },
      skipFontUpdateDuringInertia: true, // 관성 중 폰트 업데이트 스킵
    },
  )

  svg.call(zoom)

  // 초기 줌 설정 (공통 유틸리티 사용, Force 시뮬레이션 완료 대기)
  // 수동 줌값이 설정에 있으면 사용, 없으면 자동 계산
  const manualZoom = settings.manualZoom || null
  fitToScreen(svg, svgGroup, containerWidth, containerHeight, zoom, {
    margin: 0.9,
    delay: 500, // 시뮬레이션이 어느 정도 진행된 후 줌 설정
    manualZoom: manualZoom, // 수동 줌값 (있으면 자동 계산 대신 사용)
    onComplete: (transform) => {
      // 초기 줌 후 폰트 크기 제한 적용 (라벨이 있을 때만)
      if (shouldShowLabels) {
        const inverseScale = 1 / transform.k
        const fixedFontSize = Math.max(8, Math.min(MAX_FONT_SIZE, BASE_FONT_SIZE * inverseScale))
        svgGroup.selectAll('.node text').attr('font-size', `${fixedFontSize}px`).style('font-size', `${fixedFontSize}px`)
      }
    },
  })

  /**
   * 노드 고정 해제
   * @param {string|string[]} nodeIds - 해제할 노드 ID 또는 ID 배열 (없으면 모두 해제)
   */
  const unfixNodes = (nodeIds = null) => {
    const nodesToUnfix = nodeIds ? (Array.isArray(nodeIds) ? nodeIds : [nodeIds]) : Array.from(fixedNodeIds)

    nodesToUnfix.forEach((nodeId) => {
      const node = packages.find((p) => (p.id || p.name) === nodeId)
      if (node) {
        node.fx = null
        node.fy = null
        fixedNodeIds.delete(nodeId)

        // 고정 노드 클래스 제거
        const nodeElement = svgGroup.select(`.node[data-node-id="${nodeId}"]`)
        nodeElement.classed('node-fixed', false)
      }
    })

    // 시뮬레이션 재시작하여 노드가 다시 움직이도록 함
    simulation.alpha(0.3).restart()
  }

  /**
   * 고정된 노드 ID 목록 반환
   * @returns {string[]} 고정된 노드 ID 배열
   */
  const getFixedNodeIds = () => {
    return Array.from(fixedNodeIds)
  }

  // 정리 함수: 컴포넌트 언마운트 시 툴팁 제거 및 시뮬레이션 정지
  const cleanup = () => {
    // requestAnimationFrame 취소 (tick 이벤트용)
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    
    // requestAnimationFrame 취소 (드래그 중 노드 렌더링용)
    if (dragRafId !== null) {
      cancelAnimationFrame(dragRafId)
      dragRafId = null
    }
    
    // 시뮬레이션 정지
    simulation.stop()
    
    // 툴팁 제거
    if (tooltip) {
      tooltip.remove()
      tooltip = null
    }
  }

  return {
    svg,
    svgGroup,
    zoom,
    simulation,
    unfixNodes,
    getFixedNodeIds,
    cleanup,
    // 수동 최적 줌 함수 (모든 그래프/모드에 공통 적용)
    // translateX, translateY가 null이면 자동으로 중앙정렬 계산
    setOptimalZoom: (scale, translateX = null, translateY = null, options = {}) => {
      return setOptimalZoom(svg, zoom, scale, translateX, translateY, {
        ...options,
        svgGroup,
        containerWidth,
        containerHeight: containerHeight || window.innerHeight * 0.8,
      })
    },
    getCurrentZoom: () => {
      return getCurrentZoom(svg)
    },
  }
}

/**
 * Force 시뮬레이션 파라미터 업데이트
 * @param {Object} renderResult - renderForceDirected의 반환값
 * @param {String} diagramType - 다이어그램 타입 ('dependency' 또는 'dependency-analysis')
 */
export function updateForceParameters(renderResult, diagramType = diagramTypes.DEPENDENCY_ANALYSIS) {
  if (!renderResult || !renderResult.simulation) return

  const { simulation } = renderResult
  const settings = loadDiagramSettings(diagramType)
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
