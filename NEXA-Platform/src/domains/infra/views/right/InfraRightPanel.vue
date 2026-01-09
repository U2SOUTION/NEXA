<template>
  <div class="infra-right-panel">
    <transition name="fade" mode="out-in">
      <div :key="infraStore.activeSubMenu" class="panel-container">
        <template v-if="infraStore.activeSubMenu === 'my-devices'">
          <DeviceDetails />
        </template>
        <template v-else>
          <div class="q-pa-md text-center text-grey-6">
            <q-icon name="info" size="32px" class="q-mb-sm" />
            <div>이 메뉴에서는<br>우측 패널을 제공하지 않습니다.</div>
          </div>
        </template>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { useInfraStore } from '@infra/store/infraStore'
import DeviceDetails from '@infra/my-devices/views/right/DeviceDetails.vue'

const infraStore = useInfraStore()
</script>

<style lang="scss" scoped>
.infra-right-panel {
  height: 100%;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
