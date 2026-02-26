import { getApiBaseUrl } from '@system/utils/apiBaseUrl'

export type ChatMessage = { role: string; content: string; [key: string]: unknown }

export const aiApi = {
  async listModels(): Promise<unknown> {
    const res = await fetch(`${getApiBaseUrl()}/ai/models`)
    if (!res.ok) throw new Error('모델 목록 조회 실패')
    return res.json()
  },

  async getModelShow(modelName: string): Promise<unknown> {
    const res = await fetch(`${getApiBaseUrl()}/ai/model-show`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelName }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: string; message?: string }
      throw new Error(err.error || err.message || '모델 정보 조회 실패')
    }
    return res.json()
  },

  async chat(
    messages: ChatMessage[],
    model: string,
    systemInstruction?: string | null,
  ): Promise<unknown> {
    const res = await fetch(`${getApiBaseUrl()}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, model, systemInstruction: systemInstruction || undefined }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { message?: string; error?: string }
      throw new Error(err.message || err.error || '채팅 요청 실패')
    }
    return res.json()
  },

  async chatStream(
    messages: ChatMessage[],
    model: string,
    systemInstruction?: string | null,
    onChunk?: (contentDelta: string) => void,
  ): Promise<string> {
    const res = await fetch(`${getApiBaseUrl()}/ai/chat-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, model, systemInstruction: systemInstruction || undefined }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { message?: string; error?: string }
      throw new Error(err.message || err.error || '스트리밍 요청 실패')
    }
    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''
    let buffer = ''
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const obj = JSON.parse(line) as { message?: { content?: string } }
            const delta = obj?.message?.content ?? ''
            if (delta) {
              fullContent += delta
              onChunk?.(delta)
            }
          } catch {
            /* skip invalid JSON lines */
          }
        }
      }
      if (buffer.trim()) {
        try {
          const obj = JSON.parse(buffer) as { message?: { content?: string } }
          const delta = obj?.message?.content ?? ''
          if (delta) {
            fullContent += delta
            onChunk?.(delta)
          }
        } catch {
          /* ignore */
        }
      }
    } finally {
      reader.releaseLock()
    }
    return fullContent
  },

  async checkConnection(url?: string | null): Promise<unknown> {
    const res = await fetch(`${getApiBaseUrl()}/ai/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url || undefined }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { message?: string; error?: string }
      throw new Error(err.message || err.error || '연결 확인 실패')
    }
    return res.json()
  },

  async generateTitle(
    dialogueExcerpt: string,
    model?: string | null,
  ): Promise<unknown> {
    const res = await fetch(`${getApiBaseUrl()}/ai/generate-title`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dialogueExcerpt, model: model || undefined }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: string; message?: string }
      throw new Error(err.error || err.message || '제목 생성 실패')
    }
    return res.json()
  },
}
