<!-- StandardRightHeader.vue
  오른쪽 사이드바 도메인 표준 헤더 컴포넌트
  - 구성: 제목(Title) + 보조문구(Subtitle) + Push/Overlay 모드 전환 버튼
-->
<template>
  <div class="standard-right-header">
    <!-- 상단 헤더 -->
    <div class="tools-panel-header">
      <div class="header-content">
        <div class="tools-panel-title-container">
          <div class="tools-panel-title">{{ title }}</div>
          <div class="tools-panel-subtitle text-caption text-grey-7">{{ subtitle }}</div>
        </div>
        <!-- 액션 슬롯 (필요 시 확장) -->
        <div class="action-section">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>

    <!-- Push/Overlay 모드 전환 버튼 -->
    <div class="mode-toggle-section q-pa-sm">
      <q-btn-toggle
        v-model="sidePanelMode"
        :options="[
          { label: 'Push', value: 'push', icon: pushIcon },
          { label: 'Overlay', value: 'overlay', icon: 'layers' },
        ]"
        spread
        no-caps
        unelevated
        class="nexa-mode-toggle full-width"
      />
    </div>
    <q-separator class="header-separator" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useUserSettingsStore } from '@system/store/userSettingsStore'

defineProps({
  title: {
    type: String,
    default: 'Tools Panel',
  },
  subtitle: {
    type: String,
    default: '',
  },
  pushIcon: {
    type: String,
    default: 'menu_open',
  },
})

const userSettings = useUserSettingsStore()
const sidePanelMode = ref(userSettings.settings.drawer.rightMode)

// 모드 변경 시 store에도 반영
watch(sidePanelMode, (val) => {
  userSettings.setRightDrawerMode(val)
})

// userSettings 값이 바뀌면 toggle UI도 동기화
watch(
  () => userSettings.settings.drawer.rightMode,
  (val) => {
    sidePanelMode.value = val
  },
)
</script>

<style lang="scss" scoped>
.standard-right-header {
  .tools-panel-header {
    min-height: 60px;

    display: flex;
    align-items: center;
    padding: 16px 20px 8px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
      gap: 12px;
    }
  }

  .tools-panel-title-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .tools-panel-title {
    font-size: 2.2em;
    font-weight: 700;
    color: var(--nexa-text-primary);
    letter-spacing: 1px;
    line-height: 1;
    text-transform: uppercase;
  }

  .tools-panel-subtitle {
    font-size: 1em;
    line-height: 1;
  }
}
</style>
