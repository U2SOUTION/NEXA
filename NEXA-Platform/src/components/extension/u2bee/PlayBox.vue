<template>
  <div class="u2bee-playbox">
    <div class="playbox-header q-mb-md">
      <div class="text-h6">플레이박스</div>
      <div class="text-body2 text-grey-7">플레이리스트를 생성하고 관리합니다</div>
    </div>

    <!-- 플레이박스 목록 (목업) -->
    <q-list bordered separator class="q-mb-md">
      <q-item
        v-for="playbox in mockPlayboxes"
        :key="playbox.id"
        clickable
        v-ripple
        @click="selectPlaybox(playbox)"
      >
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white">
            <q-icon name="playlist_play" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ playbox.name }}</q-item-label>
          <q-item-label caption>{{ playbox.itemCount }}개 항목 • {{ playbox.playMode }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-btn flat dense round icon="play_arrow" @click.stop="playPlaybox(playbox)" />
        </q-item-section>
      </q-item>
    </q-list>

    <!-- 새 플레이박스 생성 버튼 -->
    <q-btn color="primary" icon="add" label="새 플레이박스" @click="createPlaybox" class="q-mb-md" />

    <!-- 선택된 플레이박스 상세 (목업) -->
    <q-card v-if="selectedPlaybox" class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">{{ selectedPlaybox.name }}</div>
        <div class="text-body2 text-grey-7 q-mb-md">{{ selectedPlaybox.description }}</div>

        <!-- 플레이박스 아이템 목록 -->
        <q-list bordered separator>
          <q-item
            v-for="item in selectedPlaybox.items"
            :key="item.id"
            clickable
            v-ripple
          >
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white">
                <q-icon name="play_circle" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ item.title }}</q-item-label>
              <q-item-label caption>{{ item.author }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-btn flat dense round icon="delete" @click.stop="removeItem(item.id)" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- 빈 상태 (목업) -->
    <q-card v-if="mockPlayboxes.length === 0" class="q-mt-md">
      <q-card-section class="text-center q-pa-xl">
        <q-icon name="playlist_add" size="64px" color="grey-5" class="q-mb-md" />
        <div class="text-h6 text-grey-7">플레이박스가 없습니다</div>
        <div class="text-body2 text-grey-6 q-mt-sm">새 플레이박스를 생성하여 콘텐츠를 관리하세요</div>
      </q-card-section>
    </q-card>
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
  // TODO: 플레이박스 재생
}

function createPlaybox() {
  console.log('Create playbox')
  // TODO: 플레이박스 생성
}

function removeItem(itemId) {
  if (selectedPlaybox.value) {
    selectedPlaybox.value.items = selectedPlaybox.value.items.filter((item) => item.id !== itemId)
    selectedPlaybox.value.itemCount = selectedPlaybox.value.items.length
  }
}
</script>

<style lang="scss" scoped>
.u2bee-playbox {
  padding: 16px;

  .playbox-header {
    margin-bottom: 16px;
  }
}
</style>
