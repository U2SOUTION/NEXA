<template>
  <div class="u2bee-content-history">
    <div class="history-header q-mb-md">
      <div class="text-h6">히스토리</div>
      <div class="text-body2 text-grey-7">방문한 콘텐츠의 히스토리를 확인합니다</div>
    </div>

    <!-- 히스토리 목록 (목업) -->
    <q-list bordered separator>
      <q-item
        v-for="history in mockHistory"
        :key="history.id"
        clickable
        v-ripple
        @click="handleHistoryClick(history)"
      >
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white">
            <q-icon name="history" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ history.title }}</q-item-label>
          <q-item-label caption>
            {{ history.url }} • {{ formatDate(history.visitedAt) }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-btn flat dense round icon="open_in_new" @click.stop="openUrl(history.url)" />
        </q-item-section>
      </q-item>
    </q-list>

    <!-- 빈 상태 (목업) -->
    <q-card v-if="mockHistory.length === 0" class="q-mt-md">
      <q-card-section class="text-center q-pa-xl">
        <q-icon name="history" size="64px" color="grey-5" class="q-mb-md" />
        <div class="text-h6 text-grey-7">히스토리가 없습니다</div>
        <div class="text-body2 text-grey-6 q-mt-sm">콘텐츠를 방문하면 히스토리가 기록됩니다</div>
      </q-card-section>
    </q-card>
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
  // TODO: 히스토리 상세 보기
}

function openUrl(url) {
  window.open(url, '_blank')
}
</script>

<style lang="scss" scoped>
.u2bee-content-history {
  padding: 16px;

  .history-header {
    margin-bottom: 16px;
  }
}
</style>
