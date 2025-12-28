<!-- CodeEditor.vue
  코드 에디터 컴포넌트 (CodeMirror 기반)
  Vue 파일의 template, script, style을 편집
-->
<template>
  <div class="code-editor-wrapper">
    <div class="editor-header">
      <q-tabs v-model="activeTab" dense>
        <q-tab name="template" label="Template" icon="code" />
        <q-tab name="script" label="Script" icon="terminal" />
        <q-tab name="style" label="Style" icon="palette" />
      </q-tabs>
      <div class="editor-actions">
        <q-btn flat dense icon="refresh" label="새로고침" @click="handleReload" />
        <q-btn flat dense icon="save" label="저장" color="primary" @click="handleSave" :loading="isSaving" />
      </div>
    </div>

    <q-tab-panels v-model="activeTab" class="editor-panels">
      <q-tab-panel name="template">
        <div ref="templateEditorRef" class="code-editor"></div>
      </q-tab-panel>
      <q-tab-panel name="script">
        <div ref="scriptEditorRef" class="code-editor"></div>
      </q-tab-panel>
      <q-tab-panel name="style">
        <div ref="styleEditorRef" class="code-editor"></div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { useQuasar } from 'quasar'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { basicSetup } from 'codemirror'
import { vue } from '@codemirror/lang-vue'
import { javascript } from '@codemirror/lang-javascript'
import { css } from '@codemirror/lang-css'
import { oneDark } from '@codemirror/theme-one-dark'
import { parseVueFile, combineVueFile } from 'src/utils/vue-file-parser.js'
import { useUserSettingsStore } from 'src/stores/userSettingsStore'

const props = defineProps({
  filePath: {
    type: String,
    required: true,
  },
  fileContent: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['save', 'reload'])

const $q = useQuasar()
const userSettings = useUserSettingsStore()

const activeTab = ref('template')
const isSaving = ref(false)

// 에디터 인스턴스
const templateEditorRef = ref(null)
const scriptEditorRef = ref(null)
const styleEditorRef = ref(null)
let templateEditor = null
let scriptEditor = null
let styleEditor = null

// 파싱된 파일 내용
const parsedContent = ref(null)

// 테마 설정 (다크 모드에 따라)
const editorTheme = computed(() => {
  return userSettings.settings.theme.isDarkMode ? [oneDark] : []
})

// Vue 파일 파싱
function parseContent() {
  parsedContent.value = parseVueFile(props.fileContent)
}

// 에디터 초기화
async function initEditors() {
  await nextTick()

  // Template 에디터
  if (templateEditorRef.value && !templateEditor) {
    const extensions = [
      basicSetup,
      vue(),
      EditorView.theme({
        '&': {
          fontSize: '14px',
          height: '100%',
        },
        '.cm-scroller': {
          overflow: 'auto',
          height: '100%',
        },
      }),
      ...editorTheme.value,
    ]

    templateEditor = new EditorView({
      state: EditorState.create({
        doc: parsedContent.value.template || '',
        extensions,
      }),
      parent: templateEditorRef.value,
    })
  }

  // Script 에디터
  if (scriptEditorRef.value && !scriptEditor) {
    const extensions = [
      basicSetup,
      javascript(),
      EditorView.theme({
        '&': {
          fontSize: '14px',
          height: '100%',
        },
        '.cm-scroller': {
          overflow: 'auto',
          height: '100%',
        },
      }),
      ...editorTheme.value,
    ]

    scriptEditor = new EditorView({
      state: EditorState.create({
        doc: parsedContent.value.script || '',
        extensions,
      }),
      parent: scriptEditorRef.value,
    })
  }

  // Style 에디터
  if (styleEditorRef.value && !styleEditor) {
    const extensions = [
      basicSetup,
      css(),
      EditorView.theme({
        '&': {
          fontSize: '14px',
          height: '100%',
        },
        '.cm-scroller': {
          overflow: 'auto',
          height: '100%',
        },
      }),
      ...editorTheme.value,
    ]

    styleEditor = new EditorView({
      state: EditorState.create({
        doc: parsedContent.value.style || '',
        extensions,
      }),
      parent: styleEditorRef.value,
    })
  }
}

// 에디터 내용 업데이트
function updateEditors() {
  if (templateEditor && parsedContent.value) {
    const newState = templateEditor.state.update({
      changes: {
        from: 0,
        to: templateEditor.state.doc.length,
        insert: parsedContent.value.template || '',
      },
    })
    templateEditor.dispatch(newState)
  }
  if (scriptEditor && parsedContent.value) {
    const newState = scriptEditor.state.update({
      changes: {
        from: 0,
        to: scriptEditor.state.doc.length,
        insert: parsedContent.value.script || '',
      },
    })
    scriptEditor.dispatch(newState)
  }
  if (styleEditor && parsedContent.value) {
    const newState = styleEditor.state.update({
      changes: {
        from: 0,
        to: styleEditor.state.doc.length,
        insert: parsedContent.value.style || '',
      },
    })
    styleEditor.dispatch(newState)
  }
}

// 저장 핸들러
async function handleSave() {
  if (!parsedContent.value) return

  isSaving.value = true

  try {
    // 각 에디터에서 현재 내용 가져오기
    if (templateEditor) {
      parsedContent.value.template = templateEditor.state.doc.toString()
    }
    if (scriptEditor) {
      parsedContent.value.script = scriptEditor.state.doc.toString()
    }
    if (styleEditor) {
      parsedContent.value.style = styleEditor.state.doc.toString()
    }

    // 파일 내용 합치기
    const combinedContent = combineVueFile(parsedContent.value)

    // API로 저장
    const response = await fetch(`http://localhost:3000/api/dev/files/${props.filePath}/content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: combinedContent }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    if (data.success) {
      $q.notify({
        type: 'positive',
        message: '파일이 저장되었습니다.',
        position: 'top',
        timeout: 1000,
      })
      emit('save', combinedContent)
    }
  } catch (error) {
    console.error('[CodeEditor] 저장 실패:', error)
    $q.notify({
      type: 'negative',
      message: `저장 실패: ${error.message}`,
      position: 'top',
      timeout: 2000,
    })
  } finally {
    isSaving.value = false
  }
}

// 새로고침 핸들러
function handleReload() {
  parseContent()
  updateEditors()
  emit('reload')
}

// 파일 내용 변경 감지
watch(
  () => props.fileContent,
  () => {
    parseContent()
    updateEditors()
  },
  { immediate: true },
)

// 테마 변경 감지
watch(
  () => userSettings.settings.theme.isDarkMode,
  () => {
    // 에디터 재초기화 필요 (테마 변경)
    destroyEditors()
    nextTick(() => {
      parseContent()
      initEditors()
    })
  },
)

// 에디터 파괴
function destroyEditors() {
  if (templateEditor) {
    templateEditor.destroy()
    templateEditor = null
  }
  if (scriptEditor) {
    scriptEditor.destroy()
    scriptEditor = null
  }
  if (styleEditor) {
    styleEditor.destroy()
    styleEditor = null
  }
}

onMounted(async () => {
  parseContent()
  await initEditors()
})

onBeforeUnmount(() => {
  destroyEditors()
})
</script>

<style lang="scss" scoped>
.code-editor-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid var(--nexa-border-color);
    background-color: var(--nexa-surface);

    .editor-actions {
      display: flex;
      gap: 8px;
    }
  }

  .editor-panels {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;

    .q-tab-panel {
      flex: 1;
      min-height: 0;
      padding: 0;
      display: flex;
      flex-direction: column;

      .code-editor {
        flex: 1;
        min-height: 400px;
        overflow: hidden;
      }
    }
  }
}
</style>

