<template>
  <div class="nexia-universal-viewer-panel column">
    <UniversalViewer :file="selectedFile" />
  </div>
</template>

<script setup>
import UniversalViewer from '@system/components/ui/viewer/UniversalViewer.vue'
import { useFileSelection } from '@system/composables/useFileSelection'

const { selectedFile } = useFileSelection()
</script>

<style lang="scss" scoped>
.nexia-universal-viewer-panel {
  min-height: 0;
  min-width: 0;
  height: 100%;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}
</style>
