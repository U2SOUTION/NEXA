<template>
  <div class="search-bar">
    <q-input v-model="query" dense outlined clearable debounce="200" :placeholder="placeholder" @keydown.enter="emitSearch">
      <template #prepend>
        <q-icon name="search" />
      </template>
      <template #append>
        <q-btn flat round dense icon="close" v-if="query" @click="clear" />
      </template>
    </q-input>

    <div class="scope-row">
      <q-btn-toggle v-model="scope" dense spread no-caps unelevated toggle-color="primary" class="scope-toggle" :options="scopeOptions" @update:model-value="emitSearch" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useArchiveSearchStore } from '@domains/archive/store/archiveSearchStore'

const props = defineProps({
  placeholder: {
    type: String,
    default: '전체(ALL)에서 검색...',
  },
  onSearch: {
    type: Function,
    default: null,
  },
})

const searchStore = useArchiveSearchStore()

const scopeOptions = [
  { label: 'ALL', value: 'all' },
  { label: 'HUB', value: 'hub' },
  { label: 'EDITOR', value: 'editor' },
  { label: 'CONNECTOR', value: 'connector' },
  { label: 'INSIGHTS', value: 'insights' },
]

const query = computed({
  get: () => searchStore.query,
  set: (v) => searchStore.setQuery(v),
})

const scope = computed({
  get: () => searchStore.scope,
  set: (v) => searchStore.setScope(v),
})

function clear() {
  searchStore.setQuery('')
  emitSearch()
}

async function emitSearch() {
  if (props.onSearch) {
    await searchStore.search(props.onSearch)
  }
}
</script>

<style scoped lang="scss">
.search-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 12px 4px;
  background: var(--nexa-background);
}

.scope-toggle :deep(.q-btn__content) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
}
</style>
