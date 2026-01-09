<!-- ErrorTrackingList.vue
  에러 트래킹 목록 컴포넌트
  에러 목록 표시 및 선택 기능
-->

<template>
  <div class="error-tracking-list-container">
    <!-- 상태별 탭 -->
    <q-tabs v-model="activeTab" dense class="error-status-tabs" align="left" scrollable @update:model-value="handleTabChange">
      <q-tab name="all" label="전체" :ripple="false" />
      <q-tab name="new" label="신규" :ripple="false" />
      <q-tab name="resolved" label="해결" :ripple="false" />
      <q-tab name="ignored" label="무시" :ripple="false" />
      <q-tab name="lint" label="Lint" :ripple="false" />
    </q-tabs>

    <q-scroll-area class="error-tracking-list-scroll-area">
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-section q-pa-lg text-center">
        <q-spinner color="primary" size="3em" />
        <div class="q-mt-md text-caption">에러 목록을 불러오는 중...</div>
      </div>

      <!-- 에러 목록 -->
      <q-list v-else separator>
        <q-item v-for="error in filteredErrors" :key="error.id" clickable :active="isErrorSelected(error)" active-class="error-item-active" @click="handleErrorSelect(error)">
          <q-item-section avatar>
            <q-icon :name="getErrorIcon(error)" :color="getErrorColor(error)" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="error-message">{{ error.message || '에러 메시지 없음' }}</q-item-label>
            <q-item-label caption class="error-meta">
              <span v-if="error.file">{{ getFileName(error.file) }}</span>
              <span v-if="error.line" class="q-ml-sm">라인 {{ error.line }}</span>
              <span class="q-ml-sm error-time-count">
                <span class="error-time">{{ formatTime(error.timestamp) }}</span>
                <span v-if="error.count" class="error-count">({{ error.count }}회)</span>
              </span>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getErrorIcon, getErrorColor } from 'src/system/utils/error-tracking/errorTypeClassifier.js'

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

const emit = defineEmits(['error-selected', 'tab-change'])

// 활성 탭
const activeTab = ref('all')

// 탭 변경 핸들러
function handleTabChange(tab) {
  activeTab.value = tab
  emit('tab-change', tab)
}

// 필터링된 에러 목록 (탭 필터 추가)
const filteredErrors = computed(() => {
  let result = [...props.errors]

  // 탭 필터 (상태별 또는 타입별)
  if (activeTab.value === 'lint') {
    result = result.filter((error) => error.type === 'lint')
  } else if (activeTab.value !== 'all') {
    result = result.filter((error) => {
      const status = error.status || 'new'
      return status === activeTab.value
    })
  }

  return result
})

// 에러 아이콘, 색상은 공통 유틸리티에서 import하여 사용

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

// 에러가 선택되었는지 확인
function isErrorSelected(error) {
  // selectedError가 없으면 false
  if (!props.selectedError) {
    return false
  }

  // error가 없으면 false
  if (!error) {
    return false
  }

  // 둘 다 ID가 있으면 ID로 비교
  if (props.selectedError.id && error.id) {
    return String(props.selectedError.id) === String(error.id)
  }

  // ID가 없으면 메시지, 레벨, 타임스탬프로 비교 (fallback)
  if (props.selectedError.message === error.message && props.selectedError.level === error.level) {
    // 타임스탬프가 있으면 1초 오차 허용
    if (props.selectedError.timestamp && error.timestamp) {
      const timeDiff = Math.abs(props.selectedError.timestamp - error.timestamp)
      return timeDiff < 1000
    }
    // 타임스탬프가 없으면 메시지와 레벨만으로 비교
    return true
  }

  return false
}

// 에러 선택
function handleErrorSelect(error) {
  emit('error-selected', error)
}
</script>

<style lang="scss" scoped>
.error-tracking-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.error-status-tabs {
  border-top: 1px solid var(--nexa-border-color);
  margin-top: 5px;
  border-bottom: 1px solid var(--nexa-border-color);
  background-color: var(--nexa-tab-bg);
  overflow-x: auto; // 좌우 스크롤 활성화
  overflow-y: hidden;

  // 각 탭이 좌우 공간에 꽉 차도록 설정
  :deep(.q-tabs__content) {
    display: flex;
    width: 100%;
  }

  // 스크롤바 숨김 (화살표만 표시)
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
}

.error-tracking-list-scroll-area {
  flex: 1;
  height: 0; /* flex를 위해 필요 */
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

// 일반 호버 상태
:deep(.q-item:hover:not(.error-item-active)) {
  background-color: var(--nexa-surface-hover) !important;
}

// Active 상태
.error-item-active {
  background-color: var(--nexa-secondary) !important;
}

// Active 상태일 때 호버 (더 강조)
:deep(.q-item.error-item-active:hover) {
  background-color: var(--nexa-background-darker) !important;
  opacity: 0.9;
}

// 리스트 아이템 패딩 줄이기
:deep(.q-item) {
  padding-top: 0px;
  padding-bottom: 0px;
  min-height: auto;
}

// 아이콘과 라벨 간격 줄이기
.q-item__section--avatar {
  min-width: 32px;
  padding-right: 8px;
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

.error-time-count {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.error-time {
  color: var(--nexa-text-primary);
  font-size: 0.75rem;
  font-weight: 500;
}

.error-count {
  color: var(--nexa-text-secondary);
  font-size: 0.75rem;
}
</style>
