<!-- LeftSidebarHeader.vue
  왼쪽 사이드바 공통 헤더 컴포넌트
  타이틀과 부제목 표시
-->
<template>
  <div class="left-sidebar-header" @mouseenter="$emit('header-hover', true)" @mouseleave="$emit('header-hover', false)">
    <q-list>
      <div class="sidebar-header">
        <div class="header-content">
          <div class="title-container">
            <div v-if="titleLink" class="text-h4 sidebar-title text-bold">
              <a href="#" class="title-link" @click.prevent="handleTitleClick">{{ title }}</a>
            </div>
            <div v-else class="text-h4 sidebar-title text-bold">{{ title }}</div>
            <div class="text-caption sidebar-subtitle">{{ subtitle }}</div>
            <div v-if="routeUrl" class="route-url-container">
              <div class="text-caption route-url" @click="handleRouteUrlClick">
                <q-icon name="link" size="12px" class="q-mr-xs" />
                <span class="route-url-text">{{ routeUrl }}</span>
                <q-icon name="content_copy" size="12px" class="q-ml-xs copy-icon" />
              </div>
            </div>
          </div>
          <div v-if="showRestoreOption" class="header-options">
            <q-btn :icon="restoreLastMenu ? 'restore' : 'memory'" :class="{ 'btn-active': restoreLastMenu, 'btn-inactive': !restoreLastMenu }" flat dense round size="md" @click="toggleRestoreOption">
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
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
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
  routeUrl: {
    type: String,
    default: null,
  },
  fullUrl: {
    type: String,
    default: null,
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

// 라우터 URL 클릭 핸들러 (클립보드 복사)
async function handleRouteUrlClick() {
  // props.fullUrl이 있으면 사용, 없으면 현재 window.location.href 사용
  const fullUrl = props.fullUrl || window.location.href

  try {
    await navigator.clipboard.writeText(fullUrl)
    $q.notify({
      type: 'positive',
      message: 'URL이 클립보드에 복사되었습니다',
      position: 'top',
      timeout: 2000,
      icon: 'content_copy',
    })
  } catch {
    // Fallback: 구형 브라우저 지원
    try {
      const textArea = document.createElement('textarea')
      textArea.value = fullUrl
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      $q.notify({
        type: 'positive',
        message: 'URL이 클립보드에 복사되었습니다',
        position: 'top',
        timeout: 2000,
        icon: 'content_copy',
      })
    } catch {
      $q.notify({
        type: 'negative',
        message: '복사 실패',
        position: 'top',
        timeout: 2000,
      })
    }
  }
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
    padding: 16px 6px 16px 16px; // 상하좌우 패딩 (q-pa-md 대체)

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0px;

      .title-container {
        flex: 1;
        min-width: 0;
      }

      .header-options {
        .btn-active {
          color: var(--nexa-primary);
        }

        .btn-inactive {
          color: var(--nexa-text-secondary);
        }
      }

      .sidebar-title {
        color: var(--nexa-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1;
        margin-bottom: 1px; // 서브 타이틀과의 간격 최소화

        .title-link {
          color: var(--nexa-primary);
          text-decoration: none;
          transition: opacity 0.2s;
          line-height: 1;

          &:hover {
            opacity: 0.8;
            text-decoration: underline;
          }
        }
      }

      .sidebar-subtitle {
        color: var(--nexa-text-secondary);
        line-height: 1;
        margin-top: 0; // 상단 마진 제거
      }

      .route-url {
        display: flex;
        align-items: center;
        color: var(--nexa-text-hint);
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s ease;
        user-select: none;

        &:hover {
          background: var(--nexa-surface);
          color: var(--nexa-text-primary);
        }

        .route-url-text {
          font-family: monospace;
          font-size: 11px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
        }

        .copy-icon {
          opacity: 0.6;
          transition: opacity 0.2s ease;
        }

        &:hover .copy-icon {
          opacity: 1;
        }
      }
    }
  }
}
</style>
