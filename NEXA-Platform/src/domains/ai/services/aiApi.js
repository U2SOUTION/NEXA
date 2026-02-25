import { getApiBaseUrl } from '@system/utils/apiBaseUrl.js'

export const aiApi = {
  async listModels() {
    const res = await fetch(`${getApiBaseUrl()}/ai/models`)
    if (!res.ok) throw new Error('모델 목록 조회 실패')
    return res.json()
  },

  async getModelShow(modelName) {
    const res = await fetch(`${getApiBaseUrl()}/ai/model-show`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelName }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || err.message || '모델 정보 조회 실패')
    }
    return res.json()
  },

  async chat(messages, model, systemInstruction) {
    const res = await fetch(`${getApiBaseUrl()}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, model, systemInstruction: systemInstruction || undefined }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || err.error || '채팅 요청 실패')
    }
    return res.json()
  },

  /**
   * 스트리밍 채팅 - NDJSON 스트림을 읽으며 onChunk(contentDelta) 호출
   * @param {Function} onChunk - (contentDelta: string) => void
   * @returns {Promise<string>} 최종 전체 content
   */
  async chatStream(messages, model, systemInstruction, onChunk) {
    const res = await fetch(`${getApiBaseUrl()}/ai/chat-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, model, systemInstruction: systemInstruction || undefined }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || err.error || '스트리밍 요청 실패')
    }
    const reader = res.body.getReader()
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
            const obj = JSON.parse(line)
            const delta = obj?.message?.content ?? ''
            if (delta) {
              fullContent += delta
              onChunk?.(delta)
            }
          } catch {
            // skip invalid JSON lines
          }
        }
      }
      if (buffer.trim()) {
        try {
          const obj = JSON.parse(buffer)
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

  async checkConnection(url) {
    const res = await fetch(`${getApiBaseUrl()}/ai/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url || undefined }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || err.error || '연결 확인 실패')
    }
    return res.json()
  },

  async generateTitle(dialogueExcerpt, model) {
    const res = await fetch(`${getApiBaseUrl()}/ai/generate-title`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dialogueExcerpt, model: model || undefined }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || err.message || '제목 생성 실패')
    }
    return res.json()
  },
}
