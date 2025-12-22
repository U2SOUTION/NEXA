<template>
  <router-view />
  <!-- 전역 스켈레톤 로더 -->
  <GlobalSkeletonLoader />
</template>

<script setup>
import GlobalSkeletonLoader from 'src/components/ui/GlobalSkeletonLoader.vue'
</script>
