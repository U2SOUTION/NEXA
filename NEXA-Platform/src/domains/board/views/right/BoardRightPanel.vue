<!-- NexaBoardToolsPanel.vue
  넥사보드 메뉴 전용 우측 도구 패널
  레이아웃, 넥사패널, 디바이스, 히스토리, 알림 관리
-->

<template>
  <div class="nexa-board-tools-panel column no-wrap">
    <!-- 공통 헤더 (헤더 + Push/Overlay 토글) -->
    <StandardRightHeader title="Tools Panel" subtitle="Control & Customize Your Dashboard" push-icon="menu_open" />
    <q-scroll-area class="col">
      <!-- 아코디언 방식으로 모든 섹션 나열 -->
      <div class="accordion-wrapper">
        <q-expansion-item icon="view_quilt" label="레이아웃" default-opened>
          <layout-section />
        </q-expansion-item>
      </div>
      <div class="accordion-wrapper">
        <q-expansion-item icon="dashboard" label="넥사패널">
          <nexa-panel-section />
        </q-expansion-item>
      </div>
      <div class="accordion-wrapper">
        <q-expansion-item icon="devices_other" label="디바이스">
          <device-section />
        </q-expansion-item>
      </div>
      <div class="accordion-wrapper">
        <q-expansion-item icon="history" label="히스토리">
          <history-section />
        </q-expansion-item>
      </div>
      <div class="accordion-wrapper">
        <q-expansion-item icon="notifications" label="알림">
          <notification-section />
        </q-expansion-item>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup>
import { QExpansionItem, QScrollArea } from 'quasar'
import StandardRightHeader from '@frame/layout/components/StandardRightHeader.vue'
import LayoutSection from '@domains/panel/components/side-panel/LayoutSection.vue'
import NexaPanelSection from '@domains/panel/components/side-panel/NexaPanelSection.vue'
import DeviceSection from '@domains/panel/components/side-panel/DeviceSection.vue'
import HistorySection from '@domains/panel/components/side-panel/HistorySection.vue'
import NotificationSection from '@domains/panel/components/side-panel/NotificationSection.vue'
</script>

<style lang="scss" scoped>
/*
 * 테마 시스템 적용
 * --------------------------------
 * 1. 배경색
 *    - q-drawer의 배경색을 자동으로 상속받음
 *    - 별도의 배경색 지정 불필요
 *
 * 2. 아코디언 스타일
 *    - 전역 스타일(_expansion-item.scss)에 의존
 *    - 컴포넌트별 커스텀 스타일은 최소화
 */
.nexa-board-tools-panel {
  height: 100%;

  .q-btn-toggle {
    border-radius: 4px;
    overflow: hidden;
    padding-left: 14px;
    padding-right: 14px;
  }
}
</style>
