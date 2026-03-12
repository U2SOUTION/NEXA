<!--
  [NEXA-ADMIN-01] 관리자 도메인 왼쪽 사이드바
  - 통합 검색(모든 메뉴/컨텐츠), 메뉴별 분기 가능. §4 메뉴 구분 네비게이션.
-->
<template>
  <div class="admin-left-nav">
    <StandardLeftHeader
      title="ADMIN"
      subtitle="슈퍼 관리자 전용"
      icon="admin_panel_settings"
    />

    <!-- 통합 검색: 모든 메뉴·컨텐츠 검색, 범위 분기 -->
    <div class="admin-search q-px-md q-pt-sm">
      <q-input
        v-model="searchQuery"
        placeholder="전체 검색..."
        dense
        outlined
        clearable
        class="admin-search-input"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-option-group
        v-model="searchScope"
        :options="searchScopeOptions"
        dense
        inline
        class="q-mt-xs admin-search-scope"
      />
    </div>

    <q-list class="q-mt-sm">
      <q-item
        v-for="item in menuItems"
        :key="item.id"
        clickable
        v-ripple
        :active="activeSection === item.id"
        @click="setActiveSection(item.id)"
        active-class="nexa-active-item"
      >
        <q-item-section avatar>
          <q-icon :name="item.icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ item.label }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import StandardLeftHeader from '@frame/layout/components/StandardLeftHeader.vue'
import { useAdminStore } from '../../store/adminStore'
import type { AdminSectionId, AdminSearchScope } from '../../store/adminStore'

const adminStore = useAdminStore()
const { activeSection, searchQuery, searchScope } = storeToRefs(adminStore)
const { setActiveSection } = adminStore

const searchScopeOptions: { value: AdminSearchScope; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'current', label: '현재 메뉴' },
]

const menuItems: { id: AdminSectionId; label: string; icon: string }[] = [
  { id: 'overview', label: '개요', icon: 'dashboard' },
  { id: 'members', label: '회원 목록', icon: 'people' },
  { id: 'tier-access', label: 'Tier·접근 권한', icon: 'lock' },
  { id: 'api-limits', label: 'API 리미트', icon: 'speed' },
  { id: 'audit', label: '감사 로그', icon: 'history' },
  { id: 'system', label: '시스템·알림', icon: 'settings' },
  { id: 'edge-ota', label: '엣지·OTA', icon: 'cloud_upload' },
  { id: 'ai-resources', label: 'AI 협력·리소스', icon: 'smart_toy' },
  { id: 'ui-theme', label: 'UI/UX·테마', icon: 'palette' },
]
</script>

<style lang="scss" scoped>
.admin-search-input {
  width: 100%;
}
.admin-search-scope {
  font-size: 12px;
  :deep(.q-radio__label) {
    font-size: 12px;
  }
}
.nexa-active-item {
  background-color: var(--nexa-surface-hover);
  color: var(--nexa-text-primary);
  border-right: 2px solid var(--nexa-button-primary-bg);
}
</style>
