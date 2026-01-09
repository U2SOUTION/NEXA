<template>
  <U2BeeContainer>
    <q-page class="u2bee-page">
      <!-- 가로 탭 메뉴 (Container Queries로 자동 적용) -->
      <q-tabs v-model="activeTab" dense class="u2bee-tabs">
        <slot name="tabs" :activeTab="activeTab">
          <!-- 기본 탭 슬롯 (자식 컴포넌트에서 override) -->
        </slot>
      </q-tabs>

      <!-- 탭 패널 -->
      <q-tab-panels v-model="activeTab" class="u2bee-panels">
        <slot name="panels" :activeTab="activeTab">
          <!-- 기본 패널 슬롯 (자식 컴포넌트에서 override) -->
        </slot>
      </q-tab-panels>
    </q-page>
  </U2BeeContainer>
</template>

<script setup>
import { ref } from 'vue'
import U2BeeContainer from './U2BeeContainer.vue'

const props = defineProps({
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
