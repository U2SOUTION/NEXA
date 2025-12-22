<template>
  <div class="database-viewer-content">
    <div class="coming-soon-wrapper">
      <div class="coming-soon-content">
        <q-icon name="storage" size="80px" color="grey-7" class="q-mb-md" />
        <h2 class="coming-soon-title">데이터베이스</h2>
        <p class="coming-soon-description">이 기능은 곧 출시될 예정입니다.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// DatabaseViewerContent.vue - 데이터베이스 뷰어
</script>

<style lang="scss" scoped>
.database-viewer-content {
  height: 100%;
}

.coming-soon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.coming-soon-content {
  text-align: center;
  padding: 2rem;
}

.coming-soon-title {
  color: var(--nexa-text-primary);
  font-size: 2rem;
  font-weight: 600;
  margin: 1rem 0;
}

.coming-soon-description {
  color: var(--nexa-text-secondary);
  font-size: 1rem;
  margin: 0;
}
</style>

