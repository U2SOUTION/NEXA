<template>
  <router-view />
  <!-- 전역 스켈레톤 로더 -->
  <GlobalSkeletonLoader />
</template>

<script setup>
import GlobalSkeletonLoader from '@components/ui/GlobalSkeletonLoader.vue'
</script>
