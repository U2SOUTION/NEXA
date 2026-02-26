<template>
  <div class="ai-editor-panel">
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
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;

  :deep(.tiptap-editor) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .editor-content {
      flex: 1;
      min-height: 120px;
    }
  }
}
</style>
