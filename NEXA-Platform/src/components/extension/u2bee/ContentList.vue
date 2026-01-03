<template>
  <!-- Breadcrumb 및 액션 버튼 -->
  <div class="breadcrumb-section">
    <div class="breadcrumb">
      <span class="breadcrumb-item">:: U2BEE</span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item active">저장목록</span>
    </div>
    <div class="action-buttons">
      <q-btn flat dense label="검색" size="sm" />
      <q-btn flat dense label="필터" size="sm" />
      <q-btn flat dense label="정렬" size="sm" />
    </div>
  </div>

  <!-- 검색 및 필터 -->
  <div class="list-section">
    <div class="row q-gutter-sm">
      <q-input v-model="searchQuery" placeholder="검색..." dense outlined class="col">
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-select v-model="selectedPlatform" :options="platformOptions" label="플랫폼" dense outlined class="platform-select" />
      <q-select v-model="selectedCategory" :options="categoryOptions" label="카테고리" dense outlined class="category-select" />
    </div>
  </div>

  <!-- 콘텐츠 목록 -->
  <div class="list-section">
    <q-list>
      <q-item
        v-for="content in mockContents"
        :key="content.id"
        clickable
        v-ripple
        class="content-item"
        @click="handleContentClick(content)"
      >
        <q-item-section avatar>
          <q-avatar class="content-avatar">
            <q-icon name="play_circle" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label class="content-item-title">{{ content.title }}</q-item-label>
          <q-item-label class="content-item-meta">{{ content.author }} • {{ content.platform }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="row q-gutter-xs">
            <q-chip
              v-for="category in content.categories"
              :key="category"
              :label="category"
              size="sm"
              class="content-category-chip"
            />
          </div>
        </q-item-section>

        <q-item-section side>
          <q-icon
            :name="content.rating === 'like' ? 'thumb_up' : content.rating === 'dislike' ? 'thumb_down' : ''"
            class="content-rating-icon"
            :class="content.rating === 'like' ? 'rating-like' : content.rating === 'dislike' ? 'rating-dislike' : ''"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>

  <!-- 빈 상태 -->
  <div v-if="mockContents.length === 0" class="empty-state">
    <q-icon name="inbox" class="empty-icon" />
    <div class="empty-title">콘텐츠가 없습니다</div>
    <div class="empty-description">콘텐츠를 평가하여 목록에 추가하세요</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 목업 데이터
const searchQuery = ref('')
const selectedPlatform = ref('all')
const selectedCategory = ref('all')

const platformOptions = ['all', 'YouTube', 'TikTok', 'Instagram']
const categoryOptions = ['all', '교육', '엔터테인먼트', '음악', '기술']

const mockContents = ref([
  {
    id: 1,
    title: '예시 동영상 제목 1 (목업 데이터)',
    author: '예시 채널 1',
    platform: 'YouTube',
    rating: 'like',
    categories: ['교육', '기술'],
  },
  {
    id: 2,
    title: '예시 동영상 제목 2 (목업 데이터)',
    author: '예시 채널 2',
    platform: 'YouTube',
    rating: 'dislike',
    categories: ['엔터테인먼트'],
  },
  {
    id: 3,
    title: '예시 동영상 제목 3 (목업 데이터)',
    author: '예시 채널 3',
    platform: 'TikTok',
    rating: 'like',
    categories: ['음악'],
  },
])

function handleContentClick(content) {
  console.log('Content clicked:', content)
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

.platform-select,
.category-select {
  min-width: 120px;
  flex-shrink: 0;
}

.content-item {
  padding: 8px 0;
}

.content-avatar {
  background-color: var(--nexa-button-primary-bg);
  color: var(--nexa-button-primary-text);
}

.content-item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--nexa-text-primary);
}

.content-item-meta {
  font-size: 12px;
  color: var(--nexa-text-secondary);
}

.content-category-chip {
  background-color: var(--nexa-surface);
  color: var(--nexa-text-primary);
}

.content-rating-icon {
  font-size: 20px;
}

.rating-like {
  color: var(--nexa-success);
}

.rating-dislike {
  color: var(--nexa-error);
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
