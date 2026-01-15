<template>
  <q-form class="editor-form" @submit.prevent="handleSubmit">
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-input v-model="form.title" label="제목" outlined dense :rules="[val => !!val || '제목을 입력하세요']" />
      </div>
      <div class="col-6">
        <q-select v-model="form.docType" :options="docTypeOptions" label="문서 유형" outlined dense emit-value map-options />
      </div>
      <div class="col-6">
        <q-select v-model="form.status" :options="statusOptions" label="상태" outlined dense emit-value map-options />
      </div>
      <div class="col-12">
        <q-select v-model="form.layoutId" :options="layoutOptions" label="레이아웃 템플릿" outlined dense emit-value map-options />
      </div>
      <div class="col-12">
        <div class="q-mb-xs text-caption text-grey-6">본문 (Tiptap)</div>
        <TiptapEditor v-model="form.content" placeholder="문서를 작성하세요. (텍스트, 표, 이미지, 링크 등)" />
      </div>
    </div>

    <div class="row justify-end q-gutter-sm q-mt-md">
      <q-btn flat label="초기화" color="secondary" @click="resetForm" />
      <q-btn unelevated label="저장" color="primary" type="submit" />
    </div>
  </q-form>
</template>

<script setup>
import { reactive } from 'vue'
import { defineAsyncComponent } from 'vue'

const TiptapEditor = defineAsyncComponent(() => import('@domains/parts/components/TiptapEditor.vue'))

const form = reactive({
  title: '',
  docType: 'NOTE',
  status: 'ACTIVE',
  layoutId: null,
  content: '',
})

const docTypeOptions = [
  { label: 'NOTE', value: 'NOTE' },
  { label: 'TASK', value: 'TASK' },
  { label: 'HYBRID', value: 'HYBRID' },
]

const statusOptions = [
  { label: 'ACTIVE', value: 'ACTIVE' },
  { label: 'ARCHIVED', value: 'ARCHIVED' },
  { label: 'DELETED', value: 'DELETED' },
]

// TODO: 실제 API 연동 시 system_templates에서 LAYOUT만 조회해 옵션 생성
const layoutOptions = [
  { label: '기본 레이아웃', value: 1 },
  { label: '하이브리드 레이아웃', value: 2 },
]

function resetForm() {
  form.title = ''
  form.docType = 'NOTE'
  form.status = 'ACTIVE'
  form.layoutId = null
  form.content = ''
}

function handleSubmit() {
  // TODO: API 연동하여 archives + archive_doc 생성
  // payload 참고:
  // archives: { title, doc_type: form.docType, status: form.status, layout_id: form.layoutId }
  // archive_doc: { content_json: form.content, order_idx: 0 }
  console.log('archive form submit', { ...form })
}
</script>

<style scoped lang="scss">
.editor-form {
  background: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
  border-radius: 8px;
  padding: 12px;
  color: var(--nexa-text-primary);
}
</style>
