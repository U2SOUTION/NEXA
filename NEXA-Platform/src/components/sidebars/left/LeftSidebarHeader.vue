<!-- LeftSidebarHeader.vue
  왼쪽 사이드바 공통 헤더 컴포넌트
  2단 구조: 메인 메뉴 (클릭: 메인 페이지) / 서브 메뉴 (클릭: URL 복사) / 설명
-->
<template>
  <div class="left-sidebar-header" @mouseenter="$emit('header-hover', true)" @mouseleave="$emit('header-hover', false)">
    <q-list>
      <div class="sidebar-header">
        <div class="header-content">
          <div class="title-container">
            <!-- 메인 메뉴와 서브 메뉴 (한 줄에 배치, 아래 정렬) -->
            <div class="menu-title-row">
              <div class="text-h4 main-menu-title text-bold" @click="handleMainMenuClick">
                {{ mainMenuTitle }}
              </div>
              <div v-if="subMenuTitle" class="text-subtitle1 sub-menu-title" @click="handleSubMenuClick">
                {{ subMenuTitle }}
              </div>
            </div>
            <!-- 설명 (클릭 불가) -->
            <div class="text-caption sidebar-subtitle">{{ subtitle }}</div>
          </div>
        </div>
      </div>
      <q-separator />
    </q-list>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  mainMenuTitle: {
    type: String,
    default: 'DEV',
  },
  subMenuTitle: {
    type: String,
    default: null,
  },
  subtitle: {
    type: String,
    required: true,
  },
  fullUrl: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['header-hover', 'main-menu-click', 'sub-menu-click'])

// 메인 메뉴 클릭 핸들러 (메인 페이지로 이동)
function handleMainMenuClick() {
  emit('main-menu-click')
}

// 서브 메뉴 클릭 핸들러 (URL 복사)
async function handleSubMenuClick() {
  const fullUrl = props.fullUrl || window.location.href

  try {
    await navigator.clipboard.writeText(fullUrl)
    $q.notify({
      type: 'positive',
      message: 'URL이 클립보드에 복사되었습니다',
      position: 'top',
      timeout: 2000,
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

      // 메인 메뉴와 서브 메뉴를 한 줄에 배치
      .menu-title-row {
        display: flex;
        align-items: baseline; // 아래 정렬
        gap: 1px; // 메인 메뉴와 서브 메뉴 사이 간격
        margin-bottom: 0px;
      }

      // 메인 메뉴 (DEV)
      .main-menu-title {
        color: var(--nexa-primary);
        white-space: nowrap;
        overflow: hidden;
        //text-overflow: ellipsis;
        line-height: 1;
        cursor: pointer;
        transition: opacity 0.2s ease;

        &:hover {
          opacity: 0.8;
          text-decoration: underline;
        }
      }

      // 서브 메뉴 (현재 메뉴 이름)
      .sub-menu-title {
        color: var(--nexa-text-primary);
        white-space: nowrap;
        overflow: hidden;
        //text-overflow: ellipsis;
        line-height: 1;
        cursor: pointer;
        transition: all 0.2s ease;
        border-radius: 4px;
        padding: 2px 4px;
        margin-left: 0; // gap으로 간격 처리

        &:hover {
          background: var(--nexa-surface);
          color: var(--nexa-primary);
        }
      }

      // 설명
      .sidebar-subtitle {
        color: var(--nexa-text-secondary);
        line-height: 1.2;
        margin-top: 0;
      }
    }
  }
}
</style>
