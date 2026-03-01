<template>
  <div class="ai-content column">
    <AiSplitLayout
      v-model:editor-content="editorContent"
      v-model:code-content="codeContent"
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
const pendingInsertContent = ref(null)
const pendingCodeInsertContent = ref(null)

const { onInsertRequest, onOpenEditorRequest } = useAiInsertRequest()
const { onInjectToEditor } = useAiExplorerSelection()
let unregisterInsertRequest = null
let unregisterOpenEditorRequest = null
let unregisterInjectToEditor = null

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
})

onBeforeUnmount(() => {
  unregisterInsertRequest?.()
  unregisterOpenEditorRequest?.()
  unregisterInjectToEditor?.()
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
