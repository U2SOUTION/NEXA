<!-- U2BEE 전용 레이아웃 (크롬 확장 프로그램용) -->
<template>
  <div class="u2bee-layout-container">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserSettingsStore } from '@system/store/userSettingsStore.js'

// U2BEE 전용 레이아웃 - 헤더, 사이드바, 푸터 없이 컨텐츠 영역만 표시

// 테마 초기화 (Quasar 다크 모드 상속)
const userSettings = useUserSettingsStore()

onMounted(() => {
  // 테마 초기화 (사용자 설정에서 다크 모드 상태 로드)
  userSettings.initializeTheme()
})
</script>

<style lang="scss">
// U2BEE Layout 전용 스타일은 u2bee-layout.scss에서 통합 관리
@import 'src/system/css/extension/u2bee-layout.scss';
</style>
