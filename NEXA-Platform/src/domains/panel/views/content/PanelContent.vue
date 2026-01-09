<template>
  <div class="panel-content q-pa-md">
    <div class="page-header q-mb-lg">
      <h1 class="text-h4 text-primary q-mb-sm">NEXA PANEL v2</h1>
      <p class="text-body1 text-grey-7">패널 카탈로그 및 커스텀 패널 관리</p>
    </div>

    <q-tabs v-model="activeTab" align="left" dense class="text-primary">
      <q-tab name="device" label="디바이스 패널" icon="devices" />
      <q-tab name="project" label="프로젝트 패널" icon="folder" />
      <q-tab name="parts" label="부품 패널" icon="inventory_2" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated class="bg-transparent">
      <q-tab-panel name="device">
        <div class="text-h6">IoT 디바이스 패널</div>
        <p>실시간 데이터 시각화 패널 목록</p>
      </q-tab-panel>
      <q-tab-panel name="project">
        <div class="text-h6">비즈니스 프로젝트 패널</div>
        <p>ERP 연동 프로젝트 관리 패널 목록</p>
      </q-tab-panel>
      <q-tab-panel name="parts">
        <div class="text-h6">재고 및 부품 패널</div>
        <p>부품 관리 및 재고 현황 패널 목록</p>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('device')
</script>

<style lang="scss" scoped>
.panel-content {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
