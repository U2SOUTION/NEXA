/**
 * ERDDiagram.js
 * ERD 다이어그램 렌더러
 * D3.js + dagre-d3-es를 사용하여 테이블 관계 시각화
 */

import * as d3 from 'd3'
import { getLayoutOptions, layoutTypes } from '../utils/diagramLayout.js'
import { createZoom, fitToScreen } from '../utils/diagramZoom.js'
import { getERDSettings, defaultERDSettings } from '../config/diagramSettings.js'

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
  const { tables = [], relationships = [] } = data

  const { selectedNode = null, layoutType = layoutTypes.HIERARCHICAL, layoutOptions = {}, onNodeClick = null, onNodeHover = null } = options

  // 설정 로드
  const settings = getERDSettings()

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

  // SVG 생성 (배경색은 CSS에서 처리)
  const svg = d3.select(container).append('svg').attr('width', '100%').attr('height', '100%').attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)

  const svgGroup = svg.append('g')

  // Dagre 그래프 생성 (설정값 사용)
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

  // 노드 추가 (테이블) - 설정값 사용 (모든 노드 동일 크기)
  // 기존 설정 호환성: nodeSize가 단일 구조인지 확인
  let nodeWidth = defaultERDSettings.nodeSize.width
  let nodeHeight = defaultERDSettings.nodeSize.height

  if (settings?.nodeSize) {
    // 새로운 단일 구조
    if (settings.nodeSize.width && settings.nodeSize.height) {
      nodeWidth = settings.nodeSize.width
      nodeHeight = settings.nodeSize.height
    }
    // 기존 구조 호환성
    else if (settings.nodeSize.unselected) {
      nodeWidth = settings.nodeSize.unselected.width || defaultERDSettings.nodeSize.width
      nodeHeight = settings.nodeSize.unselected.height || defaultERDSettings.nodeSize.height
    }
  }

  console.log('[ERDDiagram] 노드 크기 설정:', { nodeWidth, nodeHeight, tablesCount: tables.length })

  tables.forEach((table) => {
    if (!table || !table.name) {
      console.warn('[ERDDiagram] 잘못된 테이블 데이터:', table)
      return
    }

    const isSelected = selectedNode === table.name

    graph.setNode(table.name, {
      label: table.name,
      shape: 'rect',
      // 스타일은 CSS 클래스로 처리하므로 빈 문자열 또는 최소한의 스타일만
      style: '',
      labelStyle: '',
      width: nodeWidth,
      height: nodeHeight,
      class: isSelected ? 'node-selected' : '',
    })

    console.log('[ERDDiagram] 노드 추가:', { name: table.name, width: nodeWidth, height: nodeHeight, isSelected })
  })

  // 엣지 추가 (외래키 관계)
  relationships.forEach((rel) => {
    graph.setEdge(rel.fromTable, rel.toTable, {
      label: `${rel.fromColumn} → ${rel.toColumn}`,
      arrowhead: 'vee',
      // 스타일은 CSS로 처리
      style: '',
      labelStyle: '',
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

    // 노드에 data-node-id 속성 추가 및 선택 상태 클래스 추가
    svgGroup.selectAll('.node').each(function (d) {
      const node = d3.select(this)
      // graph에서 노드 정보 가져오기
      const graphNode = graph.node(d)
      // 노드 ID는 graphNode의 label 또는 d 자체
      let nodeId = graphNode?.label || d

      // nodeId 정규화
      if (nodeId) {
        nodeId = nodeId.toString().trim()
      }

      // data 속성에 노드 ID 저장 (클릭 이벤트에서 사용)
      node.attr('data-node-id', nodeId)

      // 선택 상태 확인 (대소문자 무시)
      const normalizedNodeId = nodeId?.toLowerCase()
      const normalizedSelectedNode = selectedNode?.toString().trim().toLowerCase()
      const isSelected = normalizedNodeId === normalizedSelectedNode

      if (isSelected) {
        node.classed('node-selected', true)
      }

      console.log('[ERDDiagram] 노드 속성 설정:', { nodeId, d, isSelected, selectedNode })
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
    // 첫 번째 tspan의 dy만 0으로 설정 (나머지는 줄 간격 유지)
    text.select('tspan').attr('dy', 0)

    // text 중앙 정렬
    text.attr('x', centerX).attr('y', centerY).attr('dy', 0).attr('text-anchor', 'middle')
  })

  // 엣지 라벨을 라인 위에 배치
  // .edgeLabels 내의 모든 .edgeLabel과 .edgePath를 인덱스로 매칭
  const edgePaths = svgGroup.selectAll('.edgePath').nodes()
  const edgeLabels = svgGroup.selectAll('.edgeLabel').nodes()

  edgePaths.forEach((edgePathNode, index) => {
    const edgePath = d3.select(edgePathNode)
    const path = edgePath.select('path')

    if (!path.node() || !edgeLabels[index]) return

    const pathLength = path.node().getTotalLength()
    const midPoint = path.node().getPointAtLength(pathLength / 2)

    // 경로의 방향(각도) 계산 (중간점 근처의 두 점 사용)
    const beforePoint = path.node().getPointAtLength(Math.max(0, pathLength / 2 - 5))
    const afterPoint = path.node().getPointAtLength(Math.min(pathLength, pathLength / 2 + 5))
    const angle = Math.atan2(afterPoint.y - beforePoint.y, afterPoint.x - beforePoint.x) * (180 / Math.PI)

    // 라벨을 라인 위로 올리기 위한 오프셋 계산 (경로에 수직인 방향)
    const offsetDistance = -10 // 라인 위로 15px 올림
    const perpendicularAngle = angle + 90 // 수직 방향
    const offsetX = offsetDistance * Math.cos((perpendicularAngle * Math.PI) / 180)
    const offsetY = offsetDistance * Math.sin((perpendicularAngle * Math.PI) / 180)

    // 해당 인덱스의 엣지 라벨 그룹
    const edgeLabelGroup = d3.select(edgeLabels[index])

    // 내부 .label 그룹 찾기
    const labelGroup = edgeLabelGroup.select('.label')
    const textElement = edgeLabelGroup.select('text')

    if (textElement.node()) {
      // .edgeLabel 그룹의 transform을 경로 중간점 위로 배치하고 회전
      edgeLabelGroup.attr('transform', `translate(${midPoint.x + offsetX}, ${midPoint.y + offsetY}) rotate(${angle})`)

      // 내부 .label 그룹의 transform 초기화 (이미 부모에서 이동했으므로)
      if (labelGroup.node()) {
        labelGroup.attr('transform', 'translate(0, 0)')
      }

      // 텍스트 중앙 정렬
      textElement.attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('x', 0).attr('y', 0)

      // tspan도 중앙 정렬
      textElement.selectAll('tspan').attr('x', 0).attr('text-anchor', 'middle').attr('dy', 0)
    }
  })

  // 노드 클릭 이벤트 추가
  if (onNodeClick) {
    svgGroup.selectAll('.node').on('click', function (event, d) {
      event.stopPropagation() // 이벤트 버블링 방지
      const nodeElement = d3.select(this)

      // data 속성에서 노드 ID 가져오기 (가장 안전)
      let nodeId = nodeElement.attr('data-node-id')

      // data 속성이 없으면 텍스트에서 가져오기
      if (!nodeId) {
        const textElement = nodeElement.select('text')
        nodeId = textElement.text()?.trim()
      }

      // 그래도 없으면 graph에서 가져오기
      if (!nodeId && graph) {
        const graphNode = graph.node(d)
        nodeId = graphNode?.label || d
      }

      // 최후의 수단으로 d 사용
      if (!nodeId) {
        nodeId = d
      }

      // 노드 ID 정규화 (공백 제거)
      const normalizedNodeId = nodeId?.toString().trim()

      // 테이블 목록에서 찾기 (정확한 매칭)
      const nodeData = tables.find((t) => {
        if (!t || !t.name) return false
        return t.name === normalizedNodeId || t.name.toLowerCase() === normalizedNodeId.toLowerCase()
      })

      console.log('[ERDDiagram] 노드 클릭:', {
        nodeId: normalizedNodeId,
        d,
        nodeData: nodeData?.name,
        allTables: tables.map((t) => t.name),
        graphNodes: graph.nodes(),
      })

      if (nodeData) {
        onNodeClick(normalizedNodeId, nodeData)
      } else {
        console.warn('[ERDDiagram] 노드 데이터를 찾을 수 없음:', normalizedNodeId)
      }
    })
  }

  // 노드 호버 이벤트 추가
  // 노드 그룹 전체에 이벤트를 바인딩하여 rect와 text 모두에서 호버 가능
  // CSS 클래스를 사용하여 스타일 적용
  if (onNodeHover) {
    svgGroup
      .selectAll('.node')
      .style('pointer-events', 'all')
      .on('mouseenter', function (event, d) {
        const nodeElement = d3.select(this)

        // data 속성에서 노드 ID 가져오기 (가장 안전)
        let nodeId = nodeElement.attr('data-node-id')

        // data 속성이 없으면 텍스트에서 가져오기
        if (!nodeId) {
          const textElement = nodeElement.select('text')
          nodeId = textElement.text()?.trim()
        }

        // 그래도 없으면 graph에서 가져오기
        if (!nodeId) {
          const graphNode = graph.node(d)
          nodeId = graphNode?.label || d
        }

        // 최후의 수단으로 d 사용
        if (!nodeId) {
          nodeId = d
        }

        const nodeData = tables.find((t) => t.name === nodeId)
        onNodeHover(nodeId, nodeData, true)

        // 호버 시 CSS 클래스 추가
        nodeElement.classed('node-hover', true)
      })
      .on('mouseleave', function (event, d) {
        const nodeElement = d3.select(this)

        // data 속성에서 노드 ID 가져오기 (가장 안전)
        let nodeId = nodeElement.attr('data-node-id')

        // data 속성이 없으면 텍스트에서 가져오기
        if (!nodeId) {
          const textElement = nodeElement.select('text')
          nodeId = textElement.text()?.trim()
        }

        // 그래도 없으면 graph에서 가져오기
        if (!nodeId) {
          const graphNode = graph.node(d)
          nodeId = graphNode?.label || d
        }

        // 최후의 수단으로 d 사용
        if (!nodeId) {
          nodeId = d
        }

        const nodeData = tables.find((t) => t.name === nodeId)
        onNodeHover(nodeId, nodeData, false)

        // 호버 해제 시 CSS 클래스 제거
        nodeElement.classed('node-hover', false)
      })

    // pointer-events는 CSS에서 처리
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
 * 레이아웃 재계산 없이 스타일만 업데이트하여 위치 유지
 * @param {Object} renderResult - renderERD의 반환값
 * @param {Object} data - 업데이트된 데이터
 * @param {Object} options - 업데이트 옵션
 */
export async function updateERD(renderResult, data, options = {}) {
  const { svgGroup, graph } = renderResult
  const { selectedNode = null } = options

  if (!svgGroup || !graph) {
    console.warn('[ERDDiagram] updateERD: svgGroup 또는 graph가 없습니다.')
    return
  }

  // 모든 노드의 선택 상태만 업데이트 (크기나 위치는 변경하지 않음)
  svgGroup.selectAll('.node').each(function (d) {
    const node = d3.select(this)

    // data 속성에서 노드 ID 가져오기 (가장 안전)
    let nodeId = node.attr('data-node-id')

    // data 속성이 없으면 텍스트에서 가져오기
    if (!nodeId) {
      const textElement = node.select('text')
      nodeId = textElement.text()?.trim()
    }

    // 그래도 없으면 graph에서 가져오기
    if (!nodeId && graph) {
      const graphNode = graph.node(d)
      nodeId = graphNode?.label || d
    }

    // 최후의 수단으로 d 사용
    if (!nodeId) {
      nodeId = d
    }

    // 노드 ID 정규화
    const normalizedNodeId = nodeId?.toString().trim().toLowerCase()
    const normalizedSelectedNode = selectedNode?.toString().trim().toLowerCase()
    const isSelected = normalizedNodeId === normalizedSelectedNode

    // 선택 상태 클래스만 업데이트 (위치나 크기는 절대 변경하지 않음)
    node.classed('node-selected', isSelected)

    // transform 속성이 변경되지 않았는지 확인 (디버깅용)
    const currentTransform = node.attr('transform')
    if (isSelected && currentTransform) {
      console.log('[ERDDiagram] 선택된 노드 transform:', { nodeId, transform: currentTransform })
    }
  })
}

/**
 * 노드 크기만 업데이트 (위치 유지, fitToScreen 스킵)
 *
 * 노드 크기 변경 시 전체 재렌더링을 하면 fitToScreen()이 호출되어
 * 다이어그램이 위로 올라갔다가 내려오는 "점프" 현상이 발생함.
 *
 * 이 함수는 노드의 중심점을 유지하며 크기만 변경하여
 * 사용자가 설정한 줌/팬 상태를 그대로 유지함.
 *
 * @param {Object} renderResult - renderERD의 반환값 (svgGroup, graph 포함)
 */
export async function updateNodeSizes(renderResult) {
  const { svgGroup, graph } = renderResult

  if (!svgGroup || !graph) {
    console.warn('[ERDDiagram] updateNodeSizes: svgGroup 또는 graph가 없습니다.')
    return
  }

  // 설정 로드
  const settings = getERDSettings()

  // 노드 크기 계산
  let nodeWidth = defaultERDSettings.nodeSize.width
  let nodeHeight = defaultERDSettings.nodeSize.height

  if (settings?.nodeSize) {
    if (settings.nodeSize.width && settings.nodeSize.height) {
      nodeWidth = settings.nodeSize.width
      nodeHeight = settings.nodeSize.height
    } else if (settings.nodeSize.unselected) {
      nodeWidth = settings.nodeSize.unselected.width || defaultERDSettings.nodeSize.width
      nodeHeight = settings.nodeSize.unselected.height || defaultERDSettings.nodeSize.height
    }
  }

  console.log('[ERDDiagram] 노드 크기 업데이트:', { nodeWidth, nodeHeight })

  // 모든 노드의 rect 크기만 업데이트 (위치는 변경하지 않음)
  svgGroup.selectAll('.node').each(function (d) {
    const node = d3.select(this)
    const rect = node.select('rect')

    if (rect.node()) {
      // 현재 rect의 중심점 계산 (getBBox는 transform을 포함하므로 주의)
      const currentBBox = rect.node().getBBox()
      const currentCenterX = currentBBox.x + currentBBox.width / 2
      const currentCenterY = currentBBox.y + currentBBox.height / 2

      // 새로운 크기의 중심점 계산 (중심점은 유지)
      // 중심점 기준으로 새로운 x, y 좌표 계산하여 위치 유지
      const newX = currentCenterX - nodeWidth / 2
      const newY = currentCenterY - nodeHeight / 2

      // 크기만 업데이트 (위치는 중심점 기준으로 유지)
      rect.attr('x', newX).attr('y', newY).attr('width', nodeWidth).attr('height', nodeHeight)

      // graph의 노드 크기도 업데이트 (다음 fitToScreen 호출 시 참조)
      if (graph.node(d)) {
        graph.node(d).width = nodeWidth
        graph.node(d).height = nodeHeight
      }

      // 텍스트 중앙 정렬 유지 (노드 크기 변경 후에도 중앙에 위치)
      const text = node.select('text')
      if (text.node()) {
        text.attr('x', currentCenterX).attr('y', currentCenterY).attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
      }
    }
  })

  console.log('[ERDDiagram] 노드 크기 업데이트 완료')
}
