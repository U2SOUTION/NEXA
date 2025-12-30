<!-- EnvironmentVariablesHeader.vue
  환경 변수 헤더 컴포넌트
  검색, 새로고침 등 포함
-->
<template>
  <div class="environment-variables-header">
    <!-- 헤더 타이틀 및 액션 버튼 -->
    <div class="header-title-section q-px-sm q-pt-sm q-pb-sm">
      <div class="row items-center justify-between">
        <div class="header-title">환경 변수</div>
        <div class="row q-gutter-xs">
          <q-btn flat dense icon="refresh" size="sm" :loading="isRefreshing" @click="handleRefresh">
            <q-tooltip>새로고침</q-tooltip>
          </q-btn>
          <q-btn flat dense icon="settings" size="sm" @click="handleSettings">
            <q-tooltip>설정</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- 검색 섹션 -->
    <div class="header-section q-px-sm q-pt-sm q-pb-none">
      <div class="row items-center q-gutter-sm q-mb-sm">
        <q-input
          v-model="localSearchQuery"
          placeholder="환경 변수 검색"
          dense
          outlined
          clearable
          class="search-input"
          @update:model-value="handleSearchChangeLocal"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['search-change', 'refresh', 'settings'])

// 로컬 상태
const localSearchQuery = ref(props.searchQuery)
const isRefreshing = ref(false)

// 검색 변경 핸들러
function handleSearchChangeLocal(value) {
  localSearchQuery.value = value
  emit('search-change', value)
}

// 새로고침 핸들러
async function handleRefresh() {
  isRefreshing.value = true
  emit('refresh')
  setTimeout(() => {
    isRefreshing.value = false
  }, 500)
}

// 설정 핸들러
function handleSettings() {
  emit('settings')
}

// 외부 상태 변경 감시
watch(
  () => props.searchQuery,
  (newValue) => {
    if (localSearchQuery.value !== newValue) {
      localSearchQuery.value = newValue
    }
  },
)
</script>

<style lang="scss" scoped>
.environment-variables-header {
  .header-title-section {
    border-bottom: 1px solid var(--nexa-border-color);

    .header-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--nexa-text-primary);
    }

    .q-btn {
      color: var(--nexa-text-secondary);
      transition:
        color 0.2s ease,
        background-color 0.2s ease;

      &:hover {
        color: var(--nexa-primary);
        background-color: color-mix(in srgb, var(--nexa-primary) 10%, transparent);
      }

      :deep(.q-icon) {
        font-size: 18px;
      }
    }
  }

  .header-section {
    .search-input {
      width: 100%;

      :deep(.q-field__control) {
        border: 2px solid var(--nexa-primary);
        border-radius: 4px;
      }

      :deep(.q-field__native) {
        color: var(--nexa-text-primary);
      }

      :deep(.q-field__prepend) {
        color: var(--nexa-primary);
      }

      &:focus-within {
        :deep(.q-field__control) {
          border-color: var(--nexa-primary);
        }
      }
    }
  }
}
</style>
