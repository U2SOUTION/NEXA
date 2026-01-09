<!-- BuildList.vue
  빌드 리스트 컴포넌트
  빌드 이력 목록 표시
-->

<template>
  <q-scroll-area class="build-list-scroll-area">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-state q-pa-lg text-center">
      <q-spinner size="32px" color="primary" />
      <div class="q-mt-md text-caption">빌드 정보를 로드하는 중...</div>
    </div>

    <!-- 빌드 목록 -->
    <div v-else-if="builds.length > 0" class="builds-list">
      <q-list separator>
        <q-item
          v-for="build in builds"
          :key="build.id"
          :class="{ 'build-item-selected': selectedBuild?.id === build.id }"
          clickable
          @click="handleBuildClick(build)"
        >
          <q-item-section avatar>
            <q-icon name="build" color="primary" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="build-item-name">{{ build.name }}</q-item-label>
            <q-item-label caption class="build-item-time">{{ formatTime(build.timestamp) }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-chip :color="getBuildStatusColor(build.status)" text-color="white" size="sm" dense>
              {{ build.status }}
            </q-chip>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="empty-state q-pa-lg text-center">
      <q-icon name="build" size="48px" color="grey-5" class="q-mb-sm" />
      <div class="empty-message">빌드 이력이 없습니다</div>
      <div class="empty-hint">빌드 실행 버튼을 눌러 빌드를 시작하세요.</div>
    </div>
  </q-scroll-area>
</template>

<script setup>
defineProps({
  builds: {
    type: Array,
    default: () => [],
  },
  selectedBuild: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['build-selected'])

function handleBuildClick(build) {
  emit('build-selected', build)
}

function formatTime(timestamp) {
  if (!timestamp) return '알 수 없음'
  const date = new Date(timestamp)
  return date.toLocaleString('ko-KR')
}

function getBuildStatusColor(status) {
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
.build-list-scroll-area {
  flex: 1;
  height: 100%;
}

.build-item-selected {
  background-color: var(--nexa-surface-hover);
}

.build-item-name {
  font-weight: 500;
  color: var(--nexa-text-primary);
}

.build-item-time {
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
