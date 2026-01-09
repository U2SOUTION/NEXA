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

  <!-- UI 모드 설정 -->
  <div class="list-section">
    <div class="section-label">UI 모드 설정</div>
    <q-list>
      <q-item class="settings-item">
        <q-item-section>
          <q-item-label class="settings-item-label">UI 표시 방식</q-item-label>
          <q-item-label class="settings-item-caption">사이드 패널 또는 사이트에 직접 삽입</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-select
            v-model="uiMode"
            :options="uiModeOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            dense
            outlined
            class="ui-mode-select"
            @update:model-value="handleUIModeChange"
          />
        </q-item-section>
      </q-item>
      <q-item v-if="uiMode === 'injected'" class="settings-item">
        <q-item-section>
          <q-item-label class="settings-item-label">사이트 삽입 활성화</q-item-label>
          <q-item-label class="settings-item-caption">YouTube 등 사이트에 사이드바로 삽입</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="injectUIEnabled" class="settings-toggle" @update:model-value="handleInjectUIChange" />
        </q-item-section>
      </q-item>
    </q-list>
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
import { ref, onMounted } from 'vue'
import TabCustomizer from './TabCustomizer.vue'

// UI 모드 설정
const uiMode = ref('sidepanel') // 'sidepanel' | 'injected'
const injectUIEnabled = ref(false)
const uiModeOptions = [
  { label: '사이드 패널', value: 'sidepanel' },
  { label: '사이트 삽입', value: 'injected' },
]

// 목업 데이터
const mockSettings = ref({
  autoCollect: true,
  notifications: true,
  theme: 'auto',
  autoClean: false,
})

const themeOptions = ['light', 'dark', 'auto']

// 설정 로드
onMounted(async () => {
  try {
    // Extension Storage에서 설정 로드 시도
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'REQUEST_SETTINGS',
        },
        '*'
      )

      // 설정 수신 대기
      window.addEventListener('message', handleSettingsMessage, { once: true })
    }
  } catch (error) {
    console.warn('[Settings] 설정 로드 실패, 기본값 사용:', error)
  }
})

// 설정 메시지 처리
function handleSettingsMessage(event) {
  if (event.data && event.data.type === 'SETTINGS_RESPONSE') {
    const settings = event.data.data
    if (settings) {
      uiMode.value = settings.u2bee_ui_mode || 'sidepanel'
      injectUIEnabled.value = settings.u2bee_injectUI_enabled || false
    }
  }
}

// UI 모드 변경 처리
function handleUIModeChange(newMode) {
  uiMode.value = newMode
  saveSettings()
  
  if (newMode === 'injected') {
    // 사이트 삽입 모드로 전환 시 자동으로 활성화 (사용자 편의)
    if (!injectUIEnabled.value) {
      injectUIEnabled.value = true
      saveSettings()
      console.log('[Settings] 사이트 삽입 모드가 활성화되었습니다. 페이지를 새로고침하면 적용됩니다.')
    }
  } else {
    // 사이드 패널 모드로 전환 시 삽입 UI 비활성화
    injectUIEnabled.value = false
    saveSettings()
  }
}

// 사이트 삽입 활성화 변경 처리
function handleInjectUIChange(enabled) {
  injectUIEnabled.value = enabled
  saveSettings()
  
  if (enabled) {
    console.log('[Settings] 사이트 삽입이 활성화되었습니다. 페이지를 새로고침하면 적용됩니다.')
  } else {
    console.log('[Settings] 사이트 삽입이 비활성화되었습니다.')
  }
}

// 설정 저장
function saveSettings() {
  try {
    // Extension Storage에 설정 저장 요청
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'SAVE_SETTINGS',
          data: {
            u2bee_ui_mode: uiMode.value,
            u2bee_injectUI_enabled: injectUIEnabled.value,
          },
        },
        '*'
      )
    }
  } catch (error) {
    console.error('[Settings] 설정 저장 실패:', error)
  }
}
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

.ui-mode-select {
  min-width: 140px;
  flex-shrink: 0;
}
</style>
