<!-- ActivateStatusModal.vue
  활성화/비활성화 확인 모달
-->
<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent>
    <q-card class="activate-status-dialog-card">
      <q-card-section class="activate-status-section">
        <div class="activate-status-title">
          <span class="activate-status-title-en">STATUS CHANGE</span>
          <span class="activate-status-title-ko">상태 변경</span>
        </div>

        <!-- 단일 항목 -->
        <div v-if="targets.length <= 1" class="q-mt-md">
          <div class="activate-status-message">
            <q-icon name="info" size="35px" color="primary" class="q-mr-sm" />
            <span v-if="targets[0]">
              <strong>"{{ targets[0].name }}"</strong> 부품 분류를
              <strong>{{ type === 'activate' ? '활성화' : '비활성화' }}</strong
              >하시겠습니까?
            </span>
          </div>

          <!-- 상세 정보 -->
          <div v-if="targets[0]" class="activate-status-details q-mt-lg">
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
                {{ targets[0].is_active ? '활성화' : '비활성화' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 복수 항목 -->
        <div v-else class="q-mt-md">
          <div class="activate-status-message">
            <q-icon name="info" size="35px" color="primary" class="q-mr-sm" />
            정말로 <strong>{{ targets.length }}</strong
            >개의 아래 부품 분류를
            <strong>{{ type === 'activate' ? '활성화' : '비활성화' }}</strong
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
                <td class="text-left">{{ item.is_active ? '활성화' : '비활성화' }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>

        <!-- 진행 상태 -->
        <div v-if="isProcessing" class="activate-status-progress q-mt-lg">
          <q-linear-progress indeterminate color="primary" class="q-mt-sm" />
          <div class="activate-status-progress-text q-mt-sm">
            {{ type === 'activate' ? '활성화' : '비활성화' }} 진행 중...
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="center" class="activate-status-actions">
        <q-btn
          flat
          label="취소"
          v-close-popup
          class="activate-status-cancel-btn"
          :disable="isProcessing"
          @click="$emit('close')"
        />
        <q-btn
          :label="buttonLabel"
          @click="$emit('confirm')"
          class="activate-status-confirm-btn"
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
    default: 'activate', // 'activate' | 'deactivate'
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
  return props.type === 'activate' ? '활성화' : '비활성화'
})
</script>

<style lang="scss" scoped>
.activate-status-dialog-card {
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

.activate-status-section {
  padding: 100px;

  @media (max-width: 600px) {
    padding: 50px;
  }
}

.activate-status-title {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 16px;
}

.activate-status-title-en {
  font-size: 3.5em;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 1.2;
  color: var(--q-primary);
}

.activate-status-title-ko {
  font-size: 24px;
  font-weight: 600;
  color: var(--q-primary);
}

.activate-status-message {
  font-size: 18px;
  line-height: 1.6;
  color: var(--nexa-text-primary);
}

.activate-status-actions {
  padding: 0 100px 100px 100px;
  gap: 16px;

  @media (max-width: 600px) {
    padding: 0 50px 50px 50px;
  }
}

.activate-status-cancel-btn,
.activate-status-confirm-btn {
  min-width: 120px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 500;
  border: 1px solid var(--q-primary);
}

.activate-status-cancel-btn {
  color: var(--q-primary);
}

.activate-status-cancel-btn:hover {
  background-color: var(--q-primary);
  color: white;
  border-color: var(--q-primary);
}

.activate-status-confirm-btn {
  background-color: var(--q-primary);

  :deep(.q-btn__content),
  :deep(.q-btn__content span) {
    color: white;
  }

  color: white;
}

.activate-status-confirm-btn:hover {
  background-color: var(--q-primary);
  opacity: 0.9;
  border-color: var(--q-primary);

  :deep(.q-btn__content),
  :deep(.q-btn__content span) {
    color: white;
  }

  color: white;
}

.activate-status-details {
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

.activate-status-progress {
  text-align: center;
}

.activate-status-progress-text {
  font-size: 14px;
  color: var(--nexa-text-primary);
  opacity: 0.7;
}
</style>

