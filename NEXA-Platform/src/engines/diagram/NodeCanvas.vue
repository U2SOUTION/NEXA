<template>
  <div class="canvas-wrapper" :class="{ 'canvas-empty': !hasDiagram }">
    <svg ref="canvasRef" class="node-canvas">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
        </pattern>
        <marker id="diagram-arrow" viewBox="0 -5 10 10" refX="10" refY="0" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,-5L10,0L0,5" fill="var(--nexa-primary)" />
        </marker>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <g class="zoom-group">
        <g class="diagram-group"></g>
      </g>
    </svg>
    <div v-if="!hasDiagram" class="canvas-empty-state">
      <slot name="canvas-template">
        <div class="canvas-empty-title">NEXA NODE를 드래그하여 제어 로직을 구성하세요</div>
        <div class="canvas-empty-process">장비선택 - 노드선택 - 넥셋선택 - 연결 - 뷰포트 - 런타임 정책</div>
        <div class="canvas-empty-template">템플릿 선택하면 빠르게 시작 할 수 있습니다.</div>
        <p class="canvas-empty-text">기본 트리거 → 로직 → 액션 흐름이 자동 배치됩니다.</p>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  nodes: {
    type: Array,
    default: () => [],
  },
  links: {
    type: Array,
    default: () => [],
  },
})

const canvasRef = ref(null)
let zoomGroup = null
const showHelper = ref(true)
let simulation = null
const activePort = ref(null)
let tempLayer = null
let tempLineElement = null
let pointerMoveHandler = null
let currentTransform = d3.zoomIdentity
const pointerTarget = { x: 0, y: 0 }
const NODE_WIDTH = 140
const NODE_HEIGHT = 52
const isolatedNodeId = ref(null)

function getDiagramSize() {
  if (!canvasRef.value) return { width: 0, height: 0 }
  return {
    width: canvasRef.value.clientWidth || 0,
    height: canvasRef.value.clientHeight || 0,
  }
}

function hideHelper() {
  showHelper.value = false
}

function showHelperHint() {
  showHelper.value = true
}

const hasDiagram = computed(() => Array.isArray(props.nodes) && props.nodes.length > 0)

function ensureDiagramGroup() {
  if (!zoomGroup) return null
  const existing = zoomGroup.select('.diagram-group')
  if (!existing.empty()) {
    return existing
  }
  return zoomGroup.append('g').attr('class', 'diagram-group')
}

function renderDiagram() {
  if (!zoomGroup) return
  const diagramGroup = ensureDiagramGroup()
  if (!diagramGroup) return

  // 기존 요소 제거
  diagramGroup.selectAll('.temp-layer').remove()
  diagramGroup.selectAll('.link-layer').remove()
  diagramGroup.selectAll('.node-layer').remove()
  tempLayer = diagramGroup.append('g').attr('class', 'temp-layer')
  tempLineElement = null

  if (!hasDiagram.value) {
    return
  }

  const nodes = props.nodes || []
  const links = props.links || []

  const linkLayer = diagramGroup.append('g').attr('class', 'link-layer')
  const linkSelection = linkLayer.selectAll('.link').data(links).enter().append('line').attr('class', 'link').attr('marker-end', 'url(#diagram-arrow)')

  const nodeLayer = diagramGroup.append('g').attr('class', 'node-layer')
  const nodeSelection = nodeLayer
    .selectAll('.node')
    .data(nodes, (d) => d.id)
    .join((enter) => {
      return enter.append('g').attr('class', 'node').call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended))
    })

  nodeSelection.attr('class', 'node') // keep classes
  nodeSelection.on('click', (event, node) => {
    event.stopPropagation()
    isolateNode(node)
  })

  //노드 색상
  // TODO: 노드 색상 변경 필요
  const nodeWidth = 140
  const nodeHeight = 52
  const colorMap = {
    trigger: 'var(--nexa-background-lower)',
    logic: 'var(--nexa-surface)',
    action: 'var(--nexa-border-hover)',
  }

  nodeSelection
    .append('rect')
    .attr('x', -(nodeWidth / 2))
    .attr('y', -(nodeHeight / 2))
    .attr('width', nodeWidth)
    .attr('height', nodeHeight)
    .attr('rx', 10)
    .attr('ry', 10)
    .attr('fill', (d) => colorMap[d.type] || 'var(--nexa-surface-hover)')
    .attr('stroke', 'var(--nexa-border-color)')
    .attr('stroke-width', 2)

  nodeSelection
    .append('text')
    .attr('dy', '0.35em')
    .attr('x', 0)
    .attr('y', 0)
    .attr('text-anchor', 'middle')
    .attr('class', 'node-label')
    .text((d) => d.label || d.id)

  const portColorMap = {
    input: 'var(--nexa-primary)',
    output: 'var(--nexa-secondary)',
    control: 'var(--nexa-accent)',
  }

  nodeSelection.each(function (nodeData) {
    const ports = nodeData.ports || []
    const portGroup = d3
      .select(this)
      .selectAll('.node-port')
      .data(ports, (p) => p.id)

    const portEnter = portGroup
      .enter()
      .append('circle')
      .attr('class', 'node-port')
      .attr('r', 4)
      .attr('cy', nodeHeight / 2 + 10)

    const portSelection = portEnter.merge(portGroup)

    portSelection
      .attr('cx', (p) => -nodeWidth / 2 + 12 + (p.index ?? 0) * 18)
      .attr('fill', (p) => portColorMap[p.type] || 'var(--nexa-primary)')
      .on('pointerdown', (event) => {
        event.stopPropagation()
        event.preventDefault()
      })
      .on('click', function (event, port) {
        event.stopPropagation()
        handlePortClick(nodeData, port)
      })

    portGroup.exit().remove()
  })

  updateSimulation(nodes, links, nodeSelection, linkSelection)

  diagramGroup.selectAll('.helper-node').remove()
}

const dragstarted = (event) => {
  if (!event.active && simulation) simulation.alphaTarget(0.3).restart()
  event.subject.fx = event.subject.x
  event.subject.fy = event.subject.y
}

const dragged = (event) => {
  event.subject.fx = event.x
  event.subject.fy = event.y
}

const dragended = (event) => {
  if (!event.active && simulation) simulation.alphaTarget(0)
  event.subject.fx = null
  event.subject.fy = null
}

function updateSimulation(nodes, links, nodeSelection, linkSelection) {
  if (simulation) {
    simulation.stop()
  }

  const { width, height } = getDiagramSize()
  simulation = d3
    .forceSimulation(nodes)
    .alphaDecay(0.03)
    .velocityDecay(0.4)
    .force(
      'link',
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(links.length ? 120 : 0)
        .strength(0.1),
    )
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force(
      'collision',
      d3.forceCollide().radius(() => 80),
    )
    .on('tick', () => {
      nodeSelection.attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      linkSelection
        .attr('x1', (d) => (d.source ? d.source.x : 0))
        .attr('y1', (d) => (d.source ? d.source.y : 0))
        .attr('x2', (d) => (d.target ? d.target.x : 0))
        .attr('y2', (d) => (d.target ? d.target.y : 0))
      updateTempLine()
      maintainIsolation()
    })
}

function maintainIsolation() {
  if (!simulation) return
  const nodes = simulation.nodes()
  nodes.forEach((node) => {
    if (isolatedNodeId.value === node.id) {
      node.fx = node.x
      node.fy = node.y
    } else if (node.fx !== null || node.fy !== null) {
      node.fx = null
      node.fy = null
    }
  })
}

function isolateNode(node) {
  if (!simulation) return
  if (isolatedNodeId.value === node.id) {
    isolatedNodeId.value = null
    node.fx = null
    node.fy = null
    return
  }
  isolatedNodeId.value = node.id
  node.fx = node.x
  node.fy = node.y
}

function getPortPosition(node, port) {
  if (!node || !port) return { x: 0, y: 0 }
  const offsetX = -NODE_WIDTH / 2 + 12 + (port.index ?? 0) * 18
  return {
    x: node.x + offsetX,
    y: node.y + NODE_HEIGHT / 2 + 10,
  }
}

function ensureTempLine() {
  if (!tempLayer) return
  if (!tempLineElement) {
    tempLineElement = tempLayer.append('line').attr('class', 'temp-link').attr('stroke', 'var(--nexa-error)').attr('stroke-width', 3).attr('stroke-linecap', 'round')
  }
}

function updateTempLine() {
  if (!activePort.value || !tempLineElement) return
  const start = getPortPosition(activePort.value.node, activePort.value.port)
  tempLineElement.attr('x1', start.x).attr('y1', start.y)
  tempLineElement.attr('x2', pointerTarget.x).attr('y2', pointerTarget.y)
}

function attachPointerTracker() {
  if (!canvasRef.value) return
  detachPointerTracker()
  pointerMoveHandler = (event) => {
    const [x, y] = d3.pointer(event, canvasRef.value)
    const inverted = currentTransform.invert([x, y])
    pointerTarget.x = inverted[0]
    pointerTarget.y = inverted[1]
    updateTempLine()
  }
  canvasRef.value.addEventListener('pointermove', pointerMoveHandler)
}

function detachPointerTracker() {
  if (!canvasRef.value || !pointerMoveHandler) return
  canvasRef.value.removeEventListener('pointermove', pointerMoveHandler)
  pointerMoveHandler = null
}

function cancelTempLine() {
  activePort.value = null
  if (tempLineElement) {
    tempLineElement.remove()
    tempLineElement = null
  }
  detachPointerTracker()
}

function setActivePort(nodeData, port) {
  if (!tempLayer || !port) return
  activePort.value = { node: nodeData, port }
  ensureTempLine()
  const start = getPortPosition(nodeData, port)
  pointerTarget.x = start.x
  pointerTarget.y = start.y
  updateTempLine()
  attachPointerTracker()
}

function handlePortClick(nodeData, port) {
  if (!tempLayer || !port) return
  if (activePort.value && activePort.value.node.id === nodeData.id && activePort.value.port.id === port.id) {
    cancelTempLine()
    return
  }
  setActivePort(nodeData, port)
}

function setupZoom() {
  if (!canvasRef.value) return
  const svg = d3.select(canvasRef.value)
  zoomGroup = svg.select('.zoom-group')
  const zoom = d3
    .zoom()
    .scaleExtent([0.4, 3])
    .on('zoom', (event) => {
      currentTransform = event.transform
      if (zoomGroup) {
        zoomGroup.attr('transform', event.transform)
      }
      updateTempLine()
    })
  svg.call(zoom)
  svg.on('click.temp-line', (event) => {
    if (event.target === svg.node()) {
      cancelTempLine()
    }
  })
}

function handleGlobalKeydown(event) {
  if (event.key === 'Escape') {
    cancelTempLine()
  }
}

watch(
  [() => props.nodes, () => props.links],
  () => {
    renderDiagram()
  },
  { deep: true },
)

watch(showHelper, () => {
  renderDiagram()
})

onMounted(() => {
  setupZoom()
  renderDiagram()
  window.addEventListener('nexa-node-helper-hide', hideHelper)
  window.addEventListener('nexa-node-new-canvas', showHelperHint)
  window.addEventListener('keydown', handleGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('nexa-node-helper-hide', hideHelper)
  window.removeEventListener('nexa-node-new-canvas', showHelperHint)
  window.removeEventListener('keydown', handleGlobalKeydown)
  cancelTempLine()
})
</script>

<style scoped>
.canvas-wrapper {
  width: 100%;
  min-height: 360px;
  border: 1px solid var(--nexa-border-color);
  border-radius: 8px;
  background-color: var(--nexa-background);
  position: relative;
  overflow: hidden;
}

.canvas-wrapper.canvas-full {
  min-height: 0;
  height: 100%;
}

.canvas-wrapper.canvas-empty {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.25));
}

.node-canvas {
  width: 100%;
  height: 100%;
  cursor: default;
}

.node-canvas:active {
  cursor: default;
}

.canvas-empty-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--nexa-text-secondary);
  text-align: center;
  pointer-events: none;
}

.canvas-empty-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--nexa-text-primary);
  margin-bottom: 0.25rem;
}

.canvas-empty-text {
  font-size: 0.85rem;
  margin: 0;
}

.link {
  stroke: var(--nexa-text-secondary);
  stroke-width: 2px;
  stroke-linecap: round;
}

.temp-link {
  stroke: var(--nexa-error);
  stroke-width: 3px;
  stroke-dasharray: 4 4;
  stroke-linecap: round;
  pointer-events: none;
}

:deep(.node:hover) {
  fill: var(--nexa-primary);
}

:deep(.node-label) {
  font-size: 0.95rem;
  font-weight: 500;
}

:deep(.node-port) {
  pointer-events: auto;
  transition: transform 0.15s ease;
  transform-origin: center;
  transform-box: fill-box;
}

:deep(.node-port:hover) {
  transform: scale(1.8);
}
</style>
