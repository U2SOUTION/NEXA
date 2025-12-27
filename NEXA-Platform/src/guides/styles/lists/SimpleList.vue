<!-- SimpleList.vue
  간단한 리스트 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<template>
  <div class="simple-list-sample">
    <div class="sample-header">
      <h3 class="sample-title">간단한 리스트 샘플</h3>
      <p class="sample-description">기본 리스트 레이아웃 예시</p>
    </div>
    <div class="sample-container">
      <div class="list-examples">
        <q-list bordered>
          <q-item v-for="item in items" :key="item.id" clickable v-ripple>
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.title }}</q-item-label>
              <q-item-label caption>{{ item.description }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1, title: '항목 1', description: '설명 1', icon: 'inbox' },
  { id: 2, title: '항목 2', description: '설명 2', icon: 'star' },
  { id: 3, title: '항목 3', description: '설명 3', icon: 'send' },
])
</script>

<style lang="scss" scoped>
.simple-list-sample {
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
    .list-examples {
      background-color: var(--nexa-background);
    }
  }
}
</style>

