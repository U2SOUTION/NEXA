<template>
  <div class="settings-content q-pa-md">
    <!-- 현재 선택된 탭에 따른 설정 컴포넌트 렌더링 -->
    <q-tab-panels v-model="activeTab" animated class="bg-transparent">
      <q-tab-panel name="shortcuts" class="q-pa-none">
        <ShortcutsSettings />
      </q-tab-panel>
      <q-tab-panel name="layout" class="q-pa-none">
        <LayoutSettings :settings="layoutSettings" />
      </q-tab-panel>
      <q-tab-panel name="iot" class="q-pa-none">
        <IotSettings :settings="iotSettings" />
      </q-tab-panel>
      <q-tab-panel name="system" class="q-pa-none">
        <SystemSettings :settings="systemSettings" />
      </q-tab-panel>
      <q-tab-panel name="theme" class="q-pa-none">
        <ThemeSettings :settings="themeSettings" />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '../../store/settingsStore'

// 설정 데이터 (시스템 설정 레이어에서 로드)
import { themeSettings } from '@system/settings/theme'
import { layoutSettings } from '@system/settings/layout'
import { iotSettings } from '@system/settings/iot'
import { systemSettings } from '@system/settings/system'

// 컴포넌트 임포트 (이동된 위치 참조)
import ThemeSettings from '../../components/ThemeSettings.vue'
import LayoutSettings from '../../components/LayoutSettings.vue'
import ShortcutsSettings from '../../components/ShortcutsSettings.vue'
import IotSettings from '../../components/IotSettings.vue'
import SystemSettings from '../../components/SystemSettings.vue'

const settingsStore = useSettingsStore()
const { activeTab } = storeToRefs(settingsStore)
</script>

<style lang="scss" scoped>
.settings-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
