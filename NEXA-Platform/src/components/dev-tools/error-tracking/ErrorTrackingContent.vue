<template>
  <div class="error-tracking-content">
    <!-- 선택된 에러가 없을 때 -->
    <div v-if="!selectedError" class="empty-state q-pa-lg">
      <q-icon name="bug_report" size="80px" color="grey-7" class="q-mb-md" />
      <h3 class="empty-title">에러 트래킹</h3>
      <p class="empty-description">왼쪽 목록에서 에러를 선택하여 상세 정보를 확인하세요.</p>
      <div v-if="statistics.total > 0" class="statistics-summary q-mt-lg">
        <div class="stat-item">
          <span class="stat-label">총 에러:</span>
          <span class="stat-value">{{ statistics.total }}개</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">신규:</span>
          <span class="stat-value text-negative">{{ statistics.new }}개</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">오늘:</span>
          <span class="stat-value">{{ statistics.today }}개</span>
        </div>
      </div>
    </div>

    <!-- 선택된 에러 상세 정보 -->
    <div v-else class="error-detail q-pa-md">
      <!-- 에러 기본 정보 -->
      <div class="error-header q-mb-md">
        <div class="row items-center q-gutter-md">
          <q-icon :name="getErrorIcon(selectedError.level)" :color="getErrorColor(selectedError.level)" size="32px" />
          <div class="col">
            <h4 class="error-title">{{ selectedError.message || '에러 메시지 없음' }}</h4>
            <div class="error-meta q-mt-xs">
              <q-chip v-if="selectedError.status === 'new'" color="negative" text-color="white" size="sm" label="신규" />
              <q-chip v-else-if="selectedError.status === 'resolved'" color="positive" text-color="white" size="sm" label="해결" />
              <q-chip v-else-if="selectedError.status === 'ignored'" color="grey" text-color="white" size="sm" label="무시" />
              <span class="q-ml-sm text-caption">{{ formatTime(selectedError.timestamp) }}</span>
              <span v-if="selectedError.count > 1" class="q-ml-sm text-caption text-negative">({{ selectedError.count }}회 발생)</span>
            </div>
          </div>
        </div>
        <div class="error-actions q-mt-md">
          <q-btn flat dense icon="check_circle" label="해결 표시" color="positive" @click="markAsResolved" />
          <q-btn flat dense icon="block" label="무시" color="grey" @click="markAsIgnored" />
          <q-btn flat dense icon="delete" label="삭제" color="negative" @click="deleteError" />
        </div>
      </div>

      <!-- 에러 위치 정보 -->
      <div v-if="selectedError.file" class="error-location q-pa-md q-mb-md">
        <h5 class="section-title q-mb-sm">
          <q-icon name="location_on" />
          발생 위치
        </h5>
        <div class="location-info">
          <div class="info-row">
            <span class="info-label">파일:</span>
            <span class="info-value code">{{ selectedError.file }}</span>
          </div>
          <div v-if="selectedError.line" class="info-row">
            <span class="info-label">라인:</span>
            <span class="info-value">{{ selectedError.line }}</span>
            <span v-if="selectedError.column" class="info-value q-ml-sm">컬럼: {{ selectedError.column }}</span>
          </div>
        </div>
      </div>

      <!-- 스택 트레이스 -->
      <div v-if="selectedError.stack" class="error-stack q-pa-md q-mb-md">
        <h5 class="section-title q-mb-sm">
          <q-icon name="code" />
          스택 트레이스
        </h5>
        <pre class="stack-trace">{{ selectedError.stack }}</pre>
      </div>

      <!-- 컨텍스트 정보 -->
      <div class="error-context q-pa-md">
        <h5 class="section-title q-mb-sm">
          <q-icon name="info" />
          컨텍스트 정보
        </h5>
        <div class="context-info">
          <div v-if="selectedError.url" class="info-row">
            <span class="info-label">URL:</span>
            <span class="info-value">{{ selectedError.url }}</span>
          </div>
          <div v-if="selectedError.userAgent" class="info-row">
            <span class="info-label">User Agent:</span>
            <span class="info-value text-caption">{{ selectedError.userAgent }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 선택된 에러 상태
const selectedError = ref(null)

// 통계 정보 (임시)
const statistics = ref({
  total: 0,
  new: 0,
  resolved: 0,
  ignored: 0,
  today: 0,
})

// 에러 선택 이벤트 리스너
function handleErrorSelected(event) {
  selectedError.value = event.detail.error
}

// 통계 업데이트 이벤트 리스너
function handleStatisticsUpdated(event) {
  statistics.value = event.detail
}

// 에러 아이콘
function getErrorIcon(level) {
  switch (level) {
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    case 'unhandled':
      return 'cancel'
    default:
      return 'bug_report'
  }
}

// 에러 색상
function getErrorColor(level) {
  switch (level) {
    case 'error':
      return 'negative'
    case 'warning':
      return 'warning'
    case 'unhandled':
      return 'negative'
    default:
      return 'grey-7'
  }
}

// 시간 포맷팅
function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// 에러 상태 변경
function markAsResolved() {
  if (selectedError.value) {
    window.dispatchEvent(
      new CustomEvent('error-tracking-status-update', {
        detail: { errorId: selectedError.value.id, status: 'resolved' },
      }),
    )
    selectedError.value.status = 'resolved'
  }
}

function markAsIgnored() {
  if (selectedError.value) {
    window.dispatchEvent(
      new CustomEvent('error-tracking-status-update', {
        detail: { errorId: selectedError.value.id, status: 'ignored' },
      }),
    )
    selectedError.value.status = 'ignored'
  }
}

function deleteError() {
  if (selectedError.value) {
    window.dispatchEvent(
      new CustomEvent('error-tracking-delete', {
        detail: { errorId: selectedError.value.id },
      }),
    )
    selectedError.value = null
  }
}

onMounted(() => {
  window.addEventListener('error-tracking-error-selected', handleErrorSelected)
  window.addEventListener('error-tracking-statistics-updated', handleStatisticsUpdated)
})

onUnmounted(() => {
  window.removeEventListener('error-tracking-error-selected', handleErrorSelected)
  window.removeEventListener('error-tracking-statistics-updated', handleStatisticsUpdated)
})
</script>

<style lang="scss" scoped>
.error-tracking-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-background);
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.empty-title {
  color: var(--nexa-text-primary);
  font-size: 2rem;
  font-weight: 600;
  margin: 1rem 0;
}

.empty-description {
  color: var(--nexa-text-secondary);
  font-size: 1rem;
  margin: 0;
}

.statistics-summary {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  color: var(--nexa-text-secondary);
  font-size: 0.875rem;
}

.stat-value {
  color: var(--nexa-text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.error-detail {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.error-header {
  border-bottom: 2px solid var(--nexa-border-color);
  padding-bottom: 1rem;
}

.error-title {
  color: var(--nexa-text-primary);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  word-break: break-word;
}

.error-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.error-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.error-location,
.error-stack,
.error-context {
  background-color: var(--nexa-surface);
  border-radius: 4px;
  border: 1px solid var(--nexa-border-color);
}

.section-title {
  color: var(--nexa-text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.location-info,
.context-info {
  margin-top: 1rem;
}

.info-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.info-label {
  color: var(--nexa-text-secondary);
  font-weight: 500;
  min-width: 80px;
}

.info-value {
  color: var(--nexa-text-primary);
  flex: 1;
  word-break: break-all;

  &.code {
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    background-color: var(--nexa-surface);
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
  }
}

.stack-trace {
  background-color: var(--nexa-background);
  color: var(--nexa-text-primary);
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid var(--nexa-border-color);
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}
</style>

