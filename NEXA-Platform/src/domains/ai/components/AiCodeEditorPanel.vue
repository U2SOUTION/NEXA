<template>
  <div class="ai-code-editor-panel column">
    <div ref="containerRef" class="monaco-container" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as monaco from 'monaco-editor'

const props = defineProps({
  modelValue: { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  theme: { type: String, default: 'vs-dark' },
})

const emit = defineEmits(['update:modelValue'])

const containerRef = ref(null)
/** @type {import('monaco-editor').editor.IStandaloneCodeEditor | null} */
let editor = null
let ignoreNextChange = false

onMounted(() => {
  if (!containerRef.value) return
  editor = monaco.editor.create(containerRef.value, {
    value: props.modelValue || '',
    language: props.language,
    theme: props.theme,
    automaticLayout: true,
    minimap: { enabled: true },
    fontSize: 14,
    wordWrap: 'on',
    scrollBeyondLastLine: false,
  })
  editor.onDidChangeModelContent(() => {
    if (ignoreNextChange) return
    const value = editor?.getValue() ?? ''
    emit('update:modelValue', value)
  })
})

watch(
  () => props.modelValue,
  (v) => {
    if (!editor) return
    const current = editor.getValue()
    const next = v ?? ''
    if (current !== next) {
      ignoreNextChange = true
      editor.setValue(next)
      ignoreNextChange = false
    }
  },
  { immediate: true },
)

watch(
  () => props.language,
  (lang) => {
    if (editor && lang) {
      const model = editor.getModel()
      if (model) monaco.editor.setModelLanguage(model, lang)
    }
  },
)

watch(
  () => props.theme,
  (t) => {
    if (t) monaco.editor.setTheme(t)
  },
)

onBeforeUnmount(() => {
  editor?.dispose()
  editor = null
})
</script>

<style lang="scss" scoped>
.ai-code-editor-panel {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.monaco-container {
  flex: 1;
  min-height: 0;
  width: 100%;
}
</style>
