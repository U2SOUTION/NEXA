import { Readable } from 'stream'
import express from 'express'
import { listModels, showModel, chat, chatStream, checkConnection, generateTitle } from './ai.service.js'

const router = express.Router()

/** SDK textStream(async iterable)을 Ollama 호환 NDJSON 라인 스트림으로 변환 */
function ndjsonStreamFromTextStream(textStream) {
  async function* lines() {
    for await (const part of textStream) {
      yield JSON.stringify({ message: { content: part } }) + '\n'
    }
  }
  return Readable.from(lines(), { objectMode: false })
}

router.get('/ai/models', async (req, res) => {
  try {
    const data = await listModels()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/ai/model-show', async (req, res) => {
  try {
    const { model } = req.body
    if (!model || typeof model !== 'string') {
      return res.status(400).json({ error: 'model 이름이 필요합니다.' })
    }
    const data = await showModel(model)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/ai/chat', async (req, res) => {
  try {
    const { messages, model, systemInstruction } = req.body
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages 배열이 필요합니다.' })
    }
    const data = await chat(messages, model, undefined, systemInstruction)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/ai/chat-stream', async (req, res) => {
  try {
    const { messages, model, systemInstruction } = req.body
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages 배열이 필요합니다.' })
    }
    const textStream = await chatStream(messages, model, undefined, systemInstruction)
    res.setHeader('Content-Type', 'application/x-ndjson')
    ndjsonStreamFromTextStream(textStream).pipe(res)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/ai/check', async (req, res) => {
  try {
    const { url } = req.body
    await checkConnection(url)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/ai/generate-title', async (req, res) => {
  try {
    const { dialogueExcerpt, model, url } = req.body
    const excerpt = (dialogueExcerpt ?? '').trim()
    if (!excerpt) {
      return res.status(400).json({ error: 'dialogueExcerpt가 필요합니다.' })
    }
    const data = await generateTitle(excerpt, model || undefined, url)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
