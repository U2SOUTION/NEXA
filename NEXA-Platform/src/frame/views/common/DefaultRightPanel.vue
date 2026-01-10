<!-- DefaultRightPanel.vue
  기본 우측 사이드바 (등록되지 않은 메뉴용)
  현재는 빈 패널이지만, 향후 전역 도구나 설정 등을 추가할 수 있음
-->

<template>
  <div class="default-right-panel no-wrap">
    <!-- 공통 헤더 (헤더 + Push/Overlay 토글) -->
    <StandardRightHeader title="Tools Panel" subtitle="General System Tools" push-icon="menu_open" />
    <!-- 넥사 시간블럭 (푸시/오버레이 버튼과 동일한 구조) -->
    <div class="q-pa-sm">
      <div class="time-block-container full-width">
        <NexaBlock type="time" variant="sidebar" />
      </div>
    </div>
    <div class="default-panel-body">
      <div class="default-panel-content q-pa-md">
        <div class="text-center text-grey-6">
          <q-icon name="info" size="48px" class="q-mb-md" />
          <div class="text-h6 q-mb-sm">우측 패널</div>
          <div class="text-caption">이 메뉴에는 전용 우측 패널이 없습니다.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import StandardRightHeader from '@frame/layout/components/StandardRightHeader.vue'
import NexaBlock from '@engines/block/NexaBlock.vue'
// 기본 우측 패널 - 향후 전역 도구나 설정 등을 추가할 수 있음
</script>
