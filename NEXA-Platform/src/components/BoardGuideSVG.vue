<template>
  <div class="board-structure-guide">
    <svg
      viewBox="0 0 135.94 232.76"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      class="structure-svg"
    >
      <g id="Base">
        <g>
          <g>
            <polygon class="cls-5" points="5.1 22.07 7.45 21.44 5.73 19.71 5.1 22.07" />
            <polyline class="cls-4" points="6.59 20.57 15.58 10.58 57.32 10.58" />
          </g>
          <text class="cls-2" transform="translate(16.31 7.74)">
            <tspan x="0" y="0">Directory</tspan>
          </text>
          <text class="cls-2" transform="translate(62.1 111.47)">
            <tspan x="0" y="0">SUB Group</tspan>
          </text>
          <text class="cls-2" transform="translate(61.34 59.98)">
            <tspan x="0" y="0">SUB Board</tspan>
          </text>
          <text class="cls-2" transform="translate(82.66 132.9)">
            <tspan x="0" y="0">SUB Board</tspan>
          </text>
          <text class="cls-2" transform="translate(42.17 35.8)">
            <tspan class="cls-1" x="0" y="0">T</tspan>
            <tspan x="5.3" y="0">OP Group</tspan>
          </text>
          <text class="cls-2" transform="translate(40.93 189)">
            <tspan class="cls-1" x="0" y="0">T</tspan>
            <tspan x="5.3" y="0">OP Board</tspan>
          </text>
        </g>
      </g>
      <g id="Board" :class="{ highlighted: isBoardHighlighted }">
        <g>
          <g>
            <rect class="cls-6" x="33.26" y="47.89" width="10.91" height="12.11" />
            <rect class="cls-6" x="45.7" y="56.95" width="10.91" height="12.11" />
            <rect class="cls-6" x="33.26" y="61.55" width="10.91" height="7.51" />
            <rect class="cls-6" x="45.83" y="47.89" width="10.91" height="7.51" />
          </g>
          <g>
            <rect class="cls-6" x="33.26" y="73.48" width="10.91" height="12.11" />
            <rect class="cls-6" x="45.7" y="82.54" width="10.91" height="12.11" />
            <rect class="cls-6" x="33.26" y="87.14" width="10.91" height="7.51" />
            <rect class="cls-6" x="45.83" y="73.48" width="10.91" height="7.51" />
          </g>
          <g>
            <rect class="cls-6" x="55.79" y="122.69" width="10.91" height="12.11" />
            <rect class="cls-6" x="68.23" y="131.76" width="10.91" height="12.11" />
            <rect class="cls-6" x="55.79" y="136.35" width="10.91" height="7.51" />
            <rect class="cls-6" x="68.36" y="122.69" width="10.91" height="7.51" />
          </g>
          <g>
            <rect class="cls-6" x="55.79" y="148.73" width="10.91" height="12.11" />
            <rect class="cls-6" x="68.23" y="157.8" width="10.91" height="12.11" />
            <rect class="cls-6" x="55.79" y="162.4" width="10.91" height="7.51" />
            <rect class="cls-6" x="68.36" y="148.73" width="10.91" height="7.51" />
          </g>
          <g>
            <rect class="cls-6" x="10.41" y="176.56" width="10.91" height="12.11" />
            <rect class="cls-6" x="22.85" y="185.63" width="10.91" height="12.11" />
            <rect class="cls-6" x="10.41" y="190.23" width="10.91" height="7.51" />
            <rect class="cls-6" x="22.97" y="176.56" width="10.91" height="7.51" />
          </g>
          <g>
            <rect class="cls-6" x="10.41" y="202.7" width="10.91" height="12.11" />
            <rect class="cls-6" x="22.85" y="211.76" width="10.91" height="12.11" />
            <rect class="cls-6" x="10.41" y="216.36" width="10.91" height="7.51" />
            <rect class="cls-6" x="22.97" y="202.7" width="10.91" height="7.51" />
          </g>
        </g>
      </g>
      <g id="Group" :class="{ highlighted: isGroupHighlighted }">
        <g>
          <path
            class="cls-6"
            d="M55.5,119.23h-20.49c-1.17,0-2.12-.95-2.12-2.12v-15.2c0-1.17.95-2.12,2.12-2.12h7.6l2.64,2.99h10.25c1.17,0,2.12.95,2.12,2.12v12.22c0,1.17-.95,2.12-2.12,2.12Z"
          />
          <path
            class="cls-6"
            d="M32.57,42.45H12.08c-1.17,0-2.12-.95-2.12-2.12v-15.2c0-1.17.95-2.12,2.12-2.12h7.6l2.64,2.99h10.25c1.17,0,2.12.95,2.12,2.12v12.22c0,1.17-.95,2.12-2.12,2.12Z"
          />
        </g>
      </g>
      <g id="Sub_Directory" :class="{ highlighted: isSubDirectoryHighlighted }">
        <g>
          <polyline class="cls-3" points="22.64 43.69 22.64 109.47 31.58 109.47" />
          <line class="cls-3" x1="31.58" y1="56.14" x2="22.62" y2="56.14" />
          <line class="cls-3" x1="31.58" y1="80.38" x2="22.62" y2="80.38" />
          <polyline class="cls-3" points="45.17 120.49 45.17 157.89 54.11 157.79" />
          <line class="cls-3" x1="54.11" y1="130.95" x2="45.15" y2="130.95" />
        </g>
      </g>
      <g id="Top_Directory" :class="{ highlighted: isTopDirectoryHighlighted }">
        <g>
          <line class="cls-3" x1=".5" y1="2.85" x2=".5" y2="232.76" />
          <line class="cls-3" x1="9.38" y1="32.44" x2=".5" y2="32.44" />
          <line class="cls-3" x1="9.38" y1="185.2" x2=".5" y2="185.2" />
          <line class="cls-3" x1="9.38" y1="211.34" x2=".5" y2="211.34" />
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isTopDirectoryHighlighted = ref(false)
const isSubDirectoryHighlighted = ref(false)
const isGroupHighlighted = ref(false)
const isBoardHighlighted = ref(false)

// 하이라이트 제어 메서드
const highlightTopDirectory = () => {
  isTopDirectoryHighlighted.value = true
  isSubDirectoryHighlighted.value = false
  isGroupHighlighted.value = false
  isBoardHighlighted.value = false
}
const highlightSubDirectory = () => {
  isTopDirectoryHighlighted.value = false
  isSubDirectoryHighlighted.value = true
  isGroupHighlighted.value = false
  isBoardHighlighted.value = false
}
const highlightGroup = () => {
  isTopDirectoryHighlighted.value = false
  isSubDirectoryHighlighted.value = false
  isGroupHighlighted.value = true
  isBoardHighlighted.value = false
}
const highlightBoard = () => {
  isTopDirectoryHighlighted.value = false
  isSubDirectoryHighlighted.value = false
  isGroupHighlighted.value = false
  isBoardHighlighted.value = true
}
const resetHighlight = () => {
  isTopDirectoryHighlighted.value = false
  isSubDirectoryHighlighted.value = false
  isGroupHighlighted.value = false
  isBoardHighlighted.value = false
}

defineExpose({
  highlightTopDirectory,
  highlightSubDirectory,
  highlightGroup,
  highlightBoard,
  resetHighlight,
})
</script>

<style scoped>
.board-structure-guide {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.structure-svg {
  max-width: 260px;
  max-height: 380px;
  width: 100%;
  height: 100%;
  display: block;
}

.cls-1 {
  letter-spacing: -0.02em;
}
.cls-2 {
  fill: #c9caca;
  font-family: MSReferenceSansSerif, 'MS Reference Sans Serif';
  font-size: 8.96px;
}
.cls-3 {
  stroke: #767676;
  fill: none;
  stroke-miterlimit: 10;
}
.cls-4 {
  stroke: #727171;
  stroke-width: 0.5px;
  fill: none;
  stroke-miterlimit: 10;
}
.cls-5 {
  fill: #727171;
}
.cls-6 {
  fill: #898989;
}

/* 하이라이트 효과 */
.highlighted .cls-3,
.highlighted .cls-4 {
  stroke: var(--nexa-primary) !important;
  stroke-width: 2px !important;
  filter: drop-shadow(0 0 4px var(--nexa-primary));
  transition: all 0.3s;
}
.highlighted .cls-5,
.highlighted .cls-6 {
  stroke: var(--nexa-primary) !important;
  fill: var(--nexa-primary) !important;
  filter: drop-shadow(0 0 4px var(--nexa-primary));
  transition: all 0.3s;
}
</style>
