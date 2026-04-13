<template>
  <div class="nexeed-left-nav">
    <div class="drawer-title">
      NEXA NEXEED
      <div class="drawer-subtitle">NAVIGATION</div>
    </div>
    <q-list padding>
      <q-item clickable v-ripple>
        <q-item-section avatar><q-icon name="event" /></q-item-section>
        <q-item-section>이벤트 로그</q-item-section>
      </q-item>
      <q-item clickable v-ripple>
        <q-item-section avatar><q-icon name="timeline" /></q-item-section>
        <q-item-section>데이터 흐름</q-item-section>
      </q-item>
      <q-separator spaced />
      <q-item-label header>필터</q-item-label>
      <q-item clickable v-ripple>
        <q-item-section avatar><q-icon name="filter_alt" /></q-item-section>
        <q-item-section>시간 범위</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
// NexeedLeftNav
</script>

<style lang="scss" scoped>
.nexeed-left-nav {
  height: 100%;
}
</style>
