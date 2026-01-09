<template>
  <div class="infra-content">
    <!-- 하위 메뉴에 따른 컨텐츠 전환 -->
    <transition name="fade" mode="out-in">
      <div :key="infraStore.activeSubMenu" class="sub-menu-container">
        <template v-if="infraStore.activeSubMenu === 'my-devices'">
          <DeviceList />
        </template>
        <template v-else-if="infraStore.activeSubMenu === 'system-status'">
          <div class="placeholder-view q-pa-xl text-center">
            <q-icon name="monitor_heart" size="64px" color="grey-5" />
            <div class="text-h6 text-grey-5">시스템 상태 모니터링 준비 중...</div>
          </div>
        </template>
        <template v-else-if="infraStore.activeSubMenu === 'agw'">
          <div class="placeholder-view q-pa-xl text-center">
            <q-icon name="dns" size="64px" color="grey-5" />
            <div class="text-h6 text-grey-5">AGW System 준비 중...</div>
          </div>
        </template>
        <template v-else-if="infraStore.activeSubMenu === 'monitoring'">
          <div class="placeholder-view q-pa-xl text-center">
            <q-icon name="timeline" size="64px" color="grey-5" />
            <div class="text-h6 text-grey-5">실시간 모니터링 준비 중...</div>
          </div>
        </template>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { useInfraStore } from '@infra/store/infraStore'
import DeviceList from '@infra/my-devices/views/content/DeviceList.vue'

const infraStore = useInfraStore()
</script>

<style lang="scss" scoped>
.infra-content {
  height: 100%;
  
  .sub-menu-container {
    height: 100%;
  }

  .placeholder-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
