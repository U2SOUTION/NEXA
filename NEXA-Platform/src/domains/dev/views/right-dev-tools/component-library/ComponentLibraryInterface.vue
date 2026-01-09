<!-- ComponentLibraryInterface.vue
  컴포넌트 라이브러리 컴포넌트 인터페이스 컴포넌트
  Props/Emits/Slots 표시
-->

<template>
  <div v-if="selectedComponent" class="component-library-interface">
    <div class="section-header">
      <q-icon name="settings_input_component" size="20px" />
      <h4 class="section-title">컴포넌트 인터페이스</h4>
    </div>
    <div class="interface-content">
      <div class="interface-tabs">
        <q-tabs v-model="interfaceTab" dense>
          <q-tab name="props" label="Props" />
          <q-tab name="emits" label="Emits" />
          <q-tab name="slots" label="Slots" />
        </q-tabs>
      </div>
      <q-tab-panels v-model="interfaceTab" class="interface-panels">
        <q-tab-panel name="props">
          <div class="empty-interface">Props 정보는 추후 파싱 예정</div>
        </q-tab-panel>
        <q-tab-panel name="emits">
          <div class="empty-interface">Emits 정보는 추후 파싱 예정</div>
        </q-tab-panel>
        <q-tab-panel name="slots">
          <div class="empty-interface">Slots 정보는 추후 파싱 예정</div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  selectedComponent: {
    type: Object,
    default: null,
  },
})

const interfaceTab = ref('props')
</script>

<style lang="scss" scoped>
.component-library-interface {
  padding: 1rem;
  border-bottom: 1px solid var(--nexa-border-color);

  .section-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;

    .section-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--nexa-text-primary);
      margin: 0;
      flex: 1;
    }
  }
}

.interface-content {
  .interface-tabs {
    margin-bottom: 0.5rem;
  }

  .interface-panels {
    min-height: 200px;
    background-color: var(--nexa-background);
    border-radius: 4px;
    padding: 0.75rem;

    .empty-interface {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 150px;
      color: var(--nexa-text-secondary);
      font-size: 0.85rem;
    }
  }
}
</style>

