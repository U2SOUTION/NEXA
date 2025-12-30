<!-- BuildHeader.vue
  빌드 헤더 컴포넌트
  새로고침, 빌드 실행, 설정 버튼 포함
-->

<template>
  <div class="build-header">
    <div class="header-title-section q-px-sm q-pt-sm q-pb-sm">
      <div class="row items-center justify-between">
        <div class="header-title">BUILD</div>
        <div class="row q-gutter-xs">
          <q-btn flat dense icon="refresh" size="sm" :loading="isRefreshing" @click="handleRefresh">
            <q-tooltip>새로고침</q-tooltip>
          </q-btn>
          <q-btn flat dense icon="play_arrow" size="sm" color="positive" @click="handleBuild">
            <q-tooltip>빌드 실행</q-tooltip>
          </q-btn>
          <q-btn flat dense icon="settings" size="sm" @click="handleSettings">
            <q-tooltip>설정</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['refresh', 'build', 'settings'])

const isRefreshing = ref(false)

function handleRefresh() {
  isRefreshing.value = true
  emit('refresh')
  setTimeout(() => {
    isRefreshing.value = false
  }, 500)
}

function handleBuild() {
  emit('build')
}

function handleSettings() {
  emit('settings')
}
</script>

<style lang="scss" scoped>
.build-header {
  background-color: var(--nexa-surface);
}

.header-title {
  font-weight: 600;
  color: var(--nexa-text-primary);
}
</style>
