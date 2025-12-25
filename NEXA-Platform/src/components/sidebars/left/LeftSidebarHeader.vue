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

// 사이드바 열림/닫힘 상태
const isOpen = computed(() => dashboardLayoutStore.mainNavigationOpen)

// 아이콘 회전 각도 (열려있으면 >> 오른쪽 방향 0deg, 닫혀있으면 << 왼쪽 방향 180deg)
const iconRotation = computed(() => {
  return isOpen.value ? '0deg' : '180deg'
})

// 호버 시 회전 각도 (반대로 회전하여 강조)
const hoverRotation = computed(() => {
  return isOpen.value ? '180deg' : '0deg'
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

        &:hover {
          .toggle-label {
            color: var(--nexa-accent);
            transition: color 0.2s ease;
          }

          .toggle-btn {
            color: var(--nexa-accent);

            :deep(.q-icon) {
              animation: shake-left 0.6s ease-in-out forwards;
              filter: drop-shadow(0 0 6px var(--nexa-accent));
            }
          }
        }
      }

      .toggle-label {
        font-size: 0.75em;
        font-weight: 600;
        color: var(--nexa-primary);
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin: 0;
        padding: 0;
        transition: color 0.2s ease;
      }

      .toggle-btn {
        color: var(--nexa-primary);
        font-weight: 900;
        margin: 0;
        padding: 0;
        min-width: 0;
        transition: color 0.2s ease;

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
          --icon-rotation: v-bind(iconRotation);
          --hover-rotation: v-bind(hoverRotation);
          transform: rotate(var(--icon-rotation));
          transition:
            transform 0.3s ease,
            filter 0.2s ease,
            color 0.2s ease;
        }
      }
    }
  }
}

// 왼쪽 사이드바 아이콘 좌우 흔들림 애니메이션 (왼쪽으로 이동하는 느낌)
@keyframes shake-left {
  0% {
    transform: translateX(0) rotate(var(--hover-rotation));
  }
  15% {
    transform: translateX(-4px) rotate(var(--hover-rotation));
  }
  30% {
    transform: translateX(3px) rotate(var(--hover-rotation));
  }
  45% {
    transform: translateX(-3px) rotate(var(--hover-rotation));
  }
  60% {
    transform: translateX(2px) rotate(var(--hover-rotation));
  }
  75% {
    transform: translateX(-2px) rotate(var(--hover-rotation));
  }
  90%,
  100% {
    transform: translateX(0) rotate(var(--hover-rotation));
  }
}
</style>
