<template>
  <div class="iot-settings">
    <div class="settings-section">
      <div class="text-h6 q-mb-md">장치 관리</div>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>자동 검색</q-item-label>
            <q-item-label caption>새로운 장치를 자동으로 검색합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="autoDiscovery" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>새로고침 간격</q-item-label>
            <q-item-label caption>장치 목록 새로고침 간격을 설정합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input v-model.number="refreshInterval" type="number" dense outlined class="input-field" suffix="ms" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <div class="settings-section">
      <div class="text-h6 q-mb-md">프로토콜 설정</div>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>MQTT 활성화</q-item-label>
            <q-item-label caption>MQTT 프로토콜을 사용합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="mqttEnabled" />
          </q-item-section>
        </q-item>
        <q-item v-if="mqttEnabled">
          <q-item-section>
            <q-item-label>MQTT 포트</q-item-label>
            <q-item-label caption>MQTT 서버 포트를 설정합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input v-model.number="mqttPort" type="number" dense outlined class="input-field" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  settings: {
    type: Object,
    required: true,
  },
})

const autoDiscovery = ref(props.settings.devices.autoDiscovery)
const refreshInterval = ref(props.settings.devices.refreshInterval)
const mqttEnabled = ref(props.settings.protocols.mqtt.enabled)
const mqttPort = ref(props.settings.protocols.mqtt.port)

watch([autoDiscovery, refreshInterval, mqttEnabled, mqttPort], ([newAutoDiscovery, newRefreshInterval, newMqttEnabled, newMqttPort]) => {
  // IOT 설정 변경 처리
  const updatedSettings = {
    devices: {
      autoDiscovery: newAutoDiscovery,
      refreshInterval: newRefreshInterval,
    },
    protocols: {
      mqtt: {
        enabled: newMqttEnabled,
        port: newMqttPort,
      },
    },
  }
  // TODO: 설정 변경 시 서버에 저장하는 로직 구현
  console.log('IOT 설정 변경:', updatedSettings)
})
</script>

<style lang="scss" scoped>
.iot-settings {
  .settings-section {
    margin-bottom: 2rem;

    &:last-child {
      margin-bottom: 0;
    }

    .text-h6 {
      color: var(--nexa-text-primary);
      font-weight: 600;
    }

    .q-item {
      .q-item__label {
        color: var(--nexa-text-primary);
      }

      .q-item__label--caption {
        color: var(--nexa-text-secondary);
      }
    }

    .q-item-label {
      color: var(--nexa-text-primary);
    }

    .q-item-label--caption {
      color: var(--nexa-text-secondary);
    }

    .input-field {
      width: 150px;

      // 입력 필드 텍스트 색상
      :deep(.q-field__native) {
        color: var(--nexa-text-hint);
      }

      // 셀렉트 선택된 값 색상
      :deep(.q-field__native) {
        color: var(--nexa-text-hint);
      }
    }
  }
}
</style>
