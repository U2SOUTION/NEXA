<template>
  <div class="infra-right-panel">
    <!-- 공통 헤더 -->
    <StandardRightHeader title="Tools Panel" subtitle="Infrastructure & Assets" push-icon="menu_open" />

    <q-scroll-area class="panel-scroll-area">
      <transition name="fade" mode="out-in">
        <div :key="infraStore.activeSubMenu" class="panel-container">
          <template v-if="infraStore.activeSubMenu === 'my-devices'">
            <DeviceDetails />
          </template>
          <template v-else>
            <div class="q-pa-md text-center text-grey-6">
              <q-icon name="info" size="32px" class="q-mb-sm" />
              <div>이 메뉴에서는<br>상세 정보를 제공하지 않습니다.</div>
            </div>
          </template>
        </div>
      </transition>
    </q-scroll-area>
  </div>
</template>

<script setup>
import { QScrollArea } from 'quasar'
import StandardRightHeader from '@frame/layout/components/StandardRightHeader.vue'
import { useInfraStore } from '@infra/store/infraStore'
import DeviceDetails from '@infra/my-devices/views/right/DeviceDetails.vue'

const infraStore = useInfraStore()
</script>

<style lang="scss" scoped>
.infra-right-panel {
  height: 100%;
  display: flex;
  flex-direction: column;

  .panel-scroll-area {
    flex: 1;
  }
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
