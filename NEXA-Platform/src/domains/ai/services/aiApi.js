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
}
