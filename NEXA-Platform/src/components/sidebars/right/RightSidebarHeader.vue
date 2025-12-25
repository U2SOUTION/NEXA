<!-- RightSidebarHeader.vue
  오른쪽 사이드바 공통 헤더 컴포넌트
  헤더와 Push/Overlay 모드 전환 버튼 포함
-->
<template>
  <div class="right-sidebar-header">
    <!-- 상단 헤더 -->
    <div class="tools-panel-header">
      <div class="header-content">
        <div class="tools-panel-title-container">
          <span class="tools-panel-title">{{ title }}</span>
          <span class="tools-panel-subtitle">{{ subtitle }}</span>
        </div>
        <div class="toggle-container" @click="handleToggle">
          <span class="toggle-label">RIGHT PANEL</span>
          <q-btn flat dense round :icon="pushIcon" class="toggle-btn">
            <q-tooltip>{{ shortcutDisplay }}</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>
    <!-- Push/Overlay 모드 전환 버튼 -->
    <!-- TODO: Push 모드 아이콘을 커스텀 아이콘으로 교체 예정 (현재: double_arrow) -->
    <div class="q-pa-sm">
      <q-btn-toggle
        v-model="sidePanelMode"
        :options="[
          { label: 'Push', value: 'push', icon: pushIcon },
          { label: 'Overlay', value: 'overlay', icon: 'layers' },
        ]"
        spread
        no-caps
        unelevated
        toggle-color="primary"
        color="grey-3"
        text-color="grey-8"
        class="full-width"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUserSettingsStore } from 'src/stores/userSettingsStore'
import { useGlobalShortcuts } from 'src/composables/useGlobalShortcuts'
import { QBtnToggle } from 'quasar'

const { title, subtitle, pushIcon } = defineProps({
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
    default: 'double_arrow', // 기본값, 필요시 커스텀 아이콘으로 교체 가능
  },
})

const userSettings = useUserSettingsStore()
const { getShortcutSetting } = useGlobalShortcuts()
const sidePanelMode = ref(userSettings.settings.drawer.rightMode)

// 단축키 정보 가져오기
const shortcutDisplay = computed(() => {
  const setting = getShortcutSetting('toggleRightSidebarCtrlRight')
  if (setting && setting.combo) {
    return setting.combo
  }
  // 기본값
  return 'ctrl+right'
})

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

// 사이드바 토글 함수
function handleToggle() {
  userSettings.setRightDrawerOpen(!userSettings.settings.drawer.rightOpen)
}
</script>

<style lang="scss" scoped>
.right-sidebar-header {
  .tools-panel-header {
    height: 60px;
    background: var(--nexa-header-bg);
    display: flex;
    align-items: center;
    padding: 0 20px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 12px;
    }
  }

  .tools-panel-title-container {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-top: 12px;
    flex: 1;
    min-width: 0;
  }

  .tools-panel-title {
    font-size: 2.2em;
    font-weight: 500;
    color: var(--nexa-text-primary);
    letter-spacing: 1px;
    line-height: 0.8;
  }

  .tools-panel-subtitle {
    font-size: 0.8em;
    color: var(--nexa-text-secondary);
    letter-spacing: 0.5px;
    font-weight: 400;
  }

  .toggle-container {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
    cursor: pointer;
    user-select: none;
  }

  .toggle-label {
    font-size: 0.75em;
    font-weight: 600;
    color: var(--nexa-primary);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin: 0;
    padding: 0;
  }

  .toggle-btn {
    color: var(--nexa-primary);
    font-weight: 900;
    margin: 0;
    padding: 0;
    min-width: 0;

    :deep(.q-btn__wrapper) {
      padding: 0;
      min-height: 0;
    }

    :deep(.q-btn__content) {
      padding: 0;
    }

    :deep(.q-icon) {
      font-weight: 900;
      font-size: 1.5em;
      margin: 0;
    }
  }
}
</style>
