<!--
  [NEXA-ADMIN-01] 관리자 도메인 중앙 컨텐츠
  - activeSection에 따라 섹션 컴포넌트 전환
-->
<template>
  <div class="admin-content q-pa-md">
    <component :is="currentSectionComponent" />
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { storeToRefs } from 'pinia'
import { useAdminStore } from '../../store/adminStore'
import type { AdminSectionId } from '../../store/adminStore'

import AdminOverview from './sections/AdminOverview.vue'
import AdminMembers from './sections/AdminMembers.vue'
import AdminTierAccess from './sections/AdminTierAccess.vue'
import AdminApiLimits from './sections/AdminApiLimits.vue'
import AdminAudit from './sections/AdminAudit.vue'
import AdminSystem from './sections/AdminSystem.vue'
import AdminEdgeOta from './sections/AdminEdgeOta.vue'
import AdminAiResources from './sections/AdminAiResources.vue'
import AdminUiTheme from './sections/AdminUiTheme.vue'

const adminStore = useAdminStore()
const { activeSection } = storeToRefs(adminStore)

const sectionComponents: Record<AdminSectionId, Component> = {
  'overview': AdminOverview,
  'members': AdminMembers,
  'tier-access': AdminTierAccess,
  'api-limits': AdminApiLimits,
  'audit': AdminAudit,
  'system': AdminSystem,
  'edge-ota': AdminEdgeOta,
  'ai-resources': AdminAiResources,
  'ui-theme': AdminUiTheme,
}

const currentSectionComponent = computed(() => sectionComponents[activeSection.value] ?? AdminOverview)
</script>

<style lang="scss" scoped>
.admin-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}
</style>
