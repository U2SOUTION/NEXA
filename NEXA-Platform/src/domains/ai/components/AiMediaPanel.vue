<template>
  <div class="ai-media-panel column">
    <!-- 하위 패널: 파일 타입별 이미지·음원·영상 분기 (Media) -->
    <q-tabs
      v-model="activeSubPanel"
      dense
      align="left"
      class="ai-media-sub-tabs"
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
    <q-tab-panels v-model="activeSubPanel" animated class="col ai-media-panels">
      <q-tab-panel name="image" class="q-pa-none">
        <AiImageEditorPanel />
      </q-tab-panel>
      <q-tab-panel name="audio" class="q-pa-none">
        <AiAudioEditorPanel />
      </q-tab-panel>
      <q-tab-panel name="video" class="q-pa-none">
        <AiVideoEditorPanel />
      </q-tab-panel>
      <q-tab-panel name="model3d" class="q-pa-none">
        <Ai3DEditorPanel />
      </q-tab-panel>
      <q-tab-panel name="vector" class="q-pa-none">
        <AiVectorEditorPanel />
      </q-tab-panel>
      <q-tab-panel name="animation" class="q-pa-none">
        <AiAnimationEditorPanel />
      </q-tab-panel>
      <q-tab-panel name="font" class="q-pa-none">
        <AiFontEditorPanel />
      </q-tab-panel>
      <q-tab-panel name="wide" class="q-pa-none">
        <AiWideEditorPanel />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AiImageEditorPanel from './AiImageEditorPanel.vue'
import AiAudioEditorPanel from './AiAudioEditorPanel.vue'
import AiVideoEditorPanel from './AiVideoEditorPanel.vue'
import Ai3DEditorPanel from './Ai3DEditorPanel.vue'
import AiVectorEditorPanel from './AiVectorEditorPanel.vue'
import AiAnimationEditorPanel from './AiAnimationEditorPanel.vue'
import AiFontEditorPanel from './AiFontEditorPanel.vue'
import AiWideEditorPanel from './AiWideEditorPanel.vue'

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
.ai-media-panel {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.ai-media-sub-tabs {
  flex-shrink: 0;
}

.ai-media-panels {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
