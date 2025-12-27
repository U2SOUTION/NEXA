<!-- LeftSidebarHeader.vue
  왼쪽 사이드바 공통 헤더 컴포넌트
  타이틀과 부제목 표시
-->
<template>
  <div class="left-sidebar-header" @mouseenter="$emit('header-hover', true)" @mouseleave="$emit('header-hover', false)">
    <q-list>
      <div class="sidebar-header q-pa-md">
        <div class="header-content">
          <div class="title-container">
            <div v-if="titleLink" class="text-h4 sidebar-title q-mb-xs text-bold">
              <router-link :to="titleLink" class="title-link">{{ title }}</router-link>
            </div>
            <div v-else class="text-h4 sidebar-title q-mb-xs text-bold">{{ title }}</div>
            <div class="text-caption sidebar-subtitle">{{ subtitle }}</div>
          </div>
        </div>
      </div>
      <q-separator />
    </q-list>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  titleLink: {
    type: String,
    default: null,
  },
})

defineEmits(['header-hover'])
</script>

<style lang="scss" scoped>
.left-sidebar-header {
  .sidebar-header {
    background: var(--nexa-background-darker);
    border-bottom: 1px solid var(--nexa-border-color);

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;

      .title-container {
        flex: 1;
        min-width: 0;
      }

      .sidebar-title {
        color: var(--nexa-primary);

        .title-link {
          color: var(--nexa-primary);
          text-decoration: none;
          transition: opacity 0.2s;

          &:hover {
            opacity: 0.8;
            text-decoration: underline;
          }
        }
      }

      .sidebar-subtitle {
        color: var(--nexa-text-secondary);
      }
    }
  }
}
</style>
