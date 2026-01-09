<!-- EnvHeader.vue
  환경 변수 헤더 컴포넌트
  검색, 새로고침, 설정 버튼 포함
-->

<template>
  <div class="env-header">
    <div class="header-title-section q-px-sm q-pt-sm q-pb-sm">
      <div class="row items-center justify-between">
        <div class="header-title">ENV</div>
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
import { ref } from 'vue'

defineProps({
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

const localSearchQuery = ref('')
const isRefreshing = ref(false)

function handleSearchChangeLocal(value) {
  localSearchQuery.value = value
  emit('search-change', value)
}

function handleRefresh() {
  isRefreshing.value = true
  emit('refresh')
  setTimeout(() => {
    isRefreshing.value = false
  }, 500)
}

function handleSettings() {
  emit('settings')
}
</script>

<style lang="scss" scoped>
.env-header {
  background-color: var(--nexa-surface);
}

.header-title {
  font-weight: 600;
  color: var(--nexa-text-primary);
}

.search-input {
  width: 100%;
}
</style>
