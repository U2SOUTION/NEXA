<!--
  FileBrowserModal.vue
  DB 연결 웹 탐색기 - listUrl 기반 목록, 선택 시 @select
-->
<template>
  <q-dialog :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)" persistent>
    <q-card class="file-browser-modal" style="min-width: 400px; max-width: 90vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">파일 선택</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-list v-if="items.length" bordered separator>
          <q-item v-for="item in items" :key="item.id" clickable @click="selectItem(item)">
            <q-item-section avatar>
              <q-icon :name="getFileIcon(item)" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.original_name }}</q-item-label>
              <q-item-label caption>{{ formatSize(item.file_size) }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <div v-else-if="!loading" class="text-center text-grey-6 q-pa-lg">등록된 파일이 없습니다.</div>
        <div v-else class="text-center q-pa-lg">
          <q-spinner size="md" />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="취소" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getApiBaseUrl } from '@system/utils/apiBaseUrl'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  listUrl: { type: String, required: true },
  accept: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'select'])

const items = ref([])
const loading = ref(false)

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      fetchList()
    }
  },
)

async function fetchList() {
  loading.value = true
  items.value = []
  try {
    const base = getApiBaseUrl()
    const url = props.listUrl.startsWith('http') ? props.listUrl : `${base}${props.listUrl.startsWith('/') ? '' : '/'}${props.listUrl}`
    const res = await fetch(url)
    const data = await res.json()
    items.value = data.items || []
  } catch (err) {
    console.error('[FileBrowserModal] 목록 조회 실패:', err)
  } finally {
    loading.value = false
  }
}

function getFileIcon(item) {
  const t = item.file_type || item.category
  if (t?.includes('image')) return 'image'
  if (t?.includes('video')) return 'videocam'
  if (t?.includes('audio')) return 'audiotrack'
  return 'description'
}

function formatSize(bytes) {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function selectItem(item) {
  emit('select', item)
  emit('update:modelValue', false)
}
</script>
