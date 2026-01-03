<template>
  <div class="u2bee-content-rating">
    <div class="rating-header q-mb-md">
      <div class="text-h6">콘텐츠 평가</div>
      <div class="text-body2 text-grey-7">현재 페이지의 콘텐츠를 평가하고 관리합니다</div>
    </div>

    <!-- 플랫폼 정보 (목업) -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row items-center q-gutter-md">
          <q-avatar size="48px" color="primary" text-color="white">
            <q-icon name="play_circle" size="32px" />
          </q-avatar>
          <div class="col">
            <div class="text-h6">YouTube Video</div>
            <div class="text-body2 text-grey-7">플랫폼: YouTube</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 콘텐츠 정보 (목업) -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">콘텐츠 정보</div>
        <div class="text-body2 q-mb-xs">
          <strong>제목:</strong> 예시 동영상 제목 (목업 데이터)
        </div>
        <div class="text-body2 q-mb-xs">
          <strong>작성자:</strong> 예시 채널명 (목업 데이터)
        </div>
        <div class="text-body2">
          <strong>URL:</strong>
          <a href="#" class="text-primary">https://youtube.com/watch?v=example</a>
        </div>
      </q-card-section>
    </q-card>

    <!-- 평가 버튼 -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">평가</div>
        <div class="row q-gutter-md">
          <q-btn
            color="positive"
            icon="thumb_up"
            label="좋아요"
            @click="handleRating('like')"
            :class="{ 'rating-active': mockRating === 'like' }"
          />
          <q-btn
            color="negative"
            icon="thumb_down"
            label="싫어요"
            @click="handleRating('dislike')"
            :class="{ 'rating-active': mockRating === 'dislike' }"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- 카테고리 선택 (목업) -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">카테고리</div>
        <div class="row q-gutter-sm">
          <q-chip
            v-for="category in mockCategories"
            :key="category.id"
            :label="category.name"
            :color="category.selected ? 'primary' : 'grey'"
            :text-color="category.selected ? 'white' : 'dark'"
            clickable
            @click="toggleCategory(category.id)"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- 통계 (목업) -->
    <q-card>
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">평가 통계</div>
        <div class="row q-gutter-md">
          <div class="col-6">
            <div class="text-body2 text-grey-7">좋아요</div>
            <div class="text-h6">{{ mockStats.likes }}</div>
          </div>
          <div class="col-6">
            <div class="text-body2 text-grey-7">싫어요</div>
            <div class="text-h6">{{ mockStats.dislikes }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 목업 데이터
const mockRating = ref(null)
const mockCategories = ref([
  { id: 1, name: '교육', selected: false },
  { id: 2, name: '엔터테인먼트', selected: false },
  { id: 3, name: '음악', selected: false },
  { id: 4, name: '기술', selected: false },
])

const mockStats = ref({
  likes: 0,
  dislikes: 0,
})

function handleRating(rating) {
  mockRating.value = rating
  // 목업 데이터 업데이트
  if (rating === 'like') {
    mockStats.value.likes++
  } else if (rating === 'dislike') {
    mockStats.value.dislikes++
  }
}

function toggleCategory(categoryId) {
  const category = mockCategories.value.find((c) => c.id === categoryId)
  if (category) {
    category.selected = !category.selected
  }
}
</script>

<style lang="scss" scoped>
.u2bee-content-rating {
  padding: 16px;

  .rating-header {
    margin-bottom: 16px;
  }

  .rating-active {
    opacity: 1;
    font-weight: bold;
  }
}
</style>
