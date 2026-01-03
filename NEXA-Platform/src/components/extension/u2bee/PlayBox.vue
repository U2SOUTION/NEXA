<template>
  <!-- Breadcrumb 및 액션 버튼 -->
  <div class="breadcrumb-section">
    <div class="breadcrumb">
      <span class="breadcrumb-item">:: U2BEE</span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item active">플레이박스</span>
    </div>
    <div class="action-buttons">
      <q-btn flat dense label="새 플레이박스" size="sm" />
      <q-btn flat dense label="정렬" size="sm" />
    </div>
  </div>

  <!-- 플레이박스 목록 -->
  <div class="list-section">
    <q-list>
      <q-item
        v-for="playbox in mockPlayboxes"
        :key="playbox.id"
        clickable
        v-ripple
        class="playbox-item"
        @click="selectPlaybox(playbox)"
      >
        <q-item-section avatar>
          <q-avatar class="playbox-avatar">
            <q-icon name="playlist_play" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label class="playbox-item-title">{{ playbox.name }}</q-item-label>
          <q-item-label class="playbox-item-meta">{{ playbox.itemCount }}개 항목 • {{ playbox.playMode }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-btn flat dense round icon="play_arrow" class="play-button" @click.stop="playPlaybox(playbox)" />
        </q-item-section>
      </q-item>
    </q-list>
  </div>

  <!-- 선택된 플레이박스 상세 -->
  <div v-if="selectedPlaybox" class="list-section">
    <div class="playbox-detail-header">
      <div class="playbox-detail-title">{{ selectedPlaybox.name }}</div>
      <div class="playbox-detail-description">{{ selectedPlaybox.description }}</div>
    </div>

    <q-list>
      <q-item
        v-for="item in selectedPlaybox.items"
        :key="item.id"
        clickable
        v-ripple
        class="playbox-item"
      >
        <q-item-section avatar>
          <q-avatar class="playbox-avatar">
            <q-icon name="play_circle" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label class="playbox-item-title">{{ item.title }}</q-item-label>
          <q-item-label class="playbox-item-meta">{{ item.author }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-btn flat dense round icon="delete" class="delete-button" @click.stop="removeItem(item.id)" />
        </q-item-section>
      </q-item>
    </q-list>
  </div>

  <!-- 빈 상태 -->
  <div v-if="mockPlayboxes.length === 0" class="empty-state">
    <q-icon name="playlist_add" class="empty-icon" />
    <div class="empty-title">플레이박스가 없습니다</div>
    <div class="empty-description">새 플레이박스를 생성하여 콘텐츠를 관리하세요</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 목업 데이터
const selectedPlaybox = ref(null)

const mockPlayboxes = ref([
  {
    id: 1,
    name: '예시 플레이박스 1 (목업 데이터)',
    description: '예시 설명',
    itemCount: 3,
    playMode: '순차 재생',
    items: [
      { id: 1, title: '예시 동영상 1', author: '예시 채널 1' },
      { id: 2, title: '예시 동영상 2', author: '예시 채널 2' },
      { id: 3, title: '예시 동영상 3', author: '예시 채널 3' },
    ],
  },
  {
    id: 2,
    name: '예시 플레이박스 2 (목업 데이터)',
    description: '예시 설명',
    itemCount: 2,
    playMode: '랜덤 재생',
    items: [
      { id: 4, title: '예시 동영상 4', author: '예시 채널 4' },
      { id: 5, title: '예시 동영상 5', author: '예시 채널 5' },
    ],
  },
])

function selectPlaybox(playbox) {
  selectedPlaybox.value = playbox
}

function playPlaybox(playbox) {
  console.log('Play playbox:', playbox)
}

function removeItem(itemId) {
  if (selectedPlaybox.value) {
    selectedPlaybox.value.items = selectedPlaybox.value.items.filter((item) => item.id !== itemId)
    selectedPlaybox.value.itemCount = selectedPlaybox.value.items.length
  }
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

.playbox-item {
  padding: 8px 0;
}

.playbox-avatar {
  background-color: var(--nexa-button-primary-bg);
  color: var(--nexa-button-primary-text);
}

.playbox-item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--nexa-text-primary);
}

.playbox-item-meta {
  font-size: 12px;
  color: var(--nexa-text-secondary);
}

.play-button {
  color: var(--nexa-button-primary-bg);
}

.delete-button {
  color: var(--nexa-error);
}

.playbox-detail-header {
  padding: 12px 0;
  border-bottom: 1px solid var(--nexa-border-color);
  margin-bottom: 8px;
}

.playbox-detail-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--nexa-text-primary);
  margin-bottom: 4px;
}

.playbox-detail-description {
  font-size: 13px;
  color: var(--nexa-text-secondary);
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
