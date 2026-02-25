/**
 * useAiAssets - AI 도메인 파일 자산 관리
 * domain='ai' 기준 files API 호출
 * 모듈 레벨 싱글톤 ref 사용 - 업로드/선택 후 리스트 반영 보장
 */
import { ref, computed } from 'vue'
import { Notify } from 'quasar'
import { getApiBaseUrl } from '@system/utils/apiBaseUrl.js'

const DOMAIN = 'ai'

const documents = ref([])
const images = ref([])
const audio = ref([])
const videos = ref([])

export function useAiAssets(category = null) {

  const items = computed(() => {
    const c = category?.value ?? category
    if (c === 'documents') return documents.value
    if (c === 'images') return images.value
    if (c === 'audio') return audio.value
    if (c === 'video') return videos.value
    return [...documents.value, ...images.value, ...audio.value, ...videos.value]
  })

  async function listFiles(cat = null) {
    const base = getApiBaseUrl()
    const q = cat ? `?domain=${DOMAIN}&category=${cat}` : `?domain=${DOMAIN}`
    const res = await fetch(`${base}/files/list${q}`)
    const data = await res.json()
    const items = data?.items ?? data ?? []
    return Array.isArray(items) ? items : []
  }

  async function loadCategory(cat) {
    try {
      const items = await listFiles(cat)
      if (cat === 'documents') documents.value = items
      else if (cat === 'images') images.value = items
      else if (cat === 'audio') audio.value = items
      else if (cat === 'video') videos.value = items
    } catch (err) {
      console.error('[useAiAssets] loadCategory 실패:', cat, err)
    }
  }

  async function uploadFile(file) {
    const base = getApiBaseUrl()
    const form = new FormData()
    form.append('file', file)
    form.append('domain', DOMAIN)
    const res = await fetch(`${base}/files/upload`, {
      method: 'POST',
      body: form,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `업로드 실패 (${res.status})`)
    }
    return res.json()
  }

  async function addAsset(payload) {
    const { source, file, url, name, serverPath } = payload
    const cat = payload.category || inferCategory(payload)
    const target = getTargetRef(cat)
    try {
      if (source === 'pc' && file) {
        const r = await uploadFile(file)
        target.value = [...target.value, { id: r.id, original_name: r.original_name, url: r.url, file_path: r.file_path }]
        await loadCategory(cat)
        Notify.create({ message: `"${r.original_name}" 추가됨`, icon: 'check_circle' })
      } else if (source === 'server' && (url || payload.url)) {
        const newItem = { id: payload.id, original_name: name || payload.original_name, url: url || payload.url, file_path: serverPath || payload.file_path }
        const exists = target.value.some((x) => x.id === newItem.id || x.url === newItem.url)
        if (!exists) {
          target.value = [...target.value, newItem]
        }
        await loadCategory(cat)
        Notify.create({ message: `"${newItem.original_name}" 추가됨`, icon: 'check_circle' })
      }
    } catch (err) {
      Notify.create({ type: 'negative', message: err.message || '추가 실패' })
      throw err
    }
  }

  function inferCategory(payload) {
    if (payload.category) return payload.category
    const t = (payload.type || payload.file_type || '').toLowerCase()
    if (t.includes('image')) return 'images'
    if (t.includes('audio')) return 'audio'
    if (t.includes('video')) return 'video'
    return 'documents'
  }

  function getTargetRef(cat) {
    if (cat === 'documents') return documents
    if (cat === 'images') return images
    if (cat === 'audio') return audio
    if (cat === 'video') return videos
    return documents
  }

  async function removeAsset(id, cat) {
    const target = getTargetRef(cat)
    const base = getApiBaseUrl()
    const res = await fetch(`${base}/files/${id}/reference?domain=${DOMAIN}`, { method: 'DELETE' })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || '삭제 실패')
    }
    target.value = target.value.filter((x) => x.id !== id)
  }

  function moveAsset(cat, index, direction) {
    const target = getTargetRef(cat)
    const arr = [...target.value]
    const newIdx = direction === 'up' ? index - 1 : index + 1
    if (newIdx < 0 || newIdx >= arr.length) return
    ;[arr[index], arr[newIdx]] = [arr[newIdx], arr[index]]
    target.value = arr
  }

  return {
    documents,
    images,
    audio,
    videos,
    items,
    listFiles,
    loadCategory,
    uploadFile,
    addAsset,
    removeAsset,
    moveAsset,
  }
}
