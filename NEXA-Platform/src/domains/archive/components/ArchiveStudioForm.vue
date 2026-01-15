<template>
  <q-form class="editor-form" @submit.prevent="handleSubmit">
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-input v-model="form.title" label="제목" outlined dense :rules="[(val) => !!val || '제목을 입력하세요']" />
      </div>
      <div class="col-6">
        <q-select v-model="form.docType" :options="docTypeOptions" label="문서 유형" outlined dense emit-value map-options />
      </div>
      <div class="col-6">
        <q-select v-model="form.status" :options="statusOptions" label="상태" outlined dense emit-value map-options />
      </div>
      <div class="col-12">
        <q-select v-model="form.layoutId" :options="layoutOptions" label="레이아웃 템플릿" outlined dense emit-value map-options :loading="loadingLayouts" :disable="loadingLayouts" />
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
import { reactive, ref, onMounted, watch } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useQuasar } from 'quasar'
import { fetchLayouts, createArchiveWithContent, updateArchiveWithContent } from '@domains/archive/services/archiveApi'

const TiptapEditor = defineAsyncComponent(() => import('@domains/parts/components/TiptapEditor.vue'))
const $q = useQuasar()

const props = defineProps({
  mode: {
    type: String,
    default: 'create', // 'create' | 'edit'
  },
  initialData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['submitted'])

const form = reactive({
  title: '',
  docType: 'NOTE',
  status: 'ACTIVE',
  layoutId: null,
  content: '',
})

const loadingLayouts = ref(false)
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

const layoutOptions = ref([
  { label: '기본 레이아웃 (샘플)', value: 1 },
  { label: '하이브리드 레이아웃 (샘플)', value: 2 },
])

function resetForm() {
  form.title = ''
  form.docType = 'NOTE'
  form.status = 'ACTIVE'
  form.layoutId = null
  form.content = ''
}

function applyInitial() {
  if (!props.initialData) {
    resetForm()
    return
  }
  const { archive, doc } = props.initialData
  form.title = archive?.title || ''
  form.docType = archive?.doc_type || 'NOTE'
  form.status = archive?.status || 'ACTIVE'
  form.layoutId = archive?.layout_id || null
  if (doc?.content_json) {
    try {
      form.content = typeof doc.content_json === 'string' ? JSON.parse(doc.content_json) : doc.content_json
    } catch {
      form.content = doc.content_json
    }
  } else {
    form.content = ''
  }
}

function handleSubmit() {
  if (!form.title.trim()) {
    $q.notify({ type: 'warning', message: '제목을 입력하세요.' })
    return
  }

  if (props.mode === 'edit' && props.initialData?.archive?.id) {
    updateArchiveWithContent({
      archiveId: props.initialData.archive.id,
      docId: props.initialData.doc?.id || null,
      title: form.title.trim(),
      docType: form.docType,
      status: form.status,
      layoutId: form.layoutId,
      contentJson: form.content || '',
    })
      .then((res) => {
        $q.notify({ type: 'positive', message: '문서가 수정되었습니다.' })
        emit('submitted', res)
      })
      .catch((err) => {
        console.error(err)
        $q.notify({ type: 'negative', message: '수정 실패: ' + err.message })
      })
    return
  }

  createArchiveWithContent({
    title: form.title.trim(),
    docType: form.docType,
    status: form.status,
    layoutId: form.layoutId,
    contentJson: form.content || '',
  })
    .then(() => {
      $q.notify({ type: 'positive', message: '문서가 저장되었습니다.' })
      resetForm()
      emit('submitted')
    })
    .catch((err) => {
      console.error(err)
      $q.notify({ type: 'negative', message: '저장 실패: ' + err.message })
    })
}

onMounted(async () => {
  try {
    loadingLayouts.value = true
    const layouts = await fetchLayouts()
    if (Array.isArray(layouts)) {
      layoutOptions.value = layouts.map((l) => ({
        label: l.tpl_name || `Layout #${l.id}`,
        value: l.id,
      }))
    }
  } catch (err) {
    console.warn('레이아웃 조회 실패, 샘플 옵션 유지', err)
  } finally {
    loadingLayouts.value = false
  }
  applyInitial()
})

watch(
  () => props.initialData,
  () => {
    applyInitial()
  },
)
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
