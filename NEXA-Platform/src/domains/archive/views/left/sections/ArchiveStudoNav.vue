<!-- NEXA ARCHIVE STUDIO NAV
 /domains/archive/views/left/sections/ArchiveStudoNav.vue
 문서·블록·로직 조립 에디터 네비게이션
 각 아이템을 리스트로 표시하고 클릭시 문서·블록·로직 조립 에디터 화면으로 이동
-->
<template>
  <div ref="navRef" class="editor-nav">
    <q-item-label class="section-title">EDITOR</q-item-label>

    <q-tabs v-model="tab" dense shrink no-caps inline-label :class="['editor-tabs', { 'is-compact': isCompact }]">
      <q-tab v-for="item in tabs" :key="item.name" :name="item.name" :icon="item.icon" :label="tabLabel(item)" />
    </q-tabs>

    <!-- 최소 필터/정렬 틀 (후속 확장용) -->
    <div class="toolbar-row">
      <q-btn flat dense icon="filter_list" size="sm" label="필터" class="toolbar-item" />
      <q-btn flat dense icon="swap_vert" size="sm" label="정렬" class="toolbar-item" />
      <q-btn v-for="chip in chips" :key="chip" flat dense size="sm" class="toolbar-item chip-btn">
        {{ chip }}
      </q-btn>
    </div>

    <q-tab-panels v-model="tab" animated class="panels">
      <q-tab-panel name="docs">
        <q-list dense>
          <q-item v-if="loading" dense>
            <q-item-section avatar>
              <q-spinner size="16px" />
            </q-item-section>
            <q-item-section>불러오는 중...</q-item-section>
          </q-item>
          <q-item v-else-if="errorMessage" dense>
            <q-item-section avatar><q-icon name="error_outline" /></q-item-section>
            <q-item-section>{{ errorMessage }}</q-item-section>
          </q-item>
          <q-item v-else-if="docs.length === 0" dense>
            <q-item-section avatar><q-icon name="folder_open" /></q-item-section>
            <q-item-section>저장된 문서가 없습니다.</q-item-section>
          </q-item>
          <q-item v-else v-for="doc in docs" :key="doc.id" dense clickable v-ripple :active="activeDocId === doc.id" @click="openDoc(doc.id)">
            <q-item-section avatar><q-icon :name="docIcon(doc)" /></q-item-section>
            <q-item-section>
              <div class="doc-title">{{ doc.title }}</div>
              <div class="doc-meta">{{ doc.doc_type || 'NOTE' }} · {{ doc.status || 'ACTIVE' }}</div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>

      <q-tab-panel name="templates">
        <q-list dense>
          <q-item v-for="tpl in templates" :key="tpl.label" dense>
            <q-item-section avatar><q-icon :name="tpl.icon" /></q-item-section>
            <q-item-section>{{ tpl.label }}</q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>

      <q-tab-panel name="blocks">
        <q-list dense>
          <q-item v-for="blk in blocks" :key="blk.label" dense>
            <q-item-section avatar><q-icon :name="blk.icon" /></q-item-section>
            <q-item-section>{{ blk.label }}</q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>

      <q-tab-panel name="history">
        <q-list dense>
          <q-item v-for="hist in history" :key="hist.label" dense>
            <q-item-section avatar><q-icon :name="hist.icon" /></q-item-section>
            <q-item-section>{{ hist.label }}</q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchArchives } from '../../../services/archiveApi'
const tab = ref('docs')
const navRef = ref(null)
const isCompact = ref(false)
const chips = ['전체', '최근', '즐겨찾기']

const tabs = [
  { name: 'docs', label: 'DOCS', desc: '문서', icon: 'description' },
  { name: 'templates', label: 'TPL', desc: '템플릿', icon: 'view_module' },
  { name: 'blocks', label: 'BLOCK', desc: '블록', icon: 'extension' },
  { name: 'history', label: 'HIST', desc: '히스토리', icon: 'update' },
]

const router = useRouter()
const route = useRoute()

const docs = ref([])
const loading = ref(false)
const errorMessage = ref('')

const activeDocId = computed(() => {
  const q = route.query?.archiveId
  const num = Number(q)
  return Number.isFinite(num) ? num : null
})

const templates = [
  { label: '업무 템플릿', icon: 'view_module' },
  { label: '노트 템플릿', icon: 'sticky_note_2' },
  { label: '대시보드 템플릿', icon: 'dashboard_customize' },
]

const blocks = [
  { label: '머메이드 블록', icon: 'schema' },
  { label: 'D3 네트워크', icon: 'hub' },
  { label: '액션 버튼', icon: 'smart_button' },
]

const history = [
  { label: '문서 A 수정', icon: 'history' },
  { label: '문서 B 버전', icon: 'history_toggle_off' },
  { label: '템플릿 변경', icon: 'update' },
]

function tabLabel(item) {
  return item.label
}

function docIcon(doc) {
  if (doc.doc_type === 'TEMPLATE') return 'view_module'
  if (doc.doc_type === 'BLOCK') return 'extension'
  return 'article'
}

async function loadDocs() {
  loading.value = true
  errorMessage.value = ''
  try {
    const list = await fetchArchives()
    docs.value = Array.isArray(list) ? list : []
  } catch (err) {
    console.error('[ArchiveEditorNav] fetch archives failed', err)
    errorMessage.value = '문서를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

function openDoc(id) {
  if (!id) return
  router.push({ name: 'NexaArchiveStudio', query: { archiveId: id } })
}

// 네비게이션 영역 크기 조절 감지
let resizeObserver = null

onMounted(() => {
  if (typeof ResizeObserver === 'undefined') return
  loadDocs()
  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (!entry) return
    const width = entry.contentRect.width
    isCompact.value = width < 300
  })
  if (navRef.value) {
    resizeObserver.observe(navRef.value)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver && navRef.value) {
    resizeObserver.unobserve(navRef.value)
  }
})
</script>

<style scoped lang="scss">
.editor-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0;
}

.section-title {
  font-weight: 700;
  color: var(--nexa-text-primary);
}

.editor-tabs {
  width: 100%;
  :deep(.q-tab__label) {
    font-size: 11px;
    white-space: nowrap;
  }
  :deep(.q-tab__content) {
    gap: 1px;
  }
  :deep(.q-tab) {
    min-width: unset;
    padding: 0 4px;
  }
}

.editor-tabs.is-compact :deep(.q-tab__icon) {
  display: none;
}

.editor-tabs.is-compact :deep(.q-tab) {
  padding: 0 2px;
}

.panels {
  padding: 0;
  margin: 0;
  :deep(.q-tab-panel) {
    padding: 0;
  }
  :deep(.q-item__label) {
    color: var(--nexa-text-primary);
  }
  :deep(.q-item) {
    padding-left: 4px !important;
    padding-right: 4px;
    margin: 0;

    color: var(--nexa-text-secondary);
  }
}

.doc-title {
  font-weight: 600;
  color: var(--nexa-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-meta {
  font-size: 11px;
  color: var(--nexa-text-secondary);
}

.toolbar-row {
  display: flex;
  gap: 4px;
  width: 100%;
  padding: 0 4px;
}

.toolbar-item {
  flex: 1 1 0;
  min-width: 0;
}

.chip-btn {
  justify-content: center;
}
</style>
