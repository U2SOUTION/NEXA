<template>
  <div class="erp-right-panel q-pa-md">
    <div class="text-subtitle1 text-primary q-mb-md">ERP SUMMARY</div>
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
</template>

<style lang="scss" scoped>
.erp-right-panel {
  height: 100%;
}
</style>
