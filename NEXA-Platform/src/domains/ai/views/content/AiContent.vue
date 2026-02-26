<template>
  <div class="ai-content column">
    <q-tabs v-model="centerTab" dense class="ai-content-tabs" active-color="primary" indicator-color="primary" align="justify">
      <q-tab name="chat" label="채팅" icon="chat" />
      <q-tab name="editor" label="에디터" icon="edit_note" />
      <q-tab name="image" label="이미지" icon="image" />
      <q-tab name="audio" label="음원" icon="graphic_eq" />
      <q-tab name="video" label="영상" icon="videocam" />
      <q-tab name="explorer" label="탐색기" icon="folder_open" />
    </q-tabs>
    <q-tab-panels v-model="centerTab" animated class="col ai-content-panels">
      <q-tab-panel name="chat" class="q-pa-none ai-tab-panel">
        <AiChatPanel />
      </q-tab-panel>
      <q-tab-panel name="editor" class="q-pa-none ai-tab-panel">
        <AiEditorPanel v-model="editorContent" />
      </q-tab-panel>
      <q-tab-panel name="image" class="q-pa-none ai-tab-panel">
        <AiImageEditorPanel />
      </q-tab-panel>
      <q-tab-panel name="audio" class="q-pa-none ai-tab-panel">
        <AiAudioEditorPanel />
      </q-tab-panel>
      <q-tab-panel name="video" class="q-pa-none ai-tab-panel">
        <AiVideoEditorPanel />
      </q-tab-panel>
      <q-tab-panel name="explorer" class="q-pa-none ai-tab-panel">
        <AiExplorerPanel />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { ref, provide, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { parseMarkdown } from '@system/utils/markdown/index'
import { useAiInsertRequest } from '../../composables/useAiInsertRequest'
import AiChatPanel from '../../components/AiChatPanel.vue'
import AiEditorPanel from '../../components/AiEditorPanel.vue'
import AiImageEditorPanel from '../../components/AiImageEditorPanel.vue'
import AiAudioEditorPanel from '../../components/AiAudioEditorPanel.vue'
import AiVideoEditorPanel from '../../components/AiVideoEditorPanel.vue'
import AiExplorerPanel from '../../components/AiExplorerPanel.vue'

const centerTab = ref('chat')
const editorContent = ref('')
const pendingInsertContent = ref(null)

const { onInsertRequest, onOpenEditorRequest } = useAiInsertRequest()
let unregisterInsertRequest = null
let unregisterOpenEditorRequest = null

onMounted(() => {
  unregisterInsertRequest = onInsertRequest((raw) => {
    const html = parseMarkdown(raw, '', {})
    centerTab.value = 'editor'
    nextTick(() => {
      pendingInsertContent.value = html
    })
  })
  unregisterOpenEditorRequest = onOpenEditorRequest(() => {
    centerTab.value = 'editor'
  })
})

onBeforeUnmount(() => {
  unregisterInsertRequest?.()
  unregisterOpenEditorRequest?.()
})

provide('aiInsertContent', {
  pendingInsertContent,
  setCenterTab: (tab) => {
    centerTab.value = tab
  },
})
</script>

<style lang="scss" scoped>
.ai-content {
  height: 100%;
  min-height: 0;
  overflow: hidden;

  .ai-content-tabs {
    flex-shrink: 0;
  }

  .ai-content-panels {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .ai-tab-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;

    > * {
      flex: 1;
      min-height: 0;
    }
  }
}
</style>
