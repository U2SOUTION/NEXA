<template>
  <div class="virtual-iot-device q-pa-md shadow-2">
    <div class="row items-center justify-between q-mb-lg">
      <div class="row items-center">
        <q-icon name="memory" color="orange-8" size="36px" class="q-mr-sm" />
        <div>
          <div class="text-h6 text-bold text-orange-8">NEXA V-EDGE 01</div>
          <div class="text-caption text-grey-6">Virtual Hardware Emulator</div>
        </div>
      </div>
      <q-btn color="orange-9" flat icon="cached" label="보안 ID 갱신" @click="refreshDynamicIds" />
    </div>

    <div class="q-gutter-y-sm">
      <div v-for="port in virtualPorts" :key="port.staticKey" class="port-item q-pa-sm rounded-borders">
        <div class="row items-center justify-between">
          <div class="col">
            <div class="row items-center q-gutter-x-sm">
              <span class="text-weight-bolder text-white">{{ port.staticKey }}</span>
              <q-badge outline color="green-13" size="sm">
                {{ port.dynamicId }}
              </q-badge>
            </div>
            <div class="text-caption text-grey-5">Type: {{ port.type }}</div>
          </div>

          <div class="col-auto">
            <q-toggle v-if="port.type === 'DIGITAL'" v-model="port.value" color="orange" @update:model-value="onPortChange(port)" />
            <q-slider v-else-if="port.type === 'ANALOG'" v-model="port.value" :min="0" :max="1" :step="0.01" label color="orange" style="min-width: 100px" @change="onPortChange(port)" />
          </div>
        </div>
      </div>
    </div>

    <div class="security-console q-mt-md">
      <div class="row items-center q-mb-xs">
        <q-icon name="security" color="green-13" size="xs" class="q-mr-xs" />
        <span class="text-caption text-green-13 text-bold">NEXA SECURITY LOG</span>
      </div>
      <div class="console-box q-pa-xs">
        <div v-for="(log, i) in securityLogs" :key="i" class="log-line">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { vdm } from '@system/services/device/VirtualDeviceManager' // VDM 임포트

// 1. 보안용 랜덤 ID 생성 함수
const generateRandomId = () => `rnd_${Math.random().toString(36).substring(2, 8)}`

// 2. 가상 장비 하드웨어 명세
const virtualPorts = ref([
  { staticKey: 'MAIN_LED', dynamicId: '', type: 'DIGITAL', value: false },
  { staticKey: 'COOLING_FAN', dynamicId: '', type: 'DIGITAL', value: false },
  { staticKey: 'TEMP_SENSOR', dynamicId: '', type: 'ANALOG', value: 0.25 },
  { staticKey: 'PUMP_SPEED', dynamicId: '', type: 'ANALOG', value: 0.0 },
])

const securityLogs = ref([])
const DEVICE_ID = 'NEXA-V-EDGE-01'

// 3. 보안 로직: 동적 ID 순환 (Rotation)
const refreshDynamicIds = () => {
  const rotationMap = {}
  virtualPorts.value.forEach((port) => {
    const oldId = port.dynamicId
    port.dynamicId = generateRandomId()
    rotationMap[port.staticKey] = port.dynamicId

    if (oldId) pushLog(`${port.staticKey}: ID Rotate [${oldId}] -> [${port.dynamicId}]`)
  })

  // VDM에 ID 교체 사실 알림
  vdm.reportIdRotation(DEVICE_ID, rotationMap)
  // 초기 등록 및 갱신 시점에 전체 Spec 등록
  vdm.registerDevice(DEVICE_ID, virtualPorts.value)

  pushLog('SYSTEM: All security tokens rotated.')
}

/**
 * 4. 포트 변경 핸들러 (중복 제거됨)
 * UI 조작 시 VDM을 통해 캔버스 엔진으로 데이터 전달
 */
const onPortChange = (port) => {
  pushLog(`Action: ${port.staticKey} (${port.dynamicId}) set to ${port.value}`)

  // VDM 호출: 캔버스 노드들이 이 정보를 수신하게 됨
  vdm.updatePortValue(DEVICE_ID, port.staticKey, port.dynamicId, port.value)
}

const pushLog = (msg) => {
  const now = new Date().toLocaleTimeString()
  securityLogs.value.unshift(`[${now}] ${msg}`)
  if (securityLogs.value.length > 6) securityLogs.value.pop()
}

onMounted(() => {
  refreshDynamicIds()
})
</script>

<style lang="scss" scoped>
/* 이전 스타일 유지 */
.virtual-iot-device {
  background: #121212;
  border: 1px solid #333;
  border-radius: 12px;
  color: white;
  .port-item {
    background: #1e1e1e;
    border-left: 4px solid #f57c00;
    margin-bottom: 8px;
    &:hover {
      background: #262626;
    }
  }
  .console-box {
    background: #000;
    height: 120px;
    font-family: 'Consolas', monospace;
    font-size: 11px;
    overflow: hidden;
    .log-line {
      color: #00e676;
      padding: 1px 4px;
    }
  }
}
</style>
