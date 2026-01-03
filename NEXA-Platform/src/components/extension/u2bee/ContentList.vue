<template>
  <div class="u2bee-content-list">
    <div class="list-header q-mb-md">
      <div class="text-h6">콘텐츠 목록</div>
      <div class="text-body2 text-grey-7">저장된 콘텐츠를 검색하고 관리합니다</div>
    </div>

    <!-- 검색 및 필터 (목업) -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-gutter-md">
          <div class="col">
            <q-input v-model="searchQuery" placeholder="검색..." dense outlined>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <q-select v-model="selectedPlatform" :options="platformOptions" label="플랫폼" dense outlined style="min-width: 120px" />
          <q-select v-model="selectedCategory" :options="categoryOptions" label="카테고리" dense outlined style="min-width: 120px" />
        </div>
      </q-card-section>
    </q-card>

    <!-- 콘텐츠 목록 (목업) -->
    <q-list bordered separator>
      <q-item
        v-for="content in mockContents"
        :key="content.id"
        clickable
        v-ripple
        @click="handleContentClick(content)"
      >
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white">
            <q-icon name="play_circle" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ content.title }}</q-item-label>
          <q-item-label caption>{{ content.author }} • {{ content.platform }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="row q-gutter-xs">
            <q-chip
              v-for="category in content.categories"
              :key="category"
              :label="category"
              size="sm"
              color="primary"
              text-color="white"
            />
          </div>
        </q-item-section>

        <q-item-section side>
          <q-icon
            :name="content.rating === 'like' ? 'thumb_up' : content.rating === 'dislike' ? 'thumb_down' : ''"
            :color="content.rating === 'like' ? 'positive' : content.rating === 'dislike' ? 'negative' : ''"
          />
        </q-item-section>
      </q-item>
    </q-list>

    <!-- 빈 상태 (목업) -->
    <q-card v-if="mockContents.length === 0" class="q-mt-md">
      <q-card-section class="text-center q-pa-xl">
        <q-icon name="inbox" size="64px" color="grey-5" class="q-mb-md" />
        <div class="text-h6 text-grey-7">콘텐츠가 없습니다</div>
        <div class="text-body2 text-grey-6 q-mt-sm">콘텐츠를 평가하여 목록에 추가하세요</div>
      </q-card-section>
    </q-card>
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
  // TODO: 콘텐츠 상세 보기
}
</script>

<style lang="scss" scoped>
.u2bee-content-list {
  padding: 16px;

  .list-header {
    margin-bottom: 16px;
  }
}
</style>
