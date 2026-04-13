<template>
  <div class="nexet-section">
    <div class="q-pa-sm">
      <q-list>
        <q-item v-for="panel in nexetTypes" :key="panel.id" clickable v-ripple @click="addNewPanel">
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
import { useDashboardLayoutStore } from '@system/store/dashboardLayoutStore'
import { nexetTypes } from '@domains/nexet/components/config/nexetTypes'

const dashboardLayoutStore = useDashboardLayoutStore()

function addNewPanel() {
  dashboardLayoutStore.triggerGenericAddPanel()
}
</script>

<style lang="scss" scoped>
.nexet-section {
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
