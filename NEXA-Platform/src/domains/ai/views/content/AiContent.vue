<template>
  <div class="ai-content column">
    <AiSplitLayout
      v-model:editor-content="editorContent"
      v-model:code-content="codeContent"
      :code-language="codeLanguage"
    />
  </div>
</template>

<script setup>
import { ref, provide, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { parseMarkdown } from '@system/utils/markdown/index'
import { useAiInsertRequest } from '../../composables/useAiInsertRequest'
import { useAiExplorerSelection } from '../../composables/useAiExplorerSelection'
import { showPanel } from '../../composables/useAiSplitLayout'
import { getUploadDisplayUrl } from '@system/utils/apiBaseUrl'
import AiSplitLayout from './AiSplitLayout.vue'

const editorContent = ref('')
const codeContent = ref('// 코드를 입력하세요\n')
const codeLanguage = ref('javascript')
const pendingInsertContent = ref(null)
const pendingCodeInsertContent = ref(null)

const { onInsertRequest, onOpenEditorRequest } = useAiInsertRequest()
const { onInjectToEditor, onOpenInCodePanel } = useAiExplorerSelection()
let unregisterInsertRequest = null
let unregisterOpenEditorRequest = null
let unregisterInjectToEditor = null
let unregisterOpenInCodePanel = null

function extToMonacoLanguage(ext) {
  const map = {
    js: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    ts: 'typescript',
    mts: 'typescript',
    cts: 'typescript',
    jsx: 'javascript',
    tsx: 'typescript',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    py: 'python',
    css: 'css',
    scss: 'scss',
    html: 'html',
    htm: 'html',
    md: 'markdown',
    sql: 'sql',
    sh: 'shell',
    bash: 'shell',
    vue: 'html',
  }
  return map[ext] || 'plaintext'
}

function fileToEditorHtml(file) {
  if (!file?.file_path && !file?.url) return ''
  const url = file.file_path ? getUploadDisplayUrl(file.file_path) : file.url
  const name = file.original_name || '파일'
  const t = (file?.file_type || file?.category || '').toLowerCase()
  if (t === 'image' || t === 'images') {
    return `<p><img src="${url}" alt="${name}" /></p>`
  }
  return `<p><a href="${url}">${name}</a></p>`
}

onMounted(() => {
  unregisterInsertRequest = onInsertRequest((raw) => {
    const html = parseMarkdown(raw, '', {})
    showPanel('editor')
    nextTick(() => {
      pendingInsertContent.value = html
    })
  })
  unregisterOpenEditorRequest = onOpenEditorRequest(() => {
    showPanel('editor')
  })
  unregisterInjectToEditor = onInjectToEditor((file) => {
    const html = fileToEditorHtml(file)
    if (html) {
      showPanel('editor')
      nextTick(() => {
        pendingInsertContent.value = html
      })
    }
  })
  unregisterOpenInCodePanel = onOpenInCodePanel(async (file) => {
    if (!file?.file_path && !file?.url) return
    const url = file.file_path ? getUploadDisplayUrl(file.file_path) : file.url
    if (!url) return
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(res.statusText)
      const text = await res.text()
      const ext = (file.original_name || '').toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || ''
      codeContent.value = text
      codeLanguage.value = extToMonacoLanguage(ext)
      showPanel('code')
    } catch (e) {
      console.error('[AiContent] code file fetch failed:', e)
    }
  })
})

onBeforeUnmount(() => {
  unregisterInsertRequest?.()
  unregisterOpenEditorRequest?.()
  unregisterInjectToEditor?.()
  unregisterOpenInCodePanel?.()
})

provide('aiInsertContent', {
  pendingInsertContent,
  pendingCodeInsertContent,
  setCenterTab: (tabId) => {
    showPanel(tabId)
  },
})
</script>

<style lang="scss" scoped>
.ai-content {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
</style>
