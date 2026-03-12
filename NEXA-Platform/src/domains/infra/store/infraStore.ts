import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useInfraStore = defineStore('infra', () => {
  // 현재 활성화된 하위 메뉴 (my-devices, physical-map, system-status)
  const activeSubMenu = ref('my-devices')
  
  // 선택된 장치 ID
  const selectedDeviceId = ref<string | null>(null)

  function setActiveSubMenu(menuId: string) {
    activeSubMenu.value = menuId
  }

  function setSelectedDevice(deviceId: string | null) {
    selectedDeviceId.value = deviceId
  }

  return {
    activeSubMenu,
    selectedDeviceId,
    setActiveSubMenu,
    setSelectedDevice
  }
})
