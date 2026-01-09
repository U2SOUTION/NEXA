<!-- ViewModeSelector.vue
  뷰 모드 선택 드롭다운 컴포넌트
  재사용 가능한 뷰 모드 선택 UI
-->
<template>
  <q-btn-dropdown
    flat
    dense
    icon="view_module"
    label="뷰 모드"
    class="view-mode-dropdown"
    menu-class="view-mode-menu"
    :menu-style="{ backgroundColor: menuBackgroundColor }"
  >
    <q-tooltip>뷰 모드 선택 및 관리</q-tooltip>
    <q-list :style="{ backgroundColor: menuBackgroundColor }">
      <!-- 뷰 모드 선택 -->
      <q-item-label
        header
        class="text-weight-bold"
        :style="{
          backgroundColor: menuBackgroundColor,
          color: 'var(--nexa-text-secondary)',
        }"
      >
        뷰 모드 선택
      </q-item-label>
      <!-- 뷰 모드 선택 (반복문으로 처리) -->
      <q-item
        v-for="mode in enabledViewModes"
        :key="mode.value"
        clickable
        v-close-popup
        :style="{ backgroundColor: menuBackgroundColor }"
        @click="handleViewModeChange(mode.value)"
      >
        <q-item-section avatar>
          <q-icon
            :name="mode.icon"
            :style="{
              color: currentViewMode === mode.value ? 'var(--nexa-ui-primary)' : 'var(--nexa-text-secondary)',
            }"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label
            :style="{
              color: currentViewMode === mode.value ? 'var(--nexa-text-primary)' : 'var(--nexa-text-secondary)',
              fontWeight: currentViewMode === mode.value ? 'bold' : 'normal',
            }"
          >
            {{ mode.label }}
          </q-item-label>
        </q-item-section>
        <q-item-section side v-if="currentViewMode === mode.value">
          <q-icon name="check" color="primary" />
        </q-item-section>
      </q-item>
      <q-separator
        :style="{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          margin: '4px 0',
        }"
      />
      <!-- 뷰 모드 관리 -->
      <q-item clickable v-close-popup :style="{ backgroundColor: menuBackgroundColor }" @click="handleOpenSettings">
        <q-item-section avatar>
          <q-icon name="settings" :style="{ color: 'var(--nexa-ui-primary)' }" />
        </q-item-section>
        <q-item-section>
          <q-item-label :style="{ color: 'var(--nexa-text-primary)' }">뷰 모드 관리...</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup>
import { computed } from 'vue'
import { VIEW_MODE_OPTIONS } from './config/viewModeSettings'

defineProps({
  // 현재 선택된 뷰 모드
  currentViewMode: {
    type: String,
    required: true,
  },
  // 메뉴 배경색
  menuBackgroundColor: {
    type: String,
    default: 'var(--nexa-surface)',
  },
})

const emit = defineEmits([
  'view-mode-change', // 뷰 모드 변경 시
  'open-settings', // 뷰 모드 설정 열기 시
])

// 활성화된 뷰 모드만 필터링
const enabledViewModes = computed(() => VIEW_MODE_OPTIONS.filter((mode) => mode.enabled))

// 뷰 모드 변경 핸들러
function handleViewModeChange(mode) {
  emit('view-mode-change', mode)
}

// 뷰 모드 설정 열기 핸들러
function handleOpenSettings() {
  emit('open-settings')
}
</script>

<style lang="scss" scoped>
.view-mode-dropdown {
  // 필요 시 스타일 추가
}
</style>

