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

export async function showModel(modelName, url) {
  const base = getBaseUrl(url)
  const res = await fetch(`${base}/api/show`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: modelName }),
  })
  if (!res.ok) {
    throw new Error(`Ollama 모델 정보 조회 실패: ${res.status}`)
  }
  return res.json()
}

export async function chat(messages, model, url, systemInstruction) {
  const base = getBaseUrl(url)
  const finalMessages = [...(systemInstruction?.trim() ? [{ role: 'system', content: systemInstruction.trim() }] : []), ...messages]
  const body = { model: model || undefined, messages: finalMessages, stream: false }
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

/** 스트리밍 채팅 - Ollama NDJSON 스트림 반환 (pipe용) */
export async function chatStream(messages, model, url, systemInstruction) {
  const base = getBaseUrl(url)
  const finalMessages = [...(systemInstruction?.trim() ? [{ role: 'system', content: systemInstruction.trim() }] : []), ...messages]
  const body = { model: model || undefined, messages: finalMessages, stream: true }
  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Ollama 스트리밍 실패: ${res.status}`)
  }
  return res
}

export async function checkConnection(testUrl) {
  const base = getBaseUrl(testUrl || OLLAMA_URL)
  const res = await fetch(`${base}/api/tags`)
  if (!res.ok) {
    throw new Error(`연결 실패: ${res.status}`)
  }
  return { ok: true }
}

const TITLE_SYSTEM_INSTRUCTION = `당신은 전문가 수준의 문서 요약가입니다.
다음 대화의 핵심 주제를 파악하여 짧고 직관적인 제목을 생성하세요.

제약사항 (Constraints):
- 특수문자 제외, 15자 이내, 한글 권장
- "안녕하세요" 같은 인사치는 무시하고 '목적'에 집중할 것
- 따옴표·설명 없이 제목만 한 줄로 출력하세요`

function postProcessTitle(raw) {
  if (!raw || typeof raw !== 'string') return ''
  let s = raw.trim()
  s = s.replace(/[^\p{L}\p{N}\s]/gu, '')
  s = s.trim()
  return s.slice(0, 15)
}

export async function generateTitle(dialogueExcerpt, model, url) {
  const excerpt = (dialogueExcerpt || '').trim()
  if (!excerpt) return { title: '' }
  const messages = [{ role: 'user', content: excerpt }]
  const res = await chat(messages, model, url, TITLE_SYSTEM_INSTRUCTION)
  const content = res?.message?.content ?? ''
  const title = postProcessTitle(content)
  return { title }
}
