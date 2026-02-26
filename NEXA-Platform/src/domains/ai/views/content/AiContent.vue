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
import { showPanel } from '../../composables/useAiSplitLayout'
import AiSplitLayout from './AiSplitLayout.vue'

const editorContent = ref('')
const codeContent = ref('// 코드를 입력하세요\n')
const pendingInsertContent = ref(null)
const pendingCodeInsertContent = ref(null)

const { onInsertRequest, onOpenEditorRequest } = useAiInsertRequest()
let unregisterInsertRequest = null
let unregisterOpenEditorRequest = null

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
})

onBeforeUnmount(() => {
  unregisterInsertRequest?.()
  unregisterOpenEditorRequest?.()
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
