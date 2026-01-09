<template>
  <div class="erp-content q-pa-md">
    <div class="page-header q-mb-lg">
      <h1 class="text-h4 text-primary">ERP v2</h1>
      <p class="text-body1 text-grey-7">전사적 자원 관리 및 비즈니스 프로세스</p>
    </div>

    <q-tabs v-model="activeTab" align="left" dense class="text-primary">
      <q-tab name="projects" label="프로젝트" icon="folder" />
      <q-tab name="finance" label="재무" icon="account_balance" />
      <q-tab name="hr" label="인사" icon="people" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated class="bg-transparent">
      <q-tab-panel name="projects">
        <div class="text-h6">진행 중인 프로젝트</div>
        <p>프로젝트 관리 및 마일스톤 추적</p>
      </q-tab-panel>
      <q-tab-panel name="finance">
        <div class="text-h6">재무 및 회계</div>
        <p>매출, 매입 및 예산 관리</p>
      </q-tab-panel>
      <q-tab-panel name="hr">
        <div class="text-h6">인적 자원 관리</div>
        <p>조직도 및 근태 관리</p>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('projects')
</script>

<style lang="scss" scoped>
.erp-content {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
