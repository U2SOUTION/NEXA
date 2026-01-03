<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="u2bee-settings">
    <div class="settings-header q-mb-md">
      <div class="text-h6">설정</div>
      <div class="text-body2 text-grey-7">U2BEE 설정을 관리합니다</div>
    </div>

    <!-- 일반 설정 (목업) -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">일반 설정</div>
        <q-list bordered separator>
          <q-item>
            <q-item-section>
              <q-item-label>자동 수집</q-item-label>
              <q-item-label caption>콘텐츠를 자동으로 수집합니다</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="mockSettings.autoCollect" />
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>알림</q-item-label>
              <q-item-label caption>알림을 표시합니다</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="mockSettings.notifications" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- 탭 구성 설정 -->
    <div class="q-mb-md">
      <TabCustomizer />
    </div>

    <!-- 테마 설정 (목업) -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">테마</div>
        <q-list bordered separator>
          <q-item>
            <q-item-section>
              <q-item-label>테마 모드</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select v-model="mockSettings.theme" :options="themeOptions" dense outlined style="min-width: 120px" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- 데이터 관리 설정 (목업) -->
    <q-card>
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">데이터 관리</div>
        <q-list bordered separator>
          <q-item>
            <q-item-section>
              <q-item-label>자동 정리</q-item-label>
              <q-item-label caption>오래된 데이터를 자동으로 정리합니다</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="mockSettings.autoClean" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TabCustomizer from './TabCustomizer.vue'

// 목업 데이터
const mockSettings = ref({
  autoCollect: true,
  notifications: true,
  theme: 'auto',
  autoClean: false,
})

const themeOptions = ['light', 'dark', 'auto']
</script>

<style lang="scss" scoped>
.u2bee-settings {
  padding: 16px;

  .settings-header {
    margin-bottom: 16px;
  }
}
</style>
