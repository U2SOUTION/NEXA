<template>
  <div class="canvas-manager q-pa-md">
    <div class="text-subtitle2 q-mb-sm text-grey-5">PROJECT</div>

    <q-list dense padding class="menu-list text-grey-3">
      <q-item clickable v-ripple @click="onNewCanvas">
        <q-item-section avatar><q-icon name="add_photo_alternate" /></q-item-section>
        <q-item-section>새 캔버스</q-item-section>
      </q-item>

      <q-item clickable v-ripple @click="onOpenCanvas">
        <q-item-section avatar><q-icon name="folder_open" /></q-item-section>
        <q-item-section>캔버스 열기</q-item-section>
      </q-item>

      <q-separator dark spaced />

      <q-item clickable v-ripple @click="onSaveCanvas">
        <q-item-section avatar><q-icon name="save" /></q-item-section>
        <q-item-section>캔버스 저장</q-item-section>
      </q-item>

      <q-item clickable v-ripple @click="onExportCanvas">
        <q-item-section avatar><q-icon name="ios_share" /></q-item-section>
        <q-item-section>캔버스 내보내기</q-item-section>
      </q-item>

      <q-item clickable v-ripple @click="onPrintCanvas">
        <q-item-section avatar><q-icon name="print" /></q-item-section>
        <q-item-section>캔버스 프린트</q-item-section>
      </q-item>

      <q-separator dark spaced />

      <q-item clickable v-ripple @click="onCloseCanvas" class="text-negative">
        <q-item-section avatar><q-icon name="close" color="negative" /></q-item-section>
        <q-item-section>캔버스 닫기</q-item-section>
      </q-item>
    </q-list>

    <div class="text-subtitle2 q-mt-lg q-mb-sm text-grey-5">RECENT RELEASES</div>
    <q-list dense class="recent-list text-grey-4">
      <q-item v-for="item in recentCanvases" :key="item.id" clickable v-ripple @click="loadCanvas(item.id)">
        <q-item-section avatar><q-icon name="art_track" size="xs" /></q-item-section>
        <q-item-section>{{ item.name }}</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const recentCanvases = ref([
  { id: 1, name: '심해의 파동 시뮬레이션' },
  { id: 2, name: '도시 소음 시각화 프로토타입' },
])

const onNewCanvas = () => console.log('New Canvas')
const onOpenCanvas = () => console.log('Open Canvas')
const onSaveCanvas = () => console.log('Save Canvas')
const onExportCanvas = () => console.log('Exporting as JSON/Image')
const onPrintCanvas = () => window.print()
const onCloseCanvas = () => console.log('Close Canvas')
const loadCanvas = (id) => console.log(`Loading canvas: ${id}`)
</script>

<style scoped>
.menu-list .q-item {
  border-radius: 8px;
  margin-bottom: 4px;
}
.menu-list .q-item:hover {
  background: rgba(255, 255, 255, 0.1);
}
.recent-list .q-item {
  font-size: 0.85rem;
}
</style>
