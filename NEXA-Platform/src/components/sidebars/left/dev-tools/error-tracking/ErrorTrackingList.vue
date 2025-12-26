<!-- ErrorTrackingList.vue
  에러 트래킹 목록 컴포넌트
  에러 목록 표시 및 선택 기능
-->

<template>
  <q-scroll-area class="error-tracking-list-scroll-area">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-section q-pa-lg text-center">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-caption">에러 목록을 불러오는 중...</div>
    </div>

    <!-- 에러 목록 -->
    <q-list v-else separator>
      <q-item
        v-for="error in filteredErrors"
        :key="error.id"
        clickable
        :active="selectedError?.id === error.id"
        active-class="error-item-active"
        @click="handleErrorSelect(error)"
      >
        <q-item-section avatar>
          <q-icon :name="getErrorIcon(error.level)" :color="getErrorColor(error.level)" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="error-message">{{ error.message || '에러 메시지 없음' }}</q-item-label>
          <q-item-label caption class="error-meta">
            <span v-if="error.file">{{ getFileName(error.file) }}</span>
            <span v-if="error.line" class="q-ml-sm">라인 {{ error.line }}</span>
            <span v-if="error.count > 1" class="q-ml-sm text-negative">({{ error.count }}회)</span>
          </q-item-label>
          <q-item-label caption class="error-time">
            {{ formatTime(error.timestamp) }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-chip v-if="error.status === 'new'" color="negative" text-color="white" size="sm" label="신규" />
          <q-chip v-else-if="error.status === 'resolved'" color="positive" text-color="white" size="sm" label="해결" />
          <q-chip v-else-if="error.status === 'ignored'" color="grey" text-color="white" size="sm" label="무시" />
          <q-icon name="chevron_right" color="grey-7" class="q-ml-sm" />
        </q-item-section>
      </q-item>

      <!-- 에러가 없을 때 -->
      <div v-if="filteredErrors.length === 0" class="empty-section q-pa-lg text-center">
        <q-icon name="bug_report" size="48px" color="grey-7" class="q-mb-md" />
        <div class="text-body2 text-grey-7">
          <span v-if="searchQuery">검색 결과가 없습니다.</span>
          <span v-else>에러가 없습니다.</span>
        </div>
      </div>
    </q-list>
  </q-scroll-area>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  errors: {
    type: Array,
    default: () => [],
  },
  searchQuery: {
    type: String,
    default: '',
  },
  selectedError: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['error-selected'])

// 필터링된 에러 목록
const filteredErrors = computed(() => {
  if (!props.searchQuery) {
    return props.errors
  }

  const query = props.searchQuery.toLowerCase()
  return props.errors.filter((error) => {
    const message = (error.message || '').toLowerCase()
    const file = (error.file || '').toLowerCase()
    const stack = (error.stack || '').toLowerCase()
    return message.includes(query) || file.includes(query) || stack.includes(query)
  })
})

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

// 파일명 추출
function getFileName(filePath) {
  if (!filePath) return ''
  const parts = filePath.split('/')
  return parts[parts.length - 1]
}

// 시간 포맷팅
function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // 1분 이내
  if (diff < 60000) {
    return '방금 전'
  }

  // 1시간 이내
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}분 전`
  }

  // 24시간 이내
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}시간 전`
  }

  // 날짜 표시
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 에러 선택
function handleErrorSelect(error) {
  emit('error-selected', error)
}
</script>

<style lang="scss" scoped>
.error-tracking-list-scroll-area {
  height: 100%;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.error-item-active {
  background-color: var(--nexa-surface-hover);
}

.error-message {
  font-weight: 500;
  color: var(--nexa-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.error-meta {
  color: var(--nexa-text-secondary);
  font-size: 0.75rem;
}

.error-time {
  color: var(--nexa-text-secondary);
  font-size: 0.7rem;
  margin-top: 2px;
}
</style>

