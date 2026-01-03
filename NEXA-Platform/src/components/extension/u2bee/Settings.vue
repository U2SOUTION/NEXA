<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- Breadcrumb 및 액션 버튼 -->
  <div class="breadcrumb-section">
    <div class="breadcrumb">
      <span class="breadcrumb-item">:: U2BEE</span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item active">설정</span>
    </div>
    <div class="action-buttons">
      <q-btn flat dense label="저장" size="sm" />
      <q-btn flat dense label="초기화" size="sm" />
    </div>
  </div>

  <!-- 일반 설정 -->
  <div class="list-section">
    <div class="section-label">일반 설정</div>
    <q-list>
      <q-item class="settings-item">
        <q-item-section>
          <q-item-label class="settings-item-label">자동 수집</q-item-label>
          <q-item-label class="settings-item-caption">콘텐츠를 자동으로 수집합니다</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="mockSettings.autoCollect" class="settings-toggle" />
        </q-item-section>
      </q-item>

      <q-item class="settings-item">
        <q-item-section>
          <q-item-label class="settings-item-label">알림</q-item-label>
          <q-item-label class="settings-item-caption">알림을 표시합니다</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="mockSettings.notifications" class="settings-toggle" />
        </q-item-section>
      </q-item>
    </q-list>
  </div>

  <!-- 탭 구성 설정 -->
  <div class="list-section">
    <div class="section-label">탭 구성 설정</div>
    <TabCustomizer />
  </div>

  <!-- 테마 설정 -->
  <div class="list-section">
    <div class="section-label">테마</div>
    <q-list>
      <q-item class="settings-item">
        <q-item-section>
          <q-item-label class="settings-item-label">테마 모드</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-select v-model="mockSettings.theme" :options="themeOptions" dense outlined class="theme-select" />
        </q-item-section>
      </q-item>
    </q-list>
  </div>

  <!-- 데이터 관리 설정 -->
  <div class="list-section">
    <div class="section-label">데이터 관리</div>
    <q-list>
      <q-item class="settings-item">
        <q-item-section>
          <q-item-label class="settings-item-label">자동 정리</q-item-label>
          <q-item-label class="settings-item-caption">오래된 데이터를 자동으로 정리합니다</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="mockSettings.autoClean" class="settings-toggle" />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TabCustomizer from './TabCustomizer.vue'

// 목업 데이터
const mockSettings = ref({
  autoCollect: true,
  notifications: true,
  theme: 'auto',
  autoClean: false,
})

const themeOptions = ['light', 'dark', 'auto']
</script>

<style lang="scss" scoped>
.breadcrumb-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
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

.list-section {
  margin-bottom: 5px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--nexa-border-color); // 임시 확인용

  &:last-child {
    margin-bottom: 0;
  }
}

.section-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--nexa-text-primary);
  padding: 12px 0 8px 0;
  border-bottom: 1px solid var(--nexa-border-color);
  margin-bottom: 8px;
}

.settings-item {
  padding: 8px 0;
}

.settings-item-label {
  font-size: 14px;
  color: var(--nexa-text-primary);
}

.settings-item-caption {
  font-size: 12px;
  color: var(--nexa-text-secondary);
}

.settings-toggle {
  color: var(--nexa-button-primary-bg);
}

.theme-select {
  min-width: 120px;
  flex-shrink: 0;
}
</style>
