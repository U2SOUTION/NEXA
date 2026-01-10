<template>
  <div class="row items-center no-wrap q-mr-md">
    <q-btn flat dense class="nexa-logo-btn">
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
    <q-tabs 
      ref="mainMenuTabsRef" 
      :model-value="currentMenu" 
      dense 
      class="text-primary main-menu-tabs" 
      active-color="primary" 
      indicator-color="primary" 
      align="left"
    >
      <q-route-tab 
        v-for="tab in menuTabs" 
        :key="tab.name" 
        :to="tab.route" 
        :name="tab.name" 
        :icon="showTabIcons ? tab.icon : undefined" 
        :exact="tab.exact" 
        :style="{ display: hiddenTabNames.has(tab.name) ? 'none' : 'flex' }"
        @click="tab.onClick ? tab.onClick() : undefined"
      >
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
defineProps({
  menuTabs: { type: Array, required: true },
  currentMenu: { type: String, required: true },
  showLabels: { type: Boolean, default: false },
  showTabIcons: { type: Boolean, default: false },
  isOverflowing: { type: Boolean, default: false },
  hiddenTabs: { type: Array, default: () => [] },
  hiddenTabNames: { type: Set, default: () => new Set() }
})

defineEmits(['tab-click'])
</script>
