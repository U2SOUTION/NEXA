<!-- DetailModal.vue
  상세보기 모달 (전체 화면)
-->
<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    class="detail-modal-dialog"
    maximized
  >
    <q-card class="detail-modal-card">
      <q-card-section class="detail-modal-header">
        <div class="detail-modal-title-row row items-center justify-between">
          <div class="detail-modal-title">
            <div class="detail-modal-title-en">DETAIL VIEW</div>
            <div class="detail-modal-title-ko">상세보기</div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            color="primary"
            @click="$emit('close')"
            class="detail-modal-close-btn"
          />
        </div>
      </q-card-section>
      <q-card-section class="detail-modal-content" v-if="target">
        <div class="detail-modal-body">
          <div class="q-pa-md">
            <!-- 타이틀 -->
            <div class="selected-item-title">
              <div class="selected-item-title-en">PART CLASS</div>
              <div class="selected-item-title-ko">부품 분류 정보</div>
            </div>

            <!-- 핵심 정보 -->
            <div class="selected-item-core q-mt-lg">
              <div class="core-info-item">
                <div class="core-info-label">ID</div>
                <div class="core-info-value">{{ target.id || '-' }}</div>
              </div>
              <div class="core-info-item">
                <div class="core-info-label">SKU</div>
                <div class="core-info-value">
                  {{
                    target.d_code && target.c_code ? `${target.d_code}-${target.c_code}` : '-'
                  }}
                </div>
              </div>
              <div class="core-info-item">
                <div class="core-info-label">대분류</div>
                <div class="core-info-value">{{ target.category || '-' }}</div>
              </div>
              <div class="core-info-item">
                <div class="core-info-label">클래스명</div>
                <div class="core-info-value">{{ target.name || '-' }}</div>
              </div>
              <div class="core-info-item" v-if="target.code_name">
                <div class="core-info-label">Code Name</div>
                <div class="core-info-value">{{ target.code_name }}</div>
              </div>
              <div class="core-info-item" v-if="target.d_code">
                <div class="core-info-label">D Code</div>
                <div class="core-info-value">{{ target.d_code }}</div>
              </div>
              <div class="core-info-item" v-if="target.c_code">
                <div class="core-info-label">C Code</div>
                <div class="core-info-value">{{ target.c_code }}</div>
              </div>
            </div>

            <!-- 추가 정보 -->
            <div
              class="selected-item-additional q-mt-lg"
              v-if="target.description || target.example"
            >
              <div class="additional-info-item q-mb-md" v-if="target.description">
                <div class="additional-info-label">설명</div>
                <div class="additional-info-value">{{ target.description }}</div>
              </div>
              <div class="additional-info-item" v-if="target.example">
                <div class="additional-info-label">예시</div>
                <div class="additional-info-value">{{ target.example }}</div>
              </div>
            </div>

            <!-- 상세설명 (Tiptap 에디터 콘텐츠) -->
            <div
              class="selected-item-detailed-description q-mt-lg"
              v-if="target.detailed_description"
            >
              <div class="additional-info-label q-mb-sm">상세설명</div>
              <div class="detailed-description-content" v-html="target.detailed_description"></div>
            </div>
          </div>
        </div>
      </q-card-section>
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
</script>

<style lang="scss" scoped>
.detail-modal-dialog {
  :deep(.q-dialog__backdrop) {
    background-color: rgba(0, 0, 0, 0.8);
  }

  :deep(.q-dialog__inner) {
    background-color: var(--nexa-surface);
  }
}

.detail-modal-card {
  width: 100%;
  height: 100%;
  max-width: 100vw;
  max-height: 100vh;
  border-radius: 0;
  background-color: var(--nexa-surface);
  display: flex;
  flex-direction: column;

  :deep(.q-card__section) {
    background-color: var(--nexa-surface);
  }

  background: var(--nexa-surface);
}

.detail-modal-header {
  padding: 24px 32px;
  border-bottom: 1px solid var(--nexa-border-color);
  flex-shrink: 0;
  background-color: var(--nexa-surface);
}

.detail-modal-title-row {
  width: 100%;
}

.detail-modal-title {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-modal-title-en {
  font-size: 2.5em;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 1.2;
  color: var(--q-primary);
}

.detail-modal-title-ko {
  font-size: 20px;
  font-weight: 600;
  color: var(--q-primary);
}

.detail-modal-close-btn {
  font-size: 24px;
}

.detail-modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background-color: var(--nexa-surface);
}

.detail-modal-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
  background-color: var(--nexa-surface);
  min-height: 100%;
}

.detail-modal-body {
  .selected-item-title {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--nexa-border-color);
  }

  .selected-item-title-en {
    font-size: 2em;
    font-weight: 900;
    text-transform: uppercase;
    line-height: 1.2;
    color: var(--q-primary);
  }

  .selected-item-title-ko {
    font-size: 18px;
    font-weight: 600;
    color: var(--q-primary);
  }

  .selected-item-core {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
  }

  .core-info-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .core-info-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--nexa-text-primary);
    opacity: 0.7;
  }

  .core-info-value {
    font-size: 16px;
    font-weight: 500;
    color: var(--nexa-text-primary);
  }

  .selected-item-additional {
    border-top: 1px solid var(--nexa-border-color);
    padding-top: 24px;
  }

  .additional-info-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .additional-info-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--nexa-text-primary);
    opacity: 0.8;
  }

  .additional-info-value {
    font-size: 15px;
    line-height: 1.6;
    color: var(--nexa-text-primary);
    opacity: 0.9;
  }

  .selected-item-detailed-description {
    border-top: 1px solid var(--nexa-border-color);
    padding-top: 24px;
  }

  .detailed-description-content {
    font-size: 15px;
    line-height: 1.8;
    color: var(--nexa-text-primary);
    opacity: 0.9;
  }
}
</style>

