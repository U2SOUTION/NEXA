<template>
  <div class="theme-settings">
    <!-- 플랫폼 테마 -->
    <div class="settings-section">
      <div class="section-header">
        <q-icon name="dashboard" class="section-icon" />
        <h3 class="section-title">플랫폼 테마</h3>
      </div>
      <div class="theme-list">
        <div v-for="theme in platformThemes" :key="theme.id" class="theme-item" :class="{ active: theme.id === currentPlatformTheme, unavailable: !theme.available }">
          <div class="theme-icon">
            <q-icon :name="theme.icon" />
          </div>
          <div class="theme-info">
            <div class="theme-name">{{ theme.name }}</div>
            <div class="theme-description">{{ theme.description }}</div>
          </div>
          <div class="theme-actions">
            <q-btn v-if="theme.available" flat dense color="primary" label="선택" :disable="theme.id === currentPlatformTheme" @click="selectPlatformTheme(theme.id)" />
            <q-chip v-else size="sm" color="grey" text-color="white">준비 중</q-chip>
          </div>
        </div>
      </div>
    </div>

    <!-- 확장 프로그램 테마 -->
    <div class="settings-section">
      <div class="section-header">
        <q-icon name="extension" class="section-icon" />
        <h3 class="section-title">확장 프로그램 테마</h3>
      </div>
      <div class="theme-list">
        <div v-for="theme in extensionThemes" :key="theme.id" class="theme-item" :class="{ active: theme.id === currentExtensionTheme, unavailable: !theme.available }">
          <div class="theme-icon">
            <q-icon :name="theme.icon" />
          </div>
          <div class="theme-info">
            <div class="theme-name">{{ theme.name }}</div>
            <div class="theme-description">{{ theme.description }}</div>
          </div>
          <div class="theme-actions">
            <q-btn v-if="theme.available" flat dense color="primary" label="선택" :disable="theme.id === currentExtensionTheme" @click="selectExtensionTheme(theme.id)" />
            <q-chip v-else size="sm" color="grey" text-color="white">준비 중</q-chip>
          </div>
        </div>
      </div>
    </div>

    <!-- 파이썬 웹뷰 테마 -->
    <div class="settings-section">
      <div class="section-header">
        <q-icon name="computer" class="section-icon" />
        <h3 class="section-title">파이썬 웹뷰 테마</h3>
      </div>
      <div class="theme-list">
        <div v-for="theme in webviewThemes" :key="theme.id" class="theme-item" :class="{ active: theme.id === currentWebviewTheme, unavailable: !theme.available }">
          <div class="theme-icon">
            <q-icon :name="theme.icon" />
          </div>
          <div class="theme-info">
            <div class="theme-name">{{ theme.name }}</div>
            <div class="theme-description">{{ theme.description }}</div>
          </div>
          <div class="theme-actions">
            <q-btn v-if="theme.available" flat dense color="primary" label="선택" :disable="theme.id === currentWebviewTheme" @click="selectWebviewTheme(theme.id)" />
            <q-chip v-else size="sm" color="grey" text-color="white">준비 중</q-chip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { themeSettings } from '@system/settings/theme'

const $q = useQuasar()

// 테마 목록
const platformThemes = computed(() => themeSettings.platform.themes)
const extensionThemes = computed(() => themeSettings.extension.themes)
const webviewThemes = computed(() => themeSettings.webview.themes)

// 현재 선택된 테마 (목업 데이터에서 초기값 가져오기)
const currentPlatformTheme = ref(themeSettings.platform.current)
const currentExtensionTheme = ref(themeSettings.extension.current)
const currentWebviewTheme = ref(themeSettings.webview.current)

// 플랫폼 테마 선택
function selectPlatformTheme(themeId) {
  currentPlatformTheme.value = themeId
  // TODO: 실제 테마 적용 로직 (목업 단계에서는 표시만)

  // 다크/라이트 테마의 경우 기존 toggleTheme 로직 활용
  if (themeId === 'dark') {
    $q.dark.set(true)
    document.body.classList.add('dark')
  } else if (themeId === 'light') {
    $q.dark.set(false)
    document.body.classList.remove('dark')
  }

  $q.notify({
    message: `플랫폼 테마가 "${platformThemes.value.find((t) => t.id === themeId)?.name}"로 변경되었습니다`,
    type: 'positive',
    position: 'top',
    timeout: 2000,
  })
}

// 확장 프로그램 테마 선택
function selectExtensionTheme(themeId) {
  currentExtensionTheme.value = themeId
  // TODO: 실제 테마 적용 로직 (목업 단계에서는 표시만)
  $q.notify({
    message: `확장 프로그램 테마가 "${extensionThemes.value.find((t) => t.id === themeId)?.name}"로 변경되었습니다`,
    type: 'positive',
    position: 'top',
    timeout: 2000,
  })
}

// 웹뷰 테마 선택
function selectWebviewTheme(themeId) {
  currentWebviewTheme.value = themeId
  // TODO: 실제 테마 적용 로직 (목업 단계에서는 표시만)
  $q.notify({
    message: `웹뷰 테마가 "${webviewThemes.value.find((t) => t.id === themeId)?.name}"로 변경되었습니다`,
    type: 'positive',
    position: 'top',
    timeout: 2000,
  })
}
</script>

<style lang="scss" scoped>
.theme-settings {
  .settings-section {
    margin-bottom: 2.5rem;

    &:last-child {
      margin-bottom: 0;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid var(--nexa-border-color);

      .section-icon {
        font-size: 1.5rem;
        color: var(--nexa-primary);
      }

      .section-title {
        font-size: 1.25rem;
        margin: 0;
        font-weight: 600;
        color: var(--nexa-text-primary);
      }
    }

    .theme-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .theme-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background-color: var(--nexet-bg);
      border: 1px solid var(--nexet-border);
      border-radius: 8px;
      transition: all 0.2s ease;

      &:hover:not(.unavailable) {
        background-color: var(--nexa-surface-hover);
        border-color: var(--nexa-border-hover);
      }

      &.active {
        border-color: var(--nexa-primary);
        background-color: var(--nexa-surface);
        box-shadow: 0 0 0 2px rgba(var(--nexa-primary-rgb), 0.2);
      }

      &.unavailable {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .theme-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: 8px;
        background-color: var(--nexa-surface);
        color: var(--nexa-primary);
        flex-shrink: 0;

        .q-icon {
          font-size: 1.5rem;
        }
      }

      .theme-info {
        flex: 1;
        min-width: 0;

        .theme-name {
          font-size: 1rem;
          font-weight: 500;
          color: var(--nexa-text-primary);
          margin-bottom: 0.25rem;
        }

        .theme-description {
          font-size: 0.875rem;
          color: var(--nexa-text-secondary);
        }
      }

      .theme-actions {
        flex-shrink: 0;
      }
    }
  }
}
</style>
