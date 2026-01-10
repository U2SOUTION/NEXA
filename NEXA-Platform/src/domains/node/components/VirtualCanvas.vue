<script setup>
// 사용하지 않는 watch를 제거하여 ESLint 오류를 해결합니다.
import { ref, onMounted, onBeforeUnmount } from 'vue'
// 수정 코드 (상대 경로로 직접 지정)
import { renderForceDirected } from '@engines/diagram/dependency/ForceDirectedDiagram.js'
import { nodeAdapter } from '@system/services/device/VirtualNodeAdapter'
import { vdm } from '@system/services/device/VirtualDeviceManager'

const dgContainer = ref(null)
const packages = ref([])
let dgInstance = null

const runRender = async () => {
  if (!dgContainer.value || packages.value.length === 0) return

  if (dgInstance && dgInstance.cleanup) {
    dgInstance.cleanup()
  }

  const data = {
    packages: packages.value,
    dependencies: [],
  }

  dgInstance = await renderForceDirected(dgContainer.value, data, {
    diagramType: 'iot-network',
    onNodeClick: (id) => console.log(`✨ Device Selected: ${id}`),
  })
}

function handleVdmEvent(event, data) {
  switch (event) {
    case 'DEVICE_REGISTERED':
      nodeAdapter.syncWithDiagram(data.deviceId, data.ports)
      packages.value = [...nodeAdapter.currentDiagramData.packages]
      runRender()
      break
    case 'ID_ROTATED':
      nodeAdapter.handleSecurityUpdate(data.deviceId, data.rotationMap)
      packages.value = [...nodeAdapter.currentDiagramData.packages]
      runRender()
      break
    case 'PORT_UPDATED':
      // optional: re-render if needed
      runRender()
      break
  }
}

onMounted(() => {
  nodeAdapter.init()
  vdm.subscribe(handleVdmEvent)
})

onBeforeUnmount(() => {
  if (dgInstance && dgInstance.cleanup) {
    dgInstance.cleanup()
  }
})
</script>

<template>
  <div class="virtual-canvas-container">
    <div ref="dgContainer" class="diagram-viewport"></div>

    <div v-if="packages.length === 0" class="absolute-center text-grey-7 text-center">
      <q-icon name="sensors_off" size="48px" class="q-mb-sm" />
      <div>연결된 가상 장비가 없습니다.</div>
      <div class="text-caption">시뮬레이터에서 장비를 등록해주세요.</div>
    </div>
  </div>
</template>

<style scoped>
.virtual-canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: #0d0d0d;
}
.diagram-viewport {
  width: 100%;
  height: 100%;
}
</style>
