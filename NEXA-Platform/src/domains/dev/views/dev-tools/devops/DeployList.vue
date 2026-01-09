<!-- DeployList.vue
  배포 리스트 컴포넌트
  배포 이력 목록 표시
-->

<template>
  <q-scroll-area class="deploy-list-scroll-area">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-state q-pa-lg text-center">
      <q-spinner size="32px" color="primary" />
      <div class="q-mt-md text-caption">배포 정보를 로드하는 중...</div>
    </div>

    <!-- 배포 목록 -->
    <div v-else-if="deployments.length > 0" class="deployments-list">
      <q-list separator>
        <q-item
          v-for="deployment in deployments"
          :key="deployment.id"
          :class="{ 'deployment-item-selected': selectedDeployment?.id === deployment.id }"
          clickable
          @click="handleDeploymentClick(deployment)"
        >
          <q-item-section avatar>
            <q-icon name="cloud_upload" color="primary" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="deployment-item-name">{{ deployment.name }}</q-item-label>
            <q-item-label caption class="deployment-item-time">{{ formatTime(deployment.timestamp) }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-chip :color="getDeploymentStatusColor(deployment.status)" text-color="white" size="sm" dense>
              {{ deployment.status }}
            </q-chip>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="empty-state q-pa-lg text-center">
      <q-icon name="cloud_upload" size="48px" color="grey-5" class="q-mb-sm" />
      <div class="empty-message">배포 이력이 없습니다</div>
      <div class="empty-hint">배포 실행 버튼을 눌러 배포를 시작하세요.</div>
    </div>
  </q-scroll-area>
</template>

<script setup>
defineProps({
  deployments: {
    type: Array,
    default: () => [],
  },
  selectedDeployment: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['deployment-selected'])

function handleDeploymentClick(deployment) {
  emit('deployment-selected', deployment)
}

function formatTime(timestamp) {
  if (!timestamp) return '알 수 없음'
  const date = new Date(timestamp)
  return date.toLocaleString('ko-KR')
}

function getDeploymentStatusColor(status) {
  const colors = {
    success: 'positive',
    failed: 'negative',
    running: 'info',
    pending: 'grey',
  }
  return colors[status] || 'grey'
}
</script>

<style lang="scss" scoped>
.deploy-list-scroll-area {
  flex: 1;
  height: 100%;
}

.deployment-item-selected {
  background-color: var(--nexa-surface-hover);
}

.deployment-item-name {
  font-weight: 500;
  color: var(--nexa-text-primary);
}

.deployment-item-time {
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
