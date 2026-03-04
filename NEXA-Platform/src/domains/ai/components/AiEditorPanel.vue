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
/*
  [에디터 스크롤 전략] "에디터 자체 스크롤" — 스크롤바 가려짐 해결
  ------------------------------------------------------------------------
  문제: 넓은 표(엑셀 삽입) 등으로 인해 스크롤이 필요할 때,
        내부(.editor-scroll)에 스크롤을 두면 부모(.tiptap-editor)의
        overflow:hidden + border-radius 때문에 스크롤바가 잘려서 안 보임.
        패딩으로 공간을 만들어도 가로/세로 중 한쪽이 계속 가려지는 한계.

  결정: "표에 스크롤" vs "에디터(패널)에 스크롤" 중 → 에디터 자체 스크롤 채택.
        즉, 스크롤 컨테이너를 가장 바깥(패널)으로 올리고, 내부는 overflow 하지 않고
        내용 크기만큼만 늘어나게 함. 스크롤바는 패널에만 생기므로 가려질 레이어가 없음.

  개념 (비슷한 상황 재발 시 참고):
  - 스크롤 컨테이너 = 클리핑(overflow:hidden/radius)이 없는 가장 바깥 쪽.
  - 내부 요소 = overflow:visible, min-width/min-height: min-content 로 내용만큼 성장.
  - 이렇게 하면 "큰 내용"이 있어도 스크롤은 한 곳에서만 발생하고, 스크롤바가 잘리지 않음.
  - 참고: _scrollbar.scss 에서 .ai-editor-panel 스크롤바 예외(8px) 적용.
*/
.ai-editor-panel {
  height: 100%;
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

/* 스플릿 영역을 넘지 않음: 에디터 블록은 패널 폭을 넘지 않고, 넘치는 부분만 가로 스크롤 */
.ai-editor-panel :deep(.tiptap-editor) {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100%;
  width: 100%;
  max-width: 100%;
  height: max-content;
  flex-shrink: 0;
  box-sizing: border-box;
  overflow: visible; /* 넓은 본문이 .editor-scroll에서 넘치면 패널 가로 스크롤로 보이게 */
}

/* 본문만 넓어질 수 있음. 패널이 스크롤하여 표시 */
.ai-editor-panel :deep(.editor-scroll) {
  flex: 1 1 auto;
  min-width: min-content;
  min-height: min-content;
  overflow: visible;
}
</style>
