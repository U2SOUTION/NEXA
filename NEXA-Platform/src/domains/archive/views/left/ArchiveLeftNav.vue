<template>
  <div class="archive-left-nav">
    <q-list padding>
      <StandardLeftHeader title="Archive" subtitle="NEXA Archive" icon="article" @title-click="goIndex">
        <template #actions>
          <div class="header-actions row items-center q-gutter-xs">
            <q-btn flat round dense icon="settings" class="header-action-btn" @click="openSettings">
              <q-tooltip>설정</q-tooltip>
            </q-btn>
          </div>
        </template>
      </StandardLeftHeader>

      <ArchiveSearchBar :on-search="handleSearch" />

      <q-item v-for="item in menuItems" :key="item.value" clickable v-ripple :active="activeSection === item.value" @click="navigate(item.value)">
        <q-item-section avatar><q-icon :name="item.icon" /></q-item-section>
        <q-item-section>
          <div class="item-row">
            <span class="label">{{ item.label }}</span>
            <span class="desc-ellipsis">{{ item.desc }}</span>
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <div class="sub-title row items-center q-gutter-xs">
      <q-icon name="list_alt" size="16px" />
      <span>하위 메뉴</span>
    </div>
    <component :is="subNavComponent" />

    <ArchiveSettingsModal v-model="showSettings" :default-landing="defaultLanding" @save="saveLanding" />

    <div class="sub-title row items-center q-gutter-xs">
      <q-icon name="list_alt" size="16px" />
      <span>구현 예약 메뉴 (Sentinel) </span>
    </div>

    <q-item v-for="item in sentineItems" :key="item.value" clickable v-ripple :active="activeSection === item.value" @click="navigate(item.value)">
      <q-item-section avatar>
        <q-icon :name="item.icon" />
      </q-item-section>

      <q-item-section>
        <div class="item-row">
          <span class="label">{{ item.label }}</span>
          <span class="desc-ellipsis">{{ item.desc }}</span>
        </div>
      </q-item-section>
    </q-item>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StandardLeftHeader from '@frame/layout/components/StandardLeftHeader.vue'
import ArchiveSettingsModal from '@domains/archive/components/ArchiveSettingsModal.vue'
import ArchiveSearchBar from '@domains/archive/components/ArchiveSearchBar.vue'
import ArchiveIndexNav from './sections/ArchiveIndexNav.vue'
import ArchiveHubNav from './sections/ArchiveHubNav.vue'
import ArchiveStudioNav from './sections/ArchiveStudoNav.vue'
import ArchiveConnectorNav from './sections/ArchiveConnectorNav.vue'
import ArchiveInsightsNav from './sections/ArchiveInsightsNav.vue'

const router = useRouter()
const route = useRoute()

const menuItems = [
  { label: 'HUB', value: 'hub', icon: 'dashboard', desc: '자산 대시보드' },
  { label: 'STUDIO', value: 'studio', icon: 'edit_note', desc: '문서·블록 작성' },
  { label: 'CONNECTOR', value: 'connector', icon: 'settings_input_component', desc: '기기·DB 연동' },
  { label: 'INSIGHTS', value: 'insights', icon: 'psychology', desc: '관계·통찰 맵' },
]

const sentineItems = [
  {
    value: 'sentinel-overview',
    icon: 'shield',
    label: '지능적 휴지통',
    desc: '자동 판단 흐름 요약',
  },

  {
    value: 'auto-discard',
    icon: 'psychology',
    label: '센티넬 판단',
    desc: '미열람 · 중복 · 구조 실패',
  },

  {
    value: 'ai-suggestion',
    icon: 'smart_toy',
    label: 'AI 제안',
    desc: '폐기 권고 · 보류 판단',
  },

  {
    value: 'buffered',
    icon: 'hourglass_empty',
    label: '유예 상태',
    desc: '시간 후 재판단',
  },

  {
    value: 'manual-delete',
    icon: 'pan_tool',
    label: '직접 삭제',
    desc: '사용자 판단',
  },

  {
    value: 'restore',
    icon: 'restore',
    label: '복구',
    desc: '원래 위치로 이동',
  },

  {
    value: 'permanent-delete',
    icon: 'delete_forever',
    label: '영구 삭제',
    desc: '되돌릴 수 없음',
  },
]

const showSettings = ref(false)
const defaultLanding = ref('index')

onMounted(() => {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('archive-default-landing') : null
  if (stored && ['index', 'hub', 'studio', 'connector', 'insights'].includes(stored)) {
    defaultLanding.value = stored
  }
})

const activeSection = computed(() => {
  const name = route.name
  if (name === 'NexaArchiveIndex') return 'index'
  if (name === 'NexaArchiveStudio') return 'studio'
  if (name === 'NexaArchiveConnector') return 'connector'
  if (name === 'NexaArchiveInsights') return 'insights'
  return 'hub' // 기본값
})

const subNavComponent = computed(() => {
  if (activeSection.value === 'hub') return ArchiveHubNav
  if (activeSection.value === 'studio') return ArchiveStudioNav
  if (activeSection.value === 'connector') return ArchiveConnectorNav
  if (activeSection.value === 'insights') return ArchiveInsightsNav
  return ArchiveIndexNav
})

function navigate(section) {
  if (section === activeSection.value) return
  const routeMap = {
    index: { name: 'NexaArchiveIndex' },
    hub: { name: 'NexaArchiveHub' },
    studio: { name: 'NexaArchiveStudio' },
    connector: { name: 'NexaArchiveConnector' },
    insights: { name: 'NexaArchiveInsights' },
  }
  router.push(routeMap[section] || routeMap.hub)
}

function goIndex() {
  router.push({ name: 'NexaArchiveIndex' })
}

function openSettings() {
  showSettings.value = true
}

function saveLanding(val) {
  defaultLanding.value = val || 'index'
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('archive-default-landing', defaultLanding.value)
  }
}

function handleSearch() {
  // TODO: 추후 실제 검색 API 연동
  return Promise.resolve({
    index: [],
    hub: [],
    studio: [],
    connector: [],
    insights: [],
  })
}
</script>

<style lang="scss" scoped>
.archive-left-nav {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header-actions {
  gap: 4px;
}

.header-action-btn {
  width: 28px;
  height: 28px;
  min-width: 28px;
  color: var(--nexa-text-primary);
}

.item-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.label {
  font-weight: 700;
  color: var(--nexa-text-primary);
  flex-shrink: 0;
}

.desc-ellipsis {
  font-size: 11px;
  color: var(--nexa-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}

.sub-title {
  padding: 8px 12px 4px;
  font-size: 11px;
  color: var(--nexa-text-secondary);
}
</style>
