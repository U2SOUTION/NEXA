<template>
  <div class="parts-management-right-panel">
    <!-- 공통 헤더 -->
    <StandardRightHeader title="Tools Panel" subtitle="Parts Management Tools" push-icon="menu_open" />

    <q-scroll-area class="panel-scroll-area">
      <div class="q-pa-md">
        <div class="text-subtitle2 text-primary q-mb-sm">PARTS INFO</div>
        <q-card flat bordered class="bg-surface">
          <q-card-section>
            <div class="text-caption text-grey-7">최근 작업</div>
            <div class="text-body2">부품 입고 처리 완료</div>
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
.parts-management-right-panel {
  height: 100%;
  display: flex;
  flex-direction: column;

  .panel-scroll-area {
    flex: 1;
  }
}
</style>
