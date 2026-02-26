<template>
  <div v-if="isOpen" class="nexa-setup-panel">
    <div class="background-text">NEXA BOARD</div>
    <div class="nexa-setup-title q-mb-sm">
      <q-icon name="dashboard" size="48px" class="q-mr-sm" color="primary" />
      <span class="board-name">{{ boardName }}</span>
    </div>
    <div class="welcome-message q-mb-md">
      보드 시작을 환영합니다.<br />
      지금부터 새로운 보드의 대시보드를 쉽고 빠르게 구성할 수 있습니다.<br />
      아래 단계에 따라 초기 설정을 진행해 주세요.
    </div>
    <!-- 디바이스 연결 확인 -->
    <div class="setup-section q-mb-lg step-bordered">
      <DeviceConnectionView :devices="devices" />
    </div>

    <!-- 프리셋 선택 -->
    <div class="setup-section q-mb-lg step-bordered">
      <WindowPresetSetupView @select="handlePresetSelect" />
    </div>

    <div class="text-center q-mt-lg">
      <q-btn label="선택한 레이아웃으로 시작하기" color="primary" icon-right="arrow_forward" size="lg" :disable="!tempSelectedPreset" @click="confirmAndStartLayout" unelevated />
    </div>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useDashboardLayoutStore } from '@system/store/dashboardLayoutStore'
import { useBoardPreset } from '@system/composables/useBoardPreset'
import { getPresetLabel } from '@system/utils/boardWindowPreset'
import WindowPresetSetupView from '@domains/board/components/window/WindowPresetSetupView.vue'
import DeviceConnectionView from '@domains/board/components/device/DeviceConnectionView.vue'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  boardName: {
    type: String,
    required: true,
  },
  devices: {
    type: Array,
    default: () => [],
  },
  width: {
    type: Number,
    default: 800,
  },
})

const $q = useQuasar()
const dashboardLayoutStore = useDashboardLayoutStore()
const { tempSelectedPreset, initializePreset } = useBoardPreset('setup')

function handlePresetSelect(preset) {
  tempSelectedPreset.value = preset
}

async function confirmAndStartLayout() {
  if (!tempSelectedPreset.value) {
    $q.notify({
      type: 'warning',
      message: '먼저 레이아웃 프리셋을 선택해주세요.',
      icon: 'warning',
    })
    return
  }

  const selectedNode = dashboardLayoutStore.selectedNodeForDashboard

  if (selectedNode && selectedNode.type === 'board') {
    try {
      const success = await initializePreset(tempSelectedPreset.value, selectedNode)

      if (success) {
        $q.notify({
          type: 'positive',
          message: `'${selectedNode.name}' 보드의 레이아웃이 '${getPresetLabel(tempSelectedPreset.value)}'(으)로 설정되었습니다.`,
          icon: 'check_circle',
          timeout: 2500,
        })
      } else {
        throw new Error('보드 레이아웃 업데이트에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error confirming layout:', error)
      $q.notify({
        type: 'negative',
        message: error.message || '레이아웃 설정 중 오류가 발생했습니다.',
        icon: 'error',
      })
    }
  }
}
</script>

<style scoped>
.nexa-setup-panel {
  width: 100%;
  max-width: 1200px;
  min-width: 320px;
  margin: auto;
  padding: 32px 24px;
  box-sizing: border-box;
  position: relative;
  overflow: visible;
}

@media (max-width: 1100px) {
  .nexa-setup-panel {
    max-width: 98vw;
    padding: 16px 4vw;
  }
  .background-text {
    font-size: 160px;
    padding-top: 120px;
    transform: translateY(-55%) scale(0.9);
  }
}

@media (max-width: 768px) {
  .background-text {
    font-size: 120px;
    padding-top: 100px;
    transform: translateY(-55%) scale(0.8);
  }
}

@media (max-width: 480px) {
  .background-text {
    font-size: 80px;
    padding-top: 80px;
    transform: translateY(-55%) scale(0.7);
  }
}

.background-text {
  position: absolute;
  left: 0;
  width: 100%;
  font-size: 220px;
  font-weight: 900;
  color: rgba(8, 8, 8, 0.214);
  text-align: left;
  user-select: none;
  pointer-events: none;
  z-index: 0;
  letter-spacing: 0px;
  font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  transform: translateY(-45%);
  white-space: nowrap;
  overflow: hidden;
}

.nexa-setup-title {
  position: relative;
  z-index: 1;
}

.welcome-message {
  position: relative;
  z-index: 1;
}

.setup-section {
  position: relative;
  z-index: 1;
  width: 100%;
  margin-bottom: 32px;
}

.step-bordered {
  border: 1.5px solid #222;
  border-radius: 6px;
  padding: 34px 40px;
  background: rgba(201, 201, 201, 0.05);
}

.nexa-setup-title {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 2.6rem;
  font-weight: bold;
  margin-bottom: 0px;
}
.board-name {
  color: #00fff2;
  font-size: 2.6rem;
  font-weight: bold;
}

.welcome-message {
  font-size: 1rem;
  color: #0ebbe2;
  line-height: 1.2;
  margin-bottom: 18px;
  font-weight: 400;
}
</style>
