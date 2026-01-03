<template>
  <!-- Breadcrumb 및 액션 버튼 -->
  <div class="breadcrumb-section">
    <div class="breadcrumb">
      <span class="breadcrumb-item">:: U2BEE</span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item">컨텐츠 정보</span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item">YOUTUBE</span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item active">컨텐츠 평가</span>
    </div>
    <div class="action-buttons">
      <q-btn flat dense label="자동번역중" size="sm" />
      <q-btn flat dense label="번역메모" size="sm" />
      <q-btn flat dense label="정보 갱신" size="sm" />
      <q-btn flat dense label="분류정렬" size="sm" />
      <q-btn flat dense label="오름차" size="sm" />
      <q-btn flat dense label="분류강조" size="sm" />
      <q-btn flat dense label="최근" size="sm" />
    </div>
  </div>

  <!-- 썸네일 + 제목/정보 -->
  <div class="rating-section">
    <div class="row items-start q-gutter-md">
      <!-- 썸네일 -->
      <div class="content-thumbnail">
        <svg viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg" class="thumbnail-svg">
          <rect width="120" height="90" fill="var(--nexa-surface)" stroke="var(--nexa-border-color)" stroke-width="1" rx="4" />
          <circle cx="60" cy="35" r="12" fill="var(--nexa-text-secondary)" opacity="0.3" />
          <path d="M 55 30 L 55 40 L 65 35 Z" fill="var(--nexa-text-secondary)" opacity="0.5" />
          <text x="60" y="65" text-anchor="middle" font-size="10" fill="var(--nexa-text-secondary)" opacity="0.5">Thumbnail</text>
        </svg>
      </div>

      <!-- 제목 및 정보 -->
      <div class="col content-info">
        <div class="content-title">{{ pageInfo.title || '페이지 정보를 기다리는 중...' }}</div>
        <div class="content-meta-line">
          <span v-if="pageInfo.url">
            <a :href="pageInfo.url" target="_blank" rel="noopener noreferrer">{{ pageInfo.url }}</a>
          </span>
          <span v-else class="text-grey-6">URL 정보 없음</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 카테고리 -->
  <div class="rating-section">
    <div class="row items-center q-gutter-xs">
      <q-btn flat dense round icon="add" size="sm" />
      <q-btn flat dense round icon="remove" size="sm" />
      <q-chip v-for="category in mockCategories" :key="category.id" :label="category.name" :class="category.selected ? 'category-chip-selected' : 'category-chip'" clickable @click="toggleCategory(category.id)" size="sm" />
    </div>
  </div>

  <!-- 평가 섹션 -->
  <div class="rating-section">
    <div class="row q-gutter-lg">
      <div class="col">
        <div class="row items-center q-gutter-sm">
          <div class="rating-label">호감 별점</div>
          <q-rating v-model="mockRating.likeRating" :max="5" size="24px" class="like-rating" />
        </div>
      </div>
      <div class="col">
        <div class="row items-center q-gutter-sm">
          <div class="rating-label">비호감 강도({{ mockRating.dislikeLevel }} Level)</div>
          <q-slider v-model="mockRating.dislikeLevel" :min="0" :max="10" :step="1" class="dislike-slider col" />
        </div>
      </div>
    </div>
  </div>

  <!-- 메모 섹션 -->
  <div class="rating-section">
    <div class="row items-center q-gutter-md">
      <q-btn flat dense label="MEMO" class="memo-button" />
      <q-input v-model="mockMemo" placeholder="메모를 입력하세요..." dense outlined class="col" />
    </div>
  </div>

  <!-- 저장 버튼 -->
  <div class="rating-actions">
    <q-btn label="저장" icon="save" class="save-button" @click="handleSave" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Props: Extension에서 전달받은 페이지 정보
defineProps({
  pageInfo: {
    type: Object,
    default: () => ({
      url: '',
      title: '',
      timestamp: null
    })
  }
})

// 목업 데이터
const mockRating = ref({
  likeRating: 4.5,
  dislikeLevel: 0,
})

const mockMemo = ref('')

const mockCategories = ref([
  { id: 1, name: '2D그래픽', selected: false },
  { id: 2, name: '3D프로그램', selected: false },
  { id: 3, name: '3D프린터', selected: false },
  { id: 4, name: '가요', selected: false },
  { id: 5, name: '건축', selected: false },
  { id: 6, name: '과학', selected: false },
  { id: 7, name: '구조공학', selected: false },
  { id: 8, name: '농업', selected: false },
  { id: 9, name: '땅땅땅', selected: false },
  { id: 10, name: '리사이클', selected: false },
  { id: 11, name: '매듭', selected: false },
  { id: 12, name: '메커니즘', selected: false },
  { id: 13, name: '목공', selected: false },
  { id: 14, name: '미술', selected: false },
  { id: 15, name: '블렌더', selected: false },
  { id: 16, name: '생활', selected: false },
  { id: 17, name: '석공', selected: false },
  { id: 18, name: '설비', selected: false },
  { id: 19, name: '스마트팜', selected: false },
  { id: 20, name: '시스템가구', selected: false },
  { id: 21, name: '아이디어', selected: false },
  { id: 22, name: '연주음악', selected: false },
  { id: 23, name: '영화음악', selected: false },
  { id: 24, name: '웹메모', selected: false },
  { id: 25, name: '유머', selected: false },
  { id: 26, name: '음악', selected: true },
  { id: 27, name: '인공지능', selected: false },
  { id: 28, name: '인테리어', selected: false },
  { id: 29, name: '자재', selected: false },
  { id: 30, name: '장비', selected: false },
  { id: 31, name: '전기', selected: false },
  { id: 32, name: '전자', selected: false },
  { id: 33, name: '정원', selected: false },
  { id: 34, name: '제작TIP', selected: false },
  { id: 35, name: '조경', selected: false },
  { id: 36, name: '주식', selected: false },
  { id: 37, name: '지그', selected: false },
  { id: 38, name: '지식', selected: false },
  { id: 39, name: '철공', selected: false },
  { id: 40, name: '캠핑카', selected: false },
  { id: 41, name: '컴퓨터', selected: false },
  { id: 42, name: '팝송', selected: true },
  { id: 43, name: '프로그래밍', selected: false },
  { id: 44, name: '하드웨어', selected: false },
  { id: 45, name: 'AI 코딩', selected: false },
  { id: 46, name: 'ART', selected: false },
  { id: 47, name: 'ESP32', selected: false },
  { id: 48, name: 'FRP', selected: false },
  { id: 49, name: 'IT', selected: false },
])

function handleSave() {
  // 저장 로직
  console.log('Rating saved:', mockRating.value, 'Memo:', mockMemo.value)
}

function toggleCategory(categoryId) {
  const category = mockCategories.value.find((c) => c.id === categoryId)
  if (category) {
    category.selected = !category.selected
  }
}
</script>

<style lang="scss" scoped>
.breadcrumb-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
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

.rating-section {
  margin-bottom: 10px; // 플렛폼 마다 조절 필요
  background: transparent;
  border: 0px solid var(--nexa-border-color); // 임시 확인용

  &:last-child {
    margin-bottom: 0;
  }
}

.content-thumbnail {
  flex-shrink: 0;
  width: 120px;
  height: 70px;
  overflow: hidden;
  border-radius: 4px;
}

.thumbnail-svg {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.content-info {
  min-width: 0;
}

.content-title {
  font-size: 22px;
  letter-spacing: -0.5px;
  line-height: 1.2;
  font-weight: 500;
  word-break: break-word;
  flex: 1;
  margin-bottom: 4px;
  color: var(--nexa-text-primary);
}

.content-meta-line {
  font-size: 12px;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  color: var(--nexa-text-secondary);
}

.content-meta-line > span,
.content-meta-line > a {
  flex-shrink: 0;
  white-space: nowrap;
}

.content-meta-line > a {
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-separator {
  color: var(--nexa-text-disabled);
  margin: 0 2px;
}

.content-meta-line > a {
  color: var(--nexa-text-secondary);
  text-decoration: none;

  &:hover {
    color: var(--nexa-text-primary);
    text-decoration: underline;
  }
}

.category-chip {
  background-color: var(--nexa-surface);
  color: var(--nexa-text-secondary);
}

.category-chip-selected {
  background-color: var(--nexa-button-primary-bg);
  color: var(--nexa-button-primary-text);
}

.like-rating :deep(.q-icon) {
  color: var(--nexa-warning);
}

.dislike-slider :deep(.q-slider__track) {
  background-color: var(--nexa-form-track-color) !important;
}

.dislike-slider :deep(.q-slider__selection) {
  background-color: var(--nexa-error) !important;
}

.dislike-slider :deep(.q-slider__thumb-shape path) {
  fill: var(--nexa-error) !important;
  stroke: var(--nexa-error) !important;
}

.dislike-slider :deep(.q-slider__text-container) {
  display: none;
}

.dislike-slider :deep(.q-slider__pin) {
  display: none;
}

.memo-button {
  color: var(--nexa-text-secondary);
}

.save-button {
  background-color: var(--nexa-success);
  color: var(--nexa-text-primary);
}

.rating-label {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--nexa-text-primary);
  white-space: nowrap;
  flex-shrink: 0;
}

.rating-actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>
