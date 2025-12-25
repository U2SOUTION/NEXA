<!-- LeftSidebarHeader.vue
  왼쪽 사이드바 공통 헤더 컴포넌트
  타이틀과 부제목 표시
-->
<template>
  <div class="left-sidebar-header" @mouseenter="$emit('header-hover', true)" @mouseleave="$emit('header-hover', false)">
    <q-list>
      <div class="sidebar-header q-pa-md">
        <div class="header-content">
          <div class="title-container">
            <div class="text-h4 sidebar-title q-mb-xs text-bold">{{ title }}</div>
            <div class="text-caption sidebar-subtitle">{{ subtitle }}</div>
          </div>
          <div class="toggle-container" @click="handleToggle">
            <span class="toggle-label">LEFT NAV</span>
            <q-btn flat dense round icon="double_arrow" class="toggle-btn">
              <q-tooltip>{{ shortcutDisplay }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
      <q-separator />
    </q-list>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDashboardLayoutStore } from 'src/stores/dashboardLayoutStore'
import { useGlobalShortcuts } from 'src/composables/useGlobalShortcuts'

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
})

defineEmits(['header-hover'])

const dashboardLayoutStore = useDashboardLayoutStore()
const { getShortcutSetting } = useGlobalShortcuts()

// 단축키 정보 가져오기
const shortcutDisplay = computed(() => {
  const setting = getShortcutSetting('toggleLeftSidebarCtrlLeft')
  if (setting && setting.combo) {
    return setting.combo
  }
  // 기본값
  return 'ctrl+left'
})

function handleToggle() {
  dashboardLayoutStore.toggleMainNavigation()
}
</script>

<style lang="scss" scoped>
.left-sidebar-header {
  .sidebar-header {
    background: var(--nexa-background-darker);
    border-bottom: 1px solid var(--nexa-border-color);

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;

      .title-container {
        flex: 1;
        min-width: 0;
      }

      .sidebar-title {
        color: var(--nexa-primary);
      }

      .sidebar-subtitle {
        color: var(--nexa-text-secondary);
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
          transform: rotate(180deg);
        }
      }
    }
  }
}
</style>
