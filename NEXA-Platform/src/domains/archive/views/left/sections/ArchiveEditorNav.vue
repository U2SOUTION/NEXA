<template>
  <div ref="navRef" class="editor-nav">
    <q-item-label>EDITOR</q-item-label>

    <q-tabs v-model="tab" dense shrink no-caps inline-label :class="['editor-tabs', { 'is-compact': isCompact }]" active-color="primary">
      <q-tab v-for="item in tabs" :key="item.name" :name="item.name" :icon="item.icon" :label="tabLabel(item)" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated class="panels">
      <q-tab-panel name="docs">
        <q-list dense>
          <q-item v-for="doc in docs" :key="doc.label" dense>
            <q-item-section avatar><q-icon :name="doc.icon" /></q-item-section>
            <q-item-section>{{ doc.label }}</q-item-section>
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
import { onBeforeUnmount, onMounted, ref } from 'vue'
const tab = ref('docs')
const navRef = ref(null)
const isCompact = ref(false)

const tabs = [
  { name: 'docs', label: 'DOCS', desc: '문서', icon: 'description' },
  { name: 'templates', label: 'TPL', desc: '템플릿', icon: 'view_module' },
  { name: 'blocks', label: 'BLOCK', desc: '블록', icon: 'extension' },
  { name: 'history', label: 'HIST', desc: '히스토리', icon: 'update' },
]

const docs = [
  { label: '최근 문서 1 제목이 긴 문자열 테스트 합니다 더긴 제목 문자열', icon: 'article' },
  { label: '최근 문서 2', icon: 'article' },
  { label: '즐겨찾기 문서', icon: 'star' },
]

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

// 네비게이션 영역 크기 조절 감지
let resizeObserver = null

onMounted(() => {
  if (typeof ResizeObserver === 'undefined') return
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
  padding: 0 5px;
}

.editor-tabs {
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
  :deep(.q-tab-panel) {
    padding: 0;
  }
  :deep(.q-item__label) {
    color: var(--nexa-text-primary);
  }
  :deep(.q-item) {
    padding-left: 10px !important;
    padding-right: 0;
    margin: 0;

    color: var(--nexa-text-secondary);
  }
}
</style>
