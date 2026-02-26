<template>
  <BaseTiptapEditor v-bind="$attrs" :model-value="props.modelValue" :placeholder="props.placeholder" :upload-handler="handleUpload" @update:modelValue="(val) => emit('update:modelValue', val)" />
</template>

<script setup>
import BaseTiptapEditor from '@engines/tiptap/BaseTiptapEditor.vue'
import { usePartsDataStore } from '@system/store/partsDataStore'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '문서를 작성하세요. (텍스트, 표, 이미지, 링크 등)' },
})

const emit = defineEmits(['update:modelValue'])
const partsDataStore = usePartsDataStore()

async function handleUpload(file, context) {
  // archive는 현재 전용 업로드 엔드포인트가 없어 임시 업로드를 사용
  const uploaded = await partsDataStore.uploadTempFile(file)
  return {
    url: uploaded.url,
    original_filename: uploaded.original_filename || file.name,
    context,
  }
}
</script>
