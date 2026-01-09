<!-- ApiTesterList.vue
  API 테스터 목록 컴포넌트
  API 요청 목록 표시 및 선택 기능
-->

<template>
  <div class="api-tester-list-container">
    <q-scroll-area class="api-tester-list-scroll-area">
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-section q-pa-lg text-center">
        <q-spinner color="primary" size="3em" />
        <div class="q-mt-md text-caption">요청 목록을 불러오는 중...</div>
      </div>

      <!-- 요청 목록 -->
      <q-list v-else separator>
        <q-item
          v-for="request in requests"
          :key="request.id"
          clickable
          :active="selectedRequest?.id === request.id"
          active-class="request-item-active"
          @click="handleRequestSelect(request)"
        >
          <q-item-section avatar>
            <q-chip
              :color="getMethodColor(request.method)"
              text-color="white"
              size="sm"
              :label="request.method || 'GET'"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label class="request-url">{{ request.url || 'URL 없음' }}</q-item-label>
            <q-item-label caption class="request-meta">
              <span v-if="request.status">{{ request.status }}</span>
              <span v-if="request.duration" class="q-ml-sm">{{ request.duration }}ms</span>
              <span class="q-ml-sm request-time">{{ formatTime(request.timestamp) }}</span>
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-icon
              :name="getStatusIcon(request.status)"
              :color="getStatusColor(request.status)"
            />
            <q-icon name="chevron_right" color="grey-7" class="q-ml-sm" />
          </q-item-section>
        </q-item>

        <!-- 요청이 없을 때 -->
        <div v-if="requests.length === 0" class="empty-section q-pa-lg text-center">
          <q-icon name="api" size="48px" color="grey-5" class="q-mb-md" />
          <div class="text-grey-7">API 요청이 없습니다.</div>
        </div>
      </q-list>
    </q-scroll-area>
  </div>
</template>

<script setup>
defineProps({
  requests: {
    type: Array,
    default: () => [],
  },
  selectedRequest: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['request-selected'])

function handleRequestSelect(request) {
  emit('request-selected', request)
}

function getMethodColor(method) {
  const colors = {
    GET: 'blue',
    POST: 'green',
    PUT: 'orange',
    DELETE: 'red',
    PATCH: 'purple',
  }
  return colors[method?.toUpperCase()] || 'grey'
}

function getStatusIcon(status) {
  if (!status) return 'help'
  if (status >= 200 && status < 300) return 'check_circle'
  if (status >= 400 && status < 500) return 'error'
  if (status >= 500) return 'cancel'
  return 'info'
}

function getStatusColor(status) {
  if (!status) return 'grey-7'
  if (status >= 200 && status < 300) return 'positive'
  if (status >= 400 && status < 500) return 'warning'
  if (status >= 500) return 'negative'
  return 'info'
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style lang="scss" scoped>
.api-tester-list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.api-tester-list-scroll-area {
  flex: 1;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.request-item-active {
  background-color: var(--nexa-surface-hover);
}

.request-url {
  color: var(--nexa-text-primary);
  font-weight: 500;
  word-break: break-all;
}

.request-meta {
  color: var(--nexa-text-secondary);
}

.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}
</style>
