<template>
  <div class="row items-center no-wrap q-mr-md">
    <!-- 로고 버튼: 클릭 시 홈으로 이동 -->
    <q-btn flat dense class="nexa-logo-btn" @click="$emit('tab-click', { route: '/', name: 'home' })">
      <img src="/LOGO.svg" alt="NEXA" class="nexa-logo" />
      <q-menu>
        <q-list>
          <q-item v-for="tab in menuTabs" :key="tab.name" clickable v-close-popup @click="$emit('tab-click', tab)">
            <q-item-section avatar v-if="tab.icon">
              <q-icon :name="tab.icon" />
            </q-item-section>
            <q-item-section>
              <div class="nexa-menu-content" :class="{ 'has-nexa-prefix': tab.nexaPrefix }">
                <span v-if="tab.nexaPrefix" class="nexa-prefix">NEXA</span>
                <span class="nexa-menu-label">{{ tab.displayLabel || tab.label }}</span>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>

    <!-- 메인 메뉴 탭 -->
    <q-tabs ref="mainMenuTabsRef" :model-value="currentMenu" dense class="text-primary main-menu-tabs" active-color="primary" indicator-color="primary" align="left">
      <q-route-tab v-for="tab in menuTabs" :key="tab.name" :to="tab.route" :name="tab.name" :icon="showTabIcons ? tab.icon : undefined" :exact="tab.exact" :style="{ display: hiddenTabNames.has(tab.name) ? 'none' : 'flex' }" @click="tab.onClick ? tab.onClick() : undefined">
        <div class="nexa-tab-content" :class="{ 'has-nexa-prefix': tab.nexaPrefix }">
          <span v-if="tab.nexaPrefix" class="nexa-prefix">NEXA</span>
          <span class="nexa-tab-label">{{ tab.displayLabel || tab.label }}</span>
        </div>
      </q-route-tab>
    </q-tabs>

    <!-- 메인 메뉴 더보기 -->
    <div v-if="isOverflowing && hiddenTabs.length > 0" class="row items-center q-ml-sm main-menu-more-button">
      <q-btn flat dense icon="more_horiz" :label="showLabels ? '더보기' : undefined" class="text-primary">
        <q-tooltip>더보기 ({{ hiddenTabs.length }})</q-tooltip>
        <q-menu>
          <q-list>
            <q-item v-for="tab in hiddenTabs" :key="tab.name" clickable v-close-popup @click="$emit('tab-click', tab)">
              <q-item-section avatar v-if="tab.icon">
                <q-icon :name="tab.icon" />
              </q-item-section>
              <q-item-section>
                <div class="nexa-menu-content" :class="{ 'has-nexa-prefix': tab.nexaPrefix }">
                  <span v-if="tab.nexaPrefix" class="nexa-prefix">NEXA</span>
                  <span class="nexa-menu-label">{{ tab.displayLabel || tab.label }}</span>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, defineExpose, computed } from 'vue'

defineProps({
  menuTabs: { type: Array, required: true },
  currentMenu: { type: String, required: true },
  showLabels: { type: Boolean, default: false },
  showTabIcons: { type: Boolean, default: false },
  isOverflowing: { type: Boolean, default: false },
  hiddenTabs: { type: Array, default: () => [] },
  hiddenTabNames: { type: Set, default: () => new Set() },
})

defineEmits(['tab-click'])

const mainMenuTabsRef = ref(null)

// 부모(MainLayout)에서 탭 영역의 DOM 요소에 접근할 수 있도록 노출
defineExpose({
  $el: computed(() => mainMenuTabsRef.value?.$el),
})
</script>

<style lang="scss" scoped>
/* NEXA svg logo 크기 조절*/
.nexa-logo {
  display: block;
  width: 42px;
  height: 26px;
  transform: scaleX(1.6);
  object-fit: contain;
  object-position: left center;
  transform-origin: left center;
  transition: filter var(--transition-duration, 0.2s) ease;
  filter: brightness(1);
}

/* 로고 버튼 스타일 */
.nexa-logo-btn {
  cursor: pointer;
  transition: all var(--transition-duration, 0.2s) ease;
  padding: 5px;
  margin: 0;
  background: transparent;
  width: auto;
  min-width: auto;
  height: auto;

  &:hover .nexa-logo {
    filter: brightness(2.5) drop-shadow(0 0 4px var(--nexa-primary));
  }
}

/* 메인 메뉴 탭 공통 */
.main-menu-tabs.q-tabs {
  min-height: auto;
  height: auto;
}

.main-menu-tabs :deep(.q-tab) {
  /* 화면이 작아질수록 패딩과 자간을 줄여 "더보기" 발생 지연 */
  padding-left: clamp(4px, 0.5vw, 20px);
  padding-right: clamp(4px, 0.5vw, 20px);
  letter-spacing: clamp(-0.5px, 0.05vw, 0.5px);

  padding-top: 6px;
  padding-bottom: 6px;
  margin: 1px;
  white-space: nowrap;
  flex-wrap: nowrap;
  flex-shrink: 0;
  min-height: auto;
  height: auto;
  align-items: center;

  border-radius: 4px;
  background-color: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
  color: var(--nexa-text-primary);
  font-weight: 400;
  text-align: center;
  box-shadow: 0 0 1px 1px var(--nexa-shadow-3);
  transition: all 0.2s ease;

  /* 활성 탭: 강조 및 부드러운 배경 깜빡임 */
  &.q-tab--active {
    font-weight: 700;
    color: var(--nexa-primary);
    opacity: 1;
    animation: blinkBackground 4s ease-in-out infinite;
  }

  &:hover {
    background-color: var(--nexa-surface-hover);
  }
}

/* NEXA 접두어 스타일 (매우 작게 처리) */
.nexa-tab-content {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  line-height: 1;
  min-height: auto;
  gap: 0;
}

.nexa-prefix {
  font-size: 8px; /* 메뉴명보다 작게 */
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  opacity: 0.8;
  align-self: flex-start;
  padding-top: 1px;
  margin-right: 2px;
}

.nexa-tab-label {
  line-height: 1;
  white-space: nowrap;
  font-size: 13.5px;
  align-self: flex-start;
}

/* 화면이 넓을 때 접두어 띄어쓰기 강조 */
@media (min-width: 1600px) {
  .nexa-prefix {
    margin-right: 4px;
    opacity: 1;
  }
}

/* 더보기 버튼 스타일 */
.main-menu-more-button {
  flex-wrap: nowrap;
  white-space: nowrap;
}

@keyframes blinkBackground {
  0%,
  100% {
    background-color: var(--nexa-surface);
  }
  50% {
    background-color: var(--nexa-background-darker);
  }
}
</style>
