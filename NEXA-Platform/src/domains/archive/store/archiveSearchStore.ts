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

  function setQuery(value) {
    query.value = value
  }

  function setScope(value) {
    scope.value = value
  }

  function setFilters(partial) {
    filters.value = { ...filters.value, ...partial }
  }

  function setResults(partial) {
    results.value = { ...results.value, ...partial }
  }

  async function search(callback) {
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
