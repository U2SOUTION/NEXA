<!-- ErpSidebar.vue
  ERP 페이지 왼쪽 사이드바
  프로젝트, 작업 문서, 일정 등 네비게이션
-->

<template>
  <div class="erp-sidebar">
    <q-list>
      <!-- 헤더 -->
      <StandardLeftHeader title="ERP" subtitle="프로젝트 및 업무 관리" icon="business" @title-click="openDashboard">
        <template #actions>
          <div class="header-actions row items-center q-gutter-xs">
            <q-btn flat round dense icon="refresh" class="header-action-btn" @click="handleRefresh">
              <q-tooltip>데이터 새로고침</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="settings" class="header-action-btn" @click="handleOpenSettings">
              <q-tooltip>설정</q-tooltip>
            </q-btn>
          </div>
        </template>
      </StandardLeftHeader>

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

    <!-- 설정 모달 -->
    <ErpSettingsModal v-model="showSettings" :default-landing="erpStore.defaultLanding" :last-sub-menu="erpStore.lastSubMenu" @save="saveLanding" />
  </div>
</template>

<script setup>
import StandardLeftHeader from '@frame/layout/components/StandardLeftHeader.vue'
import ErpSettingsModal from '@domains/erp/components/ErpSettingsModal.vue'
import { useErpStore } from '@domains/erp/store/erpStore'
import PartsManagementLeftNav from '@domains/parts/views/left/PartsManagementLeftNav.vue'
import { useRoute, useRouter } from 'vue-router'
import { watch, ref } from 'vue'

const erpStore = useErpStore()
const route = useRoute()
const router = useRouter()

const navigate = (path) => router.push(path)
const showSettings = ref(false)
function resolveTarget() {
  return erpStore.defaultLanding || erpStore.lastSubMenu || 'dashboard'
}

function syncFromRoute(path) {
  if (!path.startsWith('/erp')) return

  // 이미 parts-management라면 상태만 맞춰주고 종료
  if (path.startsWith('/erp/parts')) {
    if (erpStore.activeSubMenu !== 'parts') {
      erpStore.setActiveSubMenu('parts')
    }
    return
  }

  // /erp 진입 시: 우선순위 defaultLanding > lastSubMenu > dashboard
  const target = resolveTarget()
  if (target === 'parts') {
    router.push('/erp/parts')
    return
  }

  if (erpStore.activeSubMenu !== target) {
    erpStore.setActiveSubMenu(target)
  }
}

syncFromRoute(route.path)

watch(
  () => route.path,
  (path) => {
    syncFromRoute(path)
  },
)

function onToggle(tab, isOpen) {
  if (!isOpen) return
  erpStore.setActiveSubMenu(tab)
  if (tab === 'parts') {
    router.push('/erp/parts')
  } else {
    router.push('/erp')
  }
}

function openDashboard() {
  erpStore.setActiveSubMenu('dashboard')
  router.push('/erp')
}

function handleRefresh() {
  // TODO: 나중에 ERP 데이터 새로고침 로직 연결
}

function handleOpenSettings() {
  showSettings.value = true
}

function saveLanding(val) {
  const target = val || 'dashboard'
  erpStore.setDefaultLanding(val || '')
  erpStore.setActiveSubMenu(target)
  if (target === 'parts') {
    router.push('/erp/parts')
  } else {
    router.push('/erp')
  }
  showSettings.value = false
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

.header-actions {
  gap: 4px;
}

.header-action-btn {
  width: 28px;
  height: 28px;
  min-width: 28px;
  color: var(--nexa-text-primary);

  .q-icon {
    font-size: 16px;
  }

  &:hover {
    color: var(--nexa-text-secondary);
  }
}
</style>
