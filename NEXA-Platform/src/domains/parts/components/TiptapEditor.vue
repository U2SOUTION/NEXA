<template>
  <BaseTiptapEditor v-bind="$attrs" :model-value="modelValue" :placeholder="placeholder" :upload-handler="handleUpload" @update:modelValue="(val) => emit('update:modelValue', val)" />
</template>

<script setup>
import BaseTiptapEditor from '@engines/tiptap/BaseTiptapEditor.vue'
import { usePartsDataStore } from '@system/store/partsDataStore'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '내용을 입력하세요...' },
  partClassId: { type: Number, default: null },
})

const emit = defineEmits(['update:modelValue'])

const partsDataStore = usePartsDataStore()

async function handleUpload(file, context) {
  const isFormal = Boolean(props.partClassId)
  const uploaded = isFormal ? await partsDataStore.uploadEditorImage(props.partClassId, file) : await partsDataStore.uploadTempFile(file)
  return {
    url: uploaded.url,
    original_filename: uploaded.original_filename || file.name,
    context,
  }
}
</script>
