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
import { indentUnit } from '@codemirror/language'
import { parseVueFile, combineVueFile } from 'src/system/utils/vue-file-parser.js'
import { useUserSettingsStore } from 'src/system/store/userSettingsStore'

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

// Template 에디터 초기화
function initTemplateEditor() {
  if (templateEditorRef.value && !templateEditor) {
    // 부모 요소의 높이를 명시적으로 설정
    if (templateEditorRef.value) {
      templateEditorRef.value.style.height = '100%'
      templateEditorRef.value.style.minHeight = '400px'
    }

    const extensions = [
      basicSetup,
      vue(),
      EditorState.tabSize.of(2), // 탭 크기 2로 설정
      indentUnit.of('  '), // 들여쓰기 단위 2칸 (스페이스 2개)
      EditorView.lineWrapping, // 긴 줄 자동 줄바꿈
      EditorView.theme({
        '&': {
          fontSize: '14px',
          height: '100%',
          maxHeight: 'none',
        },
        '.cm-editor': {
          height: '100%',
          maxHeight: 'none',
        },
        '.cm-scroller': {
          overflow: 'auto !important',
          height: '100% !important',
          maxHeight: 'none !important',
        },
        '.cm-content': {
          minHeight: 'auto',
        },
      }),
      ...editorTheme.value,
    ]

    templateEditor = new EditorView({
      state: EditorState.create({
        doc: parsedContent.value?.template || '',
        extensions,
      }),
      parent: templateEditorRef.value,
    })

    // 에디터 초기화 후 강제로 업데이트
    setTimeout(() => {
      if (templateEditor) {
        templateEditor.requestMeasure()
        templateEditor.dispatch({ effects: [] })
      }
    }, 100)
  }
}

// Script 에디터 초기화
function initScriptEditor() {
  if (scriptEditorRef.value && !scriptEditor) {
    // 부모 요소의 높이를 명시적으로 설정
    if (scriptEditorRef.value) {
      scriptEditorRef.value.style.height = '100%'
      scriptEditorRef.value.style.minHeight = '400px'
    }

    const extensions = [
      basicSetup,
      javascript(),
      EditorState.tabSize.of(2), // 탭 크기 2로 설정
      indentUnit.of('  '), // 들여쓰기 단위 2칸 (스페이스 2개)
      EditorView.lineWrapping, // 긴 줄 자동 줄바꿈
      EditorView.theme({
        '&': {
          fontSize: '14px',
          height: '100%',
          maxHeight: 'none',
        },
        '.cm-editor': {
          height: '100%',
          maxHeight: 'none',
        },
        '.cm-scroller': {
          overflow: 'auto !important',
          height: '100% !important',
          maxHeight: 'none !important',
        },
        '.cm-content': {
          minHeight: 'auto',
        },
      }),
      ...editorTheme.value,
    ]

    scriptEditor = new EditorView({
      state: EditorState.create({
        doc: parsedContent.value?.script || '',
        extensions,
      }),
      parent: scriptEditorRef.value,
    })

    // 에디터 초기화 후 강제로 업데이트
    setTimeout(() => {
      if (scriptEditor) {
        scriptEditor.requestMeasure()
        scriptEditor.dispatch({ effects: [] })
      }
    }, 100)
  }
}

// Style 에디터 초기화
function initStyleEditor() {
  if (styleEditorRef.value && !styleEditor) {
    // 부모 요소의 높이를 명시적으로 설정
    if (styleEditorRef.value) {
      styleEditorRef.value.style.height = '100%'
      styleEditorRef.value.style.minHeight = '400px'
    }

    const extensions = [
      basicSetup,
      css(),
      EditorState.tabSize.of(2), // 탭 크기 2로 설정
      indentUnit.of('  '), // 들여쓰기 단위 2칸 (스페이스 2개)
      EditorView.lineWrapping, // 긴 줄 자동 줄바꿈
      EditorView.theme({
        '&': {
          fontSize: '14px',
          height: '100%',
          maxHeight: 'none',
        },
        '.cm-editor': {
          height: '100%',
          maxHeight: 'none',
        },
        '.cm-scroller': {
          overflow: 'auto !important',
          height: '100% !important',
          maxHeight: 'none !important',
        },
        '.cm-content': {
          minHeight: 'auto',
        },
      }),
      ...editorTheme.value,
    ]

    styleEditor = new EditorView({
      state: EditorState.create({
        doc: parsedContent.value?.style || '',
        extensions,
      }),
      parent: styleEditorRef.value,
    })

    // 에디터 초기화 후 강제로 업데이트
    setTimeout(() => {
      if (styleEditor) {
        styleEditor.requestMeasure()
        styleEditor.dispatch({ effects: [] })
      }
    }, 100)
  }
}

// 에디터 초기화 (모든 에디터)
async function initEditors() {
  await nextTick()
  // 현재 활성 탭에 해당하는 에디터만 초기화
  if (activeTab.value === 'template') {
    initTemplateEditor()
  } else if (activeTab.value === 'script') {
    initScriptEditor()
  } else if (activeTab.value === 'style') {
    initStyleEditor()
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
  destroyEditors()
  parseContent()
  nextTick(() => {
    initEditors()
  })
  emit('reload')
}

// 파일 내용 변경 감지
watch(
  () => props.fileContent,
  () => {
    parseContent()
    // 파일이 변경되면 에디터를 재초기화
    destroyEditors()
    nextTick(() => {
      initEditors()
    })
  },
  { immediate: true },
)

// 탭 변경 감지 - 에디터 재렌더링
watch(
  () => activeTab.value,
  async (newTab) => {
    await nextTick()
    // 탭이 변경되면 해당 에디터를 다시 렌더링
    // DOM이 다시 보일 때 CodeMirror가 제대로 렌더링되도록 함
    setTimeout(() => {
      if (newTab === 'template') {
        if (templateEditor && templateEditorRef.value) {
          // 에디터가 이미 초기화되어 있으면 재초기화 (가장 확실한 방법)
          templateEditor.destroy()
          templateEditor = null
          initTemplateEditor()
        } else if (!templateEditor && templateEditorRef.value) {
          // 에디터가 아직 초기화되지 않았으면 초기화
          initTemplateEditor()
        }
      }

      if (newTab === 'script') {
        if (scriptEditor && scriptEditorRef.value) {
          scriptEditor.destroy()
          scriptEditor = null
          initScriptEditor()
        } else if (!scriptEditor && scriptEditorRef.value) {
          initScriptEditor()
        }
      }

      if (newTab === 'style') {
        if (styleEditor && styleEditorRef.value) {
          styleEditor.destroy()
          styleEditor = null
          initStyleEditor()
        } else if (!styleEditor && styleEditorRef.value) {
          initStyleEditor()
        }
      }
    }, 150)
  },
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
        height: 100%;
        position: relative;
        overflow: hidden;

        // CodeMirror 루트 요소
        :deep(.cm-editor) {
          height: 100% !important;
          max-height: none !important;
          display: flex !important;
          flex-direction: column !important;
        }

        // CodeMirror 스크롤러
        :deep(.cm-scroller) {
          overflow: auto !important;
          overflow-x: auto !important;
          overflow-y: auto !important;
          height: 100% !important;
          max-height: none !important;
          flex: 1 !important;
        }

        // CodeMirror 콘텐츠
        :deep(.cm-content) {
          min-height: auto !important;
          padding: 12px !important;
        }

        // CodeMirror 라인
        :deep(.cm-line) {
          padding: 0 4px;
        }
      }
    }
  }
}
</style>
