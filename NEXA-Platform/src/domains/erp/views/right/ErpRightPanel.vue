<template>
  <div class="erp-right-panel">
    <!-- 공통 헤더 -->
    <StandardRightHeader title="Tools Panel" subtitle="ERP Summary & Metrics" push-icon="menu_open" />

    <div class="panel-scroll-area">
      <div class="q-pa-md">
        <div class="text-subtitle2 text-primary q-mb-sm">ERP SUMMARY</div>
        <q-card flat bordered class="bg-surface">
          <q-card-section>
            <div class="text-caption text-grey-7">현재 프로젝트</div>
            <div class="text-h6">NEXA-PLATFORM-V2</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="row justify-between q-mb-sm">
              <span>진행률</span>
              <span class="text-weight-bold">45%</span>
            </div>
            <q-linear-progress :value="0.45" color="primary" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import StandardRightHeader from '@frame/layout/components/StandardRightHeader.vue'
</script>

<style lang="scss" scoped>
.erp-right-panel {
  height: 100%;
  display: flex;
  flex-direction: column;

  .panel-scroll-area {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
  }
}
</style>
