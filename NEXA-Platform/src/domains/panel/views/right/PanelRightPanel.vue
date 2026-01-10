<template>
  <div class="panel-right-panel">
    <!-- 공통 헤더 -->
    <StandardRightHeader title="Tools Panel" subtitle="Panel Configuration & Details" push-icon="menu_open" />

    <q-scroll-area class="panel-scroll-area">
      <div class="q-pa-md">
        <div class="text-subtitle2 text-primary q-mb-sm">PANEL DETAILS</div>
        <q-card flat bordered class="bg-surface">
          <q-card-section>
            <div class="text-caption text-grey-7">속성 및 설정</div>
            <div class="text-body2">선택된 패널의 세부 설정이 여기에 표시됩니다.</div>
          </q-card-section>
        </q-card>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup>
import { QScrollArea } from 'quasar'
import StandardRightHeader from '@frame/layout/components/StandardRightHeader.vue'
</script>

<style lang="scss" scoped>
.panel-right-panel {
  height: 100%;
  display: flex;
  flex-direction: column;

  .panel-scroll-area {
    flex: 1;
  }
}
</style>
