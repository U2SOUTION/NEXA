<template>
  <div class="device-connection-view">
    <div class="text-subtitle1 q-mb-sm">
      <q-icon name="devices" size="22px" class="q-mr-xs" color="primary" />
      연결된 디바이스 확인 (선택 사항)
    </div>
    <div v-if="devices && devices.length > 0">
      <q-list bordered>
        <q-item v-for="device in devices" :key="device.id || device">
          <q-item-section avatar>
            <q-icon name="developer_board" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ getDeviceDisplayName(device.id || device) }}</q-item-label>
            <q-item-label caption>{{ device.type || '-' }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <div v-else class="text-grey-7">이 보드에 아직 연결된 디바이스가 없습니다. '보드 관리'에서 추가할 수 있습니다.</div>
  </div>
</template>

<script setup>
defineProps({
  devices: {
    type: Array,
    default: () => [],
  },
})

function getDeviceDisplayName(deviceId) {
  const tempDevices = {
    living_temp_sensor_01: '거실 온도 센서',
    front_door_cam_alpha: '현관문 카메라',
    master_room_light_switch: '안방 조명 스위치',
    kitchen_gas_detector_v2: '주방 가스 감지기',
    garden_sprinkler_main: '정원 스프링클러',
  }
  return tempDevices[deviceId] || deviceId
}
</script>

<style lang="scss" scoped>
.device-connection-view {
  width: 100%;
}
</style>

