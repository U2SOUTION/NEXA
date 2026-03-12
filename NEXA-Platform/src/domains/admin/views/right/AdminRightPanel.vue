<!--
  [NEXA-ADMIN-01] 관리자 도메인 오른쪽 패널
  - 도메인별 보조 정보·필터·상세 폼 등
-->
<template>
  <div class="admin-right-panel column no-wrap">
    <StandardRightHeader
      title="Admin Panel"
      subtitle="보조 정보 및 필터"
      push-icon="menu_open"
    />
    <div class="panel-scroll col q-pa-sm">
      <p class="text-caption text-grey-7">
        선택한 메뉴에 따른 상세 옵션·필터가 여기에 표시됩니다.
      </p>
    </div>
  </div>
</template>

<script setup>
import StandardRightHeader from '@frame/layout/components/StandardRightHeader.vue'
</script>

<style lang="scss" scoped>
.admin-right-panel {
  height: 100%;
}
.panel-scroll {
  overflow-y: auto;
}
</style>
