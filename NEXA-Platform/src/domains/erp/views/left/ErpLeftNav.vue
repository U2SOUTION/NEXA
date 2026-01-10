<!-- ErpSidebar.vue
  ERP 페이지 왼쪽 사이드바
  프로젝트, 작업 문서, 일정 등 네비게이션
-->

<template>
  <div class="erp-sidebar">
    <q-list>
      <!-- 헤더 -->
      <StandardLeftHeader title="ERP" subtitle="프로젝트 및 업무 관리" icon="business" />

      <!-- 아코디언 네비게이션 -->
      <div class="accordion-wrapper">
        <!--부품관리 메뉴 배치 -->
        <q-expansion-item expand-icon="chevron_right" :model-value="erpStore.activeSubMenu === 'parts'" @update:model-value="onToggle('parts', $event)" label="PARTS Management" icon="inventory_2">
          <PartsManagementLeftNav />
        </q-expansion-item>

        <q-expansion-item expand-icon="chevron_right" :model-value="erpStore.activeSubMenu === 'project'" @update:model-value="onToggle('project', $event)" label="프로젝트" icon="folder">
          <div class="sub-list">
            <q-item dense clickable @click="navigate('/erp')">
              <q-item-section>프로젝트 개요</q-item-section>
            </q-item>
            <q-item dense clickable @click="navigate('/erp')">
              <q-item-section>마일스톤</q-item-section>
            </q-item>
          </div>
        </q-expansion-item>

        <q-expansion-item expand-icon="chevron_right" :model-value="erpStore.activeSubMenu === 'work-document'" @update:model-value="onToggle('work-document', $event)" label="작업 문서" icon="description">
          <div class="sub-list">
            <q-item dense clickable @click="navigate('/erp')">
              <q-item-section>문서함</q-item-section>
            </q-item>
            <q-item dense clickable @click="navigate('/erp')">
              <q-item-section>템플릿</q-item-section>
            </q-item>
          </div>
        </q-expansion-item>

        <q-expansion-item expand-icon="chevron_right" :model-value="erpStore.activeSubMenu === 'schedule'" @update:model-value="onToggle('schedule', $event)" label="일정 관리" icon="event">
          <div class="sub-list">
            <q-item dense clickable @click="navigate('/erp')">
              <q-item-section>캘린더</q-item-section>
            </q-item>
            <q-item dense clickable @click="navigate('/erp')">
              <q-item-section>리소스 배정</q-item-section>
            </q-item>
          </div>
        </q-expansion-item>

        <q-expansion-item expand-icon="chevron_right" :model-value="erpStore.activeSubMenu === 'collaboration'" @update:model-value="onToggle('collaboration', $event)" label="실시간 협업" icon="chat">
          <div class="sub-list">
            <q-item dense clickable @click="navigate('/erp')">
              <q-item-section>채팅</q-item-section>
            </q-item>
            <q-item dense clickable @click="navigate('/erp')">
              <q-item-section>공지사항</q-item-section>
            </q-item>
          </div>
        </q-expansion-item>

        <q-expansion-item expand-icon="chevron_right" :model-value="erpStore.activeSubMenu === 'reference'" @update:model-value="onToggle('reference', $event)" label="참고자료" icon="attach_file">
          <div class="sub-list">
            <q-item dense clickable @click="navigate('/erp')">
              <q-item-section>파일 보관함</q-item-section>
            </q-item>
            <q-item dense clickable @click="navigate('/erp')">
              <q-item-section>링크 모음</q-item-section>
            </q-item>
          </div>
        </q-expansion-item>

        <q-expansion-item expand-icon="chevron_right" :model-value="erpStore.activeSubMenu === 'logbook'" @update:model-value="onToggle('logbook', $event)" label="로그북" icon="book">
          <div class="sub-list">
            <q-item dense clickable @click="navigate('/erp')">
              <q-item-section>활동 로그</q-item-section>
            </q-item>
            <q-item dense clickable @click="navigate('/erp')">
              <q-item-section>감사 추적</q-item-section>
            </q-item>
          </div>
        </q-expansion-item>

        <q-expansion-item expand-icon="chevron_right" :model-value="erpStore.activeSubMenu === 'finance'" @update:model-value="onToggle('finance', $event)" label="재무 관리" icon="account_balance">
          <div class="sub-list">
            <q-item dense clickable @click="navigate('/erp')">
              <q-item-section>매출/매입</q-item-section>
            </q-item>
            <q-item dense clickable @click="navigate('/erp')">
              <q-item-section>예산</q-item-section>
            </q-item>
          </div>
        </q-expansion-item>
      </div>
    </q-list>
  </div>
</template>

<script setup>
import StandardLeftHeader from '@frame/layout/components/StandardLeftHeader.vue'
import { useErpStore } from '@domains/erp/store/erpStore'
import PartsManagementLeftNav from '@domains/parts-management/views/left/PartsManagementLeftNav.vue'
import { useRoute, useRouter } from 'vue-router'
import { watch } from 'vue'

const erpStore = useErpStore()
const route = useRoute()
const router = useRouter()

function syncFromRoute(path) {
  if (path.startsWith('/erp/parts-management')) {
    erpStore.setActiveSubMenu('parts')
  }
}

syncFromRoute(route.path)

watch(
  () => route.path,
  (path) => {
    syncFromRoute(path)
  },
)

// activeSubMenu 변화를 감지해 라우트와 동기화 (새로고침 없이 진입 보장)
watch(
  () => erpStore.activeSubMenu,
  (sub) => {
    if (sub === 'parts') {
      if (!route.path.startsWith('/erp/parts-management')) {
        router.push('/erp/parts-management')
      }
    } else {
      if (route.path.startsWith('/erp/parts-management')) {
        router.push('/erp')
      }
    }
  },
)

function onToggle(tab, isOpen) {
  if (!isOpen) return
  erpStore.setActiveSubMenu(tab)
  if (tab === 'parts') {
    router.push('/erp/parts-management')
  } else {
    router.push('/erp')
  }
}
</script>

<style lang="scss" scoped>
.erp-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;

  .sidebar-header {
    background: var(--nexa-surface-header-bg);
    border-bottom: 1px solid var(--nexa-border-color);
  }

  .q-list {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .accordion-wrapper {
    padding: 4px 0;
  }

  .sub-list {
    :deep(.q-item) {
      padding-left: 70px;
      min-height: 28px;
      color: var(--nexa-text-primary);
    }
  }
}
</style>
