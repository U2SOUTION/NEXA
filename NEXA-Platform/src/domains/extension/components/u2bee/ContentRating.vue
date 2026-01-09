<template>
  <!-- Breadcrumb 및 액션 버튼 -->
  <div class="breadcrumb-section">
    <div class="breadcrumb">
      <span class="breadcrumb-item">:: U2BEE</span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item">컨텐츠 정보</span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item">{{ getPageTypeLabel() }}</span>
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
        <img v-if="pageInfo.thumbnail" :src="pageInfo.thumbnail" alt="Thumbnail" class="thumbnail-image" @error="handleThumbnailError" />
        <svg v-else viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg" class="thumbnail-svg">
          <rect width="120" height="90" fill="var(--nexa-surface)" stroke="var(--nexa-border-color)" stroke-width="1" rx="4" />
          <circle cx="60" cy="35" r="12" fill="var(--nexa-text-secondary)" opacity="0.3" />
          <path d="M 55 30 L 55 40 L 65 35 Z" fill="var(--nexa-text-secondary)" opacity="0.5" />
          <text x="60" y="60" text-anchor="middle" font-size="10" fill="var(--nexa-text-secondary)" opacity="0.5">Thumbnail</text>
        </svg>
      </div>

      <!-- 제목 및 정보 -->
      <div class="col content-info">
        <!-- 타이틀 (가장 먼저) -->
        <div class="content-title">{{ pageInfo.title || '페이지 정보를 기다리는 중...' }}</div>

        <!-- 한 줄 메타 정보: 타입, 채널/게시자, 조회수, 재생시간, 게시일, URL -->
        <div class="content-meta-single-line">
          <!-- 타입 배지 -->
          <q-chip :color="getPageTypeColor()" text-color="white" dense size="sm" class="type-chip">
            <q-icon :name="getPageTypeIcon()" size="12px" class="q-mr-xs" />
            {{ getPageTypeLabel() }}
          </q-chip>

          <!-- 구분자 (타입 배지 다음) -->
          <span v-if="pageInfo.channelName || pageInfo.publisher || pageInfo.viewCount || pageInfo.duration || (pageInfo.publishedAt && pageInfo.pageType !== 'SHORTS') || pageInfo.url" class="meta-separator">•</span>

          <!-- 채널명 (YouTube/Shorts) -->
          <span v-if="pageInfo.channelName" class="meta-item">
            {{ pageInfo.channelName }}
          </span>

          <!-- 게시자 (Website) -->
          <span v-if="pageInfo.publisher && !pageInfo.channelName" class="meta-item">
            {{ pageInfo.publisher }}
          </span>

          <!-- 구분자 (채널/게시자 다음 - 다음 항목이 있을 때만) -->
          <span v-if="(pageInfo.channelName || pageInfo.publisher) && (pageInfo.viewCount || pageInfo.duration || (pageInfo.publishedAt && pageInfo.pageType !== 'SHORTS') || pageInfo.url)" class="meta-separator">•</span>

          <!-- 조회수 (YouTube/Shorts) -->
          <span v-if="pageInfo.viewCount" class="meta-item"> {{ formatNumber(pageInfo.viewCount) }}회 </span>

          <!-- 재생 시간 (YouTube/Shorts) -->
          <span v-if="pageInfo.duration" class="meta-item">
            {{ formatDuration(pageInfo.duration) }}
          </span>

          <!-- 게시일 (쇼츠 제외) -->
          <span v-if="pageInfo.publishedAt && pageInfo.pageType !== 'SHORTS'" class="meta-item">
            {{ formatDate(pageInfo.publishedAt) }}
          </span>

          <!-- 구분자 (조회수/재생시간/게시일 다음 - URL이 있을 때만) -->
          <span v-if="(pageInfo.viewCount || pageInfo.duration || (pageInfo.publishedAt && pageInfo.pageType !== 'SHORTS')) && pageInfo.url" class="meta-separator">•</span>

          <!-- URL (작은 스타일, 잘려도 됨) -->
          <span v-if="pageInfo.url" class="meta-item content-url-text">{{ pageInfo.url }}</span>
          <span v-else class="meta-item text-grey-6">URL 정보 없음</span>
        </div>

        <!-- 설명 -->
        <div v-if="pageInfo.description" class="content-description q-mt-sm">
          {{ truncateText(pageInfo.description, 200) }}
        </div>
      </div>
    </div>
  </div>

  <!-- 카테고리 -->
  <div class="rating-section category-section">
    <div class="row items-center q-gutter-xs">
      <q-btn flat dense round icon="add" size="sm" />
      <q-btn flat dense round icon="remove" size="sm" />
      <q-btn v-for="category in mockCategories" :key="category.id" :label="category.name" :class="category.selected ? 'category-chip-selected' : 'category-chip'" clickable @click="toggleCategory(category.id)" size="sm" />
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
const props = defineProps({
  pageInfo: {
    type: Object,
    default: () => ({
      url: '',
      title: '',
      timestamp: null,
      pageType: null,
      videoId: null,
      channelName: null,
      channelId: null,
      thumbnail: null,
      description: null,
      viewCount: null,
      likeCount: null,
      publishedAt: null,
      duration: null,
      publisher: null,
      image: null,
      author: null,
    }),
  },
})

// 썸네일 로드 실패 처리
function handleThumbnailError(event) {
  event.target.style.display = 'none'
}

// 숫자 포맷팅 (예: 1234567 -> 123.5만)
function formatNumber(num) {
  if (!num) return ''
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '억'
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '만'
  }
  return num.toLocaleString()
}

// ISO 8601 duration 포맷팅 (예: PT10M30S -> 10:30)
function formatDuration(duration) {
  if (!duration) return ''
  try {
    // PT10M30S 형식 파싱
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return duration

    const hours = parseInt(match[1] || 0)
    const minutes = parseInt(match[2] || 0)
    const seconds = parseInt(match[3] || 0)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  } catch {
    return duration
  }
}

// 날짜 포맷팅
function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return dateString
  }
}

// 텍스트 자르기
function truncateText(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 페이지 타입 레이블 반환
function getPageTypeLabel() {
  const pageType = props.pageInfo?.pageType
  if (pageType === 'YOUTUBE') return '유튜브'
  if (pageType === 'SHORTS') return '쇼츠'
  if (pageType === 'WEBSITE') return '일반'
  return '알 수 없음'
}

// 페이지 타입 아이콘 반환
function getPageTypeIcon() {
  const pageType = props.pageInfo?.pageType
  if (pageType === 'YOUTUBE') return 'play_circle'
  if (pageType === 'SHORTS') return 'video_library'
  if (pageType === 'WEBSITE') return 'language'
  return 'help'
}

// 페이지 타입 색상 반환
function getPageTypeColor() {
  const pageType = props.pageInfo?.pageType
  if (pageType === 'YOUTUBE') return 'red'
  if (pageType === 'SHORTS') return 'purple'
  if (pageType === 'WEBSITE') return 'blue-grey'
  return 'grey'
}

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

.thumbnail-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  background: var(--nexa-surface);
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

.category-section {
  margin-top: 10px;
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
  padding: 6px;
}
</style>
