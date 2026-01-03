<template>
  <U2BeeContainer>
    <q-page class="u2bee-page">
      <!-- 충분한 공간 - 모든 메뉴 구성 -->
      <div class="u2bee-desktop-layout">
        <!-- 사이드바 + 메인 콘텐츠 + 우측 패널 (필요시) -->
        <div class="u2bee-desktop-content">
          <aside class="u2bee-desktop-sidebar">
            <slot name="sidebar">
              <!-- 사이드바 슬롯 -->
            </slot>
          </aside>

          <main class="u2bee-desktop-main">
            <slot name="main">
              <!-- 메인 콘텐츠 슬롯 -->
            </slot>
          </main>

          <aside v-if="$slots.rightPanel" class="u2bee-desktop-right-panel">
            <slot name="rightPanel">
              <!-- 우측 패널 슬롯 -->
            </slot>
          </aside>
        </div>
      </div>
    </q-page>
  </U2BeeContainer>
</template>

<script setup>
import U2BeeContainer from './U2BeeContainer.vue'
</script>

<style lang="scss" scoped>
.u2bee-desktop-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.u2bee-desktop-content {
  display: flex;
  flex: 1;
  min-height: 0;
}

.u2bee-desktop-sidebar {
  width: 250px;
  flex-shrink: 0;
  border-right: 1px solid var(--nexa-border-color);
  overflow-y: auto;
}

.u2bee-desktop-main {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 16px;
}

.u2bee-desktop-right-panel {
  width: 300px;
  flex-shrink: 0;
  border-left: 1px solid var(--nexa-border-color);
  overflow-y: auto;
}
</style>
