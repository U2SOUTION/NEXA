import { generateText, streamText } from 'ai'
import { createOllama } from 'ollama-ai-provider-v2'
import { OLLAMA_URL } from '@/config/aiConfig.js'

function getBaseUrl(url) {
  const base = (url || OLLAMA_URL).replace(/\/+$/, '')
  return base
}

/** Ollama provider 인스턴스 (baseURL에 /api 포함) */
function getOllama(url) {
  const base = getBaseUrl(url)
  const baseURL = base + (base.endsWith('/api') ? '' : '/api')
  return createOllama({ baseURL })
}

/** API용 메시지를 SDK 메시지 형식으로 변환 (이미지 포함 user 메시지 처리) */
function toSdkMessages(messages, systemInstruction) {
  const system = systemInstruction?.trim()
    ? [{ role: 'system', content: systemInstruction.trim() }]
    : []
  const list = messages.map((m) => {
    if (m.role === 'system') return m
    if (m.role === 'user') {
      const hasImages = Array.isArray(m.images) && m.images.length > 0
      if (!hasImages) return { role: 'user', content: m.content || '' }
      const parts = []
      if (m.content) parts.push({ type: 'text', text: m.content })
      for (const img of m.images) {
        const dataUrl = typeof img === 'string' && img.startsWith('data:') ? img : `data:image/png;base64,${img}`
        parts.push({ type: 'image', image: dataUrl })
      }
      return { role: 'user', content: parts }
    }
    return { role: m.role, content: m.content || '' }
  })
  return [...system, ...list]
}

export async function listModels(url?: string) {
  const base = getBaseUrl(url)
  const res = await fetch(`${base}/api/tags`)
  if (!res.ok) {
    throw new Error(`Ollama 모델 목록 조회 실패: ${res.status}`)
  }
  return res.json()
}

export async function showModel(modelName: string, url?: string) {
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

/** 비스트리밍 채팅 — Vercel AI SDK generateText */
export async function chat(messages, model, url, systemInstruction) {
  const ollama = getOllama(url)
  const sdkMessages = toSdkMessages(messages, systemInstruction)
  const { text } = await generateText({
    model: ollama(model || undefined),
    messages: sdkMessages,
  })
  return { message: { role: 'assistant', content: text || '' } }
}

/** 스트리밍 채팅 — Vercel AI SDK streamText. textStream(async iterable) 반환. 라우트에서 NDJSON으로 변환해 pipe. */
export async function chatStream(messages, model, url, systemInstruction) {
  const ollama = getOllama(url)
  const sdkMessages = toSdkMessages(messages, systemInstruction)
  const result = streamText({
    model: ollama(model || undefined),
    messages: sdkMessages,
  })
  return result.textStream
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
  const ollama = getOllama(url)
  const { text } = await generateText({
    model: ollama(model || undefined),
    system: TITLE_SYSTEM_INSTRUCTION,
    prompt: excerpt,
  })
  const title = postProcessTitle(text || '')
  return { title }
}
