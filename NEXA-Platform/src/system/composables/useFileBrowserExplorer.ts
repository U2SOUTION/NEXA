/**
 * 파일 브라우저 모달용 탐색기 (로컬 상태, 싱글톤 아님)
 * GET /api/files/explorer, GET /api/files/explorer/tree 사용
 */
import { ref, computed } from 'vue'
import { getApiBaseUrl } from '@system/utils/apiBaseUrl'
import {
  buildFileTreeFromApiResponse,
  type FileTreeNode,
} from '@system/utils/fileExplorer'

export function useFileBrowserExplorer() {
  const treeNodes = ref<FileTreeNode[]>([])
  const treeLoading = ref(false)
  const items = ref<unknown[]>([])
  const total = ref(0)
  const listLoading = ref(false)
  const selectedNode = ref({ domain: null as string | null, path: null as string | null })
  const selectedNodeId = ref('all')
  const listOffset = ref(0)
  const listLimit = 50
  const searchQuery = ref('')
  const listError = ref<string | null>(null)

  const hasMore = computed(() => items.value.length < total.value)

  async function loadTree() {
    treeLoading.value = true
    try {
      const base = getApiBaseUrl()
      const res = await fetch(`${base}/files/explorer/tree`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || '트리 조회 실패')
      treeNodes.value = buildFileTreeFromApiResponse(data)
    } catch (err) {
      console.error('[useFileBrowserExplorer] loadTree:', err)
      treeNodes.value = []
    } finally {
      treeLoading.value = false
    }
  }

  async function loadItems(append = false) {
    listLoading.value = true
    listError.value = null
    const offset = append ? listOffset.value : 0
    try {
      const base = getApiBaseUrl()
      const params = new URLSearchParams()
      params.set('limit', String(listLimit))
      params.set('offset', String(offset))
      if (selectedNode.value.domain) params.set('domain', selectedNode.value.domain)
      if (selectedNode.value.path != null && selectedNode.value.path !== '') params.set('path', selectedNode.value.path)
      if (searchQuery.value.trim()) params.set('q', searchQuery.value.trim())

      const res = await fetch(`${base}/files/explorer?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || '목록 조회 실패')

      if (append) {
        items.value = [...items.value, ...(data.items || [])]
      } else {
        items.value = data.items || []
      }
      total.value = data.total ?? 0
      listOffset.value = offset + (data.items?.length ?? 0)
    } catch (err: unknown) {
      console.error('[useFileBrowserExplorer] loadItems:', err)
      listError.value = err instanceof Error ? err.message : '목록을 불러오지 못했습니다.'
      if (!append) items.value = []
    } finally {
      listLoading.value = false
    }
  }

  function selectNode(node: { domain?: string | null; path?: string | null; id?: string }) {
    const domain = node?.domain ?? null
    const path = node?.path !== undefined ? node.path : null
    selectedNode.value = { domain, path }
    selectedNodeId.value = node?.id ?? 'all'
    listOffset.value = 0
    loadItems(false)
  }

  function loadMore() {
    if (!hasMore.value || listLoading.value) return
    loadItems(true)
  }

  function setSearchQuery(q: string) {
    searchQuery.value = q ?? ''
    listOffset.value = 0
    loadItems(false)
  }

  function refreshList() {
    listOffset.value = 0
    loadItems(false)
  }

  return {
    treeNodes,
    treeLoading,
    items,
    total,
    listLoading,
    listError,
    selectedNode,
    selectedNodeId,
    hasMore,
    searchQuery,
    loadTree,
    loadItems,
    selectNode,
    loadMore,
    setSearchQuery,
    refreshList,
  }
}
