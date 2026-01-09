<!-- DeployHeader.vue
  배포 헤더 컴포넌트
  새로고침, 배포 실행, 설정 버튼 포함
-->

<template>
  <div class="deploy-header">
    <div class="header-title-section q-px-sm q-pt-sm q-pb-sm">
      <div class="row items-center justify-between">
        <div class="header-title">DEPLOY</div>
        <div class="row q-gutter-xs">
          <q-btn flat dense icon="refresh" size="sm" :loading="isRefreshing" @click="handleRefresh">
            <q-tooltip>새로고침</q-tooltip>
          </q-btn>
          <q-btn flat dense icon="cloud_upload" size="sm" color="positive" @click="handleDeploy">
            <q-tooltip>배포 실행</q-tooltip>
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

const emit = defineEmits(['refresh', 'deploy', 'settings'])

const isRefreshing = ref(false)

function handleRefresh() {
  isRefreshing.value = true
  emit('refresh')
  setTimeout(() => {
    isRefreshing.value = false
  }, 500)
}

function handleDeploy() {
  emit('deploy')
}

function handleSettings() {
  emit('settings')
}
</script>

<style lang="scss" scoped>
.deploy-header {
  background-color: var(--nexa-surface);
}

.header-title {
  font-weight: 600;
  color: var(--nexa-text-primary);
}
</style>
