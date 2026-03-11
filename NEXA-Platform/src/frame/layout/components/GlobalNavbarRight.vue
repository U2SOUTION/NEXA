<template>
  <div class="row items-center no-wrap">
    <!-- 컨텍스트 기능 버튼 (Slot으로 제공하여 도메인별 확장성 확보) -->
    <div class="row items-center no-wrap header-icon-group">
      <slot name="context-actions"></slot>
    </div>

    <!-- [NEXA-AUTH-01] 로그인/로그아웃 -->
    <div v-if="!authStore.isLoggedIn" class="row items-center no-wrap header-icon-group">
      <q-btn flat dense icon="login" :label="showLabels ? '로그인' : undefined" class="text-primary" @click="$router.push('/login')">
        <q-tooltip>로그인</q-tooltip>
      </q-btn>
      <q-btn flat dense icon="person_add" :label="showLabels ? '회원가입' : undefined" class="text-primary" @click="$router.push('/register')">
        <q-tooltip>회원가입</q-tooltip>
      </q-btn>
    </div>
    <div v-else class="row items-center no-wrap header-icon-group auth-user-row">
      <span class="auth-user-name text-body2 text-grey-8">{{ authStore.user?.display_name || authStore.user?.email || '사용자' }}</span>
      <q-btn flat dense icon="logout" :label="showLabels ? '로그아웃' : undefined" class="text-primary" @click="handleLogout">
        <q-tooltip>로그아웃</q-tooltip>
      </q-btn>
    </div>

    <!-- 공통 기능 버튼 -->
    <div class="row items-center no-wrap header-icon-group">
      <q-btn flat dense :icon="leftSidebarOpen ? 'left_panel_close' : 'left_panel_open'" :label="showLabels ? '왼쪽 사이드바' : undefined" class="text-primary" @click="$emit('toggle-left')">
        <q-tooltip>왼쪽 사이드바 {{ leftSidebarOpen ? '닫기' : '열기' }} (Ctrl+B)</q-tooltip>
      </q-btn>
      <q-btn flat dense :icon="rightSidebarOpen ? 'right_panel_close' : 'right_panel_open'" :label="showLabels ? '사이드패널' : undefined" class="text-primary" @click="$emit('toggle-right')">
        <q-tooltip>오른쪽 사이드 패널 {{ rightSidebarOpen ? '닫기' : '열기' }} (Ctrl+])</q-tooltip>
      </q-btn>
      <q-btn flat dense :icon="isDarkMode ? 'light_mode' : 'dark_mode'" :label="showLabels ? '테마전환' : undefined" class="text-primary" @click="$emit('toggle-theme')">
        <q-tooltip>{{ isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환' }}</q-tooltip>
      </q-btn>

      <q-btn flat dense icon="account_circle" :label="showLabels ? 'MY' : undefined" class="text-primary" @click="$router.push('/my')">
        <q-tooltip>MY</q-tooltip>
      </q-btn>

      <q-btn flat dense icon="settings" :label="showLabels ? '설정' : undefined" class="text-primary" @click="$router.push('/settings')">
        <q-tooltip>설정</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@system/store/authStore'

const authStore = useAuthStore()

defineProps({
  leftSidebarOpen: { type: Boolean, default: true },
  rightSidebarOpen: { type: Boolean, default: false },
  isDarkMode: { type: Boolean, default: false },
  showLabels: { type: Boolean, default: false },
})

defineEmits(['toggle-left', 'toggle-right', 'toggle-theme'])

onMounted(() => {
  authStore.init()
})

async function handleLogout() {
  await authStore.logout()
  window.location.href = '/' // 토큰 제거 후 새로고침하여 상태 일관
}
</script>

<style lang="scss" scoped>
/* 아이콘 메뉴 그룹 */
.header-icon-group {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 4px;
}

.header-icon-group :deep(.q-btn) {
  white-space: nowrap;
  flex-shrink: 0;

  /* 동적으로 조절되는 패딩과 마진 */
  padding: clamp(2px, 0.1vw, 8px);

  .q-btn__content {
    flex-wrap: nowrap;
  }
}

.auth-user-row {
  margin-right: 4px;
}
.auth-user-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 4px;
}
</style>
