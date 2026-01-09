<template>
  <!-- Breadcrumb 및 액션 버튼 -->
  <div class="breadcrumb-section">
    <div class="breadcrumb">
      <span class="breadcrumb-item">:: U2BEE</span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item active">히스토리</span>
    </div>
    <div class="action-buttons">
      <q-btn flat dense label="정렬" size="sm" />
      <q-btn flat dense label="필터" size="sm" />
    </div>
  </div>

  <!-- 히스토리 목록 -->
  <div class="list-section">
    <q-list>
      <q-item
        v-for="history in mockHistory"
        :key="history.id"
        clickable
        v-ripple
        class="history-item"
        @click="handleHistoryClick(history)"
      >
        <q-item-section avatar>
          <q-avatar class="history-avatar">
            <q-icon name="history" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label class="history-item-title">{{ history.title }}</q-item-label>
          <q-item-label class="history-item-meta">
            {{ history.url }} • {{ formatDate(history.visitedAt) }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-btn flat dense round icon="open_in_new" class="open-button" @click.stop="openUrl(history.url)" />
        </q-item-section>
      </q-item>
    </q-list>
  </div>

  <!-- 빈 상태 -->
  <div v-if="mockHistory.length === 0" class="empty-state">
    <q-icon name="history" class="empty-icon" />
    <div class="empty-title">히스토리가 없습니다</div>
    <div class="empty-description">콘텐츠를 방문하면 히스토리가 기록됩니다</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 목업 데이터
const mockHistory = ref([
  {
    id: 1,
    title: '예시 동영상 제목 1 (목업 데이터)',
    url: 'https://youtube.com/watch?v=example1',
    visitedAt: new Date(Date.now() - 3600000), // 1시간 전
  },
  {
    id: 2,
    title: '예시 동영상 제목 2 (목업 데이터)',
    url: 'https://youtube.com/watch?v=example2',
    visitedAt: new Date(Date.now() - 7200000), // 2시간 전
  },
  {
    id: 3,
    title: '예시 동영상 제목 3 (목업 데이터)',
    url: 'https://youtube.com/watch?v=example3',
    visitedAt: new Date(Date.now() - 86400000), // 1일 전
  },
])

function formatDate(date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (hours < 1) {
    return '방금 전'
  } else if (hours < 24) {
    return `${hours}시간 전`
  } else if (days < 7) {
    return `${days}일 전`
  } else {
    return date.toLocaleDateString('ko-KR')
  }
}

function handleHistoryClick(history) {
  console.log('History clicked:', history)
}

function openUrl(url) {
  window.open(url, '_blank')
}
</script>

<style lang="scss" scoped>
.breadcrumb-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.breadcrumb-item {
  color: var(--nexa-text-secondary);

  &.active {
    color: var(--nexa-text-primary);
    font-weight: 600;
  }
}

.breadcrumb-separator {
  color: var(--nexa-text-disabled);
}

.action-buttons {
  color: var(--nexa-text-secondary);
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.list-section {
  margin-bottom: 5px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--nexa-border-color); // 임시 확인용

  &:last-child {
    margin-bottom: 0;
  }
}

.history-item {
  padding: 8px 0;
}

.history-avatar {
  background-color: var(--nexa-button-primary-bg);
  color: var(--nexa-button-primary-text);
}

.history-item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--nexa-text-primary);
}

.history-item-meta {
  font-size: 12px;
  color: var(--nexa-text-secondary);
}

.open-button {
  color: var(--nexa-button-primary-bg);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: var(--nexa-text-disabled);
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--nexa-text-secondary);
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: var(--nexa-text-disabled);
}
</style>
