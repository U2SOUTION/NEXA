<template>
  <router-view />
  <!-- 전역 스켈레톤 로더 -->
  <GlobalSkeletonLoader />
</template>

<script setup>
import GlobalSkeletonLoader from '@system/components/ui/GlobalSkeletonLoader.vue'
</script>
