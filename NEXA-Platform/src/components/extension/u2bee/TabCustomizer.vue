<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">탭 구성 설정</div>
      <div class="text-body2 text-grey-7 q-mt-xs">탭의 표시/숨김과 순서를 설정할 수 있습니다</div>
    </q-card-section>

    <q-card-section>
      <q-list bordered separator>
        <q-item
          v-for="tab in tabConfig"
          :key="tab.name"
          class="tab-config-item"
        >
          <q-item-section avatar>
            <q-icon :name="tab.icon" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ tab.label }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-toggle
              :model-value="tab.visible"
              @update:model-value="toggleTabVisibility(tab.name)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="기본 구성으로 복원" color="primary" @click="handleReset" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { useTabConfig } from 'src/composables/extension/u2bee/useTabConfig'

const { tabConfig, toggleTabVisibility, resetToDefault } = useTabConfig()

function handleReset() {
  resetToDefault()
}
</script>

<style lang="scss" scoped>
.tab-config-item {
  padding: 8px 16px;
}
</style>
