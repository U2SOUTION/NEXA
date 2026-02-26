<!-- NEXA ARCHIVE STUDIO VIEW
 /domains/archive/views/content/StudioView.vue
Dashboard, Read, Edit, Create 뷰 구현
-->

<template>
  <div class="archive-view">
    <header class="page-header row items-center justify-between">
      <div>
        <div class="title">NEXA STUDIO</div>
        <div class="subtitle">문서·블록·로직 조립 에디터</div>
      </div>
      <div class="row q-gutter-xs">
        <q-btn flat dense class="toolbar-btn" icon="note_add" label="새 글 작성" @click="enterCreate" />
        <q-btn v-if="viewMode === 'read'" flat dense icon="edit" class="toolbar-btn" label="편집" @click="enterEdit" />
        <q-btn v-if="viewMode === 'edit'" flat dense icon="visibility" class="toolbar-btn" label="보기" @click="exitEdit" />
        <q-btn flat dense class="toolbar-btn" icon="delete" label="삭제" @click="markDeleted" />
        <q-btn flat dense class="toolbar-btn" icon="sync_alt" :label="statusToggleLabel" @click="toggleStatus" />
      </div>
    </header>

    <section class="content-area dashboard-section" v-if="viewMode === 'dashboard'">
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="content-title">STUDIO DASHBOARD</div>
          <div class="content-meta">문서 관리 및 생산성 도구</div>
        </div>
        <q-btn class="primary-action" icon="add" label="새 글 작성" @click="enterCreate" />
      </div>

      <div class="row q-col-gutter-md q-mb-xl">
        <div v-for="n in 4" :key="n" class="col-12 col-sm-3">
          <div class="stat-card">
            <div class="stat-label">상태 {{ n }}</div>
            <div class="stat-value">0</div>
          </div>
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-8">
          <div class="section-label q-mb-md">최근 작업 문서</div>
          <div class="recent-list-placeholder">데이터를 불러오는 중이거나 최근 작업 내역이 없습니다.</div>
        </div>
        <div class="col-12 col-md-4">
          <div class="section-label q-mb-md">도구 모음</div>
          <div class="tool-grid"></div>
        </div>
      </div>
    </section>

    <section class="content-area" v-if="viewMode === 'read'">
      <div class="content-header row items-center">
        <div class="col text-left">
          <div class="content-title">{{ currentTitle }}</div>
          <div class="content-meta">{{ currentDocType }} · {{ currentStatus }}</div>
        </div>
        <div class="col-auto" v-if="archiveData?.archive?.id">
          <q-chip dense square class="id-chip"> ID: {{ archiveData.archive.id }} </q-chip>
        </div>
      </div>

      <div v-if="loading" class="content-placeholder">불러오는 중...</div>
      <div v-else-if="errorMessage" class="content-error">{{ errorMessage }}</div>
      <div v-else-if="!archiveData" class="content-placeholder">문서를 선택하세요.</div>
      <div v-else class="content-body">
        <pre class="content-json">{{ formattedContent }}</pre>
      </div>
    </section>

    <section class="content-area" v-if="viewMode === 'edit'">
      <div class="content-title">문서 수정</div>
      <ArchiveStudioForm mode="edit" :initial-data="archiveData" @submitted="handleUpdated" />
    </section>

    <!-- 새 문서 작성 -->
    <section class="content-area" v-if="viewMode === 'create'">
      <ArchiveStudioForm mode="create" @submitted="handleCreated" />
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { fetchArchiveDetail, updateArchiveWithContent } from '@domains/archive/services/archiveApi'
import ArchiveStudioForm from '@domains/archive/components/ArchiveStudioForm.vue'

const route = useRoute()
const $q = useQuasar()
const archiveData = ref(null)
const loading = ref(false)
const errorMessage = ref('')
const editMode = ref(false)
const createMode = ref(false)

const currentTitle = computed(() => archiveData.value?.archive?.title || '선택된 문서 없음')
const currentDocType = computed(() => archiveData.value?.archive?.doc_type || 'NOTE')
const currentStatus = computed(() => archiveData.value?.archive?.status || 'ACTIVE')
const formattedContent = computed(() => {
  const raw = archiveData.value?.doc?.content_json
  if (!raw) return '(본문 없음)'
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return JSON.stringify(parsed, null, 2)
  } catch {
    return typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2)
  }
})

async function loadDetail(id) {
  if (!id) {
    archiveData.value = null
    editMode.value = false
    createMode.value = false
    return
  }
  loading.value = true
  errorMessage.value = ''
  try {
    archiveData.value = await fetchArchiveDetail(id)
  } catch (err) {
    console.error('[EditorView] fetch detail failed', err)
    errorMessage.value = '문서를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

function enterEdit() {
  if (!archiveData.value?.archive?.id) return
  editMode.value = true
  createMode.value = false
}

function exitEdit() {
  editMode.value = false
}

function enterCreate() {
  createMode.value = true
  editMode.value = false
}

function contentPayload() {
  const raw = archiveData.value?.doc?.content_json
  if (!raw) return ''
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch {
    return raw
  }
}

async function updateStatus(nextStatus) {
  if (!archiveData.value?.archive?.id) return
  try {
    loading.value = true
    const res = await updateArchiveWithContent({
      archiveId: archiveData.value.archive.id,
      docId: archiveData.value.doc?.id || null,
      title: archiveData.value.archive.title,
      docType: archiveData.value.archive.doc_type,
      status: nextStatus,
      layoutId: archiveData.value.archive.layout_id,
      contentJson: contentPayload(),
    })
    archiveData.value = res
    editMode.value = false
    createMode.value = false
    $q.notify({ type: 'positive', message: '상태가 변경되었습니다.' })
  } catch (err) {
    console.error('[EditorView] status update failed', err)
    $q.notify({ type: 'negative', message: '상태 변경 실패: ' + err.message })
  } finally {
    loading.value = false
  }
}

function toggleStatus() {
  const current = archiveData.value?.archive?.status || 'ACTIVE'
  const next = current === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE'
  updateStatus(next)
}

function markDeleted() {
  updateStatus('DELETED')
}

const statusToggleLabel = computed(() => {
  const current = archiveData.value?.archive?.status || 'ACTIVE'
  return current === 'ACTIVE' ? '상태: ARCHIVED로' : '상태: ACTIVE로'
})

function handleUpdated(payload) {
  const merged = {
    archive: payload?.archive || archiveData.value?.archive,
    doc: payload?.doc || archiveData.value?.doc,
  }
  archiveData.value = merged
  editMode.value = false
  createMode.value = false
}

function handleCreated() {
  createMode.value = false
}

onMounted(() => {
  const initialId = Number(route.query?.archiveId)
  if (Number.isFinite(initialId)) {
    loadDetail(initialId)
  }
})

watch(
  () => route.query?.archiveId,
  (val) => {
    const id = Number(val)
    if (Number.isFinite(id)) {
      loadDetail(id)
      editMode.value = false
      createMode.value = false
    } else {
      archiveData.value = null
      editMode.value = false
      createMode.value = false
    }
  },
)

const viewMode = computed(() => {
  const hasId = !!archiveData.value
  if (createMode.value) return 'create'
  if (!hasId) return 'dashboard'
  return editMode.value ? 'edit' : 'read'
})
</script>

<style lang="scss" scoped>
.archive-view {
  padding: clamp(10px, 2vw, 5vw);
}

.page-header {
  margin-bottom: 16px;
  .title {
    font-size: 48px;
    font-weight: 900;
  }
  .subtitle {
    font-size: 12px;
    color: var(--nexa-text-secondary);
  }
}

.content-area {
  background: transparent !important;
  //border: 1px solid var(--nexa-border-color);
  //border-radius: 8px;
  //padding: 10px;
  margin-bottom: 16px;
}

.dashboard-top {
  gap: 12px;
}

.content-header {
  margin-bottom: 8px;
}

.content-title {
  font-weight: 700;
  font-size: 16px;
  color: var(--nexa-text-primary);
}

.content-meta {
  font-size: 11px;
  color: var(--nexa-text-secondary);
}

.id-chip {
  background: var(--nexa-surface-hover);
  color: var(--nexa-text-primary);
  border: 1px solid var(--nexa-border-color);
}

.content-placeholder {
  padding: 12px;
  color: var(--nexa-text-secondary);
}

.content-error {
  padding: 12px;
  color: var(--nexa-error);
}

.content-body {
  border-top: 1px solid var(--nexa-border-color);
  padding-top: 8px;
}

.toolbar-btn,
.primary-action {
  background: var(--nexa-button-primary-bg);
  color: var(--nexa-button-primary-text);
  border: 1px solid var(--nexa-border-color);
}

.primary-action {
  padding: 10px 16px;
  font-weight: 700;
}

.content-json {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 12px;
  color: var(--nexa-text-primary);
  margin: 0;
}
</style>
