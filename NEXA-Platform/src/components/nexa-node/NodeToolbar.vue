<template>
  <div class="node-toolbar-wrapper shadow-2">
    <q-toolbar class="bg-dark text-white rounded-borders">
      <div class="tool-group">
        <q-btn flat round dense icon="center_focus_strong" @click="$emit('reset-view')">
          <q-tooltip>뷰 초기화 (1:1)</q-tooltip>
        </q-btn>
        <q-btn flat round dense icon="grid_on" @click="$emit('toggle-grid')">
          <q-tooltip>그리드 토글</q-tooltip>
        </q-btn>
        <q-separator dark vertical inset class="q-mx-sm" />
        <q-btn flat round dense icon="auto_fix_high" :color="autoLayout ? 'primary' : 'white'" @click="toggleAutoLayout">
          <q-tooltip>자동 물리 레이아웃</q-tooltip>
        </q-btn>
      </div>

      <q-space />

      <q-btn-toggle
        v-model="simMode"
        toggle-color="orange-8"
        flat
        dense
        :options="[
          { label: 'MOCK', value: 'mock' },
          { label: 'LIVE', value: 'live' },
        ]"
      />

      <q-space />

      <div class="execution-group">
        <q-btn flat round dense icon="play_arrow" color="positive" @click="onStart">
          <q-tooltip>시뮬레이션 시작</q-tooltip>
        </q-btn>
        <q-btn flat round dense icon="pause" color="warning" @click="onPause">
          <q-tooltip>일시 정지</q-tooltip>
        </q-btn>
        <q-btn flat round dense icon="stop" color="negative" @click="onStop">
          <q-tooltip>중지 및 리셋</q-tooltip>
        </q-btn>
      </div>

      <q-separator dark vertical inset class="q-mx-sm" />

      <q-btn flat round dense icon="settings_input_component">
        <q-menu dark>
          <q-list style="min-width: 150px">
            <q-item clickable v-close-popup @click="setLinkStyle('bezier')">
              <q-item-section>곡선 (Bezier)</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="setLinkStyle('step')">
              <q-item-section>직각 (Step)</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
        <q-tooltip>연결선 스타일</q-tooltip>
      </q-btn>
    </q-toolbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const simMode = ref('mock')
const autoLayout = ref(true)

const toggleAutoLayout = () => {
  autoLayout.value = !autoLayout.value
}
const setLinkStyle = (style) => console.log(`Link style: ${style}`)
const onStart = () => console.log('Simulation Started')
const onPause = () => console.log('Simulation Paused')
const onStop = () => console.log('Simulation Stopped')
</script>

<style scoped>
.node-toolbar-wrapper {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: auto;
  min-width: 600px;
  opacity: 0.9;
  transition: opacity 0.3s;
}
.node-toolbar-wrapper:hover {
  opacity: 1;
}
.tool-group,
.execution-group {
  display: flex;
  align-items: center;
}
</style>
