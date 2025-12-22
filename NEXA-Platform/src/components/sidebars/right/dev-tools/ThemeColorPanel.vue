<!-- ThemeColorPanel.vue
  선택한 색상의 상세 정보 및 편집 패널
-->
<template>
  <div class="theme-color-panel">
    <div class="panel-content q-pa-md">
      <!-- 선택한 색상 미리보기 -->
      <div v-if="selectedColor" class="color-preview-section q-mb-md">
        <div class="color-preview-box" :style="{ backgroundColor: selectedColor.value }"></div>
        <div class="color-info">
          <div class="color-variable-name">{{ selectedColor.name }}</div>
          <div class="color-value">{{ selectedColor.value }}</div>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div v-else class="empty-state">
        <q-icon name="palette" size="48px" class="q-mb-sm" />
        <div class="empty-message">색상을 선택하세요</div>
        <div class="empty-hint">왼쪽 목록에서 색상을 클릭하여 상세 정보를 확인하세요.</div>
      </div>

      <!-- 색상 정보 섹션 -->
      <div v-if="selectedColor" class="info-section q-mt-md">
        <h4 class="section-title">색상 정보</h4>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">변수명</div>
            <div class="info-value">{{ selectedColor.name }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">HEX</div>
            <div class="info-value">{{ selectedColor.value }}</div>
          </div>
          <!-- TODO: RGB, HSL 변환 추가 -->
        </div>
      </div>

      <!-- 사용 통계 섹션 -->
      <div v-if="selectedColor" class="statistics-section q-mt-md">
        <h4 class="section-title">사용 통계</h4>
        <div class="statistics-content">
          <div class="stat-item">
            <div class="stat-label">사용 횟수</div>
            <div class="stat-value">{{ usageCount || 0 }}회</div>
          </div>
          <div v-if="usageFiles && usageFiles.length > 0" class="files-list">
            <div v-for="file in usageFiles" :key="file.path" class="file-item" @click="handleFileClick(file.path)">{{ file.path }} ({{ file.count }}회)</div>
          </div>
        </div>
      </div>

      <!-- 범용 색상 기능 섹션 -->
      <div v-if="selectedColor" class="universal-colors-section q-mt-md">
        <h4 class="section-title">범용 색상 기능</h4>
        <div class="universal-colors-content">
          <div class="empty-state-small">
            <q-icon name="extension" size="32px" class="q-mb-sm" />
            <div class="empty-message-small">범용 색상 기능 준비 중</div>
          </div>
        </div>
      </div>

      <!-- 색상 편집 섹션 (향후 구현) -->
      <div v-if="selectedColor" class="edit-section q-mt-md">
        <h4 class="section-title">색상 편집</h4>
        <div class="edit-content">
          <div class="empty-state-small">
            <q-icon name="edit" size="32px" class="q-mb-sm" />
            <div class="empty-message-small">색상 편집 기능 준비 중</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  selectedColor: {
    type: Object,
    default: null,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  usageFiles: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['fileClicked', 'colorEdit'])

function handleFileClick(filePath) {
  emit('fileClicked', filePath)
}
</script>

<style lang="scss" scoped>
.theme-color-panel {
  width: 100%;

  .panel-content {
    width: 100%;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    color: var(--nexa-text-secondary);

    .empty-message {
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
      color: var(--nexa-text-secondary);
    }

    .empty-hint {
      font-size: 0.75rem;
      color: var(--nexa-text-hint);
    }
  }

  .empty-state-small {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    text-align: center;
    color: var(--nexa-text-secondary);

    .empty-message-small {
      font-size: 0.8rem;
      color: var(--nexa-text-hint);
    }
  }

  .color-preview-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background-color: var(--nexa-panel-bg);
    border: 1px solid var(--nexa-panel-border);
    border-radius: 8px;

    .color-preview-box {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      border: 2px solid var(--nexa-border-color);
      flex-shrink: 0;
    }

    .color-info {
      flex: 1;

      .color-variable-name {
        font-size: 1rem;
        font-weight: 600;
        color: var(--nexa-text-primary);
        margin-bottom: 0.5rem;
      }

      .color-value {
        font-size: 0.85rem;
        font-family: monospace;
        color: var(--nexa-text-secondary);
      }
    }
  }

  .section-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--nexa-text-primary);
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--nexa-border-color);
  }

  .info-section {
    .info-grid {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        background-color: var(--nexa-item-bg);
        border: 1px solid var(--nexa-item-border);
        border-radius: 4px;

        .info-label {
          font-size: 0.85rem;
          color: var(--nexa-text-secondary);
        }

        .info-value {
          font-size: 0.85rem;
          font-family: monospace;
          color: var(--nexa-text-primary);
          font-weight: 500;
        }
      }
    }
  }

  .statistics-section {
    .statistics-content {
      .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background-color: var(--nexa-item-bg);
        border: 1px solid var(--nexa-item-border);
        border-radius: 4px;
        margin-bottom: 0.75rem;

        .stat-label {
          font-size: 0.85rem;
          color: var(--nexa-text-secondary);
        }

        .stat-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--nexa-primary);
        }
      }

      .files-list {
        margin-top: 0.5rem;

        .file-item {
          font-size: 0.8rem;
          color: var(--nexa-text-secondary);
          padding: 0.5rem;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s ease;

          &:hover {
            background-color: var(--nexa-item-hover-bg);
            color: var(--nexa-primary);
          }
        }
      }
    }
  }

  .universal-colors-section,
  .edit-section {
    padding: 1rem;
    background-color: var(--nexa-panel-bg);
    border: 1px solid var(--nexa-panel-border);
    border-radius: 8px;
  }
}
</style>
