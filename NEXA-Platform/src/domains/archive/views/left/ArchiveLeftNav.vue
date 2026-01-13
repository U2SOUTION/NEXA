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
import ArchiveEditorNav from './sections/ArchiveEditorNav.vue'
import ArchiveConnectorNav from './sections/ArchiveConnectorNav.vue'
import ArchiveInsightsNav from './sections/ArchiveInsightsNav.vue'

const router = useRouter()
const route = useRoute()

const menuItems = [
  { label: 'HUB', value: 'hub', icon: 'dashboard', desc: '자산 대시보드' },
  { label: 'EDITOR', value: 'editor', icon: 'edit_note', desc: '문서·블록 편집' },
  { label: 'CONNECTOR', value: 'connector', icon: 'settings_input_component', desc: '기기·DB 연동' },
  { label: 'INSIGHTS', value: 'insights', icon: 'psychology', desc: '관계·통찰 맵' },
]

const showSettings = ref(false)
const defaultLanding = ref('index')

onMounted(() => {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('archive-default-landing') : null
  if (stored && ['index', 'hub', 'editor', 'connector', 'insights'].includes(stored)) {
    defaultLanding.value = stored
  }
})

const activeSection = computed(() => {
  const name = route.name
  if (name === 'NexaArchiveIndex') return 'index'
  if (name === 'NexaArchiveEditor') return 'editor'
  if (name === 'NexaArchiveConnector') return 'connector'
  if (name === 'NexaArchiveInsights') return 'insights'
  return 'hub' // 기본값
})

const subNavComponent = computed(() => {
  if (activeSection.value === 'hub') return ArchiveHubNav
  if (activeSection.value === 'editor') return ArchiveEditorNav
  if (activeSection.value === 'connector') return ArchiveConnectorNav
  if (activeSection.value === 'insights') return ArchiveInsightsNav
  return ArchiveIndexNav
})

function navigate(section) {
  if (section === activeSection.value) return
  const routeMap = {
    index: { name: 'NexaArchiveIndex' },
    hub: { name: 'NexaArchiveHub' },
    editor: { name: 'NexaArchiveEditor' },
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
    editor: [],
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
