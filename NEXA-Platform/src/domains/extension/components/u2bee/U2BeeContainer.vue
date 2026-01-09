<template>
  <div ref="containerRef" class="u2bee-container">
    <slot />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useContainerQuery } from '@system/composables/extension/u2bee/useContainerQuery.js'

const containerRef = ref(null)

// Container Queries 기반 환경 감지
const { layoutMode, isPopup, isSidePanel, isDesktop, isMobile } = useContainerQuery(containerRef)

// 레이아웃 모드 전달 (자식 컴포넌트에서 사용 가능)
defineExpose({
  layoutMode,
  isPopup,
  isSidePanel,
  isDesktop,
  isMobile,
})
</script>

<style lang="scss" scoped>
// Container Query 헬퍼 클래스는 _helpers.scss에서 정의
</style>
