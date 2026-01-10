<!-- ToggleButton.vue
  토글 버튼 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<!--
  @tags: styles, 버튼, 토글, 토글버튼, toggle, button
  @category: buttons
  @description: Toggle Button 샘플 컴포넌트
-->
<template>
  <!-- 샘플 컨테이너 -->
  <div class="sample-container">
    <!-- 기본 토글 버튼 섹션 -->
    <div class="sample-section">
      <div class="section-header">
        <h4 class="section-title">기본 토글 버튼</h4>
        <p class="section-subtitle">Quasar 기본 컴포넌트를 사용한 토글 버튼</p>
      </div>
      <div class="section-content">
        <div class="button-group">
          <div class="button-item">
            <label class="button-label">옵션 토글</label>
            <q-btn-toggle v-model="toggleValue" :options="toggleOptions" />
          </div>
          <div class="button-item">
            <label class="button-label">아이콘 토글</label>
            <q-btn-toggle v-model="iconToggle" :options="iconToggleOptions" />
          </div>
          <div class="button-item">
            <label class="button-label">스위치 토글</label>
            <q-toggle v-model="switchValue" label="스위치 토글" />
          </div>
        </div>
      </div>
    </div>

    <!-- 커스텀 토글 버튼 섹션 -->
    <div class="sample-section">
      <div class="section-header">
        <h4 class="section-title">커스텀 토글 버튼</h4>
        <p class="section-subtitle">아이콘과 라벨이 함께 표시되는 상태 전환 버튼</p>
      </div>
      <div class="section-content">
        <div class="custom-toggle-wrapper">
          <div class="filter-list-toggle">
            <q-btn :label="listFilterToggle ? '필터링' : '전체'" :icon="listFilterToggle ? 'filter_list' : 'list'" rounded :class="{ 'filter-toggle-active': listFilterToggle, 'filter-toggle-inactive': !listFilterToggle }" @click="listFilterToggle = !listFilterToggle">
              <q-tooltip>필터링 {{ listFilterToggle ? 'ON' : 'OFF' }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const toggleValue = ref('option1')
const iconToggle = ref('option1')
const switchValue = ref(false)
const listFilterToggle = ref(true)

const toggleOptions = [
  { label: '옵션 1', value: 'option1' },
  { label: '옵션 2', value: 'option2' },
  { label: '옵션 3', value: 'option3' },
]

const iconToggleOptions = [
  { label: '리스트', value: 'option1', icon: 'view_list' },
  { label: '그리드', value: 'option2', icon: 'view_module' },
  { label: '계층', value: 'option3', icon: 'account_tree' },
]
</script>

<style lang="scss" scoped>
.sample-container {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sample-section {
  //background-color: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
  border-radius: 8px;
  padding: 24px;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .section-header {
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--nexa-border-color);

    .section-title {
      color: var(--nexa-text-primary);
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .section-subtitle {
      color: var(--nexa-text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
      margin: 0;
    }
  }

  .section-content {
    .button-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;

      .button-item {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .button-label {
          color: var(--nexa-text-secondary);
          font-size: 0.8125rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }
    }

    .custom-toggle-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background-color: var(--nexa-background);
      border-radius: 6px;
      border: 1px dashed var(--nexa-border-color);
    }
  }
}

// 커스텀 토글 버튼 스타일
.filter-list-toggle {
  .q-btn {
    height: 30px;
    min-width: auto;
    padding: 0 12px;
    font-size: 0.8rem;
    letter-spacing: 0.04em;
    white-space: nowrap;
    border-radius: 4px;
    transition:
      background-color 0.2s ease,
      color 0.2s ease;
    overflow: hidden;

    :deep(.q-btn__content) {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-wrap: nowrap;
      width: 100%;
    }

    :deep(.q-icon) {
      font-size: 16px;
      margin-right: 4px;
      flex-shrink: 0;
    }

    :deep(.q-btn__label) {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-shrink: 1;
      min-width: 0;
    }

    &.filter-toggle-active {
      background-color: var(--nexa-button-primary-bg);
      color: var(--nexa-button-primary-text);

      :deep(.q-icon) {
        color: var(--nexa-button-primary-text);
      }
    }

    &.filter-toggle-inactive {
      background-color: var(--nexa-surface);
      color: var(--nexa-text-secondary);

      :deep(.q-icon) {
        color: var(--nexa-text-secondary);
      }
    }

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
