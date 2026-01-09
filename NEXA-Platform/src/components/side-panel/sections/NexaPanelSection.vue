<template>
  <div class="nexa-panel-section">
    <div class="q-pa-sm">
      <q-list>
        <q-item
          v-for="panel in panelTypes"
          :key="panel.id"
          clickable
          v-ripple
          @click="addNewPanel"
        >
          <q-item-section avatar>
            <q-icon :name="panel.icon" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ panel.name }}</q-item-label>
            <q-item-label caption>{{ panel.description }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script setup>
import { useDashboardLayoutStore } from 'src/system/store/dashboardLayoutStore'
import { panelTypes } from '@domains/panel/components/config/panelTypes'

const dashboardLayoutStore = useDashboardLayoutStore()

function addNewPanel() {
  dashboardLayoutStore.triggerGenericAddPanel()
}
</script>

<style lang="scss" scoped>
.nexa-panel-section {
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
