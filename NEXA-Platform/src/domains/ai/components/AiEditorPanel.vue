<template>
  <div class="ai-editor-panel column">
    <BaseTiptapEditor
      v-model="editorContent"
      :placeholder="placeholder"
      :upload-handler="handleUpload"
      :allow-fullscreen="true"
      @update:model-value="onContentUpdate"
    />
  </div>
</template>

<script setup>
import { ref, inject, watch } from 'vue'
import BaseTiptapEditor from '@engines/tiptap/skins/full/TiptapEditor.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '내용을 입력하세요. (메모, 문서 등)' },
})

const emit = defineEmits(['update:modelValue'])

const editorContent = ref(props.modelValue || '')

watch(
  () => props.modelValue,
  (v) => {
    const next = v || ''
    if (editorContent.value !== next) {
      editorContent.value = next
    }
  },
  { immediate: true },
)

const aiInsertContent = inject('aiInsertContent', null)

watch(
  () => aiInsertContent?.pendingInsertContent?.value,
  (html) => {
    if (!html || !aiInsertContent) return
    const current = editorContent.value || ''
    editorContent.value = current ? `${current}${html}` : html
    emit('update:modelValue', editorContent.value)
    aiInsertContent.pendingInsertContent.value = null
  },
  { immediate: true },
)

function onContentUpdate(value) {
  editorContent.value = value
  emit('update:modelValue', value)
}

async function handleUpload(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      resolve({
        url: dataUrl,
        original_filename: file.name,
      })
    }
    reader.onerror = () => reject(new Error('파일 읽기 실패'))
    reader.readAsDataURL(file)
  })
}
</script>

<style lang="scss" scoped>
.ai-editor-panel {
  height: 100%;
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* deep 사용 이유: Tiptap 엔진 내부 .tiptap-editor, .editor-content 구조 접근 필요, 부모 영역 상하 꽉 채우기 */
.ai-editor-panel :deep(.tiptap-editor) {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-editor-panel :deep(.editor-content) {
  flex: 1 1 0;
  min-height: 0;
  max-height: none;
  overflow-y: auto;
}
</style>
