<template>
  <q-page class="settings-page">
    <div class="q-pa-sm">
      <div class="page-header q-mb-lg">
        <h1 class="text-h4 text-primary" style="margin-bottom: 2px">SETTINGS</h1>
        <p class="text-body1 text-grey-7">시스템 설정 및 구성</p>
      </div>

      <q-tabs v-model="selectedTab" class="q-mb-sm">
        <q-tab name="shortcuts" label="단축키" icon="keyboard" />
        <q-tab name="layout" label="레이아웃" icon="dashboard" />
        <q-tab name="iot" label="IOT 설정" icon="devices" />
        <q-tab name="system" label="시스템" icon="tune" />
        <q-tab name="theme" label="테마" icon="palette" />
      </q-tabs>

      <q-tab-panels v-model="selectedTab" animated>
        <q-tab-panel name="shortcuts">
          <component :is="ShortcutsSettings" />
        </q-tab-panel>
        <q-tab-panel name="layout">
          <component :is="LayoutSettings" :settings="layoutSettings" />
        </q-tab-panel>
        <q-tab-panel name="iot">
          <component :is="IotSettings" :settings="iotSettings" />
        </q-tab-panel>
        <q-tab-panel name="system">
          <component :is="SystemSettings" :settings="systemSettings" />
        </q-tab-panel>
        <q-tab-panel name="theme">
          <component :is="ThemeSettings" :settings="themeSettings" />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { themeSettings } from '../settings/theme'
import { layoutSettings } from '../settings/layout'
import { iotSettings } from '../settings/iot'
import { systemSettings } from '../settings/system'

import ThemeSettings from '../components/settings/ThemeSettings.vue'
import LayoutSettings from '../components/settings/LayoutSettings.vue'
import ShortcutsSettings from '../components/settings/ShortcutsSettings.vue'
import IotSettings from '../components/settings/IotSettings.vue'
import SystemSettings from '../components/settings/SystemSettings.vue'

const route = useRoute()
const selectedTab = ref('shortcuts')

// 유효한 탭 이름 목록
const validTabs = ['shortcuts', 'layout', 'iot', 'system', 'theme']

// URL 쿼리 파라미터에서 탭 읽기 (초기 로드 및 변경 감지)
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && validTabs.includes(newTab)) {
      selectedTab.value = newTab
    } else if (!newTab) {
      // 쿼리 파라미터가 없으면 기본값
      selectedTab.value = 'shortcuts'
    }
  },
  { immediate: true }, // 초기 마운트 시에도 실행
)
</script>

<style lang="scss" scoped>
.settings-page {
  padding: 0 100px;
  //background: var(--nexa-background);
  min-height: 100vh;
}

// ============================================
// 설정 페이지 탭 패널 배경 제거
// ============================================
// q-tab-panels 관련 모든 요소의 배경을 투명하게 설정

:deep(.q-tab-panels) {
  background: transparent;
  //padding: 0 100px;
}
</style>
