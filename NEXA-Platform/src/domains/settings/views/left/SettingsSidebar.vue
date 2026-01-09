<template>
  <div class="settings-sidebar">
    <StandardLeftHeader
      title="SETTINGS"
      subtitle="시스템 설정 및 구성"
      icon="settings"
    />

    <q-list class="q-mt-sm">
      <q-item
        v-for="item in menuItems"
        :key="item.id"
        clickable
        v-ripple
        :active="activeTab === item.id"
        @click="setActiveTab(item.id)"
        active-class="nexa-active-item"
      >
        <q-item-section avatar>
          <q-icon :name="item.icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ item.label }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import StandardLeftHeader from 'src/frame/layout/components/StandardLeftHeader.vue'
import { useSettingsStore } from '../../store/settingsStore'

const settingsStore = useSettingsStore()
const { activeTab } = storeToRefs(settingsStore)

const menuItems = [
  { id: 'shortcuts', label: '단축키 설정', icon: 'keyboard' },
  { id: 'layout', label: '레이아웃 설정', icon: 'dashboard' },
  { id: 'iot', label: 'IoT 장치 구성', icon: 'devices' },
  { id: 'system', label: '시스템 운영', icon: 'tune' },
  { id: 'theme', label: '테마 및 디자인', icon: 'palette' }
]

function setActiveTab(tabId) {
  settingsStore.setActiveTab(tabId)
}
</script>

<style lang="scss" scoped>
.nexa-active-item {
  background-color: var(--nexa-surface-hover);
  color: var(--nexa-text-primary);
  border-right: 2px solid var(--nexa-button-primary-bg);
}
</style>
