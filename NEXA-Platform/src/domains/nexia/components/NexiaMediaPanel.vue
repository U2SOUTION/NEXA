<template>
  <div class="nexia-media-panel column">
    <!-- 하위 패널: 파일 타입별 이미지·음원·영상 분기 (Media) -->
    <q-tabs
      v-model="activeSubPanel"
      dense
      align="left"
      class="nexia-media-sub-tabs"
      active-color="primary"
      indicator-color="primary"
    >
      <q-tab name="image" :label="subLabels.image" />
      <q-tab name="audio" :label="subLabels.audio" />
      <q-tab name="video" :label="subLabels.video" />
      <q-tab name="model3d" :label="subLabels.model3d" />
      <q-tab name="vector" :label="subLabels.vector" />
      <q-tab name="animation" :label="subLabels.animation" />
      <q-tab name="font" :label="subLabels.font" />
      <q-tab name="wide" :label="subLabels.wide" />
    </q-tabs>
    <q-separator />
    <q-tab-panels v-model="activeSubPanel" animated class="col nexia-media-panels">
      <q-tab-panel name="image" class="q-pa-none">
        <NexiaImageEditorPanel />
      </q-tab-panel>
      <q-tab-panel name="audio" class="q-pa-none">
        <NexiaAudioEditorPanel />
      </q-tab-panel>
      <q-tab-panel name="video" class="q-pa-none">
        <NexiaVideoEditorPanel />
      </q-tab-panel>
      <q-tab-panel name="model3d" class="q-pa-none">
        <Nexia3DEditorPanel />
      </q-tab-panel>
      <q-tab-panel name="vector" class="q-pa-none">
        <NexiaVectorEditorPanel />
      </q-tab-panel>
      <q-tab-panel name="animation" class="q-pa-none">
        <NexiaAnimationEditorPanel />
      </q-tab-panel>
      <q-tab-panel name="font" class="q-pa-none">
        <NexiaFontEditorPanel />
      </q-tab-panel>
      <q-tab-panel name="wide" class="q-pa-none">
        <NexiaWideEditorPanel />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NexiaImageEditorPanel from './NexiaImageEditorPanel.vue'
import NexiaAudioEditorPanel from './NexiaAudioEditorPanel.vue'
import NexiaVideoEditorPanel from './NexiaVideoEditorPanel.vue'
import Nexia3DEditorPanel from './Nexia3DEditorPanel.vue'
import NexiaVectorEditorPanel from './NexiaVectorEditorPanel.vue'
import NexiaAnimationEditorPanel from './NexiaAnimationEditorPanel.vue'
import NexiaFontEditorPanel from './NexiaFontEditorPanel.vue'
import NexiaWideEditorPanel from './NexiaWideEditorPanel.vue'

const activeSubPanel = ref('image')

const subLabels = {
  image: 'Image',
  audio: 'Audio',
  video: 'Video',
  model3d: '3D',
  vector: 'Vector',
  animation: 'Animation',
  font: 'Font',
  wide: 'Wide',
}
</script>

<style lang="scss" scoped>
.nexia-media-panel {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.nexia-media-sub-tabs {
  flex-shrink: 0;
}

.nexia-media-panels {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
