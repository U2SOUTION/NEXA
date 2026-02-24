import { ref } from 'vue'

const STORAGE_KEY = 'nexa-ai-memos'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function saveToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (e) {
    console.error('[useAiMemos] 저장 실패:', e)
  }
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

const memos = ref([])

function addMemo(content, source = 'chat') {
  if (!content || typeof content !== 'string') return null
  const trimmed = content.trim()
  if (!trimmed) return null
  const item = {
    id: genId(),
    content: trimmed,
    source,
    createdAt: Date.now(),
  }
  memos.value = [item, ...memos.value]
  saveToStorage(memos.value)
  return item
}

function removeMemo(id) {
  memos.value = memos.value.filter((m) => m.id !== id)
  saveToStorage(memos.value)
}

function moveMemoUp(id) {
  const idx = memos.value.findIndex((m) => m.id === id)
  if (idx <= 0) return
  const arr = [...memos.value]
  ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
  memos.value = arr
  saveToStorage(memos.value)
}

function moveMemoDown(id) {
  const idx = memos.value.findIndex((m) => m.id === id)
  if (idx < 0 || idx >= memos.value.length - 1) return
  const arr = [...memos.value]
  ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
  memos.value = arr
  saveToStorage(memos.value)
}

function getMemoPreview(content, maxLen = 60) {
  if (!content || typeof content !== 'string') return ''
  const text = content.replace(/\s+/g, ' ').trim()
  return text.length <= maxLen ? text : text.slice(0, maxLen) + '...'
}

export function useAiMemos() {
  if (memos.value.length === 0) {
    const loaded = loadFromStorage()
    if (loaded.length > 0) memos.value = loaded
  }
  return {
    memos,
    addMemo,
    removeMemo,
    moveMemoUp,
    moveMemoDown,
    getMemoPreview,
  }
}
