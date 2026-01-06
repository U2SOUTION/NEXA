<template>
  <div class="canvas-wrapper">
    <svg ref="canvasRef" class="node-canvas">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <g class="zoom-group"></g>
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as d3 from 'd3'

const canvasRef = ref(null)

onMounted(() => {
  const svg = d3.select(canvasRef.value)
  const g = svg.select('.zoom-group')

  // 줌 및 팬(Pan) 기능 설정
  const zoom = d3.zoom().on('zoom', (event) => {
    g.attr('transform', event.transform)
  })

  svg.call(zoom)
})
</script>

<style scoped>
.canvas-wrapper {
  width: 100%;
  height: 100%;
  background-color: #1e1e1e; /* 다크 모드 배경 */
  overflow: hidden;
}
.node-canvas {
  width: 100%;
  height: 100%;
  cursor: grab;
}
</style>
