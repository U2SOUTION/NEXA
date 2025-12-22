<!-- HistoryModal.vue
  변경 이력 모달
-->
<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent>
    <q-card class="history-dialog-card">
      <q-card-section class="history-section">
        <div class="history-title">
          <span class="history-title-en">CHANGE HISTORY</span>
          <span class="history-title-ko">변경 이력</span>
        </div>

        <!-- 항목 정보 -->
        <div v-if="target" class="q-mt-md">
          <div class="history-item-info">
            <div class="history-item-name">{{ target.name || '-' }}</div>
            <div v-if="target.category" class="history-item-category">
              {{ target.category }}
            </div>
          </div>

          <!-- 생성 정보 -->
          <div class="history-timeline q-mt-lg">
            <div class="history-timeline-item">
              <div class="history-timeline-icon">
                <q-icon name="add_circle" size="24px" color="primary" />
              </div>
              <div class="history-timeline-content">
                <div class="history-timeline-label">생성</div>
                <div class="history-timeline-date">
                  {{ formatDate(target.created_at) }}
                </div>
                <div class="history-timeline-relative">
                  {{ getRelativeTime(target.created_at) }}
                </div>
              </div>
            </div>

            <!-- 수정 정보 -->
            <div
              v-if="target.updated_at && target.updated_at !== target.created_at"
              class="history-timeline-item"
            >
              <div class="history-timeline-icon">
                <q-icon name="edit" size="24px" color="primary" />
              </div>
              <div class="history-timeline-content">
                <div class="history-timeline-label">마지막 수정</div>
                <div class="history-timeline-date">
                  {{ formatDate(target.updated_at) }}
                </div>
                <div class="history-timeline-relative">
                  {{ getRelativeTime(target.updated_at) }}
                </div>
              </div>
            </div>

            <!-- 생성과 수정이 같은 경우 -->
            <div
              v-if="!target.updated_at || target.updated_at === target.created_at"
              class="history-timeline-item"
            >
              <div class="history-timeline-icon">
                <q-icon name="info" size="24px" color="grey-6" />
              </div>
              <div class="history-timeline-content">
                <div class="history-timeline-label">수정 이력 없음</div>
                <div class="history-timeline-note">생성 이후 변경된 내용이 없습니다.</div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="center" class="history-actions">
        <q-btn
          flat
          label="닫기"
          v-close-popup
          class="history-close-btn"
          @click="$emit('close')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  target: {
    type: Object,
    default: null,
  },
})

defineEmits(['update:modelValue', 'close'])

// 날짜 포맷팅 함수 (한국어 형식)
function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}:${seconds}`
}

// 상대 시간 계산 함수
function getRelativeTime(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSeconds < 60) {
    return '방금 전'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}분 전`
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`
  } else if (diffDays < 30) {
    return `${diffDays}일 전`
  } else if (diffMonths < 12) {
    return `${diffMonths}개월 전`
  } else {
    return `${diffYears}년 전`
  }
}
</script>

<style lang="scss" scoped>
.history-dialog-card {
  min-width: 600px;
  max-width: 90vw;
  width: 700px;
  border-radius: 8px;
  border: 2px solid var(--q-primary);

  @media (max-width: 600px) {
    min-width: 95vw;
    width: 95vw;
    max-width: 95vw;
  }
}

.history-section {
  padding: 100px;

  @media (max-width: 600px) {
    padding: 50px;
  }
}

.history-title {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 16px;
}

.history-title-en {
  font-size: 3.5em;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 1.2;
  color: var(--q-primary);
}

.history-title-ko {
  font-size: 24px;
  font-weight: 600;
  color: var(--q-primary);
}

.history-item-info {
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid var(--nexa-border-color);
}

.history-item-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--nexa-text-primary);
  margin-bottom: 8px;
}

.history-item-category {
  font-size: 14px;
  color: var(--nexa-text-primary);
  opacity: 0.7;
}

.history-timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-left: 8px;
}

.history-timeline-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.history-timeline-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.history-timeline-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-timeline-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--nexa-text-primary);
}

.history-timeline-date {
  font-size: 15px;
  color: var(--nexa-text-primary);
  opacity: 0.9;
}

.history-timeline-relative {
  font-size: 14px;
  color: var(--q-primary);
  opacity: 0.8;
}

.history-timeline-note {
  font-size: 14px;
  color: var(--nexa-text-primary);
  opacity: 0.6;
  font-style: italic;
}

.history-actions {
  padding: 0 100px 100px 100px;
  gap: 16px;

  @media (max-width: 600px) {
    padding: 0 50px 50px 50px;
  }
}

.history-close-btn {
  min-width: 120px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 500;
  border: 1px solid var(--q-primary);
  background-color: transparent;
  color: var(--q-primary);

  :deep(.q-btn__content) {
    color: var(--q-primary);
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}
</style>

