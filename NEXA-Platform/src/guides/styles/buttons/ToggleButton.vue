<!-- ToggleButton.vue
  토글 버튼 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<!--
  @tags: styles 버튼, 토글 버튼
  @category: buttons
  @description: Toggle Button 샘플 컴포넌트
-->
<template>
  <div class="toggle-button-sample">
    <div class="sample-header">
      <h3 class="sample-title">토글 버튼 샘플</h3>
      <p class="sample-description">상태를 전환하는 토글 버튼 예시</p>
    </div>
    <div class="sample-container">
      <div class="button-examples">
        <q-btn-toggle v-model="toggleValue" :options="toggleOptions" />
        <q-btn-toggle v-model="iconToggle" :options="iconToggleOptions" />
        <q-toggle v-model="switchValue" label="스위치 토글" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const toggleValue = ref('option1')
const iconToggle = ref('option1')
const switchValue = ref(false)

const toggleOptions = [
  { label: '옵션 1', value: 'option1' },
  { label: '옵션 2', value: 'option2' },
  { label: '옵션 3', value: 'option3' },
]

const iconToggleOptions = [
  { label: '리스트', value: 'option1', icon: 'view_list' },
  { label: '그리드', value: 'option2', icon: 'view_module' },
  { label: '계층', value: 'option3', icon: 'account_tree' },
]
</script>

<style lang="scss" scoped>
.toggle-button-sample {
  padding: 16px;
  background-color: var(--nexa-surface);
  border-radius: 8px;

  .sample-header {
    margin-bottom: 16px;

    .sample-title {
      color: var(--nexa-text-primary);
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .sample-description {
      color: var(--nexa-text-secondary);
      font-size: 0.875rem;
    }
  }

  .sample-container {
    .button-examples {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  }
}
</style>

