import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 섹션 키: index | hub | editor | connector | insights
export const useArchiveSearchStore = defineStore('archiveSearch', () => {
  const query = ref('')
  const scope = ref('all') // all | hub | editor | connector | insights | index
  const filters = ref({
    tags: [],
    dateRange: null,
    // 섹션별 확장 필터는 필요 시 객체에 추가 (ex: editor: { templateType: '' })
  })

  const results = ref({
    index: [],
    hub: [],
    editor: [],
    connector: [],
    insights: [],
  })

  const isSearching = ref(false)

  const hasQuery = computed(() => query.value.trim().length > 0)

  function setQuery(value: string) {
    query.value = value
  }

  function setScope(value: string) {
    scope.value = value
  }

  function setFilters(partial: Partial<typeof filters.value>) {
    filters.value = { ...filters.value, ...partial }
  }

  function setResults(partial: Partial<typeof results.value>) {
    results.value = { ...results.value, ...partial }
  }

  async function search(callback: (payload: { query: string; scope: string; filters: typeof filters.value }) => Promise<Partial<typeof results.value> | undefined>) {
    if (!callback || typeof callback !== 'function') return
    isSearching.value = true
    try {
      const payload = {
        query: query.value.trim(),
        scope: scope.value,
        filters: filters.value,
      }
      const next = await callback(payload)
      // next는 { index: [], hub: [], editor: [], connector: [], insights: [] } 형태를 기대
      setResults(next || {})
    } finally {
      isSearching.value = false
    }
  }

  return {
    query,
    scope,
    filters,
    results,
    isSearching,
    hasQuery,
    setQuery,
    setScope,
    setFilters,
    setResults,
    search,
  }
})
