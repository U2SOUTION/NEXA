/**
 * useNexiaMemos - AI 도메인 사용자 메모 (ai_user_memos 테이블)
 * 채팅 "메모로 추가" → DB 저장
 */
import { ref } from 'vue'
import { getApiBaseUrl } from '@system/utils/apiBaseUrl'

const memos = ref<Array<{
  id: number
  content: string
  source: string
  channelId?: string | null
  chatId?: string | null
  sortOrder?: number
  createdAt: number | null
  updatedAt?: number | null
}>>([])

async function loadMemos() {
  try {
    const base = getApiBaseUrl()
    const res = await fetch(`${base}/ai-user-memos`)
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || '목록 조회 실패')
    const items = data?.items ?? []
    memos.value = Array.isArray(items) ? items : []
  } catch (err) {
    console.error('[useNexiaMemos] loadMemos 실패:', err)
    memos.value = []
  }
}

async function addMemo(
  content: string,
  source = 'chat',
  channelId?: string | null,
  chatId?: string | null,
) {
  if (!content || typeof content !== 'string') return null
  const trimmed = content.trim()
  if (!trimmed) return null
  try {
    const base = getApiBaseUrl()
    const res = await fetch(`${base}/ai-user-memos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: trimmed,
        source,
        channel_id: channelId ?? null,
        chat_id: chatId ?? null,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || '추가 실패')
    const item = {
      id: data.id,
      content: data.content ?? trimmed,
      source: data.source ?? source,
      channelId: data.channelId ?? channelId,
      chatId: data.chatId ?? chatId,
      sortOrder: data.sortOrder ?? 0,
      createdAt: data.createdAt ?? Date.now(),
      updatedAt: data.updatedAt ?? null,
    }
    memos.value = [item, ...memos.value]
    return item
  } catch (err) {
    console.error('[useNexiaMemos] addMemo 실패:', err)
    throw err
  }
}

async function removeMemo(id: number) {
  try {
    const base = getApiBaseUrl()
    const res = await fetch(`${base}/ai-user-memos/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || '삭제 실패')
    memos.value = memos.value.filter((m) => m.id !== id)
  } catch (err) {
    console.error('[useNexiaMemos] removeMemo 실패:', err)
    throw err
  }
}

async function moveMemoUp(id: number) {
  try {
    const base = getApiBaseUrl()
    const res = await fetch(`${base}/ai-user-memos/${id}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction: 'up' }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || '이동 실패')
    await loadMemos()
  } catch (err) {
    console.error('[useNexiaMemos] moveMemoUp 실패:', err)
    throw err
  }
}

async function moveMemoDown(id: number) {
  try {
    const base = getApiBaseUrl()
    const res = await fetch(`${base}/ai-user-memos/${id}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction: 'down' }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || '이동 실패')
    await loadMemos()
  } catch (err) {
    console.error('[useNexiaMemos] moveMemoDown 실패:', err)
    throw err
  }
}

function getMemoPreview(content: string, maxLen = 60) {
  if (!content || typeof content !== 'string') return ''
  const text = content.replace(/\s+/g, ' ').trim()
  return text.length <= maxLen ? text : text.slice(0, maxLen) + '...'
}

export function useNexiaMemos() {
  return {
    memos,
    loadMemos,
    addMemo,
    removeMemo,
    moveMemoUp,
    moveMemoDown,
    getMemoPreview,
  }
}
