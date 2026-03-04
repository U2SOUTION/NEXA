<template>
  <div class="ai-vision-panel column">
    <!-- 하위 패널: 파일 타입별 이미지·음원·영상 분기 (Vision 통합) -->
    <q-tabs
      v-model="activeSubPanel"
      dense
      align="left"
      class="ai-vision-sub-tabs"
      active-color="primary"
      indicator-color="primary"
    >
      <q-tab name="image" :label="subLabels.image" />
      <q-tab name="audio" :label="subLabels.audio" />
      <q-tab name="video" :label="subLabels.video" />
    </q-tabs>
    <q-separator />
    <q-tab-panels v-model="activeSubPanel" animated class="col ai-vision-panels">
      <q-tab-panel name="image" class="q-pa-none">
        <AiImageEditorPanel />
      </q-tab-panel>
      <q-tab-panel name="audio" class="q-pa-none">
        <AiAudioEditorPanel />
      </q-tab-panel>
      <q-tab-panel name="video" class="q-pa-none">
        <AiVideoEditorPanel />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AiImageEditorPanel from './AiImageEditorPanel.vue'
import AiAudioEditorPanel from './AiAudioEditorPanel.vue'
import AiVideoEditorPanel from './AiVideoEditorPanel.vue'

const activeSubPanel = ref('image')

const subLabels = {
  image: '이미지',
  audio: '음원',
  video: '영상',
}
</script>

<style lang="scss" scoped>
.ai-vision-panel {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.ai-vision-sub-tabs {
  flex-shrink: 0;
}

.ai-vision-panels {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
