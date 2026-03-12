/**
 * useAiAssets - AI 도메인 파일 자산 관리
 * domain='ai' 기준 files API 호출
 * 모듈 레벨 싱글톤 ref 사용 - 업로드/선택 후 리스트 반영 보장
 */
import type { Ref } from 'vue'
import { ref, computed } from 'vue'
import { Notify } from 'quasar'
import { getApiBaseUrl } from '@system/utils/apiBaseUrl'
import type { AiAssetItem, UploadProgressItem } from '../types/aiDomainTypes'

const DOMAIN = 'ai'

export type AssetCategory = 'documents' | 'images' | 'audio' | 'video'

const documents = ref<AiAssetItem[]>([])
const images = ref<AiAssetItem[]>([])
const audio = ref<AiAssetItem[]>([])
const videos = ref<AiAssetItem[]>([])

/** 업로드 진행률 표시용 */
const uploadProgressFiles = ref<UploadProgressItem[]>([])
const showUploadProgress = ref(false)

export function useAiAssets(category: Ref<AssetCategory | null> | AssetCategory | null = null) {
  const items = computed(() => {
    const c = (category as Ref<AssetCategory | null> | null)?.value ?? (category as AssetCategory | null)
    if (c === 'documents') return documents.value
    if (c === 'images') return images.value
    if (c === 'audio') return audio.value
    if (c === 'video') return videos.value
    return [...documents.value, ...images.value, ...audio.value, ...videos.value]
  })

  async function listFiles(cat: AssetCategory | null = null): Promise<AiAssetItem[]> {
    const base = getApiBaseUrl()
    const q = cat ? `?domain=${DOMAIN}&category=${cat}` : `?domain=${DOMAIN}`
    const res = await fetch(`${base}/files/list${q}`)
    const data = (await res.json()) as { items?: AiAssetItem[] } | AiAssetItem[]
    const items = Array.isArray(data) ? data : (data?.items ?? [])
    return Array.isArray(items) ? items : []
  }

  async function loadCategory(cat: AssetCategory | null): Promise<void> {
    try {
      const items = await listFiles(cat)
      if (cat === 'documents') documents.value = items
      else if (cat === 'images') images.value = items
      else if (cat === 'audio') audio.value = items
      else if (cat === 'video') videos.value = items
    } catch (err) {
      console.error('[useAiAssets] loadCategory 실패:', cat, err instanceof Error ? err.message : String(err))
    }
  }

  async function uploadFile(file: File) {
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

  /**
   * 업로드 진행률 콜백 지원 (XMLHttpRequest 사용)
   * @param onProgress (progress: 0-100) => void
   */
  function uploadFileWithProgress(
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<{ id: number; original_name: string; url: string; file_path: string }> {
    const base = getApiBaseUrl()
    const form = new FormData()
    form.append('file', file)
    form.append('domain', DOMAIN)
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = (e.loaded / e.total) * 100
          onProgress(percent)
        }
      })
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText))
          } catch {
            reject(new Error('서버 응답 파싱 실패'))
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText)
            reject(new Error(err?.error || `업로드 실패 (${xhr.status})`))
          } catch {
            reject(new Error(`업로드 실패 (${xhr.status})`))
          }
        }
      })
      xhr.addEventListener('error', () => reject(new Error('네트워크 오류가 발생했습니다.')))
      xhr.addEventListener('abort', () => reject(new Error('업로드가 중단되었습니다.')))
      xhr.open('POST', `${base}/files/upload`)
      xhr.send(form)
    })
  }

  function formatSpeed(bytesPerSec: number): string {
    if (bytesPerSec >= 1024 * 1024) return `${(bytesPerSec / 1024 / 1024).toFixed(1)} MB/s`
    if (bytesPerSec >= 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`
    return `${Math.round(bytesPerSec)} B/s`
  }

  function formatETA(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}초 남음`
    const m = Math.floor(seconds / 60)
    const s = Math.round(seconds % 60)
    return `${m}분 ${s}초 남음`
  }

  async function addAsset(payload: {
    source: string
    file?: File
    url?: string
    name?: string
    original_name?: string
    serverPath?: string
    file_path?: string
    category?: string
    type?: string
    file_type?: string
    id?: number
  }) {
    const { source, file, url, name, serverPath } = payload
    const cat = (payload.category || inferCategory(payload)) as AssetCategory
    const target = getTargetRef(cat)
    try {
      if (source === 'pc' && file) {
        const index = uploadProgressFiles.value.length
        uploadProgressFiles.value.push({
          name: file.name,
          progress: 0,
          completed: false,
          speed: undefined,
          eta: undefined,
        })
        showUploadProgress.value = true

        let lastLoaded = 0
        let lastTime = Date.now()
        const onProgress = (progress: number) => {
          const now = Date.now()
          const timeDiff = (now - lastTime) / 1000
          const loadedDiff = (progress / 100) * file.size - lastLoaded
          if (timeDiff > 0 && loadedDiff > 0) {
            const speed = loadedDiff / timeDiff
            const remaining = file.size - (progress / 100) * file.size
            const eta = remaining / speed
            uploadProgressFiles.value[index].speed = formatSpeed(speed)
            uploadProgressFiles.value[index].eta = formatETA(eta)
          }
          uploadProgressFiles.value[index].progress = progress
          lastLoaded = (progress / 100) * file.size
          lastTime = Date.now()
        }

        const r = await uploadFileWithProgress(file, onProgress)
        uploadProgressFiles.value[index].completed = true
        uploadProgressFiles.value[index].progress = 100

        target.value = [...target.value, { id: r.id, original_name: r.original_name, url: r.url, file_path: r.file_path }]
        await loadCategory(cat as AssetCategory)
        Notify.create({ message: `"${r.original_name}" 추가됨`, icon: 'check_circle' })

        scheduleHideUploadProgress()
      } else if (source === 'server' && (url || payload.url)) {
        const newItem: AiAssetItem = {
          id: payload.id ?? 0,
          original_name: (name || payload.original_name) ?? '',
          url: (url || payload.url) ?? '',
          file_path: serverPath ?? payload.file_path,
        }
        const exists = target.value.some((x) => x.id === newItem.id || x.url === newItem.url)
        if (!exists) {
          target.value = [...target.value, newItem]
        }
        await loadCategory(cat as AssetCategory)
        Notify.create({ message: `"${newItem.original_name}" 추가됨`, icon: 'check_circle' })
      }
    } catch (err) {
      const idx = uploadProgressFiles.value.length - 1
      if (idx >= 0 && source === 'pc' && file) {
        uploadProgressFiles.value[idx].error = err instanceof Error ? err.message : String(err)
        uploadProgressFiles.value[idx].completed = true
        scheduleHideUploadProgress()
      }
      Notify.create({ type: 'negative', message: err instanceof Error ? err.message : '추가 실패' })
      throw err
    }
  }

  let hideProgressTimer: ReturnType<typeof setTimeout> | null = null
  function scheduleHideUploadProgress() {
    if (hideProgressTimer) clearTimeout(hideProgressTimer)
    hideProgressTimer = setTimeout(() => {
      const allDone = uploadProgressFiles.value.every((f) => f.completed)
      if (allDone) {
        showUploadProgress.value = false
        uploadProgressFiles.value = []
      }
      hideProgressTimer = null
    }, 1000)
  }

  function inferCategory(payload: { category?: string; type?: string; file_type?: string }): AssetCategory {
    if (payload.category) return payload.category as AssetCategory
    const t = (payload.type || payload.file_type || '').toLowerCase()
    if (t.includes('image')) return 'images'
    if (t.includes('audio')) return 'audio'
    if (t.includes('video')) return 'video'
    return 'documents'
  }

  function getTargetRef(cat: AssetCategory | null): Ref<AiAssetItem[]> {
    if (cat === 'documents') return documents
    if (cat === 'images') return images
    if (cat === 'audio') return audio
    if (cat === 'video') return videos
    return documents
  }

  /** 탐색기에서 선택한 파일을 AI 미디어 리스트에 추가 (POST /files/:id/reference) */
  async function addFileToMedia(file: { id?: number; category?: string; file_type?: string }): Promise<void> {
    const fileId = file?.id
    const cat = (file?.category || inferCategory({ file_type: file?.file_type })) as AssetCategory
    if (!fileId) throw new Error('파일 ID가 필요합니다.')
    const base = getApiBaseUrl()
    const res = await fetch(`${base}/files/${fileId}/reference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: DOMAIN }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      if (err?.code === 'NOT_FOUND') throw new Error('파일을 찾을 수 없습니다.')
      throw new Error(err?.error || `미디어 추가 실패 (${res.status})`)
    }
    await loadCategory(cat as AssetCategory)
  }

  async function removeAsset(id: number, cat: AssetCategory | null): Promise<void> {
    const target = getTargetRef(cat)
    const base = getApiBaseUrl()
    const res = await fetch(`${base}/files/${id}/reference?domain=${DOMAIN}`, { method: 'DELETE' })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || '삭제 실패')
    }
    target.value = target.value.filter((x) => x.id !== id)
  }

  function moveAsset(cat: AssetCategory | null, index: number, direction: 'up' | 'down'): void {
    const target = getTargetRef(cat)
    const arr = [...target.value]
    const newIdx = direction === 'up' ? index - 1 : index + 1
    if (newIdx < 0 || newIdx >= arr.length) return
    ;[arr[index], arr[newIdx]] = [arr[newIdx], arr[index]]
    target.value = arr
  }

  const selectedMediaItem = ref<{ category: AssetCategory; item: AiAssetItem } | null>(null)

  function selectMediaItem(category: AssetCategory, item: AiAssetItem): void {
    if (!item?.url) return
    const cur = selectedMediaItem.value
    const same = cur?.item?.id === item.id && cur?.category === category
    selectedMediaItem.value = same ? null : { category, item }
  }

  function getMediaArray(cat: AssetCategory | null): AiAssetItem[] {
    const target = getTargetRef(cat)
    return target?.value ?? []
  }

  const canMoveMediaUp = computed(() => {
    const s = selectedMediaItem.value
    if (!s) return false
    const arr = getMediaArray(s.category)
    const idx = arr.findIndex((x) => x.id === s.item.id)
    return idx > 0
  })

  const canMoveMediaDown = computed(() => {
    const s = selectedMediaItem.value
    if (!s) return false
    const arr = getMediaArray(s.category)
    const idx = arr.findIndex((x) => x.id === s.item.id)
    return idx >= 0 && idx < arr.length - 1
  })

  async function handleMediaDelete() {
    const s = selectedMediaItem.value
    if (!s) return
    try {
      await removeAsset(s.item.id, s.category)
      selectedMediaItem.value = null
      Notify.create({ message: '삭제됨', icon: 'check_circle' })
    } catch (err) {
      Notify.create({ type: 'negative', message: err instanceof Error ? err.message : '삭제 실패' })
    }
  }

  function handleMediaMoveUp() {
    const s = selectedMediaItem.value
    if (!s || !canMoveMediaUp.value) return
    const arr = getMediaArray(s.category)
    const idx = arr.findIndex((x) => x.id === s.item.id)
    moveAsset(s.category, idx, 'up')
  }

  function handleMediaMoveDown() {
    const s = selectedMediaItem.value
    if (!s || !canMoveMediaDown.value) return
    const arr = getMediaArray(s.category)
    const idx = arr.findIndex((x) => x.id === s.item.id)
    moveAsset(s.category, idx, 'down')
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
    uploadFileWithProgress,
    addAsset,
    uploadProgressFiles,
    showUploadProgress,
    addFileToMedia,
    removeAsset,
    moveAsset,
    selectedMediaItem,
    selectMediaItem,
    getMediaArray,
    canMoveMediaUp,
    canMoveMediaDown,
    handleMediaDelete,
    handleMediaMoveUp,
    handleMediaMoveDown,
  }
}
