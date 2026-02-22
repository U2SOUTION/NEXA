import { OLLAMA_URL } from '../../config/aiConfig.js'

function getBaseUrl(url) {
  const base = (url || OLLAMA_URL).replace(/\/+$/, '')
  return base
}

export async function listModels(url) {
  const base = getBaseUrl(url)
  const res = await fetch(`${base}/api/tags`)
  if (!res.ok) {
    throw new Error(`Ollama 모델 목록 조회 실패: ${res.status}`)
  }
  return res.json()
}

export async function chat(messages, model, url) {
  const base = getBaseUrl(url)
  const body = { model: model || undefined, messages, stream: false }
  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Ollama 채팅 실패: ${res.status}`)
  }
  return res.json()
}

export async function checkConnection(testUrl) {
  const base = getBaseUrl(testUrl || OLLAMA_URL)
  const res = await fetch(`${base}/api/tags`)
  if (!res.ok) {
    throw new Error(`연결 실패: ${res.status}`)
  }
  return { ok: true }
}
