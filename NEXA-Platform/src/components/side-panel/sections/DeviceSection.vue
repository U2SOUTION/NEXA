<template>
  <div class="device-section">
    <div class="q-pa-sm">
      <q-btn
        flat
        dense
        icon="add"
        label="새 디바이스 추가"
        class="full-width q-mb-sm"
        @click="addNewDevice"
      />

      <q-list>
        <q-item v-for="device in tempDevices" :key="device.id" clickable v-ripple>
          <q-item-section avatar>
            <q-icon
              :name="device.icon"
              :color="device.status === 'online' ? 'positive' : 'negative'"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ device.name }}</q-item-label>
            <q-item-label caption
              >{{ device.type }} -
              {{ device.status === 'online' ? '온라인' : '오프라인' }}</q-item-label
            >
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 임시 디바이스 데이터
const tempDevices = [
  {
    id: 1,
    name: '디바이스 1',
    type: '카메라',
    status: 'online',
    icon: 'videocam',
  },
  {
    id: 2,
    name: '디바이스 2',
    type: '센서',
    status: 'offline',
    icon: 'sensors',
  },
  {
    id: 3,
    name: '디바이스 3',
    type: '제어기',
    status: 'online',
    icon: 'settings',
  },
]

function addNewDevice() {
  router.push('/add-device')
}
</script>

<style lang="scss" scoped>
.device-section {
  .q-btn {
    border: 1px dashed var(--nexa-border-color);
    color: var(--nexa-text-secondary);

    &:hover {
      background: var(--nexa-surface);
      color: var(--nexa-primary);
    }
  }

  .q-item {
    border-bottom: 1px solid var(--nexa-border-color);

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: var(--nexa-surface);
    }
  }
}
</style>
