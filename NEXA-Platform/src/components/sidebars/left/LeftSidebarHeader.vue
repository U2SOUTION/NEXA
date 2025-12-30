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
            <div v-if="titleLink" class="text-h4 sidebar-title q-mb-xs text-bold">
              <a href="#" class="title-link" @click.prevent="handleTitleClick">{{ title }}</a>
            </div>
            <div v-else class="text-h4 sidebar-title q-mb-xs text-bold">{{ title }}</div>
            <div class="text-caption sidebar-subtitle">{{ subtitle }}</div>
          </div>
          <div v-if="showRestoreOption" class="header-options">
            <q-btn :icon="restoreLastMenu ? 'restore' : 'memory'" :color="restoreLastMenu ? 'primary' : 'grey-7'" flat dense round size="md" @click="toggleRestoreOption">
              <q-tooltip>
                {{ restoreLastMenu ? '마지막 사용 메뉴 기억' : '마지막 사용 메뉴 기억 안 함' }}
              </q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
      <q-separator />
    </q-list>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  titleLink: {
    type: String,
    default: null,
  },
  showRestoreOption: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['header-hover', 'title-click'])

// 이전 메뉴 복원 옵션
const RESTORE_OPTION_KEY = 'dev-restore-last-menu'
const restoreLastMenu = ref(true) // 기본값: true (이전 메뉴 복원)

// 설정 로드
function loadRestoreOption() {
  try {
    const saved = localStorage.getItem(RESTORE_OPTION_KEY)
    if (saved !== null) {
      restoreLastMenu.value = saved === 'true'
    }
  } catch (error) {
    console.error('[LeftSidebarHeader] 설정 로드 실패:', error)
  }
}

// 설정 저장
function saveRestoreOption(value) {
  try {
    localStorage.setItem(RESTORE_OPTION_KEY, value.toString())
  } catch (error) {
    console.error('[LeftSidebarHeader] 설정 저장 실패:', error)
  }
}

// 타이틀 클릭 핸들러
function handleTitleClick() {
  emit('title-click')
}

// 복원 옵션 토글 핸들러
function toggleRestoreOption() {
  restoreLastMenu.value = !restoreLastMenu.value
  saveRestoreOption(restoreLastMenu.value)
}

onMounted(() => {
  loadRestoreOption()
})
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

      .header-options {
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      .sidebar-title {
        color: var(--nexa-primary);

        .title-link {
          color: var(--nexa-primary);
          text-decoration: none;
          transition: opacity 0.2s;

          &:hover {
            opacity: 0.8;
            text-decoration: underline;
          }
        }
      }

      .sidebar-subtitle {
        color: var(--nexa-text-secondary);
      }
    }
  }
}
</style>
