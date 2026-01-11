<!-- DeleteModal.vue
  삭제 확인 모달
-->
<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
  >
    <q-card class="delete-confirmation-dialog-card">
      <q-card-section class="delete-confirmation-section">
        <div class="delete-confirmation-title">
          <span class="delete-confirmation-title-en">DELETE CONFIRM</span>
          <span class="delete-confirmation-title-ko">삭제 확인</span>
        </div>
        <!-- 단일 삭제 -->
        <div v-if="targets.length <= 1" class="q-mt-md">
          <div class="delete-confirmation-message">
            <q-icon name="warning" size="35px" color="warning" class="q-mr-sm" />
            정말로 <strong>"{{ target?.name }}"</strong> 부품 분류를 삭제하시겠습니까?
          </div>

          <!-- 상세 정보 -->
          <div v-if="target" class="delete-confirmation-details q-mt-lg">
            <div class="detail-item">
              <span class="detail-label">카테고리:</span>
              <span class="detail-value">{{ target.category || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">클래스명:</span>
              <span class="detail-value">{{ target.name || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">설명:</span>
              <span class="detail-value">{{ target.description || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 복수 삭제 -->
        <div v-else class="q-mt-md">
          <div class="delete-confirmation-message q-mb-md">
            <q-icon name="warning" size="35px" color="warning" class="q-mr-sm" />
            정말로 <strong>{{ targets.length }}</strong
            >개의 아래 부품 분류를 삭제하시겠습니까?
          </div>

          <q-markup-table dense flat bordered class="q-mt-sm">
            <thead>
              <tr>
                <th class="text-left">No.</th>
                <th class="text-left">카테고리</th>
                <th class="text-left">클래스명</th>
                <th class="text-left">C Code</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in targets"
                :key="item.id"
                :class="{ 'deleted-item': deletedItems.has(item.id) }"
              >
                <td class="text-left">
                  <div class="cell-content">
                    <q-icon
                      v-if="deletedItems.has(item.id)"
                      name="check_circle"
                      size="16px"
                      color="positive"
                      class="q-mr-xs"
                    />
                    {{ index + 1 }}
                  </div>
                </td>
                <td class="text-left">{{ item.category || '-' }}</td>
                <td class="text-left">{{ item.name || '-' }}</td>
                <td class="text-left">{{ item.c_code || '-' }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </q-card-section>
      <q-card-actions align="center" class="delete-confirmation-actions">
        <q-btn
          v-if="!isDeleteCompleted"
          flat
          label="취소"
          v-close-popup
          class="delete-cancel-btn"
          :disable="isDeleting"
          @click="$emit('close')"
        />
        <q-btn
          v-else
          flat
          label="되돌리기"
          class="delete-restore-btn"
          :disable="isDeleting || deletedItems.size === 0"
          :loading="isDeleting"
          @click="$emit('restore')"
        />
        <q-btn
          flat
          :label="isDeleteCompleted ? '닫기' : targets.length > 1 ? '다중삭제' : '삭제'"
          color="primary"
          @click="isDeleteCompleted ? $emit('close') : $emit('confirm')"
          class="delete-confirm-btn"
          :loading="isDeleting"
          :disable="isDeleting"
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
  isDeleting: {
    type: Boolean,
    default: false,
  },
  isDeleteCompleted: {
    type: Boolean,
    default: false,
  },
  deletedItems: {
    type: Set,
    default: () => new Set(),
  },
})

defineEmits(['update:modelValue', 'confirm', 'close', 'restore'])

const target = computed(() => props.targets[0] || null)
</script>

<style lang="scss" scoped>
.delete-confirmation-dialog-card {
  min-width: 600px;
  max-width: 90vw;
  width: 700px;
  border-radius: 8px;
  border: 2px solid var(--nexa-warning);

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

.delete-confirmation-section {
  padding: 100px;

  @media (max-width: 600px) {
    padding: 50px;
  }
}

.delete-confirmation-title {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 16px;
}

.delete-confirmation-title-en {
  font-size: 3.5em;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 1.2;
  color: var(--nexa-warning);
}

.delete-confirmation-title-ko {
  font-size: 24px;
  font-weight: 600;
  color: var(--nexa-warning);
}

.delete-confirmation-message {
  font-size: 18px;
  line-height: 1.6;
  color: var(--nexa-text-primary);
}

.delete-confirmation-actions {
  padding: 0 100px 100px 100px;
  gap: 16px;

  @media (max-width: 600px) {
    padding: 0 50px 50px 50px;
  }
}

.delete-cancel-btn,
.delete-confirm-btn,
.delete-restore-btn {
  min-width: 120px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 500;
  border: 1px solid var(--nexa-warning);
}

.delete-cancel-btn {
  color: var(--nexa-warning);
}

.delete-cancel-btn:hover {
  background-color: var(--nexa-warning);
  color: white;
  border-color: var(--nexa-warning);
}

.delete-restore-btn {
  color: var(--nexa-primary);
  border-color: var(--nexa-primary);
}

.delete-restore-btn:hover {
  background-color: var(--nexa-primary);
  color: white;
  border-color: var(--nexa-primary);
}

.delete-restore-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-confirm-btn {
  background-color: var(--nexa-warning);
  color: white;
}

.delete-confirm-btn:hover {
  background-color: var(--nexa-warning);
  opacity: 0.9;
  border-color: var(--nexa-warning);
}

// 삭제된 항목 스타일
:deep(.deleted-item) {
  opacity: 0.2;
  transition: opacity 0.3s ease;
}

:deep(.deleted-item td) {
  position: relative;
}

.cell-content {
  display: flex;
  align-items: center;
}

.delete-confirmation-details {
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
</style>
