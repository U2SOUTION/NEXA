<!-- EnvList.vue
  환경 변수 리스트 컴포넌트
  환경 변수 목록 표시
-->

<template>
  <q-scroll-area class="env-list-scroll-area">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-state q-pa-lg text-center">
      <q-spinner size="32px" color="primary" />
      <div class="q-mt-md text-caption">환경 변수를 스캔하는 중...</div>
    </div>

    <!-- 환경 변수 목록 -->
    <div v-else-if="variables.length > 0" class="variables-list">
      <q-list separator>
        <q-item
          v-for="variable in variables"
          :key="variable.id"
          :class="{ 'variable-item-selected': selectedVariable?.id === variable.id }"
          clickable
          @click="handleVariableClick(variable)"
        >
          <q-item-section avatar>
            <q-icon name="tune" color="primary" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="variable-item-name">{{ variable.name }}</q-item-label>
            <q-item-label caption class="variable-item-path">{{ variable.path }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-chip color="primary" text-color="white" size="sm" dense>
              {{ variable.environment }}
            </q-chip>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="empty-state q-pa-lg text-center">
      <q-icon name="tune" size="48px" color="grey-5" class="q-mb-sm" />
      <div class="empty-message">환경 변수가 없습니다</div>
      <div class="empty-hint">새로고침 버튼을 눌러 환경 변수를 스캔하세요.</div>
    </div>
  </q-scroll-area>
</template>

<script setup>
defineProps({
  variables: {
    type: Array,
    default: () => [],
  },
  selectedVariable: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['variable-selected'])

function handleVariableClick(variable) {
  emit('variable-selected', variable)
}
</script>

<style lang="scss" scoped>
.env-list-scroll-area {
  flex: 1;
  height: 100%;
}

.variable-item-selected {
  background-color: var(--nexa-surface-hover);
}

.variable-item-name {
  font-weight: 500;
  color: var(--nexa-text-primary);
}

.variable-item-path {
  color: var(--nexa-text-secondary);
}

.empty-state {
  color: var(--nexa-text-secondary);
}

.empty-message {
  font-weight: 500;
  margin-top: 8px;
}

.empty-hint {
  font-size: 0.875rem;
  margin-top: 4px;
  opacity: 0.7;
}
</style>
