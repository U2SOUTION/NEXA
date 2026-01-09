<!-- FavoriteModal.vue
  즐겨찾기 확인 모달
-->
<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent>
    <q-card class="favorite-dialog-card">
      <q-card-section class="favorite-section">
        <div class="favorite-title">
          <span class="favorite-title-en">FAVORITE</span>
          <span class="favorite-title-ko">즐겨찾기</span>
        </div>

        <!-- 단일 항목 -->
        <div v-if="targets.length <= 1" class="q-mt-md">
          <div class="favorite-message">
            <q-icon name="star" size="35px" color="primary" class="q-mr-sm" />
            <span v-if="targets[0]">
              <strong>"{{ targets[0].name }}"</strong> 부품 분류를 즐겨찾기에
              <strong>{{ type === 'add' ? '추가' : '제거' }}</strong
              >하시겠습니까?
            </span>
          </div>

          <!-- 상세 정보 -->
          <div v-if="targets[0]" class="favorite-details q-mt-lg">
            <div class="detail-item">
              <span class="detail-label">카테고리:</span>
              <span class="detail-value">{{ targets[0].category || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">클래스명:</span>
              <span class="detail-value">{{ targets[0].name || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">현재 상태:</span>
              <span class="detail-value">
                {{ targets[0].is_favorite ? '즐겨찾기 추가됨' : '즐겨찾기 없음' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 복수 항목 -->
        <div v-else class="q-mt-md">
          <div class="favorite-message">
            <q-icon name="star" size="35px" color="primary" class="q-mr-sm" />
            정말로 <strong>{{ targets.length }}</strong
            >개의 아래 부품 분류를 즐겨찾기에
            <strong>{{ type === 'add' ? '추가' : '제거' }}</strong
            >하시겠습니까?
          </div>

          <q-markup-table dense flat bordered class="q-mt-sm">
            <thead>
              <tr>
                <th class="text-left">No.</th>
                <th class="text-left">카테고리</th>
                <th class="text-left">클래스명</th>
                <th class="text-left">현재 상태</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in targets" :key="item.id">
                <td class="text-left">{{ index + 1 }}</td>
                <td class="text-left">{{ item.category || '-' }}</td>
                <td class="text-left">{{ item.name || '-' }}</td>
                <td class="text-left">
                  {{ item.is_favorite ? '즐겨찾기 추가됨' : '즐겨찾기 없음' }}
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>

        <!-- 진행 상태 -->
        <div v-if="isProcessing" class="favorite-progress q-mt-lg">
          <q-linear-progress indeterminate color="primary" class="q-mt-sm" />
          <div class="favorite-progress-text q-mt-sm">
            즐겨찾기 {{ type === 'add' ? '추가' : '제거' }} 진행 중...
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="center" class="favorite-actions">
        <q-btn
          flat
          label="취소"
          v-close-popup
          class="favorite-cancel-btn"
          :disable="isProcessing"
          @click="$emit('close')"
        />
        <q-btn
          :label="buttonLabel"
          @click="$emit('confirm')"
          class="favorite-confirm-btn"
          :disable="isProcessing"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  targets: {
    type: Array,
    default: () => [],
  },
  type: {
    type: String,
    default: 'add', // 'add' | 'remove'
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue', 'confirm', 'close'])

const buttonLabel = computed(() => {
  if (props.isProcessing) {
    return '처리 중...'
  }
  return props.type === 'add' ? '즐겨찾기 추가' : '즐겨찾기 제거'
})
</script>

<style lang="scss" scoped>
.favorite-dialog-card {
  min-width: 600px;
  max-width: 90vw;
  width: 700px;
  border-radius: 8px;
  border: 2px solid var(--q-primary);

  :deep(.q-markup-table thead th) {
    background-color: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.505);
    font-weight: 500;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  :deep(.q-markup-table tbody td) {
    background-color: transparent;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 600px) {
    min-width: 95vw;
    width: 95vw;
    max-width: 95vw;
  }
}

.favorite-section {
  padding: 100px;

  @media (max-width: 600px) {
    padding: 50px;
  }
}

.favorite-title {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 16px;
}

.favorite-title-en {
  font-size: 3.5em;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 1.2;
  color: var(--q-primary);
}

.favorite-title-ko {
  font-size: 24px;
  font-weight: 600;
  color: var(--q-primary);
}

.favorite-message {
  font-size: 18px;
  line-height: 1.6;
  color: var(--nexa-text-primary);
}

.favorite-actions {
  padding: 0 100px 100px 100px;
  gap: 16px;

  @media (max-width: 600px) {
    padding: 0 50px 50px 50px;
  }
}

.favorite-cancel-btn,
.favorite-confirm-btn {
  min-width: 120px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 500;
  border: 1px solid var(--q-primary);
}

.favorite-cancel-btn {
  color: var(--q-primary);
}

.favorite-cancel-btn:hover {
  background-color: var(--q-primary);
  color: white;
  border-color: var(--q-primary);
}

.favorite-confirm-btn {
  background-color: var(--q-primary);

  :deep(.q-btn__content),
  :deep(.q-btn__content span) {
    color: white;
  }

  color: white;
}

.favorite-confirm-btn:hover {
  background-color: var(--q-primary);
  opacity: 0.9;
  border-color: var(--q-primary);

  :deep(.q-btn__content),
  :deep(.q-btn__content span) {
    color: white;
  }

  color: white;
}

.favorite-details {
  padding-left: 50px;

  .detail-item {
    opacity: 0.7;
  }

  .detail-label {
    opacity: 0.65;
    color: var(--nexa-text-primary);
  }

  .detail-value {
    opacity: 0.6;
    color: var(--nexa-text-primary);
  }
}

.favorite-progress {
  text-align: center;
}

.favorite-progress-text {
  font-size: 14px;
  color: var(--nexa-text-primary);
  opacity: 0.7;
}
</style>

