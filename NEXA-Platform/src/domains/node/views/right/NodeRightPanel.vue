<template>
  <div class="node-right-panel">
    <!-- 공통 헤더 -->
    <StandardRightHeader title="Tools Panel" subtitle="Automation Node Properties" push-icon="menu_open" />

    <q-scroll-area class="panel-scroll-area">
      <div class="q-pa-md">
        <div class="text-subtitle2 text-primary q-mb-sm">NODE PROPERTIES</div>
        <q-card flat bordered class="bg-surface">
          <q-card-section>
            <div class="text-caption text-grey-7">선택된 노드</div>
            <div class="text-body2">노드를 선택하면 상세 속성이 여기에 표시됩니다.</div>
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
.node-right-panel {
  height: 100%;
  display: flex;
  flex-direction: column;

  .panel-scroll-area {
    flex: 1;
  }
}
</style>
