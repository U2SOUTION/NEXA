<template>
  <div class="notification-section">
    <div class="q-pa-sm">
      <q-list>
        <q-item v-for="i in 3" :key="i" clickable v-ripple>
          <q-item-section avatar>
            <q-icon :name="getNotificationIcon(i)" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>알림 {{ i }}</q-item-label>
            <q-item-label caption>알림 내용이 여기에 표시됩니다.</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script setup>
function getNotificationIcon(index) {
  const icons = ['warning', 'info', 'error']
  return icons[index % icons.length]
}
</script>

<style lang="scss" scoped>
.notification-section {
  .q-item {
    border-bottom: 1px solid var(--nexa-border-color);

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
