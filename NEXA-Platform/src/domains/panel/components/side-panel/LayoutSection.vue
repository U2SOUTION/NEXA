<template>
  <div class="layout-section">
    <div class="q-pa-sm">
      <q-btn
        flat
        dense
        icon="add"
        label="사용자 프리셋 추가"
        class="full-width q-mb-sm"
        @click="addUserPreset"
      />
      <q-list>
        <q-item v-for="preset in dashboardLayoutStore.presets" :key="preset" clickable v-ripple>
          <q-item-section avatar>
            <q-icon :name="getPresetIcon(preset)" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ getPresetLabel(preset) }}</q-item-label>
            <q-item-label caption>{{ getPresetDescription(preset) }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon
              :name="dashboardLayoutStore.activePreset === preset ? 'check' : ''"
              color="primary"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script setup>
import { useDashboardLayoutStore } from '@system/store/dashboardLayoutStore'
import { getPresetIcon, getPresetLabel, getPresetDescription } from '@system/utils/boardWindowPreset.js'

const dashboardLayoutStore = useDashboardLayoutStore()

function addUserPreset() {
  // 사용자 프리셋 추가 기능은 추후 구현
  console.log('사용자 프리셋 추가 기능은 추후 구현 예정입니다.')
}
</script>

<style lang="scss" scoped>
.layout-section {
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
