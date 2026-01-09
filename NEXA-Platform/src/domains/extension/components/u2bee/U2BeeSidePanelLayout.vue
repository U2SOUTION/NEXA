<template>
  <U2BeeContainer>
    <q-page class="u2bee-page">
      <!-- 세로 아코디언 메뉴 또는 세로 탭 메뉴 (Container Queries로 자동 적용) -->
      <!-- 옵션 1: 세로 탭 메뉴 -->
      <q-tabs v-if="menuType === 'tabs'" v-model="activeTab" vertical dense class="u2bee-tabs">
        <slot name="tabs" :activeTab="activeTab">
          <!-- 기본 탭 슬롯 -->
        </slot>
      </q-tabs>

      <!-- 옵션 2: 아코디언 메뉴 -->
      <q-list v-else-if="menuType === 'accordion'" class="u2bee-accordion">
        <slot name="accordion" :activeTab="activeTab">
          <!-- 기본 아코디언 슬롯 -->
        </slot>
      </q-list>

      <!-- 메인 콘텐츠 -->
      <q-tab-panels v-if="menuType === 'tabs'" v-model="activeTab" class="u2bee-panels">
        <slot name="panels" :activeTab="activeTab">
          <!-- 기본 패널 슬롯 -->
        </slot>
      </q-tab-panels>
      <div v-else class="u2bee-panels">
        <slot name="content" :activeTab="activeTab">
          <!-- 아코디언용 콘텐츠 슬롯 -->
        </slot>
      </div>
    </q-page>
  </U2BeeContainer>
</template>

<script setup>
import { ref } from 'vue'
import U2BeeContainer from './U2BeeContainer.vue'

const props = defineProps({
  menuType: {
    type: String,
    default: 'tabs', // 'tabs' 또는 'accordion'
    validator: (value) => ['tabs', 'accordion'].includes(value),
  },
  initialTab: {
    type: String,
    default: 'rating',
  },
})

const activeTab = ref(props.initialTab)
</script>

<style lang="scss" scoped>
// Container Queries 스타일은 extension.scss에서 자동 적용
</style>
