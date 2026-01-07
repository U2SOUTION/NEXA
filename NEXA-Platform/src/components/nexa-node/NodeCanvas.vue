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
      <div class="canvas-empty-title">NEW 클릭으로 다이어그램을 시작하세요</div>
      <p class="canvas-empty-text">기본 트리거 → 로직 → 액션 흐름이 자동 배치됩니다.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
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
  diagramGroup.selectAll('.link-layer').remove()
  diagramGroup.selectAll('.node-layer').remove()

  if (!hasDiagram.value) {
    return
  }

  const nodes = props.nodes || []
  const links = props.links || []
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))

  const linkLayer = diagramGroup.append('g').attr('class', 'link-layer')
  links.forEach((link) => {
    const source = nodeMap.get(link.source)
    const target = nodeMap.get(link.target)
    if (!source || !target) return
    linkLayer.append('line').attr('class', 'link').attr('x1', source.x).attr('y1', source.y).attr('x2', target.x).attr('y2', target.y).attr('marker-end', 'url(#diagram-arrow)')
  })

  const nodeLayer = diagramGroup.append('g').attr('class', 'node-layer')
  const nodeSelection = nodeLayer
    .selectAll('.node')
    .data(nodes, (d) => d.id)
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', (d) => `translate(${d.x}, ${d.y})`)

  const nodeWidth = 140
  const nodeHeight = 52
  const colorMap = {
    trigger: 'var(--nexa-success)',
    logic: 'var(--nexa-button-primary-bg)',
    action: 'var(--nexa-accent)',
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
}

function setupZoom() {
  if (!canvasRef.value) return
  const svg = d3.select(canvasRef.value)
  zoomGroup = svg.select('.zoom-group')
  const zoom = d3
    .zoom()
    .scaleExtent([0.4, 3])
    .on('zoom', (event) => {
      if (zoomGroup) {
        zoomGroup.attr('transform', event.transform)
      }
    })
  svg.call(zoom)
}

watch(
  [() => props.nodes, () => props.links],
  () => {
    renderDiagram()
  },
  { deep: true },
)

onMounted(() => {
  setupZoom()
  renderDiagram()
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
  cursor: grab;
}

.node-canvas:active {
  cursor: grabbing;
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

.node {
  cursor: pointer;
}

.node-label {
  font-size: 0.85rem;
  font-weight: 600;
  fill: #ffffff;
  pointer-events: none;
}
</style>
