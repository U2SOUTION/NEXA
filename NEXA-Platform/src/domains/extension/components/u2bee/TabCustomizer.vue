<template>
  <div class="tab-customizer">
    <q-list>
      <q-item
        v-for="tab in tabConfig"
        :key="tab.name"
        class="tab-config-item"
      >
        <q-item-section avatar>
          <q-icon :name="tab.icon" class="tab-config-icon" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="tab-config-label">{{ tab.label }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-toggle
            :model-value="tab.visible"
            @update:model-value="toggleTabVisibility(tab.name)"
            class="tab-config-toggle"
          />
        </q-item-section>
      </q-item>
    </q-list>

    <div class="tab-customizer-actions">
      <q-btn flat dense label="기본 구성으로 복원" class="reset-button" @click="handleReset" />
    </div>
  </div>
</template>

<script setup>
import { useTabConfig } from '@system/composables/extension/u2bee/useTabConfig'

const { tabConfig, toggleTabVisibility, resetToDefault } = useTabConfig()

function handleReset() {
  resetToDefault()
}
</script>

<style lang="scss" scoped>
.tab-customizer {
  padding: 0;
}

.tab-config-item {
  padding: 8px 0;
}

.tab-config-icon {
  font-size: 20px;
  color: var(--nexa-text-primary);
}

.tab-config-label {
  font-size: 14px;
  color: var(--nexa-text-primary);
}

.tab-config-toggle {
  color: var(--nexa-button-primary-bg);
}

.tab-customizer-actions {
  display: flex;
  justify-content: flex-end;
  padding: 12px 0 0 0;
  border-top: 1px solid var(--nexa-border-color);
  margin-top: 8px;
}

.reset-button {
  color: var(--nexa-button-primary-bg);
}
</style>
