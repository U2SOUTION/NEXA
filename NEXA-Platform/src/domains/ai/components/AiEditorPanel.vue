<template>
  <div class="ai-editor-panel column">
    <BaseTiptapEditor v-model="editorContent" :placeholder="placeholder" :upload-handler="handleUpload" :allow-fullscreen="true" @update:model-value="onContentUpdate" />
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
/* 에디터 자체 스크롤: 패널이 스크롤 컨테이너. 내용이 크면 패널에 스크롤바 생성 → 가려짐 없음 */
.ai-editor-panel {
  height: 100%;
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.ai-editor-panel :deep(.tiptap-editor) {
  display: flex;
  flex-direction: column;
  min-width: 100%;
  min-height: 100%;
  width: max-content;
  height: max-content;
  flex-shrink: 0;
}

/* 스크롤은 패널이 담당. 여기서는 overflow 제거하고 내용 크기만큼 늘어나게 */
.ai-editor-panel :deep(.editor-scroll) {
  flex: 1 1 auto;
  min-width: min-content;
  min-height: min-content;
  overflow: visible;
}
</style>
