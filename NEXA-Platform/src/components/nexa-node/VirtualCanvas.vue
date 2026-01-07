<script setup>
// 사용하지 않는 watch를 제거하여 ESLint 오류를 해결합니다.
import { ref, onMounted, onBeforeUnmount } from 'vue'
// 수정 코드 (상대 경로로 직접 지정)
import { renderForceDirected } from '../../services/diagram/ForceDirectedDiagram'
import { nodeAdapter } from 'src/services/device/VirtualNodeAdapter'

const dgContainer = ref(null)
const packages = ref([])
let dgInstance = null

/**
 * D3 렌더링 실행
 */
const runRender = async () => {
  if (!dgContainer.value || packages.value.length === 0) return

  // 기존 시뮬레이션 종료
  if (dgInstance && dgInstance.cleanup) {
    dgInstance.cleanup()
  }

  // 데이터 구조 형성
  const data = {
    packages: packages.value,
    dependencies: [],
  }

  // 범용 렌더러 호출
  dgInstance = await renderForceDirected(dgContainer.value, data, {
    diagramType: 'iot-network',
    onNodeClick: (id) => console.log(`✨ Device Selected: ${id}`),
  })
}

onMounted(() => {
  // 어댑터로부터 데이터 구독
  nodeAdapter.init()
  nodeAdapter.subscribeToUpdates((updatedData) => {
    packages.value = [...updatedData.packages]
    runRender()
  })
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
